/**
 * indicadorDadoUnico — resolve CÓDIGO e DADO ÚNICO de evidências
 * estatísticas que não possuem série histórica.
 *
 * Regra de ouro: a ausência de série temporal não pode apagar a
 * identidade (IND-NNN) nem o valor medido do indicador. Cards fixos e
 * subindicadores das abas temáticas carregam um único ponto (ex.: Censo
 * 2022 → 69,63%) — ele deve aparecer nos relatórios exatamente como
 * aparece na aba de origem.
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
  return w.replace(/(as|os|es|a|o|s)$/, '');
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

/** Extrai um ponto único (ano + valor) de um `dados` JSONB sem série. */
export function extractDadoUnico(dados: any, sub?: string | null, nome?: string): DadoUnico | undefined {
  if (!dados || typeof dados !== 'object') return undefined;

  const anoDoNome = () => {
    const m = String(nome || '').match(/(19|20)\d{2}/);
    return m ? Number(m[0]) : undefined;
  };

  const valorDireto = Number(dados.valor);
  if (Number.isFinite(valorDireto)) {
    return {
      ano: Number.isFinite(Number(dados.ano)) ? Number(dados.ano) : anoDoNome(),
      valor: valorDireto,
      unidade: dados.unidade,
      rotulo: dados.metrica || dados.grupo,
    };
  }

  const registros = Array.isArray(dados.registros) ? dados.registros : null;
  if (registros?.length) {
    const alvo = registros[0];
    const tokens = norm(sub || '')
      .split(/\s+/)
      .filter((t) => t.length >= 4)
      .map(stem);
    let escolhida: [string, number] | undefined;
    const numericos = Object.entries(alvo).filter(([, v]) => Number.isFinite(Number(v)) && typeof v !== 'boolean') as Array<[string, any]>;
    for (const [k, v] of numericos) {
      const kn = norm(k.replace(/([a-z])([A-Z])/g, '$1 $2'));
      if (tokens.length && tokens.some((t) => kn.includes(t))) {
        escolhida = [k, Number(v)];
        break;
      }
    }
    if (!escolhida) {
      const primeiro = numericos.find(([k]) => !/^ano$/i.test(k));
      if (primeiro) escolhida = [primeiro[0], Number(primeiro[1])];
    }
    if (escolhida) {
      return {
        ano: Number.isFinite(Number(alvo.ano)) ? Number(alvo.ano) : anoDoNome(),
        valor: escolhida[1],
        rotulo: alvo.indicador || escolhida[0],
      };
    }
  }
  return undefined;
}
