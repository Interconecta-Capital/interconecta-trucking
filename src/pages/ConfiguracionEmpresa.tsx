
import React from 'react';
import { ProtectedContent } from '@/components/ProtectedContent';
import { MiEmpresaPanel } from '@/components/administracion/configuracion/MiEmpresaPanel';

export default function ConfiguracionEmpresa() {
  return (
    <ProtectedContent requiredFeature="administracion">
      <div className="container mx-auto py-6">
        <MiEmpresaPanel />
      </div>
    </ProtectedContent>
  );
}
