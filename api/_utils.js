import { and, eq } from "drizzle-orm";
import { getDb, setOrgContext } from "./_db.js";
import { requireAuth } from "./_auth.js";

const MAX_BODY = 1024 * 1024;

export async function parseBody(req, maxSize = MAX_BODY) {
  if (req._body) return req._body;

  if (req.body !== undefined && req.body !== null && typeof req.body !== "string") {
    req._body = req.body;
    return req.body;
  }

  if (typeof req.text === "function") {
    try {
      const text = await req.text();
      const parsed = JSON.parse(text || "{}");
      req._body = parsed;
      return parsed;
    } catch (e) {
      const err = new Error("Invalid JSON");
      err.statusCode = 400;
      throw err;
    }
  }

  const len = parseInt(req.headers["content-length"], 10);
  if (len > maxSize) {
    const err = new Error("Payload too large");
    err.statusCode = 413;
    throw err;
  }

  return new Promise((resolve, reject) => {
    let body = "";
    let received = 0;
    req.on("data", (chunk) => {
      received += chunk.length;
      if (received > maxSize) {
        const err = new Error("Payload too large");
        err.statusCode = 413;
        reject(err);
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        req._body = parsed;
        resolve(parsed);
      } catch {
        const err = new Error("Invalid JSON");
        err.statusCode = 400;
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export function getSearchParam(req, name) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return url.searchParams.get(name);
}

export function sendError(res, err) {
  if (res.headersSent) return;
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;
  if (statusCode === 500) {
    console.error(err);
  }
  res.status(statusCode).json({ error: message });
}

export function createCrudHandler(table, opts = {}) {
  const { onCreate, onUpdate } = opts;
  return async function handler(req, res) {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    const { userId, orgId, orgShortId, userName } = auth;
    await setOrgContext(orgId, userId);
    const id = getSearchParam(req, "id");

    try {
      if (req.method === "GET") {
        if (id) {
          const rows = await getDb()
            .select()
            .from(table)
            .where(and(eq(table.orgId, orgId), eq(table.id, parseInt(id))));
          return res.json(rows[0] || null);
        }
        const rows = await getDb()
          .select()
          .from(table)
          .where(eq(table.orgId, orgId));
        return res.json(rows);
      }

      if (req.method === "POST") {
        const body = await parseBody(req);
        const [row] = await getDb()
          .insert(table)
          .values({ ...body, userId, orgId, orgShortId, createdByName: userName })
          .returning();
        if (onCreate) onCreate(row, orgId, userName);
        return res.status(201).json(row);
      }

      if (req.method === "PUT") {
        const body = await parseBody(req);
        const { id: rowId, ...data } = body;
        if (!rowId) return res.status(400).json({ error: "ID lipsă" });
        const [row] = await getDb()
          .update(table)
          .set({ ...data, updatedByName: userName })
          .where(and(eq(table.orgId, orgId), eq(table.id, parseInt(rowId))))
          .returning();
        if (onUpdate) onUpdate({ ...data, id: rowId }, orgId, userName);
        return res.json(row);
      }

      if (req.method === "DELETE") {
        let deleteId = id;
        if (!deleteId) {
          const body = await parseBody(req);
          deleteId = body?.id;
        }
        if (!deleteId) return res.status(400).json({ error: "ID lipsă" });
        await getDb()
          .delete(table)
          .where(and(eq(table.orgId, orgId), eq(table.id, parseInt(deleteId))));
        return res.json({ success: true });
      }

      res.status(405).json({ error: "Metodă nepermisă" });
    } catch (err) {
      sendError(res, err);
    }
  };
}
