import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Layers, Search, Building2, Heart, FileText, ShieldAlert, TrendingUp, Database as DatabaseIcon, Filter, Wrench } from 'lucide-react';
import { ExtraorcamentarioSection } from './ExtraorcamentarioSection';

/* ── Dados das camadas e ações ── */

const CAMADA_1_PROGRAMAS_HISTORICOS = [
  { codigo: '2034', nome: 'Promoção da Igualdade Racial e Superação do Racismo', orgao: 'SEPPIR', ppa: '2016–2019' },
  { codigo: '5034', nome: 'Igualdade Racial e Superação do Racismo (guarda-chuva MDHC)', orgao: 'MDHC', ppa: '2020–2023', nota: 'Filtrado por keywords raciais' },
  { codigo: '0617', nome: 'Proteção e Promoção dos Direitos dos Povos Indígenas', orgao: 'MPI', ppa: '2020–2023' },
  { codigo: '2065', nome: 'Proteção e Promoção dos Direitos dos Povos Indígenas', orgao: 'MPI', ppa: '2012–2019' },
  { codigo: '0153', nome: 'Promoção e Defesa dos Direitos da Criança e do Adolescente', orgao: 'MDHC', ppa: '2004+' },
  { codigo: '5802', nome: 'Direitos dos Povos Quilombolas e Ciganos', orgao: 'MIR', ppa: '2024–2027' },
  { codigo: '5803', nome: 'Juventude Negra Viva', orgao: 'MIR', ppa: '2024–2027' },
  { codigo: '5804', nome: 'Igualdade Étnico-Racial e Superação do Racismo', orgao: 'MIR', ppa: '2024–2027' },
  { codigo: '5136', nome: 'Proteção e Promoção dos Direitos dos Povos Indígenas', orgao: 'MPI', ppa: '2024–2027' },
];

const CAMADA_1_AGENDA_TRANSVERSAL = [
  { codigo: '1617', nome: 'Demarcação e Gestão dos Territórios Indígenas', orgao: 'MPI', agenda: 'Indígena', tipo: 'focal' },
  { codigo: '1189', nome: 'Bioeconomia para um Novo Ciclo de Prosperidade', orgao: 'MMA', agenda: 'Racial', tipo: 'universal' },
  { codigo: '2224', nome: 'Planejamento e Orçamento para o Desenvolvimento Sustentável', orgao: 'MPO', agenda: 'Ambas', tipo: 'universal' },
  { codigo: '2301', nome: 'Transformação do Estado para a Cidadania', orgao: 'MGI', agenda: 'Racial', tipo: 'universal' },
  { codigo: '2304', nome: 'CT&I para o Desenvolvimento Social', orgao: 'MCTI', agenda: 'Racial', tipo: 'universal' },
  { codigo: '2308', nome: 'Consolidação do SNCTI', orgao: 'MCTI', agenda: 'Ambas', tipo: 'universal' },
  { codigo: '2310', nome: 'Promoção do Trabalho Decente, Emprego e Renda', orgao: 'MTE', agenda: 'Racial', tipo: 'universal' },
  { codigo: '2316', nome: 'Relações Internacionais e Assistência a Brasileiros', orgao: 'MRE', agenda: 'Ambas', tipo: 'universal' },
  { codigo: '5111', nome: 'Educação Básica Democrática, com Qualidade e Equidade', orgao: 'MEC', agenda: 'Ambas', tipo: 'universal' },
  { codigo: '5121', nome: 'Gestão, Trabalho, Educação e Transformação Digital na Saúde', orgao: 'MS', agenda: 'Racial', tipo: 'universal' },
  { codigo: '5123', nome: 'Vigilância em Saúde e Ambiente', orgao: 'MS', agenda: 'Indígena', tipo: 'universal' },
  { codigo: '5126', nome: 'Esporte para a Vida', orgao: 'ME', agenda: 'Indígena', tipo: 'universal' },
  { codigo: '5128', nome: 'Bolsa Família', orgao: 'MDS', agenda: 'Indígena', tipo: 'universal' },
  { codigo: '5129', nome: 'Inclusão de Famílias em Situação de Vulnerabilidade', orgao: 'MDS', agenda: 'Indígena', tipo: 'universal' },
];

