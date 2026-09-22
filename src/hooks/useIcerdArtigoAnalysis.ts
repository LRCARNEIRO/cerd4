/**
 * SSoT do cálculo de aderência por Artigo ICERD.
 *
 * Extraído de IcerdAdherencePanel para que TODAS as superfícies
 * (painel da aba Conclusões, relatórios de Conclusões, exportações)
 * usem exatamente o mesmo cálculo, alimentado pela curadoria
 * Artigo × Recomendação × Evidência (vinculos_evidencia_curados).
 */
import { useMemo } from 'react';
import { ARTIGOS_CONVENCAO, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { normalizeArticleTag } from '@/utils/normalizeArticleTag';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import type { LinkedIndicador, LinkedOrcamento, LinkedNormativo } from '@/hooks/useDiagnosticSensor';
import type { FioCondutor, ConclusaoDinamica } from '@/hooks/useAnalyticalInsights';
import type { RespostaLacunaCerdIII } from '@/hooks/useLacunasData';
import { useEvidenceOverridesReadOnly } from '@/hooks/useEvidenceOverrides';
import { useIndicadoresAnaliticos } from '@/hooks/useLacunasData';
import { useMirrorData } from '@/hooks/useMirrorData';
import { inferArtigosIndicador } from '@/utils/inferArtigosIndicador';
import { classificarFaixa, FAIXA_LABEL, formatScore, type Faixa } from '@/utils/esforcoImpacto';

export type ArtigoAnalysis = {
  numero: ArtigoConvencao;
  titulo: string;
  tituloCompleto: string;
  cor: string;
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
  respostasTotal: number;
  respostasCumpridas: number;
  respostasNaoCumpridas: number;
  normativosCount: number;
  seriesEstatisticas: number;
  /** v7 — Esforço Governamental do artigo (média simples das recomendações) */
  esforcoArtigo: number;
  /** v7 — Impacto Evidenciado do artigo (média simples das recomendações) */
  impactoArtigo: number;
  faixaEsforco: Faixa;
  faixaImpacto: Faixa;
  /** Espelha o Esforço Governamental (compatibilidade com superfícies antigas) */
  grauAderencia: number;
  tendencia: 'melhora' | 'piora' | 'estagnacao';
  veredito: string;
};

/**
 * Map statistical series to ICERD articles based on thematic coverage.
 */
export function useCountStatSeriesPerArticle() {
  const m = useMirrorData();
  const { data: allIndicadores } = useIndicadoresAnaliticos();
  return useMemo(() => {
    const c: Record<ArtigoConvencao, number> = { I: 0, II: 0, III: 0, IV: 0, V: 0, VI: 0, VII: 0 };

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

const CERD_III_PARAGRAFO_ARTIGOS: Record<string, ArtigoConvencao[]> = {
  '12': ['I', 'II', 'VI'],
  '14': ['IV', 'VII'],
  '16': ['V'],
  '18': ['V', 'VII'],
  '20': ['III', 'V'],
  '22': ['III', 'V'],
  '24': ['V', 'VI'],
  '26': ['V', 'VI'],
};

function mapRespostasToArticle(respostas: RespostaLacunaCerdIII[], artigo: ArtigoConvencao): RespostaLacunaCerdIII[] {
  return (respostas || []).filter(r => {
    const p = r.paragrafo_cerd_iii.replace(/[§ ]/g, '');
    const mapped = CERD_III_PARAGRAFO_ARTIGOS[p];
    return mapped ? mapped.includes(artigo) : false;
  });
}

/**
 * @deprecated Metodologia v7 — o grau do artigo passou a ser a média simples do
 * Esforço Governamental das recomendações associadas (mapa relacional + formal),
 * calculada em useDiagnosticSensor. Mantido apenas como fallback quando o sensor
 * ainda não está pronto.
 */
export function computeAdherenceScore(a: Omit<ArtigoAnalysis, 'grauAderencia' | 'tendencia' | 'veredito' | 'esforcoArtigo' | 'impactoArtigo' | 'faixaEsforco' | 'faixaImpacto'>): number {
  return 0;
}

export function determineTrend(a: Omit<ArtigoAnalysis, 'grauAderencia' | 'tendencia' | 'veredito' | 'esforcoArtigo' | 'impactoArtigo' | 'faixaEsforco' | 'faixaImpacto'>): 'melhora' | 'piora' | 'estagnacao' {
  const emAndamento = a.lacunasTotal - a.lacunasCumpridas - a.lacunasParciais - a.lacunasNaoCumpridas - a.lacunasRetrocesso;
  const avancos = a.fiosAvanco + a.conclusoesAvanco + a.respostasCumpridas + Math.floor(emAndamento * 0.3);
  const retrocessos = a.fiosRetrocesso + a.conclusoesRetrocesso + a.lacunasRetrocesso + a.respostasNaoCumpridas;
  if (avancos > retrocessos * 1.3) return 'melhora';
  if (retrocessos > avancos * 1.3) return 'piora';
  return 'estagnacao';
}

export function generateVerdict(a: ArtigoAnalysis): string {
  const normText = a.normativosCount > 0 ? `, respaldado por ${a.normativosCount} instrumento(s) normativo(s)` : '';
  const emAndamento = a.lacunasTotal - a.lacunasCumpridas - a.lacunasParciais - a.lacunasNaoCumpridas - a.lacunasRetrocesso;
  const emAndamentoText = emAndamento > 0 ? `, ${emAndamento} em andamento` : '';
  const respText = a.respostasTotal > 0 ? ` O CERD III registra ${a.respostasCumpridas} de ${a.respostasTotal} respostas com atendimento satisfatório.` : '';
  const statsText = a.seriesEstatisticas > 0 ? ` ${a.seriesEstatisticas} série(s) estatística(s) fundamentam a avaliação.` : '';

  if (a.grauAderencia >= 70) return `Boa aderência. O Estado demonstra engajamento significativo com o Art. ${a.numero}: ${a.lacunasCumpridas + a.lacunasParciais} de ${a.lacunasTotal} obrigações atendidas${emAndamentoText}, ${a.orcamentoProgramas} ação(ões) orçamentária(s) vinculada(s) e ${a.indicadoresCount} indicadores${normText}.${respText}${statsText}`;
  if (a.grauAderencia >= 40) return `Aderência parcial com sinais de progresso. Art. ${a.numero}: ${a.lacunasCumpridas} cumprida(s), ${a.lacunasParciais} parcial(is)${emAndamentoText} de ${a.lacunasTotal} obrigações, com ${a.orcamentoProgramas} ação(ões) vinculada(s) e ${a.indicadoresCount} indicadores${normText}.${respText}${statsText}`;
  if (a.grauAderencia >= 15) return `Baixa aderência. O Art. ${a.numero} permanece sub-priorizado: ${a.lacunasNaoCumpridas} não cumprida(s), ${a.lacunasRetrocesso} retrocesso(s)${emAndamentoText}${normText}.${respText}${statsText}`;
  return `Aderência crítica. O Art. ${a.numero} não recebe atenção estatal proporcional às obrigações da Convenção${normText}.${respText}${statsText}`;
}

interface Params {
  lacunas: any[];
  fiosCondutores?: FioCondutor[];
  conclusoes?: ConclusaoDinamica[];
  respostas?: RespostaLacunaCerdIII[];
}

/**
 * Retorna a análise por artigo (mesmo cálculo do painel da aba Conclusões),
 * além do diagnosticMap e da curadoria artigoEvidencia para reuso.
 */
export function useIcerdArtigoAnalysis({ lacunas, fiosCondutores = [], conclusoes = [], respostas = [] }: Params) {
  const statSeriesPerArticle = useCountStatSeriesPerArticle();
  const evidenceOverrides = useEvidenceOverridesReadOnly();
  const { diagnosticMap, artigoEvidencia, curadosTotal } = useDiagnosticSensor(lacunas || [], evidenceOverrides);

  const analysis = useMemo<ArtigoAnalysis[]>(() => {
    return ARTIGOS_CONVENCAO.map(art => {
      const artLacunas = (lacunas || []).filter(l => {
        const explicit = ((l.artigos_convencao || []) as string[])
          .map(normalizeArticleTag)
          .filter(Boolean) as ArtigoConvencao[];
        return explicit.includes(art.numero);
      });

      const statusOf = (l: any) => {
        const diag = diagnosticMap.get(l.id);
        return diag?.statusComputado || l._computedStatus || l.status_cumprimento;
      };

      const cumpridas = artLacunas.filter(l => statusOf(l) === 'cumprido').length;
      const parciais = artLacunas.filter(l => ['parcialmente_cumprido', 'em_andamento'].includes(statusOf(l))).length;
      const naoCumpridas = artLacunas.filter(l => ['nao_cumprido', 'retrocesso'].includes(statusOf(l))).length;

      const indSet = new Map<string, LinkedIndicador>();
      const orcSet = new Map<string, LinkedOrcamento>();
      const normSet = new Map<string, LinkedNormativo>();

      const curado = artigoEvidencia.get(art.numero);
      if (curado) {
        for (const ind of curado.indicadores) indSet.set(`${ind.nome}|${ind.sub || ''}`, ind);
        for (const orc of curado.orcamento) orcSet.set(`${orc.programa}|${orc.orgao}|${orc.ano}`, orc);
        for (const norm of curado.normativos) normSet.set(norm.titulo, norm);
      } else {
        for (const l of artLacunas) {
          const diag = diagnosticMap.get(l.id);
          if (!diag) continue;
          for (const ind of diag.linkedIndicadores) if (!indSet.has(ind.nome)) indSet.set(ind.nome, ind);
          for (const orc of diag.linkedOrcamento) {
            const key = `${orc.programa}|${orc.orgao}|${orc.ano}`;
            if (!orcSet.has(key)) orcSet.set(key, orc);
          }
          for (const norm of diag.linkedNormativos) if (!normSet.has(norm.titulo)) normSet.set(norm.titulo, norm);
        }
      }

      const artFios = (fiosCondutores || []).filter(f => f.artigosConvencao?.includes(art.numero));
      const artConc = (conclusoes || []).filter(c => c.artigosConvencao?.includes(art.numero));
      const artRespostas = mapRespostasToArticle(respostas || [], art.numero);

      const base = {
        numero: art.numero,
        titulo: art.titulo,
        tituloCompleto: art.tituloCompleto,
        cor: art.cor,
        lacunasTotal: artLacunas.length,
        lacunasCumpridas: cumpridas,
        lacunasParciais: parciais,
        lacunasNaoCumpridas: naoCumpridas,
        lacunasRetrocesso: 0,
        fiosTotal: artFios.length,
        fiosAvanco: artFios.filter(f => f.tipo === 'avanco').length,
        fiosRetrocesso: artFios.filter(f => f.tipo === 'retrocesso' || f.tipo === 'lacuna_critica').length,
        conclusoesAvanco: artConc.filter(c => c.tipo === 'avanco').length,
        conclusoesRetrocesso: artConc.filter(c => c.tipo === 'retrocesso').length,
        conclusoesLacuna: artConc.filter(c => c.tipo === 'lacuna_persistente').length,
        orcamentoLiquidado: 0,
        orcamentoProgramas: orcSet.size,
        indicadoresCount: indSet.size,
        respostasTotal: artRespostas.length,
        respostasCumpridas: artRespostas.filter(r => r.grau_atendimento === 'cumprido' || r.grau_atendimento === 'parcialmente_cumprido').length,
        respostasNaoCumpridas: artRespostas.filter(r => r.grau_atendimento === 'nao_cumprido' || r.grau_atendimento === 'retrocesso').length,
        normativosCount: normSet.size,
        seriesEstatisticas: statSeriesPerArticle[art.numero] || 0,
      };

      const result: ArtigoAnalysis = {
        ...base,
        grauAderencia: computeAdherenceScore(base),
        tendencia: determineTrend(base),
        veredito: '',
      };
      result.veredito = generateVerdict(result);
      return result;
    });
  }, [lacunas, fiosCondutores, conclusoes, respostas, statSeriesPerArticle, diagnosticMap, artigoEvidencia]);

  return { analysis, diagnosticMap, artigoEvidencia, curadosTotal };
}
