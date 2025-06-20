
import { ValidationResult31 } from './ValidationEngine31Enhanced';

interface RestriccionRuta {
  tipo: 'peso' | 'altura' | 'combustible' | 'material_peligroso' | 'horario';
  zonas: string[];
  limite: number;
  unidad: string;
  descripcion: string;
  alternativa?: string;
}

export class RutaRestriccionesValidator {
  private restricciones: RestriccionRuta[] = [
    {
      tipo: 'peso',
      zonas: ['CDMX Centro', 'Guadalajara Centro', 'Monterrey Centro'],
      limite: 8500,
      unidad: 'kg',
      descripcion: 'Restricción de peso en zonas metropolitanas',
      alternativa: 'Use libramientos o periféricos'
    },
    {
      tipo: 'altura',
      zonas: ['Túnel de la Marquesa', 'Puente Baluarte', 'Paso Express CDMX'],
      limite: 4.2,
      unidad: 'm',
      descripcion: 'Restricción de altura en túneles y puentes',
      alternativa: 'Ruta alternativa por carreteras federales'
    },
    {
      tipo: 'combustible',
      zonas: ['CDMX', 'Área Metropolitana de Guadalajara'],
      limite: 0,
      unidad: '',
      descripcion: 'Restricción para transporte de combustibles',
      alternativa: 'Horarios específicos 22:00-06:00'
    },
    {
      tipo: 'horario',
      zonas: ['CDMX Centro Histórico', 'Polanco', 'Santa Fe'],
      limite: 22,
      unidad: 'hora',
      descripcion: 'Restricción de carga nocturna',
      alternativa: 'Programe entregas entre 22:00 y 06:00'
    }
  ];

  async validateRuta(
    ubicaciones: any[],
    autotransporte: any,
    mercancias: any[]
  ): Promise<ValidationResult31[]> {
    const resultados: ValidationResult31[] = [];

    if (!ubicaciones || ubicaciones.length < 2) {
      return resultados;
    }

    console.log('🛣️ Validando restricciones de ruta...');

    // Calcular métricas del vehículo
    const pesoTotal = this.calcularPesoTotal(autotransporte, mercancias);
    const alturaVehiculo = this.calcularAlturaVehiculo(autotransporte);
    const tieneMaterialPeligroso = mercancias.some(m => m.material_peligroso);
    const tieneCombustible = this.detectarCombustible(mercancias);

    // Validar cada tramo de la ruta
    for (let i = 0; i < ubicaciones.length - 1; i++) {
      const origen = ubicaciones[i];
      const destino = ubicaciones[i + 1];
      
      await this.validateTramo(
        origen,
        destino,
        { pesoTotal, alturaVehiculo, tieneMaterialPeligroso, tieneCombustible },
        resultados
      );
    }

    // Validaciones específicas de distancia
    await this.validateDistanciaTotal(ubicaciones, autotransporte, resultados);

    return resultados;
  }

  private async validateTramo(
    origen: any,
    destino: any,
    vehiculoInfo: any,
    resultados: ValidationResult31[]
  ): Promise<void> {
    const zonaOrigen = this.identificarZona(origen);
    const zonaDestino = this.identificarZona(destino);
    const zonasRuta = [zonaOrigen, zonaDestino].filter(z => z);

    for (const restriccion of this.restricciones) {
      const zonaAfectada = restriccion.zonas.find(zona => 
        zonasRuta.some(zr => zr.includes(zona))
      );

      if (zonaAfectada) {
        await this.evaluarRestriccion(restriccion, vehiculoInfo, zonaAfectada, resultados);
      }
    }
  }

