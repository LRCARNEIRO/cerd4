/**
 * Hook: useMirrorData
 * 
 * Fornece TODOS os dados espelhados do banco de dados (indicadores_interseccionais)
 * com fallback automático para arquivos hardcoded.
 * 
 * Padrão SSoT Etapas 1-4 — Todas as abas temáticas + Common Core + Adm Pública + COVID + Grupos Focais.
 */

import { useMemo } from 'react';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import {
  dadosDemograficos as hcDemograficos,
  evolucaoComposicaoRacial as hcEvolucao,
  segurancaPublica as hcSeguranca,
  feminicidioSerie as hcFeminicidio,
  atlasViolencia2025 as hcAtlas,
  jovensNegrosViolencia as hcJovensViolencia,
  educacaoSerieHistorica as hcEducacao,
  analfabetismoGeral2024 as hcAnalfabetismo,
  evasaoEscolarSerie as hcEvasao,
  saudeSerieHistorica as hcSaude,
  saudeMaternaRaca as hcSaudeMaterna,
  deficitHabitacionalSerie as hcDeficit,
  cadUnicoPerfilRacial as hcCadUnico,
  interseccionalidadeTrabalho as hcIntersecTrabalho,
  trabalhoRacaGenero as hcTrabalhoRG,
  educacaoRacaGenero as hcEducacaoRG,
  chefiaFamiliarRacaGenero as hcChefia,
  deficienciaPorRaca as hcDeficiencia,
  disparidadesPcd1459 as hcDisparidades,
  serieAntraTrans as hcAntra,
  lgbtqiaPorRaca as hcLgbtqia,
  violenciaInterseccional as hcViolencia,
  juventudeNegra as hcJuventude,
  classePorRaca as hcClasse,
  evolucaoDesigualdade as hcEvolDesig,
  rendimentosCenso2022 as hcRendimentos,
  povosTradicionais as hcPovos,
  indicadoresSocioeconomicos as hcSocioeco,
  resumoExecutivo as hcResumoExecutivo,
} from '@/components/estatisticas/StatisticsData';

import type { CommonCoreTable } from '@/components/estatisticas/CommonCoreTab';

/** Reconstruct array from mirror's { series: { year: {...} } } format */
function rebuildSeries(dados: any, fallback: any[]): any[] {
  if (!dados?.series || typeof dados.series !== 'object') return fallback;
  return Object.entries(dados.series)
    .map(([ano, vals]: [string, any]) => ({ ano: Number(ano), ...vals }))
    .sort((a, b) => a.ano - b.ano);
}

export type MirrorSource = 'bd' | 'hardcoded';

