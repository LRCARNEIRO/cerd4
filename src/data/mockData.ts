import type {
  WorkPlanMeta,
  CERDRecommendation,
  InvestigationAxis,
  StatisticalIndicator,
  DataSource,
  CommonCoreSection,
  UNObservation,
  DashboardStats,
  FocalGroup,
  BudgetData
} from '@/types/cerd';

// Metas do Plano de Trabalho CERD
export const workPlanMetas: WorkPlanMeta[] = [
  {
    id: 'meta-1',
    numero: 1,
    titulo: 'Contexto da Convenção e Revisão das Obrigações',
    descricao: 'Apresentar a trajetória de compromissos do Estado no cumprimento das obrigações convencionais e a revisão das observações conclusivas do Comitê no último relatório.',
    resultadosEsperados: [
      'Trajetória da Convenção e Obrigações: ratificação da Convenção Interamericana contra o Racismo (2021)',
      'Observações Relatório CERD (2022): Matriz das Observações Finais (CERD/C/BRA/CO/18-20)',
      'Revisão do III Relatório (2004-2017): linha de base para o novo período'
    ],
    status: 'em_andamento',
    progresso: 35,
    prazoInicio: '2026-01-01',
    prazoFim: '2026-02-28',
    responsavel: 'CDG/UFF'
  },
  {
    id: 'meta-2',
    numero: 2,
    titulo: 'Evolução Normativa e Institucional (2018-2025)',
    descricao: 'Produção de evidências sobre a inscrição do Estado brasileiro como agente promotor de medidas normativas e de um aparato institucional no campo do combate à discriminação racial.',
    resultadosEsperados: [
      'Avanços Legislativos: equiparação da Injúria Racial ao Racismo, novos marcos de reserva de vagas',
      'Institucionalidade: recriação do MIR, retomada de conselhos participativos',
      'Judiciário e Racismo: impactos normativos da ADPF 963, jurisprudência recente STF/STJ'
    ],
    status: 'em_andamento',
    progresso: 20,
    prazoInicio: '2026-01-01',
    prazoFim: '2026-02-28',
    responsavel: 'CDG/UFF'
  },
  {
    id: 'meta-3',
    numero: 3,
    titulo: 'Monitoramento da Ação Governamental',
    descricao: 'Conjunto de Medidas Administrativas, Orçamentárias e Políticas adotadas pelo Estado brasileiro no cumprimento das obrigações convencionais.',
    resultadosEsperados: [
      'Enfrentamento à Violência e Segurança Pública (par. 32-36 ONU)',
      'Direitos Territoriais: Indígenas e Quilombolas (par. 47-53 ONU)',
      'Saúde e Impactos da Pandemia (par. 15-17 ONU)',
      'Ações Afirmativas e Trabalho (par. 18-23 ONU)',
      'Educação, Cultura e Comunicação (par. 28-29)'
    ],
    status: 'nao_iniciada',
    progresso: 0,
    prazoInicio: '2026-01-15',
    prazoFim: '2026-02-28',
    responsavel: 'CDG/UFF'
  },
  {
    id: 'meta-4',
    numero: 4,
    titulo: 'Consolidação, Classificação e Recomendações',
    descricao: 'Síntese estratégica para o Governo Brasileiro.',
    resultadosEsperados: [
      'Matriz de Responsividade: Cumprido / Parcialmente Cumprido / Não Cumprido / Retrocesso',
      'Lacunas Críticas: áreas sem dados ou ações (ex: Ciganos/Roma)',
      'Diretrizes para o IV Relatório: sugestões de redação e ênfases estratégicas'
    ],
    status: 'nao_iniciada',
    progresso: 0,
    prazoInicio: '2026-02-01',
    prazoFim: '2026-02-28',
    responsavel: 'CDG/UFF'
  }
];

