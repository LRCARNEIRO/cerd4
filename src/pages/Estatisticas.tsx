import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers, Users, Rainbow, Accessibility, Baby, Briefcase, 
  FileText, BarChart3, Shield, Database, Globe, BookOpen, PlusCircle,
  Landmark, HeartPulse
} from 'lucide-react';

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

export default function Estatisticas() {
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

      <Tabs defaultValue="common-core" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1 justify-start">
          {/* Common Core - Nova aba principal */}
          <TabsTrigger value="common-core" className="gap-1 bg-primary/10">
            <BookOpen className="w-4 h-4" /> Common Core (77)
          </TabsTrigger>
          
          {/* DADOS NOVOS - Nova aba */}
          <TabsTrigger value="dados-novos" className="gap-1 bg-accent/20">
            <PlusCircle className="w-4 h-4" /> Dados Novos
          </TabsTrigger>
          
          {/* Dados gerais e CERD */}
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
          <TabsTrigger value="fontes-dados" className="gap-1">
            <Globe className="w-4 h-4" /> Fontes de Dados
          </TabsTrigger>
          
          {/* Interseccionais */}
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

        {/* Common Core - 77 Tabelas */}
        <TabsContent value="common-core">
          <CommonCoreTab />
        </TabsContent>

        {/* DADOS NOVOS - Indicadores ainda não registrados */}
        <TabsContent value="dados-novos">
          <DadosNovosTab />
        </TabsContent>

        {/* Dados Gerais / Common Core */}
        <TabsContent value="dados-gerais">
          <DadosGeraisTab />
        </TabsContent>

        {/* Segurança, Saúde, Educação */}
        <TabsContent value="seguranca-saude-educacao">
          <SegurancaSaudeEducacaoTab />
        </TabsContent>

        {/* Lacunas CERD */}
        <TabsContent value="lacunas-cerd">
          <LacunasCerdTab />
        </TabsContent>


        {/* Indicadores do banco de dados */}
        <TabsContent value="indicadores-db">
          <IndicadoresDbTab />
        </TabsContent>

        {/* Adm Pública - MUNIC/ESTADIC 2024 */}
        <TabsContent value="adm-publica">
          <AdmPublicaSection />
        </TabsContent>

        {/* COVID-19 e Desigualdade Racial */}
        <TabsContent value="covid-racial">
          <CovidRacialSection />
        </TabsContent>

        {/* Fontes de Dados */}
        <TabsContent value="fontes-dados">
          <FontesDadosTab />
        </TabsContent>

        {/* Vulnerabilidades cruzadas */}
        <TabsContent value="vulnerabilidades">
          <VulnerabilidadesTab />
        </TabsContent>

        {/* Raça × Gênero */}
        <TabsContent value="raca-genero">
          <RacaGeneroTab />
        </TabsContent>


        {/* LGBTQIA+ */}
        <TabsContent value="lgbtqia">
          <LgbtqiaTab />
        </TabsContent>

        {/* Deficiência */}
        <TabsContent value="deficiencia">
          <DeficienciaTab />
        </TabsContent>

        {/* Juventude */}
        <TabsContent value="juventude">
          <JuventudeTab />
        </TabsContent>

        {/* Classe Social */}
        <TabsContent value="classe">
          <ClasseSocialTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
