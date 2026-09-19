/**
 * indicadorDadoUnico — resolve CÓDIGO, SÉRIE e DADO ÚNICO de evidências
 * estatísticas que vivem dentro de registros guarda-chuva ou apenas em
 * cartões fixos das abas temáticas.
 *
 * Regra de ouro: a ausência de série temporal própria não pode apagar a
 * identidade (IND-NNN) nem o valor medido do indicador. Os relatórios
 * precisam mostrar exatamente o número que a aba de origem exibe.
 *
 * Nenhum código novo é inventado: o código vem do registro do BD (pelo
 * nome/alias) ou do registro congelado em `indicadorSubs`.
 */
import { SUB_INDICADORES } from '@/utils/indicadorSubs';
import { nomeCanonico } from '@/utils/indicadorAliases';

const norm = (s: unknown) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/** Radical simples para casar rótulos ("negras" → "negr"). */
function stem(w: string): string {
  return w.replace(/(coes|cao|as|os|es|a|o|s)$/, '');
}

/** Sinônimos de vocabulário estatístico (chave do JSON × título do bloco). */
const SINONIMOS: Record<string, string[]> = {
  desocupa: ['desempreg'], desempreg: ['desocupa'],
  titulad: ['titulad'], certid: ['certific'], certific: ['certid'],
  ades: ['ades'], homicid: ['homicid'], letalidad: ['letalidad'],
  analfabet: ['analfabet'], materna: ['materna'], infantil: ['infantil'],
  carcerari: ['carcerari', 'prisional', 'encarcer'],
  feminicid: ['feminicid'], pobrez: ['pobrez'], rend: ['rend'],
  risc: ['razaorisc', 'risc'], vitim: ['vitim'],
  superior: ['superior'], estrutur: ['estrutur'], legisla: ['legisla'],
  etni: ['etni'], lingu: ['lingu'], fome: ['fome'], cadunic: ['cadunic'],
  monoparental: ['monoparental'], excess: ['excess', 'obitosexcess'],
};

const META_KEYS = /^(ano|fonte|metodologia|nota|notas|link|url|paragrafos|observacoes|comparador|estimativa|unidade|metrica|grupo|serie|series|historico)/i;

function tokensDe(...partes: Array<string | null | undefined>): string[] {
  const brutos = norm(partes.filter(Boolean).join(' '))
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4 && !/^(para|pelo|pela|entre|sobre|total|dados|taxa|indice|censo|anos|por)$/.test(t))
    .map(stem);
  const expandidos = new Set<string>(brutos);
  for (const t of brutos) for (const s of SINONIMOS[t] || []) expandidos.add(s);
  return Array.from(expandidos);
}

