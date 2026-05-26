import { defineConfig } from "prisma/config"
import { readFileSync } from "fs"
import { resolve } from "path"

// Prisma CLI only auto-loads .env, not .env.local
try {
  const content = readFileSync(resolve(".env.local"), "utf8")
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "")
    }
  }
} catch {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
