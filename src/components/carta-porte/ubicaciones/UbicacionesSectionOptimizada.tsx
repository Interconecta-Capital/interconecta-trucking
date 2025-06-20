import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UbicacionesHeader } from './UbicacionesHeader';
import { UbicacionesList } from './UbicacionesList';
import { UbicacionesValidation } from './UbicacionesValidation';
import { UbicacionesNavigation } from './UbicacionesNavigation';
import { UbicacionesFormSection } from './UbicacionesFormSection';
import { AutoRouteCalculator } from './AutoRouteCalculator';
import { GoogleMapVisualization } from './GoogleMapVisualization';
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
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(0);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [showViajeModal, setShowViajeModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  
  // Referencias para evitar loops infinitos
  const lastOnChangeRef = useRef<string>('');
  const isUpdatingFromPropsRef = useRef(false);
  
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
    ubicacionesFrecuentes
  } = useUbicaciones();

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
            
            // También restaurar distancias si existen
            if (parsed.distanciaTotal) setDistanciaTotal(parsed.distanciaTotal);
            if (parsed.tiempoEstimado) setTiempoEstimado(parsed.tiempoEstimado);
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

  // SOLUCIÓN 2: Sincronización unidireccional desde hook hacia padre (NO loops)
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
          distanciaTotal,
          tiempoEstimado,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('carta-porte-ubicaciones', JSON.stringify(dataToSave));
        console.log('✅ Datos persistidos correctamente');
      } catch (error) {
        console.warn('⚠️ Error persistiendo en localStorage:', error);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [ubicaciones, distanciaTotal, tiempoEstimado, isInitialized]);

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

  const handleEliminarUbicacion = (index: number) => {
    console.log('🗑️ Eliminando ubicación:', index);
    eliminarUbicacion(index);
    toast({
      title: "Ubicación eliminada",
      description: "La ubicación ha sido eliminada correctamente.",
    });
  };

  const handleGuardarUbicacion = (ubicacionData: any) => {
    console.log('💾 === GUARDANDO UBICACIÓN (ESTABLE) ===');
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
        toast({
          title: "Ubicación actualizada",
          description: "La ubicación ha sido actualizada correctamente.",
        });
      } else {
        console.log('➕ Agregando nueva ubicación');
        agregarUbicacion(ubicacionData);
        toast({
          title: "Ubicación agregada",
          description: "La ubicación ha sido agregada correctamente.",
        });
      }
      
      // Cerrar el formulario
      setShowForm(false);
      setEditingIndex(null);
      setFormErrors([]);
      
      console.log('✅ Ubicación guardada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al guardar ubicación:', error);
      toast({
        title: "Error",
        description: "Hubo un error al guardar la ubicación.",
        variant: "destructive"
      });
    }
  };

  const handleCancelarForm = () => {
    console.log('❌ Cancelando formulario');
    setShowForm(false);
    setEditingIndex(null);
    setFormErrors([]);
  };

  // Manejo mejorado de cálculo de distancia con Google Maps
  const handleDistanceCalculated = async (distancia: number, tiempo: number, routeGeometry: any) => {
    console.log('📏 Distancia calculada con Google Maps:', { distancia, tiempo });
    
    try {
      setIsCalculatingDistance(true);
      setDistanciaTotal(distancia);
      setTiempoEstimado(tiempo);
      setRouteData({
        distance_km: distancia,
        duration_minutes: tiempo,
        google_data: routeGeometry?.google_data
      });
      setShowMap(true);
      
      // Notificar al componente padre
      if (onDistanceCalculated) {
        onDistanceCalculated({
          distanciaTotal: distancia,
          tiempoEstimado: tiempo
        });
      }
      
      console.log('✅ Distancia y ruta procesadas exitosamente');
      
      toast({
        title: "Ruta calculada exitosamente",
        description: `Distancia: ${distancia} km. Tiempo: ${Math.round(tiempo / 60)}h ${tiempo % 60}m`,
      });
    } catch (error) {
      console.error('❌ Error procesando cálculo de distancia:', error);
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

  const validacion = validarSecuenciaUbicaciones();
  const distanciaCalculada = calcularDistanciaTotal();
  const canCalculateDistances = ubicaciones.length >= 2;
  const canContinue = ubicaciones.length > 0 && validacion.esValido;

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

      <CardContent className="bg-white">
        <UbicacionesList
          ubicaciones={ubicaciones}
          onEditarUbicacion={handleEditarUbicacion}
          onEliminarUbicacion={handleEliminarUbicacion}
          onAgregarUbicacion={handleAgregarUbicacion}
        />

        {/* Calculadora automática de rutas con Google Maps - SOLO UNA VEZ AQUÍ */}
        {canCalculateDistances && (
          <div className="mt-6">
            <AutoRouteCalculator
              ubicaciones={ubicaciones}
              onDistanceCalculated={handleDistanceCalculated}
              distanciaTotal={distanciaTotal}
              tiempoEstimado={tiempoEstimado}
            />
          </div>
        )}

        {/* Mapa de Google Maps integrado */}
        {showMap && ubicaciones.length >= 2 && (
          <div className="mt-6">
            <GoogleMapVisualization
              ubicaciones={ubicaciones}
              routeData={routeData}
              isVisible={showMap}
              onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
              isFullscreen={isMapFullscreen}
            />
          </div>
        )}

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
