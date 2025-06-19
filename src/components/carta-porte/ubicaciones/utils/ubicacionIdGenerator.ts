
import { UbicacionCompleta } from '@/types/cartaPorte';

export class UbicacionIdGenerator {
  /**
   * Genera un ID automático para una ubicación basado en su tipo
   */
  static generateAutoId(
    tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio',
    ubicacionesExistentes: UbicacionCompleta[]
  ): string {
    const prefijos = {
      'Origen': 'OR',
      'Destino': 'DE', 
      'Paso Intermedio': 'PI'
    };

    const prefijo = prefijos[tipoUbicacion];
    
    // Obtener IDs existentes del mismo tipo
    const idsExistentes = ubicacionesExistentes
      .filter(u => u.tipo_ubicacion === tipoUbicacion)
      .map(u => u.id_ubicacion)
      .filter(id => id && id.startsWith(prefijo))
      .map(id => {
        const numero = parseInt(id?.substring(2) || '0', 10);
        return isNaN(numero) ? 0 : numero;
      });

    // Encontrar el siguiente número disponible
    const siguienteNumero = idsExistentes.length > 0 
      ? Math.max(...idsExistentes) + 1 
      : 1;

    return `${prefijo}${siguienteNumero.toString().padStart(6, '0')}`;
  }

  /**
   * Valida que un ID manual tenga el formato correcto
   */
  static validateManualId(
    id: string,
    tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio'
  ): { valido: boolean; mensaje?: string } {
    if (!id || id.trim() === '') {
      return { valido: false, mensaje: 'El ID es requerido' };
    }

    const prefijos = {
      'Origen': 'OR',
      'Destino': 'DE',
      'Paso Intermedio': 'PI'
    };

    const prefijoEsperado = prefijos[tipoUbicacion];
    
    // Validar formato general (2 letras + 6 dígitos)
    const formatoValido = /^[A-Z]{2}\d{6}$/.test(id);
    if (!formatoValido) {
      return { 
        valido: false, 
        mensaje: 'El ID debe tener formato: 2 letras + 6 dígitos (ej: OR000001)' 
      };
    }

    // Validar que el prefijo corresponda al tipo
    if (!id.startsWith(prefijoEsperado)) {
      return { 
        valido: false, 
        mensaje: `Para ${tipoUbicacion} el ID debe comenzar con ${prefijoEsperado}` 
      };
    }

    return { valido: true };
  }

  /**
   * Verifica si un ID ya existe en la lista de ubicaciones
   */
  static isIdDuplicated(
    id: string,
    ubicacionesExistentes: UbicacionCompleta[],
    excludeId?: string
  ): boolean {
    return ubicacionesExistentes.some(u => 
      u.id_ubicacion === id && u.id !== excludeId
    );
  }

  /**
   * Genera sugerencias de ID automático
   */
  static getSuggestions(
    tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio',
    ubicacionesExistentes: UbicacionCompleta[]
  ): string[] {
    const suggestions = [];
    
    // ID automático sugerido
    const autoId = this.generateAutoId(tipoUbicacion, ubicacionesExistentes);
    suggestions.push(autoId);

    // Algunas alternativas
    const prefijos = {
      'Origen': 'OR',
      'Destino': 'DE',
      'Paso Intermedio': 'PI'
    };
    
    const prefijo = prefijos[tipoUbicacion];
    for (let i = 1; i <= 3; i++) {
      const alternativa = `${prefijo}${(parseInt(autoId.substring(2)) + i).toString().padStart(6, '0')}`;
      if (!this.isIdDuplicated(alternativa, ubicacionesExistentes)) {
        suggestions.push(alternativa);
      }
    }

    return suggestions;
  }
}
