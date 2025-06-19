
import { CatalogosSATService } from "@/services/catalogosSAT";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export class SATValidation {
  // Validar RFC (básico)
  static validarRFC(rfc: string): ValidationResult {
    const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    
    if (!rfc) {
      return { isValid: false, message: "RFC es requerido" };
    }
    
    if (!rfcRegex.test(rfc)) {
      return { isValid: false, message: "Formato de RFC inválido" };
    }
    
    return { isValid: true };
  }

  // Validar código postal
  static validarCodigoPostal(cp: string): ValidationResult {
    const cpRegex = /^[0-9]{5}$/;
    
    if (!cp) {
      return { isValid: false, message: "Código postal es requerido" };
    }
    
    if (!cpRegex.test(cp)) {
      return { isValid: false, message: "Código postal debe tener 5 dígitos" };
    }
    
    return { isValid: true };
  }

  // *** VALIDACIÓN MEJORADA: Productos del catálogo CP ***
  static async validarProductoServicioCP(clave: string): Promise<ValidationResult> {
    if (!clave) {
      return { isValid: false, message: "Clave de producto/servicio es requerida" };
    }

    try {
      const existe = await CatalogosSATService.existeProductoServicio(clave);
      if (!existe) {
        return { 
          isValid: false, 
          message: "Clave no válida en catálogo c_ClaveProdServCP del SAT" 
        };
      }
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        message: "Error al validar la clave con el catálogo SAT" 
      };
    }
  }

  // Validar cantidad y peso para mercancías
  static validarCantidadPeso(cantidad?: number, peso?: number): ValidationResult {
    if (cantidad !== undefined && cantidad <= 0) {
      return { isValid: false, message: "La cantidad debe ser mayor a 0" };
    }
    
    if (peso !== undefined && peso <= 0) {
      return { isValid: false, message: "El peso debe ser mayor a 0" };
    }
    
    return { isValid: true };
  }

  // *** VALIDACIÓN MEJORADA: Datos de autotransporte con peso obligatorio ***
  static validarAutotransporte(data: {
    placa?: string;
    anioModelo?: number;
    perm_sct?: string;
    numPermiso?: string;
    pesoBrutoVehicular?: number;
  }): ValidationResult {
    const { placa, anioModelo, perm_sct, numPermiso, pesoBrutoVehicular } = data;
    
    if (placa && !/^[A-Z0-9-]{5,10}$/.test(placa)) {
      return { isValid: false, message: "Formato de placa inválido" };
    }
    
    const currentYear = new Date().getFullYear();
    if (anioModelo && (anioModelo < 1990 || anioModelo > currentYear + 1)) {
      return { isValid: false, message: "Año del modelo fuera del rango válido" };
    }
    
    if (perm_sct && !numPermiso) {
      return { isValid: false, message: "Número de permiso SCT es requerido cuando se especifica el tipo" };
    }

    // *** VALIDACIÓN CRÍTICA: Peso bruto vehicular obligatorio ***
    if (!pesoBrutoVehicular || pesoBrutoVehicular <= 0) {
      return { isValid: false, message: "Peso bruto vehicular es obligatorio según normativa 3.1" };
    }
    
    return { isValid: true };
  }

  // *** VALIDACIÓN MEJORADA: Ubicación con distancia obligatoria ***
  static validarUbicacion(data: {
    tipoUbicacion?: string;
    codigoPostal?: string;
    fechaHora?: Date | string;
    rfc?: string;
    distanciaRecorrida?: number;
  }): ValidationResult {
    const { tipoUbicacion, codigoPostal, fechaHora, rfc, distanciaRecorrida } = data;
    
    if (!tipoUbicacion) {
      return { isValid: false, message: "Tipo de ubicación es requerido" };
    }
    
    if (codigoPostal) {
      const cpValidation = this.validarCodigoPostal(codigoPostal);
      if (!cpValidation.isValid) {
        return cpValidation;
      }
    }

    // *** VALIDACIÓN CRÍTICA: Distancia obligatoria para destinos ***
    if ((tipoUbicacion === 'Destino' || tipoUbicacion === 'Punto Intermedio') && 
        (!distanciaRecorrida || distanciaRecorrida <= 0)) {
      return { 
        isValid: false, 
        message: "Distancia recorrida es obligatoria para ubicaciones de destino según normativa 3.1" 
      };
    }
    
    if (fechaHora) {
      const fecha = new Date(fechaHora);
      const ahora = new Date();
      
      if (tipoUbicacion === 'Origen' && fecha > ahora) {
        return { isValid: false, message: "La fecha de salida no puede ser futura" };
      }
    }
    
    if (rfc) {
      const rfcValidation = this.validarRFC(rfc);
      if (!rfcValidation.isValid) {
        return rfcValidation;
      }
    }
    
    return { isValid: true };
  }

  // *** VALIDACIÓN MEJORADA: Carta Porte completa con nuevas reglas ***
  static async validarCartaPorteCompleta(data: any): Promise<ValidationResult[]> {
    const errores: ValidationResult[] = [];
    
    // Validar datos básicos
    if (!data.rfcEmisor) {
      errores.push({ isValid: false, message: "RFC del emisor es requerido" });
    } else {
      const rfcValidation = this.validarRFC(data.rfcEmisor);
      if (!rfcValidation.isValid) {
        errores.push(rfcValidation);
      }
    }
    
    if (!data.rfcReceptor) {
      errores.push({ isValid: false, message: "RFC del receptor es requerido" });
    } else {
      const rfcValidation = this.validarRFC(data.rfcReceptor);
      if (!rfcValidation.isValid) {
        errores.push(rfcValidation);
      }
    }

    // *** VALIDACIÓN: Regímenes aduaneros para transporte internacional ***
    if (data.transporteInternacional && (!data.regimenesAduaneros || data.regimenesAduaneros.length === 0)) {
      errores.push({ 
        isValid: false, 
        message: "Para transporte internacional debe especificar al menos un régimen aduanero" 
      });
    }
    
    // Validar que tenga al menos una ubicación origen y destino
    const ubicaciones = data.ubicaciones || [];
    const tieneOrigen = ubicaciones.some((u: any) => u.tipo_ubicacion === 'Origen');
    const tieneDestino = ubicaciones.some((u: any) => u.tipo_ubicacion === 'Destino');
    
    if (!tieneOrigen) {
      errores.push({ isValid: false, message: "Debe especificar al menos una ubicación de origen" });
    }
    
    if (!tieneDestino) {
      errores.push({ isValid: false, message: "Debe especificar al menos una ubicación de destino" });
    }

    // *** VALIDACIÓN: Distancia en destinos ***
    const destinosSinDistancia = ubicaciones.filter((u: any) => 
      (u.tipo_ubicacion === 'Destino' || u.tipo_ubicacion === 'Punto Intermedio') &&
      (!u.distancia_recorrida || u.distancia_recorrida <= 0)
    );
    
    if (destinosSinDistancia.length > 0) {
      errores.push({ 
        isValid: false, 
        message: "Todas las ubicaciones de destino deben tener distancia recorrida según normativa 3.1" 
      });
    }
    
    // Validar que tenga al menos una mercancía
    if (!data.mercancias || data.mercancias.length === 0) {
      errores.push({ isValid: false, message: "Debe especificar al menos una mercancía" });
    }

    // *** VALIDACIÓN: Productos del catálogo CP ***
    for (const mercancia of data.mercancias || []) {
      if (mercancia.bienes_transp) {
        const validacion = await this.validarProductoServicioCP(mercancia.bienes_transp);
        if (!validacion.isValid) {
          errores.push({ 
            isValid: false, 
            message: `Mercancía "${mercancia.descripcion}": ${validacion.message}` 
          });
        }
      }
    }
    
    // *** VALIDACIÓN: Autotransporte con peso obligatorio ***
    if (!data.autotransporte) {
      errores.push({ isValid: false, message: "Información de autotransporte es requerida" });
    } else {
      const validacionAuto = this.validarAutotransporte({
        placa: data.autotransporte.placa_vm,
        anioModelo: data.autotransporte.anio_modelo_vm,
        perm_sct: data.autotransporte.perm_sct,
        numPermiso: data.autotransporte.num_permiso_sct,
        pesoBrutoVehicular: data.autotransporte.peso_bruto_vehicular
      });
      
      if (!validacionAuto.isValid) {
        errores.push(validacionAuto);
      }
    }
    
    // Validar que tenga al menos una figura de transporte
    if (!data.figuras || data.figuras.length === 0) {
      errores.push({ isValid: false, message: "Debe especificar al menos una figura de transporte" });
    }
    
    return errores;
  }
}
