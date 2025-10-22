import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Shield, Settings, LayoutDashboard } from 'lucide-react';
import { DatosFiscalesForm } from './DatosFiscalesForm';
import { CertificadosDigitalesSection } from './CertificadosDigitalesSection';
import { ConfiguracionOperativaForm } from './ConfiguracionOperativaForm';
import { DashboardConfiguracion } from './DashboardConfiguracion';
import { WizardConfiguracionInicial } from './WizardConfiguracionInicial';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';

export function MiEmpresaPanel() {
  const { configuracion, isLoading } = useConfiguracionEmpresarial();
  const [showWizard, setShowWizard] = useState(false);

  // Detectar si es usuario nuevo y mostrar wizard
  useEffect(() => {
    if (!isLoading && configuracion) {
      const wizardShown = localStorage.getItem('wizard_configuracion_shown');
      
      // Mostrar wizard si:
      // 1. No se ha mostrado antes
      // 2. La configuración no está completa
      // 3. No hay RFC configurado (indica usuario nuevo)
      if (!wizardShown && !configuracion.configuracion_completa && !configuracion.rfc_emisor) {
        setShowWizard(true);
      }
    }
  }, [configuracion, isLoading]);

  const handleWizardComplete = () => {
    setShowWizard(false);
    localStorage.setItem('wizard_configuracion_shown', 'true');
  };

  if (isLoading) {
    return <div className="p-6">Cargando configuración...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Configuración de Mi Empresa</h2>
          <p className="text-muted-foreground">
            Gestione la información fiscal y operativa de su empresa
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="datos-fiscales" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Datos Fiscales
            </TabsTrigger>
            <TabsTrigger value="certificados" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Certificados
            </TabsTrigger>
            <TabsTrigger value="configuracion" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Config. Operativa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <DashboardConfiguracion />
          </TabsContent>

          <TabsContent value="datos-fiscales" className="space-y-4">
            <DatosFiscalesForm />
          </TabsContent>

          <TabsContent value="certificados" className="space-y-4">
            <CertificadosDigitalesSection />
          </TabsContent>

          <TabsContent value="configuracion" className="space-y-4">
            <ConfiguracionOperativaForm />
          </TabsContent>
        </Tabs>
      </div>

      {/* Wizard de configuración inicial */}
      <WizardConfiguracionInicial
        open={showWizard}
        onComplete={handleWizardComplete}
      />
    </>
  );
}
