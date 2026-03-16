/**
 * COMPLEMENTO CERD III — Dados Hardcoded Exclusivos (Fusão Dados Novos + Complemento CERD 3)
 * 
 * Contém APENAS indicadores que NÃO existem nas abas estáticas temáticas,
 * preenchendo lacunas específicas dos relatórios CERD III e IV.
 * 
 * Estes dados são espelhados no BD pela MirrorIngestionPanel (Etapa 4).
 * Arquivo-fonte: ComplementoCerd3Data.ts
 * 
 * tipo 'complementar' = preenche lacunas das abas temáticas para cobertura 100% CERD III
 * tipo 'novo' = sugerido por recomendações CERD / Observações Finais
 * 
 * AUDITABILIDADE: Todas as fontes incluem nº de tabela (SIDRA, INEP, etc.)
 * e deep links diretos para dados brutos ou painéis filtrados.
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
  fonte: 'PNAD Contínua / IBGE — Tabela SIDRA 7436 (Trabalho infantil por cor/raça, 5-17 anos)',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/7436#/n1/all/v/10267/p/last%202/c2/6794/c86/2776,2777,2778,2779/d/v10267%202/l/v,p+c2,t+c86',
  artigos_convencao: ['Art.5(e)(i)'],
  documento_origem: ['CERD Observações Finais 2022', 'Plano de Durban'],
  tipo: 'complementar',
  tendencia: 'melhora',
  dados: {
    nota: 'Em 2022, 66,3% das crianças em situação de trabalho infantil eram pretas ou pardas. Fonte: SIDRA Tabela 7436, filtro cor/raça × faixa 5-17 anos.',
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
  fonte: 'MTE/SIT — Radar do Trabalho Escravo (Painel BI, filtro raça/cor)',
  url_fonte: 'https://sit.trabalho.gov.br/radar/',
  artigos_convencao: ['Art.5(e)(i)', 'Art.6'],
  documento_origem: ['CERD Observações Finais 2022', 'Plano de Durban'],
  tipo: 'complementar',
  tendencia: 'piora',
  dados: {
    nota: 'MTE 2025: 83% dos resgatados são pretos ou pardos. Painel Radar → aba "Perfil" → filtro raça/cor.',
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
  fonte: 'MDHC/ONDH — Painel de Dados (filtro: "Intolerância religiosa", série 2020-2025)',
  url_fonte: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados',
  artigos_convencao: ['Art.5', 'Art.7'],
  documento_origem: ['CERD Observações Finais 2022', 'Plano de Durban', 'Recomendações Gerais (RGs)'],
  tipo: 'complementar',
  tendencia: 'piora',
  dados: {
    nota: 'Crescimento 382% 2020→2025. Painel ONDH → Disque 100 → Violação: "Intolerância religiosa". Auditado manualmente — dados confirmados.',
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
  fonte: 'IBGE/Censo 2022 — SIDRA Tabela 8181 (Alfabetização indígena) + SIDRA 9542/9543 (por cor/raça)',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/8181',
  artigos_convencao: ['Art.5(e)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'estável',
  dados: {
    nota: 'Auditado: Indígenas 85% (SIDRA 8181, sem desagregação dentro/fora TI); Negros 90,94% (SIDRA 9542); Brancos 95,66% (SIDRA 9543). Escolas ensino básico em TIs: 3.541; ensino fundamental em TIs: 3.484 (Censo Escolar/INEP 2022).',
    alfabetizacao: {
      indigenas: 85,
      negros: 90.94,
      brancos: 95.66,
    },
    escolas_ensino_basico_em_territorios: 3541,
    escolas_ensino_fundamental_em_territorios: 3484,
    url_fonte_alfabetizacao_indigena: 'https://sidra.ibge.gov.br/tabela/8181',
    url_fonte_alfabetizacao_negros: 'https://sidra.ibge.gov.br/tabela/9542',
    url_fonte_alfabetizacao_brancos: 'https://sidra.ibge.gov.br/tabela/9543',
    url_fonte_escolas: 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/noticias/censo-escolar/educacao-em-terras-indigenas-o-que-diz-o-censo-escolar',
    unidade: '%',
    paragrafos_cerd: '§21-22',
  },
};

// ===== 5. DISTORÇÃO IDADE-SÉRIE =====
export const distorcaoIdadeSerie: ComplementoIndicador = {
  nome: 'Distorção idade-série por raça (Fundamental e Médio)',
  categoria: 'educacao',
  subcategoria: 'Distorção Idade-Série',
  fonte: 'INEP — Painel Censo Escolar (InepData, distorção idade-série por cor/raça, 2018-2025)',
  url_fonte: 'https://app.powerbi.com/view?r=eyJrIjoiN2ViNDBjNDEtMTM0OC00ZmFhLWIyZWYtZjI1YjU0NzQzMTJhIiwidCI6IjI2ZjczODk3LWM4YWMtNGIxZS05NzhmLWVhNGMwNzc0MzRiZiJ9',
  artigos_convencao: ['Art.5(e)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'melhora',
  dados: {
    nota: 'Auditado manualmente via Painel InepData Censo Escolar. Série 2018-2025, anos iniciais do fundamental e ensino médio, por cor/raça.',
    fundamental: {
      2018: { negros: 14.8, brancos: 7.4, indigenas: 33.1 },
      2019: { negros: 13.9, brancos: 6.9, indigenas: 30.5 },
      2020: { negros: 12.7, brancos: 6.4, indigenas: 28.1 },
      2021: { negros: 10.0, brancos: 5.2, indigenas: 24.9 },
      2022: { negros: 9.0, brancos: 4.9, indigenas: 22.4 },
      2023: { negros: 9.4, brancos: 5.2, indigenas: 22.1 },
      2024: { negros: 8.9, brancos: 5.1, indigenas: 20.5 },
      2025: { negros: 8.3, brancos: 4.9, indigenas: 18.7 },
    },
    medio: {
      2018: { negros: 33.5, brancos: 18.8, indigenas: 63.6 },
      2019: { negros: 31.2, brancos: 16.9, indigenas: 58.9 },
      2020: { negros: 31.4, brancos: 17.3, indigenas: 55.9 },
      2021: { negros: 30.6, brancos: 16.3, indigenas: 56.5 },
      2022: { negros: 26.8, brancos: 14.6, indigenas: 51.9 },
      2023: { negros: 23.8, brancos: 13.3, indigenas: 50.4 },
      2024: { negros: 21.3, brancos: 12.0, indigenas: 47.0 },
      2025: { negros: 19.3, brancos: 10.9, indigenas: 47.7 },
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
  fonte: 'DataSUS/SIM-SINASC — TabNet (Óbitos infantis × raça/cor da mãe, 2018-2024)',
  url_fonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/inf10uf.def',
  artigos_convencao: ['Art.5(e)(iv)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'piora',
  dados: {
    nota: 'Auditado manualmente. TabNet → SIM → Óbitos infantis + SINASC → Nascidos vivos, variável raça/cor da mãe. Série 2018-2024.',
    taxa_indigena_por_1000nv: { 2018: 26.35, 2019: 27.53, 2020: 22.84, 2021: 23.39, 2022: 26.17, 2023: 25.86, 2024: 24.43 },
    taxa_nao_indigena_por_1000nv: { 2018: 12.05, 2019: 12.25, 2020: 11.41, 2021: 11.77, 2022: 12.44, 2023: 12.46, 2024: 12.42 },
    url_nascidos_vivos: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def',
    url_obitos_infantis: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/inf10uf.def',
    unidade: 'por 1.000 NV',
    paragrafos_cerd: '§21-22',
  },
};

// ===== 7. PRÉ-NATAL POR RAÇA =====
export const preNatalRaca: ComplementoIndicador = {
  nome: 'Mães que tiveram acesso ao pré-natal por raça/cor',
  categoria: 'saude',
  subcategoria: 'pre_natal_racial',
  fonte: 'DataSUS/SINASC — TabNet (NV por consultas pré-natal × raça/cor mãe)',
  url_fonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def',
  artigos_convencao: ['Art.5(e)(iv)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'estável',
  dados: {
    nota: 'Auditado manualmente. TabNet → SINASC → Linha: Consultas pré-natal; Coluna: Raça/Cor da mãe. Série 2018-2024.',
    maes_negras_pre_natal: { 2018: 1185566, 2019: 1204715, 2020: 1137098, 2021: 1180602, 2022: 1157867, 2023: 1199220, 2024: 1169888 },
    maes_brancas_pre_natal: { 2018: 817522, 2019: 786778, 2020: 734957, 2021: 713019, 2022: 700658, 2023: 703843, 2024: 670118 },
    maes_indigenas_pre_natal: { 2018: 9803, 2019: 10716, 2020: 10136, 2021: 12277, 2022: 12437, 2023: 14706, 2024: 15649 },
    unidade: 'gestantes com acesso ao pré-natal',
    paragrafos_cerd: '§29-30',
  },
};

// ===== 8. ÓBITOS POR CAUSAS EVITÁVEIS POR RAÇA =====
export const doencasCronicasRaca: ComplementoIndicador = {
  nome: 'Óbitos por causas evitáveis por raça/cor',
  categoria: 'saude',
  subcategoria: 'obitos_evitaveis_racial',
  fonte: 'DataSUS/SIM — TabNet (Óbitos por causas evitáveis, 5-74 anos, por cor/raça)',
  url_fonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/evitb10uf.def',
  artigos_convencao: ['Art.5(e)(iv)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'piora',
  dados: {
    nota: 'Auditado manualmente. Indicador alterado de "doenças crônicas" para "óbitos por causas evitáveis" conforme disponibilidade no DATASUS (não foi possível desagregar por 3 doenças específicas).',
    obitos_branca: { 2018: 334360, 2019: 337754, 2020: 386997, 2021: 514325, 2022: 373607, 2023: 354798, 2024: 368078 },
    obitos_negra: { 2018: 384416, 2019: 389821, 2020: 471622, 2021: 550581, 2022: 443934, 2023: 435781, 2024: 455144 },
    obitos_indigena: { 2018: 2235, 2019: 2166, 2020: 2924, 2021: 3062, 2022: 2836, 2023: 2896, 2024: 2993 },
    unidade: 'óbitos',
    paragrafos_cerd: '§29-30',
  },
};

// ===== 9. DENÚNCIAS DISCRIMINAÇÃO RACIAL (DISQUE 100) =====
export const denunciasDiscriminacaoRacial: ComplementoIndicador = {
  nome: 'Denúncias por discriminação, injúria racial e étnica e racismo',
  categoria: 'legislacao_justica',
  subcategoria: 'Justiça Racial',
  fonte: 'MDHC/ONDH — Painel de Dados (filtro: discriminação racial/étnica/injúria, série 2022-2025)',
  url_fonte: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados',
  artigos_convencao: ['Art.6', 'Art.4'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'piora',
  dados: {
    nota: 'Auditado manualmente. Painel ONDH. Dados de 2022 disponíveis apenas do 2º semestre. Lei 14.532/2023 equiparou injúria racial a racismo.',
    denuncias: { 2022: 3535, 2023: 9738, 2024: 14543, 2025: 16245 },
    violacoes: { 2022: 5503, 2023: 17101, 2024: 26471, 2025: 31673 },
    obs_2022: 'dados disponíveis apenas do segundo semestre de 2022',
    unidade: 'denúncias',
    paragrafos_cerd: '§11-12',
  },
};

// ===== 10. DENÚNCIAS POVOS TRADICIONAIS =====
export const denunciasPovosTradicionais: ComplementoIndicador = {
  nome: 'Denúncias e violações contra povos tradicionais — Disque 100',
  categoria: 'legislacao_justica',
  subcategoria: 'povos_tradicionais_denuncias',
  fonte: 'MDHC/ONDH — Painel de Dados (filtro: grupo vulnerável)',
  url_fonte: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados',
  artigos_convencao: ['Art.5(d)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'estável',
  dados: {
    nota: 'Auditado manualmente. Painel ONDH → filtro grupo vulnerável = povos tradicionais. Série 2020-2025.',
    denuncias: { 2020: 825, 2021: 1305, 2022: 543, 2023: 118, 2024: 277, 2025: 290 },
    violacoes: { 2020: 3572, 2021: 5172, 2022: 2447, 2023: 743, 2024: 1840, 2025: 2338 },
    unidade: 'denúncias',
    paragrafos_cerd: '§21-22, §33-36',
  },
};

// ===== 11. PROCESSOS JUDICIAIS RACISMO (CNJ) =====
export const processosRacismoCnj: ComplementoIndicador = {
  nome: 'Processos judiciais — racismo e injúria racial (CNJ)',
  categoria: 'legislacao_justica',
  subcategoria: 'Justiça Racial',
  fonte: 'CNJ — Justiça em Números (Painel Estatísticas, filtro: racismo + injúria racial)',
  url_fonte: 'https://justica-em-numeros.cnj.jus.br/painel-estatisticas/',
  artigos_convencao: ['Art.6'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'piora',
  dados: {
    nota: 'Auditado manualmente. CNJ Justiça em Números → Painel Estatísticas. Lei 14.532/2023 ampliou tipificação.',
    processos_novos: { 2020: 50, 2021: 92, 2022: 234, 2023: 973, 2024: 2874, 2025: 4633 },
    unidade: 'processos',
    paragrafos_cerd: '§11-12',
  },
};

// ===== 12. RACISMO INSTITUCIONAL NO JUDICIÁRIO =====
export const racismoInstitucionalJudiciario: ComplementoIndicador = {
  nome: 'Composição racial do Judiciário — magistrados e servidores',
  categoria: 'legislacao_justica',
  subcategoria: 'racismo_institucional_judiciario',
  fonte: 'CNJ — Censo do Poder Judiciário 2023 + Painel Justiça Racial (Módulo "Perfil Demográfico")',
  url_fonte: 'https://paineisanalytics.cnj.jus.br/single/?appid=dd3d7742-c558-4f2f-8ab1-a10a2e67c48f&sheet=Perfil%20Demogr%C3%A1fico',
  artigos_convencao: ['Art.2', 'Art.5(c)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'melhora',
  dados: {
    nota: 'CNJ Painel Justiça Racial → Perfil Demográfico → Magistrados × cor/raça. Censo Judiciário 2023: 18,1% negros. Resolução CNJ 572/2025 ampliou cotas para 30%.',
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
  fonte: 'STF — Pesquisa de Jurisprudência (termos: "cotas raciais", "racismo", "quilombolas")',
  url_fonte: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&pesquisa_inteiro_teor=false&sinonimo=true&plural=true&radicais=false&buscaExata=true&page=1&pageSize=10&queryString=cotas%20raciais&sort=_score&sortBy=desc',
  artigos_convencao: ['Art.2', 'Art.6'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
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
  fonte: 'TSE — Repositório de Dados Eleitorais (CSV "consulta_cand", coluna DS_COR_RACA)',
  url_fonte: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2024',
  artigos_convencao: ['Art.5(c)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'melhora',
  dados: {
    nota: 'TSE Dados Abertos → Candidatos → CSV consulta_cand_2024 → coluna DS_COR_RACA. Filtrar por "PARDA" + "PRETA" = negros.',
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
  fonte: 'TSE — Repositório de Dados Eleitorais (CSV "consulta_cand" × resultado eleição)',
  url_fonte: 'https://dadosabertos.tse.jus.br/dataset/resultados-2024',
  artigos_convencao: ['Art.5(c)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'melhora',
  dados: {
    nota: 'TSE Dados Abertos → Resultados → cruzar consulta_cand (DS_COR_RACA) × resultado (DS_SIT_TOT_TURNO = "ELEITO"). Sub-representação: 55,5% pop. vs 30,1% deputados.',
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
  fonte: 'TSE — Prestação de Contas Eleitorais (CSV receitas × consulta_cand por cor/raça)',
  url_fonte: 'https://dadosabertos.tse.jus.br/dataset/prestacao-de-contas-eleitorais-2024',
  artigos_convencao: ['Art.5(c)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'melhora',
  dados: {
    nota: 'TSE Dados Abertos → Prestação de Contas → cruzar receitas_candidatos × consulta_cand (DS_COR_RACA). ADI 5831/STF determinou distribuição proporcional.',
    pendente_extracao: true,
    fonte_extracao: 'TSE Prestação de Contas CSV → cruzar SQ_CANDIDATO com consulta_cand (DS_COR_RACA) → somar VR_RECEITA por raça',
    unidade: '% do Fundo Eleitoral para candidatos negros',
    paragrafos_cerd: '§45-46',
  },
};

// ===== 17. SISTEMA PRISIONAL =====
export const sistemaPrisional: ComplementoIndicador = {
  nome: 'População carcerária por raça/cor',
  categoria: 'seguranca_publica',
  subcategoria: 'sistema_prisional',
  fonte: 'SENAPPEN/SISDEPEN — Levantamento Nacional (Tabela "Perfil da População Prisional por Cor/Raça")',
  url_fonte: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen/relatorios/relatorios-analiticos/br/brasil-junho-2024.pdf',
  artigos_convencao: ['Art.5(a)', 'Art.2'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'piora',
  dados: {
    nota: 'SISDEPEN Relatório Jun/2024 → Seção "Perfil da Pop. Prisional" → Tabela "Cor/Raça". Complemento: 19º Anuário FBSP 2025.',
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
  fonte: 'FJP — Déficit Habitacional no Brasil (Tabela 5: "Déficit por cor/raça do responsável")',
  url_fonte: 'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/',
  artigos_convencao: ['Art.5(e)(iii)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'piora',
  dados: {
    nota: 'FJP Relatório 2022 → Tabela 5: Déficit por cor/raça do responsável pelo domicílio. PNAD Contínua como base.',
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
  fonte: 'IBGE/Censo 2022 — Tabela SIDRA 9605 (Pop. residente em aglom. subnormais × cor/raça)',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/9605#/n1/all/v/93/p/last%201/c2/6794/c86/2776,2777,2778,2779/l/v,p+c2,t+c86',
  artigos_convencao: ['Art.5(e)(iii)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'piora',
  dados: {
    nota: '69% dos moradores de favelas são negros (Censo 2022). SIDRA Tabela 9605 → Pop. residente × cor/raça × tipo de setor (aglomerado subnormal).',
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
  fonte: 'IBGE/Censo 2022 — Tabela SIDRA 9605 (Domicílios × esgotamento sanitário × cor/raça)',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/9605#/n1/all/v/93/p/last%201/c2/6794/c285/all/l/v,p+c2,t+c285',
  artigos_convencao: ['Art.5(e)(iii)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'novo',
  tendencia: 'estável',
  dados: {
    nota: 'SIDRA Tabela 9605 → Domicílios × tipo de esgotamento × cor/raça responsável. Quilombos e TIs: Censo 2022 especial.',
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
  nome: 'População quilombola por UF — Censo 2022',
  categoria: 'Demografia',
  subcategoria: 'censo_2022_racial',
  fonte: 'IBGE/Censo 2022 — Tabela SIDRA 10089 (Pop. quilombola por UF e localização)',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/10089',
  artigos_convencao: ['Art.5', 'Art.2'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'estável',
  dados: {
    nota: 'Auditado manualmente. SIDRA Tabela 10089 → Pop. quilombola por UF, total e por localização (dentro/fora de territórios quilombolas).',
    total_por_uf: {
      AC: 0, AL: 37724, AM: 2812, AP: 12894, BA: 397502, CE: 23994, DF: 305,
      ES: 15659, GO: 30391, MA: 269168, MG: 135315, MS: 2572, MT: 11729,
      PA: 135603, PB: 16765, PE: 78864, PI: 31786, PR: 7113, RJ: 20447,
      RN: 22371, RO: 2925, RR: 0, RS: 17552, SC: 4449, SE: 28163, SP: 11006, TO: 13077,
    },
    em_territorios_por_uf: {
      AC: 0, AL: 691, AM: 1231, AP: 4909, BA: 20771, CE: 4609, DF: 0,
      ES: 2793, GO: 5106, MA: 29142, MG: 4576, MS: 1145, MT: 958,
      PA: 44560, PB: 2922, PE: 6769, PI: 8419, PR: 648, RJ: 3500,
      RN: 3450, RO: 221, RR: 0, RS: 2617, SC: 580, SE: 12748, SP: 4076, TO: 1328,
    },
    fora_territorios_por_uf: {
      AC: 0, AL: 37033, AM: 1581, AP: 7985, BA: 376731, CE: 19385, DF: 305,
      ES: 12866, GO: 25285, MA: 240026, MG: 130739, MS: 1427, MT: 10771,
      PA: 91043, PB: 13843, PE: 72095, PI: 23367, PR: 6465, RJ: 16947,
      RN: 18921, RO: 2704, RR: 0, RS: 14935, SC: 3869, SE: 15415, SP: 6930, TO: 11749,
    },
    unidade: 'pessoas',
    paragrafos_cerd: '§33-36',
  },
};

// ===== 22. CENSO 2022 — CIGANOS =====
export const ciganosCenso: ComplementoIndicador = {
  nome: 'População cigana — Censo 2022',
  categoria: 'Demografia',
  subcategoria: 'censo_2022_racial',
  fonte: 'IBGE/Censo 2022 — Tabela SIDRA 9891 (Pop. por povo ou comunidade tradicional × UF)',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/9891',
  artigos_convencao: ['Art.1', 'Art.5'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'estável',
  dados: {
    nota: 'SIDRA Tabela 9891. Auditoria manual: dados por região não foram localizados na fonte. Mantido total nacional. Possível sub-registro por estigma.',
    total_ciganos: { 2022: 41738 },
    lacuna_dados_regionais: true,
    unidade: 'pessoas',
    paragrafos_cerd: '§54-55',
  },
};

// ===== 23. CENSO 2022 — INDÍGENAS EM TIs =====
export const indigenasTisCenso: ComplementoIndicador = {
  nome: 'Indígenas em TIs vs. fora — Censo 2022',
  categoria: 'Demografia',
  subcategoria: 'censo_2022_racial',
  fonte: 'IBGE/Censo 2022 — Tabela SIDRA 9970 (Pop. indígena por idade, localização e situação)',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/9970',
  artigos_convencao: ['Art.5', 'Art.2'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'estável',
  dados: {
    nota: 'Auditado manualmente. SIDRA Tabela 9970 → Pop. indígena × localização (dentro/fora de TI) por UF.',
    em_TIs_por_uf: {
      AC: 19583, AL: 6672, AM: 149080, AP: 7853, BA: 17211, CE: 10521, DF: 0,
      ES: 4663, GO: 344, MA: 41677, MG: 12137, MS: 68682, MT: 45175,
      PA: 41819, PB: 19044, PE: 34314, PI: 114, PR: 13893, RJ: 546,
      RN: 0, RO: 11525, RR: 71754, RS: 15724, SC: 10792, SE: 329, SP: 4179, TO: 15213,
    },
    fora_TIs_por_uf: {
      AC: 12111, AL: 19053, AM: 341855, AP: 3481, BA: 212232, CE: 45851, DF: 5811,
      ES: 9747, GO: 19173, MA: 15489, MG: 24562, MS: 47787, MT: 13181,
      PA: 39161, PB: 11096, PE: 72332, PI: 7088, PR: 16573, RJ: 16448,
      RN: 11724, RO: 9621, RR: 25914, RS: 20378, SC: 10981, SE: 4381, SP: 51152, TO: 4810,
    },
    unidade: 'pessoas',
    paragrafos_cerd: '§21-22',
  },
};

// ===== 24. RELIGIÕES DE MATRIZ AFRICANA =====
export const religioesMatrizAfricana: ComplementoIndicador = {
  nome: 'Religiões de matriz africana — Censo 2022',
  categoria: 'Cultura',
  subcategoria: 'censo_2022_racial',
  fonte: 'IBGE/Censo 2022 — Tabela SIDRA 6417 (Pessoas por religião × cor/raça)',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/6417',
  artigos_convencao: ['Art.5', 'Art.7'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'sub-registro',
  dados: {
    nota: 'Auditado manualmente. SIDRA Tabela 6417 → Pessoas de 10 anos ou mais por religião × cor/raça. Sub-registro provável por intolerância.',
    total_matriz_africana: { 2022: 1849824 },
    pct_populacao: { 2022: 1.05 },
    unidade: 'pessoas',
    paragrafos_cerd: '§45-46',
  },
};

// ===== 25. MIGRAÇÃO / NATURALIZAÇÃO =====
export const migracaoInternacional: ComplementoIndicador = {
  nome: 'Naturalizados brasileiros e estrangeiros',
  categoria: 'demografia',
  subcategoria: 'Migração Internacional',
  fonte: 'IBGE/Censo 2022 — Tabela SIDRA 2145 (Naturalizados e estrangeiros por residência)',
  url_fonte: 'https://sidra.ibge.gov.br/tabela/2145',
  artigos_convencao: ['Art. 5(d)(ii)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'estável',
  dados: {
    nota: 'Auditado manualmente. SIDRA Tabela 2145 → Naturalizados e estrangeiros por grupos de anos de fixação, sexo e idade. Sem desagregação por raça/cor.',
    naturalizados_brasileiros: { '2022-2024': 29228 },
    taxa_naturalizados_pct: { '2022-2024': 13.51 },
    estrangeiros: { '2022-2024': 369355 },
    taxa_estrangeiros_pct: { '2022-2024': 46.58 },
    lacuna_desagregacao_racial: true,
  },
};

// ===== 26. DEMARCAÇÃO DE TERRAS INDÍGENAS =====
export const demarcacaoTerras: ComplementoIndicador = {
  nome: 'Demarcação de Terras Indígenas — situação fundiária',
  categoria: 'terra_territorio',
  subcategoria: 'demarcacao',
  fonte: 'FUNAI — Sistema Indigenista (TIs por fase do processo) + ISA/Terras Indígenas no Brasil',
  url_fonte: 'https://terrasindigenas.org.br/pt-br/brasil',
  artigos_convencao: ['Art.5(d)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'estável',
  dados: {
    nota: 'Auditado manualmente. Valores corrigidos conforme fonte oficial. "Homologadas e reservadas" inclui reservadas.',
    TIs_homologadas_e_reservadas_total: 536,
    TIs_em_identificacao: 166,
    TIs_declaradas_sem_homologacao: 71,
    paragrafos_cerd: '§54-55',
  },
};

// ===== 27. TITULAÇÃO QUILOMBOLA =====
export const titulacaoQuilombola: ComplementoIndicador = {
  nome: 'Titulação de territórios quilombolas',
  categoria: 'terra_territorio',
  subcategoria: 'titulacao',
  fonte: 'INCRA — Governança Fundiária (Títulos expedidos + Processos abertos)',
  url_fonte: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas',
  artigos_convencao: ['Art.5(d)(v)'],
  documento_origem: ['CERD Observações Finais 2022'],
  tipo: 'complementar',
  tendencia: 'piora',
  dados: {
    nota: 'Auditado manualmente. INCRA → Títulos expedidos: https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/Ttulos.expedidos.pdf; Processos abertos: https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/Quadro.ProcessosAbertos.pdf',
    titulos_emitidos_total: 384,
    processos_abertos_total: 2019,
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
  // Censo 2022 (quilombolasCenso, ciganosCenso, indigenasTisCenso exibidos apenas nos Mapas Demográficos)
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
