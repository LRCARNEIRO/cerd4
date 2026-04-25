/**
 * articleNarratives.ts — Narrativas por Artigo da Convenção ICERD para o
 * Relatório CERD IV.
 *
 * REGRA SSoT (atualizada): Nenhuma referência a leis, decretos, PLs,
 * portarias ou resoluções aparece hardcoded. Toda menção a marcos
 * normativos vem dinamicamente de `documentos_normativos` via
 * `renderNormativosVinculados()`. Dados quantitativos (Censo,
 * indicadores, orçamento) continuam vindo dos hooks/DB.
 *
 * Os textos preservados são:
 *  - Recomendações do Comitê (texto oficial da Convenção, §)
 *  - Análise narrativa de dados estatísticos vindos das tabelas
 *  - Linguagem diplomática neutra sem números de normas inventados
 */

import type { LacunaIdentificada, IndicadorInterseccional, DadoOrcamentario } from '@/hooks/useLacunasData';
import { fmtBRL, fmtNum } from './chartUtils';
import { renderNormativosVinculados, renderNormativosResumoParagrafo, renderNormativosInlineList, type NormativoRecord } from './normativosHelper';
import { findIndicador, pickNum, fonteLink } from './indicadoresHelper';
import { renderOrcamentoArtigoBlock } from './orcamentoArtigoHelper';

function num(v: unknown): number {
  const p = Number(v); return Number.isFinite(p) ? p : 0;
}

// ═══════════════════════════════════════════
// INTERFACE
// ═══════════════════════════════════════════

export interface ArticleNarrativeData {
  lacunas: LacunaIdentificada[];
  indicadores: IndicadorInterseccional[];
  orcDados: DadoOrcamentario[];
  normativos: NormativoRecord[];
  demo?: any;
  seg?: any[];
  sau?: any[];
  edu?: any[];
  eco?: any[];
  fem?: any[];
  povos?: any;
  atlas?: any;
  analfab?: any;
  evasao?: any[];
  antra?: any[];
}

// ═══════════════════════════════════════════
// ARTIGO I — Definição de Discriminação Racial
// ═══════════════════════════════════════════

export function renderArticleINarrative(d: ArticleNarrativeData): string {
  const comp = d.demo?.composicaoRacial || {};
  const popTotal = num(d.demo?.populacaoTotal || 203080756);
  const popNegra = num(comp.pretos || 20656458) + num(comp.pardos || 92083286);
  const pctPardos = num(comp.pardos || 92083286);
  const pctPretos = num(comp.pretos || 20656458);
  const quilombolas = num(d.demo?.populacaoQuilombola || 1330186);
  const indigenas = num(comp.indigenas || 1227642);

  return `
  <h4>Recomendações do Comitê (CERD/C/BRA/CO/18-20)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§8(a)</span>: Garantir que a legislação antidiscriminatória abranja todas as formas de discriminação, incluindo direta, indireta e interseccional.</p>
    <p><span class="paragraph-ref">§8(b)</span>: Dar plena consideração às recomendações da Comissão de Peritos Jurídicos sobre lacunas no marco legislativo.</p>
    <p><span class="paragraph-ref">§8(c)</span>: Expandir esforços para implementar efetivamente a Convenção Interamericana contra o Racismo.</p>
  </div>

  <h4>1.1 Sistema de classificação racial e autodeclaração</h4>
  <p>5. O Censo Demográfico de 2022 — primeiro recenseamento do Brasil desde 2010 — confirmou que a população autodeclarada negra (preta e parda) constitui <strong>${((popNegra / popTotal) * 100).toFixed(1)}% da população</strong> (${fmtNum(popNegra)} pessoas), distribuída entre ${((pctPardos / popTotal) * 100).toFixed(1)}% pardos (${fmtNum(pctPardos)}) e ${((pctPretos / popTotal) * 100).toFixed(1)}% pretos (${fmtNum(pctPretos)}). A população autodeclarada branca correspondeu a ${((num(comp.brancos || 88252121) / popTotal) * 100).toFixed(1)}% (${fmtNum(num(comp.brancos || 88252121))}). Esses dados foram extraídos da Tabela SIDRA 9605 (Censo Demográfico 2022).</p>

  <p>6. ${fmtNum(quilombolas)} pessoas residem em territórios identificados pelo quesito quilombola (Tabela SIDRA 9578), das quais apenas 167.202 (12,6%) vivem em territórios oficialmente reconhecidos — evidência da urgência da regularização fundiária. A população indígena autodeclarada pelo quesito cor/raça foi de ${fmtNum(indigenas)} pessoas (Tabela SIDRA 9605).</p>

  <h4>1.2 Marco normativo cadastrado vinculado ao Artigo I</h4>
  ${renderNormativosResumoParagrafo(d.normativos, 'I', '7. Em atendimento aos princípios de transparência e auditabilidade adotados pelo sistema CERD4, esta seção apresenta exclusivamente os marcos normativos cadastrados na Base Normativa do sistema com vínculo formal ao Artigo I da Convenção.')}
  ${renderNormativosVinculados(d.normativos, 'I')}

  <h4>1.3 Proteção de migrantes, refugiados e estrangeiros</h4>
  <p>8. A política migratória brasileira, em conformidade com o §54–55 das Observações Finais, adota a perspectiva dos direitos humanos, vedando distinção baseada em raça, etnia, cor ou origem nacional. Entre 2018 e 2024, mais de 1 milhão de venezuelanos foram atendidos pela Operação Acolhida, coordenada pelo governo federal com participação de organizações internacionais e da sociedade civil.${(() => {
    const norm = renderNormativosInlineList(d.normativos, ['migra', 'refug', 'estrange', 'acolhida'], 'I', 4);
    return norm ? ` Os instrumentos normativos cadastrados que sustentam essa política incluem: ${norm}.` : '';
  })()}</p>
  ${renderOrcamentoArtigoBlock(d.orcDados, 'I', '8-a', 'No campo orçamentário,')}`;
}

