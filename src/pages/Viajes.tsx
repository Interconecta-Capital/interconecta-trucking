
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, FileText, Clock, Calendar } from 'lucide-react';
import { DocumentosVista } from '@/components/viajes/DocumentosVista';
import { ViajesActivos } from '@/components/viajes/ViajesActivos';
import { HistorialViajes } from '@/components/viajes/HistorialViajes';
import { ProgramacionViajes } from '@/components/viajes/ProgramacionViajes';

export default function Viajes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabInicial = searchParams.get('tab') || 'activos';
  const [activeTab, setActiveTab] = useState(tabInicial);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Gestión de Viajes</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activos" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Viajes Activos
          </TabsTrigger>
          <TabsTrigger value="documentos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="programacion" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Programación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos">
          <ViajesActivos />
        </TabsContent>

        <TabsContent value="documentos">
          <DocumentosVista />
        </TabsContent>

        <TabsContent value="historial">
          <HistorialViajes />
        </TabsContent>

        <TabsContent value="programacion">
          <ProgramacionViajes />
        </TabsContent>
      </Tabs>
    </div>
  );
}
