import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, AlertTriangle, CheckCircle, ExternalLink, Info, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const LACUNAS = [
  {
    id: 'funai',
    label: 'FUNAI – Povos Indígenas',
    orgao: 'FUNAI',
    grupo_focal: 'indigenas',
    eixo_tematico: 'terra_territorio',
    anos: [2020, 2021, 2022, 2023],
    url_portal: (ano: number) =>
      `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&programa=2065`,
  },
  {
    id: 'sesai',
    label: 'SESAI – Saúde Indígena',
    orgao: 'SESAI',
    grupo_focal: 'saude_indigena',
    eixo_tematico: 'saude',
    anos: [2020, 2021, 2022, 2023, 2024, 2025],
    url_portal: (ano: number) =>
      `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&acao=20YP`,
  },
  {
    id: 'quilombolas',
    label: 'INCRA – Territórios Quilombolas',
    orgao: 'INCRA',
    grupo_focal: 'quilombolas',
    eixo_tematico: 'terra_territorio',
    anos: [2020, 2021, 2022, 2023],
    url_portal: (ano: number) =>
      `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&acao=20G7`,
  },
];

interface ParsedRow {
  ano: number;
  orgao: string;
  programa: string;
  acao: string;
  empenhado: number | null;
  liquidado: number | null;
  pago: number | null;
}

/**
 * Normalise a Portal da Transparência header name so we can match it
 * regardless of accents, casing or minor wording variations.
 */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

/** Map of normalised Portal CSV header → semantic key */
const COLUMN_MAP: Record<string, string> = {
  // Ano
  anodoexercicio: 'ano',
  anoexercicio: 'ano',
  ano: 'ano',

  // Programa
  nomeprograma: 'programa',
  codigoprogramanomeprograma: 'programa',
  programa: 'programa',
  codigoprograma: 'cod_programa',

  // Ação
  nomeacao: 'acao',
  codigoacaonomeacao: 'acao',
  acao: 'acao',
  codigoacao: 'cod_acao',

  // Órgão
  nomeorgaoentidadevinculada: 'orgao_nome',
  nomeorgao: 'orgao_nome',
  orgao: 'orgao_nome',
  nomeorgaosuperior: 'orgao_superior',
  codigoorgaoentidadevinculada: 'cod_orgao',

  // Financeiro
  despesasempenhadas: 'empenhado',
  empenhado: 'empenhado',
  valorempenhado: 'empenhado',
  despesasliquidadas: 'liquidado',
  liquidado: 'liquidado',
  valorliquidado: 'liquidado',
  despesaspagas: 'pago',
  pago: 'pago',
  valorpago: 'pago',
};

const parseBRL = (val: string): number | null => {
  if (!val || val.trim() === '' || val.trim() === '0') return null;
  // Portal format: "1.234.567,89" or just "1234567.89"
  let cleaned = val.trim();
  // If has both . and , assume pt-BR: dots=thousands, comma=decimal
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.');
  }
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
};

