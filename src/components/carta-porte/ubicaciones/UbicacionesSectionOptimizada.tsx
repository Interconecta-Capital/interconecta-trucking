
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UbicacionFormMejorado } from './UbicacionFormMejorado';
import { UbicacionesHeader } from './UbicacionesHeader';
import { UbicacionesList } from './UbicacionesList';
import { UbicacionesValidation } from './UbicacionesValidation';
import { UbicacionesNavigation } from './UbicacionesNavigation';
import { UbicacionesRouteInfo } from './UbicacionesRouteInfo';
import { UbicacionesFormSection } from './UbicacionesFormSection';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { useToast } from '@/hooks/use-toast';

interface UbicacionesSectionOptimizadaProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function UbicacionesSectionOptimizada({ 
  data, 
  onChange, 
  onNext, 
  onPrev 
}: UbicacionesSectionOptimizadaProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  const { toast } = useToast();
  
  const {
    ubicaciones,
    setUbicaciones,
    agregarUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    generarIdUbicacion,
    validarSecuenciaUbicaciones,
    calcularDistanciaTotal,
    calcularDistanciasAutomaticas,
    calcularRutaCompleta,
    rutaCalculada,
    ubicacionesFrecuentes
  } = useUbicaciones();

  // Sincronizar con props data
  useEffect(() => {
    if (data && data.length > 0) {
      setUbicaciones(data);
    }
  }, [data, setUbicaciones]);

  // Sincronizar cambios hacia el componente padre
  useEffect(() => {
    onChange(ubicaciones);
  }, [ubicaciones, onChange]);

  const handleAgregarUbicacion = () => {
    setEditingIndex(null);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleEditarUbicacion = (index: number) => {
    setEditingIndex(index);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleEliminarUbicacion = (index: number) => {
    eliminarUbicacion(index);
    toast({
      title: "Ubicación eliminada",
      description: "La ubicación ha sido eliminada correctamente.",
    });
  };

  const handleGuardarUbicacion = (ubicacionData: any) => {
    try {
      if (editingIndex !== null) {
        actualizarUbicacion(editingIndex, ubicacionData);
        toast({
          title: "Ubicación actualizada",
          description: "La ubicación ha sido actualizada correctamente.",
        });
      } else {
        agregarUbicacion(ubicacionData);
        toast({
          title: "Ubicación agregada",
          description: "La ubicación ha sido agregada correctamente.",
        });
      }
      
      setShowForm(false);
      setEditingIndex(null);
      setFormErrors([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al guardar la ubicación.",
        variant: "destructive"
      });
    }
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormErrors([]);
  };

  const handleCalcularDistancias = async () => {
    try {
      await calcularDistanciasAutomaticas();
      toast({
        title: "Distancias calculadas",
        description: "Las distancias han sido calculadas automáticamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al calcular las distancias.",
        variant: "destructive"
      });
    }
  };

  const handleCalcularRuta = async () => {
    try {
      await calcularRutaCompleta();
      setShowMap(true);
      toast({
        title: "Ruta calculada",
        description: "La ruta ha sido calculada y visualizada en el mapa.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al calcular la ruta.",
        variant: "destructive"
      });
    }
  };

  const handleSaveToFavorites = (ubicacion: any) => {
    // Implementation for saving to favorites
    toast({
      title: "Guardado en favoritos",
      description: "La ubicación ha sido guardada en tus favoritos.",
    });
  };

  const validacion = validarSecuenciaUbicaciones();
  const distanciaTotal = calcularDistanciaTotal();
  const canCalculateDistances = ubicaciones.length >= 2;
  const canContinue = ubicaciones.length > 0 && validacion.esValido;

  if (showForm) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <UbicacionesHeader
        ubicacionesCount={ubicaciones.length}
        canCalculateDistances={canCalculateDistances}
        onAgregarUbicacion={handleAgregarUbicacion}
        onCalcularDistancias={handleCalcularDistancias}
        onCalcularRuta={handleCalcularRuta}
      />

      <UbicacionesValidation
        validacion={validacion}
        distanciaTotal={distanciaTotal}
      />

      <CardContent>
        <UbicacionesList
          ubicaciones={ubicaciones}
          onEditarUbicacion={handleEditarUbicacion}
          onEliminarUbicacion={handleEliminarUbicacion}
          onAgregarUbicacion={handleAgregarUbicacion}
        />

        <UbicacionesRouteInfo
          showMap={showMap}
          rutaCalculada={rutaCalculada}
          ubicaciones={ubicaciones}
        />

        <UbicacionesNavigation
          onPrev={onPrev}
          onNext={onNext}
          canContinue={canContinue}
        />
      </CardContent>
    </div>
  );
}
