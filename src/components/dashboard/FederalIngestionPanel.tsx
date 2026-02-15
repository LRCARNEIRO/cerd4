import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Database, Download, CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const ANOS_DISPONIVEIS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const CAMADAS = [
  { id: 'programas', label: 'Programas Temáticos PPA', desc: '5034, 5803, 2065, 0153, 2034' },
  { id: 'subfuncao', label: 'Subfunção 422', desc: 'Direitos Individuais, Coletivos e Difusos' },
  { id: 'orgaos', label: 'Órgãos MIR + MPI', desc: 'Códigos 67000 e 92000' },
];

type ResultData = {
  success: boolean;
  total_inseridos: number;
  total_deduplicados: number;
  detalhes_camadas: Record<string, { brutos: number; relevantes: number }>;
  metodologia: Record<string, string>;
  erros: string[];
};

export function FederalIngestionPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnos, setSelectedAnos] = useState<number[]>([2023, 2024, 2025]);
  const [selectedCamadas, setSelectedCamadas] = useState<string[]>(['programas', 'subfuncao', 'orgaos']);
  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleAno = (ano: number) => {
    setSelectedAnos(prev => prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano].sort());
  };

  const toggleCamada = (id: string) => {
    setSelectedCamadas(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleIngest = async () => {
    if (selectedAnos.length === 0 || selectedCamadas.length === 0) {
      toast({ title: 'Selecione ao menos 1 ano e 1 camada', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Etapa 1: Ingestão de execução via API
      const { data, error: fnErr } = await supabase.functions.invoke('ingest-federal-orcamento', {
        body: { anos: selectedAnos, camadas: selectedCamadas },
      });

      if (fnErr) throw fnErr;

      if (data?.success) {
        setResult(data);
        toast({ title: `${data.total_inseridos} registros inseridos. Complementando dotação LOA...` });

        // Etapa 2: Complementar dotação inicial via CSV/LOA (automático)
        try {
          const { data: dotData, error: dotErr } = await supabase.functions.invoke('ingest-dotacao-loa', {
            body: { anos: selectedAnos },
          });
          if (!dotErr && dotData?.success) {
            const totalUpdated = Object.values(dotData.resultados || {}).reduce(
              (sum: number, r: any) => sum + (r.atualizados || 0), 0
            );
            toast({ title: `Dotação LOA: ${totalUpdated} registros atualizados com dotação inicial` });
          }
        } catch (dotE) {
          console.warn('Dotação LOA complementar falhou:', dotE);
        }

        queryClient.invalidateQueries({ queryKey: ['dados-orcamentarios'] });
        queryClient.invalidateQueries({ queryKey: ['orcamento-stats'] });
      } else {
        setError(data?.error || 'Erro desconhecido');
      }
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
          <Download className="w-4 h-4" />
          Ingestão Federal (API)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Ingestão Orçamentária Federal
          </DialogTitle>
          <DialogDescription>
            Coleta automatizada via API do Portal da Transparência com metodologia multi-camada auditável.
          </DialogDescription>
        </DialogHeader>

        {/* Metodologia */}
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Metodologia de Filtragem
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div>
              <strong>Camada 1 — Programas Temáticos:</strong> Filtra por códigos de programa finalístico do PPA
              (5034, 5803, 2065, 0153, 2034).
            </div>
            <div>
              <strong>Camada 2 — Subfunção 422:</strong> Captura ações classificadas na subfunção "Direitos Individuais,
              Coletivos e Difusos", aplicando filtro de palavras-chave para validar relevância racial/étnica.
            </div>
            <div>
              <strong>Camada 3 — Órgãos MIR/MPI:</strong> Todas as despesas dos órgãos 67000 (MIR) e 92000 (MPI),
              cujo mandato é integralmente voltado a políticas raciais e indígenas.
            </div>
            <div className="text-muted-foreground italic">
              Resultados das 3 camadas são deduplicados (chave: órgão+programa+ano). Programas transversais
              (Bolsa Família, MCMV, etc.) são explicitamente excluídos.
            </div>
            <a
              href="https://portaldatransparencia.gov.br/api-de-dados"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Documentação da API
            </a>
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

        {/* Seleção de camadas */}
        <div>
          <p className="text-sm font-medium mb-2">Camadas de Filtro</p>
          <div className="space-y-2">
            {CAMADAS.map(c => (
              <label key={c.id} className="flex items-start gap-2 cursor-pointer">
                <Checkbox checked={selectedCamadas.includes(c.id)} onCheckedChange={() => toggleCamada(c.id)} className="mt-0.5" />
                <div>
                  <span className="text-sm font-medium">{c.label}</span>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Executar */}
        <Button onClick={handleIngest} disabled={loading} className="w-full gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Coletando dados... (pode levar alguns minutos)
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Iniciar Ingestão ({selectedAnos.length} anos × {selectedCamadas.length} camadas)
            </>
          )}
        </Button>

        {/* Resultado */}
        {result && (
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{result.total_inseridos} registros inseridos</span>
                <Badge variant="secondary">{result.total_deduplicados} após deduplicação</Badge>
              </div>
              {result.detalhes_camadas && (
                <div className="text-xs space-y-1">
                  {Object.entries(result.detalhes_camadas).map(([camada, det]) => (
                    <div key={camada} className="flex justify-between">
                      <span className="capitalize">{camada}:</span>
                      <span>{det.brutos} brutos → {det.relevantes} relevantes</span>
                    </div>
                  ))}
                </div>
              )}
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
