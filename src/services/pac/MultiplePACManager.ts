
export interface PACProvider {
  id: string;
  name: string;
  type: 'finkok' | 'ecodex' | 'timbox' | 'fiscal_api' | 'demo';
  priority: number;
  isActive: boolean;
  config: {
    urlSandbox: string;
    urlProduction: string;
    credentials?: {
      username?: string;
      password?: string;
      token?: string;
    };
  };
  healthStatus: 'healthy' | 'degraded' | 'down';
  lastHealthCheck: Date;
  responseTime: number;
  successRate: number;
}

export interface TimbradoResult {
  success: boolean;
  uuid?: string;
  xmlTimbrado?: string;
  qrCode?: string;
  cadenaOriginal?: string;
  selloDigital?: string;
  folio?: string;
  error?: string;
  provider?: string;
  attempt?: number;
  totalAttempts?: number;
  responseTime?: number;
}

export interface TimbradoOptions {
  ambiente: 'sandbox' | 'production';
  maxRetries: number;
  timeoutMs: number;
  preferredProvider?: string;
}

export class MultiplePACManager {
  private providers: Map<string, PACProvider> = new Map();
  private healthCheckInterval: number = 30000; // 30 seconds
  private healthCheckTimer?: NodeJS.Timeout;

  constructor() {
    this.initializeDefaultProviders();
    this.startHealthChecking();
  }

