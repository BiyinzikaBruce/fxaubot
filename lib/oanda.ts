const OANDA_BASE = {
  practice: "https://api-fxpractice.oanda.com",
  live: "https://api-fxtrade.oanda.com",
} as const

export type OandaEnvironment = "practice" | "live"

export type OandaAccountSummary = {
  id: string
  currency: string
  balance: number
  equity: number       // NAV in OANDA terms
  unrealizedPL: number
  openTradeCount: number
  alias?: string
}

async function oandaFetch(
  token: string,
  environment: OandaEnvironment,
  path: string,
): Promise<Response> {
  const base = OANDA_BASE[environment]
  return fetch(`${base}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}

export async function getOandaAccountSummary(
  token: string,
  accountId: string,
  environment: OandaEnvironment,
): Promise<OandaAccountSummary> {
  const res = await oandaFetch(token, environment, `/v3/accounts/${accountId}/summary`)

  if (res.status === 401) throw new Error("Invalid OANDA access token. Check your API token and try again.")
  if (res.status === 400 || res.status === 404) throw new Error("OANDA account ID not found. Check the account number format (e.g. 001-001-1234567-001).")
  if (!res.ok) throw new Error(`OANDA API error: ${res.status} ${res.statusText}`)

  const json = await res.json()
  const a = json.account

  return {
    id: a.id,
    currency: a.currency,
    balance: parseFloat(a.balance),
    equity: parseFloat(a.NAV),
    unrealizedPL: parseFloat(a.unrealizedPL ?? "0"),
    openTradeCount: a.openTradeCount ?? 0,
    alias: a.alias,
  }
}

export async function validateOandaCredentials(
  token: string,
  accountId: string,
  environment: OandaEnvironment,
): Promise<OandaAccountSummary> {
  return getOandaAccountSummary(token, accountId, environment)
}
