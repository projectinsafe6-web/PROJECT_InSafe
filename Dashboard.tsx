import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts'
import {
  Wallet, TrendingUp, Shield, AlertTriangle, ArrowRight,
  Banknote, PiggyBank, Landmark, Clock, Receipt,
} from 'lucide-react'
import type { Profile, Bill, SalaryRecord, Allocation, Investment } from '../types'
import {
  forecastSalary, upcomingBills, planAllocation, projectGrowth,
  formatCurrency, formatCurrencyPrecise,
} from '../lib/engine'
import { Card, StatCard, ConfidenceGauge, SectionTitle, Badge, Button } from '../components/ui'

export function Dashboard({
  profile,
  bills = [],
  salaryHistory = [],
  allocations = [],
  investments = [],
  onSimulateSalary,
}: {
  profile: Profile | null
  bills?: Bill[]
  salaryHistory?: SalaryRecord[]
  allocations?: Allocation[]
  investments?: Investment[]
  onSimulateSalary: () => void
}) {
  const forecast = useMemo(() => forecastSalary(salaryHistory), [salaryHistory])
  const billsUpcoming = useMemo(() => upcomingBills(bills, 30), [bills])

  const plan = useMemo(() => {
    if (!profile) return null
    return planAllocation(profile.monthly_salary, profile, bills, forecast)
  }, [profile, bills, forecast])

  const blendedReturn = useMemo(() => {
    if (!investments || investments.length === 0) return 0
    const total = investments.reduce((a, i) => a + (i.current_value || 0), 0)
    if (total === 0) return 0
    return investments.reduce((a, i) => a + (i.expected_return || 0) * ((i.current_value || 0) / total), 0)
  }, [investments])

  const growthData = useMemo(() => {
    if (!profile || !plan) return []
    return projectGrowth(profile.investment_balance || 0, plan.investment_amount || 0, blendedReturn, 12)
  }, [profile, plan, blendedReturn])

  const allocationHistory = useMemo(() => {
    if (!allocations || allocations.length === 0) return []
    return [...allocations].reverse().slice(-8).map((a) => ({
      name: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Invested: a.investment_amount || 0,
      Savings: a.savings_amount || 0,
      Bank: a.bank_amount || 0,
    }))
  }, [allocations])

  // Safe fallbacks to render the dashboard immediately while data loads
  const safeProfile = profile || {
    monthly_salary: 0,
    bank_balance: 0,
    savings_balance: 0,
    investment_balance: 0,
  }

  const activePlan = plan || {
    total_amount: safeProfile.monthly_salary,
    bills_reserved: 0,
    safety_buffer: 0,
    savings_amount: 0,
    investment_amount: 0,
    breakdown: [],
  }

  const totalNet = (safeProfile.bank_balance || 0) + (safeProfile.savings_balance || 0) + (safeProfile.investment_balance || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-100">Dashboard</h1>
          <p className="mt-1 text-ink-400">Your autopilot is actively managing {formatCurrency(totalNet)} in total</p>
        </div>
        <Button onClick={onSimulateSalary} size="lg">
          <Wallet size={18} />
          Simulate Salary Arrival
        </Button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Checking Account" value={formatCurrency(safeProfile.bank_balance || 0)} sublabel="Bills & safety buffer" icon={<Banknote size={20} />} accent="info" delay={0} />
        <StatCard label="Savings" value={formatCurrency(safeProfile.savings_balance || 0)} sublabel="Liquid reserve" icon={<PiggyBank size={20} />} accent="accent" delay={0.05} />
        <StatCard label="Investments" value={formatCurrency(safeProfile.investment_balance || 0)} sublabel={`${blendedReturn.toFixed(1)}% blended return`} icon={<TrendingUp size={20} />} accent="brand" delay={0.1} />
        <StatCard label="Net Worth" value={formatCurrency(totalNet)} sublabel="All accounts combined" icon={<Landmark size={20} />} accent="brand" delay={0.15} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Confidence gauge + plan */}
        <Card className="p-6 lg:col-span-1">
          <SectionTitle title="Salary Forecast" subtitle="Next expected arrival" icon={<Clock size={18} />} />
          <div className="flex justify-center pt-2">
            <ConfidenceGauge value={forecast?.confidence ?? 0} />
          </div>
          <div className="mt-4 space-y-2 rounded-xl bg-ink-700/30 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Expected date</span>
              <span className="font-medium text-ink-100">
                {forecast?.expected_date ? new Date(forecast.expected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pending data'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Avg delay</span>
              <span className="font-medium text-ink-100">{forecast?.mean_delay_days ?? 0} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Variability (±)</span>
              <span className="font-medium text-ink-100">{forecast?.std_dev_days ?? 0} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Range (2σ)</span>
              <span className="font-medium text-ink-100">
                {forecast?.min_date && forecast?.max_date
                  ? `${new Date(forecast.min_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(forecast.max_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-400">Sample size</span>
              <span className="font-medium text-ink-100">{forecast?.sample_size ?? 0} months</span>
            </div>
          </div>
          {(forecast?.confidence ?? 0) < 60 && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-accent-500/30 bg-accent-500/10 p-3">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-500" />
              <p className="text-xs text-accent-500">
                Low confidence — autopilot is holding a larger safety buffer until salary patterns stabilize.
              </p>
            </div>
          )}
        </Card>

        {/* Allocation plan */}
        <Card className="p-6 lg:col-span-2">
          <SectionTitle
            title="Autopilot Allocation Plan"
            subtitle={`How next ${formatCurrency(safeProfile.monthly_salary || 0)} salary will be split`}
            icon={<Shield size={18} />}
          />

          {/* Flow visualization */}
          <div className="mb-6 flex items-center justify-between gap-2 overflow-x-auto pb-2">
            <div className="flex shrink-0 flex-col items-center">
              <div className="rounded-xl border border-info-500/30 bg-info-500/10 p-3 text-center">
                <p className="text-xs text-ink-400">Salary In</p>
                <p className="text-lg font-bold text-info-400">{formatCurrency(activePlan.total_amount)}</p>
              </div>
            </div>

            <ArrowRight className="shrink-0 text-ink-500" size={20} />

            <div className="flex shrink-0 flex-col items-center">
              <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 p-3 text-center">
                <p className="text-xs text-ink-400">Bills Reserved</p>
                <p className="text-lg font-bold text-accent-500">{formatCurrency(activePlan.bills_reserved)}</p>
              </div>
            </div>

            <ArrowRight className="shrink-0 text-ink-500" size={20} />

            <div className="flex shrink-0 flex-col items-center">
              <div className="rounded-xl border border-info-500/30 bg-info-500/10 p-3 text-center">
                <p className="text-xs text-ink-400">Safety Buffer</p>
                <p className="text-lg font-bold text-info-400">{formatCurrency(activePlan.safety_buffer)}</p>
              </div>
            </div>

            <ArrowRight className="shrink-0 text-ink-500" size={20} />

            <div className="flex shrink-0 flex-col items-center">
              <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-3 text-center">
                <p className="text-xs text-ink-400">Investable Surplus</p>
                <p className="text-lg font-bold text-brand-400">
                  {formatCurrency((activePlan.savings_amount || 0) + (activePlan.investment_amount || 0))}
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown bar */}
          <div className="space-y-3">
            {activePlan.breakdown && activePlan.breakdown.length > 0 ? (
              activePlan.breakdown.map((item, i) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink-300">{item.label}</span>
                    <span className="font-medium text-ink-100">
                      {formatCurrencyPrecise(item.amount)} ({item.pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-ink-700/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-2 text-center text-xs text-ink-400">Waiting for salary data...</p>
            )}
          </div>

          {/* Guarantee badge */}
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-brand-500/30 bg-brand-500/10 p-4">
            <Shield size={20} className="shrink-0 text-brand-400" />
            <div>
              <p className="text-sm font-semibold text-brand-300">Rent-Safe Guarantee</p>
              <p className="text-xs text-ink-400">
                {formatCurrency(activePlan.bills_reserved)} reserved for {billsUpcoming?.list?.length ?? 0} upcoming bills. Rent will never fail.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Growth projection */}
        <Card className="p-6">
          <SectionTitle title="Investment Growth Projection" subtitle="Next 12 months at current contribution" icon={<TrendingUp size={18} />} />
          <div className="h-[240px] w-full">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2BC78F" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#2BC78F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#5A6196', fontSize: 11 }} axisLine={{ stroke: '#1A1F3D' }} tickLine={false} />
                  <YAxis tick={{ fill: '#5A6196', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#111630', border: '1px solid #252B4F', borderRadius: '12px', fontSize: '13px' }}
                    labelStyle={{ color: '#8B92C4' }}
                    formatter={(v: number) => [formatCurrency(v), 'Portfolio Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#2BC78F" strokeWidth={2} fill="url(#growthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink-400">
                Awaiting investment data to project growth.
              </div>
            )}
          </div>
        </Card>

        {/* Allocation history */}
        <Card className="p-6">
          <SectionTitle title="Allocation History" subtitle="Recent salary splits" icon={<Wallet size={18} />} />
          <div className="h-[240px] w-full">
            {allocationHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#5A6196', fontSize: 11 }} axisLine={{ stroke: '#1A1F3D' }} tickLine={false} />
                  <YAxis tick={{ fill: '#5A6196', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#111630', border: '1px solid #252B4F', borderRadius: '12px', fontSize: '13px' }}
                    labelStyle={{ color: '#8B92C4' }}
                    formatter={(v: number, name) => [formatCurrency(v), name]}
                  />
                  <Bar dataKey="Bank" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Savings" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Invested" stackId="a" fill="#2BC78F" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-ink-400">
                No allocation history recorded yet.
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-info-500" /><span className="text-xs text-ink-400">Bank</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-accent-500" /><span className="text-xs text-ink-400">Savings</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-brand-400" /><span className="text-xs text-ink-400">Invested</span></div>
          </div>
        </Card>
      </div>

      {/* Upcoming bills */}
      <Card className="p-6">
        <SectionTitle
          title="Upcoming Bills (30 days)"
          subtitle={`${billsUpcoming?.list?.length ?? 0} bills · ${formatCurrency(billsUpcoming?.total ?? 0)} total`}
          icon={<Receipt size={18} />}
        />
        <div className="space-y-2">
          {!billsUpcoming?.list || billsUpcoming.list.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-400">No bills due in the next 30 days.</p>
          ) : (
            billsUpcoming.list.map((bill, i) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-ink-700/40 bg-ink-800/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-ink-700/50 p-2 text-ink-300">
                    <Receipt size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-100">{bill.name}</p>
                    <p className="text-xs text-ink-400">Due on day {bill.due_day} · {bill.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={bill.priority <= 2 ? 'danger' : bill.priority <= 3 ? 'accent' : 'neutral'}>
                    P{bill.priority}
                  </Badge>
                  <span className="text-sm font-semibold text-ink-100">{formatCurrencyPrecise(bill.amount)}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}