
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, Search, AlertTriangle, Users } from 'lucide-react';
import { useSocios } from '@/hooks/useSocios';
import { ViajeWizardData } from '../ViajeWizard';

interface ViajeWizardMisionProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardMision({ data, updateData }: ViajeWizardMisionProps) {
  const { socios, loading: loadingSocios } = useSocios();
  const [searchCliente, setSearchCliente] = useState('');
  const [alertasMercancia, setAlertasMercancia] = useState<string[]>([]);

  // Filtrar socios por búsqueda
  const sociosFiltrados = socios.filter(socio =>
    socio.nombre_razon_social.toLowerCase().includes(searchCliente.toLowerCase()) ||
    socio.rfc.toLowerCase().includes(searchCliente.toLowerCase())
  );

  // Análisis de mercancía con IA (simulado)
  useEffect(() => {
    if (data.descripcionMercancia) {
      const texto = data.descripcionMercancia.toLowerCase();
      const alertas: string[] = [];

      // Detectar materiales regulados
      if (texto.includes('jaguar') || texto.includes('fauna') || texto.includes('animal')) {
        alertas.push('Esta mercancía requiere permisos de SEMARNAT');
      }
      if (texto.includes('químico') || texto.includes('tóxico') || texto.includes('peligroso')) {
        alertas.push('Material peligroso - Requiere documentación especial');
      }
      if (texto.includes('importación') || texto.includes('exportación')) {
        alertas.push('Operación de comercio exterior detectada');
      }

      setAlertasMercancia(alertas);
    } else {
      setAlertasMercancia([]);
    }
  }, [data.descripcionMercancia]);

  const handleClienteSelect = (socio: any) => {
    updateData({ cliente: socio });
    setSearchCliente('');
  };

  return (
    <div className="space-y-6">
      {/* Sección Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Cliente / Receptor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!data.cliente ? (
            <div className="space-y-3">
              <Label htmlFor="searchCliente">Buscar cliente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="searchCliente"
                  placeholder="Buscar por nombre o RFC..."
                  value={searchCliente}
                  onChange={(e) => setSearchCliente(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searchCliente && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {loadingSocios ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Buscando clientes...
                    </div>
                  ) : sociosFiltrados.length > 0 ? (
                    sociosFiltrados.map((socio) => (
                      <button
                        key={socio.id}
                        onClick={() => handleClienteSelect(socio)}
                        className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{socio.nombre_razon_social}</div>
                        <div className="text-sm text-muted-foreground">{socio.rfc}</div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No se encontraron clientes
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <div className="font-medium">{data.cliente.nombre_razon_social}</div>
                <div className="text-sm text-muted-foreground">{data.cliente.rfc}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateData({ cliente: undefined })}
              >
                Cambiar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sección Tipo de Servicio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tipo de Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="tipoServicio">¿Qué tipo de operación es?</Label>
          <Select
            value={data.tipoServicio}
            onValueChange={(value: 'flete_pagado' | 'traslado_propio') => 
              updateData({ tipoServicio: value })
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Seleccionar tipo de servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flete_pagado">
                <div>
                  <div className="font-medium">Flete Pagado</div>
                  <div className="text-sm text-muted-foreground">
                    Cobras por el transporte (CFDI de Ingreso)
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="traslado_propio">
                <div>
                  <div className="font-medium">Traslado Propio</div>
                  <div className="text-sm text-muted-foreground">
                    Transporte de mercancía propia (CFDI de Traslado)
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sección Mercancía */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Descripción de la Mercancía
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label htmlFor="descripcionMercancia">¿Qué vas a transportar?</Label>
          <Textarea
            id="descripcionMercancia"
            placeholder="Describe la mercancía que vas a transportar..."
            value={data.descripcionMercancia || ''}
            onChange={(e) => updateData({ descripcionMercancia: e.target.value })}
            className="min-h-[80px]"
          />
          
          {/* Alertas de IA */}
          {alertasMercancia.length > 0 && (
            <div className="space-y-2">
              {alertasMercancia.map((alerta, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">{alerta}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de la sección */}
      {data.cliente && data.tipoServicio && data.descripcionMercancia && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                Misión Definida
              </Badge>
            </div>
            <p className="text-sm text-green-800">
              Listo para establecer la ruta del viaje
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
