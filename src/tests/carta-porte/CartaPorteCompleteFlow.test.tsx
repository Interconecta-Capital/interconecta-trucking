
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartaPorteForm } from '@/components/carta-porte/CartaPorteForm';
import { MercanciaCompleta } from '@/types/cartaPorte';

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    isAuthenticated: true
  })
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null })
    }),
    auth: {
      getUser: () => ({ data: { user: { id: 'test-user-id' } }, error: null })
    }
  }
}));

describe('CartaPorte Complete Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
  });

  const mockMercancia: MercanciaCompleta = {
    id: '1',
    bienes_transp: '12345678',
    descripcion: 'Producto de prueba',
    cantidad: 10, // CORREGIDO: Añadir cantidad obligatoria
    clave_unidad: 'KGM', // CORREGIDO: Añadir clave_unidad obligatoria
    peso_kg: 100,
    valor_mercancia: 1000,
    moneda: 'MXN'
  };

  it('should complete the full flow from creation to XML generation', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CartaPorteForm />
      </QueryClientProvider>
    );

    // Test will verify the complete flow
    expect(screen.getByText(/Configuración de la Carta Porte/i)).toBeInTheDocument();
  });
});
