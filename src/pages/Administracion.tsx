
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Palette, FileText, Shield } from 'lucide-react';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { ProtectedContent } from '@/components/ProtectedContent';
import { PanelUsuarios } from '@/components/administracion/PanelUsuarios';
import { PersonalizacionPanel } from '@/components/administracion/PersonalizacionPanel';
import { ConfiguracionesPanel } from '@/components/administracion/ConfiguracionesPanel';
import { LogsPanel } from '@/components/administracion/LogsPanel';
import { FuncionesAvanzadas } from '@/components/administracion/FuncionesAvanzadas';
import { FuncionesEnterprise } from '@/components/administracion/FuncionesEnterprise';

export default function Administracion() {
  const [activeTab, setActiveTab] = useState('usuarios');
  const permissions = useUnifiedPermissionsV2();

  const canAccessAdvanced = () => {
    // Superusuarios pueden acceder a funciones avanzadas
    if (permissions.accessLevel === 'superuser') return true;
    
    // Durante trial activo, acceso total
    if (permissions.accessLevel === 'trial') return true;
    
    // Con plan activo, verificar si es plan empresarial/profesional
    if (permissions.accessLevel === 'paid') {
      return permissions.planInfo.name.includes('Empresarial') || 
             permissions.planInfo.name.includes('Profesional');
    }
    
    return false;
  };

  const canAccessEnterprise = () => {
    // Solo superusuarios y planes Enterprise
    if (permissions.accessLevel === 'superuser') return true;
    
    if (permissions.accessLevel === 'paid') {
      return permissions.planInfo.name.includes('Enterprise') || 
             permissions.planInfo.name.includes('Empresarial');
    }
    
    return false;
  };

  return (
    <ProtectedContent requiredFeature="administracion">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Administración del Sistema</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="personalizacion" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Personalización
            </TabsTrigger>
            <TabsTrigger value="configuraciones" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuraciones
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
            {canAccessAdvanced() && (
              <TabsTrigger value="avanzadas" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Avanzadas
              </TabsTrigger>
            )}
            {canAccessEnterprise() && (
              <TabsTrigger value="enterprise" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Enterprise
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="usuarios">
            <PanelUsuarios />
          </TabsContent>

          <TabsContent value="personalizacion">
            <PersonalizacionPanel />
          </TabsContent>

          <TabsContent value="configuraciones">
            <ConfiguracionesPanel />
          </TabsContent>

          <TabsContent value="logs">
            <LogsPanel />
          </TabsContent>

          {canAccessAdvanced() && (
            <TabsContent value="avanzadas">
              <ProtectedContent requiredFeature="funciones_avanzadas">
                <FuncionesAvanzadas />
              </ProtectedContent>
            </TabsContent>
          )}

          {canAccessEnterprise() && (
            <TabsContent value="enterprise">
              <ProtectedContent requiredFeature="enterprise">
                <FuncionesEnterprise />
              </ProtectedContent>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </ProtectedContent>
  );
}