  private initializeDefaultProviders() {
    const defaultProviders: PACProvider[] = [
      {
        id: 'fiscal_api',
        name: 'FISCAL API',
        type: 'fiscal_api',
        priority: 1,
        isActive: true,
        config: {
          urlSandbox: 'https://api.fiscalapi.com/v1/cfdi/stamp',
          urlProduction: 'https://api.fiscalapi.com/v1/cfdi/stamp'
        },
        healthStatus: 'healthy',
        lastHealthCheck: new Date(),
        responseTime: 0,
        successRate: 100
      },
      {
        id: 'finkok',
        name: 'Finkok',
        type: 'finkok',
        priority: 2,
        isActive: false, // Disabled until configured
        config: {
          urlSandbox: 'https://demo-facturacion.finkok.com/servicios/soap/stamp.wsdl',
          urlProduction: 'https://facturacion.finkok.com/servicios/soap/stamp.wsdl'
        },
        healthStatus: 'down',
        lastHealthCheck: new Date(),
        responseTime: 0,
        successRate: 0
      },
      {
        id: 'ecodex',
        name: 'Ecodex',
        type: 'ecodex',
        priority: 3,
        isActive: false,
        config: {
          urlSandbox: 'https://pruebas.ecodex.com.mx/ServiciosEcodex/recepcion.asmx',
          urlProduction: 'https://www.ecodex.com.mx/ServiciosEcodex/recepcion.asmx'
        },
        healthStatus: 'down',
        lastHealthCheck: new Date(),
        responseTime: 0,
        successRate: 0
      },
      {
        id: 'demo',
        name: 'Demo PAC',
        type: 'demo',
        priority: 99,
        isActive: true,
        config: {
          urlSandbox: 'https://demo-pac.com/api/stamp',
          urlProduction: 'https://demo-pac.com/api/stamp'
        },
        healthStatus: 'healthy',
        lastHealthCheck: new Date(),
        responseTime: 500,
        successRate: 95
      }
    ];

    defaultProviders.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  async timbrarConFailover(
    xml: string, 
    options: TimbradoOptions = {
      ambiente: 'sandbox',
      maxRetries: 3,
      timeoutMs: 30000
    }
  ): Promise<TimbradoResult> {
    const availableProviders = this.getHealthyProviders(options.preferredProvider);
    
    if (availableProviders.length === 0) {
      return {
        success: false,
        error: 'No hay proveedores PAC disponibles',
        totalAttempts: 0
      };
    }

    let lastError = '';
    let attempt = 0;
    const totalAttempts = Math.min(options.maxRetries, availableProviders.length);

    for (const provider of availableProviders.slice(0, totalAttempts)) {
      attempt++;
      const startTime = Date.now();

      try {
        console.log(`Intento ${attempt}/${totalAttempts} con ${provider.name}`);
        
        const result = await this.timbrarConProveedor(xml, provider, options);
        const responseTime = Date.now() - startTime;
        
        // Update provider metrics
        this.updateProviderMetrics(provider.id, true, responseTime);
        
        if (result.success) {
          return {
            ...result,
            provider: provider.name,
            attempt,
            totalAttempts,
            responseTime
          };
        }
        
        lastError = result.error || 'Error desconocido';
        this.updateProviderMetrics(provider.id, false, responseTime);
        
      } catch (error) {
        const responseTime = Date.now() - startTime;
        lastError = error instanceof Error ? error.message : 'Error de conexión';
        this.updateProviderMetrics(provider.id, false, responseTime);
        
        console.error(`Error con ${provider.name}:`, error);
      }

      // Wait before next attempt (exponential backoff)
      if (attempt < totalAttempts) {
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    return {
      success: false,
      error: `Timbrado falló con todos los proveedores. Último error: ${lastError}`,
      totalAttempts: attempt
    };
  }

  private getHealthyProviders(preferredProvider?: string): PACProvider[] {
    const providers = Array.from(this.providers.values())
      .filter(p => p.isActive && p.healthStatus !== 'down')
      .sort((a, b) => {
        // Preferred provider first
        if (preferredProvider) {
          if (a.id === preferredProvider) return -1;
          if (b.id === preferredProvider) return 1;
        }
        
        // Then by health status
        if (a.healthStatus === 'healthy' && b.healthStatus !== 'healthy') return -1;
        if (b.healthStatus === 'healthy' && a.healthStatus !== 'healthy') return 1;
        
        // Then by success rate
        if (a.successRate !== b.successRate) return b.successRate - a.successRate;
        
        // Finally by priority
        return a.priority - b.priority;
      });

    return providers;
  }

  private async timbrarConProveedor(
    xml: string, 
    provider: PACProvider, 
    options: TimbradoOptions
  ): Promise<TimbradoResult> {
    const url = options.ambiente === 'sandbox' 
      ? provider.config.urlSandbox 
      : provider.config.urlProduction;

    switch (provider.type) {
      case 'fiscal_api':
        return this.timbrarFiscalAPI(xml, url, options.ambiente);
      case 'demo':
        return this.timbrarDemo(xml);
      case 'finkok':
        return this.timbrarFinkok(xml, url, provider.config.credentials, options.timeoutMs);
      case 'ecodex':
        return this.timbrarEcodex(xml, url, provider.config.credentials, options.timeoutMs);
      default:
        throw new Error(`Tipo de PAC no soportado: ${provider.type}`);
    }
  }

  private async timbrarFiscalAPI(
    xml: string, 
    url: string, 
    ambiente: 'sandbox' | 'production'
  ): Promise<TimbradoResult> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        xml: xml,
        ambiente: ambiente,
        tipo_documento: 'carta_porte'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Error en FISCAL API'
      };
    }

    return {
      success: true,
      uuid: result.data?.uuid,
      xmlTimbrado: result.data?.xml_timbrado,
      qrCode: result.data?.qr_code,
      cadenaOriginal: result.data?.cadena_original,
      selloDigital: result.data?.sello_digital,
      folio: result.data?.folio_fiscal
    };
  }

