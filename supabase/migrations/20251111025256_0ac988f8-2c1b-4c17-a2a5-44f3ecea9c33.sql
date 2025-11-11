-- Arreglar RLS policies de user_consents
DROP POLICY IF EXISTS "Admins can view all consents" ON public.user_consents;
DROP POLICY IF EXISTS "Users can view their own consents" ON public.user_consents;

-- Recrear política simple
CREATE POLICY "Users can view own consents" 
  ON public.user_consents 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);