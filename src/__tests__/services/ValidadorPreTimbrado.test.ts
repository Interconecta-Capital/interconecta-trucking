/**
 * Tests unitarios para ValidadorPreTimbradoCompleto
 */

import { describe, it, expect, vi } from 'vitest';

// Mock de supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })) },
    from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null })) })) })) }))
  }
}));

vi.mock('@/services/catalogos/CatalogosService', () => ({
  CatalogosService: {
    validateCpRelation: vi.fn(() => Promise.resolve({ isValid: true, errors: [], warnings: [] })),
    lookupByCp: vi.fn(() => Promise.resolve(null)),
    isValidRegimen: vi.fn(() => true),
    isValidUsoCfdi: vi.fn(() => true),
    isValidClaveUnidad: vi.fn(() => true),
    isValidClaveProdServ: vi.fn(() => Promise.resolve(true))
  }
}));

import { ValidadorPreTimbradoCompleto } from '@/services/validacion/ValidadorPreTimbradoCompleto';

describe('ValidadorPreTimbradoCompleto', () => {
  describe('validarFormatoRFC', () => {
    it('debería validar RFC de persona moral', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('EKU9003173C9')).toBe(true);
    });

    it('debería validar RFC de persona física', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('XAXX010101000')).toBe(true);
    });

    it('debería rechazar RFC inválido', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('')).toBe(false);
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('123')).toBe(false);
    });
  });

  describe('validarDistancia', () => {
    it('debería validar distancia correcta', () => {
      const ubicaciones = [
        { tipo_ubicacion: 'Origen' },
        { tipo_ubicacion: 'Destino', distancia_recorrida: 100 }
      ];
      const resultado = ValidadorPreTimbradoCompleto.validarDistancia(ubicaciones);
      expect(resultado.valido).toBe(true);
    });

    it('debería rechazar distancia cero', () => {
      const ubicaciones = [
        { tipo_ubicacion: 'Origen' },
        { tipo_ubicacion: 'Destino', distancia_recorrida: 0 }
      ];
      const resultado = ValidadorPreTimbradoCompleto.validarDistancia(ubicaciones);
      expect(resultado.valido).toBe(false);
    });
  });

  describe('validacionRapida', () => {
    it('debería fallar sin datos básicos', () => {
      const resultado = ValidadorPreTimbradoCompleto.validacionRapida({} as any);
      expect(resultado.valido).toBe(false);
      expect(resultado.erroresCriticos.length).toBeGreaterThan(0);
    });
  });
});
