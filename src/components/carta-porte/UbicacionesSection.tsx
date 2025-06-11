
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { UbicacionForm } from './ubicaciones/UbicacionForm';
import { UbicacionesList } from './ubicaciones/UbicacionesList';
import { Plus, MapPin, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

interface UbicacionesSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function UbicacionesSection({ data, onChange, onNext, onPrev }: UbicacionesSectionProps) {
  const {
    ubicaciones,
    setUbicaciones,
    ubicacionesFrecuentes,
    loadingFrecuentes,
    agregarUbicacion,
    actualizarUbicacion,
    eliminarUbicacion,
    reordenarUbicaciones,
    calcularDistanciaTotal,
    validarSecuenciaUbicaciones,
    generarIdUbicacion,
    guardarUbicacionFrecuente,
    isGuardando
  } = useUbicaciones();

  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Sincronizar con data prop
  React.useEffect(() => {
    if (data.length !== ubicaciones.length) {
      setUbicaciones(data);
    }
  }, [data, ubicaciones.length, setUbicaciones]);

  // Sincronizar cambios hacia arriba
  React.useEffect(() => {
    onChange(ubicaciones);
  }, [ubicaciones, onChange]);

  const handleSaveUbicacion = (ubicacion: any) => {
    if (editingIndex !== null) {
      actualizarUbicacion(editingIndex, ubicacion);
      setEditingIndex(null);
    } else {
      agregarUbicacion(ubicacion);
    }
    setShowForm(false);
  };

  const handleEditUbicacion = (index: number) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDeleteUbicacion = (index: number) => {
    eliminarUbicacion(index);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
  };

  const validation = validarSecuenciaUbicaciones();
  const distanciaTotal = calcularDistanciaTotal();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Gestión de Ubicaciones</span>
            </CardTitle>
            
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)} 
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Ubicación</span>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {showForm ? (
            <UbicacionForm
              ubicacion={editingIndex !== null ? ubicaciones[editingIndex] : undefined}
              onSave={handleSaveUbicacion}
              onCancel={handleCancelForm}
              onSaveToFavorites={guardarUbicacionFrecuente}
              generarId={generarIdUbicacion}
              ubicacionesFrecuentes={ubicacionesFrecuentes}
            />
          ) : (
            <UbicacionesList
              ubicaciones={ubicaciones}
              onEdit={handleEditUbicacion}
              onDelete={handleDeleteUbicacion}
              onReorder={reordenarUbicaciones}
              distanciaTotal={distanciaTotal}
            />
          )}
        </CardContent>
      </Card>

      {/* Validaciones */}
      {!showForm && !validation.esValido && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Se requieren correcciones:</p>
              <ul className="list-disc list-inside">
                {validation.errores.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Botones de navegación */}
      {!showForm && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onPrev} 
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
          
          <Button 
            onClick={onNext} 
            disabled={!validation.esValido}
            className="flex items-center space-x-2"
          >
            <span>Continuar a Mercancías</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