// Recomendações CERD priorizadas - conectadas ao banco de dados
export const cerdRecommendations: CERDRecommendation[] = [
  {
    id: 'rec-1',
    paragrafo: '17(a)',
    eixo: 'Saúde',
    tema: 'Direito à saúde e efeitos da pandemia COVID-19',
    recomendacao: 'Garantir acesso equitativo aos serviços de saúde para a população negra e povos indígenas',
    statusCumprimento: 'parcialmente_cumprido',
    prioridade: 'critica',
    acoesBrasil: [
      'Execução da Política Nacional de Saúde Integral da População Negra',
      'Ações específicas para saúde indígena e quilombola'
    ],
    lacunas: ['Dados sobre mortalidade materna desagregados por raça'],
    fontesEvidencia: ['SINAN', 'SIM', 'SINASC', 'DataSUS'],
    ultimaAtualizacao: '2026-01-15'
  },
  {
    id: 'rec-2',
    paragrafo: '19(c)',
    eixo: 'Educação',
    tema: 'Disparidades no acesso à educação',
    recomendacao: 'Eliminar disparidades raciais no acesso e permanência na educação',
    statusCumprimento: 'parcialmente_cumprido',
    prioridade: 'alta',
    acoesBrasil: [
      'Renovação da Lei de Cotas no Ensino Superior (Lei 14.723/2023)',
      'Programa de Bolsa Permanência'
    ],
    lacunas: ['Dados atualizados de evasão por raça'],
    fontesEvidencia: ['INEP', 'Censo Escolar', 'ENEM'],
    ultimaAtualizacao: '2026-01-10'
  },
  {
    id: 'rec-3',
    paragrafo: '23(a)',
    eixo: 'Trabalho e Renda',
    tema: 'Pobreza, trabalho e renda',
    recomendacao: 'Combater disparidades raciais no mercado de trabalho e redução da pobreza',
    statusCumprimento: 'parcialmente_cumprido',
    prioridade: 'critica',
    acoesBrasil: [
      'Bolsa Família com priorização racial',
      'Ações de empregabilidade para juventude negra'
    ],
    lacunas: ['Dados de trabalho informal por raça'],
    fontesEvidencia: ['RAIS', 'CAGED', 'CadÚnico', 'PNAD Contínua'],
    ultimaAtualizacao: '2026-01-08'
  },
  {
    id: 'rec-4',
    paragrafo: '36(a-d)',
    eixo: 'Segurança Pública',
    tema: 'Uso excessivo de força por agentes da lei',
    recomendacao: 'Investigar e punir uso excessivo de força policial contra população negra',
    statusCumprimento: 'nao_cumprido',
    prioridade: 'critica',
    acoesBrasil: [
      'ADPF 635 - Ações sobre operações em favelas',
      'Programa de câmeras corporais'
    ],
    lacunas: [
      'Dados de letalidade policial por raça',
      'Estatísticas de condenações'
    ],
    fontesEvidencia: ['Fórum de Segurança Pública', 'SINESP', 'Ministério Público'],
    ultimaAtualizacao: '2026-01-12'
  },
  {
    id: 'rec-5',
    paragrafo: '47-53',
    eixo: 'Direitos Territoriais',
    tema: 'Terras indígenas e quilombolas',
    recomendacao: 'Garantir demarcação de terras indígenas e titulação de territórios quilombolas',
    statusCumprimento: 'parcialmente_cumprido',
    prioridade: 'critica',
    acoesBrasil: [
      'Retomada de processos de demarcação',
      'Ações contra garimpo ilegal'
    ],
    lacunas: ['Status atualizado do Marco Temporal'],
    fontesEvidencia: ['FUNAI', 'INCRA', 'Fundação Palmares'],
    ultimaAtualizacao: '2026-01-14'
  }
];