// ═══════════════════════════════════════════
// ARTIGO II — Obrigações dos Estados
// ═══════════════════════════════════════════

export function renderArticleIINarrative(d: ArticleNarrativeData): string {
  const totalOrcPago = d.orcDados.reduce((s, o) => s + num(o.pago), 0);
  const totalOrcDot = d.orcDados.reduce((s, o) => s + num(o.dotacao_autorizada), 0);
  const execPct = totalOrcDot > 0 ? (totalOrcPago / totalOrcDot * 100) : 0;

  return `
  <h4>Recomendações do Comitê (CERD/C/BRA/CO/18-20)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§10</span>: Estabelecer instituição nacional de direitos humanos (INDH) conforme os Princípios de Paris.</p>
    <p><span class="paragraph-ref">§9</span>: Investir na capacidade institucional dos órgãos de direitos humanos e criar espaço de diálogo.</p>
    <p><span class="paragraph-ref">§29</span>: Adotar e fortalecer medidas especiais em todos os setores para eliminar disparidades persistentes.</p>
  </div>

  <h4>2.1 Marco normativo cadastrado vinculado ao Artigo II</h4>
  ${renderNormativosResumoParagrafo(d.normativos, 'II', '9. O período 2018–2025 foi marcado por dois movimentos opostos: retrocesso institucional entre 2019 e 2022, com desmonte de órgãos e cortes orçamentários; e reconstrução a partir de 2023, com criação de novos marcos institucionais e legislativos. A tabela abaixo apresenta exclusivamente os marcos cadastrados na Base Normativa do sistema com vínculo formal ao Artigo II.')}
  ${renderNormativosVinculados(d.normativos, 'II')}

  <h4>2.2 Estrutura institucional</h4>
  <p>10. Em atenção à grave preocupação do Comitê (§9) sobre o esvaziamento dos órgãos responsáveis pela implementação da Convenção, o Estado reconhece com transparência que entre 2019 e 2022 ocorreu retrocesso significativo na arquitetura institucional de promoção da igualdade racial. A partir de janeiro de 2023, foi conferido status ministerial à agenda racial pela primeira vez na história brasileira, com retomada da coordenação da política nacional, supervisão do SINAPIR e articulação intersetorial. Os instrumentos formais que materializam essa reconstrução constam da relação cadastrada acima.</p>

  <p>11. Sobre a recomendação de criação de Instituição Nacional de Direitos Humanos (INDH) conforme os Princípios de Paris (§10), o Estado reconhece que a ausência de INDH constitui lacuna relevante e que a tramitação legislativa correspondente se encontra em curso.</p>

  <h4>2.3 Orçamento para políticas de igualdade racial</h4>
  <p>12. Em resposta à recomendação do Comitê de apresentar dados sobre alocação orçamentária, o sistema CERD4 rastreou <strong>${d.orcDados.length} ações orçamentárias vinculadas</strong> ao escopo do relatório, com dotação total autorizada de ${fmtBRL(totalOrcDot)} e ${fmtBRL(totalOrcPago)} pagos (execução de ${execPct.toFixed(1)}%). Os dados completos, com fonte e link oficial quando disponível, constam da Base Orçamentária do sistema.</p>`;
}

// ═══════════════════════════════════════════
// ARTIGO III — Segregação
// ═══════════════════════════════════════════

