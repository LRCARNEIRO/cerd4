import { EstimativaBadge } from '@/components/ui/estimativa-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, AlertTriangle, FileText, ExternalLink, Database, Calendar, TrendingUp, TrendingDown, Minus, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLacunasIdentificadas, useLacunasStats } from '@/hooks/useLacunasData';
import { SerieTemporalGrupos } from '@/components/grupos-focais/SerieTemporalGrupos';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMirrorData } from '@/hooks/useMirrorData';

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
    populacao: 1694836,
    fonte: 'IBGE - Censo Demográfico 2022 (Pessoas Indígenas)',
    tabela: 'IBGE Brasil Indígena / Tabela 9514 - SIDRA',
    link: 'https://www.ibge.gov.br/brasil-indigena/',
    linkSidra: 'https://sidra.ibge.gov.br/tabela/9514',
    ultimaAtualizacao: '2024-10-24',
    serieTemporal: [
      { ano: 2010, valor: 896917, fonte: 'Censo 2010 - Pessoas Indígenas' },
      { ano: 2022, valor: 1694836, fonte: 'Censo 2022 - Pessoas Indígenas' },
    ],
    populacaoCorRaca: 1227642,
    observacoesONU: ['50', '51', '52', '53'],
    politicas: ['Demarcação de Terras Indígenas (FUNAI)', 'SESAI - Saúde Indígena', 'Educação Escolar Indígena'],
    indicadores: ['Terras homologadas', 'Etnias reconhecidas', 'Línguas vivas', 'Mortalidade infantil indígena'],
    notas: 'Censo 2022: metodologia ampliada contou 1.694.836 Pessoas Indígenas. Cor/Raça (Tab. 9605): 1.227.642. Fonte: ibge.gov.br/brasil-indigena',
  },
  ciganos: {
    nome: 'Ciganos/Roma',
    populacao: 41738, // AUDITORIA 14/03/2026: atualizado via Complemento CERD III (SIDRA 9891, Censo 2022)
    fonte: 'IBGE/Censo 2022 — Tabela SIDRA 9891 (Pop. por povo ou comunidade tradicional × UF)',
    tabela: 'Tabela 9891 - SIDRA',
    link: 'https://sidra.ibge.gov.br/tabela/9891',
    ultimaAtualizacao: '2023-10-27',
    serieTemporal: [
      { ano: 2022, valor: 41738, fonte: 'Censo 2022 — SIDRA 9891' },
    ],
    observacoesONU: ['54', '55'],
    politicas: ['Decreto 8.750/2016 (CNPCT incluía ciganos)', 'Política Nacional para Povo Cigano (em elaboração)'],
    indicadores: ['População por região', 'Distribuição territorial'],
    notas: 'AUDITADO: Censo 2022 realizou primeira contagem oficial (41.738). Possível sub-registro por estigma e nomadismo — organizações ciganas estimam entre 500 mil e 1 milhão. §54-55 do CERD III.',
  },
  juventude_negra: {
    nome: 'Juventude Negra (15-29 anos)',
    populacao: 25800000,
    fonte: 'Estimativa: IBGE Censo 2022 (Tab. 9605) × PNAD Contínua (Tab. 7113)',
    tabela: 'Cálculo: Tab. 9605 (cor/raça) × Tab. 7113 (idade)',
    link: 'https://sidra.ibge.gov.br/tabela/7113',
    linkCorRaca: 'https://sidra.ibge.gov.br/tabela/9605',
    ultimaAtualizacao: '2024-02-29',
    serieTemporal: [
      { ano: 2018, valor: 26200000, fonte: 'Estimativa PNAD Contínua' },
      { ano: 2019, valor: 26100000, fonte: 'Estimativa PNAD Contínua' },
      { ano: 2020, valor: 25900000, fonte: 'Estimativa PNAD Contínua' },
      { ano: 2021, valor: 25800000, fonte: 'Estimativa PNAD Contínua' },
      { ano: 2022, valor: 25700000, fonte: 'Estimativa PNAD Contínua' },
      { ano: 2023, valor: 25800000, fonte: 'Estimativa PNAD Contínua' },
    ],
    observacoesONU: ['32', '33', '34', '35', '36'],
    politicas: ['Programa Juventude Negra Viva (Decreto 11.956/2024)', 'Plano Juventude Viva'],
    indicadores: ['Taxa de homicídios 12-29', 'Taxa de desemprego', 'Evasão escolar', 'Nem-nem'],
    notas: 'ESTIMATIVA: Não há tabela SIDRA com cruzamento direto idade × raça para este total. Valor calculado a partir da proporção negra (55,5%) aplicada à população de 15-29 anos da PNAD Contínua. Grupo prioritário para políticas de segurança — letalidade 2,5x maior que jovens não negros.',
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
    populacao: 59000000,
    fonte: 'Estimativa: IBGE Censo 2022 (Tab. 9605 × Tab. 9514)',
    tabela: 'Cálculo: Tab. 9605 (cor/raça) × Tab. 9514 (sexo)',
    link: 'https://sidra.ibge.gov.br/tabela/9605',
    linkSexo: 'https://sidra.ibge.gov.br/tabela/9514',
    ultimaAtualizacao: '2022-12-22',
    serieTemporal: [],
    observacoesONU: ['15', '17', '23', '28'],
    politicas: ['PNAISM', 'Lei Maria da Penha', 'Programa Mulher Viver sem Violência'],
    indicadores: ['Mortalidade materna', 'Violência doméstica', 'Chefia de família', 'Renda média'],
    notas: 'ESTIMATIVA: Não há tabela SIDRA com cruzamento direto sexo × cor como total agregado. Valor calculado: proporção feminina (~52,2%) × pop. negra (112,7 mi). Interseccionalidade gênero × raça. Maior vulnerabilidade em múltiplos indicadores.',
  },
};

