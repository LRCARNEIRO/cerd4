/**
 * COMPLEMENTO CERD 3 — Dados Hardcoded Exclusivos
 * 
 * Contém APENAS indicadores que NÃO existem nas abas estáticas temáticas,
 * preenchendo lacunas específicas do relatório CERD III.
 * 
 * Estes dados são espelhados no BD pela MirrorIngestionPanel (Etapa 4).
 */

// ========== TRABALHO INFANTIL ==========
export const trabalhoInfantil = {
  nome: 'Trabalho infantil por raça/cor',
  categoria: 'trabalho_renda',
  subcategoria: 'Trabalho Infantil',
  fonte: 'PNAD Contínua / IBGE',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/7436',
  artigos_convencao: ['Art.5(e)(i)'],
  documento_origem: ['CERD Observações Finais 2022', 'Plano de Durban'],
  tendencia: 'melhora',
  dados: {
    nota: 'Em 2022, 66,3% das crianças em situação de trabalho infantil eram pretas ou pardas.',
    pct_negros: { 2019: 66.1, 2022: 66.3 },
    total_criancas_trabalho: { 2019: 1768000, 2022: 1881000 },
    unidade: '%',
    paragrafos_cerd: '§31-32',
  },
};

// ========== TRABALHO ESCRAVO ==========
export const trabalhoEscravo = {
  nome: 'Trabalho escravo — resgatados por raça',
  categoria: 'trabalho_renda',
  subcategoria: 'trabalho_escravo',
  fonte: 'MTE/SIT Radar do Trabalho Escravo',
  url_fonte: 'https://sit.trabalho.gov.br/radar/',
  artigos_convencao: ['Art.5(e)(i)', 'Art.6'],
  documento_origem: ['CERD Observações Finais 2022', 'Plano de Durban'],
  tendencia: 'piora',
  dados: {
    nota: 'MTE 2025: 83% dos resgatados são pretos ou pardos. Acumulado histórico: 66% negro.',
    pct_negros_resgatados: { 2018: 55, 2019: 62, 2020: 61, 2021: 64, 2022: 69, 2023: 73, 2024: 79, 2025: 83 },
    total_resgatados: { 2018: 1745, 2019: 1054, 2020: 942, 2021: 1937, 2022: 2575, 2023: 3190, 2024: 2838, 2025: 812 },
    unidade: '%',
    paragrafos_cerd: '§31-32',
  },
};

// ========== INTOLERÂNCIA RELIGIOSA ==========
export const intoleranciaReligiosa = {
  nome: 'Denúncias de intolerância religiosa (Disque 100)',
  categoria: 'cultura_patrimonio',
  subcategoria: 'Intolerância Religiosa',
  fonte: 'MDHC/ONDH/Disque 100',
  url_fonte: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados',
  artigos_convencao: ['Art.5', 'Art.7'],
  documento_origem: ['CERD Observações Finais 2022', 'Plano de Durban', 'Recomendações Gerais (RGs)'],
  tendencia: 'piora',
  dados: {
    nota: 'Crescimento 382% 2020→2025. Auditado manualmente 12/03/2026.',
    total_denuncias: { 2020: 566, 2021: 584, 2022: 898, 2023: 1482, 2024: 2472, 2025: 2723 },
    religioes_vitimadas_2024: {
      umbanda: 151, candomble: 117, evangelico: 88, catolico: 53, espirita: 36, afro_outras: 21,
    },
    unidade: 'denúncias',
    paragrafos_cerd: '§45-46',
  },
};

