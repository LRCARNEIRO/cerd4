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
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, inferArtigosOrcamento } from '@/utils/artigosConvencao';
import { getExportToolbarHTML } from '@/utils/reportExportToolbar';
import { svgLineChart, svgBarChart, svgDonutChart, fmtBRL, fmtNum, dataCards, trend } from './cerdiv/chartUtils';
import {
  segurancaPublica as hcSeguranca, feminicidioSerie as hcFeminicidio,
  educacaoSerieHistorica as hcEducacao, saudeSerieHistorica as hcSaude,
  indicadoresSocioeconomicos as hcSocioEco, povosTradicionais as hcPovos,
  dadosDemograficos as hcDemograficos, evolucaoDesigualdade as hcEvolDesig,
} from '@/components/estatisticas/StatisticsData';

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
@page { size: A4; margin: 2cm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Open Sans', sans-serif; font-size: 10.5pt; line-height: 1.65; color: #1a1a2e; max-width: 21cm; margin: 0 auto; padding: 2cm; background: white; }
.header { text-align: center; margin-bottom: 2cm; border-bottom: 3px solid #1e3a5f; padding-bottom: 1.5cm; }
.header h1 { font-family: 'Merriweather', serif; font-size: 17pt; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 1px; }
.header .subtitle { font-size: 13pt; margin-top: 0.4cm; color: #2c5282; }
.header .date { font-size: 11pt; margin-top: 0.4cm; font-style: italic; color: #64748b; }
.un-logo { text-align: center; font-size: 32pt; margin-bottom: 0.8cm; }
h2 { font-family: 'Merriweather', serif; font-size: 14pt; font-weight: 700; margin-top: 1.5cm; margin-bottom: 0.5cm; color: #1e3a5f; border-bottom: 2px solid #c7a82b; padding-bottom: 0.3cm; page-break-after: avoid; }
h3 { font-family: 'Merriweather', serif; font-size: 12pt; font-weight: 700; margin-top: 1cm; margin-bottom: 0.3cm; color: #2c5282; }
h4 { font-size: 11pt; font-weight: 600; margin-top: 0.7cm; margin-bottom: 0.2cm; color: #334155; }
p { text-align: justify; margin-bottom: 0.4cm; }
.section { margin-bottom: 1.5cm; page-break-inside: avoid; }
.highlight-box { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 0.7cm; margin: 0.5cm 0; border-left: 4px solid #1e3a5f; border-radius: 0 8px 8px 0; }
.analysis-box { background: #f0f4ff; padding: 0.7cm; margin: 0.5cm 0; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; }
.advance-box { background: #ecfdf5; padding: 0.7cm; margin: 0.5cm 0; border-left: 4px solid #22c55e; border-radius: 0 8px 8px 0; }
.regress-box { background: #fef2f2; padding: 0.7cm; margin: 0.5cm 0; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; }
.gap-box { background: #fffbeb; padding: 0.7cm; margin: 0.5cm 0; border-left: 4px solid #eab308; border-radius: 0 8px 8px 0; }
.budget-box { background: #faf5ff; padding: 0.7cm; margin: 0.5cm 0; border-left: 4px solid #8b5cf6; border-radius: 0 8px 8px 0; }
.normative-box { background: #f0fdfa; padding: 0.7cm; margin: 0.5cm 0; border-left: 4px solid #14b8a6; border-radius: 0 8px 8px 0; }
.paragraph-ref { font-weight: 700; color: #1e3a5f; font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
table { width: 100%; border-collapse: collapse; margin: 0.5cm 0; font-size: 9.5pt; }
th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; }
th { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; font-weight: 600; }
tr:nth-child(even) { background: #f8fafc; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 8.5pt; font-weight: 600; }
.badge-success { background: #dcfce7; color: #166534; } .badge-warning { background: #fef3c7; color: #92400e; } .badge-danger { background: #fee2e2; color: #991b1b; } .badge-info { background: #dbeafe; color: #1e40af; }
.data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.5cm; margin: 0.5cm 0; }
.data-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.6cm; text-align: center; }
.data-card-value { font-size: 20pt; font-weight: 700; color: #1e3a5f; }
.data-card-label { font-size: 8.5pt; color: #64748b; margin-top: 0.2cm; }
.chart-container { margin: 0.5cm 0; padding: 0.3cm; background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; }
.chart-title { font-size: 10pt; font-weight: 600; color: #1e3a5f; margin-bottom: 0.3cm; }
.toc { margin: 1cm 0; padding: 1cm; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.toc h3 { margin-top: 0; color: #1e3a5f; }
.toc ul { list-style: none; padding-left: 0; }
.toc li { margin: 0.25cm 0; padding-left: 1cm; position: relative; }
.toc li::before { content: "→"; position: absolute; left: 0; color: #c7a82b; }
ul, ol { margin-left: 1cm; margin-bottom: 0.4cm; }
li { margin-bottom: 0.15cm; }
.footer { margin-top: 2cm; padding-top: 1cm; border-top: 2px solid #1e3a5f; font-size: 8.5pt; text-align: center; color: #64748b; }
.fio-condutor { background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); padding: 0.7cm; margin: 0.5cm 0; border-left: 4px solid #d97706; border-radius: 0 8px 8px 0; }
.print-instructions { background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); padding: 1cm; margin-bottom: 1cm; border: 1px solid #3b82f6; border-radius: 8px; }
@media print { .print-instructions { display: none; } body { padding: 0; } }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1cm; }
.status-cumprido { color: #166534; font-weight: 600; } .status-parcial { color: #ca8a04; font-weight: 600; } .status-nao { color: #dc2626; font-weight: 600; }
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

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CERD/C/BRA/21-23 - Relatório Periódico Combinado</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${STYLES}</style>
</head>
<body>
  <div class="print-instructions">
    <strong>📄 Para salvar como PDF:</strong> Ctrl+P → "Salvar como PDF". <strong>📝 DOCX:</strong> Use o botão DOCX na interface do sistema.
  </div>

  ${renderCover(d, total, cumpridas, parciais, naoCumpridas, retrocessos, emAndamento)}
  ${renderTOC()}
  ${renderIntroduction(d, demo, total, cumpridas, parciais, naoCumpridas, retrocessos)}
  ${renderDemographicContext(demo)}
  ${renderRespostasCerdIII(d.respostas, d.lacunas, d.indicadores, d.orcStats)}
  ${renderArticleAnalysis(d, seg, fem, edu, sau, eco, evolDesig, povos)}
  ${renderBudgetAnalysis(d.orcStats, d.orcDados || [])}
  ${renderNormativeBase(d.normativos || [])}
  ${renderIntersectionalAnalysis(d.indicadores, d.lacunas)}
  ${renderTraditionalPeoples(povos)}
  ${renderGuidingThreads(d.fiosCondutores || [], d.conclusoesDinamicas || [], d.insightsCruzamento || [])}
  ${renderConclusions(d, total, cumpridas, parciais, naoCumpridas, retrocessos)}

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
    { value: `${d.indicadores.length}`, label: 'Indicadores Estatísticos' },
  ])}`;
}

function renderTOC(): string {
  return `
  <div class="toc">
    <h3>Sumário</h3>
    <ul>
      <li><strong>I.</strong> Introdução, Metodologia e Contexto Demográfico</li>
      <li><strong>II.</strong> Respostas às Observações Finais do CERD III (CERD/C/BRA/CO/18-20)</li>
      <li><strong>III.</strong> Análise Temática por Artigos da Convenção ICERD (I-VII)</li>
      <li><strong>IV.</strong> Análise Orçamentária: Investimento em Igualdade Racial</li>
      <li><strong>V.</strong> Base Normativa e Marco Legislativo (2018-2025)</li>
      <li><strong>VI.</strong> Análise Interseccional</li>
      <li><strong>VII.</strong> Povos Tradicionais: Indígenas, Quilombolas e Comunidades Específicas</li>
      <li><strong>VIII.</strong> Fios Condutores Analíticos e Síntese Cruzada</li>
      <li><strong>IX.</strong> Conclusões, Vereditos e Compromissos</li>
    </ul>
  </div>`;
}

function renderIntroduction(d: CerdIVFullData, demo: any, total: number, cumpridas: number, parciais: number, naoCumpridas: number, retrocessos: number): string {
  const pctAvancos = total > 0 ? ((cumpridas + parciais) / total * 100).toFixed(1) : '0';
  const pctCritico = total > 0 ? ((naoCumpridas + retrocessos) / total * 100).toFixed(1) : '0';
  
  return `
  <h2>I. Introdução e Contexto</h2>
  <div class="section">
    <p>A República Federativa do Brasil submete seus relatórios periódicos combinados (21º a 23º) ao Comitê para a Eliminação da Discriminação Racial, em conformidade com o artigo 9 da Convenção. Este relatório abrange o período de 2018 a 2025, marcado por profundas transformações institucionais: o desmonte de políticas raciais (2019-2022) seguido da reconstrução institucional a partir de 2023, com a criação do Ministério da Igualdade Racial (MIR) e do Ministério dos Povos Indígenas (MPI).</p>

    <div class="highlight-box">
      <h4>📋 Metodologia</h4>
      <p>Este relatório foi elaborado com base em ${d.indicadores.length} indicadores estatísticos desagregados por raça/cor, ${total} recomendações das Observações Finais de 2022 sistematicamente analisadas, dados orçamentários de ${d.orcStats?.totalRegistros || 0} registros (2018-2025), e ${d.normativos?.length || 0} documentos normativos catalogados. A análise utiliza cruzamento automatizado entre bases de dados para garantir fundamentação empírica das conclusões.</p>
      <p>As fontes primárias são: IBGE (Censo 2022, PNAD Contínua), DataSUS (SIM, SINASC), FBSP (Anuário de Segurança Pública), SIOP/Portal da Transparência, CNJ, INEP e Atlas da Violência. Todos os dados foram verificados por auditoria manual com referência cruzada às tabelas-fonte oficiais.</p>
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

function renderRespostasCerdIII(respostas: RespostaLacunaCerdIII[], lacunas: LacunaIdentificada[], indicadores: IndicadorInterseccional[], orcStats: any): string {
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
      ${r.justificativa_avaliacao ? `<p><strong>Avaliação técnica:</strong> ${r.justificativa_avaliacao}</p>` : ''}
      ${indicadoresRef}
      ${lacunasRem}
    </div>`;
  }).join('');

  return `
  <h2>II. Respostas às Observações Finais (CERD/C/BRA/CO/18-20)</h2>
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

function inferArtigosIndicador(ind: IndicadorInterseccional): string[] {
  return ((ind as any).artigos_convencao || []) as string[];
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

function renderArticleAnalysis(d: CerdIVFullData, seg: any[], fem: any[], edu: any[], sau: any[], eco: any[], evolDesig: any[], povos: any): string {
  const sections = ARTIGOS_CONVENCAO.map((info) => {
    const artigo = info.numero;
    const artigoLacunas = d.lacunas.filter(l => ((l as any).artigos_convencao || EIXO_PARA_ARTIGOS[l.eixo_tematico] || []).includes(artigo));
    const artigoOrc = (d.orcDados || []).filter(o => inferArtigosOrcamento(o).includes(artigo as any));
    const artigoNormativos = (d.normativos || []).filter((n: any) => ((n.artigos_convencao || []).length ? (n.artigos_convencao || []).includes(artigo) : false));
    const artigoIndicadores = d.indicadores.filter(i => inferArtigosIndicador(i).includes(artigo));
    const chartsHTML = buildEvidenceHighlights(artigo, d, seg, fem, edu, sau, eco, evolDesig, povos);
    const narrativeHTML = generateArticleAnalysis(artigo, info.tituloCompleto, info.descricao, artigoLacunas, artigoOrc, artigoNormativos, artigoIndicadores, d.fiosCondutores || []);
    const indicatorMatrix = renderArticleIndicatorTable(artigoIndicadores);
    const recommendationMatrix = renderRecommendationMatrix(artigoLacunas);
    const budgetTable = renderBudgetProgramsTable(artigoOrc);
    const normTable = renderNormativeDocsTable(artigoNormativos);

    if (!artigoLacunas.length && !artigoOrc.length && !artigoNormativos.length && !artigoIndicadores.length && !chartsHTML) return '';

    return `
      <h3>Artigo ${artigo} — ${info.titulo}</h3>
      <div class="section">
        ${narrativeHTML}
        ${chartsHTML}
        ${indicatorMatrix ? `<div class="analysis-box"><h4>📊 Base estatística vinculada</h4><p>Os indicadores abaixo foram efetivamente correlacionados ao artigo por vínculo explícito no sistema. Eles funcionam como base empírica para concluir se houve melhoria, estagnação ou retrocesso no período.</p>${indicatorMatrix}</div>` : ''}
        ${recommendationMatrix ? `<div class="highlight-box"><h4>📌 Recomendações, status e fundamentação</h4><p>O quadro a seguir aproxima o texto do Comitê, o status consolidado no sistema e a primeira camada de evidências que justifica cada classificação.</p>${recommendationMatrix}</div>` : ''}
        ${budgetTable ? `<div class="budget-box"><h4>💰 Programas e ações orçamentárias mais relevantes</h4><p>Em vez de tratar o orçamento de forma apartada, o relatório incorpora as ações que ajudam a explicar a capacidade concreta de resposta estatal neste artigo.</p>${budgetTable}</div>` : ''}
        ${normTable ? `<div class="normative-box"><h4>📜 Base normativa entremeada à análise</h4><p>Os atos abaixo estruturam a resposta estatal formal. A leitura do relatório considera esses marcos em conjunto com resultados, não como substitutos do resultado.</p>${normTable}</div>` : ''}
      </div>`;
  }).filter(Boolean).join('');

  return `
    <h2>III. Análise Temática por Artigos da Convenção ICERD</h2>
    <p>Esta seção reorganiza o sistema inteiro sob a lógica superior da Convenção: cada artigo reúne lacunas, recomendações, séries estatísticas, orçamento, normativa e leituras analíticas. Assim, o relatório deixa de separar “estatística”, “orçamento” e “normativa” em silos e passa a responder, artigo por artigo, se houve avanço substantivo, apenas movimentação formal, ou persistência da desigualdade racial.</p>
    ${sections}`;
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
  <h2>VIII. Fios Condutores Analíticos e Síntese Cruzada</h2>
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
  <h2>IX. Conclusões e Compromissos</h2>
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
