/**
 * COMPLEMENTO CERD III — Dados Hardcoded Exclusivos (Fusão Dados Novos + Complemento CERD 3)
 * 
 * Contém APENAS indicadores que NÃO existem nas abas estáticas temáticas,
 * preenchendo lacunas específicas dos relatórios CERD III e IV.
 * 
 * Estes dados são espelhados no BD pela MirrorIngestionPanel (Etapa 4).
 * Arquivo-fonte: ComplementoCerd3Data.ts
 * 
 * Categorias:
 *   1. Trabalho (Infantil & Escravo)
 *   2. Cultura e Patrimônio (Intolerância Religiosa)
 *   3. Educação (Indígena, Distorção Idade-Série)
 *   4. Saúde (Indígena, Pré-natal)
 *   5. Judiciário e Justiça Racial (Disque 100 racial, CNJ, STF)
 *   6. Representatividade Política (TSE)
 *   7. Sistema Prisional (SISDEPEN/FBSP)
 *   8. Habitação (Déficit, Favelas, Saneamento, MCMV)
 *   9. Censo 2022 — Dados Raciais Inéditos
 *  10. Terra e Território
 *  11. Migração (Lacuna formal)
 *  12. Doenças Crônicas por Raça
 */

export interface ComplementoIndicador {
  nome: string;
  categoria: string;
  subcategoria: string;
  fonte: string;
  url_fonte: string;
  artigos_convencao: string[];
  documento_origem: string[];
  tendencia: string;
  dados: Record<string, any>;
  /** 'complementar' = preenche lacunas das abas temáticas para 100% CERD III; 'novo' = sugerido por recomendações CERD */
  tipo: 'complementar' | 'novo';
}

// ===== 1. TRABALHO INFANTIL =====
export const trabalhoInfantil: ComplementoIndicador = {
  nome: 'Trabalho infantil por raça/cor',
  categoria: 'trabalho_renda',
  subcategoria: 'Trabalho Infantil',
  fonte: 'PNAD Contínua / IBGE',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/7436',
  artigos_convencao: ['Art.5(e)(i)'],
  documento_origem: ['CERD Observações Finais 2022', 'Plano de Durban'],
  tipo: 'complementar',
  tendencia: 'melhora',
  dados: {
    nota: 'Em 2022, 66,3% das crianças em situação de trabalho infantil eram pretas ou pardas.',
    pct_negros: { 2019: 66.1, 2022: 66.3 },
    total_criancas_trabalho: { 2019: 1768000, 2022: 1881000 },
    unidade: '%',
    paragrafos_cerd: '§31-32',
  },
};

// ===== 2. TRABALHO ESCRAVO =====
export const trabalhoEscravo: ComplementoIndicador = {
  nome: 'Trabalho escravo — resgatados por raça',
  categoria: 'trabalho_renda',
  subcategoria: 'trabalho_escravo',
  fonte: 'MTE/SIT Radar do Trabalho Escravo',
  url_fonte: 'https://sit.trabalho.gov.br/radar/',
  artigos_convencao: ['Art.5(e)(i)', 'Art.6'],
  documento_origem: ['CERD Observações Finais 2022', 'Plano de Durban'],
  tipo: 'complementar',
  tendencia: 'piora',
  dados: {
    nota: 'MTE 2025: 83% dos resgatados são pretos ou pardos. Acumulado histórico: 66% negro.',
    pct_negros_resgatados: { 2018: 55, 2019: 62, 2020: 61, 2021: 64, 2022: 69, 2023: 73, 2024: 79, 2025: 83 },
    total_resgatados: { 2018: 1745, 2019: 1054, 2020: 942, 2021: 1937, 2022: 2575, 2023: 3190, 2024: 2838, 2025: 812 },
    unidade: '%',
    paragrafos_cerd: '§31-32',
  },
};

