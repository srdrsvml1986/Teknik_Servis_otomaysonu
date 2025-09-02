/*
  # Add users table for staff management

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text, unique) - user email address
      - `role` (text) - user role (admin, authenticated)
      - `created_at` (timestamp) - when user was created
      - `updated_at` (timestamp) - when user was last updated

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read user data
    - Add policy for admins to manage users

  3. Data Population
    - Insert existing authenticated user into users table
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'authenticated',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read user data"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (jwt() -> 'app_metadata' -> 'role')::text,
      'authenticated'
    ) = 'admin'
  );

-- Add trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert existing user
INSERT INTO users (id, email, role)
SELECT 
  id,
  email,
  COALESCE((raw_app_meta_data ->> 'role'), 'authenticated') as role
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  updated_at = now();