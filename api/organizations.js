import { eq } from "drizzle-orm";
import { getDb, getSql, setOrgContext } from "./_db.js";
import { organizations, agenti, googleTokens } from "../src/db/schema.js";
import { requireAuth } from "./_auth.js";
import { parseBody, sendError } from "./_utils.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

function generateShortId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

async function getGoogleToken(userId) {
  try {
    const rows = await getDb().select().from(googleTokens).where(eq(googleTokens.userId, userId));
    return rows[0] || null;
  } catch { return null; }
}

async function storeGoogleToken(userId, orgId, tokenData, email) {
  const existing = await getGoogleToken(userId);
  if (existing) {
    await getDb().update(googleTokens).set({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || existing.refreshToken,
      expiryDate: tokenData.expiry_date ? Date.now() + tokenData.expires_in * 1000 : null,
      email: email || existing.email,
      connected: true,
      updatedAt: new Date(),
    }).where(eq(googleTokens.userId, userId));
  } else {
    await getDb().insert(googleTokens).values({
      userId, orgId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiryDate: tokenData.expiry_date ? Date.now() + tokenData.expires_in * 1000 : null,
      email: email || null,
      connected: true,
    });
  }
}

async function getValidGoogleToken(userId) {
  const token = await getGoogleToken(userId);
  if (!token || !token.connected) return null;
  if (token.expiryDate && Date.now() > token.expiryDate) {
    if (!token.refreshToken) return null;
    try {
      const res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: token.refreshToken,
          grant_type: "refresh_token",
        }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      await getDb().update(googleTokens).set({
        accessToken: data.access_token,
        expiryDate: data.expires_in ? Date.now() + data.expires_in * 1000 : null,
        updatedAt: new Date(),
      }).where(eq(googleTokens.userId, userId));
      return data.access_token;
    } catch { return null; }
  }
  return token.accessToken;
}

function programareToEvent(pr) {
  const data = pr.data || new Date().toISOString().slice(0, 10);
  const ora = pr.ora || "10:00";
  const start = new Date(`${data}T${ora}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    summary: pr.titlu || "Programare",
    location: pr.locatie !== "—" ? pr.locatie : "",
    description: `${pr.client || ""} · ${pr.telefon || ""}\n${pr.observatii || ""}\nTip: ${pr.tip || ""}`,
    start: { dateTime: start.toISOString(), timeZone: "Europe/Bucharest" },
    end: { dateTime: end.toISOString(), timeZone: "Europe/Bucharest" },
    extendedProperties: { private: { programareId: String(pr.id) } },
  };
}

async function googleSyncEvent(accessToken, calendarId, pr) {
  const gcal = (path, opts = {}) =>
    fetch(`${GOOGLE_CALENDAR_API}${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...opts.headers },
    });
  const event = programareToEvent(pr);
  const list = await gcal(`/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=programareId%3D${pr.id}&maxResults=1`);
  if (list.ok) {
    const data = await list.json();
    if (data.items?.length > 0) {
      const upd = await gcal(`/calendars/${encodeURIComponent(calendarId)}/events/${data.items[0].id}`, { method: "PUT", body: JSON.stringify(event) });
      if (upd.ok) return await upd.json();
    }
  }
  const create = await gcal(`/calendars/${encodeURIComponent(calendarId)}/events`, { method: "POST", body: JSON.stringify(event) });
  if (create.ok) return await create.json();
  return null;
}

