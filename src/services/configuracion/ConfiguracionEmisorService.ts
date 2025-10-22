import { supabase } from '@/integrations/supabase/client';

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
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const emisorData = await this.obtenerDatosEmisor();

      // Validar RFC
      if (!emisorData.rfc || emisorData.rfc.length < 12) {
        errors.push('RFC del emisor inválido o faltante');
      }

      // Validar razón social
      if (!emisorData.nombre || emisorData.nombre.trim().length === 0) {
        errors.push('Razón social del emisor faltante');
      }

      // Validar régimen fiscal
      if (!emisorData.regimenFiscal) {
        errors.push('Régimen fiscal del emisor faltante');
      }

      // Validar domicilio fiscal
      if (!emisorData.domicilioFiscal.codigo_postal) {
        errors.push('Código postal del domicilio fiscal faltante');
      }
      if (!emisorData.domicilioFiscal.colonia) {
        errors.push('Colonia del domicilio fiscal faltante');
      }

      // Validar seguros (al menos responsabilidad civil)
      if (!emisorData.seguros.responsabilidadCivil?.poliza) {
        errors.push('Seguro de responsabilidad civil no configurado (requerido para Carta Porte)');
      }

      // Warnings
      if (!emisorData.seguros.carga?.poliza) {
        warnings.push('Seguro de carga no configurado (recomendado)');
      }

      if (emisorData.permisosSCT.length === 0) {
        warnings.push('No hay permisos SCT configurados');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Error validando configuración'],
        warnings: []
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
