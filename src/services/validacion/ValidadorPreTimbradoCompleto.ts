/**
 * ValidadorPreTimbradoCompleto
 * 
 * Validación exhaustiva antes de enviar a PAC conforme a CFDI 4.0 + Carta Porte 3.1
 * Incluye validación de correlación CP ↔ Estado ↔ Municipio según catálogos SAT
 * 
 * @see FASE_2_IMPLEMENTACION.md
 * @version 2.0.0
 */

import { CartaPorteData, UbicacionCompleta, MercanciaCompleta, FiguraCompleta } from '@/types/cartaPorte';
import { CatalogosService, CpValidationResult } from '@/services/catalogos/CatalogosService';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';

export interface ValidacionResult {
  valido: boolean;
  errores: string[];
  advertencias: string[];
  detalles?: {
    seccion: string;
    campo: string;
    mensaje: string;
    codigo?: string;
    solucion?: string;
  }[];
  puntuacion?: number;
}

export interface ValidacionUbicacionResult {
  valida: boolean;
  cpValidacion: CpValidationResult | null;
  errores: string[];
  advertencias: string[];
}

/**
 * Códigos de error SAT para referencia
 */
const CODIGOS_ERROR_SAT = {
  CFDI40999: 'Error genérico de estructura XML',
  CFDI40101: 'RFC inválido',
  CFDI40102: 'Nombre inválido',
  CFDI40103: 'Régimen fiscal inválido',
  CCP301: 'Código postal no existe en catálogo',
  CCP302: 'Estado no corresponde al CP',
  CCP303: 'Municipio no corresponde al CP',
  CCP304: 'Localidad no corresponde al CP',
  CCP305: 'Distancia recorrida inválida',
  CCP306: 'Fecha/hora inválida',
  CCP401: 'Clave de producto no válida para Carta Porte',
  CCP501: 'Configuración vehicular inválida',
  CCP601: 'RFC de figura inválido',
  CCP602: 'Licencia de operador requerida'
};

/**
 * Validador Pre-Timbrado Completo con integración de CatalogosService
 */
export class ValidadorPreTimbradoCompleto {
  
  /**
   * Validar CartaPorte completa antes de timbrar
   * Incluye validación de correlación CP ↔ Estado ↔ Municipio
   */
  static async validarCartaPorteCompleta(
    cartaPorteData: CartaPorteData
  ): Promise<ValidacionResult> {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const detalles: ValidacionResult['detalles'] = [];

    logger.info('validador', 'Iniciando validación pre-timbrado completa', {
      tieneUbicaciones: cartaPorteData.ubicaciones?.length || 0,
      tieneMercancias: cartaPorteData.mercancias?.length || 0,
      tieneFiguras: cartaPorteData.figuras?.length || 0
    });

    // ========== 1. VALIDAR EMISOR Y RECEPTOR ==========
    await this.validarEmisorReceptor(cartaPorteData, errores, advertencias, detalles);

    // ========== 2. VALIDAR UBICACIONES CON CORRELACIÓN CP ==========
    await this.validarUbicacionesConCorrelacion(cartaPorteData, errores, advertencias, detalles);

    // ========== 3. VALIDAR MERCANCÍAS ==========
    await this.validarMercancias(cartaPorteData, errores, advertencias, detalles);

    // ========== 4. VALIDAR AUTOTRANSPORTE ==========
    await this.validarAutotransporte(cartaPorteData, errores, advertencias, detalles);

    // ========== 5. VALIDAR FIGURAS ==========
    await this.validarFiguras(cartaPorteData, errores, advertencias, detalles);

    // ========== 6. VALIDAR TIPO DE CFDI ==========
    await this.validarTipoCfdi(cartaPorteData, errores, advertencias, detalles);

    // ========== 7. VALIDAR COHERENCIA DE FECHAS ==========
    await this.validarFechas(cartaPorteData, errores, advertencias, detalles);

    // ========== 8. VALIDAR CERTIFICADOS Y CSD ==========
    await this.validarCertificados(cartaPorteData, errores, advertencias, detalles);

    // Calcular puntuación
    const totalValidaciones = 50; // Estimado de campos críticos
    const puntuacion = Math.max(0, ((totalValidaciones - errores.length) / totalValidaciones) * 100);

    logger.info('validador', 'Validación pre-timbrado completada', {
      errores: errores.length,
      advertencias: advertencias.length,
      puntuacion: Math.round(puntuacion)
    });

    return {
      valido: errores.length === 0,
      errores,
      advertencias,
      detalles,
      puntuacion: Math.round(puntuacion)
    };
  }

