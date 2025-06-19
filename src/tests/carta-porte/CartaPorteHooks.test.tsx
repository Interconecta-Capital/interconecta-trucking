import { renderHook } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { useCartaPorteForm } from '@/hooks/useCartaPorteForm';
import { CartaPorteData } from '@/types/cartaPorte';

const mockCartaPorteData: CartaPorteData = {
  tipoCreacion: 'manual',
  tipoCfdi: 'Traslado',
  rfcEmisor: 'XAXX010101000',
  nombreEmisor: 'Test Emisor',
  rfcReceptor: 'XBXX010101000',
  nombreReceptor: 'Test Receptor',
  transporteInternacional: 'No', // Changed to string
  registroIstmo: false,
  cartaPorteVersion: '3.1',
  ubicaciones: [],
  mercancias: [],
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

vi.mock('@/hooks/carta-porte/useCartaPorteIntegration', () => ({
  useCartaPorteIntegration: () => ({
    loadCartaPorte: vi.fn(),
    saveCartaPorte: vi.fn(),
    createNewCartaPorte: vi.fn(),
    resetForm: vi.fn(),
    clearSavedData: vi.fn(),
  })
}));

describe('useCartaPorteForm Hook', () => {
  test('should initialize with default values', () => {
    const { result } = renderHook(() => useCartaPorteForm());

    expect(result.current.formData).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  test('should update form data correctly', () => {
    const { result } = renderHook(() => useCartaPorteForm());
    const initialRfcEmisor = result.current.formData.rfcEmisor;
    const newRfcEmisor = 'NEW123';

    result.current.updateFormData('rfcEmisor', newRfcEmisor);

    expect(result.current.formData.rfcEmisor).not.toBe(initialRfcEmisor);
    expect(result.current.formData.rfcEmisor).toBe(newRfcEmisor);
  });

  test('should load carta porte data correctly', async () => {
    const { result } = renderHook(() => useCartaPorteForm());
    const loadCartaPorteMock = vi.fn().mockResolvedValue(mockCartaPorteData);

    // Mock the loadCartaPorte function from useCartaPorteIntegration
    vi.mocked(require('@/hooks/carta-porte/useCartaPorteIntegration').useCartaPorteIntegration).mockReturnValue({
      loadCartaPorte: loadCartaPorteMock,
      saveCartaPorte: vi.fn(),
      createNewCartaPorte: vi.fn(),
      resetForm: vi.fn(),
      clearSavedData: vi.fn(),
    });

    await result.current.loadCartaPorte('test-id');

    expect(loadCartaPorteMock).toHaveBeenCalledWith('test-id');
  });
});
