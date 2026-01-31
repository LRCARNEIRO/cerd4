import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { dataSources } from '@/data/mockData';
import { DataSourceCard } from '@/components/dashboard/DataSourceCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, Database, Globe, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const additionalSources = [
  {
    categoria: 'Segurança Pública',
    fontes: [
      { nome: 'Fórum Brasileiro de Segurança Pública', url: 'https://forumseguranca.org.br/' },
      { nome: 'SINESP - Sistema Nacional de Estatísticas de Segurança Pública', url: 'https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/sinesp-1' },
      { nome: 'Atlas da Violência (IPEA)', url: 'https://www.ipea.gov.br/atlasviolencia/' }
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
      { nome: 'SIM - Sistema de Informações sobre Mortalidade', url: 'https://datasus.saude.gov.br/' },
      { nome: 'SINASC - Nascidos Vivos', url: 'https://datasus.saude.gov.br/' },
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
