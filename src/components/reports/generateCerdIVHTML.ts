/**
 * generateCerdIVHTML.ts — Gerador do Relatório Periódico CERD IV
 * 
 * Relatório analítico abrangente que consolida TODAS as bases do sistema:
 * estatística, orçamentária, normativa, recomendações, fios condutores.
 * 
 * Estrutura: narrativa fluida organizada por Artigos ICERD (I-VII),
 * entrelaçando dados, gráficos SVG inline, análises cruzadas e conclusões.
 */

import type { LacunaIdentificada, RespostaLacunaCerdIII, IndicadorInterseccional, DadoOrcamentario } from '@/hooks/useLacunasData';
import type { FioCondutor, ConclusaoDinamica, InsightCruzamento } from '@/hooks/useAnalyticalInsights';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, inferArtigosOrcamento, inferArtigosDocumentoNormativo } from '@/utils/artigosConvencao';
import { getSafeIndicadores, inferArtigosIndicador } from '@/utils/inferArtigosIndicador';
import { summarizeIndicatorEvolution } from '@/utils/articleIndicatorEvolution';
import { getExportToolbarHTML } from '@/utils/reportExportToolbar';
import { generateDynamicJustificativa } from '@/utils/generateDynamicJustificativa';
import { svgLineChart, svgBarChart, svgDonutChart, fmtBRL, fmtNum, dataCards, trend } from './cerdiv/chartUtils';
import {
  renderFullIndicatorTable, renderFullBudgetTable, renderFullNormativeTable,
  renderArticleRecommendationEvidence, renderMethodologyDiagram,
  renderNormativeTimeline, renderKeyInsights,
} from './cerdiv/articleDetailRenderers';
import {
  segurancaPublica as hcSeguranca, feminicidioSerie as hcFeminicidio,
  educacaoSerieHistorica as hcEducacao, saudeSerieHistorica as hcSaude,
  indicadoresSocioeconomicos as hcSocioEco, povosTradicionais as hcPovos,
  dadosDemograficos as hcDemograficos, evolucaoDesigualdade as hcEvolDesig,
  atlasViolencia2025 as hcAtlas, jovensNegrosViolencia as hcJovens,
  violenciaInterseccional as hcViolIntersec, juventudeNegra as hcJuventude,
  saudeMaternaRaca as hcSaudeMaterna, analfabetismoGeral2024 as hcAnalfabetismo,
  evasaoEscolarSerie as hcEvasao, educacaoRacaGenero as hcEduRG,
  interseccionalidadeTrabalho as hcTrabalhoRG, classePorRaca as hcClasse,
  cadUnicoPerfilRacial as hcCadUnico, chefiaFamiliarRacaGenero as hcChefia,
  deficitHabitacionalSerie as hcDeficit, serieAntraTrans as hcAntra,
  lgbtqiaPorRaca as hcLgbtqia, deficienciaPorRaca as hcDeficiencia,
} from '@/components/estatisticas/StatisticsData';
import {
  renderSecurityNarrative, renderHealthNarrative, renderEducationNarrative,
  renderLaborNarrative, renderTerritoryNarrative, renderLGBTandDisabilityNarrative,
  renderAllRecommendations,
} from './cerdiv/thematicNarratives';
import { renderArticleNarrative } from './cerdiv/articleNarratives';
import { renderComplementaryInfo, renderConsideracoesFinais, renderDialogoSociedadeCivil, renderDataAnnexes } from './cerdiv/complementaryInfo';

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

export interface CerdIVFullData {
  // Core
  lacunas: LacunaIdentificada[];
  respostas: RespostaLacunaCerdIII[];
  stats: any;
  indicadores: IndicadorInterseccional[];
  orcStats: any;
  orcDados?: DadoOrcamentario[];
  // Analytical
  fiosCondutores?: FioCondutor[];
  conclusoesDinamicas?: ConclusaoDinamica[];
  insightsCruzamento?: InsightCruzamento[];
  sinteseExecutiva?: any;
  // Normativa
  normativos?: any[];
  // Mirror data (SSoT)
  mirror?: {
    segurancaPublica?: any[];
    feminicidioSerie?: any[];
    educacaoSerieHistorica?: any[];
    saudeSerieHistorica?: any[];
    indicadoresSocioeconomicos?: any[];
    evolucaoDesigualdade?: any[];
    dadosDemograficos?: any;
    povosTradicionais?: any;
     atlasViolencia2025?: any;
     jovensNegrosViolencia?: any;
     saudeMaternaRaca?: any;
     analfabetismoGeral2024?: any;
    violenciaInterseccional?: any[];
     juventudeNegra?: any[];
    classePorRaca?: any[];
    deficitHabitacionalSerie?: any[];
    evasaoEscolarSerie?: any[];
     rendimentosCenso2022?: any;
     terrasQuilombolasHistorico?: any[];
     resumoExecutivo?: any;
     ccTablesFromBD?: any[];
     gfMirrors?: any[];
     covidMirrors?: any[];
     usandoBD?: boolean;
  };
}

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════

const STYLES = `
@page { size: A4; margin: 2cm; @bottom-center { content: counter(page); font-size: 9pt; color: #64748b; } }
@page :first { @bottom-center { content: none; } }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Noto Sans', 'Open Sans', 'Segoe UI', sans-serif; font-size: 10.5pt; line-height: 1.7; color: #1e293b; max-width: 21cm; margin: 0 auto; padding: 2.5cm 2cm; background: white; }
.header { text-align: center; margin-bottom: 2.5cm; padding-bottom: 1.5cm; position: relative; }
.header::after { content: ''; position: absolute; bottom: 0; left: 15%; right: 15%; height: 3px; background: linear-gradient(90deg, transparent, #1e3a5f, #c7a82b, #1e3a5f, transparent); }
.header h1 { font-family: 'Merriweather', 'Georgia', serif; font-size: 16pt; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 2px; line-height: 1.3; }
.header .subtitle { font-size: 12.5pt; margin-top: 0.5cm; color: #334155; font-weight: 400; letter-spacing: 0.5px; }
.header .date { font-size: 10.5pt; margin-top: 0.5cm; font-style: italic; color: #64748b; }
.un-logo { text-align: center; font-size: 36pt; margin-bottom: 1cm; }
.un-emblem { display: flex; align-items: center; justify-content: center; gap: 0.5cm; margin-bottom: 0.8cm; }
.un-emblem-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #94a3b8); max-width: 3cm; }
h2 { font-family: 'Merriweather', 'Georgia', serif; font-size: 13.5pt; font-weight: 700; margin-top: 1.8cm; margin-bottom: 0.6cm; color: #1e3a5f; border-bottom: 2px solid #c7a82b; padding-bottom: 0.35cm; page-break-after: avoid; letter-spacing: 0.3px; }
h3 { font-family: 'Merriweather', 'Georgia', serif; font-size: 11.5pt; font-weight: 700; margin-top: 1.2cm; margin-bottom: 0.4cm; color: #2c5282; border-left: 3px solid #c7a82b; padding-left: 0.4cm; }
h4 { font-size: 10.5pt; font-weight: 600; margin-top: 0.8cm; margin-bottom: 0.25cm; color: #334155; }
p { text-align: justify; margin-bottom: 0.45cm; text-indent: 0; orphans: 3; widows: 3; }
.section { margin-bottom: 1.5cm; page-break-inside: avoid; }
.highlight-box { background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%); padding: 0.8cm; margin: 0.6cm 0; border-left: 4px solid #1e3a5f; border-radius: 0 6px 6px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.analysis-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 0.8cm; margin: 0.6cm 0; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.advance-box { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 0.8cm; margin: 0.6cm 0; border-left: 4px solid #16a34a; border-radius: 0 6px 6px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.regress-box { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 0.8cm; margin: 0.6cm 0; border-left: 4px solid #dc2626; border-radius: 0 6px 6px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.gap-box { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); padding: 0.8cm; margin: 0.6cm 0; border-left: 4px solid #d97706; border-radius: 0 6px 6px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.budget-box { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); padding: 0.8cm; margin: 0.6cm 0; border-left: 4px solid #7c3aed; border-radius: 0 6px 6px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.normative-box { background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); padding: 0.8cm; margin: 0.6cm 0; border-left: 4px solid #0d9488; border-radius: 0 6px 6px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.paragraph-ref { font-weight: 700; color: #1e3a5f; font-family: 'Courier New', monospace; background: #e2e8f0; padding: 2px 7px; border-radius: 3px; font-size: 9.5pt; }
table { width: 100%; border-collapse: collapse; margin: 0.6cm 0; font-size: 9.5pt; page-break-inside: auto; }
th, td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
th { background: linear-gradient(180deg, #1e3a5f 0%, #2c5282 100%); color: white; font-weight: 600; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.5px; }
tr:nth-child(even) { background: #f8fafc; }
tr:hover { background: #f1f5f9; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 8.5pt; font-weight: 600; letter-spacing: 0.3px; }
.badge-success { background: #dcfce7; color: #15803d; border: 1px solid #86efac; } .badge-warning { background: #fef3c7; color: #a16207; border: 1px solid #fcd34d; } .badge-danger { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; } .badge-info { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
.data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5cm; margin: 0.6cm 0; }
.data-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.6cm; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: box-shadow 0.2s; }
.data-card-value { font-size: 18pt; font-weight: 700; color: #1e3a5f; line-height: 1.2; }
.data-card-label { font-size: 8pt; color: #64748b; margin-top: 0.2cm; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500; }
.chart-container { margin: 0.6cm 0; padding: 0.5cm; background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.chart-title { font-size: 10pt; font-weight: 600; color: #1e3a5f; margin-bottom: 0.3cm; text-align: center; }
.toc { margin: 1.5cm 0; padding: 1.2cm; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 8px; border: 1px solid #cbd5e1; }
.toc h3 { margin-top: 0; color: #1e3a5f; font-size: 13pt; border-left: none; padding-left: 0; text-align: center; margin-bottom: 0.6cm; }
.toc ul { list-style: none; padding-left: 0; columns: 1; }
.toc li { margin: 0.3cm 0; padding-left: 1.2cm; position: relative; font-size: 10pt; }
.toc li::before { content: "▸"; position: absolute; left: 0; color: #c7a82b; font-weight: 700; }
.toc li strong { color: #1e3a5f; }
ul, ol { margin-left: 1cm; margin-bottom: 0.45cm; }
li { margin-bottom: 0.2cm; }
.footer { margin-top: 2cm; padding-top: 1cm; border-top: 3px solid; border-image: linear-gradient(90deg, #1e3a5f, #c7a82b, #1e3a5f) 1; font-size: 8.5pt; text-align: center; color: #64748b; }
.fio-condutor { background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); padding: 0.8cm; margin: 0.6cm 0; border-left: 4px solid #b45309; border-radius: 0 6px 6px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.print-instructions { background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); padding: 1cm; margin-bottom: 1cm; border: 1px solid #93c5fd; border-radius: 8px; font-size: 10pt; }
@media print { .print-instructions { display: none; } body { padding: 1.5cm; } }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1cm; }
.status-cumprido { color: #15803d; font-weight: 600; } .status-parcial { color: #a16207; font-weight: 600; } .status-nao { color: #dc2626; font-weight: 600; }
.section-divider { page-break-before: always; margin-top: 0; }
.annex-header { text-align: center; margin: 1.5cm 0; padding: 1cm; background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; border-radius: 8px; }
.annex-header h2 { color: white; border: none; margin: 0; padding: 0; font-size: 14pt; }
.annex-header p { color: #cbd5e1; margin: 0.3cm 0 0; font-size: 10pt; }
`;