  private async evaluarRestriccion(
    restriccion: RestriccionRuta,
    vehiculoInfo: any,
    zona: string,
    resultados: ValidationResult31[]
  ): Promise<void> {
    let violacion = false;
    let valorActual = 0;

    switch (restriccion.tipo) {
      case 'peso':
        valorActual = vehiculoInfo.pesoTotal;
        violacion = valorActual > restriccion.limite;
        break;
      
      case 'altura':
        valorActual = vehiculoInfo.alturaVehiculo;
        violacion = valorActual > restriccion.limite;
        break;
      
      case 'combustible':
        violacion = vehiculoInfo.tieneCombustible;
        break;
      
      case 'material_peligroso':
        violacion = vehiculoInfo.tieneMaterialPeligroso;
        break;
      
      case 'horario':
        // Esto debería validarse con la hora programada del viaje
        violacion = false; // Por ahora
        break;
    }

    if (violacion) {
      const nivel = restriccion.tipo === 'altura' || restriccion.tipo === 'peso' ? 'bloqueante' : 'advertencia';
      
      resultados.push({
        isValid: false,
        level: nivel,
        category: 'ruta_restringida',
        title: `Restricción de ${restriccion.tipo.toUpperCase()} en ${zona}`,
        message: `${restriccion.descripcion}. Valor actual: ${valorActual} ${restriccion.unidad}, límite: ${restriccion.limite} ${restriccion.unidad}`,
        solution: restriccion.alternativa || 'Considere ruta alternativa',
        autoFix: {
          field: 'ruta_alternativa',
          value: true,
          description: 'Buscar ruta alternativa automáticamente'
        }
      });
    }
  }

  private calcularPesoTotal(autotransporte: any, mercancias: any[]): number {
    const pesoMercancias = mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
    const pesoVehiculo = autotransporte?.peso_bruto_vehicular || 3500; // Peso promedio vehículo
    return pesoMercancias + pesoVehiculo;
  }

  private calcularAlturaVehiculo(autotransporte: any): number {
    // Altura típica por tipo de carrocería
    const alturasCarroceria: { [key: string]: number } = {
      'C1': 2.5, // Cerrado
      'C2': 2.8, // Cerrado grande
      'T1': 2.2, // Toldo
      'T2': 2.5  // Toldo grande
    };

    const tipoCarroceria = autotransporte?.tipo_carroceria || 'C1';
    return alturasCarroceria[tipoCarroceria] || 2.5;
  }

  private detectarCombustible(mercancias: any[]): boolean {
    return mercancias.some(m => {
      const desc = (m.descripcion || '').toLowerCase();
      return desc.includes('gasolina') || desc.includes('diesel') || 
             desc.includes('combustible') || desc.includes('gas');
    });
  }

  private identificarZona(ubicacion: any): string {
    const cp = ubicacion.domicilio?.codigo_postal || '';
    const estado = ubicacion.domicilio?.estado || '';
    
    // Mapeo básico de códigos postales a zonas
    if (cp.startsWith('06') || cp.startsWith('01') || estado.includes('CDMX')) {
      return 'CDMX Centro';
    }
    if (cp.startsWith('44') || cp.startsWith('45') || estado.includes('Jalisco')) {
      return 'Guadalajara Centro';
    }
    if (cp.startsWith('64') || cp.startsWith('66') || estado.includes('Nuevo León')) {
      return 'Monterrey Centro';
    }
    
    return estado;
  }

  private async validateDistanciaTotal(
    ubicaciones: any[],
    autotransporte: any,
    resultados: ValidationResult31[]
  ): Promise<void> {
    const distanciaTotal = ubicaciones.reduce((sum, ubicacion) => 
      sum + (ubicacion.distancia_recorrida || 0), 0
    );

    // Validar autonomía del vehículo
    const autonomiaEstimada = this.calcularAutonomia(autotransporte);
    
    if (distanciaTotal > autonomiaEstimada) {
      resultados.push({
        isValid: false,
        level: 'advertencia',
        category: 'ruta_restringida',
        title: 'Distancia Excede Autonomía',
        message: `La distancia total (${distanciaTotal} km) puede exceder la autonomía del vehículo (${autonomiaEstimada} km)`,
        solution: 'Planifique paradas para combustible en la ruta'
      });
    }
  }

  private calcularAutonomia(autotransporte: any): number {
    // Autonomía estimada por tipo de vehículo
    const configVehicular = autotransporte?.config_vehicular || 'C2';
    const autonomiaBase: { [key: string]: number } = {
      'C2': 800,   // Camión 2 ejes
      'C3': 600,   // Camión 3 ejes
      'T3S2': 1000 // Tractocamión
    };

    return autonomiaBase[configVehicular] || 700;
  }
}
