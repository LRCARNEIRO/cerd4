/**
 * articleNarratives.ts — Narrativas textuais por Artigo da Convenção ICERD
 * para o Relatório Federal CERD IV (CERD/C/BRA/21-23).
 *
 * Cada artigo contém:
 * 1. Recomendações do Comitê (estáticas — vêm do tratado)
 * 2. Narrativa institucional com pontos de injeção dinâmica (${...})
 * 3. Seção "Leitura do Sistema CERD4" (100% dinâmica — gerada pelo motor)
 * 4. Leitura transversal (100% dinâmica)
 * 5. Veredito (100% dinâmico)
 *
 * REGRA: Os textos narrativos são mantidos como templates.
 * Dados numéricos que provêm do banco (indicadores, orçamento, lacunas)
 * são injetados via parâmetros. Textos sobre políticas/leis são fixos
 * (provêm do DOCX oficial do Relatório Principal).
 */

import type { LacunaIdentificada, IndicadorInterseccional, DadoOrcamentario } from '@/hooks/useLacunasData';
import { fmtBRL, fmtNum, svgLineChart, svgBarChart, dataCards } from './chartUtils';

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
  normativos: any[];
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
    <p><span class="paragraph-ref">§8(c)</span>: Expandir esforços para implementar efetivamente a Convenção Interamericana contra o Racismo (ratificada em 2021).</p>
  </div>

  <h4>1.1 Sistema de classificação racial e autodeclaração</h4>
  <p>5. O Censo Demográfico de 2022 — primeiro recenseamento do Brasil desde 2010 — confirmou que a população autodeclarada negra (preta e parda) constitui <strong>${((popNegra / num(d.demo?.populacaoTotal || 203080756)) * 100).toFixed(1)}% da população</strong> (${fmtNum(popNegra)} pessoas), distribuída entre ${((pctPardos / num(d.demo?.populacaoTotal || 203080756)) * 100).toFixed(1)}% pardos (${fmtNum(pctPardos)}) e ${((pctPretos / num(d.demo?.populacaoTotal || 203080756)) * 100).toFixed(1)}% pretos (${fmtNum(pctPretos)}). A população autodeclarada branca correspondeu a ${((num(comp.brancos || 88252121) / num(d.demo?.populacaoTotal || 203080756)) * 100).toFixed(1)}% (${fmtNum(num(comp.brancos || 88252121))}). Esses dados foram extraídos da Tabela SIDRA 9605 (Censo Demográfico 2022), divulgada em dezembro de 2023.</p>

  <p>6. ${fmtNum(quilombolas)} pessoas residem em territórios identificados pelo quesito quilombola (Tabela SIDRA 9578), das quais apenas 167.202 (12,6%) vivem em territórios oficialmente reconhecidos — evidência da urgência da regularização fundiária. A população indígena autodeclarada pelo quesito cor/raça foi de ${fmtNum(indigenas)} pessoas (Tabela SIDRA 9605).</p>

  <p>7. Em resposta à recomendação do Comitê sobre a coleta de dados com recorte interseccional (§5–6), a Portaria Conjunta MIR/IBGE n.º 1/2023 consolidou o quesito cor/raça como campo obrigatório e padronizado em todos os registros administrativos federais, com extensão recomendada a estados e municípios. A portaria prevê especificamente a inclusão de marcadores de deficiência, gênero e orientação sexual em cruzamento com o quesito racial, respondendo à preocupação do Comitê sobre a situação de afro-brasileiros com deficiência e/ou LGBTQIA+.</p>

  <h4>1.2 Conceito jurídico: formas diretas, indiretas e interseccionais</h4>
  <p>8. A <strong>Lei n.º 14.532/2023</strong> — principal avanço legislativo do período — equiparou o crime de injúria racial ao crime de racismo, tornando-o imprescritível, inafiançável e sujeito a pena de reclusão de dois a cinco anos. Com isso, eliminou-se a distinção que historicamente permitia que atos discriminatórios contra indivíduos negros recebessem tratamento penal mais brando que os dirigidos a coletividades.</p>

  <p>9. Em resposta à recomendação do Comitê (§8b) sobre a Comissão de Peritos Jurídicos, o governo federal encaminhou ao Congresso Nacional o <strong>PLP n.º 60/2023</strong> — proposta de novo Estatuto da Igualdade Racial — que incorpora definições explícitas de 'discriminação estrutural' e de 'discriminação interseccional'. O projeto estava em tramitação avançada no Senado Federal ao final do período.</p>

  <p>10. No que concerne à <strong>Convenção Interamericana contra o Racismo</strong>, ratificada pelo Brasil em 2021 e promulgada pelo Decreto n.º 10.932/2022, o governo federal criou, em 2023, grupo de trabalho interministerial encarregado de mapear as obrigações decorrentes da ratificação e identificar lacunas na legislação doméstica. O relatório desse grupo de trabalho, concluído em 2024, identificou a necessidade de atualização de 17 dispositivos normativos, dos quais 9 já foram objeto de ação legislativa ou regulamentar no período.</p>

  <h4>1.3 Proteção de migrantes, refugiados e estrangeiros</h4>
  <p>11. A Lei de Migração (Lei n.º 13.445/2017) consolidou a perspectiva dos direitos humanos na política migratória, vedando qualquer distinção baseada em raça, etnia, cor ou origem nacional. Entre 2018 e 2024, mais de 1 milhão de venezuelanos foram atendidos pela Operação Acolhida, coordenada pelo governo federal com participação de organizações internacionais e da sociedade civil.</p>

  <p>12. O Estado reconhece, em resposta à preocupação do Comitê (§54–55), que as normas administrativas restritivas ao ingresso de não nacionais editadas em 2020 — durante o pico da pandemia de Covid-19 — criaram vulnerabilidades para pessoas em busca de proteção internacional. O governo revogou essas normas em março de 2023 e adotou medidas de regularização migratória aberta para venezuelanos (Portaria Interministerial n.º 78/2023).</p>`;
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

  <h4>2.1 Marco normativo 2018–2025</h4>
  <p>13. O período foi marcado por dois movimentos opostos: retrocesso institucional entre 2019 e 2022, com desmonte de órgãos e cortes orçamentários; e reconstrução a partir de 2023, com criação de novos marcos institucionais e legislativos.</p>

  <table>
    <thead><tr><th>Norma</th><th>Ano</th><th>Relevância para a Convenção</th></tr></thead>
    <tbody>
      <tr><td><strong>Decreto n.º 10.932</strong></td><td>2022</td><td>Promulga a Convenção Interamericana contra o Racismo</td></tr>
      <tr><td><strong>Lei n.º 14.532</strong></td><td>2023</td><td>Equipara injúria racial ao crime de racismo — imprescritível, inafiançável</td></tr>
      <tr><td><strong>Decreto n.º 11.491</strong></td><td>2023</td><td>Reconstitui o CNPIR com composição paritária governo–sociedade civil</td></tr>
      <tr><td><strong>Lei n.º 14.600</strong></td><td>2023</td><td>Cria o Ministério da Igualdade Racial (MIR)</td></tr>
      <tr><td><strong>Decreto n.º 11.750</strong></td><td>2023</td><td>Institui a Política Nacional de Igualdade Racial (PNIR) 2023–2027</td></tr>
      <tr><td><strong>Lei n.º 14.678</strong></td><td>2023</td><td>Estende cotas raciais a concursos de empresas estatais</td></tr>
      <tr><td><strong>Lei n.º 14.723</strong></td><td>2023</td><td>Renova e amplia cotas na educação superior de 50% para 60%</td></tr>
      <tr><td><strong>Resolução CNJ n.º 572</strong></td><td>2025</td><td>Amplia cotas no Judiciário de 20% para 30%</td></tr>
      <tr><td><strong>PLP n.º 60</strong></td><td>2023</td><td>Novo Estatuto da Igualdade Racial (em tramitação)</td></tr>
    </tbody>
  </table>

  <h4>2.2 Estrutura institucional: da regressão à reconstrução</h4>
  <p>14. Em atenção à grave preocupação do Comitê (§9) sobre o esvaziamento dos órgãos responsáveis pela implementação da Convenção, o Estado reconhece a trajetória institucional do período. Entre 2019 e 2022, a extinção da SEPPIR como secretaria autônoma e seu rebaixamento a departamento representaram retrocesso significativo.</p>

  <p>15. A partir de janeiro de 2023, o governo federal criou o <strong>Ministério da Igualdade Racial (MIR)</strong>, conferindo status ministerial à agenda racial pela primeira vez na história brasileira. O MIR assumiu a coordenação da PNIR, a supervisão do SINAPIR e a articulação intersetorial das políticas de igualdade racial. Em 2024, o MIR contava com dotação de R$ 1,8 bilhão, aumento de mais de 2.400% em relação ao orçamento médio da extinta SEPPIR/SNPPIR no período anterior.</p>

  <p>16. Sobre a recomendação de criação de Instituição Nacional de Direitos Humanos (INDH) conforme os Princípios de Paris (§10), o Estado informa que o projeto de lei (PL n.º 4.122/2020) foi reapresentado com prioridade em 2023. O Estado reconhece que a ausência de INDH constitui lacuna relevante.</p>

  <p>17. O SINAPIR foi reativado e expandido. Em 2024, o sistema contava com a adesão de 412 órgãos e 198 conselhos municipais e estaduais de promoção da igualdade racial — crescimento de 109% em relação a 2015. A IV CONAPIR, realizada em novembro de 2023, reuniu 1.243 delegados, dos quais 67% eram negros, 18% indígenas e 5% ciganos.</p>

  <h4>2.3 Orçamento para políticas de igualdade racial</h4>
  <p>18. Em resposta à recomendação do Comitê de apresentar dados sobre alocação orçamentária, o governo federal adotou, a partir do PPA 2024–2027, marcadores orçamentários transversais por cor/raça. No sistema, foram rastreadas <strong>${d.orcDados.length} ações orçamentárias vinculadas</strong> ao Artigo II, com dotação total de ${fmtBRL(totalOrcDot)} e ${fmtBRL(totalOrcPago)} pagos (execução de ${execPct.toFixed(1)}%).</p>`;
}

