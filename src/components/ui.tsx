import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { STATUS_STYLE, type Status } from '../lib/progress'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-orange-500 text-zinc-950 hover:bg-orange-400',
  secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700',
  ghost: 'text-zinc-300 hover:bg-zinc-800',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
  success: 'bg-emerald-600 text-white hover:bg-emerald-500',
}

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 ${className}`}>{children}</div>
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${STATUS_STYLE[status]}`}>{status}</span>
}

export function LevelBadge({ level }: { level: number }) {
  return (
    <span className="text-xs text-amber-400" title={`Level ${level}`}>
      {'●'.repeat(level)}
      <span className="text-zinc-700">{'●'.repeat(5 - level)}</span>
    </span>
  )
}

export function ProgressBar({ value, max, color = 'bg-orange-500' }: { value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <Card className="p-4">
      <div className="text-xs tracking-wide text-zinc-500 uppercase">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-zinc-500">{sub}</div>}
    </Card>
  )
}

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-zinc-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
