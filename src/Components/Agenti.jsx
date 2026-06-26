import { useEffect, useState } from "react";
import { getAgenti, addAgent, updateAgent, deleteAgent } from "../data/agentiStorage";
import { isAdmin, isManagerOrAdmin } from "../lib/roleStore";
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineArrowUpTray, HiOutlineXMark } from "react-icons/hi2";

const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const inputStyle = { width: "100%", padding: "10px 14px", fontSize: 13, borderRadius: 10, border: "0.5px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", boxSizing: "border-box", outline: "none" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.3px" };

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

export default function Agenti() {
  const [agenti, setAgenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(() => isAdmin());
  const [canDelete, setCanDelete] = useState(() => isManagerOrAdmin());

  useEffect(() => {
    const t = setInterval(() => {
      setAdmin(isAdmin());
      setCanDelete(isManagerOrAdmin());
    }, 300);
    return () => clearInterval(t);
  }, []);

  const load = async () => {
    setLoading(true);
    const data = await getAgenti();
    setAgenti(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nume: "", telefon: "", email: "", poza: "", zone: "", rol: "agent" });
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);

  const openEdit = (agent) => {
    setEditingId(agent.id);
    setForm({ nume: agent.nume || "", telefon: agent.telefon || "", email: agent.email || "", poza: agent.poza || "", zone: agent.zone || "", rol: agent.rol || "agent" });
    setShowAdd(false);
  };

  const cancel = () => {
    setEditingId(null);
    setShowAdd(false);
    setUploading(false);
    setForm({ nume: "", telefon: "", email: "", poza: "", zone: "", rol: "agent" });
  };

  const handleSave = async () => {
    if (!form.nume.trim()) { alert("Numele agentului este obligatoriu."); return; }
    try {
      if (editingId) await updateAgent(editingId, form);
      else await addAgent(form);
      cancel();
      await load();
    } catch (err) { alert("Eroare: " + (err.message || err)); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Sigur vrei să ștergi acest membru?")) return;
    try { await deleteAgent(id); await load(); } catch (err) { alert("Eroare: " + (err.message || err)); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await convertFileToBase64(file);
      setForm((p) => ({ ...p, poza: base64 }));
    } catch (err) { alert("Eroare upload: " + (err.message || err)); }
    setUploading(false);
  };

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const initials = (nume) => nume.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (loading) return <div style={{ padding: 32, color: "var(--text-secondary)", fontSize: 14 }}>Se încarcă...</div>;

  const showForm = showAdd || editingId;

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>Echipă</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{agenti.length} membri în echipă</div>
        </div>
        {!showForm && admin && (
          <button onClick={() => { setShowAdd(true); setForm({ nume: "", telefon: "", email: "", poza: "", zone: "", rol: "agent" }); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "var(--primary)", color: "white", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <HiOutlinePlus size={16} /> Adaugă membru
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ ...card, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{editingId ? "Editează membru" : "Membru nou"}</div>
            <button onClick={cancel} style={{ border: "none", background: "var(--bg-secondary)", color: "var(--text-secondary)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><HiOutlineXMark size={16} /></button>
          </div>
          <div style={{ display: "flex", gap: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 28, color: "var(--primary)", overflow: "hidden" }}>
                {form.poza ? <img src={form.poza} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; e.target.parentElement.textContent = initials(form.nume || "??"); }} /> : initials(form.nume || "?")}
              </div>
              <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "var(--primary)", background: "var(--primary-light)", padding: "6px 12px", borderRadius: 6 }}>
                <HiOutlineArrowUpTray size={14} />{uploading ? "Se încarcă..." : form.poza ? "Schimbă" : "Încarcă"}
                <input type="file" accept="image/*" onChange={handleUpload} hidden />
              </label>
              {form.poza && <span onClick={() => upd("poza", "")} style={{ fontSize: 11, color: "var(--text-muted)", cursor: "pointer" }}>Șterge poza</span>}
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignContent: "start" }}>
              <div><label style={labelStyle}>Nume *</label><input style={inputStyle} placeholder="Nume complet" value={form.nume} onChange={(e) => upd("nume", e.target.value)} /></div>
              <div><label style={labelStyle}>Telefon</label><input style={inputStyle} placeholder="07xx xxx xxx" value={form.telefon} onChange={(e) => upd("telefon", e.target.value)} /></div>
              <div><label style={labelStyle}>Email</label><input style={inputStyle} placeholder="email@exemplu.ro" value={form.email} onChange={(e) => upd("email", e.target.value)} /></div>
              <div><label style={labelStyle}>Rol</label><select style={inputStyle} value={form.rol} onChange={(e) => upd("rol", e.target.value)}><option value="agent">Agent</option><option value="manager">Manager</option><option value="admin">Administrator</option></select></div>
              <div style={{ gridColumn: "span 2" }}><label style={labelStyle}>Zone responsabilitate</label><input style={inputStyle} placeholder="Copou, Centru, Păcurari" value={form.zone} onChange={(e) => upd("zone", e.target.value)} /></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 20, borderTop: "0.5px solid var(--border-tertiary)" }}>
            <button onClick={cancel} style={{ border: "0.5px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Anulează</button>
            <button onClick={handleSave} style={{ border: "none", background: "var(--primary)", color: "white", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{editingId ? "Salvează" : "Adaugă membru"}</button>
          </div>
        </div>
      )}

      {agenti.length === 0 && !showForm ? (
        <div style={{ ...card, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 6 }}>Niciun membru adăugat</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Adaugă primul membru din echipa ta.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
          {agenti.map((agent) => (
            <div key={agent.id} style={{ ...card, padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 17, color: "var(--primary)", flexShrink: 0, overflow: "hidden" }}>
                {agent.poza ? <img src={agent.poza} alt={agent.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; e.target.parentElement.textContent = initials(agent.nume); }} /> : initials(agent.nume)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.nume} {agent.rol && <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-muted)", marginLeft: 4 }}>· {agent.rol === "admin" ? "Admin" : agent.rol === "manager" ? "Manager" : "Agent"}</span>}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{agent.telefon || "—"} · {agent.email || "—"}</div>
                {agent.zone && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.zone}</div>}
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                  Adăugat de {agent.createdByName || "—"}
                  {agent.updatedByName && agent.updatedByName !== agent.createdByName ? ` · Modificat de ${agent.updatedByName}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {admin && <button onClick={() => openEdit(agent)} style={{ border: "none", background: "var(--bg-secondary)", color: "var(--text-secondary)", width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><HiOutlinePencil size={15} /></button>}
                {canDelete && <button onClick={() => handleDelete(agent.id)} style={{ border: "none", background: "#fef2f2", color: "#dc2626", width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><HiOutlineTrash size={15} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
