/**
 * Mapeamento central dos 7 primeiros artigos da Convenção ICERD
 * como eixo organizador fundamental do projeto de pesquisa.
 *
 * Toda estatística, dado orçamentário ou instrumento normativo
 * deve servir à atualização de avanços/retrocessos nos compromissos
 * firmados pelo Estado brasileiro em cada artigo.
 */

import type { ThematicAxis } from '@/hooks/useLacunasData';
import type { MatchQuality, ArtigoMatch } from '@/utils/inferArtigosIndicador';

/** Artigo da Convenção ICERD (I-VII) */
export type ArtigoConvencao = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII';

export interface ArtigoDefinicao {
  numero: ArtigoConvencao;
  titulo: string;
  tituloCompleto: string;
  descricao: string;
  temas: string[];
  /** Cor semântica para UI */
  cor: string;
}

/**
 * Definições canônicas dos 7 artigos da Convenção ICERD.
 */
export const ARTIGOS_CONVENCAO: ArtigoDefinicao[] = [
  {
    numero: 'I',
    titulo: 'Definição de Discriminação Racial',
    tituloCompleto: 'Art. I — Definição de discriminação racial',
    descricao: 'Define o conceito de discriminação racial como distinção, exclusão, restrição ou preferência baseada em raça, cor, descendência ou origem nacional/étnica que anule ou prejudique o reconhecimento, gozo ou exercício de direitos humanos.',
    temas: ['Conceituação', 'Alcance normativo', 'Discriminação direta e indireta', 'Interseccionalidade'],
    cor: 'hsl(var(--chart-1))',
  },
  {
    numero: 'II',
    titulo: 'Obrigações dos Estados',
    tituloCompleto: 'Art. II — Obrigações dos Estados de eliminar a discriminação',
    descricao: 'Estabelece as obrigações dos Estados-parte de condenar a discriminação racial e adotar medidas de política pública para eliminá-la, incluindo revisão de legislação, instituições e práticas.',
    temas: ['Políticas públicas', 'Marco institucional', 'Ações afirmativas', 'Legislação antirracista'],
    cor: 'hsl(var(--chart-2))',
  },
  {
    numero: 'III',
    titulo: 'Segregação e Apartheid',
    tituloCompleto: 'Art. III — Condenação da segregação racial e do apartheid',
    descricao: 'Os Estados comprometem-se a prevenir, proibir e eliminar práticas de segregação racial e apartheid em seus territórios.',
    temas: ['Segregação espacial', 'Favelas', 'Periferias', 'Territórios quilombolas', 'Territórios indígenas'],
    cor: 'hsl(var(--chart-3))',
  },
  {
    numero: 'IV',
    titulo: 'Propaganda e Organizações Racistas',
    tituloCompleto: 'Art. IV — Criminalização de propaganda e organizações racistas',
    descricao: 'Obriga a criminalizar a difusão de ideias baseadas em superioridade ou ódio racial, a incitação à discriminação racial, e a proibição de organizações e atividades de propaganda racista.',
    temas: ['Discurso de ódio', 'Crimes de ódio', 'Organizações racistas', 'Internet e mídias sociais'],
    cor: 'hsl(var(--chart-4))',
  },
  {
    numero: 'V',
    titulo: 'Igualdade de Direitos',
    tituloCompleto: 'Art. V — Igualdade em direitos civis, políticos, econômicos, sociais e culturais',
    descricao: 'Garante igualdade no gozo dos direitos civis e políticos (segurança, participação, liberdade de circulação) e DESCA (trabalho, moradia, saúde, educação, cultura).',
    temas: [
      'V(a) Justiça e tribunais',
      'V(b) Segurança pessoal',
      'V(c) Direitos políticos',
      'V(d) Direitos civis (circulação, nacionalidade, casamento, propriedade, herança, pensamento, reunião, opinião)',
      'V(e)(i) Trabalho',
      'V(e)(ii) Sindicalização',
      'V(e)(iii) Moradia',
      'V(e)(iv) Saúde',
      'V(e)(v) Educação',
      'V(e)(vi) Cultura',
      'V(f) Acesso a serviços públicos',
    ],
    cor: 'hsl(var(--chart-5))',
  },
  {
    numero: 'VI',
    titulo: 'Proteção Judicial',
    tituloCompleto: 'Art. VI — Proteção e remédios jurídicos efetivos',
    descricao: 'Garante proteção judicial efetiva e reparação adequada contra atos de discriminação racial que violem direitos humanos.',
    temas: ['Acesso à justiça', 'Reparação', 'Proteção judicial', 'Justiça criminal'],
    cor: 'hsl(var(--chart-1))',
  },
  {
    numero: 'VII',
    titulo: 'Ensino, Educação e Cultura',
    tituloCompleto: 'Art. VII — Medidas em ensino, educação, cultura e informação',
    descricao: 'Os Estados comprometem-se a adotar medidas imediatas e eficazes, particularmente em ensino, educação, cultura e informação, para combater preconceitos e promover compreensão e tolerância.',
    temas: ['Currículo escolar', 'Formação docente', 'Cultura antirracista', 'Mídia', 'Lei 10.639/2003'],
    cor: 'hsl(var(--chart-2))',
  },
];

