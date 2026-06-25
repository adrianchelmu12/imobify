import { and, eq } from "drizzle-orm";
import { getDb, setOrgContext } from "./_db.js";
import { programari } from "../src/db/schema.js";
import { requireAuth } from "./_auth.js";

async function parseBody(req) {
  if (req.body) return req.body;
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const { userId, orgId, orgShortId, userName } = auth;
  await setOrgContext(orgId, userId);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const id = url.searchParams.get("id");

  try {
    if (req.method === "GET") {
      if (id) {
        const rows = await getDb().select().from(programari).where(and(eq(programari.orgId, orgId), eq(programari.id, parseInt(id))));
        return res.json(rows[0] || null);
      }
      const rows = await getDb().select().from(programari).where(eq(programari.orgId, orgId));
      return res.json(rows);
    }

    if (req.method === "POST") {
      const body = await parseBody(req);
      const [row] = await getDb().insert(programari).values({ ...body, userId, orgId, orgShortId, createdByName: userName }).returning();
      return res.status(201).json(row);
    }

    if (req.method === "PUT") {
      const body = await parseBody(req);
      const { id: rowId, ...data } = body;
      if (!rowId) return res.status(400).json({ error: "ID lipsă" });
      const [row] = await getDb().update(programari).set({ ...data, updatedByName: userName }).where(and(eq(programari.orgId, orgId), eq(programari.id, parseInt(rowId)))).returning();
      return res.json(row);
    }

    if (req.method === "DELETE") {
      let deleteId = id;
      if (!deleteId) {
        const body = await parseBody(req);
        deleteId = body?.id;
      }
      if (!deleteId) return res.status(400).json({ error: "ID lipsă" });
      await getDb().delete(programari).where(and(eq(programari.orgId, orgId), eq(programari.id, parseInt(deleteId))));
      return res.json({ success: true });
    }

    res.status(405).json({ error: "Metodă nepermisă" });
  } catch (err) {
    console.error("API error:", err.message);
    res.status(500).json({ error: err.message, detail: err.message });
  }
}
