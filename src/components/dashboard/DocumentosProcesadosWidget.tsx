
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDocumentosProcesados } from '@/hooks/useDocumentosProcesados';
import { FileText, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function DocumentosProcesadosWidget() {
  const { 
    getDocumentosRecientes, 
    getEstadisticas, 
    isLoading 
  } = useDocumentosProcesados();

  const documentosRecientes = getDocumentosRecientes(3);
  const estadisticas = getEstadisticas();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Cargando documentos procesados...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Procesados
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {estadisticas.tasaExito.toFixed(0)}% éxito
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {documentosRecientes.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay documentos procesados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documentosRecientes.map((documento) => (
              <div
                key={documento.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {documento.file_path}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {documento.document_type?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(documento.created_at), {
                        addSuffix: true,
                        locale: es
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      {documento.confidence > 0.7 ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      )}
                      <span>{Math.round(documento.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {estadisticas.total > 3 && (
              <div className="text-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  +{estadisticas.total - 3} documentos más
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
