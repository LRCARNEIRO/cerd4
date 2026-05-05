import { useMemo } from 'react';
import { 
  useLacunasIdentificadas, 
  useLacunasStats, 
  useRespostasLacunasCerdIII, 
  useOrcamentoStats, 
  useIndicadoresAnaliticos,
  useDadosOrcamentarios,
  type LacunaIdentificada,
  type RespostaLacunaCerdIII,
  type IndicadorInterseccional,
  type DadoOrcamentario
} from './useLacunasData';
import { useDiagnosticSensor, type RecomendacaoDiagnostic } from './useDiagnosticSensor';
import { useEvidenceOverridesReadOnly } from './useEvidenceOverrides';
import { EIXO_PARA_ARTIGOS, ARTIGOS_CONVENCAO, inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';

// =============================================
// TIPOS
// =============================================

export interface FioCondutor {
  id: string;
  titulo: string;
  tipo: 'paradoxo' | 'correlacao' | 'tendencia' | 'lacuna_critica' | 'avanco' | 'retrocesso';
  argumento: string;
  evidencias: EvidenciaDinamica[];
  eixos: string[];
  grupos: string[];
  relevancia: 'alta' | 'media' | 'baixa';
  comparativo2018?: string;
  /** Artigos da Convenção ICERD endereçados por este fio (auto-derived from eixos) */
  artigosConvencao?: ArtigoConvencao[];
}

export interface EvidenciaDinamica {
  texto: string;
  fonte: string;
  tipo: 'quantitativa' | 'qualitativa' | 'orcamentaria' | 'normativa';
  valorAtual?: string;
  valor2018?: string;
  variacao?: string;
}

export interface InsightCruzamento {
  id: string;
  titulo: string;
  descricao: string;
  dados: string[];
  tipo: 'alerta' | 'progresso' | 'contradição' | 'correlação';
}

export interface ConclusaoDinamica {
  id: string;
  tipo: 'lacuna_persistente' | 'avanco' | 'retrocesso';
  titulo: string;
  periodo: string;
  argumento_central: string;
  evidencias: string[];
  eixos: string[];
  fromDatabase: boolean;
  relevancia_common_core: boolean;
  relevancia_cerd_iv: boolean;
  fiosCondutores: string[];
  /** Artigos da Convenção ICERD endereçados */
  artigosConvencao?: ArtigoConvencao[];
}

// =============================================
// LABELS
// =============================================

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça',
  politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda',
  terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio',
  participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas'
};

const grupoLabels: Record<string, string> = {
  negros: 'População Negra',
  indigenas: 'Povos Indígenas',
  quilombolas: 'Quilombolas',
  ciganos: 'Povos Ciganos',
  religioes_matriz_africana: 'Religiões de Matriz Africana',
  juventude_negra: 'Juventude Negra',
  mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+ Negros',
  pcd_negros: 'PcD Negros',
  idosos_negros: 'Idosos Negros',
  geral: 'Geral'
};

const statusLabels: Record<string, string> = {
  cumprido: 'Cumprido',
  parcialmente_cumprido: 'Parcialmente Cumprido',
  nao_cumprido: 'Não Cumprido',
  retrocesso: 'Retrocesso',
  em_andamento: 'Em Andamento'
};

/** Derive unique ICERD articles from an array of thematic axes */
function deriveArtigos(eixos: string[]): ArtigoConvencao[] {
  const arts = new Set<ArtigoConvencao>();
  eixos.forEach(e => {
    const mapped = EIXO_PARA_ARTIGOS[e as keyof typeof EIXO_PARA_ARTIGOS];
    if (mapped) mapped.forEach(a => arts.add(a));
  });
  return [...arts].sort();
}

// =============================================
// HOOK PRINCIPAL
// =============================================

export function useAnalyticalInsights() {
  const { data: lacunas, isLoading: l1, isFetching: f1 } = useLacunasIdentificadas();
  const { data: stats, isLoading: l2, isFetching: f2 } = useLacunasStats();
  const { data: respostas, isLoading: l3, isFetching: f3 } = useRespostasLacunasCerdIII();
  const { data: orcStats, isLoading: l4, isFetching: f4 } = useOrcamentoStats();
  const { data: indicadores, isLoading: l5, isFetching: f5 } = useIndicadoresAnaliticos();
  const { data: orcDados, isLoading: l6, isFetching: f6 } = useDadosOrcamentarios();

  // Sensor for reclassified status — agora reativo a edições manuais de evidência
  const evidenceOverrides = useEvidenceOverridesReadOnly();
  const { diagnosticMap, isReady: sensorReady } = useDiagnosticSensor(lacunas, evidenceOverrides);

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6;
  const isFetching = f1 || f2 || f3 || f4 || f5 || f6;

  // ── PROJEÇÃO PÓS-OVERRIDES ───────────────────────────────────────
  // Sínteses analíticas precisam refletir inclusões/exclusões manuais de
  // evidências feitas no Gerenciador de Recomendações. Construímos versões
  // "efetivas" de lacunas/indicadores/orcamento usando o diagnosticMap (que
  // já aplicou os overrides) — sem alterar o BD.
  const {
    lacunasEfetivas,
    indicadoresEfetivos,
    orcDadosEfetivos,
  } = useMemo(() => {
    if (!sensorReady || !lacunas) {
      return {
        lacunasEfetivas: lacunas,
        indicadoresEfetivos: indicadores || [],
        orcDadosEfetivos: orcDados || [],
      };
    }

    // Index para enriquecer projeções (linked* vêm como projeção mínima)
    const indByName = new Map((indicadores || []).map(i => [i.nome, i] as const));
    const orcByKey = new Map<string, DadoOrcamentario>(
      (orcDados || []).map(o => [`${o.programa}|${o.orgao}|${o.ano}`, o])
    );

    const indNomesUsados = new Set<string>();
    const orcKeysUsadas = new Set<string>();

    const lacEf = lacunas.map((l) => {
      const diag = diagnosticMap.get(l.id);
      if (!diag) return l;

      // Coletar rótulos sintéticos a partir do que o diagnosticMap considera
      // efetivamente vinculado (após overrides).
      const evidIndicadores = (diag.linkedIndicadores || []).map((i) => {
        indNomesUsados.add(i.nome);
        const tend = i.tendencia ? ` [${i.tendencia}]` : '';
        return `📊 ${i.nome}${tend}`;
      });
      const evidOrcamento = (diag.linkedOrcamento || []).map((o) => {
        const k = `${o.programa}|${o.orgao}|${o.ano}`;
        orcKeysUsadas.add(k);
        return `💰 ${o.programa} (${o.orgao}, ${o.ano})`;
      });
      const evidNormativos = (diag.linkedNormativos || []).map((n) => `⚖️ ${n.titulo}`);

      // Mescla com evidências textuais já cadastradas, deduplicando.
      const baseEvid = l.evidencias_encontradas || [];
      const merged = Array.from(new Set([
        ...baseEvid,
        ...evidIndicadores,
        ...evidOrcamento,
        ...evidNormativos,
      ]));

      return { ...l, evidencias_encontradas: merged };
    });

    // Filtra universos para refletir o que está efetivamente vinculado a
    // alguma recomendação após overrides. Se nada estiver vinculado em
    // nenhuma recomendação, mantém o conjunto original (evita zerar painéis).
    const indEf = indNomesUsados.size > 0
      ? (indicadores || []).filter(i => indNomesUsados.has(i.nome))
      : (indicadores || []);
    const orcEf = orcKeysUsadas.size > 0
      ? (orcDados || []).filter(o => orcKeysUsadas.has(`${o.programa}|${o.orgao}|${o.ano}`))
      : (orcDados || []);

    return { lacunasEfetivas: lacEf, indicadoresEfetivos: indEf, orcDadosEfetivos: orcEf };
  }, [lacunas, indicadores, orcDados, diagnosticMap, sensorReady]);

  // Gerar fios condutores a partir dos dados efetivos (pós-overrides)
  const fiosCondutores = useMemo(() => {
    if (!lacunasEfetivas || !stats || !respostas) return [];
    return gerarFiosCondutores(lacunasEfetivas, stats, respostas, orcStats, indicadoresEfetivos, orcDadosEfetivos);
  }, [lacunasEfetivas, stats, respostas, orcStats, indicadoresEfetivos, orcDadosEfetivos]);

  // Gerar conclusões dinâmicas
  const conclusoesDinamicas = useMemo(() => {
    if (!lacunasEfetivas || !stats || !respostas) return [];
    return gerarConclusoesDinamicas(lacunasEfetivas, stats, respostas, orcStats, indicadoresEfetivos, orcDadosEfetivos, fiosCondutores);
  }, [lacunasEfetivas, stats, respostas, orcStats, indicadoresEfetivos, orcDadosEfetivos, fiosCondutores]);

  // Gerar cruzamentos e insights
  const insightsCruzamento = useMemo(() => {
    if (!lacunasEfetivas || !stats || !respostas) return [];
    return gerarInsightsCruzamento(lacunasEfetivas, stats, respostas, orcStats, indicadoresEfetivos, orcDadosEfetivos);
  }, [lacunasEfetivas, stats, respostas, orcStats, indicadoresEfetivos, orcDadosEfetivos]);

  // Síntese executiva dinâmica — uses sensor-reclassified status
  const sinteseExecutiva = useMemo(() => {
    if (!stats || !respostas || !lacunasEfetivas) return null;
    return gerarSinteseExecutiva(lacunasEfetivas, stats, respostas, orcStats, indicadoresEfetivos, sensorReady ? diagnosticMap : undefined);
  }, [lacunasEfetivas, stats, respostas, orcStats, indicadoresEfetivos, sensorReady, diagnosticMap]);

  // Compute last updated timestamp from all data sources
  const lastUpdated = useMemo(() => {
    const dates: string[] = [];
    (lacunas || []).forEach(l => { if (l.updated_at) dates.push(l.updated_at); });
    (respostas || []).forEach(r => { if (r.updated_at) dates.push(r.updated_at); });
    (indicadores || []).forEach((i: any) => { if (i.updated_at) dates.push(i.updated_at); });
    if (dates.length === 0) return null;
    dates.sort();
    return dates[dates.length - 1];
  }, [lacunas, respostas, indicadores]);

  return {
    isLoading,
    isFetching,
    fiosCondutores,
    conclusoesDinamicas,
    insightsCruzamento,
    sinteseExecutiva,
    stats,
    lacunas,
    respostas,
    orcStats,
    indicadores,
    orcDados,
    // Versões pós-overrides — usar em relatórios/sínteses para refletir
    // inclusões/exclusões manuais de evidências (Gerenciador de Recomendações).
    lacunasEfetivas,
    indicadoresEfetivos,
    orcDadosEfetivos,
    lastUpdated,
  };
}

