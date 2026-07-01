import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = join(__dirname, ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

const RATE_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000;
const RATE_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 60;
const RATE_CLEANUP = parseInt(process.env.RATE_LIMIT_CLEANUP_MS, 10) || 300_000;

const RATE_STORE = new Map();

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function rateLimit(req, res) {
  const ip = getClientIp(req);
  const now = Date.now();
  let entry = RATE_STORE.get(ip);

  if (!entry) {
    entry = { timestamps: [], reset: now + RATE_WINDOW };
    RATE_STORE.set(ip, entry);
  }

  entry.timestamps = entry.timestamps.filter(t => now - t < RATE_WINDOW);
  entry.timestamps.push(now);

  const remaining = RATE_MAX - entry.timestamps.length;
  const reset = Math.ceil((entry.timestamps[0] + RATE_WINDOW - now) / 1000);

  res.setHeader("X-RateLimit-Limit", RATE_MAX);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, remaining));
  res.setHeader("X-RateLimit-Reset", reset);

  if (entry.timestamps.length > RATE_MAX) {
    res.status(429).json({ error: "Prea multe cereri. Încearcă mai târziu." });
    return false;
  }

  return true;
}

setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW;
  for (const [ip, entry] of RATE_STORE) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff);
    if (entry.timestamps.length === 0) {
      RATE_STORE.delete(ip);
    }
  }
}, RATE_CLEANUP).unref();

const HANDLERS = new Map();

async function loadHandler(name) {
  if (HANDLERS.has(name)) return HANDLERS.get(name);
  const path = join(__dirname, "api", name + ".js");
  if (!existsSync(path)) return null;
  try {
    const mod = await import(path);
    const handler = mod.default;
    HANDLERS.set(name, handler);
    return handler;
  } catch (e) {
    console.error(`Failed to load /api/${name}:`, e.message);
    return null;
  }
}

function parseUrl(url) {
  const u = new URL(url, "http://localhost");
  return {
    pathname: u.pathname,
    searchParams: u.searchParams,
  };
}

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:3002")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true;
  return ALLOWED_ORIGINS.some((allowed) => {
    if (allowed === origin) return true;
    if (allowed.endsWith(".*")) {
      const prefix = allowed.slice(0, -2);
      return origin.startsWith(prefix);
    }
    return false;
  });
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function patchRes(res, req) {
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (data) {
    const body = JSON.stringify(data);
    this.setHeader("Content-Type", "application/json");
    this.end(body);
    return this;
  };
  setCors(req, res);
}

const server = createServer(async (req, res) => {
  const start = Date.now();
  patchRes(res, req);

  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;
    res.writeHead(204, {
      "Access-Control-Allow-Origin": (origin && isOriginAllowed(origin)) ? origin : "",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...(origin ? { "Vary": "Origin" } : {}),
    });
    res.end();
    console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
    return;
  }

  if (!rateLimit(req, res)) {
    console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
    return;
  }

  const { pathname } = parseUrl(req.url);
  const match = pathname.match(/^\/api\/([a-zA-Z_-]+)/);

  if (!match) {
    res.status(404).json({ error: "Not found" });
    console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
    return;
  }

  const name = match[1];
  const handler = await loadHandler(name);

  if (!handler) {
    res.status(404).json({ error: `API /${name} not found` });
    console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
    return;
  }

  try {
    await handler(req, res);
  } catch (e) {
    console.error(`Error in /api/${name}:`, e);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
});

const PORT = process.env.API_PORT || 3002;
server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}/api`);
});
