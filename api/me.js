import { requireAuth } from "./_auth.js";

export default async function handler(req, res) {
  const auth = await requireAuth(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    return res.json({ role: auth.role, userName: auth.userName });
  }

  res.status(405).json({ error: "Metodă nepermisă" });
}
