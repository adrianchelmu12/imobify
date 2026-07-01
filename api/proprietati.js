import { and, eq } from "drizzle-orm";
import { getDb, setOrgContext } from "./_db.js";
import { proprietati } from "../src/db/schema.js";
import { requireAuth } from "./_auth.js";
import { parseBody, getSearchParam, sendError } from "./_utils.js";

const ALLOWED_FIELDS = [
  "titlu", "tip", "tipTranzactie", "pret", "pretNumeric",
  "negociabil", "badgeExclusivitate", "badgeComisionZero",
  "badge_exclusivitate", "badge_comision_zero",
  "descriere", "status", "statusProprietate", "recomandata",
  "disponibilDin", "agentId", "imagine", "fotografii",
  "adresa", "caracteristici", "dotari",
  "createdByName", "updatedByName",
];

const FIELD_ALIASES = {
  badge_exclusivitate: "badgeExclusivitate",
  badge_comision_zero: "badgeComisionZero",
};

function pickAllowed(obj) {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    const targetKey = FIELD_ALIASES[key] || key;
    if (key in obj && obj[key] !== undefined) {
      out[targetKey] = obj[key];
    }
  }
  return out;
}

function normalize(row) {
  if (!row) return row;
  return { ...row, imagini: row.fotografii || row.imagini || [] };
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
          .from(proprietati)
          .where(and(eq(proprietati.orgId, orgId), eq(proprietati.id, parseInt(id))));
        return res.json(normalize(rows[0]));
      }
      const rows = await getDb()
        .select()
        .from(proprietati)
        .where(eq(proprietati.orgId, orgId));
      return res.json(rows.map(normalize));
    }

    if (req.method === "POST") {
      const body = await parseBody(req);
      const data = pickAllowed(body);
      if (body.imagini) data.fotografii = body.imagini;
      if (body.imagine) data.imagine = body.imagine;

      const values = { ...data, userId, orgId, orgShortId, createdByName: userName };
      if (body.adresa && typeof body.adresa === "object") values.adresa = body.adresa;
      if (body.caracteristici && typeof body.caracteristici === "object") values.caracteristici = body.caracteristici;

      const [row] = await getDb().insert(proprietati).values(values).returning();
      return res.status(201).json({ ...row, _x: { recv: !!body.caracteristici, saved: !!row.caracteristici } });
    }

    if (req.method === "PUT") {
      const body = await parseBody(req);
      const rowId = body.id;
      if (!rowId) return res.status(400).json({ error: "ID lipsă" });

      const data = pickAllowed(body);
      if (body.imagini) data.fotografii = body.imagini;
      if (body.imagine) data.imagine = body.imagine;
      if (body.adresa && typeof body.adresa === "object") data.adresa = body.adresa;

      const [row] = await getDb()
        .update(proprietati)
        .set({ ...data, updatedByName: userName })
        .where(and(eq(proprietati.orgId, orgId), eq(proprietati.id, parseInt(rowId))))
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
        .delete(proprietati)
        .where(and(eq(proprietati.orgId, orgId), eq(proprietati.id, parseInt(deleteId))));
      return res.json({ success: true });
    }

    res.status(405).json({ error: "Metodă nepermisă" });
  } catch (err) {
    sendError(res, err);
  }
}
