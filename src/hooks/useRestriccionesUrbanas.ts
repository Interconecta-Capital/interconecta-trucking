
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  vigencia_desde: string;
  vigencia_hasta?: string;
  activa: boolean;
}

interface VentanaLibre {
  inicio: Date;
  fin: Date;
  ciudad: string;
  descripcion: string;
}

interface ValidacionRestricciones {
  restriccionesEncontradas: RestriccionUrbana[];
  alertas: string[];
  sugerenciasHorario: VentanaLibre[];
  rutasAlternativas: string[];
  mulasEstimadas: number;
}

interface UseRestriccionesUrbanasReturn {
  verificarRestricciones: (
    ruta: { ciudades: string[] },
    vehiculo: { peso: number; altura: number; configuracion: string },
    fechaHora: Date
  ) => Promise<ValidacionRestricciones>;
  optimizarHorarios: (
    origen: string,
    destino: string,
    vehiculo: { peso: number; altura: number; configuracion: string },
    fechaInicioDeseada: Date
  ) => Promise<VentanaLibre[]>;
  obtenerRestriccionesCiudad: (ciudad: string, estado: string) => Promise<RestriccionUrbana[]>;
  calcularMultasEstimadas: (restricciones: RestriccionUrbana[]) => number;
  loading: boolean;
  error: string | null;
}