  /**
   * Validar Emisor y Receptor
   */
  private static async validarEmisorReceptor(
    data: CartaPorteData,
    errores: string[],
    advertencias: string[],
    detalles: ValidacionResult['detalles']
  ): Promise<void> {
    // RFC Emisor
    if (!data.rfcEmisor || data.rfcEmisor.length < 12) {
      errores.push('RFC Emisor inválido o faltante');
      detalles?.push({
        seccion: 'Emisor',
        campo: 'rfcEmisor',
        mensaje: 'RFC del emisor es obligatorio y debe tener 12-13 caracteres',
        codigo: 'CFDI40101',
        solucion: 'Ingrese un RFC válido en formato: ABC123456XXX o ABCD123456XXX'
      });
    } else if (!this.validarFormatoRFC(data.rfcEmisor)) {
      errores.push('RFC Emisor tiene formato inválido');
      detalles?.push({
        seccion: 'Emisor',
        campo: 'rfcEmisor',
        mensaje: `RFC "${data.rfcEmisor}" no cumple formato SAT`,
        codigo: 'CFDI40101',
        solucion: 'Use formato: ABC123456XXX (morales) o ABCD123456XXX (físicas)'
      });
    }
    
    if (!data.nombreEmisor || data.nombreEmisor.trim() === '') {
      errores.push('Nombre del Emisor es requerido');
      detalles?.push({
        seccion: 'Emisor',
        campo: 'nombreEmisor',
        mensaje: 'El nombre del emisor es obligatorio',
        codigo: 'CFDI40102'
      });
    }

    // Régimen Fiscal Emisor
    if (data.regimenFiscalEmisor && !CatalogosService.isValidRegimen(data.regimenFiscalEmisor)) {
      errores.push(`Régimen fiscal "${data.regimenFiscalEmisor}" no es válido`);
      detalles?.push({
        seccion: 'Emisor',
        campo: 'regimenFiscalEmisor',
        mensaje: 'El régimen fiscal no existe en el catálogo SAT',
        codigo: 'CFDI40103',
        solucion: 'Seleccione un régimen fiscal del catálogo SAT'
      });
    }

    // RFC Receptor
    if (!data.rfcReceptor || data.rfcReceptor.length < 12) {
      errores.push('RFC Receptor inválido o faltante');
      detalles?.push({
        seccion: 'Receptor',
        campo: 'rfcReceptor',
        mensaje: 'RFC del receptor es obligatorio',
        codigo: 'CFDI40101'
      });
    } else if (!this.validarFormatoRFC(data.rfcReceptor)) {
      errores.push('RFC Receptor tiene formato inválido');
    }
    
    if (!data.nombreReceptor || data.nombreReceptor.trim() === '') {
      errores.push('Nombre del Receptor es requerido');
    }

    // Uso CFDI
    if (data.usoCfdi && !CatalogosService.isValidUsoCfdi(data.usoCfdi)) {
      advertencias.push(`Uso CFDI "${data.usoCfdi}" debe verificarse contra catálogo SAT`);
    }
  }

  /**
   * FASE 3.1: Validar ubicaciones con correlación CP ↔ Estado ↔ Municipio
   * Esta es la validación crítica según las recomendaciones de SmartWeb
   */
  private static async validarUbicacionesConCorrelacion(
    data: CartaPorteData,
    errores: string[],
    advertencias: string[],
    detalles: ValidacionResult['detalles']
  ): Promise<void> {
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      errores.push('Se requieren mínimo 2 ubicaciones (origen y destino)');
      detalles?.push({
        seccion: 'Ubicaciones',
        campo: 'ubicaciones',
        mensaje: 'Debe haber al menos origen y destino',
        codigo: 'CCP301'
      });
      return;
    }

    const tieneOrigen = data.ubicaciones.some(u => 
      u.tipo_ubicacion === 'Origen' || (u as any).tipoUbicacion === 'Origen'
    );
    const tieneDestino = data.ubicaciones.some(u => 
      u.tipo_ubicacion === 'Destino' || (u as any).tipoUbicacion === 'Destino'
    );

