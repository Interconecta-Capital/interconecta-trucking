import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { ValidacionPreTimbradoService } from '@/services/validacion/ValidacionPreTimbradoService';

interface ValidacionPreTimbradoProps {
  userId: string;
}

export function ValidacionPreTimbrado({ userId }: ValidacionPreTimbradoProps) {
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState<{
    puede_timbrar: boolean;
    errores: string[];
    advertencias: string[];
  } | null>(null);
  
  const validarTodo = async () => {
    setValidando(true);
    try {
      const res = await ValidacionPreTimbradoService.validarConfiguracionCompleta(userId);
      setResultado(res);
    } catch (error) {
      console.error('Error en validación:', error);
      setResultado({
        puede_timbrar: false,
        errores: ['Error al validar configuración. Intenta de nuevo.'],
        advertencias: []
      });
    } finally {
      setValidando(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Configuración para Timbrado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={validarTodo} 
            disabled={validando}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${validando ? 'animate-spin' : ''}`} />
            {validando ? 'Validando...' : 'Verificar Configuración'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Verifica que tu configuración esté lista para timbrar
          </p>
        </div>
        
        {resultado && (
          <div className="space-y-3">
            {resultado.puede_timbrar ? (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">
                  ✅ Listo para Timbrar
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Tu configuración está correcta y validada contra el SAT. Puedes proceder a timbrar facturas.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>❌ No puedes timbrar todavía</AlertTitle>
                <AlertDescription>
                  <p className="mb-2 font-semibold">Corrige los siguientes errores:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {resultado.errores.map((error, i) => (
                      <li key={i} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {resultado.advertencias.length > 0 && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                  Advertencias
                </AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  <ul className="list-disc pl-5 space-y-1">
                    {resultado.advertencias.map((adv, i) => (
                      <li key={i} className="text-sm">{adv}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        {!resultado && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Validación Pendiente</AlertTitle>
            <AlertDescription>
              Haz clic en "Verificar Configuración" para validar tu setup antes de timbrar.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
