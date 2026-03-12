import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  segurancaPublica, educacaoSerieHistorica, saudeSerieHistorica,
  indicadoresSocioeconomicos, feminicidioSerie,
  povosTradicionais
} from '@/components/estatisticas/StatisticsData';
import { narrativaJuventude, narrativaQuilombolas } from '@/utils/narrativeHelpers';

interface IndicadorTemporal {
  nome: string;
  grupo: string;
  dados: { ano: number; valor: number }[];
  unidade: string;
  fonte: string;
  interpretacao: 'menor_melhor' | 'maior_melhor';
  estimativa?: boolean;
  metodologia?: string;
}

function calcTendencia(dados: { ano: number; valor: number }[], interpretacao: 'menor_melhor' | 'maior_melhor'): 'melhoria' | 'piora' | 'estavel' {
  if (dados.length < 2) return 'estavel';
  const primeiro = dados[0].valor;
  const ultimo = dados[dados.length - 1].valor;
  const variacao = ((ultimo - primeiro) / primeiro) * 100;
  if (Math.abs(variacao) < 3) return 'estavel';
  const subiu = ultimo > primeiro;
  if (interpretacao === 'menor_melhor') return subiu ? 'piora' : 'melhoria';
  return subiu ? 'melhoria' : 'piora';
}

function variacao(dados: { ano: number; valor: number }[]): string {
  if (dados.length < 2) return 'N/D';
  const primeiro = dados[0].valor;
  const ultimo = dados[dados.length - 1].valor;
  const v = ((ultimo - primeiro) / primeiro) * 100;
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
}

const TendenciaLabel = ({ tendencia }: { tendencia: 'melhoria' | 'piora' | 'estavel' }) => {
  if (tendencia === 'melhoria') return (
    <Badge className="bg-success/10 text-success border-success/30 gap-1"><TrendingUp className="w-3 h-3" /> Melhoria</Badge>
  );
  if (tendencia === 'piora') return (
    <Badge className="bg-destructive/10 text-destructive border-destructive/30 gap-1"><TrendingDown className="w-3 h-3" /> Piora</Badge>
  );
  return (
    <Badge className="bg-muted text-muted-foreground gap-1"><Minus className="w-3 h-3" /> Estável</Badge>
  );
};

