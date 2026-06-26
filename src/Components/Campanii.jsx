import { useEffect, useMemo, useState } from "react";
import { campaniiStore } from "../data/stores";

const TIPURI = ["Email", "Social Media", "Google Ads", "Anunț", "Eveniment", "Telemarketing", "Altul"];
const STATUS = ["Toate", "Activă", "Pauză", "Finalizată"];

const statusStyle = {
  Activă: { background: "var(--success-light)", color: "var(--success-dark)" },
  Pauză: { background: "var(--warning-light)", color: "var(--warning-dark)" },
  Finalizată: { background: "var(--bg-secondary)", color: "var(--text-secondary)" },
};

const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

function StatCard({ label, value, hint, color }) {
  return (
    <div style={{ ...card, padding: "20px 22px", transition: "all 0.3s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}>
      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: color || "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>{hint}</div>
    </div>
  );
}

export default function Campanii() {
  const m = useIsMobile();
  const [campanii, setCampanii] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Toate");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { setCampanii(campaniiStore.getAll()); }, []);

  const refresh = () => setCampanii(campaniiStore.getAll());

  const addCampanie = (c) => { campaniiStore.add(c); refresh(); };
  const deleteCampanie = (id) => { if (!confirm("Sigur vrei să ștergi această campanie?")) return; campaniiStore.delete(id); refresh(); };
  const changeStatus = (id, status) => { campaniiStore.update(id, { status }); refresh(); };
  const startEdit = (c) => { setEditingId(c.id); setEditForm({ ...c }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };
  const saveEdit = () => {
    if (!editForm.nume?.trim()) return;
    campaniiStore.update(editingId, editForm);
    refresh();
    cancelEdit();
  };

  const campaniiFiltrate = useMemo(() => {
    return campanii
      .filter((c) => {
        const txt = `${c.nume} ${c.tip} ${c.descriere || ""}`.toLowerCase();
        return txt.includes(search.toLowerCase()) && (statusFilter === "Toate" || c.status === statusFilter);
      })
      .sort((a, b) => (b.dataStart || "").localeCompare(a.dataStart || ""));
  }, [campanii, search, statusFilter]);

  const totalBuget = campanii.reduce((s, c) => s + (Number(c.buget) || 0), 0);
  const totalLeaduri = campanii.reduce((s, c) => s + (Number(c.leaduriGenerate) || 0), 0);
  const active = campanii.filter((c) => c.status === "Activă").length;

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "28px 32px" }}>
      <header style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>Campanii de marketing</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{campanii.length} campanii · {active} active · {totalLeaduri} lead-uri generate</div>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        <StatCard label="Total campanii" value={campanii.length} hint="create" />
        <StatCard label="Active" value={active} hint="în desfășurare" color="var(--success-dark)" />
        <StatCard label="Buget total" value={`${totalBuget.toLocaleString("ro-RO")} €`} hint="investit" color="var(--primary)" />
        <StatCard label="Lead-uri generate" value={totalLeaduri} hint="din campanii" color="var(--warning-dark)" />
      </section>

      <CampanieForm onAdd={addCampanie} />

      {editingId && (
        <div style={{ ...card, padding: 20, marginTop: 16, border: "1px solid var(--primary-border)", background: "var(--bg-secondary)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Editează campanie</div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
            <input style={input} placeholder="Nume campanie" value={editForm.nume || ""} onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })} />
            <select style={input} value={editForm.tip || "Altul"} onChange={(e) => setEditForm({ ...editForm, tip: e.target.value })}>
              {TIPURI.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select style={input} value={editForm.status || "Activă"} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              {STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}
            </select>
            <input style={input} type="date" value={editForm.dataStart || ""} onChange={(e) => setEditForm({ ...editForm, dataStart: e.target.value })} />
            <input style={input} type="date" value={editForm.dataEnd || ""} onChange={(e) => setEditForm({ ...editForm, dataEnd: e.target.value })} />
            <input style={input} type="number" placeholder="Buget (€)" value={editForm.buget || ""} onChange={(e) => setEditForm({ ...editForm, buget: e.target.value })} />
            <input style={input} type="number" placeholder="Lead-uri generate" value={editForm.leaduriGenerate || ""} onChange={(e) => setEditForm({ ...editForm, leaduriGenerate: e.target.value })} />
            <textarea style={{ ...input, gridColumn: m ? "span 1" : "span 2", resize: "vertical", minHeight: 50 }} placeholder="Descriere" value={editForm.descriere || ""} onChange={(e) => setEditForm({ ...editForm, descriere: e.target.value })} />
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button onClick={saveEdit} style={{ flex: 1, border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>Salvează</button>
              <button onClick={cancelEdit} style={{ flex: 1, border: "1px solid var(--border-secondary)", borderRadius: 10, background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12 }}>Anulează</button>
            </div>
          </div>
        </div>
      )}

      <section style={{ ...card, marginTop: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--border-tertiary)", display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 180px", gap: 10 }}>
          <input style={input} placeholder="Caută după nume, tip, descriere..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={input} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)", fontSize: 11, textAlign: "left" }}>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Campanie</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Tip</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Perioadă</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Buget</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Lead-uri</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {campaniiFiltrate.map((c) => {
                const st = statusStyle[c.status] || statusStyle.Activă;
                return (
                  <tr key={c.id} style={{ borderTop: "0.5px solid var(--border-tertiary)" }}>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.nume}</div>
                      {c.descriere && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.descriere}</div>}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "3px 8px", borderRadius: 6 }}>{c.tip || "—"}</span>
                    </td>
                    <td style={{ padding: "13px 14px", fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {c.dataStart ? new Date(c.dataStart + "T12:00:00").toLocaleDateString("ro-RO", { day: "2-digit", month: "short" }) : "—"}
                      {c.dataEnd ? ` → ${new Date(c.dataEnd + "T12:00:00").toLocaleDateString("ro-RO", { day: "2-digit", month: "short" })}` : ""}
                    </td>
                    <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{c.buget ? `${Number(c.buget).toLocaleString("ro-RO")} €` : "—"}</td>
                    <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>{c.leaduriGenerate || "—"}</td>
                    <td style={{ padding: "13px 14px" }}>
                      <select value={c.status || "Activă"} onChange={(e) => changeStatus(c.id, e.target.value)}
                        style={{ background: st.background, color: st.color, border: "none", outline: "none", fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 8, cursor: "pointer" }}>
                        {STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => startEdit(c)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✎</button>
                        <button onClick={() => deleteCampanie(c.id)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {campaniiFiltrate.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există campanii. Adaugă prima campanie.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function CampanieForm({ onAdd }) {
  const m = useIsMobile();
  const [form, setForm] = useState({ nume: "", tip: "Email", dataStart: "", dataEnd: "", buget: "", leaduriGenerate: "", status: "Activă", descriere: "" });
  const [err, setErr] = useState("");
  const upd = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (err) setErr(""); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.nume.trim()) { setErr("Completează numele campaniei."); return; }
    onAdd({ ...form, buget: form.buget || "", leaduriGenerate: form.leaduriGenerate || "", descriere: form.descriere || "" });
    setForm({ nume: "", tip: "Email", dataStart: "", dataEnd: "", buget: "", leaduriGenerate: "", status: "Activă", descriere: "" });
  };

  return (
    <form onSubmit={submit} style={{ ...card, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Adaugă campanie nouă</div>
      {err && <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "var(--danger-light)", color: "var(--danger)", fontSize: 12 }}>{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
        <input style={{ ...input, gridColumn: m ? "span 1" : "span 2" }} placeholder="Nume campanie *" value={form.nume} onChange={(e) => upd("nume", e.target.value)} />
        <select style={input} value={form.tip} onChange={(e) => upd("tip", e.target.value)}>{TIPURI.map((t) => <option key={t}>{t}</option>)}</select>
        <input style={input} type="date" placeholder="Data început" value={form.dataStart} onChange={(e) => upd("dataStart", e.target.value)} />
        <input style={input} type="date" placeholder="Data sfârșit" value={form.dataEnd} onChange={(e) => upd("dataEnd", e.target.value)} />
        <input style={input} type="number" placeholder="Buget (€)" value={form.buget} onChange={(e) => upd("buget", e.target.value)} />
        <input style={input} type="number" placeholder="Lead-uri generate" value={form.leaduriGenerate} onChange={(e) => upd("leaduriGenerate", e.target.value)} />
        <textarea style={{ ...input, gridColumn: m ? "span 1" : "span 3", resize: "vertical", minHeight: 50 }} placeholder="Descriere campanie" value={form.descriere} onChange={(e) => upd("descriere", e.target.value)} />
        <button type="submit" style={{ gridColumn: m ? "span 1" : "span 3", border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "11px 14px", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>Adaugă campanie</button>
      </div>
    </form>
  );
}
