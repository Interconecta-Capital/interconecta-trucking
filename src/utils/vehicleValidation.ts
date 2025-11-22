
export interface VehicleValidationResult {
  esValido: boolean;
  errores: string[];
}

export class VehicleValidator {
  // Validar placa mexicana (formato ABC-1234 o ABC1234)
  static validarPlaca(placa: string): VehicleValidationResult {
    if (!placa) {
      return {
        esValido: false,
        errores: ['La placa es requerida']
      };
    }

    const placaNormalizada = placa.trim().toUpperCase().replace(/\s+/g, '');
    const errores: string[] = [];

    // Formato de placa mexicana: 3 letras + 3 números o 3 letras + guión + 4 números
    const formatoPlaca = /^[A-Z]{3}[-]?[0-9]{3,4}$/;
    
    if (!formatoPlaca.test(placaNormalizada)) {
      errores.push('Formato de placa no válido. Use el formato ABC-1234 o ABC1234');
    }

    // Verificar que no sean caracteres prohibidos
    if (placaNormalizada.includes('0') && placaNormalizada.includes('O')) {
      errores.push('La placa no puede contener tanto el número 0 como la letra O');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  // Validar año del modelo
  static validarAnioModelo(anio: number): VehicleValidationResult {
    const errores: string[] = [];
    const anioActual = new Date().getFullYear();

    if (!anio) {
      errores.push('El año del modelo es requerido');
    } else if (anio < 1990) {
      errores.push('El año del modelo debe ser mayor a 1990');
    } else if (anio > anioActual + 1) {
      errores.push(`El año del modelo no puede ser mayor a ${anioActual + 1}`);
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  // Validar número de permiso SCT
  static validarPermisoSCT(permiso: string): VehicleValidationResult {
    if (!permiso) {
      return {
        esValido: false,
        errores: ['El número de permiso SCT es requerido']
      };
    }

    const permisoNormalizado = permiso.trim().toUpperCase();
    const errores: string[] = [];

    // Formato: letras, números y guiones, mínimo 6 caracteres
    if (permisoNormalizado.length < 6) {
      errores.push('El número de permiso debe tener al menos 6 caracteres');
    }

    // Permitir letras, números y guiones
    if (!/^[A-Z0-9-]+$/.test(permisoNormalizado)) {
      errores.push('El número de permiso solo puede contener letras, números y guiones. Ejemplo: SCT-123456');
    }

    // Validar que no tenga guiones consecutivos
    if (/--/.test(permisoNormalizado)) {
      errores.push('El número de permiso no puede tener guiones consecutivos');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  // Validar póliza de seguro
  static validarPoliza(poliza: string): VehicleValidationResult {
    if (!poliza) {
      return {
        esValido: false,
        errores: ['El número de póliza es requerido']
      };
    }

    const polizaNormalizada = poliza.trim();
    const errores: string[] = [];

    if (polizaNormalizada.length < 5) {
      errores.push('El número de póliza debe tener al menos 5 caracteres');
    }

    if (polizaNormalizada.length > 50) {
      errores.push('El número de póliza no puede tener más de 50 caracteres');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  // Formatear placa
  static formatearPlaca(placa: string): string {
    const placaNormalizada = placa.trim().toUpperCase().replace(/\s+/g, '');
    
    // Si tiene 6 caracteres sin guión, agregar guión después de las 3 primeras letras
    if (placaNormalizada.length === 6 && !placaNormalizada.includes('-')) {
      return placaNormalizada.substring(0, 3) + '-' + placaNormalizada.substring(3);
    }
    
    return placaNormalizada;
  }
}
