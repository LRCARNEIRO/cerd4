// ──────────────────────────────────────────────────────────────────
// Guard de evidências estatísticas (Regra de Ouro CERD)
// ──────────────────────────────────────────────────────────────────
// Objetivo: impedir que indicadores comprovadamente inválidos
// (alucinados/inventados) ou Common Core vazem para listas de
// evidência vinculada, popups, relatórios PDF/HTML ou inventário.
//
// Camadas (apenas blacklist explícita + Common Core):
//  1. Blacklist nominal por ID (casos comprovadamente alucinados).
//  2. Blacklist por padrão de nome (alucinações reincidentes).
//  3. Bloqueio de Common Core (mantém regra existente).
//
// NOTA: A heurística genérica baseada em `desagregacao_raca=false`
// foi REMOVIDA — a marcação dessa flag nunca foi obrigatória no
// processo de carga, então usá-la como filtro perdia indicadores
// legítimos. O crivo de qualidade dos indicadores deve ser feito
// por auditoria manual (campo `auditado_manualmente` no DB), não
// por heurística automática.

const INVALID_EVIDENCE_INDICATOR_IDS = new Set<string>([
  '015fc7a1-0b15-4716-9e49-f81788130ed9', // Titularidade Feminina Negra no MCMV (alucinado)
  '1ab9ca2e-5164-4336-85b1-202be6eeb76e', // Perfil Racial Beneficiários MCMV (CadÚnico) (alucinado)
]);

// Padrões de nomes comprovadamente inválidos (alucinações reincidentes).
const INVALID_EVIDENCE_INDICATOR_NAME_PATTERNS: RegExp[] = [
  /titularidade feminina negra.*mcmv/,
  /perfil racial.*beneficiarios.*mcmv/,
];

function normalizeEvidenceText(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s\/\.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCommonCoreIndicator(indicator: { categoria?: string | null; nome?: string | null }): boolean {
  return indicator?.categoria === 'common_core' || /^\[CC-/i.test(String(indicator?.nome || ''));
}

/**
 * Detecta indicadores que são apenas REGISTROS DE LACUNA METODOLÓGICA — i.e.
 * têm uma `nota` explicando que a fonte não desagrega por raça/cor e
 * NENHUM valor numérico utilizável em `dados`. Servem para denunciar a
 * ausência do dado na fonte oficial, NÃO como evidência empírica.
 *
 * Critério: dados.lacuna_desagregacao_racial === true OU nota contém
 * "não desagrega"/"lacuna metodológica"/"sem desagregação racial",
 * E não há nenhum número extraível em `dados`.
 */
export function isMethodologicalGapPlaceholder(indicator: {
  dados?: Record<string, any> | null;
}): boolean {
  const dados = indicator?.dados;
  if (!dados || typeof dados !== 'object') return false;

  const flagged =
    dados.lacuna_desagregacao_racial === true ||
    dados.lacuna_racial === true;
  const nota = String(dados.nota || '').toLowerCase();
  const notaSinaliza =
    /n[aã]o desagrega|lacuna metodol[oó]gica|sem desagrega[cç][aã]o racial|n[aã]o disponibiliza recorte/.test(
      nota,
    );

  if (!flagged && !notaSinaliza) return false;

  // Confirma ausência de número em qualquer profundidade
  const hasNumber = (v: any): boolean => {
    if (typeof v === 'number' && Number.isFinite(v)) return true;
    if (typeof v === 'string') {
      const n = parseFloat(v.replace(/\./g, '').replace(',', '.'));
      return Number.isFinite(n) && /\d/.test(v);
    }
    if (Array.isArray(v)) return v.some(hasNumber);
    if (v && typeof v === 'object') return Object.values(v).some(hasNumber);
    return false;
  };
  // Ignora chaves meta para checagem
  const META = new Set(['unidade', 'nota', 'slug', 'formato', 'regra_ouro', 'deep_links', 'lacuna_racial', 'lacuna_desagregacao_racial', 'status_validacao']);
  for (const [k, v] of Object.entries(dados)) {
    if (META.has(k) || k.startsWith('nota_') || k.startsWith('fonte_') || k.endsWith('_url')) continue;
    if (hasNumber(v)) return false;
  }
  return true;
}

export function isInvalidEvidenceIndicator(indicator: {
  id?: string | null;
  nome?: string | null;
  categoria?: string | null;
  subcategoria?: string | null;
  fonte?: string | null;
  desagregacao_raca?: boolean | null;
  dados?: Record<string, any> | null;
}): boolean {
  if (indicator?.id && INVALID_EVIDENCE_INDICATOR_IDS.has(indicator.id)) return true;

  const haystack = normalizeEvidenceText(
    [indicator?.nome, indicator?.categoria, indicator?.subcategoria, indicator?.fonte]
      .filter(Boolean)
      .join(' '),
  );

  if (INVALID_EVIDENCE_INDICATOR_NAME_PATTERNS.some((rx) => rx.test(haystack))) return true;

  // Placeholders de lacuna metodológica: visíveis na aba Estatísticas
  // (transparência da denúncia) mas barrados como evidência vinculada.
  if (isMethodologicalGapPlaceholder(indicator)) return true;

  return false;
}

export function isEvidenceEligibleIndicator(indicator: {
  id?: string | null;
  categoria?: string | null;
  subcategoria?: string | null;
  nome?: string | null;
  fonte?: string | null;
  desagregacao_raca?: boolean | null;
  dados?: Record<string, any> | null;
}): boolean {
  return !isCommonCoreIndicator(indicator) && !isInvalidEvidenceIndicator(indicator);
}

export function filterEvidenceEligibleIndicators<
  T extends {
    id?: string | null;
    categoria?: string | null;
    subcategoria?: string | null;
    nome?: string | null;
    fonte?: string | null;
    desagregacao_raca?: boolean | null;
    dados?: Record<string, any> | null;
  },
>(indicators: T[] | undefined | null): T[] {
  return (indicators || []).filter(isEvidenceEligibleIndicator);
}
