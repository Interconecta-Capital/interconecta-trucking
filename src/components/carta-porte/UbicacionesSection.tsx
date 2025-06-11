
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, Clock, ArrowRight } from 'lucide-react';
import { UbicacionForm } from './UbicacionForm';

interface UbicacionesSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function UbicacionesSection({ data, onChange, onNext, onPrev }: UbicacionesSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addUbicacion = (ubicacion: any) => {
    if (editingIndex !== null) {
      const newData = [...data];
      newData[editingIndex] = ubicacion;
      onChange(newData);
      setEditingIndex(null);
    } else {
      onChange([...data, ubicacion]);
    }
    setShowForm(false);
  };

  const editUbicacion = (index: number) => {
    setEditingIndex(index);
    setShowForm(true);
  };

  const deleteUbicacion = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const generateIdUbicacion = (tipo: string) => {
    const prefix = tipo === 'Origen' ? 'OR' : tipo === 'Destino' ? 'DE' : 'IN';
    const count = data.filter(u => u.tipoUbicacion === tipo).length + 1;
    return `${prefix}${count.toString().padStart(6, '0')}`;
  };

  const hasMinimumLocations = data.length >= 2 && 
    data.some(u => u.tipoUbicacion === 'Origen') && 
    data.some(u => u.tipoUbicacion === 'Destino');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Gestión de Ubicaciones</span>
            </CardTitle>
            <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Agregar Ubicación</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay ubicaciones agregadas</p>
              <p className="text-sm">Agrega al menos un origen y un destino para continuar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((ubicacion, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold
                            ${ubicacion.tipoUbicacion === 'Origen' ? 'bg-green-500' : 
                              ubicacion.tipoUbicacion === 'Destino' ? 'bg-red-500' : 'bg-blue-500'}`}
                          >
                            {ubicacion.tipoUbicacion === 'Origen' ? 'O' : 
                             ubicacion.tipoUbicacion === 'Destino' ? 'D' : 'I'}
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {ubicacion.idUbicacion}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">{ubicacion.tipoUbicacion}</h3>
                            <span className="text-sm text-muted-foreground">
                              {ubicacion.nombreRemitente}
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <p>{ubicacion.rfcRemitente}</p>
                            <p>{ubicacion.domicilio?.calle} {ubicacion.domicilio?.numExterior}</p>
                            <p>{ubicacion.domicilio?.colonia}, {ubicacion.domicilio?.municipio}</p>
                            <p>{ubicacion.domicilio?.estado} {ubicacion.domicilio?.codigoPostal}</p>
                          </div>
                          
                          {ubicacion.fechaHora && (
                            <div className="flex items-center space-x-2 mt-2 text-sm">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(ubicacion.fechaHora).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => editUbicacion(index)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteUbicacion(index)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <UbicacionForm
          ubicacion={editingIndex !== null ? data[editingIndex] : null}
          generateId={generateIdUbicacion}
          onSave={addUbicacion}
          onCancel={() => {
            setShowForm(false);
            setEditingIndex(null);
          }}
        />
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!hasMinimumLocations}
          className="flex items-center space-x-2"
        >
          <span>Continuar a Mercancías</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
