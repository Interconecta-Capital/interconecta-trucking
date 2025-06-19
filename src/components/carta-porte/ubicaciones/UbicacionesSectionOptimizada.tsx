import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, MapPin, Plus } from 'lucide-react';
import { Ubicacion } from '@/types/ubicaciones';
import { UbicacionCard } from './UbicacionCard';
import { UbicacionFormDialog } from './UbicacionFormDialog';
import { OptimizedDistanceCalculator } from './OptimizedDistanceCalculator';
import { MapVisualization } from './MapVisualization';

interface UbicacionesSectionOptimizadaProps {
  ubicaciones: Ubicacion[];
  distanciaTotal?: number;
  tiempoEstimado?: number;
  onChange: (ubicaciones: Ubicacion[], distanciaTotal?: number, tiempoEstimado?: number) => void;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [currentDistanceTotal, setCurrentDistanceTotal] = useState(distanciaTotal || 0);
  const [currentTimeEstimate, setCurrentTimeEstimate] = useState(tiempoEstimado || 0);

  const handleAddUbicacion = () => {
    const newUbicacion: Ubicacion = {
      id: crypto.randomUUID(),
      idUbicacion: '',
      tipoUbicacion: ubicaciones.length === 0 ? 'Origen' : 'Destino',
      ordenSecuencia: ubicaciones.length + 1,
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
  };

  const handleEditUbicacion = (ubicacion: Ubicacion) => {
    setEditingUbicacion(ubicacion);
    setIsDialogOpen(true);
  };

  const handleSaveUbicacion = (ubicacion: Ubicacion) => {
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
  };

  const handleDeleteUbicacion = (id: string) => {
    const filteredUbicaciones = ubicaciones.filter(u => u.id !== id);
    onChange(filteredUbicaciones, currentDistanceTotal, currentTimeEstimate);
  };

  const handleDistanceCalculated = (distancia: number, tiempo: number) => {
    setCurrentDistanceTotal(distancia);
    setCurrentTimeEstimate(tiempo);
    onChange(ubicaciones, distancia, tiempo);
  };

  const handleUbicacionesOptimizadas = (ubicacionesOptimizadas: Ubicacion[]) => {
    onChange(ubicacionesOptimizadas, currentDistanceTotal, currentTimeEstimate);
  };

  const canContinue = ubicaciones.length >= 2 && 
    ubicaciones.some(u => u.tipoUbicacion === 'Origen') &&
    ubicaciones.some(u => u.tipoUbicacion === 'Destino') &&
    currentDistanceTotal > 0;

  const tieneOrigen = ubicaciones.some(u => u.tipoUbicacion === 'Origen');
  const tieneDestino = ubicaciones.some(u => u.tipoUbicacion === 'Destino');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicaciones de Transporte
              <Badge variant="outline">{ubicaciones.length} ubicación(es)</Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddUbicacion} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Ubicación
              </Button>
              {ubicaciones.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowMap(!showMap)}
                >
                  {showMap ? 'Ocultar Mapa' : 'Ver Mapa'}
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Lista de Ubicaciones */}
          {ubicaciones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay ubicaciones registradas</p>
              <p className="text-sm">Agrega al menos un origen y un destino</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ubicaciones
                .sort((a, b) => a.ordenSecuencia - b.ordenSecuencia)
                .map((ubicacion, index) => (
                  <UbicacionCard
                    key={ubicacion.id}
                    ubicacion={ubicacion}
                    index={index}
                    onEdit={() => handleEditUbicacion(ubicacion)}
                    onDelete={() => handleDeleteUbicacion(ubicacion.id)}
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
              distanciaTotal={currentDistanceTotal}
              tiempoEstimado={currentTimeEstimate}
            />
          )}

          {/* Validaciones */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Validaciones SAT v3.1:</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                {tieneOrigen ? '✅' : '❌'} Al menos una ubicación de origen
              </div>
              <div className="flex items-center gap-2">
                {tieneDestino ? '✅' : '❌'} Al menos una ubicación de destino
              </div>
              <div className="flex items-center gap-2">
                {currentDistanceTotal > 0 ? '✅' : '❌'} Distancia total calculada (obligatorio SAT)
              </div>
              <div className="flex items-center gap-2">
                {ubicaciones.every(u => u.domicilio.codigoPostal && u.domicilio.municipio) ? '✅' : '❌'} 
                Domicilios completos en todas las ubicaciones
              </div>
            </div>
          </div>

          {/* Mapa de visualización */}
          {showMap && (
            <MapVisualization
              ubicaciones={ubicaciones}
              isVisible={showMap}
              distanciaTotal={currentDistanceTotal}
              tiempoEstimado={currentTimeEstimate}
            />
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button 
              onClick={onNext} 
              disabled={!canContinue}
              className="flex items-center gap-2"
            >
              Continuar a Mercancías
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <UbicacionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ubicacion={editingUbicacion}
        onSave={handleSaveUbicacion}
        mode={editingUbicacion ? 'edit' : 'add'}
      />
    </div>
  );
}
