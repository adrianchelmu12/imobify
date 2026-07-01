import { and, eq } from "drizzle-orm";
import { getDb, setOrgContext } from "./_db.js";
import { agenti } from "../src/db/schema.js";
import { requireAuth } from "./_auth.js";
import { createClerkClient } from "@clerk/backend";
import { parseBody, getSearchParam, sendError } from "./_utils.js";

let _clerk = null;
function getClerk() {
  if (!_clerk) {
    _clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  }
  return _clerk;
}

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
          .from(agenti)
          .where(and(eq(agenti.orgId, orgId), eq(agenti.id, parseInt(id))));
        return res.json(rows[0] || null);
      }
      const rows = await getDb()
        .select()
        .from(agenti)
        .where(eq(agenti.orgId, orgId));
      return res.json(rows);
    }

    if (req.method === "POST") {
      const body = await parseBody(req);
      const result = await getDb()
        .insert(agenti)
        .values({ ...body, userId, orgId, orgShortId, createdByName: userName })
        .returning();
      const row = result?.[0] || result;

      if (body.email) {
        try {
          console.log("Sending invite to:", body.email, "org:", orgId, "by:", userId);
          const clerk = getClerk();
          const inv = await clerk.organizations.createOrganizationInvitation({
            organizationId: orgId,
            inviterUserId: userId,
            emailAddress: body.email,
            role: "org:admin",
          });
          console.log("Invite sent:", inv.id);
        } catch (e) {
          console.error("Invite error:", e?.message, e?.stack);
        }
      }

      return res.status(201).json(row);
    }

    if (req.method === "PUT") {
      const body = await parseBody(req);
      const { id: rowId, ...data } = body;
      if (!rowId) return res.status(400).json({ error: "ID lipsă" });
      const [row] = await getDb()
        .update(agenti)
        .set({ ...data, updatedByName: userName })
        .where(and(eq(agenti.orgId, orgId), eq(agenti.id, parseInt(rowId))))
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
        .delete(agenti)
        .where(and(eq(agenti.orgId, orgId), eq(agenti.id, parseInt(deleteId))));
      return res.json({ success: true });
    }

    res.status(405).json({ error: "Metodă nepermisă" });
  } catch (err) {
    sendError(res, err);
  }
}
