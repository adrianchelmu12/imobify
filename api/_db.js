import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

let _originalFetch = null;

export async function setOrgContext(orgId, userId) {
  if (!_originalFetch) {
    _originalFetch = neonConfig.fetchFunction || fetch;
  }
  neonConfig.fetchFunction = async (input, init) => {
    const body = JSON.parse(init.body);
    if (!body.session) {
      body.session = {};
    }
    body.session["app.current_org_id"] = orgId;
    body.session["app.current_user_id"] = userId;
    init.body = JSON.stringify(body);
    return _originalFetch(input, init);
  };
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nu este setat in environment variables");
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql);
}
