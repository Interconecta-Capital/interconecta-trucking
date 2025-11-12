import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Receipt, CreditCard, BarChart3 } from 'lucide-react';
import { TimbresPanel } from '@/components/facturacion/TimbresPanel';
import Facturas from '@/pages/Facturas';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdministracionFiscal() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Administración Fiscal</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tus facturas, cartas porte y timbres fiscales en un solo lugar
        </p>
      </div>

      <Tabs defaultValue="facturas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="facturas" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Facturas
          </TabsTrigger>
          <TabsTrigger value="cartas-porte" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cartas Porte
          </TabsTrigger>
          <TabsTrigger value="timbres" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Timbres Fiscales
          </TabsTrigger>
          <TabsTrigger value="reportes" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reportes SAT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facturas" className="space-y-4">
          <Facturas />
        </TabsContent>

        <TabsContent value="cartas-porte" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cartas Porte</CardTitle>
              <CardDescription>
                Gestiona tus complementos de Carta Porte 3.1
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Accede a la gestión completa de Cartas Porte
              </p>
              <Button onClick={() => navigate('/cartas-porte')}>
                Ir a Cartas Porte
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timbres" className="space-y-4">
          <TimbresPanel />
        </TabsContent>

        <TabsContent value="reportes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes SAT</CardTitle>
              <CardDescription>
                Genera reportes y consulta tu historial fiscal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Contenido de Reportes (en desarrollo)
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
