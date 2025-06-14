
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { CartaPorteForm } from '@/components/carta-porte/CartaPorteForm';
import { CartaPorteData } from '@/types/cartaPorte';

// Mock hooks
vi.mock('@/hooks/useCartaPorteFormSimplified', () => ({
  useCartaPorteFormSimplified: () => ({
    formData: {
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
    currentCartaPorteId: undefined,
    isLoading: false,
    updateFormData: vi.fn(),
    saveCartaPorte: vi.fn(),
    createNewCartaPorte: vi.fn(),
    loadCartaPorte: vi.fn(),
    resetForm: vi.fn(),
    stepValidations: {
      configuracion: false,
      ubicaciones: false,
      mercancias: false,
      autotransporte: false,
      figuras: false
    },
    totalProgress: 0,
    formDataToCartaPorteData: vi.fn()
  })
}));

describe('CartaPorteFlow', () => {
  test('renders carta porte form correctly', () => {
    render(<CartaPorteForm />);
    
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByText('Ubicaciones')).toBeInTheDocument();
    expect(screen.getByText('Mercancías')).toBeInTheDocument();
    expect(screen.getByText('Autotransporte')).toBeInTheDocument();
    expect(screen.getByText('Figuras')).toBeInTheDocument();
    expect(screen.getByText('XML')).toBeInTheDocument();
  });

  test('validates required fields in configuracion step', async () => {
    const mockUpdateFormData = vi.fn();
    
    render(<CartaPorteForm />);
    
    // Try to proceed without filling required fields
    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    if (nextButton) {
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText(/RFC es requerido/i)).toBeInTheDocument();
      });
    }
  });

  test('allows navigation between steps', async () => {
    render(<CartaPorteForm />);
    
    // Navigate to ubicaciones step
    const ubicacionesTab = screen.getByRole('button', { name: /ubicaciones/i });
    fireEvent.click(ubicacionesTab);
    
    await waitFor(() => {
      expect(screen.getByText(/agregar ubicación/i)).toBeInTheDocument();
    });
  });
});
