const INVALID_EVIDENCE_INDICATOR_IDS = new Set([
  '015fc7a1-0b15-4716-9e49-f81788130ed9', // Titularidade Feminina Negra no MCMV
  '1ab9ca2e-5164-4336-85b1-202be6eeb76e', // Perfil Racial Beneficiários MCMV (CadÚnico)
]);

const INVALID_EVIDENCE_INDICATOR_NAME_PATTERNS = [
  /titularidade feminina negra.*mcmv/,
  /perfil racial.*beneficiarios.*mcmv/,
];

function normalizeEvidenceText(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCommonCoreIndicator(indicator: { categoria?: string | null; nome?: string | null }): boolean {
  return indicator?.categoria === 'common_core' || /^\[CC-/i.test(String(indicator?.nome || ''));
}

export function isInvalidEvidenceIndicator(indicator: { id?: string | null; nome?: string | null }): boolean {
  if (indicator?.id && INVALID_EVIDENCE_INDICATOR_IDS.has(indicator.id)) return true;
  const normalizedName = normalizeEvidenceText(indicator?.nome);
  return INVALID_EVIDENCE_INDICATOR_NAME_PATTERNS.some((pattern) => pattern.test(normalizedName));
}

export function isEvidenceEligibleIndicator(indicator: { id?: string | null; categoria?: string | null; nome?: string | null }): boolean {
  return !isCommonCoreIndicator(indicator) && !isInvalidEvidenceIndicator(indicator);
}

export function filterEvidenceEligibleIndicators<T extends { id?: string | null; categoria?: string | null; nome?: string | null }>(
  indicators: T[] | undefined | null,
): T[] {
  return (indicators || []).filter(isEvidenceEligibleIndicator);
}