export const useRestriccionesUrbanas = (): UseRestriccionesUrbanasReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerRestriccionesCiudad = useCallback(async (
    ciudad: string,
    estado: string
  ): Promise<RestriccionUrbana[]> => {
    try {
      const { data, error } = await supabase
        .from('restricciones_urbanas')
        .select('*')
        .eq('ciudad', ciudad)
        .eq('estado', estado)
        .eq('activa', true)
        .gte('vigencia_hasta', new Date().toISOString().split('T')[0])
        .order('tipo_restriccion');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error obteniendo restricciones:', err);
      return [];
    }
  }, []);

  const verificarAplicabilidad = useCallback((
    restriccion: RestriccionUrbana,
    vehiculo: { peso: number; altura: number; configuracion: string },
    fechaHora: Date
  ): boolean => {
    // Verificar configuración del vehículo
    if (restriccion.aplica_configuraciones && 
        !restriccion.aplica_configuraciones.includes(vehiculo.configuracion)) {
      return false;
    }

    // Verificar peso
    if (restriccion.tipo_restriccion === 'peso' && restriccion.peso_maximo) {
      if (vehiculo.peso <= restriccion.peso_maximo) return false;
    }

    // Verificar altura
    if (restriccion.tipo_restriccion === 'dimension' && restriccion.altura_maxima) {
      if (vehiculo.altura <= restriccion.altura_maxima) return false;
    }

    // Verificar día de la semana
    if (restriccion.dias_semana && restriccion.dias_semana.length > 0) {
      const diaSemana = fechaHora.getDay();
      const diaAjustado = diaSemana === 0 ? 7 : diaSemana; // Convertir domingo (0) a 7
      if (!restriccion.dias_semana.includes(diaAjustado)) return false;
    }

    // Verificar horario
    if (restriccion.horario_inicio && restriccion.horario_fin) {
      const horaActual = fechaHora.getHours() * 60 + fechaHora.getMinutes();
      const [horaIni, minIni] = restriccion.horario_inicio.split(':').map(Number);
      const [horaFin, minFin] = restriccion.horario_fin.split(':').map(Number);
      
      const inicioMinutos = horaIni * 60 + minIni;
      const finMinutos = horaFin * 60 + minFin;

      // Manejar restricciones que cruzan medianoche
      if (inicioMinutos > finMinutos) {
        return horaActual >= inicioMinutos || horaActual <= finMinutos;
      } else {
        return horaActual >= inicioMinutos && horaActual <= finMinutos;
      }
    }

    return true;
  }, []);

  const verificarRestricciones = useCallback(async (
    ruta: { ciudades: string[] },
    vehiculo: { peso: number; altura: number; configuracion: string },
    fechaHora: Date
  ): Promise<ValidacionRestricciones> => {
    setLoading(true);
    setError(null);

    try {
      const restriccionesEncontradas: RestriccionUrbana[] = [];
      const alertas: string[] = [];
      const sugerenciasHorario: VentanaLibre[] = [];
      const rutasAlternativas: string[] = [];

      // Verificar cada ciudad en la ruta
      for (const ciudadInfo of ruta.ciudades) {
        const [ciudad, estado] = ciudadInfo.split(', ');
        const restriccionesCiudad = await obtenerRestriccionesCiudad(ciudad, estado || 'Ciudad de México');

        for (const restriccion of restriccionesCiudad) {
          if (verificarAplicabilidad(restriccion, vehiculo, fechaHora)) {
            restriccionesEncontradas.push(restriccion);
            
            // Generar alertas específicas
            if (restriccion.tipo_restriccion === 'horaria') {
              alertas.push(`⚠️ ${ciudad}: ${restriccion.descripcion} (${restriccion.horario_inicio} - ${restriccion.horario_fin})`);
              
              // Sugerir ventana libre
              if (restriccion.horario_fin) {
                const [hora, min] = restriccion.horario_fin.split(':').map(Number);
                const ventanaInicio = new Date(fechaHora);
                ventanaInicio.setHours(hora, min, 0, 0);
                
                sugerenciasHorario.push({
                  inicio: ventanaInicio,
                  fin: new Date(ventanaInicio.getTime() + 2 * 60 * 60 * 1000), // 2 horas después
                  ciudad,
                  descripcion: `Ventana libre después de restricción`
                });
              }
            } else if (restriccion.tipo_restriccion === 'peso') {
              alertas.push(`⚖️ ${ciudad}: Restricción de peso (máx: ${restriccion.peso_maximo}T, actual: ${vehiculo.peso}T)`);
              rutasAlternativas.push(`Considerar ruta perimetral evitando el centro de ${ciudad}`);
            } else if (restriccion.tipo_restriccion === 'dimension') {
              alertas.push(`📏 ${ciudad}: ${restriccion.descripcion}`);
              rutasAlternativas.push(`Ruta alternativa para vehículos de gran tamaño en ${ciudad}`);
            } else if (restriccion.tipo_restriccion === 'ambiental') {
              alertas.push(`🌱 ${ciudad}: ${restriccion.descripcion}`);
            }
          }
        }
      }

      const mulasEstimadas = calcularMultasEstimadas(restriccionesEncontradas);

      return {
        restriccionesEncontradas,
        alertas,
        sugerenciasHorario,
        rutasAlternativas,
        mulasEstimadas
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error verificando restricciones';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [obtenerRestriccionesCiudad, verificarAplicabilidad]);

  const optimizarHorarios = useCallback(async (
    origen: string,
    destino: string,
    vehiculo: { peso: number; altura: number; configuracion: string },
    fechaInicioDeseada: Date
  ): Promise<VentanaLibre[]> => {
    setLoading(true);
    
    try {
      const ventanasLibres: VentanaLibre[] = [];
      const ciudadesRuta = [origen, destino]; // Simplificado para el ejemplo
      
      // Para cada ciudad, encontrar ventanas de tiempo sin restricciones
      for (const ciudadInfo of ciudadesRuta) {
        const [ciudad, estado] = ciudadInfo.split(', ');
        const restricciones = await obtenerRestriccionesCiudad(ciudad, estado || 'Ciudad de México');
        
        // Generar ventanas de 24 horas divididas por restricciones
        const inicioDelDia = new Date(fechaInicioDeseada);
        inicioDelDia.setHours(0, 0, 0, 0);
        
        let horaActual = new Date(inicioDelDia);
        const finDelDia = new Date(inicioDelDia);
        finDelDia.setHours(23, 59, 59, 999);

        while (horaActual < finDelDia) {
          const tieneRestriccion = restricciones.some(r => 
            verificarAplicabilidad(r, vehiculo, horaActual)
          );

          if (!tieneRestriccion) {
            // Encontrar el final de esta ventana libre
            let finVentana = new Date(horaActual);
            finVentana.setHours(finVentana.getHours() + 1);

            while (finVentana < finDelDia) {
              const tieneRestriccionFin = restricciones.some(r => 
                verificarAplicabilidad(r, vehiculo, finVentana)
              );
              
              if (tieneRestriccionFin) break;
              finVentana.setHours(finVentana.getHours() + 1);
            }

            // Solo agregar ventanas de al menos 2 horas
            if (finVentana.getTime() - horaActual.getTime() >= 2 * 60 * 60 * 1000) {
              ventanasLibres.push({
                inicio: new Date(horaActual),
                fin: finVentana,
                ciudad,
                descripcion: 'Ventana libre de restricciones'
              });
            }

            horaActual = finVentana;
          } else {
            horaActual.setHours(horaActual.getHours() + 1);
          }
        }
      }

      return ventanasLibres.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
      
    } catch (err) {
      console.error('Error optimizando horarios:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [obtenerRestriccionesCiudad, verificarAplicabilidad]);

  const calcularMultasEstimadas = useCallback((restricciones: RestriccionUrbana[]): number => {
    return restricciones.reduce((total, restriccion) => {
      return total + (restriccion.multa_promedio || 0);
    }, 0);
  }, []);

  return {
    verificarRestricciones,
    optimizarHorarios,
    obtenerRestriccionesCiudad,
    calcularMultasEstimadas,
    loading,
    error
  };
};
