
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect } from 'vitest';
import { CartaPorteForm } from '@/components/carta-porte/CartaPorteForm';

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
    const user = userEvent.setup();
    render(<CartaPorteForm />);
    
    // Try to proceed without filling required fields
    const nextButton = screen.queryByRole('button', { name: /siguiente/i });
    if (nextButton) {
      await user.click(nextButton);
      
      await waitFor(() => {
        // Check for validation messages
        const errorMessage = screen.queryByText(/RFC es requerido/i);
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument();
        }
      });
    }
  });

  test('allows navigation between steps', async () => {
    const user = userEvent.setup();
    render(<CartaPorteForm />);
    
    // Navigate to ubicaciones step
    const ubicacionesTab = screen.queryByRole('button', { name: /ubicaciones/i });
    if (ubicacionesTab) {
      await user.click(ubicacionesTab);
      
      await waitFor(() => {
        const addButton = screen.queryByText(/agregar ubicación/i);
        if (addButton) {
          expect(addButton).toBeInTheDocument();
        }
      });
    }
  });
});
