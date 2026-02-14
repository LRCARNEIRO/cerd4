import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Upload, AlertTriangle, CheckCircle, ExternalLink, Info, Download, FileSpreadsheet, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const LACUNAS = [
  {
    id: 'funai',
    grupo: 'Povos Indígenas (FUNAI)',
    orgao: 'FUNAI',
    grupo_focal: 'indigenas',
    eixo_tematico: 'terra_territorio',
    anos_faltantes: [2020, 2021, 2022, 2023],
    acoes: [
      { codigo: '20UF', nome: 'Promoção dos Direitos dos Povos Indígenas' },
      { codigo: '2384', nome: 'Fiscalização de Terras Indígenas' },
      { codigo: '215O', nome: 'Gestão Ambiental e Territorial Indígena' },
      { codigo: '215Q', nome: 'Demarcação de Terras Indígenas' },
      { codigo: '214V', nome: 'Proteção de Índios Isolados' },
    ],
    url_portal: (ano: number) =>
      `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&programa=2065`,
    url_dotacao: (ano: number) =>
      `https://portaldatransparencia.gov.br/despesas/consulta?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&orgaos=OR27000`,
    instrucoes: 'Dois passos: (1) No link "Execução" obtenha Empenhado, Liquidado e Pago por ação. (2) No link "Dotação" obtenha Dotação Inicial e Autorizada na consulta detalhada por órgão.',
  },
  {
    id: 'sesai',
    grupo: 'Saúde Indígena (SESAI)',
    orgao: 'SESAI',
    grupo_focal: 'saude_indigena',
    eixo_tematico: 'saude',
    anos_faltantes: [2020, 2021, 2022, 2023, 2024, 2025],
    acoes: [
      { codigo: '20YP', nome: 'Atenção à Saúde dos Povos Indígenas' },
      { codigo: '7684', nome: 'Saneamento Básico em Aldeias Indígenas' },
    ],
    url_portal: (ano: number) =>
      `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&acao=20YP`,
    url_dotacao: (ano: number) =>
      `https://portaldatransparencia.gov.br/despesas/consulta?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&orgaos=OR36000`,
    instrucoes: 'Dois passos: (1) Link "Execução" para Empenhado/Liquidado/Pago. (2) Link "Dotação" para valores de dotação. Dados segregados como Saúde Indígena.',
  },
  {
    id: 'quilombolas',
    grupo: 'Territórios Quilombolas (INCRA)',
    orgao: 'INCRA',
    grupo_focal: 'quilombolas',
    eixo_tematico: 'terra_territorio',
    anos_faltantes: [2020, 2021, 2022, 2023],
    acoes: [
      { codigo: '20G7', nome: 'Regularização Fundiária de Territórios Quilombolas' },
      { codigo: '0859', nome: 'Indenização de Benfeitorias em Territórios Quilombolas' },
    ],
    url_portal: (ano: number) =>
      `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&acao=20G7`,
    url_dotacao: (ano: number) =>
      `https://portaldatransparencia.gov.br/despesas/consulta?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&orgaos=OR22000`,
    instrucoes: 'Dois passos: (1) Link "Execução" para Empenhado/Liquidado/Pago das ações 20G7 e 0859. (2) Link "Dotação" para valores de dotação do INCRA.',
  },
];

const CSV_TEMPLATE = `ano;orgao;programa;acao;dotacao_inicial;dotacao_autorizada;empenhado;liquidado;pago
2020;FUNAI;2065 – Proteção dos Povos Indígenas;20UF – Promoção dos Direitos;0;0;0;0;0
2020;SESAI;2065 – Proteção dos Povos Indígenas;20YP – Atenção à Saúde;0;0;0;0;0
2020;INCRA;0153 – Promoção e Defesa dos Direitos;20G7 – Regularização Quilombola;0;0;0;0;0`;

interface PreviewRow {
  ano: number;
  orgao: string;
  programa: string;
  acao: string;
  dotacao_inicial: number | null;
  dotacao_autorizada: number | null;
  empenhado: number | null;
  liquidado: number | null;
  pago: number | null;
}

