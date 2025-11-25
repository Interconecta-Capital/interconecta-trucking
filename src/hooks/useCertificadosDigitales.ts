
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CertificadoDigital, CSDUploadData } from '@/types/certificados';
import { CSDService } from '@/services/csd/CSDService';
import { CertificateUploadService } from '@/services/csd/CertificateUploadService';
import { CertificateParserService } from '@/services/csd/CertificateParserService';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useCertificadosDigitales = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query para obtener todos los certificados
  const { 
    data: certificados = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['certificados-digitales', user?.id],
    queryFn: CSDService.getUserCertificates,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  // Query para el certificado activo
  const { 
    data: certificadoActivo, 
    isLoading: loadingActive 
  } = useQuery({
    queryKey: ['certificado-activo', user?.id],
    queryFn: CSDService.getActiveCertificate,
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  // Mutation para subir nuevo certificado
  const uploadMutation = useMutation({
    mutationFn: async (uploadData: CSDUploadData) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // Validar archivos
      const fileErrors = [
        ...CertificateUploadService.validateFileExtensions(
          uploadData.archivoCer, 
          uploadData.archivoKey
        ),
        ...CertificateUploadService.validateFileSizes(
          uploadData.archivoCer, 
          uploadData.archivoKey
        )
      ];

      if (fileErrors.length > 0) {
        throw new Error(fileErrors.join(', '));
      }

      // Validar certificado
      const validation = await CertificateParserService.validateCertificate(
        uploadData.archivoCer,
        uploadData.archivoKey,
        uploadData.passwordKey
      );

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Subir archivos
      const { cerPath, keyPath } = await CertificateUploadService.uploadCertificateFiles(
        uploadData, 
        user.id
      );

      // Crear registro en base de datos
      const certificateData = {
        nombre_certificado: uploadData.nombreCertificado,
        numero_certificado: validation.certificateInfo!.numeroSerie,
        rfc_titular: validation.certificateInfo!.rfc,
        razon_social: validation.certificateInfo!.razonSocial,
        fecha_inicio_vigencia: validation.certificateInfo!.fechaInicioVigencia.toISOString(),
        fecha_fin_vigencia: validation.certificateInfo!.fechaFinVigencia.toISOString(),
        archivo_cer_path: cerPath,
        archivo_key_path: keyPath,
        archivo_key_encrypted: true,
        validado: true,
        activo: certificados.length === 0 // Activar automáticamente si es el primero
      };

      return await CSDService.createCertificate(certificateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificados-digitales'] });
      queryClient.invalidateQueries({ queryKey: ['certificado-activo'] });
      toast.success('Certificado digital subido exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error uploading certificate:', error);
      toast.error(`Error al subir certificado: ${error.message}`);
    }
  });

  // Mutation para activar certificado
  const activateMutation = useMutation({
    mutationFn: CSDService.activateCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificados-digitales'] });
      queryClient.invalidateQueries({ queryKey: ['certificado-activo'] });
      toast.success('Certificado activado exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error activating certificate:', error);
      toast.error(`Error al activar certificado: ${error.message}`);
    }
  });

  // Mutation para actualizar certificado
  const updateMutation = useMutation({
    mutationFn: async (updateData: {
      certificadoId: string;
      nombreCertificado?: string;
      nuevoArchivoCer?: File;
      nuevoArchivoKey?: File;
      nuevaPassword?: string;
    }) => {
      return await CSDService.updateCertificate(
        updateData.certificadoId,
        {
          nombreCertificado: updateData.nombreCertificado,
          nuevoArchivoCer: updateData.nuevoArchivoCer,
          nuevoArchivoKey: updateData.nuevoArchivoKey,
          nuevaPassword: updateData.nuevaPassword
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificados-digitales'] });
      queryClient.invalidateQueries({ queryKey: ['certificado-activo'] });
      toast.success('Certificado actualizado exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error updating certificate:', error);
      toast.error(`Error al actualizar certificado: ${error.message}`);
    }
  });

  // Mutation para eliminar certificado
  const deleteMutation = useMutation({
    mutationFn: CSDService.deleteCertificate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificados-digitales'] });
      queryClient.invalidateQueries({ queryKey: ['certificado-activo'] });
      toast.success('Certificado eliminado exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error deleting certificate:', error);
      toast.error(`Error al eliminar certificado: ${error.message}`);
    }
  });

  return {
    // Datos
    certificados,
    certificadoActivo,
    
    // Estados de carga
    isLoading,
    loadingActive,
    isUploading: uploadMutation.isPending,
    isActivating: activateMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Errores
    error,

    // Acciones
    subirCertificado: uploadMutation.mutateAsync,
    activarCertificado: activateMutation.mutateAsync,
    actualizarCertificado: updateMutation.mutateAsync,
    eliminarCertificado: deleteMutation.mutateAsync,

    // Utilidades
    esCertificadoValido: CSDService.isCertificateValid,
    diasHastaVencimiento: CSDService.getDaysUntilExpiration
  };
};
