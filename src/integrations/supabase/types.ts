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
      indicadores_interseccionais: {
        Row: {
          analise_interseccional: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
