import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UbicacionesHeader } from './UbicacionesHeader';
import { UbicacionesList } from './UbicacionesList';
import { UbicacionesValidation } from './UbicacionesValidation';
import { UbicacionesNavigation } from './UbicacionesNavigation';
import { UbicacionesRouteInfo } from './UbicacionesRouteInfo';
import { UbicacionesFormSection } from './UbicacionesFormSection';
import { DistanceCalculator } from './DistanceCalculator';
import { ViajeConfirmationModal } from './ViajeConfirmationModal';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { useViajeCreation } from '@/hooks/useViajeCreation';
import { useToast } from '@/hooks/use-toast';

interface UbicacionesSectionOptimizadaProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
  cartaPorteId?: string;
  onDistanceCalculated?: (datos: { distanciaTotal?: number; tiempoEstimado?: number }) => void;
}

export function UbicacionesSectionOptimizada({ 
  data, 
  onChange, 
  onNext, 
  onPrev,
  cartaPorteId,
  onDistanceCalculated 
}: UbicacionesSectionOptimizadaProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [showViajeModal, setShowViajeModal] = useState(false);
  const [hasValidCalculations, setHasValidCalculations] = useState(false); // NUEVO: Flag para cálculos válidos
  
  const { toast } = useToast();
  const { createViaje, isCreating } = useViajeCreation();
  
  const {
    ubicaciones,
    setUbicaciones,
    agregarUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    generarIdUbicacion,
    validarSecuenciaUbicaciones,
    calcularDistanciaTotal,
    calcularDistanciasAutomaticas,
    calcularRutaCompleta,
    rutaCalculada,
    ubicacionesFrecuentes
  } = useUbicaciones();

  // Sincronizar con props data
  useEffect(() => {
    if (data && data.length > 0) {
      setUbicaciones(data);
    }
  }, [data, setUbicaciones]);

  // Sincronizar cambios hacia el componente padre
  useEffect(() => {
    onChange(ubicaciones);
  }, [ubicaciones, onChange]);

  // Persistir datos cuando cambian las ubicaciones - MEJORADO
  useEffect(() => {
    if (ubicaciones.length > 0) {
      console.log('💾 Persistiendo datos de ubicaciones:', ubicaciones);
      
      localStorage.setItem('carta-porte-ubicaciones', JSON.stringify({
        ubicaciones,
        distanciaTotal,
        tiempoEstimado,
        hasValidCalculations,
        timestamp: new Date().toISOString()
      }));
    }
  }, [ubicaciones, distanciaTotal, tiempoEstimado, hasValidCalculations]);

  const handleAgregarUbicacion = () => {
    setEditingIndex(null);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleEditarUbicacion = (index: number) => {
    setEditingIndex(index);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleEliminarUbicacion = (index: number) => {
    eliminarUbicacion(index);
    toast({
      title: "Ubicación eliminada",
      description: "La ubicación ha sido eliminada correctamente.",
    });
  };

  const handleGuardarUbicacion = (ubicacionData: any) => {
    try {
      // Validar datos básicos
      const errores = [];
      
      if (!ubicacionData.tipoUbicacion) {
        errores.push('El tipo de ubicación es requerido');
      }
      
      if (ubicacionData.tipoUbicacion !== 'Paso Intermedio' && !ubicacionData.rfcRemitenteDestinatario) {
        errores.push('El RFC es requerido');
      }
      
      if (ubicacionData.tipoUbicacion !== 'Paso Intermedio' && !ubicacionData.nombreRemitenteDestinatario) {
        errores.push('El nombre es requerido');
      }
      
      if (!ubicacionData.domicilio?.codigoPostal) {
        errores.push('El código postal es requerido');
      }
      
      if (!ubicacionData.domicilio?.calle) {
        errores.push('La calle es requerida');
      }

      if ((ubicacionData.tipoUbicacion === 'Origen' || ubicacionData.tipoUbicacion === 'Destino') && 
          !ubicacionData.fechaHoraSalidaLlegada) {
        errores.push(`La fecha y hora ${ubicacionData.tipoUbicacion === 'Origen' ? 'de salida' : 'de llegada'} es requerida`);
      }

      if (errores.length > 0) {
        setFormErrors(errores);
        return;
      }

      if (editingIndex !== null) {
        actualizarUbicacion(editingIndex, ubicacionData);
        toast({
          title: "Ubicación actualizada",
          description: "La ubicación ha sido actualizada correctamente.",
        });
      } else {
        agregarUbicacion(ubicacionData);
        toast({
          title: "Ubicación agregada",
          description: "La ubicación ha sido agregada correctamente.",
        });
      }
      
      setShowForm(false);
      setEditingIndex(null);
      setFormErrors([]);
    } catch (error) {
      console.error('Error al guardar ubicación:', error);
      toast({
        title: "Error",
        description: "Hubo un error al guardar la ubicación.",
        variant: "destructive"
      });
    }
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormErrors([]);
  };

  const handleCalcularDistancias = async () => {
    try {
      await calcularDistanciasAutomaticas();
      toast({
        title: "Distancias calculadas",
        description: "Las distancias han sido calculadas automáticamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al calcular las distancias.",
        variant: "destructive"
      });
    }
  };

  const handleCalcularRuta = async () => {
    try {
      await calcularRutaCompleta();
      setShowMap(true);
      toast({
        title: "Ruta calculada",
        description: "La ruta ha sido calculada y visualizada en el mapa.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al calcular la ruta.",
        variant: "destructive"
      });
    }
  };

  // CORREGIDO: Manejar cálculo de distancia total con flag de validez
  const handleDistanceCalculated = async (distancia: number, tiempo: number) => {
    setIsCalculatingDistance(true);
    try {
      setDistanciaTotal(distancia);
      setTiempoEstimado(tiempo);
      setHasValidCalculations(true); // NUEVO: Marcar como válido
      
      // Notificar al componente padre para persistir
      if (onDistanceCalculated) {
        onDistanceCalculated({
          distanciaTotal: distancia,
          tiempoEstimado: tiempo
        });
      }
      
      console.log('✅ Distancia calculada y persistida:', { distancia, tiempo });
      
      toast({
        title: "Distancia calculada exitosamente",
        description: `Distancia total: ${distancia} km. Tiempo estimado: ${Math.round(tiempo / 60)}h ${tiempo % 60}m`,
      });
    } catch (error) {
      console.error('Error procesando cálculo de distancia:', error);
      toast({
        title: "Error",
        description: "Error al procesar el cálculo de distancia.",
        variant: "destructive"
      });
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  const handleSaveToFavorites = (ubicacion: any) => {
    toast({
      title: "Guardado en favoritos",
      description: "La ubicación ha sido guardada en tus favoritos.",
    });
  };

  // Manejar el click en "Continuar"
  const handleContinueClick = () => {
    if (canContinue && ubicaciones.length > 0) {
      setShowViajeModal(true);
    }
  };

  // Confirmar guardar viaje y continuar
  const handleConfirmSaveTrip = () => {
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
  };

  // Continuar sin guardar viaje
  const handleConfirmContinue = () => {
    setShowViajeModal(false);
    onNext();
  };

  // CORREGIDO: Validación que NO muestra alertas falsas cuando hay cálculos válidos
  const validacion = validarSecuenciaUbicaciones();
  const distanciaCalculada = calcularDistanciaTotal();
  const canCalculateDistances = ubicaciones.length >= 2;
  
  // MEJORADO: Solo permitir continuar si hay ubicaciones Y (validación correcta O cálculos válidos)
  const canContinue = ubicaciones.length > 0 && (validacion.esValido || hasValidCalculations);

  if (showForm) {
    return (
      <div className="bg-white">
        <UbicacionesFormSection
          formErrors={formErrors}
          editingIndex={editingIndex}
          ubicaciones={ubicaciones}
          onSave={handleGuardarUbicacion}
          onCancel={handleCancelarForm}
          onSaveToFavorites={handleSaveToFavorites}
          generarId={generarIdUbicacion}
          ubicacionesFrecuentes={ubicacionesFrecuentes}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white">
      <UbicacionesHeader
        ubicacionesCount={ubicaciones.length}
        canCalculateDistances={canCalculateDistances}
        onAgregarUbicacion={handleAgregarUbicacion}
        onCalcularDistancias={handleCalcularDistancias}
        onCalcularRuta={handleCalcularRuta}
      />

      {/* CORREGIDO: Solo mostrar validación si NO hay cálculos válidos */}
      {!hasValidCalculations && ubicaciones.length > 0 && (
        <UbicacionesValidation
          validacion={validacion}
          distanciaTotal={distanciaCalculada}
        />
      )}

      {/* Calculadora de distancia mejorada con persistencia */}
      {canCalculateDistances && (
        <DistanceCalculator
          ubicaciones={ubicaciones}
          onDistanceCalculated={handleDistanceCalculated}
          distanciaTotal={distanciaTotal}
          tiempoEstimado={tiempoEstimado}
          isCalculating={isCalculatingDistance}
        />
      )}

      <CardContent className="bg-white">
        <UbicacionesList
          ubicaciones={ubicaciones}
          onEditarUbicacion={handleEditarUbicacion}
          onEliminarUbicacion={handleEliminarUbicacion}
          onAgregarUbicacion={handleAgregarUbicacion}
        />

        <UbicacionesRouteInfo
          showMap={showMap}
          rutaCalculada={rutaCalculada}
          ubicaciones={ubicaciones}
        />

        <UbicacionesNavigation
          onPrev={onPrev}
          onNext={handleContinueClick}
          canContinue={canContinue}
        />
      </CardContent>

      {/* Modal de confirmación de viaje */}
      <ViajeConfirmationModal
        isOpen={showViajeModal}
        onClose={() => setShowViajeModal(false)}
        onConfirmSaveTrip={handleConfirmSaveTrip}
        onConfirmContinue={handleConfirmContinue}
        ubicaciones={ubicaciones}
        distanciaTotal={distanciaTotal}
        tiempoEstimado={tiempoEstimado}
      />
    </div>
  );
}
