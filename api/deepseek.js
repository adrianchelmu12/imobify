import { parseBody, sendError } from "./_utils.js";
import { requireAuth } from "./_auth.js";

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodă nepermisă" });
  }

  const auth = await requireAuth(req, res);
  if (!auth) return;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "DEEPSEEK_API_KEY nu este configurată" });
  }

  try {
    const body = await parseBody(req);

    const response = await fetch(DEEPSEEK_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: body.messages || [],
        temperature: body.temperature ?? 0.7,
        max_tokens: body.max_tokens ?? 1024,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    sendError(res, err);
  }
}