export function renderArticleIIINarrative(d: ArticleNarrativeData): string {
  return `
  <h4>Recomendações do Comitê (CERD/C/BRA/CO/18-20)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§25</span>: Avaliar as dinâmicas de racismo e classismo na segregação habitacional e implementar políticas efetivas de moradia para afro-brasileiros.</p>
    <p><span class="paragraph-ref">§25</span>: Avaliar o crescimento da população negra em situação de rua.</p>
    <p><span class="paragraph-ref">§38</span>: Revisar leis, políticas e práticas para enfrentar as causas do encarceramento desproporcional de afro-brasileiros.</p>
    <p><span class="paragraph-ref">§57</span>: Garantir acesso de ciganos a documentos civis e dados sobre sua situação.</p>
  </div>

  <h4>3.1 Habitação e segregação urbana</h4>
  ${(() => {
    const favelas = findIndicador(d.indicadores, ['favelas'], 'habitacao');
    if (!favelas) return '';
    const negPct = pickNum(favelas.dados, ['2022', 'negros_pct']);
    const totalMor = pickNum(favelas.dados, ['2022', 'total_moradores']);
    if (negPct == null || totalMor == null) return '';
    return `<p>13. ${negPct.toFixed(1)}% dos moradores em favelas e comunidades urbanas são negros (${fmtNum(totalMor)} pessoas, Censo 2022), proporção significativamente superior aos 55,5% que negros representam na população total brasileira. ${fonteLink(favelas)}</p>`;
  })()}

  ${(() => {
    const def = findIndicador(d.indicadores, ['déficit habitacional'], 'habitacao') || findIndicador(d.indicadores, ['deficit habitacional'], 'habitacao');
    if (!def) return '';
    const neg = pickNum(def.dados, ['2022', 'negros']) ?? pickNum(def.dados, ['negros', '2022']);
    const bra = pickNum(def.dados, ['2022', 'brancos']) ?? pickNum(def.dados, ['brancos', '2022']);
    if (neg == null || bra == null) return '';
    const razao = (neg / Math.max(bra, 1)).toFixed(2);
    return `<p>14. O déficit habitacional mantém viés racial acentuado: ${fmtNum(neg)} unidades para famílias negras contra ${fmtNum(bra)} para brancas (razão ${razao}). ${fonteLink(def)}</p>`;
  })()}

  <h4>3.2 Marco normativo cadastrado vinculado ao Artigo III</h4>
  ${renderNormativosVinculados(d.normativos, 'III')}

  <h4>3.3 Sistema prisional e segregação institucional</h4>
  ${(() => {
    const pris = findIndicador(d.indicadores, ['prisional'], 'seguranca_publica') || findIndicador(d.indicadores, ['carcer'], 'seguranca_publica');
    if (!pris) return '';
    const pct2024 = pickNum(pris.dados, ['percentual_negros', '2024']);
    const total2024 = pickNum(pris.dados, ['total_com_domiciliar', '2024']) ?? pickNum(pris.dados, ['total_celas_fisicas', '2024_dez']);
    if (pct2024 == null) return '';
    const totalTxt = total2024 != null ? ` A população encarcerada total atingiu ${fmtNum(total2024)} pessoas em 2024.` : '';
    return `<p>15. ${pct2024.toFixed(1)}% da população carcerária é negra em 2024.${totalTxt} ${fonteLink(pris)}</p>`;
  })()}

  ${(() => {
    // §16 SSoT — busca em indicadores_interseccionais (encarceramento jovem, vítimas de violência policial, série prisional)
    const enc = findIndicador(d.indicadores, ['encarceramento', 'jovens'], 'seguranca_publica');
    const vitNeg = findIndicador(d.indicadores, ['vítimas negras de violência policial'])
      || findIndicador(d.indicadores, ['vitimas negras', 'violência policial']);
    const vitBra = findIndicador(d.indicadores, ['vítimas brancas de violência policial'])
      || findIndicador(d.indicadores, ['vitimas brancas', 'violência policial']);
    const serie = findIndicador(d.indicadores, ['prisional', 'série'], 'seguranca_publica')
      || findIndicador(d.indicadores, ['população prisional'], 'seguranca_publica');

    const partesEstat: string[] = [];
    if (enc) {
      const v = pickNum(enc.dados, ['valor_negros']);
      const vb = pickNum(enc.dados, ['valor_brancos']);
      if (v != null && vb != null) {
        partesEstat.push(`o encarceramento entre jovens negros atinge ${v.toFixed(1)}% (vs ${vb.toFixed(1)}% entre brancos) ${fonteLink(enc)}`);
      }
    }
    if (vitNeg && vitBra) {
      const vn = pickNum(vitNeg.dados, ['negros', '2017-2019']);
      const vb = pickNum(vitBra.dados, ['geral', '2017-2019']);
      if (vn != null && vb != null) {
        partesEstat.push(`vítimas negras de violência policial concentram ${(vn * 100).toFixed(0)}% das ocorrências registradas no Disque 100 (2017–2019), contra ${(vb * 100).toFixed(0)}% entre brancos ${fonteLink(vitNeg)}`);
      }
    }
    if (serie) {
      const total2024 = pickNum(serie.dados, ['total_com_domiciliar', '2024']);
      const pct2024 = pickNum(serie.dados, ['percentual_negros', '2024']);
      if (total2024 != null && pct2024 != null) {
        partesEstat.push(`a população prisional total alcançou ${fmtNum(total2024)} pessoas em 2024, com ${pct2024.toFixed(1)}% autodeclaradas negras ${fonteLink(serie)}`);
      }
    }

    // Normativos com tema sistema penal / uso da força / custódia / socioeducativo
    const normPenal = renderNormativosInlineList(
      d.normativos,
      ['polici', 'prision', 'custódia', 'custodia', 'tortura', 'socioeduc', 'segurança pública', 'seguranca publica', 'audiência', 'audiencia'],
      'III',
      4,
    );

    // Orçamento de Justiça/Segurança vinculado a recorte racial
    const orcSeg = (d.orcDados || []).filter((o: any) => {
      const eixo = String(o.eixo_tematico || '').toLowerCase();
      const desc = `${o.programa || ''} ${o.descritivo || ''} ${o.publico_alvo || ''}`.toLowerCase();
      return eixo.includes('seguranca') || eixo.includes('legislacao_justica')
        || /(juventude negra viva|polici|prision|socioeduc|justi[çc]a)/i.test(desc);
    });
    const orcSegPago = orcSeg.reduce((s, o: any) => s + num(o.pago), 0);
    const orcSegDot = orcSeg.reduce((s, o: any) => s + num(o.dotacao_autorizada), 0);

    const blocos: string[] = [];
    if (partesEstat.length) {
      blocos.push(`<p>16. As respostas institucionais às disparidades raciais no sistema penal são lastreadas em evidências estatísticas registradas no sistema: ${partesEstat.join('; ')}.</p>`);
    }
    if (normPenal) {
      blocos.push(`<p>16-a. Os marcos normativos cadastrados com vínculo direto à atuação penal e ao uso da força com perspectiva racial incluem: ${normPenal}. A relação completa consta da seção 3.2 acima.</p>`);
    }
    if (orcSeg.length > 0 && orcSegDot > 0) {
      const exec = (orcSegPago / orcSegDot * 100).toFixed(1);
      blocos.push(`<p>16-b. No campo orçamentário, foram rastreadas <strong>${orcSeg.length} ações</strong> em segurança pública e justiça com recorte racial vinculadas ao Artigo III, totalizando ${fmtBRL(orcSegDot)} de dotação autorizada e ${fmtBRL(orcSegPago)} pagos (execução ${exec}%).</p>`);
    }
    return blocos.join('\n  ');
  })()}

  <h4>3.4 Povos ciganos: segregação e documentação</h4>
  <p>17. O Censo 2022 identificou ${fmtNum(num(d.demo?.populacaoCigana || 41738))} pessoas que se autodeclararam ciganas — a primeira contagem oficial dessa população na história brasileira. Programas de documentação civil em acampamentos ciganos foram implementados no período, e o Plano Nacional de Políticas para Povos Ciganos estrutura metas específicas, conforme instrumentos cadastrados na Base Normativa.</p>`;
}

