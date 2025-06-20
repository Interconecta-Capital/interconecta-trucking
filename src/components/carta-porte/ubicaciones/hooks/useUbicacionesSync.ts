
import { useEffect, useRef } from 'react';

interface UseUbicacionesSyncProps {
  data: any[];
  onChange: (data: any[]) => void;
  ubicaciones: any[];
  setUbicaciones: (ubicaciones: any[]) => void;
  isInitialized: boolean;
  setIsInitialized: (initialized: boolean) => void;
  distanciaTotal: number;
  tiempoEstimado: number;
}

export function useUbicacionesSync({
  data,
  onChange,
  ubicaciones,
  setUbicaciones,
  isInitialized,
  setIsInitialized,
  distanciaTotal,
  tiempoEstimado
}: UseUbicacionesSyncProps) {
  const lastOnChangeRef = useRef<string>('');
  const isUpdatingFromPropsRef = useRef(false);

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
  }, [data, isInitialized, setUbicaciones, onChange, setIsInitialized]);

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
          distanciaTotal,
          tiempoEstimado,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('carta-porte-ubicaciones', JSON.stringify(dataToSave));
        console.log('✅ Datos persistidos correctamente');
      } catch (error) {
        console.warn('⚠️ Error persistiendo en localStorage:', error);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [ubicaciones, distanciaTotal, tiempoEstimado, isInitialized]);

  return {
    lastOnChangeRef,
    isUpdatingFromPropsRef
  };
}
