
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Ubicacion {
  id?: string;
  idUbicacion: string;
  tipoUbicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  rfcRemitenteDestinatario: string;
  nombreRemitenteDestinatario: string;
  fechaHoraSalidaLlegada?: string;
  distanciaRecorrida?: number;
  ordenSecuencia?: number;
  domicilio: {
    pais: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    localidad?: string;
    colonia: string;
    calle: string;
    numExterior: string;
    numInterior?: string;
    referencia?: string;
  };
}

export interface UbicacionFrecuente {
  id: string;
  nombreUbicacion: string;
  rfcAsociado: string;
  domicilio: Ubicacion['domicilio'];
  usoCount: number;
}

export const useUbicaciones = (cartaPorteId?: string) => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obtener ubicaciones frecuentes
  const { data: ubicacionesFrecuentes = [], isLoading: loadingFrecuentes } = useQuery({
    queryKey: ['ubicaciones-frecuentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ubicaciones_frecuentes')
        .select('*')
        .order('uso_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        nombreUbicacion: item.nombre_ubicacion,
        rfcAsociado: item.rfc_asociado,
        domicilio: item.domicilio,
        usoCount: item.uso_count
      })) as UbicacionFrecuente[];
    },
  });

  // Mutation para guardar ubicación frecuente
  const guardarUbicacionFrecuente = useMutation({
    mutationFn: async (ubicacion: Omit<UbicacionFrecuente, 'id' | 'usoCount'>) => {
      const { data, error } = await supabase
        .from('ubicaciones_frecuentes')
        .upsert({
          nombre_ubicacion: ubicacion.nombreUbicacion,
          rfc_asociado: ubicacion.rfcAsociado,
          domicilio: ubicacion.domicilio,
          uso_count: 1
        }, {
          onConflict: 'rfc_asociado,domicilio'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ubicaciones-frecuentes'] });
      toast({
        title: "Ubicación guardada",
        description: "La ubicación se ha guardado en favoritos.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la ubicación.",
        variant: "destructive",
      });
    },
  });

  const agregarUbicacion = useCallback((ubicacion: Ubicacion) => {
    setUbicaciones(prev => [...prev, ubicacion]);
  }, []);

  const actualizarUbicacion = useCallback((index: number, ubicacion: Ubicacion) => {
    setUbicaciones(prev => prev.map((u, i) => i === index ? ubicacion : u));
  }, []);

  const eliminarUbicacion = useCallback((index: number) => {
    setUbicaciones(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reordenarUbicaciones = useCallback((startIndex: number, endIndex: number) => {
    setUbicaciones(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Actualizar orden de secuencia
      return result.map((ubicacion, index) => ({
        ...ubicacion,
        ordenSecuencia: index + 1
      }));
    });
  }, []);

  const calcularDistanciaTotal = useCallback(() => {
    return ubicaciones.reduce((total, ubicacion) => {
      return total + (ubicacion.distanciaRecorrida || 0);
    }, 0);
  }, [ubicaciones]);

  const validarSecuenciaUbicaciones = useCallback(() => {
    const tieneOrigen = ubicaciones.some(u => u.tipoUbicacion === 'Origen');
    const tieneDestino = ubicaciones.some(u => u.tipoUbicacion === 'Destino');
    const tieneMinimo = ubicaciones.length >= 2;
    
    return {
      esValido: tieneOrigen && tieneDestino && tieneMinimo,
      errores: [
        ...(!tieneOrigen ? ['Falta ubicación de origen'] : []),
        ...(!tieneDestino ? ['Falta ubicación de destino'] : []),
        ...(!tieneMinimo ? ['Se requieren al menos 2 ubicaciones'] : [])
      ]
    };
  }, [ubicaciones]);

  const generarIdUbicacion = useCallback((tipo: 'Origen' | 'Destino' | 'Paso Intermedio') => {
    const prefix = tipo === 'Origen' ? 'OR' : tipo === 'Destino' ? 'DE' : 'IN';
    const count = ubicaciones.filter(u => u.tipoUbicacion === tipo).length + 1;
    return `${prefix}${count.toString().padStart(6, '0')}`;
  }, [ubicaciones]);

  return {
    ubicaciones,
    setUbicaciones,
    ubicacionesFrecuentes,
    loadingFrecuentes,
    agregarUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    reordenarUbicaciones,
    calcularDistanciaTotal,
    validarSecuenciaUbicaciones,
    generarIdUbicacion,
    guardarUbicacionFrecuente: guardarUbicacionFrecuente.mutate,
    isGuardando: guardarUbicacionFrecuente.isPending
  };
};
