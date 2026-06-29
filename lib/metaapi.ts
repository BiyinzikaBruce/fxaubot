// Use the explicit Node/CJS subpath — the bare "metaapi.cloud-sdk" export map
// prefers a browser-targeted ESM build under Next's externals resolution,
// which crashes server-side with "window is not defined".
import MetaApi from "metaapi.cloud-sdk/node"

let client: MetaApi | null = null

function getClient(): MetaApi {
  const token = process.env.METAAPI_TOKEN
  if (!token) throw new Error("METAAPI_TOKEN is not configured")
  if (!client) client = new MetaApi(token)
  return client
}

export type Mt5Platform = "mt4" | "mt5"

export type Mt5ProvisionInput = {
  name: string
  login: string
  password: string
  server: string
  platform: Mt5Platform
}

export type Mt5AccountSnapshot = {
  state: string
  connectionStatus: string
  balance?: number
  equity?: number
  currency?: string
}

/** Friendly messages for the MetaApi error codes seen in their official examples. */
function friendlyError(err: unknown): string {
  const code = (err as { details?: { code?: string } })?.details?.code
  switch (code) {
    case "E_SRV_NOT_FOUND":
      return "Broker server name not recognized. Double-check the server name (e.g. Exness-MT5Real8)."
    case "E_AUTH":
      return "Broker rejected the login/password combination."
    case "E_SERVER_TIMEZONE":
      return "Couldn't detect broker settings automatically. Try again in a moment."
    case "E_RESOURCE_SLOTS":
      return "MetaApi account capacity exceeded for this plan."
    default:
      return err instanceof Error ? err.message : "Failed to connect to MT5 account."
  }
}

/** Registers (or reuses) a MetaApi cloud account and starts deployment. Returns immediately — does not block on the broker connection, since that can take 1-3 minutes on first deploy. */
export async function provisionMt5Account(input: Mt5ProvisionInput): Promise<string> {
  const api = getClient()
  const account = await api.metatraderAccountApi.createAccount({
    name: input.name,
    login: input.login,
    password: input.password,
    server: input.server,
    platform: input.platform,
    magic: 0,
    manualTrades: true,
    // "high" reliability (the SDK default) uses redundant infra billed at 2x resource
    // slots and requires a funded MetaApi plan. "regular" is the standard tier and
    // is the right default for a multi-tenant SaaS provisioning many user accounts.
    reliability: "regular",
  })
  await account.deploy()
  return account.id
}

/** Cheap, non-blocking status check — reloads account state from MetaApi without waiting for a broker connection. */
export async function getMt5AccountStatus(metaApiAccountId: string): Promise<Mt5AccountSnapshot> {
  const api = getClient()
  const account = await api.metatraderAccountApi.getAccount(metaApiAccountId)
  await account.reload()

  if (account.state !== "DEPLOYED" || account.connectionStatus !== "CONNECTED") {
    return { state: account.state, connectionStatus: account.connectionStatus }
  }

  const connection = account.getRPCConnection()
  try {
    await connection.connect()
    await connection.waitSynchronized(20)
    const info = await connection.getAccountInformation()
    return {
      state: account.state,
      connectionStatus: account.connectionStatus,
      balance: info.balance,
      equity: info.equity,
      currency: info.currency,
    }
  } finally {
    await connection.close()
  }
}

export async function removeMt5Account(metaApiAccountId: string): Promise<void> {
  const api = getClient()
  const account = await api.metatraderAccountApi.getAccount(metaApiAccountId)
  try {
    await account.undeploy()
  } catch {
    // best-effort — proceed to remove even if undeploy fails (e.g. already undeployed)
  }
  await account.remove()
}

export { friendlyError }
