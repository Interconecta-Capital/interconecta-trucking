
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { toast } from 'sonner';

interface ViajeWizardMisionProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardMision({ data, updateData }: ViajeWizardMisionProps) {
  const [clienteNombre, setClienteNombre] = useState(data.cliente?.nombre_razon_social || '');
  const [clienteRfc, setClienteRfc] = useState(data.cliente?.rfc || '');
  const [descripcionMercancia, setDescripcionMercancia] = useState(data.descripcionMercancia || '');
  const [tipoServicio, setTipoServicio] = useState<string>(data.tipoServicio || '');
  const [isValidatingRfc, setIsValidatingRfc] = useState(false);
  const [rfcValid, setRfcValid] = useState(true);

  const validarRfc = async (rfc: string) => {
    if (!rfc || rfc.length < 12) {
      setRfcValid(false);
      return false;
    }

    setIsValidatingRfc(true);
    try {
      // Validación básica de RFC
      const rfcRegex = /^([A-ZÑ&]{3,4})\d{6}([A-Z\d]{3})$/;
      const valid = rfcRegex.test(rfc.toUpperCase());
      setRfcValid(valid);
      
      if (!valid) {
        toast.error('RFC inválido. Verifique el formato.');
      }
      
      return valid;
    } catch (error) {
      console.error('Error validating RFC:', error);
      setRfcValid(false);
      return false;
    } finally {
      setIsValidatingRfc(false);
    }
  };

  const handleClienteChange = async (campo: 'nombre' | 'rfc', valor: string) => {
    if (campo === 'nombre') {
      setClienteNombre(valor);
    } else if (campo === 'rfc') {
      setClienteRfc(valor);
      if (valor.length >= 12) {
        await validarRfc(valor);
      }
    }

    // Actualizar cliente en los datos del wizard
    const clienteActualizado = {
      id: data.cliente?.id || `cliente-${Date.now()}`,
      nombre_razon_social: campo === 'nombre' ? valor : clienteNombre,
      rfc: campo === 'rfc' ? valor : clienteRfc
    };

    updateData({ 
      cliente: clienteActualizado
    });
  };

  const handleDescripcionChange = (descripcion: string) => {
    setDescripcionMercancia(descripcion);
    updateData({ descripcionMercancia: descripcion });
  };

  const handleTipoServicioChange = (tipo: string) => {
    setTipoServicio(tipo);
    updateData({ tipoServicio: tipo });
  };

  const isFormValid = () => {
    return (
      clienteNombre.trim() !== '' &&
      clienteRfc.trim() !== '' &&
      rfcValid &&
      descripcionMercancia.trim() !== '' &&
      tipoServicio !== ''
    );
  };

  return (
    <div className="space-y-6">
      {/* Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="clienteNombre">Nombre o Razón Social *</Label>
            <Input
              id="clienteNombre"
              placeholder="Nombre completo o razón social del cliente"
              value={clienteNombre}
              onChange={(e) => handleClienteChange('nombre', e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="clienteRfc">RFC *</Label>
            <div className="relative">
              <Input
                id="clienteRfc"
                placeholder="RFC del cliente (12-13 caracteres)"
                value={clienteRfc}
                onChange={(e) => handleClienteChange('rfc', e.target.value.toUpperCase())}
                className={`mt-2 ${!rfcValid && clienteRfc ? 'border-red-500' : ''}`}
                maxLength={13}
              />
              {isValidatingRfc && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {!rfcValid && clienteRfc && (
              <p className="text-sm text-red-600 mt-1">RFC inválido. Verifique el formato.</p>
            )}
            {rfcValid && clienteRfc.length >= 12 && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-600">RFC válido</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tipo de Servicio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Tipo de Servicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="tipoServicio">Modalidad del transporte *</Label>
          <Select value={tipoServicio} onValueChange={handleTipoServicioChange}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecciona el tipo de servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flete_pagado">
                <div className="flex flex-col">
                  <span>Flete Pagado</span>
                  <span className="text-xs text-gray-500">El transportista cobra por el servicio</span>
                </div>
              </SelectItem>
              <SelectItem value="traslado_propio">
                <div className="flex flex-col">
                  <span>Traslado Propio</span>
                  <span className="text-xs text-gray-500">Sin cobro, traslado interno</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {tipoServicio && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant={tipoServicio === 'flete_pagado' ? 'default' : 'secondary'}>
                  {tipoServicio === 'flete_pagado' ? 'Flete Pagado' : 'Traslado Propio'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {tipoServicio === 'flete_pagado' 
                  ? 'Servicio comercial con cargo económico al cliente. Se emitirá factura por el flete.'
                  : 'Traslado interno sin costo. Ideal para movimientos entre sucursales propias.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Descripción de Mercancía */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-600" />
            Descripción de la Mercancía
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="descripcionMercancia">Descripción detallada *</Label>
          <Textarea
            id="descripcionMercancia"
            placeholder="Describe la mercancía a transportar (tipo, cantidad, características especiales, etc.)"
            value={descripcionMercancia}
            onChange={(e) => handleDescripcionChange(e.target.value)}
            className="mt-2"
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-2">
            Proporciona una descripción detallada que permita identificar claramente la mercancía.
          </p>
        </CardContent>
      </Card>

      {/* Resumen de la misión */}
      {isFormValid() && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Resumen de la Misión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Cliente:</span> {clienteNombre}
              </div>
              <div>
                <span className="font-medium">RFC:</span> {clienteRfc}
              </div>
              <div>
                <span className="font-medium">Tipo de servicio:</span>
                <Badge variant={tipoServicio === 'flete_pagado' ? 'default' : 'secondary'} className="ml-2">
                  {tipoServicio === 'flete_pagado' ? 'Flete Pagado' : 'Traslado Propio'}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Mercancía:</span>
                <p className="mt-1 text-gray-700 bg-white p-2 rounded border">
                  {descripcionMercancia}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validaciones pendientes */}
      {!isFormValid() && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Información Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-yellow-700">
              {!clienteNombre.trim() && (
                <li>• Especificar nombre o razón social del cliente</li>
              )}
              {!clienteRfc.trim() && (
                <li>• Proporcionar RFC del cliente</li>
              )}
              {clienteRfc.trim() && !rfcValid && (
                <li>• Corregir formato del RFC</li>
              )}
              {!descripcionMercancia.trim() && (
                <li>• Describir la mercancía a transportar</li>
              )}
              {!tipoServicio && (
                <li>• Seleccionar tipo de servicio</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
