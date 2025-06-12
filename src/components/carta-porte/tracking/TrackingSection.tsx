
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck,
  FileText
} from 'lucide-react';

interface TrackingEvent {
  id: string;
  evento: string;
  descripcion: string;
  fecha: string;
  ubicacion?: string;
  metadata?: any;
}

interface TrackingSectionProps {
  cartaPorteId: string;
  eventos: TrackingEvent[];
  uuidFiscal?: string;
}

export function TrackingSection({ cartaPorteId, eventos, uuidFiscal }: TrackingSectionProps) {
  const getEventIcon = (evento: string) => {
    switch (evento) {
      case 'creado':
        return <FileText className="h-4 w-4" />;
      case 'timbrado':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'en_transito':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'entregado':
        return <MapPin className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventBadge = (evento: string) => {
    switch (evento) {
      case 'timbrado':
        return <Badge className="bg-green-100 text-green-800">Timbrado</Badge>;
      case 'en_transito':
        return <Badge className="bg-blue-100 text-blue-800">En Tránsito</Badge>;
      case 'entregado':
        return <Badge className="bg-green-100 text-green-800">Entregado</Badge>;
      case 'creado':
        return <Badge variant="outline">Creado</Badge>;
      default:
        return <Badge variant="secondary">{evento}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Tracking de Carta Porte</span>
        </CardTitle>
        {uuidFiscal && (
          <div className="text-sm text-gray-600">
            <strong>UUID Fiscal:</strong> {uuidFiscal}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {eventos.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No hay eventos de tracking registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.map((evento, index) => (
                <div key={evento.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getEventIcon(evento.evento)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{evento.descripcion}</h4>
                      {getEventBadge(evento.evento)}
                    </div>
                    
                    <div className="mt-1 text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(evento.fecha).toLocaleString('es-MX')}</span>
                        </span>
                        
                        {evento.ubicacion && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{evento.ubicacion}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {evento.metadata && (
                      <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(evento.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
