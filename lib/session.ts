import { auth } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers })
}
