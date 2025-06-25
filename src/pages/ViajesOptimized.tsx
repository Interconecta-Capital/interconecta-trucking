
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ProtectedContent } from '@/components/ProtectedContent';

export default function ViajesOptimized() {
  return (
    <BaseLayout>
      <ProtectedContent requiredFeature="viajes">
        <Card>
          <CardHeader>
            <CardTitle>Viajes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Página de viajes en desarrollo.</p>
          </CardContent>
        </Card>
      </ProtectedContent>
    </BaseLayout>
  );
}
