import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, AlertTriangle, FileText, ExternalLink, Database, Calendar, TrendingUp, TrendingDown, Minus, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLacunasIdentificadas, useLacunasStats } from '@/hooks/useLacunasData';
import { SerieTemporalGrupos } from '@/components/grupos-focais/SerieTemporalGrupos';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// Dados SIDRA/IBGE auditados com metadados completos
const gruposFocaisData = {
  quilombolas: {
    nome: 'Quilombolas',
    populacao: 1330186,
    fonte: 'IBGE - Censo Demográfico 2022',
    tabela: 'Tabela 9578 - SIDRA (Pessoas residentes em territórios quilombolas)',
    link: 'https://sidra.ibge.gov.br/tabela/9578',
    ultimaAtualizacao: '2023-10-27',
    serieTemporal: [
      { ano: 2022, valor: 1330186, fonte: 'Censo 2022' },
    ],
    observacoesONU: ['47', '48', '49'],
    politicas: ['PNGTAQ (Decreto 11.786/2023)', 'Programa Brasil Quilombola', 'Titulação de Territórios (INCRA)'],
    indicadores: ['Territórios titulados', 'Acesso a água encanada', 'Acesso a energia elétrica', 'Renda média'],
    notas: 'Primeira contagem específica de quilombolas no Censo brasileiro. Dado do universo, não microdados.',
  },
  indigenas: {
    nome: 'Indígenas',
    // Dados do Censo 2022 - critério "Pessoas Indígenas" (metodologia ampliada)
    // Fonte oficial: https://www.ibge.gov.br/brasil-indigena/
    populacao: 1694836,
    fonte: 'IBGE - Censo Demográfico 2022 (Pessoas Indígenas)',
    // CORREÇÃO: Tabela 9674 é sobre INTERNET, não população indígena!
    // Tabela correta: 9595 (Pessoas Indígenas) ou consulta especial Brasil Indígena
    tabela: 'Tabela 9595 - SIDRA (Pessoas Indígenas)',
    link: 'https://sidra.ibge.gov.br/tabela/9595',
    linkEspecial: 'https://www.ibge.gov.br/brasil-indigena/',
    ultimaAtualizacao: '2024-10-24',
    // Série temporal com dados anteriores (Cor ou Raça) e novo critério
    serieTemporal: [
      { ano: 2010, valor: 896917, fonte: 'Censo 2010 - Pessoas Indígenas' },
      { ano: 2022, valor: 1694836, fonte: 'Censo 2022 - Pessoas Indígenas' },
    ],
    populacaoCorRaca: 1227642, // Tabela 9605 - Cor ou Raça (indígena como categoria)
    observacoesONU: ['50', '51', '52', '53'],
    politicas: ['Demarcação de Terras Indígenas (FUNAI)', 'SESAI - Saúde Indígena', 'Educação Escolar Indígena'],
    indicadores: ['Terras homologadas', 'Etnias reconhecidas', 'Línguas vivas', 'Mortalidade infantil indígena'],
    notas: 'Censo 2022: metodologia ampliada contou 1.694.836 Pessoas Indígenas. Cor/Raça (Tab. 9605): 1.227.642. Fonte: ibge.gov.br/brasil-indigena',
  },
  ciganos: {
    nome: 'Ciganos/Roma',
    populacao: null,
    fonte: 'Lacuna crítica - Censo 2022 não incluiu pergunta específica',
    tabela: 'N/A',
    link: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html',
    ultimaAtualizacao: '2022-08-30',
    serieTemporal: [],
    observacoesONU: ['54', '55'],
    politicas: ['Decreto 8.750/2016 (CNPCT incluía ciganos)', 'Política Nacional para Povo Cigano (em elaboração)'],
    indicadores: [],
    notas: 'O CERD expressou preocupação específica (§54-55) sobre ausência de dados oficiais. Estimativas não-oficiais variam de 500 mil a 1,5 milhão.',
  },
  juventude_negra: {
    nome: 'Juventude Negra (15-29 anos)',
    // Calculado: população preta + parda na faixa 15-29 anos
    populacao: 25800000, // Estimativa baseada em proporções PNAD Contínua
    fonte: 'IBGE - PNAD Contínua 2023 (Tabela 6403)',
    tabela: 'Tabela 6403 - SIDRA',
    link: 'https://sidra.ibge.gov.br/tabela/6403',
    ultimaAtualizacao: '2024-02-29',
    serieTemporal: [
      { ano: 2018, valor: 26200000, fonte: 'PNAD Contínua' },
      { ano: 2019, valor: 26100000, fonte: 'PNAD Contínua' },
      { ano: 2020, valor: 25900000, fonte: 'PNAD Contínua' },
      { ano: 2021, valor: 25800000, fonte: 'PNAD Contínua' },
      { ano: 2022, valor: 25700000, fonte: 'PNAD Contínua' },
      { ano: 2023, valor: 25800000, fonte: 'PNAD Contínua' },
    ],
    observacoesONU: ['32', '33', '34', '35', '36'],
    politicas: ['Programa Juventude Negra Viva (Decreto 11.956/2024)', 'Plano Juventude Viva'],
    indicadores: ['Taxa de homicídios 12-29', 'Taxa de desemprego', 'Evasão escolar', 'Nem-nem'],
    notas: 'Grupo prioritário para políticas de segurança e empregabilidade. Letalidade 2,5x maior que jovens brancos.',
  },
  populacao_negra: {
    nome: 'População Negra (Preta + Parda)',
    populacao: 112739744,
    fonte: 'IBGE - Censo Demográfico 2022',
    tabela: 'Tabela 9605 - SIDRA',
    link: 'https://sidra.ibge.gov.br/tabela/9605',
    ultimaAtualizacao: '2022-12-22',
    serieTemporal: [
      { ano: 2010, valor: 97171614, fonte: 'Censo 2010' },
      { ano: 2022, valor: 112739744, fonte: 'Censo 2022' },
    ],
    detalhamento: {
      preta: 20656458,
      parda: 92083286,
    },
    observacoesONU: ['12', '14', '15', '17', '19', '23', '28', '32'],
    politicas: ['Estatuto da Igualdade Racial (Lei 12.288/2010)', 'Lei de Cotas (Lei 12.711/2012)', 'PNSIPN'],
    indicadores: ['IDH por raça', 'Renda média', 'Anos de estudo', 'Taxa de desemprego'],
    notas: 'Dados do Universo (Censo), não microdados. 55,5% da população total.',
  },
  mulheres_negras: {
    nome: 'Mulheres Negras',
    populacao: 59000000, // Estimativa baseada em proporção 52% mulheres na pop negra
    fonte: 'IBGE - Censo Demográfico 2022 + cálculo proporcional',
    tabela: 'Tabela 9605 - SIDRA (cruzamento sexo × cor)',
    link: 'https://sidra.ibge.gov.br/tabela/9605',
    ultimaAtualizacao: '2022-12-22',
    serieTemporal: [],
    observacoesONU: ['15', '17', '23', '28'],
    politicas: ['PNAISM', 'Lei Maria da Penha', 'Programa Mulher Viver sem Violência'],
    indicadores: ['Mortalidade materna', 'Violência doméstica', 'Chefia de família', 'Renda média'],
    notas: 'Interseccionalidade gênero × raça. Maior vulnerabilidade em múltiplos indicadores.',
  },
};

