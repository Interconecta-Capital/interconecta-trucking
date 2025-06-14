
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
}

export function UbicacionesSectionOptimizada({ 
  data, 
  onChange, 
  onNext, 
  onPrev,
  cartaPorteId 
}: UbicacionesSectionOptimizadaProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [showViajeModal, setShowViajeModal] = useState(false);
  
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

  // Persistir datos cuando cambian las ubicaciones
  useEffect(() => {
    if (ubicaciones.length > 0) {
      console.log('💾 Persistiendo datos de ubicaciones:', ubicaciones);
      // Aquí se podría guardar en localStorage o hacer auto-save
      localStorage.setItem('carta-porte-ubicaciones', JSON.stringify({
        ubicaciones,
        distanciaTotal,
        tiempoEstimado,
        timestamp: new Date().toISOString()
      }));
    }
  }, [ubicaciones, distanciaTotal, tiempoEstimado]);

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

  // Manejar cálculo de distancia total
  const handleDistanceCalculated = async (distancia: number, tiempo: number) => {
    setIsCalculatingDistance(true);
    try {
      setDistanciaTotal(distancia);
      setTiempoEstimado(tiempo);
      
      console.log('✅ Distancia guardada:', { distancia, tiempo });
      
      toast({
        title: "Distancia calculada",
        description: `Distancia total: ${distancia} km. Tiempo estimado: ${Math.round(tiempo / 60)}h ${tiempo % 60}m`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al calcular la distancia total.",
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

  const validacion = validarSecuenciaUbicaciones();
  const distanciaCalculada = calcularDistanciaTotal();
  const canCalculateDistances = ubicaciones.length >= 2;
  const canContinue = ubicaciones.length > 0 && validacion.esValido;

  if (showForm) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <UbicacionesHeader
        ubicacionesCount={ubicaciones.length}
        canCalculateDistances={canCalculateDistances}
        onAgregarUbicacion={handleAgregarUbicacion}
        onCalcularDistancias={handleCalcularDistancias}
        onCalcularRuta={handleCalcularRuta}
      />

      <UbicacionesValidation
        validacion={validacion}
        distanciaTotal={distanciaCalculada}
      />

      {/* Calculadora de distancia mejorada */}
      {canCalculateDistances && (
        <DistanceCalculator
          ubicaciones={ubicaciones}
          onDistanceCalculated={handleDistanceCalculated}
          distanciaTotal={distanciaTotal}
          tiempoEstimado={tiempoEstimado}
          isCalculating={isCalculatingDistance}
        />
      )}

      <CardContent>
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
