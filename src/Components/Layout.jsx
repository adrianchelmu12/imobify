import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useUser, useAuth, SignOutButton, useOrganizationList, useOrganization } from "@clerk/clerk-react";
import { setTokenGetter } from "../lib/apiStore";
import { syncAllStores } from "../data/stores";
import { syncAgenti } from "../data/agentiStorage";
import { fetchMyRole, isAdmin, isManagerOrAdmin } from "../lib/roleStore";
import CreateOrganizationScreen from "./CreateOrganizationScreen";
import {
  HiOutlineSquares2X2,
  HiOutlinePlusCircle,
  HiOutlineHomeModern,
  HiOutlineUserGroup,
  HiOutlineCalendarDays,
  HiOutlineClipboardDocumentList,
  HiOutlineEye,
  HiOutlineBuildingOffice2,
  HiOutlineMapPin,
  HiOutlineBarsArrowDown,
  HiOutlineDocumentDuplicate,
  HiOutlineBanknotes,
  HiOutlineMegaphone,
  HiOutlineSparkles,
  HiOutlinePresentationChartBar,
  HiOutlineChevronDown,
  HiOutlineUserCircle,
} from "react-icons/hi2";

const NAV_SECTIONS = [
  {
    label: "Activitate",
    items: [
      { label: "Clienți", icon: HiOutlineUserGroup, href: "/admin/clienti" },
      { label: "Pipeline", icon: HiOutlineBarsArrowDown, href: "/admin/pipeline" },
      { label: "Programări", icon: HiOutlineCalendarDays, href: "/admin/programari" },
    ],
  },
  {
    label: "Proprietăți",
    items: [
      { label: "Proprietăți", icon: HiOutlineHomeModern, href: "/admin/proprietati" },
      { label: "Portofoliu", icon: HiOutlineEye, href: "/admin/portofoliu" },
      { label: "Proiecte rezidențiale", icon: HiOutlineBuildingOffice2, href: "/admin/proiecte" },
      { label: "Hartă", icon: HiOutlineMapPin, href: "/admin/harta" },
    ],
  },
  {
    label: "Vânzări",
    items: [
      { label: "Documente", icon: HiOutlineDocumentDuplicate, href: "/admin/documente" },
      { label: "Comisioane", icon: HiOutlineBanknotes, href: "/admin/comisioane" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Campanii", icon: HiOutlineMegaphone, href: "/admin/campanii" },
    ],
  },
  {
    label: "Productivitate",
    items: [
      { label: "Task-uri", icon: HiOutlineClipboardDocumentList, href: "/admin/taskuri" },
      { label: "AI Assistant", icon: HiOutlineSparkles, href: "/admin/ai-assistant" },
    ],
  },
  {
    label: "Analiză",
    items: [
      { label: "Rapoarte", icon: HiOutlinePresentationChartBar, href: "/admin/rapoarte" },
    ],
  },
];

const linkStyle = ({ isActive }) => ({
  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10,
  fontSize: 13, fontWeight: isActive ? 600 : 400, textDecoration: "none",
  color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
  background: isActive ? "rgba(99,102,241,0.2)" : "transparent",
  transition: "all 0.15s ease",
});

function Sidebar({ mobileOpen, setMobileOpen, isMobile }) {
  const [collapsed, setCollapsed] = useState({});
  const [roleAdmin, setRoleAdmin] = useState(() => isAdmin());
  const [roleManagerOrAdmin, setRoleManagerOrAdmin] = useState(() => isManagerOrAdmin());
  const { user } = useUser();
  const { organization } = useOrganization();
  const orgMeta = organization?.publicMetadata || {};
  const agencyName = orgMeta?.agencyName || organization?.name || "Agenție";
  const agencyLogo = organization?.imageUrl || orgMeta?.agencyLogo || null;

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleAdmin(isAdmin());
      setRoleManagerOrAdmin(isManagerOrAdmin());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const toggleSection = (label) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      style={{
        width: 240,
        maxWidth: "82vw",
        flexShrink: 0,
        background: "var(--secondary)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: isMobile ? "fixed" : "sticky",
        left: isMobile ? (mobileOpen ? 0 : -250) : 0,
        top: 0,
        alignSelf: "flex-start",
        overflowY: "auto",
        zIndex: 1001,
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isMobile && mobileOpen ? "0 25px 60px rgba(0,0,0,0.35)" : "none",
      }}
    >
      <div style={{ padding: "24px 18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {agencyLogo ? (
            <img
              src={agencyLogo}
              alt={agencyName}
              style={{
                width: 38, height: 38, borderRadius: 10, objectFit: "cover", flexShrink: 0,
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div
              style={{
                width: 38, height: 38, borderRadius: 12,
                background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </div>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
              {agencyName}
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.45)", letterSpacing: "0.6px", textTransform: "uppercase" }}>
              CRM
            </div>
          </div>
          {isMobile && (
            <button type="button" onClick={() => setMobileOpen(false)}
              style={{ border: "none", background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", width: 30, height: 30, borderRadius: 8, fontSize: 18, cursor: "pointer", lineHeight: 1, marginLeft: "auto" }}>
              ×
            </button>
          )}
        </div>
      </div>

      <nav style={{ flex: 1, padding: "4px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
        <NavLink
          to="/admin"
          end
          onClick={() => { if (isMobile) setMobileOpen(false); }}
          style={linkStyle}
        >
          <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <HiOutlineSquares2X2 size={19} />
          </span>
          <span style={{ flex: 1 }}>Prezentare generală</span>
        </NavLink>

        <NavLink
          to="/admin/adauga-proprietate"
          onClick={() => { if (isMobile) setMobileOpen(false); }}
          style={linkStyle}
        >
          <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <HiOutlinePlusCircle size={19} />
          </span>
          <span style={{ flex: 1 }}>Adaugă proprietate</span>
        </NavLink>

        {roleAdmin && (
          <NavLink
            to="/admin/agenti"
            onClick={() => { if (isMobile) setMobileOpen(false); }}
            style={linkStyle}
          >
            <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <HiOutlineUserCircle size={19} />
            </span>
            <span style={{ flex: 1 }}>Echipă</span>
          </NavLink>
        )}

        {NAV_SECTIONS.filter(s => {
          if (!roleManagerOrAdmin && (s.label === "Marketing" || s.label === "Analiză")) return false;
          return true;
        }).map((section) => (
          <div key={section.label}>
            <button
              type="button"
              onClick={() => toggleSection(section.label)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 10px 6px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              <span style={{ flex: 1, textAlign: "left" }}>{section.label}</span>
              <HiOutlineChevronDown
                size={12}
                style={{
                  transform: collapsed[section.label] ? "rotate(-90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  flexShrink: 0,
                }}
              />
            </button>
            {!collapsed[section.label] && (
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {section.items.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.href}
                    onClick={() => { if (isMobile) setMobileOpen(false); }}
                    style={linkStyle}
                  >
                    <span style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon size={19} />
                    </span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div style={{ padding: "10px 16px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <a
          href="https://landing-nu-ochre-22.vercel.app/dashboard"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 10px", borderRadius: 10,
            fontSize: 12, fontWeight: 500, textDecoration: "none",
            color: "rgba(255,255,255,0.45)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,0.45)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Pagina principală
        </a>
      </div>

      <div style={{ padding: "12px 16px 16px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        {user && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={user.imageUrl}
                alt={user.fullName || user.username || ""}
                style={{
                  width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.fullName || user.username || "Utilizator"}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.primaryEmailAddress?.emailAddress || ""}
                </div>
              </div>
            </div>
            <SignOutButton>
              <button
                type="button"
                style={{
                  width: "100%",
                  border: "0.5px solid rgba(255,255,255,0.15)",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "7px 0",
                  borderRadius: 8,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                  e.currentTarget.style.color = "#fca5a5";
                  e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}
              >
                Ieși
              </button>
            </SignOutButton>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 900;
  });
  const { getToken } = useAuth();
  const { isLoaded: orgsLoaded, userMemberships, setActive } = useOrganizationList({ userMemberships: true });
  const orgAutoSelected = useRef(false);

  useEffect(() => {
    if (orgsLoaded && userMemberships?.data?.length > 0 && !orgAutoSelected.current) {
      orgAutoSelected.current = true;
      const firstOrg = userMemberships.data[0].organization;
      setActive({ organization: firstOrg.id }).then(() => {
        syncAllStores();
        syncAgenti();
      }).catch(() => {});
    }
  }, [orgsLoaded, userMemberships, setActive]);

  useEffect(() => {
    setTokenGetter(() => getToken({ template: "api" }));
    syncAllStores();
    syncAgenti();
    fetchMyRole(() => getToken({ template: "api" }));
  }, [getToken]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-tertiary)", fontFamily: "var(--font-sans)" }}>
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000 }} />
      )}

      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isMobile={isMobile} />

      <div style={{ flex: 1, minWidth: 0, minHeight: "100vh", overflowY: "auto" }}>
        {isMobile && (
          <div style={{
            height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 16px", borderBottom: "0.5px solid var(--border-tertiary)",
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)",
            position: "sticky", top: 0, zIndex: 50,
          }}>
            <button type="button" onClick={() => setMobileOpen(true)}
              style={{ border: "none", background: "var(--bg-secondary)", fontSize: 20, cursor: "pointer", color: "var(--text-primary)", width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              ☰
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>Dashboard</div>
            </div>
            <div style={{ width: 38 }} />
          </div>
        )}

        <Outlet />
      </div>
    </div>
  );
}
