
import { useState, useCallback, useEffect } from 'react';
import { UbicacionFrecuente } from '@/types/ubicaciones';

export const useUbicacionesFrecuentes = () => {
  const [ubicacionesFrecuentes, setUbicacionesFrecuentes] = useState<UbicacionFrecuente[]>([]);
  const [loadingFrecuentes, setLoadingFrecuentes] = useState(false);
  const [isGuardando, setIsGuardando] = useState(false);

  const cargarUbicacionesFrecuentes = useCallback(async () => {
    setLoadingFrecuentes(true);
    try {
      // Mock implementation - in production this would load from API/storage
      const mockData: UbicacionFrecuente[] = [];
      setUbicacionesFrecuentes(mockData);
    } catch (error) {
      console.error('Error cargando ubicaciones frecuentes:', error);
    } finally {
      setLoadingFrecuentes(false);
    }
  }, []);

  const guardarUbicacionFrecuente = useCallback(async (ubicacion: any, nombreUbicacion: string) => {
    setIsGuardando(true);
    try {
      // Mock implementation - in production this would save to API/storage
      const nuevaUbicacion: UbicacionFrecuente = {
        id: Date.now().toString(),
        nombre: nombreUbicacion,
        nombreUbicacion: nombreUbicacion,
        rfcAsociado: ubicacion.rfcRemitenteDestinatario || '',
        tipo_ubicacion: ubicacion.tipoUbicacion || 'Origen',
        rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario || '',
        nombre_remitente_destinatario: nombreUbicacion,
        domicilio: ubicacion.domicilio,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        fechaCreacion: new Date().toISOString(),
        vecesUsada: 1,
        uso_count: 1
      };
      
      setUbicacionesFrecuentes(prev => [...prev, nuevaUbicacion]);
    } catch (error) {
      console.error('Error guardando ubicación frecuente:', error);
    } finally {
      setIsGuardando(false);
    }
  }, []);

  useEffect(() => {
    cargarUbicacionesFrecuentes();
  }, [cargarUbicacionesFrecuentes]);

  return {
    ubicacionesFrecuentes,
    loadingFrecuentes,
    guardarUbicacionFrecuente,
    isGuardando
  };
};
