import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Play, Download, Database, Link2, BarChart3, FileText, Loader2, Shield, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface AuditItem {
  id: string;
  tipo: 'constante' | 'url' | 'serie' | 'registro_bd' | 'narrativa';
  secao: string;
  indicador: string;
  valor_atual: string | number | null;
  fonte_declarada: string;
  url_fonte: string | null;
  origem: string;
  nivel_confianca: 'A' | 'B' | 'C' | 'pendente';
  notas_auditoria: string | null;
}

interface InventoryResult {
  success: boolean;
  timestamp: string;
  totals: { constantes: number; urls: number; series: number; registros_bd: number; total: number };
  sections: Record<string, number>;
  items: AuditItem[];
  exclusions: string[];
}

const TIPO_ICONS: Record<string, React.ReactNode> = {
  constante: <Database className="w-3.5 h-3.5" />,
  url: <Link2 className="w-3.5 h-3.5" />,
  serie: <BarChart3 className="w-3.5 h-3.5" />,
  registro_bd: <Database className="w-3.5 h-3.5" />,
  narrativa: <FileText className="w-3.5 h-3.5" />,
};

const CONFIANCA_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  A: { label: 'Nível A', className: 'bg-success/10 text-success border-success/30', icon: <CheckCircle2 className="w-3 h-3" /> },
  B: { label: 'Nível B 🔀', className: 'bg-chart-4/10 text-chart-4 border-chart-4/30', icon: <AlertTriangle className="w-3 h-3" /> },
  C: { label: 'Nível C ⛔', className: 'bg-destructive/10 text-destructive border-destructive/30', icon: <Shield className="w-3 h-3" /> },
  pendente: { label: 'Pendente', className: 'bg-warning/10 text-warning border-warning/30', icon: <Clock className="w-3 h-3" /> },
};

interface AuditInventoryPanelProps {
  onInventoryComplete?: (items: AuditItem[]) => void;
}