// ===== 3. INTOLERÂNCIA RELIGIOSA =====
export const intoleranciaReligiosa: ComplementoIndicador = {
  nome: 'Denúncias de intolerância religiosa (Disque 100)',
  categoria: 'cultura_patrimonio',
  subcategoria: 'Intolerância Religiosa',
  fonte: 'MDHC/ONDH/Disque 100',
  url_fonte: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados',
  artigos_convencao: ['Art.5', 'Art.7'],
  documento_origem: ['CERD Observações Finais 2022', 'Plano de Durban', 'Recomendações Gerais (RGs)'],
  tipo: 'complementar',
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

// ===== 4. EDUCAÇÃO INDÍGENA =====
export const educacaoIndigena: ComplementoIndicador = {
  nome: 'Alfabetização e frequência escolar indígena — Censo 2022',
  categoria: 'educacao',
  subcategoria: 'educacao_indigena',
  fonte: 'IBGE/Censo 2022',
  url_fonte: 'https://censo2022.ibge.gov.br/panorama/',
  artigos_convencao: ['Art.5(e)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
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

// ===== 5. DISTORÇÃO IDADE-SÉRIE =====
export const distorcaoIdadeSerie: ComplementoIndicador = {
  nome: 'Distorção idade-série por raça (Fundamental e Médio)',
  categoria: 'educacao',
  subcategoria: 'Distorção Idade-Série',
  fonte: 'INEP / Censo Escolar',
  url_fonte: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/indicadores-educacionais',
  artigos_convencao: ['Art.5(e)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
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

// ===== 6. SAÚDE INDÍGENA =====
export const saudeIndigena: ComplementoIndicador = {
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

// ===== 7. PRÉ-NATAL POR RAÇA =====
export const preNatalRaca: ComplementoIndicador = {
  nome: 'Cobertura de pré-natal (7+ consultas) por raça/cor',
  categoria: 'saude',
  subcategoria: 'pre_natal_racial',
  fonte: 'SINASC / DataSUS',
  url_fonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def',
  artigos_convencao: ['Art.5(e)(iv)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'melhora',
  dados: {
    nota: 'Gestantes negras têm menor cobertura de 7+ consultas de pré-natal. Dados disponíveis via TabNet/SINASC com filtro raça/cor da mãe. Pendente extração série 2018-2023.',
    pendente_extracao: true,
    fonte_extracao: 'TabNet/SINASC — filtro "Consultas pré-natal" × "Raça/Cor da mãe"',
    unidade: '% gestantes com 7+ consultas',
    paragrafos_cerd: '§29-30',
  },
};

// ===== 8. DOENÇAS CRÔNICAS POR RAÇA =====
export const doencasCronicasRaca: ComplementoIndicador = {
  nome: 'Doenças crônicas por raça/cor (diabetes, hipertensão, falciforme)',
  categoria: 'saude',
  subcategoria: 'doencas_cronicas_racial',
  fonte: 'VIGITEL / DataSUS',
  url_fonte: 'https://svs.aids.gov.br/daent/cgdnt/vigitel/',
  artigos_convencao: ['Art.5(e)(iv)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'estável',
  dados: {
    nota: 'Doença falciforme tem prevalência significativamente maior na população negra. Dados anuais disponíveis nos relatórios VIGITEL. Pendente extração por raça/cor.',
    pendente_extracao: true,
    fonte_extracao: 'Relatórios VIGITEL anuais — filtro raça/cor',
    unidade: 'Prevalência (%)',
    paragrafos_cerd: '§29-30',
  },
};

// ===== 9. DENÚNCIAS DISCRIMINAÇÃO RACIAL (DISQUE 100) =====
export const denunciasDiscriminacaoRacial: ComplementoIndicador = {
  nome: 'Denúncias de discriminação racial — Disque 100',
  categoria: 'legislacao_justica',
  subcategoria: 'Justiça Racial',
  fonte: 'ONDH / MDHC',
  url_fonte: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados',
  artigos_convencao: ['Art.6', 'Art.4'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'piora',
  dados: {
    nota: 'Crescimento expressivo: de 1.400 violações em 2021 para 3.426 denúncias / 5.200 violações em 2024 (10 meses). Lei 14.532/2023 equiparou injúria racial a racismo.',
    denuncias: { 2021: 1400, 2022: 1800, 2023: 3100, 2024: 3426 },
    violacoes: { 2021: 1400, 2022: 2300, 2023: 4600, 2024: 5200 },
    unidade: 'denúncias',
    paragrafos_cerd: '§11-12',
  },
};

// ===== 10. DENÚNCIAS POVOS TRADICIONAIS =====
export const denunciasPovosTradicionais: ComplementoIndicador = {
  nome: 'Denúncias de violência contra povos tradicionais — Disque 100',
  categoria: 'legislacao_justica',
  subcategoria: 'povos_tradicionais_denuncias',
  fonte: 'ONDH / MDHC',
  url_fonte: 'https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100',
  artigos_convencao: ['Art.5(d)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'estável',
  dados: {
    nota: 'Dados disponíveis no Painel ONDH com filtro por grupo vulnerável (indígenas, quilombolas, ciganos). Pendente extração série 2018-2024.',
    pendente_extracao: true,
    fonte_extracao: 'Painel ONDH/Dados Abertos Disque 100 — filtro "grupo vulnerável"',
    unidade: 'denúncias',
    paragrafos_cerd: '§21-22, §33-36',
  },
};

// ===== 11. PROCESSOS JUDICIAIS RACISMO (CNJ) =====
export const processosRacismoCnj: ComplementoIndicador = {
  nome: 'Processos judiciais — racismo e injúria racial (CNJ)',
  categoria: 'legislacao_justica',
  subcategoria: 'Justiça Racial',
  fonte: 'CNJ / Painel Justiça Racial',
  url_fonte: 'https://paineisanalytics.cnj.jus.br/single/?appid=dd3d7742-c558-4f2f-8ab1-a10a2e67c48f',
  artigos_convencao: ['Art.6'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'piora',
  dados: {
    nota: 'Crescimento acelerado: 4.205 novos processos em 10m de 2024. Total acumulado pendente: 13.440 processos (97,4% na Justiça Estadual). Lei 14.532/2023 ampliou tipificação.',
    processos_novos: { 2024: 4205, 2025: 7000 },
    processos_pendentes_acumulados: { 2025: 13440 },
    pct_justica_estadual: 97.4,
    unidade: 'processos',
    paragrafos_cerd: '§11-12',
  },
};

// ===== 12. RACISMO INSTITUCIONAL NO JUDICIÁRIO =====
export const racismoInstitucionalJudiciario: ComplementoIndicador = {
  nome: 'Composição racial do Judiciário — magistrados e servidores',
  categoria: 'legislacao_justica',
  subcategoria: 'racismo_institucional_judiciario',
  fonte: 'CNJ — Censo do Poder Judiciário / Painel Justiça Racial',
  url_fonte: 'https://www.cnj.jus.br/pesquisas-judiciarias/censo-do-poder-judiciario/',
  artigos_convencao: ['Art.2', 'Art.5(c)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'melhora',
  dados: {
    nota: 'Magistrados negros: 18,1% (2023) vs 55,5% da população. Cotas ampliadas de 20% para 30% (Resolução CNJ nov/2025).',
    pct_magistrados_negros: { 2023: 18.1 },
    pct_servidores_magistrados_negros: { 2024: 24.76, 2025: 26.82 },
    total_negros_judiciario: { 2024: 74079, 2025: 81183 },
    magistrados_negros: { 2025: 2702 },
    unidade: '%',
    paragrafos_cerd: '§11-12',
  },
};

// ===== 13. JURISPRUDÊNCIA STF =====
export const jurisprudenciaStf: ComplementoIndicador = {
  nome: 'Marcos jurisprudenciais STF sobre questões raciais',
  categoria: 'legislacao_justica',
  subcategoria: 'jurisprudencia_racial',
  fonte: 'STF',
  url_fonte: 'https://portal.stf.jus.br/jurisprudencia/',
  artigos_convencao: ['Art.2', 'Art.6'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'melhora',
  dados: {
    marcos: [
      { ano: 2012, descricao: 'ADPF 186 — Cotas raciais constitucionais' },
      { ano: 2020, descricao: 'ADPF 635 — Restrição a operações policiais em favelas (RJ)' },
      { ano: 2023, descricao: 'Marco temporal indígena rejeitado; Lei 14.532 equipara injúria a racismo; Lei 14.723 renova cotas' },
      { ano: 2025, descricao: 'CNJ amplia cotas no Judiciário de 20% para 30%' },
    ],
    unidade: 'marco jurisprudencial',
    paragrafos_cerd: '§9-10',
  },
};

// ===== 14. CANDIDATOS NEGROS — TSE =====
export const candidatosNegros: ComplementoIndicador = {
  nome: 'Candidatos por raça/cor — Eleições',
  categoria: 'participacao_social',
  subcategoria: 'representatividade_politica',
  fonte: 'TSE — Repositório de Dados Eleitorais',
  url_fonte: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2024',
  artigos_convencao: ['Art.5(c)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'melhora',
  dados: {
    nota: 'Candidatos negros superaram brancos pela 1ª vez em 2020 e novamente em 2024 (52,7%). Porém, eleitos negros a prefeito são apenas 33%.',
    pct_candidatos_negros: { 2014: 46.7, 2018: 51.7, 2020: 52.2, 2022: 51.2, 2024: 52.7 },
    total_candidatos_negros: { 2024: 240587 },
    unidade: '% candidatos negros',
    paragrafos_cerd: '§45-46',
  },
};

// ===== 15. ELEITOS NEGROS =====
export const eleitosNegros: ComplementoIndicador = {
  nome: 'Eleitos por raça/cor — Câmara, Senado, Prefeituras, Câmaras Municipais',
  categoria: 'participacao_social',
  subcategoria: 'representatividade_politica',
  fonte: 'TSE — Repositório de Dados Eleitorais',
  url_fonte: 'https://dadosabertos.tse.jus.br/dataset/resultados-2024',
  artigos_convencao: ['Art.5(c)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'melhora',
  dados: {
    nota: 'Deputados negros: 30,1% (2022). Prefeitos negros: 33,3% (2024, +1,4pp vs 2020). Vereadores negros: 44,2% (2024). Sub-representação persistente vs 55,5% da população.',
    pct_deputados_negros: { 2014: 20.0, 2018: 24.4, 2022: 30.1 },
    pct_senadores_negros: { 2022: 19.7 },
    pct_prefeitos_negros: { 2020: 31.9, 2024: 33.3 },
    pct_vereadores_negros: { 2024: 44.2 },
    pct_prefeitas_negras: { 2024: 5.8 },
    unidade: '% eleitos negros',
    paragrafos_cerd: '§45-46',
  },
};

// ===== 16. FINANCIAMENTO ELEITORAL =====
export const financiamentoEleitoral: ComplementoIndicador = {
  nome: 'Financiamento eleitoral por raça/cor do candidato',
  categoria: 'participacao_social',
  subcategoria: 'representatividade_politica',
  fonte: 'TSE — Prestação de Contas',
  url_fonte: 'https://dadosabertos.tse.jus.br/dataset/prestacao-de-contas-eleitorais-2024',
  artigos_convencao: ['Art.5(c)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'melhora',
  dados: {
    nota: 'STF determinou (ADI 5831) distribuição proporcional de recursos a candidatos negros. Pendente verificação do percentual efetivo.',
    pendente_extracao: true,
    fonte_extracao: 'TSE Prestação de Contas Eleitorais — dados abertos',
    unidade: '% do Fundo Eleitoral para candidatos negros',
    paragrafos_cerd: '§45-46',
  },
};

// ===== 17. SISTEMA PRISIONAL =====
export const sistemaPrisional: ComplementoIndicador = {
  nome: 'População carcerária por raça/cor',
  categoria: 'seguranca_publica',
  subcategoria: 'sistema_prisional',
  fonte: 'SISDEPEN / SENAPPEN / FBSP',
  url_fonte: 'https://www.gov.br/senappen/pt-br/centrais-de-conteudo/paineis-analise-de-dados',
  artigos_convencao: ['Art.5(a)', 'Art.2'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'piora',
  dados: {
    nota: 'Negros atingiram o maior patamar da série: de 58,4% (2005) para 68,2% (2022). Total 2024: 852 mil presos, ~70% negros.',
    pct_negros: { 2005: 58.4, 2018: 63.6, 2019: 66.7, 2021: 67.5, 2022: 68.2, 2024: 70 },
    total_presos: { 2018: 726354, 2022: 648000, 2024: 852000 },
    presos_negros: { 2022: 442033 },
    pct_mulheres_negras_presas: { 2024: 68 },
    unidade: '%',
    paragrafos_cerd: '§17-18',
  },
};

// ===== 18. DÉFICIT HABITACIONAL =====
export const deficitHabitacionalRacial: ComplementoIndicador = {
  nome: 'Déficit habitacional por raça/cor',
  categoria: 'habitacao',
  subcategoria: 'deficit_habitacional_racial',
  fonte: 'Fundação João Pinheiro / PNAD Contínua',
  url_fonte: 'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/',
  artigos_convencao: ['Art.5(e)(iii)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'piora',
  dados: {
    nota: 'Em 2019, 68,7% do déficit habitacional era de pessoas negras. Total 2022: 6,2M domicílios.',
    pct_negros_deficit: { 2019: 68.7 },
    total_deficit: { 2019: 5876699, 2022: 6215313 },
    unidade: 'domicílios',
    paragrafos_cerd: '§31-32',
  },
};

// ===== 19. FAVELAS E AGLOMERADOS =====
export const favelasAglomerados: ComplementoIndicador = {
  nome: 'Moradores em favelas/aglomerados subnormais por raça',
  categoria: 'habitacao',
  subcategoria: 'favelas_aglomerados',
  fonte: 'IBGE — Censo 2022',
  url_fonte: 'https://www.ibge.gov.br/geociencias/organizacao-do-territorio/tipologias-do-territorio/15788-aglomerados-subnormais.html',
  artigos_convencao: ['Art.5(e)(iii)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'piora',
  dados: {
    nota: '69% dos moradores de favelas são negros (Censo 2022), contra 55,5% da população total — sobre-representação de 13,5pp. 16,4M pessoas.',
    total_moradores: { 2010: 11400000, 2022: 16400000 },
    pct_negros: { 2022: 69 },
    unidade: 'pessoas',
    paragrafos_cerd: '§31-32',
  },
};

// ===== 20. SANEAMENTO BÁSICO POR RAÇA =====
export const saneamentoRacial: ComplementoIndicador = {
  nome: 'Acesso a saneamento básico por raça/cor',
  categoria: 'habitacao',
  subcategoria: 'saneamento_racial',
  fonte: 'IBGE — Censo 2022',
  url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605',
  artigos_convencao: ['Art.5(e)(iii)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tendencia: 'estável',
  dados: {
    nota: 'Negros: 42,8% sem esgoto adequado vs 26,5% brancos (Censo 2022). Quilombos: 65,4% sem esgoto. TIs: 38,5% sem água canalizada.',
    pct_sem_esgoto_adequado: {
      negros: 42.8, brancos: 26.5, quilombolas: 65.4,
    },
    pct_sem_agua_canalizada_TIs: 38.5,
    unidade: '%',
    paragrafos_cerd: '§31-32',
  },
};

// ===== 21. CENSO 2022 — QUILOMBOLAS =====
export const quilombolasCenso: ComplementoIndicador = {
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
    nota: 'Primeiro recenseamento oficial. 1,33 milhão. Concentração de 80,5% no Nordeste.',
    unidade: 'pessoas',
    paragrafos_cerd: '§33-36',
  },
};

// ===== 22. CENSO 2022 — CIGANOS =====
export const ciganosCenso: ComplementoIndicador = {
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
    nota: 'Primeira contagem oficial. 41,7 mil autodeclarados — pode refletir sub-registro por estigma social. CERD §54-55 cobrava esses dados.',
    unidade: 'pessoas',
    paragrafos_cerd: '§54-55',
  },
};

// ===== 23. CENSO 2022 — INDÍGENAS EM TIs =====
export const indigenasTisCenso: ComplementoIndicador = {
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

// ===== 24. RELIGIÕES DE MATRIZ AFRICANA =====
export const religioesMatrizAfricana: ComplementoIndicador = {
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
    nota: 'Censo 2022: 1,47M adeptos. Sub-registro provável por intolerância religiosa.',
    unidade: 'pessoas',
    paragrafos_cerd: '§45-46',
  },
};

// ===== 25. MIGRAÇÃO INTERNACIONAL (LACUNA) =====
export const migracaoInternacional: ComplementoIndicador = {
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

// ===== 26. DEMARCAÇÃO DE TERRAS INDÍGENAS =====
export const demarcacaoTerras: ComplementoIndicador = {
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

// ===== 27. TITULAÇÃO QUILOMBOLA =====
export const titulacaoQuilombola: ComplementoIndicador = {
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
export const complementoCerd3Indicators: ComplementoIndicador[] = [
  // Trabalho
  trabalhoInfantil,
  trabalhoEscravo,
  // Cultura
  intoleranciaReligiosa,
  // Educação
  educacaoIndigena,
  distorcaoIdadeSerie,
  // Saúde
  saudeIndigena,
  preNatalRaca,
  doencasCronicasRaca,
  // Judiciário
  denunciasDiscriminacaoRacial,
  denunciasPovosTradicionais,
  processosRacismoCnj,
  racismoInstitucionalJudiciario,
  jurisprudenciaStf,
  // Representatividade
  candidatosNegros,
  eleitosNegros,
  financiamentoEleitoral,
  // Sistema Prisional
  sistemaPrisional,
  // Habitação
  deficitHabitacionalRacial,
  favelasAglomerados,
  saneamentoRacial,
  // Censo 2022
  quilombolasCenso,
  ciganosCenso,
  indigenasTisCenso,
  religioesMatrizAfricana,
  // Migração
  migracaoInternacional,
  // Terra
  demarcacaoTerras,
  titulacaoQuilombola,
];

export const COMPLEMENTO_CERD3_COUNT = complementoCerd3Indicators.length;

/** Count of indicators with verified data vs pending extraction */
export const COMPLEMENTO_CERD3_STATS = {
  total: complementoCerd3Indicators.length,
  verificados: complementoCerd3Indicators.filter(i => !(i.dados as any).pendente_extracao).length,
  pendentes: complementoCerd3Indicators.filter(i => (i.dados as any).pendente_extracao).length,
};
