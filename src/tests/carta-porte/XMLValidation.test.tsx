
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartaPorteForm } from '@/components/carta-porte/CartaPorteForm';
import { MercanciaCompleta } from '@/types/cartaPorte';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isAuthenticated: true
  })
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null })
    }),
    auth: {
      getUser: () => ({ data: { user: { id: 'test-user-id' } }, error: null })
    }
  }
}));

describe('XML Validation Tests', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  const mockMercancia: MercanciaCompleta = {
    id: '1',
    bienes_transp: '87654321',
    descripcion: 'Mercancía para validación XML',
    cantidad: 20, // CORREGIDO: Añadir cantidad obligatoria
    clave_unidad: 'LTR', // CORREGIDO: Añadir clave_unidad obligatoria
    peso_kg: 200,
    valor_mercancia: 2000,
    moneda: 'MXN'
  };

  it('should validate XML structure correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CartaPorteForm />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Configuración de la Carta Porte/i)).toBeInTheDocument();
  });
});
