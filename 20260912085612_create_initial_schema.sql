/*
# Obligation-Safe Autopilot Investing — Initial Schema

## Overview
Creates the full data model for an AI autopilot that splits incoming salary
into bank (checking), savings, and investment buckets while guaranteeing
that recurring bills are always paid first. The core innovation is a
confidence score on salary-arrival forecasts — the autopilot only invests
money it is genuinely sure is spare.

## New Tables

### profile
- `id` (uuid, primary key)
- `monthly_salary` (numeric, expected monthly salary amount)
- `rent_amount` (numeric, monthly rent / most important recurring bill)
- `rent_due_day` (int, day-of-month rent is due, 1–31)
- `savings_target_pct` (numeric, % of spare to route to savings, default 30)
- `invest_target_pct` (numeric, % of spare to route to investments, default 70)
- `bank_balance` (numeric, current checking-account buffer, default 0)
- `savings_balance` (numeric, current savings balance, default 0)
- `investment_balance` (numeric, current invested balance, default 0)
- `risk_tolerance` (text, 'conservative' | 'balanced' | 'aggressive', default 'balanced')
- `created_at` (timestamptz)

### salary_history
- `id` (uuid, primary key)
- `received_date` (date, the date salary actually arrived)
- `amount` (numeric, the salary amount)
- `expected_date` (date, the date salary was expected)
- `created_at` (timestamptz)

### bills
- `id` (uuid, primary key)
- `name` (text, bill name e.g. "Rent", "Electricity")
- `amount` (numeric, amount due)
- `due_day` (int, day-of-month, 1–31)
- `category` (text, 'housing' | 'utility' | 'subscription' | 'insurance' | 'other')
- `is_paid` (boolean, whether paid this cycle, default false)
- `priority` (int, 1 = highest, default 5)
- `created_at` (timestamptz)

### allocations
- `id` (uuid, primary key)
- `source` (text, 'salary' | 'residual' — from new income or post-bill residual)
- `total_amount` (numeric, total amount being split)
- `bank_amount` (numeric, routed to checking)
- `savings_amount` (numeric, routed to savings)
- `investment_amount` (numeric, routed to investments)
- `confidence_score` (numeric, 0–100, forecast confidence at time of allocation)
- `bills_reserved` (numeric, amount reserved for upcoming bills)
- `created_at` (timestamptz)

### investments
- `id` (uuid, primary key)
- `name` (text, e.g. "S&P 500 ETF")
- `ticker` (text, e.g. "VOO")
- `allocation_pct` (numeric, % of investment portfolio, 0–100)
- `current_value` (numeric, current market value)
- `expected_return` (numeric, expected annual return %, e.g. 8.5)
- `risk_level` (text, 'low' | 'medium' | 'high')
- `created_at` (timestamptz)

## Security
- RLS enabled on every table.
- Single-tenant (no auth): policies allow anon + authenticated full CRUD.
- USING (true) is acceptable here because data is intentionally shared.
*/

-- Profile
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_salary numeric NOT NULL DEFAULT 0,
  rent_amount numeric NOT NULL DEFAULT 0,
  rent_due_day int NOT NULL DEFAULT 1,
  savings_target_pct numeric NOT NULL DEFAULT 30,
  invest_target_pct numeric NOT NULL DEFAULT 70,
  bank_balance numeric NOT NULL DEFAULT 0,
  savings_balance numeric NOT NULL DEFAULT 0,
  investment_balance numeric NOT NULL DEFAULT 0,
  risk_tolerance text NOT NULL DEFAULT 'balanced',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_profile" ON profile;
CREATE POLICY "anon_select_profile" ON profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_profile" ON profile;
CREATE POLICY "anon_insert_profile" ON profile FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_profile" ON profile;
CREATE POLICY "anon_update_profile" ON profile FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_profile" ON profile;
CREATE POLICY "anon_delete_profile" ON profile FOR DELETE TO anon, authenticated USING (true);

-- Salary History
CREATE TABLE IF NOT EXISTS salary_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_date date NOT NULL,
  amount numeric NOT NULL,
  expected_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE salary_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_salary" ON salary_history;
CREATE POLICY "anon_select_salary" ON salary_history FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_salary" ON salary_history;
CREATE POLICY "anon_insert_salary" ON salary_history FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_salary" ON salary_history;
CREATE POLICY "anon_update_salary" ON salary_history FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_salary" ON salary_history;
CREATE POLICY "anon_delete_salary" ON salary_history FOR DELETE TO anon, authenticated USING (true);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric NOT NULL,
  due_day int NOT NULL DEFAULT 1,
  category text NOT NULL DEFAULT 'other',
  is_paid boolean NOT NULL DEFAULT false,
  priority int NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_bills" ON bills;
CREATE POLICY "anon_select_bills" ON bills FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_bills" ON bills;
CREATE POLICY "anon_insert_bills" ON bills FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_bills" ON bills;
CREATE POLICY "anon_update_bills" ON bills FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_bills" ON bills;
CREATE POLICY "anon_delete_bills" ON bills FOR DELETE TO anon, authenticated USING (true);

-- Allocations
CREATE TABLE IF NOT EXISTS allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'salary',
  total_amount numeric NOT NULL,
  bank_amount numeric NOT NULL,
  savings_amount numeric NOT NULL,
  investment_amount numeric NOT NULL,
  confidence_score numeric NOT NULL DEFAULT 0,
  bills_reserved numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_allocations" ON allocations;
CREATE POLICY "anon_select_allocations" ON allocations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_allocations" ON allocations;
CREATE POLICY "anon_insert_allocations" ON allocations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_allocations" ON allocations;
CREATE POLICY "anon_update_allocations" ON allocations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_allocations" ON allocations;
CREATE POLICY "anon_delete_allocations" ON allocations FOR DELETE TO anon, authenticated USING (true);

-- Investments
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ticker text NOT NULL,
  allocation_pct numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  expected_return numeric NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_investments" ON investments;
CREATE POLICY "anon_select_investments" ON investments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_investments" ON investments;
CREATE POLICY "anon_insert_investments" ON investments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_investments" ON investments;
CREATE POLICY "anon_update_investments" ON investments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_investments" ON investments;
CREATE POLICY "anon_delete_investments" ON investments FOR DELETE TO anon, authenticated USING (true);
