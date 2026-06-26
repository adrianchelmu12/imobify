import { useEffect, useMemo, useState } from "react";
import { taskuriStore } from "../data/stores";
import { HiOutlineClipboardDocumentList, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";

const PRIORITATI = [
  { value: "low", label: "Scăzută", color: "var(--text-tertiary)", bg: "var(--bg-secondary)" },
  { value: "medium", label: "Medie", color: "var(--warning-dark)", bg: "var(--warning-light)" },
  { value: "high", label: "Ridicată", color: "var(--danger)", bg: "var(--danger-light)" },
];

const card = { background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-card)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border-secondary)", background: "var(--bg-primary)", color: "var(--text-primary)", outline: "none", fontSize: 13, boxSizing: "border-box" };

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth <= 900);
  useEffect(() => { const r = () => setM(window.innerWidth <= 900); window.addEventListener("resize", r); return () => window.removeEventListener("resize", r); }, []);
  return m;
}

function TaskForm({ onAdd }) {
  const m = useIsMobile();
  const [form, setForm] = useState({ titlu: "", data: "", prioritate: "medium" });

  const submit = (e) => {
    e.preventDefault();
    if (!form.titlu.trim()) return;
    onAdd({ titlu: form.titlu, data: form.data || null, prioritate: form.prioritate, status: "pending" });
    setForm({ titlu: "", data: "", prioritate: "medium" });
  };

  return (
    <form onSubmit={submit} style={{ ...card, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <HiOutlinePlus size={16} color="var(--primary)" /> Task nou
      </div>
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr auto auto", gap: 10, alignItems: "end" }}>
        <input style={input} placeholder="Ce ai de făcut?" value={form.titlu} onChange={(e) => setForm({ ...form, titlu: e.target.value })} />
        <input style={{ ...input, width: m ? "100%" : 150 }} type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
        <select style={{ ...input, width: m ? "100%" : 130 }} value={form.prioritate} onChange={(e) => setForm({ ...form, prioritate: e.target.value })}>
          {PRIORITATI.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <button type="submit" style={{ gridColumn: m ? "span 1" : "span 1", border: "none", borderRadius: 10, background: "var(--primary)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: "10px 18px", whiteSpace: "nowrap" }}>
          Adaugă
        </button>
      </div>
    </form>
  );
}

export default function Taskuri() {
  const m = useIsMobile();
  const [taskuri, setTaskuri] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => { setTaskuri(taskuriStore.getAll()); }, []);

  const refresh = () => setTaskuri(taskuriStore.getAll());

  const addTask = (task) => { taskuriStore.add(task); refresh(); };
  const toggleTask = (id) => {
    const t = taskuri.find((x) => String(x.id) === String(id));
    if (!t) return;
    taskuriStore.update(id, { status: t.status === "done" ? "pending" : "done" });
    refresh();
  };
  const deleteTask = (id) => { taskuriStore.delete(id); refresh(); };
  const startEdit = (t) => { setEditingId(t.id); setEditText(t.titlu); };
  const saveEdit = () => {
    if (!editText.trim()) return;
    taskuriStore.update(editingId, { titlu: editText });
    refresh();
    setEditingId(null);
    setEditText("");
  };

  const taskuriFiltrate = useMemo(() => {
    return taskuri
      .filter((t) => {
        if (filter === "done") return t.status === "done";
        if (filter === "pending") return t.status === "pending";
        return true;
      })
      .sort((a, b) => {
        const prio = { high: 0, medium: 1, low: 2 };
        if (prio[a.prioritate] !== prio[b.prioritate]) return prio[a.prioritate] - prio[b.prioritate];
        if (a.data && b.data) return a.data.localeCompare(b.data);
        if (a.data) return -1;
        if (b.data) return 1;
        return 0;
      });
  }, [taskuri, filter]);

  const azi = new Date().toISOString().slice(0, 10);
  const overdue = taskuri.filter((t) => t.data && t.data < azi && t.status === "pending").length;
  const doneToday = taskuri.filter((t) => t.status === "done").length;
  const total = taskuri.length;

  return (
    <div style={{ padding: m ? "18px 14px 28px" : "28px 32px" }}>
      <header style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
            <HiOutlineClipboardDocumentList size={24} color="var(--primary)" />
            Task-uri & Remindere
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {total} task-uri · {overdue} restante · {doneToday} rezolvate
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ key: "all", label: "Toate" }, { key: "pending", label: "De făcut" }, { key: "done", label: "Rezolvate" }].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: filter === f.key ? "none" : "1px solid var(--border-secondary)",
                background: filter === f.key ? "var(--primary)" : "var(--bg-primary)",
                color: filter === f.key ? "#fff" : "var(--text-secondary)",
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <TaskForm onAdd={addTask} />

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {taskuriFiltrate.length === 0 ? (
          <div style={{ ...card, padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "var(--text-tertiary)", marginBottom: 4 }}>Niciun task</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Adaugă primul task mai sus.</div>
          </div>
        ) : (
          taskuriFiltrate.map((task) => {
            const prio = PRIORITATI.find((p) => p.value === task.prioritate) || PRIORITATI[1];
            const esteRestant = task.data && task.data < azi && task.status === "pending";
            const done = task.status === "done";

            return (
              <div key={task.id}
                style={{
                  ...card, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12,
                  opacity: done ? 0.5 : 1, transition: "all 0.15s",
                }}>
                <button onClick={() => toggleTask(task.id)}
                  style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                    border: done ? "none" : "1.5px solid var(--border-secondary)",
                    background: done ? "var(--success)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                  {done && <HiOutlineCheck size={14} color="#fff" />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === task.id ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <input style={{ ...input, flex: 1 }} value={editText} onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") { setEditingId(null); setEditText(""); } }} autoFocus />
                      <button onClick={saveEdit} style={{ border: "none", background: "var(--primary)", color: "#fff", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                        <HiOutlineCheck size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", textDecoration: done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {task.titlu}
                      </div>
                      {task.data && (
                        <div style={{ fontSize: 11, color: esteRestant ? "var(--danger)" : "var(--text-tertiary)", marginTop: 3 }}>
                          {esteRestant ? "❗ Restant — " : ""}{new Date(task.data + "T12:00:00").toLocaleDateString("ro-RO", { weekday: "short", day: "2-digit", month: "short" })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 8, flexShrink: 0,
                  background: prio.bg, color: prio.color,
                }}>
                  {prio.label}
                </span>

                {editingId !== task.id && (
                  <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                    <button onClick={() => startEdit(task)}
                      style={{ border: "none", background: "var(--bg-secondary)", color: "var(--text-secondary)", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <HiOutlinePencil size={13} />
                    </button>
                    <button onClick={() => deleteTask(task.id)}
                      style={{ border: "none", background: "var(--danger-light)", color: "var(--danger)", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <HiOutlineTrash size={13} />
                    </button>
                  </div>
                )}
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>
                  Adăugat de {task.createdByName || "—"}
                  {task.updatedByName && task.updatedByName !== task.createdByName ? ` · Modificat de ${task.updatedByName}` : ""}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
