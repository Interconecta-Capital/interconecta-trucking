
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VirtualizedTable } from '@/components/ui/virtualized-table';
import { useVirtualizedData } from '@/hooks/useVirtualizedData';
import { Ubicacion } from '@/hooks/useUbicaciones';
import { 
  MapPin, 
  Clock, 
  Edit, 
  Trash2, 
  Navigation,
  Search
} from 'lucide-react';

interface VirtualizedUbicacionesListProps {
  ubicaciones: Ubicacion[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  distanciaTotal?: number;
}

export function VirtualizedUbicacionesList({ 
  ubicaciones, 
  onEdit, 
  onDelete, 
  distanciaTotal = 0
}: VirtualizedUbicacionesListProps) {
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    totalItems
  } = useVirtualizedData({
    data: ubicaciones.map((ubicacion, index) => ({ ...ubicacion, originalIndex: index })),
    searchFields: ['tipoUbicacion', 'nombreRemitenteDestinatario', 'rfcRemitenteDestinatario']
  });

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Origen':
        return 'bg-green-500';
      case 'Destino':
        return 'bg-red-500';
      case 'Paso Intermedio':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Origen':
        return 'O';
      case 'Destino':
        return 'D';
      case 'Paso Intermedio':
        return 'I';
      default:
        return '?';
    }
  };

  const columns = [
    {
      key: 'tipo',
      header: 'Tipo',
      width: 120,
      render: (ubicacion: any) => (
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getTipoColor(ubicacion.tipoUbicacion)}`}>
            {getTipoIcon(ubicacion.tipoUbicacion)}
          </div>
          <div>
            <div className="font-medium text-sm">{ubicacion.tipoUbicacion}</div>
            <div className="text-xs text-muted-foreground">{ubicacion.idUbicacion}</div>
          </div>
        </div>
      )
    },
    {
      key: 'empresa',
      header: 'Empresa',
      width: 250,
      render: (ubicacion: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{ubicacion.rfcRemitenteDestinatario}</Badge>
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {ubicacion.nombreRemitenteDestinatario}
          </div>
        </div>
      )
    },
    {
      key: 'direccion',
      header: 'Dirección',
      width: 300,
      render: (ubicacion: any) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">
              {ubicacion.domicilio.calle} {ubicacion.domicilio.numExterior}
              {ubicacion.domicilio.numInterior && ` Int. ${ubicacion.domicilio.numInterior}`}
            </span>
          </div>
          <div className="text-muted-foreground ml-4 truncate">
            {ubicacion.domicilio.colonia}, {ubicacion.domicilio.municipio}
          </div>
          <div className="text-muted-foreground ml-4 truncate">
            {ubicacion.domicilio.estado} {ubicacion.domicilio.codigoPostal}
          </div>
        </div>
      )
    },
    {
      key: 'fecha',
      header: 'Fecha/Hora',
      width: 150,
      render: (ubicacion: any) => (
        ubicacion.fechaHoraSalidaLlegada ? (
          <div className="flex items-center space-x-1 text-sm">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(ubicacion.fechaHoraSalidaLlegada).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      )
    },
    {
      key: 'distancia',
      header: 'Distancia',
      width: 100,
      render: (ubicacion: any) => (
        ubicacion.distanciaRecorrida && ubicacion.distanciaRecorrida > 0 ? (
          <div className="flex items-center space-x-1 text-sm">
            <Navigation className="h-3 w-3" />
            <span>{ubicacion.distanciaRecorrida} km</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      width: 120,
      render: (ubicacion: any) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(ubicacion.originalIndex);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(ubicacion.originalIndex);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (ubicaciones.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay ubicaciones agregadas</p>
        <p className="text-sm">Agrega al menos un origen y un destino para continuar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen de ruta */}
      {distanciaTotal > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Resumen de Ruta</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Paradas: </span>
                <span className="font-medium">{ubicaciones.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Distancia Total: </span>
                <span className="font-medium">{distanciaTotal.toFixed(2)} km</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar ubicaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredData.length} de {totalItems} ubicaciones
        </div>
      </div>

      {/* Tabla Virtualizada */}
      <VirtualizedTable
        data={filteredData}
        columns={columns}
        height={400}
        itemHeight={100}
      />
    </div>
  );
}
