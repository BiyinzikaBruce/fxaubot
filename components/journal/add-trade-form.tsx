"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useCreateTrade } from "@/hooks/use-trades"
import { useAccounts, type TradingAccount } from "@/hooks/use-accounts"
import { cn } from "@/lib/utils"

const schema = z.object({
  accountId: z.string().min(1, "Account required"),
  symbol: z.string().min(1, "Symbol required"),
  side: z.enum(["long", "short"]),
  entryPrice: z.coerce.number().positive("Must be positive"),
  exitPrice: z.coerce.number().positive().optional().or(z.literal("")),
  quantity: z.coerce.number().positive("Must be positive"),
  fees: z.coerce.number().min(0),
  entryAt: z.string().min(1, "Entry date required"),
  exitAt: z.string().optional().or(z.literal("")),
  tags: z.string().optional(),
  playbookId: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional().or(z.literal("")),
})

type FormData = z.infer<typeof schema>

const SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "EUR/USD", "GBP/USD", "XRP/USDT", "ADA/USDT"]

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</label>
      {children}
      {error && <p className="text-xs text-[var(--color-loss)]">{error}</p>}
    </div>
  )
}

const inputCls = "rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)] transition-colors placeholder:text-[var(--color-text-muted)]"

export function AddTradeForm() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateTrade()
  const accountsQuery = useAccounts()
  const accounts: TradingAccount[] = accountsQuery.data ?? []

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      side: "long",
      fees: 0,
      entryAt: new Date().toISOString().slice(0, 16),
    },
  })

  async function onSubmit(data: FormData) {
    await mutateAsync({
      ...data,
      exitPrice: data.exitPrice === "" ? undefined : data.exitPrice,
      exitAt: data.exitAt === "" ? undefined : data.exitAt ? new Date(data.exitAt).toISOString() : undefined,
      entryAt: new Date(data.entryAt).toISOString(),
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      playbookId: data.playbookId === "" ? undefined : data.playbookId,
      rating: data.rating === "" ? undefined : data.rating,
    })
    router.push("/dashboard/journal")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="Account *" error={errors.accountId?.message}>
        <select {...register("accountId")} className={inputCls}>
          <option value="">Select account</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Symbol *" error={errors.symbol?.message}>
        <input
          {...register("symbol")}
          list="symbols"
          placeholder="e.g. BTC/USDT"
          className={inputCls}
        />
        <datalist id="symbols">
          {SYMBOLS.map((s) => <option key={s} value={s} />)}
        </datalist>
      </Field>

      <Field label="Side *">
        <div className="flex gap-2">
          {(["long", "short"] as const).map((side) => (
            <label
              key={side}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center rounded-lg border py-2 text-sm font-medium capitalize transition-colors",
                "border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)]",
              )}
            >
              <input {...register("side")} type="radio" value={side} className="sr-only" />
              {side}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Entry Price *" error={errors.entryPrice?.message}>
        <input {...register("entryPrice")} type="number" step="any" placeholder="0.00" className={inputCls} />
      </Field>

      <Field label="Exit Price" error={errors.exitPrice?.message}>
        <input {...register("exitPrice")} type="number" step="any" placeholder="Leave blank if open" className={inputCls} />
      </Field>

      <Field label="Quantity *" error={errors.quantity?.message}>
        <input {...register("quantity")} type="number" step="any" placeholder="0.001" className={inputCls} />
      </Field>

      <Field label="Entry Date/Time *" error={errors.entryAt?.message}>
        <input {...register("entryAt")} type="datetime-local" className={inputCls} />
      </Field>

      <Field label="Exit Date/Time">
        <input {...register("exitAt")} type="datetime-local" className={inputCls} />
      </Field>

      <Field label="Fees" error={errors.fees?.message}>
        <input {...register("fees")} type="number" step="any" placeholder="0.00" className={inputCls} />
      </Field>

      <Field label="Tags (comma-separated)">
        <input
          {...register("tags")}
          placeholder="breakout, momentum, swing"
          className={inputCls}
        />
      </Field>

      <Field label="Rating (1–5)">
        <input {...register("rating")} type="number" min={1} max={5} step={1} placeholder="—" className={inputCls} />
      </Field>

      <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
        <label className="text-xs font-medium text-[var(--color-text-secondary)]">Notes</label>
        <textarea
          {...register("notes")}
          rows={4}
          placeholder="Trade rationale, observations, lessons learned..."
          className={cn(inputCls, "resize-none")}
        />
      </div>

      <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-[var(--color-border-subtle)] px-6 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-[var(--color-accent-primary)] px-8 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Add Trade"}
        </button>
      </div>
    </form>
  )
}
