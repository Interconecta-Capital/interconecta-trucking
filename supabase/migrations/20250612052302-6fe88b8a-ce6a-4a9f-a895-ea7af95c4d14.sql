
-- Add NOT NULL constraints and validation for critical business fields
ALTER TABLE public.profiles 
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN nombre SET NOT NULL;

-- Add unique constraint for RFC to prevent duplicates
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_rfc_unique UNIQUE (rfc);

-- Add unique constraint for email to prevent duplicates  
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Add NOT NULL constraint for critical carta porte fields
ALTER TABLE public.cartas_porte 
ALTER COLUMN rfc_emisor SET NOT NULL,
ALTER COLUMN rfc_receptor SET NOT NULL;

-- Add NOT NULL constraint for tenant association
ALTER TABLE public.usuarios 
ALTER COLUMN tenant_id SET NOT NULL;

-- Create function to validate RFC format
CREATE OR REPLACE FUNCTION public.validate_rfc_format(rfc_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if RFC matches Mexican RFC pattern (12-13 characters)
  IF rfc_input IS NULL OR length(trim(rfc_input)) < 12 OR length(trim(rfc_input)) > 13 THEN
    RETURN FALSE;
  END IF;
  
  -- Check basic RFC pattern
  IF NOT (trim(upper(rfc_input)) ~ '^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$') THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Add check constraint for RFC format validation
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_rfc_format_check 
CHECK (rfc IS NULL OR public.validate_rfc_format(rfc));

-- Create audit log table for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (auth.uid() IN (
    SELECT auth_user_id FROM public.usuarios WHERE rol = 'admin'
  ));

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_data,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create table for rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email, IP, or user_id
  action_type TEXT NOT NULL, -- 'login_attempt', 'password_reset', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on rate limit log
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_identifier_action_time 
ON public.rate_limit_log (identifier, action_type, created_at);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_action_type TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Count attempts in the time window
  SELECT COUNT(*)
  INTO attempt_count
  FROM public.rate_limit_log
  WHERE identifier = p_identifier
    AND action_type = p_action_type
    AND created_at > now() - (p_window_minutes || ' minutes')::INTERVAL;
    
  -- Return false if rate limit exceeded
  IF attempt_count >= p_max_attempts THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create function to record rate limit attempt
CREATE OR REPLACE FUNCTION public.record_rate_limit_attempt(
  p_identifier TEXT,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.rate_limit_log (identifier, action_type, metadata)
  VALUES (p_identifier, p_action_type, p_metadata);
END;
$$;
