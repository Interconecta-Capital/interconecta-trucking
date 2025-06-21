
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, ArrowRight, FileText, Route } from 'lucide-react';
import { ViajeCartaPorteMapper } from '@/services/viajes/ViajeCartaPorteMapper';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { CartaPorteData } from '@/types/cartaPorte';
import { toast } from 'sonner';

interface MigracionDatosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datos: ViajeWizardData | CartaPorteData;
  tipoOrigen: 'viaje' | 'carta_porte';
  onMigrar: (datosMigrados: any) => void;
}

export function MigracionDatosModal({ 
  open, 
  onOpenChange, 
  datos, 
  tipoOrigen, 
  onMigrar 
}: MigracionDatosModalProps) {
  const [cargando, setCargando] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [validacion, setValidacion] = useState<{
    valido: boolean;
    errores: string[];
    warnings: string[];
  } | null>(null);

  const generarPreview = () => {
    try {
      let datosMigrados;
      
      if (tipoOrigen === 'viaje') {
        datosMigrados = ViajeCartaPorteMapper.migrarViajeACartaPorte(datos as ViajeWizardData);
        const validacionResult = ViajeCartaPorteMapper.validarCumplimientoSAT(datosMigrados);
        setValidacion(validacionResult);
      } else {
        datosMigrados = ViajeCartaPorteMapper.migrarCartaPorteAViaje(datos as CartaPorteData);
        // Para viajes, validación más simple
        setValidacion({
          valido: true,
          errores: [],
          warnings: datosMigrados.cliente ? [] : ['No se pudo identificar cliente']
        });
      }
      
      setPreview(datosMigrados);
    } catch (error) {
      console.error('Error generando preview:', error);
      toast.error('Error al procesar los datos para migración');
    }
  };

  const ejecutarMigracion = async () => {
    if (!preview) return;
    
    setCargando(true);
    try {
      await onMigrar(preview);
      toast.success(`Datos migrados exitosamente de ${tipoOrigen} a ${tipoOrigen === 'viaje' ? 'carta porte' : 'viaje'}`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error en migración:', error);
      toast.error('Error al migrar los datos');
    } finally {
      setCargando(false);
    }
  };

  const tipoDestino = tipoOrigen === 'viaje' ? 'carta_porte' : 'viaje';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tipoOrigen === 'viaje' ? <Route className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            Migración de Datos: {tipoOrigen === 'viaje' ? 'Viaje → Carta Porte' : 'Carta Porte → Viaje'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de migración */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Migración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {tipoOrigen === 'viaje' ? <Route className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  <span className="font-medium">
                    {tipoOrigen === 'viaje' ? 'Viaje' : 'Carta Porte'}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <div className="flex items-center gap-2">
                  {tipoDestino === 'viaje' ? <Route className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  <span className="font-medium">
                    {tipoDestino === 'viaje' ? 'Viaje' : 'Carta Porte'}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                {tipoOrigen === 'viaje' 
                  ? 'Esta migración creará una carta porte SAT v3.1 compatible con los datos del viaje.'
                  : 'Esta migración extraerá los datos de la carta porte para crear un nuevo viaje.'
                }
              </p>
            </CardContent>
          </Card>

          {/* Botón para generar preview */}
          {!preview && (
            <div className="text-center">
              <Button onClick={generarPreview} variant="outline">
                Generar Vista Previa de Migración
              </Button>
            </div>
          )}

          {/* Validación SAT */}
          {validacion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {validacion.valido ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  Validación {tipoOrigen === 'viaje' ? 'SAT v3.1' : 'de Datos'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={validacion.valido ? 'default' : 'destructive'}>
                    {validacion.valido ? 'VÁLIDO' : 'ERRORES ENCONTRADOS'}
                  </Badge>
                </div>

                {validacion.errores.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Errores que deben corregirse:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {validacion.errores.map((error, index) => (
                        <li key={index} className="text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validacion.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Advertencias:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {validacion.warnings.map((warning, index) => (
                        <li key={index} className="text-orange-600">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preview de datos migrados */}
          {preview && (
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa de Datos Migrados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tipoOrigen === 'viaje' ? (
                    // Preview de carta porte
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Emisor/Receptor</h4>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">RFC Receptor:</span> {preview.rfcReceptor || 'No especificado'}</p>
                          <p><span className="font-medium">Nombre:</span> {preview.nombreReceptor || 'No especificado'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Ubicaciones</h4>
                        <div className="text-sm">
                          <p>{preview.ubicaciones?.length || 0} ubicaciones configuradas</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Mercancías</h4>
                        <div className="text-sm">
                          <p>{preview.mercancias?.length || 0} mercancías</p>
                          {preview.mercancias?.[0] && (
                            <p className="text-gray-600">{preview.mercancias[0].descripcion}</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Autotransporte</h4>
                        <div className="text-sm">
                          {preview.autotransporte ? (
                            <p>Placa: {preview.autotransporte.placa_vm}</p>
                          ) : (
                            <p className="text-gray-500">No configurado</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Preview de viaje
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Cliente</h4>
                        <div className="text-sm space-y-1">
                          {preview.cliente ? (
                            <>
                              <p><span className="font-medium">RFC:</span> {preview.cliente.rfc}</p>
                              <p><span className="font-medium">Nombre:</span> {preview.cliente.nombre_razon_social}</p>
                            </>
                          ) : (
                            <p className="text-gray-500">No identificado</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Ruta</h4>
                        <div className="text-sm space-y-1">
                          {preview.origen && <p><span className="font-medium">Origen:</span> {preview.origen.direccion}</p>}
                          {preview.destino && <p><span className="font-medium">Destino:</span> {preview.destino.direccion}</p>}
                          {preview.distanciaRecorrida && <p><span className="font-medium">Distancia:</span> {preview.distanciaRecorrida} km</p>}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Vehículo</h4>
                        <div className="text-sm">
                          {preview.vehiculo ? (
                            <p>Placa: {preview.vehiculo.placa}</p>
                          ) : (
                            <p className="text-gray-500">No identificado</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Conductor</h4>
                        <div className="text-sm">
                          {preview.conductor ? (
                            <p>{preview.conductor.nombre}</p>
                          ) : (
                            <p className="text-gray-500">No identificado</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            
            {preview && (
              <Button 
                onClick={ejecutarMigracion}
                disabled={cargando || (validacion && !validacion.valido)}
                className="min-w-[120px]"
              >
                {cargando ? 'Migrando...' : 'Ejecutar Migración'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
