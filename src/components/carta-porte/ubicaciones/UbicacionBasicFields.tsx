
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface UbicacionBasicFieldsProps {
  tipoUbicacion: string;
  idUbicacion: string;
  rfcRemitenteDestinatario: string;
  nombreRemitenteDestinatario: string;
  onTipoChange: (tipo: string) => void;
  onRFCChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNombreChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
}

export function UbicacionBasicFields({
  tipoUbicacion,
  idUbicacion,
  rfcRemitenteDestinatario,
  nombreRemitenteDestinatario,
  onTipoChange,
  onRFCChange,
  onNombreChange,
  errors
}: UbicacionBasicFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipoUbicacion" className="text-gray-700 font-medium">Tipo de Ubicación *</Label>
          <Select value={tipoUbicacion} onValueChange={onTipoChange}>
            <SelectTrigger className={`border-gray-100 bg-white text-gray-900 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm ${errors.tipoUbicacion ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Seleccionar tipo de ubicación..." />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-100 shadow-lg">
              <SelectItem value="Origen">Origen</SelectItem>
              <SelectItem value="Destino">Destino</SelectItem>
              <SelectItem value="Paso Intermedio">Paso Intermedio</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipoUbicacion && <p className="text-sm text-red-500 mt-1">{errors.tipoUbicacion}</p>}
        </div>

        <div>
          <Label htmlFor="idUbicacion" className="text-gray-700 font-medium">ID Ubicación</Label>
          <Input
            id="idUbicacion"
            value={idUbicacion}
            readOnly
            className="bg-white border-gray-100 text-gray-900 shadow-sm"
            placeholder="Se genera al seleccionar tipo"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rfc" className="text-gray-700 font-medium">RFC Remitente/Destinatario *</Label>
          <Input
            id="rfc"
            value={rfcRemitenteDestinatario}
            onChange={onRFCChange}
            placeholder="RFC del remitente o destinatario"
            className={`border-gray-100 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm ${errors.rfc ? 'border-red-500' : ''}`}
          />
          {errors.rfc && <p className="text-sm text-red-500 mt-1">{errors.rfc}</p>}
        </div>

        <div>
          <Label htmlFor="nombre" className="text-gray-700 font-medium">Nombre/Razón Social *</Label>
          <Input
            id="nombre"
            value={nombreRemitenteDestinatario}
            onChange={onNombreChange}
            placeholder="Nombre completo o razón social"
            className={`border-gray-100 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-gray-400/10 shadow-sm ${errors.nombre ? 'border-red-500' : ''}`}
          />
          {errors.nombre && <p className="text-sm text-red-500 mt-1">{errors.nombre}</p>}
        </div>
      </div>
    </div>
  );
}
