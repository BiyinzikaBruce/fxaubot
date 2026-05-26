import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ALGO = "aes-256-gcm"

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET ?? ""
  return Buffer.from(secret.padEnd(32, "0").slice(0, 32))
}

export function encryptKey(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString("base64")
}

export function decryptKey(ciphertext: string): string {
  const buf = Buffer.from(ciphertext, "base64")
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const encrypted = buf.subarray(28)
  const decipher = createDecipheriv(ALGO, getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8")
}
