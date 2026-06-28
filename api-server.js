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

const HANDLERS = new Map();

async function loadHandler(name) {
  if (HANDLERS.has(name)) return HANDLERS.get(name);
  const path = join(__dirname, "api", name + ".js");
  if (!existsSync(path)) return null;
  try {
    const mod = await import(path + "?t=" + Date.now());
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

function patchRes(res) {
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

const server = createServer(async (req, res) => {
  patchRes(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    res.end();
    return;
  }

  const { pathname } = parseUrl(req.url);
  const match = pathname.match(/^\/api\/([a-zA-Z_-]+)/);

  if (!match) {
    return res.status(404).json({ error: "Not found" });
  }

  const name = match[1];
  const handler = await loadHandler(name);

  if (!handler) {
    return res.status(404).json({ error: `API /${name} not found` });
  }

  try {
    await handler(req, res);
  } catch (e) {
    console.error(`Error in /api/${name}:`, e);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

const PORT = process.env.API_PORT || 3002;
server.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}/api`);
});
