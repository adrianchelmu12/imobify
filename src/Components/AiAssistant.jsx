import { useEffect, useRef, useState } from "react";
import { proprietatiStore, clientiStore, programariStore, taskuriStore, comisioaneStore, campaniiStore } from "../data/stores";

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "";

const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const input = { width: "100%", padding: "12px 16px", borderRadius: 12, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

function formatEuro(n) { return Number(n || 0).toLocaleString("ro-RO"); }

function buildSystemPrompt(date) {
  const azi = new Date().toISOString().slice(0, 10);
  const p = date.proprietati;
  const c = date.clienti;
  const pr = date.programari;
  const t = date.taskuri;
  const co = date.comisioane;
  const ca = date.campanii;

  const disp = p.filter(x => x.status === "disponibil").length;
  const vandute = p.filter(x => x.status === "vandut").length;
  const inchiriate = p.filter(x => x.status === "inchiriat").length;

  const preturiDisp = p.filter(x => x.status === "disponibil" && x.pretNumeric).map(x => x.pretNumeric);
  const pretMin = preturiDisp.length ? Math.min(...preturiDisp) : 0;
  const pretMax = preturiDisp.length ? Math.max(...preturiDisp) : 0;
  const pretMediu = preturiDisp.length ? Math.round(preturiDisp.reduce((a, b) => a + b, 0) / preturiDisp.length) : 0;

  const peTip = {};
  p.forEach(x => { const tip = x.tip || "Necunoscut"; peTip[tip] = (peTip[tip] || 0) + 1; });
  const peTranzactie = {};
  p.forEach(x => { const t = x.tranzactie || "—"; peTranzactie[t] = (peTranzactie[t] || 0) + 1; });

  const clientiStatus = {};
  c.forEach(x => { clientiStatus[x.status] = (clientiStatus[x.status] || 0) + 1; });
  const peSurse = {};
  c.forEach(x => { if (x.sursa) peSurse[x.sursa] = (peSurse[x.sursa] || 0) + 1; });

  const progAzi = pr.filter(x => x.data === azi);
  const taskPending = t.filter(x => x.status === "pending").length;
  const taskDone = t.filter(x => x.status === "done").length;
  const taskRestante = t.filter(x => x.status === "pending" && x.data && x.data < azi).length;

  const comPlatite = co.filter(x => x.status === "Plătit").reduce((s, x) => s + (Number(x.suma) || 0), 0);
  const comAsteptare = co.filter(x => x.status === "În așteptare").reduce((s, x) => s + (Number(x.suma) || 0), 0);

  const campActive = ca.filter(x => x.status === "Activă").length;
  const leaduri = ca.reduce((s, x) => s + (Number(x.leaduriGenerate) || 0), 0);

  const propDisp = p.filter(x => x.status === "disponibil").slice(0, 10);
  const propDetails = propDisp.map(x =>
    `- "${x.titlu}", ${x.tip}, ${x.tranzactie}, ${x.pret}, ${x.locatie || ""}, ${x.camere || 0} camere, ${x.suprafata || 0} mp, ${x.descriere || ""}`
  ).join("\n");

  let prompt = `Ești un asistent AI pentru o agenție imobiliară din România. Răspunzi în limba română, concis și profesionist.

Poți să:
- Analizezi datele agenției și să oferi statistici
- Scrii descrieri imobiliare atractive și captivante
- Ajuți cu strategii de marketing, prețuri, negociere
- Răspunzi la orice întrebare legată de imobiliare
- Oferi recomandări personalizate bazate pe date

Când utilizatorul cere o descriere pentru o proprietate, scrie un text profesional, detaliat, cu accent pe punctele forte, zonă, finisaje și facilități. Folosește un limbaj imobiliar românesc autentic.

Dacă întrebarea NU ține de datele agenției, răspunzi normal — ești un asistent general capabil să ajute cu orice.

Iată datele curente ale agenției pentru context:

📊 DATELE AGENȚIEI:

PROPRIETĂȚI (${p.length} total):
- Disponibile: ${disp}
- Vândute: ${vandute}
- Închiriate: ${inchiriate}
- Preț minim disponibil: ${pretMin.toLocaleString("ro-RO")} €
- Preț mediu disponibil: ${pretMediu.toLocaleString("ro-RO")} €
- Preț maxim disponibil: ${pretMax.toLocaleString("ro-RO")} €
- Pe tipuri: ${Object.entries(peTip).map(([k, v]) => `${k}: ${v}`).join(", ")}
- Pe tranzacții: ${Object.entries(peTranzactie).map(([k, v]) => `${k}: ${v}`).join(", ")}

CLIENȚI (${c.length} total):
- Status: ${Object.entries(clientiStatus).map(([k, v]) => `${k}: ${v}`).join(", ")}
- Surse: ${Object.entries(peSurse).sort(([,a],[,b]) => b - a).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(", ")}

PROGRAMĂRI (${pr.length} total):
- Astăzi: ${progAzi.length}
- Programări azi: ${progAzi.map(x => `${x.ora} - ${x.titlu} (${x.client}, ${x.status})`).join("; ") || "niciuna"}

TASK-URI (${t.length} total):
- Pending: ${taskPending}
- Done: ${taskDone}
- Restante: ${taskRestante}

COMISIOANE (${co.length} total):
- Plătite: ${comPlatite.toLocaleString("ro-RO")} €
- În așteptare: ${comAsteptare.toLocaleString("ro-RO")} €

CAMPANII MARKETING (${ca.length} total):
- Active: ${campActive}
- Lead-uri generate: ${leaduri}
- Buget total: ${ca.reduce((s, x) => s + (Number(x.buget) || 0), 0).toLocaleString("ro-RO")} €

Răspunzi la întrebările utilizatorului analizând aceste date. Oferi recomandări practice, specifice și acționabile. Poți folosi emoji unde e relevant, dar fără bold markdown — scrie text simplu și curat.

PROPRIETĂȚI DETALIATE (primele ${propDisp.length} disponibile):
${propDetails || "niciuna"}`;

  return prompt;
}

const SUGESTII_INITIALE = [
  "Rezumatul activității",
  "Care este situația proprietăților?",
  "Arată-mi task-urile restante",
  "Analiză prețuri",
  "Top agenți",
  "Recomandări pentru azi",
  "Rata de conversie",
  "Distribuție pe zone",
];

export default function AiAssistant() {
  const m = useIsMobile();
  const [mesaje, setMesaje] = useState([]);
  const [inputText, setInputText] = useState("");
  const [seIncarca, setSeIncarca] = useState(false);
  const bottomRef = useRef(null);

  const loadDate = () => ({
    proprietati: proprietatiStore.getAll(),
    clienti: clientiStore.getAll(),
    programari: programariStore.getAll(),
    taskuri: taskuriStore.getAll(),
    comisioane: comisioaneStore.getAll(),
    campanii: campaniiStore.getAll(),
  });

  const [date, setDate] = useState(loadDate);

  useEffect(() => { setDate(loadDate()); }, []);

  useEffect(() => {
    const intro = `Bună! Sunt asistentul tău AI Imobify. Am acces la toate datele agenției tale și pot să îți ofer analize inteligente, recomandări personalizate și răspunsuri precise.\n\nPoți să mă întrebi orice despre:\n🏠 Proprietăți · 👥 Clienți · 📅 Programări · ✅ Task-uri · 💰 Comisioane · 📢 Campanii\n\nScrie o întrebare sau alege o sugestie mai jos ↓`;
    setMesaje([{ rol: "asistent", text: intro }]);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mesaje, seIncarca]);

  const trimite = async (text) => {
    const t = text || inputText.trim();
    if (!t || seIncarca) return;

    const fresh = loadDate();
    setDate(fresh);

    setMesaje((prev) => [...prev, { rol: "user", text: t }]);
    setInputText("");
    setSeIncarca(true);

    if (!API_KEY) {
      setMesaje((prev) => [...prev, {
        rol: "asistent",
        text: "⚠️ **API Key DeepSeek lipsă.**\n\nAdaugă `VITE_DEEPSEEK_API_KEY` în fișierul `.env` și repornește serverul.\n\nObții un API key gratuit de la [platform.deepseek.com](https://platform.deepseek.com)."
      }]);
      setSeIncarca(false);
      return;
    }

    try {
      const response = await fetch(DEEPSEEK_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: buildSystemPrompt(fresh) },
            { role: "user", content: t },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      const raspuns = (data.choices?.[0]?.message?.content || "Nu am putut genera un răspuns.")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/###?\s?/g, "");

      setMesaje((prev) => [...prev, { rol: "asistent", text: raspuns }]);
    } catch (err) {
      console.error("DeepSeek API error:", err);
      setMesaje((prev) => [...prev, {
        rol: "asistent",
        text: `❌ **Eroare la conectarea cu DeepSeek.**\n\nVerifică cheia API și conexiunea la internet.\n\nDetalii: ${err.message}`
      }]);
    } finally {
      setSeIncarca(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); trimite(); } };

  return (
    <div style={{ padding: m ? "14px" : "28px 32px", maxWidth: 860 }}>
      <header style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg, #10b981, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>AI Assistant</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Powered by DeepSeek — analizează datele în timp real</div>
        </div>
      </header>

      <div style={{ ...card, overflow: "hidden", display: "flex", flexDirection: "column", height: m ? "calc(100vh - 180px)" : 560 }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          {mesaje.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.rol === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "88%",
                padding: "14px 18px",
                borderRadius: 16,
                background: msg.rol === "user" ? "linear-gradient(135deg, var(--primary), var(--accent))" : "var(--bg-secondary)",
                color: msg.rol === "user" ? "#fff" : "var(--text-primary)",
                fontSize: 13,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
                borderBottomRightRadius: msg.rol === "user" ? 4 : 16,
                borderBottomLeftRadius: msg.rol === "asistent" ? 4 : 16,
                boxShadow: msg.rol === "user" ? "0 2px 8px rgba(99,102,241,0.2)" : "none",
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {seIncarca && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "12px 18px", borderRadius: 16, background: "var(--bg-secondary)", borderBottomLeftRadius: 4 }}>
                <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>DeepSeek analizează...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "12px 16px", borderTop: "0.5px solid var(--border-tertiary)", background: "var(--bg-primary)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {SUGESTII_INITIALE.slice(0, m ? 4 : 8).map((s) => (
              <button key={s} onClick={() => trimite(s)}
                style={{ border: "1px solid var(--border-tertiary)", background: "var(--bg-secondary)", color: "var(--text-secondary)", borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={input} placeholder="Întreabă-mă orice despre datele agenției tale..."
              value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} disabled={seIncarca} />
            <button onClick={() => trimite()} disabled={seIncarca}
              style={{ border: "none", borderRadius: 12, background: seIncarca ? "var(--border-tertiary)" : "linear-gradient(135deg, #10b981, #06b6d4)", color: "#fff", padding: "10px 20px", fontWeight: 600, cursor: seIncarca ? "default" : "pointer", fontSize: 13, whiteSpace: "nowrap", boxShadow: seIncarca ? "none" : "0 4px 14px rgba(16,185,129,0.3)" }}>
              {seIncarca ? "Se procesează..." : "Trimite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
