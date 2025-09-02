/*
  # Update RLS policies to use user metadata roles

  1. Security Updates
    - Drop existing problematic policies that reference non-existent PostgreSQL roles
    - Create new policies that properly check user_metadata->>'role'
    - Ensure proper access control for admin and user roles
    - Allow public access for customer portal queries

  2. Policy Changes
    - customers: Allow authenticated users full access, public read for service queries
    - service_records: Allow authenticated users full access, public read for tracking
    - service_updates: Allow authenticated users to create, public read access
    - audit_logs: Allow only admin users (from user_metadata) to read
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can read customers for service queries" ON customers;
DROP POLICY IF EXISTS "Authenticated users can manage customers" ON customers;
DROP POLICY IF EXISTS "Anyone can read service records for tracking" ON service_records;
DROP POLICY IF EXISTS "Authenticated users can manage service records" ON service_records;
DROP POLICY IF EXISTS "Anyone can read service updates" ON service_updates;
DROP POLICY IF EXISTS "Authenticated users can create service updates" ON service_updates;
DROP POLICY IF EXISTS "Admins can read audit logs" ON audit_logs;

-- Customers table policies
CREATE POLICY "Public can read customers for service queries"
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

-- Service records table policies
CREATE POLICY "Public can read service records for tracking"
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

-- Service updates table policies
CREATE POLICY "Public can read service updates"
  ON service_updates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create service updates"
  ON service_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Audit logs table policies (admin only)
CREATE POLICY "Admin users can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() -> 'user_metadata' ->> 'role'),
      'user'
    ) = 'admin'
  );