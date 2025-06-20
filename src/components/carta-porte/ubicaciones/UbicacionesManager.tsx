
import React, { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useViajeCreation } from '@/hooks/useViajeCreation';
import { Ubicacion } from '@/types/ubicaciones';

interface UbicacionesManagerProps {
  ubicaciones: Ubicacion[];
  onAgregarUbicacion: (ubicacion: Ubicacion) => void;
  onActualizarUbicacion: (index: number, ubicacion: Ubicacion) => void;
  onEliminarUbicacion: (index: number) => void;
  onNext: () => void;
  cartaPorteId?: string;
  onDistanceCalculated?: (datos: { distanciaTotal?: number; tiempoEstimado?: number }) => void;
}

export function UbicacionesManager({
  ubicaciones,
  onAgregarUbicacion,
  onActualizarUbicacion,
  onEliminarUbicacion,
  onNext,
  cartaPorteId,
  onDistanceCalculated
}: UbicacionesManagerProps) {
  const [showViajeModal, setShowViajeModal] = useState(false);
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(0);
  const [routeData, setRouteData] = useState<any>(null);
  
  const { toast } = useToast();
  const { createViaje, isCreating } = useViajeCreation();

  // This function is just a placeholder that returns a trigger function
  // The actual form handling is done in the parent component
  const handleAgregarUbicacion = useCallback(() => {
    console.log('➕ Manager: Iniciando agregar ubicación');
    // This is just a trigger - the actual form display is handled by parent
    return 'trigger-form';
  }, []);

  const handleEditarUbicacion = useCallback((index: number) => {
    console.log('✏️ Manager: Editando ubicación:', index);
    // This will trigger the parent to show the form with edit mode
  }, []);

  const handleEliminarUbicacion = useCallback((index: number) => {
    console.log('🗑️ Manager: Eliminando ubicación:', index);
    onEliminarUbicacion(index);
    toast({
      title: "Ubicación eliminada",
      description: "La ubicación ha sido eliminada correctamente.",
    });
  }, [onEliminarUbicacion, toast]);

  const handleDistanceCalculated = useCallback(async (distancia: number, tiempo: number, routeGeometry: any) => {
    console.log('📏 Manager: Distancia calculada con Google Maps:', { distancia, tiempo });
    
    try {
      setDistanciaTotal(distancia);
      setTiempoEstimado(tiempo);
      setRouteData({
        distance_km: distancia,
        duration_minutes: tiempo,
        google_data: routeGeometry?.google_data
      });
      
      // Notificar al componente padre
      if (onDistanceCalculated) {
        onDistanceCalculated({
          distanciaTotal: distancia,
          tiempoEstimado: tiempo
        });
      }
      
      console.log('✅ Manager: Distancia y ruta procesadas exitosamente');
      
      toast({
        title: "Ruta calculada exitosamente",
        description: `Distancia: ${distancia} km. Tiempo: ${Math.round(tiempo / 60)}h ${tiempo % 60}m`,
      });
    } catch (error) {
      console.error('❌ Manager: Error procesando cálculo de distancia:', error);
      toast({
        title: "Error",
        description: "Error al procesar el cálculo de distancia.",
        variant: "destructive"
      });
    }
  }, [onDistanceCalculated, toast]);

  const handleContinueClick = useCallback(() => {
    const canContinue = ubicaciones.length > 0;
    if (canContinue) {
      setShowViajeModal(true);
    }
  }, [ubicaciones.length]);

  const handleConfirmSaveTrip = useCallback(() => {
    if (cartaPorteId) {
      createViaje({
        cartaPorteId,
        ubicaciones,
        distanciaTotal,
        tiempoEstimado
      });
    }
    setShowViajeModal(false);
    onNext();
  }, [cartaPorteId, createViaje, ubicaciones, distanciaTotal, tiempoEstimado, onNext]);

  const handleConfirmContinue = useCallback(() => {
    setShowViajeModal(false);
    onNext();
  }, [onNext]);

  return {
    // State
    showViajeModal,
    distanciaTotal,
    tiempoEstimado,
    routeData,
    isCreating,
    
    // Handlers
    handleAgregarUbicacion,
    handleEditarUbicacion,
    handleEliminarUbicacion,
    handleDistanceCalculated,
    handleContinueClick,
    handleConfirmSaveTrip,
    handleConfirmContinue,
    
    // Modal controls
    setShowViajeModal
  };
}
