import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Database, Globe, FileText, Download, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { dataSources } from '@/data/mockData';

// Fontes oficiais com status de integração
const fontesOficiais = [
  {
    categoria: 'Demográficos',
    fontes: [
      { nome: 'Censo Demográfico 2022', orgao: 'IBGE', status: 'integrado', indicadores: ['População por raça', 'Quilombolas', 'Indígenas'], url: 'https://censo2022.ibge.gov.br' },
      { nome: 'PNAD Contínua', orgao: 'IBGE', status: 'integrado', indicadores: ['Desemprego', 'Renda', 'Informalidade'], url: 'https://sidra.ibge.gov.br/pesquisa/pnadct' },
    ]
  },
  {
    categoria: 'Segurança Pública',
    fontes: [
      { nome: '19º Anuário Brasileiro de Segurança Pública', orgao: 'FBSP', status: 'integrado', indicadores: ['Homicídios por raça', 'Letalidade policial', 'Encarceramento'], url: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf' },
      { nome: 'Atlas da Violência 2025', orgao: 'IPEA/FBSP', status: 'integrado', indicadores: ['Taxa homicídio por raça', 'Risco relativo', 'IVJ-N'], url: 'https://www.ipea.gov.br/atlasviolencia/arquivos/artigos/5999-atlasdaviolencia2025.pdf' },
      { nome: 'SINESP', orgao: 'MJSP', status: 'parcial', indicadores: ['Ocorrências policiais', 'Prisões'], url: 'https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/sinesp-1' },
    ]
  },
  {
    categoria: 'Saúde',
    fontes: [
      { nome: 'SIM - Mortalidade Materna', orgao: 'MS/DataSUS', status: 'integrado', indicadores: ['Mortalidade materna por raça', 'Óbitos por causas externas'], url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def' },
      { nome: 'SINASC - Nascidos Vivos', orgao: 'MS/DataSUS', status: 'integrado', indicadores: ['Pré-natal', 'Mortalidade infantil'], url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def' },
      { nome: 'SESAI', orgao: 'MS', status: 'parcial', indicadores: ['Saúde indígena', 'Mortalidade indígena'], url: 'https://www.gov.br/saude/pt-br/composicao/sesai' },
    ]
  },
  {
    categoria: 'Educação',
    fontes: [
      { nome: 'SIDRA 7129 - Ensino Superior por Cor/Raça', orgao: 'IBGE/PNAD', status: 'integrado', indicadores: ['Nível de instrução por raça', 'Ensino superior completo'], url: 'https://sidra.ibge.gov.br/Tabela/7129' },
      { nome: 'SIDRA 7125 - Analfabetismo por Cor/Raça', orgao: 'IBGE/PNAD', status: 'integrado', indicadores: ['Taxa de analfabetismo por raça e idade'], url: 'https://sidra.ibge.gov.br/Tabela/7125' },
      { nome: 'Censo Escolar', orgao: 'INEP', status: 'integrado', indicadores: ['Matrículas por raça', 'Evasão', 'Distorção idade-série'], url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar' },
      { nome: 'Censo Superior', orgao: 'INEP', status: 'integrado', indicadores: ['Ingressantes cotas', 'Concluintes por raça'], url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior' },
    ]
  },
  {
    categoria: 'Trabalho e Renda',
    fontes: [
      { nome: 'RAIS', orgao: 'MTE', status: 'integrado', indicadores: ['Emprego formal por raça', 'Salário médio'], url: 'http://bi.mte.gov.br/bgcaged/' },
      { nome: 'CadÚnico', orgao: 'MDS', status: 'integrado', indicadores: ['Famílias em pobreza', 'Bolsa Família'], url: 'https://aplicacoes.mds.gov.br/sagi/vis/data3/v.php' },
    ]
  },
  {
    categoria: 'Orçamento',
    fontes: [
      { nome: 'SIOP', orgao: 'MPO', status: 'integrado', indicadores: ['Execução orçamentária federal'], url: 'https://www.siop.planejamento.gov.br/' },
      { nome: 'SICONFI', orgao: 'STN', status: 'integrado', indicadores: ['Orçamento estados e municípios'], url: 'https://siconfi.tesouro.gov.br/' },
      { nome: 'Portal Transparência', orgao: 'CGU', status: 'integrado', indicadores: ['Gastos federais detalhados'], url: 'https://portaldatransparencia.gov.br/' },
    ]
  },
  {
    categoria: 'Terras e Territórios',
    fontes: [
      { nome: 'Terras Indígenas', orgao: 'FUNAI', status: 'integrado', indicadores: ['TIs demarcadas', 'TIs homologadas'], url: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas' },
      { nome: 'Quilombos', orgao: 'INCRA', status: 'integrado', indicadores: ['Comunidades certificadas', 'Títulos emitidos'], url: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas' },
      { nome: 'Fundação Palmares', orgao: 'MinC', status: 'integrado', indicadores: ['Certificações quilombolas'], url: 'https://www.palmares.gov.br/' },
    ]
  },
];

// Indicadores mapeados do Common Core
const indicadoresCommonCore = [
  { secao: 'I.A', titulo: 'Características demográficas', indicadores: 12, integrados: 10 },
  { secao: 'I.B', titulo: 'Indicadores socioeconômicos', indicadores: 18, integrados: 15 },
  { secao: 'II.A', titulo: 'Sistema político', indicadores: 8, integrados: 6 },
  { secao: 'II.B', titulo: 'Estrutura institucional', indicadores: 10, integrados: 8 },
  { secao: 'III', titulo: 'Quadro jurídico', indicadores: 15, integrados: 12 },
];

const statusColors: Record<string, string> = {
  integrado: 'bg-success text-success-foreground',
  parcial: 'bg-warning text-warning-foreground',
  pendente: 'bg-destructive text-destructive-foreground',
};

const statusLabels: Record<string, string> = {
  integrado: 'Integrado',
  parcial: 'Parcial',
  pendente: 'Pendente',
};

export function FontesDadosTab() {
  return (
    <div className="space-y-6">
      {/* Resumo de integração */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Fontes Integradas</p>
                <p className="text-2xl font-bold">16</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-warning" />
              <div>
                <p className="text-xs text-muted-foreground">Integração Parcial</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Indicadores no BD</p>
                <p className="text-2xl font-bold">78</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Common Core (%)</p>
                <p className="text-2xl font-bold">81%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Common Core */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Cobertura do Common Core Document (HRI/CORE)
          </CardTitle>
          <CardDescription>Indicadores exigidos pela ONU vs. integrados no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seção</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="text-right">Exigidos</TableHead>
                <TableHead className="text-right">Integrados</TableHead>
                <TableHead className="text-right">Cobertura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicadoresCommonCore.map(item => (
                <TableRow key={item.secao}>
                  <TableCell className="font-mono font-medium">{item.secao}</TableCell>
                  <TableCell>{item.titulo}</TableCell>
                  <TableCell className="text-right">{item.indicadores}</TableCell>
                  <TableCell className="text-right text-success font-medium">{item.integrados}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={item.integrados / item.indicadores >= 0.8 ? 'default' : 'secondary'}>
                      {Math.round(item.integrados / item.indicadores * 100)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/50">
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell className="text-right">{indicadoresCommonCore.reduce((acc, i) => acc + i.indicadores, 0)}</TableCell>
                <TableCell className="text-right text-success">{indicadoresCommonCore.reduce((acc, i) => acc + i.integrados, 0)}</TableCell>
                <TableCell className="text-right">
                  <Badge>81%</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fontes por categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Fontes Oficiais por Área Temática
          </CardTitle>
          <CardDescription>Status de integração com o banco de dados do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {fontesOficiais.map(categoria => (
              <div key={categoria.categoria}>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  {categoria.categoria}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoria.fontes.map((fonte, i) => (
                    <div key={i} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{fonte.nome}</span>
                            <Badge className={`text-xs ${statusColors[fonte.status]}`}>
                              {statusLabels[fonte.status]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{fonte.orgao}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={fonte.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {fonte.indicadores.map((ind, j) => (
                          <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded">
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bases do sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Bases Automatizadas do Sistema
          </CardTitle>
          <CardDescription>Fontes com acesso direto configurado para atualização automática</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sigla</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Órgão</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Periodicidade</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSources.slice(0, 10).map(source => (
                <TableRow key={source.id}>
                  <TableCell className="font-mono font-medium">{source.sigla}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{source.nomeCompleto}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{source.orgaoResponsavel}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{source.tipoAcesso}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{source.periodicidade}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={source.urlAcesso} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Nota metodológica */}
      <Card className="border-l-4 border-l-warning">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Nota Metodológica</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Os dados exibidos nesta seção são provenientes das fontes oficiais indicadas e foram 
                integrados ao sistema através de APIs públicas, downloads automatizados ou entrada manual. 
                Para cada indicador, a fonte, data de referência e URL de acesso são preservados para 
                garantir a rastreabilidade exigida pelo Comitê CERD da ONU.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
