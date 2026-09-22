/**
 * Metodologia detalhada de Esforço × Realização × Impacto Evidenciado.
 * Apresenta cada medida em três níveis: conceito → fórmula → exemplo leigo.
 * Os tetos e cortes vêm de `esforcoImpacto.ts` (fonte única), para nunca
 * divergir do cálculo efetivamente aplicado no sistema.
 */
import { TETOS_ESFORCO, CORTE_INTERMEDIARIO, CORTE_ALTO } from '@/utils/esforcoImpacto';

export function generateMetodologiaDetalhadaHTML(): string {
  const agora = new Date().toLocaleString('pt-BR');
  const tEst = TETOS_ESFORCO.estatistica;
  const tOrc = TETOS_ESFORCO.orcamentaria;
  const tNorm = TETOS_ESFORCO.normativa;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Metodologia Detalhada — Esforço, Realização e Impacto Evidenciado</title>
<style>
body{font-family:'Segoe UI',Arial,sans-serif;max-width:210mm;margin:0 auto;padding:24px;font-size:12px;line-height:1.65;color:#1a1a2e}
h1{font-size:20px;color:#0f3460;border-bottom:3px solid #0f3460;padding-bottom:8px}
h2{font-size:15px;color:#16213e;margin-top:26px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
h3{font-size:13px;color:#0f3460;margin-top:16px}
.formula{background:#f1f5f9;border-left:4px solid #0f3460;padding:10px 14px;margin:10px 0;border-radius:4px;font-family:ui-monospace,Menlo,monospace;font-size:11.5px}
.leigo{background:#ecfdf5;border-left:4px solid #10b981;padding:10px 14px;margin:10px 0;border-radius:4px}
.leigo strong{color:#065f46}
.alerta{background:#fffbeb;border-left:4px solid #f59e0b;padding:10px 14px;margin:12px 0;border-radius:4px;font-size:11px}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:11px}
th{background:#0f3460;color:white;padding:7px 10px;text-align:left}
td{padding:7px 10px;border-bottom:1px solid #e2e8f0}
tr:nth-child(even) td{background:#f8fafc}
ul{padding-left:20px}li{margin-bottom:4px}
@media print{body{padding:0}@page{size:A4;margin:2cm}}
</style></head><body>

<h1>Metodologia Detalhada — Esforço, Realização e Impacto Evidenciado</h1>
<p><strong>Sistema de Subsídios para o IV Relatório CERD</strong> · Gerado em ${agora}</p>
<p>Este documento apresenta cada medida do sistema em três níveis: <strong>conceito → fórmula → exemplo em linguagem simples</strong>.
Todas as evidências provêm da matriz auditada Artigo × Recomendação × Evidência, curada manualmente sobre o inventário canônico das
três bases: estatística, orçamentária e normativa.</p>

<h2>1. Esforço — “quanto o Estado conseguiu mobilizar e documentar?”</h2>
<p>O Esforço mede a intensidade da resposta governamental comprovável nas três bases. Ele <em>não</em> mede ainda se a situação social
melhorou: mede se existem evidências concretas de atuação estatal associadas à recomendação.</p>
<p>Cada dimensão é convertida para uma escala de 0 a 100, comparando o número de evidências encontradas com um parâmetro de
referência (teto de saturação) derivado do percentil 75 da própria base: <strong>${tEst} estatísticas, ${tOrc} orçamentárias e ${tNorm} normativas</strong>.</p>
<div class="formula">
E_est = min(n_est ÷ ${tEst} × 100 ; 100)<br/>
E_orç = min(n_orç ÷ ${tOrc} × 100 ; 100)<br/>
E_norm = min(n_norm ÷ ${tNorm} × 100 ; 100)<br/><br/>
<strong>Esforço = (E_est + E_orç + E_norm) ÷ 3</strong>
</div>
<p>O uso de min(...; 100) significa que nenhuma dimensão pode passar de 100 pontos: excedentes não compensam as demais bases.
As três bases têm peso igual de 1/3.</p>
<div class="leigo">
<strong>Em linguagem simples:</strong> imagine três caixas a preencher — uma com dados e indicadores, outra com orçamento público e
outra com normas. Quanto mais essas caixas estiverem preenchidas com evidências pertinentes àquela recomendação, maior o esforço documentado.
</div>
<p><strong>Exemplo.</strong> Uma recomendação com 16 evidências estatísticas, 20 orçamentárias e 2 normativas:</p>
<div class="formula">
E_est = 16 ÷ ${tEst} ≈ ${(16 / tEst * 100).toFixed(0)} · E_orç = 20 ÷ ${tOrc} = 80 · E_norm = 2 ÷ ${tNorm} = 50<br/>
Esforço = (${(16 / tEst * 100).toFixed(0)} + 80 + 50) ÷ 3 ≈ ${(((16 / tEst * 100) + 80 + 50) / 3).toFixed(1)}
</div>
<div class="alerta">
<strong>Advertência metodológica:</strong> um Esforço de 60 pontos <em>não</em> significa que 60% da recomendação foi cumprida.
Significa apenas que há determinado grau de densidade de evidências governamentais relacionadas a ela.
</div>

<h2>2. Realização — “o que foi mobilizado chegou a produzir execução ou resultado observável?”</h2>
<p>A Realização dá um passo além: não pergunta apenas se existem indicadores, orçamento ou normas, mas o que aconteceu com essas evidências.
A lógica difere em cada base, porque a natureza da evidência é diferente.</p>

<h3>2.1 Dimensão estatística</h3>
<div class="formula">R_est = (indicadores que melhoraram + indicadores estáveis) ÷ indicadores avaliáveis × 100</div>
<p>Melhorou = 1; estável = 1; piorou = 0. “Estável” representa manutenção do resultado, não fracasso — a pergunta respondida é:
<em>“a evidência disponível demonstra manutenção ou evolução favorável, em vez de deterioração?”</em></p>
<p><strong>Exemplo.</strong> 10 indicadores avaliáveis, dos quais 5 melhoraram, 3 ficaram estáveis e 2 pioraram: R_est = (5+3) ÷ 10 × 100 = 80.</p>
<div class="leigo">
<strong>Leitura:</strong> em 8 de cada 10 indicadores acompanhados ao longo do tempo, não houve retrocesso — houve melhora ou manutenção.
Isso <em>não</em> quer dizer que 80% do problema foi resolvido.
</div>
<p>Indicadores <strong>sem série histórica</strong> podem demonstrar esforço, mas não permitem medir evolução: uma fotografia isolada informa que
a realidade está sendo medida; para saber se melhorou ou piorou é preciso ao menos dois pontos comparáveis no tempo, considerando a polaridade do indicador.</p>

<h3>2.2 Dimensão orçamentária</h3>
<div class="formula">R_orç = Σ Valor Liquidado ÷ Σ Dotação Autorizada Válida × 100</div>
<p><strong>Exemplo.</strong> Dotação autorizada de R$ 10.000.000 e liquidação de R$ 7.500.000 → R_orç = 75.</p>
<div class="leigo">
<strong>Leitura:</strong> de cada R$ 100 autorizados nas ações relacionadas à recomendação, cerca de R$ 75 chegaram à etapa de liquidação,
isto é, correspondem a despesas cuja execução já foi reconhecida pela Administração.
</div>
<div class="alerta">A realização orçamentária mede execução financeira, e não, isoladamente, a qualidade, a efetividade ou o alcance social
da política financiada. Execução elevada pode coexistir com resultados sociais ainda insuficientes.</div>

<h3>2.3 Dimensão normativa</h3>
<div class="formula">R_norm = 100 quando existe evidência normativa válida vinculada; 0 quando não existe</div>
<p>Aqui não se mede “quanto” uma norma foi executada, e sim se existe institucionalização normativa pertinente à recomendação — lei,
decreto, resolução ou outro ato elegível. O valor 100 significa presença da evidência exigida pelo método, não cumprimento integral.</p>

<h3>2.4 Realização geral</h3>
<div class="formula">Realização = (R_est + R_orç + R_norm) ÷ 3</div>
<p><strong>Exemplo.</strong> R_est = 80, R_orç = 75 e R_norm = 100 → Realização = (80 + 75 + 100) ÷ 3 ≈ 85.</p>
<div class="alerta">A Realização não é uma terceira lente autônoma: é o componente intermediário que converte o Esforço documentado em Impacto Evidenciado.</div>

<h2>3. Impacto Evidenciado — “quanto do esforço encontra correspondência em realização?”</h2>
<div class="formula"><strong>Impacto Evidenciado = Esforço × (Realização ÷ 100)</strong></div>
<p><strong>Exemplo.</strong> Esforço = 60 e Realização = 85 → Impacto = 60 × 0,85 = 51.</p>
<div class="leigo">
<strong>Leitura:</strong> o sistema identificou esforço governamental equivalente a 60 pontos; ao considerar o grau de realização das evidências,
85% desse esforço encontra correspondência nas medidas de realização adotadas. O resultado combinado é um Impacto Evidenciado de 51 pontos.<br/><br/>
<strong>Em uma frase:</strong> Esforço é o tamanho da resposta documentada; Realização indica quanto dessa resposta apresenta sinais de execução ou
evolução; Impacto Evidenciado combina as duas coisas.
</div>

<h2>4. Por que multiplicar, em vez de tirar a média?</h2>
<p>Se usássemos (Esforço + Realização) ÷ 2, uma recomendação com Esforço 90 e Realização 10 obteria 50 — resultado intermediário apesar de
muito esforço documentado e pouquíssima realização. Pela fórmula adotada, 90 × 0,10 = 9.</p>
<p>Esse comportamento é intencional: a Realização funciona como <strong>taxa de conversão</strong> do esforço em impacto. A fórmula garante ainda uma
propriedade coerente com o método: <strong>Impacto ≤ Esforço</strong> — não pode haver mais impacto evidenciado do que esforço documentado que lhe dá suporte.</p>

<h2>5. Tabela didática</h2>
<table>
<tr><th>Situação</th><th>Esforço</th><th>Realização</th><th>Impacto</th><th>Tradução</th></tr>
<tr><td>Muita evidência + alta realização</td><td>90</td><td>90</td><td>81</td><td>resposta ampla e acompanhada de fortes evidências de realização</td></tr>
<tr><td>Muita evidência + pouca realização</td><td>90</td><td>20</td><td>18</td><td>o Estado mobilizou instrumentos, mas há pouca correspondência em execução/resultados</td></tr>
<tr><td>Pouca evidência + alta realização</td><td>20</td><td>90</td><td>18</td><td>as evidências encontradas são favoráveis, mas ainda são escassas</td></tr>
<tr><td>Pouca evidência + pouca realização</td><td>20</td><td>20</td><td>4</td><td>baixa densidade de resposta e baixa realização observada</td></tr>
<tr><td>Esforço intermediário + boa realização</td><td>60</td><td>80</td><td>48</td><td>parte relevante da resposta documentada encontra correspondência em realização</td></tr>
</table>
<p>A tabela deixa evidente que <strong>Esforço e Impacto não são sinônimos</strong>.</p>

<h2>6. Classificação final</h2>
<ul>
<li><strong>Baixo:</strong> 0 a ${(CORTE_INTERMEDIARIO - 0.1).toFixed(1)}</li>
<li><strong>Intermediário:</strong> ${CORTE_INTERMEDIARIO} a ${(CORTE_ALTO - 0.1).toFixed(1)}</li>
<li><strong>Alto:</strong> ${CORTE_ALTO} a 100</li>
</ul>
<div class="alerta">As faixas constituem categorias analíticas internas do sistema e não equivalem, por si mesmas, a uma declaração jurídica de
cumprimento ou descumprimento da Convenção ou das recomendações do Comitê CERD.</div>

<h2>7. Agregação por Artigo ICERD</h2>
<p>Cada Artigo recebe a <strong>média simples</strong> do Esforço e do Impacto das recomendações formalmente associadas a ele. Recomendações sem
evidência permanecem no denominador com valor zero, evitando favorecer artigos com maior número de recomendações. Evidências repetidas
para a mesma recomendação em artigos diferentes são contadas uma única vez.</p>

<h2>Como ler os indicadores — resumo</h2>
<ul>
<li><strong>Esforço:</strong> “Quanto de resposta governamental conseguimos documentar?”</li>
<li><strong>Realização:</strong> “O que aconteceu com essa resposta — houve evolução dos indicadores, execução dos recursos e institucionalização normativa?”</li>
<li><strong>Impacto Evidenciado:</strong> “Quanto do esforço documentado encontra correspondência nas evidências de realização disponíveis?”</li>
</ul>

<hr/>
<p style="font-size:10px;color:#94a3b8">Sistema de Subsídios CERD IV — documento gerado automaticamente a partir dos parâmetros vigentes de cálculo (${agora}).</p>
</body></html>`;
}
