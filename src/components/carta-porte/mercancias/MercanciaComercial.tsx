
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, FileText } from 'lucide-react';

interface MercanciaComercialProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaComercial({ formData, onFieldChange }: MercanciaComercialProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Globe className="h-5 w-5 text-purple-500" />
        Información Comercial (Opcional)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fraccion_arancelaria">
            <FileText className="h-4 w-4 inline mr-1" />
            Fracción Arancelaria
          </Label>
          <Input
            id="fraccion_arancelaria"
            placeholder="12345678"
            value={formData.fraccion_arancelaria || ''}
            onChange={(e) => onFieldChange('fraccion_arancelaria', e.target.value)}
            maxLength={8}
          />
          <p className="text-xs text-gray-500">
            Para mercancías de comercio exterior (8 dígitos)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="uuid_comercio_ext">
            <Globe className="h-4 w-4 inline mr-1" />
            UUID Comercio Exterior
          </Label>
          <Input
            id="uuid_comercio_ext"
            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
            value={formData.uuid_comercio_ext || ''}
            onChange={(e) => onFieldChange('uuid_comercio_ext', e.target.value)}
          />
          <p className="text-xs text-gray-500">
            UUID del complemento de comercio exterior (si aplica)
          </p>
        </div>
      </div>
    </div>
  );
}
