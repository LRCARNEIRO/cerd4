export function normalizeSearchText(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getSearchTokens(value: unknown): string[] {
  return normalizeSearchText(value)
    .split(' ')
    .filter((token) => token.length >= 2);
}

export function searchableMatches(query: unknown, ...fields: unknown[]): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return false;

  const searchable = normalizeSearchText(fields.join(' '));
  if (searchable.includes(normalizedQuery)) return true;

  const tokens = getSearchTokens(query);
  if (tokens.length === 0) return false;
  return tokens.every((token) => searchable.includes(token));
}