import { verifyToken } from "@clerk/backend";
import { getSql } from "./_db.js";

function getToken(req) {
  const auth = typeof req.headers.get === "function"
    ? req.headers.get("authorization")
    : req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.split("Bearer ")[1];
}

function respond(res, status, message) {
  if (typeof res.json === "function") {
    res.status(status).json({ error: message });
  } else {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: message }));
  }
  return null;
}

async function getOrgShortId(clerkOrgId) {
  try {
    const sql = getSql();
    const rows = await sql`SELECT short_id FROM organizations WHERE clerk_id = ${clerkOrgId}`;
    return rows[0]?.short_id || null;
  } catch {
    return null;
  }
}

async function getUserInfo(userId, orgId) {
  try {
    const sql = getSql();
    const rows = await sql`SELECT rol, nume FROM agenti WHERE user_id = ${userId} AND org_id = ${orgId}`;
    const row = rows[0];
    return { role: row?.rol || "admin", name: row?.nume || null };
  } catch {
    return { role: "admin", name: null };
  }
}

export async function requireAuth(req, res) {
  const token = getToken(req);
  if (!token) {
    return respond(res, 401, "Neautorizat");
  }
  try {
    const data = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const userId = data?.sub;
    const orgId = data?.org_id || data?.orgId;
    if (!orgId) {
      return respond(res, 403, "Nu faci parte dintr-o organizație. Creează mai întâi o agenție.");
    }
    if (!userId) {
      return respond(res, 401, "Token invalid");
    }
    const [orgShortId, userInfo] = await Promise.all([
      getOrgShortId(orgId),
      getUserInfo(userId, orgId),
    ]);
    return { userId, orgId, orgShortId, role: userInfo.role, userName: userInfo.name };
  } catch (err) {
    console.error("Clerk verifyToken:", err.message);
    return respond(res, 401, "Token invalid");
  }
}
