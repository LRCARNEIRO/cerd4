// ──────────────────────────────────────────────────────────────────
// Guard universal de evidências estatísticas (Regra de Ouro CERD)
// ──────────────────────────────────────────────────────────────────
// Objetivo: impedir que qualquer indicador sem recorte racial auditável
// vaze para listas de evidência vinculada, popups, relatórios PDF/HTML
// ou inventário — mesmo que tenha sido inserido manualmente via override
// (localStorage) ou venha de uma migração antiga do banco.
//
// Camadas:
//  1. Blacklist nominal (IDs e regex) — para casos comprovadamente
//     alucinados (ex.: IND-001/IND-002 MCMV).
//  2. Heurística genérica — barra qualquer indicador com
//     desagregacao_raca = false cujo texto (nome/categoria/subcategoria/fonte)
//     NÃO contenha marcador étnico-racial explícito.
//  3. Bloqueio de Common Core (mantém regra existente).

const INVALID_EVIDENCE_INDICATOR_IDS = new Set<string>([
  '015fc7a1-0b15-4716-9e49-f81788130ed9', // Titularidade Feminina Negra no MCMV (alucinado)
  '1ab9ca2e-5164-4336-85b1-202be6eeb76e', // Perfil Racial Beneficiários MCMV (CadÚnico) (alucinado)
]);

// Padrões de nomes comprovadamente inválidos (alucinações reincidentes).
const INVALID_EVIDENCE_INDICATOR_NAME_PATTERNS: RegExp[] = [
  /titularidade feminina negra.*mcmv/,
  /perfil racial.*beneficiarios.*mcmv/,
  // Fontes universais sem racialização primária — quando reaparecerem como
  // "indicadores", são alucinação:
  /\bmcmv\b(?!.*(negr|indigena|quilombo|cigano|rom\b|racial|raca|cor))/,
  /\bsishab\b(?!.*(negr|indigena|quilombo|cigano|rom\b|racial|raca|cor))/,
];

// Marcadores que comprovam recorte étnico-racial, mesmo quando o flag
// `desagregacao_raca` está como false no DB (ex.: indicador é sobre
// população indígena/quilombola/cigana ou políticas raciais institucionais).
const RACIAL_CUT_MARKERS: RegExp[] = [
  /\bnegr[oa]s?\b/,
  /\bpreta?s?\b/,
  /\bpard[oa]s?\b/,
  /\bindigena/,
  /\bquilombo/,
  /\bcigan[oa]s?\b/,
  /\brom\b|\broma\b|\bromani\b/,
  /\bpovos? tradicionai?s?\b/,
  /\bterreir/,
  /\bracial\b/,
  /\bracializad/,
  /raca.cor|raca\/cor|raca e cor|raca cor/,
  /\betnic/,
  /\bafro/,
  /igualdade racial/,
  /antirracis/,
  // Instituições/programas com mandato racial explícito (BR):
  /\bsinapir\b/, /\bsenapir\b/, /\bseppir\b/, /\bconapir\b/, /\bmir\b/,
  /lei 12\.?288/, /estatuto da igualdade racial/,
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

export function isInvalidEvidenceIndicator(indicator: {
  id?: string | null;
  nome?: string | null;
  categoria?: string | null;
  subcategoria?: string | null;
  fonte?: string | null;
  desagregacao_raca?: boolean | null;
}): boolean {
  if (indicator?.id && INVALID_EVIDENCE_INDICATOR_IDS.has(indicator.id)) return true;

  const haystack = normalizeEvidenceText(
    [indicator?.nome, indicator?.categoria, indicator?.subcategoria, indicator?.fonte]
      .filter(Boolean)
      .join(' '),
  );

  if (INVALID_EVIDENCE_INDICATOR_NAME_PATTERNS.some((rx) => rx.test(haystack))) return true;

  // Heurística genérica: sem flag racial e sem qualquer marcador
  // étnico-racial no texto → não pode entrar como evidência.
  if (indicator?.desagregacao_raca === false) {
    const hasRacialMarker = RACIAL_CUT_MARKERS.some((rx) => rx.test(haystack));
    if (!hasRacialMarker) return true;
  }

  return false;
}

export function isEvidenceEligibleIndicator(indicator: {
  id?: string | null;
  categoria?: string | null;
  subcategoria?: string | null;
  nome?: string | null;
  fonte?: string | null;
  desagregacao_raca?: boolean | null;
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
  },
>(indicators: T[] | undefined | null): T[] {
  return (indicators || []).filter(isEvidenceEligibleIndicator);
}
