import { useEffect, useState } from "react";
import { proprietatiStore, clientiStore, programariStore, taskuriStore, comisioaneStore, campaniiStore } from "../data/stores";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, LineChart, Line,
} from "recharts";
import {
  HiOutlinePresentationChartBar,
  HiOutlineHomeModern,
  HiOutlineUserGroup,
  HiOutlineBanknotes,
  HiOutlineMegaphone,
  HiOutlineArrowTrendingUp,
} from "react-icons/hi2";

const card = {
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.6)",
  borderRadius: "var(--radius-xl)",
  boxShadow: "var(--shadow-card)",
};

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => {
    const r = () => setM(window.innerWidth <= 900);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  return m;
}

function StatCard({ label, value, hint, icon: Icon, color, gradient }) {
  return (
    <div style={{ ...card, padding: "22px 24px", transition: "all 0.3s ease", cursor: "default" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>{label}</div>
        <div style={{
          width: 38, height: 38, borderRadius: 12,
          background: gradient || `linear-gradient(135deg, ${color || "var(--primary)"}, transparent)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0.15,
        }}>
          <Icon size={18} color={color || "var(--primary)"} />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || "var(--text-primary)", lineHeight: 1, letterSpacing: "-0.5px" }}>{value}</div>
      {hint && <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
        <HiOutlineArrowTrendingUp size={13} />
        {hint}
      </div>}
    </div>
  );
}

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#06b6d4", "#ef4444", "#ec4899", "#14b8a6"];

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

export default function Rapoarte() {
  const m = useIsMobile();
  const [date, setDate] = useState(null);

  useEffect(() => {
    setDate({
      proprietati: proprietatiStore.getAll(),
      clienti: clientiStore.getAll(),
      programari: programariStore.getAll(),
      taskuri: taskuriStore.getAll(),
      comisioane: comisioaneStore.getAll(),
      campanii: campaniiStore.getAll(),
    });
  }, []);

  if (!date) {
    return (
      <div style={{ padding: "60px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          animation: "pulse 1.5s ease infinite",
        }}>
          <HiOutlinePresentationChartBar size={22} color="#fff" />
        </div>
        <div style={{ fontSize: 14, color: "var(--text-tertiary)" }}>Se încarcă statisticile...</div>
      </div>
    );
  }

  const azi = new Date().toISOString().slice(0, 10);

  const propDisponibile = date.proprietati.filter((p) => p.status === "disponibil").length;
  const propVandute = date.proprietati.filter((p) => p.status === "vandut").length;
  const propInchiriate = date.proprietati.filter((p) => p.status === "inchiriat").length;
  const clientiActivi = date.clienti.filter((c) => c.status !== "Închis").length;
  const clientiInchisi = date.clienti.filter((c) => c.status === "Închis").length;
  const clientiNoi = date.clienti.filter((c) => c.status === "Nou").length;
  const clientiInteresati = date.clienti.filter((c) => c.status === "Interesat").length;
  const clientiContactati = date.clienti.filter((c) => c.status === "Contactat").length;
  const programariAzi = date.programari.filter((p) => p.data === azi).length;
  const taskuriPending = date.taskuri.filter((t) => t.status === "pending").length;
  const taskuriDone = date.taskuri.filter((t) => t.status === "done").length;
  const comisioaneTotale = date.comisioane.reduce((s, c) => s + (Number(c.suma) || 0), 0);
  const comisioanePlatite = date.comisioane.filter((c) => c.status === "Plătit").reduce((s, c) => s + (Number(c.suma) || 0), 0);
  const campaniiActive = date.campanii.filter((c) => c.status === "Activă").length;
  const leaduriDinCampanii = date.campanii.reduce((s, c) => s + (Number(c.leaduriGenerate) || 0), 0);
  const bugetCampanii = date.campanii.reduce((s, c) => s + (Number(c.buget) || 0), 0);

  const surseClienti = {};
  date.clienti.forEach((c) => { if (c.sursa) { surseClienti[c.sursa] = (surseClienti[c.sursa] || 0) + 1; } });
  const surseData = Object.entries(surseClienti)
    .map(([nume, valoare]) => ({ name: nume, value: valoare }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const statusClientiData = [
    { name: "Noi", value: clientiNoi, color: "#f59e0b" },
    { name: "Contactați", value: clientiContactati, color: "#06b6d4" },
    { name: "Interesați", value: clientiInteresati, color: "#10b981" },
    { name: "Închiși", value: clientiInchisi, color: "#94a3b8" },
  ].filter(d => d.value > 0);

  const statusProprietatiData = [
    { name: "Disponibile", value: propDisponibile },
    { name: "Vândute", value: propVandute },
    { name: "Închiriate", value: propInchiriate },
  ].filter(d => d.value > 0);

  const performantaData = [
    { name: "Programări", Programări: date.programari.length, Azi: programariAzi },
    { name: "Task-uri", Taskuri: date.taskuri.length, Rezolvate: taskuriDone },
    { name: "Clienți", Clienți: date.clienti.length, Activi: clientiActivi },
    { name: "Proprietăți", Proprietăți: date.proprietati.length, Disponibile: propDisponibile },
  ];

  const comisioaneData = [
    { name: "Comisioane", Total: comisioaneTotale, Plătite: comisioanePlatite },
  ];

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "32px" }}>
      <header style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: "linear-gradient(135deg, var(--primary), var(--accent))",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          }}>
            <HiOutlinePresentationChartBar size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>Rapoarte & Analiză</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>Statistici generale și indicatori de performanță</div>
          </div>
        </div>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatCard label="Proprietăți disponibile" value={propDisponibile} hint={`din ${date.proprietati.length} totale`}
          icon={HiOutlineHomeModern} color="#6366f1" gradient="linear-gradient(135deg, #6366f1, #8b5cf6)" />
        <StatCard label="Clienți activi" value={clientiActivi} hint={`${clientiInchisi} închiși`}
          icon={HiOutlineUserGroup} color="#f59e0b" gradient="linear-gradient(135deg, #f59e0b, #fbbf24)" />
        <StatCard label="Comisioane" value={`${comisioaneTotale.toLocaleString("ro-RO")} €`} hint={`${comisioanePlatite.toLocaleString("ro-RO")} € plătite`}
          icon={HiOutlineBanknotes} color="#10b981" gradient="linear-gradient(135deg, #10b981, #34d399)" />
        <StatCard label="Campanii active" value={campaniiActive} hint={`${leaduriDinCampanii} lead-uri generate`}
          icon={HiOutlineMegaphone} color="#06b6d4" gradient="linear-gradient(135deg, #06b6d4, #22d3ee)" />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Clienți pe surse</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 20 }}>Distribuția lead-urilor după proveniență</div>
          {surseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={surseData} layout="vertical" barSize={22}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--text-secondary)", fontWeight: 500 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                <Bar dataKey="value" fill="url(#gradSurse)" radius={[0, 8, 8, 0]} name="Clienți">
                  {surseData.map((entry, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nicio sursă înregistrată.</div>
          )}
        </div>

        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Status clienți</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 20 }}>Distribuția clienților pe stadii</div>
          {statusClientiData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusClientiData} cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3}
                  dataKey="value" strokeWidth={0}>
                  {statusClientiData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 500 }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există date.</div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Performanță generală</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 20 }}>Comparație indicatori principali</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={performantaData} barSize={28} barGap={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--text-secondary)", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.04)" }} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="Programări" fill="url(#gradPerf1)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Azi" fill="url(#gradPerf2)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Taskuri" fill="url(#gradPerf3)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Rezolvate" fill="url(#gradPerf4)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Clienți" fill="url(#gradPerf5)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Activi" fill="url(#gradPerf6)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Proprietăți" fill="url(#gradPerf7)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Disponibile" fill="url(#gradPerf8)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="gradPerf1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient>
                <linearGradient id="gradPerf2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient>
                <linearGradient id="gradPerf3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                <linearGradient id="gradPerf4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
                <linearGradient id="gradPerf5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient>
                <linearGradient id="gradPerf6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient>
                <linearGradient id="gradPerf7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                <linearGradient id="gradPerf8" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" /></linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Status proprietăți</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 20 }}>Disponibile vs. Vândute vs. Închiriate</div>
          {statusProprietatiData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusProprietatiData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={4}
                  dataKey="value" strokeWidth={0} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "var(--text-tertiary)", strokeWidth: 1 }}>
                  <Cell fill="url(#gradProp1)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                  <Cell fill="url(#gradProp2)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                  <Cell fill="url(#gradProp3)" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="gradProp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#34d399" /></linearGradient>
                  <linearGradient id="gradProp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f87171" /></linearGradient>
                  <linearGradient id="gradProp3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient>
                </defs>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Nu există date.</div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 16 }}>
        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Indicatori cheie</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 20 }}>Rezumat metrici esențiale</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { label: "Programări totale", value: date.programari.length, color: "#6366f1" },
              { label: "Programări azi", value: programariAzi, color: "#f59e0b" },
              { label: "Task-uri restante", value: taskuriPending, color: "#ef4444" },
              { label: "Task-uri rezolvate", value: taskuriDone, color: "#10b981" },
              { label: "Clienți total", value: date.clienti.length, color: "#6366f1" },
              { label: "Clienți noi", value: clientiNoi, color: "#06b6d4" },
              { label: "Comisioane €", value: `${comisioaneTotale.toLocaleString("ro-RO")}`, color: "#10b981" },
              { label: "Rate conversie", value: `${clientiActivi > 0 ? Math.round((clientiInteresati / clientiActivi) * 100) : 0}%`, color: "#8b5cf6" },
            ].map((item, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "16px 12px", borderRadius: 16,
                background: "var(--bg-secondary)", border: "1px solid var(--border-tertiary)",
                transition: "all 0.2s ease",
              }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 6 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Marketing & Campanii</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 20 }}>Performanță campanii și lead-uri</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <div style={{ textAlign: "center", padding: "16px", borderRadius: 16, background: "var(--bg-secondary)", border: "1px solid var(--border-tertiary)" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "var(--primary)" }}>{date.campanii.length}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>Campanii</div>
            </div>
            <div style={{ textAlign: "center", padding: "16px", borderRadius: 16, background: "var(--bg-secondary)", border: "1px solid var(--border-tertiary)" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: "var(--success)" }}>{campaniiActive}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>Active</div>
            </div>
          </div>
          <div style={{ padding: "18px", borderRadius: 16, background: "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(139,92,246,0.05))", border: "1px solid rgba(99,102,241,0.1)" }}>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, fontWeight: 500 }}>Lead-uri generate din campanii</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>{leaduriDinCampanii}</div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 6 }}>
              Buget total investit: {bugetCampanii.toLocaleString("ro-RO")} €
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
