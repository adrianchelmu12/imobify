import { notificariStore as store } from "./stores";

const NOTIFICARI_VERSION = 1;
let _lastCheck = null;

export function getAll() {
  return store.getAll();
}

export function getUnread() {
  return store.getAll().filter((n) => !n.citit);
}

export function getUnreadCount() {
  return getUnread().length;
}

export function add(notificare) {
  return store.add({
    cheie: notificare.cheie || null,
    tip: notificare.tip || "info",
    titlu: notificare.titlu,
    mesaj: notificare.mesaj || "",
    prioritate: notificare.prioritate || "normal",
    citit: false,
  });
}

export function markAsRead(id) {
  store.update(id, { citit: true });
  window.dispatchEvent(new CustomEvent("notificari:update"));
}

export function markAllAsRead() {
  const all = getAll();
  all.forEach((n) => {
    if (!n.citit) store.update(n.id, { citit: true });
  });
  window.dispatchEvent(new CustomEvent("notificari:update"));
}

export function sterge(id) {
  store.delete(id);
  window.dispatchEvent(new CustomEvent("notificari:update"));
}

export async function syncNotificari() {
  return store.sync();
}

export function genereazaNotificari() {
  const storedVersion = localStorage.getItem("imob-notificari-version");
  if (String(storedVersion) !== String(NOTIFICARI_VERSION)) {
    const all = getAll();
    all.forEach((n) => store.delete(n.id));
    localStorage.setItem("imob-notificari-version", String(NOTIFICARI_VERSION));
  }

  const proprietati = JSON.parse(localStorage.getItem("imob-proprietati-v2") || "[]");
  const clienti = JSON.parse(localStorage.getItem("imob-clienti-v2") || "[]");
  const programari = JSON.parse(localStorage.getItem("imob-programari-v2") || "[]");
  const taskuri = JSON.parse(localStorage.getItem("imob-taskuri-v2") || "[]");
  const comisioane = JSON.parse(localStorage.getItem("imob-comisioane-v2") || "[]");

  const azi = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();
  const existing = getAll();
  const existingKeys = new Set(existing.map((n) => n.cheie));

  if (existing.length === 0 && programari.length === 0) {
    add({ cheie: "demo-1", tip: "calendar", titlu: "Bine ai venit în CRM!", mesaj: "Adaugă primele proprietăți și clienți pentru a începe.", prioritate: "normal" });
    add({ cheie: "demo-2", tip: "task", titlu: "Configurează agenția", mesaj: "Adaugă membrii echipei și setează zonele de activitate.", prioritate: "high" });
    add({ cheie: "demo-3", tip: "client", titlu: "Lead-urile te așteaptă", mesaj: "Conectează canalele de marketing pentru a primi lead-uri automat.", prioritate: "normal" });
    _lastCheck = now;
    return;
  }

  function addIfNew(cheie, tip, titlu, mesaj, prioritate = "normal") {
    if (existingKeys.has(cheie)) return;
    add({ cheie, tip, titlu, mesaj, prioritate });
  }

  const programariAzi = programari.filter((p) => p.data === azi);
  if (programariAzi.length > 0) {
    addIfNew(`prog-azi-${azi}`, "calendar", "Programări astăzi",
      `Ai ${programariAzi.length} programări pentru astăzi`, "high");
  }

  const taskuriRestante = taskuri.filter((t) => t.status === "pending" && t.data <= azi);
  if (taskuriRestante.length > 0) {
    addIfNew("task-restante", "task", "Task-uri restante",
      `${taskuriRestante.length} task-uri necesită atenție`, "high");
  }

  const clientiNoi = clienti.filter((c) => c.status === "Nou");
  if (clientiNoi.length > 0) {
    addIfNew("clienti-noi", "client", "Lead-uri noi",
      `${clientiNoi.length} clienți noi necesită contactare`, "normal");
  }

  const comisioaneAsteptare = comisioane.filter((c) => c.status === "În așteptare");
  if (comisioaneAsteptare.length > 0) {
    const total = comisioaneAsteptare.reduce((s, c) => s + (Number(c.suma) || 0), 0);
    addIfNew("comisioane-pending", "bani", "Comisioane în așteptare",
      `${total.toLocaleString("ro-RO")} € — ${comisioaneAsteptare.length} plăți neîncasate`, "normal");
  }

  const propDisponibile = proprietati.filter((p) => p.status === "disponibil").length;
  if (propDisponibile < 5 && proprietati.length > 0) {
    addIfNew("stoc-scazut", "casa", "Portofoliu în scădere",
      `Doar ${propDisponibile} proprietăți disponibile — alimentează stocul`, "high");
  }

  _lastCheck = now;
}