export function ManualGapFiller() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrgao, setSelectedOrgao] = useState<string>('');
  const [step, setStep] = useState<'select' | 'upload' | 'preview' | 'importing' | 'done'>('select');
  const [preview, setPreview] = useState<ParsedRow[]>([]);
  const [rawFileName, setRawFileName] = useState('');
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const lacuna = LACUNAS.find(l => l.id === selectedOrgao);

  const reset = () => {
    setStep('select');
    setPreview([]);
    setResult(null);
    setRawFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lacuna) return;
    setRawFileName(file.name);

    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      toast.error('CSV deve ter ao menos 1 linha de dados + cabeçalho');
      return;
    }

    // Detect separator
    const sep = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';

    // Build column index from header
    const rawHeaders = lines[0].split(sep).map(h => h.replace(/^"|"$/g, '').trim());
    const colIndex: Record<string, number> = {};
    rawHeaders.forEach((h, i) => {
      const key = COLUMN_MAP[norm(h)];
      if (key && !(key in colIndex)) colIndex[key] = i;
    });

    // Check minimum required columns
    const hasEmpenhado = 'empenhado' in colIndex;
    const hasPago = 'pago' in colIndex;
    if (!hasEmpenhado && !hasPago) {
      toast.error('CSV não contém colunas de valores financeiros reconhecíveis (Empenhado/Liquidado/Pago)', {
        description: `Colunas encontradas: ${rawHeaders.slice(0, 8).join(', ')}...`,
        duration: 8000,
      });
      return;
    }

    const get = (cols: string[], key: string) => {
      const idx = colIndex[key];
      return idx !== undefined ? (cols[idx] || '').replace(/^"|"$/g, '').trim() : '';
    };

    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(sep).map(c => c.trim());

      // Try to get ano from CSV, fallback to detecting from filename or use 0
      let ano = Number(get(cols, 'ano'));
      if (!ano || ano < 2018 || ano > 2026) {
        // Try extracting year from filename (e.g. "2020_despesas.csv")
        const yearMatch = file.name.match(/(20[12]\d)/);
        if (yearMatch) ano = Number(yearMatch[1]);
        else continue; // skip if can't determine year
      }

      const programa = get(cols, 'programa') || get(cols, 'cod_programa') || '';
      const acao = get(cols, 'acao') || get(cols, 'cod_acao') || '';

      const empenhado = parseBRL(get(cols, 'empenhado'));
      const liquidado = parseBRL(get(cols, 'liquidado'));
      const pago = parseBRL(get(cols, 'pago'));

      // Skip rows with all-zero values
      if (!empenhado && !liquidado && !pago) continue;

      rows.push({
        ano,
        orgao: lacuna.orgao,
        programa,
        acao,
        empenhado,
        liquidado,
        pago,
      });
    }

    if (rows.length === 0) {
      toast.error('Nenhum registro com valores financeiros encontrado no CSV');
      return;
    }

    setPreview(rows);
    setStep('preview');
    toast.success(`${rows.length} registros extraídos do CSV do Portal`);
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
      toast.success(`${data.inserted} registros inseridos de ${lacuna?.orgao}`);
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
              Preencher Lacunas – Upload CSV do Portal
            </DialogTitle>
            <DialogDescription>
              Faça download do CSV diretamente do Portal da Transparência e suba aqui. O sistema extrai automaticamente os dados de execução.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pb-4">

            {/* Step 1: Select orgão */}
            {step === 'select' && (
              <>
                <Card className="border-warning/30 bg-warning/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                      <div className="text-sm space-y-1">
                        <p className="font-medium">Fluxo simplificado</p>
                        <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5">
                          <li>Selecione o órgão abaixo</li>
                          <li>Acesse o link do Portal para cada ano</li>
                          <li>Clique em <strong>"Download"</strong> na página de resultados do Portal</li>
                          <li>Suba o CSV baixado aqui — o sistema extrai tudo automaticamente</li>
                        </ol>
                        <p className="text-xs text-muted-foreground italic mt-1">
                          💡 Dotação será preenchida automaticamente pela ingestão de dados abertos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Selecione o órgão / lacuna:</label>
                  <Select value={selectedOrgao} onValueChange={setSelectedOrgao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha FUNAI, SESAI ou INCRA..." />
                    </SelectTrigger>
                    <SelectContent>
                      {LACUNAS.map(l => (
                        <SelectItem key={l.id} value={l.id}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{l.orgao}</Badge>
                            {l.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {lacuna && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Badge>{lacuna.orgao}</Badge>
                        Links do Portal por Ano
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Acesse cada ano, clique em <strong>"Download"</strong> na página de resultados e suba o CSV gerado.
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {lacuna.anos.map(ano => (
                          <a
                            key={ano}
                            href={lacuna.url_portal(ano)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/5 px-2 py-1 rounded"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {ano}
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={() => setStep('upload')}
                  className="w-full gap-2"
                  disabled={!selectedOrgao}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Já baixei o CSV, prosseguir para upload
                </Button>
              </>
            )}

            {/* Step 2: Upload */}
            {step === 'upload' && (
              <div className="space-y-4">
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge>{lacuna?.orgao}</Badge>
                      <span className="text-muted-foreground">Suba o CSV baixado do Portal da Transparência</span>
                    </div>
                  </CardContent>
                </Card>

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
                    <p className="text-sm font-medium">Clique para selecionar o CSV do Portal</p>
                    <p className="text-xs text-muted-foreground">Aceita CSV com separador ; ou , (formato nativo do Portal)</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep('select')}>
                  ← Voltar
                </Button>
              </div>
            )}

            {/* Step 3: Preview */}
            {step === 'preview' && preview.length > 0 && (
              <div className="space-y-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge>{lacuna?.orgao}</Badge>
                      <Badge variant="secondary">{preview.length} registros</Badge>
                      <span className="text-xs text-muted-foreground">extraídos de {rawFileName}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="border rounded-lg overflow-x-auto max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Ano</TableHead>
                        <TableHead className="text-xs">Programa</TableHead>
                        <TableHead className="text-xs">Ação</TableHead>
                        <TableHead className="text-xs text-right">Empenhado</TableHead>
                        <TableHead className="text-xs text-right">Liquidado</TableHead>
                        <TableHead className="text-xs text-right">Pago</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">{row.ano}</TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate">{row.programa}</TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate">{row.acao}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrency(row.empenhado)}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrency(row.liquidado)}</TableCell>
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
                <p className="text-sm text-muted-foreground">Inserindo registros de {lacuna?.orgao}...</p>
              </div>
            )}

            {/* Step 5: Done */}
            {step === 'done' && result && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2 py-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                  <p className="font-medium">{result.inserted} registros de {lacuna?.orgao} inseridos!</p>
                  <p className="text-xs text-muted-foreground">Dotação será complementada automaticamente via ingestão de dados abertos.</p>
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={reset} className="flex-1">
                    Importar mais dados
                  </Button>
                  <Button onClick={() => { reset(); setIsOpen(false); }} className="flex-1">
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
