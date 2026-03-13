import { useState } from 'react';
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
import { LacunasCerdTab } from '@/components/estatisticas/LacunasCerdTab';
import { IndicadoresDbTab } from '@/components/estatisticas/IndicadoresDbTab';

import { FontesDadosTab } from '@/components/estatisticas/FontesDadosTab';
import { CommonCoreTab } from '@/components/estatisticas/CommonCoreTab';
import { DadosNovosTab } from '@/components/estatisticas/DadosNovosTab';
import { AdmPublicaSection } from '@/components/estatisticas/AdmPublicaSection';
import { CovidRacialSection } from '@/components/estatisticas/CovidRacialSection';
import { GruposFocaisTab } from '@/components/estatisticas/GruposFocaisTab';
import { OdsRacialTab } from '@/components/estatisticas/OdsRacialTab';
// TOTAL_ODS_RACIAL is now dynamic from DB
export default function Estatisticas() {
  const [filtroAuditoria, setFiltroAuditoria] = useState<'todos' | 'auditados' | 'pendentes'>('todos');
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: odsRacialFromDb = [] } = useOdsRacialData();
  
  const TOTAL_ODS_RACIAL = odsRacialFromDb.length;
  
  // BD indicators
  const bdTotal = (indicadores || []).length;
  const bdAuditados = (indicadores || []).filter((i: any) => i.auditado_manualmente).length;
  const bdPendentes = bdTotal - bdAuditados;

  // Static hardcoded indicators across tabs (counted from StatisticsData.ts exports)
  // These are the data series/constants rendered in static tabs that are NOT in the BD
  const STATIC_TAB_COUNTS = {
    'Dados Gerais (demograficos)': { total: 8, auditados: 8 },
    'Dados Gerais (composição racial série)': { total: 7, auditados: 7 },
    'Dados Gerais (socioeconômicos série)': { total: 7, auditados: 2 },  // 2018-2022 pendentes
    'Dados Gerais (rendimentos Censo)': { total: 1, auditados: 0 },
    'Segurança (homicídio/letalidade série)': { total: 7, auditados: 7 },
    'Saúde (mortalidade materna/infantil série)': { total: 6, auditados: 6 },
    'Educação (ensino superior/analfabetismo série)': { total: 5, auditados: 5 },
    'Educação (evasão escolar série)': { total: 1, auditados: 1 },
    'Raça × Gênero (trabalho)': { total: 4, auditados: 4 },
    'Raça × Gênero (saúde materna)': { total: 2, auditados: 2 },
    'Raça × Gênero (educação)': { total: 2, auditados: 2 },
    'Vulnerabilidades (violência)': { total: 3, auditados: 3 },
    'Vulnerabilidades (chefia familiar)': { total: 1, auditados: 1 },
    'Classe Social': { total: 2, auditados: 2 },
    'Juventude': { total: 2, auditados: 2 },
    'LGBTQIA+ (ANTRA série)': { total: 9, auditados: 3 },  // 2023+ auditados
    'Povos Tradicionais': { total: 4, auditados: 4 },
    'Adm Pública': { total: 1, auditados: 0 },
    'COVID Racial': { total: 1, auditados: 0 },
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
                <p className="text-sm font-semibold">Auditoria Manual — Indicadores (BD + ODS Racial)</p>
                <p className="text-xs text-muted-foreground">
                  {totalAuditados} de {totalIndicadores} auditados ({totalPendentes} pendentes) · inclui {TOTAL_ODS_RACIAL} ODS Racial ✓
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
        </CardContent>
      </Card>

      <Tabs defaultValue="common-core" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1 justify-start">
          <TabsTrigger value="common-core" className="gap-1 bg-primary/10">
            <BookOpen className="w-4 h-4" /> Common Core (77)
          </TabsTrigger>
          <TabsTrigger value="dados-novos" className="gap-1 bg-accent/20">
            <PlusCircle className="w-4 h-4" /> Dados Novos
          </TabsTrigger>
          <TabsTrigger value="dados-gerais" className="gap-1">
            <Database className="w-4 h-4" /> Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="seguranca-saude-educacao" className="gap-1">
            <Shield className="w-4 h-4" /> Segurança/Saúde/Educação
          </TabsTrigger>
          <TabsTrigger value="lacunas-cerd" className="gap-1">
            <FileText className="w-4 h-4" /> Lacunas CERD
          </TabsTrigger>
          <TabsTrigger value="indicadores-db" className="gap-1">
            <BarChart3 className="w-4 h-4" /> Indicadores (BD)
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
          <TabsTrigger value="fontes-dados" className="gap-1">
            <Globe className="w-4 h-4" /> Fontes de Dados
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
        <TabsContent value="dados-novos"><DadosNovosTab /></TabsContent>
        <TabsContent value="dados-gerais"><DadosGeraisTab /></TabsContent>
        <TabsContent value="seguranca-saude-educacao"><SegurancaSaudeEducacaoTab /></TabsContent>
        <TabsContent value="lacunas-cerd"><LacunasCerdTab /></TabsContent>
        <TabsContent value="indicadores-db"><IndicadoresDbTab filtroAuditoria={filtroAuditoria} /></TabsContent>
        <TabsContent value="adm-publica"><AdmPublicaSection /></TabsContent>
        <TabsContent value="covid-racial"><CovidRacialSection /></TabsContent>
        <TabsContent value="grupos-focais"><GruposFocaisTab /></TabsContent>
        <TabsContent value="ods-racial"><OdsRacialTab /></TabsContent>
        <TabsContent value="fontes-dados"><FontesDadosTab /></TabsContent>
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
