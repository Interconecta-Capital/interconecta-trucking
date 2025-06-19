
import { useState, useCallback } from 'react';
import { UbicacionCompleta } from '@/types/cartaPorte';

interface UseUbicacionesManagerProps {
  ubicaciones: UbicacionCompleta[];
  onChange: (ubicaciones: UbicacionCompleta[], distanciaTotal?: number, tiempoEstimado?: number) => void;
}

export const useUbicacionesManager = ({ ubicaciones, onChange }: UseUbicacionesManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState<UbicacionCompleta | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [currentDistanceTotal, setCurrentDistanceTotal] = useState(0);
  const [currentTimeEstimate, setCurrentTimeEstimate] = useState(0);

  const handleAddUbicacion = useCallback(() => {
    const newUbicacion: UbicacionCompleta = {
      id: crypto.randomUUID(),
      id_ubicacion: '',
      tipo_ubicacion: ubicaciones.length === 0 ? 'Origen' : 'Destino',
      tipo_estacion: '01',
      distancia_recorrida: 0,
      domicilio: {
        pais: 'MEX',
        codigo_postal: '',
        estado: '',
        municipio: '',
        colonia: '',
        calle: '',
        numero_exterior: ''
      }
    };
    setEditingUbicacion(newUbicacion);
    setIsDialogOpen(true);
  }, [ubicaciones.length]);

  const handleEditUbicacion = useCallback((ubicacionCompleta: UbicacionCompleta) => {
    setEditingUbicacion(ubicacionCompleta);
    setIsDialogOpen(true);
  }, []);

  const handleSaveUbicacion = useCallback((ubicacion: UbicacionCompleta) => {
    if (editingUbicacion?.id && ubicaciones.find(u => u.id === editingUbicacion.id)) {
      // Actualizar ubicación existente
      const updatedUbicaciones = ubicaciones.map(u => u.id === ubicacion.id ? ubicacion : u);
      onChange(updatedUbicaciones, currentDistanceTotal, currentTimeEstimate);
    } else {
      // Agregar nueva ubicación
      const newUbicaciones = [...ubicaciones, ubicacion];
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
