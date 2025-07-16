import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, X, Navigation, Clock } from "lucide-react";
import { UbicacionesSectionOptimizada } from "@/components/carta-porte/ubicaciones/UbicacionesSectionOptimizada";

interface CotizacionRouteProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function CotizacionRoute({ formData, updateFormData }: CotizacionRouteProps) {
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [showSimpleForm, setShowSimpleForm] = useState(true);

  // Inicializar ubicaciones desde formData
  useEffect(() => {
    const ubicacionesIniciales = [];
    
    if (formData.origen) {
      ubicacionesIniciales.push({
        idUbicacion: 'OR000001',
        tipoUbicacion: 'Origen',
        rfcRemitenteDestinatario: 'XAXX010101000',
        nombreRemitenteDestinatario: 'Origen',
        domicilio: {
          calle: formData.origen,
          codigoPostal: '00000',
          colonia: 'Centro',
          municipio: 'Ciudad',
          estado: 'Estado',
          pais: 'MEX'
        },
        fechaHoraSalidaLlegada: new Date().toISOString()
      });
    }

    if (formData.destino) {
      ubicacionesIniciales.push({
        idUbicacion: 'DE000001',
        tipoUbicacion: 'Destino',
        rfcRemitenteDestinatario: 'XAXX010101000',
        nombreRemitenteDestinatario: 'Destino',
        domicilio: {
          calle: formData.destino,
          codigoPostal: '00000',
          colonia: 'Centro',
          municipio: 'Ciudad',
          estado: 'Estado',
          pais: 'MEX'
        },
        fechaHoraSalidaLlegada: new Date().toISOString(),
        distanciaRecorrida: formData.distancia_total || 0
      });
    }

    // Agregar ubicaciones intermedias
    (formData.ubicaciones_intermedias || []).forEach((ubicacion: any, index: number) => {
      if (ubicacion?.direccion?.trim() || typeof ubicacion === 'string') {
        const direccion = typeof ubicacion === 'string' ? ubicacion : ubicacion.direccion;
        ubicacionesIniciales.push({
          idUbicacion: `PI${String(index + 1).padStart(5, '0')}`,
          tipoUbicacion: 'Paso Intermedio',
          domicilio: {
            calle: direccion,
            codigoPostal: '00000',
            colonia: 'Centro',
            municipio: 'Ciudad',
            estado: 'Estado',
            pais: 'MEX'
          }
        });
      }
    });

    if (ubicacionesIniciales.length > 0) {
      setUbicaciones(ubicacionesIniciales);
      setShowSimpleForm(false);
    }
  }, [formData.origen, formData.destino, formData.ubicaciones_intermedias]);

  const handleUbicacionesChange = (nuevasUbicaciones: any[]) => {
    setUbicaciones(nuevasUbicaciones);
    
    // Extraer origen y destino
    const origen = nuevasUbicaciones.find(u => u.tipoUbicacion === 'Origen');
    const destino = nuevasUbicaciones.find(u => u.tipoUbicacion === 'Destino');
    const intermedias = nuevasUbicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio');

    updateFormData({
      origen: origen?.domicilio?.calle || '',
      destino: destino?.domicilio?.calle || '',
      ubicaciones_intermedias: intermedias.map(u => ({
        direccion: u.domicilio?.calle || '',
        id: u.idUbicacion
      }))
    });
  };

  const handleDistanceCalculated = (datos: { distanciaTotal?: number; tiempoEstimado?: number }) => {
    console.log('✅ Distancia calculada en CotizacionRoute:', datos);
    updateFormData({
      distancia_total: datos.distanciaTotal || 0,
      tiempo_estimado: datos.tiempoEstimado || 0,
      mapa_datos: {
        calculado: true,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Funciones para el modo simple
  const [newUbicacion, setNewUbicacion] = useState("");

  const addUbicacionIntermedia = () => {
    if (newUbicacion.trim()) {
      const nuevasUbicaciones = [...(formData.ubicaciones_intermedias || []), {
        direccion: newUbicacion.trim(),
        id: Date.now().toString()
      }];
      updateFormData({ ubicaciones_intermedias: nuevasUbicaciones });
      setNewUbicacion("");
    }
  };

  const removeUbicacionIntermedia = (index: number) => {
    const nuevasUbicaciones = formData.ubicaciones_intermedias.filter((_: any, i: number) => i !== index);
    updateFormData({ ubicaciones_intermedias: nuevasUbicaciones });
  };

  // Si ya hay ubicaciones definidas, usar el componente optimizado
  if (!showSimpleForm && ubicaciones.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ruta y Ubicaciones</h3>
          <Button 
            variant="outline" 
            onClick={() => setShowSimpleForm(true)}
            size="sm"
          >
            Editar Simple
          </Button>
        </div>
        <UbicacionesSectionOptimizada
          data={ubicaciones}
          onChange={handleUbicacionesChange}
          onNext={() => {}}
          onPrev={() => {}}
          onDistanceCalculated={handleDistanceCalculated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ubicaciones Principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicaciones Principales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="origen">Origen *</Label>
              <Input
                id="origen"
                value={formData.origen || ""}
                onChange={(e) => updateFormData({ origen: e.target.value })}
                placeholder="Dirección de origen"
              />
            </div>
            <div>
              <Label htmlFor="destino">Destino *</Label>
              <Input
                id="destino"
                value={formData.destino || ""}
                onChange={(e) => updateFormData({ destino: e.target.value })}
                placeholder="Dirección de destino"
              />
            </div>
          </div>

          {(formData.origen && formData.destino) && (
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowSimpleForm(false)}
                variant="outline"
              >
                Usar Calculadora Avanzada con Mapa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ubicaciones Intermedias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Paradas Intermedias (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newUbicacion}
              onChange={(e) => setNewUbicacion(e.target.value)}
              placeholder="Dirección de parada intermedia"
              onKeyPress={(e) => e.key === 'Enter' && addUbicacionIntermedia()}
            />
            <Button onClick={addUbicacionIntermedia} disabled={!newUbicacion.trim()}>
              Agregar
            </Button>
          </div>

          {formData.ubicaciones_intermedias?.length > 0 && (
            <div className="space-y-2">
              <Label>Paradas Programadas:</Label>
              <div className="space-y-2">
                {formData.ubicaciones_intermedias.map((ubicacion: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{ubicacion.direccion || ubicacion}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUbicacionIntermedia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Ruta Calculada */}
      {formData.distancia_total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Información de la Ruta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{formData.distancia_total} km</div>
                <div className="text-sm text-muted-foreground">Distancia Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.floor((formData.tiempo_estimado || 0) / 60)}h {(formData.tiempo_estimado || 0) % 60}min
                </div>
                <div className="text-sm text-muted-foreground">Tiempo Estimado</div>
              </div>
            </div>

            {/* Resumen de Ruta */}
            <div className="space-y-2 mt-4">
              <Label>Resumen de la Ruta:</Label>
              <div className="p-3 border rounded-lg space-y-2">
                {formData.origen && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50">Inicio</Badge>
                    <span className="text-sm">{formData.origen}</span>
                  </div>
                )}
                
                {formData.ubicaciones_intermedias?.map((ubicacion: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-50">Parada {index + 1}</Badge>
                    <span className="text-sm">{ubicacion.direccion || ubicacion}</span>
                  </div>
                ))}
                
                {formData.destino && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-50">Final</Badge>
                    <span className="text-sm">{formData.destino}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}