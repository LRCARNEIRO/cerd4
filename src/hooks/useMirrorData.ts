/**
 * Hook: useMirrorData
 * 
 * Fornece TODOS os dados espelhados do banco de dados (indicadores_interseccionais)
 * com fallback automático para StatisticsData.ts (hardcoded).
 * 
 * Padrão SSoT Etapa 2 — Todas as abas temáticas.
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
} from '@/components/estatisticas/StatisticsData';

/** Reconstruct array from mirror's { series: { year: {...} } } format */
function rebuildSeries(dados: any, fallback: any[]): any[] {
  if (!dados?.series || typeof dados.series !== 'object') return fallback;
  return Object.entries(dados.series)
    .map(([ano, vals]: [string, any]) => ({ ano: Number(ano), ...vals }))
    .sort((a, b) => a.ano - b.ano);
}

type MirrorSource = 'bd' | 'hardcoded';

export function useMirrorData() {
  const { data: indicadores, isLoading, error } = useIndicadoresInterseccionais();

  const result = useMemo(() => {
    const mirrors = (indicadores || []).filter(
      (i: any) => (i.documento_origem || []).includes('espelho_estatico')
    );

    function findMirror(cat: string, sub: string) {
      return mirrors.find((i: any) => i.categoria === cat && i.subcategoria === sub);
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

    // Count sources
    const allSources = [
      fonteDemografia, evolucao.source, seguranca.source, feminicidio.source,
      atlas.source, jovensViolencia.source, violenciaInters.source, juventude.source,
      educacao.source, analfabetismo.source, evasao.source, saude.source,
      saudeMaterna.source, deficit.source, cadUnico.source, intersecTrabalho.source,
      trabalhoRG.source, educacaoRG.source, chefia.source, deficiencia.source,
      disparidades.source, antra.source, lgbtqia.source, classe.source,
      rendimentos.source, evolDesig.source,
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
      // Meta
      bdCount,
      totalCount,
      usandoBD: bdCount > 0,
    };
  }, [indicadores]);

  return { ...result, isLoading, error };
}
