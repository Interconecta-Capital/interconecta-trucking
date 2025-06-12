
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VirtualizedTable } from '@/components/ui/virtualized-table';
import { useVirtualizedData } from '@/hooks/useVirtualizedData';
import { Edit, Trash2, User, Truck, Users, Search } from 'lucide-react';
import { FiguraTransporte } from '@/hooks/useFigurasTransporte';

interface VirtualizedFigurasListProps {
  figuras: FiguraTransporte[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const tiposFigura: Record<string, { nombre: string; icono: React.ReactNode }> = {
  '01': { nombre: 'Operador', icono: <Truck className="h-4 w-4" /> },
  '02': { nombre: 'Propietario', icono: <User className="h-4 w-4" /> },
  '03': { nombre: 'Arrendador', icono: <User className="h-4 w-4" /> },
  '04': { nombre: 'Notificado', icono: <User className="h-4 w-4" /> },
};

export function VirtualizedFigurasList({ figuras, onEdit, onDelete }: VirtualizedFigurasListProps) {
  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    totalItems
  } = useVirtualizedData({
    data: figuras.map((figura, index) => ({ ...figura, originalIndex: index })),
    searchFields: ['nombre_figura', 'rfc_figura', 'tipo_figura', 'num_licencia']
  });

  const columns = [
    {
      key: 'tipo',
      header: 'Tipo',
      width: 150,
      render: (figura: any) => {
        const tipoInfo = tiposFigura[figura.tipo_figura] || { 
          nombre: 'Desconocido', 
          icono: <User className="h-4 w-4" /> 
        };
        
        return (
          <div className="flex items-center space-x-2">
            {tipoInfo.icono}
            <Badge variant={figura.tipo_figura === '01' ? 'default' : 'secondary'}>
              {tipoInfo.nombre}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'datos',
      header: 'Datos de la Figura',
      width: 300,
      render: (figura: any) => (
        <div className="space-y-1">
          <div className="font-medium">{figura.nombre_figura}</div>
          <div className="text-sm text-muted-foreground">RFC: {figura.rfc_figura}</div>
          {figura.num_licencia && (
            <div className="text-sm text-muted-foreground">
              Licencia: {figura.num_licencia}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'domicilio',
      header: 'Domicilio',
      width: 250,
      render: (figura: any) => (
        figura.domicilio ? (
          <div className="text-sm text-muted-foreground space-y-1">
            <div>
              {figura.domicilio.calle} {figura.domicilio.numero_exterior}
              {figura.domicilio.numero_interior && ` Int. ${figura.domicilio.numero_interior}`}
            </div>
            {figura.domicilio.colonia && (
              <div className="truncate">{figura.domicilio.colonia}</div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      )
    },
    {
      key: 'residencia',
      header: 'Residencia Fiscal',
      width: 120,
      render: (figura: any) => (
        figura.residencia_fiscal_figura ? (
          <Badge variant="outline">{figura.residencia_fiscal_figura}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      width: 120,
      render: (figura: any) => (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(figura.originalIndex);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(figura.originalIndex);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (figuras.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No se han agregado figuras del transporte</p>
        <p className="text-sm">Se requiere al menos un operador</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar figuras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredData.length} de {totalItems} figuras
        </div>
      </div>

      {/* Tabla Virtualizada */}
      <VirtualizedTable
        data={filteredData}
        columns={columns}
        height={400}
        itemHeight={80}
      />
    </div>
  );
}
