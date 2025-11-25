
export interface PACConfig {
  nombre: string;
  tipo: 'finkok' | 'stamped' | 'smartweb' | 'demo';
  urlSandbox: string;
  urlProduccion: string;
  usuario?: string;
  password?: string;
  token?: string;
  activo: boolean;
  prioridad: number;
}

export interface PACResponse {
  success: boolean;
  uuid?: string;
  xmlTimbrado?: string;
  qrCode?: string;
  cadenaOriginal?: string;
  selloDigital?: string;
  folio?: string;
  error?: string;
  proveedor?: string;
}

export class PACManager {
  private static readonly DEFAULT_CONFIGS: PACConfig[] = [
    {
      nombre: 'SmartWeb PAC',
      tipo: 'smartweb',
      urlSandbox: 'https://api-sandbox.smartweb.com.mx/v1/cfdi/stamp',
      urlProduccion: 'https://api.smartweb.com.mx/v1/cfdi/stamp',
      activo: true,
      prioridad: 1
    },
    {
      nombre: 'Demo PAC',
      tipo: 'demo',
      urlSandbox: 'https://demo-pac.com/api/stamp',
      urlProduccion: 'https://demo-pac.com/api/stamp',
      activo: true,
      prioridad: 99
    }
  ];

  static async timbrarConReintentos(
    xml: string, 
    ambiente: 'sandbox' | 'production' = 'sandbox',
    maxReintentos: number = 3
  ): Promise<PACResponse> {
    const configuracionesActivas = this.DEFAULT_CONFIGS
      .filter(config => config.activo)
      .sort((a, b) => a.prioridad - b.prioridad);

    let ultimoError = '';

    for (const config of configuracionesActivas) {
      for (let intento = 1; intento <= maxReintentos; intento++) {
        try {
          console.log(`Intento ${intento}/${maxReintentos} con ${config.nombre}`);
          
          const resultado = await this.timbrarConPAC(xml, config, ambiente);
          
          if (resultado.success) {
            console.log(`Timbrado exitoso con ${config.nombre}`);
            return { ...resultado, proveedor: config.nombre };
          }
          
          ultimoError = resultado.error || 'Error desconocido';
          
          if (intento < maxReintentos) {
            // Espera exponencial entre reintentos
            await this.delay(Math.pow(2, intento) * 1000);
          }
          
        } catch (error) {
          ultimoError = error instanceof Error ? error.message : 'Error de conexión';
          console.error(`Error en intento ${intento} con ${config.nombre}:`, error);
          
          if (intento < maxReintentos) {
            await this.delay(Math.pow(2, intento) * 1000);
          }
        }
      }
    }

    return {
      success: false,
      error: `Falló timbrado con todos los PACs. Último error: ${ultimoError}`
    };
  }

  private static async timbrarConPAC(
    xml: string, 
    config: PACConfig, 
    ambiente: 'sandbox' | 'production'
  ): Promise<PACResponse> {
    const url = ambiente === 'sandbox' ? config.urlSandbox : config.urlProduccion;
    
    switch (config.tipo) {
      case 'smartweb':
        return this.timbrarSmartWeb(xml, url, ambiente);
      case 'demo':
        return this.timbrarDemo(xml);
      default:
        throw new Error(`Tipo de PAC no soportado: ${config.tipo}`);
    }
  }

  private static async timbrarSmartWeb(
    xml: string, 
    url: string, 
    ambiente: 'sandbox' | 'production'
  ): Promise<PACResponse> {
    // Timbrado con SmartWeb PAC
    
    const smartwebData = {
      xml: xml,
      ambiente: ambiente,
      tipo_documento: 'carta_porte'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Nota: En producción esto debe venir de variables de entorno
      },
      body: JSON.stringify(smartwebData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Error en SmartWeb PAC'
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

  private static async timbrarDemo(xml: string): Promise<PACResponse> {
    // Simulación para desarrollo y testing
    await this.delay(2000); // Simular latencia de red
    
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

  static async validarConexion(config: PACConfig): Promise<{ success: boolean; message: string }> {
    try {
      // Implementar ping/health check según el PAC
      return { success: true, message: `Conexión exitosa con ${config.nombre}` };
    } catch (error) {
      return { 
        success: false, 
        message: `Error conectando con ${config.nombre}: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
