import { motion } from 'framer-motion'
import { LayoutDashboard, Wallet, Receipt, TrendingUp, Shield, LogOut, Landmark } from 'lucide-react'
import type { ReactNode } from 'react'

export type Page = 'dashboard' | 'income' | 'bills' | 'portfolio' | 'bank'

const navItems: { id: Page; label: string; icon: ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'income', label: 'Income Setup', icon: <Wallet size={20} /> },
  { id: 'bills', label: 'Bills & Rent', icon: <Receipt size={20} /> },
  { id: 'portfolio', label: 'Portfolio', icon: <TrendingUp size={20} /> },
  { id: 'bank', label: 'Bank Accounts', icon: <Landmark size={20} /> },
]

export function Layout({
  current,
  onNavigate,
  onSignOut,
  userEmail,
  children,
}: {
  current: Page
  onNavigate: (p: Page) => void
  onSignOut: () => void
  userEmail: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-ink-950 text-ink-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-ink-700/60 bg-ink-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 p-2.5 shadow-lg shadow-brand-500/30">
            <Shield size={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-ink-100">InSafe</p>
            <p className="text-xs text-ink-400">Automated Finance Assistant</p>
          </div>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const active = current === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active ? 'text-brand-300' : 'text-ink-300 hover:text-ink-100 hover:bg-ink-700/40'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-brand-500/10 border border-brand-500/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="px-3 py-4 space-y-3">
          <div className="rounded-xl border border-ink-700/60 bg-ink-800/50 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
              <p className="text-xs font-medium text-ink-300">Autopilot Active</p>
            </div>
            <p className="mt-1 text-xs text-ink-500">Monitoring salary forecast & bills</p>
          </div>

          {/* User + sign out */}
          <div className="rounded-xl border border-ink-700/60 bg-ink-800/50 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-300">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink-200">{userEmail}</p>
                <p className="text-xs text-ink-500">Signed in</p>
              </div>
              <button
                onClick={onSignOut}
                className="shrink-0 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-danger-500/10 hover:text-danger-400"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
