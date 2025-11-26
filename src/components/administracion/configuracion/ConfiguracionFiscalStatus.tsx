import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle, Building2, FileCheck, Shield, MapPin } from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface RequiredField {
  key: string;
  label: string;
  category: 'empresa' | 'domicilio' | 'certificado';
  icon: React.ReactNode;
  check: (config: any, certificado: any) => boolean;
}

const requiredFields: RequiredField[] = [
  {
    key: 'rfc_emisor',
    label: 'RFC Emisor',
    category: 'empresa',
    icon: <Building2 className="h-4 w-4" />,
    check: (config) => !!config?.rfc_emisor && config.rfc_emisor.length >= 12
  },
  {
    key: 'razon_social',
    label: 'Razón Social',
    category: 'empresa',
    icon: <Building2 className="h-4 w-4" />,
    check: (config) => !!config?.razon_social && config.razon_social.length >= 3
  },
  {
    key: 'regimen_fiscal',
    label: 'Régimen Fiscal',
    category: 'empresa',
    icon: <FileCheck className="h-4 w-4" />,
    check: (config) => !!config?.regimen_fiscal && config.regimen_fiscal.length >= 3
  },
  {
    key: 'codigo_postal',
    label: 'Código Postal',
    category: 'domicilio',
    icon: <MapPin className="h-4 w-4" />,
    check: (config) => !!config?.codigo_postal && config.codigo_postal.length === 5
  },
  {
    key: 'calle',
    label: 'Calle',
    category: 'domicilio',
    icon: <MapPin className="h-4 w-4" />,
    check: (config) => !!config?.calle && config.calle.length >= 1
  },
  {
    key: 'estado',
    label: 'Estado',
    category: 'domicilio',
    icon: <MapPin className="h-4 w-4" />,
    check: (config) => !!config?.estado && config.estado.length >= 2
  },
  {
    key: 'municipio',
    label: 'Municipio',
    category: 'domicilio',
    icon: <MapPin className="h-4 w-4" />,
    check: (config) => !!config?.municipio && config.municipio.length >= 2
  },
  {
    key: 'certificado_activo',
    label: 'Certificado Digital (CSD)',
    category: 'certificado',
    icon: <Shield className="h-4 w-4" />,
    check: (_, certificado) => !!certificado?.activo
  }
];

export function ConfiguracionFiscalStatus() {
  const { configuracion } = useConfiguracionEmpresarial();
  const { user } = useAuth();

  // Verificar si hay certificado activo
  const { data: certificadoActivo } = useQuery({
    queryKey: ['certificado-activo', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('certificados_digitales')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .gte('fecha_fin_vigencia', new Date().toISOString())
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching certificado:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id
  });

  // Calcular campos completados
  const completedFields = requiredFields.filter(field => 
    field.check(configuracion, certificadoActivo)
  );
  
  const totalFields = requiredFields.length;
  const completedCount = completedFields.length;
  const progressPercentage = Math.round((completedCount / totalFields) * 100);
  const isComplete = completedCount === totalFields;

  // Agrupar por categoría
  const categories = {
    empresa: requiredFields.filter(f => f.category === 'empresa'),
    domicilio: requiredFields.filter(f => f.category === 'domicilio'),
    certificado: requiredFields.filter(f => f.category === 'certificado')
  };

  return (
    <Card className={`transition-all ${isComplete ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-600" />
            )}
            Estado de Configuración Fiscal
          </CardTitle>
          <Badge 
            variant={isComplete ? 'default' : 'secondary'}
            className={isComplete ? 'bg-green-600' : 'bg-amber-600'}
          >
            {isComplete ? '✓ Completo' : `${completedCount}/${totalFields} campos`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso de configuración</span>
            <span className={`font-medium ${isComplete ? 'text-green-600' : 'text-amber-600'}`}>
              {progressPercentage}%
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${isComplete ? '[&>div]:bg-green-600' : '[&>div]:bg-amber-600'}`}
          />
        </div>

        {/* Checklist por categoría */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Datos de Empresa */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              Datos Empresa
            </h4>
            <div className="space-y-1">
              {categories.empresa.map(field => {
                const isChecked = field.check(configuracion, certificadoActivo);
                return (
                  <div key={field.key} className="flex items-center gap-2 text-sm">
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={isChecked ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>
                      {field.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Domicilio */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Domicilio Fiscal
            </h4>
            <div className="space-y-1">
              {categories.domicilio.map(field => {
                const isChecked = field.check(configuracion, certificadoActivo);
                return (
                  <div key={field.key} className="flex items-center gap-2 text-sm">
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={isChecked ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>
                      {field.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificado */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Certificado Digital
            </h4>
            <div className="space-y-1">
              {categories.certificado.map(field => {
                const isChecked = field.check(configuracion, certificadoActivo);
                return (
                  <div key={field.key} className="flex items-center gap-2 text-sm">
                    {isChecked ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={isChecked ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'}>
                      {field.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        {isComplete ? (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-4">
            <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <strong>¡Configuración fiscal completa!</strong> Tu empresa está lista para timbrar documentos fiscales.
            </p>
          </div>
        ) : (
          <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-4">
            <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>
                <strong>Configuración incompleta.</strong> Completa todos los campos requeridos para poder timbrar.
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
