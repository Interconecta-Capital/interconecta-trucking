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
          rol: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          nombre: string
          rol?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nombre?: string
          rol?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      [_ in never]: never
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