/**
 * Mapeamento de eixos temáticos existentes para artigos da Convenção.
 * Cada eixo pode mapear para 1+ artigos.
 */
export const EIXO_PARA_ARTIGOS: Record<ThematicAxis, ArtigoConvencao[]> = {
  legislacao_justica:        ['I', 'II', 'VI'],       // IV removido — Art. IV só por keywords específicas de discurso de ódio
  politicas_institucionais:  ['II'],
  seguranca_publica:         ['V', 'VI'],             // IV removido — segurança pública ≠ propaganda racista
  saude:                     ['V'],                   // V(e)(iv)
  educacao:                  ['V', 'VII'],             // V(e)(v) + VII ensino/educação
  trabalho_renda:            ['V'],                   // V(e)(i)
  terra_territorio:          ['III', 'V'],             // III segregação + V(e)(iii) moradia + V(d) circulação
  cultura_patrimonio:        ['V', 'VII'],             // V(e)(vi) + VII cultura
  participacao_social:       ['V'],                   // V(c) direitos políticos
  dados_estatisticas:        ['I', 'II'],             // Base para definição e obrigações
};

/**
 * Retorna os artigos da Convenção para um dado eixo temático.
 */
export function getArtigosParaEixo(eixo: ThematicAxis): ArtigoConvencao[] {
  return EIXO_PARA_ARTIGOS[eixo] || [];
}

/**
 * Retorna a definição completa de um artigo.
 */
export function getArtigoDefinicao(artigo: ArtigoConvencao): ArtigoDefinicao | undefined {
  return ARTIGOS_CONVENCAO.find(a => a.numero === artigo);
}

/**
 * Retorna todos os eixos temáticos vinculados a um artigo.
 */
export function getEixosParaArtigo(artigo: ArtigoConvencao): ThematicAxis[] {
  return Object.entries(EIXO_PARA_ARTIGOS)
    .filter(([, artigos]) => artigos.includes(artigo))
    .map(([eixo]) => eixo as ThematicAxis);
}

/**
 * Siglas dos 22 Documentos Balizadores.
 * REGRA DE OURO: Somente estes documentos podem gerar recomendações/parâmetros de pesquisa.
 */
export const DOCUMENTOS_BALIZADORES_SIGLAS: readonly string[] = [
  'ICERD',
  'CERD/C/BRA/CO/18-20',
  'CERD/C/BRA/FCO/18-20',
  'DDPA',
  'RGs CERD',
  'CERD/C/2007/1',
  'HRI/CORE/BRA/2020',
  'CERD/C/BRA/18-20',
  'HRC Compilation',
  'CERD Report 2025',
  'Quadro Monitoramento',
  'Cruzamento RGs/Durban',
  'PT CERD',
  'Índice CERD CO',
  'CCD Atualização',
  'III Relatório Resumo',
  'FCO Anotações',
  'Guidelines Anotações',
  'HRC National Report',
  'RG Guidelines',
  'A/HRC/WG.6/41/BRA/2',
  'Relatório Sombra 2022',
] as const;