const dadosTerritoriais = {
  quilombolas: {
    territoriosTitulados: 245,
    fonteTerritoriosTitulados: 'INCRA - PDF "Títulos Expedidos às Comunidades Quilombolas"',
    linkTerritoriosTitulados: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/andamentotitulacao.pdf',
    titulosExpedidos: 384,
    fonteTitulosExpedidos: 'INCRA - Total acumulado no PDF "Títulos Expedidos"',
    linkTitulosExpedidos: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/andamentotitulacao.pdf',
    comunidadesAbrangidas: 395,
    territoriosEmProcesso: 2014,
    fonteProcessos: 'INCRA - Processos Abertos de Regularização Fundiária Quilombola',
    linkProcessos: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas',
    comunidadesCertificadasFCP: 3158,
    fonteFCP: 'Fundação Cultural Palmares - Portarias de Certificação Quilombola',
    linkFCP: 'https://www.gov.br/palmares/pt-br/departamentos/protecao-preservacao-e-articulacao/certificacao-quilombola',
    auditadoFCP: true, // ✅ AUDITORIA 14/03/2026: validado contra Complemento CERD III (3.158)
    familiasAtendidas: 155000,
    areaTotal: 1162002,
    fonteArea: 'INCRA - Soma das áreas no PDF Títulos Expedidos (ha)',
    linkArea: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/andamentotitulacao.pdf',
    fonte: 'INCRA - Títulos Expedidos / Fundação Palmares - Certificação',
    link: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas',
    linkTitulos: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/andamentotitulacao.pdf',
    ultimaAtualizacao: '2025-11-01',
    notaFonte: 'Territórios/títulos/área: PDF "Títulos Expedidos" do INCRA (lista nominal). Certidões: Palmares - Portarias de Certificação.',
    infraestrutura: {
      fonte: 'IBGE - Censo 2022 (Resultados Quilombolas)',
      link: 'https://censo2022.ibge.gov.br/panorama/indicadores.html?localidade=BR&tema=8',
      nota: 'Censo 2022 — Panorama Quilombola (características domiciliares)',
    },
    serieHistorica: [
      { ano: 2018, titulados: 155, certificacoesFCP: 2523, processosAbertos: 1690, areaHa: 980000 },
      { ano: 2025, titulados: 245, certificacoesFCP: 3158, processosAbertos: 2014, areaHa: 1162002 },
    ],
  },
  indigenas: {
    // AUDITORIA CRUZADA 17/03/2026: alinhado com GruposFocais.tsx (646 TIs — FUNAI 2026)
    // terrasHomologadas = apenas homologadas (FUNAI); homologadasReservadas = ISA total (536)
    terrasTotal: 646,
    fonteTerrasTotal: 'FUNAI - Coordenação-Geral de Geoprocessamento (atualizado 2026)',
    linkTerrasTotal: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas',
    terrasHomologadas: 496,
    terrasHomologadasReservadas: 536, // ISA 2025: homologadas (496) + reservadas (40)
    fonteTerrasHomologadas: 'FUNAI - TIs Regularizadas (Geoprocessamento) / ISA - terrasindigenas.org.br',
    linkTerrasHomologadas: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas',
    linkISA: 'https://terrasindigenas.org.br/',
    terrasEmEstudo: 148,
    etniasIdentificadas: 391,
    fonteEtnias: 'IBGE - Censo 2022 (Brasil Indígena)',
    linkEtnias: 'https://www.ibge.gov.br/brasil-indigena/',
    linguasVivas: 295,
    fonteLinguas: 'IBGE - Censo 2022 (Brasil Indígena)',
    linkLinguas: 'https://www.ibge.gov.br/brasil-indigena/',
    areaTotal: 117400000,
    fonteArea: 'FUNAI - Dados Geoespaciais (soma das áreas das TIs)',
    linkArea: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas',
    fonte: 'FUNAI - Coordenação de Geoprocessamento (ago/2025)',
    link: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas',
    linkGeo: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas',
    ultimaAtualizacao: '2025-08-20',
    notaFonte: 'AUDITADO: TIs e áreas: FUNAI Geoprocessamento. Homologadas+Reservadas (536): ISA. Etnias/línguas: IBGE Censo 2022.',
    fasesPeriodo1: {
      emEstudo: 27, delimitada: 2, declarada: 1, homologada: 1,
      fonte: 'FUNAI - Relatórios Anuais / ISA - Terras Indígenas no Brasil',
      linkISA: 'https://terrasindigenas.org.br/',
    },
    fasesPeriodo2: {
      emEstudo: 36, delimitada: 9, declarada: 21, homologada: 20,
      fonte: 'FUNAI - Relatórios Anuais / DOU (portarias e decretos)',
      linkISA: 'https://terrasindigenas.org.br/',
    },
    serieHistorica: [
      { ano: 2018, homologadas: 487, total: 626, emEstudo: 139, areaMilHa: 115.8 },
      { ano: 2025, homologadas: 496, total: 644, emEstudo: 148, areaMilHa: 117.4 },
    ],
  },
};

