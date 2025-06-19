
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, ArrowRight, ArrowLeft, Route, Calculator } from 'lucide-react';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { UbicacionFormDialog } from './ubicaciones/UbicacionFormDialog';
import { UbicacionCard } from './ubicaciones/UbicacionCard';
import { DistanceCalculator } from './ubicaciones/DistanceCalculator';

interface UbicacionesSectionProps {
  data: UbicacionCompleta[];
  onChange: (ubicaciones: UbicacionCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
  cartaPorteId?: string;
  onDistanceCalculated?: (datos: { distanciaTotal?: number; tiempoEstimado?: number }) => void;
}

export function UbicacionesSection({ 
  data, 
  onChange, 
  onNext, 
  onPrev, 
  cartaPorteId,
  onDistanceCalculated 
}: UbicacionesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState<UbicacionCompleta | null>(null);
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calcular automáticamente distancias cuando hay ubicaciones válidas
  useEffect(() => {
    const ubicacionesValidas = data.filter(u => 
      u.domicilio?.codigo_postal && 
      u.domicilio?.calle && 
      u.domicilio?.municipio &&
      u.domicilio?.estado
    );

    if (ubicacionesValidas.length >= 2 && !distanciaTotal) {
      console.log('🔄 Ubicaciones válidas detectadas, preparando auto-cálculo');
    }
  }, [data, distanciaTotal]);

  const handleAddUbicacion = () => {
    setEditingUbicacion(null);
    setIsDialogOpen(true);
  };

  const handleEditUbicacion = (ubicacion: UbicacionCompleta) => {
    setEditingUbicacion(ubicacion);
    setIsDialogOpen(true);
  };

  const handleSaveUbicacion = (ubicacion: UbicacionCompleta) => {
    if (editingUbicacion) {
      const updatedUbicaciones = data.map(u => 
        u.id_ubicacion === editingUbicacion.id_ubicacion ? ubicacion : u
      );
      onChange(updatedUbicaciones);
    } else {
      onChange([...data, ubicacion]);
    }
    setIsDialogOpen(false);
    setEditingUbicacion(null);
  };

  const handleDeleteUbicacion = (idUbicacion: string) => {
    const updatedUbicaciones = data.filter(u => u.id_ubicacion !== idUbicacion);
    onChange(updatedUbicaciones);
  };

  const handleDistanceCalculated = (distancia: number, tiempo: number) => {
    setDistanciaTotal(distancia);
    setTiempoEstimado(tiempo);
    
    // Persistir los datos de cálculo
    if (onDistanceCalculated) {
      onDistanceCalculated({
        distanciaTotal: distancia,
        tiempoEstimado: tiempo
      });
    }

    console.log('✅ Distancia calculada y persistida:', { distancia, tiempo });
  };

  const hasOrigen = data.some(u => u.tipo_ubicacion === 'Origen');
  const hasDestino = data.some(u => u.tipo_ubicacion === 'Destino');
  const canContinue = hasOrigen && hasDestino && data.length >= 2;

  // Ordenar ubicaciones por tipo
  const ubicacionesOrdenadas = [...data].sort((a, b) => {
    const orden = { 'Origen': 1, 'Paso Intermedio': 2, 'Destino': 3 };
    return (orden[a.tipo_ubicacion as keyof typeof orden] || 2) - 
           (orden[b.tipo_ubicacion as keyof typeof orden] || 2);
  });

  // Convertir UbicacionCompleta a un formato compatible con DistanceCalculator
  const ubicacionesParaCalculo = data.map(u => ({
    id: u.id,
    idUbicacion: u.id_ubicacion,
    tipoUbicacion: u.tipo_ubicacion,
    rfcRemitenteDestinatario: u.rfc_remitente_destinatario,
    nombreRemitenteDestinatario: u.nombre_remitente_destinatario,
    fechaHoraSalidaLlegada: u.fecha_hora_salida_llegada,
    distanciaRecorrida: u.distancia_recorrida,
    ordenSecuencia: 1, // Por ahora valor fijo
    coordenadas: u.coordenadas,
    domicilio: {
      pais: u.domicilio.pais,
      codigoPostal: u.domicilio.codigo_postal,
      estado: u.domicilio.estado,
      municipio: u.domicilio.municipio,
      colonia: u.domicilio.colonia,
      calle: u.domicilio.calle,
      numExterior: u.domicilio.numero_exterior,
      numInterior: u.domicilio.numero_interior,
      referencia: u.domicilio.referencia,
      localidad: '' // Campo requerido
    }
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicaciones de Carga y Descarga
              <Badge variant="outline">{data.length} ubicación(es)</Badge>
            </div>
            <Button onClick={handleAddUbicacion} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Ubicación
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Calculadora de Distancia */}
          <DistanceCalculator
            ubicaciones={ubicacionesParaCalculo}
            onDistanceCalculated={handleDistanceCalculated}
            distanciaTotal={distanciaTotal}
            tiempoEstimado={tiempoEstimado}
            isCalculating={isCalculating}
          />

          {/* Lista de ubicaciones */}
          {ubicacionesOrdenadas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay ubicaciones registradas</p>
              <p className="text-sm">Agrega al menos un origen y un destino</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ubicacionesOrdenadas.map((ubicacion, index) => (
                <UbicacionCard
                  key={ubicacion.id_ubicacion}
                  ubicacion={ubicacion}
                  index={index}
                  onEdit={() => handleEditUbicacion(ubicacion)}
                  onDelete={() => handleDeleteUbicacion(ubicacion.id_ubicacion)}
                />
              ))}
            </div>
          )}

          {/* Requerimientos */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Requerimientos:</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                {hasOrigen ? '✅' : '❌'} Al menos una ubicación de Origen
              </div>
              <div className="flex items-center gap-2">
                {hasDestino ? '✅' : '❌'} Al menos una ubicación de Destino
              </div>
              <div className="flex items-center gap-2">
                {distanciaTotal > 0 ? '✅' : '⏳'} Distancia total calculada ({distanciaTotal || 0} km)
              </div>
            </div>
          </div>

          {/* Navegación */}
          <div className="flex justify-between pt-4">
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
        existingUbicaciones={data}
      />
    </div>
  );
}
