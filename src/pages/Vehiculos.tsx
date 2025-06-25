
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ProtectedContent } from '@/components/ProtectedContent';

export default function Vehiculos() {
  return (
    <BaseLayout>
      <ProtectedContent requiredFeature="vehiculos">
        <Card>
          <CardHeader>
            <CardTitle>Vehículos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Página de vehículos en desarrollo.</p>
          </CardContent>
        </Card>
      </ProtectedContent>
    </BaseLayout>
  );
}
