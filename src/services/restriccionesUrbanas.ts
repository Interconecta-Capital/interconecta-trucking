
interface RestriccionUrbana {
  id: string;
  ciudad: string;
  estado: string;
  tipo_restriccion: 'horaria' | 'peso' | 'dimension' | 'ambiental';
  descripcion: string;
  horario_inicio?: string;
  horario_fin?: string;
  dias_semana?: number[];
  peso_maximo?: number;
  altura_maxima?: number;
  aplica_configuraciones?: string[];
  multa_promedio?: number;
}

interface CiudadDetectada {
  nombre: string;
  estado: string;
  coordenadas: { lat: number; lng: number };
  esTransito: boolean;
}

export class RestriccionesUrbanasService {
  // Principales ciudades mexicanas con restricciones
  private ciudadesImportantes = [
    { nombre: 'Ciudad de México', estado: 'Ciudad de México', palabrasClave: ['cdmx', 'df', 'mexico city'] },
    { nombre: 'Guadalajara', estado: 'Jalisco', palabrasClave: ['gdl', 'guadalajara'] },
    { nombre: 'Monterrey', estado: 'Nuevo León', palabrasClave: ['mty', 'monterrey'] },
    { nombre: 'Tijuana', estado: 'Baja California', palabrasClave: ['tj', 'tijuana'] },
    { nombre: 'Puebla', estado: 'Puebla', palabrasClave: ['puebla'] },
    { nombre: 'León', estado: 'Guanajuato', palabrasClave: ['leon'] },
    { nombre: 'Querétaro', estado: 'Querétaro', palabrasClave: ['queretaro', 'qro'] }
  ];

  detectarCiudadesEnRuta(waypoints: Array<{lat: number; lng: number; descripcion: string}>): CiudadDetectada[] {
    const ciudadesDetectadas: CiudadDetectada[] = [];

    waypoints.forEach((waypoint, index) => {
      const descripcionLower = waypoint.descripcion.toLowerCase();
      
      // Buscar coincidencias con ciudades importantes
      this.ciudadesImportantes.forEach(ciudad => {
        const coincide = ciudad.palabrasClave.some(palabra => 
          descripcionLower.includes(palabra)
        ) || descripcionLower.includes(ciudad.nombre.toLowerCase());

        if (coincide) {
          ciudadesDetectadas.push({
            nombre: ciudad.nombre,
            estado: ciudad.estado,
            coordenadas: waypoint,
            esTransito: index > 0 && index < waypoints.length - 1
          });
        }
      });

      // También intentar extraer nombre de ciudad de la descripción
      const matchCiudad = descripcionLower.match(/([a-záéíóúñ\s]+),\s*([a-záéíóúñ\s]+)/);
      if (matchCiudad) {
        const [, posibleCiudad, posibleEstado] = matchCiudad;
        if (posibleCiudad.length > 3 && posibleEstado.length > 3) {
          ciudadesDetectadas.push({
            nombre: this.capitalizeWords(posibleCiudad.trim()),
            estado: this.capitalizeWords(posibleEstado.trim()),
            coordenadas: waypoint,
            esTransito: index > 0 && index < waypoints.length - 1
          });
        }
      }
    });

    // Eliminar duplicados
    return ciudadesDetectadas.filter((ciudad, index, self) => 
      index === self.findIndex(c => c.nombre === ciudad.nombre && c.estado === ciudad.estado)
    );
  }

  private capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  generarAlertasRestricciones(
    restricciones: RestriccionUrbana[],
    vehiculo: { peso: number; altura: number; configuracion: string }
  ): string[] {
    const alertas: string[] = [];

    restricciones.forEach(restriccion => {
      switch (restriccion.tipo_restriccion) {
        case 'horaria':
          alertas.push(
            `🕐 ${restriccion.ciudad}: Restricción horaria ${restriccion.horario_inicio}-${restriccion.horario_fin} (Multa: $${restriccion.multa_promedio?.toLocaleString()})`
          );
          break;
        
        case 'peso':
          if (vehiculo.peso > (restriccion.peso_maximo || 0)) {
            alertas.push(
              `⚖️ ${restriccion.ciudad}: Excede peso máximo ${restriccion.peso_maximo}T (actual: ${vehiculo.peso}T)`
            );
          }
          break;
        
        case 'dimension':
          alertas.push(
            `📏 ${restriccion.ciudad}: ${restriccion.descripcion}`
          );
          break;
        
        case 'ambiental':
          alertas.push(
            `🌱 ${restriccion.ciudad}: Restricción ambiental - Verificar documentación`
          );
          break;
      }
    });

    return alertas;
  }

  calcularTiempoEsperaOptimo(
    restriccionesHorarias: RestriccionUrbana[],
    horaLlegadaEstimada: Date
  ): { tiempoEspera: number; nuevaHoraSalida: Date; razon: string } | null {
    const restriccionActiva = restriccionesHorarias.find(r => {
      if (!r.horario_inicio || !r.horario_fin) return false;

      const [horaIni, minIni] = r.horario_inicio.split(':').map(Number);
      const [horaFin, minFin] = r.horario_fin.split(':').map(Number);
      
      const llegada = horaLlegadaEstimada.getHours() * 60 + horaLlegadaEstimada.getMinutes();
      const inicio = horaIni * 60 + minIni;
      const fin = horaFin * 60 + minFin;

      return llegada >= inicio && llegada <= fin;
    });

    if (!restriccionActiva || !restriccionActiva.horario_fin) return null;

    const [horaFin, minFin] = restriccionActiva.horario_fin.split(':').map(Number);
    const finRestriccion = new Date(horaLlegadaEstimada);
    finRestriccion.setHours(horaFin, minFin, 0, 0);

    // Si ya pasó la hora de fin para hoy, será mañana
    if (finRestriccion <= horaLlegadaEstimada) {
      finRestriccion.setDate(finRestriccion.getDate() + 1);
    }

    const tiempoEspera = finRestriccion.getTime() - horaLlegadaEstimada.getTime();
    
    return {
      tiempoEspera: Math.round(tiempoEspera / (1000 * 60)), // minutos
      nuevaHoraSalida: finRestriccion,
      razon: `Esperar fin de restricción en ${restriccionActiva.ciudad}`
    };
  }

  sugerirRutasAlternativas(ciudadesConRestricciones: string[]): string[] {
    const sugerencias: string[] = [];

    ciudadesConRestricciones.forEach(ciudad => {
      switch (ciudad) {
        case 'Ciudad de México':
          sugerencias.push('Considerar Circuito Exterior Mexiquense para evitar el centro');
          sugerencias.push('Ruta por Ecatepec-Tlalnepantla para carga pesada');
          break;
        
        case 'Guadalajara':
          sugerencias.push('Utilizar Periférico Norte para evitar centro histórico');
          sugerencias.push('Ruta por Tlaquepaque-Tonalá para vehículos pesados');
          break;
        
        case 'Monterrey':
          sugerencias.push('Carretera Nacional para dobles remolques');
          sugerencias.push('Evitar Santa Catarina para vehículos de gran altura');
          break;
        
        case 'Tijuana':
          sugerencias.push('Ruta Mesa de Otay para carga internacional');
          sugerencias.push('Verificar horarios fronterizos para materiales especiales');
          break;
        
        default:
          sugerencias.push(`Consultar regulaciones locales específicas para ${ciudad}`);
      }
    });

    return sugerencias;
  }
}

export const restriccionesUrbanasService = new RestriccionesUrbanasService();
