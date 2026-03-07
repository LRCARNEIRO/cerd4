/**
 * Marcadores de Agenda Transversal — PPA 2024-2027
 * Fonte: Espelho do Monitoramento do PPA (Ministério do Planejamento e Orçamento)
 *
 * Estes programas foram oficialmente marcados pelo Governo Federal como
 * pertencentes às Agendas Transversais de Igualdade Racial e Povos Indígenas.
 * A partir de 2024, a metodologia TESTE utiliza estas listas em vez de busca
 * por palavras-chave para identificar ações orçamentárias relevantes.
 *
 * Para povos ciganos, continua-se com a metodologia anterior (palavras-chave),
 * pois não há agenda transversal específica para esse grupo.
 */

export interface AgendaPrograma {
  codigo: string;
  nome: string;
  orgao_codigo: string;
  orgao_nome: string;
}

/**
 * Programas da Agenda Transversal "Igualdade Racial"
 * Fonte: agenda-racial-completa.pdf (PPA 2024-2027, Espelho do Monitoramento)
 */
export const AGENDA_RACIAL_PROGRAMAS: AgendaPrograma[] = [
  { codigo: '1189', nome: 'Bioeconomia para um Novo Ciclo de Prosperidade', orgao_codigo: '44000', orgao_nome: 'MMA' },
  { codigo: '2224', nome: 'Planejamento e Orçamento para o Desenvolvimento Sustentável e Inclusivo', orgao_codigo: '47000', orgao_nome: 'MPO' },
  { codigo: '2301', nome: 'Transformação do Estado para a Cidadania e o Desenvolvimento', orgao_codigo: '46000', orgao_nome: 'MGI' },
  { codigo: '2304', nome: 'Ciência, Tecnologia e Inovação para o Desenvolvimento Social', orgao_codigo: '24000', orgao_nome: 'MCTI' },
  { codigo: '2308', nome: 'Consolidação do Sistema Nacional de Ciência, Tecnologia e Inovação – SNCTI', orgao_codigo: '24000', orgao_nome: 'MCTI' },
  { codigo: '2310', nome: 'Promoção do Trabalho Decente, Emprego e Renda', orgao_codigo: '40000', orgao_nome: 'MTE' },
  { codigo: '2316', nome: 'Relações Internacionais e Assistência a Brasileiras e Brasileiros no Exterior', orgao_codigo: '35000', orgao_nome: 'MRE' },
  { codigo: '5121', nome: 'Gestão, Trabalho, Educação e Transformação Digital na Saúde', orgao_codigo: '36000', orgao_nome: 'MS' },
  // Programas já cobertos pela metodologia anterior que também constam na agenda racial:
  { codigo: '5802', nome: 'Enfrentamento ao Racismo e Promoção da Igualdade Racial – Quilombolas e Ciganos', orgao_codigo: '67000', orgao_nome: 'MIR' },
  { codigo: '5803', nome: 'Juventude Negra Viva', orgao_codigo: '67000', orgao_nome: 'MIR' },
  { codigo: '5804', nome: 'Promoção da Igualdade Étnico-Racial', orgao_codigo: '67000', orgao_nome: 'MIR' },
  { codigo: '5111', nome: 'Educação Básica Democrática, com Qualidade e Equidade', orgao_codigo: '26000', orgao_nome: 'MEC' },
];

/**
 * Programas da Agenda Transversal "Povos Indígenas"
 * Fonte: agenda_indigenas-completa.pdf (PPA 2024-2027, Espelho do Monitoramento)
 */
export const AGENDA_INDIGENA_PROGRAMAS: AgendaPrograma[] = [
  { codigo: '1617', nome: 'Demarcação e Gestão dos Territórios Indígenas', orgao_codigo: '84000', orgao_nome: 'MPI' },
  { codigo: '2224', nome: 'Planejamento e Orçamento para o Desenvolvimento Sustentável e Inclusivo', orgao_codigo: '47000', orgao_nome: 'MPO' },
  { codigo: '2308', nome: 'Consolidação do Sistema Nacional de Ciência, Tecnologia e Inovação – SNCTI', orgao_codigo: '24000', orgao_nome: 'MCTI' },
  { codigo: '2316', nome: 'Relações Internacionais e Assistência a Brasileiras e Brasileiros no Exterior', orgao_codigo: '35000', orgao_nome: 'MRE' },
  { codigo: '5111', nome: 'Educação Básica Democrática, com Qualidade e Equidade', orgao_codigo: '26000', orgao_nome: 'MEC' },
  { codigo: '5123', nome: 'Vigilância em Saúde e Ambiente', orgao_codigo: '36000', orgao_nome: 'MS' },
  { codigo: '5126', nome: 'Esporte para a Vida', orgao_codigo: '51000', orgao_nome: 'ME' },
  { codigo: '5128', nome: 'Bolsa Família', orgao_codigo: '55000', orgao_nome: 'MDS' },
  { codigo: '5129', nome: 'Inclusão de Famílias em Situação de Vulnerabilidade no Cadastro Único', orgao_codigo: '55000', orgao_nome: 'MDS' },
  // Programas já cobertos pela metodologia anterior:
  { codigo: '5136', nome: 'Proteção e Promoção dos Direitos dos Povos Indígenas', orgao_codigo: '84000', orgao_nome: 'MPI' },
];

