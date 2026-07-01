import { useEffect, useState, useMemo, useRef } from "react";
import { proiecteStore } from "../data/stores";
import {
  HiOutlineBuildingOffice2,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineCheck,
  HiOutlineMapPin,
  HiOutlineArrowDownTray,
  HiOutlinePaperClip,
  HiOutlineHomeModern,
} from "react-icons/hi2";

const STADII = [
  { value: "planned", label: "În planificare", color: "var(--text-tertiary)", bg: "var(--bg-secondary)" },
  { value: "construction", label: "În construcție", color: "var(--warning-dark)", bg: "var(--warning-light)" },
  { value: "completed", label: "Finalizat", color: "var(--success-dark)", bg: "var(--success-light)" },
  { value: "delivered", label: "Predat", color: "var(--primary)", bg: "var(--primary-light)" },
];

const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const input = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };
const labelStyle = { display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.3px" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

import { uploadToCloudinary } from "../utils/cloudinary.js";

function ProiectForm({ onAdd, onCancel }) {
  const m = useIsMobile();
  const fileRef = useRef();
  const [form, setForm] = useState({
    nume: "", zona: "", descriere: "", totalUnitati: "", disponibile: "",
    stadii: "planned", pretDeLa: "", pretPanaLa: "",
    dotari: "", imagine: null, document: null,
  });
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  const upd = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (err) setErr(""); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.nume.trim()) { setErr("Numele proiectului este obligatoriu."); return; }
    if (!form.zona.trim()) { setErr("Zona este obligatorie."); return; }
    onAdd({
      ...form,
      totalUnitati: Number(form.totalUnitati) || 0,
      disponibile: Number(form.disponibile) || 0,
      pretDeLa: Number(form.pretDeLa) || 0,
      pretPanaLa: Number(form.pretPanaLa) || 0,
      dotari: form.dotari || "",
    });
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const r = await uploadToCloudinary(file); upd("imagine", r); } catch { alert("Eroare upload."); }
    setUploading(false);
  };

  const handleDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const r = await uploadToCloudinary(file); upd("document", r); } catch { alert("Eroare upload."); }
    setUploading(false);
  };

  return (
    <form onSubmit={submit} style={{ ...card, padding: 24, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
          <HiOutlinePlus size={16} color="var(--primary)" /> Proiect nou
        </div>
        <button type="button" onClick={onCancel} style={{ border: "none", background: "var(--bg-secondary)", color: "var(--text-secondary)", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <HiOutlineXMark size={15} />
        </button>
      </div>
      {err && <div style={{ marginBottom: 12, padding: "8px 10px", borderRadius: 8, background: "var(--danger-light)", color: "var(--danger)", fontSize: 12 }}>{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: m ? "span 1" : "span 2" }}>
          <label style={labelStyle}>Nume proiect *</label>
          <input style={input} placeholder="ex. Ansamblul Rezidențial Green Park" value={form.nume} onChange={(e) => upd("nume", e.target.value)} />
        </div>
        <div><label style={labelStyle}>Zonă *</label><input style={input} placeholder="ex. Copou" value={form.zona} onChange={(e) => upd("zona", e.target.value)} /></div>
        <div><label style={labelStyle}>Stadiu</label><select style={input} value={form.stadii} onChange={(e) => upd("stadii", e.target.value)}>{STADII.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
        <div><label style={labelStyle}>Total unități</label><input style={input} type="number" placeholder="120" value={form.totalUnitati} onChange={(e) => upd("totalUnitati", e.target.value)} /></div>
        <div><label style={labelStyle}>Disponibile</label><input style={input} type="number" placeholder="45" value={form.disponibile} onChange={(e) => upd("disponibile", e.target.value)} /></div>
        <div><label style={labelStyle}>Preț de la (€)</label><input style={input} type="number" placeholder="65.000" value={form.pretDeLa} onChange={(e) => upd("pretDeLa", e.target.value)} /></div>
        <div><label style={labelStyle}>Preț până la (€)</label><input style={input} type="number" placeholder="120.000" value={form.pretPanaLa} onChange={(e) => upd("pretPanaLa", e.target.value)} /></div>
        <div>
          <label style={labelStyle}>Imagine principală</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} hidden />
          {form.imagine ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "var(--bg-secondary)", border: "1px solid var(--border-tertiary)" }}>
              <span style={{ fontSize: 12, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.imagine.name}</span>
              <button type="button" onClick={() => upd("imagine", null)} style={{ border: "none", background: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px dashed var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
              {uploading ? "Se încarcă..." : "Click pentru imagine"}
            </button>
          )}
        </div>
        <div>
          <label style={labelStyle}>Document (PDF, broșură)</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleDoc} hidden id="doc-upload" />
          {form.document ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "var(--bg-secondary)", border: "1px solid var(--border-tertiary)" }}>
              <HiOutlinePaperClip size={14} color="var(--primary)" />
              <span style={{ fontSize: 12, color: "var(--text-primary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.document.name}</span>
              <button type="button" onClick={() => upd("document", null)} style={{ border: "none", background: "none", color: "var(--text-tertiary)", cursor: "pointer", fontSize: 14 }}>×</button>
            </div>
          ) : (
            <label htmlFor="doc-upload" style={{ display: "block", width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px dashed var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer", fontWeight: 500, textAlign: "center", boxSizing: "border-box" }}>
              {uploading ? "Se încarcă..." : "Click pentru broșură"}
            </label>
          )}
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Dotări & facilități</label>
          <input style={input} placeholder="ex. Loc de joacă, parcare subterană, fitness, grădină" value={form.dotari} onChange={(e) => upd("dotari", e.target.value)} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Descriere</label>
          <textarea style={{ ...input, resize: "vertical", minHeight: 80 }} placeholder="Descrie proiectul..." value={form.descriere} onChange={(e) => upd("descriere", e.target.value)} />
        </div>
        <button type="submit" style={{ gridColumn: "span 2", border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13, padding: "12px 14px", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
          Adaugă proiect
        </button>
      </div>
    </form>
  );
}

export default function Proiecte() {
  const m = useIsMobile();
  const [proiecte, setProiecte] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const editImgRef = useRef();
  const editDocRef = useRef();

  useEffect(() => { setProiecte(proiecteStore.getAll()); }, []);

  const refresh = () => setProiecte(proiecteStore.getAll());

  const addProiect = (p) => { proiecteStore.add(p); refresh(); setShowForm(false); };
  const deleteProiect = (id) => { if (!confirm("Ștergi acest proiect?")) return; proiecteStore.delete(id); refresh(); };
  const startEdit = (p) => { setEditingId(p.id); setEditForm({ ...p }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };
  const saveEdit = () => {
    if (!editForm.nume.trim()) return;
    proiecteStore.update(editingId, { ...editForm, totalUnitati: Number(editForm.totalUnitati) || 0, disponibile: Number(editForm.disponibile) || 0, pretDeLa: Number(editForm.pretDeLa) || 0, pretPanaLa: Number(editForm.pretPanaLa) || 0 });
    refresh();
    cancelEdit();
  };

  const handleEditImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const r = await uploadToCloudinary(file); setEditForm((p) => ({ ...p, imagine: r })); } catch { alert("Eroare."); }
  };
  const handleEditDoc = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const r = await uploadToCloudinary(file); setEditForm((p) => ({ ...p, document: r })); } catch { alert("Eroare."); }
  };

  const stats = {
    total: proiecte.length,
    inLucru: proiecte.filter((p) => p.stadii === "construction").length,
    finalizate: proiecte.filter((p) => p.stadii === "completed" || p.stadii === "delivered").length,
    totalUnitati: proiecte.reduce((sum, p) => sum + (Number(p.totalUnitati) || 0), 0),
    totaleDisponibile: proiecte.reduce((sum, p) => sum + (Number(p.disponibile) || 0), 0),
  };

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "28px 32px", minHeight: "100vh", background: "var(--bg-tertiary)" }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
            <HiOutlineBuildingOffice2 size={26} color="var(--primary)" />
            Proiecte Rezidențiale
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {stats.total} proiecte · {stats.totalUnitati} unități · {stats.totaleDisponibile} disponibile
          </div>
        </div>
        {!showForm && !editingId && (
          <button onClick={() => setShowForm(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", padding: "10px 22px", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}>
            <HiOutlinePlus size={16} /> Proiect nou
          </button>
        )}
      </div>

      {/* Stats */}
      <section style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total proiecte", value: stats.total },
          { label: "În construcție", value: stats.inLucru },
          { label: "Finalizate", value: stats.finalizate },
          { label: "Total unități", value: stats.totalUnitati },
          { label: "Disponibile", value: stats.totaleDisponibile },
        ].map(({ label, value }) => (
          <div key={label} style={{ ...card, padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</div>
          </div>
        ))}
      </section>

      {/* Form */}
      {showForm && <ProiectForm onAdd={addProiect} onCancel={() => setShowForm(false)} />}

      {/* Edit form */}
      {editingId && (
        <div style={{ ...card, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Editează proiect</div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 10 }}>
            <div style={{ gridColumn: m ? "span 1" : "span 2" }}><input style={input} placeholder="Nume" value={editForm.nume || ""} onChange={(e) => setEditForm({ ...editForm, nume: e.target.value })} /></div>
            <input style={input} placeholder="Zonă" value={editForm.zona || ""} onChange={(e) => setEditForm({ ...editForm, zona: e.target.value })} />
            <select style={input} value={editForm.stadii || "planned"} onChange={(e) => setEditForm({ ...editForm, stadii: e.target.value })}>{STADII.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
            <input style={input} type="number" placeholder="Total unități" value={editForm.totalUnitati || ""} onChange={(e) => setEditForm({ ...editForm, totalUnitati: e.target.value })} />
            <input style={input} type="number" placeholder="Disponibile" value={editForm.disponibile || ""} onChange={(e) => setEditForm({ ...editForm, disponibile: e.target.value })} />
            <input style={input} type="number" placeholder="Preț de la €" value={editForm.pretDeLa || ""} onChange={(e) => setEditForm({ ...editForm, pretDeLa: e.target.value })} />
            <input style={input} type="number" placeholder="Preț până la €" value={editForm.pretPanaLa || ""} onChange={(e) => setEditForm({ ...editForm, pretPanaLa: e.target.value })} />
            <div style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={saveEdit} style={{ flex: 1, border: "none", borderRadius: 12, background: "linear-gradient(135deg, var(--primary), var(--accent))", color: "#fff", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 14px rgba(99,102,241,0.3)" }}><HiOutlineCheck size={14} style={{ marginRight: 4 }} /> Salvează</button>
                <button type="button" onClick={cancelEdit} style={{ flex: 1, border: "1px solid var(--border-secondary)", borderRadius: 10, background: "var(--bg-primary)", color: "var(--text-secondary)", fontWeight: 700, cursor: "pointer", padding: "10px 14px", fontSize: 12 }}>Anulează</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 18 }}>
        {proiecte.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: 60, textAlign: "center", ...card }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 6 }}>Niciun proiect adăugat</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Adaugă primul proiect rezidențial din portofoliu.</div>
          </div>
        ) : (
          proiecte.map((p) => {
            const st = STADII.find((s) => s.value === p.stadii) || STADII[0];
            return (
              <div key={p.id}
                onClick={() => setSelected(selected?.id === p.id ? null : p)}
                style={{
                  ...card, overflow: "hidden", cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  border: selected?.id === p.id ? "1px solid var(--primary-border)" : "0.5px solid var(--border-tertiary)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
              >
                <div style={{ height: 200, background: "var(--bg-secondary)", position: "relative", overflow: "hidden" }}>
                  {p.imagine ? (
                    <img src={p.imagine.data} alt={p.nume} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-tertiary)" }}>
                      <HiOutlineBuildingOffice2 size={40} />
                    </div>
                  )}
                  <div style={{ position: "absolute", top: 12, left: 12 }}>
                    <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 8 }}>
                      {st.label}
                    </span>
                  </div>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>{p.nume}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <HiOutlineMapPin size={14} color="var(--text-tertiary)" />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.zona}</span>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                    {Number(p.totalUnitati) > 0 && <span style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: 8 }}>{p.totalUnitati} unități</span>}
                    {Number(p.disponibile) > 0 && <span style={{ fontSize: 11, color: "var(--success-dark)", background: "var(--success-light)", padding: "4px 10px", borderRadius: 8 }}>{p.disponibile} disponibile</span>}
                    {(Number(p.pretDeLa) > 0 || Number(p.pretPanaLa) > 0) && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)", background: "var(--primary-light)", padding: "4px 10px", borderRadius: 8 }}>
                        {Number(p.pretDeLa) > 0 ? `${Number(p.pretDeLa).toLocaleString("ro-RO")} €` : ""}
                        {Number(p.pretDeLa) > 0 && Number(p.pretPanaLa) > 0 ? " — " : ""}
                        {Number(p.pretPanaLa) > 0 ? `${Number(p.pretPanaLa).toLocaleString("ro-RO")} €` : ""}
                      </span>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {selected?.id === p.id && (
                    <div style={{ borderTop: "0.5px solid var(--border-tertiary)", paddingTop: 14, marginBottom: 4, animation: "fadeIn 0.25s ease" }}>
                      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
                      {p.descriere && <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>{p.descriere}</div>}
                      {p.dotari && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", marginBottom: 6, textTransform: "uppercase" }}>Dotări</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {p.dotari.split(",").map((d, i) => (
                              <span key={i} style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: 8, border: "0.5px solid var(--border-tertiary)" }}>{d.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {p.document && (
                        <a href={p.document.data} download={p.document.name}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--primary)", fontSize: 12, fontWeight: 600, textDecoration: "none", padding: "6px 12px", borderRadius: 8, background: "var(--primary-light)", marginBottom: 12 }}>
                          <HiOutlineArrowDownTray size={13} /> {p.document.name}
                        </a>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={(e) => { e.stopPropagation(); startEdit(p); }}
                      style={{ flex: 1, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-secondary)", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <HiOutlinePencil size={13} /> Editează
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteProiect(p.id); }}
                      style={{ flex: 1, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--danger)", borderRadius: 8, padding: "7px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <HiOutlineTrash size={13} /> Șterge
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