export function useMirrorData() {
  const { data: indicadores, isLoading, error } = useIndicadoresInterseccionais();

  const result = useMemo(() => {
    const mirrors = (indicadores || []).filter(
      (i: any) => (i.documento_origem || []).includes('espelho_estatico')
    );

    function findMirror(cat: string, sub: string) {
      return mirrors.find((i: any) => i.categoria === cat && i.subcategoria === sub);
    }

    function findAllByCategory(cat: string) {
      return mirrors.filter((i: any) => i.categoria === cat);
    }

    function resolveArray(cat: string, sub: string, fallback: any[]): { data: any[]; source: MirrorSource; paragrafos: string | null } {
      const rec = findMirror(cat, sub);
      if (rec) {
        const rebuilt = rebuildSeries(rec.dados as any, fallback);
        if (rebuilt.length > 0 && rebuilt !== fallback) {
          return { data: rebuilt, source: 'bd', paragrafos: (rec.dados as any)?.paragrafos_cerd || null };
        }
      }
      return { data: fallback, source: 'hardcoded', paragrafos: null };
    }

    function resolveObject(cat: string, sub: string, fallback: any): { data: any; source: MirrorSource; paragrafos: string | null } {
      const rec = findMirror(cat, sub);
      if (rec) {
        const d = rec.dados as any;
        return { 
          data: { ...fallback, ...d }, 
          source: 'bd', 
          paragrafos: d?.paragrafos_cerd || null 
        };
      }
      return { data: fallback, source: 'hardcoded', paragrafos: null };
    }

    function resolveRegistros(cat: string, sub: string, fallback: any[]): { data: any[]; source: MirrorSource; paragrafos: string | null } {
      const rec = findMirror(cat, sub);
      if (rec) {
        const d = rec.dados as any;
        if (d?.registros && Array.isArray(d.registros)) {
          return { data: d.registros, source: 'bd', paragrafos: d?.paragrafos_cerd || null };
        }
      }
      return { data: fallback, source: 'hardcoded', paragrafos: null };
    }

    // ── DEMOGRAFIA ──
    const composicaoRec = findMirror('demografia', 'composicao_racial');
    const dadosDemograficos = composicaoRec 
      ? { ...hcDemograficos, ...(composicaoRec.dados as any), composicaoRacial: (composicaoRec.dados as any).composicao ?? hcDemograficos.composicaoRacial }
      : hcDemograficos;
    const fonteDemografia: MirrorSource = composicaoRec ? 'bd' : 'hardcoded';

    const evolucao = resolveArray('demografia', 'evolucao_racial', hcEvolucao);

    // ── SEGURANÇA ──
    const seguranca = resolveArray('seguranca_publica', 'homicidio_raca', hcSeguranca);
    const feminicidio = resolveArray('seguranca_publica', 'feminicidio', hcFeminicidio);
    const atlas = resolveObject('seguranca_publica', 'atlas_violencia', hcAtlas);
    const jovensViolencia = resolveObject('seguranca_publica', 'juventude_violencia', hcJovensViolencia);
    const violenciaInters = resolveRegistros('seguranca_publica', 'violencia_interseccional', hcViolencia);
    const juventude = resolveRegistros('seguranca_publica', 'juventude_comparativo', hcJuventude);

    // ── EDUCAÇÃO ──
    const educacao = resolveArray('educacao', 'serie_historica', hcEducacao);
    const analfabetismo = resolveObject('educacao', 'analfabetismo', hcAnalfabetismo);
    const evasao = resolveArray('educacao', 'evasao_escolar', hcEvasao);

    // ── SAÚDE ──
    const saude = resolveArray('saude', 'serie_historica', hcSaude);
    const saudeMaterna = resolveObject('saude', 'saude_materna', hcSaudeMaterna);

    // ── HABITAÇÃO ──
    const deficit = resolveArray('habitacao', 'deficit_racial', hcDeficit);
    const cadUnico = resolveArray('trabalho_renda', 'cadunico_racial', hcCadUnico);

    // ── RAÇA × GÊNERO ──
    const intersecTrabalho = resolveRegistros('genero_raca', 'trabalho_interseccional', hcIntersecTrabalho);
    const trabalhoRG = resolveRegistros('genero_raca', 'trabalho_raca_genero', hcTrabalhoRG);
    const educacaoRG = resolveRegistros('genero_raca', 'educacao_raca_genero', hcEducacaoRG);
    const chefia = resolveObject('genero_raca', 'chefia_familiar', hcChefia);

    // ── DEFICIÊNCIA ──
    const deficiencia = resolveRegistros('deficiencia', 'prevalencia_raca', hcDeficiencia);
    const disparidades = resolveRegistros('deficiencia', 'disparidades_1459', hcDisparidades);

    // ── LGBTQIA+ ──
    const antra = resolveArray('lgbtqia', 'antra_trans', hcAntra);
    const lgbtqia = resolveRegistros('lgbtqia', 'vitimas_raca', hcLgbtqia);

    // ── CLASSE ──
    const classe = resolveRegistros('trabalho_renda', 'classe_raca', hcClasse);
    const rendimentos = resolveObject('trabalho_renda', 'rendimentos_censo', hcRendimentos);

    // ── EVOLUÇÃO DESIGUALDADE ──
    const evolDesig = resolveArray('trabalho_renda', 'evolucao_desigualdade', hcEvolDesig);

    // ── SOCIOECONÔMICO ──
    const socioeco = resolveArray('trabalho_renda', 'socioeconomico', hcSocioeco);

    // ── POVOS TRADICIONAIS (resolve from BD mirrors, fallback to hardcoded) ──
    const ptMirrors = findAllByCategory('povos_tradicionais');
    const ptSource: MirrorSource = ptMirrors.length > 0 ? 'bd' : 'hardcoded';
    
    // Reconstruct povosTradicionais object from BD if available
    const ptIndigenas = findMirror('povos_tradicionais', 'indigenas_censo');
    const ptQuilombolas = findMirror('povos_tradicionais', 'quilombolas_censo');
    const ptPopNegra = findMirror('povos_tradicionais', 'pop_negra_infra');
    const ptCiganos = findMirror('povos_tradicionais', 'ciganos');
    
    const resolvedPovosTradicionais = ptMirrors.length > 0 ? {
      indigenas: ptIndigenas ? { ...hcPovos.indigenas, ...(ptIndigenas.dados as any) } : hcPovos.indigenas,
      quilombolas: ptQuilombolas ? { ...hcPovos.quilombolas, ...(ptQuilombolas.dados as any) } : hcPovos.quilombolas,
      populacaoNegra: ptPopNegra ? {
        infraestrutura: (ptPopNegra.dados as any)?.negros || hcPovos.populacaoNegra.infraestrutura,
        infraestruturaBrancos: (ptPopNegra.dados as any)?.brancos || hcPovos.populacaoNegra.infraestruturaBrancos,
        mediaNacional: (ptPopNegra.dados as any)?.mediaNacional || hcPovos.populacaoNegra.mediaNacional,
      } : hcPovos.populacaoNegra,
      ciganos: ptCiganos ? { ...hcPovos.ciganos, ...(ptCiganos.dados as any) } : hcPovos.ciganos,
    } : hcPovos;

    // Terras quilombolas histórico
    const terrasQuiloHistorico = findMirror('povos_tradicionais', 'terras_quilombolas_historico');
    const terrasQuilombolasHistorico = terrasQuiloHistorico
      ? rebuildSeries(terrasQuiloHistorico.dados as any, [])
      : [];
    const fonteTerrasQuilombolas: MirrorSource = terrasQuiloHistorico ? 'bd' : 'hardcoded';
    // ══════════════════════════════════
    // STAGE 3 — Common Core
    // ══════════════════════════════════
    const ccMirrors = findAllByCategory('common_core');
    const ccSource: MirrorSource = ccMirrors.length > 0 ? 'bd' : 'hardcoded';
    const ccCount = ccMirrors.length;

    // Reconstruct CommonCoreTable[] from BD mirrors (when available)
    const ccTablesFromBD: CommonCoreTable[] = ccMirrors.map((rec: any) => {
      const d = rec.dados as any;
      return {
        id: d.id_cc || rec.id,
        numero: d.numero || 0,
        titulo: rec.nome.replace(/^\[CC-\d+\]\s*/, ''),
        tituloIngles: d.tituloIngles || '',
        categoria: d.categoria || rec.subcategoria || '',
        descricao: rec.nome,
        fonte: rec.fonte,
        fonteCompleta: rec.fonte,
        urlFonte: rec.url_fonte || undefined,
        tabelaSidra: d.tabelaSidra || undefined,
        periodoOriginal: d.periodoOriginal || '',
        periodoAtualizado: d.periodoAtualizado || '',
        statusAtualizacao: d.statusAtualizacao || 'atualizado',
        dados: {
          headers: d.headers || [],
          rows: d.rows || [],
        },
        notas: d.notas || undefined,
        tendencia: d.tendencia || undefined,
      } as CommonCoreTable;
    });

    // ══════════════════════════════════
    // STAGE 3 — Adm Pública
    // ══════════════════════════════════
    const admMirrors = findAllByCategory('adm_publica');
    const admSource: MirrorSource = admMirrors.length > 0 ? 'bd' : 'hardcoded';

    const estadicEstrutura = findMirror('adm_publica', 'estadic_estrutura');
    const estadicGestores = findMirror('adm_publica', 'estadic_gestores');
    const sinapirMirror = findMirror('adm_publica', 'sinapir');

    // ══════════════════════════════════
    // STAGE 3 — COVID Racial
    // ══════════════════════════════════
    const covidMirrors = findAllByCategory('covid_racial');
    const covidSource: MirrorSource = covidMirrors.length > 0 ? 'bd' : 'hardcoded';
    const covidCount = covidMirrors.length;

    // ══════════════════════════════════
    // STAGE 3 — Grupos Focais
    // ══════════════════════════════════
    const gfMirrors = findAllByCategory('grupos_focais');
    const gfSource: MirrorSource = gfMirrors.length > 0 ? 'bd' : 'hardcoded';
    const gfCount = gfMirrors.length;

    // Count sources
    const allSources = [
      fonteDemografia, evolucao.source, seguranca.source, feminicidio.source,
      atlas.source, jovensViolencia.source, violenciaInters.source, juventude.source,
      educacao.source, analfabetismo.source, evasao.source, saude.source,
      saudeMaterna.source, deficit.source, cadUnico.source, intersecTrabalho.source,
      trabalhoRG.source, educacaoRG.source, chefia.source, deficiencia.source,
      disparidades.source, antra.source, lgbtqia.source, classe.source,
      rendimentos.source, evolDesig.source, socioeco.source, ptSource,
      ccSource, admSource, covidSource, gfSource,
    ];
    const bdCount = allSources.filter(s => s === 'bd').length;
    const totalCount = allSources.length;

    return {
      // Demografia
      dadosDemograficos, fonteDemografia,
      evolucaoComposicaoRacial: evolucao.data, fonteEvolucao: evolucao.source,
      // Segurança
      segurancaPublica: seguranca.data, fonteSeguranca: seguranca.source, paragrafosSeguranca: seguranca.paragrafos,
      feminicidioSerie: feminicidio.data, fonteFeminicidio: feminicidio.source,
      atlasViolencia2025: atlas.data, fonteAtlas: atlas.source,
      jovensNegrosViolencia: jovensViolencia.data, fonteJovensViolencia: jovensViolencia.source,
      violenciaInterseccional: violenciaInters.data, fonteViolenciaInterseccional: violenciaInters.source,
      juventudeNegra: juventude.data, fonteJuventude: juventude.source,
      // Educação
      educacaoSerieHistorica: educacao.data, fonteEducacao: educacao.source, paragrafosEducacao: educacao.paragrafos,
      analfabetismoGeral2024: analfabetismo.data, fonteAnalfabetismo: analfabetismo.source,
      evasaoEscolarSerie: evasao.data, fonteEvasao: evasao.source,
      // Saúde
      saudeSerieHistorica: saude.data, fonteSaude: saude.source, paragrafosSaude: saude.paragrafos,
      saudeMaternaRaca: saudeMaterna.data, fonteSaudeMaterna: saudeMaterna.source,
      // Habitação
      deficitHabitacionalSerie: deficit.data, fonteDeficit: deficit.source,
      cadUnicoPerfilRacial: cadUnico.data, fonteCadUnico: cadUnico.source,
      // Raça × Gênero
      interseccionalidadeTrabalho: intersecTrabalho.data, fonteIntersecTrabalho: intersecTrabalho.source,
      trabalhoRacaGenero: trabalhoRG.data, fonteTrabalhoRG: trabalhoRG.source,
      educacaoRacaGenero: educacaoRG.data, fonteEducacaoRG: educacaoRG.source,
      chefiaFamiliarRacaGenero: chefia.data, fonteChefia: chefia.source,
      // Deficiência
      deficienciaPorRaca: deficiencia.data, fonteDeficiencia: deficiencia.source,
      disparidadesPcd1459: disparidades.data, fonteDisparidades: disparidades.source,
      // LGBTQIA+
      serieAntraTrans: antra.data, fonteAntra: antra.source,
      lgbtqiaPorRaca: lgbtqia.data, fonteLgbtqia: lgbtqia.source,
      // Classe
      classePorRaca: classe.data, fonteClasse: classe.source,
      rendimentosCenso2022: rendimentos.data, fonteRendimentos: rendimentos.source,
      // Desigualdade
      evolucaoDesigualdade: evolDesig.data, fonteEvolDesig: evolDesig.source,
      // Socioeconômico
      indicadoresSocioeconomicos: socioeco.data, fonteSocioeco: socioeco.source,
      // Povos Tradicionais
      povosTradicionais: hcPovos, fontePovos: ptSource,
      // Resumo Executivo (passthrough)
      resumoExecutivo: hcResumoExecutivo,

      // ── STAGE 3 ──
      // Common Core
      ccTablesFromBD,
      ccSource,
      ccCount,
      // Adm Pública
      admSource,
      estadicEstruturaData: estadicEstrutura ? (estadicEstrutura.dados as any) : null,
      estadicGestoresData: estadicGestores ? (estadicGestores.dados as any) : null,
      sinapirData: sinapirMirror ? (sinapirMirror.dados as any) : null,
      // COVID Racial
      covidSource,
      covidCount,
      covidMirrors: covidMirrors.map((r: any) => ({
        subcategoria: r.subcategoria,
        dados: r.dados,
        nome: r.nome,
      })),
      // Grupos Focais
      gfSource,
      gfCount,
      gfMirrors: gfMirrors.map((r: any) => ({
        subcategoria: r.subcategoria,
        dados: r.dados,
        nome: r.nome,
      })),

      // Meta
      bdCount,
      totalCount,
      usandoBD: bdCount > 0,
    };
  }, [indicadores]);

  return { ...result, isLoading, error };
}