// ═══════════════════════════════════════════
// LABELS
// ═══════════════════════════════════════════

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça', politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública', saude: 'Saúde', educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda', terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio', participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas'
};
const grupoLabels: Record<string, string> = {
  negros: 'População Negra', indigenas: 'Povos Indígenas', quilombolas: 'Quilombolas',
  ciganos: 'Povos Ciganos', religioes_matriz_africana: 'Religiões de Matriz Africana',
  juventude_negra: 'Juventude Negra', mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+ Negros', pcd_negros: 'PcD Negros', idosos_negros: 'Idosos Negros', geral: 'Geral'
};
const statusCfg: Record<string, { label: string; badge: string }> = {
  cumprido: { label: 'Cumprido', badge: 'badge-success' },
  parcialmente_cumprido: { label: 'Parcial', badge: 'badge-warning' },
  nao_cumprido: { label: 'Não Cumprido', badge: 'badge-danger' },
  retrocesso: { label: 'Retrocesso', badge: 'badge-danger' },
  em_andamento: { label: 'Em Andamento', badge: 'badge-info' },
};

// ═══════════════════════════════════════════
// BACKWARD COMPAT WRAPPER
// ═══════════════════════════════════════════

export interface CerdIVMirrorData {
  segurancaPublica?: any[];
  feminicidioSerie?: any[];
  educacaoSerieHistorica?: any[];
  indicadoresSocioeconomicos?: any[];
  povosTradicionais?: any;
}

/** Legacy signature kept for backward compatibility */
export function generateCerdIVHTML(
  lacunas: LacunaIdentificada[],
  respostas: RespostaLacunaCerdIII[],
  stats: any,
  indicadores: IndicadorInterseccional[],
  orcStats: any,
  mirror?: CerdIVMirrorData
): string {
  return generateCerdIVFullHTML({
    lacunas, respostas, stats, indicadores, orcStats,
    mirror: mirror as any,
  });
}

// ═══════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════

export function generateCerdIVFullHTML(d: CerdIVFullData): string {
  const safeIndicadores = getSafeIndicadores(d.indicadores || []);
  const seg = d.mirror?.segurancaPublica?.length ? d.mirror.segurancaPublica : hcSeguranca;
  const fem = d.mirror?.feminicidioSerie?.length ? d.mirror.feminicidioSerie : hcFeminicidio;
  const edu = d.mirror?.educacaoSerieHistorica?.length ? d.mirror.educacaoSerieHistorica : hcEducacao;
  const sau = d.mirror?.saudeSerieHistorica?.length ? d.mirror.saudeSerieHistorica : hcSaude;
  const eco = d.mirror?.indicadoresSocioeconomicos?.length ? d.mirror.indicadoresSocioeconomicos : hcSocioEco;
  const evolDesig = d.mirror?.evolucaoDesigualdade?.length ? d.mirror.evolucaoDesigualdade : hcEvolDesig;
  const demo = d.mirror?.dadosDemograficos || hcDemograficos;
  const povos = d.mirror?.povosTradicionais || hcPovos;

  const cumpridas = d.stats?.porStatus?.cumprido || 0;
  const parciais = d.stats?.porStatus?.parcialmente_cumprido || 0;
  const naoCumpridas = d.stats?.porStatus?.nao_cumprido || 0;
  const retrocessos = d.stats?.porStatus?.retrocesso || 0;
  const emAndamento = d.stats?.porStatus?.em_andamento || 0;
  const total = d.stats?.total || 0;

  // Thematic narrative data
  const atlas = d.mirror?.atlasViolencia2025 || hcAtlas;
  const jovens = d.mirror?.jovensNegrosViolencia || hcJovens;
  const violIntersec = d.mirror?.violenciaInterseccional?.length ? d.mirror.violenciaInterseccional : hcViolIntersec;
  const juventude = d.mirror?.juventudeNegra?.length ? d.mirror.juventudeNegra : hcJuventude;
  const saudeMaterna = d.mirror?.saudeMaternaRaca || hcSaudeMaterna;
  const analfab = d.mirror?.analfabetismoGeral2024 || hcAnalfabetismo;
  const evasao = hcEvasao;
  const eduRG = hcEduRG;
  const trabalhoRG = hcTrabalhoRG;
  const classe = hcClasse;
  const cadUnico = hcCadUnico;
  const chefia = hcChefia;
  const deficit = d.mirror?.deficitHabitacionalSerie?.length ? d.mirror.deficitHabitacionalSerie : hcDeficit;
  const antra = hcAntra;
  const lgbtqia = hcLgbtqia;
  const defic = hcDeficiencia;

  // Build thematic narratives map for embedding in articles
  const thematicNarratives: Record<string, string> = {
    security: renderSecurityNarrative(seg, fem, atlas, jovens, violIntersec, juventude),
    health: renderHealthNarrative(sau, saudeMaterna),
    education: renderEducationNarrative(edu, evasao, analfab, eduRG),
    labor: renderLaborNarrative(eco, classe, trabalhoRG, cadUnico, chefia),
    territory: renderTerritoryNarrative(povos, deficit),
    lgbtDisability: renderLGBTandDisabilityNarrative(antra, lgbtqia, defic),
  };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CERD/C/BRA/21-23 - Relatório Periódico Combinado</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${STYLES}</style>
</head>
<body>
  <div class="print-instructions">
    <strong>📄 Para salvar como PDF:</strong> Ctrl+P → "Salvar como PDF". <strong>📝 DOCX:</strong> Use o botão DOCX na interface do sistema.
  </div>

  ${renderCover(d, total, cumpridas, parciais, naoCumpridas, retrocessos, emAndamento)}
  ${renderTOC()}
  ${renderSiglas()}
  ${renderIntroduction(d, demo, total, cumpridas, parciais, naoCumpridas, retrocessos)}
  ${renderArticleAnalysisExpanded({ ...d, indicadores: safeIndicadores }, seg, fem, edu, sau, eco, evolDesig, povos, thematicNarratives)}
  ${renderComplementaryInfo()}
  ${renderDialogoSociedadeCivil()}
  ${renderConsideracoesFinais(total, cumpridas, parciais, naoCumpridas, retrocessos, d.normativos?.length || 0, safeIndicadores.length, d.orcStats?.variacaoPago || 0)}
  ${renderDataAnnexes(demo, seg, fem, eco, sau, edu, safeIndicadores)}

  ${renderAnalyticalAnnexCover(d, total, safeIndicadores.length)}
  ${renderAnalyticalMethodology(d, safeIndicadores.length)}
  ${renderCrossReferenceTable(d.lacunas, safeIndicadores, d.orcDados || [], d.normativos || [])}
  ${renderRecommendationsSummary(d.lacunas)}
  ${renderBudgetAnalysis(d.orcStats, d.orcDados || [])}
  ${renderNormativeBase(d.normativos || [])}
  ${renderGuidingThreads(d.fiosCondutores || [], d.conclusoesDinamicas || [], d.insightsCruzamento || [])}
  ${renderAnalyticalSynthesis()}

  <div class="footer">
    <p>CERD/C/BRA/21-23 — Relatórios Periódicos Combinados do Brasil (21º a 23º)</p>
    <p>Elaborado pelo Grupo de Pesquisa CDG/UFF em parceria com MIR e MRE</p>
    <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} — Dados de fontes oficiais (IBGE, DataSUS, FBSP, SIOP, CNJ)</p>
  </div>
  ${getExportToolbarHTML('CERD-IV-Relatorio-Periodico-Brasil')}
