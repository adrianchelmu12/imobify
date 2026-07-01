import { useEffect, useState } from "react";
import { proprietatiStore, clientiStore, programariStore } from "../data/stores";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";
import {
  HiOutlineHomeModern,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCalendarDays,
  HiOutlineClock,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineUserGroup,
} from "react-icons/hi2";

const card = {
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: "var(--radius-xl)",
  boxShadow: "var(--shadow-card)",
};

function StatCard({ label, value, subtitle, icon: Icon, color, gradient, accent }) {
  return (
    <div
      className="glass-card-hover"
      style={{
        ...card,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        animation: "fadeInUp 0.5s ease forwards",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: gradient || "var(--primary-light)",
          opacity: 0.2,
          filter: "blur(24px)",
        }}
      />
      <div style={{ position: "absolute", top: 12, right: 12, opacity: 0.08 }}>
        <Icon size={90} />
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ fontSize: 34, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 6, letterSpacing: "-0.5px" }}>
          {value}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>
          {label}
        </div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>{subtitle}</div>}
      </div>
    </div>
  );
}

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#ef4444", "#ec4899"];

function CustomTooltip({ active, payload, label }) {
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

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 8 }}>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: entry.color }} />
          <span style={{ fontWeight: 500 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function PrezentareGenerala() {
  const [proprietati, setProprietati] = useState([]);
  const [clienti, setClienti] = useState([]);
  const [programari, setProgramari] = useState([]);

  useEffect(() => {
    setProprietati(proprietatiStore.getAll());
    setClienti(clientiStore.getAll());
    setProgramari(programariStore.getAll());
  }, []);

  const azi = new Date().toISOString().slice(0, 10);
  const programariAzi = programari.filter((p) => p.data === azi).length;
  const total = proprietati.length;
  const disponibile = proprietati.filter((p) => p.status === "disponibil" || p.status === "activ").length;
  const vandute = proprietati.filter((p) => p.status === "vandut" || p.status === "inchiriat").length;
  const vanzare = proprietati.filter((p) => p.tranzactie === "Vânzare").length;
  const inchiriere = proprietati.filter((p) => p.tranzactie === "Închiriere").length;
  const apartamente = proprietati.filter((p) => p.tip === "Apartament" || p.tip === "Garsonieră").length;
  const caseTeren = proprietati.filter((p) => p.tip === "Casă").length;
  const terenuri = proprietati.filter((p) => p.tip === "Terenuri").length;
  const spatii = proprietati.filter((p) => p.tip === "Spațiu comercial" || p.tip === "Spațiu industrial" || p.tip === "Birouri").length;

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

  const statusData = [
    { name: "Disponibile", value: disponibile, color: "#10b981" },
    { name: "Vândute/Închiriate", value: vandute, color: "#ef4444" },
    { name: "Altele", value: total - disponibile - vandute, color: "#94a3b8" },
  ].filter(d => d.value > 0);

  const tipBarData = [
    { name: "Apart.", Apartamente: apartamente, fill: "#6366f1" },
    { name: "Case", Case: caseTeren, fill: "#8b5cf6" },
    { name: "Terenuri", Terenuri: terenuri, fill: "#10b981" },
    { name: "Spații", Spații: spatii, fill: "#f59e0b" },
  ].filter(d => d.Apartamente > 0 || d.Case > 0 || d.Terenuri > 0 || d.Spații > 0);

  const percentVandute = total > 0 ? Math.round((vandute / total) * 100) : 0;

  return (
    <div style={{ padding: "32px", maxWidth: 1400 }}>
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
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
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total proprietăți" value={total} subtitle={`${disponibile} disponibile`} icon={HiOutlineHomeModern}
          gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" color="#6366f1" accent="#8b5cf6" />
        <StatCard label="Disponibile" value={disponibile} subtitle="Gata de vânzare" icon={HiOutlineCheckCircle}
          gradient="linear-gradient(135deg, #10b981, #34d399)" color="#10b981" accent="#34d399" />
        <StatCard label="Vândute / Închiriate" value={vandute} subtitle={`${percentVandute}% rată conversie`} icon={HiOutlineXCircle}
          gradient="linear-gradient(135deg, #ef4444, #f87171)" color="#ef4444" accent="#f87171" />
        <StatCard label="Programări azi" value={programariAzi} subtitle="Vizionări programate" icon={HiOutlineCalendarDays}
          gradient="linear-gradient(135deg, #06b6d4, #22d3ee)" color="#06b6d4" accent="#22d3ee" />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ ...card, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Distribuție tip proprietate</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 16 }}>Repartizarea portofoliului pe categorii</div>
          {tipData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <div style={{ flex: 1, height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tipData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4}
                      dataKey="value" strokeWidth={0}>
                      {tipData.map((entry, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 130 }}>
                {tipData.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: CHART_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există date</div>
          )}
        </div>

        <div style={{ ...card, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Tranzacții</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 16 }}>Vânzare vs. Închiriere</div>
          {tranzactieData.length > 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={tranzactieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={6}
                    dataKey="value" strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "var(--text-tertiary)", strokeWidth: 1 }}>
                    <Cell fill="url(#gradVanzare)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                    <Cell fill="url(#gradInchiriere)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                  </Pie>
                  <defs>
                    <linearGradient id="gradVanzare" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="gradInchiriere" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există date</div>
          )}
        </div>
      </div>

      <div style={{ ...card, padding: 24, marginBottom: 28 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Distribuție pe categorii</div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 20 }}>Număr de proprietăți per tip</div>
        {tipBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tipBarData} barSize={48} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-secondary)", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
              <Bar dataKey="Apartamente" fill="url(#gradBar1)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Case" fill="url(#gradBar2)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Terenuri" fill="url(#gradBar3)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Spații" fill="url(#gradBar4)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="gradBar1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient>
                <linearGradient id="gradBar2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
                <linearGradient id="gradBar3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                <linearGradient id="gradBar4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există date pentru afișare.</div>
        )}
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <HiOutlineClock size={20} color="var(--primary)" />
            Proprietăți recente
          </div>
          {proprietati.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: 24, textAlign: "center" }}>Nu există proprietăți adăugate încă.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {proprietati.slice(0, 4).map((item) => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: 14,
                  borderRadius: 16, background: "var(--bg-secondary)",
                  border: "1px solid var(--border-tertiary)", transition: "all 0.2s ease",
                }}>
                  <img loading="lazy"
                    src={(item.imagini || item.fotografii)?.[0] || item.imagine || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"}
                    alt={item.titlu}
                    style={{ width: 68, height: 52, borderRadius: 12, objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.titlu}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <HiOutlineMapPin size={12} color="var(--text-tertiary)" />
                      {item.locatie}
                      <span style={{ color: "var(--border-secondary)" }}>·</span>
                      <span style={{ fontWeight: 600, color: "var(--primary)" }}>{item.pret}</span>
                    </div>
                  </div>
                  <span style={{
                    padding: "5px 12px", borderRadius: 999,
                    background: (item.status === "disponibil" || item.status === "activ") ? "var(--success-light)" : "var(--bg-tertiary)",
                    color: (item.status === "disponibil" || item.status === "activ") ? "var(--success-dark)" : "var(--text-tertiary)",
                    fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", border: "1px solid",
                    borderColor: (item.status === "disponibil" || item.status === "activ") ? "rgba(16,185,129,0.2)" : "var(--border-tertiary)",
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <HiOutlineUserGroup size={20} color="var(--primary)" />
            Clienți recenți
          </div>
          {clienti.length === 0 ? (
            <div style={{ color: "var(--text-tertiary)", fontSize: 13, padding: 24, textAlign: "center" }}>Nu există clienți adăugați încă.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {clienti.slice(0, 4).map((client) => (
                <div key={client.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  padding: 14, borderRadius: 16, background: "var(--bg-secondary)",
                  border: "1px solid var(--border-tertiary)", transition: "all 0.2s ease",
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{client.nume}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{client.telefon} · {client.interes}</div>
                  </div>
                  <span style={{
                    padding: "5px 12px", borderRadius: 999,
                    background: client.status === "Interesat" ? "var(--success-light)" : client.status === "Nou" ? "var(--warning-light)" : "var(--bg-tertiary)",
                    color: client.status === "Interesat" ? "var(--success-dark)" : client.status === "Nou" ? "var(--warning-dark)" : "var(--text-tertiary)",
                    fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", border: "1px solid",
                    borderColor: client.status === "Interesat" ? "rgba(16,185,129,0.2)" : client.status === "Nou" ? "rgba(245,158,11,0.2)" : "var(--border-tertiary)",
                  }}>
                    {client.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
