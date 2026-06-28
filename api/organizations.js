import { eq } from "drizzle-orm";
import { getDb, setOrgContext } from "./_db.js";
import { organizations, agenti } from "../src/db/schema.js";
import { requireAuth } from "./_auth.js";

async function parseBody(req) {
  if (req.body) return req.body;
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function generateShortId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export default async function handler(req, res) {
  const auth = await requireAuth(req, res);
  if (!auth) return;
  const { userId, orgId, orgShortId, userName } = auth;
  await setOrgContext(orgId, userId);

  try {
    if (req.method === "GET") {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.searchParams.get("action") === "me") {
        return res.json({ role: auth.role, userName: auth.userName });
      }

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

    if (req.method === "POST") {
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

    if (req.method === "PUT") {
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
    console.error("Organizations API error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
