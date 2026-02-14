import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database, Loader2, BookOpen } from 'lucide-react';

const ALL_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

const CAMADAS = [
  { key: 'programas', label: 'Programas PPA', desc: '5034, 5803, 2065, 0153, 2034' },
  { key: 'subfuncao', label: 'Subfunção 422', desc: 'Direitos Individuais e Coletivos' },
  { key: 'orgaos', label: 'Órgãos MIR/MPI', desc: 'Códigos 67000 e 92000' },
];

export function SiopSparqlPanel() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedYears, setSelectedYears] = useState<number[]>([2024]);
  const [selectedCamadas, setSelectedCamadas] = useState<string[]>(['programas']);
  const [result, setResult] = useState<any>(null);

  const toggleYear = (year: number) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const toggleCamada = (key: string) => {
    setSelectedCamadas(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const handleIngest = async () => {
    if (selectedYears.length === 0 || selectedCamadas.length === 0) {
      toast.error('Selecione ao menos um ano e uma camada');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ingest-siop-sparql', {
        body: { anos: selectedYears.sort(), camadas: selectedCamadas },
      });

      if (error) throw error;

      setResult(data);
      if (data?.success) {
        toast.success(`SIOP/SPARQL: ${data.total_inseridos} registros inseridos`);
      } else {
        toast.error(data?.error || 'Erro na ingestão');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao chamar a função');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookOpen className="w-4 h-4" />
          SIOP/SPARQL
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Ingestão SIOP/SPARQL
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metodologia */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg border space-y-1">
            <p className="font-medium text-foreground">Fonte: SIOP — Dados Abertos do Orçamento</p>
            <p>Endpoint SPARQL público do Ministério do Planejamento e Orçamento.</p>
            <p><strong>Vantagem:</strong> Inclui dotação PLOA, LOA (inicial), LOA+créditos (autorizada), empenhado, liquidado e pago — tudo numa consulta.</p>
            <p className="text-[10px] text-muted-foreground">Ref: pacote R orcamentoBR (CRAN) — ontologia http://orcamento.dados.gov.br/</p>
          </div>

          {/* Anos */}
          <div>
            <p className="text-sm font-medium mb-2">Exercícios</p>
            <div className="flex flex-wrap gap-2">
              {ALL_YEARS.map(year => (
                <label key={year} className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox
                    checked={selectedYears.includes(year)}
                    onCheckedChange={() => toggleYear(year)}
                  />
                  <span className="text-sm">{year}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Camadas */}
          <div>
            <p className="text-sm font-medium mb-2">Camadas de Filtragem</p>
            <div className="space-y-2">
              {CAMADAS.map(c => (
                <label key={c.key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedCamadas.includes(c.key)}
                    onCheckedChange={() => toggleCamada(c.key)}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{c.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{c.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleIngest}
            disabled={loading || selectedYears.length === 0 || selectedCamadas.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Consultando SIOP/SPARQL...
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                Iniciar Ingestão ({selectedYears.length} anos × {selectedCamadas.length} camadas)
              </>
            )}
          </Button>

          {/* Resultado */}
          {result && (
            <div className="bg-muted/50 p-3 rounded-lg border text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? 'Sucesso' : 'Erro'}
                </Badge>
                {result.total_inseridos !== undefined && (
                  <span className="font-medium">{result.total_inseridos} registros inseridos</span>
                )}
              </div>

              {result.detalhes_camadas && (
                <div className="space-y-1">
                  {Object.entries(result.detalhes_camadas).map(([k, v]: [string, any]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{k}</span>
                      <span>{v.bindings} bindings → {v.relevantes} relevantes</span>
                    </div>
                  ))}
                </div>
              )}

              {result.erros?.length > 0 && (
                <div className="text-destructive">
                  <p className="font-medium">Erros ({result.erros.length}):</p>
                  {result.erros.slice(0, 5).map((e: string, i: number) => (
                    <p key={i} className="truncate">{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