// AUDITORIA 14/03/2026: todos os indicadores de vulnerabilidade validados cruzando
// com abas Segurança/Saúde/Educação (mirror SSoT) e Atlas da Violência 2025.
// Deep links adicionados para auditabilidade total.
const indicadoresVulnerabilidade = {
  homicidiosPorRaca: {
    nome: 'Homicídios Dolosos — Vítimas Negras',
    percentualVitimasNegras: 77.0,
    percentualVitimasBrancas: 23.0,
    razaoRisco: 2.7,
    ano: 2024,
    fonte: 'Fórum Brasileiro de Segurança Pública - 19º Anuário (2025, dados 2024)',
    link: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    auditado: true, // ✅ Validado contra aba Segurança (mirror)
    serieTemporal: [
      { ano: 2018, negros: 75.7, brancos: 24.3 },
      { ano: 2019, negros: 76.2, brancos: 23.8 },
      { ano: 2020, negros: 76.9, brancos: 23.1 },
      { ano: 2021, negros: 77.0, brancos: 23.0 },
      { ano: 2022, negros: 76.5, brancos: 23.5 },
      { ano: 2023, negros: 76.6, brancos: 23.4 },
      { ano: 2024, negros: 77.0, brancos: 23.0 },
    ],
  },
  taxaHomicidio100mil: {
    nome: 'Taxa de Homicídio por 100 mil hab.',
    taxaNegros: 28.9, taxaNaoNegros: 10.6, razaoRisco: 2.7,
    razaoRisco2018: 2.7, quedaNegros2018_2023: 23.1, quedaNaoNegros2018_2023: 24.3,
    ano: 2023, fonte: 'Atlas da Violência 2025 (IPEA/FBSP)',
    link: 'https://www.ipea.gov.br/atlasviolencia',
    auditado: true, // ✅ Validado contra aba Segurança (mirror)
  },
  violenciaJuventude: {
    nome: 'Violência Letal — Juventude (15-29 anos)',
    percentualVitimas: 47.8,
    feminicidioNegras: 68.2, // Atlas 2025, p.57 — ✅ validado contra feminicidioSerie auditada
    ano: 2023, fonte: 'Atlas da Violência 2025 (IPEA/FBSP)',
    link: 'https://www.ipea.gov.br/atlasviolencia',
    auditado: true,
  },
  ivjn: {
    nome: 'IVJ-N — Vulnerabilidade da Juventude Negra',
    riscoRelativo: 2.0, riscoRelativo2017: 1.9, riscoSuperiorNegro: 3.0,
    qualificador: 'ensino fundamental incompleto',
    ano: 2021, fonte: 'Atlas da Violência 2025 (IPEA/FBSP)',
    link: 'https://www.ipea.gov.br/atlasviolencia',
    auditado: true,
  },
  letalidadePolicial: {
    nome: 'Mortes por Intervenção Policial',
    // AUDITORIA CRUZADA 17/03/2026: Corrigido de 5.417 para 6.243 conforme 19º Anuário FBSP 2025, p.17 e 23
    totalMortes: 6243, percentualNegros: 82.0,
    ano: 2024, fonte: 'Fórum Brasileiro de Segurança Pública - 19º Anuário (2025, dados 2024), p.17 e 23',
    link: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    auditado: true, // ✅ Validado contra aba Segurança (série letalidadePolicial)
  },
  mortalidadeMaterna: {
    nome: 'Razão de Mortalidade Materna (por 100 mil NV)',
    valorNegras: 57.3, valorBrancas: 46.6, razaoDesigualdade: 1.2,
    ano: 2022, fonte: 'DataSUS - SIM (Óbitos Maternos) / SINASC (Nascidos Vivos)',
    link: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/',
    auditado: true, // ✅ Validado contra aba Saúde (saudeSerieHistorica mirror)
    notaAuditoria: 'Snapshot 2022 confirmado. Série completa 2018-2023 disponível na aba Seg/Saúde/Edu.',
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

// Auditado manualmente em 17/03/2026

export function GruposFocaisTab() {
  const { data: lacunas } = useLacunasIdentificadas();
  const { data: stats } = useLacunasStats();
  const { gfSource, gfCount } = useMirrorData();

  const lacunasQuilo = lacunas?.filter(l => l.grupo_focal === 'quilombolas') || [];
  const lacunasIndig = lacunas?.filter(l => l.grupo_focal === 'indigenas') || [];
  const lacunasCiganos = lacunas?.filter(l => l.grupo_focal === 'ciganos') || [];
  const lacunasJuventude = lacunas?.filter(l => l.grupo_focal === 'juventude_negra') || [];

  return (
    <div>
      {/* Alerta metodológico */}
      <Card className="mb-6 border-l-4 border-l-primary">
        <CardContent className="pt-4 flex gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary">Nota Metodológica</p>
            <p className="text-muted-foreground">
              Todos os dados populacionais utilizam o <strong>Universo do Censo 2022 via SIDRA/IBGE</strong>, não microdados. 
              Para povos indígenas, apresenta-se o conceito "Pessoas Indígenas" (1.694.836) e "Cor ou Raça" (1.227.642).
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] gap-1 bg-success/10 text-success border-success/30">
                <CheckCircle2 className="w-3 h-3" /> Auditado Manualmente — 17/03/2026
              </Badge>
              {gfSource === 'bd' ? (
                <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" /> SSoT BD ({gfCount})</Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">Fallback estático</Badge>
              )}
            </div>
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
              <div className="flex flex-col items-end gap-1">
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">Censo 2022</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">{gruposFocaisData.quilombolas.notas}</p>
                  </TooltipContent>
                </Tooltip>
                
              </div>
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
              <div className="flex flex-col items-end gap-1">
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">Pessoas Indígenas</Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">{gruposFocaisData.indigenas.notas}</p>
                  </TooltipContent>
                </Tooltip>
                
              </div>
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
                <p className="text-2xl font-bold">{gruposFocaisData.ciganos.populacao?.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-1">Censo 2022 — SIDRA 9891</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                
                <Badge variant="outline" className="text-xs">Censo 2022</Badge>
              </div>
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
              <EstimativaBadge
                tipo="cruzamento"
                metodologia="Cruzamento de 2 tabelas SIDRA: proporção negra (55,5% — Tab. 9605, Censo 2022) × população 15-29 anos (Tab. 7113, PNAD Contínua). O IBGE não publica tabela com cruzamento direto idade × cor/raça para total populacional. Cálculo: 46,5 mi (15-29) × 0,555 ≈ 25,8 mi."
              />
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3" /> <strong>Fontes do cruzamento:</strong>
              </p>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <a href="https://sidra.ibge.gov.br/tabela/9605" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                  <ExternalLink className="w-2.5 h-2.5" /> SIDRA 9605 — Cor/raça (Censo 2022)
                </a>
                <span className="text-muted-foreground">×</span>
                <a href="https://sidra.ibge.gov.br/tabela/7113" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                  <ExternalLink className="w-2.5 h-2.5" /> SIDRA 7113 — Faixa etária (PNAD)
                </a>
              </div>
              <p className="text-[9px] text-muted-foreground italic">Atualizado: {gruposFocaisData.juventude_negra.ultimaAtualizacao}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="serie-temporal" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="serie-temporal" className="gap-1">📈 Série Temporal</TabsTrigger>
          <TabsTrigger value="territoriais" className="gap-1">Direitos Territoriais</TabsTrigger>
          <TabsTrigger value="vulnerabilidade" className="gap-1">Indicadores de Vulnerabilidade</TabsTrigger>
          <TabsTrigger value="lacunas">Lacunas por Grupo ({lacunas?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="serie-temporal">
          <SerieTemporalGrupos />
        </TabsContent>

        <TabsContent value="territoriais">
          <div className="space-y-6">
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
                      <a href={dadosTerritoriais.quilombolas.linkTerritoriosTitulados} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> PDF INCRA
                      </a>
                    </div>
                    <div className="text-center p-4 bg-warning/10 rounded-lg">
                      <p className="text-3xl font-bold text-warning">{dadosTerritoriais.quilombolas.territoriosEmProcesso.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Em Processo</p>
                      <a href={dadosTerritoriais.quilombolas.linkProcessos} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> INCRA
                      </a>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{dadosTerritoriais.quilombolas.comunidadesCertificadasFCP.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Certidões FCP</p>
                      <a href={dadosTerritoriais.quilombolas.linkFCP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> Palmares
                      </a>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{(dadosTerritoriais.quilombolas.areaTotal / 1000000).toFixed(1)} mi</p>
                      <p className="text-sm text-muted-foreground">Hectares</p>
                      <a href={dadosTerritoriais.quilombolas.linkArea} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> PDF INCRA
                      </a>
                    </div>
                  </div>
                  <Progress value={10} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">≈10% dos processos concluídos</p>

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
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Fonte: {dadosTerritoriais.quilombolas.infraestrutura.fonte} — <a href={dadosTerritoriais.quilombolas.infraestrutura.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{dadosTerritoriais.quilombolas.infraestrutura.nota}</a>
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                      <Database className="w-3 h-3" /> Fontes de Verificação
                    </p>
                    <p className="text-xs text-muted-foreground">{dadosTerritoriais.quilombolas.notaFonte}</p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" asChild>
                        <a href={dadosTerritoriais.quilombolas.linkTitulos} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> PDF Títulos Expedidos
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={dadosTerritoriais.quilombolas.linkFCP} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> Palmares - Certificação
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={dadosTerritoriais.quilombolas.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> INCRA - Quilombolas
                        </a>
                      </Button>
                    </div>
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
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{dadosTerritoriais.indigenas.terrasTotal}</p>
                      <p className="text-sm text-muted-foreground">Total TIs Registradas</p>
                      <a href={dadosTerritoriais.indigenas.linkTerrasTotal} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> FUNAI Geo
                      </a>
                    </div>
                    <div className="text-center p-4 bg-success/10 rounded-lg">
                      <p className="text-3xl font-bold text-success">{dadosTerritoriais.indigenas.terrasHomologadas}</p>
                      <p className="text-sm text-muted-foreground">Homologadas/Regularizadas</p>
                      <a href={dadosTerritoriais.indigenas.linkTerrasHomologadas} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> FUNAI Geo
                      </a>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{dadosTerritoriais.indigenas.etniasIdentificadas}</p>
                      <p className="text-sm text-muted-foreground">Etnias (Censo 2022)</p>
                      <a href={dadosTerritoriais.indigenas.linkEtnias} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> Brasil Indígena
                      </a>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{dadosTerritoriais.indigenas.linguasVivas}</p>
                      <p className="text-sm text-muted-foreground">Línguas (Censo 2022)</p>
                      <a href={dadosTerritoriais.indigenas.linkLinguas} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                        <ExternalLink className="w-3 h-3" /> Brasil Indígena
                      </a>
                    </div>
                  </div>
                  <Progress value={(dadosTerritoriais.indigenas.terrasHomologadas / dadosTerritoriais.indigenas.terrasTotal) * 100} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">{((dadosTerritoriais.indigenas.terrasHomologadas / dadosTerritoriais.indigenas.terrasTotal) * 100).toFixed(0)}% homologadas/regularizadas</p>

                  <div className="mt-4 p-3 border border-border rounded-lg">
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
                        <Badge variant="outline" className="text-warning border-warning/30 text-xs">+6.5%</Badge>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Área (mi ha)</p>
                        <p className="font-medium">115,8 → 117,4</p>
                        <Badge variant="outline" className="text-success border-success/30 text-xs">+1.4%</Badge>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
                      <strong>Diagnóstico:</strong> Aceleração significativa em 2023-2025 (20 homologações + 21 declarações vs apenas 1+1 em 2018-2022).
                      Marco Temporal rejeitado pelo STF (set/2023) desbloqueou demarcações.
                    </div>
                  </div>

                  {/* Detalhamento por período */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="p-3 border border-destructive/30 bg-destructive/5 rounded-lg">
                      <p className="text-xs font-semibold mb-2 text-destructive">2018-2022 (Paralisia)</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Em estudo: {dadosTerritoriais.indigenas.fasesPeriodo1.emEstudo}</p>
                        <p>Delimitadas: {dadosTerritoriais.indigenas.fasesPeriodo1.delimitada}</p>
                        <p>Declaradas: {dadosTerritoriais.indigenas.fasesPeriodo1.declarada}</p>
                        <p>Homologadas: {dadosTerritoriais.indigenas.fasesPeriodo1.homologada}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">{dadosTerritoriais.indigenas.fasesPeriodo1.fonte}</p>
                    </div>
                    <div className="p-3 border border-success/30 bg-success/5 rounded-lg">
                      <p className="text-xs font-semibold mb-2 text-success">2023-2025 (Retomada)</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Em estudo: {dadosTerritoriais.indigenas.fasesPeriodo2.emEstudo}</p>
                        <p>Delimitadas: {dadosTerritoriais.indigenas.fasesPeriodo2.delimitada}</p>
                        <p>Declaradas: {dadosTerritoriais.indigenas.fasesPeriodo2.declarada}</p>
                        <p>Homologadas: {dadosTerritoriais.indigenas.fasesPeriodo2.homologada}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">{dadosTerritoriais.indigenas.fasesPeriodo2.fonte}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs font-semibold mb-1 flex items-center gap-1">
                      <Database className="w-3 h-3" /> Fontes de Verificação
                    </p>
                    <p className="text-xs text-muted-foreground">{dadosTerritoriais.indigenas.notaFonte}</p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" asChild>
                        <a href={dadosTerritoriais.indigenas.linkGeo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> FUNAI Geo
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={dadosTerritoriais.indigenas.linkEtnias} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> IBGE Brasil Indígena
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://terrasindigenas.org.br/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> ISA - Terras Indígenas
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Infraestrutura Comparativa */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Infraestrutura Domiciliar por Grupo Racial — Censo 2022
                </CardTitle>
                <CardDescription>
                  Comparativo de acesso a saneamento básico entre grupos raciais. Fonte: IBGE - Censo 2022 (Resultados do Universo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium">Indicador</th>
                        <th className="text-center py-2 px-3 font-medium">Nacional</th>
                        <th className="text-center py-2 px-3 font-medium text-primary">Brancos</th>
                        <th className="text-center py-2 px-3 font-medium text-warning">Negros</th>
                        <th className="text-center py-2 px-3 font-medium text-accent">Indígenas (total)</th>
                        <th className="text-center py-2 px-3 font-medium text-destructive">Indígenas (TIs)</th>
                        <th className="text-center py-2 px-3 font-medium text-destructive">Quilombolas</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Rede geral de água</td>
                        <td className="text-center py-2 px-3">82,9%</td>
                        <td className="text-center py-2 px-3 text-primary">88,1%</td>
                        <td className="text-center py-2 px-3 text-warning font-medium">78,2%</td>
                        <td className="text-center py-2 px-3 text-accent font-medium">56,3%<span className="block text-[9px] text-destructive">🔀 cruzamento</span></td>
                        <td className="text-center py-2 px-3 text-destructive font-bold">34,8%</td>
                        <td className="text-center py-2 px-3 text-destructive font-bold">33,6%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Esgoto adequado</td>
                        <td className="text-center py-2 px-3">75,7%</td>
                        <td className="text-center py-2 px-3 text-primary">83,2%</td>
                        <td className="text-center py-2 px-3 text-warning font-medium">68,6%</td>
                        <td className="text-center py-2 px-3 text-accent font-medium">39,8%<span className="block text-[9px] text-destructive">🔀 cruzamento</span></td>
                        <td className="text-center py-2 px-3 text-destructive font-bold">7,6%</td>
                        <td className="text-center py-2 px-3 text-destructive font-bold">25,1%</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">Coleta de lixo</td>
                        <td className="text-center py-2 px-3">90,9%</td>
                        <td className="text-center py-2 px-3 text-primary">94,1%</td>
                        <td className="text-center py-2 px-3 text-warning font-medium">88,4%</td>
                        <td className="text-center py-2 px-3 text-accent font-medium">69,5%<span className="block text-[9px] text-destructive">🔀 cruzamento</span></td>
                        <td className="text-center py-2 px-3 text-destructive font-bold">30,2%</td>
                        <td className="text-center py-2 px-3 text-destructive font-bold">50,4%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Sem banheiro</td>
                        <td className="text-center py-2 px-3">0,6%</td>
                        <td className="text-center py-2 px-3 text-primary">0,3%</td>
                        <td className="text-center py-2 px-3 text-warning font-medium">0,8%</td>
                        <td className="text-center py-2 px-3 text-muted-foreground" colSpan={2}>Dados não desagregados</td>
                        <td className="text-center py-2 px-3 text-muted-foreground">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Racismo Ambiental Estrutural
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pretos e pardos representam <strong>69% dos sem esgoto adequado</strong> e <strong>72% dos sem água adequada</strong> no Brasil. 
                    Indígenas em Terras Indígenas e quilombolas em territórios oficiais apresentam os piores indicadores — esgoto adequado em TIs chega a apenas 7,6%.
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <p className="font-medium mb-1">📌 Negros</p>
                    <p className="text-muted-foreground">Gap de -4,7 p.p. em água, -7,1 p.p. em esgoto vs média nacional. Art. V(e)(iii) ICERD.</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <p className="font-medium mb-1">📌 Indígenas (TIs)</p>
                    <p className="text-muted-foreground">Gap de -48,1 p.p. em água, -68,1 p.p. em esgoto. Situação crítica. Art. V(e)(iii)+(iv) ICERD.</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <p className="font-medium mb-1">📌 Quilombolas</p>
                    <p className="text-muted-foreground">Gap de -49,3 p.p. em água, -50,6 p.p. em esgoto. 90% com alguma precariedade em saneamento.</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                    <Database className="w-3 h-3" /> Fontes de Verificação
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/39237-censo-2022-rede-de-esgoto-alcanca-62-5-da-populacao-mas-desigualdades-regionais-e-por-cor-e-raca-persistem" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" /> IBGE — Esgoto por Raça (Fev/2024)
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/42277-censo-2022-mais-da-metade-da-populacao-indigena-vive-nas-cidades" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" /> IBGE — Indígenas Domicílios (Dez/2024)
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://censo2022.ibge.gov.br/panorama/indicadores.html?localidade=BR&tema=8" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" /> Panorama Censo 2022
                      </a>
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 italic">
                    ⚠ Indígenas (total): cruzamento indireto urbano/rural (IBGE Dez/2024). TIs: publicação IBGE Indígenas - Resultados do Universo.
                    Negros: domicílios por cor/raça do responsável (IBGE Fev/2024). Quilombolas: dados diretos do Censo 2022.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Terreiros tombados pelo IPHAN */}
            <Card className="border-l-4 border-l-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-5 h-5 text-accent" />
                  Terreiros Tombados e Registrados — IPHAN
                </CardTitle>
                <CardDescription>
                  Patrimônio cultural de matriz africana reconhecido pelo IPHAN (2018→2024)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold">7</p>
                    <p className="text-sm text-muted-foreground">Tombados (2024)</p>
                  </div>
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Registrados (2024)</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Tombados (2018)</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Registrados (2018)</p>
                  </div>
                </div>

                <div className="p-3 border border-border rounded-lg mb-4">
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" /> Evolução 2018→2024
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center">
                      <p className="text-muted-foreground">Tombados</p>
                      <p className="font-medium">5 → 7</p>
                      <Badge variant="outline" className="text-success border-success/30 text-xs">+40,0%</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Registrados</p>
                      <p className="font-medium">3 → 5</p>
                      <Badge variant="outline" className="text-success border-success/30 text-xs">+66,7%</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-destructive/10 rounded text-xs text-muted-foreground">
                  <strong className="text-destructive">⚠ Auditoria (17/03/2026):</strong> Não foi localizada nenhuma base de dados consolidada sobre terreiros no IPHAN. 
                  As informações parecem ter sido extraídas de notícias e divulgações institucionais avulsas. 
                  Dados devem ser analisados com cautela — auditagem prejudicada pela ausência de fonte primária verificável.
                </div>

                <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                  <p className="font-medium mb-1 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Fonte e Documentos
                  </p>
                  <a href="http://portal.iphan.gov.br/pagina/detalhes/126" target="_blank" rel="noopener noreferrer" 
                     className="text-primary hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> IPHAN — Patrimônio Cultural
                  </a>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">CERD/C/BRA/CO/18-20</Badge>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">Durban</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Indicadores de Vulnerabilidade */}
        <TabsContent value="vulnerabilidade">
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-destructive/5 to-destructive/10 border-destructive/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      Dados do Atlas da Violência 2025 (IPEA/FBSP) e 19º Anuário FBSP 2025
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Indicadores de violência letal com recorte racial — fontes oficiais auditáveis.
                      Juventude definida como <strong>15 a 29 anos</strong> conforme padrão ONU e Estatuto da Juventude.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://www.ipea.gov.br/atlasviolencia" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> Atlas da Violência 2025
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href="https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> 19º Anuário FBSP
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-destructive">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">{indicadoresVulnerabilidade.taxaHomicidio100mil.nome}</CardTitle>
                  <CardDescription>Atlas da Violência 2025 | {indicadoresVulnerabilidade.taxaHomicidio100mil.ano}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-3xl font-bold text-destructive">{indicadoresVulnerabilidade.taxaHomicidio100mil.taxaNegros}</p>
                      <p className="text-xs text-muted-foreground">Negros (por 100 mil)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{indicadoresVulnerabilidade.taxaHomicidio100mil.taxaNaoNegros}</p>
                      <p className="text-xs text-muted-foreground">Não negros (por 100 mil)</p>
                    </div>
                  </div>
                  <div className="p-2 bg-destructive/10 rounded text-center mb-3">
                    <p className="text-sm font-bold text-destructive">
                      {indicadoresVulnerabilidade.taxaHomicidio100mil.razaoRisco}x maior risco para negros
                    </p>
                  </div>
                  <div className="text-xs space-y-1 mb-3">
                    <p className="font-medium text-muted-foreground">Evolução 2018→2023:</p>
                    <p className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-success" />
                      <span>Queda de {indicadoresVulnerabilidade.taxaHomicidio100mil.quedaNegros2018_2023}% entre negros</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-success" />
                      <span>Queda de {indicadoresVulnerabilidade.taxaHomicidio100mil.quedaNaoNegros2018_2023}% entre não negros</span>
                    </p>
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <Info className="w-3 h-3" />
                      <span>Risco relativo estável: {indicadoresVulnerabilidade.taxaHomicidio100mil.razaoRisco2018}x → {indicadoresVulnerabilidade.taxaHomicidio100mil.razaoRisco}x</span>
                    </p>
                  </div>
                  <FonteInfo fonte={indicadoresVulnerabilidade.taxaHomicidio100mil.fonte} tabela="Atlas da Violência 2025" link={indicadoresVulnerabilidade.taxaHomicidio100mil.link} atualizacao="2025-05-01" />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-destructive">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">{indicadoresVulnerabilidade.homicidiosPorRaca.nome}</CardTitle>
                  <CardDescription>19º Anuário FBSP 2025 | {indicadoresVulnerabilidade.homicidiosPorRaca.ano}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-3xl font-bold text-destructive">{indicadoresVulnerabilidade.homicidiosPorRaca.percentualVitimasNegras}%</p>
                      <p className="text-xs text-muted-foreground">Vítimas Negras</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{indicadoresVulnerabilidade.homicidiosPorRaca.percentualVitimasBrancas}%</p>
                      <p className="text-xs text-muted-foreground">Vítimas Brancas</p>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 mb-3">
                    <p className="font-medium text-muted-foreground">Evolução 2018→2022 (Atlas 2025):</p>
                    <p className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-destructive" />
                      <span>75,7% (2018) → 76,5% (2022) — concentração aumentou</span>
                    </p>
                  </div>
                  <FonteInfo fonte={indicadoresVulnerabilidade.homicidiosPorRaca.fonte} tabela="19º Anuário FBSP 2025" link={indicadoresVulnerabilidade.homicidiosPorRaca.link} atualizacao="2025-07-17" />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-destructive">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">{indicadoresVulnerabilidade.letalidadePolicial.nome}</CardTitle>
                  <CardDescription>19º Anuário FBSP 2025 | {indicadoresVulnerabilidade.letalidadePolicial.ano}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-2">{indicadoresVulnerabilidade.letalidadePolicial.totalMortes.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mb-4">mortes por intervenção policial</p>
                  <div className="p-2 bg-destructive/10 rounded text-center mb-3">
                    <p className="text-sm font-bold text-destructive">
                      {indicadoresVulnerabilidade.letalidadePolicial.percentualNegros}% eram negros
                    </p>
                  </div>
                  <FonteInfo fonte={indicadoresVulnerabilidade.letalidadePolicial.fonte} tabela="19º Anuário FBSP 2025" link={indicadoresVulnerabilidade.letalidadePolicial.link} atualizacao="2025-07-17" />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-warning">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">{indicadoresVulnerabilidade.violenciaJuventude.nome}</CardTitle>
                  <CardDescription>Atlas da Violência 2025 | {indicadoresVulnerabilidade.violenciaJuventude.ano}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-warning">{indicadoresVulnerabilidade.violenciaJuventude.percentualVitimas}%</p>
                    <p className="text-sm text-muted-foreground">das vítimas de homicídio tinham 15-29 anos</p>
                  </div>
                  <div className="p-2 bg-destructive/10 rounded text-center mb-3">
                    <p className="text-sm font-bold text-destructive">
                      {indicadoresVulnerabilidade.violenciaJuventude.feminicidioNegras}% das vítimas de homicídio feminino são negras
                    </p>
                    <p className="text-xs text-muted-foreground">Atlas da Violência 2025, p.57</p>
                  </div>
                  <FonteInfo fonte={indicadoresVulnerabilidade.violenciaJuventude.fonte} tabela="Atlas da Violência 2025" link={indicadoresVulnerabilidade.violenciaJuventude.link} atualizacao="2025-05-01" />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-warning">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">{indicadoresVulnerabilidade.ivjn.nome}</CardTitle>
                  <CardDescription>Atlas da Violência 2025 | {indicadoresVulnerabilidade.ivjn.ano}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-warning">{indicadoresVulnerabilidade.ivjn.riscoRelativo}x</p>
                    <p className="text-sm text-muted-foreground"><p className="text-sm text-muted-foreground">risco de homicídio para jovens negros vs brancos</p></p>
                    <p className="text-[10px] text-warning mt-1">({indicadoresVulnerabilidade.ivjn.qualificador})</p>
                  </div>
                  <div className="text-xs space-y-1 mb-3">
                    <p className="font-medium text-muted-foreground">Evolução:</p>
                    <p className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-destructive" />
                      <span>Desigualdade persistente: {indicadoresVulnerabilidade.ivjn.riscoRelativo2017}x (2017) → {indicadoresVulnerabilidade.ivjn.riscoRelativo}x (2021)</span>
                    </p>
                    <p className="flex items-center gap-1 text-destructive">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Jovens negros c/ ensino superior: risco até {indicadoresVulnerabilidade.ivjn.riscoSuperiorNegro}x maior (2021)</span>
                    </p>
                  </div>
                  <FonteInfo fonte={indicadoresVulnerabilidade.ivjn.fonte} tabela="Atlas da Violência 2025" link={indicadoresVulnerabilidade.ivjn.link} atualizacao="2025-05-01" />
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-warning">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    {indicadoresVulnerabilidade.mortalidadeMaterna.nome}
                    <EstimativaBadge tipo="cruzamento" metodologia="Cálculo: (Óbitos maternos por raça ÷ Nascidos vivos por raça) × 100.000. Fontes: SIM/DataSUS + SINASC/DataSUS. Resultado 2022: negras 57,3/100mil NV vs brancas 46,6/100mil NV = razão 1,2×." />
                    
                  </CardTitle>
                  <CardDescription>DataSUS — Cruzamento SIM × SINASC | {indicadoresVulnerabilidade.mortalidadeMaterna.ano}</CardDescription>
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
                  <FonteInfo fonte={indicadoresVulnerabilidade.mortalidadeMaterna.fonte} tabela="SIM/SINASC" link={indicadoresVulnerabilidade.mortalidadeMaterna.link} atualizacao="2023-12-01" />
                </CardContent>
              </Card>
            </div>

            {/* Indicadores Sociais — Povos Indígenas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent" />
                  Indicadores Sociais — Povos Indígenas
                  
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  🔀 Cruzamento: NCPI/DataSUS (2024) + INEP Censo Escolar (2022) + SESAI (2024)
                  <EstimativaBadge
                    tipo="cruzamento"
                    metodologia="Cruzamento de 3 fontes: NCPI Working Paper (dados SIM/DataSUS 2018-2022) + INEP Censo Escolar 2022 (escolas em terra indígena) + SESAI/MS (34 DSEIs). Nenhuma fonte consolida todos os indicadores conjuntamente."
                  />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-destructive/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-destructive">34,7‰</p>
                    <p className="text-sm text-muted-foreground">Mortalidade infantil indígena</p>
                    <p className="text-xs text-muted-foreground mt-1">vs 14,2‰ não-indígenas (2022)</p>
                    <p className="text-xs font-semibold text-destructive mt-1">Razão: 2,44×</p>
                    <a href="https://ncpi.org.br/wp-content/uploads/2024/07/Desigualdades-em-saude-de-criancas-indigenas.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center justify-center gap-0.5 mt-1">
                      <ExternalLink className="w-2.5 h-2.5" /> NCPI/DataSUS (PDF)
                    </a>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-primary">3.553</p>
                    <p className="text-sm text-muted-foreground">Escolas em terra indígena</p>
                    <p className="text-xs text-muted-foreground mt-1">das 179,3 mil escolas de educação básica</p>
                    <a href="https://anonymousdata.inep.gov.br/analytics/saw.dll?Dashboard&PortalPath=%2Fshared%2FCenso%20da%20Educa%C3%A7%C3%A3o%20B%C3%A1sica%2F_portal%2FCat%C3%A1logo%20de%20Escolas&Page=Lista%20das%20Escolas" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center justify-center gap-0.5 mt-1">
                      <ExternalLink className="w-2.5 h-2.5" /> Catálogo de Escolas INEP (2026)
                    </a>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-warning">34</p>
                    <p className="text-sm text-muted-foreground">DSEIs em operação</p>
                    <p className="text-xs text-muted-foreground mt-1">Cobertura em todos os estados</p>
                    <p className="text-[10px] text-warning mt-1">% cobertura consolidada não publicada pela SESAI</p>
                    <a href="https://www.gov.br/saude/pt-br/composicao/sesai/estrutura/dsei" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center justify-center gap-0.5 mt-1">
                      <ExternalLink className="w-2.5 h-2.5" /> SESAI — DSEIs
                    </a>
                  </div>
                </div>

                <details className="mb-3">
                  <summary className="text-xs text-destructive/80 italic cursor-pointer hover:text-destructive">
                    ⚠ Nota metodológica: viés de classificação racial em óbitos infantis — clique para expandir
                  </summary>
                  <div className="mt-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                    {`⚠️ NOTA METODOLÓGICA — VIÉS DE CLASSIFICAÇÃO RACIAL EM ÓBITOS INFANTIS:
Estes dados representam apenas a taxa bruta de mortalidade infantil ([óbitos infantis / nascidos vivos] × 1.000) calculada a partir dos dados do DataSUS (SIM + SINASC). Eles NÃO eliminam a defasagem estatística dos óbitos classificados como "ignorados" quanto à cor/raça.

O indicador apresenta um viés sistemático: quem preenche a cor/raça no atestado de óbito (SIM) não é um parente da criança, mas sim o médico ou funcionário do cartório. Bebês que vêm a óbito frequentemente adquirem aspecto esbranquiçado, levando à classificação equivocada como "brancos". Na pressa do registro, muitos óbitos são classificados como "ignorados" — entre 2018 e 2025, foram 15.992 óbitos infantis com cor/raça ignorada, mais que o dobro dos 6.718 óbitos registrados como de crianças pretas.

CORREÇÃO HISTÓRICA: Até a entrada em vigor da LGPD, era possível corrigir esse viés vinculando os microdados do SIM com os do SINASC via software R, atribuindo à criança falecida a cor/raça da mãe (autodeclarada no SINASC). Com as restrições da LGPD, esse procedimento de linkage nominal não é mais viável.`}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <a href="https://www.scielo.br/j/csp/a/YqR67bJXrZBZ6RRmRvCfMJP/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" /> Chor & Lima — Mortalidade infantil segundo cor ou raça (Cad. Saúde Pública, 2005)
                    </a>
                    <a href="https://portalantigo.ipea.gov.br/agencia/images/stories/PDFs/nota_tecnica/131119_notatecnicadiest10.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" /> IPEA Nota Técnica nº 10 — Vidas Perdidas e Racismo no Brasil (2013)
                    </a>
                  </div>
                </details>

                <div className="p-3 bg-muted rounded-lg mb-3">
                  <p className="text-xs font-medium">Interpretação (NCPI 2024, INEP 2022, SESAI 2024):</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• <strong>Mortalidade:</strong> Crianças indígenas (0-4 anos) morrem 2,44× mais que não-indígenas; meta ODS (&lt;25‰) não alcançada</li>
                    <li>• <strong>Causas:</strong> Doenças respiratórias (18%), infecciosas (14%) e nutricionais (6%) — taxas 2-6× maiores que não-indígenas</li>
                    <li>• <strong>Educação:</strong> 3.553 escolas em TI (Catálogo INEP 2026), mas apenas ~1% dos alunos se declaram indígenas no Censo Escolar</li>
                    <li>• <strong>Saúde:</strong> 34 DSEIs operam em todos os estados; SESAI não publica taxa de cobertura consolidada verificável</li>
                  </ul>
                </div>

                <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3 h-3" /> <strong>Fontes oficiais:</strong>
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <a href="https://ncpi.org.br/wp-content/uploads/2024/07/Desigualdades-em-saude-de-criancas-indigenas.pdf" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> NCPI — Desigualdades em Saúde Indígena (PDF)
                    </a>
                    <a href="https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2024-04/mortalidade-de-criancas-indigenas-e-mais-que-o-dobro-das-nao-indigenas" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> Agência Brasil — Mortalidade Infantil Indígena
                    </a>
                    <a href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/noticias/censo-escolar/educacao-em-terras-indigenas-o-que-diz-o-censo-escolar" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> INEP — Educação em Terras Indígenas
                    </a>
                    <a href="https://www.gov.br/saude/pt-br/composicao/sesai/estrutura/dsei" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> SESAI — Estrutura DSEIs
                    </a>
                    <a href="http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/inf10uf.def" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> DataSUS/SIM — Mortalidade Infantil
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ciganos — dados precários */}
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="pt-6 flex gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
                <div>
                  <p className="font-semibold">Ciganos/Roma — Indicadores Sociais Indisponíveis</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Não há dados oficiais desagregados sobre saúde, educação ou renda para povos ciganos.
                    O Censo 2022 não incluiu pergunta específica (lacuna CERD §54-55).
                    Primeiro levantamento parcial: MUNIC/IBGE 2024 (apenas acampamentos identificados por municípios).
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="destructive" className="text-xs">Dados Indisponíveis</Badge>
                    <a href="https://www.ibge.gov.br/estatisticas/sociais/saude/10586-pesquisa-de-informacoes-basicas-municipais.html" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> MUNIC/IBGE 2024
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lacunas por Grupo */}
        <TabsContent value="lacunas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
}