const CAMADA_2_DESCRICAO = {
  subfuncao: '422',
  nome: 'Direitos Individuais, Coletivos e Difusos',
  logica: 'Captura ações em órgãos transversais não cobertos pelas demais camadas, validadas por palavras-chave raciais/étnicas.',
};

const CAMADA_3_ORGAOS = [
  { codigo: '67000', sigla: 'MIR', nome: 'Ministério da Igualdade Racial', desde: '2023' },
  { codigo: '92000', sigla: 'MPI', nome: 'Ministério dos Povos Indígenas', desde: '2023' },
];

const CAMADA_4_SESAI = [
  { codigo: '20YP', nome: 'Promoção, Proteção e Recuperação da Saúde Indígena', orgao: 'SESAI/MS' },
  { codigo: '7684', nome: 'Saneamento Básico em Aldeias Indígenas', orgao: 'SESAI/MS' },
];

const PASSO_5_DOTACAO = {
  descricao: 'Complementação de dotação (inicial e autorizada) via arquivos ZIP/CSV do Portal de Dados Abertos (LOA).',
  edgeFunction: 'ingest-dotacao-loa',
};

const PASSO_6_KEYWORD_FIRST = {
  descricao: 'Varredura ampla em ~40 subfunções orçamentárias usando palavras-chave raciais/étnicas como critério primário de seleção.',
  edgeFunction: 'ingest-federal-keywords',
  keywords: [
    'racial', 'racismo', 'negro', 'negra', 'afro', 'quilombol', 'indígen', 'indigen',
    'cigan', 'romani', 'palmares', 'igualdade racial', 'terreiro', 'matriz africana',
    'capoeira', 'candomblé', 'umbanda', 'juventude negra', 'étnic', 'etnic',
    'povos tradicionais', 'comunidades tradicionais', 'discriminaç', 'preconceito racial',
    'afrodescendente', 'seppir', 'povo de santo', 'cultura negra', 'saúde indígena', 'sesai',
  ],
};

const EXCLUSOES_PROGRAMAS = [
  { codigo: '2068', nome: 'Bolsa Família / Cadastro Único (legado)' },
  { codigo: '2049', nome: 'Moradia Digna / MCMV' },
  { codigo: '2012', nome: 'Fortalecimento SUS' },
  { codigo: '2015', nome: 'Fortalecimento SUAS' },
  { codigo: '6012', nome: 'Fundo Eleitoral' },
  { codigo: '5029', nome: 'Fundo Amazônia' },
  { codigo: '5113', nome: 'Educação Superior (genérico, ~R$ 14 bi)' },
];

const EXCLUSOES_ACOES_MDHC = [
  { codigo: '0E85', nome: 'Tecnologia Assistiva (PcD)' },
  { codigo: '14XS', nome: 'Casa da Mulher Brasileira' },
  { codigo: '00SN', nome: 'Casa da Mulher / Centros de Referência' },
  { codigo: '21AR', nome: 'Promoção e Defesa de Direitos Humanos (genérico)' },
  { codigo: '21AS', nome: 'Fortalecimento da Família' },
  { codigo: '21AT', nome: 'Conselhos e Comissões de Direitos Humanos' },
  { codigo: '21AU', nome: 'SINDH - Sistema Nacional de Direitos Humanos' },
];

