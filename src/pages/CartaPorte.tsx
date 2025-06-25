
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ProtectedContent } from '@/components/ProtectedContent';

export default function CartaPorte() {
  return (
    <BaseLayout>
      <ProtectedContent requiredFeature="cartas_porte">
        <Card>
          <CardHeader>
            <CardTitle>Cartas Porte</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Página de cartas porte en desarrollo.</p>
          </CardContent>
        </Card>
      </ProtectedContent>
    </BaseLayout>
  );
}
