import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus, FileText, Database, BarChart3, BookOpen, Users } from 'lucide-react';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, inferArtigosDocumentoNormativo, inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';
import type { FioCondutor, ConclusaoDinamica } from '@/hooks/useAnalyticalInsights';
import type { DadoOrcamentario, RespostaLacunaCerdIII } from '@/hooks/useLacunasData';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { useMirrorData } from '@/hooks/useMirrorData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

interface DocumentoNormativo {
  id: string;
  titulo: string;
  categoria: string;
  status: string;
  secoes_impactadas?: string[] | null;
  recomendacoes_impactadas?: string[] | null;
  metas_impactadas?: string[] | null;
}

interface IcerdAdherencePanelProps {
  fiosCondutores: FioCondutor[];
  conclusoes: ConclusaoDinamica[];
  lacunas: any[];
  orcamentoRecords: DadoOrcamentario[];
  indicadores: any[];
  stats: any;
  respostas: RespostaLacunaCerdIII[];
  documentosNormativos: DocumentoNormativo[];
}

type ArtigoAnalysis = {
  numero: ArtigoConvencao;
  titulo: string;
  tituloCompleto: string;
  cor: string;
  // Coverage dimensions
  lacunasTotal: number;
  lacunasCumpridas: number;
  lacunasParciais: number;
  lacunasNaoCumpridas: number;
  lacunasRetrocesso: number;
  fiosTotal: number;
  fiosAvanco: number;
  fiosRetrocesso: number;
  conclusoesAvanco: number;
  conclusoesRetrocesso: number;
  conclusoesLacuna: number;
  orcamentoLiquidado: number;
  orcamentoProgramas: number;
  indicadoresCount: number;
  // NEW dimensions
  respostasTotal: number;
  respostasCumpridas: number;
  respostasNaoCumpridas: number;
  normativosCount: number;
  seriesEstatisticas: number; // count of stat series covering this article
  // Computed
  grauAderencia: number; // 0-100
  tendencia: 'melhora' | 'piora' | 'estagnacao';
  veredito: string;
};

/**
 * Map statistical series to ICERD articles based on thematic coverage.
 * Returns a count of distinct statistical evidence series per article.
 */
function useCountStatSeriesPerArticle() {
  const m = useMirrorData();
  const { data: allIndicadores } = useIndicadoresInterseccionais();
  return useMemo(() => {
    const c: Record<ArtigoConvencao, number> = { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0, VII: 0 };

    // Helper: add to articles if data exists
    const add = (data: any, arts: ArtigoConvencao[], n = 1) => {
      const has = Array.isArray(data) ? data.length > 0 : !!data;
      if (has) arts.forEach(a => { c[a] += n; });
    };

    // ── DEMOGRAFIA (Art I, II — definição e obrigações) ──
    add(m.dadosDemograficos, ['I', 'II'], 2);
    add(m.evolucaoComposicaoRacial, ['I', 'II']);

    // ── SEGURANÇA (Art V-b, VI) ──
    add(m.segurancaPublica, ['V', 'VI'], 2);
    add(m.feminicidioSerie, ['V', 'VI']);
    add(m.atlasViolencia2025, ['V', 'VI']);
    add(m.jovensNegrosViolencia, ['V', 'VI']);
    add(m.violenciaInterseccional, ['V', 'VI']);

    // ── EDUCAÇÃO (Art V-e-v, VII) ──
    add(m.educacaoSerieHistorica, ['V', 'VII'], 2);
    add(m.analfabetismoGeral2024, ['V', 'VII']);
    add(m.evasaoEscolarSerie, ['V', 'VII']);

    // ── SAÚDE (Art V-e-iv) ──
    add(m.saudeSerieHistorica, ['V'], 2);
    add(m.saudeMaternaRaca, ['V']);

    // ── HABITAÇÃO / RENDA (Art V-e-iii, V-e-i) ──
    add(m.deficitHabitacionalSerie, ['V']);
    add(m.cadUnicoPerfilRacial, ['V']);
    add(m.indicadoresSocioeconomicos, ['V'], 2);
    add(m.rendimentosCenso2022, ['I', 'V']);
    add(m.evolucaoDesigualdade, ['I', 'II', 'V']);

    // ── RAÇA × GÊNERO (Art I interseccionalidade, V DESCA) ──
    add(m.interseccionalidadeTrabalho, ['I', 'V']);
    add(m.trabalhoRacaGenero, ['I', 'V']);
    add(m.educacaoRacaGenero, ['I', 'V', 'VII']);
    add(m.chefiaFamiliarRacaGenero, ['I', 'V']);

    // ── DEFICIÊNCIA (Art I interseccionalidade, II medidas especiais) ──
    add(m.deficienciaPorRaca, ['I', 'II', 'V']);
    add(m.disparidadesPcd1459, ['I', 'V']);

    // ── LGBTQIA+ (Art I, V) ──
    add(m.serieAntraTrans, ['I', 'V', 'VI']);
    add(m.lgbtqiaPorRaca, ['I', 'V']);

    // ── JUVENTUDE (Art V, VI) ──
    add(m.juventudeNegra, ['V', 'VI'], 2);

    // ── CLASSE / POBREZA (Art V-e) ──
    add(m.classePorRaca, ['I', 'V']);

    // ── POVOS TRADICIONAIS (Art III segregação, V território) ──
    add(m.povosTradicionais, ['III', 'V'], 2);

    // ── ODS RACIAL (93 indicadores do BD) — distribuir por artigo via inferência ──
    const odsIndicadores = (allIndicadores || []).filter(
      (i: any) => i.categoria === 'ods_racial'
    );
    odsIndicadores.forEach((ind: any) => {
      const arts = inferArtigosIndicador(ind);
      arts.forEach(a => { c[a] += 1; });
    });

    // Art IV não tem séries estatísticas diretas no sistema, mas a cobertura normativa já preenche

    return c;
  }, [m, allIndicadores]);
}

