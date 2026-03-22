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
          populacao: pt.indigenas.populacaoPessoasIndigenas ?? gruposFocaisDataDefaults.indigenas.populacao,
          populacaoCorRaca: pt.indigenas.populacaoCorRaca ?? gruposFocaisDataDefaults.indigenas.populacaoCorRaca,
          etnias: pt.indigenas.etnias ?? gruposFocaisDataDefaults.indigenas.etnias,
          linguas: pt.indigenas.linguas ?? gruposFocaisDataDefaults.indigenas.linguas,
        } : {}),
      },
      ciganos: {
        ...gruposFocaisDataDefaults.ciganos,
        ...(ptSource === 'bd' && pt?.ciganos ? {
          populacao: pt.ciganos.populacaoEstimada ?? gruposFocaisDataDefaults.ciganos.populacao,
        } : {}),
      },
      juventude_negra: {
        ...gruposFocaisDataDefaults.juventude_negra,
        ...(mirror.gfSource === 'bd' && Array.isArray(mirror.gfMirrors)
          ? (() => {
              const rec = mirror.gfMirrors.find((item: any) => item.subcategoria === 'juventude_negra');
              return rec?.dados
                ? {
                    populacao: rec.dados.populacao ?? gruposFocaisDataDefaults.juventude_negra.populacao,
                    serieTemporal: rec.dados.serieTemporal ?? gruposFocaisDataDefaults.juventude_negra.serieTemporal,
                  }
                : {};
            })()
          : {}),
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
          titulosExpedidos: pt.quilombolas.titulosExpedidos ?? dadosTerritoriaisDefaults.quilombolas.titulosExpedidos,
          comunidadesCertificadasFCP: pt.quilombolas.comunidadesCertificadas ?? dadosTerritoriaisDefaults.quilombolas.comunidadesCertificadasFCP,
          territoriosEmProcesso: pt.quilombolas.processosAbertosIncra ?? dadosTerritoriaisDefaults.quilombolas.territoriosEmProcesso,
          areaTotal: pt.quilombolas.areaHectaresTitulados ?? dadosTerritoriaisDefaults.quilombolas.areaTotal,
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
          percentualVitimasNegras: latestSeg.percentualVitimasNegras ?? indicadoresVulnerabilidadeDefaults.homicidiosPorRaca.percentualVitimasNegras,
          percentualVitimasBrancas: latestSeg.percentualVitimasNegras != null
            ? +(100 - latestSeg.percentualVitimasNegras).toFixed(1)
            : indicadoresVulnerabilidadeDefaults.homicidiosPorRaca.percentualVitimasBrancas,
          ano: latestSeg.ano ?? indicadoresVulnerabilidadeDefaults.homicidiosPorRaca.ano,
        } : {}),
        ...(serieHomicidiosMirror ? { serieTemporal: serieHomicidiosMirror } : {}),
      },
      taxaHomicidio100mil: {
        ...indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil,
        ...(mirror.fonteAtlas === 'bd' && atlas ? {
          taxaNegros: atlas.taxaHomicidioNegros ?? indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil.taxaNegros,
          taxaNaoNegros: atlas.taxaHomicidioNaoNegros ?? indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil.taxaNaoNegros,
          razaoRisco: atlas.riscoRelativo ?? indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil.razaoRisco,
          razaoRisco2018: atlas.riscoRelativo2018 ?? indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil.razaoRisco2018,
          quedaNegros2018_2023: atlas.quedaNegros2018_2023 ?? indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil.quedaNegros2018_2023,
          quedaNaoNegros2018_2023: atlas.quedaNaoNegros2018_2023 ?? indicadoresVulnerabilidadeDefaults.taxaHomicidio100mil.quedaNaoNegros2018_2023,
        } : {}),
      },
      violenciaJuventude: {
        ...indicadoresVulnerabilidadeDefaults.violenciaJuventude,
        ...(mirror.fonteAtlas === 'bd' && atlas?.juventude15_29 ? {
          percentualVitimas: atlas.juventude15_29.percentualVitimas ?? indicadoresVulnerabilidadeDefaults.violenciaJuventude.percentualVitimas,
        } : {}),
        // Feminicídio from mirror
        ...(mirror.fonteFeminicidio === 'bd' && feminicidio.length > 0 ? {
          feminicidioNegras: feminicidio[feminicidio.length - 1]?.percentualNegras ?? indicadoresVulnerabilidadeDefaults.violenciaJuventude.feminicidioNegras,
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
