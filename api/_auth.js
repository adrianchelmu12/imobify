import { verifyToken } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";

function getToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.split("Bearer ")[1];
}

let _orgSql = null;
function getOrgSql() {
  if (!_orgSql) {
    _orgSql = neon(process.env.DATABASE_URL);
  }
  return _orgSql;
}

async function getOrgShortId(clerkOrgId) {
  try {
    const sql = getOrgSql();
    const rows = await sql`SELECT short_id FROM organizations WHERE clerk_id = ${clerkOrgId}`;
    return rows[0]?.short_id || null;
  } catch {
    return null;
  }
}

async function getUserInfo(userId, orgId) {
  try {
    const sql = getOrgSql();
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
    res.status(401).json({ error: "Neautorizat" });
    return null;
  }
  try {
    const data = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    const userId = data?.sub;
    const orgId = data?.org_id || data?.orgId;
    if (!orgId) {
      res.status(403).json({ error: "Nu faci parte dintr-o organizație. Creează mai întâi o agenție." });
      return null;
    }
    if (!userId) {
      res.status(401).json({ error: "Token invalid" });
      return null;
    }
    const [orgShortId, userInfo] = await Promise.all([
      getOrgShortId(orgId),
      getUserInfo(userId, orgId),
    ]);
    return { userId, orgId, orgShortId, role: userInfo.role, userName: userInfo.name };
  } catch (err) {
    console.error("Clerk verifyToken:", err.message);
    res.status(401).json({ error: "Token invalid" });
    return null;
  }
}
