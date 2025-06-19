
import { useState, useCallback } from 'react';
import { Ubicacion } from '@/types/ubicaciones';

export const useUbicacionesPersistence = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const guardarUbicaciones = useCallback(async (ubicaciones: Ubicacion[], cartaPorteId?: string) => {
    setIsSaving(true);
    try {
      // Mock save - in production this would save to API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const ubicacionesConSecuencia = ubicaciones.map((ubicacion, index) => ({
        ...ubicacion,
        ordenSecuencia: index + 1
      }));
      
      console.log('Ubicaciones guardadas:', ubicacionesConSecuencia);
      return ubicacionesConSecuencia;
    } catch (error) {
      console.error('Error guardando ubicaciones:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const cargarUbicaciones = useCallback(async (cartaPorteId: string): Promise<Ubicacion[]> => {
    setIsLoading(true);
    try {
      // Mock load - in production this would load from API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUbicaciones: Ubicacion[] = [
        {
          id: '1',
          idUbicacion: 'OR001',
          tipoUbicacion: 'Origen',
          ordenSecuencia: 1,
          domicilio: {
            pais: 'México',
            codigoPostal: '01000',
            estado: 'Ciudad de México',
            municipio: 'Álvaro Obregón',
            colonia: 'San Ángel',
            calle: 'Avenida Revolución',
            numExterior: '123'
          }
        }
      ];
      
      return mockUbicaciones;
    } catch (error) {
      console.error('Error cargando ubicaciones:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const eliminarUbicacion = useCallback(async (ubicacionId: string, cartaPorteId?: string) => {
    try {
      // Mock delete - in production this would delete from API
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Ubicación eliminada:', ubicacionId);
    } catch (error) {
      console.error('Error eliminando ubicación:', error);
      throw error;
    }
  }, []);

  const actualizarOrdenUbicaciones = useCallback(async (ubicaciones: Ubicacion[], cartaPorteId?: string) => {
    try {
      // Mock update order - in production this would update in API
      const ubicacionesOrdenadas = ubicaciones.map((ubicacion, index) => ({
        ...ubicacion,
        ordenSecuencia: index + 1
      }));
      
      console.log('Orden de ubicaciones actualizado:', ubicacionesOrdenadas);
      return ubicacionesOrdenadas;
    } catch (error) {
      console.error('Error actualizando orden de ubicaciones:', error);
      throw error;
    }
  }, []);

  return {
    guardarUbicaciones,
    cargarUbicaciones,
    eliminarUbicacion,
    actualizarOrdenUbicaciones,
    isSaving,
    isLoading
  };
};
