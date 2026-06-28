let _role = "admin";
let _userName = null;

export function setRole(role) {
  _role = role || "agent";
}

export function getRole() {
  return _role;
}

export function getUserName() {
  return _userName;
}

export function isAdmin() {
  return _role === "admin";
}

export function isManagerOrAdmin() {
  return _role === "admin" || _role === "manager";
}

export async function fetchMyRole(tokenGetter) {
  try {
    const token = await tokenGetter();
    if (!token) return;
    const res = await fetch("/api/organizations?action=me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setRole(data.role);
      _userName = data.userName || null;
    }
  } catch (e) {
    console.warn("Failed to fetch role:", e);
  }
}