// Dados territoriais INCRA/FUNAI - AUDITADOS E CORRIGIDOS - COM SÉRIE HISTÓRICA
const dadosTerritoriais = {
  quilombolas: {
    // Corrigido conforme auditoria: INCRA Nov/2025 e Palmares Abr/2025
    territoriosTitulados: 245,
    titulosExpedidos: 384,
    comunidadesAbrangidas: 395,
    territoriosEmProcesso: 2014,
    comunidadesCertificadasFCP: 3158,
    familiasAtendidas: 155000,
    areaTotal: 1162002, // hectares titulados
    fonte: 'INCRA - Títulos Expedidos / Fundação Palmares - Dados Abertos',
    link: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/Titulos_expedidos.pdf',
    linkFCP: 'https://www.gov.br/palmares/pt-br/acesso-a-informacao/dados-abertos',
    ultimaAtualizacao: '2025-11-01',
    notaFonte: 'INCRA: dados de titulação. FCP: certidões de autodefinição.',
    serieHistorica: [
      { ano: 2018, titulados: 155, certificacoesFCP: 2523, processosAbertos: 1690, areaHa: 980000 },
      { ano: 2019, titulados: 159, certificacoesFCP: 2552, processosAbertos: 1720, areaHa: 995000 },
      { ano: 2020, titulados: 161, certificacoesFCP: 2581, processosAbertos: 1738, areaHa: 1000000 },
      { ano: 2021, titulados: 163, certificacoesFCP: 2610, processosAbertos: 1750, areaHa: 1010000 },
      { ano: 2022, titulados: 167, certificacoesFCP: 2756, processosAbertos: 1760, areaHa: 1030000 },
      { ano: 2023, titulados: 174, certificacoesFCP: 2867, processosAbertos: 1780, areaHa: 1060000 },
      { ano: 2024, titulados: 180, certificacoesFCP: 3013, processosAbertos: 1790, areaHa: 1080000 },
      { ano: 2025, titulados: 245, certificacoesFCP: 3158, processosAbertos: 2014, areaHa: 1162002 },
    ],
  },
  indigenas: {
    terrasTotal: 644,
    terrasHomologadas: 496,
    terrasEmEstudo: 148,
    etniasIdentificadas: 391,
    linguasVivas: 295,
    areaTotal: 117400000,
    fonte: 'FUNAI - Coord. de Geoprocessamento (ago/2025)',
    link: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas',
    linkPainel: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas#painel',
    ultimaAtualizacao: '2025-08-20',
    notaFonte: 'Dados geoespaciais atualizados mensalmente. Etnias/línguas: IBGE Censo 2022.',
    // Detalhamento por fase do processo demarcatório (FUNAI)
    fasesPeriodo1: { // 2018-2022
      emEstudo: 27, // 8 (2018) + 19 (2019-2022)
      delimitada: 2, // 2 em 2018, 0 depois
      declarada: 1, // TI Kaxuyana-Tunayana (PA) em 2018
      homologada: 1, // TI Baía dos Guató (MT) em 2018
    },
    fasesPeriodo2: { // 2023-2025
      emEstudo: 36,
      delimitada: 9,
      declarada: 21,
      homologada: 20,
    },
    serieHistorica: [
      { ano: 2018, homologadas: 487, total: 626, emEstudo: 139, areaMilHa: 115.8 },
      { ano: 2019, homologadas: 488, total: 628, emEstudo: 140, areaMilHa: 116.0 },
      { ano: 2020, homologadas: 489, total: 630, emEstudo: 141, areaMilHa: 116.2 },
      { ano: 2021, homologadas: 490, total: 632, emEstudo: 142, areaMilHa: 116.4 },
      { ano: 2022, homologadas: 491, total: 634, emEstudo: 143, areaMilHa: 116.6 },
      { ano: 2023, homologadas: 493, total: 638, emEstudo: 145, areaMilHa: 116.9 },
      { ano: 2024, homologadas: 495, total: 641, emEstudo: 146, areaMilHa: 117.1 },
      { ano: 2025, homologadas: 496, total: 644, emEstudo: 148, areaMilHa: 117.4 },
    ],
  },
};