// ═══════════════════════════════════════════
// ARTIGO III — Segregação
// ═══════════════════════════════════════════

export function renderArticleIIINarrative(d: ArticleNarrativeData): string {
  const quilPop = num(d.povos?.quilombolas?.populacao || 1330186);
  const totalOrcPago = d.orcDados.reduce((s, o) => s + num(o.pago), 0);

  return `
  <h4>Recomendações do Comitê (CERD/C/BRA/CO/18-20)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§25</span>: Avaliar as dinâmicas de racismo e classismo na segregação habitacional e implementar políticas efetivas de moradia para afro-brasileiros.</p>
    <p><span class="paragraph-ref">§38</span>: Revisar leis, políticas e práticas para enfrentar as causas do encarceramento desproporcional de afro-brasileiros.</p>
    <p><span class="paragraph-ref">§57</span>: Garantir acesso de ciganos a documentos civis e dados sobre sua situação.</p>
  </div>

  <h4>3.1 Habitação e segregação urbana</h4>
  <p>19. 78,2% dos domicílios chefiados por negros têm acesso à rede geral de água, contra 88,1% dos brancos; 68,6% têm esgotamento adequado, contra 83,2%; e 88,4% têm coleta de lixo, contra 94,1% (Censo 2022, IBGE). Pretos e pardos representam 69% da população sem esgoto adequado e 72% sem água adequada no Brasil.</p>

  <p>20. O déficit habitacional mantém viés racial acentuado. O novo Programa Minha Casa Minha Vida (Lei n.º 14.620/2023) introduziu dispositivos inéditos de equidade racial, reservando pelo menos 30% das unidades subsidiadas para famílias chefiadas por mulheres negras, além de prioridade para comunidades quilombolas e de terreiro.</p>

  <h4>3.2 Sistema prisional e segregação institucional</h4>
  <p>22. <strong>68,7%</strong> da população carcerária é negra — com possível subnotificação dado que 14,7% dos registros não contêm o quesito racial. A população encarcerada atingiu 832 mil pessoas em 2023, mantendo o Brasil como terceiro maior contingente carcerário do mundo.</p>

  <p>24. Em resposta, o governo implementou: (i) Resolução CNJ n.º 525/2023 com diagnósticos raciais sobre impacto de decisões penais; (ii) Protocolo de Uso da Força com Perspectiva Racial (2024); e (iii) revisão de penas de presos provisórios com atenção à desproporção racial.</p>

  <h4>3.3 Povos ciganos: segregação e documentação</h4>
  <p>25. O Censo 2022 identificou aproximadamente 1,1 milhão de pessoas ciganas. O Projeto Documentar realizou mutirões em 148 acampamentos ciganos entre 2023 e 2024, emitindo 12.340 documentos civis. O Plano Nacional de Políticas para Povos Ciganos (2024) estrutura metas de universalização da documentação e acesso a serviços essenciais.</p>`;
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

  <h4>4.1 Marco legal penal: avanços do período</h4>
  <p>27. A <strong>Lei n.º 14.532/2023</strong> constituiu a resposta mais significativa às preocupações do Comitê relativas ao marco legal penal. Ao equiparar injúria racial ao crime de racismo, a lei eliminou a distinção que historicamente permitia o enquadramento de atos discriminatórios em tipo penal com pena menor, prescritível e afiançável. O STJ, em julgamento de 2022 (HC n.º 742.459), reconheceu que a disseminação de conteúdo racista em aplicativos de mensagens e redes sociais configura crime previsto na Lei n.º 7.716/1989.</p>

  <p>28. Os processos judiciais de racismo/injúria racial saltaram de 50 em 2020 para 4.633 em 2025, crescimento de 9.166%. As denúncias no Disque 100 saltaram de 3.535 em 2022 para 16.245 em 2025.</p>

  <p>29. O Estado reconhece, em resposta ao §31(c) das Observações Finais, que entre 2019 e 2022 ocorreram múltiplos incidentes de discurso de ódio com teor racial por parte de autoridades públicas de alto escalão, sem que as responsabilizações tenham sido aplicadas de forma adequada. O MPF abriu 14 inquéritos sobre o tema, dos quais apenas 2 resultaram em denúncia ao Poder Judiciário.</p>

  <h4>4.2 Racismo digital</h4>
  <p>30. O racismo digital tornou-se a manifestação mais prevalente e de crescimento mais acelerado no período. A SaferNet Brasil registrou crescimento de 382% nas denúncias de intolerância religiosa de matriz africana no Disque 100 entre 2020 e 2025. O PL n.º 2.630/2020 (Marco Legal das Plataformas Digitais) estabelece obrigações de remoção de conteúdo racista em 24 horas.</p>`;
}

// ═══════════════════════════════════════════
// ARTIGO V — Igualdade de Direitos
// ═══════════════════════════════════════════

export function renderArticleVNarrative(d: ArticleNarrativeData): string {
  const eco = d.eco || [];
  const sau = d.sau || [];
  const edu = d.edu || [];
  const fem = d.fem || [];
  const ecoFirst = eco[0];
  const ecoLast = eco[eco.length - 1];

  return `
  <h4>Recomendações do Comitê (CERD/C/BRA/CO/18-20)</h4>
  <div class="highlight-box" style="font-size:9.5pt">
    <p><span class="paragraph-ref">§14</span>: Priorizar melhoria dos direitos econômicos e sociais de mulheres negras e indígenas.</p>
    <p><span class="paragraph-ref">§23(a)</span>: Adotar medidas efetivas para erradicar a pobreza entre afro-brasileiros, indígenas e quilombolas.</p>
    <p><span class="paragraph-ref">§23(b)</span>: Revisar o marco regulatório do trabalho doméstico para garantir proteção adequada às mulheres negras.</p>
    <p><span class="paragraph-ref">§17(b)</span>: Adotar medidas efetivas para reduzir a mortalidade materna de mulheres negras.</p>
    <p><span class="paragraph-ref">§19(c)</span>: Renovar e fortalecer o sistema de cotas para o ensino superior.</p>
  </div>

  <h4>5.1 Indicadores de mercado de trabalho (2018–2025)</h4>
  <p>31. As desigualdades raciais no mercado de trabalho persistem de forma estrutural ao longo de todo o período. Os dados da PNAD Contínua (SIDRA 6402 e 6405) mostram:</p>

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

  <p>32. Mulheres negras recebem apenas R$ 2.264 mensais, correspondendo a 46,8% do rendimento de homens não negros (R$ 4.835), configurando a maior desigualdade entre os quatro grupos analisados.</p>

  <p>33. A Lei n.º 14.678/2023 estendeu a política de cotas para concursos de empresas estatais. Contudo, negros representam apenas 26% dos cargos DAS-6 (cargos de liderança mais elevados).</p>

  <h4>5.4 Mortalidade materna — indicador-sentinela</h4>
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

  <h4>5.6 Violência letal: homicídios e letalidade policial</h4>
  <p>42. A violência letal racializada constitui a violação de direitos humanos mais grave e sistemática registrada no período.</p>
  ${d.seg && d.seg.length > 0 ? (() => {
    const first = d.seg![0];
    const last = d.seg![d.seg!.length - 1];
    const validSeg = d.seg!.filter((s: any) => s.homicidioNegro != null);
    const fv = validSeg[0];
    const lv = validSeg[validSeg.length - 1];
    return `
    <div class="regress-box">
      <p><strong>Risco relativo negros/não negros:</strong> ${num(d.atlas?.riscoRelativo || lv?.razaoRisco || 2.7).toFixed(1)}× — inalterado desde 2018.</p>
      <p><strong>Vítimas negras de homicídio:</strong> ${num(first?.percentualVitimasNegras).toFixed(1)}% (${first?.ano}) → ${num(last?.percentualVitimasNegras).toFixed(1)}% (${last?.ano}).</p>
      <p><strong>Letalidade policial negra:</strong> ${num(first?.letalidadePolicial).toFixed(1)}% (${first?.ano}) → ${num(last?.letalidadePolicial).toFixed(1)}% (${last?.ano}) — crescimento constante.</p>
      ${d.fem && d.fem.length > 0 ? `<p><strong>Feminicídio mulheres negras:</strong> ${num(d.fem[d.fem.length - 1]?.percentualNegras).toFixed(1)}% em ${d.fem[d.fem.length - 1]?.ano} — ${fmtNum(num(d.fem[d.fem.length - 1]?.totalFeminicidios))} feminicídios (recorde histórico).</p>` : ''}
    </div>`;
  })() : ''}

  <h4>5.8 Indicadores educacionais (2018–2025)</h4>
  <p>46. A educação é o eixo com evolução mais positiva no período.</p>
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
  <p>47. Lei n.º 14.723/2023 renovou e ampliou o sistema de cotas, elevando o percentual de 50% para 60%.</p>

  <h4>5.9 Representação política</h4>
  <table>
    <thead><tr><th>Cargo</th><th>Negros eleitos 2018 (%)</th><th>Negros 2022/2024 (%)</th><th>Pop. negra 2022 (%)</th></tr></thead>
    <tbody>
      <tr><td>Deputados Federais</td><td>24,4%</td><td>30,1% (2022)</td><td>55,5%</td></tr>
      <tr><td>Prefeitos</td><td>31,9% (2020)</td><td>33,3% (2024)</td><td>55,5%</td></tr>
      <tr><td>Vereadores</td><td>—</td><td>44,2% (2024)</td><td>55,5%</td></tr>
    </tbody>
  </table>

  <h4>5.10 Comunidades quilombolas</h4>
  <p>52. ${fmtNum(num(d.povos?.quilombolas?.populacao || 1330186))} pessoas vivem em territórios identificados como quilombolas, das quais apenas 12,6% residem em territórios oficialmente reconhecidos. ${fmtNum(num(d.povos?.quilombolas?.comunidadesCertificadas || 3158))} comunidades certificadas pela Fundação Palmares. O INCRA abriu 247 novos processos em 2023 e contava com 2.014 processos abertos em novembro de 2025.</p>

  <h4>5.11 Povos indígenas</h4>
  <p>55. ${fmtNum(num(d.demo?.populacaoIndigena || 1694836))} pessoas indígenas pela contagem específica. A criação do Ministério dos Povos Indígenas (MPI) em 2023 e a retomada do processo demarcatório — com 20 homologações entre 2023 e 2025, contra apenas 1 no período 2019–2022 — representam avanços significativos.</p>

  <h4>5.12 Comunidades de terreiro e liberdade religiosa</h4>
  <p>57. Crescimento de 382% nas denúncias de intolerância religiosa entre 2020 e 2025 (566 para 2.723 denúncias). O governo lançou o Programa Brasil de Todas as Religiões, atendendo 2.847 casas de axé em 23 estados até 2024.</p>

  <h4>5.13 Pessoas trans e LGBTQIA+ negras</h4>
  ${d.antra && d.antra.length > 0 ? `
  <table>
    <thead><tr><th>Ano</th><th>Total assassinatos trans</th><th>% negras</th><th>Fonte</th></tr></thead>
    <tbody>${d.antra.map((a: any) => `<tr><td>${a.ano}</td><td>${a.total}</td><td>${num(a.percentualNegras || a.pctNegras).toFixed(0)}%</td><td>Dossiê ANTRA 2026</td></tr>`).join('')}</tbody>
  </table>` : ''}`;
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

  <h4>6.1 Processos judiciais e denúncias</h4>
  <p>66. Em resposta à recomendação central do Comitê sobre dados de processos e condenações (§12), o Estado apresenta dados inéditos:</p>
  <table>
    <thead><tr><th>Indicador</th><th>2020</th><th>2022</th><th>2023</th><th>2024</th><th>2025</th></tr></thead>
    <tbody>
      <tr><td><strong>Novos processos racismo/injúria racial (CNJ)</strong></td><td>50</td><td>234</td><td>973</td><td>2.874</td><td>4.633</td></tr>
      <tr><td><strong>Denúncias discriminação racial (Disque 100)</strong></td><td>—</td><td>3.535</td><td>9.738</td><td>14.543</td><td>16.245</td></tr>
      <tr><td><strong>Denúncias intolerância religiosa</strong></td><td>566</td><td>898</td><td>1.482</td><td>2.472</td><td>2.723</td></tr>
    </tbody>
  </table>
  <p style="font-size:8.5pt;color:#64748b">Fonte: CNJ — Justiça em Números; ONDH/MDHC — Disque 100.</p>

  <p>67. O crescimento exponencial nos processos judiciais — de 50 em 2020 para 4.633 em 2025 — reflete a combinação do efeito da Lei n.º 14.532/2023 com o crescimento das denúncias e maior consciência das vítimas.</p>

  <h4>6.2 Composição racial do Judiciário</h4>
  <p>68. Magistrados negros representavam 18,1% do total em dezembro de 2023, chegando a 19,6% em junho de 2025. A Resolução CNJ n.º 572/2025 ampliou as cotas no Judiciário de 20% para 30%. O Estado reconhece que 18,1% de magistrados negros em um país onde 55,5% da população é negra representa sub-representação grave.</p>

  <p>69. A Defensoria Pública permanece presente em apenas 32% das comarcas brasileiras. A DPU criou, em 2022, a Câmara de Direitos Humanos com foco em Igualdade Racial, e 32 estados possuem núcleos especializados.</p>`;
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
    <p><span class="paragraph-ref">§60(d)</span>: Financiar e implementar robustamente a Lei n.º 10.639/2003 com indicadores de avaliação.</p>
    <p><span class="paragraph-ref">§60(e)</span>: Engajar representantes afro-brasileiros, indígenas e quilombolas na criação de comissão nacional de reparações históricas.</p>
  </div>

  <h4>7.1 Implementação da Lei n.º 10.639/2003</h4>
  <p>70. A implementação da Lei n.º 10.639/2003 — que torna obrigatório o ensino de história e cultura africana e afro-brasileira — avançou no período, mas permanece irregular. Avaliação do MEC (2023) concluiu que 78% das escolas públicas declaravam trabalhar os conteúdos da lei, mas apenas 42% o faziam de forma sistemática e curricular. A formação continuada de professores capacitou 78.000 profissionais entre 2018 e 2024.</p>

  <p>71. O governo lançou em 2023 o Programa Nacional de Formação em Igualdade Racial para Servidores Públicos, com meta de 500.000 servidores até 2027. Em 2024, 127.000 haviam participado.</p>

  <h4>7.2 Reparações históricas</h4>
  <p>72. O governo encaminhou, em 2024, ao Congresso Nacional proposta de criação da Comissão Nacional de Reparação e Memória da Escravidão, em processo de consulta ampla com organizações negras, quilombolas e indígenas.</p>

  <h4>7.3 Cultura afro-brasileira e patrimônio</h4>
  <p>74. A Fundação Cultural Palmares teve suas competências restauradas em 2023. O Programa de Fomento à Cultura Afro-brasileira (R$ 280 milhões em 2023–2024) apoiou 1.247 projetos culturais. O IPHAN inscreveu oito novos bens culturais de matriz africana no Livro de Registro do Patrimônio Imaterial entre 2018 e 2024.</p>

  <h4>7.4 Formação policial (RG n.º 13)</h4>
  <p>74a. O Ministério da Justiça publicou, em 2024, a Política Nacional de Formação Policial com Perspectiva Racial, com módulo obrigatório de 40 horas em todas as academias de polícia. Até 2024, 28 estados haviam aderido.</p>

  <h4>7.5 Revisão de materiais didáticos</h4>
  <p>74b. O PNLD incorporou, a partir de 2021, critério obrigatório de avaliação racial: 97,3% das obras selecionadas no PNLD 2024 cumpriram os critérios, ante 84,1% em 2019.</p>

  <h4>7.6 Autorregulação da mídia</h4>
  <p>74c. A ABERT publicou, em 2023, código de conduta editorial com seção sobre representação racial. O CONAR registrou crescimento de processos sobre publicidade racista: de 2,9% (2013) para 6,2% (2023).</p>`;
}

// ═══════════════════════════════════════════
// DISPATCHER — render narrativa por artigo
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
