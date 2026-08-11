import { useEffect, useMemo, useState, useRef } from "react";
import { documenteStore, proprietatiStore, clientiStore } from "../data/stores";
import { HiOutlineDocumentText, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowDownTray, HiOutlinePaperClip, HiOutlineCheck, HiOutlineXMark, HiOutlineFolder, HiOutlineFolderOpen } from "react-icons/hi2";

const TIPURI = ["Contract", "Antecontract", "Factura", "Oferta", "Act aditional", "Certificat", "Altul"];

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

import { uploadToCloudinary } from "../utils/cloudinary.js";

function normalizeFisier(f) {
  if (!f) return null;
  if (typeof f === "string") {
    try { const p = JSON.parse(f); if (p && p.data) return p; } catch {}
    return { data: f, name: f.split("/").pop() || "fisier", size: 0 };
  }
  if (f.data) return f;
  return null;
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
  const [proprietati, setProprietati] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [search, setSearch] = useState("");
  const [tipFilter, setTipFilter] = useState("Toate");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedFolder, setSelectedFolder] = useState("toate");
  const editFileRef = useRef();

  useEffect(() => {
    const load = () => {
      setDocumente(documenteStore.getAll());
      setProprietati(proprietatiStore.getAll());
      setClienti(clientiStore.getAll());
    };
    load();
    window.addEventListener("store:documente", load);
    window.addEventListener("store:proprietati", load);
    window.addEventListener("store:clienti", load);
    return () => {
      window.removeEventListener("store:documente", load);
      window.removeEventListener("store:proprietati", load);
      window.removeEventListener("store:clienti", load);
    };
  }, []);

  const refresh = () => {
    setDocumente(documenteStore.getAll());
    setProprietati(proprietatiStore.getAll());
    setClienti(clientiStore.getAll());
  };

  const proprietatiMap = useMemo(() => {
    const map = {};
    proprietati.forEach((p) => { map[p.id] = p; });
    return map;
  }, [proprietati]);

  const clientiMap = useMemo(() => {
    const map = {};
    clienti.forEach((c) => { map[c.id] = c; });
    return map;
  }, [clienti]);

  const foldere = useMemo(() => {
    const folderMap = {};
    documente.forEach((d) => {
      const pid = d.proprietateId;
      const key = pid ? String(pid) : "__none__";
      if (!folderMap[key]) {
        folderMap[key] = {
          id: key,
          proprietateId: pid || null,
          nume: pid && proprietatiMap[pid] ? proprietatiMap[pid].titlu : "Fara folder",
          count: 0,
        };
      }
      folderMap[key].count++;
    });
    return Object.values(folderMap).sort((a, b) => {
      if (a.id === "__none__") return 1;
      if (b.id === "__none__") return -1;
      return a.nume.localeCompare(b.nume);
    });
  }, [documente, proprietatiMap]);

  const documenteFiltrate = useMemo(() => {
    return documente
      .filter((d) => {
        if (selectedFolder === "toate") return true;
        if (selectedFolder === "__none__") return !d.proprietateId;
        return String(d.proprietateId) === selectedFolder;
      })
      .filter((d) => {
        const txt = `${d.nume} ${d.client || ""} ${d.proprietate || ""}`.toLowerCase();
        return txt.includes(search.toLowerCase()) && (tipFilter === "Toate" || d.tip === tipFilter);
      })
      .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [documente, search, tipFilter, selectedFolder]);

  const addDoc = (doc) => { documenteStore.add(doc); refresh(); setShowForm(false); };
  const deleteDoc = (id) => { if (!confirm("Sigur vrei sa stergi acest document?")) return; documenteStore.delete(id); refresh(); };
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
      const url = await uploadToCloudinary(file);
      setEditForm((p) => ({ ...p, fisier: { data: url, name: file.name, size: file.size } }));
    } catch { alert("Eroare la incarcare."); }
  };

  const handleSelectFolder = (folderId) => {
    setSelectedFolder(folderId);
    setSearch("");
    setTipFilter("Toate");
  };

  const stats = { total: documente.length, cuFisier: documente.filter((d) => d.fisier).length };

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "28px 32px" }}>
      <header style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
            <HiOutlineDocumentText size={24} color="var(--primary)" />
            Documente
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{stats.total} documente · {stats.cuFisier} cu fisiere atasate</div>
        </div>
        <button onClick={() => { setShowForm(!showForm); if (editingId) cancelEdit(); }}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "var(--primary)", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <HiOutlinePlus size={16} /> Document nou
        </button>
      </header>

      {showForm && (
        <DocForm onAdd={addDoc} onCancel={() => setShowForm(false)} proprietati={proprietati} clienti={clienti} defaultProprietateId={selectedFolder !== "toate" && selectedFolder !== "__none__" ? Number(selectedFolder) : null} />
      )}

      {editingId && (
        <div style={{ ...card, padding: 20, marginBottom: 16, border: "1px solid var(--primary-border)", background: "var(--bg-secondary)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Editeaza document</div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 10 }}>
            <div style={{ gridColumn: m ? "span 1" : "span 2" }}>
              <label style={labelStyle}>Nume document</label>
              <input style={input} placeholder="Nume document" value={editForm.nume || ""} onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Tip</label>
              <select style={input} value={editForm.tip || "Altul"} onChange={(e) => setEditForm({ ...editForm, tip: e.target.value })}>
                {TIPURI.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Data</label>
              <input style={input} type="date" value={editForm.data || ""} onChange={(e) => setEditForm({ ...editForm, data: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Client</label>
              <select style={input} value={editForm.clientId || ""} onChange={(e) => {
                const val = e.target.value;
                setEditForm({ ...editForm, client: val ? (clientiMap[Number(val)]?.nume || "") : "", clientId: val ? Number(val) : null });
              }}>
                <option value="">—</option>
                {clienti.map((c) => <option key={c.id} value={c.id}>{c.nume}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Proprietate</label>
              <select style={input} value={editForm.proprietateId || ""} onChange={(e) => {
                const val = e.target.value;
                const prop = val ? proprietatiMap[Number(val)] : null;
                setEditForm({ ...editForm, proprietateId: val ? Number(val) : null, proprietate: prop ? prop.titlu : "" });
              }}>
                <option value="">—</option>
                {proprietati.map((p) => <option key={p.id} value={p.id}>{p.titlu}</option>)}
              </select>
            </div>
            <div>
              <input ref={editFileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png,.xls,.xlsx" onChange={handleEditFile} hidden />
              {(() => { const nf = normalizeFisier(editForm.fisier); return nf ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={labelStyle}>Fisier</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border-tertiary)" }}>
                    <HiOutlinePaperClip size={14} color="var(--primary)" />
                    <span style={{ fontSize: 12, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nf.name}</span>
                    <button type="button" onClick={() => setEditForm({ ...editForm, fisier: null })} style={{ border: "none", background: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14 }}>×</button>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={labelStyle}>Fisier</label>
                  <button type="button" onClick={() => editFileRef.current?.click()}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px dashed var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                    Ataseaza fisier
                  </button>
                </div>
              ); })()}
            </div>
            <div style={{ gridColumn: m ? "span 1" : "span 2", display: "flex", gap: 8 }}>
              <button onClick={saveEdit} style={{ flex: 1, border: "none", borderRadius: 10, background: "var(--primary)", color: "#fff", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12 }}>
                <HiOutlineCheck size={14} style={{ marginRight: 4, display: "inline", verticalAlign: "middle" }} /> Salveaza
              </button>
              <button onClick={cancelEdit} style={{ flex: 1, border: "1px solid var(--border-secondary)", borderRadius: 10, background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12 }}>
                Anuleaza
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        {!m && (
          <div style={{ ...card, width: 260, flexShrink: 0, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "0.5px solid var(--border-tertiary)", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Foldere
            </div>
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              <button
                onClick={() => handleSelectFolder("toate")}
                style={{
                  width: "100%", textAlign: "left", border: "none", background: selectedFolder === "toate" ? "var(--primary-light)" : "transparent",
                  padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                  color: selectedFolder === "toate" ? "var(--primary)" : "var(--text-primary)", fontWeight: selectedFolder === "toate" ? 700 : 500,
                  borderLeft: selectedFolder === "toate" ? "3px solid var(--primary)" : "3px solid transparent",
                }}>
                <HiOutlineFolder size={16} />
                <span style={{ flex: 1 }}>Toate documentele</span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--bg-secondary)", padding: "1px 7px", borderRadius: 10 }}>{documente.length}</span>
              </button>
              {foldere.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleSelectFolder(f.id)}
                  style={{
                    width: "100%", textAlign: "left", border: "none", background: selectedFolder === f.id ? "var(--primary-light)" : "transparent",
                    padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13,
                    color: selectedFolder === f.id ? "var(--primary)" : "var(--text-primary)", fontWeight: selectedFolder === f.id ? 600 : 400,
                    borderLeft: selectedFolder === f.id ? "3px solid var(--primary)" : "3px solid transparent",
                  }}>
                  {selectedFolder === f.id ? <HiOutlineFolderOpen size={16} /> : <HiOutlineFolder size={16} />}
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.nume}</span>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--bg-secondary)", padding: "1px 7px", borderRadius: 10 }}>{f.count}</span>
                </button>
              ))}
              {foldere.length === 0 && (
                <div style={{ padding: 20, textAlign: "center", color: "var(--text-tertiary)", fontSize: 12 }}>Niciun folder</div>
              )}
            </div>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {m && (
            <div style={{ marginBottom: 12 }}>
              <select style={input} value={selectedFolder} onChange={(e) => handleSelectFolder(e.target.value)}>
                <option value="toate">Toate documentele ({documente.length})</option>
                {foldere.map((f) => (
                  <option key={f.id} value={f.id}>{f.nume} ({f.count})</option>
                ))}
              </select>
            </div>
          )}

          {selectedFolder !== "toate" && !m && (
            <div style={{ marginBottom: 12, fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
              <HiOutlineFolderOpen size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{foldere.find(f => f.id === selectedFolder)?.nume || ""}</span>
              <span style={{ color: "var(--text-tertiary)" }}>· {documenteFiltrate.length} documente</span>
            </div>
          )}

          <section style={card}>
            <div style={{ padding: "14px 18px", borderBottom: "0.5px solid var(--border-tertiary)", display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 180px", gap: 10 }}>
              <input style={input} placeholder="Cauta dupa nume, client, proprietate..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                    <th style={{ padding: "11px 14px", fontWeight: 600 }}>Data</th>
                    <th style={{ padding: "11px 14px", fontWeight: 600 }}>Fisier</th>
                    <th style={{ padding: "11px 14px", fontWeight: 600 }}>Actiuni</th>
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
                      <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>
                        {d.clientId && clientiMap[d.clientId] ? clientiMap[d.clientId].nume : (d.client || "—")}
                      </td>
                      <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)" }}>
                        {d.proprietateId && proprietatiMap[d.proprietateId] ? proprietatiMap[d.proprietateId].titlu : (d.proprietate || "—")}
                      </td>
                      <td style={{ padding: "13px 14px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{formatDate(d.data)}</td>
                      <td style={{ padding: "13px 14px" }}>
                        {(() => { const nf = normalizeFisier(d.fisier); return nf ? (
                          <a href={nf.data} download={nf.name}
                            style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--primary)", fontSize: 11, fontWeight: 600, textDecoration: "none", padding: "4px 10px", borderRadius: 8, background: "var(--primary-light)" }}>
                            <HiOutlineArrowDownTray size={12} /> {nf.name.length > 16 ? nf.name.slice(0, 14) + "..." : nf.name}
                            {nf.size ? <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginLeft: 2 }}>({formatSize(nf.size)})</span> : null}
                          </a>
                        ) : (
                          <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>—</span>
                        ); })()}
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
                <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
                  {search || tipFilter !== "Toate" ? "Niciun document gasit." : "Nu exista documente. Adauga primul document."}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DocForm({ onAdd, onCancel, proprietati, clienti, defaultProprietateId }) {
  const m = useIsMobile();
  const fileRef = useRef();
  const [form, setForm] = useState({
    nume: "",
    tip: "Contract",
    client: "",
    clientId: null,
    proprietate: "",
    proprietateId: defaultProprietateId || null,
    data: new Date().toISOString().slice(0, 10),
    fisier: null,
  });
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const upd = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (err) setErr(""); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      upd("fisier", { data: url, name: file.name, size: file.size });
    } catch { alert("Eroare la incarcare."); }
    setUploading(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.nume.trim()) { setErr("Completeaza numele documentului."); return; }
    onAdd({
      ...form,
      client: form.client || "",
      proprietate: form.proprietate || "",
      clientId: form.clientId || null,
      proprietateId: form.proprietateId || null,
    });
    setForm({ nume: "", tip: "Contract", client: "", clientId: null, proprietate: "", proprietateId: null, data: new Date().toISOString().slice(0, 10), fisier: null });
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
          <input style={input} placeholder="ex. Contract vanzare - Popescu" value={form.nume} onChange={(e) => upd("nume", e.target.value)} />
        </div>
        <div><label style={labelStyle}>Tip</label><select style={input} value={form.tip} onChange={(e) => upd("tip", e.target.value)}>{TIPURI.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label style={labelStyle}>Data</label><input style={input} type="date" value={form.data} onChange={(e) => upd("data", e.target.value)} /></div>
        <div>
          <label style={labelStyle}>Client</label>
          <select style={input} value={form.clientId || ""} onChange={(e) => {
            const val = e.target.value;
            const cl = val ? clienti.find((c) => String(c.id) === val) : null;
            upd("clientId", val ? Number(val) : null);
            upd("client", cl ? cl.nume : "");
          }}>
            <option value="">—</option>
            {clienti.map((c) => <option key={c.id} value={c.id}>{c.nume}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Proprietate</label>
          <select style={input} value={form.proprietateId || ""} onChange={(e) => {
            const val = e.target.value;
            const prop = val ? proprietati.find((p) => String(p.id) === val) : null;
            upd("proprietateId", val ? Number(val) : null);
            upd("proprietate", prop ? prop.titlu : "");
          }}>
            <option value="">—</option>
            {proprietati.map((p) => <option key={p.id} value={p.id}>{p.titlu}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: m ? "span 1" : "span 2" }}>
          <label style={labelStyle}>Fisier (PDF, DOC, JPG)</label>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png,.xls,.xlsx" onChange={handleFile} hidden />
          {(() => { const nf = normalizeFisier(form.fisier); return nf ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: "var(--bg-secondary)", border: "1px solid var(--border-tertiary)" }}>
              <HiOutlinePaperClip size={14} color="var(--primary)" />
              <span style={{ fontSize: 12, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nf.name}</span>
              <button type="button" onClick={() => upd("fisier", null)} style={{ border: "none", background: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px dashed var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
              {uploading ? "Se incarca..." : "Click pentru a atasa fisier"}
            </button>
          ); })()}
        </div>
        <div style={{ gridColumn: m ? "span 1" : "span 2", display: "flex", gap: 8 }}>
          <button type="submit" style={{ flex: 1, border: "none", borderRadius: 10, background: "var(--primary)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "11px 14px" }}>Adauga document</button>
          <button type="button" onClick={onCancel} style={{ border: "1px solid var(--border-secondary)", borderRadius: 10, background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "11px 14px" }}>Anuleaza</button>
        </div>
      </div>
    </form>
  );
}
