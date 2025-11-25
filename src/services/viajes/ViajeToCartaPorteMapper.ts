import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { CartaPorteData, MercanciaCompleta } from '@/types/cartaPorte';
import { MercanciaMultipleParser } from '@/services/mercancias/MercanciaMultipleParser';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Viaje } from '@/types/viaje';

export class ViajeToCartaPorteMapper {
  static mapToCartaPorteData(wizardData: ViajeWizardData) {
    // Mapear datos básicos de configuración
    const configuracion = {
      version: '3.1',
      tipoComprobante: 'T', // Traslado
      emisor: {
        rfc: '', // Se debe configurar desde el perfil del usuario
        nombre: '',
        regimenFiscal: ''
      },
      receptor: {
        rfc: wizardData.cliente?.rfc || '',
        nombre: wizardData.cliente?.nombre_razon_social || '',
        regimenFiscal: wizardData.cliente?.regimen_fiscal || '612',
        usoCfdi: wizardData.cliente?.uso_cfdi || 'G03',
        domicilio: {
          pais: 'MEX',
          codigo_postal: wizardData.cliente?.direccion_fiscal?.codigo_postal || '',
          estado: wizardData.cliente?.direccion_fiscal?.estado || '',
          municipio: wizardData.cliente?.direccion_fiscal?.municipio || '',
          colonia: wizardData.cliente?.direccion_fiscal?.colonia || '',
          calle: wizardData.cliente?.direccion_fiscal?.calle || '',
        }
      },
    };

    // ✅ FASE 1: Mapear ubicaciones completas con domicilio estructurado
    const ubicaciones = [];
    
    if (wizardData.origen) {
      const origenDomicilio = wizardData.origen.domicilio || {};
      ubicaciones.push({
        tipoUbicacion: 'Origen',
        idUbicacion: 'OR000001',
        direccion: wizardData.origen.direccion || wizardData.origen.nombre || '',
        codigoPostal: origenDomicilio.codigoPostal || origenDomicilio.codigo_postal || wizardData.origen.codigoPostal || '',
        coordenadas: wizardData.origen.coordenadas,
        fechaHoraSalidaLlegada: wizardData.origen.fechaHoraSalidaLlegada || new Date().toISOString(),
        domicilio: {
          pais: origenDomicilio.pais || 'MEX',
          codigoPostal: origenDomicilio.codigoPostal || origenDomicilio.codigo_postal || wizardData.origen.codigoPostal || '',
          estado: origenDomicilio.estado || '',
          municipio: origenDomicilio.municipio || '',
          colonia: origenDomicilio.colonia || '',
          calle: origenDomicilio.calle || wizardData.origen.direccion || '',
          numExterior: origenDomicilio.numExterior || origenDomicilio.numeroExterior || '',
          numInterior: origenDomicilio.numInterior || origenDomicilio.numeroInterior || '',
          localidad: origenDomicilio.localidad || ''
        }
      });
      console.log('✅ [MAPPER] Origen con domicilio completo:', {
        cp: origenDomicilio.codigoPostal || origenDomicilio.codigo_postal,
        estado: origenDomicilio.estado,
        municipio: origenDomicilio.municipio
      });
    }

    if (wizardData.destino) {
      const destinoDomicilio = wizardData.destino.domicilio || {};
      ubicaciones.push({
        tipoUbicacion: 'Destino',
        idUbicacion: 'DE000001',
        direccion: wizardData.destino.direccion || wizardData.destino.nombre || '',
        codigoPostal: destinoDomicilio.codigoPostal || destinoDomicilio.codigo_postal || wizardData.destino.codigoPostal || '',
        coordenadas: wizardData.destino.coordenadas,
        distanciaRecorrida: wizardData.distanciaRecorrida,
        fechaHoraSalidaLlegada: wizardData.destino.fechaHoraSalidaLlegada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        domicilio: {
          pais: destinoDomicilio.pais || 'MEX',
          codigoPostal: destinoDomicilio.codigoPostal || destinoDomicilio.codigo_postal || wizardData.destino.codigoPostal || '',
          estado: destinoDomicilio.estado || '',
          municipio: destinoDomicilio.municipio || '',
          colonia: destinoDomicilio.colonia || '',
          calle: destinoDomicilio.calle || wizardData.destino.direccion || '',
          numExterior: destinoDomicilio.numExterior || destinoDomicilio.numeroExterior || '',
          numInterior: destinoDomicilio.numInterior || destinoDomicilio.numeroInterior || '',
          localidad: destinoDomicilio.localidad || ''
        }
      });
      console.log('✅ [MAPPER] Destino con domicilio completo:', {
        cp: destinoDomicilio.codigoPostal || destinoDomicilio.codigo_postal,
        estado: destinoDomicilio.estado,
        municipio: destinoDomicilio.municipio
      });
    }

    // Mapear mercancías con datos inteligentes basados en la descripción
    const mercancias: MercanciaCompleta[] = this.generateIntelligentMercancia(wizardData);

    // ✅ FASE 2: Mapear autotransporte completo con remolques
    const autotransporte = {
      placa: wizardData.vehiculo?.placa || '',
      configVehicular: wizardData.vehiculo?.configuracion_vehicular || 'C2',
      pesoBrutoVehicular: wizardData.vehiculo?.peso_bruto_vehicular || 3500,
      anioModeloVm: wizardData.vehiculo?.anio || new Date().getFullYear(),
      // Incluir datos completos del vehículo
      marca: wizardData.vehiculo?.marca || '',
      modelo: wizardData.vehiculo?.modelo || '',
      tipo_carroceria: wizardData.vehiculo?.tipo_carroceria || '01',
      // Datos de seguros y permisos
      permiso_sct: wizardData.vehiculo?.permiso_sct || 'TPAF03',
      numero_permiso_sct: wizardData.vehiculo?.numero_permiso_sct || 'SCT-123456',
      aseguradora_responsabilidad_civil: wizardData.vehiculo?.aseguradora_responsabilidad_civil || 'SEGUROS SA',
      poliza_responsabilidad_civil: wizardData.vehiculo?.poliza_responsabilidad_civil || 'POL123456',
      aseguradora_medio_ambiente: wizardData.vehiculo?.aseguradora_medio_ambiente || 'SEGUROS SA',
      poliza_medio_ambiente: wizardData.vehiculo?.poliza_medio_ambiente || 'POL123456',
      
      // ✅ FASE 2: Incluir remolques del wizard
      remolques: wizardData.remolque ? [{
        placa: wizardData.remolque.placa || '',
        subtipo_rem: wizardData.remolque.tipo_remolque || wizardData.remolque.subtipo_rem || 'CTR004'
      }] : []
    };
    
    if (wizardData.remolque) {
      console.log('✅ [MAPPER] Remolque agregado:', {
        placa: wizardData.remolque.placa,
        subtipo: wizardData.remolque.tipo_remolque || wizardData.remolque.subtipo_rem
      });
    }

    // ✅ FASE 3: Mapear figuras de transporte completas con todos los campos
    // Si ya hay figuras auto-pobladas en wizardData, usarlas
    const figuras = [];
    if (wizardData.figuras && Array.isArray(wizardData.figuras) && wizardData.figuras.length > 0) {
      console.log('✅ [MAPPER] Usando', wizardData.figuras.length, 'figuras auto-pobladas del wizard');
      figuras.push(...wizardData.figuras.map(fig => ({
        ...fig,
        // Asegurar que todos los campos estén presentes
        tipoFigura: fig.tipoFigura || fig.tipo_figura || '01',
        rfcFigura: fig.rfcFigura || fig.rfc_figura || 'XEXX010101000',
        nombreFigura: fig.nombreFigura || fig.nombre_figura || '',
        numLicencia: fig.numLicencia || fig.num_licencia || '',
        tipoLicencia: fig.tipoLicencia || fig.tipo_licencia || '',
        curp: fig.curp || '',
        operador_sct: fig.operador_sct || false,
        residencia_fiscal: fig.residencia_fiscal || fig.residencia_fiscal_figura || 'MEX',
        vigencia_licencia: fig.vigencia_licencia || '',
        domicilio: fig.domicilio || {
          pais: 'MEX',
          codigo_postal: '06000',
          estado: '',
          municipio: '',
          colonia: '',
          calle: ''
        }
      })));
    } else if (wizardData.conductor) {
      // Fallback: crear figura del conductor manualmente con todos los campos
      console.log('⚠️ [MAPPER] No había figuras auto-pobladas, creando figura del conductor manualmente');
      figuras.push({
        tipoFigura: '01', // Operador
        nombreFigura: wizardData.conductor.nombre,
        rfcFigura: wizardData.conductor.rfc || 'XEXX010101000',
        numLicencia: wizardData.conductor.num_licencia || '',
        tipoLicencia: wizardData.conductor.tipo_licencia || 'C',
        curp: wizardData.conductor.curp || '',
        operador_sct: wizardData.conductor.operador_sct || false,
        residencia_fiscal: wizardData.conductor.residencia_fiscal || 'MEX',
        vigencia_licencia: wizardData.conductor.vigencia_licencia || '',
        domicilio: wizardData.conductor.direccion || {
          pais: 'MEX',
          codigo_postal: '06000',
          estado: 'Ciudad de México',
          municipio: 'Ciudad de México',
          colonia: 'Centro',
          calle: 'Calle sin número'
        }
      });
    }

    return {
      configuracion,
      ubicaciones,
      mercancias,
      autotransporte,
      figuras,
      // Metadatos del viaje
      tipoServicio: wizardData.tipoServicio,
      descripcionMercancia: wizardData.descripcionMercancia,
      // Sincronizar datos de la ruta calculada
      rutaCalculada: wizardData.distanciaRecorrida ? {
        distancia: wizardData.distanciaRecorrida,
        duracion: wizardData.distanciaRecorrida ? Math.round(wizardData.distanciaRecorrida / 60) : undefined,
        coordenadas: {
          origen: wizardData.origen?.coordenadas,
          destino: wizardData.destino?.coordenadas
        }
      } : undefined
    };
  }

