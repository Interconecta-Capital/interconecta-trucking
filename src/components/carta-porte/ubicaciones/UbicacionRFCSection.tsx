
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, AlertCircle, Star, CheckCircle } from 'lucide-react';
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
  const showValidation = rfc.length > 0;
  const isValidFormat = rfc.length >= 12 && rfc.length <= 13;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>RFC Remitente/Destinatario *</Label>
        <div className="relative">
          <Input
            value={rfc}
            onChange={(e) => onRFCChange(e.target.value.toUpperCase())}
            placeholder="ABC123456789"
            className={`pr-10 ${showValidation && !rfcValidation.esValido ? 'border-red-500' : 
              showValidation && rfcValidation.esValido ? 'border-green-500' : ''}`}
            maxLength={13}
          />
          {showValidation && rfcValidation.esValido ? (
            <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
          ) : (
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          )}
        </div>
        
        {showValidation && !rfcValidation.esValido && rfcValidation.errores.length > 0 && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {rfcValidation.errores[0]}
            </AlertDescription>
          </Alert>
        )}
        
        {showValidation && rfcValidation.esValido && rfcValidation.tipo && (
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Persona {rfcValidation.tipo === 'fisica' ? 'Física' : 'Moral'}
            </Badge>
          </div>
        )}
        
        {showValidation && !isValidFormat && (
          <p className="text-sm text-gray-500">
            RFC debe tener entre 12 y 13 caracteres
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Nombre/Razón Social *</Label>
        <div className="flex space-x-2">
          <Input
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            placeholder="Nombre completo o razón social"
            className={nombre.trim().length > 0 ? 'border-green-500' : ''}
          />
          {canSaveToFavorites && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveToFavorites}
              title="Guardar en ubicaciones frecuentes"
            >
              <Star className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
