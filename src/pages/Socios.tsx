
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { ProtectedContent } from '@/components/ProtectedContent';

export default function Socios() {
  return (
    <BaseLayout>
      <ProtectedContent requiredFeature="socios">
        <Card>
          <CardHeader>
            <CardTitle>Socios</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Página de socios en desarrollo.</p>
          </CardContent>
        </Card>
      </ProtectedContent>
    </BaseLayout>
  );
}
