export interface BankAccount {
  id: string
  user_id: string
  account_holder_name: string
  bank_name: string
  account_number: string
  ifsc_code: string
  account_type: 'savings' | 'current' | 'salary'
  created_at: string
}

export interface Profile {
  id: string
  monthly_salary: number
  rent_amount: number
  rent_due_day: number
  savings_target_pct: number
  invest_target_pct: number
  bank_balance: number
  savings_balance: number
  investment_balance: number
  risk_tolerance: 'conservative' | 'balanced' | 'aggressive'
  created_at: string
}

export interface SalaryRecord {
  id: string
  received_date: string
  amount: number
  expected_date: string | null
  created_at: string
}

export interface Bill {
  id: string
  name: string
  amount: number
  due_day: number
  category: string
  is_paid: boolean
  priority: number
  created_at: string
}

export interface Allocation {
  id: string
  source: 'salary' | 'residual'
  total_amount: number
  bank_amount: number
  savings_amount: number
  investment_amount: number
  confidence_score: number
  bills_reserved: number
  created_at: string
}

export interface Investment {
  id: string
  name: string
  ticker: string
  allocation_pct: number
  current_value: number
  expected_return: number
  risk_level: 'low' | 'medium' | 'high'
  created_at: string
}

export interface ForecastResult {
  expected_date: string
  confidence: number
  mean_delay_days: number
  std_dev_days: number
  min_date: string
  max_date: string
  sample_size: number
}

export interface AllocationPlan {
  total_amount: number
  bills_reserved: number
  bank_amount: number
  savings_amount: number
  investment_amount: number
  confidence_score: number
  safety_buffer: number
  breakdown: {
    label: string
    amount: number
    pct: number
    color: string
  }[]
}