function chaveNormalizada(k: string): string {
  return norm(k.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ')).replace(/[^a-z0-9]/g, '');
}

/** Pontua o quanto uma chave do JSON corresponde ao bloco procurado. */
function pontuar(chave: string, tokens: string[], preferirNegro: boolean): number {
  const kn = chaveNormalizada(chave);
  let score = 0;
  for (const t of tokens) if (kn.includes(t)) score += 1;
  if (score === 0) return 0;
  const temNegro = /negr|pret/.test(kn);
  const temBranco = /branc/.test(kn);
  if (preferirNegro) {
    if (temNegro) score += 0.6;
    if (temBranco) score -= 0.6;
  }
  return score;
}

function melhorChave(chaves: string[], tokens: string[], preferirNegro = true): string | undefined {
  let melhor: { k: string; s: number } | undefined;
  for (const k of chaves) {
    if (META_KEYS.test(k)) continue;
    const s = pontuar(k, tokens, preferirNegro);
    if (s > 0 && (!melhor || s > melhor.s)) melhor = { k, s };
  }
  return melhor?.k;
}

export interface IndicadorRegistroLite {
  id?: string;
  codigo?: string | null;
  nome?: string;
  dados?: any;
  tendencia?: string | null;
}

/**
 * Tenta localizar o registro do BD correspondente a um card fixo /
 * subindicador, usando: nome exato → alias canônico → alias registrado
 * em `indicadorSubs` (nome antigo do recorte) → guarda-chuva.
 */
export function resolveRegistroEstatico(
  nome: string,
  regByNome: Map<string, IndicadorRegistroLite>,
): { registro?: IndicadorRegistroLite; codigoCongelado?: string } {
  const byKey = (k: string) => regByNome.get(norm(k));
  let registro = byKey(nome) || byKey(nomeCanonico(nome));

  const sub = SUB_INDICADORES.find(
    (s) => norm(s.titulo) === norm(nome) || (s.aliases || []).some((a) => norm(a) === norm(nome)),
  );
  if (!registro && sub) {
    for (const alias of sub.aliases || []) {
      registro = byKey(alias);
      if (registro) break;
    }
    if (!registro) registro = byKey(sub.guardaChuva);
  }
  return { registro, codigoCongelado: sub?.codigo };
}

export interface DadoUnico {
  ano?: number;
  valor?: number;
  unidade?: string;
  rotulo?: string;
}

export interface SerieSub {
  anoAntigo?: number;
  valorAntigo?: number;
  anoRecente?: number;
  valorRecente?: number;
  rotulo?: string;
}

/**
 * Cartões fixos cujo número vive apenas na interface da aba (não há
 * espelho numérico no registro guarda-chuva). Valores idênticos aos
 * exibidos em Grupos Focais › Direitos Territoriais.
 */
const CARDS_FIXOS: Record<string, SerieSub & { unidade?: string }> = {
  'total de tis registradas': { anoAntigo: 2018, valorAntigo: 626, anoRecente: 2025, valorRecente: 646, rotulo: 'TIs registradas (FUNAI)' },
  'tis homologadas/regularizadas': { anoAntigo: 2018, valorAntigo: 487, anoRecente: 2025, valorRecente: 496, rotulo: 'TIs homologadas (FUNAI)' },
  'tis homologadas + reservadas (acumulado)': { anoAntigo: 2018, valorAntigo: 515, anoRecente: 2025, valorRecente: 536, rotulo: 'TIs homologadas + reservadas (ISA)' },
  'evolucao territorial indigena 2018→2025': { anoAntigo: 2018, valorAntigo: 626, anoRecente: 2025, valorRecente: 646, rotulo: 'total de TIs (FUNAI)' },
  'etnias (censo 2022)': { anoRecente: 2022, valorRecente: 391, rotulo: 'etnias reconhecidas (IBGE)' },
  'linguas (censo 2022)': { anoRecente: 2022, valorRecente: 295, rotulo: 'línguas vivas (IBGE)' },
  'avancos por fase do processo demarcatorio (funai)': { anoAntigo: 2022, valorAntigo: 1, anoRecente: 2025, valorRecente: 20, rotulo: 'homologações por período (FUNAI)' },
  'area titulada (hectares)': { anoRecente: 2025, valorRecente: 1015000, unidade: 'ha', rotulo: 'área titulada quilombola (INCRA)' },
};

/** Cartão fixo com número congelado na interface da aba de origem. */
export function cardFixoSerie(nome?: string | null): (SerieSub & { unidade?: string }) | undefined {
  return CARDS_FIXOS[norm(nome)];
}

function pontosDaSerie(series: any, chave: string): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (const [ano, obj] of Object.entries(series || {})) {
    const y = Number(ano);
    if (!Number.isFinite(y) || y < 1990 || y > 2100) continue;
    const v = Number((obj as any)?.[chave]);
    if (Number.isFinite(v)) pts.push([y, v]);
  }
  return pts.sort((a, b) => a[0] - b[0]);
}

