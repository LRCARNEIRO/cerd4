import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Play, Download, Loader2, CheckCircle2, XCircle, AlertTriangle, LinkIcon, HelpCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface AuditItem {
  id: string;
  tipo: string;
  secao: string;
  indicador: string;
  valor_atual: string | number | null;
  fonte_declarada: string;
  url_fonte: string | null;
  origem: string;
  nivel_confianca: string;
  notas_auditoria: string | null;
}

interface Verdict {
  item_id: string;
  indicador: string;
  secao: string;
  nivel_original: string;
  veredito: 'confirmado' | 'divergente' | 'link_quebrado' | 'sem_fonte' | 'erro';
  nivel_sugerido: 'A' | 'B' | 'C' | 'pendente';
  valor_fonte: string | null;
  valor_declarado: string | null;
  divergencia: string | null;
  acao_sugerida: string | null;
  confianca_ia: number;
  modelo_1: string;
  modelo_2: string | null;
  concordancia: boolean;
  url_verificada: string | null;
  firecrawl_status: string;
}

interface VerifyResult {
  success: boolean;
  timestamp: string;
  summary: {
    total: number;
    confirmados: number;
    divergentes: number;
    links_quebrados: number;
    sem_fonte: number;
    erros: number;
    concordancia_ia: number;
  };
  verdicts: Verdict[];
}

const VEREDITO_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  confirmado: { label: 'Confirmado ✅', className: 'bg-success/10 text-success border-success/30', icon: <CheckCircle2 className="w-3 h-3" /> },
  divergente: { label: 'Divergente ⚠️', className: 'bg-destructive/10 text-destructive border-destructive/30', icon: <XCircle className="w-3 h-3" /> },
  link_quebrado: { label: 'Link Quebrado 🔗', className: 'bg-warning/10 text-warning border-warning/30', icon: <LinkIcon className="w-3 h-3" /> },
  sem_fonte: { label: 'Sem Fonte ❌', className: 'bg-destructive/10 text-destructive border-destructive/30', icon: <HelpCircle className="w-3 h-3" /> },
  erro: { label: 'Erro ⚙️', className: 'bg-muted text-muted-foreground border-muted', icon: <AlertTriangle className="w-3 h-3" /> },
};

interface Props {
  inventoryItems: AuditItem[] | null;
}

