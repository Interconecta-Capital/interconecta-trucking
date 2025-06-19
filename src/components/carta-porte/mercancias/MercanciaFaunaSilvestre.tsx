
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Leaf, AlertTriangle, Shield } from 'lucide-react';

interface MercanciaFaunaSilvestreProps {
  descripcion: string;
  onDescripcionChange: (descripcion: string) => void;
  onMetadataChange: (metadata: any) => void;
}

export function MercanciaFaunaSilvestre({
  descripcion,
  onDescripcionChange,
  onMetadataChange
}: MercanciaFaunaSilvestreProps) {
  const [especieDetectada, setEspecieDetectada] = useState<string>('');
  const [esFaunaProtegida, setEsFaunaProtegida] = useState(false);
  const [permisoSemarnat, setPermisoSemarnat] = useState('');
  const [acreditacionLegal, setAcreditacionLegal] = useState('');
  const [microchip, setMicrochip] = useState('');

  // Lista de especies protegidas para detección automática
  const especiesProtegidas = [
    'jaguar', 'panthera onca', 'ocelote', 'leopardus pardalis', 
    'tapir', 'tapirus bairdii', 'quetzal', 'pharomachrus mocinno'
  ];

  useEffect(() => {
    const descripcionLower = descripcion.toLowerCase();
    const especieEncontrada = especiesProtegidas.find(especie => 
      descripcionLower.includes(especie)
    );
    
    if (especieEncontrada) {
      setEspecieDetectada(especieEncontrada);
      setEsFaunaProtegida(true);
    } else {
      setEspecieDetectada('');
      setEsFaunaProtegida(false);
    }
  }, [descripcion]);

  const generarDescripcionCompleta = () => {
    if (!esFaunaProtegida) return descripcion;

    let descripcionCompleta = descripcion;
    
    if (microchip) {
      descripcionCompleta += `, con número de microchip ${microchip}`;
    }
    
    if (permisoSemarnat) {
      descripcionCompleta += `, amparado por Autorización de Traslado SEMARNAT No. ${permisoSemarnat}`;
    }
    
    if (acreditacionLegal) {
      descripcionCompleta += ` y Acreditación de Legal Procedencia No. ${acreditacionLegal}`;
    }

    return descripcionCompleta;
  };

  useEffect(() => {
    const descripcionCompleta = generarDescripcionCompleta();
    if (descripcionCompleta !== descripcion) {
      onDescripcionChange(descripcionCompleta);
    }
    
    onMetadataChange({
      esFaunaProtegida,
      especieDetectada,
      permisoSemarnat,
      acreditacionLegal,
      microchip
    });
  }, [esFaunaProtegida, permisoSemarnat, acreditacionLegal, microchip]);

  if (!esFaunaProtegida) {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <Leaf className="h-5 w-5" />
          Fauna Silvestre Detectada
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Especie Protegida
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="border-amber-300 bg-amber-100">
          <Shield className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Especie detectada:</strong> {especieDetectada.toUpperCase()}
            <br />
            Se requiere documentación SEMARNAT obligatoria para el traslado legal.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="permiso-semarnat">
              Número de Autorización SEMARNAT *
            </Label>
            <Input
              id="permiso-semarnat"
              value={permisoSemarnat}
              onChange={(e) => setPermisoSemarnat(e.target.value)}
              placeholder="ej: GTO-123/2025"
              required
            />
          </div>

          <div>
            <Label htmlFor="acreditacion-legal">
              Acreditación de Legal Procedencia *
            </Label>
            <Input
              id="acreditacion-legal"
              value={acreditacionLegal}
              onChange={(e) => setAcreditacionLegal(e.target.value)}
              placeholder="ej: UMA-456/2025"
              required
            />
          </div>

          <div>
            <Label htmlFor="microchip">
              Número de Microchip/Identificador
            </Label>
            <Input
              id="microchip"
              value={microchip}
              onChange={(e) => setMicrochip(e.target.value)}
              placeholder="ej: 985100012345678"
            />
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Importante:</strong> Debe portar físicamente los documentos originales de SEMARNAT durante el traslado. 
            La falta de estos permisos puede resultar en decomiso de los ejemplares.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
