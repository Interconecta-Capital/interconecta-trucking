
export interface TrackingEvent {
  id: string;
  cartaPorteId: string;
  evento: string;
  descripcion: string;
  timestamp: string;
  ubicacion?: string;
  coordenadas?: { lat: number; lng: number };
  metadata?: Record<string, any>;
  automatico: boolean;
  uuidFiscal?: string;
}

export interface TrackingStatus {
  status: 'borrador' | 'xml_generado' | 'timbrado' | 'en_transito' | 'entregado' | 'cancelado';
  progreso: number;
  ultimoEvento?: TrackingEvent;
  proximoEvento?: string;
}

export class TrackingEngine {
  private static readonly STATUS_WORKFLOW = {
    borrador: { progreso: 10, siguiente: 'xml_generado' },
    xml_generado: { progreso: 30, siguiente: 'timbrado' },
    timbrado: { progreso: 50, siguiente: 'en_transito' },
    en_transito: { progreso: 80, siguiente: 'entregado' },
    entregado: { progreso: 100, siguiente: null },
    cancelado: { progreso: 0, siguiente: null }
  };

  static calcularStatus(eventos: TrackingEvent[]): TrackingStatus {
    if (!eventos.length) {
      return {
        status: 'borrador',
        progreso: 10,
        proximoEvento: 'Generar XML'
      };
    }

    // Ordenar eventos por timestamp
    const eventosOrdenados = eventos.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const ultimoEvento = eventosOrdenados[0];
    let status = this.mapEventoToStatus(ultimoEvento.evento);
    
    const workflowInfo = this.STATUS_WORKFLOW[status];
    
    return {
      status,
      progreso: workflowInfo.progreso,
      ultimoEvento,
      proximoEvento: workflowInfo.siguiente ? this.getProximoEventoDescripcion(workflowInfo.siguiente) : undefined
    };
  }

  private static mapEventoToStatus(evento: string): TrackingStatus['status'] {
    const mappings: Record<string, TrackingStatus['status']> = {
      'creado': 'borrador',
      'xml_generado': 'xml_generado',
      'timbrado': 'timbrado',
      'iniciado': 'en_transito',
      'en_ruta': 'en_transito',
      'entregado': 'entregado',
      'cancelado': 'cancelado'
    };

    return mappings[evento] || 'borrador';
  }

  private static getProximoEventoDescripcion(status: string): string {
    const descripciones: Record<string, string> = {
      'xml_generado': 'Generar XML',
      'timbrado': 'Timbrar documento',
      'en_transito': 'Iniciar transporte',
      'entregado': 'Confirmar entrega'
    };

    return descripciones[status] || 'Próximo paso';
  }

  static generarEventosAutomaticos(cartaPorteData: any): TrackingEvent[] {
    const eventos: TrackingEvent[] = [];
    const ahora = new Date().toISOString();

    // Evento de creación
    eventos.push({
      id: `auto-${Date.now()}-1`,
      cartaPorteId: cartaPorteData.cartaPorteId || '',
      evento: 'creado',
      descripcion: 'Carta Porte creada en el sistema',
      timestamp: ahora,
      automatico: true,
      metadata: {
        rfcEmisor: cartaPorteData.rfcEmisor,
        rfcReceptor: cartaPorteData.rfcReceptor
      }
    });

    // Eventos basados en datos completados
    if (cartaPorteData.xmlGenerado) {
      eventos.push({
        id: `auto-${Date.now()}-2`,
        cartaPorteId: cartaPorteData.cartaPorteId || '',
        evento: 'xml_generado',
        descripcion: 'XML generado según especificaciones SAT',
        timestamp: ahora,
        automatico: true
      });
    }

    if (cartaPorteData.uuid_fiscal) {
      eventos.push({
        id: `auto-${Date.now()}-3`,
        cartaPorteId: cartaPorteData.cartaPorteId || '',
        evento: 'timbrado',
        descripcion: 'Documento timbrado exitosamente',
        timestamp: ahora,
        automatico: true,
        uuidFiscal: cartaPorteData.uuid_fiscal
      });
    }

    return eventos;
  }

  static async estimarTiempoEntrega(
    origen: string, 
    destino: string, 
    tipoTransporte: string = 'terrestre'
  ): Promise<{ horas: number; fecha: string }> {
    // Estimación básica - en producción esto podría usar APIs de mapas reales
    const distanciaEstimada = this.calcularDistanciaEstimada(origen, destino);
    const velocidadPromedio = tipoTransporte === 'terrestre' ? 80 : 500; // km/h
    
    const horasViaje = Math.ceil(distanciaEstimada / velocidadPromedio);
    const horasConDescansos = horasViaje + Math.floor(horasViaje / 8) * 2; // Descansos cada 8 horas
    
    const fechaEntrega = new Date();
    fechaEntrega.setHours(fechaEntrega.getHours() + horasConDescansos);
    
    return {
      horas: horasConDescansos,
      fecha: fechaEntrega.toISOString()
    };
  }

  private static calcularDistanciaEstimada(origen: string, destino: string): number {
    // Simulación básica - en producción usar Google Maps Distance Matrix API
    const distancias: Record<string, Record<string, number>> = {
      'CDMX': { 'Guadalajara': 540, 'Monterrey': 940, 'Tijuana': 2720 },
      'Guadalajara': { 'CDMX': 540, 'Monterrey': 740, 'Tijuana': 2180 },
      'Monterrey': { 'CDMX': 940, 'Guadalajara': 740, 'Tijuana': 1980 }
    };

    return distancias[origen]?.[destino] || 500; // Distancia por defecto
  }

  static generarAlertasAutomaticas(eventos: TrackingEvent[]): string[] {
    const alertas: string[] = [];
    const ahora = new Date();

    for (const evento of eventos) {
      const tiempoEvento = new Date(evento.timestamp);
      const horasTranscurridas = (ahora.getTime() - tiempoEvento.getTime()) / (1000 * 60 * 60);

      if (evento.evento === 'timbrado' && horasTranscurridas > 24) {
        alertas.push('Documento timbrado hace más de 24 horas sin iniciar transporte');
      }

      if (evento.evento === 'en_ruta' && horasTranscurridas > 72) {
        alertas.push('Transporte en ruta hace más de 72 horas sin actualización');
      }
    }

    return alertas;
  }
}
