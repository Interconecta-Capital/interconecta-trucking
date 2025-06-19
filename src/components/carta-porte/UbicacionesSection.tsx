
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, ArrowRight, ArrowLeft, Route, Calculator, CheckCircle } from 'lucide-react';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { UbicacionFormDialog } from './ubicaciones/UbicacionFormDialog';
import { UbicacionCard } from './ubicaciones/UbicacionCard';
import { DistanceCalculator } from './ubicaciones/DistanceCalculator';
import { DistanceCalculationService } from '@/services/distanceCalculationService';
import { Ubicacion } from '@/types/ubicaciones';
import { useToast } from '@/hooks/use-toast';

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
  const [calculationStatus, setCalculationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const { toast } = useToast();

  // Helper function to convert UbicacionCompleta to Ubicacion
  const convertToUbicacion = (ubicacionCompleta: UbicacionCompleta): Ubicacion => {
    return {
      id: ubicacionCompleta.id || crypto.randomUUID(),
      idUbicacion: ubicacionCompleta.id_ubicacion,
      tipoUbicacion: (ubicacionCompleta.tipo_ubicacion as 'Origen' | 'Destino' | 'Paso Intermedio') || 'Origen',
      rfcRemitenteDestinatario: ubicacionCompleta.rfc_remitente_destinatario,
      nombreRemitenteDestinatario: ubicacionCompleta.nombre_remitente_destinatario,
      fechaHoraSalidaLlegada: ubicacionCompleta.fecha_hora_salida_llegada,
      distanciaRecorrida: ubicacionCompleta.distancia_recorrida,
      ordenSecuencia: 1,
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
        localidad: ubicacionCompleta.domicilio.municipio
      }
    };
  };

  // Auto-calcular distancias cuando hay ubicaciones válidas
  useEffect(() => {
    const ubicacionesValidas = data.filter(u => 
      u.domicilio?.codigo_postal && 
      u.domicilio?.calle && 
      u.domicilio?.municipio &&
      u.domicilio?.estado
    );

    if (ubicacionesValidas.length >= 2 && !distanciaTotal && !isCalculating) {
      console.log('🔄 Auto-calculando distancias con ubicaciones válidas');
      handleAutoCalculateDistances();
    }
  }, [data.length, distanciaTotal, isCalculating]);

  const handleAutoCalculateDistances = async () => {
    setIsCalculating(true);
    setCalculationStatus('pending');
    
    try {
      // Convert UbicacionCompleta to Ubicacion format for the service
      const ubicacionesParaCalculo: Ubicacion[] = data.map((u, index) => ({
        ...convertToUbicacion(u),
        ordenSecuencia: index + 1
      }));

      const resultado = await DistanceCalculationService.calcularDistanciaReal(ubicacionesParaCalculo);
      
      // Actualizar distancias calculadas en las ubicaciones
      const ubicacionesActualizadas = data.map((ubicacion, index) => {
        const ubicacionCalculada = resultado.ubicacionesConDistancia[index];
        return {
          ...ubicacion,
          distancia_recorrida: ubicacionCalculada?.distanciaRecorrida || ubicacion.distancia_recorrida
        };
      });

      onChange(ubicacionesActualizadas);
      setDistanciaTotal(resultado.distanciaTotal);
      setTiempoEstimado(resultado.tiempoEstimado);
      setCalculationStatus('success');

      // Notificar al componente padre
      if (onDistanceCalculated) {
        onDistanceCalculated({
          distanciaTotal: resultado.distanciaTotal,
          tiempoEstimado: resultado.tiempoEstimado
        });
      }

      toast({
        title: "✅ Distancias calculadas",
        description: `Distancia total: ${resultado.distanciaTotal} km. Tiempo estimado: ${Math.round(resultado.tiempoEstimado / 60)}h ${resultado.tiempoEstimado % 60}m`,
      });

    } catch (error) {
      console.error('❌ Error calculando distancias:', error);
      setCalculationStatus('error');
      
      toast({
        title: "Error calculando distancias",
        description: "No se pudieron calcular las distancias automáticamente. Puede ingresarlas manualmente.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

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
    
    // Reset cálculo para que se recalcule automáticamente
    setDistanciaTotal(0);
    setCalculationStatus('pending');
  };

  const handleDeleteUbicacion = (idUbicacion: string) => {
    const updatedUbicaciones = data.filter(u => u.id_ubicacion !== idUbicacion);
    onChange(updatedUbicaciones);
    
    // Reset cálculo
    setDistanciaTotal(0);
    setCalculationStatus('pending');
  };

  const handleDistanceCalculated = (distancia: number, tiempo: number) => {
    setDistanciaTotal(distancia);
    setTiempoEstimado(tiempo);
    setCalculationStatus('success');
    
    if (onDistanceCalculated) {
      onDistanceCalculated({
        distanciaTotal: distancia,
        tiempoEstimado: tiempo
      });
    }
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

  // Convert for DistanceCalculator
  const ubicacionesParaCalculador: Ubicacion[] = data.map(convertToUbicacion);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicaciones de Carga y Descarga
              <Badge variant="outline">{data.length} ubicación(es)</Badge>
              {calculationStatus === 'success' && distanciaTotal > 0 && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {distanciaTotal} km calculados
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {data.length >= 2 && calculationStatus !== 'success' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoCalculateDistances}
                  disabled={isCalculating}
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  {isCalculating ? 'Calculando...' : 'Calcular Distancias'}
                </Button>
              )}
              <Button onClick={handleAddUbicacion} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Agregar Ubicación
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Calculadora de Distancia Mejorada */}
          {data.length >= 2 && (
            <DistanceCalculator
              ubicaciones={ubicacionesParaCalculador}
              onDistanceCalculated={handleDistanceCalculated}
              distanciaTotal={distanciaTotal}
              tiempoEstimado={tiempoEstimado}
              isCalculating={isCalculating}
            />
          )}

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