  /**
   * Mapear viaje desde DB con todas las relaciones enriquecidas
   * FASE 3.1: Método integral que obtiene datos de BD y los valida
   */
  static async mapFromViajeDB(viajeId: string): Promise<CartaPorteData> {
    console.log('🔍 [MapFromDB] Iniciando mapeo desde BD para viaje:', viajeId);
    
    // 1. Obtener viaje con TODAS las relaciones
    const { data: viaje, error: viajeError } = await supabase
      .from('viajes')
      .select(`
        *,
        conductores!conductor_id(
          id, nombre, rfc, curp, num_licencia, tipo_licencia, 
          operador_sct, residencia_fiscal, vigencia_licencia, direccion
        ),
        vehiculos!vehiculo_id(
          id, placa, marca, modelo, anio, configuracion_vehicular,
          peso_bruto_vehicular, tipo_carroceria, permiso_sct, 
          numero_permiso_sct, aseguradora_responsabilidad_civil,
          poliza_responsabilidad_civil, aseguradora_medio_ambiente,
          poliza_medio_ambiente
        ),
        remolques!remolque_id(
          id, placa, tipo_remolque
        ),
        clientes_proveedores!viajes_cliente_id_fkey(
          id, nombre_razon_social, rfc, regimen_fiscal, uso_cfdi, domicilio_fiscal
        )
      `)
      .eq('id', viajeId)
      .single();

    if (viajeError || !viaje) {
      console.error('❌ [MapFromDB] Error obteniendo viaje:', viajeError);
      throw new Error(`No se pudo obtener el viaje: ${viajeError?.message}`);
    }

    console.log('✅ [MapFromDB] Viaje obtenido con relaciones:', {
      conductor: !!viaje.conductores,
      vehiculo: !!viaje.vehiculos,
      remolque: !!viaje.remolques,
      cliente: !!viaje.clientes_proveedores
    });

    // 2. Extraer y normalizar tracking_data
    const trackingData = (viaje.tracking_data as any) || {};
    
    // Normalizar ubicaciones si están en formato objeto {origen, destino}
    let ubicacionesArray = trackingData.ubicaciones || [];
    if (!Array.isArray(ubicacionesArray) && ubicacionesArray.origen && ubicacionesArray.destino) {
      console.log('⚠️ [MapFromDB] Normalizando ubicaciones de objeto a array');
      ubicacionesArray = [ubicacionesArray.origen, ubicacionesArray.destino];
    }

    // 3. Enriquecer tracking_data con datos de relaciones DB
    const wizardDataEnriquecido: ViajeWizardData = {
      tipoServicio: trackingData.tipo_servicio || 'flete_pagado',
      cliente: viaje.clientes_proveedores || trackingData.cliente,
      conductor: viaje.conductores || trackingData.conductor,
      vehiculo: viaje.vehiculos || trackingData.vehiculo,
      remolque: viaje.remolques || trackingData.remolque,
      origen: ubicacionesArray[0] || trackingData.origen || {
        nombre: viaje.origen,
        direccion: viaje.origen,
        coordenadas: null,
        domicilio: {}
      },
      destino: ubicacionesArray[1] || trackingData.destino || {
        nombre: viaje.destino,
        direccion: viaje.destino,
        coordenadas: null,
        domicilio: {}
      },
      descripcionMercancia: trackingData.descripcionMercancia || 'Mercancía general',
      distanciaRecorrida: viaje.distancia_km || trackingData.distanciaTotal || 100,
      figuras: trackingData.figuras || [],
      // Propiedades adicionales requeridas por ViajeWizardData
      currentStep: 6, // Paso final - viaje completo
      isValid: true
    };

    console.log('✅ [MapFromDB] Datos enriquecidos:', {
      cliente: wizardDataEnriquecido.cliente?.nombre_razon_social,
      conductor: wizardDataEnriquecido.conductor?.nombre,
      vehiculo: wizardDataEnriquecido.vehiculo?.placa,
      ubicaciones: ubicacionesArray.length
    });

    // 4. Usar el mapper existente para generar CartaPorteData validado
    return await this.mapToValidCartaPorteFormat(wizardDataEnriquecido);
  }

