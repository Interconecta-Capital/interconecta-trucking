
import { ProtectedContent } from '@/components/ProtectedContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Facturas() {
  return (
    <ProtectedContent requiredFeature="invoicing">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Facturas</h1>
          <p className="text-muted-foreground">
            Gestiona las facturas y documentos fiscales
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Facturación Electrónica</CardTitle>
            <CardDescription>
              Esta funcionalidad estará disponible próximamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              El módulo de facturación se encuentra en desarrollo.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProtectedContent>
  );
}
