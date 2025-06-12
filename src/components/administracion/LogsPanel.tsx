
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, Filter, AlertCircle, Info, CheckCircle } from 'lucide-react';

export function LogsPanel() {
  // Mock data - en producción vendría de la API
  const logs = [
    {
      id: '1',
      timestamp: '2024-06-12T10:30:00Z',
      nivel: 'info',
      modulo: 'Auth',
      mensaje: 'Usuario juan@empresa.com inició sesión',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2024-06-12T10:25:00Z',
      nivel: 'warning',
      modulo: 'CartaPorte',
      mensaje: 'Intento de crear carta porte sin datos completos',
      ip: '192.168.1.100'
    },
    {
      id: '3',
      timestamp: '2024-06-12T10:20:00Z',
      nivel: 'error',
      modulo: 'Database',
      mensaje: 'Error de conexión a la base de datos',
      ip: 'system'
    },
    {
      id: '4',
      timestamp: '2024-06-12T10:15:00Z',
      nivel: 'info',
      modulo: 'Sistema',
      mensaje: 'Sistema iniciado correctamente',
      ip: 'system'
    }
  ];

  const getNivelBadge = (nivel: string) => {
    switch (nivel) {
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      case 'info':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Info className="h-3 w-3 mr-1" />
            Info
          </Badge>
        );
      default:
        return <Badge variant="secondary">{nivel}</Badge>;
    }
  };

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Logs del Sistema
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getNivelIcon(log.nivel)}
                      <div>
                        <p className="font-medium">{log.modulo}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getNivelBadge(log.nivel)}
                  </div>
                  <p className="text-sm mb-2">{log.mensaje}</p>
                  <p className="text-xs text-muted-foreground">IP: {log.ip}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">156</div>
                <p className="text-sm text-muted-foreground">Info</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">23</div>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">7</div>
                <p className="text-sm text-muted-foreground">Errores</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