  static async mapToValidCartaPorteFormat(wizardData: ViajeWizardData): Promise<CartaPorteData> {
    const baseData = this.mapToCartaPorteData(wizardData);
    
    // Validaciones más tolerantes con fallbacks
    console.log('🔍 Validando datos del wizard:', {
      cliente: !!wizardData.cliente,
      clienteRfc: wizardData.cliente?.rfc,
      origen: !!wizardData.origen,
      destino: !!wizardData.destino,
      vehiculo: !!wizardData.vehiculo,
      conductor: !!wizardData.conductor
    });

    // Validar RFC del cliente (requerido)
    if (!baseData.configuracion.receptor.rfc) {
      const errorMsg = 'RFC del cliente es requerido para crear la carta porte';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    // Validar ubicaciones mínimas
    if (baseData.ubicaciones.length < 2) {
      const errorMsg = 'Se requieren al menos origen y destino para crear la carta porte';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    // Asegurar al menos una mercancía (crear por defecto si no existe)
    if (baseData.mercancias.length === 0) {
      console.log('⚠️ No hay mercancías definidas, creando mercancía por defecto');
      baseData.mercancias.push({
        id: `mercancia-default-${Date.now()}`,
        bienes_transp: '99999999',
        descripcion: wizardData.descripcionMercancia || 'Mercancía general',
        cantidad: 1,
        clave_unidad: 'H87',
        peso_kg: 100,
        valor_mercancia: 1000,
        moneda: 'MXN',
        material_peligroso: false,
        especie_protegida: false,
        fraccion_arancelaria: '99999999'
      });
    }

    console.log('✅ Validaciones completadas, generando CartaPorteData');

    // Obtener datos del usuario para el emisor (AHORA ES ASYNC)
    const emisorData = await this.getEmisorData();

    // FASE 2: Logs visibles con toasts
    toast.info('📋 Configurando Carta Porte', {
      description: `Cliente: ${wizardData.cliente?.nombre_razon_social || 'No especificado'}`,
      duration: 3000
    });

    console.log('🔧 [ViajeToCartaPorteMapper] Configuración CFDI:', {
      cliente_uso_cfdi: wizardData.cliente?.uso_cfdi,
      baseData_uso_cfdi: baseData.configuracion.receptor.usoCfdi,
      final_uso_cfdi: wizardData.cliente?.uso_cfdi || baseData.configuracion.receptor.usoCfdi || 'G03'
    });

      // Retornar en formato CartaPorteData con todos los campos sincronizados
      return {
        cartaPorteVersion: '3.1',
        rfcEmisor: emisorData.rfc,
        nombreEmisor: emisorData.nombre,
        regimenFiscalEmisor: emisorData.regimenFiscal,
        rfcReceptor: baseData.configuracion.receptor.rfc,
        nombreReceptor: baseData.configuracion.receptor.nombre,
        usoCfdi: wizardData.cliente?.uso_cfdi || baseData.configuracion.receptor.usoCfdi || 'G03',
      tipoCfdi: 'Traslado', // FASE 2: Usar 'Traslado' en lugar de 'T' (se convierte en XML generator)
      transporteInternacional: false,
      registroIstmo: false,
      viaTransporte: '01', // Autotransporte
      mercancias: baseData.mercancias,
      ubicaciones: baseData.ubicaciones.map(ub => {
        const codigoPostal = ub.domicilio?.codigo_postal 
          || ub.domicilio?.codigoPostal 
          || ub.codigoPostal 
          || ub.codigo_postal 
          || '';
        
        // FASE 2: Toast informativo sobre código postal
        if (!codigoPostal && ub.tipoUbicacion) {
          toast.warning(`⚠️ Falta código postal en ${ub.tipoUbicacion}`, {
            description: 'Verifica la dirección ingresada',
            duration: 4000
          });
        }
        
        console.log('🔍 [ViajeToCartaPorteMapper] Extrayendo código postal:', {
          ubicacion: ub.tipoUbicacion,
          resultado: codigoPostal || '❌ FALTANTE'
        });
        
        return {
          id: ub.idUbicacion,
          tipo_ubicacion: ub.tipoUbicacion,
          rfc: baseData.configuracion.receptor.rfc,
          nombre: baseData.configuracion.receptor.nombre,
          fecha_llegada_salida: ub.fechaHoraSalidaLlegada,
          fecha_hora_salida_llegada: ub.fechaHoraSalidaLlegada,
          distancia_recorrida: ub.tipoUbicacion === 'Destino' 
            ? (() => {
                const distancia = (wizardData as any).distanciaTotal || (ub.distanciaRecorrida && ub.distanciaRecorrida > 0 ? ub.distanciaRecorrida : 0);
                // FASE 2: Toast informativo sobre distancia
                if (distancia > 0) {
                  toast.success(`📏 Distancia calculada: ${distancia} km`, {
                    duration: 3000
                  });
                }
                console.log('📏 [ViajeToCartaPorteMapper] Distancia calculada:', {
                  distanciaTotal: (wizardData as any).distanciaTotal,
                  distanciaRecorrida: ub.distanciaRecorrida,
                  final: distancia
                });
                return distancia;
              })()
            : 0,
          coordenadas: ub.coordenadas,
          codigo_postal: codigoPostal, // ← CAMPO DIRECTO (columna en tabla)
          domicilio: {
            pais: ub.domicilio?.pais || 'MEX',
            codigo_postal: codigoPostal, // ← DENTRO DEL JSON
            estado: ub.domicilio?.estado || '',
            municipio: ub.domicilio?.municipio || '',
            colonia: ub.domicilio?.colonia || '',
            calle: ub.domicilio?.calle || ub.direccion || ''
          }
        };
      }),
      autotransporte: {
        placa_vm: baseData.autotransporte.placa,
        anio_modelo_vm: baseData.autotransporte.anioModeloVm,
        config_vehicular: baseData.autotransporte.configVehicular,
        perm_sct: baseData.autotransporte.permiso_sct || 'TPAF03',
        num_permiso_sct: baseData.autotransporte.numero_permiso_sct || 'SCT-123456',
        asegura_resp_civil: baseData.autotransporte.aseguradora_responsabilidad_civil || 'SEGUROS SA',
        poliza_resp_civil: baseData.autotransporte.poliza_responsabilidad_civil || 'POL123456',
        asegura_med_ambiente: baseData.autotransporte.aseguradora_medio_ambiente || 'SEGUROS SA',
        poliza_med_ambiente: baseData.autotransporte.poliza_medio_ambiente || 'POL123456',
        peso_bruto_vehicular: baseData.autotransporte.pesoBrutoVehicular,
        tipo_carroceria: baseData.autotransporte.tipo_carroceria || '01',
        marca: baseData.autotransporte.marca || '',
        modelo: baseData.autotransporte.modelo || '',
        // ✅ FASE 2: Pasar remolques correctamente
        remolques: baseData.autotransporte.remolques || []
      },
      figuras: baseData.figuras.map(fig => ({
        id: `figura-${Date.now()}`,
        tipo_figura: fig.tipoFigura,
        rfc_figura: fig.rfcFigura,
        nombre_figura: fig.nombreFigura,
        // ✅ FASE 3: Asegurar todos los campos de licencia y operador
        num_licencia: fig.numLicencia || '',
        tipo_licencia: fig.tipoLicencia || '',
        curp: fig.curp || '',
        operador_sct: fig.operador_sct || false,
        residencia_fiscal_figura: fig.residencia_fiscal || 'MEX',
        vigencia_licencia: fig.vigencia_licencia || '',
        // ✅ FASE 3: Domicilio completo
        domicilio: fig.domicilio || {
          pais: 'MEX',
          codigo_postal: '06000',
          estado: 'Ciudad de México',
          municipio: 'Ciudad de México',
          colonia: 'Centro',
          calle: 'Calle sin número'
        }
      }))
    };
  }

  /**
   * Obtener datos del emisor (usuario actual) desde configuracion_empresa
   */
  static async getEmisorData(): Promise<{ rfc: string; nombre: string; regimenFiscal: string }> {
    // IMPORTAR SERVICIO DE CONFIGURACIÓN
    const { ConfiguracionEmisorService } = await import('@/services/configuracion/ConfiguracionEmisorService');
    
    try {
      const emisorData = await ConfiguracionEmisorService.obtenerDatosEmisor();
      return {
        rfc: emisorData.rfc,
        nombre: emisorData.nombre,
        regimenFiscal: emisorData.regimenFiscal
      };
    } catch (error) {
      console.error('❌ Error obteniendo datos del emisor:', error);
      throw new Error(`No se pueden obtener datos del emisor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Validar que los datos del wizard están completos para crear Carta Porte
   * NOTA: Esta validación es PERMISIVA para borradores - solo valida campos críticos
   */
  static validarDatosCompletos(wizardData: ViajeWizardData): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    // Validar cliente (CRÍTICO)
    if (!wizardData.cliente) {
      errores.push('Cliente no seleccionado');
    } else {
      if (!wizardData.cliente.rfc) errores.push('RFC del cliente faltante');
      if (!wizardData.cliente.nombre_razon_social) errores.push('Nombre del cliente faltante');
    }

    // Validar ubicaciones básicas (PERMISIVO - solo validar que existan)
    if (!wizardData.origen) {
      errores.push('Origen no especificado');
    } else if (!wizardData.origen.direccion && !wizardData.origen.nombre) {
      errores.push('Dirección de origen incompleta');
    }

    if (!wizardData.destino) {
      errores.push('Destino no especificado');
    } else if (!wizardData.destino.direccion && !wizardData.destino.nombre) {
      errores.push('Dirección de destino incompleta');
    }

    // Validar vehículo (CRÍTICO)
    if (!wizardData.vehiculo) {
      errores.push('Vehículo no seleccionado');
    } else if (!wizardData.vehiculo.placa) {
      errores.push('Placa del vehículo faltante');
    }

    // Validar conductor (CRÍTICO)
    if (!wizardData.conductor) {
      errores.push('Conductor no seleccionado');
    } else if (!wizardData.conductor.nombre) {
      errores.push('Nombre del conductor faltante');
    }

    // Mercancía (CRÍTICO)
    if (!wizardData.descripcionMercancia) {
      errores.push('Descripción de mercancía faltante');
    }

    // ⚠️ WARNINGS (no bloquean creación de borrador)
    if (wizardData.cliente && !wizardData.cliente.regimen_fiscal) {
      console.warn('⚠️ Régimen fiscal del cliente faltante (completar antes de timbrar)');
    }
    if (wizardData.vehiculo && !wizardData.vehiculo.permiso_sct) {
      console.warn('⚠️ Permiso SCT del vehículo faltante (completar antes de timbrar)');
    }
    if (wizardData.conductor && !wizardData.conductor.rfc) {
      console.warn('⚠️ RFC del conductor faltante (completar antes de timbrar)');
    }
    if (wizardData.origen && !wizardData.origen.domicilio?.codigo_postal && !wizardData.origen.domicilio?.codigoPostal) {
      console.warn('⚠️ Código postal de origen faltante (completar antes de timbrar)');
    }
    if (wizardData.destino && !wizardData.destino.domicilio?.codigo_postal && !wizardData.destino.domicilio?.codigoPostal) {
      console.warn('⚠️ Código postal de destino faltante (completar antes de timbrar)');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Generar ID único para la carta porte
   */
  /**
   * Genera mercancías inteligentes basado en la descripción usando IA/heurísticas
   * FASE 1: Integrado con MercanciaMultipleParser para detectar múltiples productos
   */
  static generateIntelligentMercancia(wizardData: ViajeWizardData): MercanciaCompleta[] {
    // ✅ FASE 1 - PRIORIDAD 1: Si ya hay mercancías detalladas del wizard, usarlas directamente
    if (wizardData.mercancias && Array.isArray(wizardData.mercancias) && wizardData.mercancias.length > 0) {
      console.log(`✅ [MAPPER] Usando ${wizardData.mercancias.length} mercancías del wizard (datos completos)`);
      
      // Mapear mercancías del wizard al formato CartaPorte
      return wizardData.mercancias.map((m: any, index: number) => ({
        id: m.id || `mercancia-${Date.now()}-${index}`,
        bienes_transp: m.bienes_transp || m.claveProdServ || '99999999',
        descripcion: m.descripcion || '',
        cantidad: parseFloat(m.cantidad) || 1,
        clave_unidad: m.clave_unidad || m.claveUnidad || 'H87',
        unidad: m.unidad || 'Pieza',
        peso_kg: parseFloat(m.peso_kg || m.pesoKg) || 0,
        valor_mercancia: parseFloat(m.valor_mercancia || m.valorMercancia) || 0,
        moneda: m.moneda || 'MXN',
        material_peligroso: Boolean(m.material_peligroso),
        especie_protegida: Boolean(m.especie_protegida),
        fraccion_arancelaria: m.fraccion_arancelaria || m.fraccionArancelaria || '',
        embalaje: m.embalaje || null,
        aiGenerated: false // ← Mercancía ingresada manualmente
      }));
    }
    
    // ✅ PRIORIDAD 2: Si no hay mercancías, usar descripción + IA
    const descripcion = wizardData.descripcionMercancia || 'Mercancía general';
    console.log(`⚠️ [MAPPER] No hay mercancías detalladas, generando desde descripción: "${descripcion}"`);
    
    // FASE 1: Primero intentar detectar múltiples productos
    const productosDetectados = MercanciaMultipleParser.analizarDescripcion(descripcion);

    if (productosDetectados.length > 1) {
      console.log(`✅ [MAPPER] Detectados ${productosDetectados.length} productos distintos vía IA`);
      
      // Generar una mercancía por cada producto detectado
      return productosDetectados.map((producto, index) => {
        const analisis = this.analyzeCargoDescription(producto.descripcion);
        
        return {
          id: `mercancia-${Date.now()}-${index}`,
          bienes_transp: analisis.claveProdServ,
          descripcion: producto.descripcion,
          cantidad: producto.cantidad,
          clave_unidad: producto.unidad, // Usar unidad detectada por el parser
          peso_kg: analisis.peso, // Usar peso calculado por analyzeCargoDescription
          valor_mercancia: analisis.valor, // Usar valor calculado
          moneda: 'MXN',
          material_peligroso: analisis.materialPeligroso,
          especie_protegida: analisis.especieProtegida,
          fraccion_arancelaria: analisis.fraccionArancelaria,
          aiGenerated: true,
          aiConfidence: analisis.confidence
        };
      });
    }
    
    // Si solo hay un producto o no se detectaron múltiples, usar análisis normal
    const analisis = this.analyzeCargoDescription(descripcion);
    
    return [{
      id: `mercancia-${Date.now()}`,
      bienes_transp: analisis.claveProdServ,
      descripcion: descripcion,
      cantidad: analisis.cantidad,
      clave_unidad: analisis.claveUnidad,
      peso_kg: analisis.peso,
      valor_mercancia: analisis.valor,
      moneda: 'MXN',
      material_peligroso: analisis.materialPeligroso,
      especie_protegida: analisis.especieProtegida,
      fraccion_arancelaria: analisis.fraccionArancelaria,
      aiGenerated: true,
      aiConfidence: analisis.confidence
    }];
  }

  /**
   * Analiza la descripción de mercancía para sugerir datos fiscales
   */
  static analyzeCargoDescription(descripcion: string) {
    const desc = descripcion.toLowerCase();
    
    // Patrones comunes para diferentes tipos de mercancía (AMPLIADO)
    const patterns = {
      textiles: {
        keywords: ['ropa', 'textil', 'tela', 'prendas', 'algodón', 'poliéster', 'vestido', 'camisa', 'pantalón'],
        claveProdServ: '53101500', // Textiles
        fraccionArancelaria: '61091000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 50
      },
      alimentos: {
        keywords: ['comida', 'alimento', 'fruta', 'verdura', 'carne', 'lácteos', 'queso', 'leche', 'pan', 'cereal'],
        claveProdServ: '50101500', // Alimentos
        fraccionArancelaria: '08042000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 100
      },
      electronica: {
        keywords: ['computadora', 'electrónico', 'teléfono', 'tv', 'tablet', 'equipo', 'laptop', 'celular', 'smartphone'],
        claveProdServ: '43211500', // Equipos electrónicos
        fraccionArancelaria: '85171100',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 25
      },
      construccion: {
        keywords: ['cemento', 'ladrillo', 'material', 'construcción', 'fierro', 'varilla', 'arena', 'grava', 'block'],
        claveProdServ: '30111500', // Materiales construcción
        fraccionArancelaria: '72142000',
        claveUnidad: 'TNE', // Tonelada
        pesoPromedio: 1000
      },
      quimicos: {
        keywords: ['químico', 'pintura', 'solvente', 'ácido', 'reactivo', 'corrosivo', 'tóxico'],
        claveProdServ: '12101600', // Productos químicos
        fraccionArancelaria: '38099100',
        claveUnidad: 'LTR', // Litro
        pesoPromedio: 200,
        materialPeligroso: true
      },
      automotriz: {
        keywords: ['auto', 'automóvil', 'coche', 'refacciones', 'llantas', 'motor', 'transmisión', 'frenos', 'suspensión', 'batería'],
        claveProdServ: '25101500', // Partes automotrices
        fraccionArancelaria: '87089900',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 30
      },
      farmaceuticos: {
        keywords: ['medicamento', 'fármaco', 'medicina', 'vacuna', 'antibiótico', 'pastillas', 'jarabe', 'inyección'],
        claveProdServ: '51101500', // Productos farmacéuticos
        fraccionArancelaria: '30049000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 10
      },
      maquinaria: {
        keywords: ['maquinaria', 'equipo industrial', 'herramienta', 'torno', 'prensa', 'compresor', 'generador'],
        claveProdServ: '21101500', // Maquinaria industrial
        fraccionArancelaria: '84159000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 500
      },
      bebidas: {
        keywords: ['bebida', 'refresco', 'agua', 'jugo', 'cerveza', 'vino', 'licor', 'alcohol'],
        claveProdServ: '50202200', // Bebidas
        fraccionArancelaria: '22021000',
        claveUnidad: 'LTR', // Litro
        pesoPromedio: 150
      },
      papel: {
        keywords: ['papel', 'cartón', 'embalaje', 'caja', 'cuaderno', 'libro', 'revista'],
        claveProdServ: '14111500', // Productos de papel
        fraccionArancelaria: '48191000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 80
      },
      plasticos: {
        keywords: ['plástico', 'pet', 'polietileno', 'pvc', 'resina', 'envase plástico'],
        claveProdServ: '40101600', // Plásticos
        fraccionArancelaria: '39201000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 60
      },
      madera: {
        keywords: ['madera', 'mueble', 'tarima', 'pallet', 'triplay', 'aglomerado'],
        claveProdServ: '30101500', // Productos de madera
        fraccionArancelaria: '44071000',
        claveUnidad: 'MTR', // Metro
        pesoPromedio: 200
      },
      metales: {
        keywords: ['acero', 'aluminio', 'metal', 'hierro', 'cobre', 'lámina', 'perfil'],
        claveProdServ: '30111700', // Metales
        fraccionArancelaria: '72142000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 500
      },
      vidrio: {
        keywords: ['vidrio', 'cristal', 'ventana', 'espejo', 'botella de vidrio'],
        claveProdServ: '30131500', // Productos de vidrio
        fraccionArancelaria: '70051000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 100
      },
      electrodomesticos: {
        keywords: ['refrigerador', 'lavadora', 'estufa', 'microondas', 'licuadora', 'electrodoméstico'],
        claveProdServ: '52141500', // Electrodomésticos
        fraccionArancelaria: '85161000',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 40
      },
      agricola: {
        keywords: ['semilla', 'fertilizante', 'agroquímico', 'herbicida', 'pesticida', 'agrícola'],
        claveProdServ: '10171500', // Productos agrícolas
        fraccionArancelaria: '31010000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 150
      },
      granos: {
        keywords: ['elote', 'maíz', 'grano', 'trigo', 'frijol', 'soya', 'avena', 'cebada', 'arroz', 'costal'],
        claveProdServ: '10101500', // Cereales y granos
        fraccionArancelaria: '10059000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 50
      },
      frutas_verduras: {
        keywords: ['fruta', 'verdura', 'hortaliza', 'jitomate', 'tomate', 'cebolla', 'papa', 'zanahoria', 'manzana', 'naranja', 'aguacate'],
        claveProdServ: '10151500', // Frutas y verduras frescas
        fraccionArancelaria: '07020000',
        claveUnidad: 'KGM', // Kilogramo
        pesoPromedio: 80
      },
      cosmeticos: {
        keywords: ['cosmético', 'perfume', 'crema', 'shampoo', 'maquillaje', 'jabón'],
        claveProdServ: '53131600', // Cosméticos
        fraccionArancelaria: '33049900',
        claveUnidad: 'H87', // Pieza
        pesoPromedio: 20
      }
    };

    // Buscar coincidencias en catálogo local
    let categoria = null;
    let maxCoincidencias = 0;
    
    // FASE 5: Priorizar catálogo local con toast informativo
    for (const [key, pattern] of Object.entries(patterns)) {
      const coincidencias = pattern.keywords.filter(keyword => desc.includes(keyword)).length;
      if (coincidencias > maxCoincidencias) {
        maxCoincidencias = coincidencias;
        categoria = pattern;
      }
    }

    if (categoria && maxCoincidencias > 0) {
      // FASE 2 + FASE 5: Toast cuando se usa catálogo local
      toast.success('📦 Mercancía detectada en catálogo local', {
        description: `${maxCoincidencias} palabras clave encontradas`,
        duration: 3000
      });
    }

    // Si no hay coincidencias, usar valores por defecto
    if (!categoria || maxCoincidencias === 0) {
      // FASE 2 + FASE 5: Toast cuando NO se encuentra en catálogo
      toast.warning('⚠️ Mercancía no encontrada en catálogo', {
        description: 'Se usarán valores por defecto. Verifica manualmente los datos fiscales.',
        duration: 5000
      });
      
      categoria = {
        claveProdServ: '99999999',
        fraccionArancelaria: '99999999',
        claveUnidad: 'H87',
        pesoPromedio: 100,
        materialPeligroso: false
      };
    }

    // Extraer cantidad si está mencionada en la descripción
    const cantidadMatch = desc.match(/(\d+)\s*(kilogramos?|kg|toneladas?|piezas?|unidades?|cajas?)/);
    const cantidad = cantidadMatch ? parseInt(cantidadMatch[1]) : 1;

    // Calcular peso basado en cantidad y tipo
    const pesoEstimado = cantidad * (categoria.pesoPromedio || 100);

    // Calcular valor estimado (muy básico)
    const valorEstimado = Math.max(pesoEstimado * 10, 1000);

    return {
      claveProdServ: categoria.claveProdServ,
      fraccionArancelaria: categoria.fraccionArancelaria,
      claveUnidad: categoria.claveUnidad,
      cantidad: cantidad,
      peso: pesoEstimado,
      valor: valorEstimado,
      materialPeligroso: categoria.materialPeligroso || false,
      especieProtegida: false,
      confidence: (maxCoincidencias > 0 ? 'alta' : 'baja') as 'alta' | 'media' | 'baja'
    };
  }

  static generateCartaPorteId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `CP-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Validar completitud de datos antes del mapeo
   */
  static validateWizardData(wizardData: ViajeWizardData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!wizardData.cliente) {
      errors.push('Cliente no seleccionado');
    } else if (!wizardData.cliente.rfc) {
      errors.push('RFC del cliente es requerido');
    }

    if (!wizardData.origen) {
      errors.push('Origen no definido');
    }

    if (!wizardData.destino) {
      errors.push('Destino no definido');
    }

    if (!wizardData.vehiculo) {
      errors.push('Vehículo no asignado');
    }

    if (!wizardData.conductor) {
      errors.push('Conductor no asignado');
    }

    if (!wizardData.descripcionMercancia) {
      errors.push('Descripción de mercancía faltante');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
