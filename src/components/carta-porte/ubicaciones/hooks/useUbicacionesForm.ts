
import { useState } from 'react';

export function useUbicacionesForm() {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

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

  const handleCancelarForm = () => {
    console.log('❌ Cancelando formulario');
    setShowForm(false);
    setEditingIndex(null);
    setFormErrors([]);
  };

  const validateUbicacionData = (ubicacionData: any): string[] => {
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

    return errores;
  };

  return {
    showForm,
    setShowForm,
    editingIndex,
    setEditingIndex,
    formErrors,
    setFormErrors,
    handleAgregarUbicacion,
    handleEditarUbicacion,
    handleCancelarForm,
    validateUbicacionData
  };
}