</body>
</html>`;
}

// ═══════════════════════════════════════════
// SECTION RENDERERS
// ═══════════════════════════════════════════

function renderCover(d: CerdIVFullData, total: number, cumpridas: number, parciais: number, naoCumpridas: number, retrocessos: number, emAndamento: number): string {
  const safeIndicadores = getSafeIndicadores(d.indicadores || []);
  return `
  <div class="header">
    <div class="un-logo">🇺🇳</div>
    <h1>Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial</h1>
    <div class="subtitle">CERD/C/BRA/21-23</div>
    <div class="subtitle">Relatórios periódicos combinados (21º a 23º) do Brasil</div>
    <div class="date">Período de cobertura: 2018-2025</div>
  </div>
  ${dataCards([
    { value: `${total}`, label: 'Recomendações Analisadas' },
    { value: `${cumpridas}`, label: 'Cumpridas', color: '#22c55e' },
    { value: `${parciais}`, label: 'Parciais', color: '#eab308' },
    { value: `${naoCumpridas + retrocessos}`, label: 'Não Cumpridas/Retrocesso', color: '#ef4444' },
    { value: `${emAndamento}`, label: 'Em Andamento', color: '#3b82f6' },
      { value: `${safeIndicadores.length}`, label: 'Indicadores Estatísticos' },
  ])}`;
}

function renderTOC(): string {
  return `
  <div class="toc">
    <h3>Sumário</h3>
    <ul>
      <li>Lista de Siglas</li>
      <li><strong>I.</strong> Introdução (§1–§4)</li>
      <li><strong>II.</strong> Artigos I–VII da Convenção (§5–§74c)</li>
      <li><strong>III.</strong> Informações Complementares — Guideline CERD/C/2007/1 (§75–§81)</li>
      <li><strong>IV.</strong> Diálogo com a Sociedade Civil: Relatório Sombra (§86–§90)</li>
      <li><strong>V.</strong> Considerações Finais (§82–§85)</li>
      <li><strong>Anexos — Dados Consolidados</strong> (A.1–A.7)</li>
      <li style="margin-top:0.3cm;border-top:1px solid #e2e8f0;padding-top:0.3cm"><strong>ANEXO ANALÍTICO — PLATAFORMA CERD4</strong></li>
      <li><strong>I.</strong> Metodologia do Sistema CERD4</li>
      <li><strong>II.</strong> Cruzamento: Recomendações × Artigos × Evidências</li>
      <li><strong>III.</strong> Quadro Detalhado: Recomendações × Evidências</li>
      <li><strong>IV.</strong> Base Estatística — Evolução dos Indicadores por Artigo</li>
      <li><strong>V.</strong> Base Orçamentária — Investimento em Igualdade Racial</li>
      <li><strong>VI.</strong> Base Normativa — Linha do Tempo 2018–2025</li>
      <li><strong>VII.</strong> Fios Condutores Analíticos e Síntese Cruzada</li>
      <li><strong>VIII.</strong> Síntese Avaliativa por Dimensão (2018–2025)</li>
    </ul>
  </div>`;
}

function renderSiglas(): string {
  const siglas = [
    ['ANTRA', 'Associação Nacional de Travestis e Transexuais'],
    ['CF', 'Constituição Federal'],
    ['CERD', 'Comitê para a Eliminação da Discriminação Racial'],
    ['CNJ', 'Conselho Nacional de Justiça'],
    ['CONAPIR', 'Conferência Nacional de Promoção da Igualdade Racial'],
    ['DIEESE', 'Departamento Intersindical de Estatística e Estudos Socioeconômicos'],
    ['FBSP', 'Fórum Brasileiro de Segurança Pública'],
    ['FJP', 'Fundação João Pinheiro'],
    ['IBGE', 'Instituto Brasileiro de Geografia e Estatística'],
    ['INCRA', 'Instituto Nacional de Colonização e Reforma Agrária'],
    ['INEP', 'Instituto Nacional de Estudos e Pesquisas Educacionais'],
    ['IPEA', 'Instituto de Pesquisa Econômica Aplicada'],
    ['MIR', 'Ministério da Igualdade Racial'],
    ['MDHC', 'Ministério dos Direitos Humanos e da Cidadania'],
    ['MPI', 'Ministério dos Povos Indígenas'],
    ['ONDH', 'Ouvidoria Nacional de Direitos Humanos'],
    ['PNAD', 'Pesquisa Nacional por Amostra de Domicílios Contínua'],
    ['PNIR', 'Política Nacional de Igualdade Racial'],
    ['PNSIPN', 'Política Nacional de Saúde Integral da População Negra'],
    ['PROUNI', 'Programa Universidade para Todos'],
    ['RASEAM', 'Relatório Anual Socioeconômico das Mulheres'],
    ['SESAI', 'Secretaria Especial de Saúde Indígena'],
    ['SIDRA', 'Sistema IBGE de Recuperação Automática'],
    ['SIM', 'Sistema de Informações sobre Mortalidade'],
    ['SINASC', 'Sistema de Informações sobre Nascidos Vivos'],
    ['SINAPIR', 'Sistema Nacional de Promoção da Igualdade Racial'],
    ['SIS', 'Síntese de Indicadores Sociais (IBGE)'],
    ['STF', 'Supremo Tribunal Federal'],
    ['STJ', 'Superior Tribunal de Justiça'],
    ['SUS', 'Sistema Único de Saúde'],
    ['TSE', 'Tribunal Superior Eleitoral'],
  ];

  return `
  <div style="page-break-before:always"></div>
  <h2>Lista de Siglas</h2>
  <table>
    <thead><tr><th>Sigla</th><th>Descrição</th></tr></thead>
    <tbody>${siglas.map(([sigla, descricao]) => `<tr><td><strong>${sigla}</strong></td><td>${descricao}</td></tr>`).join('')}</tbody>
  </table>`;
}

function renderAnalyticalAnnexCover(d: CerdIVFullData, total: number, totalIndicadores: number): string {
  return `
  <div style="page-break-before:always"></div>
  <div class="header">
    <h1>ANEXO ANALÍTICO — PLATAFORMA CERD4</h1>
    <div class="subtitle">IV Relatório do Estado Brasileiro à Convenção ICERD</div>
    <div class="subtitle">Base Estatística, Orçamentária, Normativa e de Recomendações (2018–2025)</div>
    <div class="date">Brasília, DF — 2025</div>
  </div>
  ${dataCards([
    { value: `${total}`, label: 'Recomendações Analisadas' },
    { value: `${totalIndicadores}`, label: 'Indicadores Estatísticos' },
    { value: `${d.orcStats?.totalRegistros || 0}`, label: 'Registros orçamentários' },
    { value: `${d.normativos?.length || 0}`, label: 'Documentos normativos' },
  ])}`;
}

function renderAnalyticalMethodology(d: CerdIVFullData, totalIndicadores: number): string {
  return `
  <div style="page-break-before:always"></div>
  <h2>I. Metodologia do Sistema CERD4</h2>
  <div class="section">
    <p>O sistema CERD4 foi desenvolvido para apoiar a elaboração do IV Relatório Periódico do Brasil à Convenção ICERD. A plataforma realiza cruzamento automatizado entre quatro bases de dados independentes, correlacionadas pelos Artigos I–VII da Convenção.</p>
    ${dataCards([
      { value: `${totalIndicadores}`, label: 'Base Estatística' },
      { value: `${d.orcStats?.totalRegistros || 0}`, label: 'Orçamento Federal' },
      { value: `${d.normativos?.length || 0}`, label: 'Base Normativa' },
      { value: `${d.lacunas.length}`, label: 'Recomendações ONU' },
    ])}
    <p>O motor de cruzamento correlaciona cada elemento das quatro bases com os Artigos I–VII, gerando: (1) score de cumprimento por artigo; (2) diagnóstico de avanço, estagnação ou retrocesso por domínio de política pública; (3) identificação de assimetrias orçamentárias; e (4) veredito global para o relatório. Todos os dados foram verificados por auditoria manual com referência cruzada às tabelas-fonte oficiais.</p>
    <div class="chart-container">${renderMethodologyDiagram(
      totalIndicadores,
      d.orcStats?.totalRegistros || 0,
      d.normativos?.length || 0,
      d.lacunas.length,
      d.respostas.length,
    )}</div>
    <div class="highlight-box">
      <h4>📋 Nota metodológica sobre fontes e escopo</h4>
      <p>Fontes primárias utilizadas: IBGE/SIDRA, DataSUS, FBSP, SIOP/Portal da Transparência, CNJ/Justiça em Números, INEP/Censo Escolar, Atlas da Violência 2025, Dossiê ANTRA 2026, ONDH/Disque 100, TSE, Fundação João Pinheiro, INCRA/FUNAI e DIEESE.</p>
      <p>Nota sobre orçamento: foram incluídas apenas ações com componente institucional explícito de igualdade racial. Programas universais sem marcador racial específico permanecem fora do cálculo central para evitar distorção metodológica.</p>
    </div>
  </div>`;
}

function renderAnalyticalSynthesis(): string {
  return `
  <div style="page-break-before:always"></div>
  <h2>VIII. Síntese Avaliativa por Dimensão (2018–2025)</h2>
  <div class="section">
    <p>Quando o sistema entrelaça estatística, orçamento, normativa, recomendações e narrativas analíticas, o padrão que emerge é claro: o Brasil avançou mais na capacidade formal de responder do que na velocidade substantiva de reversão da desigualdade racial.</p>
    <div class="analysis-box">
      <p><strong>Leitura sintética:</strong> houve reconstrução institucional relevante a partir de 2023, mas a persistência de assimetrias em segurança pública, renda, saúde e titulação territorial impede uma conclusão celebratória. O ganho formal é real; a transformação material ainda é incompleta.</p>
    </div>
  </div>`;
}

function renderIntroduction(d: CerdIVFullData, demo: any, total: number, cumpridas: number, parciais: number, naoCumpridas: number, retrocessos: number): string {
  const pctAvancos = total > 0 ? ((cumpridas + parciais) / total * 100).toFixed(1) : '0';
  const pctCritico = total > 0 ? ((naoCumpridas + retrocessos) / total * 100).toFixed(1) : '0';
  
  return `
  <h2>I. Introdução</h2>
  <div class="section">
    <p>1. O Governo da República Federativa do Brasil apresenta seu quarto relatório periódico à Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial ('a Convenção'), em conformidade com o artigo 9.º do referido instrumento e com as Observações Finais do Comitê (CERD/C/BRA/CO/18-20, adotadas em 1.º de dezembro de 2022). O relatório abrange o período de 2018 a 2025 e dá continuidade ao III Relatório (período 2004–2017).</p>

    <p>2. O presente documento foi elaborado a partir de processo participativo que incluiu consultas com o movimento negro, organizações quilombolas, povos ciganos, comunidades de terreiro, povos indígenas e organizações de direitos humanos, em atendimento à recomendação do Comitê (§66 das Observações Finais). A coleta de dados foi orientada pelos princípios da desagregação racial, da interseccionalidade e da auditabilidade das fontes, respondendo às preocupações do Comitê sobre lacunas e fragilidades nos mecanismos de coleta (§5–6).</p>

    <p>3. O relatório reconhece com honestidade que o Estado brasileiro partiu, em 2018, de um ponto de inflexão negativa: o desmonte institucional das políticas de igualdade racial entre 2019 e 2022 — com o rebaixamento da SEPPIR a departamento, o esvaziamento orçamentário dos programas raciais e a paralisia do processo de demarcação de terras — representou retrocesso grave, explicitamente reconhecido como preocupação central pelas Observações Finais do Comitê. A partir de 2023, com a criação do Ministério da Igualdade Racial, o Estado iniciou processo de reconstrução dessas políticas, documentado ao longo deste relatório.</p>

    <p>4. Os dados utilizados neste relatório foram extraídos exclusivamente de fontes primárias auditáveis: IBGE/SIDRA (Censo 2022 e PNAD Contínua), DataSUS/SIM/SINASC, Atlas da Violência 2025 (IPEA/FBSP), 19.º Anuário Brasileiro de Segurança Pública (FBSP 2025), Dossiê ANTRA 2026, INEP/Censo Escolar, TSE/Dados Eleitorais, CNJ/Justiça em Números, ONDH/Disque 100 e Fundação João Pinheiro. A estrutura do relatório segue os artigos da Convenção, com atenção específica às recomendações prioritárias do Comitê.</p>

    <div class="highlight-box">
      <h4>📋 Nota Metodológica — Plataforma CERD4</h4>
      <p>Este relatório incorpora dados analíticos gerados pela Plataforma CERD4 (cerd4.lovable.app), que cruzou <strong>${d.indicadores.length} indicadores estatísticos</strong>, <strong>${total} recomendações</strong>, <strong>${d.orcStats?.totalRegistros || 0} registros orçamentários</strong> e <strong>${d.normativos?.length || 0} documentos normativos</strong>. As inserções do sistema aparecem em caixas sombreadas ao longo do texto, após cada seção de artigo.</p>
    </div>

    <div class="analysis-box">
      <h4>📊 Síntese Diagnóstica</h4>
      <p>Das ${total} recomendações analisadas, <strong>${pctAvancos}% tiveram algum grau de cumprimento</strong> (cumpridas ou parciais), enquanto <strong>${pctCritico}% permanecem não cumpridas ou em retrocesso</strong>. Este quadro evidencia que, embora o Brasil tenha avançado normativamente a partir de 2023, a desigualdade racial estrutural persiste em indicadores fundamentais de segurança, saúde, educação e renda.</p>
    </div>
  </div>`;
}

function renderDemographicContext(demo: any): string {
  const comp = demo?.composicaoRacial || {};
  return `
  <h3>Contexto Demográfico (Censo 2022)</h3>
  <div class="section">
    <p>O Brasil possui uma população de ${fmtNum(demo?.populacaoTotal || 203080756)} habitantes (Censo 2022), dos quais <strong>${fmtNum(demo?.populacaoNegra || 112700000)} (55,5%) se autodeclaram negros</strong> (pretos e pardos). A população indígena soma ${fmtNum(demo?.populacaoIndigena || 1227642)} pessoas, a quilombola ${fmtNum(demo?.populacaoQuilombola || 1327802)} e a cigana ${fmtNum(demo?.populacaoCigana || 41738)}.</p>
    ${comp.pardos ? `
    ${dataCards([
      { value: fmtNum(comp.pardos), label: 'Pardos (45,3%)' },
      { value: fmtNum(comp.brancos), label: 'Brancos (43,5%)' },
      { value: fmtNum(comp.pretos), label: 'Pretos (10,2%)' },
      { value: fmtNum(comp.indigenas || 1227642), label: 'Indígenas (0,8%)' },
    ])}` : ''}
    <p>A desagregação racial é fundamental para compreender a persistência das desigualdades: a população negra brasileira é maior que a população total de países como França, Reino Unido ou Itália, mas seus indicadores socioeconômicos sistematicamente ficam abaixo da média nacional em praticamente todas as dimensões medidas.</p>
  </div>`;
}

function renderRespostasCerdIII(respostas: RespostaLacunaCerdIII[], lacunas: LacunaIdentificada[], indicadores: IndicadorInterseccional[], orcStats: any, orcDados?: DadoOrcamentario[], normativos?: any[]): string {
  if (!respostas.length) return '';

  const porStatus: Record<string, number> = {};
  respostas.forEach(r => { porStatus[r.grau_atendimento] = (porStatus[r.grau_atendimento] || 0) + 1; });
  
  const respostasHTML = respostas.map(r => {
    const st = statusCfg[r.grau_atendimento] || statusCfg.nao_cumprido;
    
    // Find related lacunas for this paragraph
    const relatedLacunas = lacunas.filter(l => l.paragrafo === r.paragrafo_cerd_iii);
    const relatedIndicators = indicadores.filter(ind => {
      const artigos = relatedLacunas.flatMap(l => (l as any).artigos_convencao || []);
      return artigos.some((a: string) => ((ind as any).artigos_convencao || []).includes(a));
    }).slice(0, 3);

    const lacunasRem = r.lacunas_remanescentes?.length
      ? `<div class="gap-box"><strong>⚠️ Lacunas remanescentes:</strong><ul>${r.lacunas_remanescentes.map(l => `<li>${l}</li>`).join('')}</ul></div>`
      : '';
    
    const indicadoresRef = relatedIndicators.length > 0
      ? `<p style="font-size:9pt;color:#64748b"><em>Indicadores vinculados: ${relatedIndicators.map(i => `${i.nome} (${i.tendencia || 'sem tendência'})`).join('; ')}</em></p>`
      : '';

    return `
    <div class="highlight-box" style="margin-bottom:0.3cm">
      <h4><span class="paragraph-ref">§${r.paragrafo_cerd_iii}</span> — <span class="badge ${st.badge}">${st.label}</span></h4>
      <p><strong>Crítica do Comitê:</strong> ${r.critica_original}</p>
    </div>
    <div class="${r.grau_atendimento === 'cumprido' ? 'advance-box' : r.grau_atendimento === 'retrocesso' || r.grau_atendimento === 'nao_cumprido' ? 'regress-box' : 'analysis-box'}">
      <p><strong>Resposta do Estado Brasileiro:</strong> ${r.resposta_brasil}</p>
      ${(() => {
        const dynJust = generateDynamicJustificativa(r.paragrafo_cerd_iii, indicadores as any, (orcDados || []) as any, (normativos || []) as any);
        const justText = dynJust || r.justificativa_avaliacao;
        return justText ? `<p><strong>Avaliação técnica:</strong> ${justText}</p>` : '';
      })()}
      ${indicadoresRef}
      ${lacunasRem}
    </div>`;
  }).join('');

  return `
  <h2>III. Respostas às Observações Finais (CERD/C/BRA/CO/18-20)</h2>
  <div class="section">
    <p>Em agosto de 2022, o Comitê emitiu ${respostas.length} observações finais sobre o relatório anterior do Brasil. A análise sistemática dessas recomendações revela o seguinte quadro de cumprimento:</p>
    
    ${svgDonutChart([
      { label: 'Cumprido', value: porStatus.cumprido || 0, color: '#22c55e' },
      { label: 'Parcial', value: porStatus.parcialmente_cumprido || 0, color: '#eab308' },
      { label: 'Em Andamento', value: porStatus.em_andamento || 0, color: '#3b82f6' },
      { label: 'Não Cumprido', value: porStatus.nao_cumprido || 0, color: '#f97316' },
      { label: 'Retrocesso', value: porStatus.retrocesso || 0, color: '#ef4444' },
    ])}
    
    ${respostasHTML}
  </div>`;
}

function num(v: unknown): number {
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

function uniqueStrings(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter(Boolean) as string[])];
}

function pickIndicadorSnapshot(ind: IndicadorInterseccional): string {
  const dados = ind.dados as any;
  if (!dados || typeof dados !== 'object') return '—';

  const source = dados.series && typeof dados.series === 'object' ? dados.series : dados;
  const yearEntries = Object.entries(source)
    .filter(([key, value]) => /^\d{4}$/.test(key) && value && typeof value === 'object')
    .sort((a, b) => Number(a[0]) - Number(b[0]));

  if (yearEntries.length > 0) {
    const [year, record] = yearEntries[yearEntries.length - 1] as [string, Record<string, unknown>];
    const priorityKeys = ['valor', 'total', 'geral', 'negros', 'negro', 'pretos_pardos', 'pretos', 'pardos', 'indigenas', 'brancos', 'branco'];
    const match = priorityKeys.find((key) => typeof record[key] === 'number');
    if (match) return `${fmtNum(num(record[match]))} (${year})`;
    const firstNumeric = Object.entries(record).find(([, value]) => typeof value === 'number');
    if (firstNumeric) return `${fmtNum(num(firstNumeric[1]))} (${year})`;
  }

  if (Array.isArray(dados.registros)) return `${dados.registros.length} registros`;
  if (typeof dados.valor === 'number') return fmtNum(dados.valor);
  if (typeof dados.total === 'number') return fmtNum(dados.total);
  return '—';
}

function renderArticleIndicatorTable(indicadores: IndicadorInterseccional[]): string {
  if (indicadores.length === 0) return '';
  return `
    <table>
      <thead><tr><th>Indicador</th><th>Categoria</th><th>Tendência</th><th>Último valor</th><th>Fonte</th></tr></thead>
      <tbody>${indicadores.slice(0, 10).map(i => `
        <tr>
          <td>${i.nome}</td>
          <td>${eixoLabels[i.categoria] || i.categoria}</td>
          <td>${i.tendencia || '—'}</td>
          <td>${pickIndicadorSnapshot(i)}</td>
          <td style="font-size:8.5pt">${i.fonte}</td>
        </tr>`).join('')}</tbody>
    </table>`;
}

function renderRecommendationMatrix(lacunas: LacunaIdentificada[]): string {
  if (lacunas.length === 0) return '';
  return `
    <table>
      <thead><tr><th>§</th><th>Tema</th><th>Grupo focal</th><th>Status</th><th>Evidência/ação</th></tr></thead>
      <tbody>${lacunas.slice(0, 12).map(l => {
        const st = statusCfg[l.status_cumprimento] || statusCfg.nao_cumprido;
        const evidencia = l.evidencias_encontradas?.[0] || l.acoes_brasil?.[0] || l.fontes_dados?.[0] || 'Sem evidência textual cadastrada';
        return `
          <tr>
            <td><span class="paragraph-ref">${l.paragrafo}</span></td>
            <td>${l.tema}</td>
            <td>${grupoLabels[l.grupo_focal] || l.grupo_focal}</td>
            <td><span class="badge ${st.badge}">${st.label}</span></td>
            <td style="font-size:8.5pt">${evidencia}</td>
          </tr>`;
      }).join('')}</tbody>
    </table>`;
}

function renderBudgetProgramsTable(orcDados: DadoOrcamentario[]): string {
  if (orcDados.length === 0) return '';
  const ordered = [...orcDados]
    .sort((a, b) => num(b.pago) - num(a.pago))
    .slice(0, 8);

  return `
    <table>
      <thead><tr><th>Programa</th><th>Órgão</th><th>Ano</th><th>Dotação</th><th>Pago</th><th>Execução</th></tr></thead>
      <tbody>${ordered.map(row => `
        <tr>
          <td>${row.programa}</td>
          <td>${row.orgao}</td>
          <td>${row.ano}</td>
          <td>${fmtBRL(num(row.dotacao_autorizada))}</td>
          <td>${fmtBRL(num(row.pago))}</td>
          <td>${row.percentual_execucao != null ? `${num(row.percentual_execucao).toFixed(1)}%` : '—'}</td>
        </tr>`).join('')}</tbody>
    </table>`;
}

function renderNormativeDocsTable(normativos: any[]): string {
  if (normativos.length === 0) return '';
  return `
    <table>
      <thead><tr><th>Documento</th><th>Categoria</th><th>Status</th><th>Artigos</th></tr></thead>
      <tbody>${normativos.slice(0, 8).map((n: any) => `
        <tr>
          <td>${n.titulo}</td>
          <td>${n.categoria || '—'}</td>
          <td>${n.status || '—'}</td>
          <td>${(n.artigos_convencao || []).join(', ') || '—'}</td>
        </tr>`).join('')}</tbody>
    </table>`;
}

function buildEvidenceHighlights(artigo: string, d: CerdIVFullData, seg: any[], fem: any[], edu: any[], sau: any[], eco: any[], evolDesig: any[], povos: any): string {
  const blocks: string[] = [];

  if (['II', 'V', 'VI'].includes(artigo) && seg.length > 1) {
    const first = seg[0];
    const last = seg[seg.length - 1];
    blocks.push(`
      <div class="chart-container">
        <div class="chart-title">Segurança pública: participação de vítimas negras e letalidade policial</div>
        ${svgLineChart({
          label: seg.map(s => s.ano).join(','),
          series: [
            { name: 'Vítimas negras (%)', color: '#ef4444', values: seg.map(s => num(s.percentualVitimasNegras)) },
            { name: 'Letalidade policial (%)', color: '#f97316', values: seg.map(s => num(s.letalidadePolicial)) },
          ],
        })}
        <p style="font-size:8.5pt;margin-top:0.25cm">Leitura: o percentual de vítimas negras passou de ${num(first.percentualVitimasNegras).toFixed(1)}% para ${num(last.percentualVitimasNegras).toFixed(1)}% no período, enquanto a letalidade policial negra variou de ${num(first.letalidadePolicial).toFixed(1)}% para ${num(last.letalidadePolicial).toFixed(1)}%.</p>
      </div>`);
  }

  if (['V', 'VII'].includes(artigo) && edu.length > 1) {
    const first = edu[0];
    const last = edu[edu.length - 1];
    blocks.push(`
      <div class="chart-container">
        <div class="chart-title">Educação: ensino superior completo por raça</div>
        ${svgLineChart({
          label: edu.map(e => e.ano).join(','),
          series: [
            { name: 'Negros (%)', color: '#2563eb', values: edu.map(e => num(e.superiorNegroPercent)) },
            { name: 'Brancos (%)', color: '#64748b', values: edu.map(e => num(e.superiorBrancoPercent)) },
          ],
        })}
        <p style="font-size:8.5pt;margin-top:0.25cm">Leitura: o ensino superior completo entre negros saiu de ${num(first.superiorNegroPercent).toFixed(1)}% para ${num(last.superiorNegroPercent).toFixed(1)}%, mas permanece abaixo do patamar branco (${num(last.superiorBrancoPercent).toFixed(1)}%).</p>
      </div>`);
  }

  if (['II', 'V'].includes(artigo) && eco.length > 1) {
    const first = eco[0];
    const last = eco[eco.length - 1];
    blocks.push(`
      <div class="chart-container">
        <div class="chart-title">Trabalho e renda: desemprego por raça</div>
        ${svgLineChart({
          label: eco.map(e => e.ano).join(','),
          series: [
            { name: 'Negros (%)', color: '#dc2626', values: eco.map(e => num(e.desempregoNegro)) },
            { name: 'Brancos (%)', color: '#64748b', values: eco.map(e => num(e.desempregoBranco)) },
          ],
        })}
        <p style="font-size:8.5pt;margin-top:0.25cm">Leitura: a taxa de desemprego negra foi de ${num(first.desempregoNegro).toFixed(1)}% para ${num(last.desempregoNegro).toFixed(1)}%, enquanto a branca passou de ${num(first.desempregoBranco).toFixed(1)}% para ${num(last.desempregoBranco).toFixed(1)}%.</p>
      </div>
      <div class="chart-container">
        <div class="chart-title">Trabalho e renda: rendimento médio mensal</div>
        ${svgBarChart(
          eco.map(e => String(e.ano)),
          [
            { name: 'Negros', color: '#2563eb', values: eco.map(e => num(e.rendaMediaNegra)) },
            { name: 'Brancos', color: '#94a3b8', values: eco.map(e => num(e.rendaMediaBranca)) },
          ],
          650,
          230,
          0,
          undefined,
          (v) => `R$ ${(v / 1000).toFixed(1)}k`
        )}
        <p style="font-size:8.5pt;margin-top:0.25cm">Leitura: o diferencial de renda persiste no fim da série, com ${fmtBRL(num(last.rendaMediaNegra))} para negros e ${fmtBRL(num(last.rendaMediaBranca))} para brancos.</p>
      </div>`);
  }

  if (artigo === 'V' && sau.length > 1) {
    const first = sau[0];
    const last = sau[sau.length - 1];
    blocks.push(`
      <div class="chart-container">
        <div class="chart-title">Saúde: mortalidade materna por raça</div>
        ${svgLineChart({
          label: sau.map(s => s.ano).join(','),
          series: [
            { name: 'Negras', color: '#dc2626', values: sau.map(s => num(s.mortalidadeMaternaNegra)) },
            { name: 'Brancas', color: '#64748b', values: sau.map(s => num(s.mortalidadeMaternaBranca)) },
          ],
        })}
        <p style="font-size:8.5pt;margin-top:0.25cm">Leitura: a razão de mortalidade materna entre negras passou de ${num(first.mortalidadeMaternaNegra).toFixed(1)} para ${num(last.mortalidadeMaternaNegra).toFixed(1)}, ainda acima da observada entre brancas (${num(last.mortalidadeMaternaBranca).toFixed(1)}).</p>
      </div>`);
  }

  if (['III', 'V'].includes(artigo) && d.mirror?.deficitHabitacionalSerie?.length) {
    const deficit = d.mirror.deficitHabitacionalSerie;
    blocks.push(`
      <div class="chart-container">
        <div class="chart-title">Habitação: déficit habitacional por raça</div>
        ${svgLineChart({
          label: deficit.map((row: any) => row.ano).join(','),
          series: [
            { name: 'Negros', color: '#b91c1c', values: deficit.map((row: any) => num(row.deficitNegros || row.negros || row.percentualNegros)) },
            { name: 'Brancos', color: '#64748b', values: deficit.map((row: any) => num(row.deficitBrancos || row.brancos || row.percentualBrancos)) },
          ],
        })}
      </div>`);
  }

  if (artigo === 'III') {
    blocks.push(dataCards([
      { value: fmtNum(num(povos?.indigenas?.populacaoCorRaca || 1227642)), label: 'Povos indígenas (Censo 2022)' },
      { value: fmtNum(num(povos?.quilombolas?.populacao || 1327802)), label: 'População quilombola' },
      { value: fmtNum(num(povos?.quilombolas?.territoriosTitulados || 52)), label: 'Territórios quilombolas titulados' },
      { value: `${num(povos?.indigenas?.terrasHomologadas2023_2025 || 0)}`, label: 'TIs homologadas 2023-2025' },
    ]));
  }

  if (artigo === 'VII') {
    const odsEducacao = d.indicadores.filter(ind => ind.categoria === 'ods_racial' && inferArtigosIndicador(ind).includes('VII'));
    if (odsEducacao.length > 0) {
      blocks.push(`
        <div class="analysis-box">
          <h4>🌐 ODS racial vinculados ao Artigo VII</h4>
          ${renderArticleIndicatorTable(odsEducacao)}
        </div>`);
    }
  }

  return blocks.join('');
}

function generateArticleAnalysis(
  artigo: string,
  titulo: string,
  descricao: string,
  lacunas: LacunaIdentificada[],
  orcDados: DadoOrcamentario[],
  normativos: any[],
  indicadores: IndicadorInterseccional[],
  fios: FioCondutor[]
): string {
  const total = lacunas.length;
  const cumprido = lacunas.filter(l => l.status_cumprimento === 'cumprido').length;
  const parcial = lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length;
  const critico = lacunas.filter(l => l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso').length;
  const totalPago = orcDados.reduce((acc, row) => acc + num(row.pago), 0);
  const totalDotacao = orcDados.reduce((acc, row) => acc + num(row.dotacao_autorizada), 0);
  const execucao = totalDotacao > 0 ? (totalPago / totalDotacao) * 100 : 0;
  const eixos = uniqueStrings(lacunas.map(l => eixoLabels[l.eixo_tematico] || l.eixo_tematico));
  const grupos = uniqueStrings(lacunas.map(l => grupoLabels[l.grupo_focal] || l.grupo_focal));
  const melhorias = indicadores.filter(i => ['melhoria', 'melhoria_lenta', 'crescente'].includes(i.tendencia || '')).map(i => i.nome);
  const pioras = indicadores.filter(i => ['piora', 'estável_negativo', 'decrescente'].includes(i.tendencia || '')).map(i => i.nome);
  const fiosRelacionados = fios.filter(f => (f.artigosConvencao || []).includes(artigo as any));

  if (total === 0 && indicadores.length === 0 && orcDados.length === 0 && normativos.length === 0) {
    return `<p>O ${titulo} não concentrou recomendações formalmente vinculadas no banco, mas segue relevante como eixo interpretativo da Convenção. Ainda assim, o sistema não localizou base empírica suficiente para uma leitura robusta neste ciclo.</p>`;
  }

  return `
    <p><strong>${titulo}</strong> — ${descricao}</p>
    <p>No recorte deste artigo, o sistema consolidou <strong>${total}</strong> lacunas/recomendações diretamente associadas, <strong>${indicadores.length}</strong> indicadores vinculados, <strong>${normativos.length}</strong> marcos normativos e <strong>${orcDados.length}</strong> registros orçamentários rastreáveis. Os eixos mais associados são ${eixos.join(', ') || 'não identificados'}; os grupos mais afetados são ${grupos.join(', ') || 'não identificados'}.</p>
    ${total > 0 ? `<p>Do total de recomendações vinculadas, ${cumprido} foram classificadas como cumpridas, ${parcial} como parcialmente cumpridas e ${critico} seguem em não cumprimento ou retrocesso. Isso significa que ${((cumprido + parcial) / Math.max(total, 1) * 100).toFixed(1)}% do conjunto teve algum grau de resposta estatal, porém com persistência de déficits estruturais que impedem a conclusão positiva do ciclo.</p>` : ''}
    ${indicadores.length > 0 ? `<p>Na base estatística, os principais sinais são: ${melhorias.length ? `<strong>melhoras parciais</strong> em ${melhorias.slice(0, 4).join(', ')}` : 'sem melhoras robustas registradas'}${melhorias.length && pioras.length ? '; ' : ''}${pioras.length ? `<strong>alertas</strong> em ${pioras.slice(0, 4).join(', ')}` : ''}. A leitura do artigo não é, portanto, apenas normativa: ela se ancora em séries históricas, quadros-síntese e evidências quantitativas do sistema.</p>` : ''}
    ${orcDados.length > 0 ? `<p>Na dimensão orçamentária, foram rastreados ${fmtBRL(totalDotacao)} em dotação autorizada e ${fmtBRL(totalPago)} pagos, com execução média de ${execucao.toFixed(1)}%. Esse dado importa porque evidencia se a promessa normativa e programática se converteu, ou não, em capacidade material de implementação.</p>` : ''}
    ${normativos.length > 0 ? `<p>Na dimensão normativa, o artigo foi sustentado por ${normativos.length} documentos do acervo institucional. Esses marcos ajudam a explicar por que certos resultados melhoram lentamente, enquanto outros permanecem apenas no plano declaratório.</p>` : ''}
    ${fiosRelacionados.length > 0 ? `<div class="fio-condutor"><h4>🧵 Leitura transversal do sistema</h4><p>${fiosRelacionados.slice(0, 2).map(f => f.argumento).join(' ')}</p></div>` : ''}`;
}

// Map articles to thematic narrative keys
const ARTICLE_THEMATIC_MAP: Record<string, string[]> = {
  'I': [], 'II': ['security'], 'III': ['territory'],
  'IV': ['security'], 'V': ['security', 'health', 'education', 'labor', 'territory', 'lgbtDisability'],
  'VI': ['security'], 'VII': ['education'],
};

function renderArticleAnalysisExpanded(
  d: CerdIVFullData, seg: any[], fem: any[], edu: any[], sau: any[], eco: any[], evolDesig: any[], povos: any,
  thematicNarratives: Record<string, string>
): string {
  const sections = ARTIGOS_CONVENCAO.map((info) => {
    const artigo = info.numero;
    const artigoLacunas = d.lacunas.filter(l => {
      const explicit = ((l as any).artigos_convencao || []).filter((a: string) => ['I','II','III','IV','V','VI','VII'].includes(a));
      if (explicit.length > 0) return explicit.includes(artigo);
      return (EIXO_PARA_ARTIGOS[l.eixo_tematico] || []).includes(artigo as any);
    });
    const artigoOrc = (d.orcDados || []).filter(o => inferArtigosOrcamento(o).includes(artigo as any));
    const artigoNormativos = (d.normativos || []).filter((n: any) => {
      const explicit = (n.artigos_convencao || []).filter((a: string) => ['I','II','III','IV','V','VI','VII'].includes(a));
      if (explicit.length > 0) return explicit.includes(artigo);
      const inferred = inferArtigosDocumentoNormativo({ titulo: n.titulo || '', categoria: n.categoria, secoes_impactadas: n.secoes_impactadas, recomendacoes_impactadas: n.recomendacoes_impactadas });
      return inferred.includes(artigo as any);
    });
    const artigoIndicadores = d.indicadores.filter(i => inferArtigosIndicador(i).includes(artigo));

    // Article narrative from DOCX template (dynamic text)
    const narrativeData = {
      lacunas: artigoLacunas, indicadores: artigoIndicadores, orcDados: artigoOrc, normativos: artigoNormativos,
      demo: d.mirror?.dadosDemograficos || hcDemograficos,
      seg: d.mirror?.segurancaPublica?.length ? d.mirror.segurancaPublica : hcSeguranca,
      sau: d.mirror?.saudeSerieHistorica?.length ? d.mirror.saudeSerieHistorica : hcSaude,
      edu: d.mirror?.educacaoSerieHistorica?.length ? d.mirror.educacaoSerieHistorica : hcEducacao,
      eco: d.mirror?.indicadoresSocioeconomicos?.length ? d.mirror.indicadoresSocioeconomicos : hcSocioEco,
      fem: d.mirror?.feminicidioSerie?.length ? d.mirror.feminicidioSerie : hcFeminicidio,
      povos: d.mirror?.povosTradicionais || hcPovos,
      atlas: d.mirror?.atlasViolencia2025 || hcAtlas,
      analfab: d.mirror?.analfabetismoGeral2024 || hcAnalfabetismo,
      evasao: hcEvasao, antra: hcAntra,
    };
    const articleNarrativeHTML = renderArticleNarrative(artigo, narrativeData);

    const systemAnalysisHTML = generateArticleAnalysis(artigo, info.tituloCompleto, info.descricao, artigoLacunas, artigoOrc, artigoNormativos, artigoIndicadores, d.fiosCondutores || []);

    const assessmentHTML = renderArticleAssessment(artigo, artigoLacunas, artigoOrc, artigoIndicadores, artigoNormativos);

    if (!artigoLacunas.length && !artigoOrc.length && !artigoNormativos.length && !artigoIndicadores.length && !articleNarrativeHTML) return '';

    return `
      <h3>Artigo ${artigo} — ${info.titulo}</h3>
      <div class="section">
        <!-- Narrative text from DOCX template -->
        ${articleNarrativeHTML}

        <!-- System analysis (dynamic counts) -->
        <div class="analysis-box">
          <h4>📊 Leitura do Sistema CERD4 — ${info.tituloCompleto}</h4>
          ${systemAnalysisHTML}
        </div>

        ${assessmentHTML}
      </div>`;
  }).filter(Boolean).join('');

  return `
    <h2>II. Fundamentação por Artigos da Convenção ICERD</h2>
    <div class="section">
      <p>Esta seção reproduz a estrutura do relatório principal, preservando o texto-base dos artigos e mantendo dinâmicos apenas os dados e leituras analíticas vinculados ao sistema.</p>
    </div>
    ${sections}`;
}

function renderArticleRecSummary(lacunas: LacunaIdentificada[]): string {
  const porStatus: Record<string, number> = {};
  lacunas.forEach(l => { porStatus[l.status_cumprimento] = (porStatus[l.status_cumprimento] || 0) + 1; });
  const total = lacunas.length;
  const cumprido = (porStatus.cumprido || 0) + (porStatus.parcialmente_cumprido || 0);
  const critico = (porStatus.nao_cumprido || 0) + (porStatus.retrocesso || 0);

  return `
    <div class="highlight-box">
      <h4>📌 Recomendações vinculadas ao artigo (${total})</h4>
      <p>
        ${porStatus.cumprido ? `<span class="badge badge-success">${porStatus.cumprido} cumprida(s)</span> ` : ''}
        ${porStatus.parcialmente_cumprido ? `<span class="badge badge-warning">${porStatus.parcialmente_cumprido} parcial(is)</span> ` : ''}
        ${porStatus.em_andamento ? `<span class="badge badge-info">${porStatus.em_andamento} em andamento</span> ` : ''}
        ${porStatus.nao_cumprido ? `<span class="badge badge-danger">${porStatus.nao_cumprido} não cumprida(s)</span> ` : ''}
        ${porStatus.retrocesso ? `<span class="badge badge-danger">${porStatus.retrocesso} retrocesso(s)</span> ` : ''}
      </p>
      <p style="font-size:9.5pt">Taxa de resposta: <strong>${((cumprido / Math.max(total, 1)) * 100).toFixed(0)}%</strong> com algum grau de atendimento | <strong>${((critico / Math.max(total, 1)) * 100).toFixed(0)}%</strong> em déficit crítico.</p>
      <table style="font-size:9pt">
        <thead><tr><th>§</th><th>Tema</th><th>Status</th></tr></thead>
        <tbody>${lacunas.slice(0, 8).map(l => {
          const st = statusCfg[l.status_cumprimento] || statusCfg.nao_cumprido;
          return `<tr><td><span class="paragraph-ref">${l.paragrafo}</span></td><td>${l.tema}</td><td><span class="badge ${st.badge}">${st.label}</span></td></tr>`;
        }).join('')}${lacunas.length > 8 ? `<tr><td colspan="3" style="text-align:center;color:#64748b">+ ${lacunas.length - 8} recomendações adicionais (ver Anexo A)</td></tr>` : ''}</tbody>
      </table>
    </div>`;
}

function renderArticleAssessment(artigo: string, lacunas: LacunaIdentificada[], orcDados: DadoOrcamentario[], indicadores: IndicadorInterseccional[], normativos: any[]): string {
  const total = lacunas.length;
  const cumprido = lacunas.filter(l => l.status_cumprimento === 'cumprido' || l.status_cumprimento === 'parcialmente_cumprido').length;
  const emAndamento = lacunas.filter(l => l.status_cumprimento === 'em_andamento').length;
  const critico = lacunas.filter(l => l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso').length;
  const totalPago = orcDados.reduce((acc, row) => acc + num(row.pago), 0);
  const totalDotacao = orcDados.reduce((acc, row) => acc + num(row.dotacao_autorizada), 0);
  const execucao = totalDotacao > 0 ? (totalPago / totalDotacao * 100) : 0;
  const evolution = summarizeIndicatorEvolution(indicadores);
  const melhorias = evolution.favoraveis + evolution.novos;
  const pioras = evolution.desfavoraveis;

  // em_andamento conta como progresso parcial (peso 0.3)
  const progressoEfetivo = cumprido + emAndamento * 0.3;

  // Determine overall assessment
  let veredito = 'Lacuna Persistente';
  let badgeClass = 'badge-warning';
  let icon = '⚠️';
  if (progressoEfetivo > critico && melhorias >= pioras) {
    veredito = 'Avanço'; badgeClass = 'badge-success'; icon = '✅';
  } else if (critico > progressoEfetivo * 2 || pioras > melhorias * 2) {
    veredito = 'Retrocesso / Déficit Grave'; badgeClass = 'badge-danger'; icon = '🔴';
  } else if (progressoEfetivo >= critico) {
    veredito = 'Avanço Parcial'; badgeClass = 'badge-info'; icon = '📈';
  }

  const emAndamentoText = emAndamento > 0 ? `, ${emAndamento} em andamento` : '';

  return `
    <div class="fio-condutor">
      <h4>${icon} Veredito — Artigo ${artigo}: <span class="badge ${badgeClass}">${veredito}</span></h4>
      <p>O cruzamento entre as ${total} recomendações vinculadas (${cumprido} atendidas${emAndamentoText}, ${critico} em déficit), ${indicadores.length} indicadores vinculados (${melhorias} com leitura favorável, ${pioras} com piora), ${normativos.length} marcos normativos, ${orcDados.length} ação(ões) orçamentária(s) vinculada(s) e execução orçamentária de ${execucao.toFixed(1)}% (${fmtBRL(totalPago)} de ${fmtBRL(totalDotacao)}) fundamenta a classificação de <strong>${veredito}</strong> para este artigo no período 2018-2025.</p>
      ${critico > 0 ? `<p style="font-size:9.5pt;color:#991b1b"><strong>Lacunas prioritárias:</strong> ${lacunas.filter(l => l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso').slice(0, 3).map(l => `§${l.paragrafo} (${l.tema})`).join('; ')}.</p>` : ''}
    </div>`;
}

function renderRecommendationsSummary(lacunas: LacunaIdentificada[]): string {
  if (!lacunas.length) return '';

  const porStatus: Record<string, number> = {};
  lacunas.forEach(l => { porStatus[l.status_cumprimento] = (porStatus[l.status_cumprimento] || 0) + 1; });

  return `
  <h2>III. Quadro Resumido: Recomendações × Evidências</h2>
  <div class="section">
    <p>O Comitê CERD emitiu <strong>${lacunas.length} recomendações/observações</strong> ao Brasil nas Observações Finais de 2022. O quadro abaixo sintetiza o status consolidado. O detalhamento completo, com descrições, evidências e ações do Brasil, está no <strong>Anexo A</strong>.</p>
    
    ${svgDonutChart([
      { label: 'Cumprido', value: porStatus.cumprido || 0, color: '#22c55e' },
      { label: 'Parcial', value: porStatus.parcialmente_cumprido || 0, color: '#eab308' },
      { label: 'Em Andamento', value: porStatus.em_andamento || 0, color: '#3b82f6' },
      { label: 'Não Cumprido', value: porStatus.nao_cumprido || 0, color: '#f97316' },
      { label: 'Retrocesso', value: porStatus.retrocesso || 0, color: '#ef4444' },
    ])}

    <table>
      <thead><tr><th>§</th><th>Tema</th><th>Eixo</th><th>Status</th><th>Artigos ICERD</th></tr></thead>
      <tbody>${lacunas.map(l => {
        const st = statusCfg[l.status_cumprimento] || statusCfg.nao_cumprido;
        const artigos = ((l as any).artigos_convencao || EIXO_PARA_ARTIGOS[l.eixo_tematico] || []).join(', ');
        return `<tr>
          <td><span class="paragraph-ref">${l.paragrafo}</span></td>
          <td>${l.tema}</td>
          <td style="font-size:8.5pt">${eixoLabels[l.eixo_tematico] || l.eixo_tematico}</td>
          <td><span class="badge ${st.badge}">${st.label}</span></td>
          <td style="font-size:8.5pt">${artigos || '—'}</td>
        </tr>`;
      }).join('')}</tbody>
    </table>
  </div>`;
}

function renderRespostasCerdIIIAnnex(respostas: RespostaLacunaCerdIII[], lacunas: LacunaIdentificada[], indicadores: IndicadorInterseccional[], orcStats: any, orcDados?: DadoOrcamentario[], normativos?: any[]): string {
  return renderRespostasCerdIII(respostas, lacunas, indicadores, orcStats, orcDados, normativos);
}

// Keep original for annex use
function renderArticleAnalysis(d: CerdIVFullData, seg: any[], fem: any[], edu: any[], sau: any[], eco: any[], evolDesig: any[], povos: any): string {
  // This function is now superseded by renderArticleAnalysisExpanded but kept for reference
  return '';
}

function renderBudgetAnalysis(orcStats: any, orcDados: DadoOrcamentario[]): string {
  if (!orcStats) return '';

  const years = Object.keys(orcStats.porAnoDetalhado || {}).sort();
  const yearLabels = years.map(String);
  const dotacaoValues = years.map(y => (orcStats.porAnoDetalhado?.[y]?.dotacao || 0));
  const pagoValues = years.map(y => (orcStats.porAnoDetalhado?.[y]?.pago || 0));
  const topProgramas = [...orcDados].sort((a, b) => num(b.pago) - num(a.pago)).slice(0, 10);

  return `
  <h2>IV. Análise Orçamentária: Investimento em Igualdade Racial (2018-2025)</h2>
  <div class="section">
    <div class="highlight-box">
      <h4>📋 Nota Metodológica</h4>
      <p>A análise orçamentária abrange <strong>${orcStats.totalRegistros || 0} registros</strong> de programas e ações governamentais com componente institucional explícito de igualdade racial (MIR, FUNAI, INCRA, Fundação Palmares, SESAI). Foram excluídos programas universais que beneficiam populações racializadas indiretamente para evitar inflação dos montantes. Os valores são divididos em: <strong>LOA (Orçamento Fiscal)</strong> e <strong>Extraorçamentário (Compensações e Fundos)</strong>.</p>
    </div>

    <h3>Evolução por Período</h3>
    ${dataCards([
      { value: fmtBRL(orcStats.dotacaoPeriodo1 || 0), label: 'Dotação 2018-2022' },
      { value: fmtBRL(orcStats.dotacaoPeriodo2 || 0), label: 'Dotação 2023-2025' },
      { value: `${(orcStats.variacaoDotacao || 0).toFixed(1)}%`, label: 'Variação Dotação', color: (orcStats.variacaoDotacao || 0) > 0 ? '#22c55e' : '#ef4444' },
      { value: fmtBRL(orcStats.pagoPeriodo1 || 0), label: 'Pago 2018-2022' },
      { value: fmtBRL(orcStats.pagoPeriodo2 || 0), label: 'Pago 2023-2025' },
      { value: `${(orcStats.variacaoPago || 0).toFixed(1)}%`, label: 'Variação Pago', color: (orcStats.variacaoPago || 0) > 0 ? '#22c55e' : '#ef4444' },
    ])}

    ${yearLabels.length > 0 ? `
    <div class="chart-container">
      <div class="chart-title">Evolução Orçamentária Anual: Dotação vs. Pago</div>
      ${svgBarChart(yearLabels, [
        { name: 'Dotação Autorizada', color: '#3b82f6', values: dotacaoValues },
        { name: 'Pago', color: '#22c55e', values: pagoValues },
      ], 650, 250, 0, undefined, (v) => fmtBRL(v))}
    </div>` : ''}

    <div class="analysis-box">
      <h4>📊 Análise: Perspectiva LOA vs. Financiamento Total</h4>
      <p>O investimento total em igualdade racial cresceu ${(orcStats.variacaoDotacao || 0).toFixed(1)}% em dotação autorizada entre os dois períodos. Contudo, é fundamental distinguir entre o <strong>esforço direto do Tesouro Nacional (LOA)</strong> e o <strong>financiamento compensatório/reativo (extraorçamentário)</strong>. ${orcStats.splitTipoDotacao ? `O componente orçamentário representa ${fmtBRL(orcStats.splitTipoDotacao.orcamentario?.dotP1 + orcStats.splitTipoDotacao.orcamentario?.dotP2 || 0)} em dotação, enquanto o extraorçamentário soma ${fmtBRL(orcStats.splitTipoDotacao.extraorcamentario?.dotP1 + orcStats.splitTipoDotacao.extraorcamentario?.dotP2 || 0)}.` : ''}</p>
      <p>Ao ser lida em conjunto com os artigos da Convenção e com o status das recomendações, a execução orçamentária funciona como teste material da política pública: ela mostra se a reconstrução institucional posterior a 2023 foi acompanhada de escala financeira compatível ou se permaneceu aquém da magnitude das desigualdades registradas nas bases estatísticas.</p>
    </div>

    ${topProgramas.length > 0 ? `<h3>Programas com maior volume pago</h3>${renderBudgetProgramsTable(topProgramas)}` : ''}

    ${orcStats.sesaiTotal > 0 ? `
    <div class="budget-box">
      <h4>🏥 Destaque: SESAI (Saúde Indígena)</h4>
      <p>A Secretaria de Saúde Indígena responde por <strong>${fmtBRL(orcStats.sesaiTotal)}</strong> do total (${orcStats.sesaiRegistros} registros), representando o maior programa singular de atenção étnico-racial do governo federal. Os valores pagos saltaram de ${fmtBRL(orcStats.sesaiPagoP1)} (2018-2022) para ${fmtBRL(orcStats.sesaiPagoP2)} (2023-2025).</p>
    </div>` : ''}

    <div class="gap-box">
      <h4>⚠️ Programas Universais Excluídos</h4>
      <p>Foram excluídos da análise 7 programas governamentais de escopo amplo (Agendas Transversais PPA, Minha Casa Minha Vida, FEFC, Fundo Amazônia, Urbanização de Favelas, Proteção de TIs, Operação Acolhida) que beneficiam indiretamente populações racializadas mas não constituem políticas específicas de igualdade racial, totalizando aproximadamente R$ 461 bilhões em dotação que distorceriam a análise.</p>
    </div>
  </div>`;
}

function renderNormativeBase(normativos: any[]): string {
  if (normativos.length === 0) {
    return `
    <h2>V. Base Normativa e Marco Legislativo (2018-2025)</h2>
    <div class="section">
      <p>O período 2018-2025 foi marcado por intensas transformações legislativas e institucionais, que podem ser divididas em duas fases distintas:</p>
      <h3>Fase 1: Desmonte Institucional (2019-2022)</h3>
      <ul>
        <li>Extinção do Ministério dos Direitos Humanos com status ministerial pleno</li>
        <li>Redução do orçamento da FUNAI e enfraquecimento da fiscalização</li>
        <li>Paralisia na titulação de territórios quilombolas e demarcação de terras indígenas</li>
      </ul>
      <h3>Fase 2: Reconstrução Institucional (2023-2025)</h3>
      <table>
        <thead><tr><th>Norma</th><th>Ano</th><th>Descrição</th><th>Impacto</th></tr></thead>
        <tbody>
          <tr><td><strong>Lei 14.532/2023</strong></td><td>2023</td><td>Equipara injúria racial ao crime de racismo</td><td><span class="badge badge-success">Alto</span></td></tr>
          <tr><td><strong>Lei 14.723/2023</strong></td><td>2023</td><td>Renova cotas no ensino superior por 10 anos</td><td><span class="badge badge-success">Alto</span></td></tr>
          <tr><td><strong>Decreto 11.786/2023</strong></td><td>2023</td><td>PNGTAQ - Gestão Territorial Quilombola</td><td><span class="badge badge-success">Alto</span></td></tr>
          <tr><td><strong>Decreto 11.956/2024</strong></td><td>2024</td><td>Programa Juventude Negra Viva</td><td><span class="badge badge-info">Médio</span></td></tr>
          <tr><td><strong>Criação MIR</strong></td><td>2023</td><td>Ministério da Igualdade Racial</td><td><span class="badge badge-success">Alto</span></td></tr>
          <tr><td><strong>Criação MPI</strong></td><td>2023</td><td>Ministério dos Povos Indígenas</td><td><span class="badge badge-success">Alto</span></td></tr>
        </tbody>
      </table>
    </div>`;
  }

  const porCategoria: Record<string, any[]> = {};
  normativos.forEach(n => {
    const cat = n.categoria || 'outros';
    if (!porCategoria[cat]) porCategoria[cat] = [];
    porCategoria[cat].push(n);
  });

  return `
  <h2>V. Base Normativa e Marco Legislativo (2018-2025)</h2>
  <div class="section">
    <p>O acervo normativo catalogado compreende <strong>${normativos.length} documentos</strong> entre legislações, políticas públicas, atos administrativos e compromissos internacionais. A análise distingue duas fases: o desmonte institucional (2019-2022) e a reconstrução (2023-2025), com a criação do MIR e MPI como marcos fundamentais.</p>
    ${dataCards([
      { value: `${normativos.length}`, label: 'Documentos Catalogados' },
      { value: `${porCategoria['legislacao']?.length || 0}`, label: 'Legislações' },
      { value: `${porCategoria['politica']?.length || 0}`, label: 'Políticas Públicas' },
      { value: `${normativos.filter((n: any) => (n.artigos_convencao || []).length > 0).length}`, label: 'Vinculados a Artigos ICERD' },
    ])}
    <table>
      <thead><tr><th>Documento</th><th>Categoria</th><th>Artigos ICERD</th><th>Status</th></tr></thead>
      <tbody>${normativos.slice(0, 20).map((n: any) => `<tr>
        <td>${n.titulo}</td>
        <td>${n.categoria}</td>
        <td>${(n.artigos_convencao || []).join(', ') || '—'}</td>
        <td>${n.status || '—'}</td>
      </tr>`).join('')}</tbody>
    </table>
    <div class="analysis-box">
      <h4>🔗 Como a base normativa entra na interpretação do relatório</h4>
      <p>Os documentos acima não são apresentados como seção isolada ou prova autossuficiente de cumprimento. Eles são lidos em correlação com as séries estatísticas, com a execução orçamentária e com o status das recomendações: quando há norma sem melhoria estatística, o relatório registra implementação insuficiente; quando há melhora estatística sustentada por novos atos e orçamento, o relatório aponta avanço mais consistente.</p>
    </div>
  </div>`;
}

function renderIntersectionalAnalysis(indicadores: IndicadorInterseccional[], lacunas: LacunaIdentificada[]): string {
  const porCategoria: Record<string, number> = {};
  indicadores.forEach(i => { porCategoria[i.categoria] = (porCategoria[i.categoria] || 0) + 1; });
  
  const comDesagRaca = indicadores.filter(i => i.desagregacao_raca).length;
  const comDesagGenero = indicadores.filter(i => i.desagregacao_genero).length;
  const comDesagIdade = indicadores.filter(i => i.desagregacao_idade).length;

  const gruposLacunas: Record<string, number> = {};
  lacunas.forEach(l => { gruposLacunas[l.grupo_focal] = (gruposLacunas[l.grupo_focal] || 0) + 1; });

  return `
  <h2>VI. Análise Interseccional</h2>
  <div class="section">
    <p>O Brasil mantém <strong>${indicadores.length} indicadores estatísticos</strong> desagregados no sistema de monitoramento, dos quais ${comDesagRaca} possuem desagregação por raça/cor, ${comDesagGenero} por gênero e ${comDesagIdade} por idade. Esta capacidade de desagregação é essencial para a identificação de disparidades interseccionais conforme recomendação reiterada do Comitê.</p>

    <h3>Indicadores por Categoria</h3>
    ${svgBarChart(
      Object.keys(porCategoria).slice(0, 10),
      [{ name: 'Indicadores', color: '#3b82f6', values: Object.values(porCategoria).slice(0, 10) }],
      650, 250
    )}

    <h3>Distribuição das Recomendações por Grupo Focal</h3>
    ${svgDonutChart(
      Object.entries(gruposLacunas).map(([g, v]) => ({
        label: grupoLabels[g] || g,
        value: v,
        color: ['#3b82f6','#ef4444','#22c55e','#eab308','#8b5cf6','#f97316','#14b8a6','#ec4899','#6366f1','#84cc16','#64748b'][Object.keys(gruposLacunas).indexOf(g) % 11],
      }))
    )}

    <div class="analysis-box">
      <h4>🔍 Lacunas de Interseccionalidade</h4>
      <p>Apesar dos avanços na desagregação de dados, persistem lacunas significativas para grupos como <strong>LGBTQIA+ negros</strong> (dados limitados ao Disque 100), <strong>PcD negros</strong> (sem série temporal completa) e <strong>Povos Ciganos</strong> (primeira contagem apenas no Censo 2022 com ${fmtNum(41738)} pessoas). O Comitê recomenda fortemente a ampliação da coleta de dados interseccionais para esses grupos sub-representados.</p>
    </div>
  </div>`;
}

function renderTraditionalPeoples(povos: any): string {
  return `
  <h2>VII. Povos Tradicionais</h2>
  <div class="section">
    <h3>A. Povos Indígenas</h3>
    <div class="highlight-box">
      <p><strong>População:</strong> ${fmtNum(povos?.indigenas?.populacaoCorRaca || 1227642)} pessoas (Censo 2022) — ${povos?.indigenas?.etnias || 305} etnias, ${povos?.indigenas?.linguas || 274} línguas</p>
      <p><strong>Territórios:</strong> ${povos?.indigenas?.terrasHomologadas2018_2022 || 0} terras homologadas (2018-2022), ${povos?.indigenas?.terrasHomologadas2023_2025 || 0} em 2023-2025</p>
      <p>Destaque: 63,4% da população indígena reside <strong>fora de Terras Indígenas</strong>, enfrentando vulnerabilidades urbanas e invisibilidade estatística.</p>
    </div>

    <h3>B. Comunidades Quilombolas</h3>
    <div class="highlight-box">
      <p><strong>População:</strong> ${fmtNum(povos?.quilombolas?.populacao || 1327802)} (primeira contagem censitária, 2022)</p>
      <p><strong>Comunidades certificadas:</strong> ${fmtNum(povos?.quilombolas?.comunidadesCertificadas || 3697)}</p>
      <p><strong>Territórios titulados:</strong> ${povos?.quilombolas?.territoriosTitulados || 52} (${povos?.quilombolas?.titulosExpedidos || 80} títulos para ${povos?.quilombolas?.comunidadesAbrangidas || 169} comunidades)</p>
      <p>O PNGTAQ (Decreto 11.786/2023) representa avanço significativo na gestão territorial quilombola.</p>
    </div>

    <h3>C. Comunidades Ciganas</h3>
    <div class="highlight-box">
      <p><strong>População:</strong> ${fmtNum(povos?.ciganos?.populacao || 41738)} (Censo 2022 — primeira contagem oficial)</p>
      <p>A inclusão dos povos ciganos no Censo 2022 é um marco histórico, mas a ausência de séries temporais anteriores limita a análise de evolução das condições de vida desta população.</p>
    </div>
  </div>`;
}

function renderGuidingThreads(fios: FioCondutor[], conclusoes: ConclusaoDinamica[], insights: InsightCruzamento[]): string {
  if (fios.length === 0 && conclusoes.length === 0 && insights.length === 0) return '';

  const fiosHTML = fios.map(f => `
    <div class="fio-condutor">
      <h4>🧵 ${f.titulo}</h4>
      <p>${f.argumento}</p>
      ${f.comparativo2018 ? `<p><em>Comparativo 2018:</em> ${f.comparativo2018}</p>` : ''}
      ${f.evidencias.length > 0 ? `<ul>${f.evidencias.slice(0, 4).map(e => `<li><strong>${e.fonte}:</strong> ${e.texto}</li>`).join('')}</ul>` : ''}
    </div>
  `).join('');

  const avancosHTML = conclusoes.filter(c => c.tipo === 'avanco').map(c => `
    <div class="advance-box">
      <h4>✅ ${c.titulo}</h4>
      <p>${c.argumento_central}</p>
    </div>
  `).join('');

  const retrocHTML = conclusoes.filter(c => c.tipo === 'retrocesso').map(c => `
    <div class="regress-box">
      <h4>🔴 ${c.titulo}</h4>
      <p>${c.argumento_central}</p>
    </div>
  `).join('');

  const lacunasPersist = conclusoes.filter(c => c.tipo === 'lacuna_persistente').map(c => `
    <div class="gap-box">
      <h4>⚠️ ${c.titulo}</h4>
      <p>${c.argumento_central}</p>
    </div>
  `).join('');

  const insightsHTML = insights.length > 0 ? `
    <h3>Cruzamentos Analíticos</h3>
    ${insights.map(i => `
      <div class="analysis-box">
        <h4>${i.tipo === 'alerta' ? '🚨' : i.tipo === 'progresso' ? '📈' : '🔗'} ${i.titulo}</h4>
        <p>${i.descricao}</p>
      </div>
    `).join('')}
  ` : '';

  return `
  <h2>V. Fios Condutores Analíticos e Síntese Cruzada</h2>
  <div class="section">
    <p>A análise cruzada entre as bases estatística, orçamentária, normativa e de recomendações revela <strong>${fios.length} fios condutores</strong> que estruturam a narrativa do período, junto a ${conclusoes.filter(c => c.tipo === 'avanco').length} avanços, ${conclusoes.filter(c => c.tipo === 'retrocesso').length} retrocessos e ${conclusoes.filter(c => c.tipo === 'lacuna_persistente').length} lacunas persistentes.</p>
    
    <h3>Fios Condutores</h3>
    ${fiosHTML}

    ${avancosHTML ? `<h3>Avanços Consolidados</h3>${avancosHTML}` : ''}
    ${retrocHTML ? `<h3>Retrocessos e Alertas</h3>${retrocHTML}` : ''}
    ${lacunasPersist ? `<h3>Lacunas Persistentes</h3>${lacunasPersist}` : ''}
    ${insightsHTML}
  </div>`;
}

function renderConclusions(d: CerdIVFullData, total: number, cumpridas: number, parciais: number, naoCumpridas: number, retrocessos: number): string {
  const pctAvanco = total > 0 ? ((cumpridas + parciais) / total * 100).toFixed(1) : '0';
  const variacao = d.orcStats?.variacaoPago || 0;
  const totalNormativos = d.normativos?.length || 0;
  const totalOrc = d.orcDados?.length || 0;
  const totalFios = d.fiosCondutores?.length || 0;
  const indicadoresCriticos = d.indicadores.filter(i => ['piora', 'estável_negativo', 'decrescente'].includes(i.tendencia || '')).length;

  return `
  <h2>VI. Conclusões e Compromissos</h2>
  <div class="section">
    <div class="highlight-box">
      <h4>Veredito Geral</h4>
      <p>O Brasil apresenta <strong>reconstrução institucional e normativa relevante a partir de 2023</strong>, refletida em ${totalNormativos} marcos normativos catalogados, ${totalOrc} registros orçamentários rastreados e ${totalFios} fios condutores produzidos pela análise cruzada do sistema. Ainda assim, <strong>${naoCumpridas + retrocessos} de ${total} recomendações permanecem não cumpridas ou em retrocesso</strong>, e ${indicadoresCriticos} indicadores seguem registrando piora, estagnação negativa ou persistência de assimetrias raciais. A conclusão, portanto, é de avanço parcial e desigual: houve melhora institucional, mas a transformação material continua incompleta.</p>
    </div>

    <div class="analysis-box">
      <h4>Leitura final integrada</h4>
      <p>Quando o relatório entrelaça estatística, orçamento, normativa, recomendações e narrativas analíticas, o padrão que emerge é claro: o país avançou mais na <strong>capacidade formal de responder</strong> do que na <strong>velocidade substantiva de reversão da desigualdade racial</strong>. Em educação, orçamento institucional e reconstrução ministerial, há sinais de melhora. Em segurança pública, mortalidade materna negra, desigualdade de renda, reparação e efetividade territorial, persistem déficits que impedem afirmar cumprimento robusto da Convenção.</p>
    </div>

    <h3>Síntese por Dimensão</h3>
    <table>
      <thead><tr><th>Dimensão</th><th>Tendência 2018→2025</th><th>Avaliação</th></tr></thead>
      <tbody>
        <tr><td><strong>Marco Legal e Institucional</strong></td><td>Desmonte (2019-22) → Reconstrução (2023+)</td><td><span class="badge badge-success">Avanço</span></td></tr>
        <tr><td><strong>Segurança Pública</strong></td><td>Violência racial persistente; letalidade policial crescente</td><td><span class="badge badge-danger">Retrocesso</span></td></tr>
        <tr><td><strong>Educação</strong></td><td>Aumento acesso superior (+6,4pp negros); cotas renovadas</td><td><span class="badge badge-success">Avanço Parcial</span></td></tr>
        <tr><td><strong>Saúde</strong></td><td>Mortalidade materna negra persiste elevada; COVID impactou</td><td><span class="badge badge-warning">Estagnação</span></td></tr>
        <tr><td><strong>Trabalho e Renda</strong></td><td>Redução desemprego; gap salarial persiste (~40%)</td><td><span class="badge badge-warning">Avanço Parcial</span></td></tr>
        <tr><td><strong>Terra e Território</strong></td><td>Retomada demarcações/titulações em 2023+</td><td><span class="badge badge-success">Avanço</span></td></tr>
        <tr><td><strong>Dados Interseccionais</strong></td><td>Censo 2022 incluiu quilombolas e ciganos pela 1ª vez</td><td><span class="badge badge-success">Avanço</span></td></tr>
        <tr><td><strong>Orçamento</strong></td><td>Aumento ${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}% (pago); mas gap execução persiste</td><td><span class="badge badge-warning">Avanço Parcial</span></td></tr>
      </tbody>
    </table>

    <h3>Recomendações Prioritárias para o Próximo Ciclo</h3>
    <ol>
      <li><strong>Segurança Pública:</strong> Implementar mecanismos efetivos de redução da letalidade policial contra jovens negros, com metas mensuráveis e accountability</li>
      <li><strong>Terra e Território:</strong> Acelerar titulações quilombolas e demarcações indígenas, garantindo orçamento adequado para INCRA e FUNAI</li>
      <li><strong>Interseccionalidade:</strong> Ampliar a coleta sistemática de dados para LGBTQIA+ negros, PcD negros e povos ciganos</li>
      <li><strong>Execução Orçamentária:</strong> Reduzir o gap entre dotação autorizada e valores pagos, combatendo o "orçamento simbólico"</li>
      <li><strong>Saúde:</strong> Enfrentar a mortalidade materna negra com políticas específicas de pré-natal de qualidade</li>
      <li><strong>Efetividade Legal:</strong> Garantir que os avanços legislativos (Lei 14.532, cotas) se traduzam em mudanças mensuráveis nos indicadores</li>
    </ol>

    <div class="analysis-box">
      <h4>📌 Nota Final</h4>
      <p>O Brasil dispõe hoje de um aparato institucional e normativo robusto para o combate à discriminação racial — MIR, MPI, Fundação Palmares, sistema de cotas, legislação antirracista. O desafio fundamental não é mais a ausência de instrumentos legais, mas a <strong>tradução efetiva dessas normas em mudanças estruturais nos indicadores de desigualdade</strong>. Este é o paradoxo central que define a agenda brasileira de igualdade racial para o próximo ciclo de relatórios ao Comitê CERD.</p>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════
