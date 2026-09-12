import { useState } from 'react'
import { motion } from 'framer-motion'
import { Landmark, Plus, Trash2, Building2, User, Hash, FileText } from 'lucide-react'
import type { BankAccount } from '../types'
import { Card, SectionTitle, Input, Select, Button, Badge } from '../components/ui'

export function BankSetup({
  bankAccounts,
  onAddBankAccount,
  onDeleteBankAccount,
}: {
  bankAccounts: BankAccount[]
  onAddBankAccount: (account: Omit<BankAccount, 'id' | 'user_id' | 'created_at'>) => void
  onDeleteBankAccount: (id: string) => void
}) {
  const [holderName, setHolderName] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountType, setAccountType] = useState('savings')

  const handleAdd = () => {
    if (!holderName || !bankName || !accountNumber || !ifscCode) return
    onAddBankAccount({
      account_holder_name: holderName,
      bank_name: bankName,
      account_number: accountNumber,
      ifsc_code: ifscCode.toUpperCase(),
      account_type: accountType as BankAccount['account_type'],
    })
    setHolderName('')
    setBankName('')
    setAccountNumber('')
    setIfscCode('')
    setAccountType('savings')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink-100">Bank Account Details</h1>
        <p className="mt-1 text-ink-400">Add your bank account so the autopilot knows where your money lives</p>
      </div>

      {bankAccounts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-accent-500/30 bg-accent-500/10 p-4"
        >
          <Building2 size={20} className="mt-0.5 shrink-0 text-accent-500" />
          <div>
            <p className="text-sm font-semibold text-accent-500">Bank account required</p>
            <p className="mt-1 text-xs text-ink-400">
              You must add at least one bank account before you can use the rest of the app. This helps the autopilot
              track your balances and allocate money correctly.
            </p>
          </div>
        </motion.div>
      )}

      {/* Add bank account form */}
      <Card className="p-6">
        <SectionTitle title="Add Bank Account" subtitle="Enter your bank details below" icon={<Plus size={18} />} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="Account Holder Name" value={holderName} onChange={setHolderName} placeholder="Rahul Sharma" />
          <Input label="Bank Name" value={bankName} onChange={setBankName} placeholder="State Bank of India" />
          <Input label="Account Number" value={accountNumber} onChange={setAccountNumber} placeholder="123456789012" />
          <Input label="IFSC Code" value={ifscCode} onChange={setIfscCode} placeholder="SBIN0001234" />
          <Select
            label="Account Type"
            value={accountType}
            onChange={setAccountType}
            options={[
              { value: 'savings', label: 'Savings' },
              { value: 'current', label: 'Current' },
              { value: 'salary', label: 'Salary' },
            ]}
          />
          <div className="flex items-end">
            <Button onClick={handleAdd} size="lg" className="w-full">
              <Plus size={18} />
              Add Account
            </Button>
          </div>
        </div>
      </Card>

      {/* Bank accounts list */}
      <Card className="p-6">
        <SectionTitle title="Your Bank Accounts" subtitle={`${bankAccounts.length} account(s) linked`} icon={<Landmark size={18} />} />
        <div className="space-y-3">
          {bankAccounts.length === 0 ? (
            <p className="py-4 text-center text-sm text-ink-400">No bank accounts yet. Add your first one above.</p>
          ) : (
            bankAccounts.map((account, i) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-ink-700/40 bg-ink-800/30 px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-brand-500/15 p-2.5 text-brand-400">
                    <Landmark size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-ink-400" />
                      <p className="text-sm font-medium text-ink-100">{account.account_holder_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-ink-400" />
                      <p className="text-xs text-ink-400">{account.bank_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Hash size={14} className="text-ink-400" />
                        <p className="text-xs text-ink-400">
                          ••••{account.account_number.slice(-4)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-ink-400" />
                        <p className="text-xs text-ink-400">{account.ifsc_code}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={account.account_type === 'savings' ? 'brand' : account.account_type === 'current' ? 'info' : 'accent'}>
                    {account.account_type}
                  </Badge>
                  <button
                    onClick={() => onDeleteBankAccount(account.id)}
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
