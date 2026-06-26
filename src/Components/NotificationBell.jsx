import { useEffect, useState, useRef } from "react";
import { getUnreadCount, getUnread, markAsRead, markAllAsRead, sterge, genereazaNotificari, getAll } from "../data/notificariStore";
import {
  HiOutlineBell,
  HiOutlineBellAlert,
  HiOutlineCalendarDays,
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiOutlineBanknotes,
  HiOutlineHomeModern,
  HiOutlineCheck,
  HiOutlineTrash,
} from "react-icons/hi2";

const ICON_MAP = {
  calendar: HiOutlineCalendarDays,
  task: HiOutlineClipboardDocumentList,
  client: HiOutlineUserGroup,
  bani: HiOutlineBanknotes,
  casa: HiOutlineHomeModern,
  trofee: HiOutlineCheck,
};

function formatTimp(data) {
  const d = new Date(data);
  const now = new Date();
  const diff = now - d;
  const minute = Math.floor(diff / 60000);
  if (minute < 1) return "Acum";
  if (minute < 60) return `${minute}m`;
  const ore = Math.floor(minute / 60);
  if (ore < 24) return `${ore}h`;
  const zile = Math.floor(ore / 24);
  return `${zile}z`;
}

export default function NotificationBell({ position = "bottom" }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const ref = useRef();

  const refresh = () => {
    setCount(getUnreadCount());
    if (open) setList(getAll().slice(0, 15));
  };

  useEffect(() => {
    refresh();
    genereazaNotificari();
    refresh();

    const onUpdate = () => refresh();
    window.addEventListener("notificari:update", onUpdate);
    const interval = setInterval(() => {
      genereazaNotificari();
      refresh();
    }, 30000);

    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("notificari:update", onUpdate);
      clearInterval(interval);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setOpen((prev) => {
      if (!prev) setList(getAll().slice(0, 15));
      return !prev;
    });
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleToggle}
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          background: open ? "rgba(99,102,241,0.2)" : "transparent",
          color: open ? "#c7d2fe" : "rgba(255,255,255,0.5)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }
        }}
      >
        {count > 0 ? <HiOutlineBellAlert size={19} /> : <HiOutlineBell size={19} />}
        {count > 0 && (
          <span style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            background: "var(--danger)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            boxShadow: "0 2px 6px rgba(239,68,68,0.4)",
          }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          ...(position === "top"
            ? { top: 44, left: 0 }
            : { bottom: 48, right: 0 }),
          width: 360,
          maxWidth: "90vw",
          maxHeight: 440,
          background: "rgba(15,23,42,0.98)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>
              Notificări {count > 0 && `(${count})`}
            </span>
            {count > 0 && (
              <button
                type="button"
                onClick={() => { markAllAsRead(); refresh(); }}
                style={{
                  border: "none",
                  background: "rgba(99,102,241,0.15)",
                  color: "#c7d2fe",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "5px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Marchează tot citit
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {list.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                Nicio notificare
              </div>
            ) : (
              list.map((n) => {
                const Icon = ICON_MAP[n.tip] || HiOutlineBell;
                return (
                  <div
                    key={n.id}
                    onClick={() => { markAsRead(n.id); }}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      background: n.citit ? "transparent" : "rgba(99,102,241,0.06)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = n.citit ? "transparent" : "rgba(99,102,241,0.06)";
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: n.citit ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.15)",
                      color: n.citit ? "rgba(255,255,255,0.3)" : "#818cf8",
                    }}>
                      <Icon size={17} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: n.citit ? 500 : 700,
                        color: n.citit ? "rgba(255,255,255,0.5)" : "#e2e8f0",
                        marginBottom: 2,
                      }}>
                        {n.titlu}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.3 }}>
                        {n.mesaj}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{formatTimp(n.data)}</span>
                      {n.prioritate === "high" && (
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "#ef4444", flexShrink: 0,
                        }} />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
