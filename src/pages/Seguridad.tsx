
import { ProtectedContent } from '@/components/ProtectedContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Seguridad() {
  return (
    <ProtectedContent requiredFeature="security">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Seguridad</h1>
          <p className="text-muted-foreground">
            Gestiona la seguridad de tu cuenta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuraciones de Seguridad</CardTitle>
            <CardDescription>
              Esta funcionalidad estará disponible próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Las configuraciones de seguridad se encuentran en desarrollo.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedContent>
  );
}
