import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) return null;
  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(text) {
  if (!text) return null;
  const key = getKey();
  if (!key) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${encrypted.toString("base64")}.${tag.toString("base64")}`;
}

export function decrypt(encrypted) {
  if (!encrypted) return null;
  const key = getKey();
  if (!key) return encrypted;
  try {
    const [ivB64, dataB64, tagB64] = encrypted.split(".");
    const iv = Buffer.from(ivB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return encrypted;
  }
}