// =============================================
// GERAÇÃO DE FIOS CONDUTORES
// =============================================

function gerarFiosCondutores(
  lacunas: LacunaIdentificada[],
  stats: any,
  respostas: RespostaLacunaCerdIII[],
  orcStats: any,
  indicadores: IndicadorInterseccional[],
  orcDados: DadoOrcamentario[]
): FioCondutor[] {
  const fios: FioCondutor[] = [];

  // FIO 1: Paradoxo normativo-implementação
  const lacunasNormativas = lacunas.filter(l => 
    l.eixo_tematico === 'legislacao_justica' || l.eixo_tematico === 'politicas_institucionais'
  );
  const normativasCumpridas = lacunasNormativas.filter(l => 
    l.status_cumprimento === 'cumprido' || l.status_cumprimento === 'parcialmente_cumprido'
  );
  const totalCriticas = lacunas.filter(l => l.prioridade === 'critica').length;
  const criticasNaoCumpridas = lacunas.filter(l => 
    l.prioridade === 'critica' && (l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso')
  ).length;

  if (lacunasNormativas.length > 0) {
    const evidencias: EvidenciaDinamica[] = [];
    
    // Extrair evidências reais das lacunas
    lacunasNormativas.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => {
        evidencias.push({ texto: ev, fonte: `§${l.paragrafo} - ${l.tema}`, tipo: 'quantitativa' });
      });
      l.acoes_brasil?.forEach(a => {
        evidencias.push({ texto: a, fonte: `Ação Brasil - §${l.paragrafo}`, tipo: 'normativa' });
      });
    });

    fios.push({
      id: 'paradoxo-normativo',
      titulo: 'Paradoxo Normativo-Implementação',
      tipo: 'paradoxo',
      argumento: `O Brasil possui ${lacunasNormativas.length} observações da ONU no eixo legislação/institucional, das quais ${normativasCumpridas.length} tiveram algum grau de cumprimento. Porém, das ${totalCriticas} lacunas de prioridade crítica, ${criticasNaoCumpridas} (${totalCriticas > 0 ? Math.round(criticasNaoCumpridas/totalCriticas*100) : 0}%) permanecem não cumpridas ou em retrocesso — revelando que avanços normativos não se traduzem em mudança estrutural.`,
      evidencias: evidencias.slice(0, 8),
      eixos: ['legislacao_justica', 'politicas_institucionais'],
      grupos: [...new Set(lacunasNormativas.map(l => l.grupo_focal))],
      relevancia: 'alta',
      comparativo2018: `Período 2019-2022 marcou desmonte institucional; a partir de 2023 houve recriação do MIR e novos marcos legais (Lei 14.532/2023).`
    });
  }

  // FIO 2: Violência racial estrutural
  const lacunasViolencia = lacunas.filter(l => l.eixo_tematico === 'seguranca_publica');
  if (lacunasViolencia.length > 0) {
    const evidViolencia: EvidenciaDinamica[] = [];
    lacunasViolencia.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => {
        evidViolencia.push({ texto: ev, fonte: `§${l.paragrafo} - ${l.tema}`, tipo: 'quantitativa' });
      });
    });

    const respostasViolencia = respostas.filter(r => 
      r.critica_original.toLowerCase().includes('violência') || 
      r.critica_original.toLowerCase().includes('policial') ||
      r.critica_original.toLowerCase().includes('força')
    );
    respostasViolencia.forEach(r => {
      if (r.evidencias_quantitativas) {
        Object.entries(r.evidencias_quantitativas as Record<string, any>).forEach(([k, v]) => {
          evidViolencia.push({ 
            texto: `${k.replace(/_/g, ' ')}: ${v}`, 
            fonte: `Resposta CERD III §${r.paragrafo_cerd_iii}`, 
            tipo: 'quantitativa' 
          });
        });
      }
    });

    const statusViolencia = lacunasViolencia.map(l => l.status_cumprimento);
    const naoCumpridas = statusViolencia.filter(s => s === 'nao_cumprido').length;

    fios.push({
      id: 'violencia-estrutural',
      titulo: 'Violência Racial Estrutural Persistente',
      tipo: 'lacuna_critica',
      argumento: `Das ${lacunasViolencia.length} observações de segurança pública, ${naoCumpridas} permanecem não cumpridas. As evidências coletadas demonstram que a população negra segue sendo alvo desproporcional da violência letal do Estado e da criminalidade.`,
      evidencias: evidViolencia.slice(0, 8),
      eixos: ['seguranca_publica'],
      grupos: [...new Set(lacunasViolencia.map(l => l.grupo_focal))],
      relevancia: 'alta',
      comparativo2018: `Os dados do 19º Anuário FBSP 2025 e Atlas da Violência 2025 confirmam a persistência da desproporção racial na violência letal. Consultar StatisticsData.ts (segurancaPublica / atlasViolencia2025) para séries auditadas.`
    });
  }

  // FIO 3: Territórios tradicionais - retrocesso e retomada
  const lacunasTerritorio = lacunas.filter(l => l.eixo_tematico === 'terra_territorio');
  if (lacunasTerritorio.length > 0) {
    const evidTerr: EvidenciaDinamica[] = [];
    lacunasTerritorio.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => {
        evidTerr.push({ texto: ev, fonte: `§${l.paragrafo} - ${l.grupo_focal}`, tipo: 'quantitativa' });
      });
      l.acoes_brasil?.forEach(a => {
        evidTerr.push({ texto: a, fonte: `Ação Brasil - ${grupoLabels[l.grupo_focal]}`, tipo: 'normativa' });
      });
    });

    const retrocessos = lacunasTerritorio.filter(l => l.status_cumprimento === 'retrocesso').length;

    fios.push({
      id: 'territorios-tradicionais',
      titulo: 'Territórios Tradicionais: Retrocesso e Retomada',
      tipo: 'retrocesso',
      argumento: `${retrocessos} de ${lacunasTerritorio.length} lacunas territoriais registram retrocesso. O período 2019-2022 praticamente paralisou demarcações e titulações. A retomada a partir de 2023 é lenta frente à dívida histórica acumulada.`,
      evidencias: evidTerr.slice(0, 8),
      eixos: ['terra_territorio'],
      grupos: [...new Set(lacunasTerritorio.map(l => l.grupo_focal))],
      relevancia: 'alta',
      comparativo2018: `2018: processos em andamento com orçamento regular. 2019-2022: paralisia institucional. 2023-2025: retomada com 245 territórios quilombolas titulados (Palmares/INCRA 2025) de ~2.600 certificados (~9,4%). Dados orçamentários detalhados disponíveis no módulo Orçamento.`
    });
  }

  // FIO 4: Interseccionalidade - mulheres negras
  const lacunasMulheres = lacunas.filter(l => l.grupo_focal === 'mulheres_negras');
  const respostasMulheres = respostas.filter(r =>
    r.critica_original.toLowerCase().includes('mulher') || 
    r.critica_original.toLowerCase().includes('gênero') ||
    r.critica_original.toLowerCase().includes('interseccional')
  );
  
  if (lacunasMulheres.length > 0 || respostasMulheres.length > 0) {
    const evidMulheres: EvidenciaDinamica[] = [];
    lacunasMulheres.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => {
        evidMulheres.push({ texto: ev, fonte: `§${l.paragrafo}`, tipo: 'quantitativa' });
      });
    });

    // Cruzar com lacunas que mencionam interseccionalidade de gênero
    const intersecGenero = lacunas.filter(l => 
      l.interseccionalidades?.includes('gênero')
    );

    // ── Extract dynamic values from indicadores ──
    const femInd = indicadores.find(i => i.nome.toLowerCase().includes('feminicídio') && i.nome.toLowerCase().includes('série'));
    const estupInd = indicadores.find(i => i.nome.toLowerCase().includes('estupro'));
    const saudeInd = indicadores.find(i => i.nome.toLowerCase().includes('mortalidade materna') && i.nome.toLowerCase().includes('infantil'));
    const violDomInd = indicadores.find(i => i.nome.toLowerCase().includes('violência doméstica'));

    // Feminicídio
    let femPctAtual = '63,6';
    let femPct2018 = '61';
    let femFonte = '19º Anuário FBSP 2025';
    if (femInd) {
      const d = femInd.dados as any;
      const series = d?.series || {};
      const anos = Object.keys(series).map(Number).sort();
      const anoMax = anos[anos.length - 1];
      const anoMin = anos[0];
      if (anoMax && series[anoMax]?.percentualNegras != null) femPctAtual = String(series[anoMax].percentualNegras);
      if (anoMin && series[anoMin]?.percentualNegras != null) femPct2018 = String(series[anoMin].percentualNegras);
      if (femInd.fonte) femFonte = femInd.fonte;
    }

    // Estupro
    let estupPct = '55,6';
    if (estupInd) {
      const d = estupInd.dados as any;
      if (d?.mulher_negra_pct != null) estupPct = String(d.mulher_negra_pct);
    }

    // Mortalidade materna
    let mmPctNegra = '67,1';
    let mmRazao = '2,3';
    let mmFonte = 'DataSUS/SIM';
    if (saudeInd) {
      const d = saudeInd.dados as any;
      const series = d?.series || {};
      const anos = Object.keys(series).map(Number).sort();
      const anoMax = anos[anos.length - 1];
      if (anoMax && series[anoMax]) {
        const s = series[anoMax];
        if (s.mortalidadeMaternaNegra != null && s.mortalidadeMaternaBranca != null) {
          const total = (s.mortalidadeMaternaNegra + s.mortalidadeMaternaBranca);
          if (total > 0) mmPctNegra = ((s.mortalidadeMaternaNegra / total) * 100).toFixed(1);
          if (s.mortalidadeMaternaBranca > 0) mmRazao = (s.mortalidadeMaternaNegra / s.mortalidadeMaternaBranca).toFixed(1);
        }
      }
      if (saudeInd.fonte) mmFonte = saudeInd.fonte;
    }

    // Violência doméstica
    let violDomPct = '59,8';
    if (violDomInd) {
      const d = violDomInd.dados as any;
      if (d?.mulher_negra_abs != null && d?.mulher_branca_abs != null) {
        const total = d.mulher_negra_abs + d.mulher_branca_abs;
        if (total > 0) violDomPct = ((d.mulher_negra_abs / total) * 100).toFixed(1);
      }
    }

    fios.push({
      id: 'interseccionalidade-genero',
      titulo: 'Discriminação Interseccional: Mulheres Negras',
      tipo: 'correlacao',
      argumento: `${lacunasMulheres.length} lacuna(s) diretamente sobre mulheres negras e ${intersecGenero.length} lacunas com dimensão de gênero. A intersecção raça-gênero amplifica todas as formas de vulnerabilidade: feminicídio (${femPctAtual}% das vítimas são mulheres negras — ${femFonte}), mortalidade materna (${mmPctNegra}% dos óbitos são de mulheres negras — ${mmFonte}; razão negra/branca: ${mmRazao}×) e violência doméstica (${violDomPct}% das vítimas são negras) atingem desproporcionalmente mulheres negras.`,
      evidencias: [
        { texto: `Feminicídio: ${femPctAtual}% das vítimas são mulheres negras`, fonte: femFonte, tipo: 'quantitativa' as const },
        { texto: `Violência doméstica: ${violDomPct}% vítimas negras`, fonte: violDomInd?.fonte || 'FBSP 2025', tipo: 'quantitativa' as const },
        { texto: `Mortalidade materna: ${mmPctNegra}% dos óbitos são de mulheres negras; razão negra/branca: ${mmRazao}×`, fonte: mmFonte, tipo: 'quantitativa' as const },
        { texto: `Estupro: ${estupPct}% das vítimas são mulheres negras`, fonte: estupInd?.fonte || 'FBSP 2025', tipo: 'quantitativa' as const },
        ...evidMulheres.slice(0, 4),
      ],
      eixos: [...new Set([...lacunasMulheres.map(l => l.eixo_tematico), ...intersecGenero.map(l => l.eixo_tematico)])],
      grupos: ['mulheres_negras'],
      relevancia: 'alta',
      comparativo2018: `Feminicídio de mulheres negras: ${femPct2018}% → ${femPctAtual}% (${femFonte}). Mortalidade materna: ${mmPctNegra}% dos óbitos são de negras (${mmFonte}); razão negra/branca: ${mmRazao}×. Estupro: ${estupPct}% das vítimas são mulheres negras.`
    });
  }

  // FIO 5: Orçamento vs resultados
  if (orcStats && orcStats.totalRegistros > 0) {
    const evidOrc: EvidenciaDinamica[] = [];
    
    if (orcStats.totalPeriodo1 > 0 || orcStats.totalPeriodo2 > 0) {
      evidOrc.push({
        texto: `Período 2018-2022: R$ ${formatBRL(orcStats.totalPeriodo1)} executados`,
        fonte: 'SIOP/Portal da Transparência',
        tipo: 'orcamentaria',
        valor2018: formatBRL(orcStats.totalPeriodo1)
      });
      evidOrc.push({
        texto: `Período 2023-2025: R$ ${formatBRL(orcStats.totalPeriodo2)} executados`,
        fonte: 'SIOP/Portal da Transparência',
        tipo: 'orcamentaria',
        valorAtual: formatBRL(orcStats.totalPeriodo2)
      });
      evidOrc.push({
        texto: `Variação: ${orcStats.variacao >= 0 ? '+' : ''}${orcStats.variacao.toFixed(0)}%`,
        fonte: 'Cálculo baseado nos dados do BD',
        tipo: 'orcamentaria',
        variacao: `${orcStats.variacao.toFixed(0)}%`
      });
    }

    // Top programas
    if (orcStats.porPrograma) {
      Object.entries(orcStats.porPrograma).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).forEach(([prog, val]: any) => {
        evidOrc.push({
          texto: `${prog}: R$ ${formatBRL(val)}`,
          fonte: 'SIOP',
          tipo: 'orcamentaria'
        });
      });
    }

    // Nota sobre programas transversais excluídos
    evidOrc.push({
      texto: `NOTA METODOLÓGICA: 7 programas transversais com recorte racial foram excluídos desta análise (Agendas Transversais PPA R$ 405,3 bi, MCMV Faixa 1 R$ 42,8 bi, FEFC R$ 4,9 bi, Fundo Amazônia R$ 3,4 bi, Urbanização de Favelas R$ 3,2 bi, IBAMA/ICMBio R$ 1,85 bi, Operação Acolhida R$ 280 mi). São programas governamentais de escopo amplo que beneficiam indiretamente populações racializadas, mas não são políticas específicas de igualdade racial. Total excluído: R$ 461,7 bi em dotação / R$ 43,2 bi em valores pagos.`,
      fonte: 'SIOP / Portal da Transparência / TSE / BNDES',
      tipo: 'orcamentaria'
    });

    fios.push({
      id: 'orcamento-vs-resultados',
      titulo: 'Investimento vs. Resultados: A Lacuna Orçamentária',
      tipo: 'correlacao',
      argumento: `Com ${orcStats.totalRegistros} registros orçamentários analisados (excluindo 7 programas transversais não específicos de igualdade racial, que totalizam R$ 461,7 bi em dotação), a variação de ${orcStats.variacao >= 0 ? '+' : ''}${orcStats.variacao.toFixed(0)}% entre os períodos 2018-2022 e 2023-2025 ${orcStats.variacao > 0 ? 'indica recuperação, porém insuficiente para reverter a dívida histórica de subfinanciamento' : 'revela continuidade do subfinanciamento das políticas raciais'}. Os dados cruzados com indicadores socioeconômicos mostram que aumentos orçamentários não foram proporcionais à gravidade das lacunas. Programas como MCMV (R$ 42,8 bi), Fundo Amazônia (R$ 3,4 bi) e Urbanização de Favelas (R$ 3,2 bi) beneficiam indiretamente a população negra, mas sem componente institucional explícito de igualdade racial.`,
      evidencias: evidOrc,
      eixos: Object.keys(orcStats.porPrograma || {}),
      grupos: [],
      relevancia: 'alta',
      comparativo2018: `Orçamento para igualdade racial sofreu queda de até 90% entre 2016-2022, com recuperação parcial a partir de 2023. Nota: valores referem-se apenas a programas com componente institucional explícito de igualdade racial (MIR, FUNAI, INCRA, Palmares etc.), excluindo programas transversais.`
    });
  }

  // FIO 6: Dados e invisibilidade
  const lacunasDados = lacunas.filter(l => l.eixo_tematico === 'dados_estatisticas');
  const gruposSemDados = ['ciganos', 'lgbtqia_negros', 'pcd_negros', 'idosos_negros'].filter(
    g => !lacunas.some(l => l.grupo_focal === g)
  );

  // ODS Racial — evidências transversais
  const odsRacialIndicadores = indicadores.filter(i => i.categoria === 'ods_racial');
  const odsGrupos = [...new Set(odsRacialIndicadores.map(i => i.subcategoria).filter(Boolean))];

  fios.push({
    id: 'invisibilidade-dados',
    titulo: 'Invisibilidade Estatística e Lacunas de Dados',
    tipo: 'lacuna_critica',
    argumento: `${lacunasDados.length} observações da ONU sobre dados/estatísticas. ${gruposSemDados.length > 0 ? `Grupos sem representação nos dados: ${gruposSemDados.map(g => grupoLabels[g]).join(', ')}.` : ''} O Censo 2022 foi avanço histórico (primeira contagem de quilombolas), mas persistem lacunas em dados interseccionais sistemáticos — especialmente para povos ciganos, população LGBTQIA+ negra e PcD negros. O monitoramento ODS Racial (${odsRacialIndicadores.length} indicadores em ${odsGrupos.length} grupos temáticos) evidencia desigualdades persistentes nas metas da Agenda 2030.`,
    evidencias: [
      { texto: `${indicadores.length} indicadores interseccionais no banco (incluindo ${odsRacialIndicadores.length} ODS Racial)`, fonte: 'BD Sistema', tipo: 'quantitativa' },
      { texto: `${lacunasDados.length} recomendações ONU sobre dados`, fonte: 'CERD/C/BRA/CO/18-20', tipo: 'qualitativa' },
      ...gruposSemDados.map(g => ({
        texto: `${grupoLabels[g]}: sem dados sistemáticos desagregados`,
        fonte: 'Análise do BD',
        tipo: 'qualitativa' as const
      }))
    ],
    eixos: ['dados_estatisticas'],
    grupos: gruposSemDados,
    relevancia: 'media'
  });

  // FIO 11: ODS Racial — Agenda 2030 e Desigualdade Racial
  if (odsRacialIndicadores.length > 0) {
    const odsCrescentes = odsRacialIndicadores.filter(i => i.tendencia === 'crescente').length;
    const odsDecrescentes = odsRacialIndicadores.filter(i => i.tendencia === 'decrescente').length;
    const evidOds: EvidenciaDinamica[] = odsRacialIndicadores.slice(0, 6).map(i => ({
      texto: `${i.nome}: tendência ${i.tendencia || 'sem dados'}`,
      fonte: i.fonte,
      tipo: 'quantitativa' as const,
    }));

    fios.push({
      id: 'ods-racial-agenda-2030',
      titulo: 'ODS e Desigualdade Racial: Agenda 2030 sob Perspectiva Étnico-Racial',
      tipo: odsDecrescentes > odsCrescentes ? 'retrocesso' : 'correlacao',
      argumento: `${odsRacialIndicadores.length} indicadores ODS desagregados por raça/cor revelam que a Agenda 2030 não avança de forma equitativa para a população negra e indígena. ${odsCrescentes > 0 ? `${odsCrescentes} indicadores mostram tendência positiva.` : ''} ${odsDecrescentes > 0 ? `${odsDecrescentes} indicadores registram retrocesso ou estagnação.` : ''} Os ODS com maior disparidade racial incluem saúde (ODS 3), educação (ODS 4), trabalho (ODS 8), desigualdade (ODS 10) e segurança (ODS 16). Esta análise evidencia que o cumprimento formal dos ODS mascara desigualdades raciais estruturais.`,
      evidencias: evidOds,
      eixos: ['dados_estatisticas', 'saude', 'educacao', 'trabalho_renda', 'seguranca_publica'],
      grupos: ['negros', 'indigenas'],
      relevancia: 'alta',
      comparativo2018: `Os ODS foram adotados em 2015. Os dados de 2018-2024 mostram que indicadores agregados (nacionais) melhoraram, mas a desagregação racial revela estagnação ou piora para populações negras e indígenas em vários ODS.`,
      artigosConvencao: ['I', 'II', 'V'],
    });
  }

  // FIO 8: Administração Pública — MUNIC/ESTADIC 2024
  fios.push({
    id: 'adm-publica-munic-estadic',
    titulo: 'Fragilidade Institucional: Estruturas de Igualdade Racial nos Governos',
    tipo: 'lacuna_critica',
    argumento: `A MUNIC/ESTADIC 2024 (IBGE) revela que apenas 2 estados (RN e PR) possuem Fundos de Igualdade Racial ativos, e a maioria dos municípios carece de órgão dedicado ou conselho municipal de igualdade racial. A pesquisa mostra lacunas graves na institucionalização de políticas raciais em nível subnacional — especialmente para povos ciganos e indígenas, que praticamente não possuem estrutura específica em nenhuma esfera.`,
    evidencias: [
      { texto: 'Apenas 2 UFs com Fundo de Igualdade Racial ativo (RN e PR)', fonte: 'ESTADIC 2024 / IBGE', tipo: 'quantitativa' },
      { texto: 'Perfil de gestores municipais: maioria mulheres brancas', fonte: 'MUNIC 2024 / IBGE', tipo: 'quantitativa' },
      { texto: 'Povos ciganos e indígenas sem estrutura em governos subnacionais', fonte: 'MUNIC/ESTADIC 2024', tipo: 'qualitativa' },
    ],
    eixos: ['politicas_institucionais', 'dados_estatisticas'],
    grupos: ['geral', 'ciganos', 'indigenas'],
    relevancia: 'alta',
    comparativo2018: `Em 2018 a pesquisa anterior (MUNIC 2019) já indicava fragilidade. Em 2024, apesar da recriação do MIR a nível federal, a capilarização para estados e municípios segue extremamente deficiente.`
  });

  // FIO 9: COVID-19 e Desigualdade Racial
  fios.push({
    id: 'covid-desigualdade-racial',
    titulo: 'COVID-19: Pandemia Expôs e Aprofundou a Desigualdade Racial',
    tipo: 'retrocesso',
    argumento: `A pandemia de COVID-19 (2020-2022) atingiu desproporcionalmente a população negra e indígena: negros representaram 57% dos óbitos por COVID apesar de serem 56% da população (DataSUS/SIM); mortalidade materna negra quase triplicou durante o pico. A recuperação pós-pandemia (2023-2024) também é desigual: mulheres negras foram as últimas a recuperar emprego e renda. O impacto pandêmico expõe a fragilidade do acesso à saúde e proteção social para populações racializadas.`,
    evidencias: [
      { texto: 'Negros: 57% dos óbitos COVID (sobre-representação em relação à proporção populacional de 56%)', fonte: 'DataSUS/SIM — Painel COVID-19', tipo: 'quantitativa' },
      { texto: 'Mortalidade materna negra COVID: quase triplicou no pico (2020-2021)', fonte: 'DataSUS/SIM 2020-2021', tipo: 'quantitativa' },
      { texto: 'Insegurança alimentar grave: 20,6% lares negros vs 10,6% brancos', fonte: 'Fiocruz/DSBR 2023', tipo: 'quantitativa' },
      { texto: 'Mulheres negras: últimas a recuperar emprego pós-pandemia', fonte: 'PNAD Contínua 2023', tipo: 'quantitativa' },
      { texto: 'Negros com +16% de chance de óbito em UTI por COVID', fonte: 'Fiocruz / Observatório COVID-19', tipo: 'quantitativa' },
    ],
    eixos: ['saude', 'trabalho_renda', 'dados_estatisticas'],
    grupos: ['negros', 'indigenas', 'mulheres_negras', 'idosos_negros'],
    relevancia: 'alta',
    comparativo2018: `Antes da pandemia (2018-2019), as desigualdades já eram graves. A COVID amplificou todas as disparidades: mortalidade, emprego, renda, educação remota. Em 2024, a recuperação econômica atinge menos os negros.`
  });

  // FIO 10: Assimetria ICERD × Orçamento — cruzamento aderência × investimento por artigo
  if (orcDados.length > 0) {
    const artigoOrc = new Map<ArtigoConvencao, { liq: number; count: number }>();
    ARTIGOS_CONVENCAO.forEach(a => artigoOrc.set(a.numero, { liq: 0, count: 0 }));
    for (const r of orcDados) {
      const arts = inferArtigosOrcamento(r);
      for (const a of arts) {
        const cur = artigoOrc.get(a)!;
        cur.liq += Number(r.liquidado) || 0;
        cur.count += 1;
      }
    }
    // Lacunas per article (with fallback inference)
    const artigoLac = new Map<ArtigoConvencao, number>();
    ARTIGOS_CONVENCAO.forEach(a => artigoLac.set(a.numero, 0));
    for (const l of lacunas) {
      const mapped = EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS];
      const arts: ArtigoConvencao[] = mapped || [];
      for (const a of arts) artigoLac.set(a, (artigoLac.get(a) || 0) + 1);
    }

    const totalLiq = Array.from(artigoOrc.values()).reduce((s, v) => s + v.liq, 0);
    const evidIcerd: EvidenciaDinamica[] = [];
    const artigosConcentrados: string[] = [];
    const artigosSemCobertura: string[] = [];

    ARTIGOS_CONVENCAO.forEach(art => {
      const orc = artigoOrc.get(art.numero)!;
      const lac = artigoLac.get(art.numero) || 0;
      const pct = totalLiq > 0 ? (orc.liq / totalLiq * 100) : 0;
      if (pct > 30) artigosConcentrados.push(`Art. ${art.numero} (${pct.toFixed(0)}%)`);
      if (orc.count === 0 && lac > 0) artigosSemCobertura.push(`Art. ${art.numero}`);
      if (lac > 0 || orc.count > 0) {
        evidIcerd.push({
          texto: `Art. ${art.numero} — ${art.titulo}: ${orc.count} registros (${formatBRL(orc.liq)} liq.) × ${lac} recomendações ONU`,
          fonte: 'Cruzamento ICERD × Orçamento × Lacunas',
          tipo: 'orcamentaria',
        });
      }
    });

    fios.push({
      id: 'assimetria-icerd-orcamento',
      titulo: 'Assimetria ICERD × Orçamento: Investimento vs. Compromissos',
      tipo: 'paradoxo',
      argumento: `O cruzamento do investimento federal com os 7 artigos da Convenção revela assimetria estrutural. ${artigosConcentrados.length > 0 ? `O investimento concentra-se em ${artigosConcentrados.join(', ')}, dominado por saúde indígena (SESAI).` : ''} ${artigosSemCobertura.length > 0 ? `Enquanto isso, ${artigosSemCobertura.join(', ')} possuem recomendações ONU sem nenhuma cobertura orçamentária identificada — revelando compromissos do tratado desatendidos financeiramente.` : 'Todos os artigos possuem alguma cobertura orçamentária.'} Esta desproporção é evidência de que o orçamento racial brasileiro não responde às obrigações do tratado de forma equilibrada.`,
      evidencias: evidIcerd,
      eixos: Object.keys(eixoLabels),
      grupos: [],
      relevancia: 'alta',
      artigosConvencao: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'],
    });
  }

  // FIO 7: Respostas CERD III - o que o Brasil respondeu e o que falta
  if (respostas.length > 0) {
    const naoCumpridas = respostas.filter(r => r.grau_atendimento === 'nao_cumprido');
    const retrocessos = respostas.filter(r => r.grau_atendimento === 'retrocesso');
    const evidResp: EvidenciaDinamica[] = [];

    naoCumpridas.forEach(r => {
      evidResp.push({
        texto: `§${r.paragrafo_cerd_iii}: ${r.critica_original.substring(0, 100)}...`,
        fonte: 'CERD III',
        tipo: 'qualitativa'
      });
      r.lacunas_remanescentes?.slice(0, 2).forEach(lr => {
        evidResp.push({ texto: lr, fonte: `Lacuna §${r.paragrafo_cerd_iii}`, tipo: 'qualitativa' });
      });
    });

    fios.push({
      id: 'divida-cerd-iii',
      titulo: 'Dívida do CERD III: Críticas Não Respondidas',
      tipo: 'lacuna_critica',
      argumento: `Das ${respostas.length} críticas do relatório anterior (CERD III), ${naoCumpridas.length} permanecem não cumpridas e ${retrocessos.length} registram retrocesso. As lacunas remanescentes indicam áreas onde o Estado brasileiro não conseguiu demonstrar progresso concreto, constituindo passivo a ser endereçado no IV Relatório.`,
      evidencias: evidResp.slice(0, 8),
      eixos: [],
      grupos: [],
      relevancia: 'alta',
      comparativo2018: `O CERD III cobriu até 2017. O período 2018-2024 deveria ter sido o de resposta às críticas, mas muitas permanecem sem avanço.`
    });
  }

  // =============================================
  // FIOS EMERGENTES — gerados dinamicamente a partir dos dados
  // Evita repetir argumentos já cobertos pelos 9 fios fixos acima
  // =============================================
  const fiosEmergentes = gerarFiosEmergentes(lacunas, stats, respostas, orcStats, indicadores, orcDados, fios);
  fios.push(...fiosEmergentes);

  // Auto-fill artigosConvencao from eixos for all fios
  return fios.map(f => ({
    ...f,
    artigosConvencao: f.artigosConvencao ?? deriveArtigos(f.eixos),
  }));
}

