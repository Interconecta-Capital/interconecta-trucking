/**
 * Tests Unitarios: useSuperuser
 * FASE 4 - Sprint 1: Testing Automatizado
 * 
 * Valida funcionalidad de gestión de superusuarios:
 * - Detección de rol de superusuario
 * - Conversión de usuarios a superusuario
 * - Creación de cuentas de superusuario
 * - Permisos de ejecución
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimizedSuperuser } from '@/hooks/useOptimizedSuperuser';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

// Mock de Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      signUp: vi.fn(),
    },
  },
}));

// Mock de auth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'superuser-123', email: 'super@example.com' },
    isAuthenticated: true,
  }),
}));

// Mock de toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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

describe('useSuperuser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // DETECCIÓN DE SUPERUSUARIO
  // ============================================================================
  describe('Detección de Superusuario', () => {
    it('debe detectar correctamente un superusuario', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { result } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSuperuser).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('is_superuser_secure', {
        _user_id: 'superuser-123',
      });
    });

    it('debe detectar correctamente un usuario regular', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const { result } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isSuperuser).toBe(false);
    });

    it('debe manejar errores de verificación', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const { result } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // En caso de error, debe ser seguro y retornar false
      expect(result.current.isSuperuser).toBe(false);
    });
  });

  // ============================================================================
  // CONVERSIÓN A SUPERUSUARIO
  // ============================================================================
  describe('Conversión a Superusuario', () => {
    it('debe convertir usuario exitosamente', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { result } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Ejecutar conversión
      result.current.convertToSuperuser('target-user-456');

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(mockSupabase.rpc).toHaveBeenCalledWith('promote_user_to_superuser', {
        target_user_id: 'target-user-456',
      });
    });

    it('debe manejar errores de conversión', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValueOnce({
        data: true, // Verificación inicial exitosa
        error: null,
      }).mockResolvedValueOnce({
        data: null, // Conversión falla
        error: { message: 'No tienes permisos' },
      });

      const { result } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Intentar conversión
      result.current.convertToSuperuser('target-user-456');

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      // Debe mostrar error en toast
      const toast = await import('sonner');
      expect(toast.toast.error).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // CREACIÓN DE CUENTA DE SUPERUSUARIO
  // ============================================================================
  describe('Creación de Cuenta de Superusuario', () => {
    it('debe crear cuenta de superusuario exitosamente', async () => {
      const mockSupabase = supabase as any;
      
      // Mock de signUp
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'new-superuser-789' },
        },
        error: null,
      });

      // Mock de promote_user_to_superuser
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { result } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Ejecutar creación
      const credentials = await result.current.createSuperuserAccount();

      expect(credentials).toBeDefined();
      expect(credentials?.email).toBe('superuser@trucking.dev');
      expect(credentials?.password).toBeTruthy();
      expect(mockSupabase.auth.signUp).toHaveBeenCalled();
      expect(mockSupabase.rpc).toHaveBeenCalledWith('promote_user_to_superuser', {
        target_user_id: 'new-superuser-789',
      });
    });

    it('debe generar contraseña segura', async () => {
      const mockSupabase = supabase as any;
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'new-superuser-789' },
        },
        error: null,
      });

      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { result } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const credentials = await result.current.createSuperuserAccount();

      // Verificar que la contraseña cumple requisitos mínimos
      expect(credentials?.password.length).toBeGreaterThanOrEqual(12);
      expect(credentials?.password).toMatch(/[A-Z]/); // Al menos una mayúscula
      expect(credentials?.password).toMatch(/[0-9]/); // Al menos un número
      expect(credentials?.password).toMatch(/[!@#$%^&*(),.?":{}|<>]/); // Al menos un carácter especial
    });

    it('debe manejar error de creación de cuenta', async () => {
      const mockSupabase = supabase as any;
      
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      });

      const { result } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(result.current.createSuperuserAccount()).rejects.toThrow();
    });
  });

  // ============================================================================
  // SEGURIDAD Y PERMISOS
  // ============================================================================
  describe('Seguridad y Permisos', () => {
    it('debe usar función SECURITY DEFINER para verificación', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { result } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Debe llamar a la función segura
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'is_superuser_secure',
        expect.any(Object)
      );
    });

    it('debe cachear resultado para evitar llamadas repetidas', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { result, rerender } = renderHook(() => useOptimizedSuperuser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = mockSupabase.rpc.mock.calls.length;

      // Re-renderizar (no debe hacer nueva llamada gracias a staleTime)
      rerender();

      expect(mockSupabase.rpc.mock.calls.length).toBe(initialCallCount);
    });
  });

  // ============================================================================
  // INTEGRACIÓN CON REACT QUERY
  // ============================================================================
  describe('Integración con React Query', () => {
    it('debe invalidar queries después de conversión exitosa', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const queryClient = new QueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useOptimizedSuperuser(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.convertToSuperuser('target-user-456');

      await waitFor(() => {
        expect(result.current.isConverting).toBe(false);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['superuser-status'],
      });
    });
  });
});
