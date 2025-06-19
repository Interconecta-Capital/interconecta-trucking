
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BorradorCartaPorte } from '@/types/cartaPorteLifecycle';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConvertirBorradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrador: BorradorCartaPorte | null;
  onConfirmar: (nombreDocumento: string, validarDatos: boolean) => Promise<void>;
}

export function ConvertirBorradorDialog({
  open,
  onOpenChange,
  borrador,
  onConfirmar
}: ConvertirBorradorDialogProps) {
  const [nombreDocumento, setNombreDocumento] = useState('');
  const [validarDatos, setValidarDatos] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (borrador && open) {
      setNombreDocumento(borrador.nombre_borrador.replace('Borrador', 'Carta Porte'));
    }
  }, [borrador, open]);

  const handleConfirmar = async () => {
    if (!nombreDocumento.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onConfirmar(nombreDocumento.trim(), validarDatos);
      setNombreDocumento('');
      setValidarDatos(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getValidationPreview = () => {
    if (!borrador?.datos_formulario) return null;

    const datos = borrador.datos_formulario;
    const issues = [];

    // Verificar configuración básica
    if (!datos.configuracion?.emisor?.rfc) {
      issues.push('RFC del emisor faltante');
    }
    if (!datos.configuracion?.receptor?.rfc) {
      issues.push('RFC del receptor faltante');
    }

    // Verificar ubicaciones
    if (!datos.ubicaciones || datos.ubicaciones.length < 2) {
      issues.push('Se requieren al menos 2 ubicaciones (origen y destino)');
    }

    // Verificar mercancías
    if (!datos.mercancias || datos.mercancias.length === 0) {
      issues.push('Se requiere al menos una mercancía');
    }

    // Verificar figuras
    if (!datos.figuras || datos.figuras.length === 0) {
      issues.push('Se requiere al menos una figura de transporte');
    }

    return issues;
  };

  const validationIssues = getValidationPreview();
  const hasIssues = validationIssues && validationIssues.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Convertir Borrador a Carta Porte</DialogTitle>
          <DialogDescription>
            Esto creará una Carta Porte oficial que podrá ser timbrada y utilizada legalmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nombre del documento */}
          <div className="space-y-2">
            <Label htmlFor="nombre-documento">Nombre del Documento</Label>
            <Input
              id="nombre-documento"
              value={nombreDocumento}
              onChange={(e) => setNombreDocumento(e.target.value)}
              placeholder="Ej: Carta Porte - Envío México-Guadalajara"
              className="w-full"
            />
          </div>

          {/* Validación de datos */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="validar-datos"
                checked={validarDatos}
                onCheckedChange={(checked) => setValidarDatos(checked as boolean)}
              />
              <Label htmlFor="validar-datos" className="text-sm">
                Validar datos antes de convertir (recomendado)
              </Label>
            </div>

            {validarDatos && hasIssues && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="space-y-1">
                    <p className="font-medium">Se encontraron los siguientes problemas:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {validationIssues?.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                    <p className="text-xs mt-2">
                      Puedes continuar, pero es recomendable corregir estos problemas primero.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {validarDatos && !hasIssues && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  El borrador pasó todas las validaciones básicas.
                </AlertDescription>
              </Alert>
            )}

            {!validarDatos && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Se omitirá la validación de datos. Asegúrate de que la información sea correcta.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Información adicional */}
          <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
            <p className="font-medium mb-1">¿Qué sucede al convertir?</p>
            <ul className="space-y-1 text-xs">
              <li>• Se generará un IdCCP único para la Carta Porte</li>
              <li>• El documento estará listo para generar XML y PDF</li>
              <li>• Podrás proceder con el timbrado cuando esté listo</li>
              <li>• El borrador original se mantendrá como referencia</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmar}
            disabled={!nombreDocumento.trim() || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Convirtiendo...
              </>
            ) : (
              'Convertir a Carta Porte'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
