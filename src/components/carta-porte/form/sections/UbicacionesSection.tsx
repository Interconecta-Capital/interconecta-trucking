
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import { UbicacionCompleta } from '@/types/cartaPorte';

interface UbicacionesSectionProps {
  ubicaciones: UbicacionCompleta[];
  onChange: (ubicaciones: UbicacionCompleta[]) => void;
}

export function UbicacionesSection({ ubicaciones, onChange }: UbicacionesSectionProps) {
  const addUbicacion = () => {
    const newUbicacion: UbicacionCompleta = {
      id: Date.now().toString(),
      tipo_ubicacion: ubicaciones.length === 0 ? 'Origen' : 'Destino',
      rfc_remitente_destinatario: '',
      nombre_remitente_destinatario: '',
      domicilio: {
        calle: '',
        numero_exterior: '',
        colonia: '',
        municipio: '',
        estado: '',
        pais: 'Mexico',
        codigo_postal: ''
      }
    };
    onChange([...ubicaciones, newUbicacion]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicaciones de Origen y Destino
            </CardTitle>
            <Button onClick={addUbicacion} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ubicación
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ubicaciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <p>No hay ubicaciones configuradas</p>
              <p className="text-sm">Agrega al menos una ubicación de origen y una de destino</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ubicaciones.map((ubicacion, index) => (
                <div key={ubicacion.id} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">
                    Ubicación {index + 1} - {ubicacion.tipo_ubicacion}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    RFC: {ubicacion.rfc_remitente_destinatario || 'No especificado'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Nombre: {ubicacion.nombre_remitente_destinatario || 'No especificado'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
