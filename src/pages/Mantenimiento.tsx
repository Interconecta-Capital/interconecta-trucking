
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ProtectedContent } from '@/components/ProtectedContent';

export default function Mantenimiento() {
  return (
    <BaseLayout>
      <ProtectedContent requiredFeature="mantenimiento">
        <Card>
          <CardHeader>
            <CardTitle>Mantenimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Página de mantenimiento en desarrollo.</p>
          </CardContent>
        </Card>
      </ProtectedContent>
    </BaseLayout>
  );
}
