
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConfiguracionGeneralSectionProps {
  data: any;
  onChange: (data: any) => void;
}

export function ConfiguracionGeneralSection({ data, onChange }: ConfiguracionGeneralSectionProps) {
  const handleFieldChange = (field: string, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Emisor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rfcEmisor">RFC Emisor *</Label>
            <Input
              id="rfcEmisor"
              value={data?.rfcEmisor || ''}
              onChange={(e) => handleFieldChange('rfcEmisor', e.target.value)}
              placeholder="RFC del emisor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombreEmisor">Nombre / Razón Social *</Label>
            <Input
              id="nombreEmisor"
              value={data?.nombreEmisor || ''}
              onChange={(e) => handleFieldChange('nombreEmisor', e.target.value)}
              placeholder="Nombre o razón social del emisor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regimenFiscalEmisor">Régimen Fiscal</Label>
            <Select
              value={data?.regimenFiscalEmisor || ''}
              onValueChange={(value) => handleFieldChange('regimenFiscalEmisor', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar régimen fiscal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="601">General de Ley Personas Morales</SelectItem>
                <SelectItem value="612">Personas Físicas con Actividades Empresariales</SelectItem>
                <SelectItem value="621">Incorporación Fiscal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Receptor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rfcReceptor">RFC Receptor *</Label>
            <Input
              id="rfcReceptor"
              value={data?.rfcReceptor || ''}
              onChange={(e) => handleFieldChange('rfcReceptor', e.target.value)}
              placeholder="RFC del receptor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombreReceptor">Nombre / Razón Social *</Label>
            <Input
              id="nombreReceptor"
              value={data?.nombreReceptor || ''}
              onChange={(e) => handleFieldChange('nombreReceptor', e.target.value)}
              placeholder="Nombre o razón social del receptor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="usoCfdi">Uso de CFDI</Label>
            <Select
              value={data?.usoCfdi || ''}
              onValueChange={(value) => handleFieldChange('usoCfdi', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar uso de CFDI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="G01">Adquisición de mercancías</SelectItem>
                <SelectItem value="G02">Devoluciones, descuentos o bonificaciones</SelectItem>
                <SelectItem value="G03">Gastos en general</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del CFDI</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoCfdi">Tipo de CFDI</Label>
            <Select
              value={data?.tipoCfdi || 'Traslado'}
              onValueChange={(value) => handleFieldChange('tipoCfdi', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Traslado">Traslado</SelectItem>
                <SelectItem value="Ingreso">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transporteInternacional">Transporte Internacional</Label>
            <Select
              value={data?.transporteInternacional || 'No'}
              onValueChange={(value) => handleFieldChange('transporteInternacional', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No">No</SelectItem>
                <SelectItem value="Sí">Sí</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cartaPorteVersion">Versión Carta Porte</Label>
            <Select
              value={data?.cartaPorteVersion || '3.1'}
              onValueChange={(value) => handleFieldChange('cartaPorteVersion', value)}
              disabled
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3.1">3.1</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
