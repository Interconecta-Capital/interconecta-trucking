
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDocumentosProcesados } from '@/hooks/useDocumentosProcesados';
import { FileText, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface DocumentosProcesadosHistoryProps {
  cartaPorteId?: string;
  showAll?: boolean;
  maxItems?: number;
}

export function DocumentosProcesadosHistory({ 
  cartaPorteId, 
  showAll = false,
  maxItems = 5 
}: DocumentosProcesadosHistoryProps) {
  const { 
    documentos, 
    isLoading, 
    eliminarDocumento, 
    isDeleting,
    getDocumentosByCartaPorte,
    getDocumentosRecientes,
    getEstadisticas 
  } = useDocumentosProcesados();

  const documentosAMostrar = cartaPorteId 
    ? getDocumentosByCartaPorte(cartaPorteId)
    : showAll 
      ? documentos 
      : getDocumentosRecientes(maxItems);

  const estadisticas = getEstadisticas();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <Clock className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Cargando historial de documentos...
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
            Historial de Documentos Procesados
          </CardTitle>
          {showAll && (
            <div className="flex gap-2 text-sm">
              <Badge variant="outline">
                Total: {estadisticas.total}
              </Badge>
              <Badge variant="outline" className="text-green-600">
                Exitosos: {estadisticas.exitosos}
              </Badge>
              <Badge variant="outline" className="text-red-600">
                Con errores: {estadisticas.conErrores}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {documentosAMostrar.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay documentos procesados aún</p>
            <p className="text-sm">Los documentos que proceses aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documentosAMostrar.map((documento) => (
              <div
                key={documento.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{documento.file_path}</span>
                    <Badge variant="outline" className="text-xs">
                      {documento.document_type?.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(documento.created_at), {
                        addSuffix: true,
                        locale: es
                      })}
                    </span>
                    
                    <div className="flex items-center gap-1">
                      {getConfidenceIcon(documento.confidence)}
                      <span>Confianza: {Math.round(documento.confidence * 100)}%</span>
                    </div>
                    
                    {documento.mercancias_count > 0 && (
                      <span>{documento.mercancias_count} mercancías</span>
                    )}
                  </div>

                  {documento.errors && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {documento.errors}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getConfidenceColor(documento.confidence)}>
                    {Math.round(documento.confidence * 100)}%
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarDocumento(documento.id)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
