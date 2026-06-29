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
        "group relative rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 flex flex-col gap-4 overflow-hidden",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-default)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.28)]",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          trend === "up" && "bg-[radial-gradient(circle_at_top_right,var(--color-profit-bg),transparent_70%)]",
          trend === "down" && "bg-[radial-gradient(circle_at_top_right,var(--color-loss-bg),transparent_70%)]",
          !trend && "bg-[radial-gradient(circle_at_top_right,var(--color-accent-glow),transparent_70%)]",
        )}
      />
      <div className="relative flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">{label}</p>
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
              trend === "up" && "bg-[var(--color-profit-bg)] text-[var(--color-profit)]",
              trend === "down" && "bg-[var(--color-loss-bg)] text-[var(--color-loss)]",
              !trend && "bg-[var(--color-accent-glow)] text-[var(--color-accent-primary)]",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <p
        className={cn(
          "relative text-[28px] leading-none font-bold font-[var(--font-display)] tracking-tight",
          trend === "up" && "text-[var(--color-profit)]",
          trend === "down" && "text-[var(--color-loss)]",
          !trend && "text-[var(--color-text-primary)]",
        )}
      >
        {value}
      </p>
      {sub && <p className="relative text-xs text-[var(--color-text-muted)]">{sub}</p>}
    </div>
  )
}
