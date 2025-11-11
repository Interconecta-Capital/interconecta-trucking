/**
 * Tests Unitarios: useUnifiedPermissionsV2
 * FASE 4 - Sprint 1: Testing Automatizado
 * 
 * Valida las 4 reglas de negocio críticas:
 * 1. Superusuario: Acceso total e incondicional
 * 2. Trial: Acceso completo por 14 días, luego bloqueo
 * 3. Suscrito: Límites según plan + verificación en tiempo real
 * 4. Expirado: Acceso bloqueado + mensaje de upgrade
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock de Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

// Mock de auth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-123', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

// Wrapper para React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUnifiedPermissionsV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // REGLA 1: SUPERUSUARIO - Acceso Total e Incondicional
  // ============================================================================
  describe('REGLA 1: Superusuario', () => {
    it('debe tener acceso completo sin límites', async () => {
      // Mock: Usuario con rol superuser
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'test-user-123',
                role: 'superuser',
                trial_start_date: null,
                trial_end_date: null,
                subscription_status: null,
              },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useUnifiedPermissionsV2(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificaciones
      expect(result.current.accessLevel).toBe('superuser');
      expect(result.current.hasFullAccess).toBe(true);
      expect(result.current.canCreateConductor.allowed).toBe(true);
      expect(result.current.canCreateVehiculo.allowed).toBe(true);
      expect(result.current.canCreateSocio.allowed).toBe(true);
      expect(result.current.canCreateCartaPorte.allowed).toBe(true);
      expect(result.current.accessReason).toBe('Acceso completo de superusuario');
    });

    it('debe mostrar badge de Superusuario', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { role: 'superuser' },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useUnifiedPermissionsV2(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.planInfo.name).toBe('Superusuario');
      });
    });
  });

  // ============================================================================
  // REGLA 2: TRIAL - Acceso Completo por 14 días
  // ============================================================================
  describe('REGLA 2: Usuario Trial', () => {
    it('debe tener acceso completo durante trial activo (día 5/14)', async () => {
      const trialStartDate = new Date();
      trialStartDate.setDate(trialStartDate.getDate() - 5); // Hace 5 días

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'test-user-123',
                role: 'user',
                trial_start_date: trialStartDate.toISOString(),
                trial_end_date: new Date(trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                subscription_status: null,
              },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useUnifiedPermissionsV2(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificaciones
      expect(result.current.accessLevel).toBe('trial');
      expect(result.current.hasFullAccess).toBe(true);
      expect(result.current.canCreateConductor.allowed).toBe(true);
      expect(result.current.canCreateCartaPorte.allowed).toBe(true);
      expect(result.current.planInfo.daysRemaining).toBe(9); // 14 - 5 = 9
      expect(result.current.planInfo.name).toBe('Prueba Gratuita');
    });

    it('debe bloquear acceso cuando trial expira (día 15)', async () => {
      const trialStartDate = new Date();
      trialStartDate.setDate(trialStartDate.getDate() - 15); // Hace 15 días

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'test-user-123',
                role: 'user',
                trial_start_date: trialStartDate.toISOString(),
                trial_end_date: new Date(trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                subscription_status: null,
              },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useUnifiedPermissionsV2(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificaciones
      expect(result.current.accessLevel).toBe('expired');
      expect(result.current.hasFullAccess).toBe(false);
      expect(result.current.canCreateConductor.allowed).toBe(false);
      expect(result.current.canCreateCartaPorte.allowed).toBe(false);
      expect(result.current.accessReason).toContain('período de prueba ha expirado');
    });
  });

  // ============================================================================
  // REGLA 3: SUSCRITO - Límites según Plan
  // ============================================================================
  describe('REGLA 3: Usuario Suscrito con Límites', () => {
    it('debe permitir creación hasta alcanzar límite (5/10 conductores)', async () => {
      const mockSupabase = supabase as any;
      
      // Mock usuario con suscripción activa
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'usuarios') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'test-user-123',
                    role: 'user',
                    subscription_status: 'active',
                    trial_start_date: null,
                  },
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === 'subscriptions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      plan_id: 'plan-basico',
                      status: 'active',
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          };
        } else if (table === 'plan_limits') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    conductores_limit: 10,
                    vehiculos_limit: 5,
                    cartas_porte_limit: 50,
                  },
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === 'conductores') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{}, {}, {}, {}, {}], // 5 conductores
                error: null,
                count: 5,
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const { result } = renderHook(() => useUnifiedPermissionsV2(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificaciones
      expect(result.current.accessLevel).toBe('paid');
      expect(result.current.hasFullAccess).toBe(true);
      expect(result.current.canCreateConductor.allowed).toBe(true);
      expect(result.current.canCreateConductor.limit).toBe(10);
      expect(result.current.canCreateConductor.used).toBe(5);
      expect(result.current.canCreateConductor.reason).toContain('5 de 10');
    });

    it('debe bloquear creación al alcanzar límite (10/10 conductores)', async () => {
      const mockSupabase = supabase as any;
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'usuarios') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'test-user-123',
                    role: 'user',
                    subscription_status: 'active',
                  },
                  error: null,
                }),
              }),
            }),
          };
        } else if (table === 'conductores') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: Array(10).fill({}), // 10 conductores (límite alcanzado)
                error: null,
                count: 10,
              }),
            }),
          };
        } else if (table === 'plan_limits') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { conductores_limit: 10 },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const { result } = renderHook(() => useUnifiedPermissionsV2(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verificaciones
      expect(result.current.canCreateConductor.allowed).toBe(false);
      expect(result.current.canCreateConductor.reason).toContain('límite de conductores');
      expect(result.current.canCreateConductor.used).toBe(10);
      expect(result.current.canCreateConductor.limit).toBe(10);
    });
  });

  // ============================================================================
  // REGLA 4: UPGRADE DE PLAN - Actualización Inmediata
  // ============================================================================
  describe('REGLA 4: Upgrade de Plan', () => {
    it('debe reflejar nuevos límites inmediatamente después de upgrade', async () => {
      const mockSupabase = supabase as any;
      
      // Simular upgrade de Plan Básico (10 conductores) a Plan Pro (50 conductores)
      let currentPlanLimit = 10;

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'plan_limits') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { conductores_limit: currentPlanLimit },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: vi.fn() };
      });

      const { result, rerender } = renderHook(() => useUnifiedPermissionsV2(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.canCreateConductor.limit).toBe(10);
      });

      // Simular upgrade
      currentPlanLimit = 50;
      rerender();

      await waitFor(() => {
        expect(result.current.canCreateConductor.limit).toBe(50);
      });

      expect(result.current.planInfo.name).not.toBe('Prueba Gratuita');
    });
  });

  // ============================================================================
  // CASOS EDGE - Manejo de Errores
  // ============================================================================
  describe('Casos Edge', () => {
    it('debe manejar error de base de datos correctamente', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useUnifiedPermissionsV2(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Debe tener valores por defecto seguros
      expect(result.current.hasFullAccess).toBe(false);
      expect(result.current.accessLevel).toBe('blocked');
    });

    it('debe manejar usuario sin trial ni suscripción (nuevo)', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'test-user-123',
                role: 'user',
                trial_start_date: null,
                subscription_status: null,
              },
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useUnifiedPermissionsV2(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Usuario nuevo debe estar en estado bloqueado hasta que se active trial
      expect(result.current.accessLevel).toBe('blocked');
    });
  });
});