// ========== EDUCAÇÃO INDÍGENA ==========
export const educacaoIndigena = {
  nome: 'Alfabetização e frequência escolar indígena — Censo 2022',
  categoria: 'educacao',
  subcategoria: 'educacao_indigena',
  fonte: 'IBGE/Censo 2022',
  url_fonte: 'https://censo2022.ibge.gov.br/panorama/',
  artigos_convencao: ['Art.5(e)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'estável',
  dados: {
    nota: 'Indígenas em TI: 72,4% alfabetizados vs. 96,5% brancos. Gap de 24,1pp.',
    alfabetizacao: {
      indigenas_em_TI: 72.4,
      indigenas_fora_TI: 88.1,
      negros: 93.2,
      brancos: 96.5,
    },
    escolas_em_territorios: 3541,
    unidade: '%',
    paragrafos_cerd: '§21-22',
  },
};

// ========== DISTORÇÃO IDADE-SÉRIE ==========
export const distorcaoIdadeSerie = {
  nome: 'Distorção idade-série por raça (Ensino Médio)',
  categoria: 'educacao',
  subcategoria: 'Distorção Idade-Série',
  fonte: 'INEP / Censo Escolar',
  url_fonte: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-educacionais',
  artigos_convencao: ['Art.5(e)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'melhora',
  dados: {
    fundamental: {
      2019: { negros: 24.3, brancos: 12.7, indigenas: 33.1 },
      2020: { negros: 23.1, brancos: 11.9, indigenas: 31.8 },
      2021: { negros: 21.8, brancos: 11.2, indigenas: 30.5 },
      2022: { negros: 20.6, brancos: 10.5, indigenas: 29.3 },
      2023: { negros: 19.5, brancos: 9.9, indigenas: 28.1 },
    },
    medio: {
      2019: { negros: 31.2, brancos: 18.4, indigenas: 38.7 },
      2020: { negros: 29.8, brancos: 17.1, indigenas: 37.2 },
      2021: { negros: 28.5, brancos: 16.3, indigenas: 35.9 },
      2022: { negros: 27.1, brancos: 15.5, indigenas: 34.6 },
      2023: { negros: 25.8, brancos: 14.8, indigenas: 33.4 },
    },
    unidade: '%',
    paragrafos_cerd: '§27-28',
  },
};

// ========== SAÚDE INDÍGENA ==========
export const saudeIndigena = {
  nome: 'Mortalidade infantil indígena — razão vs. não-indígena',
  categoria: 'saude',
  subcategoria: 'saude_indigena',
  fonte: 'NCPI / DataSUS',
  url_fonte: 'https://www.primeirainfancia.org.br/',
  artigos_convencao: ['Art.5(e)(iv)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'piora',
  dados: {
    nota: 'Razão de 2,44× em 2022. Pico de 3,42× em 2021 (impacto COVID).',
    taxa_indigena_por_1000nv: { 2018: 25.8, 2019: 27.3, 2020: 31.2, 2021: 44.7, 2022: 30.1 },
    taxa_nao_indigena_por_1000nv: { 2018: 12.1, 2019: 12.0, 2020: 11.8, 2021: 13.1, 2022: 12.3 },
    razao_indigena_nao_indigena: { 2018: 2.13, 2019: 2.28, 2020: 2.64, 2021: 3.42, 2022: 2.44 },
    unidade: 'por 1.000 NV',
    paragrafos_cerd: '§21-22',
  },
};

// ========== JUSTIÇA RACIAL ==========
export const justicaRacial = {
  nome: 'Processos judiciais — discriminação racial (CNJ)',
  categoria: 'legislacao_justica',
  subcategoria: 'Justiça Racial',
  fonte: 'CNJ / Justiça em Números 2024',
  url_fonte: 'https://www.cnj.jus.br/pesquisas-judiciarias/justica-em-numeros/',
  artigos_convencao: ['Art.6'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'melhora',
  dados: {
    nota: 'CNJ 2024: 11.620 processos pendentes sobre discriminação racial.',
    processos_pendentes: { 2024: 11620 },
    unidade: 'processos',
    paragrafos_cerd: '§11-12',
  },
};

// ========== CENSO 2022 — QUILOMBOLAS ==========
export const quilombolasCenso = {
  nome: 'População quilombola por região — Censo 2022',
  categoria: 'Demografia',
  subcategoria: 'censo_2022_racial',
  fonte: 'IBGE/Censo 2022',
  url_fonte: 'https://censo2022.ibge.gov.br/panorama/',
  artigos_convencao: ['Art.5', 'Art.2'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'estável',
  dados: {
    total_brasil: { 2022: 1327193 },
    Nordeste: { 2022: 1068813 },
    Sudeste: { 2022: 152255 },
    Norte: { 2022: 63010 },
    Sul: { 2022: 28226 },
    'Centro-Oeste': { 2022: 14974 },
    nota: 'Primeiro recenseamento oficial da população quilombola no Brasil. 1,33 milhão de pessoas se autodeclararam quilombolas (IBGE 2022). Concentração de 80,5% no Nordeste.',
    unidade: 'pessoas',
    paragrafos_cerd: '§33-36',
  },
};

// ========== CENSO 2022 — CIGANOS ==========
export const ciganosCenso = {
  nome: 'População cigana — Censo 2022',
  categoria: 'Demografia',
  subcategoria: 'censo_2022_racial',
  fonte: 'IBGE/Censo 2022',
  url_fonte: 'https://censo2022.ibge.gov.br/panorama/',
  artigos_convencao: ['Art.1', 'Art.5'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'estável',
  dados: {
    total_ciganos: { 2022: 41738 },
    por_regiao: {
      Sudeste: 18537, Nordeste: 11484, Sul: 5903, Norte: 3208, 'Centro-Oeste': 2606,
    },
    nota: 'Primeira contagem oficial de ciganos no Brasil (Censo 2022). O CERD §54-55 solicitava dados sobre a população cigana. Anteriormente, estimativas variavam entre 500 mil e 1 milhão — o dado real de 41,7 mil autodeclarados pode refletir sub-registro por estigma social.',
    unidade: 'pessoas',
    paragrafos_cerd: '§54-55',
  },
};

// ========== CENSO 2022 — INDÍGENAS EM TIs ==========
export const indigenasTisCenso = {
  nome: 'Indígenas em TIs vs. fora — Censo 2022',
  categoria: 'Demografia',
  subcategoria: 'censo_2022_racial',
  fonte: 'IBGE/Censo 2022',
  url_fonte: 'https://censo2022.ibge.gov.br/panorama/',
  artigos_convencao: ['Art.5', 'Art.2'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'estável',
  dados: {
    total_indigenas: { 2022: 1694836 },
    em_TIs: { 2022: 621000 },
    fora_de_TIs: { 2022: 1073000 },
    pct_em_TIs: { 2022: 36.6 },
    nota: 'Censo 2022: 63,4% dos indígenas vivem FORA de TIs — inverte paradigma do III Relatório CERD.',
    unidade: 'pessoas',
    paragrafos_cerd: '§21-22',
  },
};

// ========== RELIGIÕES DE MATRIZ AFRICANA ==========
export const religioesMatrizAfricana = {
  nome: 'Religiões de matriz africana — Censo 2022',
  categoria: 'Cultura',
  subcategoria: 'censo_2022_racial',
  fonte: 'IBGE/Censo 2022',
  url_fonte: 'https://censo2022.ibge.gov.br/panorama/',
  artigos_convencao: ['Art.5', 'Art.7'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'sub-registro',
  dados: {
    total_matriz_africana: { 2022: 1465949 },
    umbanda: { 2022: 1068167 },
    candomble: { 2022: 397782 },
    pct_populacao: { 2022: 0.73 },
    nota: 'Censo 2022: 1,47M adeptos de religiões de matriz africana. Sub-registro provável por intolerância religiosa.',
    unidade: 'pessoas',
    paragrafos_cerd: '§45-46',
  },
};

// ========== MIGRAÇÃO INTERNACIONAL (LACUNA) ==========
export const migracaoInternacional = {
  nome: 'Imigrantes e refugiados registrados no Brasil',
  categoria: 'demografia',
  subcategoria: 'Migração Internacional',
  fonte: 'OBMigra / CONARE',
  url_fonte: 'https://portaldeimigracao.mj.gov.br/pt/dados',
  artigos_convencao: ['Art. 5(d)(ii)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'estável',
  dados: {
    lacuna_desagregacao_racial: true,
    datamigra_bi_url: 'https://portaldeimigracao.mj.gov.br/pt/dados',
    nota: 'OBMigra não desagrega registros migratórios por raça/cor. Lacuna metodológica formal registrada no CERD.',
  },
};

// ========== TERRA E TERRITÓRIO ==========
export const demarcacaoTerras = {
  nome: 'Demarcação de Terras Indígenas — situação fundiária',
  categoria: 'terra_territorio',
  subcategoria: 'demarcacao',
  fonte: 'FUNAI / ISA',
  url_fonte: 'https://terrasindigenas.org.br/',
  artigos_convencao: ['Art.5(d)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'estável',
  dados: {
    TIs_homologadas_total: 487,
    TIs_em_estudo: 114,
    TIs_declaradas_sem_homologacao: 73,
    nota: 'Dados consolidados FUNAI/ISA. Atualização 2024. §54-55 CERD exige progresso na demarcação.',
    paragrafos_cerd: '§54-55',
  },
};

export const titulacaoQuilombola = {
  nome: 'Titulação de territórios quilombolas',
  categoria: 'terra_territorio',
  subcategoria: 'titulacao',
  fonte: 'INCRA',
  url_fonte: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas',
  artigos_convencao: ['Art.5(d)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'piora',
  dados: {
    titulos_emitidos_total: 54,
    processos_abertos: 1800,
    nota: 'Apenas 54 títulos emitidos vs. 1.800 processos abertos. Ritmo extremamente lento.',
    paragrafos_cerd: '§33-36',
  },
};

// ========== EXPORTAÇÃO CONSOLIDADA ==========
export const complementoCerd3Indicators = [
  trabalhoInfantil,
  trabalhoEscravo,
  intoleranciaReligiosa,
  educacaoIndigena,
  distorcaoIdadeSerie,
  saudeIndigena,
  justicaRacial,
  quilombolasCenso,
  ciganosCenso,
  indigenasTisCenso,
  religioesMatrizAfricana,
  migracaoInternacional,
  demarcacaoTerras,
  titulacaoQuilombola,
];

export const COMPLEMENTO_CERD3_COUNT = complementoCerd3Indicators.length;
