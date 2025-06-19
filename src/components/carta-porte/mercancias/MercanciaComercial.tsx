
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CatalogSelect } from '@/components/catalogos/components/CatalogSelect';
import { useCatalogosHibrido } from '@/hooks/useCatalogosHibrido';
import { Globe, FileText, Package, Truck } from 'lucide-react';

interface MercanciaComercialProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaComercial({ formData, onFieldChange }: MercanciaComercialProps) {
  // Search states for catalogs
  const [regimenesSearch, setRegimenesSearch] = useState('');

  // Mock catalog query for regímenes aduaneros - replace with real SAT catalog
  const regimenesQuery = {
    data: [
      { value: 'A1', label: 'A1 - Definitiva de importación', descripcion: 'Definitiva de importación', clave: 'A1' },
      { value: 'B1', label: 'B1 - Temporal de importación', descripcion: 'Temporal de importación', clave: 'B1' },
      { value: 'B4', label: 'B4 - Temporal de exportación', descripcion: 'Temporal de exportación', clave: 'B4' },
      { value: 'C1', label: 'C1 - Definitiva de exportación', descripcion: 'Definitiva de exportación', clave: 'C1' },
      { value: 'E1', label: 'E1 - Elaboración, transformación o reparación', descripcion: 'Elaboración, transformación o reparación', clave: 'E1' }
    ],
    isLoading: false,
    error: null
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Globe className="h-5 w-5 text-purple-500" />
        Información Comercial
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fraccion_arancelaria">
            <FileText className="h-4 w-4 inline mr-1" />
            Fracción Arancelaria
          </Label>
          <Input
            id="fraccion_arancelaria"
            placeholder="8 dígitos (ej: 12345678)"
            value={formData.fraccion_arancelaria || ''}
            onChange={(e) => onFieldChange('fraccion_arancelaria', e.target.value)}
            maxLength={8}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            Para mercancías de comercio exterior (8 dígitos)
          </p>
        </div>

        <div className="space-y-2">
          <Label>
            <Truck className="h-4 w-4 inline mr-1" />
            Régimen Aduanero
          </Label>
          <CatalogSelect
            value={formData.regimen_aduanero || ''}
            onValueChange={(value) => {
              console.log('🔄 Régimen aduanero seleccionado:', value);
              onFieldChange('regimen_aduanero', value);
              setRegimenesSearch('');
            }}
            disabled={regimenesQuery.isLoading}
            showLoading={regimenesQuery.isLoading}
            placeholder="Buscar régimen aduanero..."
            options={regimenesQuery.data || []}
            searchTerm={regimenesSearch}
            tipo="regimenes_aduaneros"
          />
          <p className="text-xs text-gray-500">
            Régimen aduanero aplicable
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero_piezas">
            <Package className="h-4 w-4 inline mr-1" />
            Número de Piezas
          </Label>
          <Input
            id="numero_piezas"
            type="number"
            placeholder="Cantidad de piezas"
            value={formData.numero_piezas || ''}
            onChange={(e) => onFieldChange('numero_piezas', e.target.value ? parseInt(e.target.value) : undefined)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            min="0"
          />
          <p className="text-xs text-gray-500">
            Número total de piezas de la mercancía
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="uuid_comercio_ext">
            <Globe className="h-4 w-4 inline mr-1" />
            UUID Comercio Exterior
          </Label>
          <Input
            id="uuid_comercio_ext"
            placeholder="UUID del complemento de comercio exterior"
            value={formData.uuid_comercio_ext || ''}
            onChange={(e) => onFieldChange('uuid_comercio_ext', e.target.value)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            UUID del complemento de comercio exterior (si aplica)
          </p>
        </div>
      </div>
    </div>
  );
}