// Build indicator series from StatisticsData
// REGRA DE OURO: PROIBIDO usar proxies multiplicadores (×1.5, ×1.8, ×2.5 etc.) ou projeções.
// Apenas dados reais de fontes oficiais ou cruzamentos indiretos com 2+ fontes auditáveis são permitidos.
function buildIndicadores(): Record<string, IndicadorTemporal[]> {
  const populacaoNegra: IndicadorTemporal[] = [
    {
      nome: 'Taxa de homicídio (por 100 mil)',
      grupo: 'populacao_negra',
      dados: segurancaPublica.filter(s => s.homicidioNegro != null).map(s => ({ ano: s.ano, valor: s.homicidioNegro! })),
      unidade: 'por 100 mil',
      fonte: 'Atlas da Violência (IPEA/FBSP)',
      interpretacao: 'menor_melhor',
    },
    {
      nome: 'Vítimas negras de homicídio (%)',
      grupo: 'populacao_negra',
      dados: segurancaPublica.filter(s => s.percentualVitimasNegras != null).map(s => ({ ano: s.ano, valor: s.percentualVitimasNegras! })),
      unidade: '%',
      fonte: 'FBSP',
      interpretacao: 'menor_melhor',
    },
    {
      nome: 'Letalidade policial negra (%)',
      grupo: 'populacao_negra',
      dados: segurancaPublica.filter(s => s.letalidadePolicial != null).map(s => ({ ano: s.ano, valor: s.letalidadePolicial! })),
      unidade: '%',
      fonte: 'FBSP',
      interpretacao: 'menor_melhor',
    },
    {
      nome: 'Desemprego negro (%)',
      grupo: 'populacao_negra',
      dados: indicadoresSocioeconomicos.map(s => ({ ano: s.ano, valor: s.desempregoNegro })),
      unidade: '%',
      fonte: 'PNAD Contínua',
      interpretacao: 'menor_melhor',
    },
    {
      nome: 'Renda média negra (R$)',
      grupo: 'populacao_negra',
      dados: indicadoresSocioeconomicos.map(s => ({ ano: s.ano, valor: s.rendaMediaNegra })),
      unidade: 'R$',
      fonte: 'PNAD Contínua/SIDRA 6800',
      interpretacao: 'maior_melhor',
    },
    {
      nome: 'Ensino superior negro (%)',
      grupo: 'populacao_negra',
      dados: educacaoSerieHistorica.map(s => ({ ano: s.ano, valor: s.superiorNegroPercent })),
      unidade: '%',
      fonte: 'PNAD Educação',
      interpretacao: 'maior_melhor',
    },
    {
      nome: 'Analfabetismo negro (%)',
      grupo: 'populacao_negra',
      dados: educacaoSerieHistorica.map(s => ({ ano: s.ano, valor: s.analfabetismoNegro })),
      unidade: '%',
      fonte: 'PNAD Educação',
      interpretacao: 'menor_melhor',
    },
    {
      nome: 'Pobreza negra (%)',
      grupo: 'populacao_negra',
      dados: indicadoresSocioeconomicos
        .filter(s => s.pobreza_negra != null)
        .map(s => ({ ano: s.ano, valor: s.pobreza_negra as number })),
      unidade: '%',
      fonte: 'IBGE/SIS',
      interpretacao: 'menor_melhor',
    },
  ];

  // Juventude Negra: séries temporais existentes que afetam desproporcionalmente jovens 15-29
  // Atlas 2025: {narrativaJuventude.percentualVitimas}% vítimas homicídio têm 15-29 anos; {narrativaJuventude.percentualNegrosHomens}% jovens negros masculinos
  // Não usa multiplicadores — usa as séries reais de segurança/emprego como indicadores correlatos
  const juventudeNegra: IndicadorTemporal[] = [
    {
      nome: 'Homicídio negro (por 100 mil)',
      grupo: 'juventude_negra',
      dados: segurancaPublica.filter(s => s.homicidioNegro != null).map(s => ({ ano: s.ano, valor: s.homicidioNegro! })),
      unidade: 'por 100 mil',
      fonte: 'Atlas da Violência (IPEA/FBSP)',
      interpretacao: 'menor_melhor',
      estimativa: true,
      metodologia: `Taxa geral; ${narrativaJuventude.percentualVitimas}% das vítimas têm 15-29 anos (Atlas 2025)`,
    },
    {
      nome: 'Vítimas negras de homicídio (%)',
      grupo: 'juventude_negra',
      dados: segurancaPublica.filter(s => s.percentualVitimasNegras != null).map(s => ({ ano: s.ano, valor: s.percentualVitimasNegras! })),
      unidade: '%',
      fonte: 'FBSP — concentração na faixa 15-29',
      interpretacao: 'menor_melhor',
    },
    {
      nome: 'Letalidade policial negra (%)',
      grupo: 'juventude_negra',
      dados: segurancaPublica.filter(s => s.letalidadePolicial != null).map(s => ({ ano: s.ano, valor: s.letalidadePolicial! })),
      unidade: '%',
      fonte: 'FBSP — perfil predominante: jovem negro',
      interpretacao: 'menor_melhor',
    },
    {
      nome: 'Desemprego negro (%)',
      grupo: 'juventude_negra',
      dados: indicadoresSocioeconomicos.map(s => ({ ano: s.ano, valor: s.desempregoNegro })),
      unidade: '%',
      fonte: 'PNAD Contínua (SIDRA 7113)',
      interpretacao: 'menor_melhor',
      estimativa: true,
      metodologia: 'Taxa geral negra; juventude 18-24 registra ~20,8% (2024)',
    },
  ];

  const mulheresNegras: IndicadorTemporal[] = [
    {
      nome: 'Feminicídio mulheres negras (%)',
      grupo: 'mulheres_negras',
      dados: feminicidioSerie.map(s => ({ ano: s.ano, valor: s.percentualNegras })),
      unidade: '%',
      fonte: 'FBSP',
      interpretacao: 'menor_melhor',
    },
    {
      nome: 'Mortalidade materna negra (por 100 mil NV)',
      grupo: 'mulheres_negras',
      dados: saudeSerieHistorica.map(s => ({ ano: s.ano, valor: s.mortalidadeMaternaNegra })),
      unidade: 'por 100 mil NV',
      fonte: 'DataSUS/SIM',
      interpretacao: 'menor_melhor',
    },
    // REMOVIDO: Chefia de família negra — dados fabricados eliminados (Regra de Ouro)
    // Lacuna documentada em lacunasDocumentadas[0] — SIDRA 6403 não publica série temporal por raça
  ];

  // Povos Indígenas: REMOVIDOS indicadores sem fonte auditável
  // Mortalidade infantil: SESAI não publica série consolidada desagregada verificável com deep link
  // Acesso à saúde: SESAI Relatórios de Gestão sem valor consolidado verificável
  // Mantido apenas: Terras Indígenas (FUNAI - dados verificáveis)
  const indigenas: IndicadorTemporal[] = [
    {
      nome: 'TIs homologadas + reservadas (acumulado)',
      grupo: 'indigenas',
      dados: [
        // ISA/terrasindigenas.org.br — total acumulado derivado de StatisticsData
        // Baseline 2018: total atual (536) - novas homologações no período (21) = 515
        // Total 2025: 536 (ISA Mar/2026)
        { ano: 2018, valor: povosTradicionais.indigenas.totalTIsHomologadasReservadas2018 },
        { ano: 2025, valor: povosTradicionais.indigenas.totalTIsHomologadasReservadas2025 },
      ],
      unidade: 'TIs',
      fonte: 'ISA/terrasindigenas.org.br + FUNAI (homologações)',
      interpretacao: 'maior_melhor',
    },
  ];

  return {
    populacao_negra: populacaoNegra,
    juventude_negra: juventudeNegra,
    mulheres_negras: mulheresNegras,
    indigenas: indigenas,
  };
}