export default async function handler(req, res) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const { userId, orgId, orgShortId, userName } = auth;
  await setOrgContext(orgId, userId);
  const url = new URL(req.url, `http://${req.headers.host}`);
  const action = url.searchParams.get("action");

  try {
    if (action === "me") {
      return res.json({ role: auth.role, userName: auth.userName });
    }

    if (action === "google-status") {
      const token = await getGoogleToken(userId);
      return res.json({ connected: !!(token && token.connected), email: token?.email || null });
    }

    if (action === "google-disconnect") {
      await getDb().update(googleTokens)
        .set({ connected: false, updatedAt: new Date() })
        .where(eq(googleTokens.userId, userId));
      return res.json({ ok: true });
    }

    if (action === "google-connect" && req.method === "POST") {
      const body = await parseBody(req);
      const { code, redirectUri } = body;
      if (!code) return res.status(400).json({ error: "Authorization code missing" });
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(500).json({ error: "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured" });
      }
      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code, grant_type: "authorization_code", redirect_uri: redirectUri,
        }),
      });
      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error("Google token exchange failed:", tokenRes.status, errText);
        return res.status(400).json({ error: "Token exchange failed: " + errText });
      }
      const tokenData = await tokenRes.json();
      let email = null;
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (userRes.ok) { const u = await userRes.json(); email = u.email; }
      } catch (e) {
        console.error("Google userinfo failed:", e.message);
      }
      await storeGoogleToken(userId, orgId, tokenData, email);
      return res.json({ ok: true, email });
    }

    if (action === "google-sync" && req.method === "POST") {
      const body = await parseBody(req);
      const { programare } = body;
      if (!programare) return res.status(400).json({ error: "Programare missing" });
      const accessToken = await getValidGoogleToken(userId);
      if (!accessToken) return res.status(400).json({ error: "Google Calendar not connected" });
      const stored = await getGoogleToken(userId);
      const calendarId = stored?.calendarId || "primary";
      const event = await googleSyncEvent(accessToken, calendarId, programare);
      return res.json({ ok: true, eventId: event?.id });
    }

    if (action === "google-delete-event" && req.method === "POST") {
      const body = await parseBody(req);
      const { programareId } = body;
      const accessToken = await getValidGoogleToken(userId);
      if (!accessToken) return res.status(400).json({ error: "Google Calendar not connected" });
      const stored = await getGoogleToken(userId);
      const calendarId = stored?.calendarId || "primary";
      const list = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=programareId%3D${programareId}&maxResults=1`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (list.ok) {
        const data = await list.json();
        for (const ev of (data.items || [])) {
          await fetch(`${GOOGLE_CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${ev.id}`, {
            method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` },
          });
        }
      }
      return res.json({ ok: true });
    }

    if (!action && req.method === "GET") {
      const rows = await getDb()
        .select({
          slug: organizations.slug,
          logoUrl: organizations.logoUrl,
          landingEnabled: organizations.landingEnabled,
          landingPrimaryColor: organizations.landingPrimaryColor,
          landingSecondaryColor: organizations.landingSecondaryColor,
          landingAboutText: organizations.landingAboutText,
          landingExperienceYears: organizations.landingExperienceYears,
          phone: organizations.phone,
          email: organizations.email,
          address: organizations.address,
          companyName: organizations.companyName,
          cui: organizations.cui,
        })
        .from(organizations)
        .where(eq(organizations.clerkId, orgId));

      return res.json(rows[0] || null);
    }

    if (!action && req.method === "POST") {
      const body = await parseBody(req);
      const { name, userName: uName, userEmail } = body;

      const existing = await getDb()
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.clerkId, orgId));

      if (existing.length > 0) {
        return res.json(existing[0]);
      }

      const shortId = generateShortId();
      const [row] = await getDb()
        .insert(organizations)
        .values({
          clerkId: orgId,
          shortId,
          name: name || "Agenție",
          createdAt: new Date(),
        })
        .returning();

      await getDb()
        .insert(agenti)
        .values({
          orgId,
          orgShortId: shortId,
          userId,
          nume: uName || "Administrator",
          email: userEmail || null,
          rol: "admin",
          createdByName: uName || "Administrator",
          createdAt: new Date(),
        });

      return res.status(201).json(row);
    }

    if (!action && req.method === "PUT") {
      const body = await parseBody(req);
      const { slug, logoUrl, landingEnabled, landingPrimaryColor, landingSecondaryColor, landingAboutText, landingExperienceYears, phone, email, address, companyName, cui } = body;

      if (!slug || !slug.trim()) {
        return res.status(400).json({ error: "Subdomeniul (slug) este obligatoriu" });
      }

      const slugPattern = /^[a-z0-9-]+$/;
      if (!slugPattern.test(slug)) {
        return res.status(400).json({ error: "Subdomeniul poate conține doar litere mici, cifre și liniuțe" });
      }

      const existing = await getDb()
        .select({ id: organizations.id, clerkId: organizations.clerkId })
        .from(organizations)
        .where(eq(organizations.slug, slug));

      if (existing.some(o => o.clerkId !== orgId)) {
        return res.status(409).json({ error: "Acest subdomeniu este deja folosit de o altă agenție" });
      }

      const [row] = await getDb()
        .update(organizations)
        .set({
          slug,
          logoUrl: logoUrl ?? undefined,
          landingEnabled: landingEnabled ?? undefined,
          landingPrimaryColor: landingPrimaryColor ?? undefined,
          landingSecondaryColor: landingSecondaryColor ?? undefined,
          landingAboutText: landingAboutText ?? undefined,
          landingExperienceYears: landingExperienceYears ?? undefined,
          phone: phone ?? undefined,
          email: email ?? undefined,
          address: address ?? undefined,
          companyName: companyName ?? undefined,
          cui: cui ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(organizations.clerkId, orgId))
        .returning();

      return res.json(row);
    }

    res.status(405).json({ error: "Metodă nepermisă" });
  } catch (err) {
    console.error("Organizations API error:", err?.message, err?.stack);
    res.status(500).json({ error: err?.message || "Internal server error", stack: err?.stack?.split("\n")?.slice(0, 3) });
  }
}