/** Normaliza `{ chave: { 2018: n, 2024: n } }` para o formato `series`. */
function seriesDeMapasPorChave(dados: any): Record<string, any> | undefined {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(dados || {})) {
    if (!v || typeof v !== 'object' || Array.isArray(v)) continue;
    for (const [ano, val] of Object.entries(v as any)) {
      const y = Number(ano);
      if (!Number.isFinite(y) || y < 1990 || y > 2100 || !Number.isFinite(Number(val))) continue;
      out[ano] = { ...(out[ano] || {}), [k]: Number(val) };
    }
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Extrai a série do SUB-indicador dentro de um registro guarda-chuva
 * (`dados.series = { 2018: { homicidioNegro: ... } }`) ou de mapas
 * `chave → { ano: valor }` (ex.: `pct_negros`).
 */
export function extractSerieSub(dados: any, sub?: string | null, nome?: string): SerieSub | undefined {
  const fixo = cardFixoSerie(nome);
  if (fixo) return fixo;
  const series = (dados?.series && !Array.isArray(dados.series) ? dados.series : undefined)
    || seriesDeMapasPorChave(dados);
  if (!series) return undefined;
  const anos = Object.values(series).filter((v) => v && typeof v === 'object') as any[];
  if (!anos.length) return undefined;
  const chaves = Array.from(new Set(anos.flatMap((a) => Object.keys(a)))).filter(
    (k) => !META_KEYS.test(k) && anos.some((a) => Number.isFinite(Number(a[k]))),
  );
  if (!chaves.length) return undefined;
  const tokens = tokensDe(sub, nome);
  // Sem correspondência explícita, prioriza o recorte racial negro — é o
  // objeto da Convenção — e só então a primeira métrica disponível.
  const chave = melhorChave(chaves, tokens)
    || chaves.find((k) => /negr|pret/.test(chaveNormalizada(k)))
    || chaves.find((k) => /total/.test(chaveNormalizada(k)))
    || chaves[0];
  const pts = pontosDaSerie(series, chave);
  if (!pts.length) return undefined;
  const first = pts[0];
  const last = pts[pts.length - 1];
  return {
    anoAntigo: pts.length > 1 ? first[0] : undefined,
    valorAntigo: pts.length > 1 ? first[1] : undefined,
    anoRecente: last[0],
    valorRecente: last[1],
    rotulo: chave,
  };
}


/** Extrai um ponto único (ano + valor) de um `dados` JSONB sem série. */
export function extractDadoUnico(dados: any, sub?: string | null, nome?: string): DadoUnico | undefined {
  const fixo = cardFixoSerie(nome);
  if (fixo) return { ano: fixo.anoRecente, valor: fixo.valorRecente, unidade: fixo.unidade, rotulo: fixo.rotulo };
  if (!dados || typeof dados !== 'object') return undefined;

  const anoDoNome = () => {
    const m = String(nome || '').match(/(19|20)\d{2}/);
    return m ? Number(m[0]) : undefined;
  };

  const tokens = tokensDe(sub, nome);

  // 1) Registro simples { ano, valor, unidade }
  const valorDireto = Number(dados.valor);
  if (Number.isFinite(valorDireto)) {
    return {
      ano: Number.isFinite(Number(dados.ano)) ? Number(dados.ano) : anoDoNome(),
      valor: valorDireto,
      unidade: dados.unidade,
      rotulo: dados.metrica || dados.grupo,
    };
  }

  // 2) Série por ano — devolve o ponto mais recente do sub-indicador
  const serie = extractSerieSub(dados, sub, nome);
  if (serie?.valorRecente !== undefined) {
    return { ano: serie.anoRecente, valor: serie.valorRecente, rotulo: serie.rotulo };
  }

  // 3) Lista de registros — escolhe a linha cujo rótulo casa com o bloco
  const registros = Array.isArray(dados.registros) ? dados.registros : null;
  if (registros?.length) {
    const alvo = (tokens.length
      ? registros.find((r: any) => pontuar(String(r?.indicador || ''), tokens, false) > 0)
      : undefined) || registros[0];
    const numericos = Object.entries(alvo).filter(([, v]) => Number.isFinite(Number(v)) && typeof v !== 'boolean' && v !== null && v !== '') as Array<[string, any]>;
    const chave = melhorChave(numericos.map(([k]) => k), tokens);
    const escolhida = chave
      ? [chave, Number(alvo[chave])] as [string, number]
      : (() => {
          const primeiro = numericos.find(([k]) => !/^ano$/i.test(k));
          return primeiro ? ([primeiro[0], Number(primeiro[1])] as [string, number]) : undefined;
        })();
    if (escolhida) {
      return {
        ano: Number.isFinite(Number(alvo.ano)) ? Number(alvo.ano) : anoDoNome(),
        valor: escolhida[1],
        rotulo: alvo.indicador || escolhida[0],
      };
    }
    // Valores qualitativos ("+57%", "~36 mil") — melhor mostrar o texto
    // auditado do que deixar a evidência vazia no relatório.
    const textual = alvo.negros ?? alvo.valorTexto ?? alvo.valor;
    if (textual !== undefined && textual !== null && String(textual).trim() && String(textual) !== '—') {
      return { ano: anoDoNome(), texto: String(textual), rotulo: alvo.indicador };
    }
  }


  // 4) Chaves numéricas no topo do JSON (ex.: ufsComEstruturaIgualdadeRacial: 27)
  const topo = Object.entries(dados).filter(([k, v]) => !META_KEYS.test(k) && typeof v === 'number' && Number.isFinite(v)) as Array<[string, number]>;
  if (topo.length) {
    const chave = melhorChave(topo.map(([k]) => k), tokens) || topo[0][0];
    const valor = Number(dados[chave]);
    if (Number.isFinite(valor)) {
      return { ano: Number.isFinite(Number(dados.ano)) ? Number(dados.ano) : anoDoNome(), valor, rotulo: chave };
    }
  }

  // 5) Lista de períodos (ex.: evolucaoAdesoes: [{ periodo, adesoes }])
  for (const [k, v] of Object.entries(dados)) {
    if (!Array.isArray(v) || !v.length || typeof v[0] !== 'object') continue;
    if (tokens.length && pontuar(k, tokens, false) === 0) continue;
    const ultimo: any = v[v.length - 1];
    const num = Object.entries(ultimo).find(([kk, vv]) => !/^ano$/i.test(kk) && Number.isFinite(Number(vv)));
    if (num) {
      return {
        ano: Number.isFinite(Number(ultimo.ano)) ? Number(ultimo.ano) : anoDoNome(),
        valor: Number(num[1]),
        rotulo: `${k} — ${ultimo.periodo || num[0]}`,
      };
    }
  }

  return undefined;
}