// =============================================
// GERAÇÃO DE FIOS EMERGENTES
// =============================================

function gerarFiosEmergentes(
  lacunas: LacunaIdentificada[],
  stats: any,
  respostas: RespostaLacunaCerdIII[],
  orcStats: any,
  indicadores: IndicadorInterseccional[],
  orcDados: DadoOrcamentario[],
  fiosExistentes: FioCondutor[]
): FioCondutor[] {
  const novos: FioCondutor[] = [];
  const eixosCobertos = new Set(fiosExistentes.flatMap(f => f.eixos));
  const gruposCobertos = new Set(fiosExistentes.flatMap(f => f.grupos));

  // EMERGENTE 1: Eixos temáticos com alta concentração de lacunas NÃO cobertos por fios existentes
  const porEixo: Record<string, LacunaIdentificada[]> = {};
  lacunas.forEach(l => {
    if (!porEixo[l.eixo_tematico]) porEixo[l.eixo_tematico] = [];
    porEixo[l.eixo_tematico].push(l);
  });

  Object.entries(porEixo).forEach(([eixo, lacunasEixo]) => {
    if (eixosCobertos.has(eixo)) return; // já coberto por fio fixo
    if (lacunasEixo.length < 2) return; // densidade mínima

    const naoCumpridas = lacunasEixo.filter(l => l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso');
    const cumpridas = lacunasEixo.filter(l => l.status_cumprimento === 'cumprido' || l.status_cumprimento === 'parcialmente_cumprido');
    const evidencias: EvidenciaDinamica[] = [];
    lacunasEixo.forEach(l => {
      l.evidencias_encontradas?.slice(0, 2).forEach(ev => {
        evidencias.push({ texto: ev, fonte: `§${l.paragrafo}`, tipo: 'quantitativa' });
      });
    });

    const tipo: FioCondutor['tipo'] = naoCumpridas.length > cumpridas.length ? 'lacuna_critica' : 'avanco';

    novos.push({
      id: `emergente-eixo-${eixo}`,
      titulo: `${eixoLabels[eixo] || eixo}: ${tipo === 'avanco' ? 'Avanços Insuficientes' : 'Concentração de Lacunas'}`,
      tipo,
      argumento: `O eixo ${eixoLabels[eixo] || eixo} acumula ${lacunasEixo.length} observações da ONU, das quais ${naoCumpridas.length} não foram cumpridas. ${cumpridas.length > 0 ? `Houve ${cumpridas.length} avanço(s) parcial(is), mas` : 'A ausência de avanços indica que'} este eixo demanda atenção reforçada no IV Relatório, especialmente na articulação com os dados orçamentários e indicadores estatísticos disponíveis.`,
      evidencias: evidencias.slice(0, 6),
      eixos: [eixo],
      grupos: [...new Set(lacunasEixo.map(l => l.grupo_focal))],
      relevancia: naoCumpridas.length >= 3 ? 'alta' : 'media',
    });
  });

  // EMERGENTE 2: Grupos focais com alta vulnerabilidade não cobertos como fio principal
  const porGrupo: Record<string, LacunaIdentificada[]> = {};
  lacunas.forEach(l => {
    if (!porGrupo[l.grupo_focal]) porGrupo[l.grupo_focal] = [];
    porGrupo[l.grupo_focal].push(l);
  });

  Object.entries(porGrupo).forEach(([grupo, lacunasGrupo]) => {
    if (gruposCobertos.has(grupo)) return;
    if (lacunasGrupo.length < 2) return;
    if (grupo === 'geral') return;

    const naoCumpridas = lacunasGrupo.filter(l => l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso');
    const evidencias: EvidenciaDinamica[] = [];
    lacunasGrupo.forEach(l => {
      l.evidencias_encontradas?.slice(0, 2).forEach(ev => {
        evidencias.push({ texto: ev, fonte: `§${l.paragrafo} - ${l.tema}`, tipo: 'quantitativa' });
      });
    });

    // Cruzar com indicadores do grupo
    const indicadoresGrupo = indicadores.filter(i =>
      i.lacunas_relacionadas?.some(lr => lacunasGrupo.some(l => l.id === lr))
    );

    novos.push({
      id: `emergente-grupo-${grupo}`,
      titulo: `${grupoLabels[grupo] || grupo}: Vulnerabilidade Específica`,
      tipo: 'correlacao',
      argumento: `${grupoLabels[grupo] || grupo} acumula ${lacunasGrupo.length} observações do Comitê CERD, com ${naoCumpridas.length} não cumprida(s). ${indicadoresGrupo.length > 0 ? `${indicadoresGrupo.length} indicador(es) do banco sustentam a análise interseccional deste grupo.` : 'A escassez de indicadores específicos no banco evidencia a invisibilidade estatística deste grupo.'} A interlocução entre as recomendações ONU e os dados disponíveis revela lacunas que merecem fio condutor próprio no relatório.`,
      evidencias: evidencias.slice(0, 6),
      eixos: [...new Set(lacunasGrupo.map(l => l.eixo_tematico))],
      grupos: [grupo],
      relevancia: naoCumpridas.length >= 2 ? 'alta' : 'media',
    });
  });

  // EMERGENTE 3: Cruzamento orçamento × eixo temático sem cobertura orçamentária
  if (orcDados.length > 0) {
    const eixosComOrcamento = new Set(orcDados.map(d => d.eixo_tematico).filter(Boolean));
    const eixosSemOrcamento = Object.keys(porEixo).filter(
      e => !eixosComOrcamento.has(e) && porEixo[e].length >= 2
    );

    if (eixosSemOrcamento.length > 0) {
      novos.push({
        id: 'emergente-eixos-sem-orcamento',
        titulo: 'Eixos sem Cobertura Orçamentária Identificada',
        tipo: 'lacuna_critica',
        argumento: `${eixosSemOrcamento.length} eixo(s) temático(s) com recomendações do CERD não possuem registros orçamentários vinculados: ${eixosSemOrcamento.map(e => eixoLabels[e] || e).join(', ')}. Isso pode indicar ausência de programas específicos, dados orçamentários ainda não coletados, ou dispersão do financiamento em programas genéricos não rastreáveis por recorte racial.`,
        evidencias: eixosSemOrcamento.map(e => ({
          texto: `${eixoLabels[e]}: ${porEixo[e].length} recomendações ONU, 0 registros orçamentários`,
          fonte: 'Cruzamento BD',
          tipo: 'orcamentaria' as const,
        })),
        eixos: eixosSemOrcamento,
        grupos: [],
        relevancia: 'media',
      });
    }
  }

  // EMERGENTE 4: Padrões de documento_origem nos indicadores (ex: Durban, Follow-up)
  const documentosOrigem: Record<string, IndicadorInterseccional[]> = {};
  indicadores.forEach(ind => {
    ind.documento_origem?.forEach(doc => {
      if (!documentosOrigem[doc]) documentosOrigem[doc] = [];
      documentosOrigem[doc].push(ind);
    });
  });

  // Detectar documentos normativos com massa crítica de indicadores que não são eixo principal dos fios existentes
  const titulosFiosExistentes = fiosExistentes.map(f => f.titulo.toLowerCase());
  Object.entries(documentosOrigem).forEach(([doc, inds]) => {
    if (inds.length < 3) return;
    // Evitar duplicação: checar se o doc já é mencionado em títulos existentes
    const docLower = doc.toLowerCase();
    if (titulosFiosExistentes.some(t => t.includes(docLower) || docLower.includes(t.split(':')[0]))) return;

    const categoriasCobertas = [...new Set(inds.map(i => i.categoria))];
    const tendencias = inds.filter(i => i.tendencia === 'crescente').length;
    const decrescentes = inds.filter(i => i.tendencia === 'decrescente').length;

    novos.push({
      id: `emergente-doc-${doc.replace(/\s+/g, '-').toLowerCase().substring(0, 30)}`,
      titulo: `Marco Normativo "${doc}": Evidências Transversais`,
      tipo: 'correlacao',
      argumento: `O documento "${doc}" fundamenta ${inds.length} indicadores no banco, abrangendo ${categoriasCobertas.length} categoria(s): ${categoriasCobertas.map(c => eixoLabels[c] || c).join(', ')}. ${tendencias > 0 ? `${tendencias} indicador(es) mostram tendência crescente.` : ''} ${decrescentes > 0 ? `${decrescentes} indicador(es) mostram tendência decrescente, sinalizando áreas de atenção.` : ''} Este marco normativo pode constituir fio condutor próprio na argumentação do relatório, conectando obrigações internacionais a evidências quantitativas.`,
      evidencias: inds.slice(0, 6).map(i => ({
        texto: `${i.nome}: ${i.tendencia || 'sem tendência definida'}`,
        fonte: i.fonte,
        tipo: 'quantitativa' as const,
      })),
      eixos: categoriasCobertas,
      grupos: [],
      relevancia: inds.length >= 5 ? 'alta' : 'media',
    });
  });

  // EMERGENTE 5: Execução orçamentária como evidência de fortalecimento (2023-2025)
  if (orcDados.length > 0) {
    const dados2023_25 = orcDados.filter(d => d.ano >= 2023 && d.ano <= 2025);
    const altaExecucao = dados2023_25.filter(d => (d.percentual_execucao || 0) >= 90);
    if (altaExecucao.length >= 3 && !titulosFiosExistentes.some(t => t.includes('execução'))) {
      const programas = [...new Set(altaExecucao.map(d => d.programa))];
      novos.push({
        id: 'emergente-execucao-recorde',
        titulo: 'Execução Orçamentária Recorde: Evidência de Fortalecimento',
        tipo: 'avanco',
        argumento: `${altaExecucao.length} registros orçamentários do período 2023-2025 apresentam execução ≥90%, abrangendo ${programas.length} programa(s). Esse desempenho contrasta com o período 2019-2022 e constitui evidência de fortalecimento institucional das políticas raciais, podendo ser utilizado como argumento de avanço no IV Relatório.`,
        evidencias: altaExecucao.slice(0, 6).map(d => ({
          texto: `${d.programa} (${d.ano}): ${d.percentual_execucao?.toFixed(0)}% execução`,
          fonte: d.fonte_dados,
          tipo: 'orcamentaria' as const,
        })),
        eixos: [...new Set(altaExecucao.map(d => d.eixo_tematico).filter(Boolean) as string[])],
        grupos: [...new Set(altaExecucao.map(d => d.grupo_focal).filter(Boolean) as string[])],
        relevancia: 'alta',
        comparativo2018: `Período 2019-2022 registrou execução abaixo de 50% em múltiplos programas, com desfinanciamento generalizado.`,
      });
    }
  }

  return novos;
}

// =============================================
// GERAÇÃO DE CONCLUSÕES DINÂMICAS
// =============================================

function gerarConclusoesDinamicas(
  lacunas: LacunaIdentificada[],
  stats: any,
  respostas: RespostaLacunaCerdIII[],
  orcStats: any,
  indicadores: IndicadorInterseccional[],
  orcDados: DadoOrcamentario[],
  fios: FioCondutor[]
): ConclusaoDinamica[] {
  const conclusoes: ConclusaoDinamica[] = [];

  // Agrupar lacunas por eixo para conclusões temáticas
  const porEixo: Record<string, LacunaIdentificada[]> = {};
  lacunas.forEach(l => {
    if (!porEixo[l.eixo_tematico]) porEixo[l.eixo_tematico] = [];
    porEixo[l.eixo_tematico].push(l);
  });

  Object.entries(porEixo).forEach(([eixo, lacunasEixo]) => {
    const cumpridas = lacunasEixo.filter(l => l.status_cumprimento === 'cumprido').length;
    const parciais = lacunasEixo.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length;
    const naoCumpridas = lacunasEixo.filter(l => l.status_cumprimento === 'nao_cumprido').length;
    const retrocessos = lacunasEixo.filter(l => l.status_cumprimento === 'retrocesso').length;

    // Determinar tipo
    let tipo: 'lacuna_persistente' | 'avanco' | 'retrocesso';
    if (retrocessos > 0 && retrocessos >= cumpridas) {
      tipo = 'retrocesso';
    } else if (cumpridas > naoCumpridas + retrocessos) {
      tipo = 'avanco';
    } else {
      tipo = 'lacuna_persistente';
    }

    // Coletar evidências das lacunas
    const evidencias: string[] = [];
    lacunasEixo.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => evidencias.push(ev));
    });

    // Coletar ações do Brasil
    const acoes: string[] = [];
    lacunasEixo.forEach(l => {
      l.acoes_brasil?.forEach(a => acoes.push(a));
    });

    // Grupos afetados
    const gruposAfetados = [...new Set(lacunasEixo.map(l => grupoLabels[l.grupo_focal]))];

    // Fios condutores relacionados
    const fiosRelacionados = fios.filter(f => f.eixos.includes(eixo)).map(f => f.id);

    // Argumento construído dinamicamente
    const percentualCumprimento = lacunasEixo.length > 0 
      ? Math.round(((cumpridas * 100) + (parciais * 50)) / lacunasEixo.length) 
      : 0;

    const argumento = construirArgumento(
      eixoLabels[eixo] || eixo,
      lacunasEixo.length,
      { cumpridas, parciais, naoCumpridas, retrocessos },
      percentualCumprimento,
      gruposAfetados,
      acoes,
      evidencias
    );

    conclusoes.push({
      id: `conclusao-${eixo}`,
      tipo,
      titulo: `${eixoLabels[eixo]}: ${tipo === 'avanco' ? 'Avanços Registrados' : tipo === 'retrocesso' ? 'Retrocessos Identificados' : 'Lacunas Persistentes'}`,
      periodo: '2018-2024',
      argumento_central: argumento,
      evidencias: [...evidencias.slice(0, 4), ...acoes.slice(0, 2)],
      eixos: [eixo],
      fromDatabase: true,
      relevancia_common_core: true,
      relevancia_cerd_iv: true,
      fiosCondutores: fiosRelacionados
    });
  });

  // Conclusão transversal: respostas CERD III
  if (respostas.length > 0) {
    const naoCumpridasResp = respostas.filter(r => r.grau_atendimento === 'nao_cumprido');
    const retrocessosResp = respostas.filter(r => r.grau_atendimento === 'retrocesso');
    const parciaisResp = respostas.filter(r => r.grau_atendimento === 'parcialmente_cumprido');
    
    const lacunasRemanescentes: string[] = [];
    respostas.forEach(r => {
      r.lacunas_remanescentes?.forEach(lr => lacunasRemanescentes.push(lr));
    });

    conclusoes.push({
      id: 'conclusao-respostas-cerd-iii',
      tipo: naoCumpridasResp.length + retrocessosResp.length > parciaisResp.length ? 'lacuna_persistente' : 'avanco',
      titulo: 'Balanço das Respostas ao CERD III (2004-2017)',
      periodo: '2018-2024',
      argumento_central: `Das ${respostas.length} críticas do relatório anterior, ${parciaisResp.length} foram parcialmente atendidas, ${naoCumpridasResp.length} permanecem sem cumprimento e ${retrocessosResp.length} registram retrocesso. ${lacunasRemanescentes.length} lacunas remanescentes foram identificadas, demandando atenção prioritária no IV Relatório. A análise revela que o Brasil avançou em marcos legais mas falhou na implementação efetiva.`,
      evidencias: lacunasRemanescentes.slice(0, 6),
      eixos: [],
      fromDatabase: true,
      relevancia_common_core: true,
      relevancia_cerd_iv: true,
      fiosCondutores: ['divida-cerd-iii', 'paradoxo-normativo']
    });
  }

  // =============================================
  // CONCLUSÕES ICERD — Avanços/Retrocessos por Artigo da Convenção
  // Cruza cobertura orçamentária com lacunas por artigo
  // =============================================
  if (orcDados.length > 0) {
    const artigoOrc = new Map<ArtigoConvencao, { liq: number; liqP1: number; liqP2: number; count: number }>();
    ARTIGOS_CONVENCAO.forEach(a => artigoOrc.set(a.numero, { liq: 0, liqP1: 0, liqP2: 0, count: 0 }));
    for (const r of orcDados) {
      const arts = inferArtigosOrcamento(r);
      for (const a of arts) {
        const cur = artigoOrc.get(a)!;
        const val = Number(r.liquidado) || 0;
        cur.liq += val;
        cur.count += 1;
        if (r.ano <= 2022) cur.liqP1 += val; else cur.liqP2 += val;
      }
    }

    const artigoLacStatus = new Map<ArtigoConvencao, { nc: number; ret: number; cum: number; parc: number; total: number }>();
    ARTIGOS_CONVENCAO.forEach(a => artigoLacStatus.set(a.numero, { nc: 0, ret: 0, cum: 0, parc: 0, total: 0 }));
    for (const l of lacunas) {
      const mapped = EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS];
      const arts: ArtigoConvencao[] = mapped || [];
      for (const a of arts) {
        const cur = artigoLacStatus.get(a)!;
        cur.total += 1;
        if (l.status_cumprimento === 'nao_cumprido') cur.nc += 1;
        else if (l.status_cumprimento === 'retrocesso') cur.ret += 1;
        else if (l.status_cumprimento === 'cumprido') cur.cum += 1;
        else if (l.status_cumprimento === 'parcialmente_cumprido') cur.parc += 1;
      }
    }

    ARTIGOS_CONVENCAO.forEach(art => {
      const orc = artigoOrc.get(art.numero)!;
      const lac = artigoLacStatus.get(art.numero)!;
      if (lac.total === 0 && orc.count === 0) return;

      const varOrc = orc.liqP1 > 0 ? ((orc.liqP2 - orc.liqP1) / orc.liqP1 * 100) : (orc.liqP2 > 0 ? 100 : 0);
      const positivos = lac.cum + lac.parc;
      const negativos = lac.nc + lac.ret;

      let tipo: 'avanco' | 'retrocesso' | 'lacuna_persistente';
      if (lac.ret > 0 && negativos > positivos) tipo = 'retrocesso';
      else if (positivos > negativos && varOrc > 0) tipo = 'avanco';
      else tipo = 'lacuna_persistente';

      const evidencias: string[] = [];
      if (orc.count > 0) evidencias.push(`${orc.count} registros orçamentários · Liquidado total: ${formatBRL(orc.liq)}`);
      if (orc.liqP1 > 0 || orc.liqP2 > 0) evidencias.push(`P1 (2018-22): ${formatBRL(orc.liqP1)} → P2 (2023-25): ${formatBRL(orc.liqP2)} (${varOrc >= 0 ? '+' : ''}${varOrc.toFixed(0)}%)`);
      if (lac.total > 0) evidencias.push(`${lac.total} recomendações ONU: ${lac.cum} cumpridas, ${lac.parc} parciais, ${lac.nc} não cumpridas, ${lac.ret} retrocesso(s)`);
      if (orc.count === 0 && lac.total > 0) evidencias.push('⚠ Nenhum registro orçamentário identificado para este compromisso');

      const contradicao = varOrc > 20 && negativos > positivos
        ? ` Apesar do crescimento orçamentário de ${varOrc.toFixed(0)}%, a maioria das recomendações ONU permanece sem cumprimento — evidenciando que o investimento não se traduziu em conformidade com o tratado.`
        : '';

      conclusoes.push({
        id: `conclusao-icerd-art-${art.numero}`,
        tipo,
        titulo: `Art. ${art.numero} — ${art.titulo}: ${tipo === 'avanco' ? 'Avanços Identificados' : tipo === 'retrocesso' ? 'Retrocesso' : 'Lacuna Persistente'}`,
        periodo: '2018-2025',
        argumento_central: `O Artigo ${art.numero} da Convenção (${art.titulo}) possui ${lac.total} observações ONU e ${orc.count} registros orçamentários (${formatBRL(orc.liq)} liquidados). ${lac.total > 0 ? `Grau de cumprimento: ${lac.cum} cumpridas, ${lac.parc} parciais, ${lac.nc} não cumpridas, ${lac.ret} retrocesso(s).` : ''} ${varOrc !== 0 ? `Variação orçamentária entre períodos: ${varOrc >= 0 ? '+' : ''}${varOrc.toFixed(0)}%.` : ''}${contradicao}`,
        evidencias,
        eixos: [],
        fromDatabase: true,
        relevancia_common_core: true,
        relevancia_cerd_iv: true,
        fiosCondutores: ['assimetria-icerd-orcamento'],
        artigosConvencao: [art.numero],
      });
    });
  }

  // Auto-fill artigosConvencao from eixos for all conclusions
  return conclusoes.map(c => ({
    ...c,
    artigosConvencao: c.artigosConvencao ?? deriveArtigos(c.eixos),
  }));
}

