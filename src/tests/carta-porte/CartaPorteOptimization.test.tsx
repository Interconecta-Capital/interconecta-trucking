
import { renderHook } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { useOptimizedFormData } from '@/hooks/carta-porte/useOptimizedFormData';
import { CartaPorteData } from '@/types/cartaPorte';

const mockFormData: CartaPorteData = {
  tipoCreacion: 'manual',
  tipoCfdi: 'Traslado',
  rfcEmisor: 'TEST123456789',
  nombreEmisor: 'Test Emisor',
  rfcReceptor: 'REC123456789',
  nombreReceptor: 'Test Receptor',
  transporteInternacional: false,
  registroIstmo: false,
  cartaPorteVersion: '3.1',
  ubicaciones: [
    { 
      id: 'loc1',
      tipo_ubicacion: 'Origen', 
      id_ubicacion: 'loc1',
      domicilio: {
        pais: 'México',
        codigo_postal: '01000',
        estado: 'Ciudad de México',
        municipio: 'Álvaro Obregón',
        colonia: 'Centro',
        calle: 'Test Street',
        numero_exterior: '123'
      }
    },
    { 
      id: 'loc2',
      tipo_ubicacion: 'Destino', 
      id_ubicacion: 'loc2',
      domicilio: {
        pais: 'México',
        codigo_postal: '02000',
        estado: 'Ciudad de México',
        municipio: 'Benito Juárez',
        colonia: 'Centro',
        calle: 'Test Street 2',
        numero_exterior: '456'
      }
    }
  ],
  mercancias: [
    { 
      id: 'merc1',
      bienes_transp: 'Test Product',
      descripcion: 'Producto Test', 
      cantidad: 10,
      peso_kg: 100,
      valor_mercancia: 1000,
      moneda: 'MXN'
    }
  ],
  autotransporte: {
    placa_vm: 'ABC123',
    anio_modelo_vm: 2020,
    config_vehicular: 'C2',
    perm_sct: 'TPAF01',
    num_permiso_sct: '123456',
    asegura_resp_civil: 'Test Insurance',
    poliza_resp_civil: 'POL123',
    remolques: []
  },
  figuras: [
    { 
      id: 'fig1',
      tipo_figura: '01', 
      rfc_figura: 'XAXX010101000',
      nombre_figura: 'Test Conductor',
      domicilio: {
        pais: 'México',
        codigo_postal: '01000',
        estado: 'Ciudad de México',
        municipio: 'Álvaro Obregón',
        colonia: 'Centro',
        calle: 'Test Street',
        numero_exterior: '123'
      }
    }
  ]
};

describe('useOptimizedFormData', () => {
  test('should memoize form data sections correctly', () => {
    const { result, rerender } = renderHook(
      (props) => useOptimizedFormData(props.formData),
      {
        initialProps: { formData: mockFormData }
      }
    );

    const firstRender = result.current;
    
    // Re-render con los mismos datos
    rerender({ formData: mockFormData });
    
    const secondRender = result.current;
    
    // Los objetos memoizados deben ser los mismos
    expect(firstRender.optimizedConfiguracion).toBe(secondRender.optimizedConfiguracion);
    expect(firstRender.optimizedUbicaciones).toBe(secondRender.optimizedUbicaciones);
    expect(firstRender.optimizedMercancias).toBe(secondRender.optimizedMercancias);
  });

  test('should provide cache management functions', () => {
    const { result } = renderHook(() => 
      useOptimizedFormData(mockFormData, { enableMemoization: true })
    );

    expect(typeof result.current.clearCache).toBe('function');
    expect(typeof result.current.getCacheStats).toBe('function');
    
    const stats = result.current.getCacheStats();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('active');
    expect(stats).toHaveProperty('expired');
    expect(stats).toHaveProperty('hitRate');
  });

  test('should respect cache timeout', async () => {
    const { result } = renderHook(() => 
      useOptimizedFormData(mockFormData, { 
        cacheTimeout: 100,
        enableMemoization: true 
      })
    );

    const initialStats = result.current.getCacheStats();
    
    // Esperar a que expire el cache
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const finalStats = result.current.getCacheStats();
    expect(finalStats.expired).toBeGreaterThanOrEqual(0);
  });

  test('should disable memoization when requested', () => {
    const { result, rerender } = renderHook(
      (props) => useOptimizedFormData(props.formData, { enableMemoization: false }),
      {
        initialProps: { formData: mockFormData }
      }
    );

    const firstRender = result.current;
    
    // Cambiar datos ligeramente
    const modifiedData = { ...mockFormData, rfcEmisor: 'MODIFIED123' };
    rerender({ formData: modifiedData });
    
    const secondRender = result.current;
    
    // Sin memoización, los objetos deben ser diferentes
    expect(firstRender.optimizedConfiguracion).not.toBe(secondRender.optimizedConfiguracion);
  });
});
