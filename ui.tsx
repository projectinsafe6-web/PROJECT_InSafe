import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink-700/60 bg-ink-800/50 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  accent = 'brand',
  delay = 0,
}: {
  label: string
  value: string
  sublabel?: string
  icon?: ReactNode
  accent?: 'brand' | 'accent' | 'info' | 'danger'
  delay?: number
}) {
  const accentMap = {
    brand: 'text-brand-400',
    accent: 'text-accent-500',
    info: 'text-info-400',
    danger: 'text-danger-400',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-ink-300">{label}</p>
            <p className={`mt-2 text-2xl font-bold ${accentMap[accent]}`}>{value}</p>
            {sublabel && <p className="mt-1 text-xs text-ink-400">{sublabel}</p>}
          </div>
          {icon && <div className={`rounded-lg bg-ink-700/50 p-2.5 ${accentMap[accent]}`}>{icon}</div>}
        </div>
      </Card>
    </motion.div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}) {
  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20',
    secondary: 'bg-ink-700 text-ink-100 hover:bg-ink-600 border border-ink-600',
    ghost: 'text-ink-300 hover:text-ink-100 hover:bg-ink-700/50',
    danger: 'bg-danger-500 text-white hover:bg-danger-600',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  prefix,
  suffix,
}: {
  label?: string
  value: string | number
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  prefix?: string
  suffix?: string
}) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-300">{label}</label>}
      <div className="flex items-center rounded-xl border border-ink-600 bg-ink-800/80 focus-within:border-brand-500 transition-colors">
        {prefix && <span className="pl-3 text-sm text-ink-400">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 outline-none"
        />
        {suffix && <span className="pr-3 text-sm text-ink-400">{suffix}</span>}
      </div>
    </div>
  )
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-300">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink-600 bg-ink-800/80 px-3 py-2.5 text-sm text-ink-100 outline-none focus:border-brand-500 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Badge({
  children,
  color = 'brand',
}: {
  children: ReactNode
  color?: 'brand' | 'accent' | 'info' | 'danger' | 'neutral'
}) {
  const colors = {
    brand: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
    accent: 'bg-accent-500/15 text-accent-500 border-accent-500/30',
    info: 'bg-info-500/15 text-info-400 border-info-500/30',
    danger: 'bg-danger-500/15 text-danger-400 border-danger-500/30',
    neutral: 'bg-ink-600/40 text-ink-300 border-ink-500/40',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

export function ConfidenceGauge({ value, size = 140 }: { value: number; size?: number }) {
  const radius = (size - 20) / 2
  const circumference = Math.PI * radius // semicircle
  const offset = circumference - (value / 100) * circumference
  const color = value >= 75 ? '#2BC78F' : value >= 50 ? '#F59E0B' : '#F43F5E'

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
        <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
          <path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke="#1A1F3D"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <motion.path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-3xl font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-300">Forecast Confidence</p>
    </div>
  )
}

export function SectionTitle({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      {icon && <div className="rounded-xl bg-brand-500/15 p-2.5 text-brand-400">{icon}</div>}
      <div>
        <h2 className="text-lg font-bold text-ink-100">{title}</h2>
        {subtitle && <p className="text-sm text-ink-400">{subtitle}</p>}
      </div>
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 rounded-full bg-ink-700/50 p-4 text-ink-400">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <p className="text-sm text-ink-400">{message}</p>
    </div>
  )
}
