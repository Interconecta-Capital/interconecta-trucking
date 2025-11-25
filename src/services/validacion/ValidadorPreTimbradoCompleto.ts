import { CartaPorteData } from '@/types/cartaPorte';
import { supabase } from '@/integrations/supabase/client';

export interface ValidacionResult {
  valido: boolean;
  errores: string[];
  advertencias: string[];
}

/**
 * Validador Pre-Timbrado Completo
 * FASE 3.3: Validación exhaustiva antes de enviar a PAC
 */
export class ValidadorPreTimbradoCompleto {
  
  /**
   * Validar CartaPorte completa antes de timbrar
   */
  static async validarCartaPorteCompleta(
    cartaPorteData: CartaPorteData
  ): Promise<ValidacionResult> {
    const errores: string[] = [];
    const advertencias: string[] = [];

    console.log('🔍 [ValidadorPreTimbrado] Iniciando validación completa...');

    // ========== 1. VALIDAR EMISOR Y RECEPTOR ==========
    if (!cartaPorteData.rfcEmisor || cartaPorteData.rfcEmisor.length < 12) {
      errores.push('RFC Emisor inválido o faltante');
    }
    
    if (!cartaPorteData.nombreEmisor || cartaPorteData.nombreEmisor.trim() === '') {
      errores.push('Nombre del Emisor es requerido');
    }

    if (!cartaPorteData.rfcReceptor || cartaPorteData.rfcReceptor.length < 12) {
      errores.push('RFC Receptor inválido o faltante');
    }
    
    if (!cartaPorteData.nombreReceptor || cartaPorteData.nombreReceptor.trim() === '') {
      errores.push('Nombre del Receptor es requerido');
    }

    // ========== 2. VALIDAR UBICACIONES ==========
    if (!cartaPorteData.ubicaciones || cartaPorteData.ubicaciones.length < 2) {
      errores.push('Se requieren mínimo 2 ubicaciones (origen y destino)');
    } else {
      const tieneOrigen = cartaPorteData.ubicaciones.some(u => 
        u.tipo_ubicacion === 'Origen'
      );
      const tieneDestino = cartaPorteData.ubicaciones.some(u => 
        u.tipo_ubicacion === 'Destino'
      );

      if (!tieneOrigen) {
        errores.push('Falta ubicación de Origen');
      }
      if (!tieneDestino) {
        errores.push('Falta ubicación de Destino');
      }

      // Validar códigos postales
      for (const ub of cartaPorteData.ubicaciones) {
        const cp = ub.codigo_postal || ub.domicilio?.codigo_postal;
        
        if (!cp) {
          errores.push(`Código postal faltante en ubicación: ${ub.tipo_ubicacion}`);
          continue;
        }

        // Validar contra catálogo SAT
        const cpValido = await this.validarCodigoPostal(cp);
        if (!cpValido) {
          errores.push(
            `Código postal inválido en ${ub.tipo_ubicacion}: ${cp}. ` +
            `Debe existir en el catálogo del SAT.`
          );
        }

        // Validar domicilio completo
        if (!ub.domicilio?.estado || ub.domicilio.estado.trim() === '') {
          advertencias.push(`Estado faltante en ${ub.tipo_ubicacion}`);
        }
        if (!ub.domicilio?.municipio || ub.domicilio.municipio.trim() === '') {
          advertencias.push(`Municipio faltante en ${ub.tipo_ubicacion}`);
        }
      }
    }

    // ========== 3. VALIDAR MERCANCÍAS ==========
    if (!cartaPorteData.mercancias || cartaPorteData.mercancias.length === 0) {
      errores.push('Debe haber al menos una mercancía');
    } else {
      cartaPorteData.mercancias.forEach((merc, idx) => {
        if (!merc.bienes_transp) {
          errores.push(`Mercancía ${idx + 1}: Clave de Bienes Transportados es requerida`);
        }
        if (!merc.descripcion || merc.descripcion.trim() === '') {
          errores.push(`Mercancía ${idx + 1}: Descripción es requerida`);
        }
        if (!merc.cantidad || merc.cantidad <= 0) {
          errores.push(`Mercancía ${idx + 1}: Cantidad debe ser mayor a 0`);
        }
        if (!merc.clave_unidad) {
          errores.push(`Mercancía ${idx + 1}: Clave de Unidad es requerida`);
        }
        if (!merc.peso_kg || merc.peso_kg <= 0) {
          advertencias.push(`Mercancía ${idx + 1}: Peso no especificado o inválido`);
        }
      });
    }

    // ========== 4. VALIDAR AUTOTRANSPORTE ==========
    if (!cartaPorteData.autotransporte) {
      errores.push('Datos de Autotransporte son requeridos');
    } else {
      const auto = cartaPorteData.autotransporte;

      if (!auto.placa_vm || auto.placa_vm.trim() === '') {
        errores.push('Placa del vehículo es requerida');
      }
      
      if (!auto.config_vehicular) {
        errores.push('Configuración vehicular es requerida');
      }

      if (!auto.anio_modelo_vm || auto.anio_modelo_vm < 1900) {
        errores.push('Año del modelo del vehículo es inválido');
      }

      if (!auto.peso_bruto_vehicular || auto.peso_bruto_vehicular <= 0) {
        errores.push('Peso bruto vehicular debe ser mayor a 0');
      }

      // Validar seguros
      if (!auto.asegura_resp_civil) {
        advertencias.push('Aseguradora de Responsabilidad Civil no especificada');
      }
      if (!auto.poliza_resp_civil) {
        advertencias.push('Póliza de Responsabilidad Civil no especificada');
      }

      // Validar permisos SCT
      if (!auto.perm_sct) {
        errores.push('Permiso SCT es requerido');
      }
      if (!auto.num_permiso_sct) {
        errores.push('Número de Permiso SCT es requerido');
      }
    }

    // ========== 5. VALIDAR FIGURAS ==========
    if (!cartaPorteData.figuras || cartaPorteData.figuras.length === 0) {
      errores.push('Debe haber al menos una figura de transporte (operador)');
    } else {
      const tieneOperador = cartaPorteData.figuras.some(
        f => f.tipo_figura === '01'
      );
      
      if (!tieneOperador) {
        errores.push('Debe haber al menos un Operador (tipo figura 01)');
      }

      cartaPorteData.figuras.forEach((fig, idx) => {
        if (!fig.rfc_figura || fig.rfc_figura.length < 12) {
          errores.push(`Figura ${idx + 1}: RFC inválido`);
        }
        if (!fig.nombre_figura || fig.nombre_figura.trim() === '') {
          errores.push(`Figura ${idx + 1}: Nombre es requerido`);
        }

        // Validaciones específicas para operadores
        if (fig.tipo_figura === '01') {
          if (!fig.num_licencia) {
            advertencias.push(`Operador ${idx + 1}: Número de licencia no especificado`);
          }
          if (!fig.tipo_licencia) {
            advertencias.push(`Operador ${idx + 1}: Tipo de licencia no especificado`);
          }
        }

        // Validar domicilio de figura
        if (!fig.domicilio?.codigo_postal) {
          advertencias.push(`Figura ${idx + 1}: Código postal del domicilio no especificado`);
        }
      });
    }

    // ========== 6. VALIDAR TIPO DE CFDI ==========
    if (!cartaPorteData.tipoCfdi) {
      errores.push('Tipo de CFDI es requerido');
    }

    console.log('✅ [ValidadorPreTimbrado] Validación completada:', {
      errores: errores.length,
      advertencias: advertencias.length
    });

    return {
      valido: errores.length === 0,
      errores,
      advertencias
    };
  }

