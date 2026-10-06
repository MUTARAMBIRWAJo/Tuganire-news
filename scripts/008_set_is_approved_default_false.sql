-- Set is_approved default to false for new signups
-- This script updates the app_users table and creates a trigger to automatically
-- create app_users entries when users sign up

-- First, add is_approved column to app_users if it doesn't exist
ALTER TABLE public.app_users 
ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- Update the default value to false (for new rows)
ALTER TABLE public.app_users 
ALTER COLUMN is_approved SET DEFAULT false;

-- Update existing users to keep their current approval status
-- (Don't change existing users, only affect new signups)

-- Create or replace function to handle new user creation in app_users
CREATE OR REPLACE FUNCTION public.handle_new_app_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create app_users entry with is_approved = false by default
  INSERT INTO public.app_users (
    id,
    display_name,
    role,
    is_approved
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', NULL),
    'public'::user_role,
    false  -- New signups are not approved by default
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_app_users ON auth.users;

-- Create trigger to create app_users entry on signup
CREATE TRIGGER on_auth_user_created_app_users
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_app_user();

-- Also update the existing handle_new_user function to set is_approved = false for profiles
-- (if profiles table is still being used)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    'public'::user_role,
    false  -- New signups are not approved by default
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
