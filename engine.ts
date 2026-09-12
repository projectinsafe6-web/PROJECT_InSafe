import type { Bill, ForecastResult, Profile, SalaryRecord, AllocationPlan } from '../types'

/**
 * Forecast the next salary arrival date from historical data.
 * Uses a simple normal-distribution model over observed delays (received - expected).
 * Confidence is derived from the coefficient of variation (CV = std/mean).
 * Lower CV → higher confidence. With <3 samples we fall back to a conservative floor.
 */
export function forecastSalary(history: SalaryRecord[]): ForecastResult {
  if (history.length === 0) {
    const today = new Date()
    const expected = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return {
      expected_date: expected.toISOString().slice(0, 10),
      confidence: 30,
      mean_delay_days: 4,
      std_dev_days: 5,
      min_date: expected.toISOString().slice(0, 10),
      max_date: new Date(expected.getTime() + 15 * 86400000).toISOString().slice(0, 10),
      sample_size: 0,
    }
  }

  const delays: number[] = history.map((r) => {
    if (!r.expected_date) return 4
    const exp = new Date(r.expected_date).getTime()
    const rec = new Date(r.received_date).getTime()
    return Math.max(0, Math.round((rec - exp) / 86400000))
  })

  const n = delays.length
  const mean = delays.reduce((a, b) => a + b, 0) / n
  const variance = delays.reduce((a, d) => a + (d - mean) ** 2, 0) / n
  const std = Math.sqrt(variance)

  // CV-based confidence: CV = std/mean. CV=0 → 100%, CV=1 → ~50%
  const cv = mean > 0 ? std / mean : 1
  let confidence = Math.round(Math.max(35, Math.min(95, 100 * (1 - cv * 0.6))))
  if (n < 3) confidence = Math.min(confidence, 50)

  // Next expected = 1st of next month + mean delay
  const today = new Date()
  const nextFirst = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const expectedDate = new Date(nextFirst.getTime() + mean * 86400000)

  // 2-sigma range
  const minDate = new Date(nextFirst.getTime() + Math.max(0, mean - 2 * std) * 86400000)
  const maxDate = new Date(nextFirst.getTime() + (mean + 2 * std) * 86400000)

  return {
    expected_date: expectedDate.toISOString().slice(0, 10),
    confidence,
    mean_delay_days: Math.round(mean * 10) / 10,
    std_dev_days: Math.round(std * 10) / 10,
    min_date: minDate.toISOString().slice(0, 10),
    max_date: maxDate.toISOString().slice(0, 10),
    sample_size: n,
  }
}

/**
 * Compute the total bills due within the next `windowDays` days.
 */
export function upcomingBills(bills: Bill[], windowDays = 30): { total: number; list: Bill[] } {
  const today = new Date()
  const todayDay = today.getDate()
  const list: Bill[] = []

  for (const bill of bills) {
    let dueDate: Date
    if (bill.due_day >= todayDay) {
      dueDate = new Date(today.getFullYear(), today.getMonth(), bill.due_day)
    } else {
      dueDate = new Date(today.getFullYear(), today.getMonth() + 1, bill.due_day)
    }
    const diff = (dueDate.getTime() - today.getTime()) / 86400000
    if (diff >= 0 && diff <= windowDays) {
      list.push(bill)
    }
  }

  list.sort((a, b) => a.due_day - b.due_day)
  const total = list.reduce((a, b) => a + b.amount, 0)
  return { total, list }
}

/**
 * The core autopilot: decide how to split `income` across bank / savings / investments.
 *
 * Safety rules (in priority order):
 * 1. Reserve enough for all upcoming bills (never let rent fail).
 * 2. Keep a safety buffer proportional to (1 - confidence): the less sure
 *    we are about when salary arrives next, the more we keep in checking.
 * 3. Only invest the remainder after bills + buffer are covered.
 * 4. Of the investable surplus, split by the user's savings/invest target ratio.
 */
export function planAllocation(
  income: number,
  profile: Profile,
  bills: Bill[],
  forecast: ForecastResult,
): AllocationPlan {
  const { total: billsTotal } = upcomingBills(bills, 30)

  // Safety buffer: scales with uncertainty. At 95% confidence → 5% buffer.
  // At 35% confidence → 40% buffer of remaining income.
  const uncertainty = 1 - forecast.confidence / 100
  const bufferPct = Math.min(0.4, 0.05 + uncertainty * 0.5)

  // Step 1: reserve for bills
  let remaining = income - billsTotal
  if (remaining < 0) remaining = 0

  // Step 2: safety buffer from what's left after bills
  const safetyBuffer = Math.round(remaining * bufferPct * 100) / 100
  remaining -= safetyBuffer

  // Step 3: what's left is investable
  if (remaining < 0) remaining = 0

  // Step 4: split investable by target ratio
  const sPct = profile.savings_target_pct / 100
  const iPct = profile.invest_target_pct / 100
  const totalPct = sPct + iPct || 1
  const savingsAmount = Math.round(remaining * (sPct / totalPct) * 100) / 100
  const investmentAmount = Math.round((remaining - savingsAmount) * 100) / 100

  // Bank = bills reserved + safety buffer
  const bankAmount = Math.round((billsTotal + safetyBuffer) * 100) / 100

  return {
    total_amount: income,
    bills_reserved: billsTotal,
    bank_amount: bankAmount,
    savings_amount: savingsAmount,
    investment_amount: investmentAmount,
    confidence_score: forecast.confidence,
    safety_buffer: safetyBuffer,
    breakdown: [
      { label: 'Bills Reserved', amount: billsTotal, pct: income > 0 ? (billsTotal / income) * 100 : 0, color: '#F59E0B' },
      { label: 'Safety Buffer', amount: safetyBuffer, pct: income > 0 ? (safetyBuffer / income) * 100 : 0, color: '#3B82F6' },
      { label: 'Savings', amount: savingsAmount, pct: income > 0 ? (savingsAmount / income) * 100 : 0, color: '#14A877' },
      { label: 'Investments', amount: investmentAmount, pct: income > 0 ? (investmentAmount / income) * 100 : 0, color: '#2BC78F' },
    ],
  }
}

/**
 * Project investment growth over N months at a blended expected return.
 */
export function projectGrowth(
  currentValue: number,
  monthlyContribution: number,
  annualReturnPct: number,
  months: number,
): { month: string; value: number }[] {
  const monthlyRate = annualReturnPct / 100 / 12
  const result: { month: string; value: number }[] = []
  let value = currentValue
  const now = new Date()

  for (let i = 0; i <= months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    result.push({
      month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      value: Math.round(value),
    })
    value = value * (1 + monthlyRate) + monthlyContribution
  }
  return result
}

export function formatCurrency(n: number): string {
  return 'Rs ' + new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatCurrencyPrecise(n: number): string {
  return 'Rs ' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}
