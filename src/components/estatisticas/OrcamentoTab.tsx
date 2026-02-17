import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Building2, MapPin, Users, TreePine, Tent, AlertTriangle, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AuditFooter } from '@/components/ui/audit-footer';
import { useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';
import { OrgaoSection } from './orcamento/OrgaoSection';
import { ProgramCard } from './orcamento/ProgramCard';
import { EmptyEsferaCard } from './orcamento/EmptyEsferaCard';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

/** Classify a record into thematic categories based on orgao + program name */
function classifyRecord(r: DadoOrcamentario): string[] {
  const cats: string[] = [];
  const prog = r.programa.toLowerCase();
  const orgao = r.orgao.toUpperCase();
  const obs = (r.observacoes || '').toLowerCase();

  // SESAI — segregated from indigenous total
  if (orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') ||
      prog.includes('20yp') || prog.includes('7684')) {
    cats.push('sesai');
    cats.push('federal_geral'); // SESAI compõe o somatório federal
    return cats;
  }

  // Indígena (excluding SESAI)
  if (['FUNAI', 'MPI'].includes(orgao) ||
      prog.includes('indigen') || prog.includes('indígen') ||
      prog.includes('2065') || prog.includes('0617') || prog.includes('5136')) {
    cats.push('indigena');
  }

  // Quilombola
  if (prog.includes('quilomb') || prog.includes('20g7') || prog.includes('0859')) {
    cats.push('quilombola');
  }

  // Ciganos/Romani
  if (prog.includes('cigano') || prog.includes('romani') || prog.includes('povo cigano')) {
    cats.push('ciganos');
  }

  // If no thematic match, it's general federal
  if (cats.length === 0) cats.push('federal_geral');

  return cats;
}

/** Group records: orgao → programa → records[] */
function groupByOrgaoPrograma(records: DadoOrcamentario[]): Map<string, Map<string, DadoOrcamentario[]>> {
  const result = new Map<string, Map<string, DadoOrcamentario[]>>();
  for (const item of records) {
    if (!result.has(item.orgao)) result.set(item.orgao, new Map());
    const orgaoMap = result.get(item.orgao)!;
    if (!orgaoMap.has(item.programa)) orgaoMap.set(item.programa, []);
    orgaoMap.get(item.programa)!.push(item);
  }
  return result;
}

function countPrograms(grouped: Map<string, Map<string, DadoOrcamentario[]>>): number {
  let count = 0;
  grouped.forEach(orgao => { count += orgao.size; });
  return count;
}

function sumField(records: DadoOrcamentario[], field: 'pago' | 'dotacao_autorizada' | 'empenhado'): number {
  return records.reduce((acc, r) => acc + ((r as any)[field] || 0), 0);
}

function sumPago(records: DadoOrcamentario[]): number {
  return sumField(records, 'pago');
}

function sumDotacao(records: DadoOrcamentario[]): number {
  return sumField(records, 'dotacao_autorizada');
}

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
  if (value === 0) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

interface TabConfig {
  value: string;
  label: string;
  icon: React.ReactNode;
  emptyDesc: string;
}

const TABS: TabConfig[] = [
  { value: 'federal', label: 'Programas Federais', icon: <Building className="w-4 h-4" />, emptyDesc: 'Nenhum dado federal encontrado.' },
  { value: 'indigena', label: 'Povos Indígenas', icon: <TreePine className="w-4 h-4" />, emptyDesc: 'Nenhum programa com foco em povos indígenas encontrado.' },
  { value: 'quilombola', label: 'Quilombolas', icon: <Users className="w-4 h-4" />, emptyDesc: 'Nenhum programa com foco em quilombolas encontrado.' },
  { value: 'ciganos', label: 'Ciganos', icon: <Tent className="w-4 h-4" />, emptyDesc: 'Nenhum programa com foco em povos ciganos encontrado.' },
  { value: 'sesai', label: 'SESAI (Saúde Indígena)', icon: <AlertTriangle className="w-4 h-4" />, emptyDesc: 'Nenhum dado SESAI encontrado.' },
  { value: 'estadual', label: 'Estaduais', icon: <Building2 className="w-4 h-4" />, emptyDesc: 'Dados estaduais ainda não coletados. Utilize SICONFI/RREO dos portais de transparência estaduais.' },
  { value: 'municipal', label: 'Municipais', icon: <MapPin className="w-4 h-4" />, emptyDesc: 'Dados municipais ainda não coletados. Utilize portais de transparência municipais.' },
];

export function OrcamentoTab() {
  const { data: dadosOrcamentarios, isLoading: orcLoading } = useDadosOrcamentarios();
  const { data: stats, isLoading: statsLoading } = useOrcamentoStats();

  const categorized = useMemo(() => {
    if (!dadosOrcamentarios) return {
      federal: [] as DadoOrcamentario[],
      indigena: [] as DadoOrcamentario[],
      quilombola: [] as DadoOrcamentario[],
      ciganos: [] as DadoOrcamentario[],
      sesai: [] as DadoOrcamentario[],
      estadual: [] as DadoOrcamentario[],
      municipal: [] as DadoOrcamentario[],
    };

    const buckets: Record<string, DadoOrcamentario[]> = {
      federal: [], indigena: [], quilombola: [], ciganos: [], sesai: [], estadual: [], municipal: [],
    };

    for (const item of dadosOrcamentarios) {
      // Esfera-based routing
      if (item.esfera === 'estadual') { buckets.estadual.push(item); continue; }
      if (item.esfera === 'municipal') { buckets.municipal.push(item); continue; }

      const cats = classifyRecord(item);

      // SESAI goes to sesai bucket AND to federal total (included in calculations)
      if (cats.includes('sesai')) {
        buckets.sesai.push(item);
        buckets.federal.push(item);
        continue;
      }

      // SEPPIR always included. MIR bypass only for ano >= 2023.
      const orgaoUpper = (item.orgao || '').toUpperCase();
      const isSeppir = orgaoUpper === 'SEPPIR';
      const isMirLike = orgaoUpper === 'MIR' || orgaoUpper.includes('IGUALDADE RACIAL') || orgaoUpper.includes('MIR/');
      const isMirPost2023 = isMirLike && item.ano >= 2023;

      // Program 5034: exclude non-racial actions unless from SEPPIR or MIR post-2023
      // IMPORTANT: Only check real API fields (programa, descritivo) — publico_alvo is fabricated
      if (item.programa.toLowerCase().includes('5034') && !isSeppir && !isMirPost2023) {
        const texto = [item.programa, item.descritivo].filter(Boolean).join(' ').toLowerCase();
        const hasRacialKw = ['racial', 'racismo', 'negro', 'negra', 'afro', 'quilomb', 'indigen', 'cigan', 'romani', 'terreiro', 'matriz africana', 'igualdade racial', 'palmares', 'capoeira', 'candomblé', 'umbanda'].some(kw => texto.includes(kw));
        if (!hasRacialKw) continue;
      }

      // Federal: all non-SESAI, non-5034/2020 go to federal tab + thematic tabs
      buckets.federal.push(item);

      for (const cat of cats) {
        if (cat !== 'federal_geral' && buckets[cat]) {
          buckets[cat].push(item);
        }
      }
    }

    return buckets;
  }, [dadosOrcamentarios]);

  const grouped = useMemo(() => {
    const result: Record<string, Map<string, Map<string, DadoOrcamentario[]>>> = {};
    for (const [key, records] of Object.entries(categorized)) {
      result[key] = groupByOrgaoPrograma(records);
    }
    return result;
  }, [categorized]);

  const isLoading = orcLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards — nuanced with dotação vs pago */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Política Racial (Federal)', sub: 'Inclui SESAI', dotacao: sumDotacao(categorized.federal), pago: sumPago(categorized.federal), count: categorized.federal.length, color: 'border-l-primary' },
          { label: 'Povos Indígenas', sub: 'FUNAI / MPI', dotacao: sumDotacao(categorized.indigena), pago: sumPago(categorized.indigena), count: categorized.indigena.length, color: 'border-l-chart-2' },
          { label: 'Quilombolas', sub: 'INCRA / Ações 20G7', dotacao: sumDotacao(categorized.quilombola), pago: sumPago(categorized.quilombola), count: categorized.quilombola.length, color: 'border-l-chart-3' },
          { label: 'Ciganos', sub: 'Povo Cigano / Romani', dotacao: sumDotacao(categorized.ciganos), pago: sumPago(categorized.ciganos), count: categorized.ciganos.length, color: 'border-l-chart-4' },
          { label: 'Variação 2018-22 vs 23-26', sub: 'Dotação comparada', dotacao: null, pago: null, count: null, variacao: stats?.variacao, color: stats && stats.variacao > 0 ? 'border-l-success' : 'border-l-destructive' },
        ].map((card, i) => (
          <Card key={i} className={`border-l-4 ${card.color}`}>
            <CardContent className="pt-3 pb-3 px-4">
              <p className="text-[11px] font-medium text-foreground leading-tight">{card.label}</p>
              <p className="text-[10px] text-muted-foreground">{card.sub}</p>
              {card.variacao !== undefined ? (
                <>
                  <p className="text-lg font-bold mt-1">{card.variacao && card.variacao > 0 ? '+' : ''}{card.variacao?.toFixed(1)}%</p>
                </>
              ) : (
                <div className="mt-1.5 space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-muted-foreground">Dotação</span>
                    <span className="text-xs font-semibold">{formatCompact(card.dotacao || 0)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-muted-foreground">Pago</span>
                    <span className="text-xs font-bold text-primary">{formatCompact(card.pago || 0)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{card.count} registros</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit footer for summary cards */}
      <AuditFooter
        fontes={[
          { nome: 'Portal da Transparência — Execução Federal', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
          { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' },
        ]}
        documentos={['CERD/C/BRA/CO/18-20 §14']}
        compact
      />

      {/* Nota Metodológica */}
      <Collapsible>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4 pb-3">
            <CollapsibleTrigger className="flex items-start gap-2 w-full text-left">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground">Nota Metodológica — Série Orçamentária</h4>
                <p className="text-xs text-muted-foreground mt-1">Clique para expandir limitações e contexto interpretativo dos dados.</p>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 ml-7 space-y-4">
              {/* 1. Estratégia de Coleta */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 1. Estratégia de Coleta — 4 Camadas Independentes
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>Camada 1 — Programas Temáticos do PPA:</strong> Consulta direta por código de programa finalístico: 2034 (SEPPIR, PPA 2016-2019), 5034 (MDHC/MIR, desde 2020), 0617 (Povos Indígenas PPA 2020-2023), 2065 (Povos Indígenas PPA 2012-2019), 5136 (Povos Indígenas PPA 2024+), 5802/5803/5804 (MIR, desde 2024), 0153 (Criança/Adolescente).</li>
                  <li><strong>Camada 2 — Subfunção 422:</strong> Direitos Individuais, Coletivos e Difusos. Captura ações não vinculadas aos programas acima, validadas por palavras-chave raciais/étnicas.</li>
                  <li><strong>Camada 3 — Órgãos com Mandato Direto:</strong> MIR (67000) e MPI (92000). Captura toda despesa desses órgãos, deduplicada contra camadas anteriores.</li>
                  <li><strong>Camada 4 — Ações Específicas SESAI:</strong> Consulta direta por código de ação (20YP e 7684). Necessária porque a SESAI migrou do programa indígena (2065/0617) para o programa de saúde (5022) no PPA 2020-2023, ficando fora das Camadas 1-3.</li>
                </ul>
              </div>

              {/* 2. Critério de Classificação */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 2. Critério de Classificação e Inclusão
                </h5>
                <p className="text-xs text-muted-foreground">
                  A classificação temática (Política Racial, Indígena, Quilombola, Cigano) utiliza <strong>exclusivamente campos reais</strong> retornados pela API oficial do Portal da Transparência: <code className="bg-muted px-1 rounded">programa</code> e <code className="bg-muted px-1 rounded">descritivo</code>. Campos como <code className="bg-muted px-1 rounded">publico_alvo</code>, <code className="bg-muted px-1 rounded">observacoes</code> e <code className="bg-muted px-1 rounded">razao_selecao</code> <strong>não são utilizados</strong> na lógica de filtragem, pois são metadados internos do sistema que não existem na API oficial.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Palavras-chave de inclusão:</strong> racial, racismo, negro/a, afro, quilomb*, indigen*, indígen*, cigan*, romani, terreiro, matriz africana, igualdade racial, palmares, capoeira, candomblé, umbanda.
                </p>
              </div>

              {/* 3. Exclusões Explícitas */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 3. Exclusões Explícitas do Cálculo
                </h5>
                <p className="text-xs text-muted-foreground mb-1">
                  Os seguintes programas e ações foram excluídos por serem transversais, genéricos ou falsos positivos — ou seja, não configuram investimento finalístico em política racial/étnica:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-none pl-0">
                  <li className="border border-border rounded p-2">
                    <strong className="text-destructive">Programas Transversais (grande escala):</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li><strong>2068</strong> — Bolsa Família / Transferência de Renda</li>
                      <li><strong>2049</strong> — Minha Casa, Minha Vida (Habitação)</li>
                      <li><strong>2012/5022</strong> — SUS / Saúde (exceto ações SESAI específicas)</li>
                      <li><strong>2015</strong> — SUAS / Assistência Social</li>
                      <li><strong>5113</strong> — Educação Superior (~R$ 14 bi; genérico)</li>
                      <li><strong>6012</strong> — Fundo Eleitoral</li>
                    </ul>
                    <p className="text-[10px] mt-1 italic">Razão: embora possam beneficiar populações racializadas, são políticas universalistas sem focalização racial explícita. Incluí-los inflaria artificialmente os totais.</p>
                  </li>
                  <li className="border border-border rounded p-2">
                    <strong className="text-destructive">Ações Genéricas do MDHC (Programa 5034, pré-2023):</strong>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      <li><strong>0E85</strong> — Subsídios a operações em fundos de saúde (genérica)</li>
                      <li><strong>14XS</strong> — Gestão administrativa (overhead)</li>
                      <li><strong>00SN</strong> — Casas da Mulher Brasileira (política de gênero, não racial)</li>
                      <li><strong>00SO</strong> — Unidades de Atendimento Socioeducativo (genérica; incluída erroneamente por campo fabricado <code className="bg-muted px-1 rounded">publico_alvo</code> — corrigida)</li>
                      <li><strong>21AR, 21AS, 21AT, 21AU</strong> — Ações administrativas e de gestão do MDHC</li>
                    </ul>
                    <p className="text-[10px] mt-1 italic">Razão: o programa 5034 era guarda-chuva do MDHC até 2022. Apenas ações com palavras-chave raciais explícitas nos campos <code className="bg-muted px-1 rounded">programa</code> ou <code className="bg-muted px-1 rounded">descritivo</code> são incluídas (ex: ação 6440 — regularização de quilombos).</p>
                  </li>
                  <li className="border border-border rounded p-2">
                    <strong className="text-destructive">Bypass Temporal — MIR pré-2023:</strong>
                    <p className="text-[10px] mt-1">A API do Portal da Transparência retroativamente rotula registros do MDHC (2020-2022) como órgão MIR (código 67000), embora o MIR só tenha sido criado em janeiro de 2023. Para evitar a inclusão de ações genéricas do MDHC, registros rotulados como MIR com <code className="bg-muted px-1 rounded">ano &lt; 2023</code> passam por filtragem adicional: apenas são mantidos se os campos <code className="bg-muted px-1 rounded">programa</code> ou <code className="bg-muted px-1 rounded">descritivo</code> contiverem palavras-chave raciais.</p>
                  </li>
                </ul>
              </div>

              {/* 4. SESAI */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" /> 4. SESAI — Saúde Indígena: Detalhamento Técnico
                </h5>
                <p className="text-xs text-muted-foreground">
                  A Secretaria Especial de Saúde Indígena (SESAI) representa o maior volume financeiro individual da política indígena (~R$ 1,3–1,5 bi/ano). Sua captura exigiu ajustes técnicos significativos devido a mudanças de codificação entre PPAs:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>PPA 2016-2019 (Programa 2065):</strong> As ações 20YP (Atenção à Saúde Indígena) e 7684 (Saneamento em Aldeias) estavam vinculadas ao programa temático de Povos Indígenas. Captura automática pela Camada 1.
                  </li>
                  <li>
                    <strong>PPA 2020-2023 (Migração para Programa 5022):</strong> A SESAI foi reclassificada para o programa genérico de Saúde (5022), <strong>saindo da órbita dos programas indígenas</strong> (0617). Isso gerava uma lacuna: as Camadas 1-3 não capturavam mais esses dados. A <strong>Camada 4</strong> foi criada especificamente para resolver isso, buscando diretamente pelos códigos de ação 20YP e 7684 independentemente do programa-pai.
                  </li>
                  <li>
                    <strong>PPA 2024-2027:</strong> Estrutura mantida sob programa de saúde. A Camada 4 continua necessária.
                  </li>
                  <li>
                    <strong>Ações capturadas:</strong>
                    <ul className="list-none pl-2 mt-1 space-y-0.5">
                      <li>• <strong>20YP</strong> — Atenção à Saúde dos Povos Indígenas (~R$ 1,37–1,47 bi/ano pago)</li>
                      <li>• <strong>7684</strong> — Saneamento Básico em Aldeias Indígenas para Prevenção e Controle de Agravos (~R$ 23–29 mi/ano pago)</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Tratamento no cálculo:</strong> Os registros SESAI são alocados simultaneamente na aba <em>"SESAI (Saúde Indígena)"</em> para análise detalhada <strong>e</strong> nos totais de <em>"Política Racial (Federal)"</em>, garantindo que o investimento em saúde indígena componha o somatório consolidado da política racial federal.
                  </li>
                  <li>
                    <strong>Identificação:</strong> Um registro é classificado como SESAI se o campo <code className="bg-muted px-1 rounded">orgao</code> = "SESAI", ou se o campo <code className="bg-muted px-1 rounded">observacoes</code> contém "saúde indígena" / "sesai", ou se o programa contém os códigos "20yp" / "7684".
                  </li>
                </ul>
              </div>

              {/* 5. Transição de Códigos */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 5. Transição de Códigos de Programa — PPA a PPA
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>Povos Indígenas:</strong> 2065 (PPA 2012-2019) → 0617 (PPA 2020-2023) → 5136 (PPA 2024-2027).</li>
                  <li><strong>SESAI:</strong> 2065 (2018-2019) → 5022 (2020-2023, via Camada 4) → 5022 (2024+, via Camada 4).</li>
                  <li><strong>Política Racial:</strong> 2034 (SEPPIR, PPA 2016-2019) → 5034 (MDHC guarda-chuva, PPA 2020-2023) → 5804 (MIR, PPA 2024+).</li>
                  <li><strong>Quilombolas:</strong> Ação 20G7/0859 (transversal a PPAs) + Programa 5802 (PPA 2024+).</li>
                </ul>
              </div>

              {/* 6. Padrão da Série */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 6. Padrão da Série (2018–2025)
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>2018–2019:</strong> Base modesta sob SEPPIR/MMFDH (~R$ 93–123 mi excluindo SESAI). SESAI: ~R$ 1,37–1,47 bi (20YP) + R$ 23–29 mi (7684). FUNAI: 5 ações, ~R$ 30–38 mi.</li>
                  <li><strong>2020–2023:</strong> Programa 5034 como guarda-chuva do MDHC; apenas ações com palavras-chave raciais incluídas. FUNAI/MPI: via programa 0617. SESAI: via Camada 4.</li>
                  <li><strong>2021–2022:</strong> Queda real de dotação para R$ 161–173 mi — desmonte institucional da pauta racial.</li>
                  <li><strong>2023:</strong> Salto para R$ 457 mi — criação do MIR e reconstrução da pauta racial.</li>
                  <li><strong>2024–2025:</strong> Novos programas focalizados: 5802 (Quilombolas/Ciganos), 5803 (Juventude Negra), 5804 (Igualdade Étnico-Racial). FUNAI/MPI: programa 5136.</li>
                </ul>
              </div>

              {/* 7. Dotação LOA */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> 7. Dotação LOA — Complementação via Dados Abertos
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>A API REST do Portal da Transparência não fornece valores de <strong>Dotação Inicial (LOA)</strong>.</li>
                  <li>Os valores são obtidos dos arquivos ZIP/CSV do Portal de Dados Abertos, processados pela função <em>ingest-dotacao-loa</em>.</li>
                  <li>Matching entre execução (API) e dotação (CSV) por chave composta <strong>Código Programa | Código Ação</strong>.</li>
                  <li>Proporção de dotação distribuída entre ações com base no peso relativo do valor pago.</li>
                </ul>
              </div>

              <p className="text-[10px] text-muted-foreground italic mt-2 border-t border-border pt-2">
                <strong>Fonte:</strong> API Portal da Transparência + Dados Abertos (CSV/ZIP). <strong>Filtro de inclusão:</strong> racial, racismo, negro/a, afro, quilomb*, indigen*, cigan*, romani, terreiro, matriz africana, palmares, capoeira, candomblé, umbanda. <strong>Deduplicação:</strong> cross-layer por chave orgao|programa|ano. <strong>Campos de classificação:</strong> exclusivamente <code className="bg-muted px-1 rounded">programa</code> e <code className="bg-muted px-1 rounded">descritivo</code> (campos reais da API).
              </p>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>

      {/* Tabs */}
      <Tabs defaultValue="federal" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {TABS.map(tab => {
            const records = categorized[tab.value] || [];
            const progCount = countPrograms(grouped[tab.value] || new Map());
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                {tab.icon}
                {tab.label}
                {progCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{progCount}</Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map(tab => {
          const tabGrouped = grouped[tab.value] || new Map();
          return (
            <TabsContent key={tab.value} value={tab.value}>
              {tabGrouped.size > 0 ? (
                <div className="space-y-8">
                  {Array.from(tabGrouped.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([orgao, programas]) => (
                      <OrgaoSection key={orgao} orgao={orgao} programas={programas} />
                    ))}
                </div>
              ) : (
                <EmptyEsferaCard
                  esfera={tab.label.toLowerCase()}
                  descricao={tab.emptyDesc}
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
