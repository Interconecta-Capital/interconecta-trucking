
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, FileText, Package } from 'lucide-react';

interface MercanciaComercialProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaComercial({ formData, onFieldChange }: MercanciaComercialProps) {
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
          <Label htmlFor="regimen_aduanero">
            <Globe className="h-4 w-4 inline mr-1" />
            Régimen Aduanero
          </Label>
          <Input
            id="regimen_aduanero"
            placeholder="Ej: A1, B1, etc."
            value={formData.regimen_aduanero || ''}
            onChange={(e) => onFieldChange('regimen_aduanero', e.target.value)}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
