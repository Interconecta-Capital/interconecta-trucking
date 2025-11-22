// ============================================
// FASE 3: Tarjeta de Viaje Colapsable
// ISO 27001 A.12.3: Copia de seguridad
// ============================================

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin, User, Truck, Package, Eye, Edit, Trash2, Calendar, Clock } from 'lucide-react';

interface ViajeCardCollapsibleProps {
  viaje: any;
  onVerViaje: (viaje: any) => void;
  onEditarViaje: (viaje: any) => void;
  onEliminarViaje: (viaje: any) => void;
}

const estadoColors = {
  programado: 'bg-blue-100 text-blue-800',
  en_transito: 'bg-yellow-100 text-yellow-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
  retrasado: 'bg-orange-100 text-orange-800',
  borrador: 'bg-gray-100 text-gray-800'
};

const estadoLabels = {
  programado: 'Programado',
  en_transito: 'En Tránsito',
  completado: 'Completado',
  cancelado: 'Cancelado',
  retrasado: 'Retrasado',
  borrador: 'Borrador'
};

export function ViajeCardCollapsible({ viaje, onVerViaje, onEditarViaje, onEliminarViaje }: ViajeCardCollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Debug logging - ISO 27001 A.12.4.1
  console.log('🔍 [ViajeCard] Viaje completo:', {
    id: viaje.id?.substring(0, 8),
    hasTrackingData: !!viaje.tracking_data,
    trackingDataKeys: viaje.tracking_data ? Object.keys(viaje.tracking_data) : [],
    origen: viaje.origen,
    destino: viaje.destino
  });
  
  const trackingData = viaje.tracking_data || {};
  const conductor = trackingData.conductor;
  const vehiculo = trackingData.vehiculo;
  const cliente = trackingData.cliente;
  const mercancias = trackingData.mercancias || [];
  const ubicaciones = trackingData.ubicaciones || {};
  
  console.log('🔍 [ViajeCard] Datos extraídos:', {
    hasConductor: !!conductor,
    conductorNombre: conductor?.nombre,
    hasVehiculo: !!vehiculo,
    vehiculoPlaca: vehiculo?.placa,
    hasUbicaciones: !!ubicaciones,
    ubicacionesKeys: Object.keys(ubicaciones),
    origenCP: ubicaciones?.origen?.domicilio?.codigo_postal
  });
  
  // Extraer CP y Estado del origen/destino con múltiples fallbacks - ISO 27001 A.12.1.1
  const origenCP = ubicaciones?.origen?.domicilio?.codigo_postal 
    || ubicaciones?.origen?.domicilio?.codigoPostal 
    || viaje.origen_cp
    || 'N/A';
  const origenEstado = ubicaciones?.origen?.domicilio?.estado 
    || ubicaciones?.origen?.estado
    || viaje.origen_estado
    || 'N/A';
  const destinoCP = ubicaciones?.destino?.domicilio?.codigo_postal 
    || ubicaciones?.destino?.domicilio?.codigoPostal 
    || viaje.destino_cp
    || 'N/A';
  const destinoEstado = ubicaciones?.destino?.domicilio?.estado 
    || ubicaciones?.destino?.estado
    || viaje.destino_estado
    || 'N/A';

  // Formatear nombre completo del conductor con múltiples fallbacks
  const conductorNombre = conductor?.nombre 
    ? `${conductor.nombre}${conductor.apellido ? ' ' + conductor.apellido : ''}`.trim()
    : viaje.conductor_nombre
    || 'No asignado';

  // Formatear vehículo (placa + modelo) con múltiples fallbacks
  const vehiculoInfo = vehiculo?.placa
    ? `${vehiculo.placa}${vehiculo.modelo ? ` - ${vehiculo.modelo}` : ''}${vehiculo.marca ? ` ${vehiculo.marca}` : ''}`.trim()
    : viaje.vehiculo_placa
    || 'No asignado';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header siempre visible */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
            {!isExpanded ? (
              // Vista colapsada: Solo CP y Estado
              <span className="font-medium truncate text-sm">
                {origenEstado} (CP {origenCP}) → {destinoEstado} (CP {destinoCP})
              </span>
            ) : (
              // Vista expandida: Dirección completa
              <span className="font-medium text-sm">
                {viaje.origen} → {viaje.destino}
              </span>
            )}
          </div>
          <Badge className={`ml-2 ${estadoColors[viaje.estado] || 'bg-gray-100 text-gray-800'}`}>
            {estadoLabels[viaje.estado] || viaje.estado}
          </Badge>
        </div>

        {/* Grid de información - Siempre visible */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3">
          {/* Conductor - ISO 27001 A.9.2.1 */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900">Conductor</p>
              <p className="text-gray-600 truncate" title={conductorNombre}>
                {conductorNombre}
              </p>
            </div>
          </div>

          {/* Vehículo */}
          <div className="flex items-start gap-2">
            <Truck className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900">Vehículo</p>
              <p className="text-gray-600 truncate" title={vehiculoInfo}>
                {vehiculoInfo}
              </p>
            </div>
          </div>

          {/* Cliente - ISO 27001 A.18.1.4 */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900">Cliente</p>
              <p className="text-gray-600 truncate" title={cliente?.nombre_razon_social || 'No especificado'}>
                {cliente?.nombre_razon_social || 'No especificado'}
              </p>
            </div>
          </div>

          {/* Carga */}
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900">Carga</p>
              <p className="text-gray-600 truncate">
                {mercancias.length > 0 
                  ? `${mercancias.length} mercancía${mercancias.length > 1 ? 's' : ''}`
                  : 'Sin mercancías'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido expandible */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-3 text-sm animate-in fade-in-50 slide-in-from-top-2 duration-200">
            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Fecha Inicio</p>
                  <p className="text-gray-600">
                    {viaje.fecha_inicio_programada 
                      ? new Date(viaje.fecha_inicio_programada).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'No definida'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Fecha Fin</p>
                  <p className="text-gray-600">
                    {viaje.fecha_fin_programada 
                      ? new Date(viaje.fecha_fin_programada).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'No definida'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dirección completa del origen */}
            {ubicaciones.origen && (
              <div>
                <p className="font-medium text-gray-900 mb-1">Dirección de Origen</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {ubicaciones.origen.domicilio?.calle} {ubicaciones.origen.domicilio?.numExterior || ubicaciones.origen.domicilio?.num_exterior}<br />
                  {ubicaciones.origen.domicilio?.colonia}, {ubicaciones.origen.domicilio?.municipio}<br />
                  {origenEstado}, CP {origenCP}
                </p>
              </div>
            )}

            {/* Dirección completa del destino */}
            {ubicaciones.destino && (
              <div>
                <p className="font-medium text-gray-900 mb-1">Dirección de Destino</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  {ubicaciones.destino.domicilio?.calle} {ubicaciones.destino.domicilio?.numExterior || ubicaciones.destino.domicilio?.num_exterior}<br />
                  {ubicaciones.destino.domicilio?.colonia}, {ubicaciones.destino.domicilio?.municipio}<br />
                  {destinoEstado}, CP {destinoCP}
                </p>
              </div>
            )}

            {/* Observaciones */}
            {viaje.observaciones && (
              <div>
                <p className="font-medium text-gray-900 mb-1">Observaciones</p>
                <p className="text-gray-600 text-xs">{viaje.observaciones}</p>
              </div>
            )}

            {/* Distancia y costo */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div>
                <p className="font-medium text-gray-900">Distancia</p>
                <p className="text-gray-600">{viaje.distancia_km || 0} km</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Costo Estimado</p>
                <p className="text-gray-600">
                  ${viaje.costo_estimado ? viaje.costo_estimado.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'} MXN
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer con botones - ISO 27001 A.9.4.1 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Ver más
              </>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onVerViaje(viaje)}
              title="Ver detalles completos"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEditarViaje(viaje)}
              title="Editar viaje"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEliminarViaje(viaje)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Eliminar viaje"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