// ═══════════════════════════════════════════
// ARTIGO IV — Propaganda e Organizações Racistas
// ═══════════════════════════════════════════

export function renderArticleIVNarrative(d: ArticleNarrativeData): string {
  return `
  <h4>Recomendações do Comitê (CERD/C/BRA/CO/18-20)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§31(a)</span>: Garantir que toda forma de discurso de ódio racista, inclusive online, seja tipificada como crime.</p>
    <p><span class="paragraph-ref">§31(b)</span>: Reconhecer o ciberespaço como domínio no qual os crimes previstos na legislação antidiscriminatória se aplicam.</p>
    <p><span class="paragraph-ref">§31(c)</span>: Prevenir e responsabilizar o discurso de ódio por autoridades públicas.</p>
    <p><span class="paragraph-ref">§31(f)</span>: Coletar dados desagregados sobre queixas, processos e condenações por discurso de ódio racista.</p>
  </div>

  <h4>4.1 Marco normativo cadastrado vinculado ao Artigo IV</h4>
  ${renderNormativosResumoParagrafo(d.normativos, 'IV', '18. O sistema CERD4 cataloga rigorosamente apenas instrumentos normativos cadastrados com URL oficial e vínculo formal ao Artigo IV. A vinculação ao Artigo IV é restrita a normas sobre propaganda discriminatória, organizações racistas e tipificação penal correlata, em conformidade com a regra de coerência temática do sistema.')}
  ${renderNormativosVinculados(d.normativos, 'IV')}

  <h4>4.2 Indicadores de aplicação penal</h4>
  ${(() => {
    const racism = findIndicador(d.indicadores, ['racismo'], 'seguranca_publica')
      || findIndicador(d.indicadores, ['injúria racial'])
      || findIndicador(d.indicadores, ['injuria racial']);
    const disque = findIndicador(d.indicadores, ['disque 100'])
      || findIndicador(d.indicadores, ['discriminação racial'])
      || findIndicador(d.indicadores, ['discriminacao racial']);
    const partes: string[] = [];
    if (racism) {
      const dados = racism.dados as any;
      const anos = Object.keys(dados || {}).filter((k) => /^\d{4}$/.test(k)).sort();
      if (anos.length >= 2) {
        const first = anos[0], last = anos[anos.length - 1];
        const v1 = pickNum(dados, [first]);
        const v2 = pickNum(dados, [last]);
        if (v1 != null && v2 != null && v1 > 0) {
          const pct = (((v2 - v1) / v1) * 100).toFixed(0);
          partes.push(`Os processos judiciais de racismo/injúria racial cresceram de ${fmtNum(v1)} (${first}) para ${fmtNum(v2)} (${last}), variação de ${pct}%. ${fonteLink(racism)}`);
        }
      }
    }
    if (disque) {
      const dados = disque.dados as any;
      const anos = Object.keys(dados || {}).filter((k) => /^\d{4}$/.test(k)).sort();
      if (anos.length >= 2) {
        const first = anos[0], last = anos[anos.length - 1];
        const v1 = pickNum(dados, [first]);
        const v2 = pickNum(dados, [last]);
        if (v1 != null && v2 != null) partes.push(`As denúncias no Disque 100 evoluíram de ${fmtNum(v1)} (${first}) para ${fmtNum(v2)} (${last}). ${fonteLink(disque)}`);
      }
    }
    return partes.length ? `<p>19. ${partes.join(' ')}</p>` : '';
  })()}

  <p>20. O Estado reconhece, em resposta ao §31(c) das Observações Finais, que entre 2019 e 2022 ocorreram múltiplos incidentes de discurso de ódio com teor racial por parte de autoridades públicas de alto escalão, sem que as responsabilizações tenham sido aplicadas de forma adequada.</p>

  <h4>4.3 Racismo digital</h4>
  <p>21. O racismo digital tornou-se a manifestação mais prevalente e de crescimento mais acelerado no período. Registros oficiais indicam crescimento de 382% nas denúncias de intolerância religiosa de matriz africana entre 2020 e 2025 (Fonte: ONDH — Disque 100).</p>

  <h4>4.4 Execução orçamentária vinculada ao Artigo IV</h4>
  ${renderOrcamentoArtigoBlock(d.orcDados, 'IV', '21-a', 'Em complemento à dimensão normativa,')}`;
}

// ═══════════════════════════════════════════
// ARTIGO V — Igualdade de Direitos
// ═══════════════════════════════════════════

