import { useEffect, useMemo, useState } from "react";
import { programariStore, clientiStore } from "../data/stores";

const STATUS = ["Toate", "Confirmată", "În așteptare", "Importantă", "Finalizată", "Anulată"];
const TIPURI = ["Vizionare", "Întâlnire", "Contract", "Apel", "Altele"];

const statusStyle = {
  Confirmată: { background: "var(--success-light)", color: "var(--success-dark)" },
  "În așteptare": { background: "var(--warning-light)", color: "var(--warning-dark)" },
  Importantă: { background: "var(--danger-light)", color: "var(--danger)" },
  Finalizată: { background: "var(--primary-light)", color: "var(--primary)" },
  Anulată: { background: "var(--bg-secondary)", color: "var(--text-secondary)" },
};

const page = { padding: "22px 24px" };
const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };

function formatData(data) {
  if (!data) return "—";
  return new Date(`${data}T12:00:00`).toLocaleDateString("ro-RO", { weekday: "short", day: "2-digit", month: "short" });
}

function StatCard({ label, value, hint }) {
  return (
    <div style={{ ...card, padding: "20px 22px", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}>
      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{hint}</div>
    </div>
  );
}

function ProgramareForm({ clienti, onAdd }) {
  const m = useIsMobile();
  const [eroare, setEroare] = useState("");
  const [form, setForm] = useState({ data: new Date().toISOString().slice(0, 10), ora: "10:00", titlu: "", client: "", telefon: "", locatie: "", tip: "Vizionare", status: "Confirmată", observatii: "", client_id: "" });

  const update = (key, value) => { setForm((p) => ({ ...p, [key]: value })); if (eroare) setEroare(""); };

  const alegeClient = (clientId) => {
    if (!clientId) return;
    const client = clienti.find((c) => String(c.id) === clientId);
    if (!client) return;
    setForm((p) => ({ ...p, client_id: clientId, client: client.nume, telefon: client.telefon || p.telefon, locatie: client.zona || p.locatie }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.titlu.trim()) { setEroare("Completează titlul."); return; }
    if (!form.client.trim()) { setEroare("Completează numele clientului."); return; }
    if (!form.data || !form.ora) { setEroare("Alege data și ora."); return; }
    onAdd({ ...form, telefon: form.telefon || "—", locatie: form.locatie || "—", observatii: form.observatii || "—", ultimaActualizare: "Acum" });
    setForm({ data: new Date().toISOString().slice(0, 10), ora: "10:00", titlu: "", client: "", telefon: "", locatie: "", tip: "Vizionare", status: "Confirmată", observatii: "", client_id: "" });
  };

  return (
    <form onSubmit={submit} style={{ ...card, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Adaugă programare nouă</div>
      {eroare && <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "#FEE2E2", color: "#B91C1C", fontSize: 12 }}>{eroare}</div>}
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 10 }}>
        <input style={input} type="date" value={form.data} onChange={(e) => update("data", e.target.value)} />
        <input style={input} type="time" value={form.ora} onChange={(e) => update("ora", e.target.value)} />
        <select style={{ ...input, gridColumn: "1 / -1" }} value={form.client_id} onChange={(e) => alegeClient(e.target.value)}>
          <option value="">Selectează client existent...</option>
          {clienti.map((c) => <option key={c.id} value={String(c.id)}>{c.nume} — {c.telefon}</option>)}
        </select>
        <input style={{ ...input, gridColumn: "1 / -1" }} placeholder="Titlu programare *" value={form.titlu} onChange={(e) => update("titlu", e.target.value)} />
        <input style={input} placeholder="Client *" value={form.client} onChange={(e) => { update("client", e.target.value); update("client_id", ""); }} />
        <input style={input} placeholder="Telefon" value={form.telefon} onChange={(e) => update("telefon", e.target.value)} />
        <input style={{ ...input, gridColumn: "1 / -1" }} placeholder="Locație" value={form.locatie} onChange={(e) => update("locatie", e.target.value)} />
        <select style={input} value={form.tip} onChange={(e) => update("tip", e.target.value)}>{TIPURI.map((t) => <option key={t}>{t}</option>)}</select>
        <select style={input} value={form.status} onChange={(e) => update("status", e.target.value)}>{STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}</select>
        <textarea style={{ ...input, gridColumn: "1 / -1", resize: "vertical", minHeight: 74 }} placeholder="Observații" value={form.observatii} onChange={(e) => update("observatii", e.target.value)} />
        <button type="submit" style={{ gridColumn: "1 / -1", border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "11px 14px", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>Adaugă programare</button>
      </div>
    </form>
  );
}

export default function Programari() {
  const m = useIsMobile();
  const [programari, setProgramari] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Toate");

  useEffect(() => {
    setProgramari(programariStore.getAll());
    setClienti(clientiStore.getAll());
  }, []);

  const refresh = () => {
    setProgramari(programariStore.getAll());
    setClienti(clientiStore.getAll());
  };

  const stergeProgramare = (id) => {
    if (!confirm("Sigur vrei să ștergi această programare?")) return;
    programariStore.delete(id);
    refresh();
  };

  const schimbaStatus = (id, statusNou) => {
    programariStore.update(id, { status: statusNou, ultimaActualizare: "Acum" });
    refresh();
  };

  const programariFiltrate = useMemo(() => {
    return programari.filter((p) => {
      const txt = `${p.titlu} ${p.client} ${p.telefon} ${p.locatie} ${p.tip} ${p.observatii}`.toLowerCase();
      return txt.includes(search.toLowerCase()) && (status === "Toate" || p.status === status);
    });
  }, [programari, search, status]);

  const azi = new Date().toISOString().slice(0, 10);
  const stats = { total: programari.length, azi: programari.filter((p) => p.data === azi).length, confirmate: programari.filter((p) => p.status === "Confirmată").length, importante: programari.filter((p) => p.status === "Importantă").length };

  return (
    <div style={{ ...page, padding: m ? "18px 14px 28px" : "22px 24px" }}>
      <header style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>Programări</div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Gestionează vizionările, întâlnirile, contractele și apelurile cu clienții.</div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        <StatCard label="Total programări" value={stats.total} hint="în calendar" />
        <StatCard label="Astăzi" value={stats.azi} hint="programate azi" />
        <StatCard label="Confirmate" value={stats.confirmate} hint="gata de desfășurat" />
        <StatCard label="Importante" value={stats.importante} hint="necesită atenție" />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 315px", gap: 16, alignItems: "start" }}>
        <section style={card}>
          <div style={{ padding: 16, borderBottom: "0.5px solid var(--border-tertiary)" }}>
            <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 180px", gap: 10 }}>
              <input style={input} placeholder="Caută după client, telefon, locație, tip..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
          </div>
          {!m ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)", fontSize: 11, textAlign: "left" }}>
                    <th style={{ padding: "11px 14px", fontWeight: 600 }}>Data</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Ora</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Programare</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Client</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Tip</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Status</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Actualizare</th><th style={{ padding: "11px 14px", fontWeight: 600 }}>Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {programariFiltrate.map((pr) => (
                    <tr key={pr.id} style={{ borderTop: "0.5px solid var(--border-tertiary)" }}>
                      <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{formatData(pr.data)}</td>
                      <td style={{ padding: "13px 14px", fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>{pr.ora}</td>
                      <td style={{ padding: "13px 14px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{pr.titlu}</div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{pr.locatie}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>{pr.observatii}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                          Adăugat de {pr.createdByName || "—"}
                          {pr.updatedByName && pr.updatedByName !== pr.createdByName ? ` · Modificat de ${pr.updatedByName}` : ""}
                        </div>
                      </td>
                      <td style={{ padding: "13px 14px" }}>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{pr.client}</div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{pr.telefon}</div>
                      </td>
                      <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{pr.tip}</td>
                      <td style={{ padding: "13px 14px" }}>
                        <select value={pr.status} onChange={(e) => schimbaStatus(pr.id, e.target.value)}
                          style={{ ...statusStyle[pr.status], border: "none", outline: "none", fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 20, cursor: "pointer" }}>
                          {STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{pr.ultimaActualizare || "—"}</td>
                      <td style={{ padding: "13px 14px" }}>
                        <button type="button" onClick={() => stergeProgramare(pr.id)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Șterge</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {programariFiltrate.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există programări.</div>}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
              {programariFiltrate.length === 0 && <div style={{ padding: 22, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există programări.</div>}
              {programariFiltrate.map((pr) => (
                <div key={pr.id} style={{ border: "1px solid var(--border-tertiary)", borderRadius: 14, padding: 14, background: "var(--bg-primary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{pr.titlu}</div>
                      <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700 }}>{formatData(pr.data)} • {pr.ora}</div>
                    </div>
                    <select value={pr.status} onChange={(e) => schimbaStatus(pr.id, e.target.value)}
                      style={{ ...statusStyle[pr.status], border: "none", outline: "none", borderRadius: 20, padding: "5px 8px", fontSize: 11, fontWeight: 700, maxWidth: 130 }}>
                      {STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                    <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Client</div><div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{pr.client}</div><div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{pr.telefon}</div></div>
                    <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Locație</div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{pr.locatie}</div></div>
                    <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Tip</div><div style={{ fontSize: 13, color: "var(--text-primary)" }}>{pr.tip}</div></div>
                    <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Observații</div><div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.45 }}>{pr.observatii}</div></div>
                    <div><div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>Ultima actualizare</div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{pr.ultimaActualizare || "—"}</div></div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                      Adăugat de {pr.createdByName || "—"}
                      {pr.updatedByName && pr.updatedByName !== pr.createdByName ? ` · Modificat de ${pr.updatedByName}` : ""}
                    </div>
                  </div>
                  <button type="button" onClick={() => stergeProgramare(pr.id)} style={{ width: "100%", border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Șterge programarea</button>
                </div>
              ))}
            </div>
          )}
        </section>
        <ProgramareForm clienti={clienti} onAdd={(programareNoua) => { programariStore.add(programareNoua); refresh(); }} />
      </div>
    </div>
  );
}
