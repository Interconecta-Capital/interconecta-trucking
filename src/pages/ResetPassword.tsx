
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Restablecer Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página para restablecer contraseña en desarrollo.</p>
        </CardContent>
      </Card>
    </div>
  );
}
