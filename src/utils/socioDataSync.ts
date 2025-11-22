import { supabase } from '@/integrations/supabase/client';

export interface SocioUpdatePayload {
  socioId: string;
  userId: string;
  rfcAnterior?: string;
  rfcNuevo?: string;
  direccionActualizada?: any;
  direccionFiscalActualizada?: any;
  regimenFiscalActualizado?: string;
  usoCfdiActualizado?: string;
}

export interface SyncResult {
  success: boolean;
  viajesActualizados: number;
  facturasBorradorActualizadas: number;
  cartasPorteBorradorActualizadas: number;
  errores: string[];
}

/**
 * ISO 27001 A.12.3.1 - Gestión de cambios
 * Propaga cambios de socios a documentos no timbrados
 */
export async function propagarCambiosSocio(payload: SocioUpdatePayload): Promise<SyncResult> {
  const errores: string[] = [];
  let viajesActualizados = 0;
  let facturasBorradorActualizadas = 0;
  let cartasPorteBorradorActualizadas = 0;

  try {
    // 1. Actualizar Viajes NO completados con este socio
    const { data: viajesData, error: viajesError } = await supabase
      .from('viajes')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('socio_id', payload.socioId)
      .not('estado', 'in', '(completado,cancelado)')
      .select('id');
    
    if (viajesError) {
      errores.push(`Error actualizando viajes: ${viajesError.message}`);
    } else {
      viajesActualizados = viajesData?.length || 0;
    }

    // 2. Actualizar Facturas en borrador (no timbradas) - RFC receptor
    if (payload.rfcAnterior && payload.rfcNuevo && payload.rfcAnterior !== payload.rfcNuevo) {
      const { data: facturasData, error: facturasError } = await supabase
        .from('facturas')
        .update({
          rfc_receptor: payload.rfcNuevo,
          updated_at: new Date().toISOString()
        })
        .eq('rfc_receptor', payload.rfcAnterior)
        .eq('user_id', payload.userId)
        .is('fecha_timbrado', null)
        .select('id');
      
      if (facturasError) {
        errores.push(`Error actualizando facturas: ${facturasError.message}`);
      } else {
        facturasBorradorActualizadas = facturasData?.length || 0;
      }
    }

    // 3. Actualizar Cartas Porte en borrador (no timbradas) - RFC receptor
    if (payload.rfcAnterior && payload.rfcNuevo && payload.rfcAnterior !== payload.rfcNuevo) {
      const { data: cartasData, error: cartasError } = await supabase
        .from('cartas_porte')
        .update({
          rfc_receptor: payload.rfcNuevo,
          updated_at: new Date().toISOString()
        })
        .eq('rfc_receptor', payload.rfcAnterior)
        .eq('usuario_id', payload.userId)
        .is('fecha_timbrado', null)
        .select('id');
      
      if (cartasError) {
        errores.push(`Error actualizando cartas porte: ${cartasError.message}`);
      } else {
        cartasPorteBorradorActualizadas = cartasData?.length || 0;
      }
    }

    // 4. Registrar auditoría
    await registrarAuditoriaSocio(
      payload.userId,
      payload.socioId,
      'actualizado',
      {
        rfc_cambio: payload.rfcAnterior !== payload.rfcNuevo,
        direccion_actualizada: !!payload.direccionActualizada,
        direccion_fiscal_actualizada: !!payload.direccionFiscalActualizada
      },
      viajesActualizados + facturasBorradorActualizadas + cartasPorteBorradorActualizadas
    );

    return {
      success: errores.length === 0,
      viajesActualizados,
      facturasBorradorActualizadas,
      cartasPorteBorradorActualizadas,
      errores
    };
  } catch (error: any) {
    return {
      success: false,
      viajesActualizados: 0,
      facturasBorradorActualizadas: 0,
      cartasPorteBorradorActualizadas: 0,
      errores: [error.message]
    };
  }
}

/**
 * Registra cambios de socios en auditoría
 */
export async function registrarAuditoriaSocio(
  userId: string,
  socioId: string,
  accion: 'actualizado' | 'creado',
  cambios: Record<string, any>,
  documentosAfectados: number
) {
  try {
    await supabase.from('security_audit_log').insert({
      user_id: userId,
      event_type: `socio_${accion}`,
      event_data: {
        socio_id: socioId,
        cambios,
        documentos_sincronizados: documentosAfectados,
        timestamp: new Date().toISOString(),
        control: 'ISO 27001 A.12.3.1'
      }
    });
  } catch (error) {
    console.warn('Error registrando auditoría:', error);
  }
}

/**
 * Valida integridad de datos del socio
 */
export function validarIntegridadSocio(socioData: any): { valido: boolean; errores: string[] } {
  const errores: string[] = [];
  
  // Validar Domicilio General
  if (!socioData.direccion?.codigoPostal) {
    errores.push('Código Postal es requerido en Domicilio General');
  }
  if (!socioData.direccion?.estado) {
    errores.push('Estado es requerido en Domicilio General');
  }
  if (!socioData.direccion?.municipio) {
    errores.push('Municipio es requerido en Domicilio General');
  }
  if (!socioData.direccion?.colonia || socioData.direccion?.colonia === '') {
    errores.push('Colonia es requerida en Domicilio General');
  }
  
  // Validar Domicilio Fiscal
  if (!socioData.direccion_fiscal?.codigoPostal) {
    errores.push('Código Postal es requerido en Domicilio Fiscal');
  }
  if (!socioData.direccion_fiscal?.estado) {
    errores.push('Estado es requerido en Domicilio Fiscal');
  }
  if (!socioData.direccion_fiscal?.municipio) {
    errores.push('Municipio es requerido en Domicilio Fiscal');
  }
  if (!socioData.direccion_fiscal?.colonia || socioData.direccion_fiscal?.colonia === '') {
    errores.push('Colonia es requerida en Domicilio Fiscal');
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
}

/**
 * Calcula cantidad de documentos que serían afectados por cambios en un socio
 */
export async function calcularDocumentosAfectados(socioId: string, userId: string): Promise<number> {
  try {
    const { count: viajesCount } = await supabase
      .from('viajes')
      .select('id', { count: 'exact', head: true })
      .eq('socio_id', socioId)
      .eq('user_id', userId)
      .not('estado', 'in', '(completado,cancelado)');

    const { count: facturasCount } = await supabase
      .from('facturas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('fecha_timbrado', null);

    const { count: cartasCount } = await supabase
      .from('cartas_porte')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', userId)
      .is('fecha_timbrado', null);

    return (viajesCount || 0) + (facturasCount || 0) + (cartasCount || 0);
  } catch (error) {
    console.error('Error calculando documentos afectados:', error);
    return 0;
  }
}