/**
 * Infer ICERD articles for a budget record — with match quality.
 */
export function inferArtigosOrcamentoWithQuality(r: { artigos_convencao?: string[] | null; eixo_tematico?: string | null; programa: string; orgao: string; descritivo?: string | null }): ArtigoMatch[] {
  const explicit = (r.artigos_convencao || []).filter(a => ['I','II','III','IV','V','VI','VII'].includes(a)) as ArtigoConvencao[];
  if (explicit.length > 0) return explicit.map(a => ({ artigo: a, quality: 'explicit' as MatchQuality, weight: 1.0 }));

  const matches = new Map<ArtigoConvencao, ArtigoMatch>();
  
  // Eixo → peso 0.5
  const eixo = r.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS | undefined;
  if (eixo && EIXO_PARA_ARTIGOS[eixo]) {
    EIXO_PARA_ARTIGOS[eixo].forEach(a => {
      matches.set(a, { artigo: a, quality: 'eixo', weight: 0.5 });
    });
  }

  // Keywords → peso 1.0
  const texto = [r.programa, r.orgao, r.descritivo].filter(Boolean).join(' ').toLowerCase();
  const keywordRules: [RegExp, ArtigoConvencao[]][] = [
    [/educa|escola|ensino|formação|formacao|lei 10.639/, ['V', 'VII']],
    [/saúde|saude|sesai|sanitár|sanitar/, ['V']],
    [/trabalho|emprego|renda|profissional/, ['V']],
    [/terra|territór|territor|quilomb|funai|incra|demarcaç|demarcac|indígena|indigena/, ['III', 'V']],
    [/justiça|justica|judiciár|judiciar|proteç|protecao|reparaç|reparac|indeniza|direitos humanos|socioeducativ/, ['VI']],
    [/cultur|patrimôn|patrimon|capoeira|candomblé|candomble|matriz africana/, ['V', 'VII']],
    [/igualdade|discrimin|racis|enfrentamento ao racismo/, ['I', 'II']],
    [/ódio|odio|propaganda racis|extremism|neonazi|supremaci|incitaç|incitac|tipificaç|tipificac|injúria racial|injuria racial|crime.*racial|discurso.*ódio|discurso.*odio/, ['IV']],
    [/segurança|seguranca|polícia|policia|homicíd|homicid|violência|violencia|letal/, ['V', 'VI']],
    [/polític|politica|institucional|ação afirmativa|acao afirmativa|fortalecimento institucional/, ['II']],
    [/mulher|gênero|genero/, ['V']],
    [/idoso|pessoa idosa/, ['V']],
    [/povos indígenas|povos indigenas|etnodesenvolvimento|pluriétnic|plurietnic/, ['III', 'V']],
  ];
  for (const [regex, arts] of keywordRules) {
    if (regex.test(texto)) {
      arts.forEach(a => matches.set(a, { artigo: a, quality: 'keyword', weight: 1.0 }));
    }
  }
  return [...matches.values()];
}

/**
 * Infer ICERD articles for a budget record (compatibilidade).
 */
export function inferArtigosOrcamento(r: { artigos_convencao?: string[] | null; eixo_tematico?: string | null; programa: string; orgao: string; descritivo?: string | null }): ArtigoConvencao[] {
  return inferArtigosOrcamentoWithQuality(r).map(m => m.artigo);
}

/**
 * Infere artigos ICERD para um documento normativo — com match quality.
 */
