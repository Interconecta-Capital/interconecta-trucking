export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analisis_viajes: {
        Row: {
          cliente_id: string | null
          costo_estimado: number | null
          costo_real: number | null
          created_at: string | null
          fecha_viaje: string
          id: string
          margen_real: number | null
          precio_cobrado: number | null
          ruta_hash: string
          tiempo_estimado: number | null
          tiempo_real: number | null
          updated_at: string | null
          user_id: string
          vehiculo_tipo: string | null
          viaje_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string | null
          fecha_viaje: string
          id?: string
          margen_real?: number | null
          precio_cobrado?: number | null
          ruta_hash: string
          tiempo_estimado?: number | null
          tiempo_real?: number | null
          updated_at?: string | null
          user_id: string
          vehiculo_tipo?: string | null
          viaje_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string | null
          fecha_viaje?: string
          id?: string
          margen_real?: number | null
          precio_cobrado?: number | null
          ruta_hash?: string
          tiempo_estimado?: number | null
          tiempo_real?: number | null
          updated_at?: string | null
          user_id?: string
          vehiculo_tipo?: string | null
          viaje_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analisis_viajes_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_analisis_viajes_viaje"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          accion: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          tabla: string | null
        }
        Insert: {
          accion?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          tabla?: string | null
        }
        Update: {
          accion?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          tabla?: string | null
        }
        Relationships: []
      }
      autotransporte: {
        Row: {
          anio_modelo_vm: number | null
          asegura_carga: string | null
          asegura_med_ambiente: string | null
          asegura_resp_civil: string | null
          carga_maxima: number | null
          carta_porte_id: string | null
          config_vehicular: string | null
          created_at: string | null
          id: string
          num_permiso_sct: string | null
          numero_serie_vin: string | null
          perm_sct: string | null
          peso_bruto_vehicular: number
          placa_vm: string | null
          poliza_carga: string | null
          poliza_med_ambiente: string | null
          poliza_resp_civil: string | null
          tarjeta_circulacion: string | null
          tipo_carroceria: string | null
          vigencia_med_ambiente: string | null
          vigencia_resp_civil: string | null
          vigencia_tarjeta_circulacion: string | null
        }
        Insert: {
          anio_modelo_vm?: number | null
          asegura_carga?: string | null
          asegura_med_ambiente?: string | null
          asegura_resp_civil?: string | null
          carga_maxima?: number | null
          carta_porte_id?: string | null
          config_vehicular?: string | null
          created_at?: string | null
          id?: string
          num_permiso_sct?: string | null
          numero_serie_vin?: string | null
          perm_sct?: string | null
          peso_bruto_vehicular: number
          placa_vm?: string | null
          poliza_carga?: string | null
          poliza_med_ambiente?: string | null
          poliza_resp_civil?: string | null
          tarjeta_circulacion?: string | null
          tipo_carroceria?: string | null
          vigencia_med_ambiente?: string | null
          vigencia_resp_civil?: string | null
          vigencia_tarjeta_circulacion?: string | null
        }
        Update: {
          anio_modelo_vm?: number | null
          asegura_carga?: string | null
          asegura_med_ambiente?: string | null
          asegura_resp_civil?: string | null
          carga_maxima?: number | null
          carta_porte_id?: string | null
          config_vehicular?: string | null
          created_at?: string | null
          id?: string
          num_permiso_sct?: string | null
          numero_serie_vin?: string | null
          perm_sct?: string | null
          peso_bruto_vehicular?: number
          placa_vm?: string | null
          poliza_carga?: string | null
          poliza_med_ambiente?: string | null
          poliza_resp_civil?: string | null
          tarjeta_circulacion?: string | null
          tipo_carroceria?: string | null
          vigencia_med_ambiente?: string | null
          vigencia_resp_civil?: string | null
          vigencia_tarjeta_circulacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autotransporte_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
        ]
      }
      bloqueos_usuario: {
        Row: {
          activo: boolean | null
          created_at: string | null
          fecha_bloqueo: string | null
          fecha_desbloqueo: string | null
          id: string
          mensaje_bloqueo: string | null
          motivo: string
          user_id: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          fecha_bloqueo?: string | null
          fecha_desbloqueo?: string | null
          id?: string
          mensaje_bloqueo?: string | null
          motivo: string
          user_id: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          fecha_bloqueo?: string | null
          fecha_desbloqueo?: string | null
          id?: string
          mensaje_bloqueo?: string | null
          motivo?: string
          user_id?: string
        }
        Relationships: []
      }
      borradores_carta_porte: {
        Row: {
          auto_saved: boolean
          created_at: string
          datos_formulario: Json
          id: string
          nombre_borrador: string
          ultima_edicion: string
          updated_at: string
          user_id: string
          version_formulario: string
          viaje_id: string | null
        }
        Insert: {
          auto_saved?: boolean
          created_at?: string
          datos_formulario?: Json
          id?: string
          nombre_borrador?: string
          ultima_edicion?: string
          updated_at?: string
          user_id: string
          version_formulario?: string
          viaje_id?: string | null
        }
        Update: {
          auto_saved?: boolean
          created_at?: string
          datos_formulario?: Json
          id?: string
          nombre_borrador?: string
          ultima_edicion?: string
          updated_at?: string
          user_id?: string
          version_formulario?: string
          viaje_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "borradores_carta_porte_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_borradores_viaje"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string | null
          descripcion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          metadata: Json | null
          recordatorios: Json | null
          tipo: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          metadata?: Json | null
          recordatorios?: Json | null
          tipo: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          metadata?: Json | null
          recordatorios?: Json | null
          tipo?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calificaciones_conductores: {
        Row: {
          calificacion: number | null
          cliente_id: string | null
          comentarios: string | null
          conductor_id: string | null
          created_at: string | null
          criterios: Json | null
          id: string
          tipo_calificacion: string | null
          user_id: string
          viaje_id: string | null
        }
        Insert: {
          calificacion?: number | null
          cliente_id?: string | null
          comentarios?: string | null
          conductor_id?: string | null
          created_at?: string | null
          criterios?: Json | null
          id?: string
          tipo_calificacion?: string | null
          user_id: string
          viaje_id?: string | null
        }
        Update: {
          calificacion?: number | null
          cliente_id?: string | null
          comentarios?: string | null
          conductor_id?: string | null
          created_at?: string | null
          criterios?: Json | null
          id?: string
          tipo_calificacion?: string | null
          user_id?: string
          viaje_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calificaciones_conductores_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
        ]
      }
      cantidad_transporta: {
        Row: {
          cantidad: number | null
          created_at: string | null
          id: string
          id_destino: string | null
          id_origen: string | null
          mercancia_id: string | null
        }
        Insert: {
          cantidad?: number | null
          created_at?: string | null
          id?: string
          id_destino?: string | null
          id_origen?: string | null
          mercancia_id?: string | null
        }
        Update: {
          cantidad?: number | null
          created_at?: string | null
          id?: string
          id_destino?: string | null
          id_origen?: string | null
          mercancia_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cantidad_transporta_mercancia_id_fkey"
            columns: ["mercancia_id"]
            isOneToOne: false
            referencedRelation: "mercancias"
            referencedColumns: ["id"]
          },
        ]
      }
      carta_porte_documentos: {
        Row: {
          activo: boolean
          carta_porte_id: string
          contenido_blob: string | null
          contenido_path: string | null
          created_at: string
          fecha_generacion: string
          id: string
          metadatos: Json | null
          tipo_documento: string
          version_documento: string
        }
        Insert: {
          activo?: boolean
          carta_porte_id: string
          contenido_blob?: string | null
          contenido_path?: string | null
          created_at?: string
          fecha_generacion?: string
          id?: string
          metadatos?: Json | null
          tipo_documento: string
          version_documento?: string
        }
        Update: {
          activo?: boolean
          carta_porte_id?: string
          contenido_blob?: string | null
          contenido_path?: string | null
          created_at?: string
          fecha_generacion?: string
          id?: string
          metadatos?: Json | null
          tipo_documento?: string
          version_documento?: string
        }
        Relationships: [
          {
            foreignKeyName: "carta_porte_documentos_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
        ]
      }
      cartas_porte: {
        Row: {
          borrador_origen_id: string | null
          cancelable: string | null
          conductor_principal_id: string | null
          created_at: string | null
          datos_formulario: Json | null
          distancia_total: number | null
          domicilio_fiscal_emisor: Json | null
          domicilio_fiscal_receptor: Json | null
          entrada_salida_merc: string | null
          es_plantilla: boolean | null
          estatus_cancelacion: string | null
          factura_id: string | null
          fecha_cancelacion: string | null
          fecha_timbrado: string | null
          folio: string | null
          id: string
          id_ccp: string | null
          motivo_cancelacion: string | null
          nombre_documento: string | null
          nombre_emisor: string | null
          nombre_receptor: string | null
          numero_total_mercancias: number | null
          pais_origen_destino: string | null
          peso_bruto_total: number | null
          regimen_fiscal_emisor: string | null
          regimen_fiscal_receptor: string | null
          regimenes_aduaneros: Json | null
          registro_istmo: boolean | null
          remolque_principal_id: string | null
          rfc_emisor: string
          rfc_receptor: string
          status: string | null
          tenant_id: string | null
          tipo_cfdi: string | null
          transporte_internacional: boolean | null
          ubicacion_polo_destino: string | null
          ubicacion_polo_origen: string | null
          updated_at: string | null
          uso_cfdi: string | null
          usuario_id: string | null
          uuid_fiscal: string | null
          vehiculo_principal_id: string | null
          version_carta_porte: string | null
          version_documento: string | null
          via_entrada_salida: string | null
          viaje_id: string | null
          xml_generado: string | null
        }
        Insert: {
          borrador_origen_id?: string | null
          cancelable?: string | null
          conductor_principal_id?: string | null
          created_at?: string | null
          datos_formulario?: Json | null
          distancia_total?: number | null
          domicilio_fiscal_emisor?: Json | null
          domicilio_fiscal_receptor?: Json | null
          entrada_salida_merc?: string | null
          es_plantilla?: boolean | null
          estatus_cancelacion?: string | null
          factura_id?: string | null
          fecha_cancelacion?: string | null
          fecha_timbrado?: string | null
          folio?: string | null
          id?: string
          id_ccp?: string | null
          motivo_cancelacion?: string | null
          nombre_documento?: string | null
          nombre_emisor?: string | null
          nombre_receptor?: string | null
          numero_total_mercancias?: number | null
          pais_origen_destino?: string | null
          peso_bruto_total?: number | null
          regimen_fiscal_emisor?: string | null
          regimen_fiscal_receptor?: string | null
          regimenes_aduaneros?: Json | null
          registro_istmo?: boolean | null
          remolque_principal_id?: string | null
          rfc_emisor: string
          rfc_receptor: string
          status?: string | null
          tenant_id?: string | null
          tipo_cfdi?: string | null
          transporte_internacional?: boolean | null
          ubicacion_polo_destino?: string | null
          ubicacion_polo_origen?: string | null
          updated_at?: string | null
          uso_cfdi?: string | null
          usuario_id?: string | null
          uuid_fiscal?: string | null
          vehiculo_principal_id?: string | null
          version_carta_porte?: string | null
          version_documento?: string | null
          via_entrada_salida?: string | null
          viaje_id?: string | null
          xml_generado?: string | null
        }
        Update: {
          borrador_origen_id?: string | null
          cancelable?: string | null
          conductor_principal_id?: string | null
          created_at?: string | null
          datos_formulario?: Json | null
          distancia_total?: number | null
          domicilio_fiscal_emisor?: Json | null
          domicilio_fiscal_receptor?: Json | null
          entrada_salida_merc?: string | null
          es_plantilla?: boolean | null
          estatus_cancelacion?: string | null
          factura_id?: string | null
          fecha_cancelacion?: string | null
          fecha_timbrado?: string | null
          folio?: string | null
          id?: string
          id_ccp?: string | null
          motivo_cancelacion?: string | null
          nombre_documento?: string | null
          nombre_emisor?: string | null
          nombre_receptor?: string | null
          numero_total_mercancias?: number | null
          pais_origen_destino?: string | null
          peso_bruto_total?: number | null
          regimen_fiscal_emisor?: string | null
          regimen_fiscal_receptor?: string | null
          regimenes_aduaneros?: Json | null
          registro_istmo?: boolean | null
          remolque_principal_id?: string | null
          rfc_emisor?: string
          rfc_receptor?: string
          status?: string | null
          tenant_id?: string | null
          tipo_cfdi?: string | null
          transporte_internacional?: boolean | null
          ubicacion_polo_destino?: string | null
          ubicacion_polo_origen?: string | null
          updated_at?: string | null
          uso_cfdi?: string | null
          usuario_id?: string | null
          uuid_fiscal?: string | null
          vehiculo_principal_id?: string | null
          version_carta_porte?: string | null
          version_documento?: string | null
          via_entrada_salida?: string | null
          viaje_id?: string | null
          xml_generado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cartas_porte_borrador_origen_id_fkey"
            columns: ["borrador_origen_id"]
            isOneToOne: false
            referencedRelation: "borradores_carta_porte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cartas_porte_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cartas_porte_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cartas_porte_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cartas_porte_viaje"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      cat_clave_prod_serv_cp: {
        Row: {
          clave_prod_serv: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          id: string
          incluye_iva: boolean | null
        }
        Insert: {
          clave_prod_serv: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          incluye_iva?: boolean | null
        }
        Update: {
          clave_prod_serv?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          incluye_iva?: boolean | null
        }
        Relationships: []
      }
      cat_clave_unidad: {
        Row: {
          clave_unidad: string
          created_at: string | null
          descripcion: string | null
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          id: string
          nombre: string
          nota: string | null
          simbolo: string | null
        }
        Insert: {
          clave_unidad: string
          created_at?: string | null
          descripcion?: string | null
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          nombre: string
          nota?: string | null
          simbolo?: string | null
        }
        Update: {
          clave_unidad?: string
          created_at?: string | null
          descripcion?: string | null
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          nombre?: string
          nota?: string | null
          simbolo?: string | null
        }
        Relationships: []
      }
      cat_codigo_postal: {
        Row: {
          codigo_postal: string
          created_at: string | null
          estado_clave: string
          estimulo_frontera: boolean | null
          id: string
          localidad_clave: string | null
          municipio_clave: string
        }
        Insert: {
          codigo_postal: string
          created_at?: string | null
          estado_clave: string
          estimulo_frontera?: boolean | null
          id?: string
          localidad_clave?: string | null
          municipio_clave: string
        }
        Update: {
          codigo_postal?: string
          created_at?: string | null
          estado_clave?: string
          estimulo_frontera?: boolean | null
          id?: string
          localidad_clave?: string | null
          municipio_clave?: string
        }
        Relationships: []
      }
      cat_colonia: {
        Row: {
          clave_colonia: string
          codigo_postal: string
          created_at: string | null
          descripcion: string
          id: string
        }
        Insert: {
          clave_colonia: string
          codigo_postal: string
          created_at?: string | null
          descripcion: string
          id?: string
        }
        Update: {
          clave_colonia?: string
          codigo_postal?: string
          created_at?: string | null
          descripcion?: string
          id?: string
        }
        Relationships: []
      }
      cat_config_autotransporte: {
        Row: {
          clave_config: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          id: string
          remolque: boolean | null
          semirremolque: boolean | null
        }
        Insert: {
          clave_config: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          remolque?: boolean | null
          semirremolque?: boolean | null
        }
        Update: {
          clave_config?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          remolque?: boolean | null
          semirremolque?: boolean | null
        }
        Relationships: []
      }
      cat_estado: {
        Row: {
          clave_estado: string
          created_at: string | null
          descripcion: string
          id: string
          pais_clave: string | null
        }
        Insert: {
          clave_estado: string
          created_at?: string | null
          descripcion: string
          id?: string
          pais_clave?: string | null
        }
        Update: {
          clave_estado?: string
          created_at?: string | null
          descripcion?: string
          id?: string
          pais_clave?: string | null
        }
        Relationships: []
      }
      cat_figura_transporte: {
        Row: {
          clave_figura: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          id: string
          persona_fisica: boolean | null
          persona_moral: boolean | null
        }
        Insert: {
          clave_figura: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          persona_fisica?: boolean | null
          persona_moral?: boolean | null
        }
        Update: {
          clave_figura?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          persona_fisica?: boolean | null
          persona_moral?: boolean | null
        }
        Relationships: []
      }
      cat_localidad: {
        Row: {
          clave_localidad: string
          created_at: string | null
          descripcion: string
          estado_clave: string
          id: string
          municipio_clave: string
        }
        Insert: {
          clave_localidad: string
          created_at?: string | null
          descripcion: string
          estado_clave: string
          id?: string
          municipio_clave: string
        }
        Update: {
          clave_localidad?: string
          created_at?: string | null
          descripcion?: string
          estado_clave?: string
          id?: string
          municipio_clave?: string
        }
        Relationships: []
      }
      cat_material_peligroso: {
        Row: {
          clase_division: string | null
          clave_material: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          grupo_embalaje: string | null
          id: string
          instrucciones_embalaje: string | null
          peligro_secundario: string | null
        }
        Insert: {
          clase_division?: string | null
          clave_material: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          grupo_embalaje?: string | null
          id?: string
          instrucciones_embalaje?: string | null
          peligro_secundario?: string | null
        }
        Update: {
          clase_division?: string | null
          clave_material?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          grupo_embalaje?: string | null
          id?: string
          instrucciones_embalaje?: string | null
          peligro_secundario?: string | null
        }
        Relationships: []
      }
      cat_municipio: {
        Row: {
          clave_municipio: string
          created_at: string | null
          descripcion: string
          estado_clave: string
          id: string
        }
        Insert: {
          clave_municipio: string
          created_at?: string | null
          descripcion: string
          estado_clave: string
          id?: string
        }
        Update: {
          clave_municipio?: string
          created_at?: string | null
          descripcion?: string
          estado_clave?: string
          id?: string
        }
        Relationships: []
      }
      cat_pais: {
        Row: {
          agrupaciones: string | null
          clave_pais: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          formato_codigo_postal: string | null
          formato_reg_id_trib: string | null
          id: string
          validacion_reg_id_trib: string | null
        }
        Insert: {
          agrupaciones?: string | null
          clave_pais: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          formato_codigo_postal?: string | null
          formato_reg_id_trib?: string | null
          id?: string
          validacion_reg_id_trib?: string | null
        }
        Update: {
          agrupaciones?: string | null
          clave_pais?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          formato_codigo_postal?: string | null
          formato_reg_id_trib?: string | null
          id?: string
          validacion_reg_id_trib?: string | null
        }
        Relationships: []
      }
      cat_registro_istmo: {
        Row: {
          clave_registro: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          id: string
        }
        Insert: {
          clave_registro: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
        }
        Update: {
          clave_registro?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
        }
        Relationships: []
      }
      cat_subtipo_remolque: {
        Row: {
          clave_subtipo: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          id: string
        }
        Insert: {
          clave_subtipo: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
        }
        Update: {
          clave_subtipo?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
        }
        Relationships: []
      }
      cat_tipo_embalaje: {
        Row: {
          clave_embalaje: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          id: string
        }
        Insert: {
          clave_embalaje: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
        }
        Update: {
          clave_embalaje?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
        }
        Relationships: []
      }
      cat_tipo_permiso: {
        Row: {
          clave_permiso: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          id: string
          transporte_carga: boolean | null
          transporte_pasajeros: boolean | null
        }
        Insert: {
          clave_permiso: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          transporte_carga?: boolean | null
          transporte_pasajeros?: boolean | null
        }
        Update: {
          clave_permiso?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
          transporte_carga?: boolean | null
          transporte_pasajeros?: boolean | null
        }
        Relationships: []
      }
      cat_via_entrada_salida: {
        Row: {
          clave_via: string
          created_at: string | null
          descripcion: string
          fecha_fin_vigencia: string | null
          fecha_inicio_vigencia: string | null
          id: string
        }
        Insert: {
          clave_via: string
          created_at?: string | null
          descripcion: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
        }
        Update: {
          clave_via?: string
          created_at?: string | null
          descripcion?: string
          fecha_fin_vigencia?: string | null
          fecha_inicio_vigencia?: string | null
          id?: string
        }
        Relationships: []
      }
      certificados_activos: {
        Row: {
          certificado_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificado_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificado_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_activos_certificado_id_fkey"
            columns: ["certificado_id"]
            isOneToOne: false
            referencedRelation: "certificados_digitales"
            referencedColumns: ["id"]
          },
        ]
      }
      certificados_digitales: {
        Row: {
          activo: boolean | null
          archivo_cer_path: string
          archivo_key_encrypted: boolean | null
          archivo_key_path: string
          created_at: string | null
          fecha_fin_vigencia: string
          fecha_inicio_vigencia: string
          id: string
          modo_pruebas: boolean | null
          nombre_certificado: string
          numero_certificado: string
          password_vault_id: string | null
          razon_social: string | null
          rfc_titular: string
          updated_at: string | null
          user_id: string
          validado: boolean | null
        }
        Insert: {
          activo?: boolean | null
          archivo_cer_path: string
          archivo_key_encrypted?: boolean | null
          archivo_key_path: string
          created_at?: string | null
          fecha_fin_vigencia: string
          fecha_inicio_vigencia: string
          id?: string
          modo_pruebas?: boolean | null
          nombre_certificado: string
          numero_certificado: string
          password_vault_id?: string | null
          razon_social?: string | null
          rfc_titular: string
          updated_at?: string | null
          user_id: string
          validado?: boolean | null
        }
        Update: {
          activo?: boolean | null
          archivo_cer_path?: string
          archivo_key_encrypted?: boolean | null
          archivo_key_path?: string
          created_at?: string | null
          fecha_fin_vigencia?: string
          fecha_inicio_vigencia?: string
          id?: string
          modo_pruebas?: boolean | null
          nombre_certificado?: string
          numero_certificado?: string
          password_vault_id?: string | null
          razon_social?: string | null
          rfc_titular?: string
          updated_at?: string | null
          user_id?: string
          validado?: boolean | null
        }
        Relationships: []
      }
      clientes_proveedores: {
        Row: {
          activo: boolean | null
          created_at: string | null
          domicilio_fiscal: Json | null
          id: string
          nombre_razon_social: string
          regimen_fiscal: string | null
          rfc: string
          tenant_id: string | null
          tipo: string | null
          updated_at: string | null
          uso_cfdi: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          domicilio_fiscal?: Json | null
          id?: string
          nombre_razon_social: string
          regimen_fiscal?: string | null
          rfc: string
          tenant_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          uso_cfdi?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          domicilio_fiscal?: Json | null
          id?: string
          nombre_razon_social?: string
          regimen_fiscal?: string | null
          rfc?: string
          tenant_id?: string | null
          tipo?: string | null
          updated_at?: string | null
          uso_cfdi?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_proveedores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      codigos_postales_mexico: {
        Row: {
          ciudad: string | null
          codigo_postal: string
          colonia: string
          created_at: string | null
          estado: string
          estado_clave: string
          id: string
          localidad: string | null
          municipio: string
          municipio_clave: string
          tipo_asentamiento: string | null
          updated_at: string | null
          zona: string | null
        }
        Insert: {
          ciudad?: string | null
          codigo_postal: string
          colonia: string
          created_at?: string | null
          estado: string
          estado_clave: string
          id?: string
          localidad?: string | null
          municipio: string
          municipio_clave: string
          tipo_asentamiento?: string | null
          updated_at?: string | null
          zona?: string | null
        }
        Update: {
          ciudad?: string | null
          codigo_postal?: string
          colonia?: string
          created_at?: string | null
          estado?: string
          estado_clave?: string
          id?: string
          localidad?: string | null
          municipio?: string
          municipio_clave?: string
          tipo_asentamiento?: string | null
          updated_at?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      conductores: {
        Row: {
          activo: boolean | null
          banco_clabe: string | null
          banco_cuenta: string | null
          certificaciones: Json | null
          contacto_emergencia_nombre: string | null
          contacto_emergencia_telefono: string | null
          created_at: string | null
          curp: string | null
          direccion: Json | null
          email: string | null
          estado: string
          fecha_proxima_disponibilidad: string | null
          foto_licencia_encrypted: string | null
          foto_licencia_encrypted_at: string | null
          foto_licencia_url: string | null
          historial_performance: Json | null
          id: string
          motivo_no_disponible: string | null
          nombre: string
          num_licencia: string | null
          num_reg_id_trib: string | null
          operador_sct: boolean | null
          porcentaje_comision: number | null
          preferencias: Json | null
          residencia_fiscal: string | null
          rfc: string | null
          salario_base: number | null
          telefono: string | null
          tipo_licencia: string | null
          ubicacion_actual: string | null
          updated_at: string | null
          user_id: string
          vehiculo_asignado_id: string | null
          viaje_actual_id: string | null
          vigencia_licencia: string | null
        }
        Insert: {
          activo?: boolean | null
          banco_clabe?: string | null
          banco_cuenta?: string | null
          certificaciones?: Json | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          created_at?: string | null
          curp?: string | null
          direccion?: Json | null
          email?: string | null
          estado?: string
          fecha_proxima_disponibilidad?: string | null
          foto_licencia_encrypted?: string | null
          foto_licencia_encrypted_at?: string | null
          foto_licencia_url?: string | null
          historial_performance?: Json | null
          id?: string
          motivo_no_disponible?: string | null
          nombre: string
          num_licencia?: string | null
          num_reg_id_trib?: string | null
          operador_sct?: boolean | null
          porcentaje_comision?: number | null
          preferencias?: Json | null
          residencia_fiscal?: string | null
          rfc?: string | null
          salario_base?: number | null
          telefono?: string | null
          tipo_licencia?: string | null
          ubicacion_actual?: string | null
          updated_at?: string | null
          user_id: string
          vehiculo_asignado_id?: string | null
          viaje_actual_id?: string | null
          vigencia_licencia?: string | null
        }
        Update: {
          activo?: boolean | null
          banco_clabe?: string | null
          banco_cuenta?: string | null
          certificaciones?: Json | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          created_at?: string | null
          curp?: string | null
          direccion?: Json | null
          email?: string | null
          estado?: string
          fecha_proxima_disponibilidad?: string | null
          foto_licencia_encrypted?: string | null
          foto_licencia_encrypted_at?: string | null
          foto_licencia_url?: string | null
          historial_performance?: Json | null
          id?: string
          motivo_no_disponible?: string | null
          nombre?: string
          num_licencia?: string | null
          num_reg_id_trib?: string | null
          operador_sct?: boolean | null
          porcentaje_comision?: number | null
          preferencias?: Json | null
          residencia_fiscal?: string | null
          rfc?: string | null
          salario_base?: number | null
          telefono?: string | null
          tipo_licencia?: string | null
          ubicacion_actual?: string | null
          updated_at?: string | null
          user_id?: string
          vehiculo_asignado_id?: string | null
          viaje_actual_id?: string | null
          vigencia_licencia?: string | null
        }
        Relationships: []
      }
      configuracion_empresa: {
        Row: {
          configuracion_completa: boolean | null
          created_at: string | null
          domicilio_fiscal: Json
          fecha_ultima_validacion: string | null
          folio_actual: number | null
          folio_actual_carta_porte: number | null
          folio_actual_factura: number | null
          folio_inicial: number | null
          folio_inicial_carta_porte: number | null
          folio_inicial_factura: number | null
          id: string
          modo_pruebas: boolean | null
          pais: string | null
          permisos_sct: Json | null
          proveedor_timbrado: string | null
          razon_social: string
          regimen_fiscal: string
          rfc_emisor: string
          seguro_ambiental: Json | null
          seguro_carga: Json | null
          seguro_resp_civil: Json | null
          serie_carta_porte: string | null
          serie_factura: string | null
          updated_at: string | null
          user_id: string
          validado_sat: boolean | null
        }
        Insert: {
          configuracion_completa?: boolean | null
          created_at?: string | null
          domicilio_fiscal?: Json
          fecha_ultima_validacion?: string | null
          folio_actual?: number | null
          folio_actual_carta_porte?: number | null
          folio_actual_factura?: number | null
          folio_inicial?: number | null
          folio_inicial_carta_porte?: number | null
          folio_inicial_factura?: number | null
          id?: string
          modo_pruebas?: boolean | null
          pais?: string | null
          permisos_sct?: Json | null
          proveedor_timbrado?: string | null
          razon_social?: string
          regimen_fiscal?: string
          rfc_emisor?: string
          seguro_ambiental?: Json | null
          seguro_carga?: Json | null
          seguro_resp_civil?: Json | null
          serie_carta_porte?: string | null
          serie_factura?: string | null
          updated_at?: string | null
          user_id: string
          validado_sat?: boolean | null
        }
        Update: {
          configuracion_completa?: boolean | null
          created_at?: string | null
          domicilio_fiscal?: Json
          fecha_ultima_validacion?: string | null
          folio_actual?: number | null
          folio_actual_carta_porte?: number | null
          folio_actual_factura?: number | null
          folio_inicial?: number | null
          folio_inicial_carta_porte?: number | null
          folio_inicial_factura?: number | null
          id?: string
          modo_pruebas?: boolean | null
          pais?: string | null
          permisos_sct?: Json | null
          proveedor_timbrado?: string | null
          razon_social?: string
          regimen_fiscal?: string
          rfc_emisor?: string
          seguro_ambiental?: Json | null
          seguro_carga?: Json | null
          seguro_resp_civil?: Json | null
          serie_carta_porte?: string | null
          serie_factura?: string | null
          updated_at?: string | null
          user_id?: string
          validado_sat?: boolean | null
        }
        Relationships: []
      }
      configuraciones_reportes: {
        Row: {
          activo: boolean
          created_at: string | null
          destinatarios: Json
          filtros: Json
          formato: string
          horario: Json
          id: string
          nombre: string
          secciones: Json
          tipo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string | null
          destinatarios?: Json
          filtros?: Json
          formato: string
          horario?: Json
          id?: string
          nombre: string
          secciones?: Json
          tipo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string | null
          destinatarios?: Json
          filtros?: Json
          formato?: string
          horario?: Json
          id?: string
          nombre?: string
          secciones?: Json
          tipo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      costos_viaje: {
        Row: {
          casetas_estimadas: number | null
          casetas_reales: number | null
          combustible_estimado: number | null
          combustible_real: number | null
          comprobantes_urls: Json | null
          costo_total_estimado: number | null
          costo_total_real: number | null
          created_at: string | null
          id: string
          mantenimiento_estimado: number | null
          mantenimiento_real: number | null
          margen_estimado: number | null
          margen_real: number | null
          notas_costos: string | null
          otros_costos_estimados: number | null
          otros_costos_reales: number | null
          peajes_estimados: number | null
          peajes_reales: number | null
          precio_cotizado: number | null
          precio_final_cobrado: number | null
          salario_conductor_estimado: number | null
          salario_conductor_real: number | null
          updated_at: string | null
          user_id: string
          viaje_id: string
        }
        Insert: {
          casetas_estimadas?: number | null
          casetas_reales?: number | null
          combustible_estimado?: number | null
          combustible_real?: number | null
          comprobantes_urls?: Json | null
          costo_total_estimado?: number | null
          costo_total_real?: number | null
          created_at?: string | null
          id?: string
          mantenimiento_estimado?: number | null
          mantenimiento_real?: number | null
          margen_estimado?: number | null
          margen_real?: number | null
          notas_costos?: string | null
          otros_costos_estimados?: number | null
          otros_costos_reales?: number | null
          peajes_estimados?: number | null
          peajes_reales?: number | null
          precio_cotizado?: number | null
          precio_final_cobrado?: number | null
          salario_conductor_estimado?: number | null
          salario_conductor_real?: number | null
          updated_at?: string | null
          user_id: string
          viaje_id: string
        }
        Update: {
          casetas_estimadas?: number | null
          casetas_reales?: number | null
          combustible_estimado?: number | null
          combustible_real?: number | null
          comprobantes_urls?: Json | null
          costo_total_estimado?: number | null
          costo_total_real?: number | null
          created_at?: string | null
          id?: string
          mantenimiento_estimado?: number | null
          mantenimiento_real?: number | null
          margen_estimado?: number | null
          margen_real?: number | null
          notas_costos?: string | null
          otros_costos_estimados?: number | null
          otros_costos_reales?: number | null
          peajes_estimados?: number | null
          peajes_reales?: number | null
          precio_cotizado?: number | null
          precio_final_cobrado?: number | null
          salario_conductor_estimado?: number | null
          salario_conductor_real?: number | null
          updated_at?: string | null
          user_id?: string
          viaje_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_costos_viaje_viaje"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      cotizaciones: {
        Row: {
          cliente_existente_id: string | null
          cliente_nuevo_datos: Json | null
          cliente_tipo: string
          condiciones_comerciales: string | null
          conductor_id: string | null
          costo_total_interno: number
          costos_internos: Json
          created_at: string
          destino: string
          distancia_total: number | null
          empresa_datos: Json
          estado: string
          fecha_aprobacion: string | null
          fecha_envio: string | null
          fecha_vencimiento: string | null
          folio_cotizacion: string
          id: string
          mapa_datos: Json | null
          margen_ganancia: number
          nombre_cotizacion: string
          notas_internas: string | null
          origen: string
          precio_cotizado: number
          remolque_id: string | null
          tiempo_estimado: number | null
          tiempo_validez_dias: number | null
          ubicaciones_intermedias: Json | null
          updated_at: string
          user_id: string
          vehiculo_id: string | null
        }
        Insert: {
          cliente_existente_id?: string | null
          cliente_nuevo_datos?: Json | null
          cliente_tipo?: string
          condiciones_comerciales?: string | null
          conductor_id?: string | null
          costo_total_interno?: number
          costos_internos?: Json
          created_at?: string
          destino: string
          distancia_total?: number | null
          empresa_datos?: Json
          estado?: string
          fecha_aprobacion?: string | null
          fecha_envio?: string | null
          fecha_vencimiento?: string | null
          folio_cotizacion?: string
          id?: string
          mapa_datos?: Json | null
          margen_ganancia?: number
          nombre_cotizacion: string
          notas_internas?: string | null
          origen: string
          precio_cotizado?: number
          remolque_id?: string | null
          tiempo_estimado?: number | null
          tiempo_validez_dias?: number | null
          ubicaciones_intermedias?: Json | null
          updated_at?: string
          user_id: string
          vehiculo_id?: string | null
        }
        Update: {
          cliente_existente_id?: string | null
          cliente_nuevo_datos?: Json | null
          cliente_tipo?: string
          condiciones_comerciales?: string | null
          conductor_id?: string | null
          costo_total_interno?: number
          costos_internos?: Json
          created_at?: string
          destino?: string
          distancia_total?: number | null
          empresa_datos?: Json
          estado?: string
          fecha_aprobacion?: string | null
          fecha_envio?: string | null
          fecha_vencimiento?: string | null
          folio_cotizacion?: string
          id?: string
          mapa_datos?: Json | null
          margen_ganancia?: number
          nombre_cotizacion?: string
          notas_internas?: string | null
          origen?: string
          precio_cotizado?: number
          remolque_id?: string | null
          tiempo_estimado?: number | null
          tiempo_validez_dias?: number | null
          ubicaciones_intermedias?: Json | null
          updated_at?: string
          user_id?: string
          vehiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cotizaciones_cliente_existente_id_fkey"
            columns: ["cliente_existente_id"]
            isOneToOne: false
            referencedRelation: "clientes_proveedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cotizaciones_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      creditos_usuarios: {
        Row: {
          balance_disponible: number
          created_at: string | null
          fecha_renovacion: string | null
          id: string
          timbres_mes_actual: number | null
          total_comprados: number
          total_consumidos: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance_disponible?: number
          created_at?: string | null
          fecha_renovacion?: string | null
          id?: string
          timbres_mes_actual?: number | null
          total_comprados?: number
          total_consumidos?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance_disponible?: number
          created_at?: string | null
          fecha_renovacion?: string | null
          id?: string
          timbres_mes_actual?: number | null
          total_comprados?: number
          total_consumidos?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_deletion_audit: {
        Row: {
          created_at: string
          deletion_completed_at: string | null
          deletion_requested_at: string
          error_message: string | null
          executed_by: string | null
          id: string
          metadata: Json | null
          records_anonymized: number | null
          records_deleted: number | null
          status: string
          tables_affected: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deletion_completed_at?: string | null
          deletion_requested_at?: string
          error_message?: string | null
          executed_by?: string | null
          id?: string
          metadata?: Json | null
          records_anonymized?: number | null
          records_deleted?: number | null
          status?: string
          tables_affected?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deletion_completed_at?: string | null
          deletion_requested_at?: string
          error_message?: string | null
          executed_by?: string | null
          id?: string
          metadata?: Json | null
          records_anonymized?: number | null
          records_deleted?: number | null
          status?: string
          tables_affected?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documentacion_aduanera: {
        Row: {
          aduana_despacho: string | null
          created_at: string | null
          fecha_expedicion: string | null
          folio_documento: string
          id: string
          mercancia_id: string | null
          rfc_importador: string | null
          tipo_documento: string
        }
        Insert: {
          aduana_despacho?: string | null
          created_at?: string | null
          fecha_expedicion?: string | null
          folio_documento: string
          id?: string
          mercancia_id?: string | null
          rfc_importador?: string | null
          tipo_documento: string
        }
        Update: {
          aduana_despacho?: string | null
          created_at?: string | null
          fecha_expedicion?: string | null
          folio_documento?: string
          id?: string
          mercancia_id?: string | null
          rfc_importador?: string | null
          tipo_documento?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentacion_aduanera_mercancia_id_fkey"
            columns: ["mercancia_id"]
            isOneToOne: false
            referencedRelation: "mercancias"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_entidades: {
        Row: {
          activo: boolean
          created_at: string
          entidad_id: string
          entidad_tipo: string
          fecha_vencimiento: string | null
          id: string
          nombre_archivo: string
          ruta_archivo: string
          tipo_documento: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          entidad_id: string
          entidad_tipo: string
          fecha_vencimiento?: string | null
          id?: string
          nombre_archivo: string
          ruta_archivo: string
          tipo_documento: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          entidad_id?: string
          entidad_tipo?: string
          fecha_vencimiento?: string | null
          id?: string
          nombre_archivo?: string
          ruta_archivo?: string
          tipo_documento?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documentos_procesados: {
        Row: {
          carta_porte_id: string | null
          confidence: number
          created_at: string
          document_type: string
          documento_original_id: string | null
          errors: string | null
          extracted_text: string | null
          file_path: string
          id: string
          mercancias_count: number
          metadata: Json | null
          user_id: string
        }
        Insert: {
          carta_porte_id?: string | null
          confidence?: number
          created_at?: string
          document_type: string
          documento_original_id?: string | null
          errors?: string | null
          extracted_text?: string | null
          file_path: string
          id?: string
          mercancias_count?: number
          metadata?: Json | null
          user_id: string
        }
        Update: {
          carta_porte_id?: string | null
          confidence?: number
          created_at?: string
          document_type?: string
          documento_original_id?: string | null
          errors?: string | null
          extracted_text?: string | null
          file_path?: string
          id?: string
          mercancias_count?: number
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      esquemas_xml_sat: {
        Row: {
          activo: boolean | null
          campos_opcionales: Json | null
          campos_requeridos: Json | null
          created_at: string | null
          descripcion: string | null
          id: string
          tipo_documento: string
          tipo_operacion: string | null
          tipo_transporte: string
          updated_at: string | null
          version_carta_porte: string
          version_cfdi: string
          xml_ejemplo: string
        }
        Insert: {
          activo?: boolean | null
          campos_opcionales?: Json | null
          campos_requeridos?: Json | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          tipo_documento: string
          tipo_operacion?: string | null
          tipo_transporte: string
          updated_at?: string | null
          version_carta_porte?: string
          version_cfdi?: string
          xml_ejemplo: string
        }
        Update: {
          activo?: boolean | null
          campos_opcionales?: Json | null
          campos_requeridos?: Json | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          tipo_documento?: string
          tipo_operacion?: string | null
          tipo_transporte?: string
          updated_at?: string | null
          version_carta_porte?: string
          version_cfdi?: string
          xml_ejemplo?: string
        }
        Relationships: []
      }
      eventos_calendario: {
        Row: {
          carta_porte_id: string | null
          created_at: string | null
          descripcion: string | null
          fecha_fin: string
          fecha_inicio: string
          google_event_id: string | null
          id: string
          metadata: Json | null
          tipo_evento: string
          titulo: string
          ubicacion_destino: string | null
          ubicacion_origen: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          carta_porte_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_fin: string
          fecha_inicio: string
          google_event_id?: string | null
          id?: string
          metadata?: Json | null
          tipo_evento?: string
          titulo: string
          ubicacion_destino?: string | null
          ubicacion_origen?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          carta_porte_id?: string | null
          created_at?: string | null
          descripcion?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          google_event_id?: string | null
          id?: string
          metadata?: Json | null
          tipo_evento?: string
          titulo?: string
          ubicacion_destino?: string | null
          ubicacion_origen?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_calendario_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos_viaje: {
        Row: {
          automatico: boolean
          coordenadas: Json | null
          descripcion: string
          id: string
          metadata: Json | null
          timestamp: string
          tipo_evento: string
          ubicacion: string | null
          viaje_id: string
        }
        Insert: {
          automatico?: boolean
          coordenadas?: Json | null
          descripcion: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          tipo_evento: string
          ubicacion?: string | null
          viaje_id: string
        }
        Update: {
          automatico?: boolean
          coordenadas?: Json | null
          descripcion?: string
          id?: string
          metadata?: Json | null
          timestamp?: string
          tipo_evento?: string
          ubicacion?: string | null
          viaje_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_viaje_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      facturas: {
        Row: {
          cadena_original: string | null
          carta_porte_id: string | null
          certificado_sat: string | null
          created_at: string | null
          descuento: number | null
          domicilio_fiscal_receptor: string | null
          fecha_cancelacion: string | null
          fecha_expedicion: string
          fecha_timbrado: string | null
          folio: string | null
          forma_pago: string
          id: string
          metadata: Json | null
          metodo_pago: string
          moneda: string | null
          motivo_cancelacion: string | null
          nombre_emisor: string
          nombre_receptor: string
          notas: string | null
          pdf_url: string | null
          regimen_fiscal_emisor: string | null
          regimen_fiscal_receptor: string
          rfc_emisor: string
          rfc_receptor: string
          sello_digital: string | null
          sello_sat: string | null
          serie: string | null
          status: string | null
          subtotal: number
          tiene_carta_porte: boolean | null
          tiene_pago: boolean | null
          tipo_cambio: number | null
          tipo_comprobante: string | null
          total: number
          total_impuestos_retenidos: number | null
          total_impuestos_trasladados: number | null
          updated_at: string | null
          user_id: string
          uso_cfdi: string | null
          uuid_fiscal: string | null
          viaje_id: string | null
          xml_generado: string | null
          xml_url: string | null
        }
        Insert: {
          cadena_original?: string | null
          carta_porte_id?: string | null
          certificado_sat?: string | null
          created_at?: string | null
          descuento?: number | null
          domicilio_fiscal_receptor?: string | null
          fecha_cancelacion?: string | null
          fecha_expedicion?: string
          fecha_timbrado?: string | null
          folio?: string | null
          forma_pago?: string
          id?: string
          metadata?: Json | null
          metodo_pago?: string
          moneda?: string | null
          motivo_cancelacion?: string | null
          nombre_emisor: string
          nombre_receptor: string
          notas?: string | null
          pdf_url?: string | null
          regimen_fiscal_emisor?: string | null
          regimen_fiscal_receptor?: string
          rfc_emisor: string
          rfc_receptor: string
          sello_digital?: string | null
          sello_sat?: string | null
          serie?: string | null
          status?: string | null
          subtotal?: number
          tiene_carta_porte?: boolean | null
          tiene_pago?: boolean | null
          tipo_cambio?: number | null
          tipo_comprobante?: string | null
          total?: number
          total_impuestos_retenidos?: number | null
          total_impuestos_trasladados?: number | null
          updated_at?: string | null
          user_id: string
          uso_cfdi?: string | null
          uuid_fiscal?: string | null
          viaje_id?: string | null
          xml_generado?: string | null
          xml_url?: string | null
        }
        Update: {
          cadena_original?: string | null
          carta_porte_id?: string | null
          certificado_sat?: string | null
          created_at?: string | null
          descuento?: number | null
          domicilio_fiscal_receptor?: string | null
          fecha_cancelacion?: string | null
          fecha_expedicion?: string
          fecha_timbrado?: string | null
          folio?: string | null
          forma_pago?: string
          id?: string
          metadata?: Json | null
          metodo_pago?: string
          moneda?: string | null
          motivo_cancelacion?: string | null
          nombre_emisor?: string
          nombre_receptor?: string
          notas?: string | null
          pdf_url?: string | null
          regimen_fiscal_emisor?: string | null
          regimen_fiscal_receptor?: string
          rfc_emisor?: string
          rfc_receptor?: string
          sello_digital?: string | null
          sello_sat?: string | null
          serie?: string | null
          status?: string | null
          subtotal?: number
          tiene_carta_porte?: boolean | null
          tiene_pago?: boolean | null
          tipo_cambio?: number | null
          tipo_comprobante?: string | null
          total?: number
          total_impuestos_retenidos?: number | null
          total_impuestos_trasladados?: number | null
          updated_at?: string | null
          user_id?: string
          uso_cfdi?: string | null
          uuid_fiscal?: string | null
          viaje_id?: string | null
          xml_generado?: string | null
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facturas_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_facturas_viaje"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      figuras_frecuentes: {
        Row: {
          created_at: string | null
          datos_adicionales: Json | null
          domicilio: Json | null
          id: string
          nombre_figura: string | null
          num_licencia: string | null
          rfc_figura: string | null
          tenant_id: string | null
          tipo_figura: string | null
          updated_at: string | null
          uso_count: number | null
        }
        Insert: {
          created_at?: string | null
          datos_adicionales?: Json | null
          domicilio?: Json | null
          id?: string
          nombre_figura?: string | null
          num_licencia?: string | null
          rfc_figura?: string | null
          tenant_id?: string | null
          tipo_figura?: string | null
          updated_at?: string | null
          uso_count?: number | null
        }
        Update: {
          created_at?: string | null
          datos_adicionales?: Json | null
          domicilio?: Json | null
          id?: string
          nombre_figura?: string | null
          num_licencia?: string | null
          rfc_figura?: string | null
          tenant_id?: string | null
          tipo_figura?: string | null
          updated_at?: string | null
          uso_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "figuras_frecuentes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      figuras_transporte: {
        Row: {
          carta_porte_id: string | null
          created_at: string | null
          curp: string | null
          domicilio: Json | null
          id: string
          nombre_figura: string | null
          num_licencia: string | null
          num_reg_id_trib_figura: string | null
          operador_sct: boolean | null
          residencia_fiscal_figura: string | null
          rfc_figura: string | null
          tipo_figura: string | null
          tipo_licencia: string | null
          vigencia_licencia: string | null
        }
        Insert: {
          carta_porte_id?: string | null
          created_at?: string | null
          curp?: string | null
          domicilio?: Json | null
          id?: string
          nombre_figura?: string | null
          num_licencia?: string | null
          num_reg_id_trib_figura?: string | null
          operador_sct?: boolean | null
          residencia_fiscal_figura?: string | null
          rfc_figura?: string | null
          tipo_figura?: string | null
          tipo_licencia?: string | null
          vigencia_licencia?: string | null
        }
        Update: {
          carta_porte_id?: string | null
          created_at?: string | null
          curp?: string | null
          domicilio?: Json | null
          id?: string
          nombre_figura?: string | null
          num_licencia?: string | null
          num_reg_id_trib_figura?: string | null
          operador_sct?: boolean | null
          residencia_fiscal_figura?: string | null
          rfc_figura?: string | null
          tipo_figura?: string | null
          tipo_licencia?: string | null
          vigencia_licencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "figuras_transporte_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_cotizaciones: {
        Row: {
          cambiado_por: string
          comentarios: string | null
          cotizacion_id: string
          estado_anterior: string | null
          estado_nuevo: string
          fecha_cambio: string
          id: string
        }
        Insert: {
          cambiado_por: string
          comentarios?: string | null
          cotizacion_id: string
          estado_anterior?: string | null
          estado_nuevo: string
          fecha_cambio?: string
          id?: string
        }
        Update: {
          cambiado_por?: string
          comentarios?: string | null
          cotizacion_id?: string
          estado_anterior?: string | null
          estado_nuevo?: string
          fecha_cambio?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historial_cotizaciones_cotizacion_id_fkey"
            columns: ["cotizacion_id"]
            isOneToOne: false
            referencedRelation: "cotizaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_estados: {
        Row: {
          automatico: boolean
          cambiado_por: string | null
          entidad_id: string
          entidad_tipo: string
          estado_anterior: string | null
          estado_nuevo: string
          fecha_cambio: string
          id: string
          motivo: string | null
          observaciones: string | null
          user_id: string
        }
        Insert: {
          automatico?: boolean
          cambiado_por?: string | null
          entidad_id: string
          entidad_tipo: string
          estado_anterior?: string | null
          estado_nuevo: string
          fecha_cambio?: string
          id?: string
          motivo?: string | null
          observaciones?: string | null
          user_id: string
        }
        Update: {
          automatico?: boolean
          cambiado_por?: string | null
          entidad_id?: string
          entidad_tipo?: string
          estado_anterior?: string | null
          estado_nuevo?: string
          fecha_cambio?: string
          id?: string
          motivo?: string | null
          observaciones?: string | null
          user_id?: string
        }
        Relationships: []
      }
      indices_backup: {
        Row: {
          created_at: string | null
          id: string
          index_definition: string
          index_name: string
          table_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          index_definition: string
          index_name: string
          table_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          index_definition?: string
          index_name?: string
          table_name?: string
        }
        Relationships: []
      }
      mantenimientos_programados: {
        Row: {
          costo_estimado: number | null
          costo_real: number | null
          created_at: string | null
          descripcion: string
          documentos: Json | null
          estado: string | null
          fecha_programada: string
          fecha_realizada: string | null
          id: string
          kilometraje_actual: number | null
          kilometraje_programado: number | null
          notas: string | null
          proximidad_alerta: number | null
          taller_id: string | null
          tipo_mantenimiento: string
          updated_at: string | null
          user_id: string
          vehiculo_id: string | null
        }
        Insert: {
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string | null
          descripcion: string
          documentos?: Json | null
          estado?: string | null
          fecha_programada: string
          fecha_realizada?: string | null
          id?: string
          kilometraje_actual?: number | null
          kilometraje_programado?: number | null
          notas?: string | null
          proximidad_alerta?: number | null
          taller_id?: string | null
          tipo_mantenimiento: string
          updated_at?: string | null
          user_id: string
          vehiculo_id?: string | null
        }
        Update: {
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string | null
          descripcion?: string
          documentos?: Json | null
          estado?: string | null
          fecha_programada?: string
          fecha_realizada?: string | null
          id?: string
          kilometraje_actual?: number | null
          kilometraje_programado?: number | null
          notas?: string | null
          proximidad_alerta?: number | null
          taller_id?: string | null
          tipo_mantenimiento?: string
          updated_at?: string | null
          user_id?: string
          vehiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mantenimientos_programados_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      mercancias: {
        Row: {
          bienes_transp: string
          cantidad: number | null
          carta_porte_id: string | null
          clave_unidad: string | null
          created_at: string | null
          cve_material_peligroso: string | null
          descripcion: string | null
          descripcion_detallada: string | null
          dimensiones: Json | null
          documentacion_aduanera: Json | null
          embalaje: string | null
          especie_protegida: boolean | null
          estado: string | null
          fraccion_arancelaria: string | null
          id: string
          material_peligroso: boolean | null
          moneda: string | null
          numero_piezas: number | null
          peso_bruto_total: number | null
          peso_kg: number | null
          peso_neto_total: number | null
          regimen_aduanero: string | null
          requiere_cites: boolean | null
          tipo_embalaje: string | null
          unidad_peso_bruto: string | null
          uuid_comercio_ext: string | null
          valor_mercancia: number | null
          viaje_id: string | null
        }
        Insert: {
          bienes_transp: string
          cantidad?: number | null
          carta_porte_id?: string | null
          clave_unidad?: string | null
          created_at?: string | null
          cve_material_peligroso?: string | null
          descripcion?: string | null
          descripcion_detallada?: string | null
          dimensiones?: Json | null
          documentacion_aduanera?: Json | null
          embalaje?: string | null
          especie_protegida?: boolean | null
          estado?: string | null
          fraccion_arancelaria?: string | null
          id?: string
          material_peligroso?: boolean | null
          moneda?: string | null
          numero_piezas?: number | null
          peso_bruto_total?: number | null
          peso_kg?: number | null
          peso_neto_total?: number | null
          regimen_aduanero?: string | null
          requiere_cites?: boolean | null
          tipo_embalaje?: string | null
          unidad_peso_bruto?: string | null
          uuid_comercio_ext?: string | null
          valor_mercancia?: number | null
          viaje_id?: string | null
        }
        Update: {
          bienes_transp?: string
          cantidad?: number | null
          carta_porte_id?: string | null
          clave_unidad?: string | null
          created_at?: string | null
          cve_material_peligroso?: string | null
          descripcion?: string | null
          descripcion_detallada?: string | null
          dimensiones?: Json | null
          documentacion_aduanera?: Json | null
          embalaje?: string | null
          especie_protegida?: boolean | null
          estado?: string | null
          fraccion_arancelaria?: string | null
          id?: string
          material_peligroso?: boolean | null
          moneda?: string | null
          numero_piezas?: number | null
          peso_bruto_total?: number | null
          peso_kg?: number | null
          peso_neto_total?: number | null
          regimen_aduanero?: string | null
          requiere_cites?: boolean | null
          tipo_embalaje?: string | null
          unidad_peso_bruto?: string | null
          uuid_comercio_ext?: string | null
          valor_mercancia?: number | null
          viaje_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mercancias_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mercancias_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      metricas_conductor: {
        Row: {
          combustible_consumido: number | null
          conductor_id: string | null
          costo_total: number | null
          created_at: string | null
          entregas_a_tiempo: number | null
          fecha: string
          id: string
          incidentes: number | null
          ingresos_total: number | null
          km_recorridos: number | null
          tiempo_conduccion_horas: number | null
          total_entregas: number | null
          user_id: string
          viajes_completados: number | null
        }
        Insert: {
          combustible_consumido?: number | null
          conductor_id?: string | null
          costo_total?: number | null
          created_at?: string | null
          entregas_a_tiempo?: number | null
          fecha: string
          id?: string
          incidentes?: number | null
          ingresos_total?: number | null
          km_recorridos?: number | null
          tiempo_conduccion_horas?: number | null
          total_entregas?: number | null
          user_id: string
          viajes_completados?: number | null
        }
        Update: {
          combustible_consumido?: number | null
          conductor_id?: string | null
          costo_total?: number | null
          created_at?: string | null
          entregas_a_tiempo?: number | null
          fecha?: string
          id?: string
          incidentes?: number | null
          ingresos_total?: number | null
          km_recorridos?: number | null
          tiempo_conduccion_horas?: number | null
          total_entregas?: number | null
          user_id?: string
          viajes_completados?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metricas_conductor_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          created_at: string | null
          id: string
          leida: boolean | null
          mensaje: string
          metadata: Json | null
          tipo: string
          titulo: string
          urgente: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leida?: boolean | null
          mensaje: string
          metadata?: Json | null
          tipo: string
          titulo: string
          urgente?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leida?: boolean | null
          mensaje?: string
          metadata?: Json | null
          tipo?: string
          titulo?: string
          urgente?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      pagos: {
        Row: {
          created_at: string | null
          factura_url: string | null
          fecha_pago: string | null
          id: string
          metodo_pago: string | null
          moneda: string | null
          monto: number
          periodo_fin: string | null
          periodo_inicio: string | null
          status: string
          stripe_payment_intent_id: string | null
          suscripcion_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          factura_url?: string | null
          fecha_pago?: string | null
          id?: string
          metodo_pago?: string | null
          moneda?: string | null
          monto: number
          periodo_fin?: string | null
          periodo_inicio?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          suscripcion_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          factura_url?: string | null
          fecha_pago?: string | null
          id?: string
          metodo_pago?: string | null
          moneda?: string | null
          monto?: number
          periodo_fin?: string | null
          periodo_inicio?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          suscripcion_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagos_suscripcion_id_fkey"
            columns: ["suscripcion_id"]
            isOneToOne: false
            referencedRelation: "suscripciones"
            referencedColumns: ["id"]
          },
        ]
      }
      paquetes_creditos: {
        Row: {
          activo: boolean | null
          cantidad_creditos: number
          created_at: string | null
          descripcion: string | null
          descuento_porcentaje: number | null
          id: string
          nombre: string
          orden: number | null
          precio_mxn: number
          precio_por_credito: number
        }
        Insert: {
          activo?: boolean | null
          cantidad_creditos: number
          created_at?: string | null
          descripcion?: string | null
          descuento_porcentaje?: number | null
          id?: string
          nombre: string
          orden?: number | null
          precio_mxn: number
          precio_por_credito: number
        }
        Update: {
          activo?: boolean | null
          cantidad_creditos?: number
          created_at?: string | null
          descripcion?: string | null
          descuento_porcentaje?: number | null
          id?: string
          nombre?: string
          orden?: number | null
          precio_mxn?: number
          precio_por_credito?: number
        }
        Relationships: []
      }
      permisos_semarnat: {
        Row: {
          autoridad_expedidora: string | null
          created_at: string | null
          fecha_expedicion: string
          fecha_vencimiento: string
          id: string
          mercancia_id: string | null
          numero_permiso: string
          observaciones: string | null
          tipo_permiso: string
          vigente: boolean | null
        }
        Insert: {
          autoridad_expedidora?: string | null
          created_at?: string | null
          fecha_expedicion: string
          fecha_vencimiento: string
          id?: string
          mercancia_id?: string | null
          numero_permiso: string
          observaciones?: string | null
          tipo_permiso: string
          vigente?: boolean | null
        }
        Update: {
          autoridad_expedidora?: string | null
          created_at?: string | null
          fecha_expedicion?: string
          fecha_vencimiento?: string
          id?: string
          mercancia_id?: string | null
          numero_permiso?: string
          observaciones?: string | null
          tipo_permiso?: string
          vigente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "permisos_semarnat_mercancia_id_fkey"
            columns: ["mercancia_id"]
            isOneToOne: false
            referencedRelation: "mercancias"
            referencedColumns: ["id"]
          },
        ]
      }
      planes_suscripcion: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          dias_prueba: number | null
          id: string
          limite_almacenamiento_gb: number | null
          limite_cartas_porte: number | null
          limite_conductores: number | null
          limite_socios: number | null
          limite_vehiculos: number | null
          nombre: string
          precio_anual: number | null
          precio_mensual: number
          puede_acceder_administracion: boolean | null
          puede_acceder_enterprise: boolean | null
          puede_acceder_funciones_avanzadas: boolean | null
          puede_cancelar_cfdi: boolean | null
          puede_generar_xml: boolean | null
          puede_timbrar: boolean | null
          puede_tracking: boolean | null
          timbres_mensuales: number | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          dias_prueba?: number | null
          id?: string
          limite_almacenamiento_gb?: number | null
          limite_cartas_porte?: number | null
          limite_conductores?: number | null
          limite_socios?: number | null
          limite_vehiculos?: number | null
          nombre: string
          precio_anual?: number | null
          precio_mensual: number
          puede_acceder_administracion?: boolean | null
          puede_acceder_enterprise?: boolean | null
          puede_acceder_funciones_avanzadas?: boolean | null
          puede_cancelar_cfdi?: boolean | null
          puede_generar_xml?: boolean | null
          puede_timbrar?: boolean | null
          puede_tracking?: boolean | null
          timbres_mensuales?: number | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          dias_prueba?: number | null
          id?: string
          limite_almacenamiento_gb?: number | null
          limite_cartas_porte?: number | null
          limite_conductores?: number | null
          limite_socios?: number | null
          limite_vehiculos?: number | null
          nombre?: string
          precio_anual?: number | null
          precio_mensual?: number
          puede_acceder_administracion?: boolean | null
          puede_acceder_enterprise?: boolean | null
          puede_acceder_funciones_avanzadas?: boolean | null
          puede_cancelar_cfdi?: boolean | null
          puede_generar_xml?: boolean | null
          puede_timbrar?: boolean | null
          puede_tracking?: boolean | null
          timbres_mensuales?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      plantillas_carta_porte: {
        Row: {
          created_at: string | null
          descripcion: string | null
          es_publica: boolean | null
          id: string
          nombre: string
          template_data: Json | null
          tenant_id: string | null
          updated_at: string | null
          uso_count: number | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          es_publica?: boolean | null
          id?: string
          nombre: string
          template_data?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          uso_count?: number | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          es_publica?: boolean | null
          id?: string
          nombre?: string
          template_data?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          uso_count?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plantillas_carta_porte_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plantillas_carta_porte_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cartas_porte_creadas: number | null
          configuracion_calendario: Json | null
          configuracion_costos: Json | null
          created_at: string | null
          email: string
          empresa: string | null
          google_onboarding_completed: boolean | null
          id: string
          nombre: string
          plan_suscripcion: string | null
          plan_type: string | null
          rfc: string | null
          telefono: string | null
          timbres_consumidos: number | null
          timezone: string | null
          trial_end_date: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cartas_porte_creadas?: number | null
          configuracion_calendario?: Json | null
          configuracion_costos?: Json | null
          created_at?: string | null
          email: string
          empresa?: string | null
          google_onboarding_completed?: boolean | null
          id: string
          nombre: string
          plan_suscripcion?: string | null
          plan_type?: string | null
          rfc?: string | null
          telefono?: string | null
          timbres_consumidos?: number | null
          timezone?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cartas_porte_creadas?: number | null
          configuracion_calendario?: Json | null
          configuracion_costos?: Json | null
          created_at?: string | null
          email?: string
          empresa?: string | null
          google_onboarding_completed?: boolean | null
          id?: string
          nombre?: string
          plan_suscripcion?: string | null
          plan_type?: string | null
          rfc?: string | null
          telefono?: string | null
          timbres_consumidos?: number | null
          timezone?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programaciones: {
        Row: {
          costo: number | null
          created_at: string
          descripcion: string
          entidad_id: string
          entidad_tipo: string
          estado: string
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          observaciones: string | null
          proveedor: string | null
          sin_fecha_fin: boolean
          tipo_programacion: string
          updated_at: string
          user_id: string
        }
        Insert: {
          costo?: number | null
          created_at?: string
          descripcion: string
          entidad_id: string
          entidad_tipo: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          observaciones?: string | null
          proveedor?: string | null
          sin_fecha_fin?: boolean
          tipo_programacion: string
          updated_at?: string
          user_id: string
        }
        Update: {
          costo?: number | null
          created_at?: string
          descripcion?: string
          entidad_id?: string
          entidad_tipo?: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          observaciones?: string | null
          proveedor?: string | null
          sin_fecha_fin?: boolean
          tipo_programacion?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limit_log: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          identifier: string
          metadata: Json | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          identifier: string
          metadata?: Json | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          identifier?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      regimenes_aduaneros: {
        Row: {
          carta_porte_id: string | null
          clave_regimen: string
          created_at: string | null
          descripcion: string | null
          id: string
          orden_secuencia: number | null
        }
        Insert: {
          carta_porte_id?: string | null
          clave_regimen: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          orden_secuencia?: number | null
        }
        Update: {
          carta_porte_id?: string | null
          clave_regimen?: string
          created_at?: string | null
          descripcion?: string | null
          id?: string
          orden_secuencia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "regimenes_aduaneros_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
        ]
      }
      remolques: {
        Row: {
          activo: boolean | null
          autotransporte_id: string | null
          capacidad_carga: number | null
          created_at: string | null
          estado: string | null
          fecha_proxima_disponibilidad: string | null
          id: string
          permiso_sct_encrypted: string | null
          permiso_sct_encrypted_at: string | null
          placa: string | null
          subtipo_rem: string | null
          tarjeta_circulacion_encrypted: string | null
          tarjeta_circulacion_encrypted_at: string | null
          tipo_remolque: string | null
          updated_at: string | null
          user_id: string | null
          viaje_actual_id: string | null
        }
        Insert: {
          activo?: boolean | null
          autotransporte_id?: string | null
          capacidad_carga?: number | null
          created_at?: string | null
          estado?: string | null
          fecha_proxima_disponibilidad?: string | null
          id?: string
          permiso_sct_encrypted?: string | null
          permiso_sct_encrypted_at?: string | null
          placa?: string | null
          subtipo_rem?: string | null
          tarjeta_circulacion_encrypted?: string | null
          tarjeta_circulacion_encrypted_at?: string | null
          tipo_remolque?: string | null
          updated_at?: string | null
          user_id?: string | null
          viaje_actual_id?: string | null
        }
        Update: {
          activo?: boolean | null
          autotransporte_id?: string | null
          capacidad_carga?: number | null
          created_at?: string | null
          estado?: string | null
          fecha_proxima_disponibilidad?: string | null
          id?: string
          permiso_sct_encrypted?: string | null
          permiso_sct_encrypted_at?: string | null
          placa?: string | null
          subtipo_rem?: string | null
          tarjeta_circulacion_encrypted?: string | null
          tarjeta_circulacion_encrypted_at?: string | null
          tipo_remolque?: string | null
          updated_at?: string | null
          user_id?: string | null
          viaje_actual_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remolques_autotransporte_id_fkey"
            columns: ["autotransporte_id"]
            isOneToOne: false
            referencedRelation: "autotransporte"
            referencedColumns: ["id"]
          },
        ]
      }
      remolques_ccp: {
        Row: {
          autotransporte_id: string | null
          created_at: string | null
          id: string
          placa: string
          subtipo_rem: string
          user_id: string | null
        }
        Insert: {
          autotransporte_id?: string | null
          created_at?: string | null
          id?: string
          placa: string
          subtipo_rem: string
          user_id?: string | null
        }
        Update: {
          autotransporte_id?: string | null
          created_at?: string | null
          id?: string
          placa?: string
          subtipo_rem?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remolques_ccp_autotransporte_id_fkey"
            columns: ["autotransporte_id"]
            isOneToOne: false
            referencedRelation: "autotransporte"
            referencedColumns: ["id"]
          },
        ]
      }
      reportes_generados: {
        Row: {
          archivo_url: string | null
          configuracion_id: string
          created_at: string | null
          destinatarios_enviados: Json
          error_mensaje: string | null
          estado: string
          fecha_generacion: string
          formato: string
          id: string
          tipo: string
          user_id: string
        }
        Insert: {
          archivo_url?: string | null
          configuracion_id: string
          created_at?: string | null
          destinatarios_enviados?: Json
          error_mensaje?: string | null
          estado: string
          fecha_generacion?: string
          formato: string
          id?: string
          tipo: string
          user_id: string
        }
        Update: {
          archivo_url?: string | null
          configuracion_id?: string
          created_at?: string | null
          destinatarios_enviados?: Json
          error_mensaje?: string | null
          estado?: string
          fecha_generacion?: string
          formato?: string
          id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reportes_generados_configuracion_id_fkey"
            columns: ["configuracion_id"]
            isOneToOne: false
            referencedRelation: "configuraciones_reportes"
            referencedColumns: ["id"]
          },
        ]
      }
      restricciones_urbanas: {
        Row: {
          activa: boolean | null
          altura_maxima: number | null
          aplica_configuraciones: string[] | null
          ciudad: string
          created_at: string | null
          descripcion: string
          dias_semana: number[] | null
          estado: string
          horario_fin: string | null
          horario_inicio: string | null
          id: string
          multa_promedio: number | null
          peso_maximo: number | null
          tipo_restriccion: string
          updated_at: string | null
          vigencia_desde: string
          vigencia_hasta: string | null
        }
        Insert: {
          activa?: boolean | null
          altura_maxima?: number | null
          aplica_configuraciones?: string[] | null
          ciudad: string
          created_at?: string | null
          descripcion: string
          dias_semana?: number[] | null
          estado: string
          horario_fin?: string | null
          horario_inicio?: string | null
          id?: string
          multa_promedio?: number | null
          peso_maximo?: number | null
          tipo_restriccion: string
          updated_at?: string | null
          vigencia_desde?: string
          vigencia_hasta?: string | null
        }
        Update: {
          activa?: boolean | null
          altura_maxima?: number | null
          aplica_configuraciones?: string[] | null
          ciudad?: string
          created_at?: string | null
          descripcion?: string
          dias_semana?: number[] | null
          estado?: string
          horario_fin?: string | null
          horario_inicio?: string | null
          id?: string
          multa_promedio?: number | null
          peso_maximo?: number | null
          tipo_restriccion?: string
          updated_at?: string | null
          vigencia_desde?: string
          vigencia_hasta?: string | null
        }
        Relationships: []
      }
      reviews_talleres: {
        Row: {
          aspectos_calificados: Json | null
          calificacion: number | null
          comentario: string | null
          created_at: string | null
          id: string
          mantenimiento_id: string | null
          taller_id: string | null
          user_id: string
        }
        Insert: {
          aspectos_calificados?: Json | null
          calificacion?: number | null
          comentario?: string | null
          created_at?: string | null
          id?: string
          mantenimiento_id?: string | null
          taller_id?: string | null
          user_id: string
        }
        Update: {
          aspectos_calificados?: Json | null
          calificacion?: number | null
          comentario?: string | null
          created_at?: string | null
          id?: string
          mantenimiento_id?: string | null
          taller_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_talleres_mantenimiento_id_fkey"
            columns: ["mantenimiento_id"]
            isOneToOne: false
            referencedRelation: "mantenimientos_programados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_talleres_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "talleres"
            referencedColumns: ["id"]
          },
        ]
      }
      rfc_pruebas_sat: {
        Row: {
          codigo_postal: string
          created_at: string | null
          descripcion: string | null
          nombre: string
          regimen_fiscal: string
          rfc: string
          tipo: string
        }
        Insert: {
          codigo_postal: string
          created_at?: string | null
          descripcion?: string | null
          nombre: string
          regimen_fiscal: string
          rfc: string
          tipo: string
        }
        Update: {
          codigo_postal?: string
          created_at?: string | null
          descripcion?: string | null
          nombre?: string
          regimen_fiscal?: string
          rfc?: string
          tipo?: string
        }
        Relationships: []
      }
      rfc_validados_sat: {
        Row: {
          ambiente: string
          fecha_expiracion: string
          fecha_validacion: string
          metadata: Json | null
          numero_validaciones: number | null
          razon_social_normalizada: string
          razon_social_sat: string
          regimen_fiscal: string | null
          rfc: string
          situacion: string | null
          ultima_actualizacion: string
        }
        Insert: {
          ambiente: string
          fecha_expiracion?: string
          fecha_validacion?: string
          metadata?: Json | null
          numero_validaciones?: number | null
          razon_social_normalizada: string
          razon_social_sat: string
          regimen_fiscal?: string | null
          rfc: string
          situacion?: string | null
          ultima_actualizacion?: string
        }
        Update: {
          ambiente?: string
          fecha_expiracion?: string
          fecha_validacion?: string
          metadata?: Json | null
          numero_validaciones?: number | null
          razon_social_normalizada?: string
          razon_social_sat?: string
          regimen_fiscal?: string | null
          rfc?: string
          situacion?: string | null
          ultima_actualizacion?: string
        }
        Relationships: []
      }
      rls_policies_backup: {
        Row: {
          backup_phase: string | null
          created_at: string | null
          id: string
          is_permissive: boolean | null
          policy_command: string
          policy_name: string
          policy_using: string | null
          policy_with_check: string | null
          table_name: string
        }
        Insert: {
          backup_phase?: string | null
          created_at?: string | null
          id?: string
          is_permissive?: boolean | null
          policy_command: string
          policy_name: string
          policy_using?: string | null
          policy_with_check?: string | null
          table_name: string
        }
        Update: {
          backup_phase?: string | null
          created_at?: string | null
          id?: string
          is_permissive?: boolean | null
          policy_command?: string
          policy_name?: string
          policy_using?: string | null
          policy_with_check?: string | null
          table_name?: string
        }
        Relationships: []
      }
      rls_refactor_audit: {
        Row: {
          accion: string
          detalles: Json | null
          fase: string
          id: string
          tabla_afectada: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          accion: string
          detalles?: Json | null
          fase: string
          id?: string
          tabla_afectada?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          accion?: string
          detalles?: Json | null
          fase?: string
          id?: string
          tabla_afectada?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rutas_frecuentes: {
        Row: {
          created_at: string | null
          descripcion: string | null
          distancia_km: number | null
          id: string
          nombre_ruta: string
          tiempo_estimado_minutos: number | null
          ubicacion_destino: Json
          ubicacion_origen: Json
          updated_at: string | null
          uso_count: number | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          distancia_km?: number | null
          id?: string
          nombre_ruta: string
          tiempo_estimado_minutos?: number | null
          ubicacion_destino: Json
          ubicacion_origen: Json
          updated_at?: string | null
          uso_count?: number | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          distancia_km?: number | null
          id?: string
          nombre_ruta?: string
          tiempo_estimado_minutos?: number | null
          ubicacion_destino?: Json
          ubicacion_origen?: Json
          updated_at?: string | null
          uso_count?: number | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      schema_version: {
        Row: {
          updated_at: string | null
          version: number
        }
        Insert: {
          updated_at?: string | null
          version?: number
        }
        Update: {
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      secrets_metadata: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string
          id: string
          proxima_rotacion: string | null
          rotacion_requerida_dias: number | null
          secret_name: string
          tipo: string
          ultima_rotacion: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion: string
          id?: string
          proxima_rotacion?: string | null
          rotacion_requerida_dias?: number | null
          secret_name: string
          tipo: string
          ultima_rotacion?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string
          id?: string
          proxima_rotacion?: string | null
          rotacion_requerida_dias?: number | null
          secret_name?: string
          tipo?: string
          ultima_rotacion?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      socios: {
        Row: {
          activo: boolean | null
          calificacion_promedio: number | null
          conductores_asignados: number | null
          constancia_fiscal_encrypted: string | null
          constancia_fiscal_encrypted_at: string | null
          created_at: string | null
          curp: string | null
          direccion: Json | null
          direccion_fiscal: Json | null
          email: string | null
          estado: string
          id: string
          identificacion_encrypted: string | null
          identificacion_encrypted_at: string | null
          ingresos_mes_actual: number | null
          ingresos_totales: number | null
          nombre_razon_social: string
          regimen_fiscal: string | null
          rfc: string
          telefono: string | null
          tipo_persona: string | null
          total_viajes_completados: number | null
          ultimo_viaje_fecha: string | null
          ultimo_viaje_id: string | null
          updated_at: string | null
          user_id: string
          uso_cfdi: string | null
          vehiculos_asignados: number | null
          viajes_activos: number | null
        }
        Insert: {
          activo?: boolean | null
          calificacion_promedio?: number | null
          conductores_asignados?: number | null
          constancia_fiscal_encrypted?: string | null
          constancia_fiscal_encrypted_at?: string | null
          created_at?: string | null
          curp?: string | null
          direccion?: Json | null
          direccion_fiscal?: Json | null
          email?: string | null
          estado?: string
          id?: string
          identificacion_encrypted?: string | null
          identificacion_encrypted_at?: string | null
          ingresos_mes_actual?: number | null
          ingresos_totales?: number | null
          nombre_razon_social: string
          regimen_fiscal?: string | null
          rfc: string
          telefono?: string | null
          tipo_persona?: string | null
          total_viajes_completados?: number | null
          ultimo_viaje_fecha?: string | null
          ultimo_viaje_id?: string | null
          updated_at?: string | null
          user_id: string
          uso_cfdi?: string | null
          vehiculos_asignados?: number | null
          viajes_activos?: number | null
        }
        Update: {
          activo?: boolean | null
          calificacion_promedio?: number | null
          conductores_asignados?: number | null
          constancia_fiscal_encrypted?: string | null
          constancia_fiscal_encrypted_at?: string | null
          created_at?: string | null
          curp?: string | null
          direccion?: Json | null
          direccion_fiscal?: Json | null
          email?: string | null
          estado?: string
          id?: string
          identificacion_encrypted?: string | null
          identificacion_encrypted_at?: string | null
          ingresos_mes_actual?: number | null
          ingresos_totales?: number | null
          nombre_razon_social?: string
          regimen_fiscal?: string | null
          rfc?: string
          telefono?: string | null
          tipo_persona?: string | null
          total_viajes_completados?: number | null
          ultimo_viaje_fecha?: string | null
          ultimo_viaje_id?: string | null
          updated_at?: string | null
          user_id?: string
          uso_cfdi?: string | null
          vehiculos_asignados?: number | null
          viajes_activos?: number | null
        }
        Relationships: []
      }
      solicitudes_cancelacion_cfdi: {
        Row: {
          acuse_cancelacion: string | null
          carta_porte_id: string | null
          codigo_respuesta: string | null
          created_at: string | null
          estado: string
          fecha_procesamiento: string | null
          fecha_solicitud: string | null
          folio_sustitucion: string | null
          id: string
          mensaje_error: string | null
          motivo_cancelacion: string
          requiere_aceptacion: boolean | null
          rfc_emisor: string
          rfc_receptor: string | null
          updated_at: string | null
          user_id: string
          uuid_cfdi: string
        }
        Insert: {
          acuse_cancelacion?: string | null
          carta_porte_id?: string | null
          codigo_respuesta?: string | null
          created_at?: string | null
          estado?: string
          fecha_procesamiento?: string | null
          fecha_solicitud?: string | null
          folio_sustitucion?: string | null
          id?: string
          mensaje_error?: string | null
          motivo_cancelacion: string
          requiere_aceptacion?: boolean | null
          rfc_emisor: string
          rfc_receptor?: string | null
          updated_at?: string | null
          user_id: string
          uuid_cfdi: string
        }
        Update: {
          acuse_cancelacion?: string | null
          carta_porte_id?: string | null
          codigo_respuesta?: string | null
          created_at?: string | null
          estado?: string
          fecha_procesamiento?: string | null
          fecha_solicitud?: string | null
          folio_sustitucion?: string | null
          id?: string
          mensaje_error?: string | null
          motivo_cancelacion?: string
          requiere_aceptacion?: boolean | null
          rfc_emisor?: string
          rfc_receptor?: string | null
          updated_at?: string | null
          user_id?: string
          uuid_cfdi?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_cancelacion_cfdi_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions_meta: {
        Row: {
          created_at: string | null
          id: string
          included_timbres: number | null
          interval: string | null
          json_meta: Json | null
          last_reset: string | null
          plan_key: string | null
          status: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          included_timbres?: number | null
          interval?: string | null
          json_meta?: Json | null
          last_reset?: string | null
          plan_key?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          included_timbres?: number | null
          interval?: string | null
          json_meta?: Json | null
          last_reset?: string | null
          plan_key?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suscripciones: {
        Row: {
          cleanup_warning_sent: boolean | null
          created_at: string | null
          dias_gracia: number | null
          fecha_fin_prueba: string | null
          fecha_inicio: string | null
          fecha_vencimiento: string | null
          final_warning_sent: boolean | null
          grace_period_end: string | null
          grace_period_start: string | null
          id: string
          plan_id: string
          proximo_pago: string | null
          status: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          ultimo_pago: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cleanup_warning_sent?: boolean | null
          created_at?: string | null
          dias_gracia?: number | null
          fecha_fin_prueba?: string | null
          fecha_inicio?: string | null
          fecha_vencimiento?: string | null
          final_warning_sent?: boolean | null
          grace_period_end?: string | null
          grace_period_start?: string | null
          id?: string
          plan_id: string
          proximo_pago?: string | null
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          ultimo_pago?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cleanup_warning_sent?: boolean | null
          created_at?: string | null
          dias_gracia?: number | null
          fecha_fin_prueba?: string | null
          fecha_inicio?: string | null
          fecha_vencimiento?: string | null
          final_warning_sent?: boolean | null
          grace_period_end?: string | null
          grace_period_start?: string | null
          id?: string
          plan_id?: string
          proximo_pago?: string | null
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          ultimo_pago?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suscripciones_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes_suscripcion"
            referencedColumns: ["id"]
          },
        ]
      }
      talleres: {
        Row: {
          activo: boolean | null
          calificacion_promedio: number | null
          certificaciones: string[] | null
          created_at: string | null
          direccion: Json
          email: string | null
          especialidades: string[] | null
          horarios: Json | null
          id: string
          nombre: string
          precios_promedio: Json | null
          rfc: string | null
          telefono: string | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          calificacion_promedio?: number | null
          certificaciones?: string[] | null
          created_at?: string | null
          direccion: Json
          email?: string | null
          especialidades?: string[] | null
          horarios?: Json | null
          id?: string
          nombre: string
          precios_promedio?: Json | null
          rfc?: string | null
          telefono?: string | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          calificacion_promedio?: number | null
          certificaciones?: string[] | null
          created_at?: string | null
          direccion?: Json
          email?: string | null
          especialidades?: string[] | null
          horarios?: Json | null
          id?: string
          nombre?: string
          precios_promedio?: Json | null
          rfc?: string | null
          telefono?: string | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          activo: boolean | null
          created_at: string | null
          id: string
          nombre_empresa: string
          rfc_empresa: string
          subdominio: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre_empresa: string
          rfc_empresa: string
          subdominio?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          id?: string
          nombre_empresa?: string
          rfc_empresa?: string
          subdominio?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      timbrados_log: {
        Row: {
          ambiente: string
          created_at: string
          error_mensaje: string | null
          exitoso: boolean
          id: string
          pac: string
          tipo_documento: string
          user_id: string
          uuid: string | null
        }
        Insert: {
          ambiente: string
          created_at?: string
          error_mensaje?: string | null
          exitoso?: boolean
          id?: string
          pac: string
          tipo_documento: string
          user_id: string
          uuid?: string | null
        }
        Update: {
          ambiente?: string
          created_at?: string
          error_mensaje?: string | null
          exitoso?: boolean
          id?: string
          pac?: string
          tipo_documento?: string
          user_id?: string
          uuid?: string | null
        }
        Relationships: []
      }
      timbres_prepaid: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          purchase_id: string | null
          quantity: number
          remaining: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          purchase_id?: string | null
          quantity: number
          remaining: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          purchase_id?: string | null
          quantity?: number
          remaining?: number
          user_id?: string
        }
        Relationships: []
      }
      timbres_usage_log: {
        Row: {
          carta_porte_id: string | null
          created_at: string | null
          id: string
          pack_id: string | null
          quantity: number | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          carta_porte_id?: string | null
          created_at?: string | null
          id?: string
          pack_id?: string | null
          quantity?: number | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          carta_porte_id?: string | null
          created_at?: string | null
          id?: string
          pack_id?: string | null
          quantity?: number | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tracking_carta_porte: {
        Row: {
          carta_porte_id: string
          created_at: string
          descripcion: string
          evento: string
          id: string
          metadata: Json | null
          ubicacion: string | null
          updated_at: string
          uuid_fiscal: string | null
        }
        Insert: {
          carta_porte_id: string
          created_at?: string
          descripcion: string
          evento: string
          id?: string
          metadata?: Json | null
          ubicacion?: string | null
          updated_at?: string
          uuid_fiscal?: string | null
        }
        Update: {
          carta_porte_id?: string
          created_at?: string
          descripcion?: string
          evento?: string
          id?: string
          metadata?: Json | null
          ubicacion?: string | null
          updated_at?: string
          uuid_fiscal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_carta_porte_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
        ]
      }
      transacciones_creditos: {
        Row: {
          balance_anterior: number
          balance_nuevo: number
          cantidad: number
          carta_porte_id: string | null
          created_at: string | null
          id: string
          notas: string | null
          paquete_id: string | null
          stripe_payment_intent_id: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          balance_anterior: number
          balance_nuevo: number
          cantidad: number
          carta_porte_id?: string | null
          created_at?: string | null
          id?: string
          notas?: string | null
          paquete_id?: string | null
          stripe_payment_intent_id?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          balance_anterior?: number
          balance_nuevo?: number
          cantidad?: number
          carta_porte_id?: string | null
          created_at?: string | null
          id?: string
          notas?: string | null
          paquete_id?: string | null
          stripe_payment_intent_id?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transacciones_creditos_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacciones_creditos_paquete_id_fkey"
            columns: ["paquete_id"]
            isOneToOne: false
            referencedRelation: "paquetes_creditos"
            referencedColumns: ["id"]
          },
        ]
      }
      ubicaciones: {
        Row: {
          carta_porte_id: string | null
          codigo_postal: string | null
          coordenadas: Json | null
          created_at: string | null
          distancia_recorrida: number | null
          domicilio: Json | null
          fecha_hora_salida_llegada: string | null
          id: string
          id_ubicacion: string
          kilometro: number | null
          nombre_remitente_destinatario: string | null
          numero_estacion: string | null
          orden_secuencia: number | null
          rfc_remitente_destinatario: string | null
          tipo_estacion: string | null
          tipo_ubicacion: string | null
        }
        Insert: {
          carta_porte_id?: string | null
          codigo_postal?: string | null
          coordenadas?: Json | null
          created_at?: string | null
          distancia_recorrida?: number | null
          domicilio?: Json | null
          fecha_hora_salida_llegada?: string | null
          id?: string
          id_ubicacion: string
          kilometro?: number | null
          nombre_remitente_destinatario?: string | null
          numero_estacion?: string | null
          orden_secuencia?: number | null
          rfc_remitente_destinatario?: string | null
          tipo_estacion?: string | null
          tipo_ubicacion?: string | null
        }
        Update: {
          carta_porte_id?: string | null
          codigo_postal?: string | null
          coordenadas?: Json | null
          created_at?: string | null
          distancia_recorrida?: number | null
          domicilio?: Json | null
          fecha_hora_salida_llegada?: string | null
          id?: string
          id_ubicacion?: string
          kilometro?: number | null
          nombre_remitente_destinatario?: string | null
          numero_estacion?: string | null
          orden_secuencia?: number | null
          rfc_remitente_destinatario?: string | null
          tipo_estacion?: string | null
          tipo_ubicacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ubicaciones_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
        ]
      }
      ubicaciones_frecuentes: {
        Row: {
          codigo_postal: string | null
          created_at: string | null
          domicilio: Json | null
          id: string
          nombre_ubicacion: string | null
          rfc_asociado: string | null
          tenant_id: string | null
          updated_at: string | null
          uso_count: number | null
        }
        Insert: {
          codigo_postal?: string | null
          created_at?: string | null
          domicilio?: Json | null
          id?: string
          nombre_ubicacion?: string | null
          rfc_asociado?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          uso_count?: number | null
        }
        Update: {
          codigo_postal?: string | null
          created_at?: string | null
          domicilio?: Json | null
          id?: string
          nombre_ubicacion?: string | null
          rfc_asociado?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          uso_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ubicaciones_frecuentes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      unificacion_audit: {
        Row: {
          accion: string
          detalles: Json | null
          fase: string
          id: string
          timestamp: string | null
        }
        Insert: {
          accion: string
          detalles?: Json | null
          fase: string
          id?: string
          timestamp?: string | null
        }
        Update: {
          accion?: string
          detalles?: Json | null
          fase?: string
          id?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          consent_type: string
          consented_at: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string
          version: string
        }
        Insert: {
          consent_type: string
          consented_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
          version: string
        }
        Update: {
          consent_type?: string
          consented_at?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usuario_almacenamiento: {
        Row: {
          archivos_count: number
          bytes_utilizados: number
          created_at: string | null
          id: string
          ultima_actualizacion: string | null
          user_id: string
        }
        Insert: {
          archivos_count?: number
          bytes_utilizados?: number
          created_at?: string | null
          id?: string
          ultima_actualizacion?: string | null
          user_id: string
        }
        Update: {
          archivos_count?: number
          bytes_utilizados?: number
          created_at?: string | null
          id?: string
          ultima_actualizacion?: string | null
          user_id?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          activo: boolean | null
          auth_user_id: string | null
          created_at: string | null
          email: string
          id: string
          nombre: string
          profile_id: string | null
          rol: string | null
          rol_especial: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          nombre: string
          profile_id?: string | null
          rol?: string | null
          rol_especial?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          profile_id?: string | null
          rol?: string | null
          rol_especial?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      validaciones_xml_log: {
        Row: {
          carta_porte_id: string | null
          created_at: string | null
          esquema_id: string | null
          id: string
          puntaje_conformidad: number | null
          resultado_validacion: Json | null
          xml_generado: string | null
        }
        Insert: {
          carta_porte_id?: string | null
          created_at?: string | null
          esquema_id?: string | null
          id?: string
          puntaje_conformidad?: number | null
          resultado_validacion?: Json | null
          xml_generado?: string | null
        }
        Update: {
          carta_porte_id?: string | null
          created_at?: string | null
          esquema_id?: string | null
          id?: string
          puntaje_conformidad?: number | null
          resultado_validacion?: Json | null
          xml_generado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validaciones_xml_log_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validaciones_xml_log_esquema_id_fkey"
            columns: ["esquema_id"]
            isOneToOne: false
            referencedRelation: "esquemas_xml_sat"
            referencedColumns: ["id"]
          },
        ]
      }
      vehiculo_conductores: {
        Row: {
          activo: boolean
          conductor_id: string
          created_at: string
          fecha_asignacion: string
          id: string
          observaciones: string | null
          updated_at: string
          user_id: string
          vehiculo_id: string
        }
        Insert: {
          activo?: boolean
          conductor_id: string
          created_at?: string
          fecha_asignacion?: string
          id?: string
          observaciones?: string | null
          updated_at?: string
          user_id: string
          vehiculo_id: string
        }
        Update: {
          activo?: boolean
          conductor_id?: string
          created_at?: string
          fecha_asignacion?: string
          id?: string
          observaciones?: string | null
          updated_at?: string
          user_id?: string
          vehiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehiculo_conductores_conductor_id_fkey"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehiculo_conductores_vehiculo_id_fkey"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      vehiculos: {
        Row: {
          acta_instalacion_gps: string | null
          activo: boolean | null
          anio: number | null
          asegura_med_ambiente: string | null
          asegura_resp_civil: string | null
          capacidad_carga: number | null
          conductor_asignado_id: string | null
          config_vehicular: string | null
          configuracion_ejes: string | null
          consumo_promedio_km_litro: number | null
          costo_llantas_km: number | null
          costo_mantenimiento_km: number | null
          costo_operacion_km: number | null
          created_at: string | null
          dimensiones: Json | null
          estado: string
          factor_peajes: number | null
          fecha_instalacion_gps: string | null
          fecha_proxima_disponibilidad: string | null
          id: string
          id_equipo_gps: string | null
          kilometraje_actual: number | null
          marca: string | null
          modelo: string | null
          motivo_no_disponible: string | null
          num_permiso_sct: string | null
          num_serie: string | null
          numero_ejes: number | null
          numero_llantas: number | null
          numero_permisos_adicionales: string[] | null
          numero_serie_vin: string | null
          perm_sct: string | null
          peso_bruto_vehicular: number | null
          placa: string
          poliza_med_ambiente: string | null
          poliza_resp_civil: string | null
          poliza_seguro: string | null
          poliza_seguro_encrypted: string | null
          poliza_seguro_encrypted_at: string | null
          rendimiento: number | null
          tarjeta_circulacion_encrypted: string | null
          tarjeta_circulacion_encrypted_at: string | null
          tipo_carroceria: string | null
          tipo_combustible: string | null
          ubicacion_actual: string | null
          ultima_actualizacion_ubicacion: string | null
          ultima_ubicacion_lat: number | null
          ultima_ubicacion_lng: number | null
          updated_at: string | null
          user_id: string
          valor_vehiculo: number | null
          verificacion_encrypted: string | null
          verificacion_encrypted_at: string | null
          verificacion_vigencia: string | null
          viaje_actual_id: string | null
          vigencia_permiso: string | null
          vigencia_seguro: string | null
        }
        Insert: {
          acta_instalacion_gps?: string | null
          activo?: boolean | null
          anio?: number | null
          asegura_med_ambiente?: string | null
          asegura_resp_civil?: string | null
          capacidad_carga?: number | null
          conductor_asignado_id?: string | null
          config_vehicular?: string | null
          configuracion_ejes?: string | null
          consumo_promedio_km_litro?: number | null
          costo_llantas_km?: number | null
          costo_mantenimiento_km?: number | null
          costo_operacion_km?: number | null
          created_at?: string | null
          dimensiones?: Json | null
          estado?: string
          factor_peajes?: number | null
          fecha_instalacion_gps?: string | null
          fecha_proxima_disponibilidad?: string | null
          id?: string
          id_equipo_gps?: string | null
          kilometraje_actual?: number | null
          marca?: string | null
          modelo?: string | null
          motivo_no_disponible?: string | null
          num_permiso_sct?: string | null
          num_serie?: string | null
          numero_ejes?: number | null
          numero_llantas?: number | null
          numero_permisos_adicionales?: string[] | null
          numero_serie_vin?: string | null
          perm_sct?: string | null
          peso_bruto_vehicular?: number | null
          placa: string
          poliza_med_ambiente?: string | null
          poliza_resp_civil?: string | null
          poliza_seguro?: string | null
          poliza_seguro_encrypted?: string | null
          poliza_seguro_encrypted_at?: string | null
          rendimiento?: number | null
          tarjeta_circulacion_encrypted?: string | null
          tarjeta_circulacion_encrypted_at?: string | null
          tipo_carroceria?: string | null
          tipo_combustible?: string | null
          ubicacion_actual?: string | null
          ultima_actualizacion_ubicacion?: string | null
          ultima_ubicacion_lat?: number | null
          ultima_ubicacion_lng?: number | null
          updated_at?: string | null
          user_id: string
          valor_vehiculo?: number | null
          verificacion_encrypted?: string | null
          verificacion_encrypted_at?: string | null
          verificacion_vigencia?: string | null
          viaje_actual_id?: string | null
          vigencia_permiso?: string | null
          vigencia_seguro?: string | null
        }
        Update: {
          acta_instalacion_gps?: string | null
          activo?: boolean | null
          anio?: number | null
          asegura_med_ambiente?: string | null
          asegura_resp_civil?: string | null
          capacidad_carga?: number | null
          conductor_asignado_id?: string | null
          config_vehicular?: string | null
          configuracion_ejes?: string | null
          consumo_promedio_km_litro?: number | null
          costo_llantas_km?: number | null
          costo_mantenimiento_km?: number | null
          costo_operacion_km?: number | null
          created_at?: string | null
          dimensiones?: Json | null
          estado?: string
          factor_peajes?: number | null
          fecha_instalacion_gps?: string | null
          fecha_proxima_disponibilidad?: string | null
          id?: string
          id_equipo_gps?: string | null
          kilometraje_actual?: number | null
          marca?: string | null
          modelo?: string | null
          motivo_no_disponible?: string | null
          num_permiso_sct?: string | null
          num_serie?: string | null
          numero_ejes?: number | null
          numero_llantas?: number | null
          numero_permisos_adicionales?: string[] | null
          numero_serie_vin?: string | null
          perm_sct?: string | null
          peso_bruto_vehicular?: number | null
          placa?: string
          poliza_med_ambiente?: string | null
          poliza_resp_civil?: string | null
          poliza_seguro?: string | null
          poliza_seguro_encrypted?: string | null
          poliza_seguro_encrypted_at?: string | null
          rendimiento?: number | null
          tarjeta_circulacion_encrypted?: string | null
          tarjeta_circulacion_encrypted_at?: string | null
          tipo_carroceria?: string | null
          tipo_combustible?: string | null
          ubicacion_actual?: string | null
          ultima_actualizacion_ubicacion?: string | null
          ultima_ubicacion_lat?: number | null
          ultima_ubicacion_lng?: number | null
          updated_at?: string | null
          user_id?: string
          valor_vehiculo?: number | null
          verificacion_encrypted?: string | null
          verificacion_encrypted_at?: string | null
          verificacion_vigencia?: string | null
          viaje_actual_id?: string | null
          vigencia_permiso?: string | null
          vigencia_seguro?: string | null
        }
        Relationships: []
      }
      vehiculos_guardados: {
        Row: {
          anio_modelo_vm: number | null
          config_vehicular: string | null
          created_at: string | null
          id: string
          nombre_perfil: string | null
          placa_vm: string | null
          remolques: Json | null
          seguros: Json | null
          tenant_id: string | null
        }
        Insert: {
          anio_modelo_vm?: number | null
          config_vehicular?: string | null
          created_at?: string | null
          id?: string
          nombre_perfil?: string | null
          placa_vm?: string | null
          remolques?: Json | null
          seguros?: Json | null
          tenant_id?: string | null
        }
        Update: {
          anio_modelo_vm?: number | null
          config_vehicular?: string | null
          created_at?: string | null
          id?: string
          nombre_perfil?: string | null
          placa_vm?: string | null
          remolques?: Json | null
          seguros?: Json | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehiculos_guardados_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      viajes: {
        Row: {
          carta_porte_id: string | null
          combustible_estimado: number | null
          combustible_real: number | null
          conductor_id: string | null
          costo_estimado: number | null
          costo_real: number | null
          created_at: string
          destino: string
          distancia_km: number | null
          estado: string
          factura_id: string | null
          fecha_fin_programada: string
          fecha_fin_real: string | null
          fecha_inicio_programada: string
          fecha_inicio_real: string | null
          id: string
          margen_estimado: number | null
          margen_real: number | null
          observaciones: string | null
          origen: string
          peajes_estimados: number | null
          peajes_reales: number | null
          precio_cobrado: number | null
          remolque_id: string | null
          ruta_destino: string | null
          ruta_origen: string | null
          socio_id: string | null
          tiempo_estimado_horas: number | null
          tiempo_real_horas: number | null
          tracking_data: Json | null
          updated_at: string
          user_id: string
          vehiculo_id: string | null
        }
        Insert: {
          carta_porte_id?: string | null
          combustible_estimado?: number | null
          combustible_real?: number | null
          conductor_id?: string | null
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string
          destino: string
          distancia_km?: number | null
          estado?: string
          factura_id?: string | null
          fecha_fin_programada: string
          fecha_fin_real?: string | null
          fecha_inicio_programada: string
          fecha_inicio_real?: string | null
          id?: string
          margen_estimado?: number | null
          margen_real?: number | null
          observaciones?: string | null
          origen: string
          peajes_estimados?: number | null
          peajes_reales?: number | null
          precio_cobrado?: number | null
          remolque_id?: string | null
          ruta_destino?: string | null
          ruta_origen?: string | null
          socio_id?: string | null
          tiempo_estimado_horas?: number | null
          tiempo_real_horas?: number | null
          tracking_data?: Json | null
          updated_at?: string
          user_id: string
          vehiculo_id?: string | null
        }
        Update: {
          carta_porte_id?: string | null
          combustible_estimado?: number | null
          combustible_real?: number | null
          conductor_id?: string | null
          costo_estimado?: number | null
          costo_real?: number | null
          created_at?: string
          destino?: string
          distancia_km?: number | null
          estado?: string
          factura_id?: string | null
          fecha_fin_programada?: string
          fecha_fin_real?: string | null
          fecha_inicio_programada?: string
          fecha_inicio_real?: string | null
          id?: string
          margen_estimado?: number | null
          margen_real?: number | null
          observaciones?: string | null
          origen?: string
          peajes_estimados?: number | null
          peajes_reales?: number | null
          precio_cobrado?: number | null
          remolque_id?: string | null
          ruta_destino?: string | null
          ruta_origen?: string | null
          socio_id?: string | null
          tiempo_estimado_horas?: number | null
          tiempo_real_horas?: number | null
          tracking_data?: Json | null
          updated_at?: string
          user_id?: string
          vehiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_viajes_carta_porte"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_viajes_conductor"
            columns: ["conductor_id"]
            isOneToOne: false
            referencedRelation: "conductores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_viajes_remolque"
            columns: ["remolque_id"]
            isOneToOne: false
            referencedRelation: "remolques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_viajes_vehiculo"
            columns: ["vehiculo_id"]
            isOneToOne: false
            referencedRelation: "vehiculos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viajes_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_creditos_dashboard: {
        Row: {
          compras_ultimo_mes: number | null
          creditos_vendidos_ultimo_mes: number | null
          promedio_balance_por_usuario: number | null
          total_creditos_consumidos: number | null
          total_creditos_disponibles: number | null
          total_creditos_vendidos: number | null
          usuarios_con_creditos: number | null
        }
        Relationships: []
      }
      admin_metricas_timbres: {
        Row: {
          consumos_dia_actual: number | null
          consumos_mes_actual: number | null
          tasa_conversion_pct: number | null
          timbres_consumidos_historico: number | null
          timbres_disponibles_total: number | null
          total_usuarios_activos: number | null
          usuarios_cerca_limite: number | null
          usuarios_gratuitos: number | null
        }
        Relationships: []
      }
      admin_top_usuarios_consumo: {
        Row: {
          consumidos_este_mes: number | null
          email: string | null
          estado_consumo: string | null
          limite_mensual: number | null
          plan_nombre: string | null
          porcentaje_usado: number | null
          timbres_mes_actual: number | null
          total_historico: number | null
          user_id: string | null
        }
        Relationships: []
      }
      facturas_stats: {
        Row: {
          egresos_totales: number | null
          facturas_canceladas: number | null
          facturas_timbradas: number | null
          ingresos_totales: number | null
          total_facturas: number | null
          ultima_factura: string | null
          user_id: string | null
        }
        Relationships: []
      }
      mv_mercancias_viaje: {
        Row: {
          cantidad_total: number | null
          mercancias_peligrosas: number | null
          mercancias_timbradas: number | null
          peso_total: number | null
          total_mercancias: number | null
          valor_total: number | null
          viaje_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mercancias_viaje_id_fkey"
            columns: ["viaje_id"]
            isOneToOne: false
            referencedRelation: "viajes"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_viajes_dashboard: {
        Row: {
          conductores_activos: number | null
          costos_totales: number | null
          ingresos_totales: number | null
          margen_total: number | null
          ultima_actualizacion: string | null
          user_id: string | null
          vehiculos_activos: number | null
          viajes_cancelados: number | null
          viajes_completados: number | null
          viajes_en_transito: number | null
          viajes_hoy: number | null
          viajes_mes: number | null
          viajes_programados: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_rotate_pac_token: { Args: { new_token: string }; Returns: boolean }
      analizar_mercado_ruta: {
        Args: { p_ruta_hash: string; p_user_id: string }
        Returns: {
          margen_promedio: number
          precio_maximo: number
          precio_minimo: number
          precio_promedio: number
          tendencia: string
          total_cotizaciones: number
        }[]
      }
      anonimizar_usuario: { Args: { target_user_id: string }; Returns: Json }
      assign_missing_trials: { Args: never; Returns: undefined }
      buscar_codigo_postal: {
        Args: { cp_input: string }
        Returns: {
          ciudad: string
          codigo_postal: string
          colonias: Json
          estado: string
          estado_clave: string
          localidad: string
          municipio: string
          municipio_clave: string
          zona: string
        }[]
      }
      buscar_codigo_postal_completo: {
        Args: { cp_input: string }
        Returns: {
          ciudad: string
          codigo_postal: string
          colonias: Json
          estado: string
          estado_clave: string
          localidad: string
          municipio: string
          municipio_clave: string
          total_colonias: number
          zona: string
        }[]
      }
      calcular_performance_conductor: {
        Args: { p_conductor_id: string; p_user_id: string }
        Returns: {
          areas_mejora: string[]
          cuidado_vehiculo: number
          eficiencia_combustible: number
          fortalezas: string[]
          puntualidad: number
          recomendaciones_capacitacion: string[]
          rutas_optimas: string[]
          satisfaccion_cliente: number
          tendencia_mejora: boolean
          tipos_carga_ideales: string[]
        }[]
      }
      calcular_precision_ruta: {
        Args: { p_ruta_hash: string; p_user_id: string }
        Returns: {
          exactitud_costo: number
          exactitud_tiempo: number
          factor_correccion_costo: number
          factor_correccion_tiempo: number
          total_viajes: number
        }[]
      }
      calcular_proyeccion_consumo: {
        Args: never
        Returns: {
          dias_transcurridos: number
          estimado_fin_mes: number
          promedio_diario: number
          proyeccion_mensual: number
        }[]
      }
      check_document_expiration: { Args: never; Returns: undefined }
      check_maintenance_alerts: {
        Args: { p_user_id: string }
        Returns: {
          descripcion: string
          dias_restantes: number
          kilometros_restantes: number
          placa: string
          tipo_alerta: string
          urgencia: string
          vehiculo_id: string
        }[]
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_subscription_expiry: { Args: never; Returns: undefined }
      check_user_access: { Args: { user_uuid: string }; Returns: boolean }
      cleanup_expired_grace_users: { Args: never; Returns: undefined }
      cleanup_old_notifications: { Args: never; Returns: undefined }
      decrypt_conductor_photo: {
        Args: { conductor_id: string }
        Returns: string
      }
      decrypt_document: {
        Args: { column_name: string; record_id: string; table_name: string }
        Returns: string
      }
      eliminar_datos_usuario: {
        Args: { target_user_id: string }
        Returns: Json
      }
      encrypt_conductor_photo: {
        Args: { conductor_id: string; photo_data: string }
        Returns: boolean
      }
      encrypt_document: {
        Args: {
          column_name: string
          document_data: string
          record_id: string
          table_name: string
        }
        Returns: boolean
      }
      exportar_datos_usuario: {
        Args: { target_user_id: string }
        Returns: Json
      }
      generar_hash_ruta: {
        Args: { destino: string; origen: string }
        Returns: string
      }
      generar_id_ccp_unico: { Args: never; Returns: string }
      get_active_certificate: {
        Args: { user_uuid: string }
        Returns: {
          archivo_cer_path: string
          archivo_key_path: string
          fecha_fin_vigencia: string
          fecha_inicio_vigencia: string
          id: string
          nombre_certificado: string
          numero_certificado: string
          razon_social: string
          rfc_titular: string
        }[]
      }
      get_auth: { Args: never; Returns: Json }
      get_current_user_tenant_id: { Args: never; Returns: string }
      get_documentos_procesados: {
        Args: { user_uuid: string }
        Returns: {
          carta_porte_id: string
          confidence: number
          created_at: string
          document_type: string
          documento_original_id: string
          errors: string
          extracted_text: string
          file_path: string
          id: string
          mercancias_count: number
          metadata: Json
          user_id: string
        }[]
      }
      get_documents_for_migration: {
        Args: { p_table_name: string }
        Returns: {
          column_name: string
          is_encrypted: boolean
          record_id: string
          url_value: string
        }[]
      }
      get_encryption_stats: { Args: never; Returns: Json }
      get_facturas_resumen: { Args: { p_user_id: string }; Returns: Json }
      get_pac_credentials: { Args: never; Returns: Json }
      get_pac_token: { Args: { secret_name?: string }; Returns: string }
      get_recursos_viaje_wizard: {
        Args: { p_user_id: string }
        Returns: {
          conductores_disponibles: Json
          remolques_disponibles: Json
          vehiculos_disponibles: Json
        }[]
      }
      get_schema_version: { Args: never; Returns: number }
      get_secret: { Args: { secret_name: string }; Returns: string }
      get_user_storage_usage: {
        Args: { user_uuid: string }
        Returns: {
          archivos_count: number
          bytes_utilizados: number
          gb_utilizados: number
        }[]
      }
      get_user_tenant_id: { Args: { user_uuid: string }; Returns: string }
      get_viaje_completo: {
        Args: { p_viaje_id: string }
        Returns: {
          carta_porte_data: Json
          conductor_data: Json
          factura_data: Json
          socio_data: Json
          vehiculo_data: Json
          viaje_data: Json
        }[]
      }
      get_viaje_completo_optimizado: {
        Args: { p_viaje_id: string }
        Returns: Json
      }
      get_viaje_completo_para_timbrado: {
        Args: { p_viaje_id: string }
        Returns: Json
      }
      get_viaje_con_relaciones: { Args: { p_viaje_id: string }; Returns: Json }
      has_admin_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      increment_schema_version: { Args: never; Returns: number }
      is_admin_or_superuser: { Args: { _user_id: string }; Returns: boolean }
      is_superuser_secure: { Args: { _user_id: string }; Returns: boolean }
      limpiar_cache_rfcs_expirado: { Args: never; Returns: undefined }
      limpiar_documentos_huerfanos: {
        Args: never
        Returns: {
          borradores_eliminados: number
          cartas_eliminadas: number
          facturas_eliminadas: number
        }[]
      }
      log_security_event: {
        Args: {
          p_event_data?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      mi_funcion_que_necesita_pac: { Args: never; Returns: undefined }
      migrar_regimen_fiscal_facturas: {
        Args: never
        Returns: {
          facturas_actualizadas: number
          facturas_con_default: number
        }[]
      }
      migrate_photos_to_encrypted: { Args: never; Returns: Json }
      normalizar_ubicaciones_tracking: {
        Args: never
        Returns: {
          estado_anterior: string
          estado_nuevo: string
          normalizado: boolean
          viaje_id: string
        }[]
      }
      poblar_datos_viajes_existentes: { Args: never; Returns: string }
      poblar_datos_viajes_existentes_mejorado: { Args: never; Returns: string }
      process_expired_trials: { Args: never; Returns: undefined }
      promote_user_to_superuser: {
        Args: { target_user_id: string }
        Returns: Json
      }
      puede_usar_modo_pruebas: {
        Args: { p_user_id?: string }
        Returns: boolean
      }
      record_rate_limit_attempt: {
        Args: { p_action_type: string; p_identifier: string; p_metadata?: Json }
        Returns: undefined
      }
      refresh_mercancias_viaje_stats: { Args: never; Returns: undefined }
      refresh_viajes_dashboard: { Args: never; Returns: undefined }
      restore_rls_policies_from_backup:
        | { Args: never; Returns: undefined }
        | { Args: { backup_id: string }; Returns: Json }
      run_automated_tasks: { Args: never; Returns: undefined }
      sanitize_pii_from_logs: { Args: never; Returns: Json }
      send_cleanup_warnings: { Args: never; Returns: undefined }
      sugerir_codigos_similares: {
        Args: { cp_input: string }
        Returns: {
          codigo_postal: string
          ubicacion: string
        }[]
      }
      unaccent: { Args: { "": string }; Returns: string }
      update_user_storage_usage: {
        Args: { bytes_delta: number; files_delta?: number; user_uuid: string }
        Returns: undefined
      }
      user_has_tenant_access: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      validar_configuracion_fiscal_completa: {
        Args: { config_id: string }
        Returns: Json
      }
      validar_correlacion_cp: {
        Args: {
          cp_input: string
          estado_input: string
          municipio_input: string
        }
        Returns: Json
      }
      validate_carta_porte_v31: {
        Args: { carta_porte_data: Json }
        Returns: Json
      }
      validate_carta_porte_v31_compliance: {
        Args: { carta_porte_data: Json }
        Returns: Json
      }
      validate_rfc_format: { Args: { rfc_input: string }; Returns: boolean }
      verificar_disponibilidad_recurso: {
        Args: {
          p_fecha_fin: string
          p_fecha_inicio: string
          p_recurso_id: string
          p_recurso_tipo: string
        }
        Returns: boolean
      }
      verificar_eliminacion_completa: {
        Args: { target_user_id: string }
        Returns: Json
      }
      verify_document_integrity: {
        Args: {
          p_column_name: string
          p_record_id: string
          p_table_name: string
        }
        Returns: Json
      }
    }
    Enums: {
      subscription_status_enum:
        | "trial"
        | "active"
        | "past_due"
        | "canceled"
        | "suspended"
        | "grace_period"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      subscription_status_enum: [
        "trial",
        "active",
        "past_due",
        "canceled",
        "suspended",
        "grace_period",
      ],
    },
  },
} as const
