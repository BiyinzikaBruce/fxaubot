"use client"

import { useState, useEffect } from "react"
import { Settings, Save } from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { useSession } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

const inputCls = "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] w-full"

export default function SettingsPage() {
  const { data: session } = useSession()
  const user = session?.user

  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user) {
      setName(user.name ?? "")
      setAvatarUrl((user as { avatarUrl?: string }).avatarUrl ?? "")
    }
  }, [user])

  async function handleSave() {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl }),
      })
      if (!res.ok) throw new Error("Failed to save settings")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const plan = user?.plan ?? "none"
  const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U"

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <PageHeader
        title="Settings"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
      />

      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 flex flex-col gap-5">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Profile</p>

        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#7B5CF0] flex items-center justify-center text-white text-lg font-bold shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-14 w-14 rounded-full object-cover" />
            ) : initials}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{name || "Your Name"}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{user?.email}</p>
            <span className="inline-flex items-center rounded-full bg-[var(--color-accent-primary)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--color-accent-primary)] capitalize mt-1">
              {plan === "none" ? "Free" : plan}
            </span>
          </div>
        </div>

        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Display name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
        </label>

        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Email address
          <input value={user?.email ?? ""} disabled className={cn(inputCls, "opacity-50 cursor-not-allowed")} />
          <span className="text-[var(--color-text-muted)] font-normal">Email cannot be changed here.</span>
        </label>

        <label className="flex flex-col gap-1 text-xs text-[var(--color-text-muted)]">
          Avatar URL
          <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className={inputCls} />
        </label>

        {error && <p className="text-xs text-[var(--color-loss)]">{error}</p>}
        {saved && <p className="text-xs text-[var(--color-profit)]">Settings saved successfully.</p>}

        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 w-fit">
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 flex flex-col gap-4">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Account Info</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["Role", user?.role ?? "trader"],
            ["Plan", plan === "none" ? "Free" : plan],
            ["Member since", user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-xs text-[var(--color-text-muted)]">{label as string}</p>
              <p className="font-medium text-[var(--color-text-primary)] capitalize">{value as string}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