// Eixos de Investigação (Quadro de Investigação do Plano)
export const investigationAxes: InvestigationAxis[] = [
  {
    id: 'eixo-1',
    numero: 1,
    nome: 'Estrutura Normativa e Institucional',
    descricao: 'Arcabouço legal e institucional de combate à discriminação racial',
    temas: [
      {
        id: 'tema-1-1',
        nome: 'Estatísticas e Censo',
        paragrafosONU: ['12a', '12b'],
        questoesInvestigacao: [
          'O Censo 2022 garantiu cobertura total em áreas indígenas/quilombolas?',
          'O critério de autoidentificação foi respeitado em todos os registros administrativos?'
        ],
        fontesEvidencia: ['SIDRA/IBGE - Tabelas 9605, 9674', 'RAIS', 'CadÚnico', 'SINAN'],
        indicadores: ['Cobertura censitária', 'Taxa de autoidentificação']
      },
      {
        id: 'tema-1-2',
        nome: 'Legislação Antirracista',
        paragrafosONU: ['14a'],
        questoesInvestigacao: [
          'O Estatuto da Igualdade Racial (Lei 12.288) foi efetivamente regulamentado e implementado nos níveis estadual e municipal?'
        ],
        fontesEvidencia: ['Leis estaduais/municipais', 'Planos de igualdade racial'],
        indicadores: ['Número de regulamentações', 'Municípios com planos']
      },
      {
        id: 'tema-1-3',
        nome: 'Capacidade Institucional',
        paragrafosONU: ['14c'],
        questoesInvestigacao: [
          'O SINAPIR e os órgãos de igualdade racial (MIR/MPI) receberam recursos suficientes ou sofreram desmonte?'
        ],
        fontesEvidencia: ['LOA vs. Execução (SIOP)', 'Organogramas', 'Decretos'],
        indicadores: ['Orçamento executado', 'Número de servidores']
      }
    ]
  },
  {
    id: 'eixo-2',
    numero: 2,
    nome: 'Violência Racializada e Justiça',
    descricao: 'Segurança pública, letalidade e acesso à justiça',
    temas: [
      {
        id: 'tema-2-1',
        nome: 'Letalidade Policial',
        paragrafosONU: ['32', '33', '34', '35', '36'],
        questoesInvestigacao: [
          'Houve redução nas mortes por intervenção policial de pessoas negras?',
          'Qual o status do cumprimento da ADPF 635?'
        ],
        fontesEvidencia: ['Fórum de Segurança Pública', 'SINESP', 'STF'],
        indicadores: ['Taxa de letalidade por raça', 'Número de operações em favelas']
      }
    ]
  },
  {
    id: 'eixo-3',
    numero: 3,
    nome: 'Direitos Econômicos e Sociais',
    descricao: 'Saúde, educação, trabalho e proteção social',
    temas: [
      {
        id: 'tema-3-1',
        nome: 'Saúde da População Negra',
        paragrafosONU: ['15', '16', '17'],
        questoesInvestigacao: [
          'A Política Nacional de Saúde Integral da População Negra está sendo executada?',
          'Qual foi o impacto desigual da COVID-19 por raça?'
        ],
        fontesEvidencia: ['DataSUS', 'SINAN', 'SIM', 'SINASC'],
        indicadores: ['Mortalidade materna por raça', 'Óbitos COVID por raça']
      }
    ]
  }
];

