-- Enable RLS on schema_version table
ALTER TABLE public.schema_version ENABLE ROW LEVEL SECURITY;

-- Only superusers can access schema_version table
CREATE POLICY "Only superusers access schema_version"
ON public.schema_version
FOR ALL
TO authenticated
USING (is_superuser_secure(auth.uid()))
WITH CHECK (is_superuser_secure(auth.uid()));