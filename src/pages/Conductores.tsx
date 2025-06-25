
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ProtectedContent } from '@/components/ProtectedContent';

export default function Conductores() {
  return (
    <BaseLayout>
      <ProtectedContent requiredFeature="conductores">
        <Card>
          <CardHeader>
            <CardTitle>Conductores</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Página de conductores en desarrollo.</p>
          </CardContent>
        </Card>
      </ProtectedContent>
    </BaseLayout>
  );
}
