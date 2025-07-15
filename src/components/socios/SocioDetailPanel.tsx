import { useState } from 'react';
import { X, User, BarChart3, History, Calculator, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SocioMetricas } from './SocioMetricas';
import { SocioHistorial } from './SocioHistorial';

interface SocioDetailPanelProps {
  socio: any;
  open: boolean;
  onClose: () => void;
}

export function SocioDetailPanel({ socio, open, onClose }: SocioDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('info');

  if (!socio) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-4xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Análisis Integral: {socio.nombre_razon_social}
            </SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Información básica del socio */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">RFC</p>
                  <p className="font-mono font-medium">{socio.rfc}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{socio.email || 'No especificado'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge variant={socio.estado === 'activo' ? 'default' : 'secondary'}>
                    {socio.estado}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </SheetHeader>

        <div className="mt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Info
              </TabsTrigger>
              <TabsTrigger value="metricas" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Métricas
              </TabsTrigger>
              <TabsTrigger value="historial" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial
              </TabsTrigger>
              <TabsTrigger value="calculadora" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculadora
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Detallada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Datos Principales</p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Nombre/Razón Social:</span>
                          <p className="text-sm">{socio.nombre_razon_social}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">RFC:</span>
                          <p className="text-sm font-mono">{socio.rfc}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Tipo de Persona:</span>
                          <Badge variant="outline" className="ml-2">
                            {socio.tipo_persona === 'fisica' ? 'Física' : 'Moral'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Contacto</p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Email:</span>
                          <p className="text-sm">{socio.email || 'No especificado'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Teléfono:</span>
                          <p className="text-sm">{socio.telefono || 'No especificado'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Estado:</span>
                          <Badge variant={socio.estado === 'activo' ? 'default' : 'secondary'} className="ml-2">
                            {socio.estado}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {socio.direccion && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Dirección</p>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm">
                          {socio.direccion.calle && `${socio.direccion.calle}, `}
                          {socio.direccion.colonia && `${socio.direccion.colonia}, `}
                          {socio.direccion.municipio && `${socio.direccion.municipio}, `}
                          {socio.direccion.estado && `${socio.direccion.estado} `}
                          {socio.direccion.codigo_postal && `CP ${socio.direccion.codigo_postal}`}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metricas" className="mt-4">
              <SocioMetricas socio={socio} />
            </TabsContent>

            <TabsContent value="historial" className="mt-4">
              <SocioHistorial socio={socio} />
            </TabsContent>

            <TabsContent value="calculadora" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calculadora de Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Proyección Mensual</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Cartas Porte estimadas:</span>
                            <span className="font-medium">~25</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Valor promedio:</span>
                            <span className="font-medium">$35,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Ingreso estimado:</span>
                            <span className="font-medium text-green-600">$875,000</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Eficiencia Fiscal</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Documentos completos:</span>
                            <span className="font-medium">92%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Tiempo promedio proceso:</span>
                            <span className="font-medium">2.5 horas</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Errores por documento:</span>
                            <span className="font-medium">0.3</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Comparativa Sectorial</p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Rendimiento vs promedio:</span>
                            <Badge variant="default">+15%</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Posición en ranking:</span>
                            <span className="font-medium">Top 25%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Calificación crediticia:</span>
                            <Badge variant="outline">AA-</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Recomendaciones</p>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">• Optimizar tiempo de procesamiento</p>
                          <p className="text-xs text-muted-foreground">• Implementar validación automática</p>
                          <p className="text-xs text-muted-foreground">• Actualizar documentos fiscales</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}