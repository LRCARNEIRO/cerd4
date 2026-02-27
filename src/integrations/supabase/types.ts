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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      conclusoes_analiticas: {
        Row: {
          argumento_central: string
          artigos_convencao: string[] | null
          created_at: string
          eixos_tematicos: Database["public"]["Enums"]["thematic_axis"][] | null
          evidencias: string[] | null
          grupos_focais:
            | Database["public"]["Enums"]["focal_group_type"][]
            | null
          id: string
          indicadores_suporte: Json | null
          lacunas_relacionadas: string[] | null
          periodo: string
          relevancia_cerd_iv: boolean | null
          relevancia_common_core: boolean | null
          secao_relatorio: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          argumento_central: string
          artigos_convencao?: string[] | null
          created_at?: string
          eixos_tematicos?:
            | Database["public"]["Enums"]["thematic_axis"][]
            | null
          evidencias?: string[] | null
          grupos_focais?:
            | Database["public"]["Enums"]["focal_group_type"][]
            | null
          id?: string
          indicadores_suporte?: Json | null
          lacunas_relacionadas?: string[] | null
          periodo: string
          relevancia_cerd_iv?: boolean | null
          relevancia_common_core?: boolean | null
          secao_relatorio?: string | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          argumento_central?: string
          artigos_convencao?: string[] | null
          created_at?: string
          eixos_tematicos?:
            | Database["public"]["Enums"]["thematic_axis"][]
            | null
          evidencias?: string[] | null
          grupos_focais?:
            | Database["public"]["Enums"]["focal_group_type"][]
            | null
          id?: string
          indicadores_suporte?: Json | null
          lacunas_relacionadas?: string[] | null
          periodo?: string
          relevancia_cerd_iv?: boolean | null
          relevancia_common_core?: boolean | null
          secao_relatorio?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      dados_orcamentarios: {
        Row: {
          ano: number
          artigos_convencao: string[] | null
          created_at: string
          descritivo: string | null
          dotacao_autorizada: number | null
          dotacao_inicial: number | null
          eixo_tematico: string | null
          empenhado: number | null
          esfera: string
          fonte_dados: string
          grupo_focal: string | null
          id: string
          liquidado: number | null
          observacoes: string | null
          orgao: string
          pago: number | null
          percentual_execucao: number | null
          programa: string
          publico_alvo: string | null
          razao_selecao: string | null
          updated_at: string
          url_fonte: string | null
        }
        Insert: {
          ano: number
          artigos_convencao?: string[] | null
          created_at?: string
          descritivo?: string | null
          dotacao_autorizada?: number | null
          dotacao_inicial?: number | null
          eixo_tematico?: string | null
          empenhado?: number | null
          esfera: string
          fonte_dados: string
          grupo_focal?: string | null
          id?: string
          liquidado?: number | null
          observacoes?: string | null
          orgao: string
          pago?: number | null
          percentual_execucao?: number | null
          programa: string
          publico_alvo?: string | null
          razao_selecao?: string | null
          updated_at?: string
          url_fonte?: string | null
        }
        Update: {
          ano?: number
          artigos_convencao?: string[] | null
          created_at?: string
          descritivo?: string | null
          dotacao_autorizada?: number | null
          dotacao_inicial?: number | null
          eixo_tematico?: string | null
          empenhado?: number | null
          esfera?: string
          fonte_dados?: string
          grupo_focal?: string | null
          id?: string
          liquidado?: number | null
          observacoes?: string | null
          orgao?: string
          pago?: number | null
          percentual_execucao?: number | null
          programa?: string
          publico_alvo?: string | null
          razao_selecao?: string | null
          updated_at?: string
          url_fonte?: string | null
        }
        Relationships: []
      }
      data_snapshots: {
        Row: {
          arquivo_origem: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          snapshot_data: Json
          tabelas_afetadas: string[]
          total_registros: number
          usuario_id: string | null
        }
        Insert: {
          arquivo_origem?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          snapshot_data: Json
          tabelas_afetadas: string[]
          total_registros?: number
          usuario_id?: string | null
        }
        Update: {
          arquivo_origem?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          snapshot_data?: Json
          tabelas_afetadas?: string[]
          total_registros?: number
          usuario_id?: string | null
        }
        Relationships: []
      }
      documentos_balizadores_ref: {
        Row: {
          created_at: string
          id: string
          sigla: string
          tipo: string
          titulo: string
        }
        Insert: {
          created_at?: string
          id?: string
          sigla: string
          tipo: string
          titulo: string
        }
        Update: {
          created_at?: string
          id?: string
          sigla?: string
          tipo?: string
          titulo?: string
        }
        Relationships: []
      }
      documentos_normativos: {
        Row: {
          categoria: string
          created_at: string
          id: string
          metas_impactadas: string[] | null
          recomendacoes_impactadas: string[] | null
          resumo_impacto: Json | null
          secoes_impactadas: string[] | null
          snapshot_id: string | null
          status: string
          tamanho: string | null
          tipo_arquivo: string | null
          titulo: string
          total_itens_extraidos: number | null
          updated_at: string
          url_origem: string | null
        }
        Insert: {
          categoria?: string
          created_at?: string
          id?: string
          metas_impactadas?: string[] | null
          recomendacoes_impactadas?: string[] | null
          resumo_impacto?: Json | null
          secoes_impactadas?: string[] | null
          snapshot_id?: string | null
          status?: string
          tamanho?: string | null
          tipo_arquivo?: string | null
          titulo: string
          total_itens_extraidos?: number | null
          updated_at?: string
          url_origem?: string | null
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          metas_impactadas?: string[] | null
          recomendacoes_impactadas?: string[] | null
          resumo_impacto?: Json | null
          secoes_impactadas?: string[] | null
          snapshot_id?: string | null
          status?: string
          tamanho?: string | null
          tipo_arquivo?: string | null
          titulo?: string
          total_itens_extraidos?: number | null
          updated_at?: string
          url_origem?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_normativos_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "data_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      indicadores_interseccionais: {
        Row: {
          analise_interseccional: string | null
          artigos_convencao: string[] | null
          categoria: string
          created_at: string
          dados: Json
          desagregacao_classe: boolean | null
          desagregacao_deficiencia: boolean | null
          desagregacao_genero: boolean | null
          desagregacao_idade: boolean | null
          desagregacao_orientacao_sexual: boolean | null
          desagregacao_raca: boolean | null
          desagregacao_territorio: boolean | null
          documento_origem: string[] | null
          fonte: string
          id: string
          lacunas_relacionadas: string[] | null
          nome: string
          subcategoria: string | null
          tendencia: string | null
          updated_at: string
          url_fonte: string | null
        }
        Insert: {
          analise_interseccional?: string | null
          artigos_convencao?: string[] | null
          categoria: string
          created_at?: string
          dados: Json
          desagregacao_classe?: boolean | null
          desagregacao_deficiencia?: boolean | null
          desagregacao_genero?: boolean | null
          desagregacao_idade?: boolean | null
          desagregacao_orientacao_sexual?: boolean | null
          desagregacao_raca?: boolean | null
          desagregacao_territorio?: boolean | null
          documento_origem?: string[] | null
          fonte: string
          id?: string
          lacunas_relacionadas?: string[] | null
          nome: string
          subcategoria?: string | null
          tendencia?: string | null
          updated_at?: string
          url_fonte?: string | null
        }
        Update: {
          analise_interseccional?: string | null
          artigos_convencao?: string[] | null
          categoria?: string
          created_at?: string
          dados?: Json
          desagregacao_classe?: boolean | null
          desagregacao_deficiencia?: boolean | null
          desagregacao_genero?: boolean | null
          desagregacao_idade?: boolean | null
          desagregacao_orientacao_sexual?: boolean | null
          desagregacao_raca?: boolean | null
          desagregacao_territorio?: boolean | null
          documento_origem?: string[] | null
          fonte?: string
          id?: string
          lacunas_relacionadas?: string[] | null
          nome?: string
          subcategoria?: string | null
          tendencia?: string | null
          updated_at?: string
          url_fonte?: string | null
        }
        Relationships: []
      }
      lacunas_identificadas: {
        Row: {
          acoes_brasil: string[] | null
          artigos_convencao: string[] | null
          created_at: string
          data_documento: string
          descricao_lacuna: string
          documento_onu: string
          eixo_tematico: Database["public"]["Enums"]["thematic_axis"]
          evidencias_encontradas: string[] | null
          fontes_dados: string[] | null
          grupo_focal: Database["public"]["Enums"]["focal_group_type"]
          id: string
          indicadores_relacionados: Json | null
          interseccionalidades: string[] | null
          paragrafo: string
          periodo_analise_fim: number
          periodo_analise_inicio: number
          prioridade: Database["public"]["Enums"]["priority_level"]
          resposta_sugerida_cerd_iv: string | null
          resposta_sugerida_common_core: string | null
          status_cumprimento: Database["public"]["Enums"]["compliance_status"]
          tema: string
          texto_original_onu: string | null
          tipo_observacao: Database["public"]["Enums"]["observation_type"]
          updated_at: string
        }
        Insert: {
          acoes_brasil?: string[] | null
          artigos_convencao?: string[] | null
          created_at?: string
          data_documento?: string
          descricao_lacuna: string
          documento_onu?: string
          eixo_tematico: Database["public"]["Enums"]["thematic_axis"]
          evidencias_encontradas?: string[] | null
          fontes_dados?: string[] | null
          grupo_focal?: Database["public"]["Enums"]["focal_group_type"]
          id?: string
          indicadores_relacionados?: Json | null
          interseccionalidades?: string[] | null
          paragrafo: string
          periodo_analise_fim?: number
          periodo_analise_inicio?: number
          prioridade?: Database["public"]["Enums"]["priority_level"]
          resposta_sugerida_cerd_iv?: string | null
          resposta_sugerida_common_core?: string | null
          status_cumprimento?: Database["public"]["Enums"]["compliance_status"]
          tema: string
          texto_original_onu?: string | null
          tipo_observacao: Database["public"]["Enums"]["observation_type"]
          updated_at?: string
        }
        Update: {
          acoes_brasil?: string[] | null
          artigos_convencao?: string[] | null
          created_at?: string
          data_documento?: string
          descricao_lacuna?: string
          documento_onu?: string
          eixo_tematico?: Database["public"]["Enums"]["thematic_axis"]
          evidencias_encontradas?: string[] | null
          fontes_dados?: string[] | null
          grupo_focal?: Database["public"]["Enums"]["focal_group_type"]
          id?: string
          indicadores_relacionados?: Json | null
          interseccionalidades?: string[] | null
          paragrafo?: string
          periodo_analise_fim?: number
          periodo_analise_inicio?: number
          prioridade?: Database["public"]["Enums"]["priority_level"]
          resposta_sugerida_cerd_iv?: string | null
          resposta_sugerida_common_core?: string | null
          status_cumprimento?: Database["public"]["Enums"]["compliance_status"]
          tema?: string
          texto_original_onu?: string | null
          tipo_observacao?: Database["public"]["Enums"]["observation_type"]
          updated_at?: string
        }
        Relationships: []
      }
      respostas_lacunas_cerd_iii: {
        Row: {
          created_at: string
          critica_original: string
          evidencias_qualitativas: string[] | null
          evidencias_quantitativas: Json | null
          grau_atendimento: Database["public"]["Enums"]["compliance_status"]
          id: string
          justificativa_avaliacao: string | null
          lacunas_remanescentes: string[] | null
          paragrafo_cerd_iii: string
          resposta_brasil: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          critica_original: string
          evidencias_qualitativas?: string[] | null
          evidencias_quantitativas?: Json | null
          grau_atendimento: Database["public"]["Enums"]["compliance_status"]
          id?: string
          justificativa_avaliacao?: string | null
          lacunas_remanescentes?: string[] | null
          paragrafo_cerd_iii: string
          resposta_brasil: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          critica_original?: string
          evidencias_qualitativas?: string[] | null
          evidencias_quantitativas?: Json | null
          grau_atendimento?: Database["public"]["Enums"]["compliance_status"]
          id?: string
          justificativa_avaliacao?: string | null
          lacunas_remanescentes?: string[] | null
          paragrafo_cerd_iii?: string
          resposta_brasil?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      compliance_status:
        | "cumprido"
        | "parcialmente_cumprido"
        | "nao_cumprido"
        | "retrocesso"
        | "em_andamento"
      focal_group_type:
        | "negros"
        | "indigenas"
        | "quilombolas"
        | "ciganos"
        | "religioes_matriz_africana"
        | "juventude_negra"
        | "mulheres_negras"
        | "lgbtqia_negros"
        | "pcd_negros"
        | "idosos_negros"
        | "geral"
      observation_type:
        | "preocupacao"
        | "recomendacao"
        | "solicitacao"
        | "elogio"
      priority_level: "critica" | "alta" | "media" | "baixa"
      thematic_axis:
        | "legislacao_justica"
        | "politicas_institucionais"
        | "seguranca_publica"
        | "saude"
        | "educacao"
        | "trabalho_renda"
        | "terra_territorio"
        | "cultura_patrimonio"
        | "participacao_social"
        | "dados_estatisticas"
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
      app_role: ["admin", "moderator", "user"],
      compliance_status: [
        "cumprido",
        "parcialmente_cumprido",
        "nao_cumprido",
        "retrocesso",
        "em_andamento",
      ],
      focal_group_type: [
        "negros",
        "indigenas",
        "quilombolas",
        "ciganos",
        "religioes_matriz_africana",
        "juventude_negra",
        "mulheres_negras",
        "lgbtqia_negros",
        "pcd_negros",
        "idosos_negros",
        "geral",
      ],
      observation_type: [
        "preocupacao",
        "recomendacao",
        "solicitacao",
        "elogio",
      ],
      priority_level: ["critica", "alta", "media", "baixa"],
      thematic_axis: [
        "legislacao_justica",
        "politicas_institucionais",
        "seguranca_publica",
        "saude",
        "educacao",
        "trabalho_renda",
        "terra_territorio",
        "cultura_patrimonio",
        "participacao_social",
        "dados_estatisticas",
      ],
    },
  },
} as const
