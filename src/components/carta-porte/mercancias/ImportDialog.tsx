import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ExcelParser, ColumnMapping, defaultColumnMapping } from '@/utils/excelParser';
import { Mercancia, MercanciaConErrores } from '@/hooks/useMercancias';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle, 
  X 
} from 'lucide-react';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (mercancias: Mercancia[]) => Promise<{
    importadas: number;
    errores: number;
    mercanciasConErrores: MercanciaConErrores[];
  }>;
}

type ImportStep = 'upload' | 'preview' | 'validation' | 'results';

export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onOpenChange,
  onImport
}) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[][]>([]);
  const [mercancias, setMercancias] = useState<Mercancia[]>([]);
  const [importResult, setImportResult] = useState<{
    importadas: number;
    errores: number;
    mercanciasConErrores: MercanciaConErrores[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(defaultColumnMapping);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    const validation = ExcelParser.validateFileFormat(selectedFile);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsProcessing(true);
    try {
      const { headers, data } = await ExcelParser.parseFile(selectedFile);
      setFile(selectedFile);
      setHeaders(headers);
      setRawData(data);
      setStep('preview');
    } catch (error) {
      alert('Error al procesar el archivo: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  const processData = () => {
    const processedMercancias = ExcelParser.mapDataToMercancias(headers, rawData, columnMapping);
    setMercancias(processedMercancias);
    setStep('validation');
  };

  const handleImport = async () => {
    setIsProcessing(true);
    try {
      const result = await onImport(mercancias);
      setImportResult(result);
      setStep('results');
    } catch (error) {
      alert('Error durante la importación');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = ExcelParser.generateTemplate();
    const blob = new Blob([templateData], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_mercancias.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetDialog = () => {
    setStep('upload');
    setFile(null);
    setHeaders([]);
    setRawData([]);
    setMercancias([]);
    setImportResult(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetDialog();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Importar Mercancías desde Excel/CSV</span>
          </DialogTitle>
          <DialogDescription>
            Carga masiva de mercancías desde archivos Excel o CSV con validación automática
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Paso {step === 'upload' ? '1' : step === 'preview' ? '2' : step === 'validation' ? '3' : '4'} de 4</span>
              <span>
                {step === 'upload' && 'Seleccionar archivo'}
                {step === 'preview' && 'Vista previa'}
                {step === 'validation' && 'Validación'}
                {step === 'results' && 'Resultados'}
              </span>
            </div>
            <Progress 
              value={
                step === 'upload' ? 25 : 
                step === 'preview' ? 50 : 
                step === 'validation' ? 75 : 100
              } 
            />
          </div>

          {/* Paso 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Seleccionar archivo</h3>
                <Button variant="outline" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla
                </Button>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-2">
                  {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra y suelta un archivo Excel/CSV'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos soportados: .xlsx, .xls, .csv (máx. 10MB)
                </p>
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Procesando archivo...</p>
                </div>
              )}
            </div>
          )}

          {/* Paso 2: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Vista previa de datos</h3>
                <Badge variant="outline">
                  {rawData.length} filas detectadas
                </Badge>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header, index) => (
                        <TableHead key={index}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rawData.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <TableCell key={cellIndex} className="max-w-32 truncate">
                            {cell?.toString() || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {rawData.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  Mostrando las primeras 5 filas de {rawData.length} total
                </p>
              )}
            </div>
          )}

          {/* Paso 3: Validation */}
          {step === 'validation' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Mercancías procesadas</h3>
                <Badge variant="outline">
                  {mercancias.length} mercancías
                </Badge>
              </div>

              <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clave</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Unidad</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mercancias.map((mercancia, index) => (
                      <TableRow key={index}>
                        <TableCell>{mercancia.bienes_transp || '-'}</TableCell>
                        <TableCell className="max-w-48 truncate">
                          {mercancia.descripcion || '-'}
                        </TableCell>
                        <TableCell>{mercancia.cantidad || '-'}</TableCell>
                        <TableCell>{mercancia.clave_unidad || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Listo
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Paso 4: Results */}
          {step === 'results' && importResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resultados de importación</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">
                      {importResult.importadas} Importadas
                    </span>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-600">
                      {importResult.errores} Con errores
                    </span>
                  </div>
                </div>
              </div>

              {importResult.mercanciasConErrores.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Mercancías con errores:</h4>
                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fila</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Errores</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.mercanciasConErrores.map((mercancia, index) => (
                          <TableRow key={index}>
                            <TableCell>{mercancia.fila}</TableCell>
                            <TableCell className="max-w-48 truncate">
                              {mercancia.descripcion || 'Sin descripción'}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                {mercancia.errores?.map((error, errorIndex) => (
                                  <Badge key={errorIndex} variant="destructive" className="text-xs">
                                    {typeof error === 'string' ? error : error}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {step === 'results' ? 'Cerrar' : 'Cancelar'}
          </Button>
          
          {step === 'preview' && (
            <Button onClick={processData}>
              Procesar Datos
            </Button>
          )}
          
          {step === 'validation' && (
            <Button 
              onClick={handleImport} 
              disabled={isProcessing || mercancias.length === 0}
            >
              {isProcessing ? 'Importando...' : `Importar ${mercancias.length} Mercancías`}
            </Button>
          )}
          
          {step === 'results' && (
            <Button onClick={resetDialog}>
              Importar Más
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
