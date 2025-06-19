
import { useState, useCallback } from 'react';
import { Ubicacion } from '@/types/ubicaciones';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { convertToUbicacion, convertToUbicacionCompleta } from '@/components/carta-porte/ubicaciones/utils/ubicacionTypeConverters';

interface UseUbicacionesManagerProps {
  ubicaciones: UbicacionCompleta[];
  onChange: (ubicaciones: UbicacionCompleta[], distanciaTotal?: number, tiempoEstimado?: number) => void;
}

export const useUbicacionesManager = ({ ubicaciones, onChange }: UseUbicacionesManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [currentDistanceTotal, setCurrentDistanceTotal] = useState(0);
  const [currentTimeEstimate, setCurrentTimeEstimate] = useState(0);

  const handleAddUbicacion = useCallback(() => {
    const newUbicacion: Ubicacion = {
      id: crypto.randomUUID(),
      idUbicacion: '',
      tipoUbicacion: ubicaciones.length === 0 ? 'Origen' : 'Destino',
      ordenSecuencia: ubicaciones.length + 1,
      tipoEstacion: '1',
      domicilio: {
        pais: 'México',
        codigoPostal: '',
        estado: '',
        municipio: '',
        colonia: '',
        calle: '',
        numExterior: '',
        numInterior: '',
        referencia: '',
        localidad: ''
      }
    };
    setEditingUbicacion(newUbicacion);
    setIsDialogOpen(true);
  }, [ubicaciones.length]);

  const handleEditUbicacion = useCallback((ubicacionCompleta: UbicacionCompleta) => {
    const ubicacion = convertToUbicacion(ubicacionCompleta);
    setEditingUbicacion(ubicacion);
    setIsDialogOpen(true);
  }, []);

  const handleSaveUbicacion = useCallback((ubicacion: Ubicacion) => {
    const ubicacionCompleta = convertToUbicacionCompleta(ubicacion);
    
    if (editingUbicacion?.id && ubicaciones.find(u => u.id === editingUbicacion.id)) {
      // Actualizar ubicación existente
      const updatedUbicaciones = ubicaciones.map(u => u.id === ubicacionCompleta.id ? ubicacionCompleta : u);
      onChange(updatedUbicaciones, currentDistanceTotal, currentTimeEstimate);
    } else {
      // Agregar nueva ubicación
      const newUbicaciones = [...ubicaciones, ubicacionCompleta];
      onChange(newUbicaciones, currentDistanceTotal, currentTimeEstimate);
    }
    setIsDialogOpen(false);
    setEditingUbicacion(null);
  }, [editingUbicacion, ubicaciones, onChange, currentDistanceTotal, currentTimeEstimate]);

  const handleDeleteUbicacion = useCallback((id: string) => {
    const filteredUbicaciones = ubicaciones.filter(u => u.id !== id);
    onChange(filteredUbicaciones, currentDistanceTotal, currentTimeEstimate);
  }, [ubicaciones, onChange, currentDistanceTotal, currentTimeEstimate]);

  const handleDistanceCalculated = useCallback((distancia: number, tiempo: number) => {
    setCurrentDistanceTotal(distancia);
    setCurrentTimeEstimate(tiempo);
    onChange(ubicaciones, distancia, tiempo);
  }, [ubicaciones, onChange]);

  const handleUbicacionesOptimizadas = useCallback((ubicacionesOptimizadas: UbicacionCompleta[]) => {
    onChange(ubicacionesOptimizadas, currentDistanceTotal, currentTimeEstimate);
  }, [onChange, currentDistanceTotal, currentTimeEstimate]);

  return {
    // State
    isDialogOpen,
    editingUbicacion,
    showMap,
    currentDistanceTotal,
    currentTimeEstimate,
    
    // Setters
    setIsDialogOpen,
    setEditingUbicacion,
    setShowMap,
    
    // Handlers
    handleAddUbicacion,
    handleEditUbicacion,
    handleSaveUbicacion,
    handleDeleteUbicacion,
    handleDistanceCalculated,
    handleUbicacionesOptimizadas,
  };
};
