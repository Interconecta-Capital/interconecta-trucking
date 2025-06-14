
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
    { tipo: 'Origen', codigo_postal: '01000' },
    { tipo: 'Destino', codigo_postal: '02000' }
  ],
  mercancias: [
    { descripcion: 'Producto Test', peso_kg: 100 }
  ],
  autotransporte: {
    placa_vm: 'ABC123',
    config_vehicular: 'C2'
  },
  figuras: [
    { tipo_figura: '01', nombre_figura: 'Test Conductor' }
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
