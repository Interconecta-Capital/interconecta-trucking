
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Shield, 
  AlertTriangle, 
  Info, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronRight,
  Zap,
  FileText
} from 'lucide-react';
import { ValidationResult31 } from '@/services/validation/ValidationEngine31Enhanced';

interface AlertasCumplimientoPanelProps {
  validaciones: ValidationResult31[];
  onAutoFix?: (validation: ValidationResult31) => void;
  onExportChecklist?: () => void;
  showStats?: boolean;
}

export function AlertasCumplimientoPanel({
  validaciones,
  onAutoFix,
  onExportChecklist,
  showStats = true
}: AlertasCumplimientoPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['bloqueante']));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const validacionesPorCategoria = validaciones.reduce((acc, validacion) => {
    const key = `${validacion.level}_${validacion.category}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(validacion);
    return acc;
  }, {} as Record<string, ValidationResult31[]>);

  const stats = {
    bloqueantes: validaciones.filter(v => v.level === 'bloqueante').length,
    advertencias: validaciones.filter(v => v.level === 'advertencia').length,
    informativas: validaciones.filter(v => v.level === 'informacion').length,
    autoFixables: validaciones.filter(v => v.autoFix).length
  };

  const getIconForLevel = (level: string) => {
    switch (level) {
      case 'bloqueante': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'advertencia': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'informacion': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getColorForLevel = (level: string) => {
    switch (level) {
      case 'bloqueante': return 'bg-red-50 border-red-200 text-red-800';
      case 'advertencia': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'informacion': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'material_peligroso': 'Material Peligroso',
      'ruta_restringida': 'Restricciones de Ruta',
      'capacidad': 'Capacidad del Vehículo',
      'documentacion': 'Documentación',
      'general': 'Validaciones Generales'
    };
    return names[category] || category;
  };

  if (validaciones.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">✅ Carta Porte Lista para Envío</span>
          </div>
          <p className="text-sm text-green-600 mt-2">
            Todas las validaciones avanzadas han sido completadas exitosamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      {showStats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-blue-600" />
              Resumen de Cumplimiento SAT 3.1
              {onExportChecklist && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportChecklist}
                  className="ml-auto"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Exportar Checklist
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.bloqueantes}</div>
                <div className="text-sm text-gray-600">Bloqueantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.advertencias}</div>
                <div className="text-sm text-gray-600">Advertencias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.informativas}</div>
                <div className="text-sm text-gray-600">Informativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.autoFixables}</div>
                <div className="text-sm text-gray-600">Auto-corregibles</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validaciones por Categoría */}
      {Object.entries(validacionesPorCategoria).map(([key, validacionesCategoria]) => {
        const [level, category] = key.split('_', 2);
        const isExpanded = expandedCategories.has(key);
        
        return (
          <Card key={key} className={getColorForLevel(level)}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(key)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-opacity-80 transition-colors">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getIconForLevel(level)}
                      <span>{getCategoryName(category)}</span>
                      <Badge variant="outline" className="bg-white bg-opacity-50">
                        {validacionesCategoria.length}
                      </Badge>
                    </div>
                    {isExpanded ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0 space-y-3">
                  {validacionesCategoria.map((validacion, index) => (
                    <Alert key={index} className="bg-white bg-opacity-50">
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-medium">{validacion.title}</div>
                          <div className="text-sm">{validacion.message}</div>
                          
                          {validacion.solution && (
                            <div className="text-sm text-gray-600">
                              <strong>Solución:</strong> {validacion.solution}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            {validacion.autoFix && onAutoFix && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAutoFix(validacion)}
                                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Auto-corregir
                              </Button>
                            )}

                            {validacion.linkTramite && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(validacion.linkTramite, '_blank')}
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Ver Trámite
                              </Button>
                            )}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
