import { supabase } from '@/integrations/supabase/client';

interface ValidacionResult {
  valido: boolean;
  razonSocialSAT?: string;
  diferencias?: string[];
  accion_requerida?: string;
}

interface ConfiguracionValidacion {
  puede_timbrar: boolean;
  errores: string[];
  advertencias: string[];
}

export class ValidacionPreTimbradoService {
  
  /**
   * Valida que los datos del emisor coincidan con el SAT
   * DEBE ejecutarse ANTES de permitir timbrar
   */
  static async validarEmisorContraSAT(
    rfc: string,
    razonSocial: string,
    ambiente: 'sandbox' | 'produccion'
  ): Promise<ValidacionResult> {
    
    console.log(`🔍 [VALIDACIÓN] Verificando RFC ${rfc} en ${ambiente}`);
    
    // 1. Obtener datos oficiales del SAT
    let rfcSAT: any = null;
    let error: any = null;
    
    if (ambiente === 'sandbox') {
      const { data, error: err } = await supabase
        .from('rfc_pruebas_sat')
        .select('*')
        .eq('rfc', rfc)
        .single();
      rfcSAT = data;
      error = err;
    } else {
      // Producción: consultar cache primero
      const { data, error: err } = await supabase
        .from('rfc_validados_sat')
        .select('*')
        .eq('rfc', rfc)
        .eq('ambiente', 'produccion')
        .gt('fecha_expiracion', new Date().toISOString())
        .single();
      rfcSAT = data;
      error = err;
      
      // Si no está en cache, consultar al SAT
      if (!rfcSAT) {
        console.log('⚠️ RFC no en cache, consultando SAT...');
        const { data: satData, error: satError } = await supabase.functions.invoke('consultar-rfc-sat', {
          body: { rfc }
        });
        
        if (satError || !satData?.esValido) {
          return {
            valido: false,
            accion_requerida: `RFC ${rfc} no encontrado en el padrón del SAT`
          };
        }
        
        rfcSAT = satData;
      }
    }
    
    if (error || !rfcSAT) {
      console.error('❌ [VALIDACIÓN] RFC no encontrado:', error);
      return {
        valido: false,
        accion_requerida: `RFC ${rfc} no encontrado en el padrón del SAT. ${ambiente === 'sandbox' ? 'Usa el botón "Usar Datos Oficiales del SAT"' : 'Valida tu RFC en Configuración'}`
      };
    }
    
    // 2. Normalizar nombres para comparar
    const nombreNormalizado = this.normalizar(razonSocial);
    const nombreSATNormalizado = this.normalizar(
      rfcSAT.nombre || rfcSAT.razon_social_normalizada || rfcSAT.razonSocial
    );
    
    console.log('📋 [VALIDACIÓN] Comparando nombres:', {
      configurado: nombreNormalizado,
      sat: nombreSATNormalizado
    });
    
    // 3. Comparar
    const coincide = nombreNormalizado === nombreSATNormalizado;
    
    if (!coincide) {
      const nombreSATOriginal = rfcSAT.nombre || rfcSAT.razon_social_normalizada || rfcSAT.razonSocial;
      console.error('❌ [VALIDACIÓN] Nombres no coinciden');
      return {
        valido: false,
        razonSocialSAT: nombreSATOriginal,
        diferencias: [
          `Tu configuración: "${razonSocial}"`,
          `SAT espera: "${nombreSATOriginal}"`
        ],
        accion_requerida: 'Actualiza la razón social en Configuración > Mi Empresa para que coincida exactamente con el SAT'
      };
    }
    
    console.log('✅ [VALIDACIÓN] Nombres coinciden correctamente');
    return { 
      valido: true, 
      razonSocialSAT: rfcSAT.nombre || rfcSAT.razon_social_normalizada || rfcSAT.razonSocial 
    };
  }
  
  /**
   * Valida TODA la configuración antes de timbrar
   */
  static async validarConfiguracionCompleta(userId: string): Promise<ConfiguracionValidacion> {
    
    console.log('🔍 [VALIDACIÓN COMPLETA] Iniciando para usuario:', userId);
    const errores: string[] = [];
    const advertencias: string[] = [];
    
    // 1. Verificar que existe configuración
    const { data: config, error: configError } = await supabase
      .from('configuracion_empresa')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (configError || !config) {
      errores.push('❌ No has configurado los datos de tu empresa. Ve a Configuración > Mi Empresa');
      return { puede_timbrar: false, errores, advertencias };
    }
    
    console.log('📋 [VALIDACIÓN] Configuración encontrada:', {
      rfc: config.rfc_emisor,
      razon_social: config.razon_social,
      modo_pruebas: config.modo_pruebas,
      validado_sat: config.validado_sat
    });
    
    // 2. Verificar campos obligatorios
    if (!config.rfc_emisor) {
      errores.push('❌ RFC del emisor no configurado');
    }
    if (!config.razon_social) {
      errores.push('❌ Razón social no configurada');
    }
    if (!config.regimen_fiscal) {
      errores.push('❌ Régimen fiscal no configurado');
    }
    if (!config.domicilio_fiscal || !(config.domicilio_fiscal as any)?.codigo_postal) {
      errores.push('❌ Domicilio fiscal (código postal) no configurado');
    }
    
    // 3. Validar RFC contra SAT
    if (config.rfc_emisor && config.razon_social) {
      const ambiente = config.modo_pruebas ? 'sandbox' : 'produccion';
      console.log(`🔍 [VALIDACIÓN] Validando RFC contra SAT en ${ambiente}...`);
      
      const validacion = await this.validarEmisorContraSAT(
        config.rfc_emisor,
        config.razon_social,
        ambiente
      );
      
      if (!validacion.valido) {
        errores.push(`❌ ${validacion.accion_requerida}`);
        if (validacion.diferencias) {
          errores.push(...validacion.diferencias.map(d => `   ${d}`));
        }
      } else {
        console.log('✅ [VALIDACIÓN] RFC validado contra SAT');
      }
    }
    
    // 4. Verificar que está validado
    if (!config.validado_sat) {
      advertencias.push('⚠️ Tu RFC no ha sido validado contra el SAT. Se recomienda validarlo.');
    }
    
    // 5. Verificar certificados (si es producción)
    if (!config.modo_pruebas) {
      console.log('🔍 [VALIDACIÓN] Verificando certificados digitales...');
      const { data: cert, error: certError } = await supabase
        .from('certificados_digitales')
        .select('*')
        .eq('user_id', userId)
        .eq('activo', true)
        .single();
      
      if (certError || !cert) {
        errores.push('❌ No tienes un certificado digital activo. Necesitas uno para producción.');
      } else if (new Date(cert.fecha_fin_vigencia) < new Date()) {
        errores.push('❌ Tu certificado digital ha expirado. Carga uno nuevo.');
      } else {
        console.log('✅ [VALIDACIÓN] Certificado digital válido');
      }
    }
    
    // 6. Verificar folios
    if (!config.folio_actual_factura && !config.folio_inicial_factura) {
      advertencias.push('⚠️ No has configurado los folios de facturación');
    }
    
    const resultado = {
      puede_timbrar: errores.length === 0,
      errores,
      advertencias
    };
    
    console.log('📊 [VALIDACIÓN COMPLETA] Resultado:', {
      puede_timbrar: resultado.puede_timbrar,
      errores_count: errores.length,
      advertencias_count: advertencias.length
    });
    
    return resultado;
  }
  
  /**
   * Normaliza texto para comparación (mayúsculas, sin acentos, sin espacios múltiples)
   */
  private static normalizar(texto: string): string {
    return texto
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
