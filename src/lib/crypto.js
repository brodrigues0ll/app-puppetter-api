import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY deve ter 64 caracteres hexadecimais (32 bytes)");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(text) {
  if (!text) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text) {
  if (!text) return "";
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
