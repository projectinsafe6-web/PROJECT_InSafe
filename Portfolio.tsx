import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis,
} from 'recharts'
import { TrendingUp, Plus, Trash2, PieChart as PieIcon, Target, Activity } from 'lucide-react'
import type { Investment, Profile } from '../types'
import { projectGrowth, formatCurrency, formatCurrencyPrecise } from '../lib/engine'
import { Card, SectionTitle, Input, Select, Button, Badge, StatCard } from '../components/ui'

const riskColors: Record<string, string> = {
  low: '#3B82F6',
  medium: '#2BC78F',
  high: '#F59E0B',
}

export function Portfolio({
  investments,
  profile,
  onAddInvestment,
  onDeleteInvestment,
}: {
  investments: Investment[]
  profile: Profile | null
  onAddInvestment: (inv: Omit<Investment, 'id' | 'created_at'>) => void
  onDeleteInvestment: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [ticker, setTicker] = useState('')
  const [allocPct, setAllocPct] = useState('')
  const [value, setValue] = useState('')
  const [expectedReturn, setExpectedReturn] = useState('')
  const [riskLevel, setRiskLevel] = useState('medium')

  const totalValue = investments.reduce((a, i) => a + i.current_value, 0)
  const blendedReturn = useMemo(() => {
    if (totalValue === 0) return 0
    return investments.reduce((a, i) => a + i.expected_return * (i.current_value / totalValue), 0)
  }, [investments, totalValue])

  const pieData = investments.map((inv) => ({
    name: inv.name,
    value: inv.current_value,
    color: riskColors[inv.risk_level] || '#8B92C4',
  }))

  const projectionData = useMemo(() => {
    if (!profile) return []
    return projectGrowth(totalValue, 0, blendedReturn, 12)
  }, [totalValue, blendedReturn, profile])

  const handleAdd = () => {
    if (!name || !ticker) return
    onAddInvestment({
      name,
      ticker: ticker.toUpperCase(),
      allocation_pct: parseFloat(allocPct) || 0,
      current_value: parseFloat(value) || 0,
      expected_return: parseFloat(expectedReturn) || 0,
      risk_level: riskLevel as Investment['risk_level'],
    })
    setName('')
    setTicker('')
    setAllocPct('')
    setValue('')
    setExpectedReturn('')
    setRiskLevel('medium')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink-100">Investment Portfolio</h1>
        <p className="mt-1 text-ink-400">Where your investable money is allocated</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Invested" value={formatCurrency(totalValue)} sublabel="Across all holdings" icon={<TrendingUp size={20} />} accent="brand" delay={0} />
        <StatCard label="Blended Return" value={`${blendedReturn.toFixed(1)}%`} sublabel="Expected annual" icon={<Activity size={20} />} accent="info" delay={0.05} />
        <StatCard label="Holdings" value={investments.length.toString()} sublabel="Active positions" icon={<PieIcon size={20} />} accent="accent" delay={0.1} />
        <StatCard
          label="Projected (1Y)"
          value={formatCurrency(totalValue * (1 + blendedReturn / 100))}
          sublabel="At current allocation"
          icon={<Target size={20} />}
          accent="brand"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie chart */}
        <Card className="p-6">
          <SectionTitle title="Allocation Breakdown" subtitle="By current market value" icon={<PieIcon size={18} />} />
          {investments.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-400">No investments yet. Add one below.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="#0B0F1E" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111630', border: '1px solid #252B4F', borderRadius: '12px', fontSize: '13px' }}
                    formatter={(v: number, n) => [formatCurrencyPrecise(v), n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {investments.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: riskColors[inv.risk_level] || '#8B92C4' }} />
                    <span className="text-xs text-ink-300">{inv.ticker}</span>
                    <span className="ml-auto text-xs font-medium text-ink-100">
                      {totalValue > 0 ? ((inv.current_value / totalValue) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Growth projection */}
        <Card className="p-6">
          <SectionTitle title="Growth Projection" subtitle="12-month forecast at blended return" icon={<TrendingUp size={18} />} />
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2BC78F" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2BC78F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#5A6196', fontSize: 11 }} axisLine={{ stroke: '#1A1F3D' }} tickLine={false} />
              <YAxis tick={{ fill: '#5A6196', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#111630', border: '1px solid #252B4F', borderRadius: '12px', fontSize: '13px' }}
                formatter={(v: number) => [formatCurrency(v), 'Value']}
              />
              <Area type="monotone" dataKey="value" stroke="#2BC78F" strokeWidth={2} fill="url(#portfolioGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Add investment */}
      <Card className="p-6">
        <SectionTitle title="Add Investment" subtitle="Add a fund, ETF, or holding to your portfolio" icon={<Plus size={18} />} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <Input label="Name" value={name} onChange={setName} placeholder="S&P 500 ETF" />
          </div>
          <div className="flex-1 min-w-[80px]">
            <Input label="Ticker" value={ticker} onChange={setTicker} placeholder="VOO" />
          </div>
          <div className="flex-1 min-w-[100px]">
            <Input label="Current Value" value={value} onChange={setValue} type="number" prefix="Rs " placeholder="6240" />
          </div>
          <div className="flex-1 min-w-[100px]">
            <Input label="Expected Return" value={expectedReturn} onChange={setExpectedReturn} type="number" suffix="%" placeholder="10.5" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <Select
              label="Risk Level"
              value={riskLevel}
              onChange={setRiskLevel}
              options={[
                { value: 'low', label: 'Low — Bonds, cash' },
                { value: 'medium', label: 'Medium — Index funds' },
                { value: 'high', label: 'High — Growth stocks' },
              ]}
            />
          </div>
          <Button onClick={handleAdd} size="md">
            <Plus size={16} />
            Add
          </Button>
        </div>
      </Card>

      {/* Holdings list */}
      <Card className="p-6">
        <SectionTitle title="Your Holdings" subtitle="Current investment positions" icon={<TrendingUp size={18} />} />
        <div className="space-y-2">
          {investments.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-400">No holdings yet. Add your first investment above.</p>
          ) : (
            investments.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-xl border border-ink-700/40 bg-ink-800/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 text-ink-100" style={{ backgroundColor: `${riskColors[inv.risk_level]}20` }}>
                    <TrendingUp size={16} style={{ color: riskColors[inv.risk_level] }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-100">{inv.name}</p>
                    <p className="text-xs text-ink-400">{inv.ticker} · {inv.expected_return}% expected</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={inv.risk_level === 'low' ? 'info' : inv.risk_level === 'medium' ? 'brand' : 'accent'}>
                    {inv.risk_level}
                  </Badge>
                  <span className="text-sm font-semibold text-ink-100">{formatCurrencyPrecise(inv.current_value)}</span>
                  <button
                    onClick={() => onDeleteInvestment(inv.id)}
                    className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-500/10 hover:text-danger-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
