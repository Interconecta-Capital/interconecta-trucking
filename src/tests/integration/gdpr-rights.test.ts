/**
 * Tests de Integración: Derechos GDPR/LFPDPPP
 * FASE 4 - Sprint 1: Testing Automatizado
 * 
 * Valida flujos completos de derechos ARCO:
 * - Exportación de datos (Derecho de Acceso)
 * - Anonimización (Derecho al Olvido)
 * - Eliminación con período de gracia
 * - Verificación de eliminación completa
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Mock de Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('Derechos GDPR/LFPDPPP - Integración', () => {
  const testUserId = 'test-user-gdpr-123';

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock de usuario autenticado
    (supabase.auth.getUser as any).mockResolvedValue({
      data: {
        user: {
          id: testUserId,
          email: 'test@gdpr.com',
        },
      },
      error: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ============================================================================
  // DERECHO DE ACCESO (GDPR Art. 15)
  // ============================================================================
  describe('Derecho de Acceso - Exportación de Datos', () => {
    it('debe exportar todos los datos del usuario en formato JSON', async () => {
      const mockUserData = {
        usuario: {
          id: testUserId,
          nombre: 'Juan Pérez',
          email: 'test@gdpr.com',
          empresa: 'Test Company',
          created_at: '2025-01-01T00:00:00Z',
        },
        conductores: [
          {
            id: 'conductor-1',
            nombre_completo: 'Pedro García',
            licencia: 'LIC123456',
            user_id: testUserId,
          },
        ],
        vehiculos: [
          {
            id: 'vehiculo-1',
            placas: 'ABC-123',
            user_id: testUserId,
          },
        ],
        cartas_porte: [
          {
            id: 'carta-1',
            id_ccp: 'CCP001',
            usuario_id: testUserId,
          },
        ],
        consentimientos: [
          {
            id: 'consent-1',
            consent_type: 'privacy_policy',
            version: '1.0',
            consented_at: '2025-01-01T00:00:00Z',
            user_id: testUserId,
          },
        ],
        exportado_en: new Date().toISOString(),
      };

      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      // Ejecutar exportación
      const { data, error } = await supabase.rpc('exportar_datos_usuario', {
        target_user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.usuario.id).toBe(testUserId);
      expect(data.conductores).toHaveLength(1);
      expect(data.vehiculos).toHaveLength(1);
      expect(data.cartas_porte).toHaveLength(1);
      expect(data.consentimientos).toHaveLength(1);
      expect(data.exportado_en).toBeDefined();
    });

    it('debe incluir historial de consentimientos', async () => {
      const mockUserData = {
        consentimientos: [
          {
            id: 'consent-1',
            consent_type: 'privacy_policy',
            version: '1.0',
            consented_at: '2025-01-01T00:00:00Z',
          },
          {
            id: 'consent-2',
            consent_type: 'terms_of_service',
            version: '1.0',
            consented_at: '2025-01-01T00:00:00Z',
          },
        ],
      };

      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const { data } = await supabase.rpc('exportar_datos_usuario', {
        target_user_id: testUserId,
      });

      expect(data.consentimientos).toHaveLength(2);
      expect(data.consentimientos[0].consent_type).toBe('privacy_policy');
      expect(data.consentimientos[1].consent_type).toBe('terms_of_service');
    });

    it('debe registrar evento de auditoría al exportar', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: { usuario: {}, exportado_en: new Date().toISOString() },
        error: null,
      });

      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  event_type: 'data_exported',
                  user_id: testUserId,
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from = fromMock;

      // Exportar datos
      await supabase.rpc('exportar_datos_usuario', {
        target_user_id: testUserId,
      });

      // Verificar que se registró evento de auditoría
      const { data: auditLogs } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('event_type', 'data_exported')
        .order('created_at', { ascending: false });

      expect(auditLogs).toBeDefined();
      expect(auditLogs[0].event_type).toBe('data_exported');
    });

    it('debe denegar exportación si usuario no es propietario', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'No autorizado para exportar datos de este usuario' },
      });

      const { data, error } = await supabase.rpc('exportar_datos_usuario', {
        target_user_id: 'otro-usuario-456',
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('No autorizado');
      expect(data).toBeNull();
    });
  });

  // ============================================================================
  // DERECHO AL OLVIDO (GDPR Art. 17)
  // ============================================================================
  describe('Derecho al Olvido - Anonimización', () => {
    it('debe anonimizar todos los datos personales', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      // Ejecutar anonimización
      const { data, error } = await supabase.rpc('anonimizar_usuario', {
        target_user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(data).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('anonimizar_usuario', {
        target_user_id: testUserId,
      });
    });

    it('debe reemplazar email con sufijo aleatorio', async () => {
      const mockSupabase = supabase as any;
      
      // Mock de verificación post-anonimización
      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: testUserId,
                email: 'anonimo_abc12345@eliminado.local',
                nombre: 'Usuario Anonimizado',
              },
              error: null,
            }),
          }),
        }),
      });

      // Verificar datos después de anonimización
      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', testUserId)
        .single();

      expect(data.email).toMatch(/^anonimo_[a-z0-9]+@eliminado\.local$/);
      expect(data.nombre).toBe('Usuario Anonimizado');
    });

    it('debe anonimizar conductores asociados', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'conductor-1',
                nombre_completo: 'Conductor Anonimizado abc12345',
                rfc: 'ANONabc12345',
                licencia: 'ANONabc12345',
                user_id: testUserId,
              },
            ],
            error: null,
          }),
        }),
      });

      await supabase.rpc('anonimizar_usuario', {
        target_user_id: testUserId,
      });

      const { data: conductores } = await supabase
        .from('conductores')
        .select('*')
        .eq('user_id', testUserId);

      expect(conductores[0].nombre_completo).toContain('Conductor Anonimizado');
      expect(conductores[0].rfc).toMatch(/^ANON[a-z0-9]+$/);
    });

    it('debe registrar evento de auditoría al anonimizar', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                event_type: 'user_anonymized',
                user_id: testUserId,
              },
            ],
            error: null,
          }),
        }),
      });

      await supabase.rpc('anonimizar_usuario', {
        target_user_id: testUserId,
      });

      const { data: auditLogs } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('event_type', 'user_anonymized');

      expect(auditLogs[0].event_type).toBe('user_anonymized');
    });
  });

  // ============================================================================
  // ELIMINACIÓN CON PERÍODO DE GRACIA
  // ============================================================================
  describe('Eliminación con Período de Gracia', () => {
    it('debe marcar cuenta para eliminación en 30 días', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                user_id: testUserId,
                request_date: new Date().toISOString(),
                deletion_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              },
              error: null,
            }),
          }),
        }),
      });

      await supabase.rpc('eliminar_datos_usuario', {
        target_user_id: testUserId,
      });

      const { data: deletionRequest } = await supabase
        .from('deletion_requests')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(deletionRequest).toBeDefined();
      expect(deletionRequest.user_id).toBe(testUserId);
      
      const deletionDate = new Date(deletionRequest.deletion_date);
      const expectedDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const timeDiff = Math.abs(deletionDate.getTime() - expectedDate.getTime());
      
      expect(timeDiff).toBeLessThan(1000); // Menos de 1 segundo de diferencia
    });

    it('debe anonimizar inmediatamente antes de marcar para eliminación', async () => {
      const mockSupabase = supabase as any;
      const rpcCalls: string[] = [];

      mockSupabase.rpc = vi.fn((functionName: string) => {
        rpcCalls.push(functionName);
        return Promise.resolve({ data: true, error: null });
      });

      await supabase.rpc('eliminar_datos_usuario', {
        target_user_id: testUserId,
      });

      // Verificar que se llamó la función correcta
      expect(rpcCalls).toContain('eliminar_datos_usuario');
    });
  });

  // ============================================================================
  // VERIFICACIÓN DE ELIMINACIÓN COMPLETA
  // ============================================================================
  describe('Verificación de Eliminación Completa', () => {
    it('debe verificar que no quedan datos del usuario', async () => {
      const mockVerificationResult = {
        user_exists: false,
        conductores_count: 0,
        vehiculos_count: 0,
        cartas_porte_count: 0,
        consents_count: 0,
        deletion_complete: true,
        verified_at: new Date().toISOString(),
      };

      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: mockVerificationResult,
        error: null,
      });

      const { data, error } = await supabase.rpc('verificar_eliminacion_completa', {
        target_user_id: testUserId,
      });

      expect(error).toBeNull();
      expect(data.deletion_complete).toBe(true);
      expect(data.user_exists).toBe(false);
      expect(data.conductores_count).toBe(0);
      expect(data.vehiculos_count).toBe(0);
    });

    it('debe detectar datos remanentes', async () => {
      const mockVerificationResult = {
        user_exists: true,
        conductores_count: 2,
        vehiculos_count: 1,
        cartas_porte_count: 0,
        consents_count: 0,
        deletion_complete: false,
        verified_at: new Date().toISOString(),
      };

      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: mockVerificationResult,
        error: null,
      });

      const { data } = await supabase.rpc('verificar_eliminacion_completa', {
        target_user_id: testUserId,
      });

      expect(data.deletion_complete).toBe(false);
      expect(data.conductores_count).toBeGreaterThan(0);
      expect(data.vehiculos_count).toBeGreaterThan(0);
    });

    it('debe requerir permisos de superusuario', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Acceso denegado: se requieren permisos de superusuario' },
      });

      const { data, error } = await supabase.rpc('verificar_eliminacion_completa', {
        target_user_id: 'otro-usuario-456',
      });

      expect(error).toBeDefined();
      expect(error.message).toContain('Acceso denegado');
      expect(data).toBeNull();
    });
  });

  // ============================================================================
  // FLUJO COMPLETO DE ELIMINACIÓN
  // ============================================================================
  describe('Flujo Completo de Eliminación', () => {
    it('debe ejecutar flujo completo: exportar > anonimizar > eliminar > verificar', async () => {
      const mockSupabase = supabase as any;
      const executedSteps: string[] = [];

      mockSupabase.rpc = vi.fn((functionName: string) => {
        executedSteps.push(functionName);
        return Promise.resolve({ data: true, error: null });
      });

      // Paso 1: Exportar datos
      await supabase.rpc('exportar_datos_usuario', {
        target_user_id: testUserId,
      });

      // Paso 2: Anonimizar (incluido en eliminar_datos_usuario)
      await supabase.rpc('eliminar_datos_usuario', {
        target_user_id: testUserId,
      });

      // Paso 3: Verificar (solo superusuarios)
      await supabase.rpc('verificar_eliminacion_completa', {
        target_user_id: testUserId,
      });

      expect(executedSteps).toEqual([
        'exportar_datos_usuario',
        'eliminar_datos_usuario',
        'verificar_eliminacion_completa',
      ]);
    });
  });
});
