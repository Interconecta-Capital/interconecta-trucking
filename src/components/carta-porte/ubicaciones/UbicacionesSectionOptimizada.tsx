
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { UbicacionCard } from './UbicacionCard';
import { UbicacionFormDialog } from './UbicacionFormDialog';
import { OptimizedDistanceCalculator } from './OptimizedDistanceCalculator';
import { MapVisualization } from './MapVisualization';
import { UbicacionesEmptyState } from './UbicacionesEmptyState';
import { UbicacionesSectionHeader } from './UbicacionesSectionHeader';
import { UbicacionesValidationPanel } from './UbicacionesValidationPanel';
import { UbicacionesSectionNavigation } from './UbicacionesSectionNavigation';
import { useUbicacionesManager } from '@/hooks/carta-porte/useUbicacionesManager';
import { convertToUbicacion, convertToUbicacionCompleta } from './utils/ubicacionTypeConverters';

interface UbicacionesSectionOptimizadaProps {
  ubicaciones: UbicacionCompleta[];
  distanciaTotal?: number;
  tiempoEstimado?: number;
  onChange: (ubicaciones: UbicacionCompleta[], distanciaTotal?: number, tiempoEstimado?: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function UbicacionesSectionOptimizada({
  ubicaciones,
  distanciaTotal,
  tiempoEstimado,
  onChange,
  onNext,
  onPrev
}: UbicacionesSectionOptimizadaProps) {
  const {
    isDialogOpen,
    editingUbicacion,
    showMap,
    currentDistanceTotal,
    currentTimeEstimate,
    setIsDialogOpen,
    setShowMap,
    handleAddUbicacion,
    handleEditUbicacion,
    handleSaveUbicacion,
    handleDeleteUbicacion,
    handleDistanceCalculated,
    handleUbicacionesOptimizadas,
  } = useUbicacionesManager({ ubicaciones, onChange });

  const canContinue = ubicaciones.length >= 2 && 
    ubicaciones.some(u => u.tipo_ubicacion === 'Origen') &&
    ubicaciones.some(u => u.tipo_ubicacion === 'Destino') &&
    (currentDistanceTotal || distanciaTotal || 0) > 0;

  // Convert editingUbicacion from Ubicacion to UbicacionCompleta for the dialog
  const editingUbicacionCompleta = editingUbicacion ? convertToUbicacionCompleta(editingUbicacion) : null;

  // Handle save from dialog - convert from UbicacionCompleta to Ubicacion for the manager
  const handleDialogSave = (ubicacionCompleta: UbicacionCompleta) => {
    const ubicacion = convertToUbicacion(ubicacionCompleta);
    handleSaveUbicacion(ubicacion);
  };

  // Handle edit - convert from UbicacionCompleta to Ubicacion for the manager
  const handleEditUbicacionWrapper = (ubicacionCompleta: UbicacionCompleta) => {
    const ubicacion = convertToUbicacion(ubicacionCompleta);
    handleEditUbicacion(ubicacion);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <UbicacionesSectionHeader
            ubicaciones={ubicaciones}
            showMap={showMap}
            onAddUbicacion={handleAddUbicacion}
            onToggleMap={() => setShowMap(!showMap)}
          />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Lista de Ubicaciones */}
          {ubicaciones.length === 0 ? (
            <UbicacionesEmptyState />
          ) : (
            <div className="space-y-4">
              {ubicaciones
                .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
                .map((ubicacion, index) => (
                  <UbicacionCard
                    key={ubicacion.id}
                    ubicacion={ubicacion}
                    index={index}
                    onEdit={() => handleEditUbicacionWrapper(ubicacion)}
                    onDelete={() => handleDeleteUbicacion(ubicacion.id || '')}
                  />
                ))}
            </div>
          )}

          {/* Calculadora de Distancias Optimizada */}
          {ubicaciones.length >= 2 && (
            <OptimizedDistanceCalculator
              ubicaciones={ubicaciones}
              onDistanceCalculated={handleDistanceCalculated}
              onUbicacionesOptimizadas={handleUbicacionesOptimizadas}
              distanciaTotal={currentDistanceTotal || distanciaTotal || 0}
              tiempoEstimado={currentTimeEstimate || tiempoEstimado || 0}
            />
          )}

          {/* Validaciones */}
          <UbicacionesValidationPanel
            ubicaciones={ubicaciones}
            distanciaTotal={currentDistanceTotal || distanciaTotal || 0}
          />

          {/* Mapa de visualización */}
          {showMap && (
            <MapVisualization
              ubicaciones={ubicaciones}
              isVisible={showMap}
              distanciaTotal={currentDistanceTotal || distanciaTotal || 0}
              tiempoEstimado={currentTimeEstimate || tiempoEstimado || 0}
            />
          )}

          <UbicacionesSectionNavigation
            canContinue={canContinue}
            onPrev={onPrev}
            onNext={onNext}
          />
        </CardContent>
      </Card>

      <UbicacionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ubicacion={editingUbicacionCompleta}
        onSave={handleDialogSave}
      />
    </div>
  );
}
