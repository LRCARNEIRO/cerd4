/**
 * complementaryInfo.ts — Informações Complementares, Diálogo Sociedade Civil,
 * Considerações Finais e Anexos de Dados Consolidados para o Relatório CERD IV.
 *
 * REGRA SSoT: Nenhuma referência a leis, decretos, PLs, portarias ou
 * resoluções aparece hardcoded. Onde havia, foi substituído por linguagem
 * neutra que remete à Base Normativa cadastrada do sistema.
 */

import type { LacunaIdentificada, IndicadorInterseccional, DadoOrcamentario } from '@/hooks/useLacunasData';
import { fmtBRL, fmtNum } from './chartUtils';

function num(v: unknown): number {
  const p = Number(v); return Number.isFinite(p) ? p : 0;
}

// ═══════════════════════════════════════════
// INFORMAÇÕES COMPLEMENTARES — Guideline CERD/C/2007/1
// ═══════════════════════════════════════════

export function renderComplementaryInfo(): string {
  return `
  <div style="page-break-before:always"></div>
  <h2>Informações Complementares — Guideline CERD/C/2007/1</h2>

  <h3>I. Definição de 'vida pública' e escopo da lei antidiscriminatória</h3>
  <div class="section">
    <p>50. O ordenamento brasileiro interpreta 'vida pública' de forma ampla: abrange as esferas política, econômica, social, cultural e qualquer outro domínio da vida em sociedade, tanto no setor público quanto nas relações privadas de relevância coletiva. Essa interpretação é sustentada pela jurisprudência do STF e pelo arcabouço legal vigente cadastrado na Base Normativa do sistema. O escopo da legislação antidiscriminatória cobre tanto relações verticais (Estado–cidadão) quanto horizontais (entre particulares).</p>
  </div>

  <h3>II. Monitoramento de segregação sem iniciativa estatal direta</h3>
  <div class="section">
    <p>51. O IBGE produz dados sobre distribuição espacial por cor/raça que permitem identificar padrões de segregação residencial. O IPEA publicou estudos sobre segregação racial urbana nas principais regiões metropolitanas, indicadores incorporados ao Plano Nacional de Igualdade Racial vigente.</p>
  </div>

  <h3>III. Antiterrorismo e não-discriminação racial</h3>
  <div class="section">
    <p>52. A legislação brasileira sobre prevenção ao terrorismo foi objeto de pareceres orientativos do MPF reafirmando que não se aplica a movimentos sociais de reivindicação de direitos. O Estado reafirma que o exercício dos direitos de reunião, manifestação e organização coletiva por afro-brasileiros, indígenas e quilombolas não pode ser enquadrado em qualquer tipo penal antiterrorista.</p>
  </div>

  <h3>IV. Direito de sindicalização de não-cidadãos</h3>
  <div class="section">
    <p>53. A Constituição Federal (art. 8.º) garante o direito à livre associação sindical sem distinção de nacionalidade. A legislação migratória vigente reforçou essa garantia ao assegurar ao migrante acesso igualitário ao exercício de atividade laboral.</p>
  </div>

  <h3>V. Ônus da prova em processos cíveis de discriminação racial</h3>
  <div class="section">
    <p>54. O ordenamento brasileiro adota, em regra, o sistema clássico de ônus da prova incumbido ao autor da ação. O MPF publicou manual orientando o uso da inversão do ônus da prova em casos de discriminação racial indireta. As propostas legislativas em tramitação para incorporar inversão expressa do ônus em ações de discriminação racial indireta, quando formalmente cadastradas, constam da Base Normativa do sistema.</p>
  </div>

  <h3>VI. Declaração facultativa do Artigo 14 da Convenção</h3>
  <div class="section">
    <p>55. O Brasil ainda não realizou a declaração facultativa do artigo 14, que reconheceria a competência do Comitê para receber petições individuais. O processo de consulta interministerial encontra-se em curso. O Estado reitera a intenção de avançar nessa direção.</p>
  </div>

  <h3>VII. Declaração de Durban e Década para Afrodescendentes</h3>
  <div class="section">
    <p>56. O Brasil participou ativamente das comemorações de Durban e da Década Internacional dos Afrodescendentes (2015–2024). Os programas executados no âmbito dessa agenda — incluindo portais de dados desagregados, campanhas e prêmios nacionais — têm seus instrumentos formais registrados na Base Normativa do sistema, quando aplicável.</p>
  </div>`;
}

// ═══════════════════════════════════════════
// CONSIDERAÇÕES FINAIS
// ═══════════════════════════════════════════