/** Códigos únicos de ambas agendas combinados */
export const AGENDA_TODOS_CODIGOS: Set<string> = new Set([
  ...AGENDA_RACIAL_PROGRAMAS.map(p => p.codigo),
  ...AGENDA_INDIGENA_PROGRAMAS.map(p => p.codigo),
]);

/** Códigos exclusivos da agenda racial (não-indígena) */
export const AGENDA_RACIAL_CODIGOS: Set<string> = new Set(
  AGENDA_RACIAL_PROGRAMAS.map(p => p.codigo)
);

/** Códigos exclusivos da agenda indígena */
export const AGENDA_INDIGENA_CODIGOS: Set<string> = new Set(
  AGENDA_INDIGENA_PROGRAMAS.map(p => p.codigo)
);

/**
 * Classificação TESTE híbrida:
 * - Para ano >= 2024: usa as listas de marcadores de agenda para balizar a
 *   coleta de dotação inicial e liquidado de cada ação listada nos PDFs.
 * - Para ano < 2024 (2018–2023): usa a mesma lógica de palavras-chave da
 *   metodologia atual, com dados complementares SIOP.
 * - Para ciganos (todos os anos): sempre usa palavras-chave (não há agenda transversal).
 */
export type TesteThematicCategory = 'racial' | 'indigena' | 'quilombola' | 'ciganos' | 'sesai' | 'agenda_racial' | 'agenda_indigena';

interface RecordLike {
  ano: number;
  programa: string;
  orgao: string;
  observacoes?: string | null;
  descritivo?: string | null;
}

/** Extrai o código numérico de um campo "programa" que pode ter formato "1617 - Nome" ou apenas texto */
function extractProgramCode(programa: string): string | null {
  const match = programa.match(/^(\d{4})\b/);
  return match ? match[1] : null;
}

/** Check if programa text contains a given code */
function programContainsCode(programa: string, code: string): boolean {
  return programa.includes(code);
}

export function classifyTesteThematic(r: RecordLike): TesteThematicCategory | null {
  const prog = r.programa.toLowerCase();
  const orgao = r.orgao.toUpperCase();
  const obs = (r.observacoes || '').toLowerCase();
  const descritivo = (r.descritivo || '').toLowerCase();
  const fullText = `${prog} ${orgao} ${obs} ${descritivo}`;

  // SESAI always separate (same as current)
  if (orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') ||
      prog.includes('20yp') || prog.includes('7684')) {
    return 'sesai';
  }

  // Ciganos: always keyword-based (no transversal agenda)
  if (prog.includes('cigano') || prog.includes('romani') || prog.includes('povo cigano') ||
      descritivo.includes('cigano') || descritivo.includes('romani')) {
    return 'ciganos';
  }

  // For 2024+, use agenda markers
  if (r.ano >= 2024) {
    const progCode = extractProgramCode(r.programa);

    // Check if the program code matches any agenda
    if (progCode) {
      const isRacial = AGENDA_RACIAL_CODIGOS.has(progCode);
      const isIndigena = AGENDA_INDIGENA_CODIGOS.has(progCode);

      if (isRacial && isIndigena) {
        // Shared program — classify based on orgao or keywords
        if (['FUNAI', 'MPI'].includes(orgao) || fullText.includes('indigen') || fullText.includes('indígen')) {
          return 'agenda_indigena';
        }
        return 'agenda_racial';
      }
      if (isIndigena) return 'agenda_indigena';
      if (isRacial) return 'agenda_racial';
    }

    // Also try matching by code anywhere in programa text
    for (const code of AGENDA_INDIGENA_CODIGOS) {
      if (programContainsCode(r.programa, code)) {
        return 'agenda_indigena';
      }
    }
    for (const code of AGENDA_RACIAL_CODIGOS) {
      if (programContainsCode(r.programa, code)) {
        return 'agenda_racial';
      }
    }

    // Fall through to keyword-based for 2024+ records not matched by agenda
  }

  // Pre-2024 or fallback: use keyword-based classification (same as current methodology)
  if (['FUNAI', 'MPI'].includes(orgao) ||
      prog.includes('indigen') || prog.includes('indígen') || prog.includes('2065')) {
    return 'indigena';
  }
  if (prog.includes('quilomb') || prog.includes('20g7') || prog.includes('0859')) {
    return 'quilombola';
  }

  // General racial
  const racialKws = ['racial', 'racismo', 'negro', 'negra', 'afro', 'quilomb', 'indigen',
    'étnic', 'palmares', 'igualdade racial', 'terreiro', 'matriz africana',
    'capoeira', 'candomblé', 'umbanda', 'afrodescendente', 'seppir'];
  if (racialKws.some(kw => fullText.includes(kw))) {
    return 'racial';
  }

  // Not matched
  return null;
}

/** Broader grouping for display purposes */
export type TesteDisplayGroup = 'racial' | 'indigena' | 'quilombola' | 'ciganos' | 'sesai';

export function testeToDisplayGroup(cat: TesteThematicCategory): TesteDisplayGroup {
  switch (cat) {
    case 'agenda_racial': return 'racial';
    case 'agenda_indigena': return 'indigena';
    default: return cat as TesteDisplayGroup;
  }
}
