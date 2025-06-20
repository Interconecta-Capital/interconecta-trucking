
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { UbicacionesHeader } from './UbicacionesHeader';
import { UbicacionesValidation } from './UbicacionesValidation';
import { UbicacionesFormSection } from './UbicacionesFormSection';
import { UbicacionesProgress } from './UbicacionesProgress';
import { UbicacionesContent } from './UbicacionesContent';
import { UbicacionesManager } from './UbicacionesManager';
import { ViajeConfirmationModal } from './ViajeConfirmationModal';
import { useUbicaciones } from '@/hooks/useUbicaciones';

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
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Referencias para evitar loops infinitos
  const lastOnChangeRef = useRef<string>('');
  const isUpdatingFromPropsRef = useRef(false);
  
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

  // SOLUCIÓN 1: Inicialización única desde localStorage y props
  useEffect(() => {
    if (!isInitialized) {
      console.log('🔄 Inicializando ubicaciones por primera vez');
      
      try {
        // Primero intentar cargar desde localStorage
        const savedData = localStorage.getItem('carta-porte-ubicaciones');
        let ubicacionesIniciales = [];
        
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.ubicaciones && Array.isArray(parsed.ubicaciones)) {
            ubicacionesIniciales = parsed.ubicaciones;
            console.log('📍 Cargadas desde localStorage:', ubicacionesIniciales.length);
          }
        }
        
        // Si no hay datos en localStorage pero sí en props, usar props
        if (ubicacionesIniciales.length === 0 && data && data.length > 0) {
          ubicacionesIniciales = data;
          console.log('📍 Cargadas desde props:', ubicacionesIniciales.length);
        }
        
        // Establecer ubicaciones iniciales si las hay
        if (ubicacionesIniciales.length > 0) {
          isUpdatingFromPropsRef.current = true;
          setUbicaciones(ubicacionesIniciales);
          
          // Notificar al padre inmediatamente
          const signature = JSON.stringify(ubicacionesIniciales.map(u => u.idUbicacion).sort());
          lastOnChangeRef.current = signature;
          onChange(ubicacionesIniciales);
        }
        
        setIsInitialized(true);
        console.log('✅ Inicialización completada');
      } catch (error) {
        console.error('❌ Error en inicialización:', error);
        setIsInitialized(true);
      }
    }
  }, [data, isInitialized, setUbicaciones, onChange]);

  // SOLUCIÓN 2: Sincronización unidireccional desde hook hacia padre
  useEffect(() => {
    if (!isInitialized) return;
    
    // Evitar updates circulares
    if (isUpdatingFromPropsRef.current) {
      isUpdatingFromPropsRef.current = false;
      return;
    }
    
    console.log('💾 Sincronizando ubicaciones hacia padre:', ubicaciones?.length || 0);
    
    if (ubicaciones && Array.isArray(ubicaciones)) {
      const currentSignature = JSON.stringify(ubicaciones.map(u => u.idUbicacion).sort());
      
      // Solo actualizar si realmente hay cambios
      if (lastOnChangeRef.current !== currentSignature) {
        lastOnChangeRef.current = currentSignature;
        onChange(ubicaciones);
        console.log('✅ Padre actualizado con', ubicaciones.length, 'ubicaciones');
      }
    }
  }, [ubicaciones, onChange, isInitialized]);

  // SOLUCIÓN 3: Persistencia mejorada en localStorage con debounce
  useEffect(() => {
    if (!isInitialized || !ubicaciones || ubicaciones.length === 0) return;
    
    console.log('💾 Guardando en localStorage:', ubicaciones.length, 'ubicaciones');
    
    // Debounce para evitar guardados excesivos
    const timeoutId = setTimeout(() => {
      try {
        const dataToSave = {
          ubicaciones,
          distanciaTotal: manager.distanciaTotal,
          tiempoEstimado: manager.tiempoEstimado,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('carta-porte-ubicaciones', JSON.stringify(dataToSave));
        console.log('✅ Datos persistidos correctamente');
      } catch (error) {
        console.warn('⚠️ Error persistiendo en localStorage:', error);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [ubicaciones, manager.distanciaTotal, manager.tiempoEstimado, isInitialized]);

  const handleAgregarUbicacion = () => {
    console.log('➕ Iniciando agregar ubicación');
    setEditingIndex(null);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleEditarUbicacion = (index: number) => {
    console.log('✏️ Editando ubicación:', index);
    setEditingIndex(index);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleGuardarUbicacion = (ubicacionData: any) => {
    console.log('💾 === GUARDANDO UBICACIÓN ===');
    console.log('📍 Datos recibidos:', ubicacionData);
    
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
      setShowForm(false);
      setEditingIndex(null);
      setFormErrors([]);
      
      console.log('✅ Ubicación guardada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al guardar ubicación:', error);
    }
  };

  const handleCancelarForm = () => {
    console.log('❌ Cancelando formulario');
    setShowForm(false);
    setEditingIndex(null);
    setFormErrors([]);
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