export function inferArtigosDocNormativoWithQuality(doc: {
  titulo: string;
  categoria?: string;
  secoes_impactadas?: string[] | null;
  recomendacoes_impactadas?: string[] | null;
}): ArtigoMatch[] {
  const matches = new Map<ArtigoConvencao, ArtigoMatch>();

  // 1. Eixos temáticos → peso 0.5
  (doc.secoes_impactadas || []).forEach(eixo => {
    const mapped = EIXO_PARA_ARTIGOS[eixo as keyof typeof EIXO_PARA_ARTIGOS];
    if (mapped) mapped.forEach(a => {
      if (!matches.has(a)) matches.set(a, { artigo: a, quality: 'eixo', weight: 0.5 });
    });
  });

  // 2. Categoria → peso 0.5 (eixo-level)
  const catMap: Record<string, ArtigoConvencao[]> = {
    legislacao: ['I', 'II'], institucional: ['II'], politicas: ['II', 'V'], jurisprudencia: ['VI'],
  };
  (catMap[doc.categoria || ''] || []).forEach(a => {
    if (!matches.has(a)) matches.set(a, { artigo: a, quality: 'eixo', weight: 0.5 });
  });

  // 3. Keywords no título → peso 1.0 (sobrescreve eixo)
  const t = doc.titulo.toLowerCase();
  const keywordRules: [RegExp, ArtigoConvencao[]][] = [
    [/educa|escola|ensino|formação|formacao|lei 10.639|lei 11.645/, ['V', 'VII']],
    [/saúde|saude|sus|sanitár|sanitar|sesai/, ['V']],
    [/trabalho|emprego|renda|profissional|clt/, ['V']],
    [/terra|territór|territor|quilomb|funai|incra|demarcaç|demarcac|indígena|indigena/, ['III', 'V']],
    [/justiça|justica|judiciár|judiciar|proteç|protecao|reparaç|reparac|indeniza|tribunal|stf|stj|adpf/, ['VI']],
    [/cultur|patrimôn|patrimon|capoeira|candomblé|candomble|matriz africana/, ['V', 'VII']],
    [/igualdade|discrimin|racis|racismo|antirrac|preconceito|injúria|injuria/, ['I', 'II']],
    [/segurança|seguranca|polícia|policia|homicíd|homicid|violência|violencia|letal|genocíd|genocid/, ['V', 'VI']],
    [/polític|politica|institucional|ação afirmativa|acao afirmativa|cota|conselho|comissão|comissao|órgão|orgao/, ['II']],
    [/ódio|odio|propaganda|extremism|neonazi|supremaci/, ['IV']],
    [/segregaç|segregac|apartheid|favela|periferi/, ['III']],
    [/moradia|habitaç|habitac|urban/, ['V']],
    [/participaç|participac|voto|eleitor|representaç|representac/, ['V']],
    [/mulher|gênero|genero|lgbtqia|interseccion/, ['V']],
    [/dado|estatístic|estatistic|censo|ibge|pesquisa|indicador/, ['I', 'II']],
    [/cigano|romani|povo de terreiro|comunidade tradicional/, ['II', 'V']],
  ];
  for (const [regex, arts] of keywordRules) {
    if (regex.test(t)) {
      arts.forEach(a => matches.set(a, { artigo: a, quality: 'keyword', weight: 1.0 }));
    }
  }

  if (matches.size === 0) matches.set('II', { artigo: 'II', quality: 'eixo', weight: 0.5 });
  return [...matches.values()];
}

/**
 * Infere artigos ICERD para um documento normativo (compatibilidade).
 */
export function inferArtigosDocumentoNormativo(doc: {
  titulo: string;
  categoria?: string;
  secoes_impactadas?: string[] | null;
  recomendacoes_impactadas?: string[] | null;
}): ArtigoConvencao[] {
  return inferArtigosDocNormativoWithQuality(doc).map(m => m.artigo).sort();
}

/**
 * Valida se um documento é Balizador (regra de ouro normativa).
 * Retorna true se a sigla consta entre os 22 documentos oficiais.
 */
export function isDocumentoBalizador(sigla: string): boolean {
  return DOCUMENTOS_BALIZADORES_SIGLAS.includes(sigla);
}

/**
 * Valida múltiplas fontes — retorna as que NÃO são balizadoras.
 */
export function getFontesNaoBalizadoras(siglas: string[]): string[] {
  return siglas.filter(s => !isDocumentoBalizador(s));
}
