
import { ValidationResult31 } from './ValidationEngine31Enhanced';

interface MaterialPeligrosoRule {
  keywords: string[];
  claseUN: string;
  numeroUN?: string;
  permisoRequerido: string;
  autoridadExpedidora: string;
  linkTramite: string;
  nivel: 'bloqueante' | 'advertencia';
}

export class MaterialPeligrosoDetector {
  private rules: MaterialPeligrosoRule[] = [
    {
      keywords: ['químico', 'ácido', 'tóxico', 'corrosivo', 'cáustico'],
      claseUN: 'Clase 8',
      permisoRequerido: 'Permiso para Transporte de Sustancias Corrosivas',
      autoridadExpedidora: 'SCT',
      linkTramite: 'https://www.gob.mx/sct/acciones-y-programas/permisos-de-autotransporte-federal',
      nivel: 'bloqueante'
    },
    {
      keywords: ['explosivo', 'pirotécnico', 'dinamita', 'pólvora', 'fuegos artificiales'],
      claseUN: 'Clase 1',
      permisoRequerido: 'Permiso para Transporte de Explosivos',
      autoridadExpedidora: 'SEDENA',
      linkTramite: 'https://www.gob.mx/sedena/tramites',
      nivel: 'bloqueante'
    },
    {
      keywords: ['gasolina', 'diesel', 'combustible', 'inflamable', 'gas', 'propano'],
      claseUN: 'Clase 3',
      permisoRequerido: 'Permiso para Transporte de Líquidos Inflamables',
      autoridadExpedidora: 'SCT',
      linkTramite: 'https://www.gob.mx/sct/acciones-y-programas/permisos-de-autotransporte-federal',
      nivel: 'advertencia'
    },
    {
      keywords: ['radioactivo', 'uranio', 'plutonio', 'material radioactivo'],
      claseUN: 'Clase 7',
      permisoRequerido: 'Licencia para Material Radiactivo',
      autoridadExpedidora: 'CNSNS',
      linkTramite: 'https://www.gob.mx/cnsns',
      nivel: 'bloqueante'
    },
    {
      keywords: ['jaguar', 'águila', 'tortuga', 'madera preciosa', 'coral', 'fauna silvestre'],
      claseUN: 'Especie Protegida',
      permisoRequerido: 'Permiso CITES',
      autoridadExpedidora: 'SEMARNAT',
      linkTramite: 'https://www.gob.mx/semarnat/acciones-y-programas/cites',
      nivel: 'bloqueante'
    }
  ];

  async validateMercancias(mercancias: any[]): Promise<ValidationResult31[]> {
    const resultados: ValidationResult31[] = [];

    for (const mercancia of mercancias) {
      const descripcion = (mercancia.descripcion || '').toLowerCase();
      const descripcionDetallada = (mercancia.descripcion_detallada || '').toLowerCase();
      const textoCompleto = `${descripcion} ${descripcionDetallada}`;

      for (const rule of this.rules) {
        const detected = rule.keywords.some(keyword => 
          textoCompleto.includes(keyword.toLowerCase())
        );

        if (detected) {
          resultados.push({
            isValid: false,
            level: rule.nivel,
            category: 'material_peligroso',
            title: `Material Peligroso Detectado: ${rule.claseUN}`,
            message: `Se detectó "${rule.keywords.find(k => textoCompleto.includes(k))}" en la descripción. Se requiere ${rule.permisoRequerido}`,
            solution: `Obtenga el permiso correspondiente de ${rule.autoridadExpedidora}`,
            linkTramite: rule.linkTramite,
            autoFix: {
              field: 'material_peligroso',
              value: true,
              description: 'Marcar como material peligroso automáticamente'
            }
          });

          // Validar si ya está marcado como material peligroso
          if (!mercancia.material_peligroso) {
            resultados.push({
              isValid: false,
              level: 'advertencia',
              category: 'material_peligroso',
              title: 'Material Peligroso No Marcado',
              message: 'La mercancía contiene material peligroso pero no está marcada como tal',
              solution: 'Active el flag de material peligroso en la mercancía',
              autoFix: {
                field: 'material_peligroso',
                value: true,
                description: 'Marcar automáticamente como material peligroso'
              }
            });
          }

          // Validar clave de material peligroso
          if (mercancia.material_peligroso && !mercancia.cve_material_peligroso) {
            resultados.push({
              isValid: false,
              level: 'bloqueante',
              category: 'material_peligroso',
              title: 'Clave de Material Peligroso Faltante',
              message: 'Se marcó como material peligroso pero falta la clave UN',
              solution: `Agregue la clave UN correspondiente (${rule.numeroUN || 'consulte catálogo'})`
            });
          }
        }
      }

      // Validaciones adicionales para material peligroso marcado
      if (mercancia.material_peligroso) {
        await this.validateMaterialPeligrosoCompliance(mercancia, resultados);
      }
    }

    return resultados;
  }

  private async validateMaterialPeligrosoCompliance(
    mercancia: any, 
    resultados: ValidationResult31[]
  ): Promise<void> {
    // Validar embalaje especial
    if (!mercancia.tipo_embalaje) {
      resultados.push({
        isValid: false,
        level: 'advertencia',
        category: 'material_peligroso',
        title: 'Tipo de Embalaje Requerido',
        message: 'Material peligroso requiere especificar tipo de embalaje',
        solution: 'Seleccione el tipo de embalaje apropiado para material peligroso'
      });
    }

    // Validar cantidad límite
    const cantidad = mercancia.cantidad || 0;
    if (cantidad > 1000) { // Límite ejemplo
      resultados.push({
        isValid: false,
        level: 'advertencia',
        category: 'material_peligroso',
        title: 'Cantidad Elevada de Material Peligroso',
        message: `Cantidad de ${cantidad} puede requerir permisos adicionales`,
        solution: 'Verifique límites regulatorios para esta cantidad'
      });
    }
  }
}