export function renderConsideracoesFinais(
  total: number, cumpridas: number, parciais: number, naoCumpridas: number, retrocessos: number,
  totalNormativos: number, totalIndicadores: number, variacao: number
): string {
  return `
  <div style="page-break-before:always"></div>
  <h2>Considerações Finais</h2>
  <div class="section">
    <p>57. O presente relatório demonstra que o Brasil vivenciou, entre 2018 e 2025, dois movimentos opostos: um período de desmonte institucional e retrocesso nas políticas de igualdade racial (2019–2022) e um processo de reconstrução e avanço (2023–2025). Esse ciclo — claramente identificável nos dados — impõe ao Estado brasileiro a obrigação não apenas de retomar o que foi desfeito, mas de avançar além dos patamares anteriores para cumprir as obrigações da Convenção.</p>

    <p>58. O sistema CERD4 monitora <strong>${total}</strong> recomendações ONU, das quais <strong>${cumpridas}</strong> foram avaliadas como cumpridas, <strong>${parciais}</strong> como parcialmente cumpridas e <strong>${naoCumpridas}</strong> como não cumpridas, com base em <strong>${totalNormativos}</strong> documentos normativos cadastrados na Base Normativa, <strong>${totalIndicadores}</strong> indicadores estatísticos auditados e variação orçamentária consolidada de <strong>${variacao > 0 ? '+' : ''}${variacao.toFixed(1)}%</strong> entre os períodos analisados.</p>

    <p>59. Os principais avanços do período — incluindo a recomposição da arquitetura institucional de promoção da igualdade racial, a renovação de políticas afirmativas, a retomada de demarcações territoriais e o crescimento exponencial das denúncias e processos judiciais de racismo — encontram-se documentados nos instrumentos normativos cadastrados na Base Normativa do sistema, vinculados aos respectivos Artigos da Convenção.</p>

    <p>60. Os desafios persistentes que exigem ação urgente incluem: a manutenção do risco relativo de homicídio negros/não negros em 2,7× ao longo de todo o período; o crescimento da letalidade policial contra negros; o feminicídio de mulheres negras em trajetória de alta; a persistência das desigualdades de renda; o lento ritmo de titulação de terras quilombolas; a intolerância religiosa em crescimento; e a ausência de Instituição Nacional de Direitos Humanos conforme os Princípios de Paris.</p>

    <p>61. O Estado brasileiro reitera seu compromisso com a Convenção e com as Observações Finais do Comitê. Reconhece que as desigualdades raciais no Brasil são estruturais, históricas e multidimensionais — e que somente políticas deliberadas, sustentadas, adequadamente financiadas e avaliadas com dados desagregados terão a escala e o tempo necessários para reverter séculos de exclusão.</p>
  </div>`;
}

// ═══════════════════════════════════════════
// DIÁLOGO COM A SOCIEDADE CIVIL
// ═══════════════════════════════════════════

export function renderDialogoSociedadeCivil(): string {
  return `
  <div style="page-break-before:always"></div>
  <h2>Diálogo com a Sociedade Civil: Relatório Sombra</h2>
  <p style="font-style:italic;color:#64748b">(Criola, GELEDÉS, Coalizão Negra por Direitos e Comunidade Bahá'í do Brasil)</p>
  <div class="section">
    <p>62. O presente relatório reconhece e acolhe as contribuições do Relatório Sombra apresentado à 108.ª Sessão do Comitê por Criola, GELEDÉS Instituto da Mulher Negra, Coalizão Negra por Direitos e Comunidade Bahá'í do Brasil — quatro organizações que representam décadas de lutas da sociedade civil brasileira pelos direitos da população negra.</p>

    <p>63. O Relatório Sombra identificou, com precisão, o período 2019–2022 como o de maior retrocesso na agenda racial brasileira: extinção de estruturas autônomas de promoção da igualdade racial; redução significativa de gastos do Programa de Enfrentamento ao Racismo; e esvaziamento de conselhos e comitês nacionais com participação da sociedade civil. O Estado reconhece esse diagnóstico como correto.</p>

    <p>64. As respostas institucionais a partir de 2023 — incluindo a recomposição da arquitetura ministerial dedicada à igualdade racial, a renovação das políticas de cotas e o relançamento de planos nacionais — encontram-se materializadas nos instrumentos normativos cadastrados na Base Normativa do sistema, vinculados aos respectivos Artigos da Convenção, com URL oficial quando disponível.</p>

    <p>65. Permanecem pendentes ou em estágio insuficiente de implementação: a superação da austeridade fiscal aplicada às políticas sociais; a revisão da política de drogas e a redução do encarceramento racial; a investigação efetiva e responsabilização pelo assassinato de jovens negros; e a institucionalização plena de programas de proteção a defensores de direitos humanos negros, quilombolas e indígenas.</p>

    <p>66. O Estado reitera o compromisso de institucionalizar e ampliar o diálogo com as organizações que integram o Relatório Sombra — e com a sociedade civil afro-brasileira em sentido amplo — na formulação, monitoramento e avaliação das políticas de igualdade racial.</p>
  </div>`;
}

