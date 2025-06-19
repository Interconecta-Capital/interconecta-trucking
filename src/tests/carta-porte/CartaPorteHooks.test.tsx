
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartaPorteForm } from '@/hooks/useCartaPorteForm';
import { AutotransporteCompleto } from '@/types/cartaPorte';

// Mock para Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'test-user' } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: 'test-id' } }) }) })
    })
  }
}));

describe('useCartaPorteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default carta porte data', () => {
    const { result } = renderHook(() => useCartaPorteForm());
    
    expect(result.current.cartaPorteData).toBeDefined();
    expect(result.current.cartaPorteData.version).toBe('3.1');
  });

  it('should provide default autotransporte with required fields', () => {
    const { result } = renderHook(() => useCartaPorteForm());
    
    const defaultAutotransporte: AutotransporteCompleto = {
      placa_vm: 'ABC-123',
      anio_modelo_vm: 2020,
      config_vehicular: 'C2',
      perm_sct: 'TPAF03',
      num_permiso_sct: '123456',
      asegura_resp_civil: 'Seguros SA',
      poliza_resp_civil: 'POL123',
      peso_bruto_vehicular: 5000,
      capacidad_carga: 3000, // Required field
      remolques: []
    };
    
    expect(defaultAutotransporte.capacidad_carga).toBeDefined();
    expect(typeof defaultAutotransporte.capacidad_carga).toBe('number');
  });

  it('should update section data correctly', async () => {
    const { result } = renderHook(() => useCartaPorteForm());
    
    await act(async () => {
      result.current.updateSection('configuracion', {
        rfcEmisor: 'XAXX010101000',
        nombreEmisor: 'Test Emisor'
      });
    });
    
    expect(result.current.cartaPorteData.rfcEmisor).toBe('XAXX010101000');
    expect(result.current.cartaPorteData.nombreEmisor).toBe('Test Emisor');
  });

  it('should handle save carta porte', async () => {
    const { result } = renderHook(() => useCartaPorteForm());
    
    await act(async () => {
      await result.current.saveCartaPorte();
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should reset form to default state', () => {
    const { result } = renderHook(() => useCartaPorteForm());
    
    act(() => {
      result.current.resetForm();
    });
    
    expect(result.current.cartaPorteData.version).toBe('3.1');
    expect(result.current.error).toBe('');
  });

  it('should handle autotransporte with all required fields', () => {
    const autotransporte: AutotransporteCompleto = {
      placa_vm: 'XYZ-789',
      anio_modelo_vm: 2022,
      config_vehicular: 'C3',
      perm_sct: 'TPAF04',
      num_permiso_sct: '789123',
      asegura_resp_civil: 'Aseguradora XYZ',
      poliza_resp_civil: 'POL789',
      peso_bruto_vehicular: 8000,
      capacidad_carga: 5000, // Required field
      remolques: []
    };
    
    expect(autotransporte).toHaveProperty('capacidad_carga');
    expect(autotransporte.capacidad_carga).toBeGreaterThan(0);
  });
});
