
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';

export default function Admin() {
  return (
    <BaseLayout>
      <Card>
        <CardHeader>
          <CardTitle>Panel de Administración</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Panel de administración en desarrollo.</p>
        </CardContent>
      </Card>
    </BaseLayout>
  );
}
