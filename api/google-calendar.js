import { eq } from "drizzle-orm";
import { getDb, getSql, setOrgContext } from "./_db.js";
import { googleTokens } from "../src/db/schema.js";
import { requireAuth } from "./_auth.js";
import { parseBody, sendError } from "./_utils.js";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

async function getStoredToken(userId) {
  try {
    const rows = await getDb().select().from(googleTokens).where(eq(googleTokens.userId, userId));
    return rows[0] || null;
  } catch {
    return null;
  }
}

async function storeToken(userId, orgId, tokenData, email) {
  const existing = await getStoredToken(userId);
  if (existing) {
    await getDb().update(googleTokens)
      .set({
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || existing.refreshToken,
        expiryDate: tokenData.expiry_date ? Date.now() + tokenData.expires_in * 1000 : null,
        email: email || existing.email,
        connected: true,
        updatedAt: new Date(),
      })
      .where(eq(googleTokens.userId, userId));
  } else {
    await getDb().insert(googleTokens).values({
      userId,
      orgId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiryDate: tokenData.expiry_date ? Date.now() + tokenData.expires_in * 1000 : null,
      email: email || null,
      connected: true,
    });
  }
}

async function getValidAccessToken(userId) {
  const token = await getStoredToken(userId);
  if (!token || !token.connected) return null;

  if (token.expiryDate && Date.now() > token.expiryDate) {
    if (!token.refreshToken) return null;
    try {
      const res = await fetch(TOKEN_URL, {
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
      await getDb().update(googleTokens)
        .set({
          accessToken: data.access_token,
          expiryDate: data.expires_in ? Date.now() + data.expires_in * 1000 : null,
          updatedAt: new Date(),
        })
        .where(eq(googleTokens.userId, userId));
      return data.access_token;
    } catch {
      return null;
    }
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

async function syncEvent(accessToken, calendarId, pr) {
  const gcal = (path, opts = {}) =>
    fetch(`${CALENDAR_API}${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...opts.headers },
    });

  const event = programareToEvent(pr);

  if (pr.googleEventId) {
    try {
      const upd = await gcal(`/calendars/${encodeURIComponent(calendarId)}/events/${pr.googleEventId}`, {
        method: "PUT", body: JSON.stringify(event),
      });
      if (upd.ok) return await upd.json();
    } catch {}
  }

  const list = await gcal(`/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=programareId%3D${pr.id}&maxResults=1`);
  if (list.ok) {
    const data = await list.json();
    if (data.items?.length > 0) {
      const existingId = data.items[0].id;
      const upd = await gcal(`/calendars/${encodeURIComponent(calendarId)}/events/${existingId}`, {
        method: "PUT", body: JSON.stringify(event),
      });
      if (upd.ok) return await upd.json();
    }
  }

  const create = await gcal(`/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST", body: JSON.stringify(event),
  });
  if (create.ok) return await create.json();
  return null;
}

export default async function handler(req, res) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const { userId, orgId } = auth;
  await setOrgContext(orgId, userId);

  const url = new URL(req.url, `http://${req.headers.host}`);
  const action = url.searchParams.get("action");

  try {
    if (req.method === "GET" && action === "status") {
      const token = await getStoredToken(userId);
      return res.json({ connected: !!(token && token.connected), email: token?.email || null });
    }

    if (req.method === "POST" && !action) {
      const body = await parseBody(req);
      const { code, redirectUri } = body;
      if (!code) return res.status(400).json({ error: "Authorization code missing" });

      const tokenRes = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.text();
        return res.status(400).json({ error: "Token exchange failed: " + err });
      }

      const tokenData = await tokenRes.json();

      let email = null;
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          email = userData.email;
        }
      } catch {}

      await storeToken(userId, orgId, tokenData, email);
      return res.json({ ok: true, email });
    }

    if (req.method === "DELETE") {
      await getDb().update(googleTokens)
        .set({ connected: false, updatedAt: new Date() })
        .where(eq(googleTokens.userId, userId));
      return res.json({ ok: true });
    }

    if (req.method === "POST" && action === "sync") {
      const body = await parseBody(req);
      const { programare } = body;
      if (!programare) return res.status(400).json({ error: "Programare missing" });

      const token = await getValidAccessToken(userId);
      if (!token) return res.status(400).json({ error: "Google Calendar not connected or token expired" });

      const stored = await getStoredToken(userId);
      const calendarId = stored?.calendarId || "primary";
      const event = await syncEvent(token, calendarId, programare);

      return res.json({ ok: true, eventId: event?.id });
    }

    if (req.method === "POST" && action === "delete-event") {
      const body = await parseBody(req);
      const { googleEventId, programareId } = body;

      const token = await getValidAccessToken(userId);
      if (!token) return res.status(400).json({ error: "Google Calendar not connected" });

      const stored = await getStoredToken(userId);
      const calendarId = stored?.calendarId || "primary";

      if (googleEventId) {
        await fetch(`${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (programareId) {
        const list = await fetch(`${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=programareId%3D${programareId}&maxResults=1`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (list.ok) {
          const data = await list.json();
          for (const ev of (data.items || [])) {
            await fetch(`${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${ev.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }
      }

      return res.json({ ok: true });
    }

    res.status(405).json({ error: "Metodă nepermisă" });
  } catch (err) {
    sendError(res, err);
  }
}
