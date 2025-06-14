
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FiguraFormOptimizada } from './FiguraFormOptimizada';
import { ArrowLeft, CheckCircle, AlertCircle, User, Plus, Users } from 'lucide-react';

interface FiguraCompleta {
  id: string;
  tipo_figura: string;
  rfc_figura: string;
  nombre_figura: string;
  num_licencia?: string;
  residencia_fiscal_figura?: string;
  num_reg_id_trib_figura?: string;
  domicilio: {
    pais: string;
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
    referencia?: string;
  };
}

interface FigurasSectionOptimizadaProps {
  data: FiguraCompleta[];
  onChange: (data: FiguraCompleta[]) => void;
  onPrev: () => void;
  onFinish: () => void;
}

export function FigurasSectionOptimizada({ data, onChange, onPrev, onFinish }: FigurasSectionOptimizadaProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Validar que hay al menos un operador
  const isDataComplete = () => {
    return data.length > 0 && data.some(figura => figura.tipo_figura === '01');
  };

  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push('Se requiere al menos una figura de transporte');
    }
    
    const tieneOperador = data.some(figura => figura.tipo_figura === '01');
    if (!tieneOperador) {
      errors.push('Se requiere al menos un operador (tipo 01)');
    }
    
    data.forEach((figura, index) => {
      if (!figura.rfc_figura?.trim()) {
        errors.push(`Figura #${index + 1}: RFC es requerido`);
      }
      
      if (!figura.nombre_figura?.trim()) {
        errors.push(`Figura #${index + 1}: Nombre es requerido`);
      }
      
      if (figura.tipo_figura === '01' && !figura.num_licencia?.trim()) {
        errors.push(`Operador #${index + 1}: Licencia es requerida`);
      }
    });
    
    return errors;
  };

  const validationErrors = getValidationErrors();
  const isComplete = isDataComplete();

  const handleAddFigura = () => {
    setEditingIndex(null);
    setShowForm(true);
  };

  const handleEditFigura = (index: number) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleUpdateFigura = (figuraData: FiguraCompleta) => {
    if (editingIndex !== null) {
      const newData = [...data];
      newData[editingIndex] = figuraData;
      onChange(newData);
    } else {
      onChange([...data, figuraData]);
    }
    setShowForm(false);
    setEditingIndex(null);
  };

  const handleRemoveFigura = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

  const getCompletionPercentage = () => {
    if (data.length === 0) return 0;
    
    const tieneOperador = data.some(f => f.tipo_figura === '01') ? 50 : 0;
    const figurasCompletas = data.filter(f => 
      f.rfc_figura && f.nombre_figura && 
      (f.tipo_figura !== '01' || f.num_licencia)
    ).length;
    
    const porcentajeFiguras = (figurasCompletas / Math.max(1, data.length)) * 50;
    
    return Math.round(tieneOperador + porcentajeFiguras);
  };

  const completionPercentage = getCompletionPercentage();

  const getTipoFiguraLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      '01': 'Operador',
      '02': 'Propietario',
      '03': 'Arrendador',
      '04': 'Notificado'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Figuras de Transporte</h3>
                <p className="text-sm text-blue-700">
                  Configure las personas involucradas en el transporte (operadores, propietarios, etc.)
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                {isComplete ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-blue-300"></div>
                )}
                <span className="font-medium text-blue-900">
                  {completionPercentage}% Completo
                </span>
              </div>
              <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Gestión de Figuras</span>
            </CardTitle>
            
            {!showForm && (
              <Button 
                type="button"
                onClick={handleAddFigura}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Figura</span>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {showForm ? (
            <FiguraFormOptimizada
              figura={editingIndex !== null ? data[editingIndex] : undefined}
              onUpdate={handleUpdateFigura}
              onRemove={handleCancelForm}
              index={editingIndex !== null ? editingIndex : data.length}
            />
          ) : (
            <div className="space-y-4">
              {data.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No hay figuras de transporte agregadas. Agrega al menos un operador para continuar.
                  </p>
                  <Button onClick={handleAddFigura}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Operador
                  </Button>
                </div>
              ) : (
                <>
                  {/* Lista de figuras */}
                  <div className="space-y-3">
                    {data.map((figura, index) => (
                      <Card key={figura.id} className={`border-l-4 ${figura.tipo_figura === '01' ? 'border-l-green-500' : 'border-l-blue-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">
                                  {getTipoFiguraLabel(figura.tipo_figura)} #{index + 1}
                                </h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  figura.tipo_figura === '01' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {figura.tipo_figura}
                                </span>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {figura.nombre_figura}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">RFC:</span>
                                  <span className="ml-1 font-medium">{figura.rfc_figura}</span>
                                </div>
                                
                                {figura.num_licencia && (
                                  <div>
                                    <span className="text-muted-foreground">Licencia:</span>
                                    <span className="ml-1 font-medium">{figura.num_licencia}</span>
                                  </div>
                                )}
                                
                                <div>
                                  <span className="text-muted-foreground">Residencia:</span>
                                  <span className="ml-1 font-medium">{figura.residencia_fiscal_figura || 'MEX'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditFigura(index)}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFigura(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Botón para agregar más figuras */}
                  <Button 
                    variant="outline" 
                    onClick={handleAddFigura}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Otra Figura de Transporte
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validaciones */}
      {!showForm && validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Se requieren correcciones:</p>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Información de completitud */}
      {!showForm && isComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Figuras Configuradas Correctamente</p>
                <p className="text-sm text-green-700">
                  Se han configurado {data.length} figura(s) con al menos un operador requerido
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de navegación */}
      {!showForm && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
          
          <Button 
            onClick={onFinish} 
            disabled={!isComplete}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Generar Carta Porte</span>
          </Button>
        </div>
      )}
    </div>
  );
}
