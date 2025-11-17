import { CartaPorteData } from '@/types/cartaPorte';

export interface ValidacionCartaPorte {
  esValido: boolean;
  errores: string[];
  advertencias: string[];
}

/**
 * Valida que una Carta Porte esté completa para timbrado
 * Esta función se ejecuta ANTES de llamar al PAC
 */
export function validarCartaPorteCompleta(cartaPorteData: CartaPorteData): ValidacionCartaPorte {
  const errores: string[] = [];
  const advertencias: string[] = [];

  console.log('🔍 [VALIDACION] Validando Carta Porte para timbrado...');

  // 1. CONFIGURACIÓN BÁSICA (CRÍTICO)
  if (!cartaPorteData.rfcEmisor) {
    errores.push('RFC del Emisor es requerido');
  }
  if (!cartaPorteData.nombreEmisor) {
    errores.push('Nombre del Emisor es requerido');
  }
  if (!cartaPorteData.rfcReceptor) {
    errores.push('RFC del Receptor es requerido');
  }
  if (!cartaPorteData.nombreReceptor) {
    errores.push('Nombre del Receptor es requerido');
  }

  // 2. UBICACIONES (CRÍTICO)
  const ubicaciones = cartaPorteData.ubicaciones || [];
  if (ubicaciones.length < 2) {
    errores.push('Se requieren al menos 2 ubicaciones (Origen y Destino)');
  } else {
    const hasOrigen = ubicaciones.some(u => 
      u.tipo_ubicacion === 'Origen' || (u as any).tipoUbicacion === 'Origen'
    );
    const hasDestino = ubicaciones.some(u => 
      u.tipo_ubicacion === 'Destino' || (u as any).tipoUbicacion === 'Destino'
    );

    if (!hasOrigen) {
      errores.push('Se requiere una ubicación de Origen');
    }
    if (!hasDestino) {
      errores.push('Se requiere una ubicación de Destino');
    }

    // Validar campos SAT requeridos en ubicaciones
    ubicaciones.forEach((ubicacion, index) => {
      const tipoUbic = ubicacion.tipo_ubicacion || (ubicacion as any).tipoUbicacion;
      const nombreUbic = tipoUbic || `Ubicación ${index + 1}`;

      // RFC o NumRegIdTrib requerido
      const rfc = ubicacion.rfc_remitente_destinatario || (ubicacion as any).rfcRemitenteDestinatario;
      const numRegIdTrib = (ubicacion as any).numRegIdTrib;
      if (!rfc && !numRegIdTrib) {
        errores.push(`${nombreUbic}: RFC o Núm. Reg. ID Tributaria requerido`);
      }

      // Nombre requerido
      const nombre = ubicacion.nombre_remitente_destinatario || (ubicacion as any).nombreRemitenteDestinatario;
      if (!nombre) {
        errores.push(`${nombreUbic}: Nombre del remitente/destinatario requerido`);
      }

      // Domicilio completo requerido
      const domicilio = ubicacion.domicilio || (ubicacion as any).domicilio;
      if (!domicilio) {
        errores.push(`${nombreUbic}: Domicilio requerido`);
      } else {
        if (!domicilio.codigoPostal || !(domicilio as any).codigo_postal) {
          errores.push(`${nombreUbic}: Código Postal requerido`);
        }
        if (!domicilio.estado) {
          errores.push(`${nombreUbic}: Estado requerido`);
        }
        if (!domicilio.municipio) {
          errores.push(`${nombreUbic}: Municipio requerido`);
        }
        if (!domicilio.calle) {
          errores.push(`${nombreUbic}: Calle requerida`);
        }
      }

      // Fecha/Hora requerida
      const fechaHora = ubicacion.fecha_hora_salida_llegada || (ubicacion as any).fechaHoraSalidaLlegada;
      if (!fechaHora) {
        advertencias.push(`${nombreUbic}: Fecha/hora de salida/llegada no especificada`);
      }
    });

    // Validar distancia (advertencia, no error)
    const destino = ubicaciones.find(u => 
      u.tipo_ubicacion === 'Destino' || (u as any).tipoUbicacion === 'Destino'
    );
    const distancia = destino?.distancia_recorrida || 
                      (destino as any)?.distanciaRecorrida || 
                      cartaPorteData.datosCalculoRuta?.distanciaTotal || 
                      0;

    if (distancia === 0) {
      advertencias.push('No se ha calculado la distancia - se usará 0 km');
    }
  }

  // 3. MERCANCÍAS (CRÍTICO)
  const mercancias = cartaPorteData.mercancias || [];
  if (mercancias.length === 0) {
    errores.push('Se requiere al menos una mercancía');
  } else {
    let pesoTotalMercancias = 0;

    mercancias.forEach((mercancia, index) => {
      if (!mercancia.descripcion) {
        errores.push(`Mercancía ${index + 1}: Descripción requerida`);
      }
      if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
        errores.push(`Mercancía ${index + 1}: Peso en Kg requerido`);
      } else {
        pesoTotalMercancias += mercancia.peso_kg;
      }
      if (!mercancia.bienes_transp) {
        errores.push(`Mercancía ${index + 1}: Clave de Producto/Servicio requerida`);
      }
      if (!mercancia.cantidad || mercancia.cantidad <= 0) {
        errores.push(`Mercancía ${index + 1}: Cantidad requerida`);
      }
      if (!mercancia.clave_unidad) {
        errores.push(`Mercancía ${index + 1}: Clave de Unidad requerida`);
      }

      // Validar material peligroso si aplica
      const materialPeligroso = (mercancia as any).materialPeligroso || (mercancia as any).material_peligroso;
      if (materialPeligroso === 'Sí' || materialPeligroso === true) {
        if (!mercancia.cve_material_peligroso && !(mercancia as any).cveMaterialPeligroso) {
          errores.push(`Mercancía ${index + 1}: Clave de Material Peligroso requerida`);
        }
      }
    });

    // Validar peso total vs capacidad vehicular
    if (cartaPorteData.autotransporte?.peso_bruto_vehicular) {
      const capacidadVehicular = cartaPorteData.autotransporte.peso_bruto_vehicular;
      if (pesoTotalMercancias > capacidadVehicular) {
        errores.push(
          `Peso total de mercancías (${pesoTotalMercancias} kg) excede la capacidad del vehículo (${capacidadVehicular} kg)`
        );
      }
      
      // Advertencia si la carga es muy baja
      const porcentajeCarga = (pesoTotalMercancias / capacidadVehicular) * 100;
      if (porcentajeCarga < 10) {
        advertencias.push(
          `Carga muy baja: ${porcentajeCarga.toFixed(1)}% de la capacidad vehicular`
        );
      }
    }
  }

  // 4. AUTOTRANSPORTE (CRÍTICO)
  if (!cartaPorteData.autotransporte) {
    errores.push('Datos de Autotransporte requeridos');
  } else {
    if (!cartaPorteData.autotransporte.placa_vm) {
      errores.push('Placa del vehículo requerida');
    }
    if (!cartaPorteData.autotransporte.config_vehicular) {
      errores.push('Configuración vehicular requerida');
    }
    if (!cartaPorteData.autotransporte.peso_bruto_vehicular || 
        cartaPorteData.autotransporte.peso_bruto_vehicular <= 0) {
      errores.push('Peso bruto vehicular requerido');
    }
    if (!cartaPorteData.autotransporte.anio_modelo_vm) {
      advertencias.push('Año del modelo del vehículo no especificado');
    }
    if (!cartaPorteData.autotransporte.perm_sct) {
      errores.push('Permiso SCT requerido');
    }
    if (!cartaPorteData.autotransporte.num_permiso_sct) {
      errores.push('Número de Permiso SCT requerido');
    }

    // Validar seguros
    const tieneSeguroRC = cartaPorteData.autotransporte.asegura_resp_civil;
    const tienePolizaRC = cartaPorteData.autotransporte.poliza_resp_civil;
    if (!tieneSeguroRC || !tienePolizaRC) {
      advertencias.push('Seguro de Responsabilidad Civil no completo');
    }

    const tieneSeguroMA = cartaPorteData.autotransporte.asegura_med_ambiente;
    const tienePolizaMA = cartaPorteData.autotransporte.poliza_med_ambiente;
    if (!tieneSeguroMA || !tienePolizaMA) {
      advertencias.push('Seguro de Medio Ambiente no completo');
    }
  }

  // 5. FIGURAS DE TRANSPORTE (CRÍTICO)
  const figuras = cartaPorteData.figuras || [];
  if (figuras.length === 0) {
    errores.push('Se requiere al menos una figura de transporte (operador)');
  } else {
    figuras.forEach((figura, index) => {
      if (!figura.nombre_figura) {
        errores.push(`Figura ${index + 1}: Nombre requerido`);
      }
      if (figura.tipo_figura === '01' && !figura.rfc_figura) {
        errores.push(`Figura ${index + 1}: RFC requerido para operador`);
      }
      if (!figura.num_licencia) {
        errores.push(`Figura ${index + 1}: Número de licencia requerido`);
      }
    });
  }

  const esValido = errores.length === 0;

  console.log('🔍 [VALIDACION] Resultado:', {
    esValido,
    errores: errores.length,
    advertencias: advertencias.length
  });

  if (errores.length > 0) {
    console.error('❌ [VALIDACION] Errores encontrados:', errores);
  }
  if (advertencias.length > 0) {
    console.warn('⚠️ [VALIDACION] Advertencias:', advertencias);
  }

  return {
    esValido,
    errores,
    advertencias
  };
}
