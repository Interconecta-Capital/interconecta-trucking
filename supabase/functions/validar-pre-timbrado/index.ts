/**
 * Edge Function: Validar Pre-Timbrado
 * 
 * Validación backend completa antes de enviar al PAC
 * Incluye: CP correlation, RFC match certificado, estructura XML
 * 
 * @see FASE_4_BACKEND_VALIDATION.md
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartaPortePayload {
  rfcEmisor: string;
  nombreEmisor: string;
  regimenFiscalEmisor?: string;
  rfcReceptor: string;
  nombreReceptor?: string;
  usoCfdi?: string;
  tipoCfdi?: string;
  ubicaciones?: any[];
  mercancias?: any[];
  autotransporte?: any;
  figuras?: any[];
  transporteInternacional?: boolean;
}

interface ValidationError {
  code: string;
  message: string;
  field?: string;
  severity: 'error' | 'warning' | 'critical';
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score: number;
  timestamp: string;
}

// Catálogo de errores
const ERROR_CODES = {
  // Emisor/Receptor
  MISSING_RFC_EMISOR: { code: 'E001', message: 'RFC del emisor es obligatorio', severity: 'critical' as const },
  INVALID_RFC_EMISOR: { code: 'E002', message: 'RFC del emisor tiene formato inválido', severity: 'critical' as const },
  MISSING_RFC_RECEPTOR: { code: 'E003', message: 'RFC del receptor es obligatorio', severity: 'critical' as const },
  RFC_CERT_MISMATCH: { code: 'E004', message: 'RFC del emisor no coincide con el certificado activo', severity: 'critical' as const },
  
  // Ubicaciones
  MIN_UBICACIONES: { code: 'U001', message: 'Se requieren mínimo 2 ubicaciones', severity: 'error' as const },
  MISSING_ORIGEN: { code: 'U002', message: 'Falta ubicación de origen', severity: 'error' as const },
  MISSING_DESTINO: { code: 'U003', message: 'Falta ubicación de destino', severity: 'error' as const },
  INVALID_CP: { code: 'U004', message: 'Código postal inválido', severity: 'error' as const },
  CP_ESTADO_MISMATCH: { code: 'U005', message: 'El estado no corresponde al código postal', severity: 'error' as const },
  CP_MUNICIPIO_MISMATCH: { code: 'U006', message: 'El municipio no corresponde al código postal', severity: 'error' as const },
  MISSING_DISTANCIA: { code: 'U007', message: 'Distancia recorrida es obligatoria en destinos', severity: 'error' as const },
  INVALID_FECHA: { code: 'U008', message: 'Fecha de salida debe ser anterior a fecha de llegada', severity: 'error' as const },
  
  // Mercancías
  MIN_MERCANCIAS: { code: 'M001', message: 'Se requiere al menos una mercancía', severity: 'error' as const },
  MISSING_BIENES_TRANSP: { code: 'M002', message: 'Clave de bienes transportados es obligatoria', severity: 'error' as const },
  INVALID_VALOR: { code: 'M003', message: 'Valor de mercancía debe ser mayor a 0', severity: 'warning' as const },
  MISSING_PESO: { code: 'M004', message: 'Peso de mercancía es obligatorio', severity: 'error' as const },
  
  // Autotransporte
  MISSING_AUTO: { code: 'A001', message: 'Información de autotransporte es obligatoria', severity: 'error' as const },
  MISSING_PLACA: { code: 'A002', message: 'Placa del vehículo es obligatoria', severity: 'error' as const },
  MISSING_PERMISO: { code: 'A003', message: 'Permiso SCT es obligatorio', severity: 'error' as const },
  
  // Figuras
  MIN_FIGURAS: { code: 'F001', message: 'Se requiere al menos una figura de transporte', severity: 'error' as const },
  MISSING_OPERADOR: { code: 'F002', message: 'Debe haber al menos un operador (tipo 01)', severity: 'error' as const },
  MISSING_LICENCIA: { code: 'F003', message: 'Número de licencia es obligatorio para operadores', severity: 'error' as const },
  INVALID_RFC_FIGURA: { code: 'F004', message: 'RFC de figura tiene formato inválido', severity: 'error' as const },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: CartaPortePayload = await req.json();
    
    console.log('[VALIDAR-PRE-TIMBRADO] Iniciando validación para usuario:', user.id);
    console.log('[VALIDAR-PRE-TIMBRADO] Payload recibido:', {
      rfcEmisor: payload.rfcEmisor,
      ubicaciones: payload.ubicaciones?.length || 0,
      mercancias: payload.mercancias?.length || 0,
      figuras: payload.figuras?.length || 0
    });

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // ========== 1. VALIDAR EMISOR/RECEPTOR ==========
    await validateEmisorReceptor(supabase, user.id, payload, errors, warnings);

    // ========== 2. VALIDAR UBICACIONES CON CORRELACIÓN CP ==========
    await validateUbicaciones(supabase, payload, errors, warnings);

    // ========== 3. VALIDAR MERCANCÍAS ==========
    validateMercancias(payload, errors, warnings);

    // ========== 4. VALIDAR AUTOTRANSPORTE ==========
    validateAutotransporte(payload, errors, warnings);

    // ========== 5. VALIDAR FIGURAS ==========
    validateFiguras(payload, errors, warnings);

    // ========== 6. VALIDAR COHERENCIA DE FECHAS ==========
    validateFechas(payload, errors, warnings);

    // Calcular score
    const totalChecks = 20; // Número estimado de validaciones
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;
    const regularErrors = errors.filter(e => e.severity === 'error').length;
    const score = Math.max(0, Math.round(((totalChecks - criticalErrors * 3 - regularErrors) / totalChecks) * 100));

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
      score,
      timestamp: new Date().toISOString()
    };

    // Log de auditoría
    await supabase.from('security_audit_log').insert({
      event_type: 'pre_timbrado_validation',
      user_id: user.id,
      event_data: {
        rfcEmisor: payload.rfcEmisor,
        valid: result.valid,
        errorsCount: errors.length,
        warningsCount: warnings.length,
        score,
        duration_ms: Date.now() - startTime
      }
    });

    console.log('[VALIDAR-PRE-TIMBRADO] Resultado:', {
      valid: result.valid,
      errors: errors.length,
      warnings: warnings.length,
      score
    });

    return new Response(
      JSON.stringify(result),
      { 
        status: result.valid ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[VALIDAR-PRE-TIMBRADO] Error:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: error.message,
        errors: [{ code: 'INTERNAL', message: error.message, severity: 'critical' }],
        warnings: [],
        score: 0
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ========== FUNCIONES DE VALIDACIÓN ==========

async function validateEmisorReceptor(
  supabase: any,
  userId: string,
  payload: CartaPortePayload,
  errors: ValidationError[],
  warnings: ValidationError[]
) {
  // RFC Emisor
  if (!payload.rfcEmisor) {
    errors.push({ ...ERROR_CODES.MISSING_RFC_EMISOR, field: 'rfcEmisor' });
  } else if (!isValidRFC(payload.rfcEmisor)) {
    errors.push({ ...ERROR_CODES.INVALID_RFC_EMISOR, field: 'rfcEmisor' });
  } else {
    // Verificar que el RFC del emisor coincide con el certificado activo
    const { data: certActivo } = await supabase
      .from('certificados_activos')
      .select('certificado_id')
      .eq('user_id', userId)
      .single();

    if (certActivo?.certificado_id) {
      const { data: certificado } = await supabase
        .from('certificados_digitales')
        .select('rfc_titular, activo, fecha_fin_vigencia')
        .eq('id', certActivo.certificado_id)
        .single();

      if (certificado) {
        if (certificado.rfc_titular !== payload.rfcEmisor) {
          errors.push({ 
            ...ERROR_CODES.RFC_CERT_MISMATCH, 
            field: 'rfcEmisor',
            message: `RFC emisor (${payload.rfcEmisor}) no coincide con certificado (${certificado.rfc_titular})`
          });
        }

        if (new Date(certificado.fecha_fin_vigencia) < new Date()) {
          errors.push({
            code: 'E005',
            message: 'El certificado CSD ha expirado',
            field: 'certificado',
            severity: 'critical'
          });
        }
      }
    } else {
      warnings.push({
        code: 'W001',
        message: 'No hay certificado CSD activo configurado',
        field: 'certificado',
        severity: 'warning'
      });
    }
  }

  // RFC Receptor
  if (!payload.rfcReceptor) {
    errors.push({ ...ERROR_CODES.MISSING_RFC_RECEPTOR, field: 'rfcReceptor' });
  } else if (!isValidRFC(payload.rfcReceptor)) {
    errors.push({
      code: 'E006',
      message: 'RFC del receptor tiene formato inválido',
      field: 'rfcReceptor',
      severity: 'error'
    });
  }
}

async function validateUbicaciones(
  supabase: any,
  payload: CartaPortePayload,
  errors: ValidationError[],
  warnings: ValidationError[]
) {
  if (!payload.ubicaciones || payload.ubicaciones.length < 2) {
    errors.push({ ...ERROR_CODES.MIN_UBICACIONES, field: 'ubicaciones' });
    return;
  }

  const tieneOrigen = payload.ubicaciones.some(u => 
    u.tipo_ubicacion === 'Origen' || u.tipoUbicacion === 'Origen'
  );
  const tieneDestino = payload.ubicaciones.some(u => 
    u.tipo_ubicacion === 'Destino' || u.tipoUbicacion === 'Destino'
  );

  if (!tieneOrigen) {
    errors.push({ ...ERROR_CODES.MISSING_ORIGEN, field: 'ubicaciones' });
  }
  if (!tieneDestino) {
    errors.push({ ...ERROR_CODES.MISSING_DESTINO, field: 'ubicaciones' });
  }

  // Validar cada ubicación con correlación CP
  for (let i = 0; i < payload.ubicaciones.length; i++) {
    const ubicacion = payload.ubicaciones[i];
    const domicilio = ubicacion.domicilio || {};
    const cp = domicilio.codigoPostal || domicilio.codigo_postal || ubicacion.codigo_postal;
    const estado = domicilio.estado || '';
    const municipio = domicilio.municipio || '';
    const tipoUb = ubicacion.tipo_ubicacion || ubicacion.tipoUbicacion;

    // Validar CP
    if (!cp || !/^\d{5}$/.test(cp)) {
      errors.push({
        ...ERROR_CODES.INVALID_CP,
        field: `ubicaciones[${i}].domicilio.codigoPostal`,
        message: `Ubicación ${i + 1}: Código postal inválido o faltante`
      });
      continue;
    }

    // Buscar CP en catálogo y validar correlación
    const { data: cpData } = await supabase
      .from('codigos_postales_mexico')
      .select('estado, municipio, estado_clave, municipio_clave')
      .eq('codigo_postal', cp)
      .limit(1);

    if (!cpData || cpData.length === 0) {
      warnings.push({
        code: 'W002',
        message: `Ubicación ${i + 1}: CP ${cp} no encontrado en catálogo SAT`,
        field: `ubicaciones[${i}].domicilio.codigoPostal`,
        severity: 'warning'
      });
    } else {
      const catalogoEstado = cpData[0].estado?.toLowerCase().trim();
      const catalogoMunicipio = cpData[0].municipio?.toLowerCase().trim();
      const inputEstado = estado?.toLowerCase().trim();
      const inputMunicipio = municipio?.toLowerCase().trim();

      // Validar estado
      if (inputEstado && catalogoEstado && !catalogoEstado.includes(inputEstado) && !inputEstado.includes(catalogoEstado)) {
        errors.push({
          ...ERROR_CODES.CP_ESTADO_MISMATCH,
          field: `ubicaciones[${i}].domicilio.estado`,
          message: `Ubicación ${i + 1}: Estado "${estado}" no corresponde al CP ${cp} (esperado: ${cpData[0].estado})`
        });
      }

      // Validar municipio
      if (inputMunicipio && catalogoMunicipio && !catalogoMunicipio.includes(inputMunicipio) && !inputMunicipio.includes(catalogoMunicipio)) {
        errors.push({
          ...ERROR_CODES.CP_MUNICIPIO_MISMATCH,
          field: `ubicaciones[${i}].domicilio.municipio`,
          message: `Ubicación ${i + 1}: Municipio "${municipio}" no corresponde al CP ${cp} (esperado: ${cpData[0].municipio})`
        });
      }
    }

    // Validar distancia en destinos
    if (tipoUb === 'Destino') {
      const distancia = ubicacion.distancia_recorrida || ubicacion.distanciaRecorrida;
      if (!distancia || distancia <= 0) {
        errors.push({
          ...ERROR_CODES.MISSING_DISTANCIA,
          field: `ubicaciones[${i}].distancia_recorrida`,
          message: `Ubicación ${i + 1} (Destino): Distancia recorrida debe ser mayor a 0`
        });
      }
    }
  }
}

function validateMercancias(
  payload: CartaPortePayload,
  errors: ValidationError[],
  warnings: ValidationError[]
) {
  if (!payload.mercancias || payload.mercancias.length === 0) {
    errors.push({ ...ERROR_CODES.MIN_MERCANCIAS, field: 'mercancias' });
    return;
  }

  for (let i = 0; i < payload.mercancias.length; i++) {
    const merc = payload.mercancias[i];

    if (!merc.bienes_transp && !merc.bienesTransp) {
      errors.push({
        ...ERROR_CODES.MISSING_BIENES_TRANSP,
        field: `mercancias[${i}].bienes_transp`,
        message: `Mercancía ${i + 1}: Clave de bienes transportados es obligatoria`
      });
    }

    const valor = merc.valor_mercancia || merc.valorMercancia || 0;
    if (valor <= 0) {
      warnings.push({
        ...ERROR_CODES.INVALID_VALOR,
        field: `mercancias[${i}].valor_mercancia`,
        message: `Mercancía ${i + 1}: Valor de mercancía es 0 o no especificado`
      });
    }

    const peso = merc.peso_kg || merc.pesoKg || 0;
    if (peso <= 0) {
      errors.push({
        ...ERROR_CODES.MISSING_PESO,
        field: `mercancias[${i}].peso_kg`,
        message: `Mercancía ${i + 1}: Peso debe ser mayor a 0`
      });
    }
  }
}

function validateAutotransporte(
  payload: CartaPortePayload,
  errors: ValidationError[],
  warnings: ValidationError[]
) {
  if (!payload.autotransporte) {
    errors.push({ ...ERROR_CODES.MISSING_AUTO, field: 'autotransporte' });
    return;
  }

  const auto = payload.autotransporte;

  if (!auto.placa_vm && !auto.placaVm) {
    errors.push({
      ...ERROR_CODES.MISSING_PLACA,
      field: 'autotransporte.placa_vm'
    });
  }

  if (!auto.perm_sct && !auto.permSct) {
    errors.push({
      ...ERROR_CODES.MISSING_PERMISO,
      field: 'autotransporte.perm_sct'
    });
  }

  if (!auto.num_permiso_sct && !auto.numPermisoSct) {
    errors.push({
      code: 'A004',
      message: 'Número de permiso SCT es obligatorio',
      field: 'autotransporte.num_permiso_sct',
      severity: 'error'
    });
  }
}

function validateFiguras(
  payload: CartaPortePayload,
  errors: ValidationError[],
  warnings: ValidationError[]
) {
  if (!payload.figuras || payload.figuras.length === 0) {
    errors.push({ ...ERROR_CODES.MIN_FIGURAS, field: 'figuras' });
    return;
  }

  const tieneOperador = payload.figuras.some(f => 
    f.tipo_figura === '01' || f.tipoFigura === '01'
  );

  if (!tieneOperador) {
    errors.push({ ...ERROR_CODES.MISSING_OPERADOR, field: 'figuras' });
  }

  for (let i = 0; i < payload.figuras.length; i++) {
    const fig = payload.figuras[i];
    const tipoFigura = fig.tipo_figura || fig.tipoFigura;

    // RFC
    const rfcFigura = fig.rfc_figura || fig.rfcFigura;
    if (!rfcFigura || !isValidRFC(rfcFigura)) {
      errors.push({
        ...ERROR_CODES.INVALID_RFC_FIGURA,
        field: `figuras[${i}].rfc_figura`,
        message: `Figura ${i + 1}: RFC inválido o faltante`
      });
    }

    // Licencia para operadores
    if (tipoFigura === '01') {
      const licencia = fig.num_licencia || fig.numLicencia;
      if (!licencia) {
        errors.push({
          ...ERROR_CODES.MISSING_LICENCIA,
          field: `figuras[${i}].num_licencia`,
          message: `Figura ${i + 1} (Operador): Número de licencia es obligatorio`
        });
      }
    }
  }
}

function validateFechas(
  payload: CartaPortePayload,
  errors: ValidationError[],
  warnings: ValidationError[]
) {
  if (!payload.ubicaciones || payload.ubicaciones.length < 2) return;

  const origen = payload.ubicaciones.find(u => 
    u.tipo_ubicacion === 'Origen' || u.tipoUbicacion === 'Origen'
  );
  const destino = payload.ubicaciones.find(u => 
    u.tipo_ubicacion === 'Destino' || u.tipoUbicacion === 'Destino'
  );

  if (origen && destino) {
    const fechaOrigen = origen.fecha_hora_salida_llegada || origen.fechaHoraSalidaLlegada;
    const fechaDestino = destino.fecha_hora_salida_llegada || destino.fechaHoraSalidaLlegada;

    if (fechaOrigen && fechaDestino) {
      const dateOrigen = new Date(fechaOrigen);
      const dateDestino = new Date(fechaDestino);

      if (dateOrigen >= dateDestino) {
        errors.push({
          ...ERROR_CODES.INVALID_FECHA,
          field: 'ubicaciones.fecha_hora_salida_llegada'
        });
      }
    }
  }
}

// Helpers
function isValidRFC(rfc: string): boolean {
  if (!rfc) return false;
  const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{2,3}$/i;
  return rfcRegex.test(rfc) && (rfc.length === 12 || rfc.length === 13);
}
