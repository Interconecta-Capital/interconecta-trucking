import { supabase } from '@/integrations/supabase/client';
import { RFCValidator } from '@/services/validacion/RFCValidator';

export interface EmisorData {
  rfc: string;
  nombre: string;
  regimenFiscal: string;
  domicilioFiscal: {
    calle: string;
    numero_exterior?: string;
    numero_interior?: string;
    colonia: string;
    municipio: string;
    estado: string;
    pais: string;
    codigo_postal: string;
  };
  seguros: {
    responsabilidadCivil?: {
      poliza: string;
      aseguradora: string;
    };
    carga?: {
      poliza: string;
      aseguradora: string;
    };
    medioAmbiente?: {
      poliza: string;
      aseguradora: string;
    };
  };
  permisosSCT: any[];
  configuracionCompleta: boolean;
}

export class ConfiguracionEmisorService {
  /**
   * Obtiene los datos completos del emisor desde configuracion_empresa
   */
  static async obtenerDatosEmisor(): Promise<EmisorData> {
    try {
      const { data: configData, error } = await supabase
        .from('configuracion_empresa')
        .select('*')
        .single();

      if (error) {
        console.error('❌ Error obteniendo configuración empresa:', error);
        throw new Error('No se pudo obtener la configuración empresarial. Por favor, configura tu empresa primero.');
      }

      if (!configData) {
        throw new Error('No existe configuración empresarial. Por favor, configura tu empresa en Administración > Mi Empresa.');
      }

      // Validar que la configuración esté completa
      if (!configData.configuracion_completa) {
        throw new Error('La configuración empresarial está incompleta. Por favor, completa todos los campos requeridos.');
      }

      const domicilio = (configData.domicilio_fiscal || {}) as {
        calle?: string;
        numero_exterior?: string;
        numero_interior?: string;
        colonia?: string;
        municipio?: string;
        estado?: string;
        pais?: string;
        codigo_postal?: string;
      };

      return {
        rfc: configData.rfc_emisor,
        nombre: configData.razon_social,
        regimenFiscal: configData.regimen_fiscal,
        domicilioFiscal: {
          calle: domicilio.calle || '',
          numero_exterior: domicilio.numero_exterior,
          numero_interior: domicilio.numero_interior,
          colonia: domicilio.colonia || '',
          municipio: domicilio.municipio || '',
          estado: domicilio.estado || '',
          pais: domicilio.pais || 'MEX',
          codigo_postal: domicilio.codigo_postal || ''
        },
        seguros: {
          responsabilidadCivil: (configData.seguro_resp_civil as any) || undefined,
          carga: (configData.seguro_carga as any) || undefined,
          medioAmbiente: (configData.seguro_ambiental as any) || undefined
        },
        permisosSCT: (configData.permisos_sct as any[]) || [],
        configuracionCompleta: configData.configuracion_completa
      };
    } catch (error) {
      console.error('💥 Error en obtenerDatosEmisor:', error);
      throw error;
    }
  }

