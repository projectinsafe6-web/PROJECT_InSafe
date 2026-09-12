import { useState } from 'react'
import { motion } from 'framer-motion'
import { Receipt, Plus, Trash2, Home, Zap, Smartphone, Shield, Tag, Check } from 'lucide-react'
import type { Bill } from '../types'
import { formatCurrencyPrecise } from '../lib/engine'
import { Card, SectionTitle, Input, Select, Button, Badge } from '../components/ui'

const categoryIcons: Record<string, typeof Receipt> = {
  housing: Home,
  utility: Zap,
  subscription: Smartphone,
  insurance: Shield,
  other: Tag,
}

export function BillsSetup({
  bills,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
}: {
  bills: Bill[]
  onAddBill: (bill: Omit<Bill, 'id' | 'created_at' | 'is_paid'>) => void
  onUpdateBill: (id: string, updates: Partial<Bill>) => void
  onDeleteBill: (id: string) => void
}) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('1')
  const [category, setCategory] = useState('other')
  const [priority, setPriority] = useState('5')

  const totalMonthly = bills.reduce((a, b) => a + b.amount, 0)
  const paidCount = bills.filter((b) => b.is_paid).length

  const handleAdd = () => {
    if (!name || !amount) return
    onAddBill({
      name,
      amount: parseFloat(amount),
      due_day: parseInt(dueDay) || 1,
      category,
      priority: parseInt(priority) || 5,
    })
    setName('')
    setAmount('')
    setDueDay('1')
    setCategory('other')
    setPriority('5')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink-100">Bills & Rent</h1>
        <p className="mt-1 text-ink-400">Recurring bills the autopilot pays before investing</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent-500/15 p-2.5 text-accent-500"><Receipt size={20} /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-300">Total Monthly Bills</p>
              <p className="text-2xl font-bold text-ink-100">{formatCurrencyPrecise(totalMonthly)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-500/15 p-2.5 text-brand-400"><Check size={20} /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-300">Paid This Cycle</p>
              <p className="text-2xl font-bold text-ink-100">{paidCount} / {bills.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-info-500/15 p-2.5 text-info-400"><Receipt size={20} /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-300">Active Bills</p>
              <p className="text-2xl font-bold text-ink-100">{bills.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add bill form */}
      <Card className="p-6">
        <SectionTitle title="Add a Bill" subtitle="Rent, utilities, subscriptions, insurance…" icon={<Plus size={18} />} />
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <Input label="Bill Name" value={name} onChange={setName} placeholder="Electricity" />
          </div>
          <div className="flex-1 min-w-[100px]">
            <Input label="Amount" value={amount} onChange={setAmount} type="number" prefix="Rs " placeholder="120" />
          </div>
          <div className="flex-1 min-w-[80px]">
            <Input label="Due Day" value={dueDay} onChange={setDueDay} type="number" suffix="th" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <Select
              label="Category"
              value={category}
              onChange={setCategory}
              options={[
                { value: 'housing', label: 'Housing' },
                { value: 'utility', label: 'Utility' },
                { value: 'subscription', label: 'Subscription' },
                { value: 'insurance', label: 'Insurance' },
                { value: 'other', label: 'Other' },
              ]}
            />
          </div>
          <div className="flex-1 min-w-[100px]">
            <Select
              label="Priority"
              value={priority}
              onChange={setPriority}
              options={[
                { value: '1', label: '1 — Critical' },
                { value: '2', label: '2 — High' },
                { value: '3', label: '3 — Medium' },
                { value: '4', label: '4 — Low' },
                { value: '5', label: '5 — Minimal' },
              ]}
            />
          </div>
          <Button onClick={handleAdd} size="md">
            <Plus size={16} />
            Add Bill
          </Button>
        </div>
      </Card>

      {/* Bills list */}
      <Card className="p-6">
        <SectionTitle title="Your Bills" subtitle="Sorted by priority — the autopilot pays top to bottom" icon={<Receipt size={18} />} />
        <div className="space-y-2">
          {bills.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-400">No bills yet. Add your rent and recurring expenses above.</p>
          ) : (
            [...bills]
              .sort((a, b) => a.priority - b.priority || a.due_day - b.due_day)
              .map((bill, i) => {
                const Icon = categoryIcons[bill.category] || Tag
                return (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between rounded-xl border border-ink-700/40 bg-ink-800/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-ink-700/50 p-2 text-ink-300">
                        <Icon size={16} />
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
                      <button
                        onClick={() => onUpdateBill(bill.id, { is_paid: !bill.is_paid })}
                        className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                          bill.is_paid
                            ? 'bg-brand-500/15 text-brand-300 hover:bg-brand-500/25'
                            : 'bg-ink-700/50 text-ink-300 hover:bg-ink-600/50'
                        }`}
                      >
                        {bill.is_paid ? 'Paid' : 'Mark Paid'}
                      </button>
                      <span className="text-sm font-semibold text-ink-100">{formatCurrencyPrecise(bill.amount)}</span>
                      <button
                        onClick={() => onDeleteBill(bill.id)}
                        className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-500/10 hover:text-danger-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                )
              })
          )}
        </div>
      </Card>
    </div>
  )
}
