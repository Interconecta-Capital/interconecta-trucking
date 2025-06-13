import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, FileText, Clock, Calendar } from 'lucide-react';
import { DocumentosVista } from '@/components/viajes/DocumentosVista';
import { ViajesActivos } from '@/components/viajes/ViajesActivos';
import { HistorialViajes } from '@/components/viajes/HistorialViajes';
import { ProgramacionViajes } from '@/components/viajes/ProgramacionViajes';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { useStatePersistence } from '@/hooks/useStatePersistence';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedFeature } from '@/components/ProtectedFeature';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { FunctionalityType } from '@/types/permissions';

interface TabConfig {
  id: string;
  label: string;
  icon: any;
  component: React.ComponentType;
  requiresFeature?: FunctionalityType;
}

const TABS_CONFIG: TabConfig[] = [
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
    component: ProgramacionViajes,
    requiresFeature: 'funciones_avanzadas' as FunctionalityType
  },
];

export default function Viajes() {
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  
  // Usar persistencia mejorada para mantener estado
  const [persistedTab, setPersistedTab] = useStatePersistence(
    urlTab || 'activos',
    { key: 'viajes-active-tab', storage: 'sessionStorage' }
  );

  const { activeTab, handleTabChange } = useTabNavigation({
    initialTab: persistedTab,
    persistInURL: false, // NO persistir en URL para evitar recargas
    storageKey: 'viajes' // Usar sessionStorage en su lugar
  });

  console.log('[Viajes] Current active tab:', activeTab);

  // Sincronizar cambios de tab con persistencia
  useEffect(() => {
    if (activeTab !== persistedTab) {
      setPersistedTab(activeTab);
    }
  }, [activeTab, persistedTab, setPersistedTab]);

  // Prevenir re-renders innecesarios con useCallback
  const handleTabChangeOptimized = useCallback((tab: string) => {
    console.log('[Viajes] Tab change requested:', tab);
    handleTabChange(tab);
  }, [handleTabChange]);

  // Memoizar los componentes de contenido para evitar re-renders
  const tabContent = useMemo(() => {
    console.log('[Viajes] Memoizing tab content for tabs:', TABS_CONFIG.map(t => t.id));
    return TABS_CONFIG.reduce((acc, tab) => {
      const Component = tab.component;
      if (tab.requiresFeature) {
        acc[tab.id] = (
          <ProtectedFeature feature={tab.requiresFeature} key={`${tab.id}-content`}>
            <Component />
          </ProtectedFeature>
        );
      } else {
        acc[tab.id] = <Component key={`${tab.id}-content`} />;
      }
      return acc;
    }, {} as Record<string, JSX.Element>);
  }, []); // Dependencias vacías para evitar re-creación

  // Memoizar la lista de tabs para evitar re-renders
  const tabsList = useMemo(() => (
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
  ), []);

  return (
    <ProtectedContent requiredFeature="viajes">
      <div className="container mx-auto py-6 space-y-6">
        {/* Notificaciones de plan */}
        <PlanNotifications />

        <div className="flex items-center gap-3">
          <Truck className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Gestión de Viajes</h1>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChangeOptimized} className="w-full">
          {tabsList}

          {TABS_CONFIG.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              {tabContent[tab.id]}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </ProtectedContent>
  );
}
