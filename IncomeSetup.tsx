import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid,
} from 'recharts'
import { Wallet, Calendar, TrendingUp, Plus, Trash2, Save } from 'lucide-react'
import type { Profile, SalaryRecord } from '../types'
import { forecastSalary, formatCurrency, formatCurrencyPrecise } from '../lib/engine'
import { Card, SectionTitle, Input, Select, Button, Badge } from '../components/ui'

export function IncomeSetup({
  profile,
  salaryHistory = [],
  onUpdateProfile,
  onAddSalaryRecord,
  onDeleteSalaryRecord,
}: {
  profile: Profile | null
  salaryHistory: SalaryRecord[]
  onUpdateProfile: (updates: Partial<Profile>) => void
  onAddSalaryRecord: (date: string, amount: number, expectedDate: string) => void
  onDeleteSalaryRecord: (id: string) => void
}) {
  const [salary, setSalary] = useState('')
  const [rentDay, setRentDay] = useState('1')
  const [risk, setRisk] = useState<string>('balanced')
  const [savPct, setSavPct] = useState('30')
  const [invPct, setInvPct] = useState('70')
  const [newDate, setNewDate] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newExpected, setNewExpected] = useState('')

  // Sync inputs whenever profile finishes loading or updates from parent
  useEffect(() => {
    if (profile) {
      setSalary(profile.monthly_salary?.toString() || '')
      setRentDay(profile.rent_due_day?.toString() || '1')
      setRisk(profile.risk_tolerance || 'balanced')
      setSavPct(profile.savings_target_pct?.toString() || '30')
      setInvPct(profile.invest_target_pct?.toString() || '70')
    }
  }, [profile])

  const forecast = useMemo(() => forecastSalary(salaryHistory), [salaryHistory])

  const scatterData = useMemo(
    () =>
      salaryHistory.map((r) => ({
        x: new Date(r.received_date).getTime(),
        y: r.amount,
        expected: r.expected_date ? new Date(r.expected_date).getTime() : null,
      })),
    [salaryHistory],
  )

  const handleSave = () => {
    onUpdateProfile({
      monthly_salary: parseFloat(salary) || 0,
      rent_due_day: parseInt(rentDay, 10) || 1,
      risk_tolerance: risk as Profile['risk_tolerance'],
      savings_target_pct: parseFloat(savPct) || 0,
      invest_target_pct: parseFloat(invPct) || 0,
    })
  }

  const handleAddRecord = () => {
    if (!newDate || !newAmount) return
    onAddSalaryRecord(newDate, parseFloat(newAmount), newExpected || newDate)
    setNewDate('')
    setNewAmount('')
    setNewExpected('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink-100">Income Setup</h1>
        <p className="mt-1 text-ink-400">Configure your salary, rent date, and risk tolerance</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile config */}
        <Card className="p-6 lg:col-span-1">
          <SectionTitle title="Your Profile" subtitle="Autopilot parameters" icon={<Wallet size={18} />} />

          <div className="space-y-4">
            <Input label="Monthly Salary" value={salary} onChange={setSalary} type="number" prefix="Rs " placeholder="5200" />

            <Input label="Rent Due Day" value={rentDay} onChange={setRentDay} type="number" suffix="th" placeholder="5" />

            <Select
              label="Risk Tolerance"
              value={risk}
              onChange={setRisk}
              options={[
                { value: 'conservative', label: 'Conservative — More buffer, less invested' },
                { value: 'balanced', label: 'Balanced — Moderate buffer & investing' },
                { value: 'aggressive', label: 'Aggressive — Maximize investment' },
              ]}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Savings %" value={savPct} onChange={setSavPct} type="number" suffix="%" />
              <Input label="Invest %" value={invPct} onChange={setInvPct} type="number" suffix="%" />
            </div>

            <Button onClick={handleSave} size="lg" className="w-full">
              <Save size={18} />
              Save Profile
            </Button>
          </div>
        </Card>

        {/* Forecast visualization */}
        <Card className="p-6 lg:col-span-2">
          <SectionTitle title="Salary Arrival Forecast" subtitle={`${salaryHistory.length} months of data · confidence: ${forecast.confidence}%`} icon={<Calendar size={18} />} />

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-ink-700/30 p-3 text-center">
              <p className="text-xs text-ink-400">Next Expected</p>
              <p className="mt-1 text-sm font-bold text-brand-400">
                {forecast.expected_date ? new Date(forecast.expected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </p>
            </div>
            <div className="rounded-xl bg-ink-700/30 p-3 text-center">
              <p className="text-xs text-ink-400">Avg Delay</p>
              <p className="mt-1 text-sm font-bold text-ink-100">{forecast.mean_delay_days} days</p>
            </div>
            <div className="rounded-xl bg-ink-700/30 p-3 text-center">
              <p className="text-xs text-ink-400">Variability</p>
              <p className="mt-1 text-sm font-bold text-ink-100">±{forecast.std_dev_days} days</p>
            </div>
          </div>

          <div className="mt-4">
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1F3D" />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={['auto', 'auto']}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short' })}
                  tick={{ fill: '#5A6196', fontSize: 11 }}
                  axisLine={{ stroke: '#1A1F3D' }}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={['auto', 'auto']}
                  tick={{ fill: '#5A6196', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `Rs ${(v / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{ background: '#111630', border: '1px solid #252B4F', borderRadius: '12px', fontSize: '13px' }}
                  labelStyle={{ color: '#8B92C4' }}
                  formatter={(v: number) => [formatCurrency(v), 'Amount']}
                  labelFormatter={(v) => new Date(v).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                />
                <ReferenceLine y={parseFloat(salary) || 0} stroke="#2BC78F" strokeDasharray="5 5" label={{ value: 'Expected', fill: '#2BC78F', fontSize: 11 }} />
                <Scatter data={scatterData} fill="#2BC78F" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-info-500/30 bg-info-500/10 p-3">
            <TrendingUp size={16} className="shrink-0 text-info-400" />
            <p className="text-xs text-info-400">
              The autopilot uses this forecast to decide how much money is genuinely investable.
              Higher confidence → more invested. Lower confidence → larger safety buffer.
            </p>
          </div>
        </Card>
      </div>

      {/* Salary history table */}
      <Card className="p-6">
        <SectionTitle title="Salary History" subtitle="Past salary arrivals used for forecasting" icon={<Calendar size={18} />} />

        {/* Add new record */}
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-ink-700/40 bg-ink-800/30 p-4">
          <div className="flex-1 min-w-[140px]">
            <Input label="Received Date" value={newDate} onChange={setNewDate} type="date" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <Input label="Amount" value={newAmount} onChange={setNewAmount} type="number" prefix="Rs " placeholder="5200" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <Input label="Expected Date" value={newExpected} onChange={setNewExpected} type="date" />
          </div>
          <Button onClick={handleAddRecord} size="md">
            <Plus size={16} />
            Add
          </Button>
        </div>

        {/* Records */}
        <div className="space-y-2">
          {salaryHistory.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-400">No salary records yet. Add your first one above.</p>
          ) : (
            [...salaryHistory].reverse().map((r) => {
              const delay = r.expected_date
                ? Math.max(0, Math.round((new Date(r.received_date).getTime() - new Date(r.expected_date).getTime()) / 86400000))
                : null
              return (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-ink-700/40 bg-ink-800/30 px-4 py-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-ink-100">
                        {new Date(r.received_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                      {r.expected_date && (
                        <p className="text-xs text-ink-400">
                          Expected: {new Date(r.expected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                    {delay !== null && (
                      <Badge color={delay === 0 ? 'brand' : delay <= 3 ? 'accent' : 'danger'}>
                        {delay === 0 ? 'On time' : `${delay}d late`}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-ink-100">{formatCurrencyPrecise(r.amount)}</span>
                    <button onClick={() => onDeleteSalaryRecord(r.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-500/10 hover:text-danger-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}