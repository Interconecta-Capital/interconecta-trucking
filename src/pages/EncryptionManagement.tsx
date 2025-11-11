import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EncryptionStatusDashboard } from '@/components/dashboard/EncryptionStatusDashboard';
import { Shield, Key, FileSearch, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { DocumentMigrationService, MigrationSummary } from '@/services/storage/DocumentMigrationService';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSuperuser } from '@/hooks/useSuperuser';

export default function EncryptionManagement() {
  const { isSuperuser } = useSuperuser();
  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const [migrationResults, setMigrationResults] = useState<Record<string, MigrationSummary>>({});

  const handleMigrateTable = async (tableName: string) => {
    setMigrating(true);
    setCurrentTable(tableName);
    setMigrationProgress(0);

    try {
      toast.info(`Iniciando migración de documentos en ${tableName}...`);

      const result = await DocumentMigrationService.migrateTableDocuments(
        tableName,
        (progress, current, total) => {
          setMigrationProgress(progress);
          toast.info(`Migrando ${tableName}: ${current}/${total} (${progress}%)`);
        }
      );

      setMigrationResults(prev => ({ ...prev, [tableName]: result }));

      if (result.failed === 0) {
        toast.success(`✅ Migración completada: ${result.successful}/${result.total} documentos cifrados`);
      } else {
        toast.warning(
          `⚠️ Migración con errores: ${result.successful} exitosos, ${result.failed} fallidos de ${result.total} total`
        );
      }
    } catch (error) {
      console.error('Error en migración:', error);
      toast.error('Error crítico durante la migración');
    } finally {
      setMigrating(false);
      setCurrentTable(null);
      setMigrationProgress(0);
    }
  };

  const handleMigrateAll = async () => {
    const tables = ['conductores', 'vehiculos', 'remolques', 'socios'];
    for (const table of tables) {
      await handleMigrateTable(table);
    }
    toast.success('🎉 Migración completa de todas las tablas finalizada');
  };

  const handleExportComplianceReport = async () => {
    try {
      const stats = await DocumentMigrationService.getMigrationStats();
      const report = {
        generated_at: new Date().toISOString(),
        compliance_standard: 'GDPR Art. 32, ISO 27001 A.10.1, LFPDPPP Art. 19',
        encryption_algorithm: 'AES-256-GCM',
        statistics: stats,
        migration_results: migrationResults
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-cifrado-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Reporte de cumplimiento exportado');
    } catch (error) {
      toast.error('Error al exportar reporte');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Administración de Cifrado E2E
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de cifrado de extremo a extremo para documentos sensibles
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Key className="h-3 w-3" />
          AES-256-GCM
        </Badge>
      </div>

      {!isSuperuser && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Algunas funciones están restringidas solo para superusuarios (rotación de claves, migración masiva).
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">Estado General</TabsTrigger>
          <TabsTrigger value="migration">Migración</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
        </TabsList>

        {/* Tab 1: Estado General */}
        <TabsContent value="status" className="space-y-4">
          <EncryptionStatusDashboard />
        </TabsContent>

        {/* Tab 2: Migración de Documentos */}
        <TabsContent value="migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migración de Documentos</CardTitle>
              <CardDescription>
                Migra documentos existentes desde URLs a almacenamiento cifrado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {migrating && (
                <Alert>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Migrando {currentTable}... {migrationProgress}%
                    <Progress value={migrationProgress} className="mt-2" />
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {['conductores', 'vehiculos', 'remolques', 'socios'].map((table) => (
                  <Card key={table}>
                    <CardHeader>
                      <CardTitle className="text-base capitalize">{table}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => handleMigrateTable(table)}
                        disabled={migrating || !isSuperuser}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Migrar Documentos
                      </Button>

                      {migrationResults[table] && (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium">{migrationResults[table].total}</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Exitosos:</span>
                            <span className="font-medium">{migrationResults[table].successful}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Fallidos:</span>
                            <span className="font-medium">{migrationResults[table].failed}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleMigrateAll}
                disabled={migrating || !isSuperuser}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Migrar Todas las Tablas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Configuración */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Cifrado</CardTitle>
              <CardDescription>
                Administración de claves y políticas de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">ENCRYPTION_KEY</div>
                    <div className="text-xs">
                      Algoritmo: AES-256-GCM<br />
                      Almacenamiento: Supabase Vault<br />
                      Última rotación: Configurada manualmente
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Rotación de Clave</div>
                    <div className="text-sm text-muted-foreground">
                      Recomendado cada 90 días
                    </div>
                  </div>
                  <Button disabled={!isSuperuser} variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Rotar Ahora
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Política de Retención</div>
                    <div className="text-sm text-muted-foreground">
                      Documentos cifrados: Retención según normativa
                    </div>
                  </div>
                  <Badge>Activa</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Auditoría y Compliance */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auditoría y Cumplimiento</CardTitle>
              <CardDescription>
                Reportes de cumplimiento normativo y accesos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Reporte de Cumplimiento</div>
                    <div className="text-sm text-muted-foreground">
                      GDPR Art. 32, ISO 27001, LFPDPPP
                    </div>
                  </div>
                  <Button onClick={handleExportComplianceReport} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Logs de Acceso</div>
                    <div className="text-sm text-muted-foreground">
                      Registro de accesos a documentos cifrados
                    </div>
                  </div>
                  <Button variant="outline">
                    <FileSearch className="h-4 w-4 mr-2" />
                    Ver Logs
                  </Button>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Cumplimiento Normativo</div>
                    <ul className="text-xs space-y-1 mt-2">
                      <li>✅ GDPR Art. 32 - Cifrado de datos personales</li>
                      <li>✅ ISO 27001 A.10.1 - Controles criptográficos</li>
                      <li>✅ LFPDPPP Art. 19 - Medidas de seguridad</li>
                      <li>✅ NIST SP 800-53 SC-28 - Protection at Rest</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
