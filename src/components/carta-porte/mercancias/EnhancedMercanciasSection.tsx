import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Package, AlertTriangle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { SmartMercanciaAnalyzer } from './SmartMercanciaAnalyzer';
import { useCatalogoValidation } from '@/hooks/useCatalogoValidation';
import { Mercancia } from '@/types/mercancias';

interface EnhancedMercanciasSectionProps {
  mercancias: Mercancia[];
  onMercanciasChange: (mercancias: Mercancia[]) => void;
  showAIAnalyzer?: boolean;
}

export function EnhancedMercanciasSection({ 
  mercancias, 
  onMercanciasChange, 
  showAIAnalyzer = true 
}: EnhancedMercanciasSectionProps) {
  const [showAnalyzer, setShowAnalyzer] = useState(showAIAnalyzer);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { validateClaveProdServ, validateClaveUnidad } = useCatalogoValidation();

  const handleMercanciasAnalyzed = (mercanciastAnalyzed: any[]) => {
    const nuevasMercancias = mercanciastAnalyzed.map((analizada, index) => ({
      id: `ai-${Date.now()}-${index}`,
      descripcion: analizada.descripcion,
      claveProdServ: analizada.claveProdServ,
      claveUnidad: analizada.claveUnidad,
      cantidad: analizada.cantidad,
      pesoKg: analizada.pesoKg,
      valorMercancia: analizada.valorMercancia,
      valorUnitario: Math.round(analizada.valorMercancia / analizada.cantidad),
      // Campos requeridos adicionales
      unidad: analizada.claveUnidad,
      numIdentificacion: '',
      materialPeligroso: 'No',
      esMaterialPeligroso: false,
      embalaje: 'Sin embalaje específico',
      dimensiones: {
        largo: 0,
        ancho: 0,
        alto: 0
      },
      // Metadatos de la IA
      aiGenerated: true,
      aiConfidence: analizada.confianza,
      validacionSAT: {
        claveProdServ: validateClaveProdServ(analizada.claveProdServ),
        claveUnidad: validateClaveUnidad(analizada.claveUnidad)
      }
    }));

    // Agregar a las mercancías existentes
    onMercanciasChange([...mercancias, ...nuevasMercancias]);
    setShowAnalyzer(false);
  };

  const handleDeleteMercancia = (index: number) => {
    const nuevasMercancias = mercancias.filter((_, i) => i !== index);
    onMercanciasChange(nuevasMercancias);
  };

  const handleEditMercancia = (index: number, updatedMercancia: Partial<Mercancia>) => {
    const nuevasMercancias = [...mercancias];
    nuevasMercancias[index] = { ...nuevasMercancias[index], ...updatedMercancia };
    onMercanciasChange(nuevasMercancias);
    setEditingIndex(null);
  };

  const calculateTotals = () => {
    return mercancias.reduce((totals, mercancia) => ({
      pesoTotal: totals.pesoTotal + (mercancia.pesoKg || 0),
      valorTotal: totals.valorTotal + (mercancia.valorMercancia || 0),
      cantidadTotal: totals.cantidadTotal + (mercancia.cantidad || 0)
    }), { pesoTotal: 0, valorTotal: 0, cantidadTotal: 0 });
  };

  const getValidationBadge = (mercancia: any) => {
    if (!mercancia.aiGenerated) return null;
    
    const confidence = mercancia.aiConfidence;
    switch (confidence) {
      case 'alta':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">IA: Alta</Badge>;
      case 'media':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">IA: Media</Badge>;
      case 'baja':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">IA: Baja</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">IA</Badge>;
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Mercancías y Productos
              {mercancias.length > 0 && (
                <Badge variant="secondary">
                  {mercancias.length} producto{mercancias.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!showAnalyzer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnalyzer(true)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Análisis IA
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Agregar Manual
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        {/* Totales */}
        {mercancias.length > 0 && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{totals.pesoTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-600">kg Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{totals.cantidadTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Piezas Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">${totals.valorTotal.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Valor Total</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Smart Analyzer */}
      <SmartMercanciaAnalyzer
        onMercanciasAnalyzed={handleMercanciasAnalyzed}
        isVisible={showAnalyzer}
      />

      {/* Lista de Mercancías */}
      {mercancias.length > 0 && (
        <div className="space-y-3">
          {mercancias.map((mercancia, index) => (
            <Card key={mercancia.id || index} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-800">{mercancia.descripcion}</h4>
                      {getValidationBadge(mercancia)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Clave SAT:</span>
                        <div className="font-medium flex items-center gap-1">
                          {mercancia.claveProdServ}
                          {mercancia.validacionSAT?.claveProdServ?.valid ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Unidad:</span>
                        <div className="font-medium">{mercancia.claveUnidad}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Cantidad:</span>
                        <div className="font-medium">{mercancia.cantidad?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Peso:</span>
                        <div className="font-medium">{mercancia.pesoKg?.toLocaleString()} kg</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingIndex(index)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMercancia(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Validaciones */}
                {mercancia.validacionSAT && !mercancia.validacionSAT.claveProdServ?.valid && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Código SAT {mercancia.claveProdServ} no encontrado en el catálogo oficial.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {mercancias.length === 0 && !showAnalyzer && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay mercancías agregadas</h3>
            <p className="text-gray-500 text-center mb-6">
              Usa el análisis inteligente para extraer automáticamente los datos de tu carga
            </p>
            <Button onClick={() => setShowAnalyzer(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Comenzar Análisis IA
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
