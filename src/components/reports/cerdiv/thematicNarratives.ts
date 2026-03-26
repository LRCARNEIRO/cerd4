/**
 * thematicNarratives.ts — Narrativas temáticas densas para o Relatório CERD IV
 * 
 * Cada função gera uma seção narrativa completa contando a história da evolução
 * dos dados/indicadores de 2018 a 2025, como atualização do CERD III.
 */

import { svgLineChart, svgBarChart, svgDonutChart, fmtBRL, fmtNum, dataCards } from './chartUtils';

function num(v: unknown): number {
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

// ═══════════════════════════════════════════
// SEGURANÇA PÚBLICA
// ═══════════════════════════════════════════

export function renderSecurityNarrative(seg: any[], fem: any[], atlas: any, jovens: any, violIntersec: any[], juventudeData: any[]): string {
  if (!seg.length) return '';

  const first = seg[0];
  const last = seg[seg.length - 1];
  const validSeg = seg.filter((s: any) => s.homicidioNegro != null);
  const firstValid = validSeg[0];
  const lastValid = validSeg[validSeg.length - 1];

  const femFirst = fem?.[0];
  const femLast = fem?.[fem.length - 1];

  return `
  <h3>A. Segurança Pública e Violência Racial</h3>
  <div class="section">
    <p>A segurança pública permanece o eixo mais crítico da desigualdade racial no Brasil. O período 2018-2025 revela uma <strong>queda absoluta nas taxas de homicídio</strong>, mas com <strong>manutenção do risco relativo racial</strong>, configurando um avanço insuficiente que não altera a estrutura da violência letal.</p>

    <h4>Homicídios por raça/cor</h4>
    ${validSeg.length > 1 ? `
    <div class="chart-container">
      <div class="chart-title">Taxa de homicídio por 100 mil habitantes — Negros vs Não Negros (2018-${lastValid?.ano || 2023})</div>
      ${svgLineChart({
        label: validSeg.map((s: any) => s.ano).join(','),
        series: [
          { name: 'Negros', color: '#dc2626', values: validSeg.map((s: any) => num(s.homicidioNegro)) },
          { name: 'Não Negros', color: '#64748b', values: validSeg.map((s: any) => num(s.homicidioBranco)) },
        ],
      })}
      <p style="font-size:8.5pt;margin-top:0.25cm"><strong>Fonte:</strong> Atlas da Violência 2025 (IPEA/FBSP). Nota: a comparação é Negros vs Não Negros conforme metodologia do Atlas.</p>
    </div>` : ''}

    <div class="analysis-box">
      <h4>📊 Leitura dos dados</h4>
      <p>A taxa de homicídio de pessoas negras caiu de <strong>${num(firstValid?.homicidioNegro).toFixed(1)}/100 mil</strong> em ${firstValid?.ano} para <strong>${num(lastValid?.homicidioNegro).toFixed(1)}/100 mil</strong> em ${lastValid?.ano}, uma redução de ${((1 - num(lastValid?.homicidioNegro) / num(firstValid?.homicidioNegro)) * 100).toFixed(1)}%. No entanto, a taxa entre não negros também caiu proporcionalmente (de ${num(firstValid?.homicidioBranco).toFixed(1)} para ${num(lastValid?.homicidioBranco).toFixed(1)}), mantendo o <strong>risco relativo em ${num(atlas?.riscoRelativo || lastValid?.razaoRisco || 2.7).toFixed(1)}x</strong> — praticamente inalterado desde 2018.</p>
      <p>Isso significa que <strong>um negro tem ${num(atlas?.riscoRelativo || 2.7).toFixed(1)} vezes mais chance de ser assassinado</strong> que um não negro, e essa razão não se alterou substancialmente no período.</p>
    </div>

    <h4>Letalidade policial</h4>
    <div class="chart-container">
      <div class="chart-title">Participação de vítimas negras na letalidade policial (%) — 2018-${last?.ano || 2024}</div>
      ${svgLineChart({
        label: seg.map((s: any) => s.ano).join(','),
        series: [
          { name: '% Vítimas negras em letalidade policial', color: '#f97316', values: seg.map((s: any) => num(s.letalidadePolicial)) },
          { name: '% Total de vítimas de homicídio negras', color: '#ef4444', values: seg.map((s: any) => num(s.percentualVitimasNegras)) },
        ],
      })}
      <p style="font-size:8.5pt;margin-top:0.25cm"><strong>Fonte:</strong> 13º a 19º Anuário FBSP (2019-2025).</p>
    </div>

    <div class="regress-box">
      <h4>🔴 Alerta: Letalidade policial em crescimento</h4>
      <p>A participação de vítimas negras na letalidade policial <strong>subiu de ${num(first?.letalidadePolicial).toFixed(1)}% em ${first?.ano} para ${num(last?.letalidadePolicial).toFixed(1)}% em ${last?.ano}</strong>. Ou seja, enquanto os homicídios gerais diminuíram, a violência estatal contra a população negra intensificou-se proporcionalmente. Em ${last?.ano}, <strong>${num(last?.percentualVitimasNegras).toFixed(0)}% de todas as vítimas de homicídio e ${num(last?.letalidadePolicial).toFixed(0)}% das vítimas de ação policial eram negras</strong>.</p>
    </div>

    ${fem && fem.length > 1 ? `
    <h4>Feminicídio</h4>
    <div class="chart-container">
      <div class="chart-title">Feminicídios no Brasil — Total e participação de mulheres negras (2018-${femLast?.ano})</div>
      ${svgBarChart(
        fem.map((f: any) => String(f.ano)),
        [{ name: 'Total feminicídios', color: '#ec4899', values: fem.map((f: any) => num(f.totalFeminicidios)) }],
        650, 200
      )}
      <p style="font-size:8.5pt;margin-top:0.25cm">Participação de mulheres negras: ${num(femFirst?.percentualNegras).toFixed(1)}% (${femFirst?.ano}) → ${num(femLast?.percentualNegras).toFixed(1)}% (${femLast?.ano}). <strong>Fonte:</strong> 13º a 19º Anuário FBSP.</p>
    </div>
    <p>O feminicídio no Brasil atingiu recorde histórico em ${femLast?.ano} com <strong>${fmtNum(num(femLast?.totalFeminicidios))} casos</strong>. A participação de mulheres negras entre as vítimas subiu de ${num(femFirst?.percentualNegras).toFixed(1)}% para ${num(femLast?.percentualNegras).toFixed(1)}%, evidenciando a sobreposição de vulnerabilidades de raça e gênero.</p>
    ` : ''}

    ${juventudeData?.length > 0 ? `
    <h4>Juventude negra</h4>
    <div class="highlight-box">
      <p><strong>47,8% das vítimas de homicídio</strong> tinham entre 15 e 29 anos em 2023 (Atlas da Violência 2025). O IVJ-N (Índice de Vulnerabilidade Juvenil) indica que jovens negros têm <strong>risco ${num(atlas?.ivjn?.riscoRelativo || 2.0).toFixed(1)}x maior</strong> de homicídio que jovens brancos.</p>
      ${dataCards(juventudeData.slice(0, 5).map((j: any) => ({
        value: typeof j.valor === 'number' ? `${j.valor}${j.indicador.includes('%') ? '%' : ''}` : String(j.valor),
        label: j.indicador.substring(0, 40),
      })))}
    </div>` : ''}

    ${violIntersec?.length > 0 ? `
    <h4>Violência interseccional</h4>
    <table>
      <thead><tr><th>Tipo de violência</th><th>Mulheres negras</th><th>Mulheres brancas</th><th>Fonte</th></tr></thead>
      <tbody>${violIntersec.map((v: any) => `
        <tr>
          <td>${v.tipo}</td>
          <td><strong>${v.unidadeAbsoluta ? fmtNum(num(v.mulherNegra)) : `${num(v.mulherNegra).toFixed(1)}%`}</strong></td>
          <td>${v.unidadeAbsoluta ? fmtNum(num(v.mulherBranca)) : `${num(v.mulherBranca).toFixed(1)}%`}</td>
          <td style="font-size:8pt">${v.fonte}</td>
        </tr>`).join('')}</tbody>
    </table>` : ''}

    <p><strong>Conclusão:</strong> A segurança pública brasileira permanece racialmente estruturada. Apesar da queda absoluta nos homicídios, o risco relativo se mantém, a letalidade policial cresce proporcionalmente contra negros, e o feminicídio de mulheres negras bate recordes. Este eixo configura o maior déficit de cumprimento da Convenção ICERD.</p>
  </div>`;
}

// ═══════════════════════════════════════════
// SAÚDE
// ═══════════════════════════════════════════

export function renderHealthNarrative(sau: any[], saudeMaterna: any): string {
  if (!sau.length) return '';

  const first = sau[0];
  const last = sau[sau.length - 1];

  return `
  <h3>B. Saúde — Mortalidade Materna e Infantil</h3>
  <div class="section">
    <p>A saúde racial no Brasil revela padrões complexos de desigualdade que persistem no período 2018-2025, com destaque para a mortalidade materna — o indicador mais sensível às disparidades de acesso e qualidade do cuidado.</p>

    <h4>Mortalidade materna por raça/cor</h4>
    <div class="chart-container">
      <div class="chart-title">Razão de mortalidade materna (por 100 mil NV) — Negras vs Brancas (2018-${last?.ano})</div>
      ${svgLineChart({
        label: sau.map((s: any) => s.ano).join(','),
        series: [
          { name: 'Negras (pretas+pardas)', color: '#dc2626', values: sau.map((s: any) => num(s.mortalidadeMaternaNegra)) },
          { name: 'Brancas', color: '#64748b', values: sau.map((s: any) => num(s.mortalidadeMaternaBranca)) },
          ...(sau[0]?.mortalidadeMaternaPretas != null ? [{ name: 'Pretas (isolado)', color: '#7c2d12', values: sau.map((s: any) => num(s.mortalidadeMaternaPretas)) }] : []),
        ],
      })}
      <p style="font-size:8.5pt;margin-top:0.25cm"><strong>Fonte:</strong> SIM/SINASC (DataSUS). Cálculo: (Óbitos maternos por raça ÷ Nascidos vivos por raça da mãe) × 100.000.</p>
    </div>

    <div class="analysis-box">
      <h4>📊 Evolução 2018-${last?.ano}</h4>
      <p>A mortalidade materna de mulheres negras (pretas + pardas) oscilou de <strong>${num(first?.mortalidadeMaternaNegra).toFixed(1)}/100 mil NV</strong> em ${first?.ano} para <strong>${num(last?.mortalidadeMaternaNegra).toFixed(1)}/100 mil NV</strong> em ${last?.ano}. O pico ocorreu em 2021 (${num(sau.find((s: any) => s.ano === 2021)?.mortalidadeMaternaNegra || 110.2).toFixed(1)}), durante a pandemia de COVID-19.</p>
      ${sau[0]?.mortalidadeMaternaPretas != null ? `<p><strong>Dado crítico:</strong> Quando se desagrega pretas de pardas, a mortalidade de mulheres <strong>pretas</strong> isoladamente atingiu <strong>${num(sau.find((s: any) => s.ano === 2021)?.mortalidadeMaternaPretas || 194.8).toFixed(1)}/100 mil NV</strong> em 2021 — quase 4 vezes a média nacional. O grande volume de nascimentos de pardas "puxa" a média do grupo "negras" para baixo, mascarando a situação extrema das mulheres pretas.</p>` : ''}
    </div>

    <h4>Mortalidade infantil</h4>
    <div class="gap-box">
      <h4>⚠️ Paradoxo da classificação racial</h4>
      <p>A taxa de mortalidade infantil entre crianças classificadas como brancas aparece <strong>superior</strong> à de negras nos dados oficiais (${num(last?.mortalidadeInfantilBranca).toFixed(1)}‰ vs ${num(last?.mortalidadeInfantilNegra).toFixed(1)}‰ em ${last?.ano}). Este paradoxo é explicado pelo <strong>viés de classificação racial</strong>: no nascimento, a cor é autodeclarada pela mãe; no atestado de óbito, é atribuída por terceiros (médico/cartório). Há sub-registro de óbitos de crianças negras que inverte artificialmente a razão racial.</p>
    </div>

    <p><strong>Conclusão:</strong> A saúde materna permanece como indicador-sentinela da desigualdade racial. Embora tenha havido recuperação pós-COVID, a mortalidade de mulheres pretas permanece estruturalmente elevada, e o viés de classificação racial nos registros de óbito infantil impede uma avaliação precisa da evolução real.</p>
  </div>`;
}

// ═══════════════════════════════════════════
// EDUCAÇÃO
// ═══════════════════════════════════════════

export function renderEducationNarrative(edu: any[], evasao: any[], analfabetismo: any, eduRacaGenero: any[]): string {
  if (!edu.length) return '';

  const first = edu[0];
  const last = edu[edu.length - 1];

  return `
  <h3>C. Educação — Acesso, Permanência e Qualidade</h3>
  <div class="section">
    <p>A educação é o eixo com evolução mais positiva no período, com <strong>avanços mensuráveis no acesso ao ensino superior</strong> pela população negra. No entanto, a desigualdade estrutural persiste: mesmo com melhoras, a distância entre brancos e negros se mantém em todos os níveis de ensino.</p>

    <h4>Ensino superior completo por raça</h4>
    <div class="chart-container">
      <div class="chart-title">Percentual com ensino superior completo (25+ anos) — Negros vs Brancos</div>
      ${svgLineChart({
        label: edu.map((e: any) => e.ano).join(','),
        series: [
          { name: 'Negros (%)', color: '#2563eb', values: edu.map((e: any) => num(e.superiorNegroPercent)) },
          { name: 'Brancos (%)', color: '#94a3b8', values: edu.map((e: any) => num(e.superiorBrancoPercent)) },
        ],
      })}
      <p style="font-size:8.5pt;margin-top:0.25cm"><strong>Fonte:</strong> PNAD Contínua Educação (SIDRA 7129). Anos 2020-2021 sem dados (PNAD suspensa na pandemia).</p>
    </div>

    <div class="advance-box">
      <h4>✅ Avanço: Acesso ao ensino superior</h4>
      <p>O percentual de negros com ensino superior completo saiu de <strong>${num(first?.superiorNegroPercent).toFixed(1)}%</strong> em ${first?.ano} para <strong>${num(last?.superiorNegroPercent).toFixed(1)}%</strong> em ${last?.ano}, um crescimento de ${(num(last?.superiorNegroPercent) - num(first?.superiorNegroPercent)).toFixed(1)} pontos percentuais. Este avanço é atribuível à política de cotas (Lei 12.711/2012, renovada pela Lei 14.723/2023). No entanto, o patamar branco permanece em ${num(last?.superiorBrancoPercent).toFixed(1)}%, indicando que a diferença absoluta ainda é de ${(num(last?.superiorBrancoPercent) - num(last?.superiorNegroPercent)).toFixed(1)} pontos percentuais.</p>
    </div>

    <h4>Analfabetismo</h4>
    ${analfabetismo ? `
    ${dataCards([
      { value: `${num(analfabetismo.taxaGeral).toFixed(1)}%`, label: 'Taxa geral (2024)' },
      { value: `${num(analfabetismo.taxaNegros).toFixed(1)}%`, label: 'Negros' },
      { value: `${num(analfabetismo.taxaBrancos).toFixed(1)}%`, label: 'Brancos' },
      { value: `${num(analfabetismo.taxaIdososNegros60Mais).toFixed(1)}%`, label: 'Idosos negros 60+' },
    ])}
    <p>O analfabetismo caiu para <strong>${num(analfabetismo.taxaGeral).toFixed(1)}% da população</strong> (${fmtNum(num(analfabetismo.totalAnalfabetos))} pessoas), mas a desigualdade racial persiste: negros (${num(analfabetismo.taxaNegros).toFixed(1)}%) têm mais que o dobro da taxa de brancos (${num(analfabetismo.taxaBrancos).toFixed(1)}%). Entre idosos negros 60+, a taxa é de <strong>${num(analfabetismo.taxaIdososNegros60Mais).toFixed(1)}%</strong>, refletindo a exclusão educacional histórica.</p>` : ''}

    ${evasao?.length > 0 ? `
    <h4>Evasão escolar — Jovens 15-29 que não estudam e não concluíram ensino médio</h4>
    <div class="chart-container">
      <div class="chart-title">Composição racial dos jovens fora da escola sem ensino médio (%)</div>
      ${svgLineChart({
        label: evasao.map((e: any) => e.ano).join(','),
        series: [
          { name: 'Negros (%)', color: '#dc2626', values: evasao.map((e: any) => num(e.percentualNegro)) },
          { name: 'Brancos (%)', color: '#64748b', values: evasao.map((e: any) => num(e.percentualBranco)) },
        ],
      })}
      <p style="font-size:8.5pt;margin-top:0.25cm"><strong>Fonte:</strong> SIS/IBGE 2025, Tabela 4.16.</p>
    </div>
    <p>Em ${evasao[evasao.length - 1]?.ano}, <strong>${num(evasao[evasao.length - 1]?.percentualNegro).toFixed(1)}% dos jovens fora da escola sem ensino médio</strong> eram negros, uma proporção que se manteve praticamente estável no período.</p>` : ''}

    ${eduRacaGenero?.length > 0 ? `
    <h4>Interseccionalidade: Raça × Gênero na educação</h4>
    <table>
      <thead><tr><th>Indicador</th><th>Mulher Negra</th><th>Mulher Branca</th><th>Homem Negro</th><th>Homem Branco</th></tr></thead>
      <tbody>${eduRacaGenero.slice(0, 4).map((e: any) => `
        <tr>
          <td>${e.indicador}</td>
          <td><strong>${num(e.mulherNegra).toFixed(2)}%</strong></td>
          <td>${num(e.mulherBranca).toFixed(2)}%</td>
          <td>${num(e.homemNegro).toFixed(2)}%</td>
          <td>${num(e.homemBranco).toFixed(2)}%</td>
        </tr>`).join('')}</tbody>
    </table>
    <p style="font-size:8.5pt"><strong>Fonte:</strong> Censo 2022 (SIDRA 9606 × 10061/9542).</p>` : ''}

    <p><strong>Conclusão:</strong> A educação apresenta o avanço mais tangível, especialmente no acesso ao ensino superior negro (+${(num(last?.superiorNegroPercent) - num(first?.superiorNegroPercent)).toFixed(1)}pp). Porém, a disparidade estrutural persiste em todos os níveis, e jovens negros permanecem sobre-representados entre os que abandonam a escola.</p>
  </div>`;
}

// ═══════════════════════════════════════════
// TRABALHO, RENDA E POBREZA
// ═══════════════════════════════════════════

export function renderLaborNarrative(eco: any[], classePorRaca: any[], trabalhoRG: any[], cadUnico: any[], chefia: any): string {
  if (!eco.length) return '';

  const first = eco[0];
  const last = eco[eco.length - 1];

  return `
  <h3>D. Trabalho, Renda e Pobreza</h3>
  <div class="section">
    <p>O mercado de trabalho brasileiro reduziu o desemprego geral no período 2018-2025, mas as desigualdades raciais permanecem estruturais: negros ganham menos, são mais informais e estão mais expostos à pobreza.</p>

    <h4>Desemprego por raça</h4>
    <div class="chart-container">
      <div class="chart-title">Taxa de desemprego (%) — Negros vs Brancos (2018-${last?.ano})</div>
      ${svgLineChart({
        label: eco.map((e: any) => e.ano).join(','),
        series: [
          { name: 'Negros', color: '#dc2626', values: eco.map((e: any) => num(e.desempregoNegro)) },
          { name: 'Brancos', color: '#64748b', values: eco.map((e: any) => num(e.desempregoBranco)) },
        ],
      })}
      <p style="font-size:8.5pt;margin-top:0.25cm"><strong>Fonte:</strong> PNAD Contínua (SIDRA 6402).</p>
    </div>

    <h4>Rendimento médio mensal</h4>
    <div class="chart-container">
      <div class="chart-title">Rendimento médio mensal habitual (R$) — Negros vs Brancos</div>
      ${svgBarChart(
        eco.map((e: any) => String(e.ano)),
        [
          { name: 'Negros', color: '#2563eb', values: eco.map((e: any) => num(e.rendaMediaNegra)) },
          { name: 'Brancos', color: '#94a3b8', values: eco.map((e: any) => num(e.rendaMediaBranca)) },
        ],
        650, 230, 0, undefined, (v: number) => `R$ ${(v / 1000).toFixed(1)}k`
      )}
      <p style="font-size:8.5pt;margin-top:0.25cm"><strong>Fonte:</strong> PNAD Contínua (SIDRA 6405).</p>
    </div>

    <div class="analysis-box">
      <h4>📊 Evolução comparativa</h4>
      <p>O desemprego negro caiu de <strong>${num(first?.desempregoNegro).toFixed(1)}% para ${num(last?.desempregoNegro).toFixed(1)}%</strong>, e o branco de ${num(first?.desempregoBranco).toFixed(1)}% para ${num(last?.desempregoBranco).toFixed(1)}%. A renda nominal negra cresceu de R$ ${fmtNum(num(first?.rendaMediaNegra))} para R$ ${fmtNum(num(last?.rendaMediaNegra))} (+${((num(last?.rendaMediaNegra) / num(first?.rendaMediaNegra) - 1) * 100).toFixed(0)}%). Contudo, a <strong>razão de renda negra/branca permanece em torno de 0,59</strong> — ou seja, uma pessoa negra ganha em média 59% do que uma branca.</p>
    </div>

    ${trabalhoRG?.length > 0 ? `
    <h4>Interseccionalidade: Raça × Gênero no trabalho</h4>
    <table>
      <thead><tr><th>Grupo</th><th>Rendimento</th><th>Desemprego</th><th>Informalidade</th></tr></thead>
      <tbody>${trabalhoRG.map((t: any) => `
        <tr>
          <td><strong>${t.grupo}</strong></td>
          <td>R$ ${fmtNum(num(t.renda))}</td>
          <td>${num(t.desemprego).toFixed(1)}%</td>
          <td>${num(t.informalidade).toFixed(1)}%</td>
        </tr>`).join('')}</tbody>
    </table>
    <p style="font-size:8.5pt"><strong>Fonte:</strong> DIEESE — Infográfico Consciência Negra 2025. Nota: DIEESE usa "negros/não negros".</p>
    <p>A <strong>mulher negra</strong> ocupa a posição mais desfavorável: renda de R$ ${fmtNum(num(trabalhoRG[0]?.renda))}, correspondendo a apenas <strong>46,8% do rendimento do homem não negro</strong> (R$ ${fmtNum(num(trabalhoRG[3]?.renda || trabalhoRG[trabalhoRG.length - 1]?.renda))}).</p>` : ''}

    ${classePorRaca?.length > 0 ? `
    <h4>Pobreza por raça</h4>
    <table>
      <thead><tr><th>Faixa</th><th>Brancos</th><th>Pardos</th><th>Pretos</th><th>Total</th></tr></thead>
      <tbody>${classePorRaca.slice(-4).map((c: any) => `
        <tr>
          <td>${c.faixa}</td>
          <td>${c.branca != null ? `${num(c.branca).toFixed(1)}%` : '—'}</td>
          <td>${c.parda != null ? `${num(c.parda).toFixed(1)}%` : '—'}</td>
          <td>${c.preta != null ? `${num(c.preta).toFixed(1)}%` : '—'}</td>
          <td>${num(c.total).toFixed(1)}%</td>
        </tr>`).join('')}</tbody>
    </table>
    <p style="font-size:8.5pt"><strong>Fonte:</strong> SIS/IBGE 2024-2025.</p>` : ''}

    ${chefia ? `
    <h4>Chefia familiar e insegurança alimentar</h4>
    <div class="gap-box">
      <p>Das ${fmtNum(num(chefia.mulheresChefesMonoparentais))} famílias monoparentais chefiadas por mulheres, <strong>${num(chefia.percentualNegras).toFixed(1)}% são negras</strong>. A insegurança alimentar grave (fome) atinge <strong>${num(chefia.fomePretos).toFixed(1)}%</strong> dos domicílios chefiados por pretos e <strong>${num(chefia.fomePardos).toFixed(1)}%</strong> dos chefiados por pardos, contra ${num(chefia.fomeBrancos).toFixed(1)}% dos chefiados por brancos. Mulheres negras com escolaridade ≥8 anos ainda sofrem <strong>${num(chefia.iaModeradaGraveMulheresNegrasEscolarizadas).toFixed(0)}%</strong> de insegurança alimentar moderada/grave, contra ${num(chefia.iaModeradaGraveMulheresBrancasEscolarizadas).toFixed(1)}% das brancas — evidenciando que a escolaridade não protege igualmente contra a fome.</p>
    </div>` : ''}

    <p><strong>Conclusão:</strong> O mercado de trabalho melhorou para todos, mas a estrutura da desigualdade permanece: negros ganham 59% do rendimento de brancos, mulheres negras ocupam a base da pirâmide salarial, e a pobreza segue racialmente concentrada.</p>
  </div>`;
}

// ═══════════════════════════════════════════
// TERRA E TERRITÓRIO + POVOS TRADICIONAIS
// ═══════════════════════════════════════════

export function renderTerritoryNarrative(povos: any, deficit: any[]): string {
  if (!povos) return '';

  const ind = povos.indigenas || {};
  const qui = povos.quilombolas || {};
  const neg = povos.populacaoNegra || {};

  return `
  <h3>E. Terra, Território e Habitação</h3>
  <div class="section">
    <p>A questão territorial é central para povos indígenas e quilombolas. O período 2018-2025 divide-se em duas fases: a <strong>paralisia de 2019-2022</strong> (apenas ${ind.terrasHomologadas2018_2022 || 1} terra indígena homologada) e a <strong>retomada a partir de 2023</strong> (${ind.terrasHomologadas2023_2025 || 20} homologações).</p>

    <h4>Povos indígenas</h4>
    ${dataCards([
      { value: fmtNum(num(ind.populacaoCorRaca || 1227642)), label: 'População indígena (Censo 2022)' },
      { value: `${ind.etnias || 391}`, label: 'Etnias identificadas' },
      { value: `${ind.linguas || 295}`, label: 'Línguas' },
      { value: `${num(ind.totalTIsHomologadasReservadas2025 || 536)}`, label: 'TIs homologadas/reservadas' },
    ])}

    <div class="analysis-box">
      <p>O Censo 2022 revelou que <strong>63,4% da população indígena vive fora de Terras Indígenas</strong>, enfrentando vulnerabilidades urbanas e invisibilidade estatística. A homologação de TIs saltou de ${ind.terrasHomologadas2018_2022 || 1} (2018-2022) para ${ind.terrasHomologadas2023_2025 || 20} (2023-2025), mas o acumulado total (${ind.totalTIsHomologadasReservadas2025 || 536}) ainda é insuficiente frente às demandas históricas.</p>
    </div>

    <h4>Comunidades quilombolas</h4>
    ${dataCards([
      { value: fmtNum(num(qui.populacao || 1330186)), label: 'Primeira contagem (Censo 2022)' },
      { value: `${fmtNum(num(qui.comunidadesCertificadas || 3158))}`, label: 'Comunidades certificadas (Palmares)' },
      { value: `${qui.territoriosTitulados || 245}`, label: 'Territórios titulados (INCRA)' },
      { value: `${num(qui.percentualEmTerritorios || 12.6).toFixed(1)}%`, label: 'Em territórios reconhecidos' },
    ])}

    <div class="gap-box">
      <h4>⚠️ Déficit de titulação</h4>
      <p>Apesar das ${fmtNum(num(qui.comunidadesCertificadas || 3158))} comunidades certificadas pela Fundação Palmares, apenas <strong>${qui.territoriosTitulados || 245} territórios foram titulados</strong> pelo INCRA — cobrindo somente ${num(qui.percentualEmTerritorios || 12.6).toFixed(1)}% da população quilombola. Há ${fmtNum(num(qui.processosAbertosIncra || 2014))} processos abertos no INCRA. A infraestrutura nas comunidades é precária: apenas ${num(qui.acessoRedeAgua || 33.6).toFixed(1)}% com rede de água (vs 82,9% nacional) e ${num(qui.esgotamentoAdequado || 25.1).toFixed(1)}% com esgotamento adequado (vs 62,5% nacional).</p>
    </div>

    ${deficit?.length > 0 ? `
    <h4>Déficit habitacional por raça</h4>
    <div class="chart-container">
      <div class="chart-title">Déficit habitacional — Domicílios por raça do responsável</div>
      ${svgBarChart(
        deficit.map((d: any) => String(d.ano)),
        [
          { name: 'Negros', color: '#b91c1c', values: deficit.map((d: any) => num(d.negros)) },
          { name: 'Brancos', color: '#94a3b8', values: deficit.map((d: any) => num(d.brancos)) },
        ],
        650, 200, 0, undefined, (v: number) => `${(v / 1e6).toFixed(1)}M`
      )}
      <p style="font-size:8.5pt;margin-top:0.25cm"><strong>Fonte:</strong> Fundação João Pinheiro.</p>
    </div>` : ''}

    ${neg?.infraestrutura ? `
    <h4>Infraestrutura domiciliar — População negra</h4>
    <table>
      <thead><tr><th>Indicador</th><th>Negros</th><th>Brancos</th><th>Nacional</th></tr></thead>
      <tbody>
        <tr><td>Água (rede geral)</td><td><strong>${num(neg.infraestrutura.aguaRedeGeral).toFixed(1)}%</strong></td><td>${num(neg.infraestruturaBrancos?.aguaRedeGeral).toFixed(1)}%</td><td>${num(neg.mediaNacional?.aguaRedeGeral).toFixed(1)}%</td></tr>
        <tr><td>Esgoto adequado</td><td><strong>${num(neg.infraestrutura.esgotoAdequado).toFixed(1)}%</strong></td><td>${num(neg.infraestruturaBrancos?.esgotoAdequado).toFixed(1)}%</td><td>${num(neg.mediaNacional?.esgotoAdequado).toFixed(1)}%</td></tr>
        <tr><td>Coleta de lixo</td><td><strong>${num(neg.infraestrutura.coletaLixo).toFixed(1)}%</strong></td><td>${num(neg.infraestruturaBrancos?.coletaLixo).toFixed(1)}%</td><td>${num(neg.mediaNacional?.coletaLixo).toFixed(1)}%</td></tr>
      </tbody>
    </table>
    <p style="font-size:8.5pt"><strong>Fonte:</strong> Censo 2022, Características dos domicílios por cor/raça do responsável.</p>` : ''}

    <p><strong>Conclusão:</strong> A retomada de demarcações e titulações a partir de 2023 é um avanço concreto, mas insuficiente frente ao passivo acumulado. A infraestrutura em comunidades tradicionais permanece muito aquém da média nacional.</p>
  </div>`;
}

// ═══════════════════════════════════════════
// LGBTQIA+ E DEFICIÊNCIA
// ═══════════════════════════════════════════

export function renderLGBTandDisabilityNarrative(serieAntra: any[], lgbtqia: any[], deficiencia: any[]): string {
  const blocks: string[] = [];

  if (serieAntra?.length > 0) {
    const first = serieAntra.find((s: any) => s.ano >= 2018) || serieAntra[0];
    const last = serieAntra[serieAntra.length - 1];
    blocks.push(`
    <h4>LGBTQIA+ — Violência contra pessoas trans</h4>
    <div class="chart-container">
      <div class="chart-title">Assassinatos de pessoas trans no Brasil (2018-${last?.ano})</div>
      ${svgBarChart(
        serieAntra.filter((s: any) => s.ano >= 2018).map((s: any) => String(s.ano)),
        [{ name: 'Total assassinatos', color: '#8b5cf6', values: serieAntra.filter((s: any) => s.ano >= 2018).map((s: any) => num(s.totalAssassinatos)) }],
        650, 200
      )}
      <p style="font-size:8.5pt;margin-top:0.25cm"><strong>Fonte:</strong> Dossiê ANTRA 2026 (série histórica). Média 2017-2025: 77% das vítimas eram negras.</p>
    </div>
    <p>Em ${last?.ano}, foram registrados <strong>${last?.totalAssassinatos} assassinatos de pessoas trans</strong>, com <strong>${last?.negros}% de vítimas negras</strong>. A sobreposição de raça e identidade de gênero coloca mulheres trans negras como o grupo mais vulnerável à violência letal no Brasil.</p>`);
  }

  if (deficiencia?.length > 0) {
    blocks.push(`
    <h4>Pessoas com Deficiência por raça</h4>
    <table>
      <thead><tr><th>Raça/Cor</th><th>Prevalência PcD</th><th>Ocupação</th><th>Renda Média</th></tr></thead>
      <tbody>${deficiencia.map((d: any) => `
        <tr>
          <td>${d.raca}</td>
          <td>${num(d.taxaDeficiencia).toFixed(1)}%</td>
          <td>${d.empregabilidade != null ? `${num(d.empregabilidade).toFixed(1)}%` : '—'}</td>
          <td>${d.rendaMedia != null ? `R$ ${fmtNum(num(d.rendaMedia))}` : '—'}</td>
        </tr>`).join('')}</tbody>
    </table>
    <p style="font-size:8.5pt"><strong>Fonte:</strong> Censo 2022 (SIDRA 10126) / PNAD Contínua (SIDRA 4178/9384).</p>
    <p>A prevalência de deficiência é maior entre pretos (${num(deficiencia.find((d: any) => d.raca === 'Preta')?.taxaDeficiencia || 8.6).toFixed(1)}%) do que entre brancos (${num(deficiencia.find((d: any) => d.raca === 'Branca')?.taxaDeficiencia || 7.1).toFixed(1)}%), e a renda média de PcD pretas (R$ ${fmtNum(num(deficiencia.find((d: any) => d.raca === 'Preta')?.rendaMedia || 1485))}) é 37% inferior à de PcD brancas.</p>`);
  }

  if (blocks.length === 0) return '';

  return `
  <h3>F. Interseccionalidades Específicas — LGBTQIA+ e Deficiência</h3>
  <div class="section">
    <p>A análise interseccional revela grupos sub-representados nas estatísticas oficiais, mas cuja vulnerabilidade é agravada pela sobreposição de raça com outras dimensões de exclusão.</p>
    ${blocks.join('')}
    <p><strong>Conclusão:</strong> O Comitê CERD reiteradamente recomenda a ampliação da coleta de dados interseccionais. Embora o Brasil tenha avançado (Censo 2022 incluiu quilombolas e ciganos), persistem lacunas graves para LGBTQIA+ negros e PcD negros.</p>
  </div>`;
}

// ═══════════════════════════════════════════
// TODAS AS LACUNAS AGRUPADAS
// ═══════════════════════════════════════════

const statusCfg: Record<string, { label: string; badge: string }> = {
  cumprido: { label: 'Cumprido', badge: 'badge-success' },
  parcialmente_cumprido: { label: 'Parcial', badge: 'badge-warning' },
  nao_cumprido: { label: 'Não Cumprido', badge: 'badge-danger' },
  retrocesso: { label: 'Retrocesso', badge: 'badge-danger' },
  em_andamento: { label: 'Em Andamento', badge: 'badge-info' },
};

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça', politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública', saude: 'Saúde', educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda', terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio', participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas'
};