  /**
   * Validar código postal contra catálogo SAT
   */
  private static async validarCodigoPostal(cp: string | undefined): Promise<boolean> {
    if (!cp || cp.length !== 5) {
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('cat_codigo_postal')
        .select('codigo_postal')
        .eq('codigo_postal', cp)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Error validando código postal:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('❌ Error en validación de código postal:', error);
      return false;
    }
  }

  /**
   * Validar RFC contra formato SAT
   */
  static validarFormatoRFC(rfc: string): boolean {
    if (!rfc) return false;
    
    // RFC Persona Física: 13 caracteres (CURP sin homoclave)
    // RFC Persona Moral: 12 caracteres
    const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{2,3}$/i;
    return rfcRegex.test(rfc) && (rfc.length === 12 || rfc.length === 13);
  }

  /**
   * Validar distancia total del viaje
   */
  static validarDistancia(ubicaciones: any[]): { valido: boolean; mensaje?: string } {
    const destino = ubicaciones.find(u => u.tipo_ubicacion === 'Destino');
    
    if (!destino || !destino.distancia_recorrida || destino.distancia_recorrida <= 0) {
      return {
        valido: false,
        mensaje: 'La distancia recorrida debe ser mayor a 0 km'
      };
    }

    return { valido: true };
  }
}