  private async timbrarDemo(xml: string): Promise<TimbradoResult> {
    await this.delay(1500); // Simulate network latency
    
    const uuid = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      success: true,
      uuid,
      xmlTimbrado: xml.replace('</cfdi:Comprobante>', `  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital 
      Version="1.1" 
      UUID="${uuid}" 
      FechaTimbrado="${new Date().toISOString()}"
      SelloCFD="DEMO_SELLO"
      NoCertificadoSAT="30001000000300023685"
      SelloSAT="DEMO_SELLO_SAT"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`),
      qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`,
      cadenaOriginal: `||1.1|${uuid}|${new Date().toISOString()}|DEMO_SELLO|30001000000300023685||`,
      selloDigital: 'DEMO_SELLO_DIGITAL_12345',
      folio: 'DEMO123456'
    };
  }

  private async timbrarFinkok(
    xml: string,
    url: string,
    credentials: any = {},
    timeoutMs: number = 30000
  ): Promise<TimbradoResult> {
    if (!credentials.username || !credentials.password) {
      return { success: false, error: 'Credenciales Finkok incompletas' };
    }

    const xmlBase64 = btoa(unescape(encodeURIComponent(xml)));
    const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://facturacion.finkok.com/stamp">
  <soapenv:Body>
    <tns:stamp>
      <xml>${xmlBase64}</xml>
      <username>${credentials.username}</username>
      <password>${credentials.password}</password>
    </tns:stamp>
  </soapenv:Body>
</soapenv:Envelope>`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: soapBody,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      const uuid = doc.getElementsByTagName('UUID')[0]?.textContent ||
        doc.querySelector('tfd\\:TimbreFiscalDigital')?.getAttribute('UUID') || undefined;
      const xmlTimbradoBase64 = doc.getElementsByTagName('xml')[0]?.textContent || '';
      const xmlTimbrado = xmlTimbradoBase64 ? decodeURIComponent(escape(atob(xmlTimbradoBase64))) : undefined;

      if (!uuid && !xmlTimbrado) {
        const err = doc.getElementsByTagName('faultstring')[0]?.textContent || 'Error en Finkok';
        return { success: false, error: err };
      }

      return { success: true, uuid, xmlTimbrado };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Timeout' };
      }
      return { success: false, error: error.message };
    }
  }

  private async timbrarEcodex(
    xml: string,
    url: string,
    credentials: any = {},
    timeoutMs: number = 30000
  ): Promise<TimbradoResult> {
    if (!credentials.username || !credentials.password) {
      return { success: false, error: 'Credenciales Ecodex incompletas' };
    }

    const xmlBase64 = btoa(unescape(encodeURIComponent(xml)));
    const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <timbrar xmlns="http://tempuri.org/">
      <usuario>${credentials.username}</usuario>
      <password>${credentials.password}</password>
      <cfdi>${xmlBase64}</cfdi>
    </timbrar>
  </soapenv:Body>
</soapenv:Envelope>`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: soapBody,
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/xml');
      const uuid = doc.getElementsByTagName('UUID')[0]?.textContent ||
        doc.querySelector('tfd\\:TimbreFiscalDigital')?.getAttribute('UUID') || undefined;
      const xmlTimbradoBase64 = doc.getElementsByTagName('xml')[0]?.textContent || '';
      const xmlTimbrado = xmlTimbradoBase64 ? decodeURIComponent(escape(atob(xmlTimbradoBase64))) : undefined;

      if (!uuid && !xmlTimbrado) {
        const err = doc.getElementsByTagName('faultstring')[0]?.textContent || 'Error en Ecodex';
        return { success: false, error: err };
      }

      return { success: true, uuid, xmlTimbrado };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Timeout' };
      }
      return { success: false, error: error.message };
    }
  }

  private updateProviderMetrics(providerId: string, success: boolean, responseTime: number) {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    // Update response time (moving average)
    provider.responseTime = (provider.responseTime + responseTime) / 2;
    
    // Update success rate (simple moving average with weight toward recent results)
    const weight = 0.1;
    if (success) {
      provider.successRate = provider.successRate + weight * (100 - provider.successRate);
    } else {
      provider.successRate = provider.successRate * (1 - weight);
    }

    // Update health status based on metrics
    if (provider.successRate > 95 && provider.responseTime < 10000) {
      provider.healthStatus = 'healthy';
    } else if (provider.successRate > 80) {
      provider.healthStatus = 'degraded';
    } else {
      provider.healthStatus = 'down';
    }

    provider.lastHealthCheck = new Date();
  }

  private startHealthChecking() {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthChecks();
    }, this.healthCheckInterval);
  }

  private async performHealthChecks() {
    const promises = Array.from(this.providers.values())
      .filter(p => p.isActive)
      .map(provider => this.checkProviderHealth(provider));

    await Promise.allSettled(promises);
  }

  private async checkProviderHealth(provider: PACProvider) {
    const startTime = Date.now();
    try {
      // Simple health check - ping the endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(provider.config.urlSandbox, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      this.updateProviderMetrics(provider.id, response.ok, responseTime);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateProviderMetrics(provider.id, false, responseTime);
    }
  }

  getProviderStatus(): PACProvider[] {
    return Array.from(this.providers.values()).sort((a, b) => a.priority - b.priority);
  }

  getHealthyProvidersCount(): number {
    return Array.from(this.providers.values()).filter(p => 
      p.isActive && p.healthStatus === 'healthy'
    ).length;
  }

  updateProviderConfig(providerId: string, config: Partial<PACProvider>) {
    const provider = this.providers.get(providerId);
    if (provider) {
      Object.assign(provider, config);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

// Singleton instance
export const multiplePACManager = new MultiplePACManager();
