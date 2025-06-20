
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { UbicacionesHeader } from './UbicacionesHeader';
import { UbicacionesValidation } from './UbicacionesValidation';
import { UbicacionesFormSection } from './UbicacionesFormSection';
import { UbicacionesProgress } from './UbicacionesProgress';
import { UbicacionesContent } from './UbicacionesContent';
import { UbicacionesManager } from './UbicacionesManager';
import { ViajeConfirmationModal } from './ViajeConfirmationModal';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { useUbicacionesForm } from './hooks/useUbicacionesForm';
import { useUbicacionesSync } from './hooks/useUbicacionesSync';

interface UbicacionesContainerProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
  cartaPorteId?: string;
  onDistanceCalculated?: (datos: { distanciaTotal?: number; tiempoEstimado?: number }) => void;
}

export function UbicacionesContainer({ 
  data, 
  onChange, 
  onNext, 
  onPrev,
  cartaPorteId,
  onDistanceCalculated 
}: UbicacionesContainerProps) {
  const [showMap, setShowMap] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    ubicaciones,
    setUbicaciones,
    agregarUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    generarIdUbicacion,
    validarSecuenciaUbicaciones,
    calcularDistanciaTotal,
    ubicacionesFrecuentes
  } = useUbicaciones();

  const {
    showForm,
    editingIndex,
    formErrors,
    setFormErrors,
    handleAgregarUbicacion,
    handleEditarUbicacion,
    handleCancelarForm,
    validateUbicacionData
  } = useUbicacionesForm();

  // Get manager logic
  const manager = UbicacionesManager({
    ubicaciones,
    onAgregarUbicacion: agregarUbicacion,
    onActualizarUbicacion: actualizarUbicacion,
    onEliminarUbicacion: eliminarUbicacion,
    onNext,
    cartaPorteId,
    onDistanceCalculated
  });

  // Use the sync hook
  useUbicacionesSync({
    data,
    onChange,
    ubicaciones,
    setUbicaciones,
    isInitialized,
    setIsInitialized,
    distanciaTotal: manager.distanciaTotal,
    tiempoEstimado: manager.tiempoEstimado
  });

  const handleGuardarUbicacion = (ubicacionData: any) => {
    console.log('💾 === GUARDANDO UBICACIÓN ===');
    console.log('📍 Datos recibidos:', ubicacionData);
    
    try {
      const errores = validateUbicacionData(ubicacionData);

      if (errores.length > 0) {
        console.log('❌ Errores de validación:', errores);
        setFormErrors(errores);
        return;
      }

      // Guardar la ubicación
      if (editingIndex !== null) {
        console.log('✏️ Actualizando ubicación en índice:', editingIndex);
        actualizarUbicacion(editingIndex, ubicacionData);
      } else {
        console.log('➕ Agregando nueva ubicación');
        agregarUbicacion(ubicacionData);
      }
      
      // Cerrar el formulario
      handleCancelarForm();
      
      console.log('✅ Ubicación guardada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al guardar ubicación:', error);
    }
  };

  const handleSaveToFavorites = (ubicacion: any) => {
    // Implementation for saving to favorites
  };

  const validacion = validarSecuenciaUbicaciones();
  const distanciaCalculada = calcularDistanciaTotal();
  const canCalculateDistances = ubicaciones.length >= 2;
  const canContinue = ubicaciones.length > 0 && validacion.esValido;

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (ubicaciones.length === 0) return 0;
    
    const tieneOrigen = ubicaciones.some(u => u.tipoUbicacion === 'Origen') ? 30 : 0;
    const tieneDestino = ubicaciones.some(u => u.tipoUbicacion === 'Destino') ? 30 : 0;
    const ubicacionesCompletas = ubicaciones.filter(u => 
      u.rfcRemitenteDestinatario && u.nombreRemitenteDestinatario && 
      u.domicilio?.codigoPostal && u.domicilio?.calle
    ).length;
    
    const porcentajeCompletitud = (ubicacionesCompletas / Math.max(1, ubicaciones.length)) * 40;
    
    return Math.round(tieneOrigen + tieneDestino + porcentajeCompletitud);
  };

  const completionPercentage = getCompletionPercentage();

  console.log('🎯 Estado actual:', {
    ubicacionesCount: ubicaciones.length,
    validacion,
    canCalculateDistances,
    canContinue,
    isInitialized
  });

  // No renderizar hasta que esté inicializado
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Cargando ubicaciones...</p>
        </div>
      </div>
    );
  }

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
      <UbicacionesProgress
        ubicacionesCount={ubicaciones.length}
        isComplete={canContinue}
        completionPercentage={completionPercentage}
      />

      <UbicacionesHeader
        ubicacionesCount={ubicaciones.length}
        canCalculateDistances={canCalculateDistances}
        onAgregarUbicacion={handleAgregarUbicacion}
        onCalcularDistancias={() => {}} 
        onCalcularRuta={() => {}} 
      />

      <UbicacionesValidation
        validacion={validacion}
        distanciaTotal={distanciaCalculada}
      />

      <Card>
        <UbicacionesContent
          ubicaciones={ubicaciones}
          canCalculateDistances={canCalculateDistances}
          showMap={showMap}
          isMapFullscreen={isMapFullscreen}
          routeData={manager.routeData}
          distanciaTotal={manager.distanciaTotal}
          tiempoEstimado={manager.tiempoEstimado}
          onEditarUbicacion={handleEditarUbicacion}
          onEliminarUbicacion={manager.handleEliminarUbicacion}
          onAgregarUbicacion={handleAgregarUbicacion}
          onDistanceCalculated={manager.handleDistanceCalculated}
          onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
          onPrev={onPrev}
          onNext={manager.handleContinueClick}
          canContinue={canContinue}
        />
      </Card>

      {/* Modal de confirmación de viaje */}
      <ViajeConfirmationModal
        isOpen={manager.showViajeModal}
        onClose={() => manager.setShowViajeModal(false)}
        onConfirmSaveTrip={manager.handleConfirmSaveTrip}
        onConfirmContinue={manager.handleConfirmContinue}
        ubicaciones={ubicaciones}
        distanciaTotal={manager.distanciaTotal}
        tiempoEstimado={manager.tiempoEstimado}
      />
    </div>
  );
}
