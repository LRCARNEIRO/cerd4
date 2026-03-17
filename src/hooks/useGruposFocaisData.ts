/**
 * Hook: useGruposFocaisData
 * 
 * Fornece dados dinâmicos para a aba Grupos Focais, mesclando
 * dados do BD (via useMirrorData) sobre os defaults hardcoded.
 * 
 * SSoT: se o BD tiver dados para um campo, ele prevalece; caso contrário, usa o fallback.
 */

import { useMemo } from 'react';
import { useMirrorData, type MirrorSource } from '@/hooks/useMirrorData';
import {
  gruposFocaisDataDefaults,
  dadosTerritoriaisDefaults,
  indicadoresVulnerabilidadeDefaults,
} from '@/data/gruposFocaisDefaults';

export function useGruposFocaisData() {
  const mirror = useMirrorData();

  const result = useMemo(() => {
    // ══════════════════════════════════
    // 1) gruposFocaisData — overlay com povosTradicionais + dadosDemograficos
    // ══════════════════════════════════
    const pt = mirror.povosTradicionais;
    const ptSource = mirror.fontePovos;

    const gruposFocaisData = {
      ...gruposFocaisDataDefaults,
      quilombolas: {
        ...gruposFocaisDataDefaults.quilombolas,
        ...(ptSource === 'bd' && pt?.quilombolas ? {
          populacao: pt.quilombolas.populacao ?? gruposFocaisDataDefaults.quilombolas.populacao,
        } : {}),
      },
      indigenas: {
        ...gruposFocaisDataDefaults.indigenas,
        ...(ptSource === 'bd' && pt?.indigenas ? {
          populacao: pt.indigenas.populacao ?? gruposFocaisDataDefaults.indigenas.populacao,
          etniasReconhecidas: pt.indigenas.etniasReconhecidas ?? undefined,
          linguasVivas: pt.indigenas.linguasVivas ?? undefined,
        } : {}),
      },
      ciganos: {
        ...gruposFocaisDataDefaults.ciganos,
        ...(ptSource === 'bd' && pt?.ciganos ? {
          populacao: pt.ciganos.populacao ?? gruposFocaisDataDefaults.ciganos.populacao,
        } : {}),
      },
      populacao_negra: {
        ...gruposFocaisDataDefaults.populacao_negra,
        ...(mirror.fonteDemografia === 'bd' ? {
          populacao: mirror.dadosDemograficos?.populacaoNegra ?? gruposFocaisDataDefaults.populacao_negra.populacao,
        } : {}),
      },
    };

    // ══════════════════════════════════
    // 2) dadosTerritoriais — overlay com povosTradicionais + terrasQuilombolasHistorico
    // ══════════════════════════════════
    const dadosTerritoriais = {
      ...dadosTerritoriaisDefaults,
      quilombolas: {
        ...dadosTerritoriaisDefaults.quilombolas,
        ...(ptSource === 'bd' && pt?.quilombolas ? {
          territoriosTitulados: pt.quilombolas.territoriosTitulados ?? dadosTerritoriaisDefaults.quilombolas.territoriosTitulados,
          comunidadesCertificadasFCP: pt.quilombolas.comunidadesCertificadasFCP ?? dadosTerritoriaisDefaults.quilombolas.comunidadesCertificadasFCP,
          territoriosEmProcesso: pt.quilombolas.territoriosEmProcesso ?? dadosTerritoriaisDefaults.quilombolas.territoriosEmProcesso,
          areaTotal: pt.quilombolas.areaHa ?? dadosTerritoriaisDefaults.quilombolas.areaTotal,
        } : {}),
        // Série histórica from BD mirror
        ...(mirror.fonteTerrasQuilombolas === 'bd' && mirror.terrasQuilombolasHistorico.length > 0 ? {
          serieHistorica: mirror.terrasQuilombolasHistorico,
        } : {}),
      },
      indigenas: {
        ...dadosTerritoriaisDefaults.indigenas,
        ...(ptSource === 'bd' && pt?.indigenas ? {
          terrasTotal: pt.indigenas.terrasTotal ?? dadosTerritoriaisDefaults.indigenas.terrasTotal,
          terrasHomologadas: pt.indigenas.terrasHomologadas ?? dadosTerritoriaisDefaults.indigenas.terrasHomologadas,
          terrasEmEstudo: pt.indigenas.terrasEmEstudo ?? dadosTerritoriaisDefaults.indigenas.terrasEmEstudo,
          etniasIdentificadas: pt.indigenas.etniasReconhecidas ?? dadosTerritoriaisDefaults.indigenas.etniasIdentificadas,
          linguasVivas: pt.indigenas.linguasVivas ?? dadosTerritoriaisDefaults.indigenas.linguasVivas,
          areaTotal: pt.indigenas.areaTotalHa ? pt.indigenas.areaTotalHa * 10000 : dadosTerritoriaisDefaults.indigenas.areaTotal,
        } : {}),
      },
    };

    // ══════════════════════════════════
    // 3) indicadoresVulnerabilidade — overlay com segurança, saúde, atlas
    // ══════════════════════════════════
    const segSerie = mirror.segurancaPublica;
    const atlas = mirror.atlasViolencia2025;
    const saudeMaterna = mirror.saudeMaternaRaca;
    const feminicidio = mirror.feminicidioSerie;

    // Get latest year from segurança for homicídios %
    const latestSeg = segSerie.length > 0 ? segSerie[segSerie.length - 1] : null;
    
    // Build série temporal from mirror segurancaPublica
    const serieHomicidiosMirror = segSerie.length > 0
      ? segSerie.map((s: any) => ({
          ano: s.ano,
          negros: s.vitimasNegras ?? s.negros ?? 0,
          brancos: s.vitimasBrancas ?? s.brancos ?? 0,
        }))
      : undefined;

    const indicadoresVulnerabilidade = {
      ...indicadoresVulnerabilidadeDefaults,
      homicidiosPorRaca: {
        ...indicadoresVulnerabilidadeDefaults.homicidiosPorRaca,
        ...(mirror.fonteSeguranca === 'bd' && latestSeg ? {
          percentualVitimasNegras: latestSeg.vitimasNegras ?? latestSeg.negros ?? indicadoresVulnerabilidadeDefaults.homicidiosPorRaca.percentualVitimasNegras,
          percentualVitimasBrancas: latestSeg.vitimasBrancas ?? latestSeg.brancos ?? indicadoresVulnerabilidadeDefaults.homicidiosPorRaca.percentualVitimasBrancas,
          ano: latestSeg.ano ?? indicadoresVulnerabilidadeDefaults.homicidiosPorRaca.ano,
        } : {}),
        ...(serieHomicidiosMirror ? { serieTemporal: serieHomicidiosMirror } : {}),
      },
      taxaHomicidio100mil: {
        ...indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil,
        ...(mirror.fonteAtlas === 'bd' && atlas ? {
          taxaNegros: atlas.taxaNegros ?? indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil.taxaNegros,
          taxaNaoNegros: atlas.taxaNaoNegros ?? indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil.taxaNaoNegros,
          razaoRisco: atlas.razaoRisco ?? indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil.razaoRisco,
        } : {}),
      },
      violenciaJuventude: {
        ...indicadoresVulnerabilidadeDefaults.violenciaJuventude,
        ...(mirror.fonteJovensViolencia === 'bd' ? {
          percentualVitimas: mirror.jovensNegrosViolencia?.percentualVitimas ?? indicadoresVulnerabilidadeDefaults.violenciaJuventude.percentualVitimas,
        } : {}),
        // Feminicídio from mirror
        ...(mirror.fonteFeminicidio === 'bd' && feminicidio.length > 0 ? {
          feminicidioNegras: feminicidio[feminicidio.length - 1]?.percentualNegras ?? indicadoresVulnerabilidadeDefaults.violenciaJuventude.feminicidioNegras,
        } : {}),
      },
      mortalidadeMaterna: {
        ...indicadoresVulnerabilidadeDefaults.mortalidadeMaterna,
        ...(mirror.fonteSaudeMaterna === 'bd' && saudeMaterna ? {
          valorNegras: saudeMaterna.negras ?? indicadoresVulnerabilidadeDefaults.mortalidadeMaterna.valorNegras,
          valorBrancas: saudeMaterna.brancas ?? indicadoresVulnerabilidadeDefaults.mortalidadeMaterna.valorBrancas,
          razaoDesigualdade: saudeMaterna.razao ?? indicadoresVulnerabilidadeDefaults.mortalidadeMaterna.razaoDesigualdade,
        } : {}),
      },
    };

    // ══════════════════════════════════
    // Sources tracking
    // ══════════════════════════════════
    const sources: MirrorSource[] = [
      ptSource,
      mirror.fonteDemografia,
      mirror.fonteSeguranca,
      mirror.fonteAtlas,
      mirror.fonteSaudeMaterna,
      mirror.fonteFeminicidio,
      mirror.fonteJovensViolencia,
      mirror.fonteTerrasQuilombolas,
    ];
    const bdCount = sources.filter(s => s === 'bd').length;

    return {
      gruposFocaisData,
      dadosTerritoriais,
      indicadoresVulnerabilidade,
      // Meta
      gfSource: mirror.gfSource,
      gfCount: mirror.gfCount,
      bdOverlayCount: bdCount,
      totalOverlaySources: sources.length,
      isLoading: mirror.isLoading,
    };
  }, [mirror]);

  return result;
}
