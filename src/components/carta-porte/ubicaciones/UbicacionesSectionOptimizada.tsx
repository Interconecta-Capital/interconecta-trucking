
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { UbicacionesHeader } from './UbicacionesHeader';
import { UbicacionesFormSection } from './UbicacionesFormSection';
import { UbicacionesList } from './UbicacionesList';
import { MapVisualization } from './MapVisualization';
import { UbicacionesValidation } from './UbicacionesValidation';
import { UbicacionesRouteInfo } from './UbicacionesRouteInfo';
import { UbicacionesNavigation } from './UbicacionesNavigation';

interface UbicacionesSectionOptimizadaProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function UbicacionesSectionOptimizada({ data, onChange, onNext, onPrev }: UbicacionesSectionOptimizadaProps) {
  const {
    ubicaciones,
    setUbicaciones,
    ubicacionesFrecuentes,
    rutaCalculada,
    agregarUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    reordenarUbicaciones,
    calcularDistanciaTotal,
    validarSecuenciaUbicaciones,
    generarIdUbicacion,
    guardarUbicacionFrecuente,
    calcularDistanciasAutomaticas,
    calcularRutaCompleta
  } = useUbicaciones();

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Sincronizar con data prop
  React.useEffect(() => {
    if (data.length !== ubicaciones.length) {
      setUbicaciones(data);
    }
  }, [data, ubicaciones.length, setUbicaciones]);

  // Sincronizar cambios hacia arriba
  React.useEffect(() => {
    onChange(ubicaciones);
  }, [ubicaciones, onChange]);

  const handleSaveUbicacion = (ubicacion: any) => {
    try {
      const errors = validateUbicacion(ubicacion);
      if (errors.length > 0) {
        setFormErrors(errors);
        return;
      }

      setFormErrors([]);
      
      if (editingIndex !== null) {
        actualizarUbicacion(editingIndex, ubicacion);
        setEditingIndex(null);
      } else {
        agregarUbicacion(ubicacion);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving ubicacion:', error);
      setFormErrors(['Error al guardar la ubicación. Verifique los datos ingresados.']);
    }
  };

  const validateUbicacion = (ubicacion: any): string[] => {
    const errors: string[] = [];
    
    if (!ubicacion.rfcRemitenteDestinatario?.trim()) {
      errors.push('El RFC es requerido');
    }
    
    if (!ubicacion.nombreRemitenteDestinatario?.trim()) {
      errors.push('El nombre es requerido');
    }
    
    if (!ubicacion.domicilio?.codigoPostal?.trim()) {
      errors.push('El código postal es requerido');
    } else if (!/^\d{5}$/.test(ubicacion.domicilio.codigoPostal)) {
      errors.push('El código postal debe tener 5 dígitos');
    }
    
    if (!ubicacion.domicilio?.calle?.trim()) {
      errors.push('La calle es requerida');
    }
    
    if (!ubicacion.domicilio?.numExterior?.trim()) {
      errors.push('El número exterior es requerido');
    }
    
    return errors;
  };

  const handleEditUbicacion = (index: number) => {
    setEditingIndex(index);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleDeleteUbicacion = (index: number) => {
    eliminarUbicacion(index);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormErrors([]);
  };

  const handleAddUbicacion = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFormErrors([]);
    setShowForm(true);
  };

  const handleCalcularDistancias = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await calcularDistanciasAutomaticas();
    } catch (error) {
      console.error('Error calculating distances:', error);
    }
  };

  const handleCalcularRuta = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await calcularRutaCompleta();
      setShowMap(true);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const validation = validarSecuenciaUbicaciones();
    if (validation.esValido) {
      onNext();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPrev();
  };

  const validation = validarSecuenciaUbicaciones();
  const distanciaTotal = calcularDistanciaTotal();

  return (
    <div className="space-y-6">
      <Card>
        <UbicacionesHeader
          showForm={showForm}
          ubicacionesCount={ubicaciones.length}
          onAddUbicacion={handleAddUbicacion}
          onCalcularDistancias={handleCalcularDistancias}
          onCalcularRuta={handleCalcularRuta}
        />
        
        <CardContent>
          {showForm ? (
            <UbicacionesFormSection
              formErrors={formErrors}
              editingIndex={editingIndex}
              ubicaciones={ubicaciones}
              onSave={handleSaveUbicacion}
              onCancel={handleCancelForm}
              onSaveToFavorites={guardarUbicacionFrecuente}
              generarId={generarIdUbicacion}
              ubicacionesFrecuentes={ubicacionesFrecuentes}
            />
          ) : (
            <UbicacionesList
              ubicaciones={ubicaciones}
              onEdit={handleEditUbicacion}
              onDelete={handleDeleteUbicacion}
              onReorder={reordenarUbicaciones}
              distanciaTotal={distanciaTotal}
            />
          )}
        </CardContent>
      </Card>

      {/* Visualización de Mapa */}
      {showMap && ubicaciones.length > 0 && (
        <MapVisualization
          ubicaciones={ubicaciones}
          ruta={rutaCalculada}
          className="mb-6"
        />
      )}

      {/* Validaciones */}
      <UbicacionesValidation 
        validation={validation}
        showForm={showForm}
      />

      {/* Información de Ruta */}
      <UbicacionesRouteInfo
        rutaCalculada={rutaCalculada}
        showForm={showForm}
        showMap={showMap}
        onToggleMap={() => setShowMap(!showMap)}
      />

      {/* Botones de navegación */}
      <UbicacionesNavigation
        showForm={showForm}
        isValid={validation.esValido}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
