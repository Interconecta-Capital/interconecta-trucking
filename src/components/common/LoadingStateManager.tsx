
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateManagerProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  loadingText?: string;
  minHeight?: string;
}

export function LoadingStateManager({
  isLoading,
  error,
  children,
  loadingText = 'Cargando...',
  minHeight = '200px'
}: LoadingStateManagerProps) {
  if (isLoading) {
    return (
      <Card className="w-full" style={{ minHeight }}>
        <CardContent className="flex items-center justify-center h-full py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">{loadingText}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full" style={{ minHeight }}>
        <CardContent className="flex items-center justify-center h-full py-8">
          <div className="text-center space-y-2">
            <p className="text-red-600">Error al cargar los datos</p>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
