import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Settings, 
  Shield,
  FileKey,
  Loader2,
  ChevronDown,
  ChevronUp,
  Building,
  MapPin,
  FileText
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
  categorias?: {
    datosFiscales: { valido: boolean; errores: string[] };
    domicilioFiscal: { valido: boolean; errores: string[] };
    seguros: { valido: boolean; errores: string[] };
    permisosSCT: { valido: boolean; errores: string[] };
  };
}

export function ValidacionPreViajeDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel
}: ValidacionPreViajeDialogProps) {
  const navigate = useNavigate();
  const [validando, setValidando] = useState(true);
  const [estado, setEstado] = useState<EstadoValidacion>({
    configuracionCompleta: false,
    certificadoActivo: false,
    errores: [],
    advertencias: [],
    puedeCrearViaje: false
  });
  const [expandedSections, setExpandedSections] = useState({
    datosFiscales: false,
    domicilioFiscal: false,
    seguros: false,
    permisosSCT: false
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
        puedeCrearViaje: validacionConfig.isValid && tieneCertificado,
        categorias: validacionConfig.categorias
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
    onOpenChange(false);
    navigate('/configuracion/empresa');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          {validando ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Validando configuración...</span>
            </div>
          ) : (
            <>
              {/* Secciones de Configuración con detalles expandibles */}
              {estado.categorias && (
                <div className="space-y-3">
                  {/* Datos Fiscales */}
                  <Collapsible
                    open={expandedSections.datosFiscales}
                    onOpenChange={() => toggleSection('datosFiscales')}
                  >
                    <div className="rounded-lg border bg-card overflow-hidden">
                      <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {estado.categorias.datosFiscales.valido ? (
                            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                          )}
                          <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <h4 className="font-medium">Datos Fiscales</h4>
                            <p className="text-sm text-muted-foreground">
                              RFC, razón social y régimen fiscal
                            </p>
                          </div>
                          {!estado.categorias.datosFiscales.valido && (
                            <Badge variant="destructive" className="mr-2">
                              {estado.categorias.datosFiscales.errores.length} error{estado.categorias.datosFiscales.errores.length > 1 ? 'es' : ''}
                            </Badge>
                          )}
                          {expandedSections.datosFiscales ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {estado.categorias.datosFiscales.errores.length > 0 && (
                          <div className="px-4 pb-4 pt-2 border-t bg-destructive/5">
                            <p className="text-sm font-medium text-destructive mb-2">Campos faltantes:</p>
                            <ul className="space-y-1">
                              {estado.categorias.datosFiscales.errores.map((error, index) => (
                                <li key={index} className="text-sm text-destructive flex items-start gap-2">
                                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{error}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>

                  {/* Domicilio Fiscal */}
                  <Collapsible
                    open={expandedSections.domicilioFiscal}
                    onOpenChange={() => toggleSection('domicilioFiscal')}
                  >
                    <div className="rounded-lg border bg-card overflow-hidden">
                      <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {estado.categorias.domicilioFiscal.valido ? (
                            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                          )}
                          <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <h4 className="font-medium">Domicilio Fiscal</h4>
                            <p className="text-sm text-muted-foreground">
                              Dirección completa del emisor
                            </p>
                          </div>
                          {!estado.categorias.domicilioFiscal.valido && (
                            <Badge variant="destructive" className="mr-2">
                              {estado.categorias.domicilioFiscal.errores.length} error{estado.categorias.domicilioFiscal.errores.length > 1 ? 'es' : ''}
                            </Badge>
                          )}
                          {expandedSections.domicilioFiscal ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {estado.categorias.domicilioFiscal.errores.length > 0 && (
                          <div className="px-4 pb-4 pt-2 border-t bg-destructive/5">
                            <p className="text-sm font-medium text-destructive mb-2">Campos faltantes:</p>
                            <ul className="space-y-1">
                              {estado.categorias.domicilioFiscal.errores.map((error, index) => (
                                <li key={index} className="text-sm text-destructive flex items-start gap-2">
                                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{error}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>

                  {/* Seguros */}
                  <Collapsible
                    open={expandedSections.seguros}
                    onOpenChange={() => toggleSection('seguros')}
                  >
                    <div className="rounded-lg border bg-card overflow-hidden">
                      <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {estado.categorias.seguros.valido ? (
                            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                          )}
                          <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <h4 className="font-medium">Seguros</h4>
                            <p className="text-sm text-muted-foreground">
                              Pólizas de seguro requeridas
                            </p>
                          </div>
                          {!estado.categorias.seguros.valido && (
                            <Badge variant="destructive" className="mr-2">
                              {estado.categorias.seguros.errores.length} error{estado.categorias.seguros.errores.length > 1 ? 'es' : ''}
                            </Badge>
                          )}
                          {expandedSections.seguros ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {estado.categorias.seguros.errores.length > 0 && (
                          <div className="px-4 pb-4 pt-2 border-t bg-destructive/5">
                            <p className="text-sm font-medium text-destructive mb-2">Seguros faltantes:</p>
                            <ul className="space-y-1">
                              {estado.categorias.seguros.errores.map((error, index) => (
                                <li key={index} className="text-sm text-destructive flex items-start gap-2">
                                  <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{error}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>

                  {/* Permisos SCT */}
                  <Collapsible
                    open={expandedSections.permisosSCT}
                    onOpenChange={() => toggleSection('permisosSCT')}
                  >
                    <div className="rounded-lg border bg-card overflow-hidden">
                      <CollapsibleTrigger className="w-full p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {estado.categorias.permisosSCT.valido ? (
                            <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                          )}
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 text-left">
                            <h4 className="font-medium">Permisos SCT</h4>
                            <p className="text-sm text-muted-foreground">
                              Permisos de transporte federal
                            </p>
                          </div>
                          {!estado.categorias.permisosSCT.valido && (
                            <Badge variant="outline" className="mr-2">
                              Advertencia
                            </Badge>
                          )}
                          {expandedSections.permisosSCT ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        {estado.categorias.permisosSCT.errores.length > 0 && (
                          <div className="px-4 pb-4 pt-2 border-t bg-warning/5">
                            <p className="text-sm font-medium text-warning mb-2">Información:</p>
                            <ul className="space-y-1">
                              {estado.categorias.permisosSCT.errores.map((error, index) => (
                                <li key={index} className="text-sm text-warning flex items-start gap-2">
                                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span>{error}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>
              )}

              {/* Estado de Certificado CSD */}
              <div className="rounded-lg border bg-card overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  {estado.certificadoActivo ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  )}
                  <FileKey className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium">Certificado Digital (CSD)</h4>
                    <p className="text-sm text-muted-foreground">
                      Requerido para firmar documentos fiscales
                    </p>
                  </div>
                  <Badge variant={estado.certificadoActivo ? "success" : "destructive"}>
                    {estado.certificadoActivo ? 'Activo' : 'No configurado'}
                  </Badge>
                </div>
              </div>

              {/* Sección de Recomendaciones (seguros opcionales) */}
              {estado.advertencias.length > 0 && (
                <Alert className="border-warning/50 bg-warning/5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertDescription>
                    <div className="font-medium mb-2 text-warning">Recomendaciones Opcionales:</div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Los siguientes elementos son recomendados pero NO bloquean la creación de viajes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
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
