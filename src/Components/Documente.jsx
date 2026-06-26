import { useEffect, useMemo, useState, useRef } from "react";
import { documenteStore } from "../data/stores";
import { HiOutlineDocumentText, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowDownTray, HiOutlinePaperClip, HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";

const TIPURI = ["Contract", "Antecontract", "Factură", "Ofertă", "Act adițional", "Certificat", "Altul"];

const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.3px" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" });
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({ name: file.name, data: reader.result, size: file.size, type: file.type });
    reader.onerror = reject;
  });
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function Documente() {
  const m = useIsMobile();
  const [documente, setDocumente] = useState([]);
  const [search, setSearch] = useState("");
  const [tipFilter, setTipFilter] = useState("Toate");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const editFileRef = useRef();

  useEffect(() => { setDocumente(documenteStore.getAll()); }, []);

  const refresh = () => setDocumente(documenteStore.getAll());

  const addDoc = (doc) => { documenteStore.add(doc); refresh(); setShowForm(false); };
  const deleteDoc = (id) => { if (!confirm("Sigur vrei să ștergi acest document?")) return; documenteStore.delete(id); refresh(); };
  const startEdit = (d) => { setEditingId(d.id); setEditForm({ ...d }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };
  const saveEdit = () => {
    if (!editForm.nume?.trim()) return;
    documenteStore.update(editingId, editForm);
    refresh();
    cancelEdit();
  };

  const handleEditFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await convertFileToBase64(file);
      setEditForm((p) => ({ ...p, fisier: result }));
    } catch { alert("Eroare la încărcare."); }
  };

  const documenteFiltrate = useMemo(() => {
    return documente
      .filter((d) => {
        const txt = `${d.nume} ${d.client || ""} ${d.proprietate || ""}`.toLowerCase();
        return txt.includes(search.toLowerCase()) && (tipFilter === "Toate" || d.tip === tipFilter);
      })
      .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [documente, search, tipFilter]);

  const stats = { total: documente.length, cuFisier: documente.filter((d) => d.fisier).length };

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "28px 32px" }}>
      <header style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
            <HiOutlineDocumentText size={24} color="var(--primary)" />
            Documente
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{stats.total} documente · {stats.cuFisier} cu fișiere atașate</div>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (editingId) cancelEdit(); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "var(--primary)", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <HiOutlinePlus size={16} /> Document nou
        </button>
      </header>

      {showForm && <DocForm onAdd={addDoc} onCancel={() => setShowForm(false)} />}

      {editingId && (
        <div style={{ ...card, padding: 20, marginBottom: 16, border: "1px solid var(--primary-border)", background: "var(--bg-secondary)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Editează document</div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 10 }}>
            <input style={input} placeholder="Nume document" value={editForm.nume || ""} onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })} />
            <select style={input} value={editForm.tip || "Altul"} onChange={(e) => setEditForm({ ...editForm, tip: e.target.value })}>
              {TIPURI.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input style={input} placeholder="Client" value={editForm.client || ""} onChange={(e) => setEditForm({ ...editForm, client: e.target.value })} />
            <input style={input} placeholder="Proprietate" value={editForm.proprietate || ""} onChange={(e) => setEditForm({ ...editForm, proprietate: e.target.value })} />
            <input style={input} type="date" value={editForm.data || ""} onChange={(e) => setEditForm({ ...editForm, data: e.target.value })} />
            <div>
              <input ref={editFileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png,.xls,.xlsx" onChange={handleEditFile} hidden />
              {editForm.fisier ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border-tertiary)" }}>
                  <HiOutlinePaperClip size={14} color="var(--primary)" />
                  <span style={{ fontSize: 12, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{editForm.fisier.name}</span>
                  <button type="button" onClick={() => setEditForm({ ...editForm, fisier: null })} style={{ border: "none", background: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14 }}>×</button>
                </div>
              ) : (
                <button type="button" onClick={() => editFileRef.current?.click()}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px dashed var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                  Atașează fișier
                </button>
              )}
            </div>
            <div style={{ gridColumn: m ? "span 1" : "span 2", display: "flex", gap: 8 }}>
              <button onClick={saveEdit} style={{ flex: 1, border: "none", borderRadius: 10, background: "var(--primary)", color: "#fff", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12 }}>
                <HiOutlineCheck size={14} style={{ marginRight: 4, display: "inline", verticalAlign: "middle" }} /> Salvează
              </button>
              <button onClick={cancelEdit} style={{ flex: 1, border: "1px solid var(--border-secondary)", borderRadius: 10, background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12 }}>
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      <section style={card}>
        <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--border-tertiary)", display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 180px", gap: 10 }}>
          <input style={input} placeholder="Caută după nume, client, proprietate..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select style={input} value={tipFilter} onChange={(e) => setTipFilter(e.target.value)}>
            <option value="Toate">Toate tipurile</option>
            {TIPURI.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "var(--bg-secondary)", color: "var(--text-tertiary)", fontSize: 11, textAlign: "left" }}>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Document</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Tip</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Client</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Proprietate</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Dată</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Fișier</th>
                <th style={{ padding: "11px 14px", fontWeight: 600 }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {documenteFiltrate.map((d) => (
                <tr key={d.id} style={{ borderTop: "0.5px solid var(--border-tertiary)" }}>
                  <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {d.nume}
                  </td>
                  <td style={{ padding: "13px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "3px 8px", borderRadius: 6 }}>{d.tip || "—"}</span>
                  </td>
                  <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{d.client || "—"}</td>
                  <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{d.proprietate || "—"}</td>
                  <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{formatDate(d.data)}</td>
                  <td style={{ padding: "13px 14px" }}>
                    {d.fisier ? (
                      <a href={d.fisier.data} download={d.fisier.name}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--primary)", fontSize: 11, fontWeight: 600, textDecoration: "none", padding: "4px 10px", borderRadius: 8, background: "var(--primary-light)" }}>
                        <HiOutlineArrowDownTray size={12} /> {d.fisier.name.length > 16 ? d.fisier.name.slice(0, 14) + "..." : d.fisier.name}
                        {d.fisier.size ? <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginLeft: 2 }}>({formatSize(d.fisier.size)})</span> : null}
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "13px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => startEdit(d)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        <HiOutlinePencil size={13} />
                      </button>
                      <button onClick={() => deleteDoc(d.id)} style={{ border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 8, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        <HiOutlineTrash size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {documenteFiltrate.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există documente. Adaugă primul document.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function DocForm({ onAdd, onCancel }) {
  const m = useIsMobile();
  const fileRef = useRef();
  const [form, setForm] = useState({ nume: "", tip: "Contract", client: "", proprietate: "", data: new Date().toISOString().slice(0, 10), fisier: null });
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const upd = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (err) setErr(""); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await convertFileToBase64(file);
      upd("fisier", result);
    } catch { alert("Eroare la încărcare."); }
    setUploading(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.nume.trim()) { setErr("Completează numele documentului."); return; }
    onAdd({ ...form, client: form.client || "", proprietate: form.proprietate || "" });
    setForm({ nume: "", tip: "Contract", client: "", proprietate: "", data: new Date().toISOString().slice(0, 10), fisier: null });
  };

  return (
    <form onSubmit={submit} style={{ ...card, padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <HiOutlinePlus size={16} color="var(--primary)" /> Document nou
      </div>
      {err && <div style={{ marginBottom: 10, padding: "8px 10px", borderRadius: 8, background: "var(--danger-light)", color: "var(--danger)", fontSize: 12 }}>{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: m ? "span 1" : "span 2" }}>
          <label style={labelStyle}>Nume document *</label>
          <input style={input} placeholder="ex. Contract vânzare - Popescu" value={form.nume} onChange={(e) => upd("nume", e.target.value)} />
        </div>
        <div><label style={labelStyle}>Tip</label><select style={input} value={form.tip} onChange={(e) => upd("tip", e.target.value)}>{TIPURI.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label style={labelStyle}>Dată</label><input style={input} type="date" value={form.data} onChange={(e) => upd("data", e.target.value)} /></div>
        <div><label style={labelStyle}>Client</label><input style={input} placeholder="Nume client" value={form.client} onChange={(e) => upd("client", e.target.value)} /></div>
        <div><label style={labelStyle}>Proprietate</label><input style={input} placeholder="Adresă proprietate" value={form.proprietate} onChange={(e) => upd("proprietate", e.target.value)} /></div>
        <div style={{ gridColumn: m ? "span 1" : "span 2" }}>
          <label style={labelStyle}>Fișier (PDF, DOC, JPG)</label>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png,.xls,.xlsx" onChange={handleFile} hidden />
          {form.fisier ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--bg-secondary)", border: "1px solid var(--border-tertiary)" }}>
              <HiOutlinePaperClip size={14} color="var(--primary)" />
              <span style={{ fontSize: 12, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.fisier.name}</span>
              <button type="button" onClick={() => upd("fisier", null)} style={{ border: "none", background: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px dashed var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
              {uploading ? "Se încarcă..." : "Click pentru a atașa fișier"}
            </button>
          )}
        </div>
        <div style={{ gridColumn: m ? "span 1" : "span 2", display: "flex", gap: 8 }}>
          <button type="submit" style={{ flex: 1, border: "none", borderRadius: 10, background: "var(--primary)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "11px 14px" }}>Adaugă document</button>
          <button type="button" onClick={onCancel} style={{ border: "1px solid var(--border-secondary)", borderRadius: 10, background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "11px 14px" }}>Anulează</button>
        </div>
      </div>
    </form>
  );
}
