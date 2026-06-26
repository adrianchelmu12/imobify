import { useEffect, useMemo, useState } from "react";
import { comisioaneStore } from "../data/stores";

const STATUS = ["Toate", "Plătit", "În așteptare"];

const statusStyle = {
  Plătit: { background: "var(--success-light)", color: "var(--success-dark)" },
  "În așteptare": { background: "var(--warning-light)", color: "var(--warning-dark)" },
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

export default function Comisioane() {
  const m = useIsMobile();
  const [comisioane, setComisioane] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Toate");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { setComisioane(comisioaneStore.getAll()); }, []);

  const refresh = () => setComisioane(comisioaneStore.getAll());

  const addComision = (c) => { comisioaneStore.add(c); refresh(); };
  const deleteComision = (id) => { if (!confirm("Sigur vrei să ștergi acest comision?")) return; comisioaneStore.delete(id); refresh(); };
  const changeStatus = (id, status) => { comisioaneStore.update(id, { status }); refresh(); };
  const startEdit = (c) => { setEditingId(c.id); setEditForm({ ...c }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };
  const saveEdit = () => {
    if (!editForm.agent?.trim()) return;
    comisioaneStore.update(editingId, editForm);
    refresh();
    cancelEdit();
  };

  const comisioaneFiltrate = useMemo(() => {
    return comisioane
      .filter((c) => {
        const txt = `${c.agent} ${c.proprietate || ""}`.toLowerCase();
        return txt.includes(search.toLowerCase()) && (statusFilter === "Toate" || c.status === statusFilter);
      })
      .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [comisioane, search, statusFilter]);

  const totalPlatit = comisioane.filter((c) => c.status === "Plătit").reduce((s, c) => s + (Number(c.suma) || 0), 0);
  const totalAsteptare = comisioane.filter((c) => c.status === "În așteptare").reduce((s, c) => s + (Number(c.suma) || 0), 0);

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "28px 32px" }}>
      <header style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4 }}>Comisioane</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Urmărește comisioanele agenților și statusul plăților</div>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        <StatCard label="Total comisioane" value={comisioane.length} hint="înregistrate" />
        <StatCard label="Plătite" value={`${totalPlatit.toLocaleString("ro-RO")} €`} hint="sume achitate" color="var(--success-dark)" />
        <StatCard label="În așteptare" value={`${totalAsteptare.toLocaleString("ro-RO")} €`} hint="sume de încasat" color="var(--warning-dark)" />
        <StatCard label="Total general" value={`${(totalPlatit + totalAsteptare).toLocaleString("ro-RO")} €`} hint="valoare totală" color="var(--primary)" />
      </section>

      <ComisionForm onAdd={addComision} />

      {editingId && (
        <div style={{ ...card, padding: 20, marginTop: 16, border: "1px solid var(--primary-border)", background: "var(--bg-secondary)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Editează comision</div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
            <input style={input} placeholder="Agent" value={editForm.agent || ""} onChange={(e) => setEditForm({ ...editForm, agent: e.target.value })} />
            <input style={input} placeholder="Proprietate" value={editForm.proprietate || ""} onChange={(e) => setEditForm({ ...editForm, proprietate: e.target.value })} />
            <input style={input} type="number" placeholder="Valoare tranzacție (€)" value={editForm.valoareTranzactie || ""} onChange={(e) => setEditForm({ ...editForm, valoareTranzactie: e.target.value })} />
            <input style={input} type="number" placeholder="Procent (%)" value={editForm.procent || ""} onChange={(e) => setEditForm({ ...editForm, procent: e.target.value })} step="0.5" />
            <input style={input} type="number" placeholder="Sumă comision (€)" value={editForm.suma || ""} onChange={(e) => setEditForm({ ...editForm, suma: e.target.value })} />
            <input style={input} type="date" value={editForm.data || ""} onChange={(e) => setEditForm({ ...editForm, data: e.target.value })} />
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <button onClick={saveEdit} style={{ flex: 1, border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>Salvează</button>
              <button onClick={cancelEdit} style={{ flex: 1, border: "1px solid var(--border-secondary)", borderRadius: 10, background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12 }}>Anulează</button>
            </div>
          </div>
        </div>
      )}

      <section style={{ ...card, marginTop: 16 }}>
        <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--border-tertiary)", display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 180px", gap: 10 }}>
          <input style={input} placeholder="Caută după agent, proprietate..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={input} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 750 }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)", fontSize: 11, textAlign: "left" }}>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Agent</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Proprietate</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Valoare tranzacție</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Procent</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Sumă comision</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Dată</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {comisioaneFiltrate.map((c) => {
                const st = statusStyle[c.status] || statusStyle["În așteptare"];
                return (
                  <tr key={c.id} style={{ borderTop: "0.5px solid var(--border-tertiary)" }}>
                    <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{c.agent}</td>
                    <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{c.proprietate || "—"}</td>
                    <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{c.valoareTranzactie ? `${Number(c.valoareTranzactie).toLocaleString("ro-RO")} €` : "—"}</td>
                    <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{c.procent ? `${c.procent}%` : "—"}</td>
                    <td style={{ padding: "13px 14px", fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{c.suma ? `${Number(c.suma).toLocaleString("ro-RO")} €` : "—"}</td>
                    <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {c.data ? new Date(c.data + "T12:00:00").toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <select value={c.status || "În așteptare"} onChange={(e) => changeStatus(c.id, e.target.value)}
                        style={{ background: st.background, color: st.color, border: "none", outline: "none", fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 8, cursor: "pointer" }}>
                        {STATUS.filter((s) => s !== "Toate").map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => startEdit(c)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>✎</button>
                        <button onClick={() => deleteComision(c.id)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {comisioaneFiltrate.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există comisioane. Adaugă primul comision.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function ComisionForm({ onAdd }) {
  const m = useIsMobile();
  const [form, setForm] = useState({ agent: "", proprietate: "", valoareTranzactie: "", procent: "", suma: "", data: new Date().toISOString().slice(0, 10), status: "În așteptare" });
  const [err, setErr] = useState("");
  const upd = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (err) setErr(""); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.agent.trim()) { setErr("Completează numele agentului."); return; }
    if (!form.suma) { setErr("Completează suma comisionului."); return; }
    onAdd({ ...form, valoareTranzactie: form.valoareTranzactie || "—", proprietate: form.proprietate || "", procent: form.procent || "" });
    setForm({ agent: "", proprietate: "", valoareTranzactie: "", procent: "", suma: "", data: new Date().toISOString().slice(0, 10), status: "În așteptare" });
  };

  return (
    <form onSubmit={submit} style={{ ...card, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Adaugă comision nou</div>
      {err && <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "var(--danger-light)", color: "var(--danger)", fontSize: 12 }}>{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
        <input style={input} placeholder="Agent *" value={form.agent} onChange={(e) => upd("agent", e.target.value)} />
        <input style={input} placeholder="Proprietate" value={form.proprietate} onChange={(e) => upd("proprietate", e.target.value)} />
        <input style={input} type="number" placeholder="Valoare tranzacție (€)" value={form.valoareTranzactie} onChange={(e) => upd("valoareTranzactie", e.target.value)} />
        <input style={input} type="number" placeholder="Procent (%)" value={form.procent} onChange={(e) => upd("procent", e.target.value)} step="0.5" />
        <input style={input} type="number" placeholder="Sumă comision (€) *" value={form.suma} onChange={(e) => upd("suma", e.target.value)} />
        <input style={input} type="date" value={form.data} onChange={(e) => upd("data", e.target.value)} />
        <button type="submit" style={{ gridColumn: m ? "span 1" : "span 3", border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "11px 14px", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>Adaugă comision</button>
      </div>
    </form>
  );
}
