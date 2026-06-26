import { useEffect, useState, useCallback } from "react";
import { Responsive as ResponsiveGridLayout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { proprietatiStore, clientiStore, programariStore } from "../data/stores";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";
import {
  HiOutlineHomeModern,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineUserGroup,
  HiOutlineMapPin,
  HiOutlineEllipsisHorizontal,
} from "react-icons/hi2";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#ef4444", "#ec4899"];

const card = {
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: "var(--radius-xl)",
  boxShadow: "var(--shadow-card)",
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
        {payload.filter(e => e.value != null && e.value !== 0).map((entry, i) => (
          <p key={i} style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>
            {typeof entry.value === "number" ? entry.value.toLocaleString("ro-RO") : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function WidgetHeader({ title, subtitle }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <HiOutlineEllipsisHorizontal size={16} color="var(--text-tertiary)" className="drag-handle" style={{ cursor: "grab", marginTop: 3 }} />
    </div>
  );
}

const DEFAULT_LAYOUT = {
  lg: [
    { i: "statistici", x: 0, y: 0, w: 12, h: 3, minH: 3, maxH: 4 },
    { i: "tip", x: 0, y: 3, w: 6, h: 5, minH: 4 },
    { i: "tranzactii", x: 6, y: 3, w: 6, h: 5, minH: 4 },
    { i: "categorii", x: 0, y: 8, w: 12, h: 6, minH: 4 },
    { i: "recente", x: 0, y: 14, w: 6, h: 6, minH: 4 },
    { i: "clienti", x: 6, y: 14, w: 6, h: 6, minH: 4 },
  ],
};

function loadLayout() {
  try {
    const saved = localStorage.getItem("imob-dashboard-layout");
    return saved ? JSON.parse(saved) : DEFAULT_LAYOUT;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export default function PrezentareGenerala() {
  const [proprietati, setProprietati] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [programari, setProgramari] = useState([]);
  const [layout, setLayout] = useState(loadLayout);

  useEffect(() => {
    setProprietati(proprietatiStore.getAll());
    setClienti(clientiStore.getAll());
    setProgramari(programariStore.getAll());
  }, []);

  const onLayoutChange = useCallback((newLayout) => {
    const merged = { ...layout, lg: newLayout };
    setLayout(merged);
    localStorage.setItem("imob-dashboard-layout", JSON.stringify(merged));
  }, [layout]);

  const azi = new Date().toISOString().slice(0, 10);
  const programariAzi = programari.filter((p) => p.data === azi).length;
  const total = proprietati.length;
  const disponibile = proprietati.filter((p) => p.status === "disponibil").length;
  const vandute = proprietati.filter((p) => p.status === "vandut" || p.status === "inchiriat").length;
  const vanzare = proprietati.filter((p) => p.tranzactie === "Vânzare").length;
  const inchiriere = proprietati.filter((p) => p.tranzactie === "Închiriere").length;
  const apartamente = proprietati.filter((p) => p.tip === "Apartament" || p.tip === "Garsonieră").length;
  const caseTeren = proprietati.filter((p) => p.tip === "Casă").length;
  const terenuri = proprietati.filter((p) => p.tip === "Terenuri").length;
  const spatii = proprietati.filter((p) => p.tip === "Spațiu comercial" || p.tip === "Spațiu industrial" || p.tip === "Birouri").length;
  const percentVandute = total > 0 ? Math.round((vandute / total) * 100) : 0;

  const tipData = [
    { name: "Apartamente", value: apartamente },
    { name: "Case", value: caseTeren },
    { name: "Terenuri", value: terenuri },
    { name: "Spații", value: spatii },
  ].filter(d => d.value > 0);

  const tranzactieData = [
    { name: "Vânzare", value: vanzare },
    { name: "Închiriere", value: inchiriere },
  ].filter(d => d.value > 0);

  const tipBarData = [
    { name: "Apart.", Apartamente: apartamente },
    { name: "Case", Case: caseTeren },
    { name: "Terenuri", Terenuri: terenuri },
    { name: "Spații", Spații: spatii },
  ];

  const statCards = [
    { label: "Total proprietăți", value: total, subtitle: `${disponibile} disponibile`, icon: HiOutlineHomeModern, bg: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
    { label: "Disponibile", value: disponibile, subtitle: "Gata de vânzare", icon: HiOutlineCheckCircle, bg: "linear-gradient(135deg, #10b981, #34d399)" },
    { label: "Vândute / Închiriate", value: vandute, subtitle: `${percentVandute}% rată conversie`, icon: HiOutlineXCircle, bg: "linear-gradient(135deg, #ef4444, #f87171)" },
    { label: "Programări azi", value: programariAzi, subtitle: "Vizionări programate", icon: HiOutlineCalendarDays, bg: "linear-gradient(135deg, #06b6d4, #22d3ee)" },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: 1500 }}>
      <header style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 14,
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
        }}>
          <HiOutlineHomeModern size={20} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>Prezentare generală</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--success)" }} />
              {total} proprietăți
            </span>
            <span style={{ color: "var(--border-secondary)" }}>·</span>
            <span>{clienti.length} clienți</span>
            <span style={{ color: "var(--border-secondary)" }}>·</span>
            <span>{programariAzi} programări azi</span>
          </div>
        </div>
      </header>

      <ResponsiveGridLayout
        className="layout"
        layouts={layout}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={70}
        onLayoutChange={(l) => onLayoutChange(l)}
        draggableHandle=".drag-handle"
        margin={[14, 14]}
        containerPadding={[0, 0]}
      >
        <div key="statistici" style={{ ...card, padding: "20px 18px", overflow: "hidden" }}>
          <WidgetHeader title="Statistici" subtitle="Indicatori principali" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {statCards.map((s, i) => (
              <div key={i} style={{ position: "relative", overflow: "hidden", padding: "14px", borderRadius: 14, background: "var(--bg-secondary)" }}>
                <div style={{ position: "absolute", top: -15, right: -10, width: 70, height: 70, borderRadius: "50%", background: s.bg, opacity: 0.1, filter: "blur(16px)" }} />
                <div style={{ position: "absolute", top: 8, right: 8, opacity: 0.06 }}>
                  <s.icon size={50} />
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{s.subtitle}</div>
              </div>
            ))}
          </div>
        </div>

        <div key="tip" style={{ ...card, padding: "20px 18px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <WidgetHeader title="Tip proprietate" subtitle="Distribuție portofoliu" />
          {tipData.length > 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div style={{ flex: 1, height: "100%", minHeight: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tipData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {tipData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 100 }}>
                {tipData.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: CHART_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Fără date</div>
          )}
        </div>

        <div key="tranzactii" style={{ ...card, padding: "20px 18px", display: "flex", flexDirection: "column" }}>
          <WidgetHeader title="Tranzacții" subtitle="Vânzare vs. Închiriere" />
          {tranzactieData.length > 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={160}>
                <PieChart>
                  <Pie data={tranzactieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value" strokeWidth={0}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "var(--text-tertiary)", strokeWidth: 1 }}>
                    <Cell fill="url(#gradVanzare)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                    <Cell fill="url(#gradInchiriere)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                  </Pie>
                  <defs>
                    <linearGradient id="gradVanzare" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient>
                    <linearGradient id="gradInchiriere" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                  </defs>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Fără date</div>
          )}
        </div>

        <div key="categorii" style={{ ...card, padding: "20px 18px", display: "flex", flexDirection: "column" }}>
          <WidgetHeader title="Distribuție pe categorii" subtitle="Număr proprietăți per tip" />
          <div style={{ flex: 1, minHeight: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tipBarData} barSize={36} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)", fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                <Bar dataKey="Apartamente" fill="url(#gradBar1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Case" fill="url(#gradBar2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Terenuri" fill="url(#gradBar3)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Spații" fill="url(#gradBar4)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="gradBar1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient>
                  <linearGradient id="gradBar2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
                  <linearGradient id="gradBar3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                  <linearGradient id="gradBar4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div key="recente" style={{ ...card, padding: "20px 18px", overflow: "hidden" }}>
          <WidgetHeader title="Proprietăți recente" subtitle="Ultimele adăugate" />
          {proprietati.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)", fontSize: 12, padding: 20, textAlign: "center" }}>Nicio proprietate.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {proprietati.slice(0, 4).map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border-tertiary)" }}>
                  <img src={item.imagini?.[0] || item.imagine || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80"}
                    alt={item.titlu} style={{ width: 50, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.titlu}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      <HiOutlineMapPin size={10} color="var(--text-tertiary)" />{item.locatie}
                      <span style={{ color: "var(--border-secondary)" }}>·</span>
                      <span style={{ fontWeight: 600, color: "var(--primary)" }}>{item.pret}</span>
                    </div>
                  </div>
                  <span style={{ padding: "3px 8px", borderRadius: 999, background: item.status === "disponibil" ? "var(--success-light)" : "var(--bg-tertiary)", color: item.status === "disponibil" ? "var(--success-dark)" : "var(--text-tertiary)", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div key="clienti" style={{ ...card, padding: "20px 18px", overflow: "hidden" }}>
          <WidgetHeader title="Clienți recenți" subtitle="Ultimele contacte" />
          {clienti.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)", fontSize: 12, padding: 20, textAlign: "center" }}>Niciun client.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {clienti.slice(0, 4).map((client) => (
                <div key={client.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 10, borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border-tertiary)" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{client.nume}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{client.telefon} · {client.interes}</div>
                  </div>
                  <span style={{ padding: "3px 8px", borderRadius: 999, background: client.status === "Interesat" ? "var(--success-light)" : client.status === "Nou" ? "var(--warning-light)" : "var(--bg-tertiary)", color: client.status === "Interesat" ? "var(--success-dark)" : client.status === "Nou" ? "var(--warning-dark)" : "var(--text-tertiary)", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" }}>{client.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ResponsiveGridLayout>
    </div>
  );
}
