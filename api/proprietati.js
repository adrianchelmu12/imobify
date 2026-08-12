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
  const c = row.caracteristici && typeof row.caracteristici === "object" ? row.caracteristici : {};
  const a = row.adresa && typeof row.adresa === "object" ? row.adresa : {};
  const tranzactie = row.tranzactie
    || (row.tipTranzactie === "inchiriere" ? "Închiriere" : "Vânzare");
  const oras = a.oras || a.localitate || row.oras || "";
  const cartier = a.cartier || "";
  return {
    ...row,
    imagini: row.fotografii || row.imagini || [],
    tranzactie,
    camere: c.nr_camere ?? row.camere ?? null,
    bai: c.nr_bai ?? row.bai ?? null,
    suprafata: c.suprafata_utila ?? c.suprafata ?? row.suprafata ?? null,
    suprafata_totala: c.suprafata_totala ?? row.suprafata_totala ?? null,
    suprafata_teren: c.suprafata_teren ?? row.suprafata_teren ?? null,
    etaj: c.etaj ?? row.etaj ?? null,
    an: c.an_constructie ?? c.an ?? row.an ?? null,
    tip_imobil: c.tip_imobil ?? row.tip_imobil ?? null,
    tip_teren: c.tip_teren ?? row.tip_teren ?? null,
    tip_casa: c.tip_casa ?? row.tip_casa ?? null,
    risc_seismic: c.risc_seismic ?? row.risc_seismic ?? null,
    acoperis: c.acoperis ?? row.acoperis ?? null,
    compartimentare: c.compartimentare ?? row.compartimentare ?? null,
    etaje_bloc: c.nr_etaje_total ?? row.etaje_bloc ?? null,
    judet: a.judet ?? row.judet ?? "",
    oras,
    zona: cartier || row.zona || "",
    strada: a.strada ?? row.strada ?? "",
    numar: a.numar ?? row.numar ?? "",
    cod_postal: a.cod_postal ?? row.cod_postal ?? "",
    locatie: [cartier, oras].filter(Boolean).join(", ") || row.locatie || "",
  };
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
      if (body.tranzactie) data.tipTranzactie = body.tranzactie === "Închiriere" ? "inchiriere" : "vanzare";

      const values = { ...data, userId, orgId, orgShortId, createdByName: userName };
      if (body.adresa && typeof body.adresa === "object") values.adresa = body.adresa;
      if (body.caracteristici && typeof body.caracteristici === "object") values.caracteristici = body.caracteristici;

      const [row] = await getDb().insert(proprietati).values(values).returning();
      return res.status(201).json(normalize(row));
    }

    if (req.method === "PUT") {
      const body = await parseBody(req);
      const rowId = body.id;
      if (!rowId) return res.status(400).json({ error: "ID lipsă" });

      const data = pickAllowed(body);
      if (body.imagini) data.fotografii = body.imagini;
      if (body.imagine) data.imagine = body.imagine;
      if (body.tranzactie) data.tipTranzactie = body.tranzactie === "Închiriere" ? "inchiriere" : "vanzare";
      if (body.adresa && typeof body.adresa === "object") data.adresa = body.adresa;
      if (body.caracteristici && typeof body.caracteristici === "object") data.caracteristici = body.caracteristici;

      const [row] = await getDb()
        .update(proprietati)
        .set({ ...data, updatedByName: userName })
        .where(and(eq(proprietati.orgId, orgId), eq(proprietati.id, parseInt(rowId))))
        .returning();
      return res.json(normalize(row));
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
