import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { proprietatiStore } from "../data/stores";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const IASI_CENTER = [47.1585, 27.6014];

const statusColors = {
  disponibil: "#10b981",
  vandut: "#ef4444",
  inchiriat: "#f59e0b",
  rezervat: "#6366f1",
  oferta: "#6366f1",
};

const statusLabels = {
  disponibil: "Disponibil",
  vandut: "Vândut",
  inchiriat: "Închiriat",
  rezervat: "Rezervat",
  oferta: "Ofertă",
};

function createColoredIcon(color) {
  return new L.DivIcon({
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;">📍</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

function MapClickHandler({ onClick }) {
  useMapEvents({ click(e) { onClick(e.latlng); } });
  return null;
}

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, map.getZoom()); }, [center, map]);
  return null;
}

const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

export default function Harta() {
  const m = useIsMobile();
  const [proprietati, setProprietati] = useState([]);
  const [filter, setFilter] = useState("toate");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [pinMode, setPinMode] = useState(false);
  const [flyTo, setFlyTo] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => { setProprietati(proprietatiStore.getAll()); }, []);

  const refresh = () => setProprietati(proprietatiStore.getAll());

  const cuCoordonate = proprietati.filter((p) => p.lat && p.lng);
  const faraCoordonate = proprietati.filter((p) => !p.lat || !p.lng);

  const filtrate = proprietati.filter((p) => {
    const matchSearch = !search || `${p.titlu || ""} ${p.adresa || ""} ${p.tip || ""} ${p.zona || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "toate" || p.status === filter;
    return matchSearch && matchStatus;
  });

  const filtrateCuCoordonate = cuCoordonate.filter((p) => {
    const matchSearch = !search || `${p.titlu || ""} ${p.adresa || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "toate" || p.status === filter;
    return matchSearch && matchStatus;
  });

  const center = filtrateCuCoordonate.length > 0
    ? [Number(filtrateCuCoordonate[0].lat), Number(filtrateCuCoordonate[0].lng)]
    : IASI_CENTER;

  const selectedProp = selectedId ? proprietati.find((p) => String(p.id) === String(selectedId)) : null;

  const handleMapClick = (latlng) => {
    if (!pinMode || !selectedId) return;
    proprietatiStore.update(selectedId, { lat: String(latlng.lat), lng: String(latlng.lng) });
    refresh();
    setPinMode(false);
  };

  const selecteazaProp = (id) => {
    setSelectedId(id);
    const prop = proprietati.find((p) => String(p.id) === String(id));
    if (prop?.lat && prop?.lng) {
      setFlyTo([Number(prop.lat), Number(prop.lng)]);
      setPinMode(false);
    } else {
      setPinMode(true);
      setFlyTo(IASI_CENTER);
    }
  };

  const stergeCoordonate = (id) => {
    if (!confirm("Ștergi coordonatele acestei proprietăți?")) return;
    proprietatiStore.update(id, { lat: null, lng: null });
    refresh();
    if (String(selectedId) === String(id)) { setSelectedId(null); setPinMode(false); }
  };

  const stats = { cuHarta: cuCoordonate.length, total: proprietati.length, faraHarta: faraCoordonate.length };

  return (
    <div style={{ padding: m ? "14px" : "28px 32px" }}>
      <header style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>Hartă proprietăți</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {stats.cuHarta} pe hartă din {stats.total} · {stats.faraHarta} fără coordonate
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { key: "toate", label: "Toate" },
            { key: "disponibil", label: "Disponibile" },
            { key: "vandut", label: "Vândute" },
            { key: "inchiriat", label: "Închiriate" },
            { key: "rezervat", label: "Rezervate" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: filter === f.key ? "none" : "1px solid var(--border-secondary)",
                background: filter === f.key ? "var(--primary)" : "var(--bg-primary)",
                color: filter === f.key ? "#fff" : "var(--text-secondary)",
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {pinMode && selectedProp && (
        <div style={{ marginBottom: 12, padding: "10px 16px", borderRadius: 10, background: "var(--warning-light)", color: "var(--warning-dark)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>📍 Dă click pe hartă pentru a seta coordonatele pentru: <strong>{selectedProp.titlu || selectedProp.adresa || `ID: ${selectedProp.id}`}</strong></span>
          <button onClick={() => setPinMode(false)} style={{ border: "none", background: "none", color: "var(--warning-dark)", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>×</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 320px", gap: 14, alignItems: "start" }}>
        <div style={{ ...mapCard, height: m ? 400 : 560, overflow: "hidden", cursor: pinMode ? "crosshair" : "default" }}>
          <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true} ref={mapRef}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onClick={handleMapClick} />
            {flyTo && <FlyTo center={flyTo} />}
            {filtrateCuCoordonate.map((p) => (
              <Marker
                key={p.id}
                position={[Number(p.lat), Number(p.lng)]}
                icon={createColoredIcon(statusColors[p.status] || statusColors.disponibil)}
              >
                <Popup>
                  <div style={{ fontFamily: "var(--font-sans)", minWidth: 180 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                      {p.titlu || p.adresa || "Proprietate"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                      {p.tip} {p.categorie || ""} {p.suprafata ? `· ${p.suprafata}m²` : ""}
                    </div>
                    {p.pret && (
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>
                        {Number(p.pret).toLocaleString("ro-RO")} €
                      </div>
                    )}
                    <div style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                      background: statusColors[p.status] ? `${statusColors[p.status]}20` : "var(--bg-secondary)",
                      color: statusColors[p.status] || "var(--text-secondary)" }}>
                      {statusLabels[p.status] || p.status || "—"}
                    </div>
                    {p.adresa && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>{p.adresa}</div>}
                    <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
                      {Number(p.lat).toFixed(6)}, {Number(p.lng).toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "0.5px solid var(--border-tertiary)" }}>
            <input style={input} placeholder="Caută proprietate..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ maxHeight: m ? 340 : 500, overflowY: "auto" }}>
            {filtrate.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nicio proprietate găsită.</div>
            ) : (
              filtrate.map((p) => {
                const areCoordonate = p.lat && p.lng;
                const isSelected = String(selectedId) === String(p.id);
                return (
                  <div key={p.id}
                    onClick={() => selecteazaProp(p.id)}
                    style={{
                      padding: "12px 14px", cursor: "pointer", borderBottom: "0.5px solid var(--border-tertiary)",
                      background: isSelected ? "var(--primary-light)" : "transparent",
                      transition: "background 0.15s",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.titlu || p.adresa || `Proprietate #${p.id}`}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                          {p.tip || "—"} {p.categorie ? `· ${p.categorie}` : ""} {p.suprafata ? `· ${p.suprafata}m²` : ""}
                        </div>
                        {p.pret && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginTop: 3 }}>{Number(p.pret).toLocaleString("ro-RO")} €</div>}
                        {p.adresa && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.adresa}</div>}
                      </div>
                      <span style={{
                        flexShrink: 0, fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6,
                        background: areCoordonate ? "var(--success-light)" : "var(--bg-secondary)",
                        color: areCoordonate ? "var(--success-dark)" : "var(--text-tertiary)",
                      }}>
                        {areCoordonate ? "📍 pe hartă" : "fără coordonate"}
                      </span>
                    </div>
                    {areCoordonate && (
                      <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 10, color: "var(--text-tertiary)", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: 4 }}>
                          {Number(p.lat).toFixed(4)}, {Number(p.lng).toFixed(4)}
                        </span>
                        {isSelected && (
                          <button onClick={(e) => { e.stopPropagation(); stergeCoordonate(p.id); }}
                            style={{ border: "none", background: "var(--danger-light)", color: "var(--danger)", borderRadius: 4, padding: "2px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
                            Șterge
                          </button>
                        )}
                      </div>
                    )}
                    {isSelected && !areCoordonate && pinMode && (
                      <div style={{ marginTop: 6, fontSize: 11, color: "var(--warning-dark)", fontWeight: 600 }}>
                        👆 Click pe hartă pentru a plasa pinul
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ padding: "10px 14px", borderTop: "0.5px solid var(--border-tertiary)", fontSize: 11, color: "var(--text-tertiary)" }}>
            {filtrate.length} proprietăți · {filtrate.filter((p) => p.lat && p.lng).length} pe hartă
          </div>
        </div>
      </div>
    </div>
  );
}

const mapCard = { background: "var(--bg-primary)", border: "0.5px solid var(--border-tertiary)", borderRadius: 14, overflow: "hidden" };