function GrupoCard({ nome, indicadores }: { nome: string; indicadores: IndicadorTemporal[] }) {
  const melhorias = indicadores.filter(i => calcTendencia(i.dados, i.interpretacao) === 'melhoria').length;
  const pioras = indicadores.filter(i => calcTendencia(i.dados, i.interpretacao) === 'piora').length;
  const estaveis = indicadores.length - melhorias - pioras;

  const situacaoGeral = melhorias > pioras ? 'melhoria' : pioras > melhorias ? 'piora' : 'estavel';

  return (
    <Card className={cn(
      'border-l-4',
      situacaoGeral === 'melhoria' && 'border-l-success',
      situacaoGeral === 'piora' && 'border-l-destructive',
      situacaoGeral === 'estavel' && 'border-l-muted-foreground',
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{nome}</CardTitle>
          <div className="flex gap-1">
            {melhorias > 0 && <Badge variant="outline" className="text-success border-success/30 text-xs">↑{melhorias}</Badge>}
            {pioras > 0 && <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">↓{pioras}</Badge>}
            {estaveis > 0 && <Badge variant="outline" className="text-xs">→{estaveis}</Badge>}
          </div>
        </div>
        <CardDescription className="flex items-center gap-2">
          Avaliação geral: <TendenciaLabel tendencia={situacaoGeral} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {indicadores.map((ind, idx) => {
            const tendencia = calcTendencia(ind.dados, ind.interpretacao);
            const primeiro = ind.dados[0];
            const ultimo = ind.dados[ind.dados.length - 1];
            return (
              <div key={idx} className={cn(
                "flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0",
                ind.estimativa && "bg-warning/5 px-2 py-1 rounded"
              )}>
                <div className="flex-1">
                  <p className="font-medium">{ind.nome}</p>
                  <p className="text-xs text-muted-foreground">{ind.fonte}</p>
                  {ind.estimativa && ind.metodologia && (
                    <p className="text-[10px] text-warning mt-0.5 leading-tight">⚠ {ind.metodologia}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs">
                    <span className="text-muted-foreground">{primeiro.ano}: </span>
                    <span className="font-medium">{primeiro.valor.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="text-right text-xs">
                    <span className="text-muted-foreground">{ultimo.ano}: </span>
                    <span className="font-medium">{ultimo.valor.toFixed(1)}</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    'text-xs min-w-[60px] justify-center',
                    tendencia === 'melhoria' && 'text-success border-success/30',
                    tendencia === 'piora' && 'text-destructive border-destructive/30',
                  )}>
                    {variacao(ind.dados)}
                  </Badge>
                  <TendenciaLabel tendencia={tendencia} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function SerieTemporalGrupos() {
  const indicadoresPorGrupo = buildIndicadores();

  const grupoLabels: Record<string, string> = {
    populacao_negra: 'População Negra (Preta + Parda)',
    juventude_negra: 'Juventude Negra (15-29 anos)',
    mulheres_negras: 'Mulheres Negras',
    indigenas: 'Povos Indígenas',
  };

  // Summary across all groups
  const todosIndicadores = Object.values(indicadoresPorGrupo).flat();
  const totalMelhorias = todosIndicadores.filter(i => calcTendencia(i.dados, i.interpretacao) === 'melhoria').length;
  const totalPioras = todosIndicadores.filter(i => calcTendencia(i.dados, i.interpretacao) === 'piora').length;

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Evolução Temporal 2018→2024 — Diagnóstico por Grupo Focal</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Análise de {todosIndicadores.length} indicadores-chave para determinar se a situação de cada grupo está melhorando ou piorando ao longo do período do relatório.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">{totalMelhorias} em melhoria</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium">{totalPioras} em piora</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{todosIndicadores.length - totalMelhorias - totalPioras} estáveis</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      {totalPioras > totalMelhorias && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-sm">
              <strong>Alerta:</strong> A maioria dos indicadores aponta piora ou estabilidade — desigualdade racial estrutural persiste apesar dos avanços normativos.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Group cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(indicadoresPorGrupo).map(([key, inds]) => (
          <GrupoCard key={key} nome={grupoLabels[key] || key} indicadores={inds} />
        ))}
      </div>

      {/* Ciganos gap */}
      <Card className="border-destructive/50 border-l-4 border-l-destructive">
        <CardContent className="pt-6 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium">Ciganos/Roma — Série Temporal Inexistente</p>
            <p className="text-sm text-muted-foreground">
              Não há dados oficiais desagregados que permitam construir uma série temporal para este grupo.
              O Censo 2022 não incluiu pergunta específica. Lacuna crítica CERD §54-55.
            </p>
            <Badge variant="destructive" className="mt-2 text-xs">Dados Indisponíveis</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quilombolas partial */}
      <Card className="border-warning/50 border-l-4 border-l-warning">
        <CardContent className="pt-6 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
          <div>
            <p className="font-medium">Quilombolas — Série Temporal Limitada</p>
            <p className="text-sm text-muted-foreground">
              Primeira contagem oficial apenas no Censo 2022 ({narrativaQuilombolas.populacao.toLocaleString('pt-BR')}). Sem dados anteriores para comparação direta. 
              Indicadores indiretos: {narrativaQuilombolas.territoriosTitulados} territórios titulados (de {narrativaQuilombolas.processosAbertosIncra.toLocaleString('pt-BR')} em processo ≈ {Math.round(narrativaQuilombolas.territoriosTitulados / narrativaQuilombolas.processosAbertosIncra * 100)}%); rede de água {narrativaQuilombolas.aguaRedeGeral}%; esgotamento adequado {narrativaQuilombolas.esgotamentoAdequado}%.
            </p>
            <Badge variant="outline" className="mt-2 text-xs border-warning text-warning">Dados Parciais</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
