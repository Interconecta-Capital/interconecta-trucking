
import { z } from 'zod';

// Esquema de validación para XML de Carta Porte según SAT
const CartaPorteXMLSchema = z.object({
  'cfdi:Comprobante': z.object({
    '@_Version': z.literal('4.0'),
    '@_TipoDeComprobante': z.literal('T'),
    '@_Fecha': z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/),
    '@_Folio': z.string().optional(),
    '@_Serie': z.string().optional(),
    '@_LugarExpedicion': z.string().length(5),
    'cfdi:Emisor': z.object({
      '@_Rfc': z.string().regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/),
      '@_Nombre': z.string().min(1),
      '@_RegimenFiscal': z.string()
    }),
    'cfdi:Receptor': z.object({
      '@_Rfc': z.string().regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/),
      '@_Nombre': z.string().min(1),
      '@_DomicilioFiscalReceptor': z.string().length(5),
      '@_RegimenFiscalReceptor': z.string(),
      '@_UsoCFDI': z.literal('S01')
    }),
    'cfdi:Conceptos': z.object({
      'cfdi:Concepto': z.object({
        '@_ClaveProdServ': z.literal('78101800'),
        '@_Cantidad': z.literal('1'),
        '@_ClaveUnidad': z.literal('E48'),
        '@_Descripcion': z.string(),
        '@_ValorUnitario': z.string(),
        '@_Importe': z.string()
      })
    }),
    'cfdi:Complemento': z.object({
      'cartaporte31:CartaPorte': z.object({
        '@_Version': z.literal('3.1'),
        '@_TranspInternac': z.enum(['Sí', 'No']),
        '@_RegistroISTMO': z.enum(['Sí', 'No']).optional(),
        'cartaporte31:Ubicaciones': z.object({
          'cartaporte31:Ubicacion': z.array(z.object({
            '@_TipoUbicacion': z.enum(['Origen', 'Destino']),
            '@_IDUbicacion': z.string(),
            '@_RFCRemitenteDestinatario': z.string().regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/),
            '@_NombreRemitenteDestinatario': z.string(),
            '@_FechaHoraSalidaLlegada': z.string().optional(),
            '@_DistanciaRecorrida': z.string().optional(),
            'cartaporte31:Domicilio': z.object({
              '@_Pais': z.literal('MEX'),
              '@_CodigoPostal': z.string().length(5),
              '@_Estado': z.string(),
              '@_Municipio': z.string(),
              '@_Calle': z.string(),
              '@_NumeroExterior': z.string().optional(),
              '@_NumeroInterior': z.string().optional(),
              '@_Colonia': z.string().optional(),
              '@_Localidad': z.string().optional(),
              '@_Referencia': z.string().optional()
            })
          })).min(2)
        }),
        'cartaporte31:Mercancias': z.object({
          '@_PesoBrutoTotal': z.string(),
          '@_UnidadPeso': z.string(),
          '@_NumTotalMercancias': z.string(),
          'cartaporte31:Mercancia': z.array(z.object({
            '@_BienesTransp': z.string(),
            '@_Descripcion': z.string(),
            '@_Cantidad': z.string(),
            '@_ClaveUnidad': z.string(),
            '@_PesoKg': z.string(),
            '@_ValorMercancia': z.string()
          }))
        }),
        'cartaporte31:Autotransporte': z.object({
          '@_PermSCT': z.string(),
          '@_NumPermisoSCT': z.string(),
          'cartaporte31:IdentificacionVehicular': z.object({
            '@_ConfigVehicular': z.string(),
            '@_PlacaVM': z.string(),
            '@_AnioModeloVM': z.string()
          }),
          'cartaporte31:Seguros': z.object({
            '@_AseguraRespCivil': z.string(),
            '@_PolizaRespCivil': z.string()
          })
        }),
        'cartaporte31:FiguraTransporte': z.array(z.object({
          '@_TipoFigura': z.string(),
          '@_RFCFigura': z.string().regex(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/),
          '@_NombreFigura': z.string(),
          '@_NumLicencia': z.string().optional()
        }))
      })
    })
  })
});

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class XMLValidator {
  static validateCartaPorteXML(xmlObject: any): ValidationResult {
    try {
      CartaPorteXMLSchema.parse(xmlObject);
      return {
        isValid: true,
        errors: [],
        warnings: []
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return {
          isValid: false,
          errors,
          warnings: []
        };
      }
      return {
        isValid: false,
        errors: ['Error desconocido en validación'],
        warnings: []
      };
    }
  }

  static validateBusinessRules(cartaPorteData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar que existe al menos un origen y un destino
    const ubicaciones = cartaPorteData.ubicaciones || [];
    const tieneOrigen = ubicaciones.some((u: any) => u.tipoUbicacion === 'Origen');
    const tieneDestino = ubicaciones.some((u: any) => u.tipoUbicacion === 'Destino');

    if (!tieneOrigen) {
      errors.push('Debe existir al menos una ubicación de origen');
    }
    if (!tieneDestino) {
      errors.push('Debe existir al menos una ubicación de destino');
    }

    // Validar que hay al menos una mercancía
    if (!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) {
      errors.push('Debe existir al menos una mercancía');
    }

    // Validar datos del vehículo
    if (!cartaPorteData.autotransporte?.placa_vm) {
      errors.push('La placa del vehículo es requerida');
    }

    // Validar figuras de transporte
    if (!cartaPorteData.figuras || cartaPorteData.figuras.length === 0) {
      warnings.push('Se recomienda agregar al menos una figura de transporte');
    }

    // Validar peso total vs suma de mercancías
    const mercancias = cartaPorteData.mercancias || [];
    const pesoTotalMercancias = mercancias.reduce((total: number, m: any) => 
      total + (parseFloat(m.peso_kg) || 0), 0
    );
    
    if (pesoTotalMercancias === 0) {
      warnings.push('El peso total de las mercancías es 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateRFC(rfc: string): boolean {
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return rfcRegex.test(rfc);
  }

  static validateCP(cp: string): boolean {
    const cpRegex = /^[0-9]{5}$/;
    return cpRegex.test(cp);
  }
}
