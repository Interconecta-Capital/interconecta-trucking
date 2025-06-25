
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ProtectedContent } from '@/components/ProtectedContent';

export default function CreateCartaPorte() {
  return (
    <BaseLayout>
      <ProtectedContent requiredFeature="cartas_porte">
        <Card>
          <CardHeader>
            <CardTitle>Crear Carta Porte</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Página para crear carta porte en desarrollo.</p>
          </CardContent>
        </Card>
      </ProtectedContent>
    </BaseLayout>
  );
}