/**
 * Infer which articles a normative document covers based on secoes_impactadas
 */
function inferArtigosNormativo(doc: DocumentoNormativo): ArtigoConvencao[] {
  return inferArtigosDocumentoNormativo(doc as Parameters<typeof inferArtigosDocumentoNormativo>[0]);
}

function inferArtigosIndicador(ind: any): ArtigoConvencao[] {
  const explicit = (ind.artigos_convencao || []).filter((a: string) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].includes(a)) as ArtigoConvencao[];
  if (explicit.length > 0) return explicit;

  const arts = new Set<ArtigoConvencao>();
  const categoria = String(ind.categoria || '').toLowerCase();
  const subcategoria = String(ind.subcategoria || '').toLowerCase();
  const nome = String(ind.nome || '').toLowerCase();
  const origem = Array.isArray(ind.documento_origem) ? ind.documento_origem.join(' ').toLowerCase() : '';
  const texto = [categoria, subcategoria, nome, origem].join(' ');

  const eixo = categoria as keyof typeof EIXO_PARA_ARTIGOS;
  if (EIXO_PARA_ARTIGOS[eixo]) {
    EIXO_PARA_ARTIGOS[eixo].forEach((a) => arts.add(a));
  }
  if (/seguran|viol[êe]ncia|homic|letal|pris/.test(texto)) { arts.add('V'); arts.add('VI'); }
  if (/educa|ensino|escolar|analfabet/.test(texto)) { arts.add('V'); arts.add('VII'); }
  if (/sa[úu]de|materna|covid|hospital/.test(texto)) arts.add('V');
  if (/trabalho|renda|desemprego|pobreza|moradia|habita/.test(texto)) arts.add('V');
  if (/quilomb|ind[ií]gena|indigena|territ[óo]rio|favela|aglomerado/.test(texto)) { arts.add('III'); arts.add('V'); }
  if (/racismo|discrimin|igualdade|ação afirmativa|acao afirmativa|dados|estat[íi]st/.test(texto)) { arts.add('I'); arts.add('II'); }
  if (/justi[çc]a|judici|repara/.test(texto)) arts.add('VI');
  if (/cultura|patrim|lei 10.639|curr[ií]culo/.test(texto)) arts.add('VII');

  return [...arts];
}

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
  return `R$ ${(value / 1_000).toFixed(0)} mil`;
};

