
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, AlertCircle, Star } from 'lucide-react';
import { RFCValidator } from '@/utils/rfcValidation';

interface UbicacionRFCSectionProps {
  rfc: string;
  nombre: string;
  rfcValidation: ReturnType<typeof RFCValidator.validarRFC>;
  onRFCChange: (rfc: string) => void;
  onNombreChange: (nombre: string) => void;
  onSaveToFavorites: () => void;
  canSaveToFavorites: boolean;
}

export function UbicacionRFCSection({
  rfc,
  nombre,
  rfcValidation,
  onRFCChange,
  onNombreChange,
  onSaveToFavorites,
  canSaveToFavorites
}: UbicacionRFCSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>RFC Remitente/Destinatario *</Label>
        <div className="relative">
          <Input
            value={rfc}
            onChange={(e) => onRFCChange(e.target.value)}
            placeholder="ABC123456789"
            className={`pr-10 ${!rfcValidation.esValido ? 'border-red-500' : ''}`}
            maxLength={13}
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
        
        {!rfcValidation.esValido && rfcValidation.errores.length > 0 && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {rfcValidation.errores.join(', ')}
            </AlertDescription>
          </Alert>
        )}
        
        {rfcValidation.esValido && rfcValidation.tipo && (
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary">
              Persona {rfcValidation.tipo === 'fisica' ? 'Física' : 'Moral'}
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Nombre/Razón Social *</Label>
        <div className="flex space-x-2">
          <Input
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            placeholder="Nombre completo o razón social"
          />
          {canSaveToFavorites && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveToFavorites}
            >
              <Star className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
