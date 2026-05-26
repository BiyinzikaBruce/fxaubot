import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type StatCardProps = {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function StatCard({ label, value, sub, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 flex flex-col gap-3",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-[var(--color-text-muted)]" />}
      </div>
      <p
        className={cn(
          "text-2xl font-bold font-[var(--font-display)]",
          trend === "up" && "text-[var(--color-profit)]",
          trend === "down" && "text-[var(--color-loss)]",
          !trend && "text-[var(--color-text-primary)]",
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-[var(--color-text-muted)]">{sub}</p>}
    </div>
  )
}
