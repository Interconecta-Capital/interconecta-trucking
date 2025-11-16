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
    mercancias.forEach((mercancia, index) => {
      if (!mercancia.descripcion) {
        errores.push(`Mercancía ${index + 1}: Descripción requerida`);
      }
      if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
        errores.push(`Mercancía ${index + 1}: Peso en Kg requerido`);
      }
      if (!mercancia.bienes_transp) {
        errores.push(`Mercancía ${index + 1}: Clave de Producto/Servicio requerida`);
      }
    });
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
