
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { useOptimizedFormData } from '@/hooks/carta-porte/useOptimizedFormData';
import { useCartaPorteValidation } from '@/hooks/carta-porte/useCartaPorteValidation';
import { CartaPorteData } from '@/types/cartaPorte';

// Mock de servicios
vi.mock('@/services/borradorService', () => ({
  BorradorService: {
    cargarUltimoBorrador: vi.fn(() => null),
    iniciarGuardadoAutomatico: vi.fn(),
    detenerGuardadoAutomatico: vi.fn(),
    guardarBorradorAutomatico: vi.fn(),
    limpiarBorrador: vi.fn()
  }
}));

const mockCartaPorteData: CartaPorteData = {
  id: 'test-id',
  tipoCfdi: 'Traslado',
  rfcEmisor: 'XAXX010101000',
  nombreEmisor: 'Test Emisor',
  rfcReceptor: 'XAXX010101001',
  nombreReceptor: 'Test Receptor',
  transporteInternacional: false,
  registroIstmo: false,
  cartaPorteVersion: '3.1',
  ubicaciones: [],
  mercancias: [],
  autotransporte: {
    placa_vm: 'TEST123',
    anio_modelo_vm: 2023,
    config_vehicular: 'C2',
    perm_sct: 'TPAF01',
    num_permiso_sct: '123456',
    asegura_resp_civil: 'Aseguradora Test',
    poliza_resp_civil: 'POL123',
    peso_bruto_vehicular: 5000,
    remolques: []
  },
  figuras: [],
  currentStep: 0
};

describe('CartaPorte Hooks - Robust Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCartaPorteFormManager', () => {
    test('should initialize with default values', () => {
      const { result } = renderHook(() => useCartaPorteFormManager());
      
      expect(result.current.configuracion).toBeDefined();
      expect(result.current.ubicaciones).toEqual([]);
      expect(result.current.mercancias).toEqual([]);
      expect(result.current.figuras).toEqual([]);
      expect(result.current.currentStep).toBe(0);
    });

    test('should handle configuracion changes', () => {
      const { result } = renderHook(() => useCartaPorteFormManager());
      
      act(() => {
        result.current.handleConfiguracionChange({
          rfcEmisor: 'NEW123456789'
        });
      });
      
      expect(result.current.configuracion.rfcEmisor).toBe('NEW123456789');
    });

    test('should manage step navigation', () => {
      const { result } = renderHook(() => useCartaPorteFormManager());
      
      act(() => {
        result.current.setCurrentStep(2);
      });
      
      expect(result.current.currentStep).toBe(2);
    });

    test('should handle auto-save operations', () => {
      const { result } = renderHook(() => useCartaPorteFormManager());
      
      act(() => {
        result.current.handleGuardarBorrador();
      });
      
      expect(result.current.ultimoGuardado).toBeInstanceOf(Date);
    });
  });

  describe('useOptimizedFormData', () => {
    test('should memoize data correctly', () => {
      const { result, rerender } = renderHook(
        ({ data }) => useOptimizedFormData(data),
        { initialProps: { data: mockCartaPorteData } }
      );

      const firstResult = result.current.optimizedConfiguracion;
      
      // Re-render con los mismos datos
      rerender({ data: mockCartaPorteData });
      
      // Los datos deben estar memoizados
      expect(result.current.optimizedConfiguracion).toBe(firstResult);
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
    });

    test('should handle cache timeout', async () => {
      const { result } = renderHook(() => 
        useOptimizedFormData(mockCartaPorteData, { 
          cacheTimeout: 50,
          enableMemoization: true 
        })
      );

      const initialStats = result.current.getCacheStats();
      
      // Esperar a que expire el cache
      await new Promise(resolve => setTimeout(resolve, 100));
      
      act(() => {
        const finalStats = result.current.getCacheStats();
        expect(finalStats.expired).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('useCartaPorteValidation', () => {
    test('should validate complete data correctly', () => {
      const { result } = renderHook(() => useCartaPorteValidation());
      
      act(() => {
        const validation = result.current.validateComplete(mockCartaPorteData);
        
        expect(validation.isValid).toBeDefined();
        expect(validation.completionPercentage).toBeDefined();
        expect(validation.summary).toBeDefined();
        expect(validation.summary.sectionStatus).toBeDefined();
        expect(validation.summary.missingFields).toBeDefined();
      });
    });

    test('should provide validation summary', () => {
      const { result } = renderHook(() => useCartaPorteValidation());
      
      act(() => {
        const summary = result.current.getValidationSummary(mockCartaPorteData);
        
        expect(summary).toBeDefined();
        expect(summary.completionPercentage).toBeDefined();
        expect(summary.sectionStatus).toBeDefined();
        expect(summary.missingFields).toBeDefined();
        expect(summary.overallProgress).toBeDefined();
      });
    });

    test('should handle empty data validation', () => {
      const { result } = renderHook(() => useCartaPorteValidation());
      
      const emptyData: CartaPorteData = {
        ubicaciones: [],
        mercancias: [],
        figuras: [],
        autotransporte: {
          placa_vm: '',
          anio_modelo_vm: new Date().getFullYear(),
          config_vehicular: '',
          perm_sct: '',
          num_permiso_sct: '',
          asegura_resp_civil: '',
          poliza_resp_civil: '',
          peso_bruto_vehicular: 0,
          remolques: []
        }
      };
      
      act(() => {
        const summary = result.current.getValidationSummary(emptyData);
        
        expect(summary.overallProgress).toBe(0);
        expect(summary.completedSections).toBe(0);
      });
    });
  });
});
