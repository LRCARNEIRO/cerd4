import { getExportToolbarHTML } from '@/utils/reportExportToolbar';
import { RECOMMENDATION_CONCEPT_BUNDLES, UBIQUITOUS_GROUP_TOKENS, IMPORTANT_SHORT_KEYWORDS } from '@/utils/recommendationKeywordConcepts';
import { buildRolEstatistico } from '@/utils/rolEstatisticoCanonico';

/**
 * PRODUTO 2 — PROTOCOLO METODOLÓGICO DE GOVERNANÇA (LEGADO E MÉTODO)
 *
 * Guia metodológico digital: taxonomia, fontes de dados, fórmulas de cálculo,
 * fluxogramas e critérios de classificação.
 *
 * Regra do projeto: zero hardcoded nas dimensões quantitativas — todos os números
 * (inventários, coberturas, fontes, órgãos, execuções) são improvisados em tempo
 * real a partir das 3 bases (Estatística, Orçamentária, Normativa) + Recomendações.
 * Blocos sem dado são silenciosamente omitidos.
 */

export interface ProtocoloGovernancaData {
  indicadores: any[];
  orcDados: any[];
  normativos: any[];
  recomendacoes: any[];
  diagnosticMap: Map<string, any>;
}


const esc = (s: any) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const fmtInt = (n: number) => Math.round(n).toLocaleString('pt-BR');
const fmtBRL = (n: number) => {
  if (!isFinite(n) || n === 0) return 'R$ 0';
  if (Math.abs(n) >= 1e9) return `R$ ${(n / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} bi`;
  if (Math.abs(n) >= 1e6) return `R$ ${(n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`;
  return `R$ ${fmtInt(n)}`;
};
const pct = (n: number) => `${Math.round(n)}%`;

