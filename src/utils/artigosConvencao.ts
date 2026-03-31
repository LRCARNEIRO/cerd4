/**
 * Mapeamento central dos 7 primeiros artigos da Convenção ICERD
 * como eixo organizador fundamental do projeto de pesquisa.
 *
 * Toda estatística, dado orçamentário ou instrumento normativo
 * deve servir à atualização de avanços/retrocessos nos compromissos
 * firmados pelo Estado brasileiro em cada artigo.
 */

import type { ThematicAxis } from '@/hooks/useLacunasData';

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
  legislacao_justica:        ['I', 'II', 'VI'],
  politicas_institucionais:  ['II'],
  seguranca_publica:         ['V', 'VI'],      // V(b) segurança pessoal + VI proteção judicial
  saude:                     ['V'],             // V(e)(iv)
  educacao:                  ['V', 'VII'],      // V(e)(v) + VII ensino/educação
  trabalho_renda:            ['V'],             // V(e)(i)
  terra_territorio:          ['III', 'V'],      // III segregação + V(e)(iii) moradia + V(d) circulação
  cultura_patrimonio:        ['V', 'VII'],      // V(e)(vi) + VII cultura
  participacao_social:       ['V'],             // V(c) direitos políticos
  dados_estatisticas:        ['I', 'II'],       // Base para definição e obrigações
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
 * Infer ICERD articles for a budget record based on explicit tags, eixo_tematico, or keywords.
 */
export function inferArtigosOrcamento(r: { artigos_convencao?: string[] | null; eixo_tematico?: string | null; programa: string; orgao: string; descritivo?: string | null }): ArtigoConvencao[] {
  const explicit = (r.artigos_convencao || []).filter(a => ['I','II','III','IV','V','VI','VII'].includes(a)) as ArtigoConvencao[];
  if (explicit.length > 0) return explicit;

  const eixo = r.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS | undefined;
  if (eixo && EIXO_PARA_ARTIGOS[eixo]) return EIXO_PARA_ARTIGOS[eixo];

  const texto = [r.programa, r.orgao, r.descritivo].filter(Boolean).join(' ').toLowerCase();
  const arts: ArtigoConvencao[] = [];
  if (texto.match(/educa|escola|ensino|formação|formacao|lei 10.639/)) arts.push('V', 'VII');
  if (texto.match(/saúde|saude|sesai|sanitár|sanitar/)) arts.push('V');
  if (texto.match(/trabalho|emprego|renda|profissional/)) arts.push('V');
  if (texto.match(/terra|territór|territor|quilomb|funai|incra|demarcaç|demarcac|indígena|indigena/)) arts.push('III', 'V');
  if (texto.match(/justiça|justica|judiciár|judiciar|proteç|protecao|reparaç|reparac|indeniza|direitos humanos|socioeducativ/)) arts.push('VI');
  if (texto.match(/cultur|patrimôn|patrimon|capoeira|candomblé|candomble|matriz africana/)) arts.push('V', 'VII');
  if (texto.match(/igualdade|discrimin|racis|enfrentamento ao racismo/)) arts.push('I', 'II');
  if (texto.match(/ódio|odio|propaganda racis|extremism|neonazi|supremaci|incitaç|incitac|tipificaç|tipificac|injúria racial|injuria racial|crime.*racial|discurso.*ódio|discurso.*odio/)) arts.push('IV');
  if (texto.match(/segurança|seguranca|polícia|policia|homicíd|homicid|violência|violencia|letal/)) arts.push('V', 'VI');
  if (texto.match(/polític|politica|institucional|ação afirmativa|acao afirmativa|fortalecimento institucional/)) arts.push('II');
  if (texto.match(/mulher|gênero|genero/)) arts.push('V');
  if (texto.match(/idoso|pessoa idosa/)) arts.push('V');
  if (texto.match(/povos indígenas|povos indigenas|etnodesenvolvimento|pluriétnic|plurietnic/)) arts.push('III', 'V');
  return [...new Set(arts)];
}

/**
 * Infere artigos ICERD para um documento normativo com base em título,
 * categoria, eixos temáticos e recomendações associadas.
 */
export function inferArtigosDocumentoNormativo(doc: {
  titulo: string;
  categoria?: string;
  secoes_impactadas?: string[] | null;
  recomendacoes_impactadas?: string[] | null;
}): ArtigoConvencao[] {
  const arts = new Set<ArtigoConvencao>();

  // 1. Mapeamento por eixos temáticos (secoes_impactadas)
  (doc.secoes_impactadas || []).forEach(eixo => {
    const mapped = EIXO_PARA_ARTIGOS[eixo as keyof typeof EIXO_PARA_ARTIGOS];
    if (mapped) mapped.forEach(a => arts.add(a));
  });

  // 2. Mapeamento por categoria
  if (doc.categoria === 'legislacao') { arts.add('I'); arts.add('II'); }
  if (doc.categoria === 'institucional') { arts.add('II'); }
  if (doc.categoria === 'politicas') { arts.add('II'); arts.add('V'); }
  if (doc.categoria === 'jurisprudencia') { arts.add('VI'); }

  // 3. Mapeamento por palavras-chave no título
  const t = doc.titulo.toLowerCase();
  if (t.match(/educa|escola|ensino|formação|formacao|lei 10.639|lei 11.645/)) { arts.add('V'); arts.add('VII'); }
  if (t.match(/saúde|saude|sus|sanitár|sanitar|sesai/)) arts.add('V');
  if (t.match(/trabalho|emprego|renda|profissional|clt/)) arts.add('V');
  if (t.match(/terra|territór|territor|quilomb|funai|incra|demarcaç|demarcac|indígena|indigena/)) { arts.add('III'); arts.add('V'); }
  if (t.match(/justiça|justica|judiciár|judiciar|proteç|protecao|reparaç|reparac|indeniza|tribunal|stf|stj|adpf/)) arts.add('VI');
  if (t.match(/cultur|patrimôn|patrimon|capoeira|candomblé|candomble|matriz africana/)) { arts.add('V'); arts.add('VII'); }
  if (t.match(/igualdade|discrimin|racis|racismo|antirrac|preconceito|injúria|injuria/)) { arts.add('I'); arts.add('II'); }
  if (t.match(/segurança|seguranca|polícia|policia|homicíd|homicid|violência|violencia|letal|genocíd|genocid/)) { arts.add('V'); arts.add('VI'); }
  if (t.match(/polític|politica|institucional|ação afirmativa|acao afirmativa|cota|conselho|comissão|comissao|órgão|orgao/)) arts.add('II');
  if (t.match(/ódio|odio|propaganda|extremism|neonazi|supremaci/)) arts.add('IV');
  if (t.match(/segregaç|segregac|apartheid|favela|periferi/)) arts.add('III');
  if (t.match(/moradia|habitaç|habitac|urban/)) arts.add('V');
  if (t.match(/participaç|participac|voto|eleitor|representaç|representac/)) arts.add('V');
  if (t.match(/mulher|gênero|genero|lgbtqia|interseccion/)) arts.add('V');
  if (t.match(/dado|estatístic|estatistic|censo|ibge|pesquisa|indicador/)) { arts.add('I'); arts.add('II'); }
  if (t.match(/cigano|romani|povo de terreiro|comunidade tradicional/)) { arts.add('II'); arts.add('V'); }

  // If no articles found, default to II (general state obligations)
  if (arts.size === 0) arts.add('II');

  return [...arts].sort();
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
