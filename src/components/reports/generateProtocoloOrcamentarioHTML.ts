import { getExportToolbarHTML } from '@/utils/reportExportToolbar';
import { LEGENDA_DEDUP } from '@/utils/orcamentoCanonico';

/**
 * PRODUTO 3 — GUIA METODOLÓGICO DA BASE ORÇAMENTÁRIA
 *
 * Documenta como a base orçamentária foi levantada (camadas de captura),
 * o que entra e o que não entra, como é deduplicada, quais métricas o sistema
 * adota e quais são os achados analíticos (SESAI, extraorçamentário, períodos).
 *
 * Todos os números vêm da base viva; o texto metodológico é fixo porque
 * descreve decisões de método, não dados.
 */

export interface ProtocoloOrcamentarioData {
  orcDados: any[];
}

const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtInt = (n: number) => Math.round(n).toLocaleString('pt-BR');
const fmtBRL = (n: number) => {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e9) return `R$ ${(v / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} bi`;
  if (Math.abs(v) >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  if (Math.abs(v) >= 1e3) return `R$ ${(v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
  return `R$ ${fmtInt(v)}`;
};
const pct = (n: number) => (isFinite(n) ? `${n.toFixed(1)}%` : '—');
const sinal = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

const num = (v: any) => Number(v) || 0;
const soma = (rows: any[], campo: string) => rows.reduce((s, r) => s + num(r[campo]), 0);

/** Heurística SESAI — mesma usada nos painéis de Orçamento. */
function isSesai(r: any): boolean {
  const prog = String(r.programa || '').toLowerCase();
  const orgao = String(r.orgao || '').toUpperCase();
  const obs = String(r.observacoes || '').toLowerCase();
  return orgao.includes('SESAI') || obs.includes('sesai') || prog.includes('20yp') || prog.includes('7684') || prog.includes('21cj');
}

function periodo(rows: any[], de: number, ate: number) {
  return rows.filter((r) => Number(r.ano) >= de && Number(r.ano) <= ate);
}

function blocoPeriodos(rows: any[], rotulo: string): string {
  const p1 = periodo(rows, 2018, 2022);
  const p2 = periodo(rows, 2023, 2025);
  const pagoP1 = soma(p1, 'pago');
  const pagoP2 = soma(p2, 'pago');
  const autP1 = soma(p1, 'dotacao_autorizada');
  const autP2 = soma(p2, 'dotacao_autorizada');
  const mediaP1 = pagoP1 / 5;
  const mediaP2 = pagoP2 / 3;
  const varPago = pagoP1 > 0 ? ((pagoP2 - pagoP1) / pagoP1) * 100 : 0;
  const varMedia = mediaP1 > 0 ? ((mediaP2 - mediaP1) / mediaP1) * 100 : 0;
  const varAut = autP1 > 0 ? ((autP2 - autP1) / autP1) * 100 : 0;
  return `<table>
<tr><th>${esc(rotulo)}</th><th>P1 · 2018–2022 (5 anos)</th><th>P2 · 2023–2025 (3 anos)</th><th>Variação</th></tr>
<tr><td>Dotação autorizada</td><td class="num">${fmtBRL(autP1)}</td><td class="num">${fmtBRL(autP2)}</td><td class="num">${sinal(varAut)}</td></tr>
<tr><td>Pago acumulado</td><td class="num">${fmtBRL(pagoP1)}</td><td class="num">${fmtBRL(pagoP2)}</td><td class="num">${sinal(varPago)}</td></tr>
<tr><td><strong>Pago — média anual</strong> (corrige a assimetria 5×3)</td><td class="num"><strong>${fmtBRL(mediaP1)}</strong></td><td class="num"><strong>${fmtBRL(mediaP2)}</strong></td><td class="num"><strong>${sinal(varMedia)}</strong></td></tr>
<tr><td>Execução (pago / autorizado)</td><td class="num">${pct(autP1 > 0 ? (pagoP1 / autP1) * 100 : NaN)}</td><td class="num">${pct(autP2 > 0 ? (pagoP2 / autP2) * 100 : NaN)}</td><td class="num">—</td></tr>
<tr><td>Registros</td><td class="num">${fmtInt(p1.length)}</td><td class="num">${fmtInt(p2.length)}</td><td class="num">—</td></tr>
</table>`;
}

function tabelaAnos(rows: any[]): string {
  const anos = [...new Set(rows.map((r) => Number(r.ano)).filter(Boolean))].sort((a, b) => a - b);
  return anos
    .map((a) => {
      const g = rows.filter((r) => Number(r.ano) === a);
      const semSesai = g.filter((r) => !isSesai(r));
      const pagoTotal = soma(g, 'pago');
      const pagoSem = soma(semSesai, 'pago');
      const aut = soma(g, 'dotacao_autorizada');
      const share = pagoTotal > 0 ? ((pagoTotal - pagoSem) / pagoTotal) * 100 : 0;
      return `<tr><td>${a}</td><td class="num">${fmtInt(g.length)}</td><td class="num">${fmtBRL(aut)}</td><td class="num">${fmtBRL(pagoTotal)}</td><td class="num">${fmtBRL(pagoSem)}</td><td class="num">${pct(share)}</td><td class="num">${pct(aut > 0 ? (pagoTotal / aut) * 100 : NaN)}</td></tr>`;
    })
    .join('');
}

function ranking(rows: any[], campo: string, limite = 20): string {
  const map = new Map<string, { n: number; pago: number; aut: number }>();
  rows.forEach((r) => {
    const k = String(r[campo] || '—');
    const cur = map.get(k) || { n: 0, pago: 0, aut: 0 };
    cur.n += 1;
    cur.pago += num(r.pago);
    cur.aut += num(r.dotacao_autorizada);
    map.set(k, cur);
  });
  return [...map.entries()]
    .sort((a, b) => b[1].pago - a[1].pago)
    .slice(0, limite)
    .map(
      ([k, v]) =>
        `<tr><td>${esc(k)}</td><td class="num">${fmtInt(v.n)}</td><td class="num">${fmtBRL(v.aut)}</td><td class="num">${fmtBRL(v.pago)}</td><td class="num">${pct(v.aut > 0 ? (v.pago / v.aut) * 100 : NaN)}</td></tr>`,
    )
    .join('');
}

const KEYWORDS_ORCAMENTO = [
  'racial', 'racismo', 'indígen', 'indigen', 'quilombol', 'cigan', 'romani', 'afro', 'palmares',
  'igualdade racial', 'funai', 'sesai', 'etnia', 'étnic', 'povos tradicionais', 'comunidades tradicionais',
  'terreiro', 'matriz africana', 'discriminaç', 'preconceito racial', 'capoeira', 'cultura negra', 'negro',
  'povo de santo', 'candomblé', 'umbanda', 'juventude negra', 'quilombo', 'remanescente', 'autodeclarad',
  'afrodescend', 'ação afirmativa', 'cotas raciais', 'diversidade étnica',
];

export function generateProtocoloOrcamentarioHTML(data: ProtocoloOrcamentarioData): string {
  const now = new Date().toLocaleString('pt-BR');
  const rows = data.orcDados || [];

  const total = rows.length;
  const orcament = rows.filter((r) => r.tipo_dotacao !== 'extraorcamentario');
  const extra = rows.filter((r) => r.tipo_dotacao === 'extraorcamentario');
  const semSesai = rows.filter((r) => !isSesai(r));
  const sesai = rows.filter(isSesai);

  const autTotal = soma(rows, 'dotacao_autorizada');
  const pagoTotal = soma(rows, 'pago');
  const liqTotal = soma(rows, 'liquidado');
  const empTotal = soma(rows, 'empenhado');

  const anos = [...new Set(rows.map((r) => Number(r.ano)).filter(Boolean))].sort((a, b) => a - b);
  const orgaos = new Set(rows.map((r) => r.orgao)).size;
  const programas = new Set(rows.map((r) => r.programa)).size;
  const esferas = new Set(rows.map((r) => r.esfera)).size;

  // Orçamento simbólico: dotação relevante e execução residual
  const simbolicos = rows.filter((r) => num(r.dotacao_autorizada) > 1e6 && num(r.pago) / Math.max(num(r.dotacao_autorizada), 1) < 0.1);
  const semDotacao = rows.filter((r) => num(r.dotacao_autorizada) === 0 && num(r.pago) > 0);

  const pagoSesai = soma(sesai, 'pago');
  const shareSesai = pagoTotal > 0 ? (pagoSesai / pagoTotal) * 100 : 0;
  const pagoExtra = soma(extra, 'pago');
  const shareExtra = pagoTotal > 0 ? (pagoExtra / pagoTotal) * 100 : 0;

  const anoExtra = anos
    .map((a) => {
      const g = extra.filter((r) => Number(r.ano) === a);
      if (!g.length) return '';
      return `<tr><td>${a}</td><td class="num">${fmtInt(g.length)}</td><td class="num">${fmtBRL(soma(g, 'pago'))}</td></tr>`;
    })
    .join('');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Guia Metodológico da Base Orçamentária — Sistema CERD IV</title>
<style>
body{font-family:'Segoe UI',Arial,sans-serif;max-width:210mm;margin:0 auto;padding:24px;font-size:11.5px;line-height:1.6;color:#1a1a2e}
h1{font-size:21px;color:#14532d;border-bottom:3px solid #14532d;padding-bottom:8px;margin-bottom:4px}
h2{font-size:16px;color:#166534;margin-top:30px;border-left:5px solid #14532d;padding-left:10px}
h3{font-size:13px;color:#14532d;margin-top:18px}
h4{font-size:12px;color:#334155;margin:12px 0 4px}
.cover{border:2px solid #14532d;border-radius:10px;padding:18px;background:linear-gradient(135deg,#f6fdf8,#ecfdf5);margin-bottom:18px}
.cover p{margin:3px 0;color:#475569}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}
.kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center}
.kpi .v{font-size:17px;font-weight:700;color:#14532d}
.kpi .l{font-size:9.5px;color:#64748b;text-transform:uppercase;letter-spacing:.4px}
table{width:100%;border-collapse:collapse;margin:8px 0;font-size:10.5px}
th{background:#14532d;color:#fff;padding:6px 8px;text-align:left}
td{padding:5px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}
td.num{text-align:right;white-space:nowrap}
tr:nth-child(even) td{background:#f8fafc}
.note{font-size:10px;color:#475569;padding:9px 11px;background:#fffbeb;border-left:4px solid #f59e0b;margin:12px 0;border-radius:4px}
.legend{font-size:9.5px;color:#475569;background:#f1f5f9;border:1px dashed #94a3b8;border-radius:6px;padding:9px 11px;margin:10px 0}
.formula{font-family:'Consolas','Courier New',monospace;background:#0f172a;color:#e2e8f0;padding:10px 12px;border-radius:6px;font-size:10.5px;white-space:pre-wrap;margin:8px 0}
.flow{font-family:'Consolas','Courier New',monospace;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:12px;font-size:9.5px;white-space:pre;overflow-x:auto;line-height:1.35}
ul{padding-left:18px;margin:6px 0}li{margin-bottom:3px}
.toc{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 20px;font-size:11px}
.tag{display:inline-block;background:#dcfce7;color:#14532d;border-radius:10px;padding:1px 8px;font-size:9px;margin:0 3px 3px 0}
.insight{border:1px solid #bbf7d0;background:#f0fdf4;border-radius:8px;padding:11px 13px;margin:10px 0}
.insight h4{margin-top:0;color:#14532d}
@media print{body{padding:0}@page{size:A4;margin:1.8cm}h2{page-break-after:avoid}table{page-break-inside:avoid}}
</style></head><body>

<div class="cover">
<h1>Guia Metodológico da Base Orçamentária</h1>
<p><strong>Produto complementar ao Protocolo de Governança</strong> · Sistema de Subsídios para o IV Relatório do Brasil ao CERD</p>
<p>Como a base foi levantada, o que entra e o que não entra, como é deduplicada, o que cada métrica mede e quais são os achados</p>
<p>Emissão: ${now} · Período coberto: ${anos[0] ?? '—'}–${anos[anos.length - 1] ?? '—'}</p>
</div>

<div class="kpis">
<div class="kpi"><div class="v">${fmtInt(total)}</div><div class="l">Registros canônicos</div></div>
<div class="kpi"><div class="v">${fmtBRL(autTotal)}</div><div class="l">Dotação autorizada</div></div>
<div class="kpi"><div class="v">${fmtBRL(pagoTotal)}</div><div class="l">Pago</div></div>
<div class="kpi"><div class="v">${pct(autTotal > 0 ? (pagoTotal / autTotal) * 100 : NaN)}</div><div class="l">Execução</div></div>
</div>

<div class="toc">
<strong>Sumário</strong>
<ul>
<li>1. Objeto e pergunta que a base responde</li>
<li>2. Estratégia de captura — 4 camadas + 3 passos complementares</li>
<li>3. Palavras-chave de seleção e exclusões explícitas</li>
<li>4. Deduplicação lógica e definição do registro canônico</li>
<li>5. Métricas: dotação, empenhado, liquidado e pago</li>
<li>6. Retrato atual da base (números vivos)</li>
<li>7. Achado 1 — Efeito mascaramento da SESAI</li>
<li>8. Achado 2 — Orçamentário × extraorçamentário (financiamento reativo)</li>
<li>9. Achado 3 — Comparação entre períodos e efeito tesoura</li>
<li>10. Achado 4 — Orçamento simbólico e pagamento sem dotação</li>
<li>11. Transições de códigos PPA e identificação de órgãos</li>
<li>12. Limitações declaradas e roteiro de atualização</li>
</ul>
</div>

<h2>1. Objeto e pergunta que a base responde</h2>
<p>A base orçamentária existe para responder a uma pergunta que o CERD faz de forma recorrente ao Brasil: <strong>o Estado financiou aquilo que prometeu?</strong> Ela não pretende ser um retrato completo do gasto público federal, e sim o conjunto auditável das ações orçamentárias com <strong>recorte racial ou étnico identificável</strong> entre ${anos[0] ?? '2018'} e ${anos[anos.length - 1] ?? '2025'}.</p>
<p>Duas consequências metodológicas decorrem disso:</p>
<ul>
<li><strong>Não somamos políticas universais</strong> (Bolsa Família integral, SUS, SUAS, Minha Casa Minha Vida) só porque atendem majoritariamente pessoas negras. Sem recorte na programação orçamentária, o número não sustenta afirmação sobre política racial.</li>
<li><strong>Não descartamos ação pequena.</strong> Uma ação de R$ 200 mil com recorte explícito é evidência melhor do que um programa bilionário sem recorte.</li>
</ul>

<h2>2. Estratégia de captura — 4 camadas + 3 passos complementares</h2>
<div class="flow">
 CAMADA 1  Programas Temáticos do PPA .......... consulta por código de programa finalístico
 CAMADA 2  Subfunção 422 ....................... direitos individuais, coletivos e difusos
 CAMADA 3  Órgãos com mandato direto ........... MIR (67000) e MPI (92000)
 CAMADA 4  Ações específicas SESAI ............. 20YP e 7684 (migraram para programa de saúde)
              |
              v  deduplicação por chave composta (órgão | programa | ano)
              |
 PASSO 5   Complementação de dotação (LOA) ..... dados abertos, preenche dotação inicial/autorizada
 PASSO 6   Ingestão keyword-first .............. varredura ampla de subfunções por palavra-chave
 PASSO 7   Complementação manual (SIOP) ........ Planos Orçamentários invisíveis à API do Portal
</div>
<table>
<tr><th>Etapa</th><th>O que captura</th><th>Por que é necessária</th></tr>
<tr><td><strong>Camada 1 — Programas PPA</strong></td><td>Programas finalísticos: 2034 (SEPPIR), 5034 (MDHC, filtrado), 2065 / 0617 / 5136 (indígenas), 5802 / 5803 / 5804 (MIR), 1617 (demarcação) e as Agendas Transversais do PPA 2024–2027</td><td>É a espinha dorsal: onde a política racial aparece formalmente organizada</td></tr>
<tr><td><strong>Camada 2 — Subfunção 422</strong></td><td>Ações de direitos difusos em órgãos transversais</td><td>Alcança o que está fora dos programas temáticos; validada por palavra-chave para excluir direitos humanos genéricos</td></tr>
<tr><td><strong>Camada 3 — Órgãos de mandato direto</strong></td><td>Todas as despesas do MIR e do MPI</td><td>Órgãos cujo mandato é integralmente racial/indígena: qualquer despesa sua é política do tema</td></tr>
<tr><td><strong>Camada 4 — SESAI</strong></td><td>Ações 20YP (saúde indígena) e 7684 (saneamento em aldeias)</td><td>A SESAI migrou do programa indígena para o programa de saúde e escaparia das camadas 1–3</td></tr>
<tr><td><strong>Passo 5 — Dotação LOA</strong></td><td>Dotação inicial e autorizada via dados abertos</td><td>A API do Portal da Transparência não fornece dotação inicial; sem ela não há taxa de execução</td></tr>
<tr><td><strong>Passo 6 — Keyword-first</strong></td><td>Cauda longa de ações raciais dispersas em subfunções não tradicionais (formação, patrimônio cultural)</td><td>Captura o que a estrutura programática esconde</td></tr>
<tr><td><strong>Passo 7 — Manual SIOP</strong></td><td>Planos Orçamentários específicos dentro de ações genéricas (ex.: 21AR, 21AT)</td><td>Política racial lançada sob rubrica genérica de direitos humanos, visível só no SIOP</td></tr>
</table>
<div class="note"><strong>Filtro inteligente na Camada 1:</strong> programas de órgãos focais (MIR, MPI) entram integralmente; programas universais só entram quando o título da ação carrega palavra-chave racial/étnica. Sem essa regra, a base infla com gasto universal e perde poder de prova.</div>

<h2>3. Palavras-chave de seleção e exclusões explícitas</h2>
<h3>3.1 Vocabulário de captura (${KEYWORDS_ORCAMENTO.length} radicais)</h3>
<p>São radicais, não palavras inteiras — "indígen" alcança indígena, indígenas e indigenista; "quilombol" alcança quilombola e quilombolas.</p>
<p>${KEYWORDS_ORCAMENTO.map((k) => `<span class="tag">${esc(k)}</span>`).join('')}</p>

<h3>3.2 O que fica de fora, e por quê</h3>
<table>
<tr><th>Exclusão</th><th>Motivo</th></tr>
<tr><td>Programas universais sem recorte (Bolsa Família integral, MCMV, SUS, SUAS)</td><td>Público majoritariamente negro não é o mesmo que política racial; incluir infla o total e destrói a comparabilidade</td></tr>
<tr><td>Ações genéricas do 5034/MDHC sem palavra-chave racial</td><td>Impossibilidade de desagregação confiável do que é racial dentro da rubrica</td></tr>
<tr><td>MIR retroativo antes de 2023</td><td>A API reclassifica registros antigos para o órgão novo; aceitar isso criaria gasto do MIR antes de o MIR existir</td></tr>
<tr><td>Ações de direitos humanos da subfunção 422 sem marca racial</td><td>Mesma lógica do universal: sem recorte, não é evidência racial</td></tr>
<tr><td>Registros duplicados entre camadas</td><td>Removidos pela deduplicação lógica da Seção 4</td></tr>
</table>
<div class="legend"><strong>Campo <code>publico_alvo</code> é ignorado na classificação temática.</strong> A classificação usa apenas campos reais da fonte: programa, órgão e descritivo. Público-alvo é preenchimento editorial e não pode determinar se um gasto conta como política racial.</div>

<h2>4. Deduplicação lógica e registro canônico</h2>
<p>A mesma execução orçamentária pode ser capturada por mais de uma camada — por exemplo, uma ação do MIR dentro do programa 5804 aparece na Camada 1 (programa) e na Camada 3 (órgão). A base bruta é preservada, mas apenas <strong>um registro por programa/ação + ano + esfera</strong> é somado.</p>
<div class="formula">chave canônica = código do programa | código da ação | ano | esfera

ranking de confiabilidade da fonte (menor = prevalece)
  1  API Portal da Transparência — ação específica
  2  Programa Temático do PPA
  3  captura por órgão / keyword e SIOP
  4  subfunção 422 (genérica)
  5  Agenda Transversal (só quando é a única cobertura do grupo)

critério de desempate: valor pago > 0  →  existência de URL de fonte  →  maior valor</div>
<div class="legend">${esc(LEGENDA_DEDUP)}</div>

<h2>5. Métricas: o que cada número significa</h2>
<table>
<tr><th>Métrica</th><th>O que mede</th><th>Uso no sistema</th></tr>
<tr><td>Dotação inicial (LOA)</td><td>Intenção legislativa aprovada pelo Congresso</td><td>Referência de promessa</td></tr>
<tr><td>Dotação autorizada</td><td>LOA + créditos adicionais, remanejamentos e suplementações</td><td>Denominador da taxa de execução</td></tr>
<tr><td>Empenhado</td><td>Reserva formal do recurso</td><td>Indício de intenção efetiva</td></tr>
<tr><td>Liquidado</td><td>Bem ou serviço confirmadamente entregue ao Estado</td><td>Usado pelos motores de evolução</td></tr>
<tr><td><strong>Pago</strong></td><td><strong>Transferência efetiva ao beneficiário final</strong></td><td><strong>Métrica principal das análises</strong></td></tr>
</table>
<p>Valores atuais da base: autorizado ${fmtBRL(autTotal)} · empenhado ${fmtBRL(empTotal)} · liquidado ${fmtBRL(liqTotal)} · pago ${fmtBRL(pagoTotal)}.</p>
<div class="note"><strong>Por que "pago" e não "liquidado":</strong> o objetivo do projeto é avaliar se a política chegou à ponta. O pago identifica "orçamento de papel" (dotação sem entrega) e detecta represamento que o liquidado pode mascarar. É também o padrão do TCU e do Portal da Transparência. Ressalva: o último exercício da série tem dados parciais e o pago costuma estar defasado em relação ao liquidado por prazo normal de processamento.</div>

<h2>6. Retrato atual da base</h2>
<table>
<tr><th>Dimensão</th><th>Valor</th></tr>
<tr><td>Registros canônicos</td><td class="num">${fmtInt(total)}</td></tr>
<tr><td>Registros orçamentários</td><td class="num">${fmtInt(orcament.length)}</td></tr>
<tr><td>Registros extraorçamentários</td><td class="num">${fmtInt(extra.length)}</td></tr>
<tr><td>Programas / ações distintos</td><td class="num">${fmtInt(programas)}</td></tr>
<tr><td>Órgãos executores</td><td class="num">${fmtInt(orgaos)}</td></tr>
<tr><td>Esferas cobertas</td><td class="num">${fmtInt(esferas)}</td></tr>
<tr><td>Exercícios cobertos</td><td class="num">${anos.length ? `${anos[0]}–${anos[anos.length - 1]}` : '—'}</td></tr>
</table>

<h3>6.1 Série anual — total, sem SESAI e participação da SESAI</h3>
<table>
<tr><th>Ano</th><th>Registros</th><th>Autorizado</th><th>Pago total</th><th>Pago sem SESAI</th><th>Peso SESAI</th><th>Execução</th></tr>
${tabelaAnos(rows)}
</table>

<h3>6.2 Órgãos executores por volume pago</h3>
<table>
<tr><th>Órgão</th><th>Registros</th><th>Autorizado</th><th>Pago</th><th>Execução</th></tr>
${ranking(rows, 'orgao', 20)}
</table>

<h3>6.3 Programas e ações por volume pago</h3>
<table>
<tr><th>Programa / ação</th><th>Registros</th><th>Autorizado</th><th>Pago</th><th>Execução</th></tr>
${ranking(rows, 'programa', 25)}
</table>

<h3>6.4 Origem dos registros (camada de captura)</h3>
<table>
<tr><th>Fonte de captura</th><th>Registros</th><th>Autorizado</th><th>Pago</th><th>Execução</th></tr>
${ranking(rows, 'fonte_dados', 20)}
</table>

<h2>7. Achado 1 — Efeito mascaramento da SESAI</h2>
<p>As ações de saúde indígena da SESAI respondem por <strong>${fmtBRL(pagoSesai)}</strong> — ${pct(shareSesai)} de tudo que foi pago na base. São recursos legítimos e indispensáveis, mas de natureza distinta: financiam <em>serviço de saúde</em> a povos indígenas, não <em>política de promoção da igualdade racial</em>.</p>
<p>Somados sem distinção, produzem uma ilusão de robustez: o total parece grande e estável mesmo quando as políticas raciais <em>stricto sensu</em> estão em colapso orçamentário. Por isso o sistema apresenta sempre duas perspectivas.</p>
<h3>7.1 Com SESAI</h3>
${blocoPeriodos(rows, 'Total (com SESAI)')}
<h3>7.2 Sem SESAI — políticas raciais stricto sensu</h3>
${blocoPeriodos(semSesai, 'Sem SESAI')}
<div class="insight"><h4>Leitura</h4><p>A comparação lado a lado é o teste decisivo: se as duas perspectivas apontam na mesma direção, a conclusão é robusta; se divergem, o movimento do total é efeito de composição — saúde indígena — e não mudança de prioridade em política racial. Qualquer afirmação ao CERD sobre aumento ou queda de investimento precisa declarar qual das duas perspectivas está usando.</p></div>

<h2>8. Achado 2 — Orçamentário × extraorçamentário</h2>
<table>
<tr><th>Categoria</th><th>O que é</th><th>Registros</th><th>Pago</th></tr>
<tr><td>Esforço do Estado (orçamentário)</td><td>Recursos aprovados pelo Congresso na LOA, com ciclo completo dotação → empenho → liquidação → pagamento. Mede <strong>prioridade política</strong>.</td><td class="num">${fmtInt(orcament.length)}</td><td class="num">${fmtBRL(soma(orcament, 'pago'))}</td></tr>
<tr><td>Financiamento compensatório (extraorçamentário)</td><td>Compensações ambientais, indenizações, royalties e convênios que transitam pelo caixa público sem autorização legislativa. Mede <strong>dependência de fontes externas</strong>.</td><td class="num">${fmtInt(extra.length)}</td><td class="num">${fmtBRL(pagoExtra)}</td></tr>
<tr><td><strong>Financiamento total</strong></td><td>Quanto dinheiro efetivamente chegou às políticas</td><td class="num"><strong>${fmtInt(total)}</strong></td><td class="num"><strong>${fmtBRL(pagoTotal)}</strong></td></tr>
</table>
<p>O financiamento compensatório representa hoje ${pct(shareExtra)} do pago na base.</p>
${anoExtra ? `<h3>8.1 Distribuição anual do extraorçamentário</h3><table><tr><th>Ano</th><th>Registros</th><th>Pago</th></tr>${anoExtra}</table>` : ''}
<div class="insight"><h4>Insight — financiamento reativo</h4>
<p>Parte relevante do financiamento das políticas indígenas no período não deriva do orçamento público, mas de <strong>externalidades de projetos de infraestrutura</strong>: compensações ambientais de rodovias, hidrelétricas e mineração, além de royalties e convênios. Isso configura um padrão reativo — a política recebe mais recursos quando há grandes obras que geram compensação, e não quando há maior prioridade política.</p>
<p><strong>Implicação para o CERD:</strong> a partir de 2023 observa-se maior institucionalização desses recursos dentro da estrutura orçamentária formal. O risco interpretativo é tratar como "aumento de investimento" aquilo que é, em parte, <strong>reclassificação contábil</strong> de recursos que antes estavam fora do orçamento. Somar as duas categorias sem distinção produz erro de interpretação.</p></div>
<div class="note"><strong>Rastro documental:</strong> registros com pagamento e sem dotação LOA na base atual: <strong>${fmtInt(semDotacao.length)}</strong>. São tipicamente convênios, royalties e compensações — por desenho não possuem dotação, e por isso não devem ser lidos como "execução acima do previsto".</div>

<h2>9. Achado 3 — Comparação entre períodos e efeito tesoura</h2>
<p>O sistema compara <strong>P1 (2018–2022)</strong> e <strong>P2 (2023–2025)</strong>. A comparação exige três cautelas, todas aplicadas nas tabelas da Seção 7:</p>
<ul>
<li><strong>Assimetria temporal:</strong> P1 tem cinco exercícios e P2 apenas três. O acumulado favorece P1; por isso a linha de <em>média anual</em> é a comparação metodologicamente correta.</li>
<li><strong>Efeito tesoura na liquidação:</strong> restos a pagar e execução plurianual deslocam despesa entre exercícios. Diferenças de até cerca de 15% no período mais recente devem ser lidas como defasagem contábil, não como corte de política.</li>
<li><strong>Exercício corrente incompleto:</strong> o último ano da série tem execução parcial e sempre subestima o resultado final.</li>
</ul>
<h3>9.1 Marcos institucionais que explicam a série</h3>
<table>
<tr><th>Período</th><th>Padrão observado</th></tr>
<tr><td>2018–2019</td><td>Base modesta: SEPPIR ativa em patamar reduzido; FUNAI operante com ações finalísticas</td></tr>
<tr><td>2020–2022</td><td>Desmonte institucional: política racial absorvida por rubrica genérica do MDHC; queda expressiva no pago sem SESAI</td></tr>
<tr><td>2023</td><td>Reconstrução: criação do MIR e do MPI, forte elevação de dotação com execução ainda incipiente</td></tr>
<tr><td>2024–2025</td><td>Novos programas do PPA e Agendas Transversais; pela primeira vez as políticas raciais sem SESAI superam a casa do bilhão</td></tr>
</table>

<h2>10. Achado 4 — Orçamento simbólico e execução</h2>
<p>Chamamos de <strong>orçamento simbólico</strong> a ação com dotação autorizada relevante (acima de R$ 1 milhão) e execução residual (abaixo de 10% do autorizado). É o padrão típico da política anunciada e não entregue.</p>
<table>
<tr><th>Sinal</th><th>Registros</th><th>Autorizado envolvido</th><th>Pago</th></tr>
<tr><td>Orçamento simbólico</td><td class="num">${fmtInt(simbolicos.length)}</td><td class="num">${fmtBRL(soma(simbolicos, 'dotacao_autorizada'))}</td><td class="num">${fmtBRL(soma(simbolicos, 'pago'))}</td></tr>
<tr><td>Pagamento sem dotação (extraorçamentário por natureza)</td><td class="num">${fmtInt(semDotacao.length)}</td><td class="num">—</td><td class="num">${fmtBRL(soma(semDotacao, 'pago'))}</td></tr>
</table>
${simbolicos.length ? `<table><tr><th>Programa / ação</th><th>Órgão</th><th>Ano</th><th>Autorizado</th><th>Pago</th><th>Execução</th></tr>${simbolicos
    .slice()
    .sort((a, b) => num(b.dotacao_autorizada) - num(a.dotacao_autorizada))
    .slice(0, 20)
    .map(
      (r) =>
        `<tr><td>${esc(r.programa)}</td><td>${esc(r.orgao)}</td><td class="num">${esc(r.ano)}</td><td class="num">${fmtBRL(num(r.dotacao_autorizada))}</td><td class="num">${fmtBRL(num(r.pago))}</td><td class="num">${pct((num(r.pago) / Math.max(num(r.dotacao_autorizada), 1)) * 100)}</td></tr>`,
    )
    .join('')}</table>` : ''}

<h2>11. Transições de códigos PPA e identificação de órgãos</h2>
<p>Nenhuma série orçamentária racial de 2018 a 2025 é contínua: os códigos mudam a cada PPA e os órgãos são criados, extintos e sucedidos. Sem o mapa abaixo, qualquer série temporal aparenta rupturas que são apenas contábeis.</p>
<table>
<tr><th>Tema</th><th>PPA 2016–2019</th><th>PPA 2020–2023</th><th>PPA 2024–2027</th></tr>
<tr><td>Igualdade racial</td><td>2034 (SEPPIR)</td><td>5034 (MDHC)</td><td>5802, 5803, 5804 (MIR)</td></tr>
<tr><td>Povos indígenas</td><td>2065</td><td>0617</td><td>5136, 1617 (MPI)</td></tr>
<tr><td>Saúde indígena (SESAI)</td><td>2065</td><td>5022</td><td>5022</td></tr>
<tr><td>Quilombolas</td><td>2034</td><td>5034</td><td>5802 (MIR)</td></tr>
<tr><td>Órgão líder</td><td>SEPPIR + FUNAI</td><td>MDHC + FUNAI</td><td>MIR + MPI</td></tr>
</table>
<table>
<tr><th>Órgão</th><th>Código</th><th>Período</th><th>Antecessores</th></tr>
<tr><td>MIR</td><td>67000</td><td>2023–presente</td><td>SEPPIR → MMFDH → MDHC</td></tr>
<tr><td>MPI</td><td>92000</td><td>2023–presente</td><td>FUNAI (MJ)</td></tr>
<tr><td>FUNAI</td><td>52000</td><td>2018–presente</td><td>—</td></tr>
<tr><td>INCRA</td><td>49000</td><td>2018–presente</td><td>—</td></tr>
<tr><td>SESAI / MS</td><td>36000</td><td>2018–presente</td><td>—</td></tr>
</table>

<h2>12. Limitações declaradas e roteiro de atualização</h2>
<h3>12.1 Cobertura consolidada</h3>
<ul>
<li>Povos indígenas (FUNAI / MPI) em toda a série</li>
<li>Saúde indígena (SESAI) via camada dedicada</li>
<li>MIR a partir de 2023, com os três programas finalísticos</li>
<li>Agendas Transversais do PPA 2024–2027</li>
</ul>
<h3>12.2 Limitações persistentes</h3>
<ul>
<li><strong>Quilombolas:</strong> cobertura parcial — parte relevante da política está diluída em ações de regularização fundiária sem recorte explícito</li>
<li><strong>Programa 5034 (2020–2023):</strong> ações genéricas filtradas por impossibilidade de desagregação confiável; o gasto racial desse período é, portanto, um piso e não um total</li>
<li><strong>Estados e municípios:</strong> dependem do SICONFI, cuja granularidade não permite identificar recorte racial com a mesma segurança da esfera federal</li>
<li><strong>Defasagem de liquidação:</strong> compromete comparação do exercício corrente</li>
<li><strong>Planos Orçamentários:</strong> só existem no SIOP; a captura automática pela API não os enxerga, o que exige o passo manual e mantém risco residual de subcaptura</li>
</ul>
<h3>12.3 Como manter a base</h3>
<div class="flow">
 1. Rodar as camadas 1–4 para o novo exercício (painéis de ingestão federal)
 2. Rodar o passo 5 (dotação LOA) assim que os dados abertos do exercício forem publicados
 3. Rodar o passo 6 (keyword-first) e revisar a cauda longa capturada
 4. Conferir no SIOP os Planos Orçamentários de ações genéricas e lançar o passo 7
 5. Reexecutar a deduplicação e conferir o painel de auditoria de duplicatas
 6. Reemitir este guia — os números se atualizam sozinhos
</div>

<hr/>
<p style="font-size:9.5px;color:#94a3b8">Guia Metodológico da Base Orçamentária · Sistema de Subsídios CERD IV · Documento gerado dinamicamente a partir da base viva em ${now}. Os valores refletem o estado da base nesta data; reemissões posteriores produzem números atualizados.</p>
${getExportToolbarHTML('guia-metodologico-base-orcamentaria')}
</body></html>`;
}
