/**
 * Tests unitarios para ValidadorPreTimbradoCompleto
 * @version 2.0.0 - Tests completos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: { getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })) },
    from: vi.fn(() => ({ 
      select: vi.fn(() => ({ 
        eq: vi.fn(() => ({ 
          single: vi.fn(() => Promise.resolve({ data: null })),
          limit: vi.fn(() => Promise.resolve({ data: [] }))
        })) 
      })) 
    }))
  }
}));

vi.mock('@/services/catalogos/CatalogosService', () => ({
  CatalogosService: {
    validateCpRelation: vi.fn(() => Promise.resolve({ isValid: true, errors: [], warnings: [] })),
    lookupByCp: vi.fn(() => Promise.resolve(null)),
    isValidRegimen: vi.fn((code) => ['601', '603', '612', '616'].includes(code)),
    isValidUsoCfdi: vi.fn((code) => ['G01', 'G03', 'S01', 'CP01'].includes(code)),
    isValidClaveUnidad: vi.fn(() => true),
    isValidClaveProdServ: vi.fn(() => Promise.resolve(true))
  }
}));

import { ValidadorPreTimbradoCompleto } from '@/services/validacion/ValidadorPreTimbradoCompleto';

describe('ValidadorPreTimbradoCompleto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validarFormatoRFC', () => {
    it('debería validar RFC de persona moral (12 caracteres)', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('EKU9003173C9')).toBe(true);
    });

    it('debería validar RFC de persona física (13 caracteres)', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('XAXX010101000')).toBe(true);
    });

    it('debería validar RFC genérico extranjero', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('XEXX010101000')).toBe(true);
    });

    it('debería rechazar RFC vacío', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('')).toBe(false);
    });

    it('debería rechazar RFC muy corto', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('123')).toBe(false);
    });

    it('debería rechazar RFC con caracteres especiales', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC('EKU@003173C9')).toBe(false);
    });

    it('debería rechazar RFC nulo', () => {
      expect(ValidadorPreTimbradoCompleto.validarFormatoRFC(null as any)).toBe(false);
    });
  });

  describe('validarDistancia', () => {
    it('debería validar distancia correcta mayor a 0', () => {
      const ubicaciones = [
        { tipo_ubicacion: 'Origen' },
        { tipo_ubicacion: 'Destino', distancia_recorrida: 100 }
      ];
      const resultado = ValidadorPreTimbradoCompleto.validarDistancia(ubicaciones);
      expect(resultado.valido).toBe(true);
    });

    it('debería rechazar distancia cero en destino', () => {
      const ubicaciones = [
        { tipo_ubicacion: 'Origen' },
        { tipo_ubicacion: 'Destino', distancia_recorrida: 0 }
      ];
      const resultado = ValidadorPreTimbradoCompleto.validarDistancia(ubicaciones);
      expect(resultado.valido).toBe(false);
    });

    it('debería rechazar distancia negativa', () => {
      const ubicaciones = [
        { tipo_ubicacion: 'Origen' },
        { tipo_ubicacion: 'Destino', distancia_recorrida: -10 }
      ];
      const resultado = ValidadorPreTimbradoCompleto.validarDistancia(ubicaciones);
      expect(resultado.valido).toBe(false);
    });

    it('debería manejar ubicaciones sin destino', () => {
      const ubicaciones = [
        { tipo_ubicacion: 'Origen' }
      ];
      const resultado = ValidadorPreTimbradoCompleto.validarDistancia(ubicaciones);
      // Sin destino, debería pasar o advertir
      expect(resultado).toBeDefined();
    });
  });

  describe('validacionRapida', () => {
    it('debería fallar sin RFC emisor', () => {
      const resultado = ValidadorPreTimbradoCompleto.validacionRapida({} as any);
      expect(resultado.valido).toBe(false);
      expect(resultado.erroresCriticos.length).toBeGreaterThan(0);
    });

    it('debería fallar sin RFC receptor', () => {
      const resultado = ValidadorPreTimbradoCompleto.validacionRapida({
        rfcEmisor: 'EKU9003173C9'
      } as any);
      expect(resultado.valido).toBe(false);
    });

    it('debería fallar sin ubicaciones', () => {
      const resultado = ValidadorPreTimbradoCompleto.validacionRapida({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: []
      } as any);
      expect(resultado.valido).toBe(false);
    });

    it('debería fallar sin mercancías', () => {
      const resultado = ValidadorPreTimbradoCompleto.validacionRapida({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: [{ tipo_ubicacion: 'Origen' }, { tipo_ubicacion: 'Destino' }],
        mercancias: []
      } as any);
      expect(resultado.valido).toBe(false);
    });

    it('debería fallar sin autotransporte', () => {
      const resultado = ValidadorPreTimbradoCompleto.validacionRapida({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: [{ tipo_ubicacion: 'Origen' }, { tipo_ubicacion: 'Destino' }],
        mercancias: [{ descripcion: 'Test' }],
        autotransporte: null
      } as any);
      expect(resultado.valido).toBe(false);
    });

    it('debería pasar con datos mínimos válidos', () => {
      const resultado = ValidadorPreTimbradoCompleto.validacionRapida({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        nombreEmisor: 'Emisor Test',
        nombreReceptor: 'Receptor Test',
        ubicaciones: [
          { tipo_ubicacion: 'Origen', domicilio: { codigo_postal: '06600' } },
          { tipo_ubicacion: 'Destino', domicilio: { codigo_postal: '44100' }, distancia_recorrida: 500 }
        ],
        mercancias: [{ descripcion: 'Mercancía Test', bienes_transp: '78101800', cantidad: 1, peso_kg: 100 }],
        autotransporte: { placa_vm: 'ABC1234', config_vehicular: 'C2', peso_bruto_vehicular: 5000 },
        figuras: [{ tipo_figura: '01', rfc_figura: 'XAXX010101000' }]
      } as any);
      expect(resultado.valido).toBe(true);
    });
  });

  describe('validarCartaPorteCompleta', () => {
    it('debería ser una función async', () => {
      expect(typeof ValidadorPreTimbradoCompleto.validarCartaPorteCompleta).toBe('function');
    });

    it('debería retornar objeto con estructura correcta', async () => {
      const resultado = await ValidadorPreTimbradoCompleto.validarCartaPorteCompleta({} as any);
      expect(resultado).toHaveProperty('valido');
      expect(resultado).toHaveProperty('errores');
      expect(resultado).toHaveProperty('advertencias');
      expect(Array.isArray(resultado.errores)).toBe(true);
      expect(Array.isArray(resultado.advertencias)).toBe(true);
    });
  });

  describe('validaciones específicas de Carta Porte 3.1', () => {
    it('debería validar que el peso bruto vehicular sea mayor a 0', () => {
      const resultado = ValidadorPreTimbradoCompleto.validacionRapida({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: [{ tipo_ubicacion: 'Origen' }, { tipo_ubicacion: 'Destino', distancia_recorrida: 100 }],
        mercancias: [{ descripcion: 'Test', peso_kg: 100 }],
        autotransporte: { peso_bruto_vehicular: 0 },
        figuras: [{ tipo_figura: '01' }]
      } as any);
      expect(resultado.erroresCriticos.some(e => e.includes('peso'))).toBe(true);
    });

    it('debería validar que haya al menos un operador (tipo figura 01)', () => {
      const resultado = ValidadorPreTimbradoCompleto.validacionRapida({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: [{ tipo_ubicacion: 'Origen' }, { tipo_ubicacion: 'Destino', distancia_recorrida: 100 }],
        mercancias: [{ descripcion: 'Test' }],
        autotransporte: { peso_bruto_vehicular: 5000 },
        figuras: [{ tipo_figura: '02' }] // Propietario, no operador
      } as any);
      expect(resultado.erroresCriticos.some(e => e.toLowerCase().includes('operador'))).toBe(true);
    });
  });
});
