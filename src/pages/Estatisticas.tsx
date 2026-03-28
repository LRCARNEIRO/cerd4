import { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers, Users, Rainbow, Accessibility, Baby, Briefcase, 
  FileText, BarChart3, Shield, Database, Globe, BookOpen, PlusCircle,
  Landmark, HeartPulse, UsersRound, CheckCircle2, CircleDashed
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { useOdsRacialData } from '@/hooks/useOdsRacialData';

// Componentes de abas
import { DadosGeraisTab } from '@/components/estatisticas/DadosGeraisTab';
import { SegurancaSaudeEducacaoTab } from '@/components/estatisticas/SegurancaSaudeEducacaoTab';
import { VulnerabilidadesTab } from '@/components/estatisticas/VulnerabilidadesTab';
import { 
  RacaGeneroTab, 
  LgbtqiaTab, 
  DeficienciaTab, 
  JuventudeTab, 
  ClasseSocialTab 
} from '@/components/estatisticas/InterseccionalTabs';
import { IndicadoresDbTab } from '@/components/estatisticas/IndicadoresDbTab';


import { CommonCoreTab } from '@/components/estatisticas/CommonCoreTab';
// DadosNovosTab removed — merged into ComplementoCerd3Tab
import { AdmPublicaSection } from '@/components/estatisticas/AdmPublicaSection';
import { CovidRacialSection } from '@/components/estatisticas/CovidRacialSection';
import { GruposFocaisTab } from '@/components/estatisticas/GruposFocaisTab';
import { OdsRacialTab } from '@/components/estatisticas/OdsRacialTab';
import { MirrorIngestionPanel } from '@/components/estatisticas/MirrorIngestionPanel';
import { ComplementoCerd3Tab } from '@/components/estatisticas/ComplementoCerd3Tab';
import { COMPLEMENTO_CERD3_COUNT } from '@/components/estatisticas/ComplementoCerd3Data';
import { KeywordSearch } from '@/components/estatisticas/KeywordSearch';
// TOTAL_ODS_RACIAL is now dynamic from DB
export default function Estatisticas() {
  const [filtroAuditoria, setFiltroAuditoria] = useState<'todos' | 'auditados' | 'pendentes'>('todos');
  const [activeTab, setActiveTab] = useState('common-core');
  const handleSearchNav = useCallback((tabValue: string) => setActiveTab(tabValue), []);
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: odsRacialFromDb = [] } = useOdsRacialData();
  
  const TOTAL_ODS_RACIAL = odsRacialFromDb.length;
  
  // BD indicators
  const bdTotal = (indicadores || []).length;
  const bdAuditados = (indicadores || []).filter((i: any) => i.auditado_manualmente).length;
  const bdPendentes = bdTotal - bdAuditados;

  // Comprehensive count of ALL auditable data items across static tabs
  // Each row in a series, each constant, each card = 1 auditable item
  const STATIC_TAB_COUNTS = {
    // DADOS GERAIS
    'dadosDemograficos (10 constantes)': { total: 10, auditados: 10 },
    'evolucaoComposicaoRacial (7 anos)': { total: 7, auditados: 7 },
    'indicadoresSocioeconomicos (7 anos × 4 métricas)': { total: 28, auditados: 8 },  // 2023-2024 auditados (8 campos), 2018-2022 pendentes (20 campos)
    'razaoRendaRacial': { total: 1, auditados: 1 },
    'rendimentosCenso2022 (6 raças + Gini)': { total: 7, auditados: 0 },
    // SEGURANÇA
    'segurancaPublica (7 anos × 5 métricas)': { total: 35, auditados: 35 },
    'feminicidioSerie (7 anos × 2 métricas)': { total: 14, auditados: 2 },  // só 2024 auditado
    'atlasViolencia2025 (12 constantes)': { total: 12, auditados: 12 },
    'jovensNegrosViolencia (3 constantes)': { total: 3, auditados: 3 },
    // EDUCAÇÃO
    'educacaoSerieHistorica (5 anos × 4 métricas)': { total: 20, auditados: 20 },
    'analfabetismoGeral2024 (7 constantes)': { total: 7, auditados: 7 },
    'evasaoEscolarSerie (5 anos × 2 métricas)': { total: 10, auditados: 10 },
    // SAÚDE
    'saudeSerieHistorica (7 anos × 4 métricas)': { total: 28, auditados: 28 },
    // HABITAÇÃO
    'deficitHabitacionalSerie (3 anos × 2 raças)': { total: 6, auditados: 6 },
    'cadUnicoPerfilRacial (8 anos × 2 raças)': { total: 16, auditados: 16 },
    // RAÇA × GÊNERO
    'interseccionalidadeTrabalho (4 grupos × 3 métricas)': { total: 12, auditados: 12 },
    'trabalhoRacaGenero (3 indicadores × 4 grupos)': { total: 12, auditados: 12 },
    'educacaoRacaGenero (5 indicadores × 4 grupos)': { total: 20, auditados: 20 },
    'chefiaFamiliarRacaGenero (18 constantes)': { total: 18, auditados: 18 },
    'saudeMaternaRaca (8 constantes)': { total: 8, auditados: 8 },
    // DEFICIÊNCIA
    'deficienciaPorRaca (5 raças × 3 métricas)': { total: 15, auditados: 15 },
    'disparidadesPcd1459 (3 raças × 2 métricas)': { total: 6, auditados: 6 },
    // LGBTQIA+
    'serieAntraTrans (9 anos × 4 métricas)': { total: 36, auditados: 36 },
    'lgbtqiaPorRaca (3 métricas)': { total: 3, auditados: 3 },
    // VULNERABILIDADES
    'violenciaInterseccional (3 tipos × 2 métricas)': { total: 6, auditados: 6 },
    // JUVENTUDE
    'juventudeNegra (2 indicadores × 2 métricas)': { total: 4, auditados: 4 },
    // CLASSE SOCIAL
    'classePorRaca (6 faixas × 4 raças)': { total: 24, auditados: 24 },
    // POVOS TRADICIONAIS
    'povosTradicionais.indigenas (16 constantes)': { total: 16, auditados: 16 },
    'povosTradicionais.quilombolas (14 constantes)': { total: 14, auditados: 14 },
    'povosTradicionais.populacaoNegra (8 constantes infra)': { total: 8, auditados: 0 },
    'povosTradicionais.ciganos (5 constantes)': { total: 5, auditados: 5 },
    // EVOLUÇÃO DESIGUALDADE
    'evolucaoDesigualdade (7 anos × 3 razões)': { total: 21, auditados: 7 },  // 2024 auditado
    // ADM PÚBLICA / COVID (componentes próprios)
    'AdmPública/SINAPIR': { total: 5, auditados: 5 },
    'CovidRacial': { total: 18, auditados: 18 },
    // GRUPOS FOCAIS — AUDITADO MANUALMENTE 17/03/2026
    'GruposFocais/Séries Temporais (mirror SSoT)': { total: 15, auditados: 15 },
    'GruposFocais/Direitos Territoriais (quilombolas 14 + indígenas 18)': { total: 32, auditados: 32 },
    'GruposFocais/Vulnerabilidade (7 indicadores)': { total: 7, auditados: 7 },
    'GruposFocais/gruposFocaisData (5 grupos × ~8 campos)': { total: 40, auditados: 40 },
    // COMPLEMENTARES CERD III — AUDITADO MANUALMENTE 17/03/2026
    'ComplementoCerd3/27 indicadores': { total: 27, auditados: 27 },
  };

  const staticTotal = Object.values(STATIC_TAB_COUNTS).reduce((s, v) => s + v.total, 0);
  const staticAuditados = Object.values(STATIC_TAB_COUNTS).reduce((s, v) => s + v.auditados, 0);
  const staticPendentes = staticTotal - staticAuditados;

  const totalIndicadores = bdTotal + staticTotal;
  const totalAuditados = bdAuditados + staticAuditados;
  const totalPendentes = bdPendentes + staticPendentes;

  return (
    <DashboardLayout
      title="Estatísticas e Indicadores"
      subtitle="Dados gerais, interseccionais e orçamentários para os relatórios Common Core e CERD IV (2018-2025)"
    >
      {/* Alerta Metodológico */}
      <Card className="mb-6 border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Layers className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Base de Dados Consolidada</h3>
              <p className="text-sm text-muted-foreground">
                Esta seção consolida <strong>todos os dados</strong> necessários para os relatórios Common Core e CERD IV. 
                Inclui dados demográficos gerais, indicadores socioeconômicos com evolução temporal, 
                análises interseccionais (raça × gênero × idade × classe × orientação sexual × deficiência) e 
                execução orçamentária de políticas públicas.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-primary/10 text-primary">Common Core</Badge>
                <Badge className="bg-primary/10 text-primary">CERD IV</Badge>
                <Badge className="bg-primary/10 text-primary">2018-2025</Badge>
                <Badge className="bg-accent text-accent-foreground">Interseccional</Badge>
                <Badge variant="outline">Orçamentário</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtro de Auditoria — nível raiz */}
       <Card className="mb-6 border-l-4 border-l-success">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm font-semibold">Auditoria Manual — Todos os Indicadores (BD + Abas Estáticas)</p>
                <p className="text-xs text-muted-foreground">
                  {totalAuditados} de {totalIndicadores} auditados ({totalPendentes} pendentes) · BD: {bdAuditados}/{bdTotal} · Estáticos: {staticAuditados}/{staticTotal}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['todos', 'auditados', 'pendentes'] as const).map(f => (
                <Badge
                  key={f}
                  variant={filtroAuditoria === f ? "default" : "outline"}
                  className={cn("cursor-pointer transition-colors", 
                    filtroAuditoria === f && f === 'pendentes' && "bg-chart-4 text-chart-4-foreground",
                    filtroAuditoria === f && f === 'auditados' && "bg-success text-success-foreground"
                  )}
                  onClick={() => setFiltroAuditoria(f)}
                >
                  {f === 'todos' && 'Todos'}
                  {f === 'auditados' && `✓ Auditados (${totalAuditados})`}
                  {f === 'pendentes' && `⏳ Pendentes (${totalPendentes})`}
                </Badge>
              ))}
            </div>
          </div>
          {/* Detail breakdown when pendentes filter is active */}
          {filtroAuditoria === 'pendentes' && totalPendentes > 0 && (
            <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">Detalhamento dos itens pendentes:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {bdPendentes > 0 && (
                  <Badge variant="outline" className="text-xs bg-destructive/5 text-destructive border-destructive/20">
                    BD: {bdPendentes} pendentes
                  </Badge>
                )}
                {Object.entries(STATIC_TAB_COUNTS)
                  .filter(([, v]) => v.total - v.auditados > 0)
                  .map(([key, v]) => (
                    <Badge key={key} variant="outline" className="text-xs bg-chart-4/5 text-chart-4 border-chart-4/20">
                      {key}: {v.total - v.auditados}
                    </Badge>
                  ))
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Espelho Seguro — Painel de Migração */}
      <MirrorIngestionPanel />

      {/* Busca por Palavra-Chave */}
      <div className="mt-6 mb-4">
        <KeywordSearch onNavigateTab={handleSearchNav} />
      </div>

      <div className="mt-2" />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1 justify-start">
          <TabsTrigger value="common-core" className="gap-1 bg-primary/10">
            <BookOpen className="w-4 h-4" /> Common Core (77)
          </TabsTrigger>
          <TabsTrigger value="complemento-cerd3" className="gap-1 bg-chart-4/10">
            <FileText className="w-4 h-4" /> Complemento CERD III ({COMPLEMENTO_CERD3_COUNT})
          </TabsTrigger>
          <TabsTrigger value="dados-gerais" className="gap-1">
            <Database className="w-4 h-4" /> Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="seguranca-saude-educacao" className="gap-1">
            <Shield className="w-4 h-4" /> Segurança/Saúde/Educação
          </TabsTrigger>
          <TabsTrigger value="indicadores-db" className="gap-1">
            <BarChart3 className="w-4 h-4" /> Espelho Seguro (BD)
          </TabsTrigger>
          <TabsTrigger value="adm-publica" className="gap-1 bg-chart-3/10">
            <Landmark className="w-4 h-4" /> Adm Pública
          </TabsTrigger>
          <TabsTrigger value="covid-racial" className="gap-1 bg-destructive/10">
            <HeartPulse className="w-4 h-4" /> COVID
          </TabsTrigger>
          <TabsTrigger value="grupos-focais" className="gap-1 bg-primary/10">
            <UsersRound className="w-4 h-4" /> Grupos Focais
          </TabsTrigger>
          <TabsTrigger value="ods-racial" className="gap-1" style={{ backgroundColor: 'rgba(221,19,103,0.1)' }}>
            <Globe className="w-4 h-4" /> ODS Racial ({TOTAL_ODS_RACIAL || '...'})
          </TabsTrigger>
          <TabsTrigger value="vulnerabilidades" className="gap-1">
            <Layers className="w-4 h-4" /> Vulnerabilidades
          </TabsTrigger>
          <TabsTrigger value="raca-genero" className="gap-1">
            <Users className="w-4 h-4" /> Raça × Gênero
          </TabsTrigger>
          <TabsTrigger value="lgbtqia" className="gap-1">
            <Rainbow className="w-4 h-4" /> LGBTQIA+
          </TabsTrigger>
          <TabsTrigger value="deficiencia" className="gap-1">
            <Accessibility className="w-4 h-4" /> Deficiência
          </TabsTrigger>
          <TabsTrigger value="juventude" className="gap-1">
            <Baby className="w-4 h-4" /> Juventude
          </TabsTrigger>
          <TabsTrigger value="classe" className="gap-1">
            <Briefcase className="w-4 h-4" /> Classe Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="common-core"><CommonCoreTab /></TabsContent>
        <TabsContent value="complemento-cerd3"><ComplementoCerd3Tab /></TabsContent>
        <TabsContent value="dados-gerais"><DadosGeraisTab /></TabsContent>
        <TabsContent value="seguranca-saude-educacao"><SegurancaSaudeEducacaoTab /></TabsContent>
        
        <TabsContent value="indicadores-db"><IndicadoresDbTab filtroAuditoria={filtroAuditoria} /></TabsContent>
        <TabsContent value="adm-publica"><AdmPublicaSection /></TabsContent>
        <TabsContent value="covid-racial"><CovidRacialSection /></TabsContent>
        <TabsContent value="grupos-focais"><GruposFocaisTab /></TabsContent>
        <TabsContent value="ods-racial"><OdsRacialTab /></TabsContent>
        
        <TabsContent value="vulnerabilidades"><VulnerabilidadesTab /></TabsContent>
        <TabsContent value="raca-genero"><RacaGeneroTab /></TabsContent>
        <TabsContent value="lgbtqia"><LgbtqiaTab /></TabsContent>
        <TabsContent value="deficiencia"><DeficienciaTab /></TabsContent>
        <TabsContent value="juventude"><JuventudeTab /></TabsContent>
        <TabsContent value="classe"><ClasseSocialTab /></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
