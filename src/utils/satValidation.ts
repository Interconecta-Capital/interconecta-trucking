
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

  // Validar datos de autotransporte
  static validarAutotransporte(data: {
    placa?: string;
    anioModelo?: number;
    perm_sct?: string;
    numPermiso?: string;
  }): ValidationResult {
    const { placa, anioModelo, perm_sct, numPermiso } = data;
    
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
    
    return { isValid: true };
  }

  // Validar figura de transporte
  static validarFiguraTransporte(data: {
    tipoFigura?: string;
    rfc?: string;
    nombre?: string;
    numLicencia?: string;
  }): ValidationResult {
    const { tipoFigura, rfc, nombre, numLicencia } = data;
    
    if (tipoFigura === '01' && !numLicencia) { // Operador
      return { isValid: false, message: "Número de licencia es requerido para operadores" };
    }
    
    if (rfc) {
      const rfcValidation = this.validarRFC(rfc);
      if (!rfcValidation.isValid) {
        return rfcValidation;
      }
    }
    
    if (!nombre || nombre.trim().length < 2) {
      return { isValid: false, message: "Nombre de la figura es requerido" };
    }
    
    return { isValid: true };
  }

  // Validar ubicación
  static validarUbicacion(data: {
    tipoUbicacion?: string;
    codigoPostal?: string;
    fechaHora?: Date | string;
    rfc?: string;
  }): ValidationResult {
    const { tipoUbicacion, codigoPostal, fechaHora, rfc } = data;
    
    if (!tipoUbicacion) {
      return { isValid: false, message: "Tipo de ubicación es requerido" };
    }
    
    if (codigoPostal) {
      const cpValidation = this.validarCodigoPostal(codigoPostal);
      if (!cpValidation.isValid) {
        return cpValidation;
      }
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

  // Validar datos completos de Carta Porte
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
    
    // Validar que tenga al menos una ubicación origen y destino
    const ubicaciones = data.ubicaciones || [];
    const tieneOrigen = ubicaciones.some((u: any) => u.tipoUbicacion === 'Origen');
    const tieneDestino = ubicaciones.some((u: any) => u.tipoUbicacion === 'Destino');
    
    if (!tieneOrigen) {
      errores.push({ isValid: false, message: "Debe especificar al menos una ubicación de origen" });
    }
    
    if (!tieneDestino) {
      errores.push({ isValid: false, message: "Debe especificar al menos una ubicación de destino" });
    }
    
    // Validar que tenga al menos una mercancía
    if (!data.mercancias || data.mercancias.length === 0) {
      errores.push({ isValid: false, message: "Debe especificar al menos una mercancía" });
    }
    
    // Validar que tenga información de autotransporte
    if (!data.autotransporte) {
      errores.push({ isValid: false, message: "Información de autotransporte es requerida" });
    }
    
    // Validar que tenga al menos una figura de transporte
    if (!data.figuras || data.figuras.length === 0) {
      errores.push({ isValid: false, message: "Debe especificar al menos una figura de transporte" });
    }
    
    return errores;
  }
}