// ═══════════════════════════════════════════
// ANEXOS DE DADOS CONSOLIDADOS (A.1 — A.7)
// ═══════════════════════════════════════════

export function renderDataAnnexes(
  demo: any, seg: any[], fem: any[], eco: any[], sau: any[],
  edu: any[], indicadores: IndicadorInterseccional[]
): string {
  return `
  <div style="page-break-before:always"></div>
  <h2>Anexos — Dados Consolidados</h2>

  <h3>A.1 — Composição racial da população brasileira (Censo 2022)</h3>
  ${renderComposicaoRacialTable(demo)}

  <h3>A.2 — Indicadores socioeconômicos por raça/cor (2018–2025)</h3>
  ${renderSocioeconomicTable(eco)}

  <h3>A.3 — Indicadores de segurança pública por raça/cor (2018–2024)</h3>
  ${renderSecurityTable(seg)}

  <h3>A.4 — Mortalidade materna por raça/cor (2018–2024)</h3>
  ${renderMaternalMortalityTable(sau)}

  <h3>A.5 — Indicadores educacionais por raça/cor (2018–2024)</h3>
  ${renderEducationTable(edu)}

  <h3>A.6 — Feminicídio por raça (série histórica)</h3>
  ${renderFeminicideTable(fem)}

  <h3>A.7 — Processos judiciais de racismo e denúncias (2020–2025)</h3>
  ${renderJudicialTable(indicadores)}
  `;
}

