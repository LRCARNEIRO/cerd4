import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Scale, 
  Building2, 
  FileCheck, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Search,
  Plus,
  FolderOpen
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DataUploadButton } from '@/components/dashboard/DataUploadButton';

// Tipos de documentos aceitos
const tiposDocumentos = [
  { ext: 'PDF', desc: 'Documentos oficiais, legislação' },
  { ext: 'DOCX', desc: 'Relatórios, pareceres' },
  { ext: 'XLSX', desc: 'Planilhas de dados' },
  { ext: 'CSV', desc: 'Dados tabulares' },
  { ext: 'JSON', desc: 'Dados estruturados' },
  { ext: 'TXT', desc: 'Textos simples' },
];

// Categorias normativas (Meta 1 e 2)
const categoriasNormativas = [
  {
    id: 'legislacao',
    titulo: 'Legislação Antidiscriminatória',
    descricao: 'Leis, decretos e normas federais, estaduais e municipais',
    icon: Scale,
    meta: 'Meta 1',
    documentos: 24,
    atualizados: 18,
    cor: 'bg-blue-500'
  },
  {
    id: 'institucional',
    titulo: 'Estrutura Institucional',
    descricao: 'Órgãos, conselhos, comissões e mecanismos de proteção',
    icon: Building2,
    meta: 'Meta 1',
    documentos: 15,
    atualizados: 12,
    cor: 'bg-green-500'
  },
  {
    id: 'politicas',
    titulo: 'Políticas Públicas',
    descricao: 'Programas, planos e ações governamentais',
    icon: FileCheck,
    meta: 'Meta 2',
    documentos: 32,
    atualizados: 25,
    cor: 'bg-purple-500'
  },
  {
    id: 'jurisprudencia',
    titulo: 'Jurisprudência',
    descricao: 'Decisões judiciais e precedentes relevantes',
    icon: FileText,
    meta: 'Meta 2',
    documentos: 8,
    atualizados: 5,
    cor: 'bg-amber-500'
  }
];

// Documentos recentes (mock)
const documentosRecentes = [
  {
    id: '1',
    titulo: 'Lei 12.288/2010 - Estatuto da Igualdade Racial',
    categoria: 'legislacao',
    dataUpload: '2024-01-15',
    status: 'processado',
    tamanho: '1.2 MB'
  },
  {
    id: '2',
    titulo: 'Decreto 11.443/2023 - Política Nacional de Direitos Humanos',
    categoria: 'institucional',
    dataUpload: '2024-01-10',
    status: 'processado',
    tamanho: '856 KB'
  },
  {
    id: '3',
    titulo: 'Portaria MDHC 523/2024 - Conselho Nacional de Promoção da Igualdade Racial',
    categoria: 'institucional',
    dataUpload: '2024-01-08',
    status: 'pendente',
    tamanho: '420 KB'
  },
  {
    id: '4',
    titulo: 'PPA 2024-2027 - Programas de Igualdade Racial',
    categoria: 'politicas',
    dataUpload: '2024-01-05',
    status: 'processado',
    tamanho: '3.5 MB'
  }
];