// =============================================
// GERAÇÃO DE INSIGHTS DE CRUZAMENTO
// =============================================

function gerarInsightsCruzamento(
  lacunas: LacunaIdentificada[],
  stats: any,
  respostas: RespostaLacunaCerdIII[],
  orcStats: any,
  indicadores: IndicadorInterseccional[],
  orcDados: DadoOrcamentario[]
): InsightCruzamento[] {
  const insights: InsightCruzamento[] = [];

  // Insight 1: Cruzamento prioridade × status
  const criticasNaoCumpridas = lacunas.filter(l => l.prioridade === 'critica' && l.status_cumprimento === 'nao_cumprido');
  if (criticasNaoCumpridas.length > 0) {
    insights.push({
      id: 'criticas-nao-cumpridas',
      titulo: `${criticasNaoCumpridas.length} lacunas CRÍTICAS sem cumprimento`,
      descricao: `Lacunas de prioridade crítica que permanecem não cumpridas representam as maiores falhas do Estado. Concentram-se em: ${[...new Set(criticasNaoCumpridas.map(l => eixoLabels[l.eixo_tematico]))].join(', ')}.`,
      dados: criticasNaoCumpridas.map(l => `§${l.paragrafo}: ${l.tema} (${grupoLabels[l.grupo_focal]})`),
      tipo: 'alerta'
    });
  }

  // Insight 2: Eixos com retrocesso
  const retrocessos = lacunas.filter(l => l.status_cumprimento === 'retrocesso');
  if (retrocessos.length > 0) {
    insights.push({
      id: 'retrocessos-identificados',
      titulo: `${retrocessos.length} áreas em retrocesso`,
      descricao: `Áreas onde a situação piorou em relação ao período anterior. Exigem ação emergencial e reconhecimento no relatório ao Comitê.`,
      dados: retrocessos.map(l => `§${l.paragrafo}: ${l.tema} - ${l.descricao_lacuna.substring(0, 80)}...`),
      tipo: 'alerta'
    });
  }

  // Insight 3: Interseccionalidades mais frequentes
  const intersecContagem: Record<string, number> = {};
  lacunas.forEach(l => {
    l.interseccionalidades?.forEach(i => {
      intersecContagem[i] = (intersecContagem[i] || 0) + 1;
    });
  });
  const intersecOrdenadas = Object.entries(intersecContagem).sort((a, b) => b[1] - a[1]);
  if (intersecOrdenadas.length > 0) {
    insights.push({
      id: 'interseccionalidades-frequentes',
      titulo: 'Interseccionalidades mais frequentes',
      descricao: `As dimensões interseccionais mais citadas nas lacunas revelam onde se concentram as vulnerabilidades múltiplas.`,
      dados: intersecOrdenadas.slice(0, 5).map(([dim, count]) => `${dim}: presente em ${count} de ${lacunas.length} lacunas (${Math.round(count/lacunas.length*100)}%)`),
      tipo: 'correlação'
    });
  }

  // Insight 4: Grupos mais vulneráveis
  const gruposVulneraveis = Object.entries(stats.porGrupo || {})
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);
  if (gruposVulneraveis.length > 0) {
    insights.push({
      id: 'grupos-vulneraveis',
      titulo: 'Grupos focais com mais lacunas',
      descricao: `Grupos populacionais com maior concentração de observações não cumpridas ou em retrocesso.`,
      dados: gruposVulneraveis.map(([g, count]: any) => `${grupoLabels[g] || g}: ${count} lacuna(s)`),
      tipo: 'alerta'
    });
  }

  // Insight 5: Contradição orçamento × lacunas
  if (orcStats && orcStats.variacao > 0 && criticasNaoCumpridas.length > 0) {
    insights.push({
      id: 'contradição-orcamento',
      titulo: 'Contradição: Orçamento cresceu, lacunas persistem',
      descricao: `O orçamento para políticas raciais variou ${orcStats.variacao.toFixed(0)}% entre períodos, mas ${criticasNaoCumpridas.length} lacunas críticas permanecem sem cumprimento. Isso sugere que o aumento de recursos não foi direcionado às áreas de maior necessidade.`,
      dados: [
        `Orçamento 2018-2022: R$ ${formatBRL(orcStats.totalPeriodo1)}`,
        `Orçamento 2023-2025: R$ ${formatBRL(orcStats.totalPeriodo2)}`,
        `Lacunas críticas não resolvidas: ${criticasNaoCumpridas.length}`
      ],
      tipo: 'contradição'
    });
  }

  // Insight 6: Fontes de dados coletadas vs necessárias
  const fontesColetadas = new Set<string>();
  lacunas.forEach(l => l.fontes_dados?.forEach(f => fontesColetadas.add(f)));
  if (fontesColetadas.size > 0) {
    insights.push({
      id: 'cobertura-fontes',
      titulo: `${fontesColetadas.size} fontes de dados utilizadas`,
      descricao: `Fontes oficiais que embasam a análise das lacunas. Quanto maior a diversidade de fontes, mais robusta a argumentação.`,
      dados: [...fontesColetadas].slice(0, 8),
      tipo: 'progresso'
    });
  }

  return insights;
}