export function AuditInventoryPanel({ onInventoryComplete }: AuditInventoryPanelProps) {
  const [result, setResult] = useState<InventoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [confiancaFilter, setConfiancaFilter] = useState<string>('all');
  const [secaoFilter, setSecaoFilter] = useState<string>('all');

  const runInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('audit-inventory');
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha no inventário');
      setResult(data);
      onInventoryComplete?.(data.items);
      toast.success(`Inventário concluído: ${data.totals.total} itens catalogados`);
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = result?.items.filter(item => {
    if (filter && !item.indicador.toLowerCase().includes(filter.toLowerCase()) && !item.secao.toLowerCase().includes(filter.toLowerCase())) return false;
    if (tipoFilter !== 'all' && item.tipo !== tipoFilter) return false;
    if (confiancaFilter !== 'all' && item.nivel_confianca !== confiancaFilter) return false;
    if (secaoFilter !== 'all' && item.secao !== secaoFilter) return false;
    return true;
  }) || [];

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-inventory-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sections = result ? Object.keys(result.sections).sort() : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-primary" />
            Protocolo Triple-Check — Fase 1: Inventário Sistêmico
          </CardTitle>
          <CardDescription>
            Cataloga todos os itens auditáveis: constantes, séries históricas, deep links, registros orçamentários e narrativas.
            <br />
            <strong>Exclusões:</strong> Base Normativa • Aba Segurança/Saúde/Educação (auditada manualmente)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={runInventory} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {loading ? 'Inventariando...' : 'Executar Inventário'}
            </Button>
            {result && (
              <Button variant="outline" onClick={downloadJSON} className="gap-2">
                <Download className="w-4 h-4" /> Exportar JSON
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{result.totals.total}</p><p className="text-xs text-muted-foreground">Total Itens</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{result.totals.constantes}</p><p className="text-xs text-muted-foreground">Constantes</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{result.totals.urls}</p><p className="text-xs text-muted-foreground">Deep Links</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{result.totals.series}</p><p className="text-xs text-muted-foreground">Séries</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{result.totals.registros_bd}</p><p className="text-xs text-muted-foreground">Registros BD</p></CardContent></Card>
          </div>

          {/* Confidence distribution */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['A', 'B', 'C', 'pendente'] as const).map(nc => {
              const count = result.items.filter(i => i.nivel_confianca === nc).length;
              const info = CONFIANCA_BADGE[nc];
              return (
                <Card key={nc} className="cursor-pointer hover:ring-1 ring-primary" onClick={() => setConfiancaFilter(nc)}>
                  <CardContent className="pt-4 flex items-center gap-3">
                    <Badge variant="outline" className={`gap-1 ${info.className}`}>{info.icon}{info.label}</Badge>
                    <span className="text-lg font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground">({result.totals.total > 0 ? Math.round(count / result.totals.total * 100) : 0}%)</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sections breakdown */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Distribuição por Seção</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.sections).sort((a, b) => b[1] - a[1]).map(([sec, count]) => (
                  <Badge key={sec} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setSecaoFilter(sec)}>
                    {sec}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar indicador ou seção..." value={filter} onChange={e => setFilter(e.target.value)} className="pl-9" />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
                <SelectItem value="constante">Constante</SelectItem>
                <SelectItem value="url">URL</SelectItem>
                <SelectItem value="serie">Série</SelectItem>
                <SelectItem value="registro_bd">Registro BD</SelectItem>
                <SelectItem value="narrativa">Narrativa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={confiancaFilter} onValueChange={setConfiancaFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Confiança" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos níveis</SelectItem>
                <SelectItem value="A">Nível A ✅</SelectItem>
                <SelectItem value="B">Nível B 🔀</SelectItem>
                <SelectItem value="C">Nível C ⛔</SelectItem>
                <SelectItem value="pendente">Pendente ⏳</SelectItem>
              </SelectContent>
            </Select>
            <Select value={secaoFilter} onValueChange={setSecaoFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Seção" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas seções</SelectItem>
                {sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {(filter || tipoFilter !== 'all' || confiancaFilter !== 'all' || secaoFilter !== 'all') && (
              <Button variant="ghost" size="sm" onClick={() => { setFilter(''); setTipoFilter('all'); setConfiancaFilter('all'); setSecaoFilter('all'); }}>Limpar</Button>
            )}
            <Badge variant="outline">{filteredItems.length} de {result.totals.total}</Badge>
          </div>

          {/* Table */}
          <Card>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[80px]">Tipo</TableHead>
                    <TableHead className="w-[120px]">Seção</TableHead>
                    <TableHead>Indicador</TableHead>
                    <TableHead className="w-[100px]">Confiança</TableHead>
                    <TableHead className="w-[140px]">Fonte</TableHead>
                    <TableHead className="w-[200px]">Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.slice(0, 200).map(item => {
                    const conf = CONFIANCA_BADGE[item.nivel_confianca];
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                        <TableCell><span className="flex items-center gap-1 text-xs">{TIPO_ICONS[item.tipo]} {item.tipo}</span></TableCell>
                        <TableCell className="text-xs">{item.secao}</TableCell>
                        <TableCell className="text-sm">
                          {item.indicador}
                          {item.url_fonte && (
                            <a href={item.url_fonte} target="_blank" rel="noopener" className="ml-1 text-primary hover:underline">
                              <Link2 className="w-3 h-3 inline" />
                            </a>
                          )}
                        </TableCell>
                        <TableCell><Badge variant="outline" className={`text-[9px] gap-0.5 ${conf.className}`}>{conf.icon}{conf.label}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.fonte_declarada}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.notas_auditoria || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredItems.length > 200 && (
                <p className="text-center text-xs text-muted-foreground py-3">Mostrando 200 de {filteredItems.length} — use filtros para refinar</p>
              )}
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  );
}
