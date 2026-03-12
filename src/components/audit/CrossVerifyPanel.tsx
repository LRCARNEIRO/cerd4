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

// ═══════════════════════════════════════════════
// INVENTÁRIO DE TESTE: ABA JUVENTUDE
// Cada indicador com seu tipo de fonte e parâmetros de verificação
// ═══════════════════════════════════════════════

const JUVENTUDE_INVENTORY = [
  {
    id: 'juv-01',
    indicador: 'Taxa de homicídio negros (por 100 mil)',
    valor_declarado: 28.9,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP) — p.79',
    tipo_fonte: 'web' as const,
    url_fonte: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2025-05/risco-de-negro-ser-vitima-de-homicidio-e-27-vezes-maior-no-brasil',
    secao: 'Juventude',
  },
  {
    id: 'juv-02',
    indicador: 'Taxa de homicídio não-negros (por 100 mil)',
    valor_declarado: 10.6,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'web' as const,
    url_fonte: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2025-05/risco-de-negro-ser-vitima-de-homicidio-e-27-vezes-maior-no-brasil',
    secao: 'Juventude',
  },
  {
    id: 'juv-03',
    indicador: 'Risco relativo homicídio negro vs não-negro',
    valor_declarado: 2.7,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'web' as const,
    url_fonte: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2025-05/risco-de-negro-ser-vitima-de-homicidio-e-27-vezes-maior-no-brasil',
    secao: 'Juventude',
  },
  {
    id: 'juv-04',
    indicador: 'Vítimas 15-29 anos (% do total de homicídios)',
    valor_declarado: 47.8,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'pdf' as const,
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    pagina_pdf: 'p. 79',
    secao: 'Juventude',
  },
  {
    id: 'juv-05',
    indicador: 'IVJ-N risco relativo jovens negros vs brancos',
    valor_declarado: 2.0,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'pdf' as const,
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    pagina_pdf: 'capítulo IVJ-N',
    secao: 'Juventude',
  },
  {
    id: 'juv-06',
    indicador: 'IVJ-N risco jovens negros c/ ensino superior',
    valor_declarado: 3.0,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'pdf' as const,
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    secao: 'Juventude',
  },
  {
    id: 'juv-07',
    indicador: 'IVJ-N risco relativo 2017',
    valor_declarado: 1.9,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'pdf' as const,
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    secao: 'Juventude',
  },
  {
    id: 'juv-08',
    indicador: 'Desemprego 18-24 anos — jovens negros (%)',
    valor_declarado: 20.8,
    fonte_declarada: 'PNAD Contínua 2024 (SIDRA 7113)',
    tipo_fonte: 'api_sidra' as const,
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/7113',
    // SIDRA Tabela 7113: Taxa de desocupação por cor/raça e grupo de idade
    // API: /t/7113/n1/all/v/4099/p/last/c2/6794/c58/95253
    // v/4099 = taxa de desocupação; c2/6794 = preta ou parda; c58/95253 = 18 a 24 anos
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/7113/n1/all/v/4099/p/202404/c2/6794/c58/95253',
    sidra_filtros: {
      variavel: '4099',
      periodo: '202404',
      cor_raca: 'preta ou parda',
      faixa_etaria: '18 a 24',
      descricao_busca: 'preta ou parda',
    },
    secao: 'Juventude',
  },
  {
    id: 'juv-09',
    indicador: 'Desemprego 18-24 anos — jovens brancos (%)',
    valor_declarado: 11.5,
    fonte_declarada: 'PNAD Contínua 2024 (SIDRA 7113)',
    tipo_fonte: 'api_sidra' as const,
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/7113',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/7113/n1/all/v/4099/p/202404/c2/6795/c58/95253',
    sidra_filtros: {
      variavel: '4099',
      periodo: '202404',
      cor_raca: 'branca',
      faixa_etaria: '18 a 24',
      descricao_busca: 'branca',
    },
    secao: 'Juventude',
  },
  {
    id: 'juv-10',
    indicador: 'Nem-nem jovens negros (%)',
    valor_declarado: 27.2,
    fonte_declarada: 'PNAD Contínua 2024 (SIDRA 7113 × 9605)',
    tipo_fonte: 'api_sidra' as const,
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    // SIDRA 9605: Condição de atividade/estudo por cor/raça
    // Nota: nem-nem por raça pode não existir como tabela única — verificação importante
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/9605/n1/all/v/10267/p/2023/c2/6794/c58/95253',
    sidra_filtros: {
      descricao_busca: 'preta ou parda',
    },
    secao: 'Juventude',
  },
  {
    id: 'juv-11',
    indicador: 'Nem-nem jovens brancos (%)',
    valor_declarado: 14.5,
    fonte_declarada: 'PNAD Contínua 2024 (SIDRA 7113 × 9605)',
    tipo_fonte: 'api_sidra' as const,
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/9605/n1/all/v/10267/p/2023/c2/6795/c58/95253',
    sidra_filtros: {
      descricao_busca: 'branca',
    },
    secao: 'Juventude',
  },
  {
    id: 'juv-12',
    indicador: 'Encarceramento % negros do total',
    valor_declarado: 68.2,
    fonte_declarada: 'SISDEPEN/SENAPPEN 2024',
    tipo_fonte: 'web' as const,
    url_fonte: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen',
    secao: 'Juventude',
  },
  {
    id: 'juv-13',
    indicador: 'Letalidade policial — % vítimas negras',
    valor_declarado: 82,
    fonte_declarada: '19º Anuário FBSP 2025',
    tipo_fonte: 'web' as const,
    url_fonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    secao: 'Juventude',
  },
];

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
