
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, MapPin, Plus } from 'lucide-react';
import { Ubicacion } from '@/types/ubicaciones';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { UbicacionCard } from './UbicacionCard';
import { UbicacionFormDialog } from './UbicacionFormDialog';
import { OptimizedDistanceCalculator } from './OptimizedDistanceCalculator';
import { MapVisualization } from './MapVisualization';

interface UbicacionesSectionOptimizadaProps {
  ubicaciones: UbicacionCompleta[];
  distanciaTotal?: number;
  tiempoEstimado?: number;
  onChange: (ubicaciones: UbicacionCompleta[], distanciaTotal?: number, tiempoEstimado?: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Helper function to convert Ubicacion to UbicacionCompleta
const convertToUbicacionCompleta = (ubicacion: Ubicacion): UbicacionCompleta => {
  return {
    id: ubicacion.id,
    tipo_ubicacion: ubicacion.tipoUbicacion,
    id_ubicacion: ubicacion.idUbicacion || ubicacion.id,
    distancia_recorrida: ubicacion.distanciaRecorrida || 0,
    tipo_estacion: ubicacion.tipoEstacion || '1', // Default value
    domicilio: {
      pais: ubicacion.domicilio.pais,
      codigo_postal: ubicacion.domicilio.codigoPostal,
      estado: ubicacion.domicilio.estado,
      municipio: ubicacion.domicilio.municipio,
      colonia: ubicacion.domicilio.colonia,
      calle: ubicacion.domicilio.calle,
      numero_exterior: ubicacion.domicilio.numExterior || '',
      numero_interior: ubicacion.domicilio.numInterior,
      referencia: ubicacion.domicilio.referencia,
      localidad: ubicacion.domicilio.localidad
    },
    rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
    nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
    fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
    numero_estacion: ubicacion.numeroEstacion,
    kilometro: ubicacion.kilometro,
    coordenadas: ubicacion.coordenadas
  };
};

// Helper function to convert UbicacionCompleta to Ubicacion
const convertToUbicacion = (ubicacionCompleta: UbicacionCompleta): Ubicacion => {
  return {
    id: ubicacionCompleta.id || crypto.randomUUID(),
    idUbicacion: ubicacionCompleta.id_ubicacion,
    tipoUbicacion: ubicacionCompleta.tipo_ubicacion || 'Origen',
    ordenSecuencia: 1,
    rfcRemitenteDestinatario: ubicacionCompleta.rfc_remitente_destinatario,
    nombreRemitenteDestinatario: ubicacionCompleta.nombre_remitente_destinatario,
    fechaHoraSalidaLlegada: ubicacionCompleta.fecha_hora_salida_llegada,
    distanciaRecorrida: ubicacionCompleta.distancia_recorrida,
    coordenadas: ubicacionCompleta.coordenadas,
    domicilio: {
      pais: ubicacionCompleta.domicilio.pais,
      codigoPostal: ubicacionCompleta.domicilio.codigo_postal,
      estado: ubicacionCompleta.domicilio.estado,
      municipio: ubicacionCompleta.domicilio.municipio,
      colonia: ubicacionCompleta.domicilio.colonia,
      calle: ubicacionCompleta.domicilio.calle,
      numExterior: ubicacionCompleta.domicilio.numero_exterior,
      numInterior: ubicacionCompleta.domicilio.numero_interior,
      referencia: ubicacionCompleta.domicilio.referencia,
      localidad: ubicacionCompleta.domicilio.localidad
    },
    tipoEstacion: ubicacionCompleta.tipo_estacion,
    numeroEstacion: ubicacionCompleta.numero_estacion,
    kilometro: ubicacionCompleta.kilometro
  };
};

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
  };

  const handleEditUbicacion = (ubicacionCompleta: UbicacionCompleta) => {
    const ubicacion = convertToUbicacion(ubicacionCompleta);
    setEditingUbicacion(ubicacion);
    setIsDialogOpen(true);
  };

  const handleSaveUbicacion = (ubicacion: Ubicacion) => {
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

  const handleUbicacionesOptimizadas = (ubicacionesOptimizadas: UbicacionCompleta[]) => {
    onChange(ubicacionesOptimizadas, currentDistanceTotal, currentTimeEstimate);
  };

  const canContinue = ubicaciones.length >= 2 && 
    ubicaciones.some(u => u.tipo_ubicacion === 'Origen') &&
    ubicaciones.some(u => u.tipo_ubicacion === 'Destino') &&
    currentDistanceTotal > 0;

  const tieneOrigen = ubicaciones.some(u => u.tipo_ubicacion === 'Origen');
  const tieneDestino = ubicaciones.some(u => u.tipo_ubicacion === 'Destino');

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
                .sort((a, b) => (a.id || '').localeCompare(b.id || ''))
                .map((ubicacion, index) => (
                  <UbicacionCard
                    key={ubicacion.id}
                    ubicacion={ubicacion}
                    index={index}
                    onEdit={() => handleEditUbicacion(ubicacion)}
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
                {ubicaciones.every(u => u.domicilio.codigo_postal && u.domicilio.municipio) ? '✅' : '❌'} 
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
      />
    </div>
  );
}
