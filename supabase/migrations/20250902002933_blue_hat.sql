/*
  # Remove public.users table

  1. Changes
    - Drop public.users table and related objects
    - Remove triggers and functions related to users table
    - Clean up user management to use only auth.users

  2. Security
    - Remove RLS policies for users table
    - Keep auth.users native security
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- Drop the users table
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop the trigger function for new user handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;