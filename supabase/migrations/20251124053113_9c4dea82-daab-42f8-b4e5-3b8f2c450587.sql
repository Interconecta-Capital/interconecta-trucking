-- Enable RLS on audit_log table
-- Fixes Supabase Linter Error: SUPA_rls_disabled_in_public
-- https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Allow superusers to view all audit logs
CREATE POLICY "Superusers can view all audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (public.is_superuser_secure(auth.uid()));

-- Allow admins to view all audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Comment for documentation
COMMENT ON TABLE public.audit_log IS 'System audit log with RLS enabled. Only admins and superusers can access.';
