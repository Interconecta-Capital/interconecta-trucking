
import { useParams } from 'react-router-dom';
import { ProtectedContent } from '@/components/ProtectedContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ViajeDetail() {
  const { id } = useParams();

  return (
    <ProtectedContent requiredFeature="trips">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Detalle del Viaje</h1>
          <p className="text-muted-foreground">
            Viaje ID: {id}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Viaje</CardTitle>
            <CardDescription>
              Esta funcionalidad estará disponible próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              El detalle de viajes se encuentra en desarrollo.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedContent>
  );
}