export function MetodologiaFederalSection() {
  return (
    <>
      {/* 1. Estratégia de Coleta */}
      <section className="space-y-3">
        <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
          <Layers className="w-4 h-4" />
          1. Estratégia de Coleta — 4 Camadas + 3 Passos Complementares
        </h4>
        <p className="text-sm text-muted-foreground">
          A base orçamentária federal (2018–2025) utiliza uma estratégia de <strong>4 camadas de filtragem estrutural</strong> complementadas por <strong>3 passos adicionais</strong> de enriquecimento, totalizando 7 etapas. Clique em cada etapa para ver as ações incorporadas.
        </p>

        <Accordion type="multiple" className="w-full">
          {/* ── Camada 1 ── */}
          <AccordionItem value="camada-1">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge variant="default" className="shrink-0">Camada 1</Badge>
                <span className="font-semibold">Programas Temáticos do PPA</span>
                <Badge variant="secondary" className="text-xs shrink-0">{CAMADA_1_PROGRAMAS_HISTORICOS.length + CAMADA_1_AGENDA_TRANSVERSAL.length} programas</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Consulta direta por código de programa finalístico do PPA. Dividida em <strong>programas historicamente mapeados</strong> (todas as épocas) e <strong>programas das Agendas Transversais</strong> (PPA 2024–2027).
                </p>

                {/* Programas históricos */}
                <div>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                    <DatabaseIcon className="w-3.5 h-3.5" />
                    Programas Historicamente Mapeados ({CAMADA_1_PROGRAMAS_HISTORICOS.length})
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="w-16">Órgão</TableHead>
                        <TableHead className="w-24">PPA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CAMADA_1_PROGRAMAS_HISTORICOS.map(p => (
                        <TableRow key={p.codigo}>
                          <TableCell><code className="text-xs font-mono bg-muted px-1 rounded">{p.codigo}</code></TableCell>
                          <TableCell className="text-xs">
                            {p.nome}
                            {p.nota && <span className="text-muted-foreground italic ml-1">({p.nota})</span>}
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{p.orgao}</Badge></TableCell>
                          <TableCell className="text-xs">{p.ppa}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Agendas Transversais */}
                <div>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    Agendas Transversais PPA 2024–2027 ({CAMADA_1_AGENDA_TRANSVERSAL.length} programas)
                  </p>
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 mb-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Filtro inteligente:</strong> Programas <Badge variant="default" className="text-[10px] mx-0.5">focais</Badge> (MIR, MPI) são incluídos integralmente. 
                      Programas <Badge variant="secondary" className="text-[10px] mx-0.5">universais</Badge> exigem presença de palavras-chave raciais/étnicas no título da ação para evitar inflação.
                    </p>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead className="w-16">Órgão</TableHead>
                        <TableHead className="w-20">Agenda</TableHead>
                        <TableHead className="w-20">Filtro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CAMADA_1_AGENDA_TRANSVERSAL.map(p => (
                        <TableRow key={p.codigo}>
                          <TableCell><code className="text-xs font-mono bg-muted px-1 rounded">{p.codigo}</code></TableCell>
                          <TableCell className="text-xs">{p.nome}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{p.orgao}</Badge></TableCell>
                          <TableCell><Badge variant={p.agenda === 'Indígena' ? 'secondary' : p.agenda === 'Ambas' ? 'outline' : 'default'} className="text-[10px]">{p.agenda}</Badge></TableCell>
                          <TableCell>
                            <Badge variant={p.tipo === 'focal' ? 'default' : 'secondary'} className="text-[10px]">
                              {p.tipo === 'focal' ? '✓ Integral' : '🔑 Keywords'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-3 border-t border-border/50 pt-2 space-y-1">
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" /> <strong>Fontes da listagem:</strong>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href="/documentos/agenda-racial-completa.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-2.5 h-2.5 shrink-0" />
                        Agenda Transversal — Igualdade Racial (PPA 2024–2027)
                      </a>
                      <a
                        href="/documentos/agenda_indigenas-completa.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-2.5 h-2.5 shrink-0" />
                        Agenda Transversal — Povos Indígenas (PPA 2024–2027)
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── Camada 2 ── */}
          <AccordionItem value="camada-2">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge variant="default" className="shrink-0">Camada 2</Badge>
                <span className="font-semibold">Subfunção {CAMADA_2_DESCRICAO.subfuncao}</span>
                <Badge variant="secondary" className="text-xs shrink-0">{CAMADA_2_DESCRICAO.nome}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{CAMADA_2_DESCRICAO.logica}</p>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs"><strong>Lógica:</strong> Busca por subfunção <code>{CAMADA_2_DESCRICAO.subfuncao}</code> na API, seguida de validação por palavras-chave raciais/étnicas para excluir ações genéricas de direitos humanos sem recorte racial.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── Camada 3 ── */}
          <AccordionItem value="camada-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge variant="default" className="shrink-0">Camada 3</Badge>
                <span className="font-semibold">Órgãos com Mandato Direto</span>
                <Badge variant="secondary" className="text-xs shrink-0">{CAMADA_3_ORGAOS.length} órgãos</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Todas as despesas dos órgãos superiores cujo mandato é integralmente voltado a políticas raciais e indígenas.</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead className="w-16">Sigla</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-20">Desde</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CAMADA_3_ORGAOS.map(o => (
                      <TableRow key={o.codigo}>
                        <TableCell><code className="text-xs font-mono bg-muted px-1 rounded">{o.codigo}</code></TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{o.sigla}</Badge></TableCell>
                        <TableCell className="text-xs">{o.nome}</TableCell>
                        <TableCell className="text-xs">{o.desde}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground italic">Deduplicados contra as Camadas 1 e 2 por chave composta (órgão + programa + ano).</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── Camada 4 ── */}
          <AccordionItem value="camada-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge variant="default" className="shrink-0">Camada 4</Badge>
                <span className="font-semibold">Ações Específicas SESAI (Saúde Indígena)</span>
                <Badge variant="secondary" className="text-xs shrink-0">{CAMADA_4_SESAI.length} ações</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Consulta direta por código de ação. Necessária porque a SESAI migrou do programa indígena (2065) para o programa de saúde (5022) no PPA 2020–2023, ficando fora das Camadas 1–3.</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead className="w-20">Órgão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CAMADA_4_SESAI.map(a => (
                      <TableRow key={a.codigo}>
                        <TableCell><code className="text-xs font-mono bg-muted px-1 rounded">{a.codigo}</code></TableCell>
                        <TableCell className="text-xs">{a.nome}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{a.orgao}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="bg-primary/10 rounded p-3 border border-primary/30 mt-2">
                  <p className="text-xs"><strong>Efeito Mascaramento:</strong> A SESAI representa ~95% do total em 2018–2019 e ~56% em 2025. O sistema apresenta <strong>duas perspectivas</strong> (com e sem SESAI) para evitar distorção interpretativa.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── Passo 5: Dotação LOA ── */}
          <AccordionItem value="passo-5">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge className="shrink-0 bg-amber-600 hover:bg-amber-700">Passo 5</Badge>
                <span className="font-semibold">Complementação de Dotação (LOA)</span>
                <Badge variant="secondary" className="text-xs shrink-0">Dados Abertos</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{PASSO_5_DOTACAO.descricao}</p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs"><strong>Problema:</strong> A API REST do Portal da Transparência não fornece Dotação Inicial (LOA).</p>
                  <p className="text-xs"><strong>Solução:</strong> Arquivos ZIP/CSV do portal dados.gov.br são processados pela edge function <code>{PASSO_5_DOTACAO.edgeFunction}</code>, fazendo matching por chave composta <strong>Código Programa | Código Ação</strong>.</p>
                  <p className="text-xs"><strong>Resultado:</strong> Campos <code>dotacao_inicial</code> e <code>dotacao_autorizada</code> preenchidos para todos os registros com correspondência.</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── Passo 6: Keyword-First ── */}
          <AccordionItem value="passo-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge className="shrink-0 bg-amber-600 hover:bg-amber-700">Passo 6</Badge>
                <span className="font-semibold">Ingestão Keyword-First</span>
                <Badge variant="secondary" className="text-xs shrink-0">~40 subfunções</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{PASSO_6_KEYWORD_FIRST.descricao}</p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs"><strong>Objetivo:</strong> Capturar a "cauda longa" de ações raciais/étnicas dispersas em subfunções não-tradicionais (ex: 128 — Formação, 391 — Patrimônio Cultural).</p>
                  <p className="text-xs"><strong>Edge Function:</strong> <code>{PASSO_6_KEYWORD_FIRST.edgeFunction}</code></p>
                  <p className="text-xs"><strong>Deduplicação:</strong> Chave composta <code>orgao|programa|ano</code> com paginação por offsets para validar contra a base existente.</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1.5">Palavras-chave utilizadas ({PASSO_6_KEYWORD_FIRST.keywords.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {PASSO_6_KEYWORD_FIRST.keywords.map(kw => (
                      <Badge key={kw} variant="outline" className="text-[10px] font-mono">{kw}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ── Passo 7: Complementação Manual SIOP ── */}
          <AccordionItem value="passo-7">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge className="shrink-0 bg-amber-600 hover:bg-amber-700">Passo 7</Badge>
                <span className="font-semibold">Complementação Manual (SIOP)</span>
                <Badge variant="secondary" className="text-xs shrink-0">11 registros · ~R$ 67,5 mi</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Inclusão manual de ações orçamentárias identificadas diretamente no SIOP que escapam das camadas automatizadas 
                  devido a reclassificações, migrações entre órgãos e mudanças de planos orçamentários ao longo do exercício.
                </p>

                <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/30 space-y-2">
                  <p className="text-xs font-semibold flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    Por que este passo é necessário?
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                    <li><strong>Dificuldade de rastreamento:</strong> Ações como 21AR e 21AT do programa 5034 são genéricas ("Promoção e Defesa de Direitos para Todos"), mas contêm Planos Orçamentários (POs) específicos de igualdade racial — visíveis apenas no SIOP, não na API do Portal.</li>
                    <li><strong>Mudanças orçamentárias intra-ano:</strong> O orçamento público sofre redefinições ao longo do exercício (remanejamentos, suplementações, contingenciamentos), alterando programações e a forma como as ações são lançadas no SIOP.</li>
                    <li><strong>Migração institucional:</strong> A transição MDHC → MIR em 2023 causou reclassificação retroativa de registros na API, sem alterar os POs no SIOP.</li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold mb-2">Ações incluídas (2020–2023)</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Ano</TableHead>
                        <TableHead className="w-20">Órgão</TableHead>
                        <TableHead>Ação / PO</TableHead>
                        <TableHead className="text-right w-24">Autorizada</TableHead>
                        <TableHead className="text-right w-24">Pago</TableHead>
                        <TableHead className="text-right w-16">Exec %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { ano: 2020, orgao: 'MDHC', acao: '21AR – PO 0001 (Ações Afirmativas)', aut: 2686538, pago: 2394915 },
                        { ano: 2020, orgao: 'MDHC', acao: '21AT – PO 0007 (CNPIR/CNPCT)', aut: 229432, pago: 62327 },
                        { ano: 2021, orgao: 'ICMBio', acao: '20WM – PO 000D (ADPF 709)', aut: 89805, pago: 89805 },
                        { ano: 2021, orgao: 'SESAI', acao: '21CJ – Saneamento Indígena', aut: 35500000, pago: 20588223 },
                        { ano: 2021, orgao: 'MDHC', acao: '21AR – 3 POs raciais agregados', aut: 3410120, pago: 288145 },
                        { ano: 2021, orgao: 'MDHC', acao: '21AT – PO 0007 (CNPIR/CNPCT)', aut: 389749, pago: 66608 },
                        { ano: 2022, orgao: 'SESAI', acao: '21CJ – Saneamento Indígena', aut: 46150000, pago: 32231085 },
                        { ano: 2022, orgao: 'MDHC', acao: '21AR – 3 POs raciais agregados', aut: 5294732, pago: 3639445 },
                        { ano: 2022, orgao: 'MDHC', acao: '21AT – PO 0007 (CNPIR/CNPCT)', aut: 261314, pago: 95711 },
                        { ano: 2023, orgao: 'MIR', acao: '21AR – 3 POs raciais agregados', aut: 37777674, pago: 7825048 },
                        { ano: 2023, orgao: 'MIR', acao: '21AT – PO 0007 (CNPIR/CNPCT)', aut: 305637, pago: 232465 },
                      ].map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-mono">{r.ano}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{r.orgao}</Badge></TableCell>
                          <TableCell className="text-xs">{r.acao}</TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(r.aut)}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(r.pago)}
                          </TableCell>
                          <TableCell className="text-xs text-right font-mono">
                            {r.aut > 0 ? `${((r.pago / r.aut) * 100).toFixed(0)}%` : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-muted/50">
                        <TableCell colSpan={3} className="text-xs">TOTAL (11 registros)</TableCell>
                        <TableCell className="text-xs text-right font-mono">R$ 132,1 mi</TableCell>
                        <TableCell className="text-xs text-right font-mono">R$ 67,5 mi</TableCell>
                        <TableCell className="text-xs text-right font-mono">51%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="bg-primary/10 rounded-lg p-3 border border-primary/30 space-y-1">
                  <p className="text-xs font-semibold">📊 Impacto na base</p>
                  <ul className="list-disc pl-5 space-y-0.5 text-xs text-muted-foreground">
                    <li><strong>+11 registros</strong> (261 total → base ampliada em 4,4%)</li>
                    <li><strong>+R$ 67,5 mi em valor pago</strong> — representa 1,6% do total com SESAI e 1,6% do total sem SESAI</li>
                    <li><strong>Valor qualitativo:</strong> Documenta ações que eram <em>invisíveis</em> às camadas automatizadas, revelando o paradoxo de políticas raciais lançadas sob ações genéricas de direitos humanos</li>
                    <li><strong>Padrão identificado:</strong> Execução média de 51% — consistente com o represamento orçamentário do período 2020–2022</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <p className="text-xs text-muted-foreground mt-2">A mesclagem ocorre por par <strong>Programa–Ação × Ano</strong>, consolidando valores de execução (API) e dotação (LOA) em um único registro. Todos os passos são deduplicados.</p>

        <div className="bg-primary/10 rounded-lg p-4 border border-primary/30 mt-3">
          <p className="font-semibold text-foreground text-sm mb-1">📌 Diferença para a seção TESTE</p>
          <p className="text-sm text-muted-foreground">Esta seção utiliza a metodologia de <strong>4 camadas + 2 passos complementares</strong> (programas temáticos expandidos + subfunção 422 + órgãos MIR/MPI + SESAI + dotação LOA + keyword-first), capturando ~R$ 9 bi pagos em 2023–2025. A seção <strong>TESTE</strong> utiliza exclusivamente os 18 códigos de programas da <em>Agenda Transversal PPA 2024–2027</em>, resultando em ~R$ 4,5 bi — uma cobertura deliberadamente mais restrita.</p>
        </div>
      </section>

      {/* 2. Exclusões */}
      <section className="space-y-3">
        <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          2. Exclusões Explícitas
        </h4>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="exclusoes-programas">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge variant="destructive" className="shrink-0 text-xs">❌</Badge>
                <span className="font-semibold text-sm">Programas Universais Excluídos</span>
                <Badge variant="secondary" className="text-xs shrink-0">{EXCLUSOES_PROGRAMAS.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Código</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EXCLUSOES_PROGRAMAS.map(e => (
                    <TableRow key={e.codigo}>
                      <TableCell><code className="text-xs font-mono bg-destructive/10 px-1 rounded">{e.codigo}</code></TableCell>
                      <TableCell className="text-xs">{e.nome}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="exclusoes-mdhc">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <Badge variant="destructive" className="shrink-0 text-xs">❌</Badge>
                <span className="font-semibold text-sm">Ações Genéricas MDHC (Bypass Temporal)</span>
                <Badge variant="secondary" className="text-xs shrink-0">{EXCLUSOES_ACOES_MDHC.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">A API retroativamente rotula registros do antigo MDHC como MIR (67000). Para anos &lt; 2023, ações genéricas são excluídas; demais exigem keywords raciais.</p>
                <div className="bg-primary/10 rounded p-2 border border-primary/20 mb-2">
                  <p className="text-[10px] text-muted-foreground">
                    <strong>⚠️ Nota Passo 7:</strong> As ações 21AR e 21AT foram parcialmente recuperadas via complementação manual do SIOP (Passo 7), 
                    filtrando apenas os Planos Orçamentários (POs) com recorte racial explícito (0001, 0003, 000J, 0007). 
                    A exclusão nas camadas automatizadas permanece válida para evitar inflação com POs genéricos.
                  </p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Código</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {EXCLUSOES_ACOES_MDHC.map(e => (
                      <TableRow key={e.codigo}>
                        <TableCell><code className="text-xs font-mono bg-destructive/10 px-1 rounded">{e.codigo}</code></TableCell>
                        <TableCell className="text-xs">{e.nome}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 3. Classificação Temática */}
      <section className="space-y-2">
        <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
          <Search className="w-4 h-4" />
          3. Classificação Temática — Campos Reais da API
        </h4>
        <p className="text-sm text-muted-foreground">A classificação utiliza <strong>exclusivamente</strong> campos reais: <code className="bg-muted px-1 rounded">programa</code>, <code className="bg-muted px-1 rounded">orgao</code> e <code className="bg-muted px-1 rounded">descritivo</code>. O campo <code className="bg-muted px-1 rounded">publico_alvo</code> é <strong>ignorado</strong>.</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Critérios</TableHead>
              <TableHead>Radicais</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Política Racial</TableCell>
              <TableCell className="text-xs">MIR, MDHC, SEPPIR; 5034 filtrado por keywords</TableCell>
              <TableCell><code className="text-[10px]">racial, racismo, negro/a, afro, palmares</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Povos Indígenas</TableCell>
              <TableCell className="text-xs">FUNAI, MPI; Programas 2065 → 0617 → 5136</TableCell>
              <TableCell><code className="text-[10px]">indígen, funai, etnodesenvolvimento</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Quilombolas</TableCell>
              <TableCell className="text-xs">INCRA; Ações 20G7, 0859; Programa 5802</TableCell>
              <TableCell><code className="text-[10px]">quilombol, palmares, terreiro</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SESAI</TableCell>
              <TableCell className="text-xs">Ações 20YP e 7684 (~R$ 1,3–1,5 bi/ano)</TableCell>
              <TableCell><code className="text-[10px]">saúde indígena, sesai</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ciganos/Romani</TableCell>
              <TableCell className="text-xs">Ações com radicais específicos</TableCell>
              <TableCell><code className="text-[10px]">cigano, romani, povo cigano</code></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* 4. Transições PPA */}
      <section className="space-y-2">
        <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          4. Transições de Códigos PPA (2018–2027)
        </h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tema</TableHead>
              <TableHead>PPA 2016–2019</TableHead>
              <TableHead>PPA 2020–2023</TableHead>
              <TableHead>PPA 2024–2027</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Igualdade Racial</TableCell>
              <TableCell><code>2034</code> (SEPPIR)</TableCell>
              <TableCell><code>5034</code> (MDHC)</TableCell>
              <TableCell><code>5802, 5803, 5804</code> (MIR)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Povos Indígenas</TableCell>
              <TableCell><code>2065</code></TableCell>
              <TableCell><code>0617</code></TableCell>
              <TableCell><code>5136, 1617</code> (MPI)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SESAI</TableCell>
              <TableCell><code>2065</code></TableCell>
              <TableCell><code>5022</code></TableCell>
              <TableCell><code>5022</code></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Quilombolas</TableCell>
              <TableCell><code>2034</code></TableCell>
              <TableCell><code>5034</code></TableCell>
              <TableCell><code>5802</code> (MIR)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Órgão Líder</TableCell>
              <TableCell>SEPPIR + FUNAI</TableCell>
              <TableCell>MDHC + FUNAI</TableCell>
              <TableCell>MIR + MPI</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* 5. Série Histórica */}
      <section className="space-y-2">
        <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          5. Padrão da Série Histórica (2018–2025)
        </h4>

        {/* NOTA METODOLÓGICA: Pago vs Liquidado */}
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/30 mb-3">
          <p className="font-semibold text-foreground text-sm mb-2">📌 Nota Metodológica — Métrica Principal: "Pago" (vs. "Liquidado")</p>
          <p className="text-sm text-muted-foreground mb-2">
            O sistema adota <strong>"Pago"</strong> como métrica principal de análise, comparada à <strong>"Dotação Inicial"</strong> (previsão na LOA). 
            A escolha é metodológica:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li><strong>Pago</strong> = transferência efetiva de recursos ao beneficiário final. Mede a <em>entrega real</em> da política pública.</li>
            <li><strong>Liquidado</strong> = verificação de que o bem/serviço foi entregue ao Estado. Mede a <em>obrigação confirmada</em>, mas não garante que o recurso chegou à ponta.</li>
            <li><strong>Dotação Inicial</strong> = previsão na Lei Orçamentária Anual. Mede a <em>intenção legislativa</em>.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Justificativa:</strong> Para o objetivo do projeto — avaliar se as políticas raciais <em>evoluíram ou não</em> entre 2018 e 2025 — 
            o "Pago" é o indicador mais rigoroso: identifica "orçamentos de papel" (dotação sem entrega) e detecta represamento de recursos 
            que o "Liquidado" pode mascarar. É também o padrão do TCU e do Portal da Transparência.
          </p>
          <p className="text-sm text-muted-foreground mt-1 italic">
            <strong>⚠️ Cautela para 2025:</strong> Dados parciais (até 6º bimestre). Valores de "Pago" podem estar defasados em relação ao "Liquidado" 
            por atrasos normais de processamento. A execução final pode diferir significativamente.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h5 className="font-semibold text-foreground">2018–2019 — Base Modesta</h5>
            <p className="text-sm text-muted-foreground">SEPPIR ativa com R$ 5–20 mi/ano (sem SESAI). FUNAI operante com 5 ações finalísticas.</p>
          </div>
          <div className="bg-destructive/10 rounded-lg p-4 space-y-2 border border-destructive/30">
            <h5 className="font-semibold text-destructive">2020–2022 — Desmonte Institucional</h5>
            <p className="text-sm text-muted-foreground">Programa 5034/MDHC inflou total com ações genéricas (filtrado). 2021–2022: queda para R$ 60–63 mi sem SESAI.</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 space-y-2 border border-green-500/30">
            <h5 className="font-semibold text-green-700 dark:text-green-400">2023 — Reconstrução</h5>
            <p className="text-sm text-muted-foreground">Criação do MIR. Sem SESAI, pago ~R$ 107 mi (+180% em dotação).</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-4 space-y-2 border border-primary/30">
            <h5 className="font-semibold text-primary">2024–2025 — Novos Programas PPA + Agendas Transversais</h5>
            <p className="text-sm text-muted-foreground">MPI: R$ 307 mi (2024) → R$ 1,4 bi (2025). MIR: 5802/5803/5804. <strong>14 programas das Agendas Transversais</strong> integrados à Camada 1. Pela primeira vez, políticas raciais sem SESAI superam R$ 1 bilhão.</p>
          </div>
        </div>
      </section>

      {/* 6. Dotação e Limitações */}
      <section className="space-y-2">
        <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
          <FileText className="w-4 h-4" />
          6. Fontes de Dados e Limitações
        </h4>
        <div className="space-y-3">
          <div className="p-3 rounded-md border border-green-500/30 bg-green-500/5">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">✅ Cobertura Completa</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Povos Indígenas (FUNAI/MPI): 2018–2025</li>
              <li>SESAI: 2018–2025 via Camada 4</li>
              <li>MIR (2023+): Programas 5802/5803/5804</li>
              <li>Agendas Transversais: 14 programas do PPA 2024–2027</li>
            </ul>
          </div>
          <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/5">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Limitações Persistentes</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Quilombolas (INCRA): Ações 20G7/0859 com cobertura parcial</li>
              <li>5034 (2020–2023): Filtrados por impossibilidade de desagregação confiável</li>
            </ul>
          </div>
        </div>

        <h5 className="font-semibold text-foreground mt-4">Identificação de Órgãos Federais</h5>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Órgão</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Predecessores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { orgao: 'MIR', codigo: 'OS67000', periodo: '2023–presente', pred: 'SEPPIR → MMFDH' },
              { orgao: 'MPI', codigo: '92000', periodo: '2023–presente', pred: 'FUNAI (MJ)' },
              { orgao: 'FUNAI', codigo: 'OS52000', periodo: '2018–2022', pred: '—' },
              { orgao: 'INCRA', codigo: 'OS49000', periodo: '2018–presente', pred: '—' },
              { orgao: 'SESAI/MS', codigo: '36000', periodo: '2018–presente', pred: '—' },
            ].map(o => (
              <TableRow key={o.orgao}>
                <TableCell className="font-medium">{o.orgao}</TableCell>
                <TableCell><code className="text-xs">{o.codigo}</code></TableCell>
                <TableCell className="text-xs">{o.periodo}</TableCell>
                <TableCell className="text-xs">{o.pred}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* 7. Diferenciação Orçamentário × Extraorçamentário */}
      <ExtraorcamentarioSection />
    </>
  );
}
