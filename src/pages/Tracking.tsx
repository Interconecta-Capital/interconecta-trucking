
import { ProtectedContent } from '@/components/ProtectedContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Tracking() {
  return (
    <ProtectedContent requiredFeature="tracking">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Seguimiento</h1>
          <p className="text-muted-foreground">
            Rastrea tus viajes y cargas en tiempo real
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Seguimiento en Tiempo Real</CardTitle>
            <CardDescription>
              Esta funcionalidad estará disponible próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              El módulo de tracking se encuentra en desarrollo.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedContent>
  );
}
