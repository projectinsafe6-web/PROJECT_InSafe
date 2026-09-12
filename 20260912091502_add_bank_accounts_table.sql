/*
# Add Bank Accounts Table

## Overview
Creates a new `bank_accounts` table so each user can store their bank account
details (account holder name, bank name, account number, IFSC code, account
type). This is mandatory onboarding data — new users must fill this in before
they can access the rest of the app.

## New Tables

### bank_accounts
- `id` (uuid, primary key)
- `user_id` (uuid, not null, defaults to auth.uid(), references auth.users with ON DELETE CASCADE)
- `account_holder_name` (text, not null — name of the account holder)
- `bank_name` (text, not null — name of the bank)
- `account_number` (text, not null — bank account number)
- `ifsc_code` (text, not null — IFSC code for Indian bank accounts)
- `account_type` (text, not null, default 'savings' — 'savings' | 'current' | 'salary')
- `created_at` (timestamptz, default now())

## Security
- RLS enabled on `bank_accounts`.
- 4 policies (SELECT, INSERT, UPDATE, DELETE) scoped to `TO authenticated`
  with `auth.uid() = user_id` ownership checks.
- `user_id` defaults to `auth.uid()` so client inserts omitting it still succeed.
*/

CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  account_holder_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  ifsc_code text NOT NULL,
  account_type text NOT NULL DEFAULT 'savings',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);

DROP POLICY IF EXISTS "select_own_bank_accounts" ON bank_accounts;
CREATE POLICY "select_own_bank_accounts" ON bank_accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_bank_accounts" ON bank_accounts;
CREATE POLICY "insert_own_bank_accounts" ON bank_accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_bank_accounts" ON bank_accounts;
CREATE POLICY "update_own_bank_accounts" ON bank_accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_bank_accounts" ON bank_accounts;
CREATE POLICY "delete_own_bank_accounts" ON bank_accounts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