// CROSS-REFERENCE TABLE (body — summarized)
// ═══════════════════════════════════════════

function renderCrossReferenceTable(lacunas: LacunaIdentificada[], indicadores: IndicadorInterseccional[], orcDados: DadoOrcamentario[], normativos: any[]): string {
  const artigos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const rows = artigos.map(art => {
    const artLacunas = lacunas.filter(l => {
      const explicit = ((l as any).artigos_convencao || []).filter((a: string) => artigos.includes(a));
      if (explicit.length > 0) return explicit.includes(art);
      return (EIXO_PARA_ARTIGOS[l.eixo_tematico] || []).includes(art as any);
    });
    const artInd = indicadores.filter(i => inferArtigosIndicador(i).includes(art as any));
    const artOrc = orcDados.filter(o => inferArtigosOrcamento(o).includes(art as any));
    const artNorm = normativos.filter((n: any) => {
      const explicit = (n.artigos_convencao || []).filter((a: string) => artigos.includes(a));
      if (explicit.length > 0) return explicit.includes(art);
      return inferArtigosDocumentoNormativo({ titulo: n.titulo || '', categoria: n.categoria, secoes_impactadas: n.secoes_impactadas, recomendacoes_impactadas: n.recomendacoes_impactadas }).includes(art as any);
    });
    const porStatus: Record<string, number> = {};
    artLacunas.forEach(l => { porStatus[l.status_cumprimento] = (porStatus[l.status_cumprimento] || 0) + 1; });
    const cumprido = (porStatus.cumprido || 0) + (porStatus.parcialmente_cumprido || 0);
    const critico = (porStatus.nao_cumprido || 0) + (porStatus.retrocesso || 0);
    const evolution = summarizeIndicatorEvolution(artInd);

    return `<tr>
      <td><strong>Art. ${art}</strong></td>
      <td style="text-align:center">${artLacunas.length}</td>
      <td style="text-align:center"><span class="badge badge-success">${cumprido}</span> / <span class="badge badge-danger">${critico}</span></td>
      <td style="text-align:center">${artInd.length} <span style="font-size:7.5pt;color:#64748b">(${evolution.favoraveis}↑ ${evolution.desfavoraveis}↓)</span></td>
      <td style="text-align:center">${artOrc.length}</td>
      <td style="text-align:center">${artNorm.length}</td>
    </tr>`;
  }).join('');

  return `
  <div style="page-break-before:always"></div>
  <h2>III. Cruzamento: Recomendações × Artigos × Evidências</h2>
  <div class="section">
    <p>O quadro a seguir sintetiza, para cada Artigo da Convenção ICERD, o quantitativo de recomendações, indicadores, ações orçamentárias e normativos vinculados, com o status consolidado de cumprimento. O detalhamento completo de cada base está nos Anexos C, D e E.</p>
    <table>
      <thead><tr><th>Artigo</th><th>Recomendações</th><th>Atendidas / Déficit</th><th>Indicadores</th><th>Ações Orçam.</th><th>Normativos</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:9pt;color:#64748b"><em>Legenda indicadores: ↑ = favorável/novo, ↓ = piora. Detalhamento completo no Anexo C.</em></p>
  </div>`;
}