// Fontes de dados oficiais - SOMENTE SIDRA/IBGE e portais oficiais
export const dataSources: DataSource[] = [
  {
    id: 'fonte-1',
    sigla: 'SIDRA/Censo',
    nomeCompleto: 'Censo Demográfico 2022 - SIDRA',
    orgaoResponsavel: 'Instituto Brasileiro de Geografia e Estatística',
    urlAcesso: 'https://sidra.ibge.gov.br/pesquisa/censo-demografico/demografico-2022/universo-caracteristicas-da-populacao-e-dos-domicilios',
    tipoAcesso: 'sidra',
    descricao: 'Dados agregados do Universo do Censo 2022 (não microdados)',
    indicadoresDisponiveis: ['População por cor/raça (Tab. 9605)', 'Pessoas Indígenas (Tab. 9514/Brasil Indígena)', 'Quilombolas (Tab. 9578)'],
    desagregacoes: ['Raça/cor', 'Sexo', 'Idade', 'UF', 'Município'],
    periodicidade: 'Decenal',
    ultimaAtualizacao: '2023-12-01'
  },
  {
    id: 'fonte-2',
    sigla: 'SIDRA/PNAD',
    nomeCompleto: 'PNAD Contínua - Sistema IBGE de Recuperação Automática',
    orgaoResponsavel: 'IBGE',
    urlAcesso: 'https://sidra.ibge.gov.br/pesquisa/pnadct',
    tipoAcesso: 'api',
    descricao: 'Pesquisa amostral trimestral sobre mercado de trabalho e condições de vida',
    indicadoresDisponiveis: ['Desemprego (Tab. 6403)', 'Renda (Tab. 6807)', 'Escolarização (Tab. 7129)'],
    desagregacoes: ['Raça/cor', 'Sexo', 'Idade', 'UF', 'Escolaridade'],
    periodicidade: 'Trimestral',
    ultimaAtualizacao: '2025-09-01'
  },
  {
    id: 'fonte-3',
    sigla: 'RAIS',
    nomeCompleto: 'Relação Anual de Informações Sociais',
    orgaoResponsavel: 'Ministério do Trabalho e Emprego',
    urlAcesso: 'http://bi.mte.gov.br/bgcaged/',
    tipoAcesso: 'portal',
    descricao: 'Dados de vínculos empregatícios formais',
    indicadoresDisponiveis: ['Emprego formal', 'Remuneração média', 'Setores econômicos'],
    desagregacoes: ['Raça/cor', 'Sexo', 'Escolaridade', 'Idade', 'CBO'],
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024-12-01'
  },
  {
    id: 'fonte-4',
    sigla: 'CadÚnico',
    nomeCompleto: 'Cadastro Único para Programas Sociais',
    orgaoResponsavel: 'Ministério do Desenvolvimento Social',
    urlAcesso: 'https://aplicacoes.mds.gov.br/sagi/vis/data3/v.php',
    tipoAcesso: 'portal',
    descricao: 'Registro de famílias de baixa renda',
    indicadoresDisponiveis: ['Famílias cadastradas', 'Renda familiar', 'Beneficiários Bolsa Família'],
    desagregacoes: ['Raça/cor', 'Sexo', 'Idade', 'UF', 'Município', 'Quilombola', 'Indígena'],
    periodicidade: 'Mensal',
    ultimaAtualizacao: '2025-12-01'
  },
  {
    id: 'fonte-5',
    sigla: 'DataSUS',
    nomeCompleto: 'Departamento de Informática do SUS',
    orgaoResponsavel: 'Ministério da Saúde',
    urlAcesso: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/',
    tipoAcesso: 'portal',
    descricao: 'Sistemas de informação em saúde (SIM, SINASC, SINAN)',
    indicadoresDisponiveis: ['Mortalidade (SIM)', 'Nascidos Vivos (SINASC)', 'Agravos (SINAN)'],
    desagregacoes: ['Raça/cor', 'Sexo', 'Idade', 'UF', 'CID-10'],
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024-06-01'
  },
  {
    id: 'fonte-6',
    sigla: 'MUNIC',
    nomeCompleto: 'Pesquisa de Informações Básicas Municipais',
    orgaoResponsavel: 'IBGE',
    urlAcesso: 'https://www.ibge.gov.br/estatisticas/sociais/saude/10586-pesquisa-de-informacoes-basicas-municipais.html',
    tipoAcesso: 'download',
    descricao: 'Estrutura administrativa e políticas públicas dos municípios brasileiros',
    indicadoresDisponiveis: ['Órgãos de igualdade racial', 'Conselhos municipais', 'SINAPIR'],
    desagregacoes: ['UF', 'Município', 'Porte municipal'],
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024-12-01'
  },
  {
    id: 'fonte-7',
    sigla: 'SIOP',
    nomeCompleto: 'Sistema Integrado de Planejamento e Orçamento',
    orgaoResponsavel: 'Ministério do Planejamento e Orçamento',
    urlAcesso: 'https://www.siop.planejamento.gov.br/',
    tipoAcesso: 'portal',
    descricao: 'Execução orçamentária federal por programa e ação',
    indicadoresDisponiveis: ['LOA', 'Dotação atualizada', 'Empenho', 'Liquidação', 'Pagamento'],
    desagregacoes: ['Órgão', 'Programa', 'Ação', 'Natureza despesa'],
    periodicidade: 'Diária',
    ultimaAtualizacao: '2025-12-01'
  },
  {
    id: 'fonte-8',
    sigla: 'FBSP',
    nomeCompleto: 'Anuário Brasileiro de Segurança Pública',
    orgaoResponsavel: 'Fórum Brasileiro de Segurança Pública',
    urlAcesso: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    tipoAcesso: 'download',
    descricao: 'Estatísticas de violência e segurança pública',
    indicadoresDisponiveis: ['Homicídios', 'Letalidade policial', 'Encarceramento'],
    desagregacoes: ['Raça/cor', 'Sexo', 'Idade', 'UF'],
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024-07-01'
  },
  {
    id: 'fonte-9',
    sigla: 'FUNAI',
    nomeCompleto: 'Sistema de Terras Indígenas',
    orgaoResponsavel: 'FUNAI',
    urlAcesso: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas',
    tipoAcesso: 'portal',
    descricao: 'Status e informações sobre terras indígenas',
    indicadoresDisponiveis: ['TIs demarcadas', 'TIs homologadas', 'TIs em estudo'],
    desagregacoes: ['UF', 'Etnia', 'Fase do processo'],
    periodicidade: 'Contínua',
    ultimaAtualizacao: '2025-12-01'
  },
  {
    id: 'fonte-10',
    sigla: 'INCRA',
    nomeCompleto: 'Sistema de Territórios Quilombolas',
    orgaoResponsavel: 'INCRA',
    urlAcesso: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas',
    tipoAcesso: 'portal',
    descricao: 'Status e informações sobre territórios quilombolas',
    indicadoresDisponiveis: ['Territórios titulados', 'Em processo', 'Famílias beneficiadas'],
    desagregacoes: ['UF', 'Fase do processo'],
    periodicidade: 'Contínua',
    ultimaAtualizacao: '2025-12-01'
  }
];

