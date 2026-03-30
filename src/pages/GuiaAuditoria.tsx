import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, Search, Filter, Download, CheckCircle2, AlertTriangle, BookOpen, Layers, DollarSign, FileText, ClipboardCheck } from 'lucide-react';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';

const PORTAL_TRANSPARENCIA = 'https://portaldatransparencia.gov.br';
const SIOP = 'https://www.siop.planejamento.gov.br';
const DADOS_ABERTOS = 'https://portaldatransparencia.gov.br/download-de-dados/orcamento-despesa';

export default function GuiaAuditoria() {
  return (
    <DashboardLayout
      title="Guia de Auditoria Orçamentária"
      subtitle="Passo a passo para reproduzir e verificar todos os dados orçamentários nos portais oficiais"
    >
      <div className="flex justify-end mb-4">
        <ExportTabButtons
          targetSelector="#export-guia-auditoria"
          fileName="Guia-Auditoria-Orcamentaria-CERD-IV"
          label="Guia"
        />
      </div>
      <div id="export-guia-auditoria" className="space-y-6 max-w-4xl">

        {/* INTRODUÇÃO */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ClipboardCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-base text-foreground">Objetivo deste Guia</p>
                <p className="text-muted-foreground">
                  Este guia permite que <strong>qualquer pessoa</strong> reproduza, nos portais oficiais do governo brasileiro,
                  os mesmos dados orçamentários exibidos neste sistema. Inclui instruções para localizar tanto a
                  <strong> seleção das ações orçamentárias</strong> quanto os <strong>valores de dotação e execução</strong>.
                </p>
                <p className="text-muted-foreground">
                  <strong>Fonte dos dados:</strong> O sistema <strong>não acessa o SIAFI diretamente</strong> (acesso restrito a servidores públicos).
                  Todos os dados vêm da <strong>API pública do Portal da Transparência</strong> (<code>api.portaldatransparencia.gov.br/api-de-dados/despesas/</code>),
                  que por sua vez publica os dados extraídos do SIAFI. É a mesma base, só que por canal público e auditável.
                </p>
                <p className="text-muted-foreground">
                  <strong>Portais utilizados:</strong> Portal da Transparência (API pública), Dados Abertos da LOA, SIOP (consulta complementar).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DIAGRAMA DE SOBREPOSIÇÃO DAS CAMADAS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="w-5 h-5" />
              Diagrama de Sobreposição e Deduplicação
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Cada camada captura ações por critérios diferentes. A interseção é deduplicada automaticamente pela chave <code>órgão|programa|ano</code>.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Venn-like diagram */}
            <div className="relative w-full max-w-2xl mx-auto py-8">
              <svg viewBox="0 0 600 400" className="w-full h-auto" role="img" aria-label="Diagrama de sobreposição das camadas de filtragem orçamentária">
                {/* Camada 1 - Programas PPA */}
                <ellipse cx="220" cy="180" rx="170" ry="130" className="fill-primary/10 stroke-primary" strokeWidth="2" strokeDasharray="6 3" />
                <text x="120" y="100" className="fill-primary text-[13px] font-bold">Camada 1</text>
                <text x="120" y="118" className="fill-primary text-[11px]">Programas PPA</text>
                <text x="110" y="140" className="fill-muted-foreground text-[10px]">5804, 5803, 5802,</text>
                <text x="110" y="155" className="fill-muted-foreground text-[10px]">5136, 2034, 2065...</text>

                {/* Camada 3 - Órgãos MIR/MPI */}
                <ellipse cx="380" cy="180" rx="170" ry="130" className="fill-emerald-500/10 stroke-emerald-600" strokeWidth="2" strokeDasharray="6 3" />
                <text x="420" y="100" className="fill-emerald-700 dark:fill-emerald-400 text-[13px] font-bold">Camada 3</text>
                <text x="420" y="118" className="fill-emerald-700 dark:fill-emerald-400 text-[11px]">Orgaos MIR/MPI</text>
                <text x="420" y="140" className="fill-muted-foreground text-[10px]">67000 (MIR)</text>
                <text x="420" y="155" className="fill-muted-foreground text-[10px]">92000 (MPI)</text>

                {/* Intersection zone */}
                <text x="300" y="170" className="fill-foreground text-[11px] font-bold" textAnchor="middle">INTERSECAO</text>
                <text x="300" y="188" className="fill-muted-foreground text-[9px]" textAnchor="middle">Ex: MIR executa</text>
                <text x="300" y="200" className="fill-muted-foreground text-[9px]" textAnchor="middle">Programa 5804</text>
                <text x="300" y="216" className="fill-destructive text-[10px] font-semibold" textAnchor="middle">DEDUPLICADO</text>

                {/* Exclusive to Camada 1 */}
                <text x="110" y="200" className="fill-muted-foreground text-[9px]" textAnchor="middle">Ex: MEC executa</text>
                <text x="110" y="212" className="fill-muted-foreground text-[9px]" textAnchor="middle">acao do programa</text>
                <text x="110" y="224" className="fill-muted-foreground text-[9px]" textAnchor="middle">5803 (Juventude</text>
                <text x="110" y="236" className="fill-muted-foreground text-[9px]" textAnchor="middle">Negra Viva)</text>

                {/* Exclusive to Camada 3 */}
                <text x="490" y="200" className="fill-muted-foreground text-[9px]" textAnchor="middle">Ex: MIR executa</text>
                <text x="490" y="212" className="fill-muted-foreground text-[9px]" textAnchor="middle">acoes administ.</text>
                <text x="490" y="224" className="fill-muted-foreground text-[9px]" textAnchor="middle">fora dos programas</text>
                <text x="490" y="236" className="fill-muted-foreground text-[9px]" textAnchor="middle">tematicos</text>

                {/* Camada 2 */}
                <ellipse cx="200" cy="300" rx="110" ry="70" className="fill-amber-500/10 stroke-amber-500" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x="155" y="300" className="fill-amber-700 dark:fill-amber-400 text-[11px] font-bold">Camada 2</text>
                <text x="140" y="315" className="fill-amber-700 dark:fill-amber-400 text-[9px]">Subfuncao 422</text>

                {/* Camada 4 */}
                <ellipse cx="400" cy="310" rx="110" ry="70" className="fill-violet-500/10 stroke-violet-500" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x="365" y="305" className="fill-violet-700 dark:fill-violet-400 text-[11px] font-bold">Camada 4</text>
                <text x="345" y="320" className="fill-violet-700 dark:fill-violet-400 text-[9px]">SESAI/FUNAI/INCRA</text>

                {/* Deduplication arrow */}
                <line x1="300" y1="370" x2="300" y2="395" className="stroke-destructive" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <defs>
                  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" className="fill-destructive" />
                  </marker>
                </defs>
              </svg>
              <div className="text-center mt-2">
                <Badge variant="destructive" className="text-xs">
                  Deduplicacao: chave orgao|programa|ano - registro unico
                </Badge>
              </div>
            </div>

            {/* Explanation cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                <p className="text-sm font-semibold text-primary">Exclusivo da Camada 1</p>
                <p className="text-xs text-muted-foreground">
                  Acoes de programas raciais executadas por orgaos <strong>fora</strong> do MIR/MPI.
                  Ex: MEC executando acao do Programa 5803 (Juventude Negra), MS executando acao do 5136 (Povos Indigenas).
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Exclusivo da Camada 3</p>
                <p className="text-xs text-muted-foreground">
                  Acoes do MIR/MPI que <strong>nao estao</strong> em programas tematicos listados na Camada 1.
                  Ex: despesas administrativas, convenios internacionais, acoes de gestao interna.
                </p>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Camada 2 — Subfuncao 422</p>
                <p className="text-xs text-muted-foreground">
                  Captura acoes classificadas em "Direitos Individuais, Coletivos e Difusos" de <strong>qualquer orgao</strong>,
                  validadas por palavras-chave. Pode sobrepor-se as Camadas 1 e 3.
                </p>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 space-y-2">
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-400">Camada 4 — Acoes Especificas</p>
                <p className="text-xs text-muted-foreground">
                  Captura acoes por codigo direto (20YP, 7684, 20UF, etc.) de orgaos como SESAI e FUNAI
                  que podem nao aparecer em nenhuma das outras camadas.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Como funciona a deduplicacao?
              </p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                <li>Cada camada gera uma lista independente de registros orcamentarios.</li>
                <li>Os resultados sao unidos (UNION) em uma lista combinada.</li>
                <li>A chave composta <code className="text-primary">orgao | programa | ano</code> identifica cada registro unico.</li>
                <li>Se o mesmo registro aparece em mais de uma camada, apenas <strong>uma copia</strong> e mantida.</li>
                <li>O campo <code className="text-primary">razao_selecao</code> registra <strong>qual camada</strong> capturou o registro primeiro.</li>
              </ol>
            </div>

            {/* Tabela comparativa Camada 1 vs Camada 3 */}
            <div className="space-y-3">
              <p className="font-semibold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Camada 1 vs Camada 3 — Comparacao detalhada
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold text-muted-foreground w-1/5"></th>
                      <th className="text-left p-2 font-semibold text-primary">Camada 1 — Programas PPA</th>
                      <th className="text-left p-2 font-semibold text-emerald-700 dark:text-emerald-400">Camada 3 — Orgaos MIR/MPI</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-muted/50">
                      <td className="p-2 font-semibold text-foreground">Criterio</td>
                      <td className="p-2">Filtra por <strong>codigo de programa</strong> (5034, 5803, 5804...)</td>
                      <td className="p-2">Filtra por <strong>codigo de orgao</strong> (67000, 92000)</td>
                    </tr>
                    <tr className="border-b border-muted/50">
                      <td className="p-2 font-semibold text-foreground">Abrangencia</td>
                      <td className="p-2">Captura acoes de <strong>qualquer orgao</strong> que execute aquele programa</td>
                      <td className="p-2">Captura <strong>todas as acoes</strong> daquele orgao, independente do programa</td>
                    </tr>
                    <tr className="border-b border-muted/50">
                      <td className="p-2 font-semibold text-foreground">Exemplo</td>
                      <td className="p-2">Programa 5803 (Juventude Negra Viva) pode ter acoes no MEC, MS, MIR</td>
                      <td className="p-2">Orgao 67000 (MIR) inclui acoes administrativas, convenios, etc. fora dos programas tematicos</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-foreground">Por que ambas?</td>
                      <td className="p-2">Um programa racial pode ser executado por orgaos fora do MIR/MPI</td>
                      <td className="p-2">O MIR/MPI podem ter acoes fora dos programas tematicos da Camada 1</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Resumindo:</strong> Camada 1 pergunta <em>"quem executa este programa racial?"</em> (qualquer orgao).
                Camada 3 pergunta <em>"o que este orgao racial faz?"</em> (qualquer programa).
                A intersecao e deduplicada automaticamente pela chave <code className="text-primary">orgao|programa|ano</code>.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════ PARTE 1: COMO ENCONTRAR AS AÇÕES ═══════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="w-5 h-5" />
              Parte 1 — Como Localizar as Ações Orçamentárias
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              O sistema usa 4 camadas de filtragem para selecionar ações com recorte racial/étnico. Abaixo, como reproduzir cada uma.
            </p>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">

              {/* CAMADA 1 */}
              <AccordionItem value="camada1">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge>Camada 1</Badge>
                    <span className="font-semibold">Programas Temáticos do PPA (Agendas Transversais)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-sm">

                  {/* Explicação conceitual */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2 text-xs text-muted-foreground">
                    <p className="font-semibold text-sm text-foreground">📋 O que é a Camada 1?</p>
                    <p>
                      A Camada 1 identifica programas orçamentários com <strong>recorte racial e/ou indígena</strong> a partir dos
                      códigos de programa do PPA (Plano Plurianual). A fonte primária a partir de <strong>2024</strong> são as
                      <strong> Agendas Transversais do PPA 2024–2027</strong> — documentos oficiais publicados pelo Ministério do
                      Planejamento que listam explicitamente os programas e ações vinculados às políticas de Igualdade Racial e Povos Indígenas.
                    </p>
                    <p>
                      Para manter a <strong>série histórica completa (2018–2025)</strong>, o sistema retroage com os códigos PPA
                      equivalentes dos ciclos anteriores (2016–2019 e 2020–2023), garantindo cobertura contínua mesmo com as mudanças
                      de nomenclatura e reestruturação ministerial.
                    </p>
                  </div>

                  {/* Timeline dos PPAs */}
                  <div className="space-y-3">
                    <p className="font-semibold text-sm">📅 Cobertura por Ciclo de PPA</p>

                    {/* PPA 2024-2027 */}
                    <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary">2024–2027</Badge>
                        <span className="font-semibold text-sm">PPA Atual — Agendas Transversais</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Fonte: <strong>Agendas Transversais do PPA 2024–2027</strong> (Igualdade Racial + Povos Indígenas), publicadas pelo
                        Ministério do Planejamento e Orçamento. Esses documentos listam explicitamente quais programas e ações do orçamento
                        federal são vinculados a essas agendas.
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground mb-1">Programas focais (incluídos integralmente):</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                          {[
                            { cod: '5804', nome: 'Igualdade Étnico-Racial', orgao: 'MIR' },
                            { cod: '5803', nome: 'Juventude Negra Viva', orgao: 'MIR' },
                            { cod: '5802', nome: 'Quilombolas e Ciganos', orgao: 'MIR' },
                            { cod: '5136', nome: 'Proteção Povos Indígenas', orgao: 'MPI' },
                            { cod: '5034', nome: 'Proteção à Vida e Direitos Humanos', orgao: 'MDHC' },
                          ].map(p => (
                            <a key={p.cod} href={`${PORTAL_TRANSPARENCIA}/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=100&programa=${p.cod}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded border px-2.5 py-1.5 text-xs hover:bg-muted/50 transition-colors">
                              <span><code className="font-mono font-bold text-primary">{p.cod}</code> — {p.nome} <span className="text-muted-foreground">({p.orgao})</span></span>
                              <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2.5 text-xs">
                        <p className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Programas universais expandidos</strong> (também listados nas Agendas Transversais, mas com orçamentos
                            bilionários — ex: 1617, 1189, 2316, 5111): apenas ações cujo título contenha <strong>palavras-chave raciais/étnicas</strong> são
                            incluídas. Isso evita a inflação artificial dos totais com orçamento universal não-etiquetado.
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* PPA 2020-2023 */}
                    <div className="rounded-lg border border-muted bg-muted/30 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">2020–2023</Badge>
                        <span className="font-semibold text-sm">PPA Intermediário</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Período de <strong>esvaziamento institucional</strong> (extinção da SEPPIR, fusão em MDHC).
                        Os programas equivalentes deste ciclo são usados para manter a continuidade da série histórica.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {[
                          { cod: '0617', nome: 'Proteção Povos Indígenas', orgao: 'FUNAI' },
                          { cod: '0153', nome: 'Gestão da Política Indigenista', orgao: 'FUNAI' },
                          { cod: '5022', nome: 'Gestão da Política de Direitos Humanos', orgao: 'MDHC' },
                        ].map(p => (
                          <a key={p.cod} href={`${PORTAL_TRANSPARENCIA}/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=100&programa=${p.cod}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded border px-2.5 py-1.5 text-xs hover:bg-muted/50 transition-colors">
                            <span><code className="font-mono font-bold text-primary">{p.cod}</code> — {p.nome} <span className="text-muted-foreground">({p.orgao})</span></span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* PPA 2016-2019 */}
                    <div className="rounded-lg border border-muted bg-muted/30 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">2016–2019</Badge>
                        <span className="font-semibold text-sm">PPA Legado</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Programas da era <strong>SEPPIR</strong> (antes da fusão). Cobrem os dados de 2018–2019 na série histórica.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {[
                          { cod: '2034', nome: 'Igualdade Racial e Superação do Racismo', orgao: 'SEPPIR' },
                          { cod: '2065', nome: 'Proteção e Promoção Povos Indígenas', orgao: 'FUNAI' },
                        ].map(p => (
                          <a key={p.cod} href={`${PORTAL_TRANSPARENCIA}/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=100&programa=${p.cod}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded border px-2.5 py-1.5 text-xs hover:bg-muted/50 transition-colors">
                            <span><code className="font-mono font-bold text-primary">{p.cod}</code> — {p.nome} <span className="text-muted-foreground">({p.orgao})</span></span>
                            <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Lógica focal vs universal */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-sm">⚙️ Lógica de Filtragem: Focal vs. Universal</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-semibold text-foreground">Tipo</th>
                            <th className="text-left p-2 font-semibold text-foreground">Critério de Inclusão</th>
                            <th className="text-left p-2 font-semibold text-foreground">Exemplos</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted-foreground">
                          <tr className="border-b border-muted/50">
                            <td className="p-2 font-semibold text-primary">Programa Focal</td>
                            <td className="p-2"><strong>Todas</strong> as ações são incluídas, sem filtro adicional</td>
                            <td className="p-2">5804, 5803, 5802, 5136, 2034, 2065</td>
                          </tr>
                          <tr>
                            <td className="p-2 font-semibold text-amber-700 dark:text-amber-400">Programa Universal</td>
                            <td className="p-2">Somente ações com <strong>palavras-chave raciais/étnicas</strong> no título</td>
                            <td className="p-2">1617, 1189, 2316, 5111 (Educação Básica)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Esta distinção é fundamental: sem ela, programas universais de R$ 10–100 bilhões (como Bolsa Família ou SUS)
                      inflariam artificialmente os totais de política racial, comprometendo a integridade analítica.
                    </p>
                  </div>

                  {/* Passo a passo */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="font-semibold">🔍 Como reproduzir no Portal da Transparência:</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>
                        Acesse{' '}
                        <a href={`${PORTAL_TRANSPARENCIA}/despesas/programa-e-acao`} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                          Despesas → Programa e Ação <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>No campo <strong>"Programa"</strong>, digite o código do programa (ex: <code>5804</code>).</li>
                      <li>Selecione o <strong>Ano/Exercício</strong> desejado (ex: 2024).</li>
                      <li>Clique em <strong>"Consultar"</strong>. Todas as ações vinculadas serão listadas.</li>
                      <li>Para programas universais, verifique quais ações possuem termos como "indígena", "quilombola", "racial" etc.</li>
                      <li>Para ver detalhamento (órgão executor, dotação, empenho, pago), clique na ação desejada.</li>
                    </ol>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">📎 Documentos-fonte das Agendas Transversais:</strong> Os PDFs oficiais das Agendas
                    Transversais de Igualdade Racial e Povos Indígenas (PPA 2024–2027) estão disponíveis no portal do Ministério do
                    Planejamento. O sistema disponibiliza accordions interativos que permitem visualizar a lista completa de ações e
                    programas incorporados em cada passo, garantindo transparência e auditabilidade.
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                    <strong className="text-foreground">💡 Resumindo:</strong> Camada 1 pergunta <em>"quem executa este programa racial?"</em> (qualquer órgão).
                    Camada 3 pergunta <em>"o que este órgão racial faz?"</em> (qualquer programa).
                    A interseção é deduplicada automaticamente pela chave <code className="text-primary">órgão|programa|ano</code>.
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* CAMADA 2 */}
              <AccordionItem value="camada2">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Camada 2</Badge>
                    <span className="font-semibold">Subfunção 422 — Direitos Individuais, Coletivos e Difusos</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="font-semibold">🔍 Passo a passo:</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>
                        Acesse{' '}
                        <a href={`${PORTAL_TRANSPARENCIA}/despesas/consulta?ordenarPor=mesAno&direcao=desc`} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                          Despesas → Consulta detalhada <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>Nos filtros avançados, selecione <strong>Subfunção: 422</strong>.</li>
                      <li>Selecione o <strong>Ano</strong>.</li>
                      <li>Nos resultados, verifique quais ações possuem palavras-chave raciais/étnicas no título.</li>
                      <li><strong>Apenas ações com recorte racial/étnico</strong> são incorporadas ao sistema.</li>
                    </ol>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Exemplo: a ação "21CS – Enfrentamento ao Racismo e Promoção da Igualdade Racial" aparece sob a subfunção 422.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* CAMADA 3 */}
              <AccordionItem value="camada3">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Camada 3</Badge>
                    <span className="font-semibold">Órgãos MIR (67000) e MPI (92000)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="font-semibold">🔍 Passo a passo:</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>
                        Acesse{' '}
                        <a href={`${PORTAL_TRANSPARENCIA}/despesas/orgao?ordenarPor=orgaoSuperior&direcao=asc`} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                          Despesas → Por Órgão <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>No filtro, busque <strong>"Ministério da Igualdade Racial"</strong> (código 67000) ou <strong>"Ministério dos Povos Indígenas"</strong> (código 92000).</li>
                      <li>Selecione o <strong>Ano</strong> (disponível a partir de 2023).</li>
                      <li><strong>Todos os registros</strong> desses órgãos são incluídos sem filtro adicional.</li>
                    </ol>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong>Nota:</strong> MIR e MPI foram criados em 2023. Para anos anteriores, os programas equivalentes estavam sob SEPPIR, FUNAI e MDHC (cobertos pelas Camadas 1 e 2).
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* CAMADA 4 */}
              <AccordionItem value="camada4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-600">Camada 4</Badge>
                    <span className="font-semibold">Ações Específicas — SESAI, FUNAI, INCRA</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="font-semibold">🔍 Passo a passo:</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>
                        Acesse{' '}
                        <a href={`${PORTAL_TRANSPARENCIA}/despesas/programa-e-acao`} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                          Despesas → Programa e Ação <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>No campo <strong>"Ação"</strong>, digite o código da ação diretamente.</li>
                      <li>Selecione o <strong>Ano</strong>.</li>
                    </ol>
                  </div>

                  <div>
                    <p className="font-semibold mb-2">Ações capturadas por código direto:</p>
                    <div className="space-y-1">
                      {[
                        { cod: '20YP', nome: 'Promoção e Recuperação da Saúde Indígena', orgao: 'SESAI/MS' },
                        { cod: '7684', nome: 'Saneamento Básico em Aldeias Indígenas', orgao: 'SESAI/MS' },
                        { cod: '20UF', nome: 'Gestão de Terras Indígenas', orgao: 'FUNAI' },
                        { cod: '2384', nome: 'Proteção dos Direitos dos Povos Indígenas', orgao: 'FUNAI' },
                        { cod: '15Q1', nome: 'Titulação Territórios Quilombolas', orgao: 'INCRA' },
                        { cod: '20G7', nome: 'Regularização Fundiária Quilombola', orgao: 'INCRA' },
                      ].map(a => (
                        <div key={a.cod} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded bg-muted/30">
                          <code className="font-mono font-bold text-primary">{a.cod}</code>
                          <span className="text-muted-foreground">— {a.nome}</span>
                          <Badge variant="outline" className="text-[10px] ml-auto">{a.orgao}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Sobre registros com dotação zero:</strong> Algumas ações da FUNAI (ex: Programa 0151)
                        possuem execução financeira (empenhado/pago) mas dotação inicial = 0. São recursos de <em>Receitas Próprias</em> ou
                        <em> Projetos Especiais</em> (compensações como Belo Monte, royalties), que não constam na dotação LOA convencional.
                      </span>
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* KEYWORD-FIRST */}
              <AccordionItem value="keywords">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Passo 6</Badge>
                    <span className="font-semibold">Varredura por Palavras-Chave</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <p className="font-semibold">🔍 Como reproduzir manualmente:</p>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>
                        Acesse{' '}
                        <a href={`${PORTAL_TRANSPARENCIA}/despesas`} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                          Portal da Transparência — Despesas <ExternalLink className="w-3 h-3" />
                        </a>
                      </li>
                      <li>Use o campo de busca textual para pesquisar termos como: <code>quilombola</code>, <code>indígena</code>, <code>racial</code>, <code>capoeira</code>, <code>terreiro</code>, <code>palmares</code>.</li>
                      <li>Filtre por <strong>Ano</strong> e revise os resultados manualmente.</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Palavras-chave utilizadas pelo sistema:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['racial', 'racismo', 'negro/negra', 'afro', 'quilombola', 'indígena', 'cigano/romani',
                        'palmares', 'terreiro', 'matriz africana', 'capoeira', 'candomblé', 'umbanda',
                        'juventude negra', 'étnico', 'povos tradicionais', 'discriminação', 'afrodescendente',
                        'saúde indígena', 'sesai'].map(kw => (
                        <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* ═══════════ PARTE 2: COMO ENCONTRAR OS VALORES ═══════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5" />
              Parte 2 — Como Encontrar os Valores (Dotação e Execução)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Uma vez identificadas as ações, os valores podem ser verificados por três caminhos.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Caminho A: Portal da Transparência */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge>A</Badge> Portal da Transparência — Valores de Execução
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    Acesse{' '}
                    <a href={`${PORTAL_TRANSPARENCIA}/despesas/programa-e-acao`} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                      Despesas → Programa e Ação <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Busque pelo <strong>programa</strong> ou <strong>ação</strong> desejada.</li>
                  <li>Na página de resultados, os valores exibidos são: <strong>Empenhado</strong>, <strong>Liquidado</strong> e <strong>Pago</strong>.</li>
                  <li>Clique na ação para ver o detalhamento por UG (unidade gestora).</li>
                </ol>

                <div className="bg-background rounded border p-3 text-xs space-y-1">
                  <p className="font-semibold text-foreground">📊 Campos coletados pelo sistema:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                    <li><strong>Pago</strong> — métrica primária (reflete o recurso efetivamente desembolsado)</li>
                    <li><strong>Empenhado</strong> — valor comprometido (reserva orçamentária)</li>
                    <li><strong>Liquidado</strong> — valor reconhecido como devido</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <strong>Atenção:</strong> O Portal da Transparência inclui Restos a Pagar (RAP) nos totais.
                  O sistema <strong>exclui RAP</strong> para manter a integridade da série histórica por exercício.
                  Por isso, os valores no sistema podem ser menores que o total exibido no portal.
                </p>
              </div>
            </div>

            {/* Caminho B: LOA / Dados Abertos */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="secondary">B</Badge> Dados Abertos da LOA — Valores de Dotação
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    Acesse{' '}
                    <a href={DADOS_ABERTOS} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                      Download de Dados — Orçamento/Despesa <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Selecione o <strong>Ano</strong> desejado e baixe o arquivo <strong>ZIP</strong>.</li>
                  <li>Descompacte o ZIP. Dentro haverá um arquivo <strong>CSV</strong> (separado por <code>;</code>).</li>
                  <li>Abra no Excel/LibreCalc. As colunas relevantes são:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                      <li><code>CÓDIGO PROGRAMA ORÇAMENTÁRIO</code> — código do programa (ex: 5804)</li>
                      <li><code>CÓDIGO AÇÃO</code> — código da ação (ex: 21CS)</li>
                      <li><code>ORÇAMENTO INICIAL (R$)</code> — dotação inicial (LOA aprovada)</li>
                      <li><code>ORÇAMENTO ATUALIZADO (R$)</code> — dotação autorizada (com créditos adicionais)</li>
                    </ul>
                  </li>
                  <li>Filtre por código de programa para encontrar os valores de dotação.</li>
                </ol>
              </div>

              <div className="bg-background rounded border p-3 text-xs">
                <p className="font-semibold text-foreground mb-1">💡 Dica: fórmula de percentual de execução</p>
                <code className="text-primary">% Execução = (Pago ÷ Dotação Atualizada) × 100</code>
                <p className="text-muted-foreground mt-1">
                  Se a dotação atualizada for zero, usa-se a dotação inicial como referência.
                </p>
              </div>
            </div>

            {/* Caminho C: API */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">C</Badge> API do Portal da Transparência (consulta avançada)
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    Cadastre-se gratuitamente no{' '}
                    <a href="https://portaldatransparencia.gov.br/api-de-dados" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">
                      Portal da Transparência — API de Dados <ExternalLink className="w-3 h-3" />
                    </a>
                    {' '}para obter uma chave de API.
                  </li>
                  <li>Use o endpoint <code>/despesas/por-funcional-programatica</code>.</li>
                  <li>
                    Exemplo de consulta:<br />
                    <code className="text-xs break-all">
                      GET /api-de-dados/despesas/por-funcional-programatica?ano=2024&programa=5804&pagina=1
                    </code>
                  </li>
                  <li>
                    O JSON de resposta incluirá campos como: <code>dotacaoInicial</code>, <code>dotacaoAtualizada</code>,
                    <code> empenhado</code>, <code>liquidado</code>, <code>pago</code>.
                  </li>
                </ol>
              </div>
              <p className="text-xs text-muted-foreground">
                Esta é a fonte utilizada pelo sistema como complemento à LOA para registros que não possuem dotação no CSV.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ═══════════ FONTES E FÓRMULAS ═══════════ */}
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5" />
              Fontes dos Dados e Fórmula de Execução
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              De onde vem cada campo exibido no sistema e como o percentual de execução é calculado.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Tabela de fontes */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold text-foreground">Campo</th>
                    <th className="text-left p-2 font-semibold text-foreground">Fonte</th>
                    <th className="text-left p-2 font-semibold text-foreground">Uso</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-muted/50">
                    <td className="p-2 font-mono font-semibold text-foreground">dotacao_inicial</td>
                    <td className="p-2">CSV LOA (Dados Abertos)</td>
                    <td className="p-2">Baseline comparativo — "o que foi planejado na LOA aprovada"</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="p-2 font-mono font-semibold text-foreground">dotacao_autorizada</td>
                    <td className="p-2">CSV LOA + API Portal</td>
                    <td className="p-2">Denominador do % execução (inclui créditos adicionais/suplementares)</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="p-2 font-mono font-semibold text-foreground">empenhado</td>
                    <td className="p-2">API Portal da Transparência</td>
                    <td className="p-2">Reserva orçamentária (compromisso legal)</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="p-2 font-mono font-semibold text-foreground">liquidado</td>
                    <td className="p-2">API Portal da Transparência</td>
                    <td className="p-2">Reconhecimento da dívida (serviço prestado/bem entregue)</td>
                  </tr>
                  <tr className="border-b border-muted/50">
                    <td className="p-2 font-mono font-semibold text-foreground">pago</td>
                    <td className="p-2">API Portal da Transparência</td>
                    <td className="p-2"><strong className="text-foreground">Métrica primária</strong> — recurso efetivamente desembolsado</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono font-semibold text-foreground">percentual_execucao</td>
                    <td className="p-2">Calculado internamente</td>
                    <td className="p-2"><code className="text-primary">pago ÷ dotacao_autorizada × 100</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Esclarecimentos */}
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-xs text-muted-foreground">
                <p className="font-semibold text-sm text-foreground">📐 Fórmula de % Execução</p>
                <div className="bg-background rounded border p-3 text-center">
                  <code className="text-primary text-sm font-bold">% Execução = (Pago ÷ Dotação Autorizada) × 100</code>
                </div>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Se <code>dotacao_autorizada</code> = 0 ou nulo → usa <code>dotacao_inicial</code> como fallback</li>
                  <li>Se ambas = 0 → percentual fica <strong>nulo</strong> (não divide por zero)</li>
                </ul>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-sm text-foreground">📌 Esclarecimentos importantes</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Dotação Inicial</strong> (<code>ORÇAMENTO INICIAL (R$)</code>) — valor aprovado na Lei Orçamentária Anual.</li>
                  <li><strong>Dotação Autorizada</strong> (<code>ORÇAMENTO ATUALIZADO (R$)</code>) — valor após créditos adicionais e suplementares ao longo do exercício.</li>
                  <li>Ambos vêm do <strong>CSV da LOA</strong> (Dados Abertos) e são armazenados nos campos correspondentes.</li>
                  <li>O valor <strong>"Pago"</strong> vem exclusivamente da <strong>API do Portal da Transparência</strong> — a LOA só contém dotação, não execução.</li>
                </ul>
              </div>
            </div>

            {/* DESTAQUE: Orçamento Simbólico */}
            <div className="relative rounded-xl border-2 border-destructive/50 bg-destructive/5 p-5 space-y-3">
              <div className="absolute -top-3 left-4">
                <Badge variant="destructive" className="text-sm px-3 py-1 font-bold shadow-md">
                  ⚠ Indicador Crítico
                </Badge>
              </div>
              <div className="pt-2">
                <h4 className="text-base font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Orçamento Simbólico — Política no Papel Sem Entrega na Ponta
                </h4>
                <p className="text-sm text-muted-foreground mt-2">
                  O conceito de <strong>"Orçamento Simbólico"</strong> identifica registros onde existe <strong>dotação inicial prevista</strong> 
                  (a política foi planejada e aprovada na LOA), mas o valor <strong>pago é zero ou próximo de zero</strong>.
                </p>
                <div className="bg-background rounded-lg border p-4 mt-3 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono bg-primary/10 text-primary rounded px-2 py-1 text-xs">dotacao_inicial &gt; 0</span>
                    <span className="text-muted-foreground font-bold">+</span>
                    <span className="font-mono bg-destructive/10 text-destructive rounded px-2 py-1 text-xs">pago ≈ 0</span>
                    <span className="text-muted-foreground font-bold">=</span>
                    <Badge variant="destructive">Orçamento Simbólico</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Isso evidencia o <strong>hiato entre a previsão legal e a entrega efetiva</strong> do recurso. A política existe no papel
                    — foi debatida, aprovada pelo Congresso, alocada no PPA e na LOA — mas na prática, o dinheiro não chega à ponta.
                  </p>
                </div>
                <div className="mt-3 text-xs text-muted-foreground space-y-1">
                  <p><strong>Por que isso importa para o CERD?</strong></p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Demonstra que a <em>existência formal</em> de uma política não garante sua implementação efetiva.</li>
                    <li>Permite identificar padrões de <strong>subexecução sistemática</strong> em políticas de igualdade racial.</li>
                    <li>É evidência direta de descumprimento das obrigações sob a Convenção ICERD (Artigos 2 e 5).</li>
                    <li>Diferencia-se da ausência total de política: o Estado <em>reconheceu</em> a necessidade, mas <em>não entregou</em>.</li>
                  </ul>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ═══════════ PARTE 3: EXCLUSÕES ═══════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Parte 3 — O Que é Excluído (e Por Quê)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Para evitar a <strong>inflação artificial</strong> dos totais de política racial,
              o sistema exclui programas universais de grande escala que beneficiam a população em geral,
              sem recorte racial/étnico explícito.
            </p>

            <div>
              <p className="font-semibold mb-2">Programas universais excluídos:</p>
              <div className="space-y-1">
                {[
                  { cod: '2068', nome: 'Bolsa Família / Cadastro Único' },
                  { cod: '2049', nome: 'Moradia Digna / MCMV' },
                  { cod: '2012', nome: 'Fortalecimento SUS' },
                  { cod: '2015', nome: 'Fortalecimento SUAS' },
                  { cod: '5113', nome: 'Educação Superior (genérico, ~R$ 14 bi)' },
                ].map(p => (
                  <div key={p.cod} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded bg-destructive/5">
                    <code className="font-mono font-bold">{p.cod}</code>
                    <span className="text-muted-foreground">— {p.nome}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
              <strong>Critério geral:</strong> programas universais com orçamentos bilionários são excluídos a menos que
              possuam ações específicas com palavras-chave raciais/étnicas no título. Nesse caso, apenas a ação específica é incluída,
              não o programa inteiro.
            </p>
          </CardContent>
        </Card>

        {/* ═══════════ PARTE 4: CHECKLIST DE VERIFICAÇÃO ═══════════ */}
        <Card className="border-emerald-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Parte 4 — Checklist de Verificação Rápida
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Para verificar qualquer dado do sistema, siga estes passos:
            </p>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
              <li>
                <strong>Identifique o programa e ação:</strong> Na tabela do sistema, anote o código do programa
                (4 dígitos, ex: <code>5804</code>) e, se disponível, o código da ação (ex: <code>21CS</code>).
              </li>
              <li>
                <strong>Verifique no Portal da Transparência:</strong> Busque o programa em{' '}
                <a href={`${PORTAL_TRANSPARENCIA}/despesas/programa-e-acao`} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Despesas → Programa e Ação
                </a>.
                Compare <strong>Empenhado</strong>, <strong>Liquidado</strong> e <strong>Pago</strong>.
              </li>
              <li>
                <strong>Verifique a dotação:</strong> Baixe o CSV da LOA do ano correspondente em{' '}
                <a href={DADOS_ABERTOS} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  Dados Abertos
                </a>.
                Filtre por código de programa e compare <strong>Orçamento Inicial</strong> e <strong>Orçamento Atualizado</strong>.
              </li>
              <li>
                <strong>Se o valor no sistema for menor que no portal:</strong> Verifique se o portal está incluindo
                Restos a Pagar (RAP). O sistema exclui RAP por design.
              </li>
              <li>
                <strong>Se a dotação for zero mas houver execução:</strong> O registro provavelmente é de Receita Própria
                ou Projeto Especial (ex: compensações de Belo Monte, royalties). São extra-orçamentários por natureza.
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* ═══════════ LINKS DIRETOS ═══════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5" />
              Links Diretos para Portais Oficiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { nome: 'Portal da Transparência — Despesas', url: `${PORTAL_TRANSPARENCIA}/despesas` },
                { nome: 'Dados Abertos — Download LOA', url: DADOS_ABERTOS },
                { nome: 'API de Dados — Documentação', url: 'https://portaldatransparencia.gov.br/api-de-dados' },
                { nome: 'SIOP — Sistema de Orçamento', url: SIOP },
                { nome: 'PPA 2024–2027 — Agendas Transversais', url: 'https://www.gov.br/planejamento/pt-br/assuntos/plano-plurianual-ppa/ppa-2024-2027' },
                { nome: 'SICONFI — Dados Estaduais/Municipais', url: 'https://siconfi.tesouro.gov.br' },
              ].map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded border px-4 py-3 text-sm hover:bg-muted/50 transition-colors">
                  <span className="text-foreground">{link.nome}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