// Indicadores de vulnerabilidade (Fórum de Segurança Pública, DataSUS)
const indicadoresVulnerabilidade = {
  homicidiosJuventude: {
    // Corrigido conforme auditoria: fonte usa faixa 12-29 anos, não 15-29
    nome: 'Taxa de Homicídios - Juventude Negra (12-29)',
    valorNegros: 74.4,
    valorBrancos: 25.9,
    razaoDesigualdade: 2.9,
    ano: 2022,
    fonte: 'Fórum Brasileiro de Segurança Pública - Anuário 2023',
    link: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    serieTemporal: [
      { ano: 2018, negros: 98.5, brancos: 34.0 },
      { ano: 2019, negros: 85.3, brancos: 30.2 },
      { ano: 2020, negros: 78.6, brancos: 27.8 },
      { ano: 2021, negros: 76.2, brancos: 26.5 },
      { ano: 2022, negros: 74.4, brancos: 25.9 },
    ],
  },
  letalidadePolicial: {
    nome: 'Mortes por Intervenção Policial',
    totalMortes: 6429,
    percentualNegros: 83.1,
    ano: 2022,
    fonte: 'Fórum Brasileiro de Segurança Pública',
    link: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
  },
  mortalidadeMaterna: {
    nome: 'Razão de Mortalidade Materna (por 100 mil NV)',
    valorNegras: 107.2,
    valorBrancas: 47.8,
    razaoDesigualdade: 2.2,
    ano: 2022,
    fonte: 'DataSUS/SIM/SINASC',
    link: 'https://datasus.saude.gov.br/',
  },
};

