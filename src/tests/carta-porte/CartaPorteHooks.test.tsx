
import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useCartaPorteForm } from '@/hooks/useCartaPorteForm';
import { useCartaPorteValidationEnhanced } from '@/hooks/carta-porte/useCartaPorteValidationEnhanced';
import { CartaPorteData } from '@/types/cartaPorte';

// Mock de servicios
vi.mock('@/services/borradorService', () => ({
  BorradorService: {
    cargarBorrador: vi.fn(() => null),
    guardarBorrador: vi.fn(),
    limpiarBorrador: vi.fn()
  }
}));

const mockCartaPorteData: CartaPorteData = {
  version: '3.1',
  tipoCfdi: 'T',
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
    capacidad_carga: 3000,
    remolques: []
  },
  figuras: [],
  currentStep: 0
};

describe('CartaPorte Hooks - Robust Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCartaPorteForm', () => {
    test('should initialize with default values', () => {
      const { result } = renderHook(() => useCartaPorteForm());
      
      expect(result.current.formData).toBeDefined();
      expect(result.current.formData.ubicaciones).toEqual([]);
      expect(result.current.formData.mercancias).toEqual([]);
      expect(result.current.formData.figuras).toEqual([]);
      expect(result.current.currentStep).toBe(0);
    });

    test('should handle form data changes', () => {
      const { result } = renderHook(() => useCartaPorteForm());
      
      act(() => {
        result.current.updateFormData({
          rfcEmisor: 'NEW123456789'
        });
      });
      
      expect(result.current.formData.rfcEmisor).toBe('NEW123456789');
    });

    test('should manage step navigation', () => {
      const { result } = renderHook(() => useCartaPorteForm());
      
      act(() => {
        result.current.setCurrentStep(2);
      });
      
      expect(result.current.currentStep).toBe(2);
    });

    test('should handle form reset', () => {
      const { result } = renderHook(() => useCartaPorteForm());
      
      act(() => {
        result.current.resetForm();
      });
      
      expect(result.current.isDirty).toBe(false);
      expect(result.current.currentStep).toBe(0);
    });
  });

  describe('useCartaPorteValidationEnhanced', () => {
    test('should validate complete data correctly', () => {
      const { result } = renderHook(() => 
        useCartaPorteValidationEnhanced({ 
          data: mockCartaPorteData,
          enableAI: true 
        })
      );
      
      expect(result.current.isValid).toBeDefined();
      expect(result.current.errors).toBeDefined();
      expect(result.current.warnings).toBeDefined();
      expect(result.current.score).toBeDefined();
    });

    test('should handle empty data validation', () => {
      const emptyData: CartaPorteData = {
        version: '3.1',
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
          capacidad_carga: 0,
          remolques: []
        }
      };
      
      const { result } = renderHook(() => 
        useCartaPorteValidationEnhanced({ 
          data: emptyData,
          enableAI: false 
        })
      );
      
      expect(result.current.score).toBeLessThan(50);
      expect(result.current.errors.length).toBeGreaterThan(0);
    });
  });
});