export function ManualGapFiller() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'guide' | 'upload' | 'preview' | 'importing' | 'done'>('guide');
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const reset = () => {
    setStep('guide');
    setPreview([]);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const copyTemplate = () => {
    navigator.clipboard.writeText(CSV_TEMPLATE);
    toast.success('Template CSV copiado para a área de transferência');
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_lacunas_indigenas_quilombolas.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseBRL = (val: string): number | null => {
    if (!val || val.trim() === '' || val.trim() === '0') return null;
    const num = Number(val.replace(/\./g, '').replace(',', '.'));
    return isNaN(num) || num === 0 ? null : num;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      toast.error('CSV deve ter ao menos 1 linha de dados + cabeçalho');
      return;
    }

    const sep = lines[0].includes(';') ? ';' : ',';
    const header = lines[0].split(sep).map(h => h.trim().toLowerCase());
    const rows: PreviewRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(sep).map(c => c.trim());
      const get = (name: string) => cols[header.indexOf(name)] || '';

      const ano = Number(get('ano'));
      if (!ano || ano < 2018 || ano > 2026) continue;

      rows.push({
        ano,
        orgao: get('orgao') || 'FUNAI',
        programa: get('programa') || '',
        acao: get('acao') || '',
        dotacao_inicial: parseBRL(get('dotacao_inicial')),
        dotacao_autorizada: parseBRL(get('dotacao_autorizada')),
        empenhado: parseBRL(get('empenhado')),
        liquidado: parseBRL(get('liquidado')),
        pago: parseBRL(get('pago')),
      });
    }

    if (rows.length === 0) {
      toast.error('Nenhum registro válido encontrado no CSV');
      return;
    }

    setPreview(rows);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('import-gap-data', {
        body: { registros: preview },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Erro');

      setResult({ inserted: data.inserted, errors: data.errors || [] });
      setStep('done');
      queryClient.invalidateQueries();
      toast.success(`${data.inserted} registros inseridos para preencher lacunas`);
    } catch (err) {
      toast.error(`Erro: ${err instanceof Error ? err.message : 'Falha'}`);
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (v: number | null) =>
    v ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v) : '—';

  return (
    <>
      <Button onClick={() => { setIsOpen(true); reset(); }} variant="outline" size="sm" className="gap-2">
        <AlertTriangle className="w-4 h-4 text-warning" />
        Preencher Lacunas
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Preenchimento Manual de Lacunas Orçamentárias
            </DialogTitle>
            <DialogDescription>
              Dados de FUNAI, SESAI e INCRA para 2020-2023 não retornados pela API automática.
            </DialogDescription>
          </DialogHeader>

          <div>
            <div className="space-y-4 pb-4">

              {/* Step 1: Guide */}
              {step === 'guide' && (
                <>
                  <Card className="border-warning/30 bg-warning/5">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium">Lacunas Identificadas na Série Histórica</p>
                          <p className="text-muted-foreground">
                            A API do Portal da Transparência não retorna dados de FUNAI, SESAI e INCRA para
                            os anos 2020–2023 nos endpoints utilizados. Esta ferramenta permite o preenchimento
                            manual com dados verificados diretamente no portal.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Per-lacuna guides */}
                  {LACUNAS.map(lac => (
                    <Card key={lac.id} className="border-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{lac.orgao}</Badge>
                          {lac.grupo}
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {lac.anos_faltantes.join(', ')}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-xs text-muted-foreground">{lac.instrucoes}</div>

                        <div className="text-xs">
                          <p className="font-medium mb-1">Ações a buscar:</p>
                          <div className="flex flex-wrap gap-1">
                            {lac.acoes.map(a => (
                              <Badge key={a.codigo} variant="secondary" className="text-xs">
                                {a.codigo} – {a.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs">
                          <p className="font-medium mb-1">Passo a passo:</p>
                          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                             <li>No link <strong>"Execução"</strong>: obtenha Empenhado, Liquidado e Pago por ação</li>
                             <li>No link <strong>"Dotação"</strong>: obtenha Dotação Inicial e Autorizada na consulta por órgão</li>
                             <li>Preencha o CSV template com todos os valores encontrados</li>
                           </ol>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {lac.anos_faltantes.map(ano => (
                            <div key={ano} className="flex items-center gap-0.5">
                              <a
                                href={lac.url_portal(ano)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2 py-1 rounded-l"
                              >
                                <ExternalLink className="w-3 h-3" />
                                {ano} Execução
                              </a>
                              <a
                                href={lac.url_dotacao(ano)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-warning hover:underline bg-warning/5 px-2 py-1 rounded-r"
                              >
                                Dotação
                              </a>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Template download */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4 space-y-3">
                      <p className="text-sm font-medium">Template CSV</p>
                      <p className="text-xs text-muted-foreground">
                        Use o template abaixo como base. Dados de execução (Empenhado, Liquidado, Pago) vêm do endpoint
                        "Programa e Ação". Dados de dotação vêm da "Consulta de Despesas" por órgão.
                        Separador: ponto-e-vírgula (;). Valores em reais sem separador de milhar.
                      </p>
                      <pre className="text-[10px] bg-muted p-3 rounded-lg overflow-x-auto whitespace-pre">
                        {CSV_TEMPLATE}
                      </pre>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={copyTemplate}>
                          <Copy className="w-3 h-3" /> Copiar template
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={downloadTemplate}>
                          <Download className="w-3 h-3" /> Baixar CSV
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={() => setStep('upload')} className="w-full gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Já tenho o CSV preenchido, prosseguir para upload
                  </Button>
                </>
              )}

              {/* Step 2: Upload */}
              {step === 'upload' && (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.txt,.tsv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Clique para selecionar o CSV preenchido</p>
                      <p className="text-xs text-muted-foreground">CSV com separador ; ou ,</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep('guide')}>
                    ← Voltar ao guia
                  </Button>
                </div>
              )}

              {/* Step 3: Preview */}
              {step === 'preview' && preview.length > 0 && (
                <div className="space-y-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="default">{preview.length} registros</Badge>
                        <span className="text-xs text-muted-foreground">prontos para importação</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                         <TableHead className="text-xs">Ano</TableHead>
                          <TableHead className="text-xs">Órgão</TableHead>
                          <TableHead className="text-xs">Programa/Ação</TableHead>
                          <TableHead className="text-xs text-right">Dot. Inicial</TableHead>
                          <TableHead className="text-xs text-right">Dot. Autorizada</TableHead>
                          <TableHead className="text-xs text-right">Pago</TableHead>
                         </TableRow>
                       </TableHeader>
                      <TableBody>
                        {preview.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs">{row.ano}</TableCell>
                            <TableCell className="text-xs">{row.orgao}</TableCell>
                            <TableCell className="text-xs max-w-[200px] truncate">
                              {row.programa} / {row.acao}
                            </TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency(row.dotacao_inicial)}</TableCell>
                             <TableCell className="text-xs text-right">{formatCurrency(row.dotacao_autorizada)}</TableCell>
                             <TableCell className="text-xs text-right">{formatCurrency(row.pago)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={reset}>← Voltar</Button>
                    <Button onClick={handleImport} className="flex-1 gap-2">
                      <Upload className="w-4 h-4" />
                      Importar {preview.length} registros
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Importing */}
              {step === 'importing' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Inserindo registros...</p>
                </div>
              )}

              {/* Step 5: Done */}
              {step === 'done' && result && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                    <p className="font-medium">{result.inserted} registros inseridos!</p>
                    <p className="text-xs text-muted-foreground">Lacunas preenchidas com dados verificados manualmente.</p>
                  </div>
                  {result.errors.length > 0 && (
                    <Card className="border-destructive/50">
                      <CardContent className="pt-4">
                        <p className="text-xs font-medium text-destructive">{result.errors.length} erro(s):</p>
                        {result.errors.slice(0, 5).map((e, i) => (
                          <p key={i} className="text-xs text-muted-foreground">{e}</p>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  <Button onClick={() => { reset(); setIsOpen(false); }} className="w-full">Fechar</Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
