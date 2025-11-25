/**
 * Tests unitarios para SwPayloadValidator
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: vi.fn(() => Promise.resolve({ data: { success: true }, error: null })) } }
}));

import { SwPayloadValidator } from '@/services/pac/SwPayloadValidator';

describe('SwPayloadValidator', () => {
  describe('validateAndBuildPayload', () => {
    it('debería fallar sin RFC emisor', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({} as any);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(e => e.code === 'MISSING_RFC_EMISOR')).toBe(true);
    });

    it('debería fallar sin ubicaciones', async () => {
      const resultado = await SwPayloadValidator.validateAndBuildPayload({
        rfcEmisor: 'EKU9003173C9',
        rfcReceptor: 'XAXX010101000',
        ubicaciones: []
      } as any);
      expect(resultado.isValid).toBe(false);
      expect(resultado.errors.some(e => e.code === 'MISSING_UBICACIONES')).toBe(true);
    });
  });

  describe('getPayloadString', () => {
    it('debería formatear payload como JSON', () => {
      const payload = { test: 'value' };
      const result = SwPayloadValidator.getPayloadString(payload);
      expect(result).toBe(JSON.stringify(payload, null, 2));
    });
  });
});
