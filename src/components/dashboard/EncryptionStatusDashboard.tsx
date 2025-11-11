import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Shield, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EncryptionStats {
  conductores: { total: number; encrypted: number; documents: Array<{ column: string; encrypted: number; total: number }> };
  vehiculos: { total: number; encrypted: number; documents: Array<{ column: string; encrypted: number; total: number }> };
  remolques: { total: number; encrypted: number; documents: Array<{ column: string; encrypted: number; total: number }> };
  socios: { total: number; encrypted: number; documents: Array<{ column: string; encrypted: number; total: number }> };
}

interface RecentAccess {
  user_id: string;
  table_name: string;
  column_name: string;
  created_at: string;
  ip_address: string | null;
}

interface EventData {
  table_name?: string;
  column_name?: string;
  [key: string]: any;
}

export function EncryptionStatusDashboard() {
  const [stats, setStats] = useState<EncryptionStats | null>(null);
  const [recentAccesses, setRecentAccesses] = useState<RecentAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyConfigured, setKeyConfigured] = useState(false);

  useEffect(() => {
    loadEncryptionStats();
    loadRecentAccesses();
    checkEncryptionKey();
  }, []);

  const checkEncryptionKey = async () => {
    try {
      // Verificar si ENCRYPTION_KEY existe en Vault
      const { data, error } = await supabase.rpc('get_secret', {
        secret_name: 'ENCRYPTION_KEY'
      });
      
      setKeyConfigured(!error && data !== null);
    } catch (error) {
      console.error('Error verificando ENCRYPTION_KEY:', error);
      setKeyConfigured(false);
    }
  };

  const loadEncryptionStats = async () => {
    try {
      // Cast to any to avoid type inference issues
      const supabaseAny = supabase as any;

      // Obtener estadísticas de conductores
      const conductoresRes = await supabaseAny
        .from('conductores')
        .select('id, foto_licencia_encrypted, foto_identificacion_encrypted')
        .eq('activo', true);

      // Obtener estadísticas de vehículos
      const vehiculosRes = await supabaseAny
        .from('vehiculos')
        .select('id, tarjeta_circulacion_encrypted, poliza_seguro_encrypted')
        .eq('activo', true);

      // Obtener estadísticas de remolques
      const remolquesRes = await supabaseAny
        .from('remolques')
        .select('id, tarjeta_circulacion_encrypted')
        .eq('activo', true);

      // Obtener estadísticas de socios
      const sociosRes = await supabaseAny
        .from('socios')
        .select('id, constancia_fiscal_encrypted, identificacion_encrypted')
        .eq('activo', true);

      const cData = conductoresRes.data as any[] || [];
      const vData = vehiculosRes.data as any[] || [];
      const rData = remolquesRes.data as any[] || [];
      const sData = sociosRes.data as any[] || [];

      const conductoresStats = calculateStats(cData, ['foto_licencia_encrypted', 'foto_identificacion_encrypted']);
      const vehiculosStats = calculateStats(vData, ['tarjeta_circulacion_encrypted', 'poliza_seguro_encrypted']);
      const remolquesStats = calculateStats(rData, ['tarjeta_circulacion_encrypted']);
      const sociosStats = calculateStats(sData, ['constancia_fiscal_encrypted', 'identificacion_encrypted']);

      setStats({
        conductores: conductoresStats,
        vehiculos: vehiculosStats,
        remolques: remolquesStats,
        socios: sociosStats
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[], columns: string[]): {
    total: number;
    encrypted: number;
    documents: Array<{ column: string; encrypted: number; total: number }>;
  } => {
    const total = data.length * columns.length;
    let encrypted = 0;
    const documents: Array<{ column: string; encrypted: number; total: number }> = columns.map(col => ({
      column: col,
      encrypted: 0,
      total: data.length
    }));

    data.forEach((record: any) => {
      columns.forEach((col: string, idx: number) => {
        if (record[col] !== null && record[col] !== undefined) {
          encrypted++;
          documents[idx].encrypted++;
        }
      });
    });

    return { total, encrypted, documents };
  };

  const loadRecentAccesses = async () => {
    try {
      const { data } = await supabase
        .from('security_audit_log')
        .select('user_id, event_data, created_at, ip_address')
        .in('event_type', ['document_decrypted', 'document_view_requested'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        const accesses: RecentAccess[] = data.map(log => {
          const eventData = log.event_data as EventData | null;
          return {
            user_id: log.user_id || 'Sistema',
            table_name: eventData?.table_name || 'N/A',
            column_name: eventData?.column_name || 'N/A',
            created_at: log.created_at,
            ip_address: log.ip_address as string | null
          };
        });
        setRecentAccesses(accesses);
      }
    } catch (error) {
      console.error('Error cargando accesos recientes:', error);
    }
  };

  const calculateTotalProgress = () => {
    if (!stats) return 0;
    const totalDocs = stats.conductores.total + stats.vehiculos.total + stats.remolques.total + stats.socios.total;
    const encryptedDocs = stats.conductores.encrypted + stats.vehiculos.encrypted + stats.remolques.encrypted + stats.socios.encrypted;
    return totalDocs > 0 ? Math.round((encryptedDocs / totalDocs) * 100) : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalProgress = calculateTotalProgress();

  return (
    <div className="space-y-6">
      {/* Estado de ENCRYPTION_KEY */}
      <Alert variant={keyConfigured ? "default" : "destructive"}>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          {keyConfigured ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              ENCRYPTION_KEY configurada correctamente en Supabase Vault
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              ENCRYPTION_KEY no configurada. Configure la clave en Supabase Vault para habilitar el cifrado.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Resumen General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Estado General de Cifrado
          </CardTitle>
          <CardDescription>
            Progreso de cifrado de documentos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{totalProgress}%</div>
                <div className="text-sm text-muted-foreground">Documentos cifrados</div>
              </div>
              <Badge variant={totalProgress >= 80 ? "default" : totalProgress >= 50 ? "secondary" : "destructive"} className="gap-1">
                <Shield className="h-3 w-3" />
                {totalProgress >= 80 ? 'Excelente' : totalProgress >= 50 ? 'En progreso' : 'Requiere atención'}
              </Badge>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Desglose por Entidad */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats && ['conductores', 'vehiculos', 'remolques', 'socios'].map((entity) => {
          const entityStats = stats[entity as keyof EncryptionStats];
          const progress = entityStats.total > 0 ? Math.round((entityStats.encrypted / entityStats.total) * 100) : 0;
          
          return (
            <Card key={entity}>
              <CardHeader>
                <CardTitle className="text-base capitalize">{entity}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso</span>
                    <span className="font-medium">{entityStats.encrypted}/{entityStats.total}</span>
                  </div>
                  <Progress value={progress} className={`h-2 ${getProgressColor(progress)}`} />
                  
                  <div className="space-y-2 pt-2">
                    {entityStats.documents.map((doc) => {
                      const docProgress = doc.total > 0 ? Math.round((doc.encrypted / doc.total) * 100) : 0;
                      return (
                        <div key={doc.column} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground truncate">{doc.column.replace('_encrypted', '')}</span>
                          <Badge variant="outline" className="ml-2">
                            {doc.encrypted}/{doc.total}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accesos Recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Accesos Recientes a Documentos Cifrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAccesses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay registros de acceso recientes
            </p>
          ) : (
            <div className="space-y-2">
              {recentAccesses.map((access, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{access.table_name} - {access.column_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(access.created_at).toLocaleString('es-MX')}
                    </div>
                  </div>
                  {access.ip_address && (
                    <Badge variant="outline" className="ml-2">
                      {access.ip_address}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
