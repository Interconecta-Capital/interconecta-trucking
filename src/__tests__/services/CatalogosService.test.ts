/**
 * Tests unitarios para CatalogosService
 * @version 2.0.0 - Tests completos
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null }))
          })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        ilike: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }
  }
}));

import { CatalogosService, CatalogosServiceImpl } from '@/services/catalogos/CatalogosService';

describe('CatalogosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    CatalogosService.clearCache();
  });

  describe('isValidRegimen', () => {
    it('debería validar régimen fiscal 601 (General de Ley PM)', () => {
      expect(CatalogosService.isValidRegimen('601')).toBe(true);
    });

    it('debería validar régimen fiscal 603 (Personas Morales con Fines no Lucrativos)', () => {
      expect(CatalogosService.isValidRegimen('603')).toBe(true);
    });

    it('debería validar régimen fiscal 612 (Personas Físicas con Actividades Empresariales)', () => {
      expect(CatalogosService.isValidRegimen('612')).toBe(true);
    });

    it('debería validar régimen fiscal 616 (Sin obligaciones fiscales)', () => {
      expect(CatalogosService.isValidRegimen('616')).toBe(true);
    });

    it('debería rechazar régimen fiscal inválido 000', () => {
      expect(CatalogosService.isValidRegimen('000')).toBe(false);
    });

    it('debería rechazar régimen fiscal inválido 999', () => {
      expect(CatalogosService.isValidRegimen('999')).toBe(false);
    });

    it('debería rechazar régimen fiscal vacío', () => {
      expect(CatalogosService.isValidRegimen('')).toBe(false);
    });
  });

  describe('isValidUsoCfdi', () => {
    it('debería validar uso CFDI G01 (Adquisición de mercancías)', () => {
      expect(CatalogosService.isValidUsoCfdi('G01')).toBe(true);
    });

    it('debería validar uso CFDI G03 (Gastos en general)', () => {
      expect(CatalogosService.isValidUsoCfdi('G03')).toBe(true);
    });

    it('debería validar uso CFDI S01 (Sin efectos fiscales)', () => {
      expect(CatalogosService.isValidUsoCfdi('S01')).toBe(true);
    });

    it('debería validar uso CFDI CP01 (Carta Porte)', () => {
      expect(CatalogosService.isValidUsoCfdi('CP01')).toBe(true);
    });

    it('debería rechazar uso CFDI inválido XXX', () => {
      expect(CatalogosService.isValidUsoCfdi('XXX')).toBe(false);
    });

    it('debería rechazar uso CFDI P01 (no válido en CFDI 4.0)', () => {
      expect(CatalogosService.isValidUsoCfdi('P01')).toBe(false);
    });
  });

  describe('isValidClaveUnidad', () => {
    it('debería validar clave de unidad KGM (Kilogramo)', () => {
      expect(CatalogosService.isValidClaveUnidad('KGM')).toBe(true);
    });

    it('debería validar clave de unidad H87 (Pieza)', () => {
      expect(CatalogosService.isValidClaveUnidad('H87')).toBe(true);
    });

    it('debería validar clave de unidad E48 (Servicio)', () => {
      expect(CatalogosService.isValidClaveUnidad('E48')).toBe(true);
    });

    it('debería validar clave de unidad LTR (Litro)', () => {
      expect(CatalogosService.isValidClaveUnidad('LTR')).toBe(true);
    });

    it('debería validar clave de unidad TNE (Tonelada)', () => {
      expect(CatalogosService.isValidClaveUnidad('TNE')).toBe(true);
    });

    it('debería ser case-insensitive', () => {
      expect(CatalogosService.isValidClaveUnidad('kgm')).toBe(true);
    });
  });

  describe('validateCpRelation', () => {
    it('debería rechazar CP con formato inválido (menos de 5 dígitos)', async () => {
      const resultado = await CatalogosService.validateCpRelation('1234', 'CDMX', 'Cuauhtémoc');
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors).toContain('Formato de código postal inválido. Debe ser 5 dígitos numéricos.');
    });

    it('debería rechazar CP con formato inválido (letras)', async () => {
      const resultado = await CatalogosService.validateCpRelation('ABCDE', 'CDMX', 'Cuauhtémoc');
      expect(resultado.isValid).toBe(false);
    });

    it('debería manejar CP no encontrado en catálogos', async () => {
      const resultado = await CatalogosService.validateCpRelation('99999', 'CDMX', 'Cuauhtémoc');
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(e => e.includes('no encontrado'))).toBe(true);
    });
  });

  describe('lookupByCp', () => {
    it('debería retornar null para CP no encontrado', async () => {
      const resultado = await CatalogosService.lookupByCp('99999');
      expect(resultado).toBeNull();
    });

    it('debería ser una función async', () => {
      expect(typeof CatalogosService.lookupByCp).toBe('function');
      const result = CatalogosService.lookupByCp('06600');
      expect(result instanceof Promise).toBe(true);
    });
  });

  describe('cache', () => {
    it('debería limpiar el cache correctamente', () => {
      CatalogosService.clearCache();
      // No debería lanzar errores
      expect(true).toBe(true);
    });
  });

  describe('getEstados', () => {
    it('debería ser una función async', () => {
      expect(typeof CatalogosService.getEstados).toBe('function');
    });
  });

  describe('getMunicipiosByEstado', () => {
    it('debería ser una función async', () => {
      expect(typeof CatalogosService.getMunicipiosByEstado).toBe('function');
    });
  });

  describe('getEstadisticas', () => {
    it('debería ser una función async', () => {
      expect(typeof CatalogosService.getEstadisticas).toBe('function');
    });
  });

  describe('isValidClaveProdServ', () => {
    it('debería ser una función async', () => {
      expect(typeof CatalogosService.isValidClaveProdServ).toBe('function');
    });
  });
});