function renderComposicaoRacialTable(demo: any): string {
  const comp = demo?.composicaoRacial || {};
  const rows = [
    ['Parda', fmtNum(comp.pardos || 92083286), '45,34%', 'IBGE/SIDRA Tab. 9605'],
    ['Branca', fmtNum(comp.brancos || 88252121), '43,46%', 'IBGE/SIDRA Tab. 9605'],
    ['Preta', fmtNum(comp.pretos || 20656458), '10,17%', 'IBGE/SIDRA Tab. 9605'],
    ['Indígena (cor/raça)', fmtNum(comp.indigenas || 1227642), '0,83%', 'IBGE/SIDRA Tab. 9605'],
    ['Amarela', fmtNum(850130), '0,42%', 'IBGE/SIDRA Tab. 9605'],
    ['TOTAL NEGRA (preta+parda)', fmtNum(num(comp.pretos || 20656458) + num(comp.pardos || 92083286)), '55,51%', 'Agregação IBGE'],
    ['Quilombolas (quesito específico)', fmtNum(demo?.populacaoQuilombola || 1330186), '0,65%', 'IBGE/SIDRA Tab. 9578'],
    ['Indígenas (quesito específico)', fmtNum(demo?.populacaoIndigena || 1694836), '0,83%', 'IBGE Censo 2022'],
  ];
  return `<table>
    <thead><tr><th>Grupo racial</th><th>População</th><th>Percentual</th><th>Fonte</th></tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${i === 0 ? ' style="font-weight:600"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

function renderSocioeconomicTable(eco: any[]): string {
  if (!eco.length) return '<p>Dados não disponíveis.</p>';
  return `<table>
    <thead><tr><th>Ano</th><th>Renda negra (R$)</th><th>Renda branca (R$)</th><th>Razão N/B</th><th>Desempr. N (%)</th><th>Desempr. B (%)</th></tr></thead>
    <tbody>${eco.map(e => `<tr>
      <td>${e.ano}</td>
      <td>${fmtNum(num(e.rendaMediaNegra))}</td>
      <td>${fmtNum(num(e.rendaMediaBranca))}</td>
      <td>${(num(e.rendaMediaNegra) / Math.max(num(e.rendaMediaBranca), 1)).toFixed(2)}</td>
      <td>${num(e.desempregoNegro).toFixed(1)}</td>
      <td>${num(e.desempregoBranco).toFixed(1)}</td>
    </tr>`).join('')}</tbody>
  </table>
  <p style="font-size:8.5pt;color:#64748b">Fonte: PNAD Contínua/SIDRA 6402 e 6405; SIS/IBGE 2024 e 2025.</p>`;
}

function renderSecurityTable(seg: any[]): string {
  if (!seg.length) return '<p>Dados não disponíveis.</p>';
  return `<table>
    <thead><tr><th>Ano</th><th>Taxa hom. negros (100 mil)</th><th>Taxa hom. não negros</th><th>Risco relativo</th><th>Vítimas negras hom. (%)</th><th>Vítimas negras let. pol. (%)</th></tr></thead>
    <tbody>${seg.map(s => `<tr>
      <td>${s.ano}</td>
      <td>${s.homicidioNegro != null ? num(s.homicidioNegro).toFixed(1) : 'nd'}</td>
      <td>${s.homicidioBranco != null ? num(s.homicidioBranco).toFixed(1) : 'nd'}</td>
      <td>${s.razaoRisco != null ? num(s.razaoRisco).toFixed(1) + '×' : 'nd'}</td>
      <td>${num(s.percentualVitimasNegras).toFixed(1)}%</td>
      <td>${num(s.letalidadePolicial).toFixed(1)}%</td>
    </tr>`).join('')}</tbody>
  </table>
  <p style="font-size:8.5pt;color:#64748b">Fonte: Atlas da Violência 2025 (IPEA/FBSP); 13.º a 19.º Anuários FBSP (2019–2025).</p>`;
}

function renderMaternalMortalityTable(sau: any[]): string {
  if (!sau.length) return '<p>Dados não disponíveis.</p>';
  return `<table>
    <thead><tr><th>Ano</th><th>MM negras (100 mil NV)</th><th>MM brancas</th><th>Fonte</th></tr></thead>
    <tbody>${sau.map(s => `<tr>
      <td>${s.ano}</td>
      <td>${num(s.mortalidadeMaternaNegra).toFixed(1)}</td>
      <td>${num(s.mortalidadeMaternaBranca).toFixed(1)}</td>
      <td>DataSUS/SIM+SINASC</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderEducationTable(edu: any[]): string {
  if (!edu.length) return '<p>Dados não disponíveis.</p>';
  const first = edu[0];
  const last = edu[edu.length - 1];
  return `<table>
    <thead><tr><th>Indicador</th><th>Negros ${first?.ano || 2018}</th><th>Negros ${last?.ano || 2024}</th><th>Brancos ${last?.ano || 2024}</th><th>Fonte</th></tr></thead>
    <tbody>
      <tr><td>Analfabetismo 15+ anos (%)</td><td>${num(first?.analfabetismoNegro).toFixed(1)}</td><td>${num(last?.analfabetismoNegro).toFixed(1)}</td><td>${num(last?.analfabetismoBranco).toFixed(1)}</td><td>PNAD/SIDRA 7125</td></tr>
      <tr><td>Ensino superior completo (%)</td><td>${num(first?.superiorNegroPercent).toFixed(1)}</td><td>${num(last?.superiorNegroPercent).toFixed(1)}</td><td>${num(last?.superiorBrancoPercent).toFixed(1)}</td><td>PNAD/SIDRA 7129</td></tr>
    </tbody>
  </table>`;
}

function renderFeminicideTable(fem: any[]): string {
  if (!fem.length) return '<p>Dados não disponíveis.</p>';
  return `<table>
    <thead><tr><th>Ano</th><th>Total feminicídios</th><th>% mulheres negras</th><th>Fonte</th></tr></thead>
    <tbody>${fem.map(f => `<tr>
      <td>${f.ano}${f.ano === Math.max(...fem.map((x: any) => x.ano)) ? ' — RECORDE' : ''}</td>
      <td>${fmtNum(num(f.totalFeminicidios))}</td>
      <td>${num(f.percentualNegras).toFixed(1)}%</td>
      <td>FBSP — Anuário Brasileiro de Segurança Pública</td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderJudicialTable(indicadores: IndicadorInterseccional[]): string {
  return `<table>
    <thead><tr><th>Indicador</th><th>2020</th><th>2022</th><th>2023</th><th>2024</th><th>2025</th></tr></thead>
    <tbody>
      <tr><td><strong>Novos processos racismo/injúria racial (CNJ)</strong></td><td>50</td><td>234</td><td>973</td><td>2.874</td><td>4.633</td></tr>
      <tr><td><strong>Denúncias discriminação racial (Disque 100)</strong></td><td>nd</td><td>3.535</td><td>9.738</td><td>14.543</td><td>16.245</td></tr>
      <tr><td><strong>Denúncias intolerância religiosa (Disque 100)</strong></td><td>566</td><td>898</td><td>1.482</td><td>2.472</td><td>2.723</td></tr>
    </tbody>
  </table>
  <p style="font-size:8.5pt;color:#64748b">Fonte: CNJ — Painel Estatísticas/Justiça em Números. ONDH/MDHC — Painel de Dados Disque 100.</p>`;
}
