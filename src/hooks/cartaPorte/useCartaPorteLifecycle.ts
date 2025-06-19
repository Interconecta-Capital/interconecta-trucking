
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CartaPorteLifecycleManager } from '@/services/cartaPorte/CartaPorteLifecycleManager';
import { DocumentVersionManager } from '@/services/cartaPorte/DocumentVersionManager';
import { 
  BorradorCartaPorte, 
  CartaPorteCompleta,
  CartaPorteDocumento,
  CreateBorradorRequest,
  UpdateBorradorRequest,
  ConvertirBorradorRequest,
  GenerarDocumentoRequest
} from '@/types/cartaPorteLifecycle';

export const useCartaPorteLifecycle = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [borradores, setBorradores] = useState<BorradorCartaPorte[]>([]);
  const [cartasPorte, setCartasPorte] = useState<CartaPorteCompleta[]>([]);
  const [documentos, setDocumentos] = useState<CartaPorteDocumento[]>([]);
  const { toast } = useToast();

  // ========== GESTIÓN DE BORRADORES ==========

  const crearBorrador = useCallback(async (request?: CreateBorradorRequest) => {
    setIsLoading(true);
    try {
      const nuevoBorrador = await CartaPorteLifecycleManager.crearBorrador(request);
      setBorradores(prev => [nuevoBorrador, ...prev]);
      
      toast({
        title: "Borrador creado",
        description: "Nuevo borrador creado exitosamente"
      });
      
      return nuevoBorrador;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error creando borrador",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const guardarBorrador = useCallback(async (
    borradorId: string, 
    request: UpdateBorradorRequest
  ) => {
    try {
      const borradorActualizado = await CartaPorteLifecycleManager.guardarBorrador(borradorId, request);
      
      setBorradores(prev => 
        prev.map(b => b.id === borradorId ? borradorActualizado : b)
      );
      
      if (!request.auto_saved) {
        toast({
          title: "Borrador guardado",
          description: "Cambios guardados exitosamente"
        });
      }
      
      return borradorActualizado;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error guardando borrador",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  const cargarBorrador = useCallback(async (borradorId: string) => {
    setIsLoading(true);
    try {
      const borrador = await CartaPorteLifecycleManager.cargarBorrador(borradorId);
      return borrador;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error cargando borrador",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const listarBorradores = useCallback(async () => {
    setIsLoading(true);
    try {
      const borradorList = await CartaPorteLifecycleManager.listarBorradores();
      setBorradores(borradorList);
      return borradorList;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error listando borradores",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const eliminarBorrador = useCallback(async (borradorId: string) => {
    setIsLoading(true);
    try {
      await CartaPorteLifecycleManager.eliminarBorrador(borradorId);
      setBorradores(prev => prev.filter(b => b.id !== borradorId));
      
      toast({
        title: "Borrador eliminado",
        description: "Borrador eliminado exitosamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error eliminando borrador",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // ========== GESTIÓN DE CARTAS PORTE ==========

  const convertirBorradorACartaPorte = useCallback(async (request: ConvertirBorradorRequest) => {
    setIsLoading(true);
    try {
      const cartaPorte = await CartaPorteLifecycleManager.convertirBorradorACartaPorte(request);
      setCartasPorte(prev => [cartaPorte, ...prev]);
      
      toast({
        title: "Carta Porte creada",
        description: `Carta Porte creada con IdCCP: ${cartaPorte.id_ccp}`
      });
      
      return cartaPorte;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error convirtiendo borrador",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const listarCartasPorte = useCallback(async () => {
    setIsLoading(true);
    try {
      const cartasPorteList = await CartaPorteLifecycleManager.listarCartasPorte();
      setCartasPorte(cartasPorteList);
      return cartasPorteList;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error listando cartas porte",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const obtenerCartaPorte = useCallback(async (cartaPorteId: string) => {
    setIsLoading(true);
    try {
      const cartaPorte = await CartaPorteLifecycleManager.obtenerCartaPorte(cartaPorteId);
      return cartaPorte;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error obteniendo carta porte",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // ========== GESTIÓN DE DOCUMENTOS ==========

  const generarDocumento = useCallback(async (request: GenerarDocumentoRequest) => {
    setIsLoading(true);
    try {
      const documento = await DocumentVersionManager.generarDocumento(request);
      setDocumentos(prev => [documento, ...prev]);
      
      toast({
        title: "Documento generado",
        description: `${request.tipoDocumento.toUpperCase()} ${documento.version_documento} generado exitosamente`
      });
      
      return documento;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error generando documento",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const obtenerDocumentos = useCallback(async (cartaPorteId: string) => {
    setIsLoading(true);
    try {
      const documentosList = await DocumentVersionManager.obtenerTodosLosDocumentos(cartaPorteId);
      setDocumentos(documentosList);
      return documentosList;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error obteniendo documentos",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const obtenerUltimaVersion = useCallback(async (cartaPorteId: string, tipoDocumento: string) => {
    try {
      return await DocumentVersionManager.obtenerUltimaVersion(cartaPorteId, tipoDocumento);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error obteniendo última versión",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  return {
    // Estados
    isLoading,
    borradores,
    cartasPorte,
    documentos,
    
    // Gestión de borradores
    crearBorrador,
    guardarBorrador,
    cargarBorrador,
    listarBorradores,
    eliminarBorrador,
    
    // Gestión de cartas porte
    convertirBorradorACartaPorte,
    listarCartasPorte,
    obtenerCartaPorte,
    
    // Gestión de documentos
    generarDocumento,
    obtenerDocumentos,
    obtenerUltimaVersion,
  };
};
