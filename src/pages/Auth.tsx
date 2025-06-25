
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Autenticación</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página de autenticación en desarrollo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
