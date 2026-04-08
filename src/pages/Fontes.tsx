import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { dataSources } from '@/data/mockData';
import { DataSourceCard } from '@/components/dashboard/DataSourceCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Search, Database, Globe, FileText, Download, Check, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';

const additionalSources = [
  {
    categoria: 'Segurança Pública',
    fontes: [
      { nome: 'Fórum Brasileiro de Segurança Pública - Anuários', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
      { nome: 'SINESP - Sistema Nacional de Estatísticas de Segurança Pública', url: 'https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/sinesp-1' },
      { nome: 'Atlas da Violência (IPEA/FBSP)', url: 'https://www.ipea.gov.br/atlasviolencia/' }
    ]
  },
  {
    categoria: 'Terras e Territórios',
    fontes: [
      { nome: 'FUNAI - Terras Indígenas', url: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas' },
      { nome: 'INCRA - Quilombolas', url: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas' },
      { nome: 'Fundação Palmares', url: 'https://www.palmares.gov.br/' }
    ]
  },
  {
    categoria: 'Saúde',
    fontes: [
      { nome: 'DataSUS - TabNet', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
      { nome: 'SIM - Óbitos por Causa e Raça/Cor', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/obt10uf.def' },
      { nome: 'SINASC - Nascidos Vivos por Raça/Cor', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def' },
      { nome: 'SESAI - Saúde Indígena', url: 'https://www.gov.br/saude/pt-br/composicao/sesai' }
    ]
  },
  {
    categoria: 'Educação',
    fontes: [
      { nome: 'INEP - Censo Escolar', url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar' },
      { nome: 'Censo da Educação Superior', url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior' },
      { nome: 'ENEM - Microdados', url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem' }
    ]
  },
  {
    categoria: 'Orçamento e Finanças',
    fontes: [
      { nome: 'SIOP - Sistema Integrado de Planejamento e Orçamento', url: 'https://www.siop.planejamento.gov.br/' },
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/' },
      { nome: 'SICONFI - Estados e Municípios', url: 'https://siconfi.tesouro.gov.br/' }
    ]
  },
  {
    categoria: 'Judiciário',
    fontes: [
      { nome: 'CNJ - Justiça em Números', url: 'https://www.cnj.jus.br/pesquisas-judiciarias/justica-em-numeros/' },
      { nome: 'STF - Jurisprudência', url: 'https://portal.stf.jus.br/jurisprudencia/' },
      { nome: 'STJ - Jurisprudência', url: 'https://scon.stj.jus.br/' }
    ]
  }
];

// Fontes oficiais com status de integração (merged from FontesDadosTab)
const fontesOficiais = [
  { categoria: 'Demográficos', fontes: [
    { nome: 'Censo Demográfico 2022', orgao: 'IBGE', status: 'integrado', indicadores: ['População por raça', 'Quilombolas', 'Indígenas'], url: 'https://censo2022.ibge.gov.br' },
    { nome: 'PNAD Contínua', orgao: 'IBGE', status: 'integrado', indicadores: ['Desemprego', 'Renda', 'Informalidade'], url: 'https://sidra.ibge.gov.br/pesquisa/pnadct' },
  ]},
  { categoria: 'Segurança Pública', fontes: [
    { nome: '19º Anuário Brasileiro de Segurança Pública', orgao: 'FBSP', status: 'integrado', indicadores: ['Homicídios por raça', 'Letalidade policial', 'Encarceramento'], url: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf' },
    { nome: 'Atlas da Violência 2025', orgao: 'IPEA/FBSP', status: 'integrado', indicadores: ['Taxa homicídio por raça', 'Risco relativo', 'IVJ-N'], url: 'https://www.ipea.gov.br/atlasviolencia/arquivos/artigos/5999-atlasdaviolencia2025.pdf' },
    { nome: 'SINESP', orgao: 'MJSP', status: 'parcial', indicadores: ['Ocorrências policiais', 'Prisões'], url: 'https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/sinesp-1' },
  ]},
  { categoria: 'Saúde', fontes: [
    { nome: 'SIM - Mortalidade Materna', orgao: 'MS/DataSUS', status: 'integrado', indicadores: ['Mortalidade materna por raça', 'Óbitos por causas externas'], url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def' },
    { nome: 'SINASC - Nascidos Vivos', orgao: 'MS/DataSUS', status: 'integrado', indicadores: ['Pré-natal', 'Mortalidade infantil'], url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def' },
    { nome: 'SESAI', orgao: 'MS', status: 'parcial', indicadores: ['Saúde indígena', 'Mortalidade indígena'], url: 'https://www.gov.br/saude/pt-br/composicao/sesai' },
  ]},
  { categoria: 'Educação', fontes: [
    { nome: 'SIDRA 7129 - Ensino Superior por Cor/Raça', orgao: 'IBGE/PNAD', status: 'integrado', indicadores: ['Nível de instrução por raça', 'Ensino superior completo'], url: 'https://sidra.ibge.gov.br/Tabela/7129' },
    { nome: 'SIDRA 7125 - Analfabetismo por Cor/Raça', orgao: 'IBGE/PNAD', status: 'integrado', indicadores: ['Taxa de analfabetismo por raça e idade'], url: 'https://sidra.ibge.gov.br/Tabela/7125' },
    { nome: 'Censo Escolar', orgao: 'INEP', status: 'integrado', indicadores: ['Matrículas por raça', 'Evasão', 'Distorção idade-série'], url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar' },
  ]},
  { categoria: 'Trabalho e Renda', fontes: [
    { nome: 'RAIS', orgao: 'MTE', status: 'integrado', indicadores: ['Emprego formal por raça', 'Salário médio'], url: 'http://bi.mte.gov.br/bgcaged/' },
    { nome: 'CadÚnico', orgao: 'MDS', status: 'integrado', indicadores: ['Famílias em pobreza', 'Bolsa Família'], url: 'https://aplicacoes.mds.gov.br/sagi/vis/data3/v.php' },
  ]},
  { categoria: 'Orçamento', fontes: [
    { nome: 'SIOP', orgao: 'MPO', status: 'integrado', indicadores: ['Execução orçamentária federal'], url: 'https://www.siop.planejamento.gov.br/' },
    { nome: 'SICONFI', orgao: 'STN', status: 'integrado', indicadores: ['Orçamento estados e municípios'], url: 'https://siconfi.tesouro.gov.br/' },
    { nome: 'Portal Transparência', orgao: 'CGU', status: 'integrado', indicadores: ['Gastos federais detalhados'], url: 'https://portaldatransparencia.gov.br/' },
  ]},
  { categoria: 'Terras e Territórios', fontes: [
    { nome: 'Terras Indígenas', orgao: 'FUNAI', status: 'integrado', indicadores: ['TIs demarcadas', 'TIs homologadas'], url: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas' },
    { nome: 'Quilombos', orgao: 'INCRA', status: 'integrado', indicadores: ['Comunidades certificadas', 'Títulos emitidos'], url: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas' },
    { nome: 'Fundação Palmares', orgao: 'MinC', status: 'integrado', indicadores: ['Certificações quilombolas'], url: 'https://www.palmares.gov.br/' },
  ]},
];

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
export default function Fontes() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSources = dataSources.filter(source =>
    searchTerm === '' ||
    source.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.orgaoResponsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Fontes de Dados"
      subtitle="Bases oficiais para atualização do Common Core e relatório CERD"
    >
      <div className="flex justify-end mb-3">
        <ExportTabButtons targetSelector="#export-fontes-dados" fileName="Fontes-de-Dados" compact />
      </div>
      <div id="export-fontes-dados">
      {/* Info Card */}
      <Card className="mb-6 bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Database className="w-10 h-10 text-primary-foreground/80" />
            <div>
              <h2 className="font-bold text-lg">Catálogo de Fontes Oficiais</h2>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Este catálogo reúne as principais bases de dados oficiais brasileiras com informações 
                desagregadas por raça/cor, necessárias para atualização do Common Core Document 
                e elaboração do IV Relatório CERD (2018-2025).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar fonte de dados..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 max-w-md"
        />
      </div>

      {/* Main Data Sources */}
      <h2 className="text-lg font-semibold mb-4">Bases Principais com Acesso Automatizado</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {filteredSources.map(source => (
          <DataSourceCard key={source.id} source={source} />
        ))}
      </div>

      {/* Additional Sources by Category */}
      <h2 className="text-lg font-semibold mb-4">Fontes Complementares por Área Temática</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {additionalSources.map(category => (
          <Card key={category.categoria}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {category.categoria}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.fontes.map((fonte, i) => (
                  <li key={i}>
                    <a
                      href={fonte.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {fonte.nome}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fontes Oficiais com Status de Integração */}
      <h2 className="text-lg font-semibold mt-8 mb-4">Fontes Oficiais por Área Temática — Status de Integração</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Fontes Integradas</p>
                <p className="text-2xl font-bold">19</p>
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

      <div className="space-y-6 mb-8">
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
                      <span key={j} className="text-xs bg-muted px-2 py-0.5 rounded">{ind}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cobertura Common Core */}
      <Card className="mb-8">
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
                <TableCell className="text-right"><Badge>81%</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Nota Metodológica */}
      <Card className="border-l-4 border-l-warning mb-8">
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

      {/* Download Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Microdados para Download
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/" target="_blank" rel="noopener noreferrer">
                <div className="text-left">
                  <p className="font-medium">Censo 2022</p>
                  <p className="text-xs text-muted-foreground">Microdados IBGE</p>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://ftp.ibge.gov.br/Trabalho_e_Rendimento/Pesquisa_Nacional_por_Amostra_de_Domicilios_continua/" target="_blank" rel="noopener noreferrer">
                <div className="text-left">
                  <p className="font-medium">PNAD Contínua</p>
                  <p className="text-xs text-muted-foreground">Trimestral IBGE</p>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://bi.mte.gov.br/bgcaged/caged_aju/caged_aju_basico_tab.php" target="_blank" rel="noopener noreferrer">
                <div className="text-left">
                  <p className="font-medium">RAIS/CAGED</p>
                  <p className="text-xs text-muted-foreground">Emprego formal MTE</p>
                </div>
              </a>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3" asChild>
              <a href="https://aplicacoes.mds.gov.br/sagi/vis/data3/v.php" target="_blank" rel="noopener noreferrer">
                <div className="text-left">
                  <p className="font-medium">CadÚnico</p>
                  <p className="text-xs text-muted-foreground">VIS Data MDS</p>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  );
}