function tally(rows: any[], key: (r: any) => string | null | undefined): Array<[string, number]> {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = key(r);
    if (!k) return;
    map.set(k, (map.get(k) || 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function tableRows(pairs: Array<[string, number]>, total: number, limit = 40): string {
  return pairs
    .slice(0, limit)
    .map(
      ([k, v]) =>
        `<tr><td>${esc(k)}</td><td class="num">${fmtInt(v)}</td><td class="num">${total ? pct((v / total) * 100) : '—'}</td></tr>`,
    )
    .join('');
}

/** Bloco só é renderizado quando há substância — senão omissão silenciosa. */
function block(title: string, body: string): string {
  if (!body.trim()) return '';
  return `<h3>${title}</h3>${body}`;
}

export function generateProtocoloGovernancaHTML(data: ProtocoloGovernancaData): string {
  const now = new Date().toLocaleString('pt-BR');
  const { indicadores = [], orcDados = [], normativos = [], recomendacoes = [], diagnosticMap } = data;

  /* ─────────── BASE ESTATÍSTICA ─────────── */
  const rol = buildRolEstatistico(indicadores);
  const totalInd = indicadores.length;
  const porFonte = tally(indicadores, (i) => i.fonte);
  const porCategoria = tally(indicadores, (i) => i.categoria);
  const desagKeys: Array<[string, string]> = [
    ['desagregacao_raca', 'Raça/cor'],
    ['desagregacao_genero', 'Gênero'],
    ['desagregacao_idade', 'Idade'],
    ['desagregacao_classe', 'Classe/renda'],
    ['desagregacao_orientacao_sexual', 'Orientação sexual'],
    ['desagregacao_deficiencia', 'Deficiência'],
    ['desagregacao_territorio', 'Território'],
  ];
  const desagRows = desagKeys
    .map(([k, label]) => {
      const n = indicadores.filter((i) => i[k]).length;
      return n ? `<tr><td>${label}</td><td class="num">${fmtInt(n)}</td><td class="num">${pct((n / Math.max(totalInd, 1)) * 100)}</td></tr>` : '';
    })
    .join('');
  const auditados = indicadores.filter((i) => i.auditado_manualmente).length;
  const comUrl = indicadores.filter((i) => i.url_fonte).length;
  const comTendencia = tally(indicadores, (i) => i.tendencia);
  const indPorArtigo = tally(indicadores, (i) => (Array.isArray(i.artigos_convencao) && i.artigos_convencao.length ? i.artigos_convencao.join(' · ') : null));

  /* ─────────── BASE ORÇAMENTÁRIA ─────────── */
  const totalOrc = orcDados.length;
  const somaLiq = orcDados.reduce((s, o) => s + (Number(o.liquidado) || 0), 0);
  const somaAut = orcDados.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0), 0);
  const somaEmp = orcDados.reduce((s, o) => s + (Number(o.empenhado) || 0), 0);
  const execMedia = somaAut > 0 ? (somaLiq / somaAut) * 100 : 0;
  const porEsfera = tally(orcDados, (o) => o.esfera);
  const porTipoDotacao = tally(orcDados, (o) => o.tipo_dotacao);
  const porOrgao = tally(orcDados, (o) => o.orgao);
  const porFonteOrc = tally(orcDados, (o) => o.fonte_dados);
  const anos = [...new Set(orcDados.map((o) => Number(o.ano)).filter(Boolean))].sort((a, b) => a - b);
  const serieAno = anos
    .map((a) => {
      const rows = orcDados.filter((o) => Number(o.ano) === a);
      const liq = rows.reduce((s, o) => s + (Number(o.liquidado) || 0), 0);
      const aut = rows.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0), 0);
      return `<tr><td>${a}</td><td class="num">${fmtInt(rows.length)}</td><td class="num">${fmtBRL(aut)}</td><td class="num">${fmtBRL(liq)}</td><td class="num">${aut > 0 ? pct((liq / aut) * 100) : '—'}</td></tr>`;
    })
    .join('');

  /* ─────────── BASE NORMATIVA ─────────── */
  const totalNorm = normativos.length;
  const normPorCategoria = tally(normativos, (n) => n.categoria);
  const normPorStatus = tally(normativos, (n) => n.status);
  const normComUrl = normativos.filter((n) => n.url_origem).length;
  const normPorArtigo = tally(
    normativos.flatMap((n) => (Array.isArray(n.artigos_convencao) ? n.artigos_convencao : [])).map((a) => ({ a })),
    (r) => r.a,
  );

  /* ─────────── RECOMENDAÇÕES × ARTIGOS ─────────── */
  const totalRec = recomendacoes.length;
  const statusComputado = (r: any) => diagnosticMap?.get(r.id)?.statusComputado ?? r.status_cumprimento;
  const recPorStatus = tally(recomendacoes, (r) => statusComputado(r));
  const recPorEixo = tally(recomendacoes, (r) => r.eixo_tematico);
  const recPorArtigo = tally(
    recomendacoes.flatMap((r) => (Array.isArray(r.artigos_convencao) ? r.artigos_convencao : [])).map((a) => ({ a })),
    (r) => r.a,
  );
  const semArtigoCadastrado = recomendacoes.filter((r) => !Array.isArray(r.artigos_convencao) || r.artigos_convencao.length === 0).length;

  // Cobertura de evidências vinculadas pelo motor
  let somaInd = 0, somaOrcLinks = 0, somaNorm = 0, semQualquer = 0;
  recomendacoes.forEach((r) => {
    const d = diagnosticMap?.get(r.id);
    const i = d?.linkedIndicadores?.length || 0;
    const o = d?.linkedOrcamento?.length || 0;
    const n = d?.linkedNormativos?.length || 0;
    somaInd += i; somaOrcLinks += o; somaNorm += n;
    if (i + o + n === 0) semQualquer += 1;
  });
  const mediaInd = totalRec ? somaInd / totalRec : 0;
  const mediaOrc = totalRec ? somaOrcLinks / totalRec : 0;
  const mediaNorm = totalRec ? somaNorm / totalRec : 0;

  const statusLabel: Record<string, string> = {
    cumprido: 'Cumprido',
    parcialmente_cumprido: 'Parcialmente cumprido',
    nao_cumprido: 'Não cumprido',
    retrocesso: 'Retrocesso (legado)',
    em_andamento: 'Em andamento (legado)',
  };

  /* ─────────── HTML ─────────── */
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Protocolo Metodológico de Governança — Legado e Método | Sistema CERD IV</title>
<style>
body{font-family:'Segoe UI',Arial,sans-serif;max-width:210mm;margin:0 auto;padding:24px;font-size:11.5px;line-height:1.6;color:#1a1a2e}
h1{font-size:21px;color:#0f3460;border-bottom:3px solid #0f3460;padding-bottom:8px;margin-bottom:4px}
h2{font-size:16px;color:#16213e;margin-top:30px;border-left:5px solid #0f3460;padding-left:10px}
h3{font-size:13px;color:#0f3460;margin-top:18px}
h4{font-size:12px;color:#334155;margin:12px 0 4px}
.cover{border:2px solid #0f3460;border-radius:10px;padding:18px;background:linear-gradient(135deg,#f8f9ff,#eef2ff);margin-bottom:18px}
.cover p{margin:3px 0;color:#475569}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:14px 0}
.kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px;text-align:center}
.kpi .v{font-size:17px;font-weight:700;color:#0f3460}
.kpi .l{font-size:9.5px;color:#64748b;text-transform:uppercase;letter-spacing:.4px}
table{width:100%;border-collapse:collapse;margin:8px 0;font-size:10.5px}
th{background:#0f3460;color:#fff;padding:6px 8px;text-align:left}
td{padding:5px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}
td.num{text-align:right;white-space:nowrap}
tr:nth-child(even) td{background:#f8fafc}
.note{font-size:10px;color:#475569;padding:9px 11px;background:#fffbeb;border-left:4px solid #f59e0b;margin:12px 0;border-radius:4px}
.legend{font-size:9.5px;color:#475569;background:#f1f5f9;border:1px dashed #94a3b8;border-radius:6px;padding:9px 11px;margin:10px 0}
.formula{font-family:'Consolas','Courier New',monospace;background:#0f172a;color:#e2e8f0;padding:10px 12px;border-radius:6px;font-size:10.5px;white-space:pre-wrap;margin:8px 0}
.flow{font-family:'Consolas','Courier New',monospace;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:12px;font-size:9.5px;white-space:pre;overflow-x:auto;line-height:1.35}
ul{padding-left:18px;margin:6px 0}li{margin-bottom:3px}
.toc{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 20px;font-size:11px}
.tag{display:inline-block;background:#e0e7ff;color:#3730a3;border-radius:10px;padding:1px 8px;font-size:9px;margin:0 3px 3px 0}
@media print{body{padding:0}@page{size:A4;margin:1.8cm}h2{page-break-after:avoid}table{page-break-inside:avoid}}
</style></head><body>

<div class="cover">
<h1>Protocolo Metodológico de Governança</h1>
<p><strong>Produto 2 — Legado e Método</strong> · Sistema de Subsídios para o IV Relatório do Brasil ao CERD</p>
<p>Documentação técnica de taxonomia, fontes de dados, fórmulas de cálculo e critérios de classificação</p>
<p>Emissão: ${now}</p>
</div>

<div class="kpis">
<div class="kpi"><div class="v">${fmtInt(rol.total)}</div><div class="l">Evidências estatísticas</div></div>
<div class="kpi"><div class="v">${fmtInt(totalOrc)}</div><div class="l">Registros orçamentários</div></div>
<div class="kpi"><div class="v">${fmtInt(totalNorm)}</div><div class="l">Documentos normativos</div></div>
<div class="kpi"><div class="v">${fmtInt(totalRec)}</div><div class="l">Recomendações monitoradas</div></div>
</div>

<div class="toc">
<strong>Sumário</strong>
<ul>
<li>1. Objeto, escopo e transferência de tecnologia</li>
<li>2. Taxonomia do sistema (entidades, chaves e vocabulário controlado)</li>
<li>3. Arquitetura de dados e fluxogramas de ingestão</li>
<li>4. Inventário das fontes de dados (SIAFI/SIOP, IBGE/SIDRA, CadÚnico e demais)</li>
<li>5. Fórmulas de cálculo de cada índice</li>
<li>6. Metodologia de vinculação Recomendação ONU × dados (inclui o dicionário completo de palavras-chave)</li>
<li>7. Critérios de classificação e escalas</li>
<li>8. Governança da qualidade, auditoria e limitações</li>
<li>9. Anexos quantitativos (retrato das bases na data de emissão)</li>
</ul>
</div>

<h2>1. Objeto, escopo e transferência de tecnologia</h2>
<p>Este protocolo documenta <strong>como o sistema pensa</strong>: quais entidades existem, de onde vem cada dado, que fórmula produz cada índice e sob que critério um resultado é classificado. O objetivo é permitir que o MIR opere, audite e evolua a plataforma sem dependência da equipe que a construiu — isto é, que a "fórmula de cálculo" por trás de cada número seja pública, reproduzível e contestável.</p>
<p>O sistema opera sobre <strong>três bases de evidência</strong> e um <strong>corpus de obrigações internacionais</strong>:</p>
<table>
<tr><th>Camada</th><th>Entidade técnica</th><th>Função no método</th><th>Volume vinculável</th></tr>
<tr><td>Base Estatística</td><td><code>indicadores_interseccionais</code> + registro de subindicadores</td><td>Mede a realidade (desigualdade observada e sua tendência)</td><td class="num">${fmtInt(rol.total)}</td></tr>
<tr><td>Base Orçamentária</td><td><code>dados_orcamentarios</code> (visão canônica deduplicada)</td><td>Mede o financiamento da política (esforço fiscal e execução)</td><td class="num">${fmtInt(totalOrc)}</td></tr>
<tr><td>Base Normativa</td><td><code>documentos_normativos</code></td><td>Mede a moldura jurídica e institucional</td><td class="num">${fmtInt(totalNorm)}</td></tr>
<tr><td>Corpus de obrigações</td><td><code>lacunas_identificadas</code></td><td>Recomendações da ONU monitoradas, ancoradas nos Artigos I–VII da ICERD</td><td class="num">${fmtInt(totalRec)}</td></tr>
<tr><td><strong>Total consolidado de evidências</strong></td><td colspan="2">Estatística + Orçamentária + Normativa</td><td class="num"><strong>${fmtInt(rol.total + totalOrc + totalNorm)}</strong></td></tr>
</table>


<div class="legend"><strong>Princípio da Fonte Única de Verdade (SSoT):</strong> nenhum painel recalcula por conta própria. Toda tela, relatório e exportação espelha os mesmos motores de cálculo descritos na Seção 5. Editar uma evidência em Recomendações propaga instantaneamente para status, aderência por artigo, evolução, diagnóstico e Painel Geral.</div>

<h2>2. Taxonomia do sistema</h2>

<h3>2.1 Vocabulário controlado</h3>
<table>
<tr><th>Termo</th><th>Definição operacional no sistema</th></tr>
<tr><td><strong>Recomendação</strong></td><td>Demanda formal dirigida ao Brasil (Observações Finais CERD, Recomendações Gerais, Durban). É a unidade de monitoramento — ${fmtInt(totalRec)} em acompanhamento.</td></tr>
<tr><td><strong>Lacuna</strong></td><td>Estado de descumprimento de uma recomendação. Não é sinônimo de recomendação: é o seu resultado negativo.</td></tr>
<tr><td><strong>Evidência</strong></td><td>Registro de uma das três bases vinculado a uma recomendação. Só entra no cálculo se for elegível (Seção 6.3).</td></tr>
<tr><td><strong>Esforço Governamental</strong></td><td>Quanto o Estado produziu de norma, orçamento e medição para a obrigação. Responde "o que foi feito?".</td></tr>
<tr><td><strong>Impacto Real</strong></td><td>Se os indicadores efetivamente melhoraram no período 2018–2025. Responde "adiantou?".</td></tr>
<tr><td><strong>Aderência ICERD</strong></td><td>Nota 0–100 do artigo da Convenção, agregando as recomendações a ele vinculadas e as três bases.</td></tr>
<tr><td><strong>Orçamento simbólico</strong></td><td>Ação com dotação autorizada relevante e liquidação residual — sinal de política anunciada e não executada.</td></tr>
<tr><td><strong>Dotação extraorçamentária</strong></td><td>Recurso fora do orçamento fiscal (fundos, emendas, transferências) classificado em <code>tipo_dotacao</code>.</td></tr>
</table>
<div class="note"><strong>Regra de Ouro:</strong> dado sem recorte racial não entra na Base Estatística analítica. Indicadores universais sem desagregação por cor/raça são excluídos dos cruzamentos, porque não sustentam afirmação sobre discriminação racial.</div>

${block(
  '2.2 Eixos temáticos em uso',
  recPorEixo.length
    ? `<table><tr><th>Eixo temático</th><th>Recomendações</th><th>Participação</th></tr>${tableRows(recPorEixo, totalRec)}</table>`
    : '',
)}

${block(
  '2.3 Ancoragem nos Artigos da ICERD',
  recPorArtigo.length
    ? `<table><tr><th>Artigo da Convenção</th><th>Recomendações vinculadas</th><th>Participação</th></tr>${tableRows(recPorArtigo, totalRec)}</table>
       <p>Recomendações sem artigo cadastrado manualmente: <strong>${fmtInt(semArtigoCadastrado)}</strong> — nesses casos aplica-se o fallback por eixo temático (Seção 6.1).</p>`
    : '',
)}

<h2>3. Arquitetura de dados e fluxogramas</h2>

<h3>3.1 Fluxo geral — da fonte primária ao índice</h3>
<div class="flow">
 FONTES PRIMÁRIAS            INGESTÃO                 PERSISTÊNCIA            MOTORES              SAÍDA
 ------------------          ------------------       ----------------        ---------------      ----------------
 SIOP / SIAFI / LOA   --->   ingest-federal-*    --->  dados_orcamentarios --+
 SICONFI (estad/mun)  --->   ingest-*-siconfi          (${fmtInt(totalOrc)} canônicos)${' '.repeat(Math.max(1, 8 - fmtInt(totalOrc).length))}|
                                                                             |
 IBGE / SIDRA (API)   --->   fetch-sidra-*       --->  indicadores_          +-->  [1] Motor de Status
 FBSP / Atlas / SUS   --->   espelho estático          interseccionais       |     [2] Motor de Aderência
 CadÚnico / SAGI      --->   ingest-static-mirror      (${fmtInt(rol.total)} vinculáveis)${' '.repeat(Math.max(1, 6 - fmtInt(rol.total).length))}|     [3] Motor de Evolução
                                                                             |     [4] IEAT
 DOU / Planalto / STF --->   upload + parsing    --->  documentos_normativos-+
                                                                             |
 CERD/C/BRA/CO/18-20  --->   curadoria humana    --->  lacunas_identificadas-+
                                                                             |
                                                                             v
                                            Painel Geral · Artigos ICERD · Conclusões · Relatórios
</div>

<h3>3.2 Fluxo de vinculação de evidências</h3>
<div class="flow">
   Recomendação (texto ONU)
            |
            v
   [Extração de conceitos] -- concept bundles + tokens de sinal focal
            |
            v
   [Varredura das 3 bases] -- nome, categoria, subcategoria, descritivo,
            |                 público-alvo, observações, eixo temático
            v
   [Score de casamento] ---- termos casados x peso x trava anti-coringa
            |
            +--> abaixo do corte  ---> descartado (não vira evidência)
            |
            v
   [Filtro de elegibilidade] - Common Core bloqueado; indicador precisa ser
            |                  auditado/espelho; regex de artigo restritiva
            v
   [Override humano] -------- inclusão/exclusão manual no pop-up de auditagem
            |                  (human-in-the-loop, prevalece sobre o motor)
            v
   Evidência vinculada ------> entra nos motores [1] [2] [3] [4]
</div>
<div class="legend"><strong>Como ler:</strong> o motor <em>sugere</em>, o revisor <em>decide</em>. Toda inclusão ou exclusão manual é persistida como override e recalcula os índices em tempo real, sem reprocessamento em lote.</div>

<h2>4. Inventário das fontes de dados</h2>

${block(
  '4.1 Base Estatística — fontes efetivamente em uso',
  porFonte.length
    ? `<table><tr><th>Fonte</th><th>Indicadores</th><th>Participação</th></tr>${tableRows(porFonte, totalInd)}</table>
       <p>Indicadores com URL de auditoria: <strong>${fmtInt(comUrl)}</strong> de ${fmtInt(totalInd)} (${pct((comUrl / Math.max(totalInd, 1)) * 100)}). Auditados manualmente: <strong>${fmtInt(auditados)}</strong>.</p>`
    : '',
)}

${block(
  '4.2 Cobertura de desagregação (exigência CERD/C/2007/1)',
  desagRows ? `<table><tr><th>Dimensão de desagregação</th><th>Indicadores</th><th>Cobertura</th></tr>${desagRows}</table>` : '',
)}

${block(
  '4.3 Categorias temáticas da Base Estatística',
  porCategoria.length ? `<table><tr><th>Categoria</th><th>Indicadores</th><th>Participação</th></tr>${tableRows(porCategoria, totalInd)}</table>` : '',
)}

${block(
  '4.4 Base Orçamentária — origem dos registros',
  porFonteOrc.length
    ? `<table><tr><th>Fonte de dados</th><th>Registros</th><th>Participação</th></tr>${tableRows(porFonteOrc, totalOrc)}</table>`
    : '',
)}

${block(
  '4.5 Base Orçamentária — esfera e natureza da dotação',
  porEsfera.length || porTipoDotacao.length
    ? `<table><tr><th>Recorte</th><th>Registros</th><th>Participação</th></tr>${tableRows(porEsfera, totalOrc)}${tableRows(porTipoDotacao, totalOrc)}</table>`
    : '',
)}

${block(
  '4.6 Órgãos executores presentes na base',
  porOrgao.length ? `<table><tr><th>Órgão</th><th>Registros</th><th>Participação</th></tr>${tableRows(porOrgao, totalOrc, 25)}</table>` : '',
)}

${block(
  '4.7 Série orçamentária por exercício',
  serieAno
    ? `<table><tr><th>Exercício</th><th>Registros</th><th>Dotação autorizada</th><th>Liquidado</th><th>Execução</th></tr>${serieAno}</table>
       <p>Acumulado da base: autorizado ${fmtBRL(somaAut)} · empenhado ${fmtBRL(somaEmp)} · liquidado ${fmtBRL(somaLiq)} · execução média ${pct(execMedia)}.</p>`
    : '',
)}

${block(
  '4.8 Base Normativa — composição',
  normPorCategoria.length
    ? `<table><tr><th>Categoria</th><th>Documentos</th><th>Participação</th></tr>${tableRows(normPorCategoria, totalNorm)}</table>
       <p>Documentos com link oficial direto: <strong>${fmtInt(normComUrl)}</strong> de ${fmtInt(totalNorm)}. Registros sem fonte direta permanecem com status <code>pendente</code> e não são apresentados como prova auditável.</p>`
    : '',
)}

${block(
  '4.9 Base Normativa — status de verificação',
  normPorStatus.length ? `<table><tr><th>Status</th><th>Documentos</th><th>Participação</th></tr>${tableRows(normPorStatus, totalNorm)}</table>` : '',
)}

${block(
  '4.10 Normativos por Artigo da ICERD',
  normPorArtigo.length ? `<table><tr><th>Artigo</th><th>Documentos vinculados</th><th>Participação</th></tr>${tableRows(normPorArtigo, totalNorm)}</table>` : '',
)}

<h2>5. Fórmulas de cálculo</h2>

<h3>5.1 Motor 1 — Score de Esforço Governamental (por recomendação)</h3>
<div class="formula">Score = 0,40 × Cobertura(Indicadores) + 0,30 × Cobertura(Orçamento) + 0,30 × Cobertura(Normativos)

Cobertura(Indicadores): 0 evidência = 0 · escala progressiva · 10 ou mais = 100
Cobertura(Orçamento):   0 evidência = 0 · escala progressiva · 12 ou mais = 100
Cobertura(Normativos):  0 evidência = 0 · escala progressiva · saturação no estoque vinculado

Status = Cumprido            se Score >= 65
         Parcialmente        se Score >= 35
         Não cumprido        se Score  < 35</div>
<div class="legend"><strong>Por que escala progressiva e não linear:</strong> a curva é logarítmica para reconhecer esforço pequeno porém real (sair de 0 para 1 evidência vale muito mais que sair de 8 para 9), sem permitir que acúmulo bruto de registros produza nota alta artificial.</div>

<h3>5.2 Motor 2 — Score de Aderência ICERD (por artigo)</h3>
<div class="formula">Aderência = 0,50 × Proporção de recomendações cumpridas do artigo
          + 0,15 × Cobertura normativa
          + 0,10 × Cobertura orçamentária (contagem de ações)
          + 0,15 × Cobertura de indicadores
          + 0,10 × Amplitude de fontes

Proporção = (cumpridas + 0,5 × parciais) / total de recomendações do artigo
            Artigo sem recomendação vinculada recebe 25 (metade neutra).

Amplitude de fontes = nº de dimensões ocupadas (recomendação cumprida, orçamento,
                      indicador, normativo): 4 → 10 pts · 3 → 7,5 · 2 → 5 · 1 → 2,5

Faixas: Boa Aderência >= 70 · Aderência Parcial 40–69 · Baixa Aderência < 40</div>
<div class="legend"><strong>Racional dos pesos:</strong> 50% mede resultado cobrado por terceiro (a ONU), 40% mede esforço declarado pelo Estado (norma, dinheiro, medição) e 10% mede integralidade do ciclo de política. Sem cumprir recomendação, o teto matemático da nota é 50 — acúmulo de insumo não compra aderência.</div>

<h3>5.3 Motor 3 — Score de Evolução (impacto real)</h3>
<div class="formula">Evolução da recomendação = 0,50 × Tendência dos indicadores
                         + 0,30 × Orçamento liquidado (R$)
                         + 0,20 × Estoque normativo

Evolução do artigo       = 0,35 × Orçamento liquidado por faixas
                         + 0,35 × Estoque normativo por faixas
                         + 0,30 × Tendência dos indicadores

Faixas de orçamento (liquidado): > 0 → 20 · >= R$ 100 mi → 40 · >= R$ 1 bi → 60
                                 >= R$ 5 bi → 80 · >= R$ 10 bi → 100
Faixas de normativos (estoque):  1 → 25 · 3 → 50 · 6 → 75 · 10+ → 100

Classificação: Evolução >= 60 · Estagnação 35–59 · Retrocesso < 35</div>
<div class="legend"><strong>Tendência com sinal invertido:</strong> em indicadores negativos (mortalidade, homicídio, desemprego, analfabetismo, déficit, encarceramento) série decrescente é <em>melhora</em>; em indicadores positivos, série crescente é melhora. Só melhoria comprovada ou medição nova pontua; piora penaliza na proporção 1:1.</div>

<h3>5.4 Progresso global ponderado</h3>
<div class="formula">Progresso = (100 × cumpridas + 50 × parciais + 10 × não cumpridas) / (100 × total)</div>
<div class="legend"><strong>Por que 10 e não 0 para não cumpridas:</strong> o piso reconhece a existência de monitoramento e cadastro da obrigação, evitando que o índice global oscile de forma binária. É constante para todas as recomendações, portanto não distorce comparações.</div>

<h3>5.5 IEAT — Índice de Eficácia da Ação Transformadora</h3>
<div class="formula">IEAT = f(benchmark social observado, benchmark orçamentário executado)

Confronta a variação do indicador social do eixo com o volume liquidado no mesmo
eixo/período. Alto gasto com indicador estagnado → baixa eficácia; melhoria social
com baixo gasto → alta eficácia (ou efeito de política não orçamentária).</div>
<div class="note"><strong>Ressalva do efeito tesoura:</strong> a comparação entre P1 (2018–2022) e P2 (2023–2025) sofre defasagem de liquidação — restos a pagar e execução plurianual deslocam despesa entre exercícios. Diferenças de até ~15% no período recente devem ser lidas como <em>lag contábil</em>, não como corte de política.</div>

<h2>6. Metodologia de vinculação Recomendação ONU × dados</h2>

<h3>6.1 Como nasce a relação Recomendação × Artigo</h3>
<p>Três camadas, nesta ordem de precedência:</p>
<ul>
<li><strong>Vínculo cadastrado (curadoria humana).</strong> Leitura do texto original da recomendação e resposta à pergunta "de que obrigação da Convenção isto cobra o Brasil?". Ex.: letalidade policial → Artigo V; dados desagregados → Artigo II; propaganda e organizações racistas → Artigo IV.</li>
<li><strong>Fallback por eixo temático.</strong> Sem artigo cadastrado, aplica-se o mapa fixo eixo → artigos. É rede de segurança, não regra.</li>
<li><strong>Travas de coerência.</strong> Artigos com escopo estrito têm filtro restritivo — o Artigo IV só aceita recomendação que trate literalmente de organizações/propaganda racista. Impede que um artigo vire depósito genérico.</li>
</ul>
<p>A relação recomendação × artigo <strong>não é automática por palavra-chave</strong>: é curada e depois protegida por regra. Somente as <em>evidências</em> são casadas automaticamente.</p>

<h3>6.2 Casamento automático de evidências</h3>
<ul>
<li><strong>Superfície de busca:</strong> nome, categoria, subcategoria, observações e eixo temático (Estatística); programa, órgão, descritivo, público-alvo e razão de seleção (Orçamento); título e categoria (Normativa).</li>
<li><strong>Concept bundles:</strong> famílias de termos equivalentes (ex.: "letalidade policial" ≈ "morte por intervenção policial" ≈ "violência de Estado").</li>
<li><strong>Token de sinal focal obrigatório:</strong> o registro precisa carregar marca racial/étnica ou de grupo focal. Sem isso, não vira evidência de política racial.</li>
<li><strong>Trava anti-coringa:</strong> termos genéricos de eixo recebem peso reduzido, evitando que um registro amplo se vincule a dezenas de recomendações.</li>
</ul>

<h3>6.3 Critérios de elegibilidade de evidência</h3>
<table>
<tr><th>Regra</th><th>Efeito</th></tr>
<tr><td>Indicador Common Core (prefixo <code>[CC-</code>)</td><td>Pesquisável, porém <strong>bloqueado</strong> como evidência — defesa em 3 camadas (motor, merge de override e geradores de relatório)</td></tr>
<tr><td>Indicador sem recorte racial</td><td>Excluído dos cruzamentos analíticos (Regra de Ouro)</td></tr>
<tr><td>Registro sem fonte auditável</td><td>Não sustenta afirmação; normativo passa a status <code>pendente</code></td></tr>
<tr><td>Override manual</td><td>Prevalece sobre a sugestão do motor, com recálculo imediato</td></tr>
</table>

${block(
  '6.4 Retrato atual da vinculação',
  totalRec
    ? `<table>
<tr><th>Métrica de vinculação</th><th>Valor</th></tr>
<tr><td>Indicadores vinculados (total / média por recomendação)</td><td class="num">${fmtInt(somaInd)} / ${mediaInd.toFixed(1)}</td></tr>
<tr><td>Ações orçamentárias vinculadas (total / média)</td><td class="num">${fmtInt(somaOrcLinks)} / ${mediaOrc.toFixed(1)}</td></tr>
<tr><td>Normativos vinculados (total / média)</td><td class="num">${fmtInt(somaNorm)} / ${mediaNorm.toFixed(1)}</td></tr>
<tr><td>Recomendações sem qualquer evidência vinculada</td><td class="num">${fmtInt(semQualquer)}</td></tr>
</table>`
    : '',
)}

<h2>7. Critérios de classificação</h2>

${block(
  '7.1 Status de cumprimento vigente',
  recPorStatus.length
    ? `<table><tr><th>Status</th><th>Recomendações</th><th>Participação</th></tr>${tableRows(
        recPorStatus.map(([k, v]) => [statusLabel[k] || k, v] as [string, number]),
        totalRec,
      )}</table>`
    : '',
)}

<h3>7.2 Escalas e legendas oficiais</h3>
<table>
<tr><th>Escala</th><th>Faixas</th><th>Aplicação</th></tr>
<tr><td>Status da recomendação</td><td>Cumprido ≥ 65 · Parcial ≥ 35 · Não cumprido &lt; 35</td><td>Esforço governamental</td></tr>
<tr><td>Aderência ICERD</td><td>Boa ≥ 70 · Parcial 40–69 · Baixa &lt; 40</td><td>Artigos I–VII</td></tr>
<tr><td>Evolução</td><td>Evolução ≥ 60 · Estagnação 35–59 · Retrocesso &lt; 35</td><td>Impacto real 2018–2025</td></tr>
<tr><td>Progresso global</td><td>Cumprido = 100 · Parcial = 50 · Não cumprido = 10</td><td>Ponderação do índice-síntese</td></tr>
<tr><td>Cobertura de evidências</td><td>Indicadores: 10+ = 100 · Orçamento: 12+ = 100</td><td>Componentes do Motor 1</td></tr>
</table>
<div class="legend"><strong>Legenda metodológica obrigatória:</strong> os pesos 100 / 50 / 10 do progresso global e os cortes 65 / 35 do status são constantes do sistema (motor v6, três faixas). Classificações legadas — "em andamento" e "retrocesso" — foram normalizadas para as três faixas atuais e permanecem apenas como histórico.</div>

<h3>7.3 Perspectiva dual</h3>
<p>Nenhum artigo ou recomendação é avaliado por um número só. O sistema sempre apresenta o par:</p>
<div class="flow">
   ESFORÇO GOVERNAMENTAL                    IMPACTO REAL
   (o que o Estado fez)                     (o que mudou na vida das pessoas)
   Status + Aderência ICERD      x          Evolução 2018–2025
   -----------------------------            -----------------------------
   Alto esforço + alto impacto  = política efetiva
   Alto esforço + baixo impacto = política anunciada / execução frágil
   Baixo esforço + alto impacto = melhora exógena (não creditável à política)
   Baixo esforço + baixo impacto = omissão
</div>

<h2>8. Governança da qualidade, auditoria e limitações</h2>
<ul>
<li><strong>Rastro de auditoria:</strong> toda evidência exibida em relatório traz origem, justificativa do vínculo e link para a fonte primária quando existente.</li>
<li><strong>Drill-down universal:</strong> qualquer número agregado pode ser aberto até a lista de registros que o compõem.</li>
<li><strong>Snapshots:</strong> versões congeladas da base permitem que revisores diferentes auditem exatamente o mesmo retrato.</li>
<li><strong>Deduplicação:</strong> evidências que servem a mais de uma recomendação são contadas uma única vez nos totalizadores por artigo.</li>
<li><strong>Limitações declaradas:</strong> defasagem de liquidação orçamentária; subnotificação de raça/cor em registros administrativos de saúde e segurança; ausência de recorte racial nacional auditável em algumas políticas (habitação Faixa 1, por exemplo), caso em que o sistema prefere a omissão à estimativa.</li>
</ul>

<h2>9. Anexos quantitativos</h2>
${block(
  '9.1 Tendência declarada dos indicadores',
  comTendencia.length ? `<table><tr><th>Tendência</th><th>Indicadores</th><th>Participação</th></tr>${tableRows(comTendencia, totalInd)}</table>` : '',
)}
${block(
  '9.2 Indicadores por combinação de Artigos da ICERD',
  indPorArtigo.length ? `<table><tr><th>Artigos</th><th>Indicadores</th><th>Participação</th></tr>${tableRows(indPorArtigo, totalInd, 20)}</table>` : '',
)}

<hr/>
<p style="font-size:9.5px;color:#94a3b8">Protocolo Metodológico de Governança — Produto 2 · Sistema de Subsídios CERD IV · Documento gerado dinamicamente a partir das bases vivas em ${now}. Os valores refletem o estado das bases nesta data; reemissões posteriores produzem números atualizados.</p>
${getExportToolbarHTML('protocolo-metodologico-governanca')}
</body></html>`;
}
