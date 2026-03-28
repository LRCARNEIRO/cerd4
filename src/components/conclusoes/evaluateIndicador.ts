/**
 * Extracts a comparable numeric value from a year entry.
 * Handles: plain number, {negra: X, branca: Y} → uses 'negra' as primary,
 * {valor: X}, {value: X}, {pct: X}, nested objects with _pct or _abs suffix.
 */
function extractNumericValue(entry: any): number | null {
  if (typeof entry === 'number') return entry;
  if (typeof entry !== 'object' || entry === null) return null;

  // Prefer 'negra' for racial indicators, then 'valor', 'value', 'total'
  for (const key of ['negra', 'valor', 'value', 'total', 'pct', 'percentual']) {
    if (typeof entry[key] === 'number') return entry[key];
  }

  // Look for first numeric value
  for (const val of Object.values(entry)) {
    if (typeof val === 'number') return val;
  }

  return null;
}

/**
 * Tries to extract a time series from indicator data.
 * Returns sorted array of {year, value} or null.
 */
function extractTimeSeries(dados: any): { year: number; value: number }[] | null {
  if (!dados || typeof dados !== 'object') return null;

  // Pattern 1: dados.series = {2018: {...}, 2019: {...}} (ODS-Racial)
  const seriesObj = dados.series || dados.serie || dados.historico;
  if (seriesObj && typeof seriesObj === 'object' && !Array.isArray(seriesObj)) {
    const points: { year: number; value: number }[] = [];
    for (const [key, val] of Object.entries(seriesObj)) {
      const year = parseInt(key, 10);
      if (year >= 2000 && year <= 2030) {
        const num = extractNumericValue(val);
        if (num !== null) points.push({ year, value: num });
      }
    }
    if (points.length >= 1) return points.sort((a, b) => a.year - b.year);
  }

  // Pattern 2: dados.series is an array [{ano: 2018, valor: X}, ...]
  if (Array.isArray(seriesObj) && seriesObj.length >= 1) {
    const points: { year: number; value: number }[] = [];
    for (const item of seriesObj) {
      const year = item.ano || item.year;
      const val = extractNumericValue(item);
      if (year && val !== null) points.push({ year, value: val });
    }
    if (points.length >= 1) return points.sort((a, b) => a.year - b.year);
  }

  // Pattern 3: Year keys directly in dados {2018: {...}, 2022: {...}, nota: "...", unidade: "..."}
  const yearKeys = Object.keys(dados).filter(k => {
    const n = parseInt(k, 10);
    return n >= 2000 && n <= 2030;
  });
  if (yearKeys.length >= 1) {
    const points: { year: number; value: number }[] = [];
    for (const k of yearKeys) {
      const num = extractNumericValue(dados[k]);
      if (num !== null) points.push({ year: parseInt(k, 10), value: num });
    }
    if (points.length >= 1) return points.sort((a, b) => a.year - b.year);
  }

  // Pattern 4: Nested objects with year suffixes like percentual_negros_autuados: {2020: 67.4}
  for (const val of Object.values(dados)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const subYearKeys = Object.keys(val as Record<string, any>).filter(k => {
        const n = parseInt(k, 10);
        return n >= 2000 && n <= 2030;
      });
      if (subYearKeys.length >= 1) {
        const points: { year: number; value: number }[] = [];
        for (const k of subYearKeys) {
          const num = (val as any)[k];
          if (typeof num === 'number') points.push({ year: parseInt(k, 10), value: num });
        }
        if (points.length >= 1) return points.sort((a, b) => a.year - b.year);
      }
    }
  }

  return null;
}

export type IndicadorEvalResult = 'favoravel' | 'desfavoravel' | 'novo' | 'neutro';

export interface IndicadorEvalDetail {
  result: IndicadorEvalResult;
  valorAntigo?: number;
  valorRecente?: number;
  anoAntigo?: number;
  anoRecente?: number;
  seriesLength?: number;
}

const NEGATIVE_KEYWORDS = [
  'homicíd', 'letalidade', 'analfabet', 'mortalidade', 'evasão',
  'desemprego', 'encarcer', 'feminicíd', 'violência', 'estupro',
  'infanticíd', 'suicíd', 'abandono', 'sem ensino superior',
  'inadequa', 'déficit', 'pobreza', 'extrema pobreza',
];

/**
 * Evaluates whether an indicator counts as "favorable" for the farol.
 * Now handles: ODS-Racial {series: {2018: {...}}}, year-keyed dados, nested sub-objects.
 */
export function evaluateIndicador(ind: any): IndicadorEvalResult {
  return evaluateIndicadorDetailed(ind).result;
}

export function evaluateIndicadorDetailed(ind: any): IndicadorEvalDetail {
  const dados = ind.dados;
  if (!dados) return { result: 'neutro' };

  const timeSeries = extractTimeSeries(dados);

  if (timeSeries && timeSeries.length >= 2) {
    const first = timeSeries[0];
    const last = timeSeries[timeSeries.length - 1];

    const nome = (ind.nome || '').toLowerCase();
    const isNegative = NEGATIVE_KEYWORDS.some(kw => nome.includes(kw));

    const detail: IndicadorEvalDetail = {
      result: 'neutro',
      valorAntigo: first.value,
      valorRecente: last.value,
      anoAntigo: first.year,
      anoRecente: last.year,
      seriesLength: timeSeries.length,
    };

    if (first.value !== last.value) {
      if (isNegative) {
        detail.result = last.value < first.value ? 'favoravel' : 'desfavoravel';
      } else {
        detail.result = last.value > first.value ? 'favoravel' : 'desfavoravel';
      }
    }

    return detail;
  }

  // Single data point = newly measured
  if (timeSeries && timeSeries.length === 1) {
    return {
      result: 'novo',
      valorRecente: timeSeries[0].value,
      anoRecente: timeSeries[0].year,
      seriesLength: 1,
    };
  }

  // Has some data but no extractable time series — still counts as "novo" (being measured)
  if (typeof dados === 'object' && Object.keys(dados).length > 0) {
    return { result: 'novo' };
  }

  return { result: 'neutro' };
}