export default function Normativa() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  const totalDocumentos = categoriasNormativas.reduce((acc, cat) => acc + cat.documentos, 0);
  const totalAtualizados = categoriasNormativas.reduce((acc, cat) => acc + cat.atualizados, 0);
  const percentualCompleto = Math.round((totalAtualizados / totalDocumentos) * 100);

  return (
    <DashboardLayout
      title="Base Normativa/Institucional"
      subtitle="Gestão de dados jurídicos e institucionais para Meta 1 e Meta 2 do CERD IV"
    >
      {/* Alerta sobre equipe externa */}
      <Card className="mb-6 border-l-4 border-l-amber-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Base em Desenvolvimento Externo</h3>
              <p className="text-sm text-muted-foreground">
                Esta base de dados está sendo desenvolvida por uma equipe jurídica especializada. 
                Use o botão de upload abaixo para carregar os documentos e dados fornecidos pela equipe.
                Os dados serão processados e integrados ao dashboard automaticamente.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">Meta 1 - Legislação</Badge>
                <Badge variant="outline">Meta 2 - Políticas</Badge>
                <Badge className="bg-amber-500/10 text-amber-600">Equipe Externa</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de Upload */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Dados
          </CardTitle>
          <CardDescription>
            Carregue documentos e dados da equipe jurídica para alimentar o banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-2">
              Arraste arquivos ou clique para fazer upload
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Formatos aceitos: PDF, DOCX, XLSX, CSV, JSON, TXT
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {tiposDocumentos.map(tipo => (
                <Badge key={tipo.ext} variant="secondary" className="text-xs">
                  {tipo.ext}
                </Badge>
              ))}
            </div>
            <DataUploadButton />
          </div>
        </CardContent>
      </Card>

      {/* Progresso Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total de Documentos</span>
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalDocumentos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Processados</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{totalAtualizados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pendentes</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{totalDocumentos - totalAtualizados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
            </div>
            <p className="text-2xl font-bold">{percentualCompleto}%</p>
            <Progress value={percentualCompleto} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categoriasNormativas.map(categoria => {
          const Icon = categoria.icon;
          const progresso = Math.round((categoria.atualizados / categoria.documentos) * 100);
          
          return (
            <Card 
              key={categoria.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategoria === categoria.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategoria(
                selectedCategoria === categoria.id ? null : categoria.id
              )}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${categoria.cor}/10`}>
                    <Icon className={`w-5 h-5 ${categoria.cor.replace('bg-', 'text-')}`} />
                  </div>
                  <Badge variant="outline" className="text-xs">{categoria.meta}</Badge>
                </div>
                <h3 className="font-medium text-sm mb-1">{categoria.titulo}</h3>
                <p className="text-xs text-muted-foreground mb-3">{categoria.descricao}</p>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span>{categoria.atualizados}/{categoria.documentos} documentos</span>
                  <span className="font-medium">{progresso}%</span>
                </div>
                <Progress value={progresso} className="h-1.5" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Documentos Recentes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar documentos..." 
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentosRecentes
              .filter(doc => 
                doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (!selectedCategoria || doc.categoria === selectedCategoria)
              )
              .map(doc => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{doc.titulo}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(doc.dataUpload).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{doc.tamanho}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={doc.status === 'processado' ? 'default' : 'secondary'}
                      className={doc.status === 'processado' ? 'bg-green-500' : ''}
                    >
                      {doc.status === 'processado' ? 'Processado' : 'Pendente'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          {documentosRecentes.filter(doc => 
            doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (!selectedCategoria || doc.categoria === selectedCategoria)
          ).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum documento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requisitos CERD */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Requisitos CERD IV - Base Normativa</CardTitle>
          <CardDescription>
            Exigências do Comitê para Meta 1 (Legislação) e Meta 2 (Políticas Institucionais)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="meta1">
            <TabsList>
              <TabsTrigger value="meta1">Meta 1 - Legislação</TabsTrigger>
              <TabsTrigger value="meta2">Meta 2 - Políticas</TabsTrigger>
            </TabsList>
            <TabsContent value="meta1" className="mt-4">
              <div className="space-y-3">
                {[
                  'Leis antidiscriminatórias federais, estaduais e municipais',
                  'Legislação específica para povos indígenas e comunidades quilombolas',
                  'Normas sobre tipificação do crime de racismo',
                  'Legislação sobre ações afirmativas',
                  'Tratados internacionais ratificados'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="meta2" className="mt-4">
              <div className="space-y-3">
                {[
                  'Instituições nacionais de direitos humanos',
                  'Órgãos de promoção da igualdade racial',
                  'Mecanismos de denúncia e reparação',
                  'Programas de educação em direitos humanos',
                  'Políticas de combate ao discurso de ódio'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