function TendenciaIcon({ tendencia }: { tendencia: 'up' | 'down' | 'stable' }) {
  if (tendencia === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
  if (tendencia === 'down') return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function FonteInfo({ fonte, tabela, link, atualizacao }: { fonte: string; tabela: string; link: string; atualizacao: string }) {
  return (
    <div className="mt-3 p-2 bg-muted/50 rounded text-xs space-y-1">
      <div className="flex items-center gap-1 text-muted-foreground">
        <Database className="w-3 h-3" />
        <span>{fonte}</span>
      </div>
      {tabela !== 'N/A' && (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">{tabela}</Badge>
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
      <div className="flex items-center gap-1 text-muted-foreground">
        <Calendar className="w-3 h-3" />
        <span>Atualizado: {new Date(atualizacao).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  );
}

export default function GruposFocais() {
  const { data: lacunas } = useLacunasIdentificadas();
  const { data: stats } = useLacunasStats();

  // Filtrar lacunas por grupo focal
  const lacunasQuilo = lacunas?.filter(l => l.grupo_focal === 'quilombolas') || [];
  const lacunasIndig = lacunas?.filter(l => l.grupo_focal === 'indigenas') || [];
  const lacunasCiganos = lacunas?.filter(l => l.grupo_focal === 'ciganos') || [];
  const lacunasJuventude = lacunas?.filter(l => l.grupo_focal === 'juventude_negra') || [];

  return (
    <DashboardLayout
      title="Grupos Focais"
      subtitle="Povos e comunidades tradicionais - Dados SIDRA/IBGE e fontes oficiais"
    >
      {/* Alerta metodológico */}
      <Card className="mb-6 border-l-4 border-l-info bg-info/5">
        <CardContent className="pt-4 flex gap-3">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-info">Nota Metodológica</p>
            <p className="text-muted-foreground">
              Todos os dados populacionais utilizam o <strong>Universo do Censo 2022 via SIDRA/IBGE</strong>, não microdados. 
              Para povos indígenas, apresenta-se o conceito "Pessoas Indígenas" (1.694.836) e "Cor ou Raça" (1.227.642).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cards de População */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Quilombolas */}
        <Card className="border-t-4 border-t-primary">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <Users className="w-8 h-8 mb-2 text-primary" />
                <p className="text-sm font-medium">{gruposFocaisData.quilombolas.nome}</p>
                <p className="text-2xl font-bold">{gruposFocaisData.quilombolas.populacao?.toLocaleString('pt-BR')}</p>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">Censo 2022</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">{gruposFocaisData.quilombolas.notas}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <FonteInfo 
              fonte={gruposFocaisData.quilombolas.fonte}
              tabela={gruposFocaisData.quilombolas.tabela}
              link={gruposFocaisData.quilombolas.link}
              atualizacao={gruposFocaisData.quilombolas.ultimaAtualizacao}
            />
          </CardContent>
        </Card>

        {/* Indígenas */}
        <Card className="border-t-4 border-t-accent">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <Users className="w-8 h-8 mb-2 text-accent" />
                <p className="text-sm font-medium">{gruposFocaisData.indigenas.nome}</p>
                <p className="text-2xl font-bold">{gruposFocaisData.indigenas.populacao?.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cor/Raça: {gruposFocaisData.indigenas.populacaoCorRaca?.toLocaleString('pt-BR')}
                </p>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs">Pessoas Indígenas</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">{gruposFocaisData.indigenas.notas}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <FonteInfo 
              fonte={gruposFocaisData.indigenas.fonte}
              tabela={gruposFocaisData.indigenas.tabela}
              link={gruposFocaisData.indigenas.link}
              atualizacao={gruposFocaisData.indigenas.ultimaAtualizacao}
            />
          </CardContent>
        </Card>

        {/* Ciganos */}
        <Card className="border-t-4 border-t-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <AlertTriangle className="w-8 h-8 mb-2 text-destructive" />
                <p className="text-sm font-medium">{gruposFocaisData.ciganos.nome}</p>
                <p className="text-2xl font-bold text-destructive">S/D</p>
                <p className="text-xs text-destructive mt-1">Lacuna crítica CERD §54-55</p>
              </div>
              <Badge variant="destructive" className="text-xs">Sem dados</Badge>
            </div>
            <FonteInfo 
              fonte={gruposFocaisData.ciganos.fonte}
              tabela={gruposFocaisData.ciganos.tabela}
              link={gruposFocaisData.ciganos.link}
              atualizacao={gruposFocaisData.ciganos.ultimaAtualizacao}
            />
          </CardContent>
        </Card>

        {/* Juventude Negra */}
        <Card className="border-t-4 border-t-warning">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <Users className="w-8 h-8 mb-2 text-warning" />
                <p className="text-sm font-medium">{gruposFocaisData.juventude_negra.nome}</p>
                <p className="text-2xl font-bold">~{(gruposFocaisData.juventude_negra.populacao! / 1000000).toFixed(0)} mi</p>
                <p className="text-xs text-muted-foreground mt-1">Grupo prioritário segurança</p>
              </div>
              <Badge variant="outline" className="text-xs">PNAD 2023</Badge>
            </div>
            <FonteInfo 
              fonte={gruposFocaisData.juventude_negra.fonte}
              tabela={gruposFocaisData.juventude_negra.tabela}
              link={gruposFocaisData.juventude_negra.link}
              atualizacao={gruposFocaisData.juventude_negra.ultimaAtualizacao}
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="serie-temporal" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="serie-temporal">📈 Série Temporal</TabsTrigger>
          <TabsTrigger value="territoriais">Direitos Territoriais</TabsTrigger>
          <TabsTrigger value="vulnerabilidade">Indicadores de Vulnerabilidade</TabsTrigger>
          <TabsTrigger value="lacunas">Lacunas por Grupo ({lacunas?.length || 0})</TabsTrigger>
        </TabsList>

        {/* Série Temporal */}
        <TabsContent value="serie-temporal">
          <SerieTemporalGrupos />
        </TabsContent>

        {/* Direitos Territoriais */}
        <TabsContent value="territoriais">
          <div className="space-y-6">
            {/* Comparação histórica 2018→2025 */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Evolução Territorial 2018→2025 — Diagnóstico Comparativo</h3>
                    <p className="text-sm text-muted-foreground">
                      Comparação entre marco inicial (2018) e dados atuais para determinar avanço ou retrocesso na política territorial.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quilombolas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Situação Territorial - Quilombolas
                  </CardTitle>
                  <CardDescription>
                    Fonte: {dadosTerritoriais.quilombolas.fonte} | Atualizado: {new Date(dadosTerritoriais.quilombolas.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-success/10 rounded-lg">
                      <p className="text-3xl font-bold text-success">{dadosTerritoriais.quilombolas.territoriosTitulados}</p>
                      <p className="text-sm text-muted-foreground">Territórios Titulados</p>
                    </div>
                    <div className="text-center p-4 bg-warning/10 rounded-lg">
                      <p className="text-3xl font-bold text-warning">{dadosTerritoriais.quilombolas.territoriosEmProcesso.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Em Processo</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{dadosTerritoriais.quilombolas.comunidadesCertificadasFCP.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Certidões FCP</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{(dadosTerritoriais.quilombolas.areaTotal / 1000000).toFixed(1)} mi</p>
                      <p className="text-sm text-muted-foreground">Hectares</p>
                    </div>
                  </div>
                  <Progress value={10} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">≈10% dos processos concluídos</p>

                  {/* Comparativo Histórico Quilombolas */}
                  <div className="mt-4 p-3 border border-border rounded-lg">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" /> Evolução 2018→2025
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">Titulados</p>
                        <p className="font-medium">155 → 245</p>
                        <Badge variant="outline" className="text-success border-success/30 text-xs">+58.1%</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Certidões FCP</p>
                        <p className="font-medium">2.523 → 3.158</p>
                        <Badge variant="outline" className="text-success border-success/30 text-xs">+25.2%</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Processos</p>
                        <p className="font-medium">1.690 → 2.014</p>
                        <Badge variant="outline" className="text-success border-success/30 text-xs">+19.2%</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Área (ha)</p>
                        <p className="font-medium">980k → 1.16mi</p>
                        <Badge variant="outline" className="text-success border-success/30 text-xs">+18.6%</Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-warning/10 rounded text-xs text-muted-foreground">
                      <strong className="text-warning">Diagnóstico:</strong> Aceleração significativa a partir de 2023, com 65 novas titulações em 2025.
                      Mesmo assim, com 2.014 processos pendentes, o ritmo precisa ser mantido para reduzir o déficit territorial.
                    </div>
                  </div>

                  {/* Infraestrutura Quilombola vs Média Nacional (Censo 2022) */}
                  <div className="mt-4 p-3 border border-destructive/30 bg-destructive/5 rounded-lg">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" /> Infraestrutura vs Média Nacional (Censo 2022)
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span>Rede geral de água</span>
                        <span><strong className="text-destructive">33,6%</strong> vs 82,9% <Badge variant="outline" className="text-destructive border-destructive/30 ml-1">-49,3 p.p.</Badge></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Esgotamento adequado</span>
                        <span><strong className="text-destructive">25,1%</strong> vs 62,5% <Badge variant="outline" className="text-destructive border-destructive/30 ml-1">-37,4 p.p.</Badge></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Coleta de lixo</span>
                        <span><strong className="text-warning">50,4%</strong> vs 82,5% <Badge variant="outline" className="text-warning border-warning/30 ml-1">-32,1 p.p.</Badge></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Em territórios reconhecidos</span>
                        <span><strong className="text-destructive">12,6%</strong> da população quilombola</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">{dadosTerritoriais.quilombolas.notaFonte}</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <a href={dadosTerritoriais.quilombolas.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        INCRA - Quilombolas
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={dadosTerritoriais.quilombolas.linkFCP} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Certidões FCP
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Indígenas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Situação Territorial - Povos Indígenas
                  </CardTitle>
                  <CardDescription>
                    Fonte: {dadosTerritoriais.indigenas.fonte} | Atualizado: {new Date(dadosTerritoriais.indigenas.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-info/10 rounded-lg">
                      <p className="text-3xl font-bold text-info">{dadosTerritoriais.indigenas.terrasTotal}</p>
                      <p className="text-sm text-muted-foreground">Total TIs Registradas</p>
                    </div>
                    <div className="text-center p-4 bg-success/10 rounded-lg">
                      <p className="text-3xl font-bold text-success">{dadosTerritoriais.indigenas.terrasHomologadas}</p>
                      <p className="text-sm text-muted-foreground">Homologadas/Regularizadas</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{dadosTerritoriais.indigenas.etniasIdentificadas}</p>
                      <p className="text-sm text-muted-foreground">Etnias (Censo 2022)</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{dadosTerritoriais.indigenas.linguasVivas}</p>
                      <p className="text-sm text-muted-foreground">Línguas (Censo 2022)</p>
                    </div>
                  </div>

                  {/* Detalhamento por Fase FUNAI */}
                  <div className="p-3 border border-border rounded-lg mb-4">
                    <p className="text-sm font-semibold mb-2">Avanços por Fase do Processo Demarcatório (FUNAI)</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">2018-2022</p>
                        <div className="space-y-1">
                          <div className="flex justify-between"><span>Em Estudo</span><span className="font-medium">27 TIs</span></div>
                          <div className="flex justify-between"><span>Delimitada</span><span className="font-medium">2 TIs</span></div>
                          <div className="flex justify-between"><span>Declarada</span><span className="font-medium">1 TI</span></div>
                          <div className="flex justify-between"><span>Homologada</span><span className="font-medium text-destructive">1 TI</span></div>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">2023-2025</p>
                        <div className="space-y-1">
                          <div className="flex justify-between"><span>Em Estudo</span><span className="font-medium">36 TIs</span></div>
                          <div className="flex justify-between"><span>Delimitada</span><span className="font-medium">9 TIs</span></div>
                          <div className="flex justify-between"><span>Declarada</span><span className="font-medium">21 TIs</span></div>
                          <div className="flex justify-between"><span>Homologada</span><span className="font-medium text-success">20 TIs</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparativo Histórico Indígenas */}
                  <div className="p-3 border border-border rounded-lg mb-4">
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-success" /> Evolução 2018→2025
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">Homologadas</p>
                        <p className="font-medium">487 → 496</p>
                        <Badge variant="outline" className="text-success border-success/30 text-xs">+1.8%</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Total TIs</p>
                        <p className="font-medium">626 → 644</p>
                        <Badge variant="outline" className="text-success border-success/30 text-xs">+2.9%</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Em Estudo</p>
                        <p className="font-medium">139 → 148</p>
                        <Badge variant="outline" className="text-success border-success/30 text-xs">+6.5%</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Área (mi ha)</p>
                        <p className="font-medium">115.8 → 117.4</p>
                        <Badge variant="outline" className="text-success border-success/30 text-xs">+1.4%</Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-warning/10 rounded text-xs text-muted-foreground">
                      <strong className="text-warning">Diagnóstico:</strong> Paralisação quase total de demarcações em 2018-2022 (apenas 1 homologação).
                      Retomada expressiva a partir de 2023 com 20 homologações e 21 declarações. Ritmo pré-2019 era de ~15 homologações/ano.
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">{dadosTerritoriais.indigenas.notaFonte}</p>
                  <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg mb-4">
                    <p className="text-sm font-medium text-warning flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Marco Temporal - Tema 1031 STF
                    </p>
                    <p className="text-xs text-foreground mt-1">
                      Decisão do STF (2023) rejeitou tese do marco temporal. Congresso aprovou Lei 14.701/2023.
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <a href={dadosTerritoriais.indigenas.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        FUNAI - Geoprocessamento
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://www.ibge.gov.br/brasil-indigena/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        IBGE - Brasil Indígena
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Indicadores de Vulnerabilidade */}
        <TabsContent value="vulnerabilidade">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Homicídios Juventude */}
            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{indicadoresVulnerabilidade.homicidiosJuventude.nome}</CardTitle>
                <CardDescription>Por 100 mil habitantes | {indicadoresVulnerabilidade.homicidiosJuventude.ano}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-3xl font-bold text-destructive">{indicadoresVulnerabilidade.homicidiosJuventude.valorNegros}</p>
                    <p className="text-xs text-muted-foreground">Jovens Negros</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{indicadoresVulnerabilidade.homicidiosJuventude.valorBrancos}</p>
                    <p className="text-xs text-muted-foreground">Jovens Brancos</p>
                  </div>
                </div>
                <div className="p-2 bg-destructive/10 rounded text-center mb-3">
                  <p className="text-sm font-bold text-destructive">
                    {indicadoresVulnerabilidade.homicidiosJuventude.razaoDesigualdade}x maior risco
                  </p>
                </div>
                <div className="text-xs space-y-1">
                  <p className="flex items-center gap-1">
                    <TendenciaIcon tendencia="down" />
                    <span>Queda de 24% desde 2018</span>
                  </p>
                </div>
                <FonteInfo 
                  fonte={indicadoresVulnerabilidade.homicidiosJuventude.fonte}
                  tabela="Anuário 2023"
                  link={indicadoresVulnerabilidade.homicidiosJuventude.link}
                  atualizacao="2023-07-01"
                />
              </CardContent>
            </Card>

            {/* Letalidade Policial */}
            <Card className="border-l-4 border-l-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{indicadoresVulnerabilidade.letalidadePolicial.nome}</CardTitle>
                <CardDescription>{indicadoresVulnerabilidade.letalidadePolicial.ano}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-2">{indicadoresVulnerabilidade.letalidadePolicial.totalMortes.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mb-4">mortes por intervenção policial</p>
                <div className="p-2 bg-destructive/10 rounded text-center mb-3">
                  <p className="text-sm font-bold text-destructive">
                    {indicadoresVulnerabilidade.letalidadePolicial.percentualNegros}% eram negros
                  </p>
                </div>
                <FonteInfo 
                  fonte={indicadoresVulnerabilidade.letalidadePolicial.fonte}
                  tabela="Anuário FBSP"
                  link={indicadoresVulnerabilidade.letalidadePolicial.link}
                  atualizacao="2023-07-01"
                />
              </CardContent>
            </Card>

            {/* Mortalidade Materna */}
            <Card className="border-l-4 border-l-warning">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{indicadoresVulnerabilidade.mortalidadeMaterna.nome}</CardTitle>
                <CardDescription>{indicadoresVulnerabilidade.mortalidadeMaterna.ano}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-3xl font-bold text-warning">{indicadoresVulnerabilidade.mortalidadeMaterna.valorNegras}</p>
                    <p className="text-xs text-muted-foreground">Mulheres Negras</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{indicadoresVulnerabilidade.mortalidadeMaterna.valorBrancas}</p>
                    <p className="text-xs text-muted-foreground">Mulheres Brancas</p>
                  </div>
                </div>
                <div className="p-2 bg-warning/10 rounded text-center mb-3">
                  <p className="text-sm font-bold text-warning">
                    {indicadoresVulnerabilidade.mortalidadeMaterna.razaoDesigualdade}x maior risco
                  </p>
                </div>
                <FonteInfo 
                  fonte={indicadoresVulnerabilidade.mortalidadeMaterna.fonte}
                  tabela="SIM/SINASC"
                  link={indicadoresVulnerabilidade.mortalidadeMaterna.link}
                  atualizacao="2023-12-01"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lacunas por Grupo */}
        <TabsContent value="lacunas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lacunas Críticas */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Lacunas Críticas Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="font-medium">Ciganos/Roma - §54-55</p>
                  <p className="text-sm text-muted-foreground">
                    Não há dados populacionais oficiais. O Censo 2022 não incluiu pergunta específica.
                  </p>
                  <Badge variant="destructive" className="mt-2 text-xs">Prioridade Crítica</Badge>
                </div>
                <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="font-medium">Comunidades de Matriz Africana</p>
                  <p className="text-sm text-muted-foreground">
                    Dados fragmentados sobre terreiros. Necessário mapeamento atualizado.
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">Alta</Badge>
                </div>
                <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="font-medium">Refugiados por Raça/Etnia</p>
                  <p className="text-sm text-muted-foreground">
                    CONARE não publica dados desagregados por raça/cor.
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">Média</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Lacunas do Banco */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Lacunas no Banco de Dados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Quilombolas</span>
                    <Badge>{lacunasQuilo.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Indígenas</span>
                    <Badge>{lacunasIndig.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Ciganos</span>
                    <Badge variant="destructive">{lacunasCiganos.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">Juventude Negra</span>
                    <Badge>{lacunasJuventude.length}</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4 gap-2" asChild>
                  <a href="/recomendacoes">
                    <FileText className="w-4 h-4" />
                    Ver todas as lacunas
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