    if (!tieneOrigen) {
      errores.push('Falta ubicación de Origen');
    }
    if (!tieneDestino) {
      errores.push('Falta ubicación de Destino');
    }

    // Validar cada ubicación con correlación de catálogos
    for (let i = 0; i < data.ubicaciones.length; i++) {
      const ubicacion = data.ubicaciones[i];
      const tipoUbicacion = ubicacion.tipo_ubicacion || (ubicacion as any).tipoUbicacion || `Ubicación ${i + 1}`;
      
      const resultado = await this.validarUbicacionIndividual(ubicacion, tipoUbicacion, i);
      
      errores.push(...resultado.errores);
      advertencias.push(...resultado.advertencias);

      // Agregar detalles de validación de CP
      if (resultado.cpValidacion && !resultado.cpValidacion.isValid) {
        resultado.cpValidacion.errors.forEach(error => {
          detalles?.push({
            seccion: 'Ubicaciones',
            campo: `ubicaciones[${i}].domicilio`,
            mensaje: error,
            codigo: resultado.cpValidacion?.details?.cpExists ? 'CCP302' : 'CCP301',
            solucion: 'Verifique que el código postal corresponda al estado y municipio indicados'
          });
        });
      }
    }
  }

  /**
   * Validar una ubicación individual con correlación de catálogos SAT
   */
  private static async validarUbicacionIndividual(
    ubicacion: UbicacionCompleta,
    tipoUbicacion: string,
    index: number
  ): Promise<ValidacionUbicacionResult> {
    const errores: string[] = [];
    const advertencias: string[] = [];
    let cpValidacion: CpValidationResult | null = null;

    // Obtener código postal (puede estar en diferentes ubicaciones del objeto)
    const domicilio = ubicacion.domicilio as any;
    const cp = domicilio?.codigoPostal || domicilio?.codigo_postal || ubicacion.codigo_postal;
    const estado = domicilio?.estado || '';
    const municipio = domicilio?.municipio || '';

    if (!cp) {
      errores.push(`[${tipoUbicacion}] Código postal faltante`);
    } else if (!/^\d{5}$/.test(cp)) {
      errores.push(`[${tipoUbicacion}] Código postal "${cp}" debe ser de 5 dígitos`);
    } else {
      // ✅ VALIDACIÓN DE CORRELACIÓN CP ↔ Estado ↔ Municipio
      if (estado && municipio) {
        cpValidacion = await CatalogosService.validateCpRelation(cp, estado, municipio);
        
        if (!cpValidacion.isValid) {
          // Errores bloqueantes - no se puede timbrar
          cpValidacion.errors.forEach(error => {
            errores.push(`[${tipoUbicacion}] ${error}`);
          });
        }
        
        // Agregar advertencias
        cpValidacion.warnings.forEach(warning => {
          advertencias.push(`[${tipoUbicacion}] ${warning}`);
        });
        
        logger.debug('validador', 'Validación CP completada', {
          cp,
          estado,
          municipio,
          valido: cpValidacion.isValid,
          errores: cpValidacion.errors.length
        });
      } else {
        // Sin estado/municipio, solo validar que el CP existe
        const cpData = await CatalogosService.lookupByCp(cp);
        if (!cpData) {
          errores.push(`[${tipoUbicacion}] Código postal "${cp}" no existe en catálogos SAT`);
        } else {
          advertencias.push(`[${tipoUbicacion}] Se recomienda especificar estado y municipio`);
        }
      }
    }

    // Validar estado
    if (!estado || estado.trim() === '') {
      advertencias.push(`[${tipoUbicacion}] Estado no especificado`);
    }

    // Validar municipio
    if (!municipio || municipio.trim() === '') {
      advertencias.push(`[${tipoUbicacion}] Municipio no especificado`);
    }

    // Validar distancia en destino
    const tipoUb = ubicacion.tipo_ubicacion || (ubicacion as any).tipoUbicacion;
    if (tipoUb === 'Destino') {
      const distancia = ubicacion.distancia_recorrida || (ubicacion as any).distanciaRecorrida;
      if (!distancia || distancia <= 0) {
        errores.push(`[${tipoUbicacion}] Distancia recorrida debe ser mayor a 0 km`);
      }
    }

    // Validar fecha/hora
    const fechaHora = ubicacion.fecha_hora_salida_llegada || ubicacion.fecha_llegada_salida || (ubicacion as any).fechaHoraSalidaLlegada;
    if (!fechaHora) {
      advertencias.push(`[${tipoUbicacion}] Fecha/hora de salida/llegada no especificada`);
    }

    return {
      valida: errores.length === 0,
      cpValidacion,
      errores,
      advertencias
    };
  }

  /**
   * Validar mercancías
   */
  private static async validarMercancias(
    data: CartaPorteData,
    errores: string[],
    advertencias: string[],
    detalles: ValidacionResult['detalles']
  ): Promise<void> {
    if (!data.mercancias || data.mercancias.length === 0) {
      errores.push('Debe haber al menos una mercancía');
      return;
    }

    for (let i = 0; i < data.mercancias.length; i++) {
      const merc = data.mercancias[i];
      const label = `Mercancía ${i + 1}`;

      // Clave SAT obligatoria
      if (!merc.bienes_transp) {
        errores.push(`${label}: Clave de Bienes Transportados es requerida`);
      } else {
        // Validar que la clave existe en catálogo
        const claveValida = await CatalogosService.isValidClaveProdServ(merc.bienes_transp);
        if (!claveValida) {
          advertencias.push(`${label}: Verificar clave SAT "${merc.bienes_transp}" en catálogo`);
        }
      }

      // Descripción obligatoria
      if (!merc.descripcion || merc.descripcion.trim().length < 5) {
        errores.push(`${label}: Descripción es requerida (mínimo 5 caracteres)`);
      }

      // Cantidad > 0
      if (!merc.cantidad || merc.cantidad <= 0) {
        errores.push(`${label}: Cantidad debe ser mayor a 0`);
      }

      // Clave de unidad
      if (!merc.clave_unidad) {
        errores.push(`${label}: Clave de Unidad es requerida`);
      } else {
        const unidadValida = await CatalogosService.isValidClaveUnidad(merc.clave_unidad);
        if (!unidadValida) {
          advertencias.push(`${label}: Verificar clave de unidad "${merc.clave_unidad}"`);
        }
      }

      // Peso > 0
      if (!merc.peso_kg || merc.peso_kg <= 0) {
        advertencias.push(`${label}: Peso no especificado o inválido`);
      }

      // ✅ FASE 4.1: Valor mercancía no puede ser 0 en producción
      if (merc.valor_mercancia === 0 || merc.valor_mercancia === undefined) {
        advertencias.push(`${label}: Valor de mercancía es 0 o no especificado`);
      }
    }
  }

  /**
   * Validar autotransporte
   */
  private static async validarAutotransporte(
    data: CartaPorteData,
    errores: string[],
    advertencias: string[],
    detalles: ValidacionResult['detalles']
  ): Promise<void> {
    if (!data.autotransporte) {
      errores.push('Datos de Autotransporte son requeridos');
      return;
    }

    const auto = data.autotransporte;

    // Placa obligatoria
    if (!auto.placa_vm || auto.placa_vm.trim() === '') {
      errores.push('Placa del vehículo es requerida');
    } else if (!/^[A-Z0-9]{5,10}$/.test(auto.placa_vm.replace(/-/g, '').toUpperCase())) {
      advertencias.push('Formato de placa puede ser inválido');
    }

    // Configuración vehicular
    if (!auto.config_vehicular) {
      errores.push('Configuración vehicular es requerida');
    }

    // Año modelo
    const currentYear = new Date().getFullYear();
    if (!auto.anio_modelo_vm || auto.anio_modelo_vm < 1980 || auto.anio_modelo_vm > currentYear + 1) {
      errores.push(`Año del modelo del vehículo es inválido (debe estar entre 1980 y ${currentYear + 1})`);
    }

    // Peso bruto vehicular
    if (!auto.peso_bruto_vehicular || auto.peso_bruto_vehicular <= 0) {
      errores.push('Peso bruto vehicular debe ser mayor a 0');
    }

    // Validar que el peso de mercancías no exceda capacidad
    if (data.mercancias && auto.peso_bruto_vehicular) {
      const pesoMercancias = data.mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
      if (pesoMercancias > auto.peso_bruto_vehicular) {
        advertencias.push(`Peso de mercancías (${pesoMercancias} kg) excede capacidad del vehículo (${auto.peso_bruto_vehicular} kg)`);
      }
    }

    // Seguros
    if (!auto.asegura_resp_civil) {
      advertencias.push('Aseguradora de Responsabilidad Civil no especificada');
    }
    if (!auto.poliza_resp_civil) {
      advertencias.push('Póliza de Responsabilidad Civil no especificada');
    }

    // Permisos SCT
    if (!auto.perm_sct) {
      errores.push('Permiso SCT es requerido');
    }
    if (!auto.num_permiso_sct) {
      errores.push('Número de Permiso SCT es requerido');
    }
  }

  /**
   * Validar figuras de transporte
   */
  private static async validarFiguras(
    data: CartaPorteData,
    errores: string[],
    advertencias: string[],
    detalles: ValidacionResult['detalles']
  ): Promise<void> {
    if (!data.figuras || data.figuras.length === 0) {
      errores.push('Debe haber al menos una figura de transporte (operador)');
      return;
    }

    const tieneOperador = data.figuras.some(f => f.tipo_figura === '01');
    if (!tieneOperador) {
      errores.push('Debe haber al menos un Operador (tipo figura 01)');
    }

    for (let i = 0; i < data.figuras.length; i++) {
      const fig = data.figuras[i];
      const label = `Figura ${i + 1}`;

      // RFC obligatorio
      if (!fig.rfc_figura || fig.rfc_figura.length < 12) {
        errores.push(`${label}: RFC inválido`);
      } else if (!this.validarFormatoRFC(fig.rfc_figura)) {
        errores.push(`${label}: RFC con formato inválido`);
      }

      // RFC genérico de extranjero (XEXX010101000) solo en transporte internacional
      if (fig.rfc_figura === 'XEXX010101000' && !data.transporteInternacional) {
        errores.push(`${label}: RFC genérico de extranjero solo válido en transporte internacional`);
      }

      // Nombre obligatorio
      if (!fig.nombre_figura || fig.nombre_figura.trim() === '') {
        errores.push(`${label}: Nombre es requerido`);
      }

      // Validaciones específicas para operadores
      if (fig.tipo_figura === '01') {
        if (!fig.num_licencia) {
          errores.push(`${label}: Número de licencia obligatorio para operador`);
        }
        if (!fig.tipo_licencia) {
          advertencias.push(`${label}: Tipo de licencia no especificado`);
        }
      }

      // Validar domicilio de figura (CP)
      if (fig.domicilio?.codigo_postal) {
        const cpData = await CatalogosService.lookupByCp(fig.domicilio.codigo_postal);
        if (!cpData) {
          advertencias.push(`${label}: Código postal "${fig.domicilio.codigo_postal}" no encontrado en catálogos`);
        }
      }
    }
  }

  /**
   * Validar tipo de CFDI
   */
  private static async validarTipoCfdi(
    data: CartaPorteData,
    errores: string[],
    advertencias: string[],
    detalles: ValidacionResult['detalles']
  ): Promise<void> {
    if (!data.tipoCfdi) {
      errores.push('Tipo de CFDI es requerido');
    } else {
      const tiposValidos = ['Ingreso', 'Traslado', 'I', 'T'];
      if (!tiposValidos.includes(data.tipoCfdi)) {
        errores.push(`Tipo de CFDI "${data.tipoCfdi}" no válido para Carta Porte`);
      }
    }

    // IdCCP debe tener 32 caracteres (UUID sin guiones)
    const idCCP = data.idCCP || data.cartaPorteId;
    if (!idCCP || idCCP.length !== 32) {
      advertencias.push('ID CCP debe tener 32 caracteres (UUID sin guiones)');
    }
  }

  /**
   * Validar coherencia de fechas
   */
  private static async validarFechas(
    data: CartaPorteData,
    errores: string[],
    advertencias: string[],
    detalles: ValidacionResult['detalles']
  ): Promise<void> {
    if (!data.ubicaciones || data.ubicaciones.length < 2) return;

    const fechasUbicaciones: { tipo: string; fecha: Date | null }[] = [];

    for (const ub of data.ubicaciones) {
      const fechaStr = ub.fecha_hora_salida_llegada || ub.fecha_llegada_salida;
      if (fechaStr) {
        try {
          const fecha = new Date(fechaStr);
          if (!isNaN(fecha.getTime())) {
            fechasUbicaciones.push({
              tipo: ub.tipo_ubicacion || 'Desconocido',
              fecha
            });
          }
        } catch {
          // Fecha inválida
        }
      }
    }

    // Verificar que fecha de salida < fecha de llegada
    const origen = fechasUbicaciones.find(f => f.tipo === 'Origen');
    const destino = fechasUbicaciones.find(f => f.tipo === 'Destino');

    if (origen?.fecha && destino?.fecha) {
      if (origen.fecha >= destino.fecha) {
        errores.push('La fecha de salida del origen debe ser anterior a la fecha de llegada al destino');
      }
    }
  }

  /**
   * Validar certificados y configuración
   */
  private static async validarCertificados(
    data: CartaPorteData,
    errores: string[],
    advertencias: string[],
    detalles: ValidacionResult['detalles']
  ): Promise<void> {
    try {
      // Obtener usuario actual
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user?.id) {
        advertencias.push('No se pudo verificar configuración de certificados');
        return;
      }

      // Verificar que hay un certificado activo
      const { data: certActivo, error } = await supabase
        .from('certificados_activos')
        .select('certificado_id')
        .eq('user_id', sessionData.session.user.id)
        .single();

      if (error || !certActivo?.certificado_id) {
        advertencias.push('No hay certificado CSD activo configurado');
        return;
      }

      // Verificar que el RFC del certificado coincide con el emisor
      const { data: certificado } = await supabase
        .from('certificados_digitales')
        .select('rfc_titular, fecha_fin_vigencia, activo')
        .eq('id', certActivo.certificado_id)
        .single();

      if (certificado) {
        if (certificado.rfc_titular !== data.rfcEmisor) {
          errores.push(`RFC del certificado (${certificado.rfc_titular}) no coincide con RFC emisor (${data.rfcEmisor})`);
        }

        if (new Date(certificado.fecha_fin_vigencia) < new Date()) {
          errores.push('El certificado CSD ha expirado');
        }

        if (!certificado.activo) {
          advertencias.push('El certificado CSD está marcado como inactivo');
        }
      }
    } catch (error) {
      logger.warn('validador', 'Error verificando certificados', { error });
      advertencias.push('No se pudo verificar la configuración de certificados');
    }
  }

  /**
   * Validar código postal contra catálogo SAT (simple)
   */
  private static async validarCodigoPostal(cp: string | undefined): Promise<boolean> {
    if (!cp || cp.length !== 5) {
      return false;
    }
    
    const resultado = await CatalogosService.lookupByCp(cp);
    return resultado !== null;
  }

  /**
   * Validar RFC contra formato SAT
   */
  static validarFormatoRFC(rfc: string): boolean {
    if (!rfc) return false;
    
    // RFC Persona Física: 13 caracteres
    // RFC Persona Moral: 12 caracteres
    const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{2,3}$/i;
    return rfcRegex.test(rfc) && (rfc.length === 12 || rfc.length === 13);
  }

  /**
   * Validar distancia total del viaje
   */
  static validarDistancia(ubicaciones: any[]): { valido: boolean; mensaje?: string } {
    const destino = ubicaciones.find(u => 
      u.tipo_ubicacion === 'Destino' || u.tipoUbicacion === 'Destino'
    );
    
    const distancia = destino?.distancia_recorrida || destino?.distanciaRecorrida;
    
    if (!distancia || distancia <= 0) {
      return {
        valido: false,
        mensaje: 'La distancia recorrida debe ser mayor a 0 km'
      };
    }

    return { valido: true };
  }

  /**
   * Validación rápida para UI (sin llamadas async pesadas)
   */
  static validacionRapida(data: CartaPorteData): { valido: boolean; erroresCriticos: string[] } {
    const erroresCriticos: string[] = [];

    if (!data.rfcEmisor) erroresCriticos.push('RFC Emisor requerido');
    if (!data.rfcReceptor) erroresCriticos.push('RFC Receptor requerido');
    if (!data.ubicaciones || data.ubicaciones.length < 2) erroresCriticos.push('Mínimo 2 ubicaciones');
    if (!data.mercancias || data.mercancias.length === 0) erroresCriticos.push('Mínimo 1 mercancía');
    if (!data.autotransporte) erroresCriticos.push('Datos de vehículo requeridos');
    if (!data.figuras || data.figuras.length === 0) erroresCriticos.push('Mínimo 1 figura de transporte');

    return {
      valido: erroresCriticos.length === 0,
      erroresCriticos
    };
  }
}