// Seções do Common Core Document
export const commonCoreSections: CommonCoreSection[] = [
  {
    id: 'ccd-1',
    numero: 'I.A',
    titulo: 'Características demográficas, econômicas, sociais e culturais',
    tituloIngles: 'Demographic, economic, social and cultural characteristics',
    statusAtualizacao: 'atualizado',
    ultimaVersao: 2022,
    periodoCobertura: '2018-2025',
    subsecoes: [
      {
        id: 'ccd-1-1',
        numero: 'I.A.i',
        titulo: 'Características demográficas',
        conteudoAtual: 'Dados do Censo 2022 via SIDRA',
        indicadoresNecessarios: ['População total 2022', 'Distribuição por raça/cor 2022', 'Taxa de crescimento'],
        fontesNecessarias: ['SIDRA Tab. 9605', 'SIDRA Tab. 9674'],
        statusAtualizacao: 'atualizado',
        notas: 'Atualizado com dados do Universo do Censo 2022'
      },
      {
        id: 'ccd-1-2',
        numero: 'I.A.ii',
        titulo: 'Características econômicas',
        conteudoAtual: 'PIB e indicadores macroeconômicos até 2025',
        indicadoresNecessarios: ['PIB 2018-2025', 'Renda per capita', 'Gini por raça'],
        fontesNecessarias: ['IBGE', 'BCB', 'IPEA'],
        statusAtualizacao: 'parcial'
      }
    ]
  },
  {
    id: 'ccd-2',
    numero: 'I.B',
    titulo: 'Estrutura constitucional, política e legal',
    tituloIngles: 'Constitutional, political and legal structure',
    statusAtualizacao: 'parcial',
    ultimaVersao: 2020,
    periodoCobertura: '1988-2025',
    subsecoes: [
      {
        id: 'ccd-2-1',
        numero: 'I.B.i',
        titulo: 'Sistema de governo',
        conteudoAtual: 'Estrutura federativa e sistema de governo',
        indicadoresNecessarios: ['Composição atual do governo', 'Estrutura ministerial 2023-2025'],
        fontesNecessarias: ['Decreto de estrutura regimental'],
        statusAtualizacao: 'parcial'
      }
    ]
  }
];

