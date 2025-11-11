/**
 * Tests Unitarios: useSecurityAuditLog
 * FASE 4 - Sprint 1: Testing Automatizado
 * 
 * Valida funcionalidad del dashboard de auditoría:
 * - Filtrado de eventos de seguridad
 * - Cálculo de estadísticas
 * - Refetch automático
 * - Manejo de errores
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSecurityAuditLog, useSecurityStats } from '@/hooks/admin/useSecurityAuditLog';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock de Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchInterval: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSecurityAuditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // FILTRADO DE EVENTOS
  // ============================================================================
  describe('Filtrado de Eventos', () => {
    it('debe obtener eventos sin filtros', async () => {
      const mockEvents = [
        {
          id: '1',
          event_type: 'login',
          user_id: 'user-123',
          created_at: new Date().toISOString(),
          event_data: { success: true },
        },
        {
          id: '2',
          event_type: 'failed_login',
          user_id: 'user-456',
          created_at: new Date().toISOString(),
          event_data: { reason: 'Invalid password' },
        },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: mockEvents,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useSecurityAuditLog({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockEvents);
      expect(result.current.data).toHaveLength(2);
    });

    it('debe filtrar por tipo de evento', async () => {
      const mockEvents = [
        {
          id: '1',
          event_type: 'failed_login',
          user_id: 'user-123',
          created_at: new Date().toISOString(),
        },
      ];

      const mockSupabase = supabase as any;
      const eqMock = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: mockEvents,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      });

      const { result } = renderHook(
        () => useSecurityAuditLog({ eventType: 'failed_login' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(eqMock).toHaveBeenCalledWith('event_type', 'failed_login');
      expect(result.current.data).toEqual(mockEvents);
    });

    it('debe filtrar por usuario específico', async () => {
      const mockSupabase = supabase as any;
      const eqMock = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      });

      renderHook(() => useSecurityAuditLog({ userId: 'user-123' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(eqMock).toHaveBeenCalledWith('user_id', 'user-123');
      });
    });

    it('debe filtrar por rango de fechas', async () => {
      const mockSupabase = supabase as any;
      const gteMock = vi.fn().mockReturnValue({
        lte: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            gte: gteMock,
          }),
        }),
      });

      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      renderHook(
        () => useSecurityAuditLog({ startDate, endDate }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(gteMock).toHaveBeenCalledWith('created_at', startDate);
      });
    });

    it('debe combinar múltiples filtros', async () => {
      const mockSupabase = supabase as any;
      const eqMock = vi.fn().mockReturnThis();
      const gteMock = vi.fn().mockReturnThis();
      const lteMock = vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqMock,
          gte: gteMock,
          lte: lteMock,
        }),
      });

      renderHook(
        () =>
          useSecurityAuditLog({
            eventType: 'login',
            userId: 'user-123',
            startDate: '2025-01-01',
            endDate: '2025-01-31',
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(eqMock).toHaveBeenCalledWith('event_type', 'login');
        expect(eqMock).toHaveBeenCalledWith('user_id', 'user-123');
        expect(gteMock).toHaveBeenCalledWith('created_at', '2025-01-01');
        expect(lteMock).toHaveBeenCalledWith('created_at', '2025-01-31');
      });
    });
  });

  // ============================================================================
  // MANEJO DE ERRORES
  // ============================================================================
  describe('Manejo de Errores', () => {
    it('debe manejar errores de base de datos', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database connection failed' },
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useSecurityAuditLog({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('debe retornar array vacío en lugar de null', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const { result } = renderHook(() => useSecurityAuditLog({}), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });
});

// ============================================================================
// TESTS: useSecurityStats
// ============================================================================
describe('useSecurityStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Cálculo de Estadísticas', () => {
    it('debe calcular estadísticas correctamente', async () => {
      const now = new Date();
      const mockEvents = [
        { event_type: 'login', created_at: now.toISOString() },
        { event_type: 'login', created_at: now.toISOString() },
        { event_type: 'failed_login', created_at: now.toISOString() },
        { event_type: 'failed_login', created_at: now.toISOString() },
        { event_type: 'failed_login', created_at: now.toISOString() },
        { event_type: 'user_created', created_at: now.toISOString() },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            data: mockEvents,
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useSecurityStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        total: 6,
        failedLogins: 3,
        successfulLogins: 2,
        byType: {
          login: 2,
          failed_login: 3,
          user_created: 1,
        },
      });
    });

    it('debe filtrar eventos por últimas 24 horas', async () => {
      const mockSupabase = supabase as any;
      const gteMock = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: gteMock,
        }),
      });

      renderHook(() => useSecurityStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(gteMock).toHaveBeenCalledWith(
          'created_at',
          expect.any(String)
        );
      });

      // Verificar que la fecha es aproximadamente hace 24 horas
      const callArgs = gteMock.mock.calls[0][1];
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const callDate = new Date(callArgs);
      
      expect(Math.abs(callDate.getTime() - twentyFourHoursAgo.getTime())).toBeLessThan(1000);
    });

    it('debe manejar eventos vacíos', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

      const { result } = renderHook(() => useSecurityStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        total: 0,
        failedLogins: 0,
        successfulLogins: 0,
        byType: {},
      });
    });
  });
});
