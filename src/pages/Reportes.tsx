
import { ProtectedContent } from '@/components/ProtectedContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Reportes() {
  return (
    <ProtectedContent requiredFeature="reports">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">
            Genera reportes y análisis de datos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Centro de Reportes</CardTitle>
            <CardDescription>
              Esta funcionalidad estará disponible próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              El módulo de reportes se encuentra en desarrollo.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedContent>
  );
}
