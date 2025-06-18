import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { MultiplePACManager } from '@/services/pac/MultiplePACManager';

const sampleXml = '<cfdi:Comprobante>test</cfdi:Comprobante>';

let manager: MultiplePACManager;

beforeEach(() => {
  manager = new MultiplePACManager();
  manager.updateProviderConfig('finkok', {
    isActive: true,
    healthStatus: 'healthy',
    config: { urlSandbox: 'https://finkok.test', urlProduction: 'https://finkok.test', credentials: { username: 'user', password: 'pass' } }
  });
  manager.updateProviderConfig('ecodex', {
    isActive: true,
    healthStatus: 'healthy',
    config: { urlSandbox: 'https://ecodex.test', urlProduction: 'https://ecodex.test', credentials: { username: 'user', password: 'pass' } }
  });
});

afterEach(() => {
  manager.destroy();
  vi.restoreAllMocks();
});

describe('PAC integrations', () => {
  test('timbrarFinkok success', async () => {
    const xmlB64 = btoa(unescape(encodeURIComponent(sampleXml)));
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      text: async () => `<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"><soap:Body><stampResponse xmlns=\"http://facturacion.finkok.com/stamp\"><stampResult><xml>${xmlB64}</xml><UUID>UUID123</UUID></stampResult></stampResponse></soap:Body></soap:Envelope>`
    })) as any);

    const result = await manager.timbrarConFailover(sampleXml, { ambiente: 'sandbox', maxRetries: 1, timeoutMs: 5000, preferredProvider: 'finkok' });
    expect(result.success).toBe(true);
    expect(result.uuid).toBe('UUID123');
    expect(result.xmlTimbrado).toBe(sampleXml);
    expect((fetch as any).mock.calls[0][1].body).toContain(xmlB64);
  });

  test('timbrarEcodex success', async () => {
    const xmlB64 = btoa(unescape(encodeURIComponent(sampleXml)));
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      text: async () => `<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"><soap:Body><TimbrarResponse><TimbrarResult><xml>${xmlB64}</xml><UUID>ECODEXUUID</UUID></TimbrarResult></TimbrarResponse></soap:Body></soap:Envelope>`
    })) as any);

    const result = await manager.timbrarConFailover(sampleXml, { ambiente: 'sandbox', maxRetries: 1, timeoutMs: 5000, preferredProvider: 'ecodex' });
    expect(result.success).toBe(true);
    expect(result.uuid).toBe('ECODEXUUID');
    expect(result.xmlTimbrado).toBe(sampleXml);
    expect((fetch as any).mock.calls[0][1].body).toContain(xmlB64);
  });
});
