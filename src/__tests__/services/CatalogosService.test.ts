/**
 * Tests unitarios para CatalogosService
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
          }))
        })),
        ilike: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}));

import { CatalogosService } from '@/services/catalogos/CatalogosService';

describe('CatalogosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidRegimen', () => {
    it('debería validar régimen fiscal válido', () => {
      expect(CatalogosService.isValidRegimen('601')).toBe(true);
      expect(CatalogosService.isValidRegimen('603')).toBe(true);
      expect(CatalogosService.isValidRegimen('612')).toBe(true);
    });

    it('debería rechazar régimen fiscal inválido', () => {
      expect(CatalogosService.isValidRegimen('000')).toBe(false);
      expect(CatalogosService.isValidRegimen('999')).toBe(false);
    });
  });

  describe('isValidUsoCfdi', () => {
    it('debería validar uso CFDI válido', () => {
      expect(CatalogosService.isValidUsoCfdi('G01')).toBe(true);
      expect(CatalogosService.isValidUsoCfdi('G03')).toBe(true);
      expect(CatalogosService.isValidUsoCfdi('S01')).toBe(true);
    });

    it('debería rechazar uso CFDI inválido', () => {
      expect(CatalogosService.isValidUsoCfdi('XXX')).toBe(false);
    });
  });

  describe('isValidClaveUnidad', () => {
    it('debería validar clave de unidad común', () => {
      expect(CatalogosService.isValidClaveUnidad('KGM')).toBe(true);
      expect(CatalogosService.isValidClaveUnidad('H87')).toBe(true);
    });
  });

  describe('validateCpRelation', () => {
    it('debería ser una función', () => {
      expect(typeof CatalogosService.validateCpRelation).toBe('function');
    });
  });

  describe('lookupByCp', () => {
    it('debería ser una función', () => {
      expect(typeof CatalogosService.lookupByCp).toBe('function');
    });
  });
});
