import { and, eq, desc } from "drizzle-orm";
import { getDb, setOrgContext } from "./_db.js";
import { notificari } from "../src/db/schema.js";
import { requireAuth } from "./_auth.js";
import { parseBody, getSearchParam, sendError } from "./_utils.js";

export default async function handler(req, res) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const { userId, orgId, orgShortId, userName } = auth;
  await setOrgContext(orgId, userId);
  const id = getSearchParam(req, "id");

  try {
    if (req.method === "GET") {
      if (id) {
        const rows = await getDb()
          .select()
          .from(notificari)
          .where(and(eq(notificari.orgId, orgId), eq(notificari.id, parseInt(id))));
        return res.json(rows[0] || null);
      }
      const rows = await getDb()
        .select()
        .from(notificari)
        .where(eq(notificari.orgId, orgId))
        .orderBy(desc(notificari.createdAt));
      return res.json(rows);
    }

    if (req.method === "POST") {
      const body = await parseBody(req);
      const [row] = await getDb()
        .insert(notificari)
        .values({ ...body, userId, orgId, orgShortId, createdByName: userName })
        .returning();
      return res.status(201).json(row);
    }

    if (req.method === "PUT") {
      const body = await parseBody(req);
      const { id: rowId, ...data } = body;
      if (!rowId) return res.status(400).json({ error: "ID lipsă" });
      const [row] = await getDb()
        .update(notificari)
        .set(data)
        .where(and(eq(notificari.orgId, orgId), eq(notificari.id, parseInt(rowId))))
        .returning();
      return res.json(row);
    }

    if (req.method === "DELETE") {
      let deleteId = id;
      if (!deleteId) {
        const body = await parseBody(req);
        deleteId = body?.id;
      }
      if (!deleteId) return res.status(400).json({ error: "ID lipsă" });
      await getDb()
        .delete(notificari)
        .where(and(eq(notificari.orgId, orgId), eq(notificari.id, parseInt(deleteId))));
      return res.json({ success: true });
    }

    res.status(405).json({ error: "Metodă nepermisă" });
  } catch (err) {
    sendError(res, err);
  }
}
