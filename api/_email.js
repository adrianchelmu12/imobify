import { Resend } from "resend";
import { getDb } from "./_db.js";
import { organizations } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

let _resend = null;

function getResend() {
  if (!_resend && process.env.RESEND_API_KEY) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

async function getOrgEmail(orgId) {
  try {
    const rows = await getDb()
      .select({ email: organizations.email, companyName: organizations.companyName, name: organizations.name })
      .from(organizations)
      .where(eq(organizations.clerkId, orgId));
    const org = rows[0] || null;
    console.log("Org email lookup:", org?.email || "NOT SET");
    return org;
  } catch (e) {
    console.error("getOrgEmail error:", e.message);
    return null;
  }
}

function send(resend, opts) {
  return resend.emails.send(opts).then((r) => {
    console.log("Email sent:", r.data?.id || "OK");
    return r;
  }).catch((e) => {
    console.error("Resend error:", e.message, JSON.stringify(e));
  });
}

export async function notifyClientNou(client, orgId, addedBy) {
  const resend = getResend();
  if (!resend) { console.log("Resend not configured"); return; }

  const org = await getOrgEmail(orgId);
  const to = org?.email;
  if (!to) return;

  await send(resend, {
    from: "Imobify <notificari@imobify.ro>",
    to,
    subject: `Client nou: ${client.nume}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#6366f1">👤 Client nou adăugat</h2>
        <p><strong>Nume:</strong> ${client.nume}</p>
        <p><strong>Telefon:</strong> ${client.telefon || "—"}</p>
        <p><strong>Email:</strong> ${client.email || "—"}</p>
        <p><strong>Buget:</strong> ${client.buget || "—"}</p>
        <p><strong>Interes:</strong> ${client.interes || "—"}</p>
        <p><strong>Zonă:</strong> ${client.zona || "—"}</p>
        <p><strong>Sursă:</strong> ${client.sursa || "—"}</p>
        <p style="color:#6b7280;font-size:12px;margin-top:20px">Adăugat de ${addedBy || "—"} · ${org?.companyName || org?.name || "Imobify"}</p>
      </div>
    `,
  });
}

export async function notifyProgramareNoua(programare, orgId, addedBy) {
  const resend = getResend();
  if (!resend) { console.log("Resend not configured"); return; }

  const org = await getOrgEmail(orgId);
  const to = org?.email;
  if (!to) { console.log("No org email set, skipping"); return; }

  await send(resend, {
    from: "Imobify <notificari@imobify.ro>",
    to,
    subject: `Programare nouă: ${programare.titlu}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#6366f1">📅 Programare nouă</h2>
        <p><strong>Titlu:</strong> ${programare.titlu}</p>
        <p><strong>Client:</strong> ${programare.client} · ${programare.telefon || "—"}</p>
        <p><strong>Data:</strong> ${programare.data || "—"} · ora ${programare.ora || "—"}</p>
        <p><strong>Tip:</strong> ${programare.tip || "—"}</p>
        <p><strong>Status:</strong> ${programare.status || "—"}</p>
        <p><strong>Locație:</strong> ${programare.locatie || "—"}</p>
        ${programare.observatii !== "—" ? `<p><strong>Observații:</strong> ${programare.observatii}</p>` : ""}
        <p style="color:#6b7280;font-size:12px;margin-top:20px">Adăugat de ${addedBy || "—"} · ${org?.companyName || org?.name || "Imobify"}</p>
      </div>
    `,
  });
}

export async function notifyProgramareActualizata(programare, orgId, updatedBy) {
  const resend = getResend();
  if (!resend) { console.log("Resend not configured"); return; }

  const org = await getOrgEmail(orgId);
  const to = org?.email;
  if (!to) { console.log("No org email set, skipping"); return; }

  await send(resend, {
    from: "Imobify <notificari@imobify.ro>",
    to,
    subject: `Programare actualizată: ${programare.titlu}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#f59e0b">🔄 Programare actualizată</h2>
        <p><strong>Titlu:</strong> ${programare.titlu}</p>
        <p><strong>Client:</strong> ${programare.client} · ${programare.telefon || "—"}</p>
        <p><strong>Data:</strong> ${programare.data || "—"} · ora ${programare.ora || "—"}</p>
        <p><strong>Status nou:</strong> ${programare.status || "—"}</p>
        <p><strong>Tip:</strong> ${programare.tip || "—"}</p>
        <p><strong>Locație:</strong> ${programare.locatie || "—"}</p>
        <p style="color:#6b7280;font-size:12px;margin-top:20px">Modificat de ${updatedBy || "—"} · ${org?.companyName || org?.name || "Imobify"}</p>
      </div>
    `,
  });
}
