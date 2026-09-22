/**
 * Deriva o "portal de origem" (fonte primária) a partir da URL original
 * registrada em cada evidência da Base Estatística.
 * Usado na aba Fontes de Dados para tornar o catálogo dinâmico:
 * toda URL original presente na base vira, obrigatoriamente, uma fonte listada.
 */

export interface PortalOrigem {
  /** Nome legível do portal */
  nome: string;
  /** Órgão / instituição responsável */
  orgao: string;
  /** Host normalizado (chave de agrupamento) */
  host: string;
}

const MAPA: Array<{ match: RegExp; nome: string; orgao: string }> = [
  { match: /odsr\.lema\.ufpb\.br/i, nome: 'Portal ODS Racial', orgao: 'LEMA/UFPB' },
  { match: /sidra\.ibge\.gov\.br/i, nome: 'SIDRA — Banco de Tabelas Estatísticas', orgao: 'IBGE' },
  { match: /censo2022\.ibge\.gov\.br/i, nome: 'Censo Demográfico 2022', orgao: 'IBGE' },
  { match: /ftp\.ibge\.gov\.br/i, nome: 'FTP de Microdados', orgao: 'IBGE' },
  { match: /ibge\.gov\.br/i, nome: 'Portal IBGE', orgao: 'IBGE' },
  { match: /tabnet\.datasus\.gov\.br/i, nome: 'TabNet — Tabulação de Dados', orgao: 'MS/DataSUS' },
  { match: /datasus\.saude\.gov\.br/i, nome: 'DataSUS — Informações de Saúde', orgao: 'MS/DataSUS' },
  { match: /forumseguranca\.org\.br/i, nome: 'Anuário Brasileiro de Segurança Pública', orgao: 'FBSP' },
  { match: /ipea\.gov\.br/i, nome: 'Atlas da Violência / IPEA', orgao: 'IPEA' },
  { match: /smartlabbr\.org/i, nome: 'SmartLab — Observatórios Digitais', orgao: 'MPT/OIT' },
  { match: /dieese\.org\.br/i, nome: 'DIEESE — Estudos e Pesquisas', orgao: 'DIEESE' },
  { match: /fjp\.mg\.gov\.br/i, nome: 'Déficit Habitacional', orgao: 'Fundação João Pinheiro' },
  { match: /inep\.gov\.br/i, nome: 'INEP — Censos e Indicadores Educacionais', orgao: 'INEP/MEC' },
  { match: /app\.powerbi\.com/i, nome: 'Painéis InepData (Power BI)', orgao: 'INEP/MEC' },
  { match: /gov\.br\/mdh/i, nome: 'Painel de Dados / Disque 100', orgao: 'MDHC' },
  { match: /gov\.br\/mulheres/i, nome: 'RASEAM e publicações', orgao: 'Ministério das Mulheres' },
  { match: /gov\.br\/igualdaderacial/i, nome: 'Portal da Igualdade Racial', orgao: 'MIR' },
  { match: /gov\.br\/funai/i, nome: 'Terras Indígenas', orgao: 'FUNAI' },
  { match: /gov\.br\/incra/i, nome: 'Governança Fundiária / Quilombolas', orgao: 'INCRA' },
  { match: /palmares\.gov\.br/i, nome: 'Certificação Quilombola', orgao: 'Fundação Cultural Palmares' },
  { match: /gov\.br\/inep/i, nome: 'INEP — Estatísticas Educacionais', orgao: 'INEP/MEC' },
  { match: /gov\.br\/saude/i, nome: 'Ministério da Saúde', orgao: 'MS' },
  { match: /gov\.br\/mj/i, nome: 'SINESP e dados de segurança', orgao: 'MJSP' },
  { match: /(cidadania|mds)\.gov\.br/i, nome: 'VIS Data / CadÚnico', orgao: 'MDS' },
  { match: /siconfi\.tesouro\.gov\.br/i, nome: 'SICONFI', orgao: 'STN' },
  { match: /siop\.planejamento\.gov\.br/i, nome: 'SIOP', orgao: 'MPO' },
  { match: /portaldatransparencia\.gov\.br/i, nome: 'Portal da Transparência', orgao: 'CGU' },
  { match: /mte\.gov\.br|bi\.mte/i, nome: 'RAIS / CAGED', orgao: 'MTE' },
  { match: /cnj\.jus\.br/i, nome: 'Justiça em Números', orgao: 'CNJ' },
  { match: /agenciabrasil\.ebc\.com\.br/i, nome: 'Agência Brasil', orgao: 'EBC' },
  { match: /fiocruz\.br/i, nome: 'Fiocruz — Informes epidemiológicos', orgao: 'Fiocruz' },
  { match: /drive\.google\.com|docs\.google\.com/i, nome: 'Arquivo público (Google Drive)', orgao: 'Fonte institucional' },
];

export function hostFromUrl(url?: string | null): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return String(url).replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
  }
}

export function portalFromUrl(url?: string | null): PortalOrigem | null {
  if (!url) return null;
  const host = hostFromUrl(url);
  if (!host) return null;
  const hit = MAPA.find(m => m.match.test(url));
  if (hit) return { nome: hit.nome, orgao: hit.orgao, host };
  return { nome: host, orgao: 'Fonte oficial', host };
}
