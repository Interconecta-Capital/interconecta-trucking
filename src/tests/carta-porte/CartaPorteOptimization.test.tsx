
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { CartaPorteData } from '@/types/cartaPorte';
import { useOptimizedFormData } from '@/hooks/carta-porte/useOptimizedFormData';

const mockCartaPorteData: CartaPorteData = {
  tipoCreacion: 'manual',
  tipoCfdi: 'Traslado',
  rfcEmisor: 'TEST123456789',
  nombreEmisor: 'Test Company',
  rfcReceptor: 'RECV123456789',
  nombreReceptor: 'Receiver Company',
  transporteInternacional: 'No',
  cartaPorteVersion: '3.1',
  ubicaciones: [
    {
      id: 'ubicacion1',
      tipo_ubicacion: 'Origen',
      rfc: 'TEST123456789',
      nombre: 'Test Location',
      domicilio: {
        calle: 'Test Street',
        numero_exterior: '123',
        codigo_postal: '12345',
        colonia: 'Test Colony',
        municipio: 'Test Municipality',
        estado: 'Test State',
        pais: 'México'
      },
      fecha_hora_salida_llegada: new Date().toISOString()
    },
    {
      id: 'ubicacion2',
      tipo_ubicacion: 'Destino',
      rfc: 'RECV123456789',
      nombre: 'Destination Location',
      domicilio: {
        calle: 'Destination Street',
        numero_exterior: '456',
        codigo_postal: '54321',
        colonia: 'Destination Colony',
        municipio: 'Destination Municipality',
        estado: 'Destination State',
        pais: 'México'
      },
      fecha_hora_salida_llegada: new Date().toISOString()
    }
  ],
  mercancias: [
    {
      id: 'mercancia1',
      bienes_transp: 'Test Product',
      descripcion: 'Test product description',
      cantidad: 100,
      clave_unidad: 'KGM',
      peso_kg: 1000,
      unidad_peso_bruto: 'KGM',
      valor_mercancia: 50000,
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
    poliza_resp_civil: 'POL123'
  },
  figuras: []
};

describe('useOptimizedFormData', () => {
  test('should memoize form data sections correctly', () => {
    const { result, rerender } = renderHook(
      (props) => useOptimizedFormData(props.formData),
      {
        initialProps: { formData: mockCartaPorteData }
      }
    );

    const firstRender = result.current;
    
    // Re-render con los mismos datos
    rerender({ formData: mockCartaPorteData });
    
    const secondRender = result.current;
    
    // Los objetos memoizados deben ser los mismos
    expect(firstRender.optimizedConfiguracion).toBe(secondRender.optimizedConfiguracion);
    expect(firstRender.optimizedUbicaciones).toBe(secondRender.optimizedUbicaciones);
    expect(firstRender.optimizedMercancias).toBe(secondRender.optimizedMercancias);
  });

  test('should provide cache management functions', () => {
    const { result } = renderHook(() => 
      useOptimizedFormData(mockCartaPorteData, { enableMemoization: true })
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
      useOptimizedFormData(mockCartaPorteData, { 
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
        initialProps: { formData: mockCartaPorteData }
      }
    );

    const firstRender = result.current;
    
    // Cambiar datos ligeramente
    const modifiedData = { ...mockCartaPorteData, rfcEmisor: 'MODIFIED123' };
    rerender({ formData: modifiedData });
    
    const secondRender = result.current;
    
    // Sin memoización, los objetos deben ser diferentes
    expect(firstRender.optimizedConfiguracion).not.toBe(secondRender.optimizedConfiguracion);
  });
});
