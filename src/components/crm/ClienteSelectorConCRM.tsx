
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Cliente {
  rfc: string;
  nombre: string;
}

interface ClienteSelectorConCRMProps {
  tipo: 'emisor' | 'receptor';
  rfc: string;
  nombre: string;
  onClienteChange: (cliente: Cliente) => void;
}

export function ClienteSelectorConCRM({
  tipo,
  rfc,
  nombre,
  onClienteChange
}: ClienteSelectorConCRMProps) {
  const handleRFCChange = (value: string) => {
    onClienteChange({ rfc: value.toUpperCase(), nombre });
  };

  const handleNombreChange = (value: string) => {
    onClienteChange({ rfc, nombre: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor={`rfc-${tipo}`}>RFC del {tipo} *</Label>
        <Input
          id={`rfc-${tipo}`}
          value={rfc}
          onChange={(e) => handleRFCChange(e.target.value)}
          placeholder="XAXX010101000"
          required
        />
      </div>
      <div>
        <Label htmlFor={`nombre-${tipo}`}>Nombre del {tipo} *</Label>
        <Input
          id={`nombre-${tipo}`}
          value={nombre}
          onChange={(e) => handleNombreChange(e.target.value)}
          placeholder="Nombre completo"
          required
        />
      </div>
    </div>
  );
}
