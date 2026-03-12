import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Play, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Search, Database, FileText, Globe, Download
} from 'lucide-react';
import { JUVENTUDE_INVENTORY, DADOS_GERAIS_INVENTORY, type IndicatorToVerify } from './crossVerifyInventory';

const INVENTORIES: Record<string, { label: string; items: IndicatorToVerify[] }> = {
  'dados-gerais': { label: 'Dados Gerais', items: DADOS_GERAIS_INVENTORY },
  'juventude': { label: 'Juventude', items: JUVENTUDE_INVENTORY },
};

interface VerifyResult {
  id: string;
  indicador: string;
  secao: string;
  valor_declarado: string;
  valor_encontrado: string | null;
  veredito: 'confirmado' | 'divergente' | 'nao_encontrado' | 'link_quebrado' | 'erro';
  tipo_fonte: string;
  confianca: number;
  divergencia: string | null;
  metodo_verificacao: string;
  detalhes: string | null;
}

const vereditoConfig = {
  confirmado: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: '✅ Confirmado' },
  divergente: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: '🔴 Divergente' },
  nao_encontrado: { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', label: '⚠️ Não encontrado' },
  link_quebrado: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', label: '🔗 Link quebrado' },
  erro: { icon: AlertTriangle, color: 'text-muted-foreground', bg: 'bg-muted', label: '❌ Erro' },
};

const tipoFonteIcons = {
  pdf: FileText,
  api_sidra: Database,
  web: Globe,
  desconhecido: Search,
};

export function CrossVerifyPanel() {
  const [selectedInventory, setSelectedInventory] = useState<string>('dados-gerais');
  const [results, setResults] = useState<VerifyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const runVerification = async () => {
    setLoading(true);
    setResults([]);
    setSummary(null);

    try {
      toast.info('Iniciando auditoria cruzada (Juventude)...', {
        description: 'API SIDRA + Firecrawl PDF + GPT-5 adversário',
      });

      const { data, error } = await supabase.functions.invoke('audit-cross-verify', {
        body: { indicators: JUVENTUDE_INVENTORY },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha na verificação');

      setResults(data.results);
      setSummary(data.summary);

      const { confirmados, divergentes, nao_encontrados } = data.summary;
      toast.success(`Auditoria concluída: ${confirmados} ✅ | ${divergentes} 🔴 | ${nao_encontrados} ⚠️`);

    } catch (err: any) {
      console.error('Cross-verify error:', err);
      toast.error('Erro na auditoria cruzada', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results.length) return;
    const csv = [
      'ID,Indicador,Seção,Valor Declarado,Valor Encontrado,Veredito,Tipo Fonte,Confiança,Divergência,Método,Detalhes',
      ...results.map(r =>
        [r.id, `"${r.indicador}"`, r.secao, r.valor_declarado, r.valor_encontrado || 'N/A',
         r.veredito, r.tipo_fonte, r.confianca, `"${r.divergencia || ''}"`,
         `"${r.metodo_verificacao}"`, `"${(r.detalhes || '').replace(/"/g, "'")}"`,
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-cruzada-juventude-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Auditoria Cruzada Triple-Cross — Teste Juventude
        </CardTitle>
        <CardDescription>
          Verifica {JUVENTUDE_INVENTORY.length} indicadores usando 3 métodos: API SIDRA (JSON direto),
          Firecrawl (PDF), e GPT-5 como IA adversária. Gemini (que criou os dados) NÃO participa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Method Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <Badge variant="outline" className="gap-1"><Database className="w-3 h-3" /> Tipo B: API SIDRA</Badge>
          <Badge variant="outline" className="gap-1"><FileText className="w-3 h-3" /> Tipo A: PDF + Firecrawl</Badge>
          <Badge variant="outline" className="gap-1"><Globe className="w-3 h-3" /> Tipo C: Web + GPT-5</Badge>
        </div>

        {/* Inventory Preview */}
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs font-semibold mb-2">Inventário: {JUVENTUDE_INVENTORY.length} indicadores</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Database className="w-3 h-3 text-blue-600" />
              <span>{JUVENTUDE_INVENTORY.filter(i => i.tipo_fonte === 'api_sidra').length} via API SIDRA</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-amber-600" />
              <span>{JUVENTUDE_INVENTORY.filter(i => i.tipo_fonte === 'pdf').length} via PDF</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-green-600" />
              <span>{JUVENTUDE_INVENTORY.filter(i => i.tipo_fonte === 'web').length} via Web</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={runVerification} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? 'Verificando...' : 'Executar Auditoria Cruzada'}
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={exportResults} className="gap-2">
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(vereditoConfig).map(([key, cfg]) => {
              const count = summary[key === 'nao_encontrado' ? 'nao_encontrados' : key === 'link_quebrado' ? 'links_quebrados' : key === 'erro' ? 'erros' : `${key}s`] || 0;
              return (
                <div key={key} className={`p-3 rounded-lg text-center ${cfg.bg}`}>
                  <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
                  <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">Tipo</TableHead>
                  <TableHead>Indicador</TableHead>
                  <TableHead className="w-20">Declarado</TableHead>
                  <TableHead className="w-20">Encontrado</TableHead>
                  <TableHead className="w-28">Veredito</TableHead>
                  <TableHead className="w-12">Conf.</TableHead>
                  <TableHead>Divergência / Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map(r => {
                  const cfg = vereditoConfig[r.veredito] || vereditoConfig.erro;
                  const TipoIcon = tipoFonteIcons[r.tipo_fonte as keyof typeof tipoFonteIcons] || Search;
                  return (
                    <TableRow key={r.id} className={r.veredito === 'divergente' ? 'bg-destructive/5' : ''}>
                      <TableCell>
                        <TipoIcon className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="text-xs font-medium">{r.indicador}</TableCell>
                      <TableCell className="text-xs font-mono">{r.valor_declarado}</TableCell>
                      <TableCell className="text-xs font-mono">{r.valor_encontrado || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-center">{r.confianca}%</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground max-w-[300px] truncate">
                        {r.divergencia || r.detalhes || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
