
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VirtualizedTable } from '@/components/ui/virtualized-table';
import { useVirtualizedData } from '@/hooks/useVirtualizedData';
import { Mercancia } from '@/hooks/useMercancias';
import { Edit, Trash2, AlertTriangle, Search } from 'lucide-react';

interface VirtualizedMercanciasListProps {
  mercancias: Mercancia[];
  onEdit: (mercancia: Mercancia) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const VirtualizedMercanciasList: React.FC<VirtualizedMercanciasListProps> = ({
  mercancias,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    sortBy,
    currentSortField,
    sortDirection,
    totalItems
  } = useVirtualizedData({
    data: mercancias,
    searchFields: ['descripcion', 'bienes_transp', 'clave_unidad']
  });

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatWeight = (value?: number) => {
    if (!value) return '-';
    return `${value.toLocaleString('es-MX')} kg`;
  };

  const columns = [
    {
      key: 'descripcion',
      header: 'Descripción',
      width: 300,
      render: (mercancia: Mercancia) => (
        <div className="space-y-1">
          <div className="font-medium">
            <Badge variant="outline" className="mr-2 text-xs">
              {mercancia.bienes_transp}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground line-clamp-2">
            {mercancia.descripcion}
          </div>
        </div>
      )
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      width: 100,
      render: (mercancia: Mercancia) => (
        <div className="font-medium">
          {mercancia.cantidad?.toLocaleString('es-MX')}
        </div>
      )
    },
    {
      key: 'clave_unidad',
      header: 'Unidad',
      width: 100,
      render: (mercancia: Mercancia) => (
        <Badge variant="secondary">
          {mercancia.clave_unidad}
        </Badge>
      )
    },
    {
      key: 'peso_kg',
      header: 'Peso',
      width: 120,
      render: (mercancia: Mercancia) => formatWeight(mercancia.peso_kg)
    },
    {
      key: 'valor_mercancia',
      header: 'Valor',
      width: 120,
      render: (mercancia: Mercancia) => formatCurrency(mercancia.valor_mercancia)
    },
    {
      key: 'material_peligroso',
      header: 'Material Peligroso',
      width: 150,
      render: (mercancia: Mercancia) => (
        mercancia.material_peligroso ? (
          <div className="space-y-1">
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Peligroso
            </Badge>
            {mercancia.cve_material_peligroso && (
              <div className="text-xs text-muted-foreground">
                {mercancia.cve_material_peligroso}
              </div>
            )}
          </div>
        ) : (
          <Badge variant="outline" className="text-xs">No</Badge>
        )
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      width: 120,
      render: (mercancia: Mercancia) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(mercancia);
            }}
            disabled={isLoading}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (mercancia.id) onDelete(mercancia.id);
            }}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (mercancias.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-4xl mb-4">📦</div>
        <p className="text-lg mb-2">No hay mercancías agregadas</p>
        <p className="text-sm">Agrega mercancías individualmente o importa desde Excel/CSV</p>
      </div>
    );
  }

  const totalCantidad = mercancias.reduce((sum, m) => sum + (m.cantidad || 0), 0);
  const totalPeso = mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
  const totalValor = mercancias.reduce((sum, m) => sum + (m.valor_mercancia || 0), 0);
  const materialesPeligrosos = mercancias.filter(m => m.material_peligroso).length;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{mercancias.length}</div>
          <div className="text-sm text-blue-600">Mercancías</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{totalCantidad.toLocaleString()}</div>
          <div className="text-sm text-green-600">Cantidad Total</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{formatWeight(totalPeso)}</div>
          <div className="text-sm text-purple-600">Peso Total</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalValor)}</div>
          <div className="text-sm text-orange-600">Valor Total</div>
        </div>
      </div>

      {/* Alertas */}
      {materialesPeligrosos > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              Esta carga incluye {materialesPeligrosos} material(es) peligroso(s)
            </span>
          </div>
        </div>
      )}

      {/* Buscador */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar mercancías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredData.length} de {totalItems} mercancías
        </div>
      </div>

      {/* Tabla Virtualizada */}
      <VirtualizedTable
        data={filteredData}
        columns={columns}
        height={500}
        itemHeight={80}
      />
    </div>
  );
};
