import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Building2, ExternalLink, FileText, AlertTriangle, CheckCircle2, XCircle, Network, TrendingUp, MapPin, Info, GraduationCap, Briefcase } from 'lucide-react';
import { AuditFooter } from '@/components/ui/audit-footer';
import { EstimativaBadge } from '@/components/ui/estimativa-badge';
import { useMirrorData } from '@/hooks/useMirrorData';

// =============================================
// DADOS MUNIC/ESTADIC 2024 - IBGE
// =============================================

const ESTADIC_FONTES = [
  { nome: 'ESTADIC 2024 — IBGE', url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/16770-pesquisa-de-informacoes-basicas-estaduais.html' },
  { nome: 'IBGE Agência — Resultados', url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44891-estadic-2024-tres-estados-nao-tem-canal-de-denuncias-de-violacao-de-direitos-raciais' },
];

const MUNIC_FONTES = [
  { nome: 'MUNIC 2024 — IBGE', url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/10586-pesquisa-de-informacoes-basicas-municipais.html' },
  { nome: 'IBGE/IPEA — Divulgação', url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44906-ibge-divulga-dados-ineditos-sobre-politicas-de-igualdade-racial-nas-administracoes-estaduais-e-municipais' },
];

const SINAPIR_FONTES = [
  { nome: 'SINAPIR — MIR', url: 'https://www.gov.br/igualdaderacial/pt-br/assuntos/sinapir' },
  { nome: 'Lista Entes Participantes (Jan/2025)', url: 'https://www.gov.br/igualdaderacial/pt-br/assuntos/sinapir/20260105SINAPIRGeralAtualizado.pdf' },
];

const estadicData = {
  totalUFs: 27,
  ufsComEstruturaIgualdadeRacial: 27,
  ufsComCanalDenuncia: 24,
  ufsSemCanalDenuncia: ['Acre', 'Tocantins', 'Sergipe'],
  ufsComDelegaciaCrimesRaciais: 17,
  ufsComConselhoIgualdadeRacial: 26,
  ufsSemConselho: ['Rio Grande do Sul'],
  ufsComFundoIgualdadeRacial: 2,
  ufsComFundo: ['Rio Grande do Norte', 'Paraná'],
  ufsComOrcamentoPrevisto: 8,
  ufsNenhumaExecucao100: true,
  ufsComReservaVagas: 14,
  ufsSemReservaVagas: 8,
  ufsSemConcursoOuResposta: 5, // CE não respondeu; RO, MA, RN, PB não realizaram concurso
  ufsComLegislacaoEspecifica: 25,
  ufsSemLegislacao: ['Rondônia', 'Santa Catarina'],
  ufsComPlanoIgualdade: 9,
  ufsPlanoEmElaboracao: 10,
  legislacaoMaisCitada: [
    { tipo: 'Promoção da igualdade racial e/ou enfrentamento ao racismo', ufs: 20 },
    { tipo: 'Reserva de vagas em concursos para pessoas negras', ufs: 15 },
    { tipo: 'Combate à discriminação racial na administração pública', ufs: 14 },
  ],
  corRacaGestores: [
    { raca: 'Brancos', quantidade: 11 },
    { raca: 'Pretos', quantidade: 9 },
    { raca: 'Pardos', quantidade: 5 },
    { raca: 'Indígenas', quantidade: 1 },
    { raca: 'Quilombolas', quantidade: 1 },
  ],
  generoGestores: { mulheres: 24, homens: 3 },
  ufsComComiteIgualdade: 16,
  comiteMaisCitado: 'Saúde da População Negra (8 UFs)',
  gruposNaoContemplados: [
    { grupo: 'Ciganos', estados: 'AC, RO, AM, AP, PA, MA, PI, CE, RN, PB, PE, SE, RJ, RS, SC, MS, TO' },
    { grupo: 'Indígenas', estados: 'RO, RR, AP, TO, CE, RN, PB, PE, SE, SC' },
    { grupo: 'Quilombolas', estados: 'AC, RO, AP, TO, CE, RN, PB, PE, RJ, SP, SC, MS' },
    { grupo: 'Demais PCTs', estados: 'PA, CE, MA, PE, RN, MS, RS' },
  ],
};

const municData = {
  totalMunicipios: 5570,
  // NOTA: Os microdados da MUNIC 2024 sobre igualdade racial ainda não foram
  // publicados no SIDRA/IBGE. Os valores abaixo são PENDENTES de consolidação
  // oficial e não devem ser citados em relatórios CERD.
  pendenteSidra: true,
  municipiosComEstruturaIgualdade: null as number | null,
  municipiosComConselhoIgualdade: null as number | null,
  municipiosComPlanoIgualdade: null as number | null,
  municipiosComLegislacaoRacial: null as number | null,
  municipiosComOrgaoEspecifico: null as number | null,
};

const sinapirData = {
  totalAdesoes: 342,
  totalAdesoesInicioGoverno2023: 188,
  crescimentoPercentual: 82,
  novasAdesoes2024: 59,
  novasAdesoes2025: 83,
  alteracoesModalidade2024: 6,
  totalEstados: 27,
  primeiraAdesao: 2014,
  baseLegal: 'Lei nº 12.288/2010 (Estatuto da Igualdade Racial) e Decreto nº 8.136/2013',
  gestao: 'Secretaria de Gestão do Sistema Nacional de Promoção da Igualdade Racial (SENAPIR)',
  modalidades: [
    { tipo: 'Básica', descricao: 'Conselho + Órgão + Ações listadas', cor: 'bg-chart-3/20 text-chart-3' },
    { tipo: 'Intermediária', descricao: 'Básica + Plano local de igualdade racial', cor: 'bg-chart-2/20 text-chart-2' },
    { tipo: 'Plena', descricao: 'Intermediária + Fundo de igualdade racial', cor: 'bg-chart-1/20 text-chart-1' },
  ],
  evolucaoAdesoes: [
    { periodo: '2014-2018', adesoes: 120 },
    { periodo: '2019-2022', adesoes: 68 },
    { periodo: '2023', adesoes: 36 },
    { periodo: '2024', adesoes: 59 },
    { periodo: '2025', adesoes: 83 },
  ],
  capitaisAderidas2024: ['Porto Velho (RO)', 'Belém (PA)', 'João Pessoa (PB)', 'Manaus (AM)'],
  estadosMaisAdesoes2024: [
    { estado: 'Maranhão', municipios: 11 },
    { estado: 'Rio Grande do Sul', municipios: 11 },
  ],
  prerequisitosAdesao: [
    'Conselho de políticas públicas de Promoção da Igualdade Racial em funcionamento',
    'Órgão público voltado à Promoção da Igualdade Racial na estrutura administrativa',
    'Listagem detalhada de ações e projetos de Promoção da Igualdade Racial',
  ],
  municipiosAderidos: 342,
  coberturaPercentualMunicipios: '6.1',
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const gestoresRacaData = estadicData.corRacaGestores.map(item => ({
  name: item.raca,
  value: item.quantidade,
}));

const legislacaoData = estadicData.legislacaoMaisCitada.map(item => ({
  tipo: item.tipo.length > 35 ? item.tipo.substring(0, 35) + '...' : item.tipo,
  tipoFull: item.tipo,
  ufs: item.ufs,
}));

export function AdmPublicaSection() {
  const { admSource } = useMirrorData();
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Administração Pública e Igualdade Racial — MUNIC/ESTADIC 2024
              </h3>
              <p className="text-sm text-muted-foreground">
                Dados inéditos do IBGE sobre a estrutura político-institucional dos governos estaduais e municipais 
                voltada para a promoção da igualdade racial. Primeira vez que as pesquisas MUNIC e ESTADIC incluem 
                um bloco específico sobre igualdade racial, após mais de 20 anos de existência.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-primary/10 text-primary">MUNIC 2024</Badge>
                <Badge className="bg-primary/10 text-primary">ESTADIC 2024</Badge>
                <Badge variant="outline">Divulgação: 31/10/2025</Badge>
                {admSource === 'bd' ? (
                  <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" /> SSoT BD</Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">Fallback estático</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards resumo ESTADIC */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-chart-1">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">UFs com Estrutura de Igualdade Racial</p>
            <p className="text-2xl font-bold">{estadicData.ufsComEstruturaIgualdadeRacial}/27</p>
            <p className="text-xs font-medium text-chart-1">100% dos estados</p>
            <AuditFooter fontes={ESTADIC_FONTES} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">UFs com Canal de Denúncia Racial</p>
            <p className="text-2xl font-bold">{estadicData.ufsComCanalDenuncia}/27</p>
            <p className="text-xs text-warning">3 sem: AC, TO, SE</p>
            <AuditFooter fontes={ESTADIC_FONTES} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">UFs com Fundo de Igualdade Racial</p>
            <p className="text-2xl font-bold">{estadicData.ufsComFundoIgualdadeRacial}/27</p>
            <p className="text-xs text-destructive">Apenas RN e PR</p>
            <AuditFooter fontes={ESTADIC_FONTES} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">UFs com Legislação Específica</p>
            <p className="text-2xl font-bold">{estadicData.ufsComLegislacaoEspecifica}/27</p>
            <p className="text-xs text-muted-foreground">Sem: RO e SC</p>
            <AuditFooter fontes={ESTADIC_FONTES} compact />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gestores por raça */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cor/Raça dos Gestores de Igualdade Racial (ESTADIC 2024)</CardTitle>
            <CardDescription>Perfil dos gestores estaduais — 24 mulheres vs 3 homens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gestoresRacaData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {gestoresRacaData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Destaque interseccional:</strong> 88,9% dos gestores são mulheres (24 de 27), 
              exceto SP, RS e GO. Contraste com outras áreas: Transporte 96,2% homens.
              <br />
              <span className="italic">Obs.: MG não informou cor/raça do gestor (26 respondentes).</span>
            </p>
            <AuditFooter fontes={ESTADIC_FONTES} documentos={['ESTADIC 2024', 'CERD 2022 §19']} compact />
          </CardContent>
        </Card>

        {/* Legislação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Legislação Estadual sobre Igualdade Racial</CardTitle>
            <CardDescription>Tipos de legislação mais presentes nos 27 estados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={legislacaoData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 27]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="tipo" width={140} tick={{ fontSize: 9 }} />
                  <Tooltip 
                    formatter={(value: number, _: string, props: any) => [
                      `${value} UFs`, props.payload.tipoFull
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="ufs" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-chart-1" />
                <strong>Plano Estadual:</strong> 9 UFs aprovaram, 10 em elaboração
              </p>
              <p className="text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-warning" />
                <strong>Reserva de vagas em concursos:</strong> 8 estados sem previsão (AM, RR, PA, TO, PE, MG, SC, GO); 
                5 não realizaram concurso ou não responderam (CE, RO, MA, RN, PB)
              </p>
            </div>
            <AuditFooter fontes={ESTADIC_FONTES} documentos={['ESTADIC 2024']} compact />
          </CardContent>
        </Card>
      </div>

      {/* Grupos não contemplados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Lacunas: Grupos Não Contemplados por Programas Estaduais
          </CardTitle>
          <CardDescription>
            Embora todos os 27 estados tenham programas para População Negra e Povos de Terreiros, 
            outros grupos não são atendidos em alguns estados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo Populacional</TableHead>
                <TableHead>Estados sem Programa Específico</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estadicData.gruposNaoContemplados.map(item => (
                <TableRow key={item.grupo}>
                  <TableCell className="font-medium">{item.grupo}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.estados}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-warning border-warning">
                      {item.estados.split(',').length}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Não havia comitês ou comissões de Afroturismo/Turismo Étnico, nem de Reconhecimento/Proteção 
            do Patrimônio e Cultura dos Povos Ciganos em nenhum estado.
          </p>
          <AuditFooter fontes={ESTADIC_FONTES} documentos={['ESTADIC 2024', 'Durban §4-5']} compact />
        </CardContent>
      </Card>

      {/* Estrutura orçamentária e institucional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estrutura Institucional Estadual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Estrutura organizacional de Igualdade Racial', value: '27/27', icon: CheckCircle2, color: 'text-chart-1' },
                { label: 'Conselho Estadual de Igualdade Racial', value: '26/27', icon: CheckCircle2, color: 'text-chart-1' },
                { label: 'Canal de denúncia de violação de direitos raciais', value: '24/27', icon: AlertTriangle, color: 'text-warning' },
                { label: 'Delegacia de Crimes Raciais (capital)', value: '17/27', icon: AlertTriangle, color: 'text-warning' },
                { label: 'Comitê/Comissão de Igualdade Racial', value: '16/27', icon: AlertTriangle, color: 'text-warning' },
                { label: 'Orçamento previsto para Igualdade Racial', value: '8/27', icon: XCircle, color: 'text-destructive' },
                { label: 'Fundo Estadual de Igualdade Racial', value: '2/27', icon: XCircle, color: 'text-destructive' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <Badge variant="outline" className="font-mono">{item.value}</Badge>
                </div>
              ))}
            </div>
            <AuditFooter fontes={ESTADIC_FONTES} documentos={['ESTADIC 2024']} compact />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Panorama Municipal (MUNIC 2024)</CardTitle>
            <CardDescription>Estrutura de políticas de igualdade racial nos municípios brasileiros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border border-warning/30 bg-warning/5 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-warning">Microdados Municipais Pendentes</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Os microdados da MUNIC 2024 referentes ao bloco de Igualdade Racial ainda não foram 
                    disponibilizados no SIDRA/IBGE para tabulação detalhada. As informações qualitativas 
                    abaixo são extraídas da divulgação oficial (31/10/2025), mas os quantitativos por município 
                    ainda aguardam publicação.
                  </p>
                  <span className="inline-flex items-center rounded-full border px-1.5 py-0 text-[9px] font-semibold bg-warning/10 text-warning border-warning/30 gap-0.5">
                    ⏳ Dados pendentes de publicação
                  </span>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Informações confirmadas (Agência IBGE, 31/10/2025):</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Primeira vez que a MUNIC investiga o bloco de Igualdade Racial em seus mais de 20 anos de existência</li>
                  <li>A política de igualdade racial é recente na maioria dos municípios</li>
                  <li>"Os números são modestos da existência de estruturas" — Vânia Pacheco (IBGE)</li>
                  <li>SINAPIR registra {sinapirData.municipiosAderidos} municípios aderidos ({sinapirData.coberturaPercentualMunicipios}% do total de 5.570)</li>
                </ul>
              </div>
            </div>
            <AuditFooter fontes={MUNIC_FONTES} documentos={['MUNIC 2024']} compact />
          </CardContent>
        </Card>
      </div>

      {/* ====== SINAPIR ====== */}
      <Card className="border-l-4 border-l-chart-2 mt-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Network className="w-6 h-6 text-chart-2 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                SINAPIR — Sistema Nacional de Promoção da Igualdade Racial
              </h3>
              <p className="text-sm text-muted-foreground">
                Instituído pelo Estatuto da Igualdade Racial (Lei 12.288/2010) e regulamentado pelo Decreto 8.136/2013, 
                o SINAPIR articula a implementação de políticas de enfrentamento ao racismo em todo o território nacional. 
                A adesão dos entes federados possibilita acesso prioritário a recursos e programas federais.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-chart-2/10 text-chart-2">SINAPIR</Badge>
                <Badge className="bg-chart-2/10 text-chart-2">342 adesões</Badge>
                <Badge variant="outline">Atualizado: Fev/2026</Badge>
                <Badge variant="outline">27/27 UFs</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards resumo SINAPIR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total de Adesões</p>
            <p className="text-2xl font-bold">{sinapirData.totalAdesoes}</p>
            <p className="text-xs font-medium text-chart-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +50% desde jan/2023
            </p>
            <AuditFooter fontes={SINAPIR_FONTES} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Estados Aderidos</p>
            <p className="text-2xl font-bold">{sinapirData.totalEstados}/27</p>
            <p className="text-xs font-medium text-chart-1">100% das UFs (completo em 2024)</p>
            <AuditFooter fontes={SINAPIR_FONTES} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-3">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Novas Adesões em 2024</p>
            <p className="text-2xl font-bold">{sinapirData.novasAdesoes2024}</p>
            <p className="text-xs text-muted-foreground">+6 alterações de modalidade</p>
            <AuditFooter fontes={SINAPIR_FONTES} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Cobertura Municipal</p>
            <p className="text-2xl font-bold">~{sinapirData.municipiosAderidos}</p>
            <p className="text-xs text-warning">{sinapirData.coberturaPercentualMunicipios}% dos 5.570 municípios</p>
            <AuditFooter fontes={SINAPIR_FONTES} compact />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução das adesões */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução das Adesões ao SINAPIR</CardTitle>
            <CardDescription>De 120 adesões (2014-2018) a 282 totais (jan/2025)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sinapirData.evolucaoAdesoes} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} adesões`, 'Novas adesões']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="adesoes" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Destaque:</strong> 2024 registrou o maior número de adesões anuais da história do SINAPIR (58), 
              superando o recorde anterior. Sergipe e Roraima completaram a cobertura de todos os estados.
            </p>
            <AuditFooter fontes={SINAPIR_FONTES} documentos={['Lei 12.288/2010', 'Decreto 8.136/2013']} compact />
          </CardContent>
        </Card>

        {/* Modalidades de gestão */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modalidades de Gestão do SINAPIR</CardTitle>
            <CardDescription>Portaria nº 8/2014, atualizada pela Portaria nº 290/2023</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sinapirData.modalidades.map((mod, idx) => (
                <div key={mod.tipo} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={mod.cor}>{mod.tipo}</Badge>
                    <span className="text-xs text-muted-foreground">Nível {idx + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{mod.descricao}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs font-semibold mb-1">Pré-requisitos para adesão:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {sinapirData.prerequisitosAdesao.map(req => (
                  <li key={req} className="flex items-start gap-1">
                    <CheckCircle2 className="w-3 h-3 text-chart-1 flex-shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <AuditFooter fontes={SINAPIR_FONTES} documentos={['Portaria 8/2014', 'Portaria 290/2023']} compact />
          </CardContent>
        </Card>
      </div>

      {/* Capitais e estados destaque 2024 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-chart-2" />
              Capitais que Aderiram em 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {sinapirData.capitaisAderidas2024.map(capital => (
                <div key={capital} className="flex items-center gap-2 p-2 bg-chart-2/5 rounded-lg border border-chart-2/20">
                  <CheckCircle2 className="w-4 h-4 text-chart-2" />
                  <span className="text-sm font-medium">{capital}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              A adesão dessas capitais amplia significativamente a abrangência territorial do SINAPIR, 
              alcançando populações majoritariamente negras e indígenas.
            </p>
            <AuditFooter fontes={SINAPIR_FONTES} compact />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estados com Mais Adesões Municipais (2024)</CardTitle>
            <CardDescription>Efeito multiplicador: municípios atuam como referência regional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sinapirData.estadosMaisAdesoes2024.map(item => (
                <div key={item.estado} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.estado}</span>
                    <span className="font-bold text-chart-2">{item.municipios} municípios</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-chart-2 h-2 rounded-full transition-all" 
                      style={{ width: `${(item.municipios / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg border border-warning/30 bg-warning/5">
              <p className="text-xs flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Lacuna CERD:</strong> Apesar do crescimento de 50%, apenas {sinapirData.coberturaPercentualMunicipios}% dos 
                  municípios brasileiros aderiram ao SINAPIR, indicando que a política de igualdade racial permanece 
                  pouco institucionalizada na maioria dos governos locais.
                </span>
              </p>
            </div>
            <AuditFooter fontes={SINAPIR_FONTES} documentos={['CERD 2022 §19']} compact />
          </CardContent>
        </Card>
      </div>

      {/* ====== COTAS RACIAIS ====== */}
      <Card className="border-l-4 border-l-chart-5 mt-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-6 h-6 text-chart-5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Cotas Raciais — Ações Afirmativas no Serviço Público e Educação Superior
              </h3>
              <p className="text-sm text-muted-foreground">
                Políticas de ação afirmativa para ingresso de pessoas negras, indígenas e quilombolas 
                em concursos públicos federais e universidades federais (2012–2025).
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-chart-5/10 text-chart-5">Art. 2(2)</Badge>
                <Badge className="bg-chart-5/10 text-chart-5">Art. 5(e)</Badge>
                <Badge className="bg-chart-5/10 text-chart-5">Art. 7</Badge>
                <Badge variant="outline">2012–2025</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cotas no serviço público */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-chart-5" />
              Cotas Raciais no Serviço Público Federal
            </CardTitle>
            <CardDescription>Lei 12.990/2014 → Lei 15.142/2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-chart-3/10 text-chart-3">Lei 12.990/2014</Badge>
                  <span className="text-lg font-bold">20%</span>
                </div>
                <p className="text-xs text-muted-foreground">Reserva de vagas para negros em concursos federais</p>
              </div>
              <div className="flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-chart-1" />
              </div>
              <div className="p-3 rounded-lg border-2 border-chart-1/50 bg-chart-1/5">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-chart-1/10 text-chart-1">Lei 15.142/2025</Badge>
                  <span className="text-lg font-bold text-chart-1">30%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ampliação para 30% — inclui negros, indígenas e quilombolas
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg border border-warning/30 bg-warning/5">
              <p className="text-xs flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Lacuna:</strong> Percentual de servidores negros efetivamente nomeados via cotas 
                  não confirmado em fonte MGI/SIGEPE. Efetividade pendente de verificação.
                </span>
              </p>
            </div>
            <AuditFooter 
              fontes={[
                { nome: 'Senado Federal — Lei 15.142/2025', url: 'https://www12.senado.leg.br/noticias/materias/2025/06/06/lei-amplia-a-30-as-vagas-para-negros-indigenas-e-quilombolas-em-concursos' },
                { nome: 'MGI / Serviço Público Federal', url: 'https://www.gov.br/gestao/pt-br' },
              ]} 
              documentos={['CERD Observações Finais 2022', 'CERD III Relatório (2018)']} 
              compact 
            />
          </CardContent>
        </Card>

        {/* Cotas na educação superior */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-chart-5" />
              Ingresso por Cotas Raciais em Universidades Federais
            </CardTitle>
            <CardDescription>Crescimento de 493% no critério étnico-racial (2012→2022)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { ano: '2012', total: 40661, racial: 12425 },
                    { ano: '2022', total: 108616, racial: 73679 },
                  ]} 
                  margin={{ left: 10, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      value.toLocaleString('pt-BR'), 
                      name === 'total' ? 'Total ingressos por cotas' : 'Critério étnico-racial'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend formatter={(value) => value === 'total' ? 'Total Cotas' : 'Étnico-Racial'} />
                  <Bar dataKey="total" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="racial" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-chart-1" />
                <strong>Total cotas:</strong> 40.661 → 108.616 (+167%)
              </p>
              <p className="text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-chart-1" />
                <strong>Étnico-racial:</strong> 12.425 → 73.679 (+493%)
              </p>
            </div>
            <AuditFooter 
              fontes={[
                { nome: 'INEP — Censo Educação Superior', url: 'https://www.gov.br/inep/pt-br/assuntos/noticias/censo-da-educacao-superior/ingresso-por-cotas-aumentou-167-nas-universidades' },
              ]} 
              documentos={['CERD Observações Finais 2022', 'Recomendações Gerais (RGs)']} 
              compact 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
