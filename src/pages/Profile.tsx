
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';

export default function Profile() {
  return (
    <BaseLayout>
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página de perfil en desarrollo.</p>
        </CardContent>
      </Card>
    </BaseLayout>
  );
}