// Grupos focais específicos - DADOS SIDRA/IBGE AUDITADOS
export const focalGroups: FocalGroup[] = [
  {
    id: 'grupo-1',
    nome: 'Quilombolas',
    populacao: 1330186, // SIDRA Tabela 9605
    fontePopulacao: 'SIDRA/IBGE - Censo 2022 - Tabela 9605',
    indicadoresEspecificos: ['Territórios titulados', 'Acesso a serviços básicos', 'Renda média'],
    politicasEspecificas: ['PNGTAQ (Decreto 11.786/2023)', 'Titulação de territórios'],
    observacoesONU: ['47', '48', '49']
  },
  {
    id: 'grupo-2',
    nome: 'Povos Indígenas',
    // DADO CORRETO: IBGE Censo 2022 — Cor/Raça Indígena (SIDRA 9605): 1.227.642
    populacao: 1227642,
    fontePopulacao: 'IBGE - Censo 2022 - Cor/Raça Indígena (SIDRA 9605)',
    indicadoresEspecificos: ['Terras demarcadas', 'Saúde indígena', 'Educação bilíngue'],
    politicasEspecificas: ['Demarcação de terras', 'SESAI'],
    observacoesONU: ['50', '51', '52', '53']
  },
  {
    id: 'grupo-3',
    nome: 'Ciganos/Roma',
    populacao: undefined,
    fontePopulacao: 'Lacuna crítica - Censo 2022 não incluiu pergunta específica (§54-55 CERD)',
    indicadoresEspecificos: [],
    politicasEspecificas: ['Política Nacional para Ciganos (em elaboração)'],
    observacoesONU: ['54', '55']
  },
  {
    id: 'grupo-4',
    nome: 'Juventude Negra (15-29 anos)',
    populacao: 25800000, // Estimativa: Tab. 9605 (cor/raça) × Tab. 7113 (idade)
    fontePopulacao: 'Estimativa: IBGE Censo 2022 (Tab. 9605 × Tab. 7113) — cálculo proporcional',
    indicadoresEspecificos: ['Homicídios 12-29 anos', 'Desemprego juvenil', 'Evasão escolar'],
    politicasEspecificas: ['Programa Juventude Negra Viva (Decreto 11.956/2024)', 'Plano Juventude Viva'],
    observacoesONU: ['32', '33', '34']
  },
  {
    id: 'grupo-5',
    nome: 'População Negra (Preta + Parda)',
    // SIDRA Tabela 9605: 20.656.458 (preta) + 92.083.286 (parda) = 112.739.744
    populacao: 112739744,
    fontePopulacao: 'SIDRA/IBGE - Censo 2022 - Tabela 9605',
    indicadoresEspecificos: ['IDH por raça', 'Renda média', 'Anos de estudo'],
    politicasEspecificas: ['Estatuto da Igualdade Racial', 'Lei de Cotas'],
    observacoesONU: ['12', '14', '15', '17', '19', '23', '28', '32']
  }
];

// Dashboard Stats - DINÂMICO (será sobrescrito pelo hook useDashboardStats)
export const dashboardStats: DashboardStats = {
  totalRecomendacoes: 68,
  recomendacoesCumpridas: 12,
  recomendacoesParciais: 28,
  recomendacoesNaoCumpridas: 24,
  metasPlanoTrabalho: 4,
  metasConcluidas: 0,
  indicadoresAtualizados: 45,
  indicadoresDesatualizados: 23,
  ultimaAtualizacao: new Date().toISOString().split('T')[0]
};

