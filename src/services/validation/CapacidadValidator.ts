
import { ValidationResult31 } from './ValidationEngine31Enhanced';

interface EspecificacionVehiculo {
  configVehicular: string;
  pesoMaximo: number;
  volumenMaximo: number;
  longitudMaxima: number;
  temperaturaControlada: boolean;
  aptoPeligrosos: boolean;
}

export class CapacidadValidator {
  private especificaciones: EspecificacionVehiculo[] = [
    {
      configVehicular: 'C2',
      pesoMaximo: 8500,
      volumenMaximo: 25,
      longitudMaxima: 8.5,
      temperaturaControlada: false,
      aptoPeligrosos: false
    },
    {
      configVehicular: 'C3',
      pesoMaximo: 16000,
      volumenMaximo: 45,
      longitudMaxima: 12,
      temperaturaControlada: false,
      aptoPeligrosos: false
    },
    {
      configVehicular: 'T3S2',
      pesoMaximo: 35000,
      volumenMaximo: 80,
      longitudMaxima: 16.5,
      temperaturaControlada: true,
      aptoPeligrosos: true
    }
  ];

  async validateCapacidad(
    autotransporte: any,
    mercancias: any[]
  ): Promise<ValidationResult31[]> {
    const resultados: ValidationResult31[] = [];

    if (!autotransporte || !mercancias.length) {
      return resultados;
    }

    console.log('⚖️ Validando capacidades específicas...');

    const especificacion = this.obtenerEspecificacion(autotransporte);
    if (!especificacion) {
      resultados.push({
        isValid: false,
        level: 'advertencia',
        category: 'capacidad',
        title: 'Configuración Vehicular Desconocida',
        message: `No se encontraron especificaciones para la configuración ${autotransporte.config_vehicular}`,
        solution: 'Verifique la configuración vehicular seleccionada'
      });
      return resultados;
    }

    // Validaciones de peso
    await this.validatePeso(especificacion, mercancias, autotransporte, resultados);

    // Validaciones de volumen
    await this.validateVolumen(especificacion, mercancias, resultados);

    // Validaciones de compatibilidad
    await this.validateCompatibilidad(especificacion, mercancias, resultados);

    // Validaciones de condiciones especiales
    await this.validateCondicionesEspeciales(especificacion, mercancias, resultados);

    return resultados;
  }

  private async validatePeso(
    especificacion: EspecificacionVehiculo,
    mercancias: any[],
    autotransporte: any,
    resultados: ValidationResult31[]
  ): Promise<void> {
    const pesoMercancias = mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
    const pesoVehiculo = autotransporte.peso_bruto_vehicular || 3500;
    const pesoTotal = pesoMercancias + pesoVehiculo;

    if (pesoTotal > especificacion.pesoMaximo) {
      resultados.push({
        isValid: false,
        level: 'bloqueante',
        category: 'capacidad',
        title: 'Exceso de Peso',
        message: `Peso total (${pesoTotal} kg) excede la capacidad máxima del vehículo (${especificacion.pesoMaximo} kg)`,
        solution: 'Reduzca la carga o use un vehículo de mayor capacidad',
        autoFix: {
          field: 'config_vehicular',
          value: this.sugerirVehiculoMayorCapacidad(especificacion.configVehicular),
          description: 'Sugerir vehículo de mayor capacidad'
        }
      });
    }

    // Advertencia a 90% de capacidad
    const porcentajeUso = (pesoTotal / especificacion.pesoMaximo) * 100;
    if (porcentajeUso > 90 && porcentajeUso <= 100) {
      resultados.push({
        isValid: true,
        level: 'advertencia',
        category: 'capacidad',
        title: 'Cerca del Límite de Peso',
        message: `Uso del ${porcentajeUso.toFixed(1)}% de la capacidad de peso`,
        solution: 'Considere distribuir la carga en múltiples viajes'
      });
    }
  }

  private async validateVolumen(
    especificacion: EspecificacionVehiculo,
    mercancias: any[],
    resultados: ValidationResult31[]
  ): Promise<void> {
    let volumenTotal = 0;

    for (const mercancia of mercancias) {
      const dimensiones = mercancia.dimensiones;
      if (dimensiones?.largo && dimensiones?.ancho && dimensiones?.alto) {
        const volumenMercancia = dimensiones.largo * dimensiones.ancho * dimensiones.alto;
        volumenTotal += volumenMercancia * (mercancia.cantidad || 1);
      } else {
        // Estimación basada en peso para mercancías sin dimensiones
        const pesoKg = mercancia.peso_kg || 0;
        const densidadEstimada = this.estimarDensidad(mercancia.descripcion || '');
        volumenTotal += pesoKg / densidadEstimada;
      }
    }

    if (volumenTotal > especificacion.volumenMaximo) {
      resultados.push({
        isValid: false,
        level: 'bloqueante',
        category: 'capacidad',
        title: 'Exceso de Volumen',
        message: `Volumen total (${volumenTotal.toFixed(2)} m³) excede la capacidad del vehículo (${especificacion.volumenMaximo} m³)`,
        solution: 'Reduzca el volumen de carga o use un vehículo más grande'
      });
    }
  }

