import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Database, RefreshCw, FileDown, Info, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ANOS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

type RawRow = {
  ano: number;
  codigo_programa: string;
  nome_programa: string | null;
  codigo_acao: string;
  nome_acao: string | null;
  nome_funcao: string | null;
  nome_subfuncao: string | null;
  dotacao_inicial: number | null;
  dotacao_atualizada: number | null;
  empenhado: number | null;
  liquidado: number | null;
  pago: number | null;
  fonte_dotacao: string | null;
  coletado_em: string;
};

function toCSV(rows: RawRow[]): string {
  const head = [
    'ano', 'codigo_programa', 'nome_programa', 'codigo_acao', 'nome_acao',
    'funcao', 'subfuncao', 'dotacao_inicial', 'dotacao_atualizada',
    'empenhado', 'liquidado', 'pago', 'execucao_%', 'fonte_dotacao', 'coletado_em',
  ];
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const body = rows.map(r => {
    const dot = r.dotacao_atualizada || r.dotacao_inicial || 0;
    const exec = dot > 0 && r.pago ? ((r.pago / dot) * 100).toFixed(2) : '';
    return [
      r.ano, r.codigo_programa, r.nome_programa, r.codigo_acao, r.nome_acao,
      r.nome_funcao, r.nome_subfuncao, r.dotacao_inicial ?? '', r.dotacao_atualizada ?? '',
      r.empenhado ?? '', r.liquidado ?? '', r.pago ?? '', exec, r.fonte_dotacao, r.coletado_em,
    ].map(esc).join(';');
  });
  return [head.join(';'), ...body].join('\n');
}

export function ApiRawAuditPanel() {
  const [open, setOpen] = useState(false);
  const [anos, setAnos] = useState<number[]>([2023, 2024, 2025]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rows } = useQuery({
    queryKey: ['orcamento-api-raw'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamento_api_raw')
        .select('ano, codigo_programa, nome_programa, codigo_acao, nome_acao, nome_funcao, nome_subfuncao, dotacao_inicial, dotacao_atualizada, empenhado, liquidado, pago, fonte_dotacao, coletado_em')
        .order('ano', { ascending: false })
        .order('codigo_programa')
        .limit(5000);
      if (error) throw error;
      return (data || []) as RawRow[];
    },
  });

  const total = rows?.length || 0;
  const comDotacao = rows?.filter(r => r.dotacao_inicial || r.dotacao_atualizada).length || 0;

  const CHUNKS = 4;

  const coletar = async () => {
    setLoading(true);
    setLog([]);
    for (const ano of anos) {
      let gravados = 0;
      let falhou = false;
      for (let c = 0; c < CHUNKS; c++) {
        try {
          const { data, error } = await supabase.functions.invoke('ingest-api-orcamento-raw', {
            body: { ano, chunk: c, chunks: CHUNKS, modo: 'execucao' },
          });
          if (error) throw error;
          gravados += data?.registros_gravados ?? 0;
        } catch (e: any) {
          falhou = true;
          setLog(prev => [...prev, `${ano} (lote ${c + 1}/${CHUNKS}): falha — ${e.message || e}`]);
        }
      }
      let dot = 0;
      try {
        const { data } = await supabase.functions.invoke('ingest-api-orcamento-raw', {
          body: { ano, modo: 'dotacao' },
        });
        dot = data?.dotacoes_atualizadas ?? 0;
      } catch (e: any) {
        setLog(prev => [...prev, `${ano} (dotação LOA): falha — ${e.message || e}`]);
      }
      if (!falhou || gravados > 0) {
        setLog(prev => [...prev, `${ano}: ${gravados} registros · ${dot} com dotação LOA`]);
      }
      queryClient.invalidateQueries({ queryKey: ['orcamento-api-raw'] });
    }
    setLoading(false);
    toast({ title: 'Coleta concluída' });
  };


  const exportar = () => {
    if (!rows?.length) return;
    const blob = new Blob(['\uFEFF' + toCSV(rows)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Base-Auditagem-API-Portal-Transparencia.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="w-4 h-4" />
          Base Bruta API (auditagem)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Base Bruta de Auditagem — Ações, Programas e Dotações</DialogTitle>
          <DialogDescription>
            Espelho independente e não deduplicado, coletado direto da fonte oficial, para conferência
            linha a linha contra a base analítica do sistema.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" /> Procedência dos campos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5">
            <div><strong>Execução</strong> (empenhado, liquidado, pago): API do Portal da Transparência,
              endpoint <code>/despesas/por-funcional-programatica</code> por ano e programa.</div>
            <div><strong>Dotação</strong> (inicial e atualizada): a API não fornece dotação. Os valores vêm da
              planilha oficial de Orçamento-Despesa (Dados Abertos) do mesmo ano, agregada por programa+ação.</div>
            <div className="text-muted-foreground italic">
              Nada aqui é calculado a partir do empenhado. Registros sem correspondência na planilha ficam
              com dotação vazia — a ausência é preservada, não estimada.
            </div>
          </CardContent>
        </Card>

        <div>
          <p className="text-sm font-medium mb-2">Anos a coletar</p>
          <div className="flex flex-wrap gap-3">
            {ANOS.map(a => (
              <label key={a} className="flex items-center gap-1.5 cursor-pointer text-sm">
                <Checkbox
                  checked={anos.includes(a)}
                  onCheckedChange={() => setAnos(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a].sort())}
                />
                {a}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={coletar} disabled={loading || anos.length === 0} className="gap-2 flex-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Coletar / atualizar ({anos.length} anos)
          </Button>
          <Button variant="outline" onClick={exportar} disabled={!total} className="gap-2">
            <FileDown className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">{total} registros na base bruta</Badge>
          <Badge variant="outline">{comDotacao} com dotação</Badge>
        </div>

        {log.length > 0 && (
          <div className="text-xs space-y-1">
            {log.map((l, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-green-600" /> {l}
              </div>
            ))}
          </div>
        )}

        {!!total && (
          <div className="max-h-72 overflow-auto border rounded-md">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="text-left p-2">Ano</th>
                  <th className="text-left p-2">Programa</th>
                  <th className="text-left p-2">Ação</th>
                  <th className="text-right p-2">Dot. atualizada</th>
                  <th className="text-right p-2">Pago</th>
                </tr>
              </thead>
              <tbody>
                {rows!.slice(0, 300).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{r.ano}</td>
                    <td className="p-2">{r.codigo_programa}</td>
                    <td className="p-2">{r.codigo_acao} — {r.nome_acao}</td>
                    <td className="p-2 text-right">
                      {r.dotacao_atualizada ? r.dotacao_atualizada.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '—'}
                    </td>
                    <td className="p-2 text-right">
                      {r.pago ? r.pago.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