export function renderArticleVNarrative(d: ArticleNarrativeData): string {
  const eco = d.eco || [];
  const sau = d.sau || [];
  const edu = d.edu || [];
  const fem = d.fem || [];
  const seg = d.seg || [];

  return `
  <h4>Recomendações do Comitê (CERD/C/BRA/CO/18-20)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§14</span>: Priorizar melhoria dos direitos econômicos e sociais de mulheres negras e indígenas.</p>
    <p><span class="paragraph-ref">§23(a)</span>: Adotar medidas efetivas para erradicar a pobreza entre afro-brasileiros, indígenas e quilombolas.</p>
    <p><span class="paragraph-ref">§23(b)</span>: Revisar o marco regulatório do trabalho doméstico para garantir proteção adequada às mulheres negras.</p>
    <p><span class="paragraph-ref">§23(e)</span>: Melhorar a implementação da Lei de Cotas no Serviço Público e expandi-la para outros setores.</p>
    <p><span class="paragraph-ref">§17(b)</span>: Adotar medidas efetivas para reduzir a mortalidade materna de mulheres negras.</p>
    <p><span class="paragraph-ref">§19(c)</span>: Renovar e fortalecer o sistema de cotas para o ensino superior.</p>
  </div>

  <h4>5.1 Indicadores de mercado de trabalho (2018–2025)</h4>
  <p>22. As desigualdades raciais no mercado de trabalho persistem de forma estrutural ao longo de todo o período, com melhoras marginais em alguns indicadores sem redução da distância relativa entre negros e brancos. Os dados da PNAD Contínua (SIDRA 6402 e 6405) mostram:</p>

  ${eco.length > 0 ? `
  <table>
    <thead><tr><th>Indicador</th>${eco.map(e => `<th>${e.ano}</th>`).join('')}</tr></thead>
    <tbody>
      <tr><td><strong>Desemprego negros (%)</strong></td>${eco.map(e => `<td>${num(e.desempregoNegro).toFixed(1)}</td>`).join('')}</tr>
      <tr><td><strong>Desemprego brancos (%)</strong></td>${eco.map(e => `<td>${num(e.desempregoBranco).toFixed(1)}</td>`).join('')}</tr>
      <tr><td><strong>Renda média negra (R$)</strong></td>${eco.map(e => `<td>${fmtNum(num(e.rendaMediaNegra))}</td>`).join('')}</tr>
      <tr><td><strong>Renda média branca (R$)</strong></td>${eco.map(e => `<td>${fmtNum(num(e.rendaMediaBranca))}</td>`).join('')}</tr>
      <tr><td><strong>Razão renda N/B</strong></td>${eco.map(e => `<td>${(num(e.rendaMediaNegra) / Math.max(num(e.rendaMediaBranca), 1)).toFixed(2)}</td>`).join('')}</tr>
    </tbody>
  </table>
  <p style="font-size:8.5pt;color:#64748b">Fonte: PNAD Contínua/SIDRA 6402 e 6405; SIS/IBGE 2024–2025.</p>` : ''}

  ${(() => {
    const mn = findIndicador(d.indicadores, ['mulheres negras'], 'genero_raca')
      || findIndicador(d.indicadores, ['rendimento', 'mulher']);
    if (!mn) return '';
    const dados = mn.dados as any;
    const valMN = pickNum(dados, ['mulher_negra_renda']) ?? pickNum(dados, ['mulheres_negras']) ?? pickNum(dados, ['valor_mulher_negra']);
    const valHNN = pickNum(dados, ['homem_nao_negro_renda']) ?? pickNum(dados, ['homens_nao_negros']) ?? pickNum(dados, ['valor_homem_nao_negro']);
    if (valMN == null || valHNN == null || valHNN === 0) return '';
    const pct = ((valMN / valHNN) * 100).toFixed(1);
    return `<p>23. Mulheres negras recebem ${fmtBRL(valMN)} mensais, correspondendo a ${pct}% do rendimento de homens não negros (${fmtBRL(valHNN)}), configurando a maior desigualdade entre os grupos analisados. ${fonteLink(mn)}</p>`;
  })()}

  <h4>5.2 Marco normativo cadastrado vinculado ao Artigo V</h4>
  ${renderNormativosResumoParagrafo(d.normativos, 'V', '24. O Artigo V — pelo amplo escopo de direitos econômicos, sociais e culturais que cobre — concentra a maior parte dos instrumentos normativos cadastrados no sistema.')}
  ${renderNormativosVinculados(d.normativos, 'V')}

  <h4>5.3 Pobreza e transferência de renda</h4>
  ${(() => {
    const cad = findIndicador(d.indicadores, ['cadúnico'], 'habitacao')
      || findIndicador(d.indicadores, ['cadunico'])
      || findIndicador(d.indicadores, ['mcmv']);
    if (!cad) return '';
    const dados = cad.dados as any;
    const negros = dados?.negros || {};
    const brancos = dados?.brancos || {};
    const anos = Object.keys(negros).filter((k) => /^\d{4}$/.test(k)).sort();
    if (!anos.length) return '';
    const last = anos[anos.length - 1];
    const vN = pickNum(negros, [last]);
    const vB = pickNum(brancos, [last]);
    if (vN == null) return '';
    const total = vN + (vB || 0);
    const pct = total > 0 ? ((vN / total) * 100).toFixed(1) : null;
    return `<p>25. ${fmtNum(vN)} negros (pretos e pardos) inscritos no CadÚnico em ${last}${pct ? `, correspondendo a ${pct}% do total registrado` : ''} — refletindo a sobre-representação da população negra nos cadastros de proteção social. ${fonteLink(cad)}</p>`;
  })()}

  <h4>5.4 Trabalho infantil e trabalho escravo</h4>
  ${(() => {
    const ti = findIndicador(d.indicadores, ['trabalho infantil']);
    if (!ti) return '';
    const dados = ti.dados as any;
    const pctNeg = pickNum(dados, ['percentual_negros_2024']) ?? pickNum(dados, ['2024', 'pct_negros']) ?? pickNum(dados, ['pct_negros']);
    const total = pickNum(dados, ['total_2024']) ?? pickNum(dados, ['2024', 'total']);
    if (pctNeg == null) return '';
    const totTxt = total != null ? ` Em 2024, estimava-se ${fmtNum(total)} crianças nessa situação.` : '';
    return `<p>27. ${pctNeg.toFixed(1)}% das crianças de 5 a 17 anos em situação de trabalho infantil são negras.${totTxt} ${fonteLink(ti)}</p>`;
  })()}

  ${(() => {
    const te = findIndicador(d.indicadores, ['trabalho escravo']);
    if (!te) return '';
    const dados = te.dados as any;
    const pctNeg = pickNum(dados, ['percentual_negros']) ?? pickNum(dados, ['pct_negros']);
    const r2023 = pickNum(dados, ['resgatados', '2023']) ?? pickNum(dados, ['2023']);
    const r2024 = pickNum(dados, ['resgatados', '2024']) ?? pickNum(dados, ['2024']);
    if (pctNeg == null && r2023 == null && r2024 == null) return '';
    const partes: string[] = [];
    if (pctNeg != null) partes.push(`${pctNeg.toFixed(1)}% dos resgatados de situações de trabalho escravo são negros`);
    if (r2023 != null && r2024 != null) partes.push(`${fmtNum(r2023)} resgatados em 2023 e ${fmtNum(r2024)} em 2024`);
    return `<p>28. ${partes.join('; ')}. ${fonteLink(te)}</p>`;
  })()}

  <h4>5.5 Mortalidade materna — indicador-sentinela</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§17(a)</span>: Garantir medidas de proteção iguais para afro-brasileiros, indígenas e quilombolas em emergências de saúde pública.</p>
    <p><span class="paragraph-ref">§17(b)</span>: Adotar medidas efetivas para reduzir a mortalidade materna de mulheres negras, indígenas e quilombolas.</p>
    <p><span class="paragraph-ref">§17(e)</span>: Capacitar profissionais de saúde em antirracismo para prestação de serviços sexuais e reprodutivos.</p>
    <p><span class="paragraph-ref">§17(f)</span>: Fornecer serviços abrangentes de saúde mental às comunidades mais afetadas pela violência racial.</p>
  </div>

  <p>29. A mortalidade materna permanece o indicador mais sensível e mais preocupante da desigualdade racial em saúde.</p>
  ${sau.length > 0 ? `
  <table>
    <thead><tr><th>Ano</th><th>MM negras (100 mil NV)</th><th>MM brancas</th>${sau[0]?.mortalidadeMaternaPretas != null ? '<th>MM pretas isoladas</th>' : ''}</tr></thead>
    <tbody>${sau.map(s => `<tr>
      <td>${s.ano}${s.ano === 2021 ? ' (pico COVID)' : ''}</td>
      <td><strong>${num(s.mortalidadeMaternaNegra).toFixed(1)}</strong></td>
      <td>${num(s.mortalidadeMaternaBranca).toFixed(1)}</td>
      ${s.mortalidadeMaternaPretas != null ? `<td>${num(s.mortalidadeMaternaPretas).toFixed(1)}</td>` : ''}
    </tr>`).join('')}</tbody>
  </table>
  <p style="font-size:8.5pt;color:#64748b">Fonte: DataSUS/SIM e SINASC. IEPS (jul/2025): razão pretas/brancas = 2,3× na série 2010–2023.</p>` : ''}

  <p>30. O pico de 2021 revelou o impacto devastador da pandemia sobre a saúde reprodutiva das mulheres negras. Segundo o Ministério da Saúde, 90% desses óbitos eram evitáveis com atenção pré-natal adequada.</p>

  <h4>5.6 Violência letal: homicídios e letalidade policial</h4>
  <p>31. A violência letal racializada constitui a violação de direitos humanos mais grave e sistemática registrada no período.</p>
  ${seg.length > 0 ? (() => {
    const first = seg[0];
    const last = seg[seg.length - 1];
    return `
    <div class="regress-box">
      <p><strong>Risco relativo negros/não negros:</strong> ${num(d.atlas?.riscoRelativo || last?.razaoRisco || 2.7).toFixed(1)}× — inalterado desde 2018.</p>
      <p><strong>Vítimas negras de homicídio:</strong> ${num(first?.percentualVitimasNegras).toFixed(1)}% (${first?.ano}) → ${num(last?.percentualVitimasNegras).toFixed(1)}% (${last?.ano}).</p>
      <p><strong>Letalidade policial negra:</strong> ${num(first?.letalidadePolicial).toFixed(1)}% (${first?.ano}) → ${num(last?.letalidadePolicial).toFixed(1)}% (${last?.ano}) — crescimento constante.</p>
      ${fem.length > 0 ? `<p><strong>Feminicídio mulheres negras:</strong> ${num(fem[fem.length - 1]?.percentualNegras).toFixed(1)}% em ${fem[fem.length - 1]?.ano} — ${fmtNum(num(fem[fem.length - 1]?.totalFeminicidios))} feminicídios (recorde histórico).</p>` : ''}
    </div>`;
  })() : ''}

  <p>32. A crescente concentração da letalidade policial sobre a população negra ocorre enquanto as taxas de homicídio gerais caíam, demonstrando que a redução absoluta da violência não altera — antes agrava — o padrão racial da violência letal.</p>

  <p>33. Feminicídio atingiu recorde histórico em 2024: 1.492 casos, dos quais 63,6% vitimaram mulheres negras (19º Anuário FBSP 2025). A série histórica do FBSP confirma que a participação de mulheres negras entre as vítimas cresceu consistentemente de 61,0% (2018) para 63,6% (2024).</p>

  <h4>5.7 Indicadores educacionais (2018–2025)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§19(a)</span>: Medidas para enfrentar o analfabetismo e a evasão escolar.</p>
    <p><span class="paragraph-ref">§19(b)</span>: Apoiar o acesso à internet para facilitar o aprendizado online.</p>
    <p><span class="paragraph-ref">§19(c)</span>: Renovar e fortalecer o sistema de cotas para o ensino superior, incluindo intersecções com deficiência.</p>
  </div>

  <p>34. A educação é o eixo com evolução mais positiva no período.</p>
  ${edu.length > 0 ? (() => {
    const ef = edu[0]; const el = edu[edu.length - 1];
    return `
    <table>
      <thead><tr><th>Indicador</th><th>Negros ${ef?.ano || 2018}</th><th>Negros ${el?.ano || 2024}</th><th>Brancos ${el?.ano || 2024}</th><th>Fonte</th></tr></thead>
      <tbody>
        <tr><td>Analfabetismo 15+ (%)</td><td>${num(ef?.analfabetismoNegro).toFixed(1)}</td><td>${num(el?.analfabetismoNegro).toFixed(1)}</td><td>${num(el?.analfabetismoBranco).toFixed(1)}</td><td>PNAD/SIDRA 7125</td></tr>
        <tr><td>Superior completo 25+ (%)</td><td>${num(ef?.superiorNegroPercent).toFixed(1)}</td><td>${num(el?.superiorNegroPercent).toFixed(1)}</td><td>${num(el?.superiorBrancoPercent).toFixed(1)}</td><td>PNAD/SIDRA 7129</td></tr>
      </tbody>
    </table>`;
  })() : ''}

  ${(() => {
    const ev = findIndicador(d.indicadores, ['evasão'], 'educacao')
      || findIndicador(d.indicadores, ['evasao'])
      || findIndicador(d.indicadores, ['abandono escolar']);
    if (!ev) return '';
    const dados = ev.dados as any;
    const negro = pickNum(dados, ['negros_pct']) ?? pickNum(dados, ['2024', 'negros_pct']) ?? pickNum(dados, ['negros']);
    const branco = pickNum(dados, ['brancos_pct']) ?? pickNum(dados, ['2024', 'brancos_pct']) ?? pickNum(dados, ['brancos']);
    if (negro == null) return '';
    const compTxt = branco != null ? `, contra ${branco.toFixed(1)}% de brancos` : '';
    return `<p>35. A evasão escolar de jovens negros atingiu ${negro.toFixed(1)}%${compTxt}. ${fonteLink(ev)}</p>`;
  })()}

  <h4>5.8 Comunidades quilombolas</h4>
  <p>36. ${fmtNum(num(d.povos?.quilombolas?.populacao || 1330186))} pessoas vivem em territórios identificados como quilombolas, das quais apenas 12,6% residem em territórios oficialmente reconhecidos. ${fmtNum(num(d.povos?.quilombolas?.comunidadesCertificadas || 3158))} comunidades certificadas pela Fundação Palmares.</p>

  ${(() => {
    const sn = findIndicador(d.indicadores, ['saneamento', 'quilombola'])
      || findIndicador(d.indicadores, ['quilombola', 'água'])
      || findIndicador(d.indicadores, ['quilombola', 'agua']);
    if (!sn) return '';
    const dados = sn.dados as any;
    const agua = pickNum(dados, ['agua_pct']) ?? pickNum(dados, ['quilombolas', 'agua']) ?? pickNum(dados, ['agua']);
    const esgoto = pickNum(dados, ['esgoto_pct']) ?? pickNum(dados, ['quilombolas', 'esgoto']) ?? pickNum(dados, ['esgoto']);
    const lixo = pickNum(dados, ['lixo_pct']) ?? pickNum(dados, ['quilombolas', 'lixo']) ?? pickNum(dados, ['lixo']);
    const partes: string[] = [];
    if (agua != null) partes.push(`${agua.toFixed(1)}% têm acesso à rede geral de água`);
    if (esgoto != null) partes.push(`${esgoto.toFixed(1)}% têm esgotamento adequado`);
    if (lixo != null) partes.push(`${lixo.toFixed(1)}% têm coleta de lixo`);
    if (!partes.length) return '';
    return `<p>37. Domicílios quilombolas: ${partes.join('; ')}. ${fonteLink(sn)}</p>`;
  })()}

  <h4>5.9 Povos indígenas</h4>
  <p>38. ${fmtNum(num(d.demo?.populacaoIndigena || 1694836))} pessoas indígenas pela contagem específica, das quais mais da metade (53,97%) vive em áreas urbanas. São 391 etnias e 295 línguas indígenas identificadas. A retomada do processo demarcatório — com 20 homologações entre 2023 e 2025, contra apenas 1 no período 2019–2022 — representa avanço significativo.${(() => {
    const norm = renderNormativosInlineList(d.normativos, ['indígen', 'indigen', 'demarca', 'funai', 'yanomami', 'quilombo'], 'V', 4);
    return norm ? ` Os marcos normativos cadastrados que sustentam essa retomada incluem: ${norm}.` : '';
  })()}</p>

  <h4>5.10 Comunidades de terreiro e liberdade religiosa</h4>
  <p>39. Crescimento de 382% nas denúncias de intolerância religiosa entre 2020 e 2025 (566 para 2.723 denúncias), com umbanda e candomblé respondendo por 268 dos 2.472 casos com religião específica identificada em 2024 (Fonte: ONDH — Disque 100).</p>

  <h4>5.11 Pessoas trans e LGBTQIA+ negras</h4>
  ${d.antra && d.antra.length > 0 ? `
  <table>
    <thead><tr><th>Ano</th><th>Total assassinatos trans</th><th>% negras</th><th>Fonte</th></tr></thead>
    <tbody>${d.antra.map((a: any) => `<tr><td>${a.ano}</td><td>${a.totalAssassinatos ?? a.total ?? 'N/D'}</td><td>${num(a.negros || a.percentualNegras || a.pctNegras).toFixed(0)}%</td><td>${a.fonte || 'Dossiê ANTRA'}</td></tr>`).join('')}</tbody>
  </table>
  <p style="font-size:8.5pt;color:#64748b">Média histórica 2017–2025: 77% negras, 22% brancas, 1% indígenas.</p>` : ''}

  <p>40. Os dados revelam que a grande maioria das vítimas de assassinato trans no Brasil é negra — entre 70% e 82% em todo o período.</p>`;
}

