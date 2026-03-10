import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Search, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const ANOS_DISPONIVEIS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

type ResultData = {
  success: boolean;
  total_brutos: number;
  total_com_keyword: number;
  total_unicos: number;
  total_duplicados: number;
  total_inseridos: number;
  erros: string[];
  subfuncoes_varridas: number;
};

const EMPTY_RESULT: ResultData = {
  success: true,
  total_brutos: 0,
  total_com_keyword: 0,
  total_unicos: 0,
  total_duplicados: 0,
  total_inseridos: 0,
  erros: [],
  subfuncoes_varridas: 0,
};

function mergeResults(results: ResultData[]): ResultData {
  return results.reduce((acc, current) => ({
    success: acc.success && current.success,
    total_brutos: acc.total_brutos + current.total_brutos,
    total_com_keyword: acc.total_com_keyword + current.total_com_keyword,
    total_unicos: acc.total_unicos + current.total_unicos,
    total_duplicados: acc.total_duplicados + current.total_duplicados,
    total_inseridos: acc.total_inseridos + current.total_inseridos,
    subfuncoes_varridas: Math.max(acc.subfuncoes_varridas, current.subfuncoes_varridas),
    erros: [...acc.erros, ...current.erros],
  }), EMPTY_RESULT);
}

export function KeywordIngestionPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnos, setSelectedAnos] = useState<number[]>([2023, 2024, 2025]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const anosOrdenados = useMemo(() => [...selectedAnos].sort((a, b) => a - b), [selectedAnos]);

  const toggleAno = (ano: number) => {
    setSelectedAnos(prev => prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano].sort());
  };

  const handleIngest = async () => {
    if (anosOrdenados.length === 0) {
      toast({ title: 'Selecione ao menos 1 ano', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const resultados: ResultData[] = [];

      for (const ano of anosOrdenados) {
        const { data, error: fnErr } = await supabase.functions.invoke('ingest-federal-keywords', {
          body: { anos: [ano] },
        });

        if (fnErr) {
          throw new Error(`Falha ao processar ${ano}: ${fnErr.message}`);
        }

        if (!data?.success) {
          throw new Error(data?.error || `Erro desconhecido ao processar ${ano}`);
        }

        resultados.push(data as ResultData);
      }

      const merged = mergeResults(resultados);
      setResult(merged);
      toast({ title: `${merged.total_inseridos} novos registros inseridos (${merged.total_duplicados} duplicados ignorados)` });
      queryClient.invalidateQueries({ queryKey: ['dados-orcamentarios'] });
      queryClient.invalidateQueries({ queryKey: ['orcamento-stats'] });
    } catch (e: any) {
      setError(e.message || 'Falha na ingestão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) { setResult(null); setError(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="w-4 h-4" />
          Ingestão Keyword-First
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Ingestão Federal Alternativa (Keyword-First)
          </DialogTitle>
          <DialogDescription>
            Busca complementar por palavras-chave em TODAS as subfunções federais. Insere apenas registros novos.
          </DialogDescription>
        </DialogHeader>

        {/* Metodologia */}
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600" />
              Metodologia Invertida
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>
              <strong>1º Passo — Varredura Ampla:</strong> Busca todas as ações orçamentárias federais
              varrendo ~40 subfunções na API do Portal da Transparência.
            </div>
            <div>
              <strong>2º Passo — Filtro por Palavras-chave:</strong> Seleciona apenas ações cujo nome de
              programa, ação, órgão ou subfunção contenha palavras-chave raciais/étnicas
              (racial, indígena, quilombola, cigano, afro, etc.).
            </div>
            <div>
              <strong>3º Passo — Deduplicação:</strong> Compara contra a base existente e insere
              <strong> apenas registros novos</strong> não encontrados pela metodologia principal.
            </div>
            <div className="text-muted-foreground italic">
              ⚠️ Esta busca é mais lenta que a metodologia principal (muitas consultas à API).
              Pode levar vários minutos por ano.
            </div>
          </CardContent>
        </Card>

        {/* Seleção de anos */}
        <div>
          <p className="text-sm font-medium mb-2">Anos</p>
          <div className="flex flex-wrap gap-2">
            {ANOS_DISPONIVEIS.map(ano => (
              <label key={ano} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <Checkbox checked={selectedAnos.includes(ano)} onCheckedChange={() => toggleAno(ano)} />
                {ano}
              </label>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedAnos([...ANOS_DISPONIVEIS])}>
              Todos
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedAnos([2023, 2024, 2025])}>
              2023–2025
            </Button>
          </div>
        </div>

        {/* Executar */}
        <Button onClick={handleIngest} disabled={loading} className="w-full gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Varrendo subfunções... (pode levar vários minutos)
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Iniciar Busca Keyword-First ({selectedAnos.length} anos)
            </>
          )}
        </Button>

        {/* Resultado */}
        {result && (
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{result.total_inseridos} novos registros inseridos</span>
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Registros brutos da API:</span>
                  <span>{result.total_brutos.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Com keyword racial/étnica:</span>
                  <span>{result.total_com_keyword}</span>
                </div>
                <div className="flex justify-between">
                  <span>Únicos (pós-agregação):</span>
                  <span>{result.total_unicos}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duplicados (já na base):</span>
                  <Badge variant="secondary" className="text-xs">{result.total_duplicados}</Badge>
                </div>
                <div className="flex justify-between font-semibold text-green-700 dark:text-green-400">
                  <span>Novos inseridos:</span>
                  <span>{result.total_inseridos}</span>
                </div>
              </div>
              {result.erros.length > 0 && (
                <div className="text-xs text-destructive mt-2">
                  <p className="font-medium">{result.erros.length} erro(s):</p>
                  {result.erros.slice(0, 5).map((e, i) => <p key={i}>• {e}</p>)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