  private async validateCompatibilidad(
    especificacion: EspecificacionVehiculo,
    mercancias: any[],
    resultados: ValidationResult31[]
  ): Promise<void> {
    // Validar materiales peligrosos
    const tieneMaterialPeligroso = mercancias.some(m => m.material_peligroso);
    
    if (tieneMaterialPeligroso && !especificacion.aptoPeligrosos) {
      resultados.push({
        isValid: false,
        level: 'bloqueante',
        category: 'capacidad',
        title: 'Vehículo No Apto para Material Peligroso',
        message: 'El vehículo actual no está certificado para transporte de materiales peligrosos',
        solution: 'Use un vehículo certificado para materiales peligrosos',
        autoFix: {
          field: 'config_vehicular',
          value: 'T3S2',
          description: 'Cambiar a vehículo apto para materiales peligrosos'
        }
      });
    }

    // Validar incompatibilidades entre mercancías
    await this.validateIncompatibilidades(mercancias, resultados);
  }

  private async validateIncompatibilidades(
    mercancias: any[],
    resultados: ValidationResult31[]
  ): Promise<void> {
    // Incompatibilidades conocidas
    const incompatibilidades = [
      {
        tipo1: ['químico', 'ácido'],
        tipo2: ['alimento', 'comestible'],
        mensaje: 'Productos químicos no deben transportarse con alimentos'
      },
      {
        tipo1: ['explosivo', 'inflamable'],
        tipo2: ['electrónico', 'batería'],
        mensaje: 'Materiales explosivos incompatibles con dispositivos eléctricos'
      }
    ];

    for (const incomp of incompatibilidades) {
      const tieneT1 = mercancias.some(m => 
        incomp.tipo1.some(t => (m.descripcion || '').toLowerCase().includes(t))
      );
      const tieneT2 = mercancias.some(m => 
        incomp.tipo2.some(t => (m.descripcion || '').toLowerCase().includes(t))
      );

      if (tieneT1 && tieneT2) {
        resultados.push({
          isValid: false,
          level: 'bloqueante',
          category: 'capacidad',
          title: 'Incompatibilidad de Mercancías',
          message: incomp.mensaje,
          solution: 'Transporte estas mercancías en viajes separados'
        });
      }
    }
  }

  private async validateCondicionesEspeciales(
    especificacion: EspecificacionVehiculo,
    mercancias: any[],
    resultados: ValidationResult31[]
  ): Promise<void> {
    // Validar temperatura controlada
    const requiereRefrigeracion = mercancias.some(m => {
      const desc = (m.descripcion || '').toLowerCase();
      return desc.includes('refrigerad') || desc.includes('congelad') || 
             desc.includes('farmacéutic') || desc.includes('vacuna');
    });

    if (requiereRefrigeracion && !especificacion.temperaturaControlada) {
      resultados.push({
        isValid: false,
        level: 'advertencia',
        category: 'capacidad',
        title: 'Requiere Temperatura Controlada',
        message: 'Algunas mercancías requieren temperatura controlada',
        solution: 'Use un vehículo con sistema de refrigeración',
        autoFix: {
          field: 'config_vehicular',
          value: 'T3S2',
          description: 'Cambiar a vehículo con temperatura controlada'
        }
      });
    }

    // Validar mercancías frágiles
    const esFragil = mercancias.some(m => {
      const desc = (m.descripcion || '').toLowerCase();
      return desc.includes('frágil') || desc.includes('cristal') || 
             desc.includes('vidrio') || desc.includes('cerámica');
    });

    if (esFragil) {
      resultados.push({
        isValid: true,
        level: 'informacion',
        category: 'capacidad',
        title: 'Mercancía Frágil Detectada',
        message: 'Se recomienda embalaje especial y manejo cuidadoso',
        solution: 'Verifique que el embalaje sea apropiado para mercancía frágil'
      });
    }
  }

  private obtenerEspecificacion(autotransporte: any): EspecificacionVehiculo | null {
    const configVehicular = autotransporte.config_vehicular;
    return this.especificaciones.find(e => e.configVehicular === configVehicular) || null;
  }

  private estimarDensidad(descripcion: string): number {
    const desc = descripcion.toLowerCase();
    
    if (desc.includes('líquido') || desc.includes('aceite')) return 800;
    if (desc.includes('metal')) return 2000;
    if (desc.includes('madera')) return 600;
    if (desc.includes('papel')) return 400;
    if (desc.includes('textil')) return 300;
    
    return 500; // Densidad promedio
  }

  private sugerirVehiculoMayorCapacidad(configActual: string): string {
    const jerarquia = ['C2', 'C3', 'T3S2', 'T3S3'];
    const indiceActual = jerarquia.indexOf(configActual);
    
    if (indiceActual < jerarquia.length - 1) {
      return jerarquia[indiceActual + 1];
    }
    
    return 'T3S3'; // Máxima capacidad
  }
}