// Indicadores estatísticos - DADOS SIDRA/IBGE
export const statisticalIndicators: StatisticalIndicator[] = [
  {
    id: 'ind-1',
    categoria: 'demografico',
    nome: 'População por raça/cor',
    fonte: 'SIDRA/IBGE - Censo 2022 - Tabela 9514',
    // VALOR CORRETO: 203.080.756 (Tabela 9514)
    // URL: https://sidra.ibge.gov.br/Tabela/9514
    valorAtual: 203080756,
    unidade: 'habitantes',
    ano: 2022,
    desagregacoes: [
      {
        tipo: 'raca',
        valores: [
          // Tabela 9605: https://sidra.ibge.gov.br/Tabela/9605
          { categoria: 'Branca', valor: 88252121 },
          { categoria: 'Preta', valor: 20656458 },
          { categoria: 'Parda', valor: 92083286 },
          { categoria: 'Amarela', valor: 850130 },
          { categoria: 'Indígena (cor/raça)', valor: 1227642 }
        ]
      }
    ],
    tendencia: 'estavel'
  },
  {
    id: 'ind-2',
    categoria: 'trabalho',
    nome: 'Taxa de desemprego',
    fonte: 'SIDRA/IBGE - PNAD Contínua 4º tri 2024 - Tabela 6403',
    valorAtual: 6.2,
    unidade: '%',
    ano: 2024,
    desagregacoes: [
      {
        tipo: 'raca',
        valores: [
          { categoria: 'Branca', valor: 5.0 },
          { categoria: 'Preta', valor: 8.5 },
          { categoria: 'Parda', valor: 7.3 }
        ]
      }
    ],
    tendencia: 'decrescente'
  },
  {
    id: 'ind-3',
    categoria: 'seguranca',
    nome: 'Taxa de homicídios (por 100 mil)',
    fonte: 'Fórum Brasileiro de Segurança Pública - Anuário 2024',
    valorAtual: 21.7,
    unidade: 'por 100 mil',
    ano: 2023,
    desagregacoes: [
      {
        tipo: 'raca',
        valores: [
          { categoria: 'Negros', valor: 30.8 },
          { categoria: 'Não-negros', valor: 11.2 }
        ]
      },
      {
        tipo: 'idade',
        valores: [
          { categoria: '15-29 anos', valor: 46.2 },
          { categoria: '30+ anos', valor: 11.5 }
        ]
      }
    ],
    tendencia: 'decrescente'
  }
];

// Observações da ONU - conectadas ao banco
export const unObservations: UNObservation[] = [
  {
    id: 'obs-1',
    documento: 'CERD/C/BRA/CO/18-20',
    dataDocumento: '2022-08-30',
    paragrafo: '28',
    tipo: 'preocupacao',
    tema: 'Discurso de ódio',
    texto: 'O Comitê está preocupado com relatos de declarações racistas feitas por autoridades públicas, incluindo políticos, que incitam discriminação e violência contra afro-brasileiros e povos indígenas.',
    respostaBrasil: 'O governo brasileiro reorientou seu discurso oficial, reconhecendo o racismo estrutural e adotando postura ativa de valorização da diversidade étnico-racial.',
    statusAtendimento: 'parcialmente_cumprido',
    acoesPendentes: ['Mecanismos de responsabilização de autoridades']
  },
  {
    id: 'obs-2',
    documento: 'CERD/C/BRA/CO/18-20',
    dataDocumento: '2022-08-30',
    paragrafo: '14c',
    tipo: 'preocupacao',
    tema: 'Desmonte institucional',
    texto: 'O Comitê está preocupado com o desmantelamento das estruturas institucionais de promoção da igualdade racial.',
    respostaBrasil: 'Recriação do Ministério da Igualdade Racial (MIR) em 2023 e retomada de conselhos participativos.',
    statusAtendimento: 'cumprido',
    acoesPendentes: []
  }
];

// Dados orçamentários - exemplo
export const budgetData: BudgetData[] = [
  {
    id: 'orc-1',
    programa: 'Promoção da Igualdade Racial',
    acao: 'Políticas de Promoção da Igualdade Racial',
    esfera: 'federal',
    ano: 2024,
    valorAutorizado: 89000000,
    valorEmpenhado: 72000000,
    valorLiquidado: 65000000,
    valorPago: 58000000,
    fonteRecurso: 'Tesouro',
    politicaRacial: true,
    categoriaRacial: 'Geral'
  }
];
