import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Route, Receipt } from 'lucide-react';
import { ViajesConDocumentosTab } from '@/components/documentos-fiscales/ViajesConDocumentosTab';
import { FacturasTab } from '@/components/documentos-fiscales/FacturasTab';
import { CartasPorteTab } from '@/components/documentos-fiscales/CartasPorteTab';

export default function DocumentosFiscales() {
  const [activeTab, setActiveTab] = useState('viajes');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documentos Fiscales</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona viajes, facturas y cartas porte desde un solo lugar
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="viajes" className="gap-2">
            <Route className="h-4 w-4" />
            <span>Por Viajes</span>
          </TabsTrigger>
          <TabsTrigger value="facturas" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span>Facturas</span>
          </TabsTrigger>
          <TabsTrigger value="carta-porte" className="gap-2">
            <FileText className="h-4 w-4" />
            <span>Carta Porte</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="viajes" className="space-y-4 mt-6">
          <ViajesConDocumentosTab />
        </TabsContent>

        <TabsContent value="facturas" className="space-y-4 mt-6">
          <FacturasTab />
        </TabsContent>

        <TabsContent value="carta-porte" className="space-y-4 mt-6">
          <CartasPorteTab />
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Timbradas</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cartas Porte</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Completados</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
