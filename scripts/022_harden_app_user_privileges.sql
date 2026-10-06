-- Apply in a reviewed staging database before production.
-- Sign-up metadata is untrusted; newly-created accounts always start as public.
CREATE OR REPLACE FUNCTION public.handle_new_app_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.app_users (id, display_name, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', NULL),
    'public'::user_role,
    false
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

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
    false
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.prevent_self_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() = OLD.id AND (
    NEW.role IS DISTINCT FROM OLD.role
    OR NEW.is_approved IS DISTINCT FROM OLD.is_approved
  ) THEN
    RAISE EXCEPTION 'Users cannot change their own role or approval status'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_self_privilege_escalation ON public.app_users;
CREATE TRIGGER prevent_self_privilege_escalation
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_privilege_escalation();

DROP TRIGGER IF EXISTS prevent_self_privilege_escalation ON public.profiles;
CREATE TRIGGER prevent_self_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_privilege_escalation();
