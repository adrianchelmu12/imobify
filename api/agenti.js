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
  const { userId, orgId, orgShortId, userName, role } = auth;
  await setOrgContext(orgId, userId);
  const id = getSearchParam(req, "id");

  const isAdmin = role === "admin";
  const isManager = isAdmin || role === "manager";

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
      if (!isManager) {
        return res.status(403).json({ error: "Doar adminul sau managerul poate invita membri." });
      }
      const body = await parseBody(req);
      const { nume, email, rol, telefon, poza, zone } = body;
      if (!email || !String(email).includes("@")) {
        return res.status(400).json({ error: "Adaugă un email valid pentru invitație." });
      }

      let finalRol = rol === "admin" || rol === "manager" || rol === "agent" ? rol : "agent";
      if (!isAdmin && finalRol !== "agent") finalRol = "agent";

      try {
        const clerk = getClerk();
        await clerk.organizations.createOrganizationInvitation({
          organizationId: orgId,
          inviterUserId: userId,
          emailAddress: email,
          role: "org:member",
        });
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.error("Invite error:", e?.message);
        }
      }

      const [row] = await getDb()
        .insert(agenti)
        .values({
          nume: nume || email,
          email,
          telefon: telefon || null,
          poza: poza || null,
          zone: zone || null,
          rol: finalRol,
          userId: null,
          orgId,
          orgShortId,
          createdByName: userName,
        })
        .returning();

      return res.status(201).json(row);
    }

    if (req.method === "PUT") {
      if (!isManager) {
        return res.status(403).json({ error: "Nu ai permisiunea să modifici membri." });
      }
      const body = await parseBody(req);
      const { id: rowId, ...data } = body;
      if (!rowId) return res.status(400).json({ error: "ID lipsă" });

      if (data.rol !== undefined && String(data.rol) !== "agent" && !isAdmin) {
        return res.status(403).json({ error: "Doar adminul poate seta rolurile de manager sau administrator." });
      }

      const [existing] = await getDb()
        .select()
        .from(agenti)
        .where(and(eq(agenti.orgId, orgId), eq(agenti.id, parseInt(rowId))));

      if (!existing) return res.status(404).json({ error: "Membrul nu există." });
      if (existing.userId === userId && data.rol !== undefined && data.rol !== existing.rol) {
        return res.status(403).json({ error: "Nu îți poți modifica propriul rol." });
      }
      if (existing.rol === "admin" && !isAdmin) {
        return res.status(403).json({ error: "Doar un admin poate modifica un alt administrator." });
      }

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

      if (!isAdmin) {
        const [target] = await getDb()
          .select()
          .from(agenti)
          .where(and(eq(agenti.orgId, orgId), eq(agenti.id, parseInt(deleteId))));
        if (!target) return res.status(404).json({ error: "Membrul nu există." });
        if (target.rol !== "agent") {
          return res.status(403).json({ error: "Doar adminul poate șterge manageri sau administratori." });
        }
      }

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
