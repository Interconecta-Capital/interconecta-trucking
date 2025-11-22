
import React from 'react';
import { ProtectedContent } from '@/components/ProtectedContent';
import { MiEmpresaPanel } from '@/components/administracion/configuracion/MiEmpresaPanel';
import { PermisosSCTEmpresaForm } from '@/components/administracion/configuracion/PermisosSCTEmpresaForm';

export default function ConfiguracionEmpresa() {
  return (
    <ProtectedContent requiredFeature="administracion">
      <div className="container mx-auto py-6 space-y-6">
        <MiEmpresaPanel />
        <PermisosSCTEmpresaForm />
      </div>
    </ProtectedContent>
  );
}
