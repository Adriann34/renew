-- Auto-create a public."User" row when a new auth user signs up.
--
-- This runs at the DB level so a profile row exists the moment someone registers,
-- but the app's Server Actions still upsert the User row defensively at every write
-- site (createListing, toggleSave, startConversation, updateProfile, ...). The trigger
-- is the happy path; the upserts are the guarantee. That's deliberate defense in depth:
-- if this trigger is ever dropped/disabled, or a user predates it, the app still works.
--
-- Two safety properties matter here:
--   1. The function SWALLOWS errors (EXCEPTION WHEN OTHERS THEN RETURN NEW) so that
--      profile-row creation can NEVER block auth signup itself. A throwing trigger on
--      auth.users surfaces to the user as "Database error saving new user" and stops
--      registration entirely — we never want profile bookkeeping to have that power.
--   2. ON CONFLICT (id) DO NOTHING makes it idempotent, and combined with (1) an email
--      unique-constraint collision (e.g. the OAuth/password duplicate-email case) just
--      skips row creation instead of failing — the lazy upsert reconciles it later.
--
-- SECURITY DEFINER lets the trigger insert into public."User" regardless of the role
-- Supabase Auth uses to write auth.users; SET search_path pins schema resolution so the
-- definer privileges can't be hijacked via a mutable search_path.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."User" (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup on profile-row creation; the app upserts defensively.
  RETURN NEW;
END;
$$;

-- The trigger targets auth.users, which only exists on the real Supabase database,
-- not on Prisma's clean shadow database used to validate migrations. Guard on the
-- auth schema so the shadow DB skips it — same pattern as the chat RLS policies.
-- (The statements inside the IF are never parsed there because the branch is false.)
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$do$;
