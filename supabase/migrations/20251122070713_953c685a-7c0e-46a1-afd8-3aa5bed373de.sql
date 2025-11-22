-- ============================================
-- POLÍTICAS RLS PARA DOCUMENTOS FISCALES
-- ISO 27001 A.9.4: Control de acceso a datos
-- ============================================

-- ========== BORRADORES DE CARTA PORTE ==========
-- Permitir a usuarios ver solo sus propios borradores
DROP POLICY IF EXISTS "Users can view own draft cartas porte" ON borradores_carta_porte;
CREATE POLICY "Users can view own draft cartas porte" 
ON borradores_carta_porte FOR SELECT 
USING (auth.uid() = user_id);

-- Permitir crear borradores
DROP POLICY IF EXISTS "Users can create own draft cartas porte" ON borradores_carta_porte;
CREATE POLICY "Users can create own draft cartas porte" 
ON borradores_carta_porte FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir actualizar borradores
DROP POLICY IF EXISTS "Users can update own draft cartas porte" ON borradores_carta_porte;
CREATE POLICY "Users can update own draft cartas porte" 
ON borradores_carta_porte FOR UPDATE 
USING (auth.uid() = user_id);

-- Permitir eliminar borradores
DROP POLICY IF EXISTS "Users can delete own draft cartas porte" ON borradores_carta_porte;
CREATE POLICY "Users can delete own draft cartas porte" 
ON borradores_carta_porte FOR DELETE 
USING (auth.uid() = user_id);

-- ========== FACTURAS ==========
-- Permitir a usuarios ver solo sus propias facturas
DROP POLICY IF EXISTS "Users can view own facturas" ON facturas;
CREATE POLICY "Users can view own facturas" 
ON facturas FOR SELECT 
USING (auth.uid() = user_id);

-- Permitir crear facturas
DROP POLICY IF EXISTS "Users can create own facturas" ON facturas;
CREATE POLICY "Users can create own facturas" 
ON facturas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permitir actualizar facturas (solo borradores)
DROP POLICY IF EXISTS "Users can update own draft facturas" ON facturas;
CREATE POLICY "Users can update own draft facturas" 
ON facturas FOR UPDATE 
USING (auth.uid() = user_id AND status = 'draft');

-- NO permitir eliminar facturas timbradas (cumplimiento fiscal)
DROP POLICY IF EXISTS "Users can delete only draft facturas" ON facturas;
CREATE POLICY "Users can delete only draft facturas" 
ON facturas FOR DELETE 
USING (auth.uid() = user_id AND status = 'draft');

-- ========== CARTAS PORTE ==========
-- Permitir a usuarios ver solo sus propias cartas porte
DROP POLICY IF EXISTS "Users can view own cartas porte" ON cartas_porte;
CREATE POLICY "Users can view own cartas porte" 
ON cartas_porte FOR SELECT 
USING (auth.uid() = usuario_id);

-- Permitir crear cartas porte
DROP POLICY IF EXISTS "Users can create own cartas porte" ON cartas_porte;
CREATE POLICY "Users can create own cartas porte" 
ON cartas_porte FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

-- Permitir actualizar solo si no está timbrada
DROP POLICY IF EXISTS "Users can update non-timbrada cartas porte" ON cartas_porte;
CREATE POLICY "Users can update non-timbrada cartas porte" 
ON cartas_porte FOR UPDATE 
USING (auth.uid() = usuario_id AND status != 'timbrada');

-- NO permitir eliminar cartas porte timbradas (cumplimiento fiscal)
DROP POLICY IF EXISTS "Users can delete only draft cartas porte" ON cartas_porte;
CREATE POLICY "Users can delete only draft cartas porte" 
ON cartas_porte FOR DELETE 
USING (auth.uid() = usuario_id AND status IN ('draft', 'cancelada'));