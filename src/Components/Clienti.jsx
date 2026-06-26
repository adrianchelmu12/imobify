import { useEffect, useMemo, useState } from "react";
import { clientiStore, programariStore } from "../data/stores";

const STATUS = ["Toți", "Nou", "Contactat", "Interesat", "Închis"];
const SURSE = ["Site", "Facebook", "OLX", "Recomandare", "Altă sursă"];

const statusStyle = {
  Nou: { background: "var(--warning-light)", color: "var(--warning-dark)" },
  Contactat: { background: "var(--primary-light)", color: "var(--primary)" },
  Interesat: { background: "var(--success-light)", color: "var(--success-dark)" },
  Închis: { background: "var(--bg-secondary)", color: "var(--text-secondary)" },
};

const page = { padding: "22px 24px" };
const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => {
    const r = () => setM(window.innerWidth <= 900);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  return m;
}

const input = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 12, boxSizing: "border-box" };

function StatCard({ label, value, hint }) {
  return (
    <div style={{ ...card, padding: "20px 22px", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}>
      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{hint}</div>
    </div>
  );
}

export default function Clienti() {
  const m = useIsMobile();
  const [clienti, setClienti] = useState([]);
  const [programari, setProgramari] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Toți");
  const [expanded, setExpanded] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewMode, setViewMode] = useState("tabel");

  useEffect(() => {
    setClienti(clientiStore.getAll());
    setProgramari(programariStore.getAll());
  }, []);

  const refresh = () => {
    setClienti(clientiStore.getAll());
    setProgramari(programariStore.getAll());
  };

  const stergeClient = (id) => {
    if (!confirm("Sigur vrei să ștergi acest client?")) return;
    clientiStore.delete(id);
    refresh();
  };

  const schimbaStatus = (id, statusNou) => {
    clientiStore.update(id, { status: statusNou, ultimaInteractiune: "Acum" });
    refresh();
  };

  const startEdit = (client) => {
    setEditId(client.id);
    setEditForm({ ...client });
  };

  const cancelEdit = () => { setEditId(null); setEditForm({}); };

  const saveEdit = () => {
    const { id, created_at, ...values } = editForm;
    values.ultimaInteractiune = "Acum";
    clientiStore.update(id, values);
    refresh();
    setEditId(null);
    setEditForm({});
  };

  const clientiFiltrati = useMemo(() => {
    return clienti.filter((c) => {
      const txt = `${c.nume} ${c.telefon} ${c.email} ${c.interes} ${c.zona} ${c.sursa || ""}`.toLowerCase();
      return txt.includes(search.toLowerCase()) && (status === "Toți" || c.status === status);
    });
  }, [clienti, search, status]);

  const programariClient = (clientId) => {
    const client = clienti.find((c) => String(c.id) === String(clientId));
    if (!client) return [];
    return programari.filter((p) => p.client === client.nume);
  };

  const stats = {
    total: clienti.length,
    noi: clienti.filter((c) => c.status === "Nou").length,
    interesati: clienti.filter((c) => c.status === "Interesat").length,
    inchisi: clienti.filter((c) => c.status === "Închis").length,
  };

  const kanbanCols = [
    { key: "Nou", label: "Nou", color: statusStyle.Nou },
    { key: "Contactat", label: "Contactat", color: statusStyle.Contactat },
    { key: "Interesat", label: "Interesat", color: statusStyle.Interesat },
    { key: "Închis", label: "Închis", color: statusStyle.Închis },
  ];

  const renderRow = (client) => {
    if (editId === client.id) {
      return (
        <tr key={client.id} style={{ borderTop: "0.5px solid var(--border-tertiary)", background: "var(--bg-secondary)" }}>
          <td style={{ padding: "10px 14px" }}><input style={input} value={editForm.nume || ""} onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })} /></td>
          <td style={{ padding: "10px 14px" }}>
            <input style={input} value={editForm.telefon || ""} onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })} />
            <input style={{ ...input, marginTop: 4 }} value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="email" />
          </td>
          <td style={{ padding: "10px 14px" }}><input style={input} value={editForm.interes || ""} onChange={(e) => setEditForm({ ...editForm, interes: e.target.value })} /></td>
          <td style={{ padding: "10px 14px" }}><input style={input} value={editForm.buget || ""} onChange={(e) => setEditForm({ ...editForm, buget: e.target.value })} /></td>
          <td style={{ padding: "10px 14px" }}>
            <select style={input} value={editForm.sursa || ""} onChange={(e) => setEditForm({ ...editForm, sursa: e.target.value })}>
              <option value="">—</option>
              {SURSE.map((s) => <option key={s}>{s}</option>)}
            </select>
          </td>
          <td style={{ padding: "10px 14px" }}>
            <select style={{ ...input, ...statusStyle[editForm.status] }} value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              {STATUS.filter((s) => s !== "Toți").map((s) => <option key={s}>{s}</option>)}
            </select>
          </td>
          <td style={{ padding: "10px 14px" }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={saveEdit} style={{ border: "none", background: "var(--primary)", color: "white", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Salvează</button>
              <button type="button" onClick={cancelEdit} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Anulează</button>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <tr key={client.id} style={{ borderTop: "0.5px solid var(--border-tertiary)", cursor: "pointer" }} onClick={() => setExpanded(expanded === client.id ? null : client.id)}>
        <td style={{ padding: "13px 14px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{client.nume}</div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{client.zona || "—"}{client.sursa ? ` · ${client.sursa}` : ""}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
            Adăugat de {client.createdByName || "—"}
            {client.updatedByName && client.updatedByName !== client.createdByName ? ` · Modificat de ${client.updatedByName}` : ""}
          </div>
        </td>
        <td style={{ padding: "13px 14px" }}>
          <div style={{ fontSize: 12, color: "var(--text-primary)" }}>{client.telefon}</div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{client.email}</div>
        </td>
        <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{client.interes || "—"}</td>
        <td style={{ padding: "13px 14px", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{client.buget || "—"}</td>
        <td style={{ padding: "13px 14px" }}><span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{client.sursa || "—"}</span></td>
        <td style={{ padding: "13px 14px" }}>
          <select value={client.status} onChange={(e) => { e.stopPropagation(); schimbaStatus(client.id, e.target.value); }}
            style={{ ...statusStyle[client.status], border: "none", outline: "none", fontSize: 11, fontWeight: 600, padding: "4px 9px", borderRadius: 20, cursor: "pointer" }}>
            {STATUS.filter((s) => s !== "Toți").map((s) => <option key={s}>{s}</option>)}
          </select>
        </td>
        <td style={{ padding: "13px 14px" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={(e) => { e.stopPropagation(); startEdit(client); }} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✎</button>
            <button type="button" onClick={(e) => { e.stopPropagation(); stergeClient(client.id); }} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🗑</button>
          </div>
        </td>
      </tr>
    );
  };

  const ClientForm = () => {
    const [err, setErr] = useState("");
    const [form, setForm] = useState({ nume: "", telefon: "", email: "", buget: "", interes: "", zona: "", status: "Nou", sursa: "" });
    const upd = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (err) setErr(""); };
    const submit = (e) => {
      e.preventDefault();
      if (!form.nume.trim()) { setErr("Completează numele."); return; }
      if (!form.telefon.trim()) { setErr("Completează telefonul."); return; }
      clientiStore.add({ ...form, email: form.email || "—", buget: form.buget || "—", interes: form.interes || "—", zona: form.zona || "—", ultimaInteractiune: "Acum" });
      refresh();
      setForm({ nume: "", telefon: "", email: "", buget: "", interes: "", zona: "", status: "Nou", sursa: "" });
    };
    return (
      <form onSubmit={submit} style={{ ...card, padding: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Adaugă client nou</div>
        {err && <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "#FEE2E2", color: "#B91C1C", fontSize: 12 }}>{err}</div>}
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 10 }}>
          <input style={input} placeholder="Nume client *" value={form.nume} onChange={(e) => upd("nume", e.target.value)} />
          <input style={input} placeholder="Telefon *" value={form.telefon} onChange={(e) => upd("telefon", e.target.value)} />
          <input style={input} placeholder="Email" value={form.email} onChange={(e) => upd("email", e.target.value)} />
          <input style={input} placeholder="Buget ex. 100.000 €" value={form.buget} onChange={(e) => upd("buget", e.target.value)} />
          <input style={input} placeholder="Interes ex. Apartament 3 camere" value={form.interes} onChange={(e) => upd("interes", e.target.value)} />
          <input style={input} placeholder="Zonă ex. Copou" value={form.zona} onChange={(e) => upd("zona", e.target.value)} />
          <select style={input} value={form.sursa} onChange={(e) => upd("sursa", e.target.value)}>
            <option value="">Sursă client</option>
            {SURSE.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select style={input} value={form.status} onChange={(e) => upd("status", e.target.value)}>
            {STATUS.filter((s) => s !== "Toți").map((s) => <option key={s}>{s}</option>)}
          </select>
          <button type="submit" style={{ gridColumn: "1 / -1", border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "11px 14px", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>Adaugă client</button>
        </div>
      </form>
    );
  };

  return (
    <div style={{ ...page, padding: m ? "18px 14px 28px" : "22px 24px" }}>
      <header style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>Clienți</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Gestionează clienții, bugetele, zonele de interes și stadiul fiecărei discuții.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setViewMode("tabel")} style={{ padding: "7px 14px", borderRadius: 8, border: viewMode === "tabel" ? "none" : "1px solid var(--border-secondary)", background: viewMode === "tabel" ? "var(--primary)" : "var(--bg-primary)", color: viewMode === "tabel" ? "white" : "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📋 Tabel</button>
          <button type="button" onClick={() => setViewMode("kanban")} style={{ padding: "7px 14px", borderRadius: 8, border: viewMode === "kanban" ? "none" : "1px solid var(--border-secondary)", background: viewMode === "kanban" ? "var(--primary)" : "var(--bg-primary)", color: viewMode === "kanban" ? "white" : "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📌 Vizualizare rapidă</button>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        <StatCard label="Total clienți" value={stats.total} hint="în baza de date" />
        <StatCard label="Clienți noi" value={stats.noi} hint="necontactați încă" />
        <StatCard label="Interesați" value={stats.interesati} hint="au cerut detalii" />
        <StatCard label="Închiși" value={stats.inchisi} hint="tranzacții finalizate" />
      </section>

      {viewMode === "tabel" ? (
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 290px", gap: 16, alignItems: "start" }}>
          <section style={card}>
            <div style={{ padding: 16, borderBottom: "0.5px solid var(--border-tertiary)" }}>
              <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 180px", gap: 10 }}>
                <input style={input} placeholder="Caută după nume, telefon, email, zonă..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <select style={input} value={status} onChange={(e) => setStatus(e.target.value)}>
                  {STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {!m ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)", fontSize: 11, textAlign: "left" }}>
                      <th style={{ padding: "11px 14px", fontWeight: 600 }}>Client</th>
                      <th style={{ padding: "11px 14px", fontWeight: 600 }}>Contact</th>
                      <th style={{ padding: "11px 14px", fontWeight: 600 }}>Interes</th>
                      <th style={{ padding: "11px 14px", fontWeight: 600 }}>Buget</th>
                      <th style={{ padding: "11px 14px", fontWeight: 600 }}>Sursă</th>
                      <th style={{ padding: "11px 14px", fontWeight: 600 }}>Status</th>
                      <th style={{ padding: "11px 14px", fontWeight: 600 }}>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientiFiltrati.map(renderRow)}
                    {clientiFiltrati.map((client) => expanded === client.id && (
                      <tr key={`exp-${client.id}`}>
                        <td colSpan={7} style={{ padding: 0, background: "var(--bg-secondary)" }}>
                          <div style={{ padding: "16px 20px" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Programări pentru {client.nume}</div>
                            {programariClient(client.id).length === 0 ? (
                              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Nicio programare găsită.</div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {programariClient(client.id).map((pr) => (
                                  <div key={pr.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: 10, borderRadius: 10, background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)" }}>
                                    <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 700, whiteSpace: "nowrap" }}>{pr.data} {pr.ora}</div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{pr.titlu}</div>
                                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{pr.tip} · {pr.locatie || "—"}</div>
                                    </div>
                                    <span style={{ ...statusStyle[pr.status] || statusStyle.Confirmată, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20 }}>{pr.status}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {clientiFiltrati.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există clienți.</div>}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 12 }}>
                {clientiFiltrati.length === 0 && <div style={{ padding: 22, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există clienți.</div>}
                {clientiFiltrati.map((client) => (
                  <div key={client.id} style={{ border: "1px solid var(--border-tertiary)", borderRadius: 14, padding: 14, background: "var(--bg-primary)" }} onClick={() => setExpanded(expanded === client.id ? null : client.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{client.nume}</div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3 }}>{client.zona || "—"}{client.sursa ? ` · ${client.sursa}` : ""}</div>
                      </div>
                      <select value={client.status} onChange={(e) => { e.stopPropagation(); schimbaStatus(client.id, e.target.value); }}
                        style={{ ...statusStyle[client.status], border: "none", outline: "none", borderRadius: 20, padding: "5px 8px", fontSize: 11, fontWeight: 700, maxWidth: 120 }}>
                        {STATUS.filter((s) => s !== "Toți").map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "grid", gap: 10, marginBottom: editId === client.id ? 14 : 8 }}>
                      {editId === client.id ? (
                        <>
                          <input style={input} value={editForm.nume || ""} onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })} placeholder="Nume" />
                          <input style={input} value={editForm.telefon || ""} onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })} placeholder="Telefon" />
                          <input style={input} value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" />
                          <input style={input} value={editForm.buget || ""} onChange={(e) => setEditForm({ ...editForm, buget: e.target.value })} placeholder="Buget" />
                          <input style={input} value={editForm.interes || ""} onChange={(e) => setEditForm({ ...editForm, interes: e.target.value })} placeholder="Interes" />
                          <input style={input} value={editForm.zona || ""} onChange={(e) => setEditForm({ ...editForm, zona: e.target.value })} placeholder="Zonă" />
                          <select style={input} value={editForm.sursa || ""} onChange={(e) => setEditForm({ ...editForm, sursa: e.target.value })}>
                            <option value="">Sursă</option>
                            {SURSE.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </>
                      ) : (
                        <>
                          <div><span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Telefon</span><div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>{client.telefon}</div></div>
                          <div><span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Email</span><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{client.email}</div></div>
                          <div><span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Interes</span><div style={{ fontSize: 13, color: "var(--text-primary)" }}>{client.interes || "—"}</div></div>
                          <div><span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Buget</span><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{client.buget || "—"}</div></div>
                          <div><span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Sursă</span><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{client.sursa || "—"}</div></div>
                          <div><span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Ultima interacțiune</span><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{client.ultimaInteractiune || "—"}</div></div>
                        </>
                      )}
                    </div>
                    {expanded === client.id && (
                      <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: "var(--bg-secondary)", marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Programări</div>
                        {programariClient(client.id).length === 0 ? (
                          <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Nicio programare.</div>
                        ) : (
                          programariClient(client.id).map((pr) => (
                            <div key={pr.id} style={{ fontSize: 12, padding: "6px 0", borderBottom: "0.5px solid var(--border-tertiary)" }}>
                              <span style={{ fontWeight: 600, color: "var(--primary)" }}>{pr.data} {pr.ora}</span> — {pr.titlu} <span style={{ color: "var(--text-tertiary)" }}>({pr.status})</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, marginBottom: 8 }}>
                      Adăugat de {client.createdByName || "—"}
                      {client.updatedByName && client.updatedByName !== client.createdByName ? ` · Modificat de ${client.updatedByName}` : ""}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {editId === client.id ? (
                        <>
                          <button type="button" onClick={(e) => { e.stopPropagation(); saveEdit(); }} style={{ flex: 1, border: "none", background: "var(--primary)", color: "white", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Salvează</button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); cancelEdit(); }} style={{ flex: 1, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Anulează</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={(e) => { e.stopPropagation(); startEdit(client); }} style={{ flex: 1, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>✎ Editează</button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); stergeClient(client.id); }} style={{ flex: 1, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑 Șterge</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <ClientForm />
        </div>
      ) : (
        <div style={{ overflowX: "auto", marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "repeat(4, 240px)", gap: 12, minWidth: m ? "auto" : 1000 }}>
            {kanbanCols.map((col) => (
              <div key={col.key} style={{ ...card, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: col.color.color, background: col.color.background, borderBottom: "1px solid var(--border-tertiary)" }}>
                  {col.label} ({clientiFiltrati.filter((c) => c.status === col.key).length})
                </div>
                <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 120 }}>
                  {clientiFiltrati.filter((c) => c.status === col.key).map((client) => (
                    <div key={client.id} style={{ padding: 12, borderRadius: 10, border: "1px solid var(--border-tertiary)", background: "var(--bg-primary)", cursor: "pointer" }} onClick={() => { setExpanded(client.id); setViewMode("tabel"); }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{client.nume}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 3 }}>{client.telefon}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{client.interes || "—"}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                        Adăugat de {client.createdByName || "—"}
                        {client.updatedByName && client.updatedByName !== client.createdByName ? ` · Modificat de ${client.updatedByName}` : ""}
                      </div>
                    </div>
                  ))}
                  {clientiFiltrati.filter((c) => c.status === col.key).length === 0 && (
                    <div style={{ padding: 16, textAlign: "center", fontSize: 12, color: "var(--text-tertiary)" }}>Niciun client</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
