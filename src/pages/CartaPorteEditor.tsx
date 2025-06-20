
import React from 'react';
import { useParams } from 'react-router-dom';
import { ModernCartaPorteEditor } from '@/components/carta-porte/editor/ModernCartaPorteEditor';
import { ProtectedRouteGuard } from '@/components/ProtectedRouteGuard';

export default function CartaPorteEditor() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <ProtectedRouteGuard 
      requiredAction="create" 
      resource="cartas_porte"
      redirectTo="/dashboard"
    >
      <ModernCartaPorteEditor documentId={id} />
    </ProtectedRouteGuard>
  );
}