  /**
   * Valida que el emisor tenga configuración completa antes de generar XML
   */
  static async validarConfiguracionCompleta(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    categorias: {
      datosFiscales: { valido: boolean; errores: string[] };
      domicilioFiscal: { valido: boolean; errores: string[] };
      seguros: { valido: boolean; errores: string[] };
      permisosSCT: { valido: boolean; errores: string[] };
    };
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Categorizar errores por sección
    const datosFiscalesErrores: string[] = [];
    const domicilioFiscalErrores: string[] = [];
    const segurosErrores: string[] = [];
    const permisosSCTErrores: string[] = [];

    try {
      const emisorData = await this.obtenerDatosEmisor();

      // ========== VALIDAR DATOS FISCALES ==========
      // Validar RFC usando RFCValidator centralizado
      const rfcValidation = RFCValidator.validar(emisorData.rfc || '');
      if (!rfcValidation.valido) {
        datosFiscalesErrores.push(`RFC inválido: ${rfcValidation.error}`);
        errors.push(`RFC inválido: ${rfcValidation.error}`);
      }

      // Validar razón social
      if (!emisorData.nombre || emisorData.nombre.trim().length === 0) {
        datosFiscalesErrores.push('Razón social no configurada');
        errors.push('Razón social no configurada');
      }

      // Validar régimen fiscal
      if (!emisorData.regimenFiscal) {
        datosFiscalesErrores.push('Régimen fiscal no seleccionado');
        errors.push('Régimen fiscal no seleccionado');
      }

      // ========== VALIDAR DOMICILIO FISCAL ==========
      if (!emisorData.domicilioFiscal.codigo_postal) {
        domicilioFiscalErrores.push('Código postal no configurado');
        errors.push('Código postal del domicilio fiscal no configurado');
      } else if (!/^\d{5}$/.test(emisorData.domicilioFiscal.codigo_postal)) {
        domicilioFiscalErrores.push('Código postal debe tener 5 dígitos');
        errors.push('Código postal debe tener 5 dígitos');
      }

      if (!emisorData.domicilioFiscal.calle || emisorData.domicilioFiscal.calle.trim().length === 0) {
        domicilioFiscalErrores.push('Calle no configurada');
        errors.push('Calle del domicilio fiscal no configurada');
      }

      if (!emisorData.domicilioFiscal.colonia || emisorData.domicilioFiscal.colonia.trim().length === 0) {
        domicilioFiscalErrores.push('Colonia no configurada');
        errors.push('Colonia del domicilio fiscal no configurada');
      }

      if (!emisorData.domicilioFiscal.municipio || emisorData.domicilioFiscal.municipio.trim().length === 0) {
        domicilioFiscalErrores.push('Municipio/Alcaldía no configurado');
        errors.push('Municipio/Alcaldía del domicilio fiscal no configurado');
      }

      if (!emisorData.domicilioFiscal.estado || emisorData.domicilioFiscal.estado.trim().length === 0) {
        domicilioFiscalErrores.push('Estado no configurado');
        errors.push('Estado del domicilio fiscal no configurado');
      }

      // ========== VALIDAR SEGUROS ==========
      // Seguro de responsabilidad civil (OBLIGATORIO para Carta Porte)
      if (!emisorData.seguros.responsabilidadCivil?.poliza) {
        segurosErrores.push('Seguro de Responsabilidad Civil no configurado (obligatorio)');
        errors.push('Seguro de Responsabilidad Civil no configurado (obligatorio para Carta Porte)');
      } else if (!emisorData.seguros.responsabilidadCivil?.aseguradora) {
        segurosErrores.push('Aseguradora de Responsabilidad Civil no configurada');
        errors.push('Aseguradora de Responsabilidad Civil no configurada');
      }

      // Warnings para otros seguros
      if (!emisorData.seguros.carga?.poliza) {
        warnings.push('Seguro de Carga no configurado (recomendado)');
      }

      if (!emisorData.seguros.medioAmbiente?.poliza) {
        warnings.push('Seguro de Medio Ambiente no configurado (recomendado)');
      }

      // ========== VALIDAR PERMISOS SCT ==========
      if (emisorData.permisosSCT.length === 0) {
        permisosSCTErrores.push('No hay permisos SCT configurados');
        warnings.push('No hay permisos SCT configurados (requerido para algunos tipos de transporte)');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        categorias: {
          datosFiscales: {
            valido: datosFiscalesErrores.length === 0,
            errores: datosFiscalesErrores
          },
          domicilioFiscal: {
            valido: domicilioFiscalErrores.length === 0,
            errores: domicilioFiscalErrores
          },
          seguros: {
            valido: segurosErrores.length === 0,
            errores: segurosErrores
          },
          permisosSCT: {
            valido: permisosSCTErrores.length === 0,
            errores: permisosSCTErrores
          }
        }
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error validando configuración';
      return {
        isValid: false,
        errors: [errorMsg],
        warnings: [],
        categorias: {
          datosFiscales: { valido: false, errores: [errorMsg] },
          domicilioFiscal: { valido: false, errores: [] },
          seguros: { valido: false, errores: [] },
          permisosSCT: { valido: false, errores: [] }
        }
      };
    }
  }

  /**
   * Verifica si existe certificado CSD activo
   */
  static async tieneCertificadoActivo(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('certificados_digitales')
        .select('id, fecha_fin_vigencia')
        .eq('activo', true)
        .eq('validado', true)
        .single();

      if (error || !data) {
        return false;
      }

      // Verificar que no esté vencido
      const fechaVencimiento = new Date(data.fecha_fin_vigencia);
      return fechaVencimiento > new Date();
    } catch (error) {
      console.error('Error verificando certificado:', error);
      return false;
    }
  }
}
