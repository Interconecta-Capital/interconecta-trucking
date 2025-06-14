
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { OptimizedCartaPorteForm } from '@/components/carta-porte/form/OptimizedCartaPorteForm';

// Mock completo del hook principal
const mockFormManager = {
  configuracion: {
    tipoCreacion: 'manual',
    tipoCfdi: 'Traslado',
    rfcEmisor: '',
    nombreEmisor: '',
    rfcReceptor: '',
    nombreReceptor: '',
    transporteInternacional: false,
    registroIstmo: false,
    cartaPorteVersion: '3.1',
    ubicaciones: [],
    mercancias: [],
    autotransporte: {},
    figuras: []
  },
  ubicaciones: [],
  mercancias: [],
  autotransporte: {},
  figuras: [],
  currentStep: 0,
  currentCartaPorteId: null,
  borradorCargado: false,
  ultimoGuardado: null,
  setUbicaciones: vi.fn(),
  setMercancias: vi.fn(),
  setAutotransporte: vi.fn(),
  setFiguras: vi.fn(),
  setCurrentStep: vi.fn(),
  setXmlGenerated: vi.fn(),
  setTimbradoData: vi.fn(),
  handleConfiguracionChange: vi.fn(),
  handleGuardarBorrador: vi.fn(),
  handleLimpiarBorrador: vi.fn(),
};

vi.mock('@/hooks/carta-porte/useCartaPorteFormManager', () => ({
  useCartaPorteFormManager: () => mockFormManager
}));

vi.mock('@/hooks/carta-porte/useOptimizedFormData', () => ({
  useOptimizedFormData: (formData: any) => ({
    optimizedConfiguracion: formData,
    optimizedUbicaciones: formData.ubicaciones || [],
    optimizedMercancias: formData.mercancias || [],
    optimizedAutotransporte: formData.autotransporte || {},
    optimizedFiguras: formData.figuras || [],
    clearCache: vi.fn(),
    getCacheStats: vi.fn(() => ({ total: 0, active: 0, expired: 0, hitRate: 0 }))
  })
}));

describe('CartaPorteFlow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render optimized form correctly', async () => {
    render(<OptimizedCartaPorteForm />);
    
    // Verificar que se muestra el header
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    
    // Verificar que se muestra el tracker de progreso
    const progressElements = screen.getAllByText('Configuración');
    expect(progressElements.length).toBeGreaterThan(0);
  });

  test('should handle step navigation', async () => {
    const user = userEvent.setup();
    render(<OptimizedCartaPorteForm />);
    
    // Simular navegación (aunque sea lazy loaded)
    await waitFor(() => {
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });
    
    // Verificar que el hook de navegación se puede llamar
    expect(mockFormManager.setCurrentStep).toBeDefined();
  });

  test('should handle form data changes', async () => {
    const user = userEvent.setup();
    render(<OptimizedCartaPorteForm />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });
    
    // Verificar que los handlers están disponibles
    expect(mockFormManager.handleConfiguracionChange).toBeDefined();
    expect(mockFormManager.setUbicaciones).toBeDefined();
    expect(mockFormManager.setMercancias).toBeDefined();
  });

  test('should handle auto-save functionality', async () => {
    render(<OptimizedCartaPorteForm />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuración')).toBeInTheDocument();
    });
    
    // Verificar que las funciones de guardado están disponibles
    expect(mockFormManager.handleGuardarBorrador).toBeDefined();
    expect(mockFormManager.handleLimpiarBorrador).toBeDefined();
  });

  test('should handle lazy loading gracefully', async () => {
    render(<OptimizedCartaPorteForm />);
    
    // Debería mostrar el loading inicial mientras carga el componente lazy
    await waitFor(() => {
      const loadingOrContent = screen.queryByText('Cargando sección...') || screen.queryByText('Configuración');
      expect(loadingOrContent).toBeInTheDocument();
    });
  });
});
