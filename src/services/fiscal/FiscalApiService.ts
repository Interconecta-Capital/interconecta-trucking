export type FiscalApiEnvironment = 'sandbox' | 'production';

export interface FiscalApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class FiscalApiService {
  private baseUrl: string;

  constructor(private apiKey: string, environment: FiscalApiEnvironment = 'sandbox') {
    this.baseUrl =
      environment === 'production'
        ? 'https://api.fiscalapi.com'
        : 'https://api-sandbox.fiscalapi.com';
  }

  async createInvoice(invoiceData: any): Promise<FiscalApiResponse> {
    return this.request('/v1/cfdi/stamp', invoiceData);
  }

  async createInvoiceWithCartaPorte(invoiceData: any, cartaPorteData: any): Promise<FiscalApiResponse> {
    const payload = { ...invoiceData, Complemento: { CartaPorte31: cartaPorteData } };
    return this.request('/v1/cfdi/stamp', payload);
  }

  async cancelInvoice(invoiceId: string): Promise<FiscalApiResponse> {
    return this.request(`/v1/cfdi/${invoiceId}`, undefined, 'DELETE');
  }

  async getInvoice(invoiceId: string): Promise<FiscalApiResponse> {
    return this.request(`/v1/cfdi/${invoiceId}`, undefined, 'GET');
  }

  async downloadPdf(invoiceId: string): Promise<string> {
    const res = await this.rawRequest(`/v1/cfdi/${invoiceId}/pdf`, 'GET');
    return await res.text();
  }

  async downloadXml(invoiceId: string): Promise<string> {
    const res = await this.rawRequest(`/v1/cfdi/${invoiceId}/xml`, 'GET');
    return await res.text();
  }

  async validateTaxInfo(rfc: string): Promise<boolean> {
    const resp = await this.request('/v1/tax/validate', { rfc });
    return resp.success;
  }

  async getInvoiceStatus(invoiceId: string): Promise<string> {
    const resp = await this.request(`/v1/cfdi/${invoiceId}/status`, undefined, 'GET');
    if (resp.success) return resp.data.status;
    throw new Error(resp.error || 'Unknown error');
  }

  private async request(path: string, data?: any, method: string = 'POST'): Promise<FiscalApiResponse> {
    try {
      const res = await this.rawRequest(path, method, data);
      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: errText };
      }
      const json = await res.json();
      return { success: true, data: json };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private async rawRequest(path: string, method: string = 'POST', data?: any): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    return fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });
  }
}
