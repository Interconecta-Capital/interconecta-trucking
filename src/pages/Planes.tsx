
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';

export default function Planes() {
  return (
    <BaseLayout>
      <Card>
        <CardHeader>
          <CardTitle>Planes y Suscripciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página de planes en desarrollo.</p>
        </CardContent>
      </Card>
    </BaseLayout>
  );
}