// ═══════════════════════════════════════════
// ANNEX C — Full Indicator Tables per Article
// ═══════════════════════════════════════════

function renderAnnexC(indicadores: IndicadorInterseccional[]): string {
  const artigos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const sections = artigos.map(art => {
    const artInd = indicadores.filter(i => inferArtigosIndicador(i).includes(art as any));
    if (artInd.length === 0) return '';
    return `
      <h3>Artigo ${art} — ${artInd.length} indicador(es)</h3>
      ${renderFullIndicatorTable(artInd)}`;
  }).filter(Boolean).join('');

  if (!sections) return '';

  return `
  <div style="page-break-before:always"></div>
  <h2>ANEXO C — Base Estatística Completa por Artigo</h2>
  <p>Listagem integral de todos os indicadores interseccionais vinculados a cada artigo da Convenção ICERD, com evolução temporal (valor antigo → recente) e classificação de tendência. Exclui duplicidades e indicadores de Common Core.</p>
  ${sections}`;
}

// ═══════════════════════════════════════════
// ANNEX D — Full Budget + Methodology per Article
// ═══════════════════════════════════════════

function renderAnnexD(orcDados: DadoOrcamentario[], orcStats: any, indicadores: IndicadorInterseccional[], normativos: any[], lacunas: LacunaIdentificada[], respostas: RespostaLacunaCerdIII[]): string {
  const artigos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  
  // Methodology diagram
  const diagramHTML = `
    <h3>Diagrama Metodológico — Pipeline de Cruzamento</h3>
    <p>O relatório é produzido pelo cruzamento automatizado de quatro bases de dados independentes, correlacionadas pelos Artigos I-VII da Convenção ICERD:</p>
    <div class="chart-container">
      ${renderMethodologyDiagram(indicadores.length, orcDados.length, normativos.length, lacunas.length, respostas.length)}
    </div>`;

  // Budget analysis
  const budgetHTML = renderBudgetAnalysis(orcStats, orcDados);

  // Per-article budget
  const sections = artigos.map(art => {
    const artOrc = orcDados.filter(o => inferArtigosOrcamento(o).includes(art as any));
    if (artOrc.length === 0) return '';
    return `
      <h3>Artigo ${art} — ${artOrc.length} ação(ões) orçamentária(s)</h3>
      ${renderFullBudgetTable(artOrc)}`;
  }).filter(Boolean).join('');

  return `
  <div style="page-break-before:always"></div>
  <h2>ANEXO D — Ações Orçamentárias por Artigo + Metodologia</h2>
  <p>Detalhamento completo das ações orçamentárias vinculadas a cada artigo, com dotação, valores pagos e taxa de execução, precedido do diagrama metodológico e da análise orçamentária consolidada.</p>
  ${diagramHTML}
  ${budgetHTML}
  ${sections}`;
}

