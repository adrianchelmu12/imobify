import { useEffect, useState, useMemo } from "react";
import { proprietatiStore } from "../data/stores";
import {
  HiOutlineHomeModern,
  HiOutlineMapPin,
  HiOutlineTag,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark,
  HiOutlineArrowsRightLeft,
  HiOutlineCube,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

const TIPURI = ["Toate", "Apartament", "Garsonieră", "Casă", "Terenuri", "Spațiu comercial", "Spațiu industrial", "Birouri"];
const TRANZACTII = ["Toate", "Vânzare", "Închiriere"];

const ZONE_CUNOSCUTE = [
  "Alexandru cel Bun", "Aroneanu", "Baza 3", "Bucium", "Bârnova", "Bularga", "Breazu",
  "Canta", "Cârlig", "Centru", "Centru Civic", "Ciurea", "Copou", "Cug", "Dacia", "Dancu",
  "Frumoasa", "Galata", "Gara", "Horpaz", "Holboca", "Lunca Cetățuii", "Lețcani",
  "Metalurgie", "Mircea cel Bătrân", "Miroslava", "Nicolina", "Oancea", "Păcurari",
  "Popas Păcurari", "Podu Roș", "Podul de Fier", "Poitiers", "Păun", "Rediu",
  "Șorogari", "Tătărași", "Tomești", "Tudor Vladimirescu", "Uricani", "Valea Adâncă",
  "Valea Lupului", "Valea Ursului", "Vorovești", "Vișani", "Sărărie",
];

const SORT = [
  { value: "default", label: "Implicite" },
  { value: "pret-asc", label: "Preț crescător" },
  { value: "pret-desc", label: "Preț descrescător" },
  { value: "recente", label: "Cele mai recente" },
];

const statusBadge = {
  disponibil: { text: "Disponibil", bg: "var(--success-light)", color: "var(--success-dark)" },
  vandut: { text: "Vândut", bg: "var(--danger-light)", color: "var(--danger)" },
  inchiriat: { text: "Închiriat", bg: "var(--primary-light)", color: "var(--primary)" },
};

export default function Portofoliu() {
  const [proprietati, setProprietati] = useState([]);
  const [filterTip, setFilterTip] = useState("Toate");
  const [filterTranzactie, setFilterTranzactie] = useState("Toate");
  const [filterZona, setFilterZona] = useState("Toate");
  const [pretMin, setPretMin] = useState("");
  const [pretMax, setPretMax] = useState("");
  const [sort, setSort] = useState("default");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);

  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    setProprietati(proprietatiStore.getAll());
  }, []);

  const disponibile = proprietati.filter((p) => p.status === "disponibil");

  const zone = useMemo(() => {
    const dinDate = new Set(proprietati.map((p) => p.zona || p.oras).filter(Boolean));
    const toate = new Set([...ZONE_CUNOSCUTE, ...dinDate]);
    return ["Toate", ...Array.from(toate).sort()];
  }, [proprietati]);

  useEffect(() => {
    if (disponibile.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(disponibile.length, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [disponibile.length]);

  const proprietatiFiltrate = useMemo(() => {
    let lista = [...proprietati];
    if (filterTip !== "Toate") lista = lista.filter((p) => p.tip === filterTip);
    if (filterTranzactie !== "Toate") lista = lista.filter((p) => p.tranzactie === filterTranzactie);
    if (filterZona !== "Toate") lista = lista.filter((p) => (p.zona || p.oras) === filterZona);
    if (pretMin) lista = lista.filter((p) => (p.pretNumeric || 0) >= Number(pretMin));
    if (pretMax) lista = lista.filter((p) => (p.pretNumeric || 0) <= Number(pretMax));
    if (search.trim()) {
      const q = search.toLowerCase();
      lista = lista.filter((p) => `${p.titlu} ${p.locatie} ${p.tip} ${p.tranzactie} ${p.pret}`.toLowerCase().includes(q));
    }
    switch (sort) {
      case "pret-asc": lista.sort((a, b) => (a.pretNumeric || 0) - (b.pretNumeric || 0)); break;
      case "pret-desc": lista.sort((a, b) => (b.pretNumeric || 0) - (a.pretNumeric || 0)); break;
      case "recente": lista.sort((a, b) => (b.id || 0) - (a.id || 0)); break;
      default: break;
    }
    return lista;
  }, [proprietati, filterTip, filterTranzactie, filterZona, pretMin, pretMax, search, sort]);

  const card = { background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)" };

  const openDetail = (p) => { setSelected(p); setImgIndex(0); document.body.style.overflow = "hidden"; };
  const closeDetail = () => { setSelected(null); document.body.style.overflow = ""; };

  const heroImg = disponibile[heroIndex]?.imagini?.[0] || disponibile[heroIndex]?.imagine || null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-tertiary)", fontFamily: "var(--font-sans)" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideBg {
          0% { transform: scale(1); }
          100% { transform: scale(1.04); }
        }
      `}</style>

      {/* Hero */}
      {disponibile.length > 0 && (
        <section style={{
          position: "relative", height: "55vh", minHeight: 400, display: "flex", alignItems: "flex-end",
          overflow: "hidden", background: "var(--bg-secondary)",
        }}>
          {heroImg && (
            <>
              <div style={{
                position: "absolute", inset: 0, backgroundImage: `url(${heroImg})`,
                backgroundSize: "cover", backgroundPosition: "center",
                animation: "slideBg 12s ease-out forwards alternate",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.6) 100%)",
              }} />
            </>
          )}
          <div style={{ position: "relative", zIndex: 1, padding: "0 40px 50px", maxWidth: 800, animation: "fadeUp 0.8s ease-out" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 12 }}>
              Portofoliu
            </div>
            <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: 12 }}>
              {disponibile.length} proprietăți disponibile
            </div>
            <div style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 480 }}>
              Descoperă ofertele active — apartamente, case, terenuri și spații comerciale.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              {disponibile.slice(0, 5).map((p, i) => (
                <button key={p.id} onClick={() => { setHeroIndex(i); openDetail(p); }}
                  style={{
                    width: heroIndex === i ? 32 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
                    background: heroIndex === i ? "var(--primary)" : "var(--border-secondary)",
                    transition: "all 0.4s ease",
                  }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Header */}
      <div style={{ padding: "28px 32px 0", maxWidth: 1400 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10, letterSpacing: "-0.02em" }}>
              <HiOutlineHomeModern size={26} color="var(--primary)" />
              Portofoliu
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {proprietati.length} proprietăți · {disponibile.length} disponibile
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total", value: proprietati.length },
            { label: "Disponibile", value: disponibile.length },
            { label: "Vânzare", value: proprietati.filter((p) => p.tranzactie === "Vânzare").length },
            { label: "Închiriere", value: proprietati.filter((p) => p.tranzactie === "Închiriere").length },
          ].map(({ label, value }) => (
            <div key={label} style={{ ...card, padding: "16px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 12, padding: "9px 14px", flex: 1, minWidth: 200, maxWidth: 320 }}>
            <HiOutlineMagnifyingGlass size={16} color="var(--text-tertiary)" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută proprietăți..."
              style={{ border: "none", background: "transparent", color: "var(--text-primary)", fontSize: 13, outline: "none", width: "100%", fontFamily: "var(--font-sans)" }} />
          </div>
          <select value={filterTip} onChange={(e) => setFilterTip(e.target.value)}
            style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 12, padding: "9px 14px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer", outline: "none", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-xs)" }}>
            {TIPURI.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filterTranzactie} onChange={(e) => setFilterTranzactie(e.target.value)}
            style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 12, padding: "9px 14px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer", outline: "none", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-xs)" }}>
            {TRANZACTII.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filterZona} onChange={(e) => setFilterZona(e.target.value)}
            style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 12, padding: "9px 14px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer", outline: "none", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-xs)" }}>
            {zone.map((z) => <option key={z} value={z}>{z === "Toate" ? "Toate zonele" : z}</option>)}
          </select>
          <input type="number" placeholder="Preț min €" value={pretMin} onChange={(e) => setPretMin(e.target.value)}
            style={{ width: 110, background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 12, padding: "9px 14px", color: "var(--text-primary)", fontSize: 12, outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }} />
          <input type="number" placeholder="Preț max €" value={pretMax} onChange={(e) => setPretMax(e.target.value)}
            style={{ width: 110, background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 12, padding: "9px 14px", color: "var(--text-primary)", fontSize: 12, outline: "none", fontFamily: "var(--font-sans)", boxSizing: "border-box" }} />
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 12, padding: "9px 14px", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer", outline: "none", fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-xs)" }}>
            {SORT.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{
        padding: "0 32px 60px", display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18,
      }}>
        {proprietatiFiltrate.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: 60, textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-tertiary)", marginBottom: 6 }}>Nicio proprietate găsită</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Încearcă alte filtre sau adaugă proprietăți noi.</div>
          </div>
        ) : (
          proprietatiFiltrate.map((p, i) => {
            const st = statusBadge[p.status] || statusBadge.disponibil;
            return (
              <div key={p.id} onClick={() => openDetail(p)}
                style={{
                  ...card, overflow: "hidden", cursor: "pointer",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
              >
                <div style={{ position: "relative", height: 220, overflow: "hidden", background: "var(--bg-secondary)" }}>
                  <img src={p.imagini?.[0] || p.imagine || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"}
                    alt={p.titlu}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                  />
                  <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                    <span style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 8 }}>
                      {p.tranzactie}
                    </span>
                    <span style={{ background: st.bg, backdropFilter: "blur(4px)", color: st.color, fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 8 }}>
                      {st.text}
                    </span>
                  </div>
                  <div style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                      {p.pret}
                    </div>
                  </div>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.3 }}>
                    {p.titlu}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <HiOutlineMapPin size={14} color="var(--text-tertiary)" />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.locatie}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {p.camere && <span style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: 8 }}>{p.camere} camere</span>}
                    {p.suprafata && <span style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: 8 }}>{p.suprafata} m²</span>}
                    {p.bai && <span style={{ fontSize: 11, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "4px 10px", borderRadius: 8 }}>{p.bai} băi</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000, background: "var(--bg-tertiary)",
          overflowY: "auto", animation: "fadeIn 0.3s ease",
        }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

          {/* Close bar */}
          <div style={{
            position: "sticky", top: 0, zIndex: 10, padding: "12px 24px",
            background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)",
            borderBottom: "0.5px solid var(--border-tertiary)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {selected.titlu}
            </div>
            <button onClick={closeDetail}
              style={{ border: "none", background: "var(--bg-secondary)", color: "var(--text-secondary)", width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12 }}>
              <HiOutlineXMark size={18} />
            </button>
          </div>

          {/* Image Gallery */}
          <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
            {selected.imagini?.length > 0 ? (
              <>
                <div style={{
                  position: "relative", borderRadius: 20, overflow: "hidden",
                  height: 450, background: "var(--bg-secondary)", marginBottom: 16,
                  boxShadow: "var(--shadow-lg)",
                }}>
                  <img src={selected.imagini[imgIndex]}
                    alt={`${selected.titlu} — imaginea ${imgIndex + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {selected.imagini.length > 1 && (
                    <>
                      <button onClick={() => setImgIndex((p) => (p - 1 + selected.imagini.length) % selected.imagini.length)}
                        style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                          border: "none", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff",
                          width: 42, height: 42, borderRadius: "50%", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ‹
                      </button>
                      <button onClick={() => setImgIndex((p) => (p + 1) % selected.imagini.length)}
                        style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                          border: "none", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff",
                          width: 42, height: 42, borderRadius: "50%", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ›
                      </button>
                    </>
                  )}
                </div>
                {/* Thumbnails */}
                <div style={{ display: "flex", gap: 8, marginBottom: 28, overflowX: "auto", paddingBottom: 4 }}>
                  {selected.imagini.map((img, i) => (
                    <div key={i} onClick={() => setImgIndex(i)}
                      style={{
                        width: 80, height: 60, borderRadius: 10, overflow: "hidden", cursor: "pointer", flexShrink: 0,
                        border: i === imgIndex ? "2px solid var(--primary)" : "2px solid transparent",
                        opacity: i === imgIndex ? 1 : 0.5, transition: "all 0.2s",
                      }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{
                height: 250, borderRadius: 20, background: "var(--bg-secondary)", marginBottom: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "var(--shadow-lg)",
              }}>
                <div style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
                  <HiOutlineHomeModern size={40} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 14 }}>Fără imagini disponibile</div>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              {/* Left - Details */}
              <div>
                <div style={{ ...card, padding: 24, marginBottom: 16 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.01em" }}>
                    {selected.titlu}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <HiOutlineMapPin size={16} color="var(--text-tertiary)" />
                    <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {[selected.strada, selected.numar, selected.zona, selected.oras, selected.judet].filter(Boolean).join(", ") || selected.locatie}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {selected.descriere || "Descriere indisponibilă."}
                  </div>
                </div>

                {/* Dotari */}
                {selected.dotari?.length > 0 && (
                  <div style={{ ...card, padding: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <HiOutlineCheckCircle size={16} color="var(--success)" /> Dotări & facilități
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {selected.dotari.map((d, i) => (
                        <span key={i} style={{
                          fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-secondary)",
                          padding: "6px 12px", borderRadius: 8, border: "0.5px solid var(--border-tertiary)",
                        }}>{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right - Price card */}
              <div>
                <div style={{ ...card, padding: 24, marginBottom: 16, position: "sticky", top: 80 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Preț</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--primary)", letterSpacing: "-0.02em" }}>{selected.pret}</div>
                    {selected.negociabil && <div style={{ fontSize: 12, color: "var(--success)", marginTop: 4 }}>Preț negociabil</div>}
                  </div>
                  <div style={{ borderTop: "0.5px solid var(--border-tertiary)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Tip", icon: HiOutlineTag, value: selected.tip },
                      { label: "Tranzacție", icon: HiOutlineArrowsRightLeft, value: selected.tranzactie },
                      { label: "Status", icon: HiOutlineCheckCircle, value: (statusBadge[selected.status] || statusBadge.disponibil).text },
                      selected.camere && { label: "Camere", icon: HiOutlineCube, value: selected.camere },
                      selected.bai && { label: "Băi", icon: HiOutlineCube, value: selected.bai },
                      selected.suprafata && { label: "Suprafață", icon: HiOutlineHomeModern, value: `${selected.suprafata} m²` },
                      selected.an && selected.an !== "—" && { label: "An construcție", icon: HiOutlineCalendarDays, value: selected.an },
                    ].filter(Boolean).map(({ label, icon: Icon, value }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Icon size={16} color="var(--text-tertiary)" />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