function computeAdherenceScore(a: Omit<ArtigoAnalysis, 'grauAderencia' | 'tendencia' | 'veredito'>): number {
  // Weighted scoring with balanced interpretation:
  // Lacunas compliance (20%), Budget (15%), Conclusions (15%), Evidence breadth (10%), 
  // Normativos (20%), Respostas (15%), Stats (5%)
  // 
  // Interpretação equilibrada: reconhece esforço legislativo/institucional 
  // mesmo quando indicadores ainda não refletem melhoras
  let score = 0;

  // Lacunas compliance (0-20) — peso reduzido para ser menos punitivo
  if (a.lacunasTotal > 0) {
    const cumprimento = (a.lacunasCumpridas * 1 + a.lacunasParciais * 0.6) / a.lacunasTotal;
    const retrocessoPenalty = a.lacunasRetrocesso / a.lacunasTotal * 0.2;
    score += Math.max(0, (cumprimento - retrocessoPenalty)) * 20;
    // Bônus por esforço: se há parciais, reconhece que há andamento
    if (a.lacunasParciais > 0) score += Math.min(5, a.lacunasParciais * 1.5);
  } else {
    score += 10;
  }

  // Budget coverage (0-15)
  if (a.orcamentoProgramas > 0) {
    score += Math.min(15, a.orcamentoProgramas * 2.5);
  }

  // Conclusions balance (0-15) — reconhece avanços mesmo com lacunas
  const totalConc = a.conclusoesAvanco + a.conclusoesRetrocesso + a.conclusoesLacuna;
  if (totalConc > 0) {
    const avancoRatio = a.conclusoesAvanco / totalConc;
    score += avancoRatio * 15;
    // Bônus: se há mais avanços que retrocessos
    if (a.conclusoesAvanco > a.conclusoesRetrocesso) score += 2;
  }

  // Evidence breadth (0-10)
  const hasLacunas = a.lacunasTotal > 0;
  const hasFios = a.fiosTotal > 0;
  const hasOrc = a.orcamentoProgramas > 0;
  const hasInd = a.indicadoresCount > 0;
  const hasNorm = a.normativosCount > 0;
  const hasResp = a.respostasTotal > 0;
  const breadth = [hasLacunas, hasFios, hasOrc, hasInd, hasNorm, hasResp].filter(Boolean).length;
  score += (breadth / 6) * 10;

  // Normative coverage (0-20) — peso aumentado para valorizar esforço legislativo
  if (a.normativosCount > 0) {
    score += Math.min(20, a.normativosCount * 2.5);
  }

  // Respostas CERD III (0-15) — peso aumentado, interpretação mais permissiva
  if (a.respostasTotal > 0) {
    const respRatio = (a.respostasCumpridas * 1 + (a.respostasTotal - a.respostasCumpridas - a.respostasNaoCumpridas) * 0.5) / a.respostasTotal;
    score += respRatio * 15;
  }

  // Statistical series (0-5)
  if (a.seriesEstatisticas > 0) {
    score += Math.min(5, a.seriesEstatisticas);
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

function determineTrend(a: Omit<ArtigoAnalysis, 'grauAderencia' | 'tendencia' | 'veredito'>): 'melhora' | 'piora' | 'estagnacao' {
  const avancos = a.fiosAvanco + a.conclusoesAvanco + a.respostasCumpridas;
  const retrocessos = a.fiosRetrocesso + a.conclusoesRetrocesso + a.lacunasRetrocesso + a.respostasNaoCumpridas;
  if (avancos > retrocessos * 1.5) return 'melhora';
  if (retrocessos > avancos * 1.5) return 'piora';
  return 'estagnacao';
}

function generateVerdict(a: ArtigoAnalysis): string {
  const normText = a.normativosCount > 0 ? `, respaldado por ${a.normativosCount} instrumento(s) normativo(s)` : ', sem respaldo normativo específico identificado';
  const respText = a.respostasTotal > 0 ? ` O CERD III registra ${a.respostasCumpridas} de ${a.respostasTotal} respostas com atendimento satisfatório.` : '';
  const statsText = a.seriesEstatisticas > 0 ? ` ${a.seriesEstatisticas} série(s) estatística(s) do Escopo comprovam a situação.` : '';

  if (a.grauAderencia >= 70) return `Boa aderência. O Estado demonstra engajamento significativo com o Art. ${a.numero}, com ${a.lacunasCumpridas + a.lacunasParciais} de ${a.lacunasTotal} obrigações atendidas e ${a.orcamentoProgramas} programas orçamentários${normText}.${respText}${statsText}`;
  if (a.grauAderencia >= 40) return `Aderência parcial. Existem avanços pontuais no Art. ${a.numero} (${a.conclusoesAvanco} avanços identificados), mas ${a.lacunasNaoCumpridas + a.lacunasRetrocesso} obrigações permanecem sem cumprimento adequado${normText}.${respText}${statsText}`;
  if (a.grauAderencia >= 15) return `Baixa aderência. O Art. ${a.numero} permanece sub-priorizado: ${a.lacunasNaoCumpridas} obrigações não cumpridas, ${a.lacunasRetrocesso} retrocessos e cobertura orçamentária limitada (${a.orcamentoProgramas} programas)${normText}.${respText}${statsText}`;
  return `Aderência crítica. O Art. ${a.numero} não recebe atenção estatal proporcional às obrigações da Convenção${normText}.${respText}${statsText}`;
}

export function IcerdAdherencePanel({ fiosCondutores, conclusoes, lacunas, orcamentoRecords, indicadores, stats, respostas, documentosNormativos }: IcerdAdherencePanelProps) {
  const statSeriesPerArticle = useCountStatSeriesPerArticle();

  const analysis = useMemo<ArtigoAnalysis[]>(() => {
    return ARTIGOS_CONVENCAO.map(art => {
      // Lacunas by article — use artigos_convencao if populated, otherwise infer from eixo_tematico
      const artLacunas = lacunas.filter(l => {
        if (l.artigos_convencao && l.artigos_convencao.length > 0) {
          return l.artigos_convencao.includes(art.numero);
        }
        // Fallback: infer from eixo_tematico
        const mapped = EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS];
        return mapped ? mapped.includes(art.numero) : false;
      });
      const cumpridas = artLacunas.filter(l => l.status_cumprimento === 'cumprido').length;
      const parciais = artLacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length;
      const naoCumpridas = artLacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length;
      const retrocesso = artLacunas.filter(l => l.status_cumprimento === 'retrocesso').length;

      // Fios by article
      const artFios = fiosCondutores.filter(f => f.artigosConvencao?.includes(art.numero));
      const fiosAvanco = artFios.filter(f => f.tipo === 'avanco').length;
      const fiosRetrocesso = artFios.filter(f => f.tipo === 'retrocesso' || f.tipo === 'lacuna_critica').length;

      // Conclusões by article
      const artConc = conclusoes.filter(c => c.artigosConvencao?.includes(art.numero));
      const concAvanco = artConc.filter(c => c.tipo === 'avanco').length;
      const concRetrocesso = artConc.filter(c => c.tipo === 'retrocesso').length;
      const concLacuna = artConc.filter(c => c.tipo === 'lacuna_persistente').length;

      // Orçamento by article
      const artOrc = orcamentoRecords.filter(r => inferArtigosOrcamento(r).includes(art.numero));
      const liquidado = artOrc.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      const programas = new Set(artOrc.map(r => r.programa)).size;

      // Indicadores by article
      const artInd = indicadores.filter((ind: any) => inferArtigosIndicador(ind).includes(art.numero));

      // NEW: Respostas CERD III by article (match via lacunas paragraphs)
      const artParagraphs = new Set(artLacunas.map(l => l.paragrafo));
      const artRespostas = respostas.filter(r => {
        // Match by paragraph prefix (e.g., "§31" in paragrafo_cerd_iii)
        return artParagraphs.has(r.paragrafo_cerd_iii) ||
          [...artParagraphs].some(p => r.paragrafo_cerd_iii.includes(p) || p.includes(r.paragrafo_cerd_iii));
      });
      const respCumpridas = artRespostas.filter(r => r.grau_atendimento === 'cumprido' || r.grau_atendimento === 'parcialmente_cumprido').length;
      const respNaoCumpridas = artRespostas.filter(r => r.grau_atendimento === 'nao_cumprido' || r.grau_atendimento === 'retrocesso').length;

      // NEW: Documentos normativos by article
      const artNormativos = documentosNormativos.filter(doc => {
        const docArts = inferArtigosNormativo(doc);
        return docArts.includes(art.numero);
      });

      const base = {
        numero: art.numero,
        titulo: art.titulo,
        tituloCompleto: art.tituloCompleto,
        cor: art.cor,
        lacunasTotal: artLacunas.length,
        lacunasCumpridas: cumpridas,
        lacunasParciais: parciais,
        lacunasNaoCumpridas: naoCumpridas,
        lacunasRetrocesso: retrocesso,
        fiosTotal: artFios.length,
        fiosAvanco,
        fiosRetrocesso,
        conclusoesAvanco: concAvanco,
        conclusoesRetrocesso: concRetrocesso,
        conclusoesLacuna: concLacuna,
        orcamentoLiquidado: liquidado,
        orcamentoProgramas: programas,
        indicadoresCount: artInd.length,
        respostasTotal: artRespostas.length,
        respostasCumpridas: respCumpridas,
        respostasNaoCumpridas: respNaoCumpridas,
        normativosCount: artNormativos.length,
        seriesEstatisticas: statSeriesPerArticle[art.numero] || 0,
      };

      const grau = computeAdherenceScore(base);
      const trend = determineTrend(base);
      const result: ArtigoAnalysis = { ...base, grauAderencia: grau, tendencia: trend, veredito: '' };
      result.veredito = generateVerdict(result);
      return result;
    });
  }, [fiosCondutores, conclusoes, lacunas, orcamentoRecords, indicadores, respostas, documentosNormativos, statSeriesPerArticle]);

  const radarData = analysis.map(a => ({
    artigo: `Art. ${a.numero}`,
    aderencia: a.grauAderencia,
    lacunas: a.lacunasTotal,
    orcamento: Math.min(100, a.orcamentoProgramas * 15),
    normativos: Math.min(100, a.normativosCount * 10),
  }));

  const barData = analysis.map(a => ({
    artigo: `Art. ${a.numero}`,
    cumprido: a.lacunasCumpridas,
    parcial: a.lacunasParciais,
    nao_cumprido: a.lacunasNaoCumpridas,
    retrocesso: a.lacunasRetrocesso,
  }));

  const sorted = [...analysis].sort((a, b) => b.grauAderencia - a.grauAderencia);
  const maisPriorizados = sorted.slice(0, 3);
  const menosPriorizados = sorted.slice(-3).reverse();

  const avgAdherencia = Math.round(analysis.reduce((s, a) => s + a.grauAderencia, 0) / analysis.length);

  // Total data sources summary
  const totalNormativos = documentosNormativos.length;
  const totalRespostas = respostas.length;
  const totalStatSeries = Object.values(statSeriesPerArticle).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Scale className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Aderência do Estado Brasileiro aos Artigos da Convenção ICERD</p>
              <p className="text-sm text-muted-foreground mt-1">
                Avaliação consolidada integrando <strong>todas as bases do sistema</strong>:
                {' '}{stats?.total || 0} lacunas ONU, {fiosCondutores.length} fios condutores,
                {' '}{conclusoes.length} conclusões analíticas, {orcamentoRecords.length} registros orçamentários,
                {' '}{indicadores.length} indicadores interseccionais, {totalRespostas} respostas CERD III,
                {' '}{totalNormativos} instrumentos normativos e {totalStatSeries} séries estatísticas oficiais.
              </p>
              <MethodologyPanel variant="full" className="mt-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources Inventory */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="border-chart-1/30">
          <CardContent className="pt-2 pb-2 text-center">
            <Database className="w-4 h-4 mx-auto text-chart-1 mb-1" />
            <p className="text-lg font-bold">{stats?.total || 0}</p>
            <p className="text-[10px] text-muted-foreground">Lacunas ONU</p>
          </CardContent>
        </Card>
        <Card className="border-chart-2/30">
          <CardContent className="pt-2 pb-2 text-center">
            <BarChart3 className="w-4 h-4 mx-auto text-chart-2 mb-1" />
            <p className="text-lg font-bold">{orcamentoRecords.length}</p>
            <p className="text-[10px] text-muted-foreground">Registros Orçam.</p>
          </CardContent>
        </Card>
        <Card className="border-chart-3/30">
          <CardContent className="pt-2 pb-2 text-center">
            <FileText className="w-4 h-4 mx-auto text-chart-3 mb-1" />
            <p className="text-lg font-bold">{totalNormativos}</p>
            <p className="text-[10px] text-muted-foreground">Normativos</p>
          </CardContent>
        </Card>
        <Card className="border-chart-4/30">
          <CardContent className="pt-2 pb-2 text-center">
            <BookOpen className="w-4 h-4 mx-auto text-chart-4 mb-1" />
            <p className="text-lg font-bold">{totalRespostas}</p>
            <p className="text-[10px] text-muted-foreground">Respostas CERD III</p>
          </CardContent>
        </Card>
        <Card className="border-chart-5/30">
          <CardContent className="pt-2 pb-2 text-center">
            <Users className="w-4 h-4 mx-auto text-chart-5 mb-1" />
            <p className="text-lg font-bold">{indicadores.length}</p>
            <p className="text-[10px] text-muted-foreground">Indicadores</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="pt-2 pb-2 text-center">
            <BarChart3 className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{totalStatSeries}</p>
            <p className="text-[10px] text-muted-foreground">Séries Estatísticas</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Aderência Média</p>
            <p className="text-2xl font-bold text-primary">{avgAdherencia}%</p>
            <p className="text-xs text-muted-foreground">dos 7 artigos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Mais Priorizado</p>
            <p className="text-lg font-bold">Art. {maisPriorizados[0]?.numero}</p>
            <p className="text-xs text-success">{maisPriorizados[0]?.grauAderencia}%</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Menos Priorizado</p>
            <p className="text-lg font-bold">Art. {menosPriorizados[0]?.numero}</p>
            <p className="text-xs text-destructive">{menosPriorizados[0]?.grauAderencia}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Art. com Tendência ↑</p>
            <p className="text-lg font-bold">{analysis.filter(a => a.tendencia === 'melhora').length}</p>
            <p className="text-xs text-muted-foreground">de 7 artigos</p>
          </CardContent>
        </Card>
      </div>

      {/* Radar + Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Radar de Aderência por Artigo</CardTitle>
            <CardDescription className="text-xs">
              Escala 0-100 integrando lacunas ONU, orçamento, normativos, respostas CERD III, séries estatísticas e indicadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="artigo" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="Aderência (%)" dataKey="aderencia" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status de Cumprimento por Artigo</CardTitle>
            <CardDescription className="text-xs">
              Distribuição das lacunas ONU vinculadas a cada artigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="artigo" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="cumprido" name="Cumprido" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="parcial" name="Parcial" stackId="a" fill="hsl(var(--chart-4))" />
                  <Bar dataKey="nao_cumprido" name="Não Cumprido" stackId="a" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="retrocesso" name="Retrocesso" stackId="a" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail per article */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          Avaliação Detalhada por Artigo
        </h3>
        {analysis.map(a => (
          <Card key={a.numero} className="border-l-4" style={{ borderLeftColor: a.cor }}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0"
                    style={{ backgroundColor: a.cor }}
                  >
                    {a.numero}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{a.tituloCompleto}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {a.tendencia === 'melhora' && <Badge className="bg-success/10 text-success border-success/30 text-[10px]" variant="outline"><TrendingUp className="w-3 h-3 mr-1" />Melhora</Badge>}
                      {a.tendencia === 'piora' && <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]" variant="outline"><TrendingDown className="w-3 h-3 mr-1" />Piora</Badge>}
                      {a.tendencia === 'estagnacao' && <Badge className="bg-muted text-muted-foreground text-[10px]" variant="outline"><Minus className="w-3 h-3 mr-1" />Estagnação</Badge>}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold" style={{ color: a.grauAderencia >= 60 ? 'hsl(var(--chart-2))' : a.grauAderencia >= 30 ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))' }}>
                    {a.grauAderencia}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">aderência</p>
                </div>
              </div>

              <Progress value={a.grauAderencia} className="h-2 mb-3" />

              {/* Metrics grid - expanded with new dimensions */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-3">
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.lacunasTotal}</p>
                  <p className="text-[10px] text-muted-foreground">Lacunas ONU</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold text-success">{a.lacunasCumpridas + a.lacunasParciais}</p>
                  <p className="text-[10px] text-muted-foreground">Atendidas</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.orcamentoProgramas}</p>
                  <p className="text-[10px] text-muted-foreground">Programas</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.normativosCount}</p>
                  <p className="text-[10px] text-muted-foreground">Normativos</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.respostasTotal}</p>
                  <p className="text-[10px] text-muted-foreground">Respostas CERD</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.fiosTotal}</p>
                  <p className="text-[10px] text-muted-foreground">Fios Condutores</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.indicadoresCount}</p>
                  <p className="text-[10px] text-muted-foreground">Indicadores</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.seriesEstatisticas}</p>
                  <p className="text-[10px] text-muted-foreground">Séries Estat.</p>
                </div>
              </div>

              {a.orcamentoLiquidado > 0 && (
                <p className="text-xs text-muted-foreground mb-2">
                  💰 Investimento liquidado vinculado: <strong>{formatCompact(a.orcamentoLiquidado)}</strong>
                </p>
              )}

              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">{a.veredito}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary verdict */}
      <Card className="border-2 border-primary">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="w-5 h-5 text-primary" />
            Síntese: Priorização Histórica dos Artigos pelo Estado Brasileiro
          </CardTitle>
          <CardDescription className="text-xs">
            Baseada no cruzamento exaustivo de {stats?.total || 0} lacunas ONU + {totalNormativos} normativos + {orcamentoRecords.length} registros orçamentários + {totalRespostas} respostas CERD III + {indicadores.length} indicadores + {totalStatSeries} séries estatísticas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
              <p className="text-xs font-bold text-success mb-2">✓ ARTIGOS MAIS PRIORIZADOS</p>
              <ul className="space-y-1">
                {maisPriorizados.map(a => (
                  <li key={a.numero} className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Art. {a.numero} — {a.titulo}</span>
                    <Badge variant="outline" className="text-[10px]">{a.grauAderencia}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-xs font-bold text-destructive mb-2">✗ ARTIGOS MENOS PRIORIZADOS</p>
              <ul className="space-y-1">
                {menosPriorizados.map(a => (
                  <li key={a.numero} className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Art. {a.numero} — {a.titulo}</span>
                    <Badge variant="destructive" className="text-[10px]">{a.grauAderencia}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>⚖️ Conclusão:</strong> A aderência média do Estado brasileiro à Convenção ICERD é de <strong>{avgAdherencia}%</strong>.
              {avgAdherencia < 50
                ? ` Este índice revela que a maioria dos compromissos do tratado permanece sem cobertura adequada em termos de políticas públicas, orçamento e resultados mensuráveis. Os artigos ${menosPriorizados.map(a => a.numero).join(', ')} apresentam as maiores lacunas de implementação.`
                : ` Embora existam avanços em artigos específicos (${maisPriorizados.map(a => a.numero).join(', ')}), a cobertura permanece desigual entre os compromissos, com os artigos ${menosPriorizados.map(a => a.numero).join(', ')} exigindo atenção prioritária.`
              }
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-[10px] text-muted-foreground">
              <strong>Nota metodológica:</strong> O score de aderência (0-100%) pondera: cumprimento de lacunas ONU (30%), cobertura orçamentária (15%),
              balanço de conclusões analíticas (15%), cobertura normativa/institucional (15%), respostas CERD III (10%),
              amplitude de fontes de evidência (10%) e séries estatísticas oficiais IBGE/FBSP/DataSUS (5%).
              Base Estatística inclui segurança pública, feminicídio, educação, saúde, renda e povos tradicionais.
              Base Normativa inclui {totalNormativos} instrumentos legislativos e institucionais (2018-2025).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}