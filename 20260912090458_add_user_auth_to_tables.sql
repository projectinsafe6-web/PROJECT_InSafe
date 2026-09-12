/*
# Add User Authentication Support

## Overview
Converts the single-tenant schema to multi-user with per-user data isolation.
Each table gets a `user_id` column scoped to the authenticated user, and all
RLS policies are updated from `TO anon, authenticated USING (true)` to
`TO authenticated` with ownership checks via `auth.uid()`.

## Changes

### All tables (profile, salary_history, bills, allocations, investments)
- Added `user_id uuid NOT NULL DEFAULT auth.uid()` column
- Added foreign key to `auth.users(id)` with `ON DELETE CASCADE`
- Added index on `user_id` for query performance

### RLS Policies (all tables)
- Dropped existing `anon_*` policies (which allowed public access)
- Created 4 new policies per table (SELECT, INSERT, UPDATE, DELETE)
  scoped to `TO authenticated` with `auth.uid() = user_id` ownership checks
- INSERT policies rely on `DEFAULT auth.uid()` so the client can omit `user_id`

## Security
- All tables now require authentication
- Users can only see/modify their own rows
- Owner columns default to `auth.uid()` so inserts work without client passing user_id
*/

-- Add user_id to profile
ALTER TABLE profile ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_profile_user_id ON profile(user_id);

-- Add user_id to salary_history
ALTER TABLE salary_history ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_salary_history_user_id ON salary_history(user_id);

-- Add user_id to bills
ALTER TABLE bills ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);

-- Add user_id to allocations
ALTER TABLE allocations ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_allocations_user_id ON allocations(user_id);

-- Add user_id to investments
ALTER TABLE investments ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);

-- === Profile policies ===
DROP POLICY IF EXISTS "anon_select_profile" ON profile;
DROP POLICY IF EXISTS "anon_insert_profile" ON profile;
DROP POLICY IF EXISTS "anon_update_profile" ON profile;
DROP POLICY IF EXISTS "anon_delete_profile" ON profile;

CREATE POLICY "select_own_profile" ON profile FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_profile" ON profile FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_profile" ON profile FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_profile" ON profile FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- === Salary history policies ===
DROP POLICY IF EXISTS "anon_select_salary" ON salary_history;
DROP POLICY IF EXISTS "anon_insert_salary" ON salary_history;
DROP POLICY IF EXISTS "anon_update_salary" ON salary_history;
DROP POLICY IF EXISTS "anon_delete_salary" ON salary_history;

CREATE POLICY "select_own_salary" ON salary_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_salary" ON salary_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_salary" ON salary_history FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_salary" ON salary_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- === Bills policies ===
DROP POLICY IF EXISTS "anon_select_bills" ON bills;
DROP POLICY IF EXISTS "anon_insert_bills" ON bills;
DROP POLICY IF EXISTS "anon_update_bills" ON bills;
DROP POLICY IF EXISTS "anon_delete_bills" ON bills;

CREATE POLICY "select_own_bills" ON bills FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_bills" ON bills FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_bills" ON bills FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_bills" ON bills FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- === Allocations policies ===
DROP POLICY IF EXISTS "anon_select_allocations" ON allocations;
DROP POLICY IF EXISTS "anon_insert_allocations" ON allocations;
DROP POLICY IF EXISTS "anon_update_allocations" ON allocations;
DROP POLICY IF EXISTS "anon_delete_allocations" ON allocations;

CREATE POLICY "select_own_allocations" ON allocations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_allocations" ON allocations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_allocations" ON allocations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_allocations" ON allocations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- === Investments policies ===
DROP POLICY IF EXISTS "anon_select_investments" ON investments;
DROP POLICY IF EXISTS "anon_insert_investments" ON investments;
DROP POLICY IF EXISTS "anon_update_investments" ON investments;
DROP POLICY IF EXISTS "anon_delete_investments" ON investments;

CREATE POLICY "select_own_investments" ON investments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_investments" ON investments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_investments" ON investments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_investments" ON investments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
