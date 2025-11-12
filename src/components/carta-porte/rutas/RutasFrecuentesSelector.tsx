import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Zap, Trash2, Save, Clock, Route } from 'lucide-react';
import { useRutasFrecuentes } from '@/hooks/carta-porte/useRutasFrecuentes';
import { toast } from 'sonner';

interface RutasFrecuentesSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAplicarRuta: (origen: any, destino: any) => void;
  ubicacionesActuales?: any[];
  distanciaActual?: number;
  tiempoActual?: number;
}

export function RutasFrecuentesSelector({
  open,
  onOpenChange,
  onAplicarRuta,
  ubicacionesActuales = [],
  distanciaActual,
  tiempoActual
}: RutasFrecuentesSelectorProps) {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [nombreRuta, setNombreRuta] = useState('');
  const [descripcionRuta, setDescripcionRuta] = useState('');

  const {
    rutas,
    isLoading,
    guardarRuta,
    aplicarRuta,
    eliminarRuta,
    getRutasMasUsadas
  } = useRutasFrecuentes();

  const rutasMasUsadas = getRutasMasUsadas(6);

  const handleAplicarRuta = async (rutaId: string) => {
    const resultado = await aplicarRuta(rutaId);
    if (resultado) {
      onAplicarRuta(resultado.origen, resultado.destino);
      toast.success('✅ Ruta aplicada exitosamente');
      onOpenChange(false);
    }
  };

  const handleGuardarRutaActual = async () => {
    if (!nombreRuta.trim()) {
      toast.error('Por favor ingrese un nombre para la ruta');
      return;
    }

    const origen = ubicacionesActuales.find(u => u.tipoUbicacion === 'Origen');
    const destino = ubicacionesActuales.find(u => u.tipoUbicacion === 'Destino');

    if (!origen || !destino) {
      toast.error('Debe tener al menos un origen y un destino');
      return;
    }

    await guardarRuta(
      origen,
      destino,
      nombreRuta,
      descripcionRuta,
      distanciaActual,
      tiempoActual
    );

    setNombreRuta('');
    setDescripcionRuta('');
    setShowSaveForm(false);
  };

  const formatearDistancia = (km?: number) => {
    if (!km) return 'No calculada';
    return `${km.toFixed(0)} km`;
  };

  const formatearTiempo = (minutos?: number) => {
    if (!minutos) return 'No calculado';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Zap className="h-6 w-6 text-primary" />
            Rutas Frecuentes
          </DialogTitle>
          <DialogDescription>
            Selecciona una ruta guardada o guarda la ruta actual para usarla después
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Guardar Ruta Actual */}
          {ubicacionesActuales.length >= 2 && !showSaveForm && (
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">¿Te gusta esta ruta?</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Guárdala para usarla más rápido la próxima vez
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowSaveForm(true)}
                    variant="default"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Guardar Ruta
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulario de guardado */}
          {showSaveForm && (
            <Card className="border-primary">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreRuta">Nombre de la Ruta *</Label>
                  <Input
                    id="nombreRuta"
                    placeholder="Ej: CDMX → Tijuana"
                    value={nombreRuta}
                    onChange={(e) => setNombreRuta(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcionRuta">Descripción (opcional)</Label>
                  <Textarea
                    id="descripcionRuta"
                    placeholder="Ej: Ruta directa por autopista"
                    value={descripcionRuta}
                    onChange={(e) => setDescripcionRuta(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleGuardarRutaActual} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Rutas Guardadas */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Route className="h-4 w-4" />
              Tus Rutas Más Usadas
            </h3>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando rutas...
              </div>
            ) : rutasMasUsadas.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Aún no tienes rutas guardadas
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Crea una carta porte y guarda la ruta para verla aquí
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rutasMasUsadas.map((ruta) => (
                  <Card
                    key={ruta.id}
                    className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                            {ruta.nombre_ruta}
                          </h4>
                          {ruta.descripcion && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {ruta.descripcion}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {ruta.uso_count} {ruta.uso_count === 1 ? 'uso' : 'usos'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{formatearDistancia(ruta.distancia_km)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatearTiempo(ruta.tiempo_estimado_minutos)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAplicarRuta(ruta.id)}
                          size="sm"
                          className="flex-1"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Usar Ruta
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarRuta(ruta.id);
                          }}
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
