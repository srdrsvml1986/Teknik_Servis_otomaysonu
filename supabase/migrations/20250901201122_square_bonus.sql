/*
  # Fix RLS Policies for Role Checking

  1. Security Updates
    - Fix RLS policies to properly check user roles from JWT metadata
    - Remove references to non-existent PostgreSQL roles
    - Ensure proper access control for admin and user roles

  2. Changes
    - Update audit_logs policy to check JWT user_metadata role
    - Ensure all other policies work with authenticated users
*/

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;

-- Create corrected policy for audit logs that checks JWT metadata
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'), 
      'user'
    ) = 'admin'
  );

-- Ensure customers table has proper policies
DROP POLICY IF EXISTS "Anyone can read customers for service queries" ON customers;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;

CREATE POLICY "Anyone can read customers for service queries"
  ON customers
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure service_records table has proper policies
DROP POLICY IF EXISTS "Anyone can read service records for tracking" ON service_records;
DROP POLICY IF EXISTS "Authenticated users can manage service records" ON service_records;

CREATE POLICY "Anyone can read service records for tracking"
  ON service_records
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage service records"
  ON service_records
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure service_updates table has proper policies
DROP POLICY IF EXISTS "Anyone can read service updates" ON service_updates;
DROP POLICY IF EXISTS "Authenticated users can create service updates" ON service_updates;

CREATE POLICY "Anyone can read service updates"
  ON service_updates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create service updates"
  ON service_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);