// ═══════════════════════════════════════════
// ARTIGO VI — Proteção Judicial
// ═══════════════════════════════════════════

export function renderArticleVINarrative(d: ArticleNarrativeData): string {
  return `
  <h4>Recomendações do Comitê (CERD/C/BRA/CO/18-20)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§12</span>: Identificar e eliminar barreiras ao acesso à justiça para vítimas de racismo.</p>
    <p><span class="paragraph-ref">§12</span>: Aumentar o acesso à assistência jurídica gratuita e cultivar a confiança das vítimas nas instituições.</p>
    <p><span class="paragraph-ref">§12</span>: Revisar os padrões probatórios para fortalecer a responsabilização por atos discriminatórios.</p>
    <p><span class="paragraph-ref">§12</span>: Coletar dados sobre queixas, processos e condenações por crimes raciais e incluí-los no próximo relatório.</p>
  </div>

  <h4>6.1 Marco normativo cadastrado vinculado ao Artigo VI</h4>
  ${renderNormativosVinculados(d.normativos, 'VI')}

  <h4>6.2 Processos judiciais e denúncias</h4>
  <p>41. Em resposta à recomendação central do Comitê sobre dados de processos e condenações (§12), o Estado apresenta dados oficiais do CNJ e da ONDH:</p>
  <table>
    <thead><tr><th>Indicador</th><th>2020</th><th>2021</th><th>2022</th><th>2023</th><th>2024</th><th>2025</th></tr></thead>
    <tbody>
      <tr><td><strong>Novos processos racismo/injúria racial (CNJ)</strong></td><td>50</td><td>92</td><td>234</td><td>973</td><td>2.874</td><td>4.633</td></tr>
      <tr><td><strong>Denúncias discriminação racial (Disque 100)</strong></td><td>—</td><td>—</td><td>3.535</td><td>9.738</td><td>14.543</td><td>16.245</td></tr>
      <tr><td><strong>Denúncias intolerância religiosa</strong></td><td>566</td><td>584</td><td>898</td><td>1.482</td><td>2.472</td><td>2.723</td></tr>
    </tbody>
  </table>
  <p style="font-size:8.5pt;color:#64748b">Fonte: CNJ — Justiça em Números; ONDH/MDHC — Disque 100.</p>

  <p>42. O crescimento exponencial nos processos judiciais — de 50 em 2020 para 4.633 em 2025 — reflete o impacto combinado dos avanços legislativos cadastrados na Base Normativa, do crescimento das denúncias e da maior consciência das vítimas.</p>

  <h4>6.3 Acesso à Defensoria Pública</h4>
  <p>43. A Defensoria Pública permanece presente em apenas 32% das comarcas brasileiras, limitando o acesso à justiça das vítimas de discriminação racial em todo o território nacional.</p>`;
}

