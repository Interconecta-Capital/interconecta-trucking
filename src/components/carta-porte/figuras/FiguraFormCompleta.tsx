
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CodigoPostalInputOptimizado } from '@/components/catalogos/CodigoPostalInputOptimizado';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { FiguraCompleta } from '@/types/cartaPorte';
import { User, Trash2, AlertTriangle, Globe, FileText } from 'lucide-react';
import { useTiposLicenciaExtendidos } from '@/hooks/useCatalogosExtendidos';
import { CatalogosSATExtendido } from '@/services/catalogosSATExtendido';

export interface FiguraFormCompletaProps {
  figura: FiguraCompleta;
  onUpdate: (figura: FiguraCompleta) => void;
  onRemove: () => void;
  index: number;
}

const tiposFigura = [
  { value: '01', label: '01 - Operador' },
  { value: '02', label: '02 - Propietario' },
  { value: '03', label: '03 - Arrendador' },
  { value: '04', label: '04 - Notificado' },
];

const paisesList = [
  { value: 'MEX', label: 'México' },
  { value: 'USA', label: 'Estados Unidos' },
  { value: 'CAN', label: 'Canadá' },
  { value: 'GTM', label: 'Guatemala' },
  { value: 'BLZ', label: 'Belice' },
];

export function FiguraFormCompleta({ figura, onUpdate, onRemove, index }: FiguraFormCompletaProps) {
  const [formData, setFormData] = useState<FiguraCompleta>(figura);
  const [curpValidation, setCurpValidation] = useState<{ valido: boolean; mensaje?: string }>({ valido: true });
  const [licenciaSearch, setLicenciaSearch] = useState('');

  const { data: tiposLicencia = [] } = useTiposLicenciaExtendidos(licenciaSearch);

  useEffect(() => {
    setFormData(figura);
  }, [figura]);

  const handleChange = (field: string, value: any) => {
    const updatedFigura = { ...formData, [field]: value };
    setFormData(updatedFigura);
    onUpdate(updatedFigura);
  };

  const handleDomicilioChange = (field: string, value: string) => {
    const updatedDomicilio = { ...formData.domicilio, [field]: value };
    const updatedFigura = { ...formData, domicilio: updatedDomicilio };
    setFormData(updatedFigura);
    onUpdate(updatedFigura);
  };

  const handleCURPChange = (curp: string) => {
    const validation = CatalogosSATExtendido.validarCURP(curp);
    setCurpValidation(validation);
    handleChange('curp', curp);
  };

  const handleCodigoPostalChange = (codigoPostal: string) => {
    handleDomicilioChange('codigo_postal', codigoPostal);
  };

  const handleInfoChange = (info: {
    estado?: string;
    municipio?: string;
    localidad?: string;
    colonia?: string;
  }) => {
    if (info.estado) handleDomicilioChange('estado', info.estado);
    if (info.municipio) handleDomicilioChange('municipio', info.municipio);
    if (info.colonia) handleDomicilioChange('colonia', info.colonia);
  };

  const handleColoniaChange = (colonia: string) => {
    handleDomicilioChange('colonia', colonia);
  };

  const esOperador = formData.tipo_figura === '01';
  const esExtranjero = formData.residencia_fiscal_figura && formData.residencia_fiscal_figura !== 'MEX';

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Figura de Transporte {index + 1}</span>
          </CardTitle>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Información Básica
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Figura *</Label>
              <Select
                value={formData.tipo_figura}
                onValueChange={(value) => handleChange('tipo_figura', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposFigura.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>RFC *</Label>
              <Input
                value={formData.rfc_figura}
                onChange={(e) => handleChange('rfc_figura', e.target.value.toUpperCase())}
                placeholder="RFC de la figura"
                maxLength={13}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre Completo *</Label>
            <Input
              value={formData.nombre_figura}
              onChange={(e) => handleChange('nombre_figura', e.target.value)}
              placeholder="Nombre completo de la figura"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CURP</Label>
              <Input
                value={formData.curp || ''}
                onChange={(e) => handleCURPChange(e.target.value.toUpperCase())}
                placeholder="CURP (solo personas físicas mexicanas)"
                maxLength={18}
                className={!curpValidation.valido ? 'border-red-500' : ''}
              />
              {!curpValidation.valido && curpValidation.mensaje && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {curpValidation.mensaje}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>País de Residencia Fiscal</Label>
              <CatalogoSelector
                items={paisesList.map(p => ({ 
                  value: p.value, 
                  label: p.label,
                  descripcion: p.label 
                }))}
                placeholder="Seleccionar país"
                value={formData.residencia_fiscal_figura || 'MEX'}
                onValueChange={(value) => handleChange('residencia_fiscal_figura', value)}
                allowManualInput={false}
              />
            </div>
          </div>

          {esExtranjero && (
            <div className="space-y-2">
              <Label>Número de Registro de Identidad Tributaria</Label>
              <Input
                value={formData.num_reg_id_trib_figura || ''}
                onChange={(e) => handleChange('num_reg_id_trib_figura', e.target.value)}
                placeholder="Número de identificación tributaria del país de residencia"
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Información de Licencia (solo para operadores) */}
        {esOperador && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Información de Licencia (Operador)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Licencia</Label>
                <CatalogoSelector
                  items={tiposLicencia}
                  placeholder="Buscar tipo de licencia..."
                  value={formData.tipo_licencia || ''}
                  onValueChange={(value) => handleChange('tipo_licencia', value)}
                  onSearchChange={setLicenciaSearch}
                  searchValue={licenciaSearch}
                  allowManualInput={true}
                  manualInputPlaceholder="Escribir tipo manualmente"
                />
              </div>

              <div className="space-y-2">
                <Label>Número de Licencia *</Label>
                <Input
                  value={formData.num_licencia || ''}
                  onChange={(e) => handleChange('num_licencia', e.target.value)}
                  placeholder="Número de licencia federal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vigencia de la Licencia</Label>
                <Input
                  type="date"
                  value={formData.vigencia_licencia || ''}
                  onChange={(e) => handleChange('vigencia_licencia', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Operador SCT</Label>
                <Select
                  value={formData.operador_sct ? 'true' : 'false'}
                  onValueChange={(value) => handleChange('operador_sct', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sí es operador SCT</SelectItem>
                    <SelectItem value="false">No es operador SCT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {esOperador && <Separator />}

        {/* Domicilio */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Domicilio
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Input
                value={formData.domicilio?.pais || 'México'}
                onChange={(e) => handleDomicilioChange('pais', e.target.value)}
                placeholder="País"
              />
            </div>

            <CodigoPostalInputOptimizado
              value={formData.domicilio?.codigo_postal || ''}
              onChange={handleCodigoPostalChange}
              onLocationUpdate={handleInfoChange}
              coloniaValue={formData.domicilio?.colonia || ''}
              onColoniaChange={handleColoniaChange}
              className="w-full"
              soloCodigoPostal={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={formData.domicilio?.estado || ''}
                onChange={(e) => handleDomicilioChange('estado', e.target.value)}
                placeholder="Estado"
              />
            </div>

            <div className="space-y-2">
              <Label>Municipio</Label>
              <Input
                value={formData.domicilio?.municipio || ''}
                onChange={(e) => handleDomicilioChange('municipio', e.target.value)}
                placeholder="Municipio"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Colonia</Label>
              <Input
                value={formData.domicilio?.colonia || ''}
                onChange={(e) => handleDomicilioChange('colonia', e.target.value)}
                placeholder="Colonia"
              />
            </div>

            <div className="space-y-2">
              <Label>Calle</Label>
              <Input
                value={formData.domicilio?.calle || ''}
                onChange={(e) => handleDomicilioChange('calle', e.target.value)}
                placeholder="Nombre de la calle"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Número Exterior</Label>
              <Input
                value={formData.domicilio?.numero_exterior || ''}
                onChange={(e) => handleDomicilioChange('numero_exterior', e.target.value)}
                placeholder="No. Exterior"
              />
            </div>

            <div className="space-y-2">
              <Label>Número Interior</Label>
              <Input
                value={formData.domicilio?.numero_interior || ''}
                onChange={(e) => handleDomicilioChange('numero_interior', e.target.value)}
                placeholder="No. Interior"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
