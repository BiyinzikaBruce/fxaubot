import { betterAuth } from "better-auth"
import { prismaAdapter } from "@better-auth/prisma-adapter"
import { prisma } from "@/lib/db"

const appURL = (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/[./\s]+$/, "")

const googleProvider = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectURI: `${appURL}/api/auth/callback/google`,
      },
    }
  : {}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: appURL,
  trustedOrigins: [
    "https://fxaubot.vercel.app",
    "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: googleProvider,
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
})

export type Session = typeof auth.$Infer.Session
