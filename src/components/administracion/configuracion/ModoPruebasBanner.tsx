import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ModoPruebasBannerProps {
  show: boolean;
  modoPruebas: boolean;
}

/**
 * Banner persistente que se muestra en toda la app cuando está activo el modo pruebas
 * Ayuda a los usuarios a recordar que están en sandbox y facilita el cambio a producción
 */
export function ModoPruebasBanner({ show, modoPruebas }: ModoPruebasBannerProps) {
  const navigate = useNavigate();

  if (!show || !modoPruebas) return null;

  return (
    <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950 mb-6">
      <FlaskConical className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
        🧪 Modo Pruebas Activo
      </AlertTitle>
      <AlertDescription className="text-amber-900 dark:text-amber-100 flex items-center justify-between">
        <span className="text-sm">
          Los timbres generados no son válidos fiscalmente. 
          Estás usando el ambiente de pruebas (sandbox).
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/configuracion-empresa')}
          className="ml-4 border-amber-600 text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900"
        >
          Cambiar a Producción
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
