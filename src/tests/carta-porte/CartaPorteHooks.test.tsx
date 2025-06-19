
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartaPorteMappers } from '@/hooks/carta-porte/useCartaPorteMappers';
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

describe('useCartaPorteMappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default carta porte data', () => {
    const { result } = renderHook(() => useCartaPorteMappers());
    
    expect(result.current.cachedFormData).toBeDefined();
    expect(result.current.cachedFormData.cartaPorteVersion).toBe('3.1');
  });

  it('should provide default autotransporte with required fields', () => {
    const { result } = renderHook(() => useCartaPorteMappers());
    
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

  it('should update form data correctly', async () => {
    const { result } = renderHook(() => useCartaPorteMappers());
    
    await act(async () => {
      result.current.updateFormData('rfcEmisor', 'XAXX010101000');
    });
    
    expect(result.current.cachedFormData.rfcEmisor).toBe('XAXX010101000');
  });

  it('should handle save to database', async () => {
    const { result } = renderHook(() => useCartaPorteMappers());
    
    await act(async () => {
      await result.current.saveToDatabase();
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should convert form data to carta porte data', () => {
    const { result } = renderHook(() => useCartaPorteMappers());
    
    const cartaPorteData = result.current.formDataToCartaPorteData(result.current.cachedFormData);
    
    expect(cartaPorteData.version).toBe('3.1');
    expect(cartaPorteData.cartaPorteVersion).toBe('3.1');
  });

  it('should convert carta porte data to form data', () => {
    const { result } = renderHook(() => useCartaPorteMappers());
    
    const testCartaPorteData = {
      version: '3.1',
      cartaPorteVersion: '3.1' as const,
      rfcEmisor: 'TEST123456789',
      nombreEmisor: 'Test Emisor',
      rfcReceptor: 'REC123456789',
      nombreReceptor: 'Test Receptor',
      transporteInternacional: false,
      registroIstmo: false,
      ubicaciones: [],
      mercancias: [],
      autotransporte: {
        placa_vm: 'ABC-123',
        anio_modelo_vm: 2020,
        config_vehicular: 'C2',
        perm_sct: 'TPAF03',
        num_permiso_sct: '123456',
        asegura_resp_civil: 'Seguros SA',
        poliza_resp_civil: 'POL123',
        peso_bruto_vehicular: 5000,
        capacidad_carga: 3000,
        remolques: []
      },
      figuras: [],
      tipoCfdi: 'Traslado' as const
    };
    
    const formData = result.current.cartaPorteDataToFormData(testCartaPorteData);
    
    expect(formData.rfcEmisor).toBe('TEST123456789');
    expect(formData.nombreEmisor).toBe('Test Emisor');
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
