
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, MapPin, Edit, Trash2, Navigation, AlertTriangle, Map } from 'lucide-react';
import { UbicacionFormMejorado } from './UbicacionFormMejorado';
import { MapVisualization } from './MapVisualization';
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
    rutaCalculada
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
    setShowForm(true);
  };

  const handleEditarUbicacion = (index: number) => {
    setEditingIndex(index);
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

  const validacion = validarSecuenciaUbicaciones();
  const distanciaTotal = calcularDistanciaTotal();

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Origen': return 'bg-green-100 text-green-800';
      case 'Destino': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (showForm) {
    return (
      <UbicacionFormMejorado
        ubicacion={editingIndex !== null ? ubicaciones[editingIndex] : undefined}
        onSave={handleGuardarUbicacion}
        onCancel={handleCancelarForm}
        generarId={generarIdUbicacion}
      />
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Ubicaciones de Carga y Descarga</span>
            {ubicaciones.length > 0 && (
              <Badge variant="secondary">
                {ubicaciones.length} ubicación(es)
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex space-x-2">
            {ubicaciones.length >= 2 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCalcularDistancias}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Calcular Distancias
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCalcularRuta}
                >
                  <Map className="h-4 w-4 mr-2" />
                  Ver Ruta
                </Button>
              </>
            )}
            
            <Button
              type="button"
              onClick={handleAgregarUbicacion}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ubicación
            </Button>
          </div>
        </div>

        {!validacion.valido && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{validacion.mensaje}</AlertDescription>
          </Alert>
        )}

        {distanciaTotal > 0 && (
          <div className="text-sm text-muted-foreground">
            Distancia total estimada: <strong>{distanciaTotal.toFixed(2)} km</strong>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {ubicaciones.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay ubicaciones agregadas
            </h3>
            <p className="text-gray-500 mb-4">
              Agrega las ubicaciones de origen, destino y puntos intermedios para tu carta porte.
            </p>
            <Button
              onClick={handleAgregarUbicacion}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primera Ubicación
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {ubicaciones.map((ubicacion, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getTipoColor(ubicacion.tipoUbicacion)}>
                          {ubicacion.tipoUbicacion}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {ubicacion.idUbicacion}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-lg mb-1">
                        {ubicacion.nombreRemitenteDestinatario}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        RFC: {ubicacion.rfcRemitenteDestinatario}
                      </p>
                      
                      <div className="text-sm text-gray-600">
                        <p>
                          {ubicacion.domicilio?.calle} {ubicacion.domicilio?.numExterior}
                          {ubicacion.domicilio?.numInterior && ` Int. ${ubicacion.domicilio.numInterior}`}
                        </p>
                        <p>
                          {ubicacion.domicilio?.colonia}, {ubicacion.domicilio?.municipio}
                        </p>
                        <p>
                          {ubicacion.domicilio?.estado} {ubicacion.domicilio?.codigoPostal}
                        </p>
                      </div>

                      {ubicacion.fechaHoraSalidaLlegada && (
                        <p className="text-sm text-blue-600 mt-2">
                          {ubicacion.tipoUbicacion === 'Origen' ? 'Salida' : 'Llegada'}: {' '}
                          {new Date(ubicacion.fechaHoraSalidaLlegada).toLocaleString()}
                        </p>
                      )}

                      {ubicacion.distanciaRecorrida > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Distancia: {ubicacion.distanciaRecorrida} km
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarUbicacion(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEliminarUbicacion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showMap && rutaCalculada && (
          <div className="mt-6">
            <MapVisualization 
              ubicaciones={ubicaciones}
              rutaCalculada={rutaCalculada}
              isVisible={showMap}
            />
          </div>
        )}

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
          >
            Anterior
          </Button>
          
          <Button
            type="button"
            onClick={onNext}
            disabled={ubicaciones.length === 0 || !validacion.valido}
            className="bg-green-600 hover:bg-green-700"
          >
            Continuar a Mercancías
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