// =============================================
// SÍNTESE EXECUTIVA DINÂMICA
// =============================================

function gerarSinteseExecutiva(
  lacunas: LacunaIdentificada[],
  stats: any,
  respostas: RespostaLacunaCerdIII[],
  orcStats: any,
  indicadores: IndicadorInterseccional[],
  diagnosticMap?: Map<string, RecomendacaoDiagnostic>
) {
  // Use sensor-reclassified status when available, fallback to raw DB
  const getStatus = (l: LacunaIdentificada) => {
    if (diagnosticMap) {
      const diag = diagnosticMap.get(l.id);
      if (diag) return diag.statusComputado;
    }
    return l.status_cumprimento;
  };

  const total = stats.total;
  const cumpridas = lacunas.filter(l => getStatus(l) === 'cumprido').length;
  const parciais = lacunas.filter(l => getStatus(l) === 'parcialmente_cumprido').length;
  const naoCumpridas = lacunas.filter(l => getStatus(l) === 'nao_cumprido').length;
  const retrocesso = lacunas.filter(l => getStatus(l) === 'retrocesso').length;

  const percentualPositivo = total > 0 ? Math.round(((cumpridas + parciais) / total) * 100) : 0;
  const percentualNegativo = total > 0 ? Math.round(((naoCumpridas + retrocesso) / total) * 100) : 0;

  // Eixos mais problemáticos — using reclassified status
  const eixosMaisProblematicos = Object.entries(stats.porEixo || {})
    .map(([eixo, count]: any) => {
      const naoCumpridasEixo = lacunas.filter(l => l.eixo_tematico === eixo && (getStatus(l) === 'nao_cumprido' || getStatus(l) === 'retrocesso')).length;
      return { eixo: eixoLabels[eixo], gravidade: count > 0 ? naoCumpridasEixo / count : 0, total: count };
    })
    .sort((a, b) => b.gravidade - a.gravidade);

  // Respostas CERD III
  const respostasNaoCumpridas = respostas.filter(r => r.grau_atendimento === 'nao_cumprido' || r.grau_atendimento === 'retrocesso');

  // ODS Racial count
  const odsRacialCount = indicadores.filter(i => i.categoria === 'ods_racial').length;

  return {
    totalLacunas: total,
    percentualPositivo,
    percentualNegativo,
    retrocessos: retrocesso,
    eixosMaisProblematicos: eixosMaisProblematicos.slice(0, 3),
    totalRespostasCERDIII: respostas.length,
    respostasPendentes: respostasNaoCumpridas.length,
    totalIndicadores: indicadores.length,
    totalOdsRacial: odsRacialCount,
    totalOrcamento: orcStats?.totalRegistros || 0,
    variacaoOrcamento: orcStats?.variacao || 0,
    narrativa: `O Brasil possui ${total} observações/recomendações do Comitê CERD mapeadas. ${percentualPositivo}% tiveram algum grau de cumprimento (${cumpridas} cumpridas + ${parciais} parciais), enquanto ${percentualNegativo}% permanecem não cumpridas (${naoCumpridas}) ou em retrocesso (${retrocesso}). ${respostasNaoCumpridas.length} de ${respostas.length} críticas do relatório anterior seguem sem resposta adequada. ${odsRacialCount > 0 ? `${odsRacialCount} indicadores ODS desagregados por raça monitoram o cumprimento da Agenda 2030. ` : ''}${eixosMaisProblematicos.length > 0 ? `O eixo mais crítico é ${eixosMaisProblematicos[0]?.eixo} com ${Math.round(eixosMaisProblematicos[0]?.gravidade * 100)}% de não-cumprimento.` : ''}`
  };
}

