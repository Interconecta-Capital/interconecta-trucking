
export interface PACCredentials {
  usuario?: string;
  password?: string;
  token?: string;
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
  pac?: string;
}

export interface PACConfig {
  name: string;
  type: 'finkok' | 'stamped' | 'fiscal_api';
  sandboxUrl: string;
  productionUrl: string;
  active: boolean;
  priority: number;
}

export class PACServiceReal {
  private static readonly PAC_CONFIGS: PACConfig[] = [
    {
      name: 'FISCAL API',
      type: 'fiscal_api',
      sandboxUrl: 'https://api.fiscalapi.com/v1/cfdi/stamp',
      productionUrl: 'https://api.fiscalapi.com/v1/cfdi/stamp',
      active: true,
      priority: 1
    }
  ];

  static async timbrarCartaPorte(
    xml: string,
    environment: 'sandbox' | 'production' = 'sandbox'
  ): Promise<PACResponse> {
    const activePACs = this.PAC_CONFIGS
      .filter(pac => pac.active)
      .sort((a, b) => a.priority - b.priority);

    for (const pac of activePACs) {
      try {
        console.log(`🔄 Intentando timbrado con ${pac.name}...`);
        
        const result = await this.timbrarConPAC(xml, pac, environment);
        
        if (result.success) {
          console.log(`✅ Timbrado exitoso con ${pac.name}`);
          return { ...result, pac: pac.name };
        }
        
        console.warn(`⚠️ Falló ${pac.name}: ${result.error}`);
      } catch (error) {
        console.error(`❌ Error con ${pac.name}:`, error);
      }
    }

    return {
      success: false,
      error: 'Falló timbrado con todos los PACs disponibles'
    };
  }

  private static async timbrarConPAC(
    xml: string,
    config: PACConfig,
    environment: 'sandbox' | 'production'
  ): Promise<PACResponse> {
    const url = environment === 'sandbox' ? config.sandboxUrl : config.productionUrl;
    
    switch (config.type) {
      case 'fiscal_api':
        return this.timbrarFiscalAPI(xml, url, environment);
      default:
        throw new Error(`PAC type ${config.type} not implemented`);
    }
  }

  private static async timbrarFiscalAPI(
    xml: string,
    url: string,
    environment: 'sandbox' | 'production'
  ): Promise<PACResponse> {
    // Llamar al edge function de timbrado real
    const response = await fetch('/api/timbrar-carta-porte', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        xml,
        ambiente: environment,
        tipo_documento: 'carta_porte'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Error en servicio PAC'
      };
    }

    return {
      success: true,
      uuid: result.uuid,
      xmlTimbrado: result.xmlTimbrado,
      qrCode: result.qrCode,
      cadenaOriginal: result.cadenaOriginal,
      selloDigital: result.selloDigital,
      folio: result.folio
    };
  }

  static async validarConexion(environment: 'sandbox' | 'production' = 'sandbox'): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      // Llamar al edge function de validación
      const response = await fetch('/api/validar-pac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ambiente: environment }),
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          message: 'Conexión PAC validada exitosamente',
          details: result
        };
      } else {
        return {
          success: false,
          message: result.error || 'Error validando conexión PAC'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }
}
