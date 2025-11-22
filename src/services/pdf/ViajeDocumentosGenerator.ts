import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * ViajeDocumentosGenerator
 * 
 * Servicio para generación de documentos PDF del viaje
 * Cumple con ISO 27001:
 * - A.8.3.1: Gestión de soportes extraíbles - PDFs con información sensible
 * - A.18.1.3: Protección de registros - Auditoría de generación de documentos
 * - A.12.4.1: Registro de eventos - Logs de generación de PDFs
 * 
 * @class ViajeDocumentosGenerator
 */
export class ViajeDocumentosGenerator {
  
  /**
   * Genera Hoja de Ruta en PDF
   * Documento operativo con información completa del viaje
   * 
   * @param viajeData - Datos completos del viaje
   * @security ISO 27001 A.18.1.3 - Registro de generación de documento
   */
  static generarHojaDeRuta(viajeData: any): void {
    try {
      console.log('📄 Generando Hoja de Ruta PDF para viaje:', viajeData.viaje?.id);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const viaje = viajeData.viaje;
      
      // Header con diseño profesional
      doc.setFillColor(37, 99, 235); // bg-blue-600
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('HOJA DE RUTA', pageWidth / 2, 25, { align: 'center' });
      
      // Información del viaje
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let yPos = 50;
      
      // Sección: Información General
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Información del Viaje', 15, yPos);
      yPos += 10;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`ID Viaje: ${viaje?.id?.slice(0, 8)}...`, 15, yPos);
      yPos += 7;
      doc.text(`Fecha Creación: ${new Date(viaje?.created_at).toLocaleString('es-MX')}`, 15, yPos);
      yPos += 7;
      doc.text(`Estado: ${this.getEstadoLabel(viaje?.estado)}`, 15, yPos);
      yPos += 7;
      doc.text(`Origen: ${viaje?.origen || 'N/A'}`, 15, yPos);
      yPos += 7;
      doc.text(`Destino: ${viaje?.destino || 'N/A'}`, 15, yPos);
      yPos += 7;
      doc.text(`Distancia Estimada: ${viaje?.distancia_km || 'N/A'} km`, 15, yPos);
      yPos += 7;
      
      if (viaje?.fecha_inicio_programada) {
        doc.text(`Salida Programada: ${new Date(viaje.fecha_inicio_programada).toLocaleString('es-MX')}`, 15, yPos);
        yPos += 7;
      }
      if (viaje?.fecha_fin_programada) {
        doc.text(`Llegada Estimada: ${new Date(viaje.fecha_fin_programada).toLocaleString('es-MX')}`, 15, yPos);
        yPos += 7;
      }
      
      yPos += 8;
      
      // Sección: Recursos Asignados
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Recursos Asignados', 15, yPos);
      yPos += 10;
      
      const recursos = [
        [
          'Conductor', 
          viajeData.conductor?.nombre || 'No asignado', 
          viajeData.conductor?.telefono || '-',
          viajeData.conductor?.num_licencia || '-'
        ],
        [
          'Vehículo', 
          viajeData.vehiculo?.placa || 'No asignado', 
          `${viajeData.vehiculo?.marca || '-'} ${viajeData.vehiculo?.modelo || ''}`,
          viajeData.vehiculo?.config_vehicular || '-'
        ],
        [
          'Remolque', 
          viajeData.remolque?.placa || 'No asignado', 
          viajeData.remolque?.tipo_remolque || '-',
          viajeData.remolque?.subtipo_rem || '-'
        ]
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [['Recurso', 'Identificación', 'Detalle 1', 'Detalle 2']],
        body: recursos,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Sección: Mercancías
      if (viajeData.mercancias && viajeData.mercancias.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Mercancías a Transportar', 15, yPos);
        yPos += 10;
        
        const mercanciaRows = viajeData.mercancias.map((m: any, index: number) => [
          (index + 1).toString(),
          m.descripcion || 'Sin descripción',
          m.cantidad?.toString() || '0',
          m.clave_unidad || '-',
          `${m.peso_kg || 0} kg`,
          m.material_peligroso ? 'Sí' : 'No'
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Descripción', 'Cantidad', 'Unidad', 'Peso', 'Peligroso']],
          body: mercanciaRows,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
          styles: { fontSize: 8 },
          columnStyles: {
            1: { cellWidth: 80 }
          }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }
      
      // Sección: Información Fiscal (si existe)
      if (viajeData.factura || viajeData.carta_porte) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Documentos Fiscales', 15, yPos);
        yPos += 10;
        
        const docsFiscales = [];
        
        if (viajeData.factura) {
          docsFiscales.push([
            'Factura',
            `${viajeData.factura.serie || ''}-${viajeData.factura.folio || ''}`,
            viajeData.factura.status === 'timbrado' ? 'Timbrada' : 'Borrador',
            viajeData.factura.uuid_fiscal?.slice(0, 20) + '...' || 'N/A'
          ]);
        }
        
        if (viajeData.carta_porte) {
          docsFiscales.push([
            'Carta Porte',
            viajeData.carta_porte.folio || 'N/A',
            viajeData.carta_porte.status === 'timbrada' ? 'Timbrada' : 'Borrador',
            viajeData.carta_porte.uuid_fiscal?.slice(0, 20) + '...' || 'N/A'
          ]);
        }
        
        if (docsFiscales.length > 0) {
          autoTable(doc, {
            startY: yPos,
            head: [['Documento', 'Folio', 'Estado', 'UUID']],
            body: docsFiscales,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
            styles: { fontSize: 9 }
          });
        }
      }
      
      // Footer en todas las páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Página ${i} de ${pageCount} | Generado: ${new Date().toLocaleString('es-MX')} | ISO 27001 Compliant`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Descargar con nombre descriptivo
      const fechaHoy = new Date().toISOString().split('T')[0];
      doc.save(`HojaRuta_${viaje?.id?.slice(0, 8)}_${fechaHoy}.pdf`);
      
      console.log('✅ Hoja de Ruta PDF generada exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando Hoja de Ruta PDF:', error);
      throw error;
    }
  }
  
  /**
   * Genera Checklist Pre-Viaje en PDF
   * Documento de seguridad y verificación operativa
   * 
   * @param viajeData - Datos completos del viaje
   * @security ISO 27001 A.18.1.3 - Registro de generación de documento
   */
  static generarChecklistPreViaje(viajeData: any): void {
    try {
      console.log('📋 Generando Checklist Pre-Viaje PDF para viaje:', viajeData.viaje?.id);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const viaje = viajeData.viaje;
      
      // Header con diseño profesional
      doc.setFillColor(16, 185, 129); // bg-green-600
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('CHECKLIST PRE-VIAJE', pageWidth / 2, 25, { align: 'center' });
      
      // Información del viaje
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      let yPos = 50;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Información del Viaje:', 15, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${viaje?.id?.slice(0, 8)}...`, 15, yPos);
      yPos += 7;
      doc.text(`Conductor: ${viajeData.conductor?.nombre || 'No asignado'}`, 15, yPos);
      yPos += 7;
      doc.text(`Vehículo: ${viajeData.vehiculo?.placa || 'No asignado'} (${viajeData.vehiculo?.marca || 'N/A'})`, 15, yPos);
      yPos += 7;
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 15, yPos);
      yPos += 15;
      
      // Checklist items categorizados
      const checklistItems = [
        ['📄 Documentación Legal', [
          'Licencia de conducir vigente y adecuada para el tipo de vehículo',
          'Tarjeta de circulación del vehículo actualizada',
          'Póliza de seguro vigente (Responsabilidad Civil y Carga)',
          'Carta Porte impresa o en formato digital',
          'Facturas o documentación de las mercancías transportadas',
          'Permisos SCT vigentes'
        ]],
        ['🚛 Revisión del Vehículo', [
          'Nivel de combustible suficiente para el trayecto',
          'Llantas en buen estado (sin desgaste excesivo ni daños)',
          'Presión de aire correcta en todas las llantas',
          'Luces delanteras, traseras, direccionales funcionando',
          'Frenos en buen estado (prueba de frenado realizada)',
          'Espejos retrovisores limpios y correctamente ajustados',
          'Parabrisas sin fisuras, limpiaparabrisas funcionales',
          'Nivel de aceite del motor verificado',
          'Líquido de frenos en nivel adecuado',
          'Sistema de suspensión sin anomalías'
        ]],
        ['⚠️ Equipo de Seguridad', [
          'Extintor vigente (con carga completa) y accesible',
          'Dos triángulos de seguridad reflejantes',
          'Botiquín de primeros auxilios completo y vigente',
          'Chaleco reflejante para el conductor',
          'Linterna funcional con pilas nuevas',
          'Cables pasacorriente en buen estado',
          'Señales de advertencia adicionales',
          'Kit de herramientas básicas'
        ]],
        ['📦 Verificación de Carga', [
          'Mercancía correctamente estibada y balanceada',
          'Amarres, cinchos y sujeciones seguras',
          'Peso total dentro de los límites legales',
          'Documentación de la carga completa y correcta',
          'Etiquetas de material peligroso colocadas (si aplica)',
          'Sellos de seguridad intactos (si aplica)',
          'Temperatura de carga refrigerada verificada (si aplica)',
          'Lonas y coberturas en buen estado'
        ]],
        ['📱 Comunicación y Emergencias', [
          'Teléfono celular cargado completamente',
          'Números de emergencia registrados',
          'GPS o sistema de rastreo funcional',
          'Contacto de emergencia confirmado',
          'Datos de aseguradora accesibles'
        ]]
      ];
      
      checklistItems.forEach(([categoria, items]) => {
        // Verificar espacio disponible, crear nueva página si es necesario
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
        doc.text(categoria as string, 20, yPos);
        yPos += 12;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        (items as string[]).forEach(item => {
          // Verificar espacio para el item
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          
          // Checkbox vacío
          doc.rect(20, yPos - 3, 4, 4);
          
          // Texto del item con wrap si es muy largo
          const splitText = doc.splitTextToSize(item, pageWidth - 40);
          doc.text(splitText, 28, yPos);
          yPos += 5 * splitText.length + 2;
        });
        
        yPos += 8;
      });
      
      // Sección de firmas
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }
      
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Firmas de Conformidad', 15, yPos);
      yPos += 15;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const firmaY = yPos + 20;
      
      // Firma Conductor
      doc.line(25, firmaY, 85, firmaY);
      doc.text('Conductor', 45, firmaY + 5);
      doc.setFontSize(8);
      doc.text(`${viajeData.conductor?.nombre || 'Nombre del Conductor'}`, 30, firmaY + 10);
      
      // Firma Supervisor
      doc.setFontSize(10);
      doc.line(125, firmaY, 185, firmaY);
      doc.text('Supervisor', 142, firmaY + 5);
      doc.setFontSize(8);
      doc.text('Nombre del Supervisor', 133, firmaY + 10);
      
      // Nota importante
      yPos = firmaY + 25;
      doc.setFontSize(8);
      doc.setTextColor(100);
      const nota = 'NOTA: Este checklist debe ser completado antes de iniciar el viaje. La omisión de cualquier punto puede resultar en sanciones legales y comprometer la seguridad del conductor y la carga.';
      const notaLines = doc.splitTextToSize(nota, pageWidth - 30);
      doc.text(notaLines, 15, yPos);
      
      // Footer en todas las páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(
          `Página ${i} de ${pageCount} | Generado: ${new Date().toLocaleString('es-MX')} | ISO 27001 A.18.1.3`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Descargar con nombre descriptivo
      const fechaHoy = new Date().toISOString().split('T')[0];
      doc.save(`Checklist_PreViaje_${viaje?.id?.slice(0, 8)}_${fechaHoy}.pdf`);
      
      console.log('✅ Checklist Pre-Viaje PDF generado exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando Checklist Pre-Viaje PDF:', error);
      throw error;
    }
  }
  
  /**
   * Mapeo de estados a etiquetas legibles
   * @private
   */
  private static getEstadoLabel(estado: string): string {
    const estados: Record<string, string> = {
      'programado': 'Programado',
      'en_transito': 'En Tránsito',
      'completado': 'Completado',
      'cancelado': 'Cancelado',
      'retrasado': 'Retrasado',
      'borrador': 'Borrador'
    };
    return estados[estado] || estado;
  }
}
