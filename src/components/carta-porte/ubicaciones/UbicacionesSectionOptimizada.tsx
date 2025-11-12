
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { UbicacionesHeader } from './UbicacionesHeader';
import { UbicacionesList } from './UbicacionesList';
import { UbicacionesValidation } from './UbicacionesValidation';
import { UbicacionesNavigation } from './UbicacionesNavigation';
import { UbicacionesFormSection } from './UbicacionesFormSection';
import { OptimizedAutoRouteCalculator } from './OptimizedAutoRouteCalculator';
import { ViajeConfirmationModal } from './ViajeConfirmationModal';
import { RutasFrecuentesSelector } from '../rutas/RutasFrecuentesSelector';
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
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(0);
  const [showViajeModal, setShowViajeModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [showRutasDialog, setShowRutasDialog] = useState(false);
  
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
    console.log('💾 === [FASE 5 DEBUG] GUARDANDO UBICACIÓN ===');
    console.log('📍 Datos completos recibidos:', JSON.stringify(ubicacionData, null, 2));
    console.log('📍 Domicilio recibido:', ubicacionData.domicilio);
    console.log('📍 Código postal:', ubicacionData.domicilio?.codigo_postal);
    console.log('📍 Coordenadas:', ubicacionData.coordenadas);
    
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
        console.log('❌ [FASE 5 DEBUG] Código postal faltante en:', ubicacionData.domicilio);
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
        console.log('✏️ [FASE 5 DEBUG] Actualizando ubicación en índice:', editingIndex);
        console.log('✏️ Ubicación que se guardará:', JSON.stringify(ubicacionData, null, 2));
        actualizarUbicacion(editingIndex, ubicacionData);
        toast({
          title: "Ubicación actualizada",
          description: "La ubicación ha sido actualizada correctamente.",
        });
      } else {
        console.log('➕ [FASE 5 DEBUG] Agregando nueva ubicación');
        console.log('➕ Datos completos a guardar:', JSON.stringify(ubicacionData, null, 2));
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
      
      console.log('✅ [FASE 5 DEBUG] Ubicación guardada exitosamente');
      console.log('✅ Estado final de ubicaciones:', ubicaciones.length + 1);
      
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

  // Manejo optimizado de cálculo de distancia usando el nuevo componente
  const handleDistanceCalculated = async (distancia: number, tiempo: number, routeGeometry: any) => {
    // ✅ FASE 6: Logging exhaustivo
    console.log('📏 [DEBUG] Distancia calculada en UbicacionesSectionOptimizada:', {
      distancia,
      tiempo,
      distanciaActual: distanciaTotal,
      ubicacionesActuales: ubicaciones.length,
      destino: ubicaciones.find(u => u.tipoUbicacion === 'Destino' || (u as any).tipo_ubicacion === 'Destino')
    });
    
    try {
      if (distanciaTotal !== distancia || tiempoEstimado !== tiempo) {
        setDistanciaTotal(distancia);
        setTiempoEstimado(tiempo);
        setRouteData({
          distance_km: distancia,
          duration_minutes: tiempo,
          google_data: routeGeometry?.google_data
        });
        
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
      }
    } catch (error) {
      console.error('❌ Error procesando cálculo de distancia:', error);
      toast({
        title: "Error",
        description: "Error al procesar el cálculo de distancia.",
        variant: "destructive"
      });
    }
  };

  const handleSaveToFavorites = (ubicacion: any) => {
    toast({
      title: "Guardado en favoritos",
      description: "La ubicación ha sido guardada en tus favoritos.",
    });
  };

  const handleAplicarRutaFrecuente = (origen: any, destino: any) => {
    // Limpiar ubicaciones actuales
    setUbicaciones([]);
    
    // Agregar origen y destino
    setTimeout(() => {
      const ubicacionesNuevas = [
        { ...origen, id: generarIdUbicacion('Origen') },
        { ...destino, id: generarIdUbicacion('Destino') }
      ];
      setUbicaciones(ubicacionesNuevas);
      toast({
        title: "Ruta aplicada",
        description: "✅ Ruta aplicada. Puedes agregar más ubicaciones si necesitas."
      });
    }, 100);
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

  console.log('🎯 Estado actual (optimizado):', {
    ubicacionesCount: ubicaciones.length,
    validacion,
    canCalculateDistances,
    canContinue,
    isInitialized,
    distanciaTotal,
    tiempoEstimado
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
      <div className="flex items-center justify-between">
        <UbicacionesHeader
          ubicacionesCount={ubicaciones.length}
          onAgregarUbicacion={handleAgregarUbicacion}
        />
        <Button
          variant="outline"
          onClick={() => setShowRutasDialog(true)}
          className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
        >
          <Zap className="h-4 w-4" />
          Rutas Frecuentes
        </Button>
      </div>

      <UbicacionesValidation
        validacion={validacion}
        distanciaTotal={distanciaCalculada}
      />

      {/* ÚNICO Calculadora híbrida estabilizada de rutas con mapa integrado */}
      {canCalculateDistances && (
        <>
          <OptimizedAutoRouteCalculator
            ubicaciones={ubicaciones}
            onDistanceCalculated={handleDistanceCalculated}
            distanciaTotal={distanciaTotal}
            tiempoEstimado={tiempoEstimado}
          />

          {/* ✅ FASE 3: Resumen de distancia calculada automáticamente */}
          {distanciaTotal > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Distancia Total Calculada
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {distanciaTotal.toFixed(2)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Tiempo Estimado
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      {Math.round(tiempoEstimado / 60)} hrs {tiempoEstimado % 60} min
                    </p>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  ✅ Cálculo automático usando Mapbox
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <CardContent className="bg-white">
        <UbicacionesList
          ubicaciones={ubicaciones}
          distanciaTotal={distanciaTotal}
          onEditarUbicacion={handleEditarUbicacion}
          onEliminarUbicacion={handleEliminarUbicacion}
          onAgregarUbicacion={handleAgregarUbicacion}
          onDistanciaChange={(index, distancia) => {
            console.log('📝 Actualizando distancia manual en ubicación:', { index, distancia });
            const updatedUbicaciones = [...ubicaciones];
            updatedUbicaciones[index] = {
              ...updatedUbicaciones[index],
              distanciaRecorrida: distancia,
              distancia_recorrida: distancia
            } as any;
            onChange(updatedUbicaciones);
          }}
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

      {/* Modal de rutas frecuentes */}
      <RutasFrecuentesSelector
        open={showRutasDialog}
        onOpenChange={setShowRutasDialog}
        onAplicarRuta={handleAplicarRutaFrecuente}
        ubicacionesActuales={ubicaciones}
        distanciaActual={distanciaTotal}
        tiempoActual={tiempoEstimado}
      />
    </div>
  );
}
