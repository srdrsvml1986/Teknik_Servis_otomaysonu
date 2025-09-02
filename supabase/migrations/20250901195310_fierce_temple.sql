/*
  # Technical Service Automation System - Initial Schema

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `first_name` (text, required)
      - `last_name` (text, required) 
      - `phone` (text, required, unique)
      - `email` (text, optional)
      - `address` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `service_records`
      - `id` (uuid, primary key)
      - `tracking_number` (text, unique, auto-generated)
      - `customer_id` (uuid, foreign key to customers)
      - `created_by` (uuid, foreign key to auth.users)
      - `product_name` (text, required)
      - `product_serial` (text, required)
      - `service_center` (text, required)
      - `status` (enum: pending, in_progress, completed, cancelled)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `service_updates`
      - `id` (uuid, primary key)
      - `service_id` (uuid, foreign key to service_records)
      - `action` (text, required)
      - `performed_by` (uuid, foreign key to auth.users)
      - `performed_at` (timestamp)
    
    - `audit_logs`
      - `id` (uuid, primary key)
      - `table_name` (text, required)
      - `record_id` (uuid, required)
      - `operation` (enum: INSERT, UPDATE, DELETE)
      - `performed_by` (uuid, foreign key to auth.users)
      - `performed_at` (timestamp)
      - `old_data` (jsonb)
      - `new_data` (jsonb)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Public read access for service queries
    - Authenticated access for management operations

  3. Functions
    - Auto-generate tracking numbers for service records
    - Audit trigger functions for automatic logging
*/

-- Create custom types
CREATE TYPE service_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE audit_operation AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- Add user_role to auth.users metadata (handled via Supabase dashboard or auth hooks)
-- Users will have either 'admin' or 'user' role in their metadata

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_records table
CREATE TABLE IF NOT EXISTS service_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL DEFAULT 'TS' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(floor(random() * 10000)::text, 4, '0'),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  product_name text NOT NULL,
  product_serial text NOT NULL,
  service_center text NOT NULL,
  status service_status DEFAULT 'pending',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_updates table
CREATE TABLE IF NOT EXISTS service_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
  action text NOT NULL,
  performed_by uuid NOT NULL REFERENCES auth.users(id),
  performed_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation audit_operation NOT NULL,
  performed_by uuid REFERENCES auth.users(id),
  performed_at timestamptz DEFAULT now(),
  old_data jsonb,
  new_data jsonb
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Customer policies (public read for service queries)
CREATE POLICY "Anyone can read customers for service queries"
  ON customers
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (true);

-- Service records policies
CREATE POLICY "Anyone can read service records for tracking"
  ON service_records
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage service records"
  ON service_records
  FOR ALL
  TO authenticated
  USING (true);

-- Service updates policies
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

-- Audit logs policies (admin only)
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
      'user'
    ) = 'admin'
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_service_records_tracking ON service_records(tracking_number);
CREATE INDEX IF NOT EXISTS idx_service_records_customer ON service_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_records_status ON service_records(status);
CREATE INDEX IF NOT EXISTS idx_service_updates_service ON service_updates(service_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_records_updated_at
  BEFORE UPDATE ON service_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, record_id, operation, performed_by, old_data)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, record_id, operation, performed_by, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, record_id, operation, performed_by, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER customers_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON customers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER service_records_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON service_records
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();