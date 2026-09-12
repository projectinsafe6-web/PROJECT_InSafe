import { useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Profile, Bill, SalaryRecord, Allocation, Investment, BankAccount } from './types'
import { forecastSalary, planAllocation } from './lib/engine'
import { Layout } from './components/Layout'
import type { Page } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { IncomeSetup } from './pages/IncomeSetup'
import { BillsSetup } from './pages/BillsSetup'
import { Portfolio } from './pages/Portfolio'
import { BankSetup } from './pages/BankSetup'
import { Auth } from './pages/Auth'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [page, setPage] = useState<Page>('dashboard')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bills, setBills] = useState<Bill[]>([])
  const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  // --- Auth state ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      ;(async () => {
        setSession(sess)
        if (!sess) {
          setProfile(null)
          setBills([])
          setSalaryHistory([])
          setAllocations([])
          setInvestments([])
          setBankAccounts([])
        }
      })()
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  // --- Data loading ---
  const loadData = useCallback(async () => {
    if (!session) return
    const [p, b, s, a, inv, ba] = await Promise.all([
      supabase.from('profile').select('*').maybeSingle(),
      supabase.from('bills').select('*').order('due_day'),
      supabase.from('salary_history').select('*').order('received_date'),
      supabase.from('allocations').select('*').order('created_at'),
      supabase.from('investments').select('*').order('current_value', { ascending: false }),
      supabase.from('bank_accounts').select('*').order('created_at'),
    ])
    if (p.data) setProfile(p.data as Profile)
    if (b.data) setBills(b.data as Bill[])
    if (s.data) setSalaryHistory(s.data as SalaryRecord[])
    if (a.data) setAllocations(a.data as Allocation[])
    if (inv.data) setInvestments(inv.data as Investment[])
    if (ba.data) setBankAccounts(ba.data as BankAccount[])
  }, [session])

  useEffect(() => {
    if (session) loadData()
  }, [session, loadData])

  // --- Sign out ---
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  // --- Profile ---
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) return
    const { data } = await supabase.from('profile').update(updates).eq('id', profile.id).select('*').maybeSingle()
    if (data) setProfile(data as Profile)
  }, [profile])

  // --- Salary ---
  const addSalaryRecord = useCallback(async (date: string, amount: number, expectedDate: string) => {
    const { data } = await supabase
      .from('salary_history')
      .insert({ received_date: date, amount, expected_date: expectedDate })
      .select('*')
      .maybeSingle()
    if (data) setSalaryHistory((prev) => [...prev, data as SalaryRecord].sort((a, b) => a.received_date.localeCompare(b.received_date)))
  }, [])

  const deleteSalaryRecord = useCallback(async (id: string) => {
    await supabase.from('salary_history').delete().eq('id', id)
    setSalaryHistory((prev) => prev.filter((r) => r.id !== id))
  }, [])

  // --- Bills ---
  const addBill = useCallback(async (bill: Omit<Bill, 'id' | 'created_at' | 'is_paid'>) => {
    const { data } = await supabase.from('bills').insert(bill).select('*').maybeSingle()
    if (data) setBills((prev) => [...prev, data as Bill])
  }, [])

  const updateBill = useCallback(async (id: string, updates: Partial<Bill>) => {
    const { data } = await supabase.from('bills').update(updates).eq('id', id).select('*').maybeSingle()
    if (data) setBills((prev) => prev.map((b) => (b.id === id ? data as Bill : b)))
  }, [])

  const deleteBill = useCallback(async (id: string) => {
    await supabase.from('bills').delete().eq('id', id)
    setBills((prev) => prev.filter((b) => b.id !== id))
  }, [])

  // --- Investments ---
  const addInvestment = useCallback(async (inv: Omit<Investment, 'id' | 'created_at'>) => {
    const { data } = await supabase.from('investments').insert(inv).select('*').maybeSingle()
    if (data) setInvestments((prev) => [...prev, data as Investment])
  }, [])

  const deleteInvestment = useCallback(async (id: string) => {
    await supabase.from('investments').delete().eq('id', id)
    setInvestments((prev) => prev.filter((i) => i.id !== id))
  }, [])

  // --- Bank Accounts ---
  const addBankAccount = useCallback(async (account: Omit<BankAccount, 'id' | 'user_id' | 'created_at'>) => {
    const { data } = await supabase.from('bank_accounts').insert(account).select('*').maybeSingle()
    if (data) setBankAccounts((prev) => [...prev, data as BankAccount])
  }, [])

  const deleteBankAccount = useCallback(async (id: string) => {
    await supabase.from('bank_accounts').delete().eq('id', id)
    setBankAccounts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // --- Simulate salary arrival ---
  const simulateSalary = useCallback(async () => {
    if (!profile) return
    const forecast = forecastSalary(salaryHistory)
    const plan = planAllocation(profile.monthly_salary, profile, bills, forecast)

    await supabase.from('allocations').insert({
      source: 'salary',
      total_amount: plan.total_amount,
      bank_amount: plan.bank_amount,
      savings_amount: plan.savings_amount,
      investment_amount: plan.investment_amount,
      confidence_score: plan.confidence_score,
      bills_reserved: plan.bills_reserved,
    })

    const newBank = profile.bank_balance + plan.bank_amount
    const newSavings = profile.savings_balance + plan.savings_amount
    const newInvestment = profile.investment_balance + plan.investment_amount
    const { data } = await supabase
      .from('profile')
      .update({ bank_balance: newBank, savings_balance: newSavings, investment_balance: newInvestment })
      .eq('id', profile.id)
      .select('*')
      .maybeSingle()
    if (data) setProfile(data as Profile)

    const unpaidBills = bills.filter((b) => !b.is_paid)
    for (const bill of unpaidBills) {
      await supabase.from('bills').update({ is_paid: true }).eq('id', bill.id)
    }

    const today = new Date().toISOString().slice(0, 10)
    await supabase.from('salary_history').insert({
      received_date: today,
      amount: profile.monthly_salary,
      expected_date: forecast.expected_date,
    })

    await loadData()
  }, [profile, bills, salaryHistory, loadData])

  // --- Render ---
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
      </div>
    )
  }

  if (!session) {
    return <Auth onAuthed={() => {}} />
  }

  // --- Onboarding gate: force bank account setup before accessing other pages ---
  const bankAccountsLoaded = bankAccounts.length > 0
  const isBankPage = page === 'bank'

  if (!bankAccountsLoaded && !isBankPage) {
    return (
      <Layout current="bank" onNavigate={setPage} onSignOut={signOut} userEmail={session.user.email || ''}>
        <BankSetup
          bankAccounts={bankAccounts}
          onAddBankAccount={addBankAccount}
          onDeleteBankAccount={deleteBankAccount}
        />
      </Layout>
    )
  }

  return (
    <Layout current={page} onNavigate={setPage} onSignOut={signOut} userEmail={session.user.email || ''}>
      {page === 'dashboard' && (
        <Dashboard
          profile={profile}
          bills={bills}
          salaryHistory={salaryHistory}
          allocations={allocations}
          investments={investments}
          onSimulateSalary={simulateSalary}
        />
      )}
      {page === 'income' && (
        <IncomeSetup
          profile={profile}
          salaryHistory={salaryHistory}
          onUpdateProfile={updateProfile}
          onAddSalaryRecord={addSalaryRecord}
          onDeleteSalaryRecord={deleteSalaryRecord}
        />
      )}
      {page === 'bills' && (
        <BillsSetup
          bills={bills}
          onAddBill={addBill}
          onUpdateBill={updateBill}
          onDeleteBill={deleteBill}
        />
      )}
      {page === 'portfolio' && (
        <Portfolio
          investments={investments}
          profile={profile}
          onAddInvestment={addInvestment}
          onDeleteInvestment={deleteInvestment}
        />
      )}
      {page === 'bank' && (
        <BankSetup
          bankAccounts={bankAccounts}
          onAddBankAccount={addBankAccount}
          onDeleteBankAccount={deleteBankAccount}
        />
      )}
    </Layout>
  )
}