export function AuditVerifyPanel({ inventoryItems }: Props) {
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [vereditoFilter, setVereditoFilter] = useState('all');

  const nonAItems = inventoryItems?.filter(i => i.nivel_confianca !== 'A') || [];

  const runVerification = async () => {
    if (nonAItems.length === 0) {
      toast.info('Todos os itens já são Nível A!');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('audit-verify', {
        body: { items: nonAItems, batch_size: 3 },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha na verificação');
      setResult(data);
      toast.success(`Verificação concluída: ${data.summary.confirmados} confirmados, ${data.summary.divergentes} divergentes`);
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = result?.verdicts.filter(v => {
    if (filter && !v.indicador.toLowerCase().includes(filter.toLowerCase()) && !v.secao.toLowerCase().includes(filter.toLowerCase())) return false;
    if (vereditoFilter !== 'all' && v.veredito !== vereditoFilter) return false;
    return true;
  }) || [];

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-verify-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-chart-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5 text-chart-4" />
            Protocolo Triple-Check — Fase 2: Verificação Cruzada
          </CardTitle>
          <CardDescription>
            Verifica itens não-Nível A via Firecrawl (extração de fonte) + dupla checagem por IA (Gemini Flash + GPT-5-nano).
            <br />
            <strong>{nonAItems.length} itens</strong> pendentes de verificação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap items-center">
            <Button onClick={runVerification} disabled={loading || nonAItems.length === 0} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Verificando...' : `Verificar ${nonAItems.length} itens`}
            </Button>
            {result && (
              <Button variant="outline" onClick={downloadJSON} className="gap-2">
                <Download className="w-4 h-4" /> Exportar Vereditos
              </Button>
            )}
            {!inventoryItems && (
              <p className="text-sm text-muted-foreground">⚠️ Execute o Inventário (Fase 1) primeiro.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{result.summary.total}</p><p className="text-xs text-muted-foreground">Verificados</p></CardContent></Card>
            <Card className="cursor-pointer hover:ring-1 ring-success" onClick={() => setVereditoFilter('confirmado')}><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-success">{result.summary.confirmados}</p><p className="text-xs text-muted-foreground">Confirmados</p></CardContent></Card>
            <Card className="cursor-pointer hover:ring-1 ring-destructive" onClick={() => setVereditoFilter('divergente')}><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{result.summary.divergentes}</p><p className="text-xs text-muted-foreground">Divergentes</p></CardContent></Card>
            <Card className="cursor-pointer hover:ring-1 ring-warning" onClick={() => setVereditoFilter('link_quebrado')}><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-warning">{result.summary.links_quebrados}</p><p className="text-xs text-muted-foreground">Links Quebrados</p></CardContent></Card>
            <Card className="cursor-pointer hover:ring-1 ring-destructive" onClick={() => setVereditoFilter('sem_fonte')}><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{result.summary.sem_fonte}</p><p className="text-xs text-muted-foreground">Sem Fonte</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{result.summary.total > 0 ? Math.round(result.summary.concordancia_ia / result.summary.total * 100) : 0}%</p><p className="text-xs text-muted-foreground">Concordância IA</p></CardContent></Card>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar indicador..." value={filter} onChange={e => setFilter(e.target.value)} className="pl-9" />
            </div>
            <Select value={vereditoFilter} onValueChange={setVereditoFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Veredito" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="confirmado">Confirmado ✅</SelectItem>
                <SelectItem value="divergente">Divergente ⚠️</SelectItem>
                <SelectItem value="link_quebrado">Link Quebrado 🔗</SelectItem>
                <SelectItem value="sem_fonte">Sem Fonte ❌</SelectItem>
                <SelectItem value="erro">Erro ⚙️</SelectItem>
              </SelectContent>
            </Select>
            {(filter || vereditoFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={() => { setFilter(''); setVereditoFilter('all'); }}>Limpar</Button>
            )}
            <Badge variant="outline">{filtered.length} de {result.summary.total}</Badge>
          </div>

          {/* Verdicts Table */}
          <Card>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px]">ID</TableHead>
                    <TableHead className="w-[100px]">Seção</TableHead>
                    <TableHead>Indicador</TableHead>
                    <TableHead className="w-[110px]">Veredito</TableHead>
                    <TableHead className="w-[60px]">Nível</TableHead>
                    <TableHead className="w-[60px]">IA %</TableHead>
                    <TableHead className="w-[50px]">2 IAs</TableHead>
                    <TableHead className="w-[250px]">Ação Sugerida</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 200).map(v => {
                    const cfg = VEREDITO_CONFIG[v.veredito] || VEREDITO_CONFIG.erro;
                    const levelChanged = v.nivel_sugerido !== v.nivel_original;
                    return (
                      <TableRow key={v.item_id}>
                        <TableCell className="font-mono text-xs">{v.item_id}</TableCell>
                        <TableCell className="text-xs">{v.secao}</TableCell>
                        <TableCell className="text-sm">
                          {v.indicador}
                          {v.divergencia && (
                            <p className="text-xs text-destructive mt-0.5">↳ {v.divergencia}</p>
                          )}
                          {v.valor_fonte && v.veredito === 'divergente' && (
                            <p className="text-xs text-muted-foreground mt-0.5">Fonte: {v.valor_fonte}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[9px] gap-0.5 ${cfg.className}`}>
                            {cfg.icon}{cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="flex items-center gap-0.5 text-xs">
                            {levelChanged ? (
                              v.nivel_sugerido < v.nivel_original 
                                ? <ArrowUpCircle className="w-3 h-3 text-success" />
                                : <ArrowDownCircle className="w-3 h-3 text-destructive" />
                            ) : null}
                            {v.nivel_original}→{v.nivel_sugerido}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-xs font-mono">{v.confianca_ia}%</TableCell>
                        <TableCell className="text-center">
                          {v.concordancia 
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-success mx-auto" />
                            : v.modelo_2 
                              ? <XCircle className="w-3.5 h-3.5 text-destructive mx-auto" />
                              : <span className="text-xs text-muted-foreground">—</span>
                          }
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{v.acao_sugerida || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  );
}
