
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConductorSelector } from './ConductorSelector';
import { FormularioDomicilioUnificado, DomicilioUnificado } from '@/components/common/FormularioDomicilioUnificado';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { User, Trash2 } from 'lucide-react';
import { FiguraCompleta } from '@/types/cartaPorte';

interface FiguraFormCompletaProps {
  figura: FiguraCompleta;
  onUpdate: (figura: FiguraCompleta) => void;
  onRemove: () => void;
  index: number;
}

export function FiguraFormCompleta({ figura, onUpdate, onRemove, index }: FiguraFormCompletaProps) {
  const handleFieldChange = (field: keyof FiguraCompleta, value: any) => {
    onUpdate({ ...figura, [field]: value });
  };

  const handleDomicilioChange = (campo: keyof DomicilioUnificado, valor: string) => {
    const domicilioActual = figura.domicilio || {
      pais: 'México',
      codigo_postal: '',
      estado: '',
      municipio: '',
      colonia: '',
      calle: '',
      numero_exterior: ''
    };

    const nuevoDomicilio = { ...domicilioActual };
    
    // Mapear campos del domicilio unificado al formato de figura
    switch (campo) {
      case 'codigoPostal':
        nuevoDomicilio.codigo_postal = valor;
        break;
      case 'numExterior':
        nuevoDomicilio.numero_exterior = valor;
        break;
      default:
        (nuevoDomicilio as any)[campo] = valor;
    }

    onUpdate({ ...figura, domicilio: nuevoDomicilio });
  };

  // Convertir domicilio de figura a formato unificado
  const domicilioUnificado: DomicilioUnificado = {
    pais: figura.domicilio?.pais || 'México',
    codigoPostal: figura.domicilio?.codigo_postal || '',
    estado: figura.domicilio?.estado || '',
    municipio: figura.domicilio?.municipio || '',
    localidad: '',
    colonia: figura.domicilio?.colonia || '',
    calle: figura.domicilio?.calle || '',
    numExterior: figura.domicilio?.numero_exterior || '',
    numInterior: '',
    referencia: ''
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Figura de Transporte #{index + 1}
          </div>
          {index > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Solo mostrar selector si es la primera figura (operador) */}
        {index === 0 && (
          <ConductorSelector 
            figura={figura} 
            onUpdate={onUpdate}
            value=""
            onValueChange={() => {}}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <CatalogoSelectorMejorado
              tipo="figuras_transporte"
              label="Tipo de Figura *"
              value={figura.tipo_figura || ''}
              onValueChange={(value) => handleFieldChange('tipo_figura', value)}
              placeholder="Seleccionar tipo..."
              required
              allowSearch={true}
              showAllOptions={true}
              showRefresh={true}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfc_figura">RFC de la Figura *</Label>
            <Input
              id="rfc_figura"
              value={figura.rfc_figura || ''}
              onChange={(e) => handleFieldChange('rfc_figura', e.target.value.toUpperCase())}
              placeholder="RFC123456789"
              maxLength={13}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre_figura">Nombre de la Figura *</Label>
            <Input
              id="nombre_figura"
              value={figura.nombre_figura || ''}
              onChange={(e) => handleFieldChange('nombre_figura', e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_licencia">Número de Licencia</Label>
            <Input
              id="num_licencia"
              value={figura.num_licencia || ''}
              onChange={(e) => handleFieldChange('num_licencia', e.target.value)}
              placeholder="Número de licencia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="residencia_fiscal_figura">Residencia Fiscal</Label>
            <Select
              value={figura.residencia_fiscal_figura || 'MEX'}
              onValueChange={(value) => handleFieldChange('residencia_fiscal_figura', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEX">México</SelectItem>
                <SelectItem value="USA">Estados Unidos</SelectItem>
                <SelectItem value="CAN">Canadá</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="num_reg_id_trib_figura">Reg. Identidad Tributaria</Label>
            <Input
              id="num_reg_id_trib_figura"
              value={figura.num_reg_id_trib_figura || ''}
              onChange={(e) => handleFieldChange('num_reg_id_trib_figura', e.target.value)}
              placeholder="Registro tributario"
            />
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Domicilio de la Figura</Label>
          <div className="mt-2">
            <FormularioDomicilioUnificado
              domicilio={domicilioUnificado}
              onDomicilioChange={handleDomicilioChange}
              camposOpcionales={['numInterior', 'referencia', 'localidad']}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
