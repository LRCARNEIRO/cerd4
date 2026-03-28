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
    </DashboardLayout>
  );
}
