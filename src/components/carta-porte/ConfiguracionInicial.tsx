
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CartaPorteData } from '@/types/cartaPorte';

interface ConfiguracionInicialProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
  onNext: () => void;
}

export function ConfiguracionInicial({ data, onChange, onNext }: ConfiguracionInicialProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.rfcEmisor && data.rfcReceptor) {
      onNext();
    }
  };

  const handleTipoCfdiChange = (value: string) => {
    if (value === 'Ingreso' || value === 'Traslado') {
      onChange({ tipoCfdi: value as 'Ingreso' | 'Traslado' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración Inicial</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-medium">Datos del Emisor</h3>
              <div>
                <Label htmlFor="rfcEmisor">RFC Emisor *</Label>
                <Input
                  id="rfcEmisor"
                  value={data.rfcEmisor || ''}
                  onChange={(e) => onChange({ rfcEmisor: e.target.value })}
                  placeholder="RFC del emisor"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nombreEmisor">Nombre Emisor</Label>
                <Input
                  id="nombreEmisor"
                  value={data.nombreEmisor || ''}
                  onChange={(e) => onChange({ nombreEmisor: e.target.value })}
                  placeholder="Nombre del emisor"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Datos del Receptor</h3>
              <div>
                <Label htmlFor="rfcReceptor">RFC Receptor *</Label>
                <Input
                  id="rfcReceptor"
                  value={data.rfcReceptor || ''}
                  onChange={(e) => onChange({ rfcReceptor: e.target.value })}
                  placeholder="RFC del receptor"
                  required
                />
              </div>
              <div>
                <Label htmlFor="nombreReceptor">Nombre Receptor</Label>
                <Input
                  id="nombreReceptor"
                  value={data.nombreReceptor || ''}
                  onChange={(e) => onChange({ nombreReceptor: e.target.value })}
                  placeholder="Nombre del receptor"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoCfdi">Tipo de CFDI</Label>
              <Select value={data.tipoCfdi} onValueChange={handleTipoCfdiChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Traslado">Traslado</SelectItem>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="transporteInternacional">Transporte Internacional</Label>
              <Select value={data.transporteInternacional} onValueChange={(value) => onChange({ transporteInternacional: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Sí">Sí</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!data.rfcEmisor || !data.rfcReceptor}>
              Continuar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
