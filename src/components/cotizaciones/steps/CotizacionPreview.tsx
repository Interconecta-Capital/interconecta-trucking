import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  MapPin, 
  Clock, 
  Truck, 
  User, 
  DollarSign,
  Building,
  Calendar,
  Route
} from "lucide-react";

interface CotizacionPreviewProps {
  formData: any;
}

export function CotizacionPreview({ formData }: CotizacionPreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (days: number) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + days);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header de la Cotización */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{formData.nombre_cotizacion}</CardTitle>
              <p className="text-muted-foreground">Vista previa de la cotización</p>
            </div>
            <Badge className="bg-blue-500 text-white">
              Vista Previa
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Información del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.cliente_tipo === 'nuevo' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nombre/Razón Social</p>
                <p className="font-medium">{formData.cliente_nuevo_datos?.nombre || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RFC</p>
                <p className="font-medium">{formData.cliente_nuevo_datos?.rfc || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{formData.cliente_nuevo_datos?.email || "No especificado"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teléfono</p>
                <p className="font-medium">{formData.cliente_nuevo_datos?.telefono || "No especificado"}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground">Cliente Existente</p>
              <p className="font-medium">{formData.cliente_existente_id || "No seleccionado"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalles de la Ruta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Detalles del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Origen
              </p>
              <p className="font-medium">{formData.origen || "No especificado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Destino
              </p>
              <p className="font-medium">{formData.destino || "No especificado"}</p>
            </div>
          </div>

          {formData.ubicaciones_intermedias?.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Paradas Intermedias</p>
              <div className="space-y-1">
                {formData.ubicaciones_intermedias.map((ubicacion: any, index: number) => (
                  <p key={index} className="text-sm">• {ubicacion.direccion}</p>
                ))}
              </div>
            </div>
          )}

          {formData.distancia_total > 0 && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Distancia Total</p>
                <p className="font-semibold">{formData.distancia_total} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Tiempo Estimado
                </p>
                <p className="font-semibold">
                  {Math.floor(formData.tiempo_estimado / 60)}h {formData.tiempo_estimado % 60}min
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recursos Asignados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Recursos Asignados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.vehiculo_id && (
            <div className="flex items-center gap-3 p-2 border rounded">
              <Truck className="h-5 w-5 text-blue-500" />
              <span>Vehículo ID: {formData.vehiculo_id}</span>
            </div>
          )}
          
          {formData.conductor_id && (
            <div className="flex items-center gap-3 p-2 border rounded">
              <User className="h-5 w-5 text-green-500" />
              <span>Conductor ID: {formData.conductor_id}</span>
            </div>
          )}
          
          {formData.remolque_id && (
            <div className="flex items-center gap-3 p-2 border rounded">
              <Truck className="h-5 w-5 text-purple-500" />
              <span>Remolque ID: {formData.remolque_id}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información Financiera */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cotización Financiera
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resumen para el Cliente (Solo precio final) */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-semibold mb-2">Para el Cliente:</h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(formData.precio_cotizado)}
              </div>
              <div className="text-sm text-muted-foreground">Precio Total del Servicio</div>
            </div>
          </div>

          <Separator />

          {/* Desglose Interno (No visible para el cliente) */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Desglose Interno (Confidencial)
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Costo Total</p>
                <p className="font-semibold">{formatCurrency(formData.costo_total_interno)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Margen ({formData.margen_ganancia}%)</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(formData.precio_cotizado - formData.costo_total_interno)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Precio Final</p>
                <p className="font-semibold text-primary">{formatCurrency(formData.precio_cotizado)}</p>
              </div>
            </div>
          </div>

          {/* Desglose de Costos Internos */}
          {Object.keys(formData.costos_internos || {}).length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium">Desglose de Costos:</h5>
              <div className="grid grid-cols-2 gap-1 text-sm">
                {Object.entries(formData.costos_internos).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="capitalize text-muted-foreground">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span>{formatCurrency(value as number)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Condiciones y Validez */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Condiciones y Validez
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Validez de la Cotización</p>
            <p className="font-medium">
              Válida hasta el {formatDate(formData.tiempo_validez_dias)} 
              ({formData.tiempo_validez_dias} días)
            </p>
          </div>
          
          {formData.condiciones_comerciales && (
            <div>
              <p className="text-sm text-muted-foreground">Condiciones Comerciales</p>
              <p className="text-sm">{formData.condiciones_comerciales}</p>
            </div>
          )}

          {formData.notas_internas && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-muted-foreground">Notas Internas (No visible para cliente)</p>
              <p className="text-sm">{formData.notas_internas}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}