// =============================================
// HELPERS
// =============================================

function construirArgumento(
  eixo: string,
  total: number,
  status: { cumpridas: number; parciais: number; naoCumpridas: number; retrocessos: number },
  percentual: number,
  grupos: string[],
  acoes: string[],
  evidencias: string[]
): string {
  let arg = `No eixo ${eixo}, foram identificadas ${total} observações/recomendações do Comitê CERD. `;
  
  if (status.retrocessos > 0) {
    arg += `ALERTA: ${status.retrocessos} área(s) registram retrocesso. `;
  }
  
  arg += `Grau de cumprimento: ${percentual}% (${status.cumpridas} cumpridas, ${status.parciais} parciais, ${status.naoCumpridas} não cumpridas). `;
  
  if (grupos.length > 0) {
    arg += `\n\nGrupos afetados: ${grupos.join(', ')}. `;
  }
  
  if (acoes.length > 0) {
    arg += `\n\nO Brasil implementou ${acoes.length} ação(ões), entre elas: ${acoes.slice(0, 3).join('; ')}. `;
  }
  
  if (evidencias.length > 0) {
    const taxaCumprimento = status.cumpridas + status.parciais;
    const taxaProblematica = status.naoCumpridas + status.retrocessos;
    if (taxaCumprimento > taxaProblematica) {
      arg += `\n\nAs evidências coletadas (${evidencias.length} registros) indicam avanços parciais, embora lacunas significativas permaneçam em aberto.`;
    } else if (status.retrocessos > 0) {
      arg += `\n\nAs evidências coletadas (${evidencias.length} registros) revelam retrocessos que exigem atenção emergencial no IV Relatório.`;
    } else {
      arg += `\n\nAs evidências coletadas (${evidencias.length} registros) revelam que a maioria das recomendações permanece sem cumprimento adequado.`;
    }
  }
  
  return arg;
}

function formatBRL(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} bi`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mi`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} mil`;
  return value.toFixed(0);
}
