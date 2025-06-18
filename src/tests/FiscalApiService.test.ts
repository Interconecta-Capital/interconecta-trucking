import { describe, expect, test, vi } from 'vitest';
import { FiscalApiService } from '@/services/fiscal/FiscalApiService';

vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ id: '123' }) })));

describe('FiscalApiService', () => {
  test('createInvoice calls API', async () => {
    const service = new FiscalApiService('key');
    const result = await service.createInvoice({});
    expect(result.success).toBe(true);
    expect((fetch as any).mock.calls.length).toBe(1);
  });
});
