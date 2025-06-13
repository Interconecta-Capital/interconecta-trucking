
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, FileText, Clock, Calendar } from 'lucide-react';
import { DocumentosVista } from '@/components/viajes/DocumentosVista';
import { ViajesActivos } from '@/components/viajes/ViajesActivos';
import { HistorialViajes } from '@/components/viajes/HistorialViajes';
import { ProgramacionViajes } from '@/components/viajes/ProgramacionViajes';
import { useTabNavigation } from '@/hooks/useTabNavigation';

const TABS_CONFIG = [
  { 
    id: 'activos', 
    label: 'Viajes Activos', 
    icon: Truck, 
    component: ViajesActivos 
  },
  { 
    id: 'documentos', 
    label: 'Documentos', 
    icon: FileText, 
    component: DocumentosVista 
  },
  { 
    id: 'historial', 
    label: 'Historial', 
    icon: Clock, 
    component: HistorialViajes 
  },
  { 
    id: 'programacion', 
    label: 'Programación', 
    icon: Calendar, 
    component: ProgramacionViajes 
  },
];

export default function Viajes() {
  const [searchParams] = useSearchParams();
  const tabInicial = searchParams.get('tab') || 'activos';
  
  const { activeTab, setTabSilently, handleTabChange } = useTabNavigation({
    initialTab: tabInicial,
    persistInURL: false // Deshabilitamos la persistencia automática en URL
  });

  // Solo actualizar el tab si cambia el parámetro de URL externamente
  useEffect(() => {
    const urlTab = searchParams.get('tab') || 'activos';
    if (urlTab !== activeTab) {
      setTabSilently(urlTab);
    }
  }, [searchParams, activeTab, setTabSilently]);

  // Memoizar los componentes de contenido para evitar re-renders innecesarios
  const tabContent = useMemo(() => {
    return TABS_CONFIG.reduce((acc, tab) => {
      const Component = tab.component;
      acc[tab.id] = <Component key={tab.id} />;
      return acc;
    }, {} as Record<string, JSX.Element>);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold">Gestión de Viajes</h1>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {TABS_CONFIG.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS_CONFIG.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tabContent[tab.id]}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
