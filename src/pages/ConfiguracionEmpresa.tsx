
import React from 'react';
import { ProtectedContent } from '@/components/ProtectedContent';
import { MiEmpresaPanel } from '@/components/administracion/configuracion/MiEmpresaPanel';
import { ModoPruebasBanner } from '@/components/administracion/configuracion/ModoPruebasBanner';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';

export default function ConfiguracionEmpresa() {
  const { configuracion } = useConfiguracionEmpresarial();

  return (
    <ProtectedContent requiredFeature="administracion">
      <div className="container mx-auto py-6">
        <ModoPruebasBanner 
          show={true} 
          modoPruebas={configuracion?.modo_pruebas || false} 
        />
        <MiEmpresaPanel />
      </div>
    </ProtectedContent>
  );
}