// ═══════════════════════════════════════════
// ANNEX E — Full Normative + Timeline per Article
// ═══════════════════════════════════════════

function renderAnnexE(normativos: any[]): string {
  const artigos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  
  // Timeline
  const timelineHTML = normativos.length > 0 ? renderNormativeTimeline(normativos) : '';

  // Normative base summary
  const normBaseHTML = renderNormativeBase(normativos);

  // Per-article normatives
  const sections = artigos.map(art => {
    const artNorm = normativos.filter((n: any) => {
      const explicit = (n.artigos_convencao || []).filter((a: string) => artigos.includes(a));
      if (explicit.length > 0) return explicit.includes(art);
      return inferArtigosDocumentoNormativo({ titulo: n.titulo || '', categoria: n.categoria, secoes_impactadas: n.secoes_impactadas, recomendacoes_impactadas: n.recomendacoes_impactadas }).includes(art as any);
    });
    if (artNorm.length === 0) return '';
    return `
      <h3>Artigo ${art} — ${artNorm.length} instrumento(s) normativo(s)</h3>
      ${renderFullNormativeTable(artNorm)}`;
  }).filter(Boolean).join('');

  return `
  <div style="page-break-before:always"></div>
  <h2>ANEXO E — Instrumentos Normativos por Artigo + Linha do Tempo</h2>
  <p>Listagem completa dos marcos legislativos, políticas públicas e atos administrativos vinculados a cada artigo da Convenção ICERD, com linha do tempo visual 2018-2025.</p>
  ${timelineHTML}
  ${normBaseHTML}
  ${sections}`;
}