export function renderAllRecommendations(lacunas: any[]): string {
  if (!lacunas.length) return '';

  // Group by eixo_tematico
  const porEixo: Record<string, any[]> = {};
  lacunas.forEach((l: any) => {
    const eixo = l.eixo_tematico || 'outros';
    if (!porEixo[eixo]) porEixo[eixo] = [];
    porEixo[eixo].push(l);
  });

  const porStatus: Record<string, number> = {};
  lacunas.forEach((l: any) => { porStatus[l.status_cumprimento] = (porStatus[l.status_cumprimento] || 0) + 1; });

  const eixosHTML = Object.entries(porEixo).map(([eixo, lacs]) => {
    const eixoStatus: Record<string, number> = {};
    lacs.forEach((l: any) => { eixoStatus[l.status_cumprimento] = (eixoStatus[l.status_cumprimento] || 0) + 1; });

    const lacsHTML = lacs.map((l: any) => {
      const st = statusCfg[l.status_cumprimento] || statusCfg.nao_cumprido;
      return `
        <tr>
          <td><span class="paragraph-ref">${l.paragrafo}</span></td>
          <td>${l.tema}</td>
          <td><span class="badge ${st.badge}">${st.label}</span></td>
          <td style="font-size:8pt">${l.descricao_lacuna?.substring(0, 120) || '—'}${(l.descricao_lacuna?.length || 0) > 120 ? '...' : ''}</td>
        </tr>`;
    }).join('');

    return `
      <h4>${eixoLabels[eixo] || eixo} (${lacs.length} recomendações)</h4>
      <p style="font-size:9pt;margin-bottom:0.2cm">
        ${eixoStatus.cumprido ? `<span class="badge badge-success">${eixoStatus.cumprido} cumprida(s)</span> ` : ''}
        ${eixoStatus.parcialmente_cumprido ? `<span class="badge badge-warning">${eixoStatus.parcialmente_cumprido} parcial(is)</span> ` : ''}
        ${eixoStatus.nao_cumprido ? `<span class="badge badge-danger">${eixoStatus.nao_cumprido} não cumprida(s)</span> ` : ''}
        ${eixoStatus.retrocesso ? `<span class="badge badge-danger">${eixoStatus.retrocesso} retrocesso(s)</span> ` : ''}
        ${eixoStatus.em_andamento ? `<span class="badge badge-info">${eixoStatus.em_andamento} em andamento</span> ` : ''}
      </p>
      <table>
        <thead><tr><th>§</th><th>Tema</th><th>Status</th><th>Descrição</th></tr></thead>
        <tbody>${lacsHTML}</tbody>
      </table>`;
  }).join('');

  return `
  <h2>II. Quadro Completo de Cumprimento das Recomendações</h2>
  <div class="section">
    <p>O Comitê CERD emitiu um total de <strong>${lacunas.length} recomendações/observações</strong> ao Brasil. A análise sistemática revela o seguinte quadro de cumprimento, organizado por eixo temático:</p>

    ${svgDonutChart([
      { label: 'Cumprido', value: porStatus.cumprido || 0, color: '#22c55e' },
      { label: 'Parcial', value: porStatus.parcialmente_cumprido || 0, color: '#eab308' },
      { label: 'Em Andamento', value: porStatus.em_andamento || 0, color: '#3b82f6' },
      { label: 'Não Cumprido', value: porStatus.nao_cumprido || 0, color: '#f97316' },
      { label: 'Retrocesso', value: porStatus.retrocesso || 0, color: '#ef4444' },
    ])}

    ${eixosHTML}
  </div>`;
}
