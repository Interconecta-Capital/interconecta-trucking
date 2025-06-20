
import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { ProtectedRouteGuard } from '@/components/ProtectedRouteGuard';
import { ProtectedContent } from '@/components/ProtectedContent';
import { ProtectedActions } from '@/components/ProtectedActions';
import { PlanNotifications } from '@/components/common/PlanNotifications';
import { useNavigate } from 'react-router-dom';

export default function CartasPorteUnified() {
  const navigate = useNavigate();

  const handleNewCartaPorte = () => {
    navigate('/carta-porte/editor');
  };

  return (
    <ProtectedRouteGuard 
      requiredAction="read" 
      resource="cartas_porte"
      redirectTo="/dashboard"
    >
      <ProtectedContent requiredFeature="cartas_porte">
        <div className="container mx-auto py-6 space-y-6">
          <PlanNotifications />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <h1 className="text-3xl font-bold">Cartas Porte</h1>
            </div>
            <ProtectedActions
              action="create"
              resource="cartas_porte"
              onAction={handleNewCartaPorte}
              buttonText="Nueva Carta Porte"
            />
          </div>

          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Gestión de Cartas Porte</h3>
            <p className="text-muted-foreground">
              Funcionalidad disponible para usuarios con acceso completo
            </p>
          </div>
        </div>
      </ProtectedContent>
    </ProtectedRouteGuard>
  );
}
