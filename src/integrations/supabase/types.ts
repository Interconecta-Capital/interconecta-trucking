export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      autotransporte: {
        Row: {
          anio_modelo_vm: number | null
          asegura_med_ambiente: string | null
          asegura_resp_civil: string | null
          carta_porte_id: string | null
          config_vehicular: string | null
          created_at: string | null
          id: string
          num_permiso_sct: string | null
          perm_sct: string | null
          placa_vm: string | null
          poliza_med_ambiente: string | null
          poliza_resp_civil: string | null
        }
        Insert: {
          anio_modelo_vm?: number | null
          asegura_med_ambiente?: string | null
          asegura_resp_civil?: string | null
          carta_porte_id?: string | null
          config_vehicular?: string | null
          created_at?: string | null
          id?: string
          num_permiso_sct?: string | null
          perm_sct?: string | null
          placa_vm?: string | null
          poliza_med_ambiente?: string | null
          poliza_resp_civil?: string | null
        }
        Update: {
          anio_modelo_vm?: number | null
          asegura_med_ambiente?: string | null
          asegura_resp_civil?: string | null
          carta_porte_id?: string | null
          config_vehicular?: string | null
          created_at?: string | null
          id?: string
          num_permiso_sct?: string | null
          perm_sct?: string | null
          placa_vm?: string | null
          poliza_med_ambiente?: string | null
          poliza_resp_civil?: string | null
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
      cartas_porte: {
        Row: {
          created_at: string | null
          entrada_salida_merc: string | null
          fecha_timbrado: string | null
          folio: string | null
          id: string
          nombre_emisor: string | null
          nombre_receptor: string | null
          pais_origen_destino: string | null
          registro_istmo: boolean | null
          rfc_emisor: string
          rfc_receptor: string
          status: string | null
          tenant_id: string | null
          tipo_cfdi: string | null
          transporte_internacional: boolean | null
          ubicacion_polo_destino: string | null
          ubicacion_polo_origen: string | null
          updated_at: string | null
          usuario_id: string | null
          uuid_fiscal: string | null
          via_entrada_salida: string | null
          xml_generado: string | null
        }
        Insert: {
          created_at?: string | null
          entrada_salida_merc?: string | null
          fecha_timbrado?: string | null
          folio?: string | null
          id?: string
          nombre_emisor?: string | null
          nombre_receptor?: string | null
          pais_origen_destino?: string | null
          registro_istmo?: boolean | null
          rfc_emisor: string
          rfc_receptor: string
          status?: string | null
          tenant_id?: string | null
          tipo_cfdi?: string | null
          transporte_internacional?: boolean | null
          ubicacion_polo_destino?: string | null
          ubicacion_polo_origen?: string | null
          updated_at?: string | null
          usuario_id?: string | null
          uuid_fiscal?: string | null
          via_entrada_salida?: string | null
          xml_generado?: string | null
        }
        Update: {
          created_at?: string | null
          entrada_salida_merc?: string | null
          fecha_timbrado?: string | null
          folio?: string | null
          id?: string
          nombre_emisor?: string | null
          nombre_receptor?: string | null
          pais_origen_destino?: string | null
          registro_istmo?: boolean | null
          rfc_emisor?: string
          rfc_receptor?: string
          status?: string | null
          tenant_id?: string | null
          tipo_cfdi?: string | null
          transporte_internacional?: boolean | null
          ubicacion_polo_destino?: string | null
          ubicacion_polo_origen?: string | null
          updated_at?: string | null
          usuario_id?: string | null
          uuid_fiscal?: string | null
          via_entrada_salida?: string | null
          xml_generado?: string | null
        }
        Relationships: [
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
      conductores: {
        Row: {
          activo: boolean | null
          created_at: string | null
          curp: string | null
          direccion: Json | null
          email: string | null
          estado: string
          id: string
          nombre: string
          num_licencia: string | null
          rfc: string | null
          telefono: string | null
          tipo_licencia: string | null
          updated_at: string | null
          user_id: string
          vigencia_licencia: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          curp?: string | null
          direccion?: Json | null
          email?: string | null
          estado?: string
          id?: string
          nombre: string
          num_licencia?: string | null
          rfc?: string | null
          telefono?: string | null
          tipo_licencia?: string | null
          updated_at?: string | null
          user_id: string
          vigencia_licencia?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          curp?: string | null
          direccion?: Json | null
          email?: string | null
          estado?: string
          id?: string
          nombre?: string
          num_licencia?: string | null
          rfc?: string | null
          telefono?: string | null
          tipo_licencia?: string | null
          updated_at?: string | null
          user_id?: string
          vigencia_licencia?: string | null
        }
        Relationships: []
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
          domicilio: Json | null
          id: string
          nombre_figura: string | null
          num_licencia: string | null
          num_reg_id_trib_figura: string | null
          residencia_fiscal_figura: string | null
          rfc_figura: string | null
          tipo_figura: string | null
        }
        Insert: {
          carta_porte_id?: string | null
          created_at?: string | null
          domicilio?: Json | null
          id?: string
          nombre_figura?: string | null
          num_licencia?: string | null
          num_reg_id_trib_figura?: string | null
          residencia_fiscal_figura?: string | null
          rfc_figura?: string | null
          tipo_figura?: string | null
        }
        Update: {
          carta_porte_id?: string | null
          created_at?: string | null
          domicilio?: Json | null
          id?: string
          nombre_figura?: string | null
          num_licencia?: string | null
          num_reg_id_trib_figura?: string | null
          residencia_fiscal_figura?: string | null
          rfc_figura?: string | null
          tipo_figura?: string | null
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
      mercancias: {
        Row: {
          bienes_transp: string
          cantidad: number | null
          carta_porte_id: string | null
          clave_unidad: string | null
          created_at: string | null
          cve_material_peligroso: string | null
          descripcion: string | null
          embalaje: string | null
          fraccion_arancelaria: string | null
          id: string
          material_peligroso: boolean | null
          moneda: string | null
          peso_kg: number | null
          uuid_comercio_ext: string | null
          valor_mercancia: number | null
        }
        Insert: {
          bienes_transp: string
          cantidad?: number | null
          carta_porte_id?: string | null
          clave_unidad?: string | null
          created_at?: string | null
          cve_material_peligroso?: string | null
          descripcion?: string | null
          embalaje?: string | null
          fraccion_arancelaria?: string | null
          id?: string
          material_peligroso?: boolean | null
          moneda?: string | null
          peso_kg?: number | null
          uuid_comercio_ext?: string | null
          valor_mercancia?: number | null
        }
        Update: {
          bienes_transp?: string
          cantidad?: number | null
          carta_porte_id?: string | null
          clave_unidad?: string | null
          created_at?: string | null
          cve_material_peligroso?: string | null
          descripcion?: string | null
          embalaje?: string | null
          fraccion_arancelaria?: string | null
          id?: string
          material_peligroso?: boolean | null
          moneda?: string | null
          peso_kg?: number | null
          uuid_comercio_ext?: string | null
          valor_mercancia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mercancias_carta_porte_id_fkey"
            columns: ["carta_porte_id"]
            isOneToOne: false
            referencedRelation: "cartas_porte"
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
      planes_suscripcion: {
        Row: {
          activo: boolean | null
          created_at: string | null
          descripcion: string | null
          dias_prueba: number | null
          id: string
          limite_cartas_porte: number | null
          limite_conductores: number | null
          limite_socios: number | null
          limite_vehiculos: number | null
          nombre: string
          precio_anual: number | null
          precio_mensual: number
          puede_cancelar_cfdi: boolean | null
          puede_generar_xml: boolean | null
          puede_timbrar: boolean | null
          puede_tracking: boolean | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          dias_prueba?: number | null
          id?: string
          limite_cartas_porte?: number | null
          limite_conductores?: number | null
          limite_socios?: number | null
          limite_vehiculos?: number | null
          nombre: string
          precio_anual?: number | null
          precio_mensual: number
          puede_cancelar_cfdi?: boolean | null
          puede_generar_xml?: boolean | null
          puede_timbrar?: boolean | null
          puede_tracking?: boolean | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          descripcion?: string | null
          dias_prueba?: number | null
          id?: string
          limite_cartas_porte?: number | null
          limite_conductores?: number | null
          limite_socios?: number | null
          limite_vehiculos?: number | null
          nombre?: string
          precio_anual?: number | null
          precio_mensual?: number
          puede_cancelar_cfdi?: boolean | null
          puede_generar_xml?: boolean | null
          puede_timbrar?: boolean | null
          puede_tracking?: boolean | null
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
          configuracion_calendario: Json | null
          created_at: string | null
          email: string
          empresa: string | null
          id: string
          nombre: string
          rfc: string | null
          telefono: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          configuracion_calendario?: Json | null
          created_at?: string | null
          email: string
          empresa?: string | null
          id: string
          nombre: string
          rfc?: string | null
          telefono?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          configuracion_calendario?: Json | null
          created_at?: string | null
          email?: string
          empresa?: string | null
          id?: string
          nombre?: string
          rfc?: string | null
          telefono?: string | null
          timezone?: string | null
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
      remolques: {
        Row: {
          autotransporte_id: string | null
          created_at: string | null
          id: string
          placa: string | null
          subtipo_rem: string | null
        }
        Insert: {
          autotransporte_id?: string | null
          created_at?: string | null
          id?: string
          placa?: string | null
          subtipo_rem?: string | null
        }
        Update: {
          autotransporte_id?: string | null
          created_at?: string | null
          id?: string
          placa?: string | null
          subtipo_rem?: string | null
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
      security_audit_log: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      socios: {
        Row: {
          activo: boolean | null
          created_at: string | null
          direccion: Json | null
          email: string | null
          estado: string
          id: string
          nombre_razon_social: string
          rfc: string
          telefono: string | null
          tipo_persona: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          direccion?: Json | null
          email?: string | null
          estado?: string
          id?: string
          nombre_razon_social: string
          rfc: string
          telefono?: string | null
          tipo_persona?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          direccion?: Json | null
          email?: string | null
          estado?: string
          id?: string
          nombre_razon_social?: string
          rfc?: string
          telefono?: string | null
          tipo_persona?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suscripciones: {
        Row: {
          created_at: string | null
          dias_gracia: number | null
          fecha_fin_prueba: string | null
          fecha_inicio: string | null
          fecha_vencimiento: string | null
          id: string
          plan_id: string
          proximo_pago: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          ultimo_pago: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dias_gracia?: number | null
          fecha_fin_prueba?: string | null
          fecha_inicio?: string | null
          fecha_vencimiento?: string | null
          id?: string
          plan_id: string
          proximo_pago?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          ultimo_pago?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dias_gracia?: number | null
          fecha_fin_prueba?: string | null
          fecha_inicio?: string | null
          fecha_vencimiento?: string | null
          id?: string
          plan_id?: string
          proximo_pago?: string | null
          status?: string
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
      ubicaciones: {
        Row: {
          carta_porte_id: string | null
          created_at: string | null
          distancia_recorrida: number | null
          domicilio: Json | null
          fecha_hora_salida_llegada: string | null
          id: string
          id_ubicacion: string
          nombre_remitente_destinatario: string | null
          orden_secuencia: number | null
          rfc_remitente_destinatario: string | null
          tipo_ubicacion: string | null
        }
        Insert: {
          carta_porte_id?: string | null
          created_at?: string | null
          distancia_recorrida?: number | null
          domicilio?: Json | null
          fecha_hora_salida_llegada?: string | null
          id?: string
          id_ubicacion: string
          nombre_remitente_destinatario?: string | null
          orden_secuencia?: number | null
          rfc_remitente_destinatario?: string | null
          tipo_ubicacion?: string | null
        }
        Update: {
          carta_porte_id?: string | null
          created_at?: string | null
          distancia_recorrida?: number | null
          domicilio?: Json | null
          fecha_hora_salida_llegada?: string | null
          id?: string
          id_ubicacion?: string
          nombre_remitente_destinatario?: string | null
          orden_secuencia?: number | null
          rfc_remitente_destinatario?: string | null
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
      vehiculos: {
        Row: {
          acta_instalacion_gps: string | null
          activo: boolean | null
          anio: number | null
          config_vehicular: string | null
          created_at: string | null
          estado: string
          fecha_instalacion_gps: string | null
          id: string
          id_equipo_gps: string | null
          marca: string | null
          modelo: string | null
          num_serie: string | null
          placa: string
          poliza_seguro: string | null
          updated_at: string | null
          user_id: string
          verificacion_vigencia: string | null
          vigencia_seguro: string | null
        }
        Insert: {
          acta_instalacion_gps?: string | null
          activo?: boolean | null
          anio?: number | null
          config_vehicular?: string | null
          created_at?: string | null
          estado?: string
          fecha_instalacion_gps?: string | null
          id?: string
          id_equipo_gps?: string | null
          marca?: string | null
          modelo?: string | null
          num_serie?: string | null
          placa: string
          poliza_seguro?: string | null
          updated_at?: string | null
          user_id: string
          verificacion_vigencia?: string | null
          vigencia_seguro?: string | null
        }
        Update: {
          acta_instalacion_gps?: string | null
          activo?: boolean | null
          anio?: number | null
          config_vehicular?: string | null
          created_at?: string | null
          estado?: string
          fecha_instalacion_gps?: string | null
          id?: string
          id_equipo_gps?: string | null
          marca?: string | null
          modelo?: string | null
          num_serie?: string | null
          placa?: string
          poliza_seguro?: string | null
          updated_at?: string | null
          user_id?: string
          verificacion_vigencia?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_action_type: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_subscription_expiry: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_data?: Json
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      record_rate_limit_attempt: {
        Args: { p_identifier: string; p_action_type: string; p_metadata?: Json }
        Returns: undefined
      }
      validate_rfc_format: {
        Args: { rfc_input: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