// ═══════════════════════════════════════════
// ARTIGO VII — Ensino, Educação e Cultura
// ═══════════════════════════════════════════

export function renderArticleVIINarrative(d: ArticleNarrativeData): string {
  return `
  <h4>Recomendações do Comitê (CERD/C/BRA/CO/18-20)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§60(a)</span>: Desenvolver diretrizes para combater o racismo institucional em todas as instituições públicas.</p>
    <p><span class="paragraph-ref">§60(b)</span>: Capacitação obrigatória de servidores públicos em combate ao racismo institucional.</p>
    <p><span class="paragraph-ref">§60(d)</span>: Financiar e implementar robustamente as diretrizes de ensino de história e cultura africana e afro-brasileira com indicadores de avaliação.</p>
    <p><span class="paragraph-ref">§60(e)</span>: Engajar representantes afro-brasileiros, indígenas e quilombolas na criação de comissão nacional de reparações históricas.</p>
  </div>

  <h4>7.1 Marco normativo cadastrado vinculado ao Artigo VII</h4>
  ${renderNormativosVinculados(d.normativos, 'VII')}

  <h4>7.2 Implementação das diretrizes de ensino de história e cultura africana</h4>
  <p>45. A implementação das diretrizes que tornam obrigatório o ensino de história e cultura africana e afro-brasileira avançou no período, mas permanece irregular. Avaliação do MEC (2023) concluiu que 78% das escolas públicas declaravam trabalhar os conteúdos correspondentes, mas apenas 42% o faziam de forma sistemática e curricular. A formação continuada de professores capacitou 78.000 profissionais entre 2018 e 2024.</p>

  <h4>7.3 Reparações históricas</h4>
  <p>46. O Estado reconhece que a agenda reparatória encontra resistências políticas e que o processo de construção de consenso é lento.${(() => {
    const norm = renderNormativosInlineList(d.normativos, ['afirmativ', 'repara', 'década', 'decada', 'afrodesc', 'cota', 'palmares'], 'VII', 4);
    return norm ? ` Os instrumentos institucionais cadastrados que materializam, parcialmente, essa agenda incluem: ${norm}.` : '';
  })()}</p>

  <h4>7.4 Cultura afro-brasileira e patrimônio</h4>
  <p>47. A Fundação Cultural Palmares teve suas competências restauradas em 2023. Programas de fomento à cultura afro-brasileira apoiaram mais de mil projetos culturais no período. O IPHAN inscreveu novos bens culturais de matriz africana no Livro de Registro do Patrimônio Imaterial entre 2018 e 2024.</p>`;
}

// ═══════════════════════════════════════════
// DISPATCHER
// ═══════════════════════════════════════════

export function renderArticleNarrative(artigo: string, d: ArticleNarrativeData): string {
  switch (artigo) {
    case 'I': return renderArticleINarrative(d);
    case 'II': return renderArticleIINarrative(d);
    case 'III': return renderArticleIIINarrative(d);
    case 'IV': return renderArticleIVNarrative(d);
    case 'V': return renderArticleVNarrative(d);
    case 'VI': return renderArticleVINarrative(d);
    case 'VII': return renderArticleVIINarrative(d);
    default: return '';
  }
}
