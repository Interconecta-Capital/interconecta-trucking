import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Shield,
  FileKey,
  Loader2
} from 'lucide-react';
import { ConfiguracionEmisorService } from '@/services/configuracion/ConfiguracionEmisorService';

interface ValidacionPreViajeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

interface EstadoValidacion {
  configuracionCompleta: boolean;
  certificadoActivo: boolean;
  errores: string[];
  advertencias: string[];
  puedeCrearViaje: boolean;
}

export function ValidacionPreViajeDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel
}: ValidacionPreViajeDialogProps) {
  const [validando, setValidando] = useState(true);
  const [estado, setEstado] = useState<EstadoValidacion>({
    configuracionCompleta: false,
    certificadoActivo: false,
    errores: [],
    advertencias: [],
    puedeCrearViaje: false
  });

  useEffect(() => {
    if (open) {
      validarConfiguracion();
    }
  }, [open]);

  const validarConfiguracion = async () => {
    setValidando(true);
    
    try {
      // Validar configuración empresarial
      const validacionConfig = await ConfiguracionEmisorService.validarConfiguracionCompleta();
      
      // Validar certificado CSD
      const tieneCertificado = await ConfiguracionEmisorService.tieneCertificadoActivo();

      setEstado({
        configuracionCompleta: validacionConfig.isValid,
        certificadoActivo: tieneCertificado,
        errores: validacionConfig.errors,
        advertencias: validacionConfig.warnings,
        puedeCrearViaje: validacionConfig.isValid && tieneCertificado
      });
    } catch (error) {
      console.error('Error validando configuración:', error);
      setEstado({
        configuracionCompleta: false,
        certificadoActivo: false,
        errores: [error instanceof Error ? error.message : 'Error validando configuración'],
        advertencias: [],
        puedeCrearViaje: false
      });
    } finally {
      setValidando(false);
    }
  };

  const handleProceder = () => {
    if (estado.puedeCrearViaje) {
      onConfirm();
      onOpenChange(false);
    }
  };

  const handleIrAConfiguracion = () => {
    onCancel();
    window.location.href = '/configuracion-empresa';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {validando ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : estado.puedeCrearViaje ? (
              <CheckCircle2 className="h-5 w-5 text-success" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warning" />
            )}
            Validación Pre-Viaje
          </DialogTitle>
          <DialogDescription>
            Verificando configuración empresarial y requisitos para Carta Porte SAT 3.1
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {validando ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Validando configuración...</span>
            </div>
          ) : (
            <>
              {/* Estado de Configuración Empresarial */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <Settings className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">Configuración Empresarial</h4>
                    <Badge variant={estado.configuracionCompleta ? "success" : "destructive"}>
                      {estado.configuracionCompleta ? 'Completa' : 'Incompleta'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    RFC, razón social, domicilio fiscal y seguros
                  </p>
                </div>
              </div>

              {/* Estado de Certificado CSD */}
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <FileKey className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">Certificado Digital (CSD)</h4>
                    <Badge variant={estado.certificadoActivo ? "success" : "destructive"}>
                      {estado.certificadoActivo ? 'Activo' : 'No configurado'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requerido para firmar documentos fiscales
                  </p>
                </div>
              </div>

              {/* Errores Críticos */}
              {estado.errores.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Errores que impiden crear el viaje:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {estado.errores.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Advertencias */}
              {estado.advertencias.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Advertencias:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {estado.advertencias.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Mensaje de Éxito */}
              {estado.puedeCrearViaje && (
                <Alert className="bg-success/10 border-success">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    ✅ Todos los requisitos están completos. Puedes proceder a crear el viaje.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {!estado.puedeCrearViaje && !validando && (
            <Button
              variant="outline"
              onClick={handleIrAConfiguracion}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Ir a Configuración
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              onCancel();
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleProceder}
            disabled={!estado.puedeCrearViaje || validando}
          >
            {estado.puedeCrearViaje ? 'Proceder' : 'No Disponible'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
