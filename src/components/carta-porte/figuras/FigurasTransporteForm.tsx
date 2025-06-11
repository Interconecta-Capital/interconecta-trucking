
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus, Star } from 'lucide-react';
import { FigurasList } from './FigurasList';
import { FiguraForm } from './FiguraForm';
import { FigurasFrecuentes } from './FigurasFrecuentes';
import { useFigurasTransporte, FiguraTransporte } from '@/hooks/useFigurasTransporte';

interface FigurasTransporteFormProps {
  data: FiguraTransporte[];
  onChange: (data: FiguraTransporte[]) => void;
}

export function FigurasTransporteForm({ data, onChange }: FigurasTransporteFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showFrecuentes, setShowFrecuentes] = useState(false);
  const { figurasFrecuentes, cargarFigurasFrecuentes, guardarFiguraFrecuente } = useFigurasTransporte();

  useEffect(() => {
    cargarFigurasFrecuentes();
  }, [cargarFigurasFrecuentes]);

  const handleAddFigura = (figura: FiguraTransporte) => {
    const newFiguras = [...data, { ...figura, id: Date.now().toString() }];
    onChange(newFiguras);
    setShowForm(false);
    
    // Guardar como figura frecuente
    guardarFiguraFrecuente(figura);
  };

  const handleEditFigura = (figura: FiguraTransporte) => {
    if (editingIndex !== null) {
      const newFiguras = [...data];
      newFiguras[editingIndex] = figura;
      onChange(newFiguras);
      setEditingIndex(null);
      setShowForm(false);
      
      // Actualizar figura frecuente
      guardarFiguraFrecuente(figura);
    }
  };

  const handleDeleteFigura = (index: number) => {
    const newFiguras = data.filter((_, i) => i !== index);
    onChange(newFiguras);
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleCargarFiguraFrecuente = (figuraFrecuente: any) => {
    const figura: FiguraTransporte = {
      tipo_figura: figuraFrecuente.tipo_figura,
      rfc_figura: figuraFrecuente.rfc_figura,
      nombre_figura: figuraFrecuente.nombre_figura,
      num_licencia: figuraFrecuente.num_licencia,
      domicilio: figuraFrecuente.domicilio,
      residencia_fiscal_figura: figuraFrecuente.datos_adicionales?.residencia_fiscal_figura,
      num_reg_id_trib_figura: figuraFrecuente.datos_adicionales?.num_reg_id_trib_figura,
    };

    const newFiguras = [...data, { ...figura, id: Date.now().toString() }];
    onChange(newFiguras);
    setShowFrecuentes(false);
  };

  // Verificar si hay al menos un operador
  const tieneOperador = data.some(figura => figura.tipo_figura === '01');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Figuras del Transporte</span>
            </CardTitle>
            
            <div className="flex space-x-2">
              {figurasFrecuentes.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFrecuentes(!showFrecuentes)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Frecuentes
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Figura
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!tieneOperador && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Requerido:</strong> Debe agregar al menos un operador (Figura 01)
              </p>
            </div>
          )}

          {showFrecuentes && (
            <FigurasFrecuentes
              figuras={figurasFrecuentes}
              onCargarFigura={handleCargarFiguraFrecuente}
              onCerrar={() => setShowFrecuentes(false)}
            />
          )}

          <FigurasList
            figuras={data}
            onEdit={startEdit}
            onDelete={handleDeleteFigura}
          />

          {showForm && (
            <FiguraForm
              figura={editingIndex !== null ? data[editingIndex] : undefined}
              onSave={editingIndex !== null ? handleEditFigura : handleAddFigura}
              onCancel={cancelEdit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
