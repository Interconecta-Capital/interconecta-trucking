
import React from 'react';
import { SuperuserAdmin } from '@/components/SuperuserAdmin';
import { useSuperuser } from '@/hooks/useSuperuser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock } from 'lucide-react';

export default function SuperuserManagement() {
  const { isSuperuser, loading } = useSuperuser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isSuperuser) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Lock className="h-5 w-5 mr-2" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Solo los superusuarios pueden acceder a esta página.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-yellow-600" />
          Gestión de Superusuarios
        </h1>
        <p className="text-muted-foreground">
          Administra usuarios con privilegios de superusuario
        </p>
      </div>
      
      <SuperuserAdmin />
    </div>
  );
}
