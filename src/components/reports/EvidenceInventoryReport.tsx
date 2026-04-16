import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Loader2, Printer, FileDown } from 'lucide-react';
import { useIndicadoresInterseccionais, useDadosOrcamentarios } from '@/hooks/useLacunasData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getExportToolbarHTML, downloadAsDocx } from '@/utils/reportExportToolbar';
import { openHtmlPreview, prepareHtmlPreview } from '@/utils/reportPreview';
import { toast } from 'sonner';

function generateEvidenceInventoryHTML(
  indicadores: any[],
  normativos: any[],
  orcamento: any[],
): string {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Indicadores por categoria
  const indPorCat: Record<string, any[]> = {};
  indicadores.forEach(i => {
    const cat = i.categoria || 'outros';
    if (!indPorCat[cat]) indPorCat[cat] = [];
    indPorCat[cat].push(i);
  });
  const catLabel = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const indRows = Object.entries(indPorCat)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([cat, items]) => {
      const rows = items.map(i => {
        const artigos = (i.artigos_convencao || []).join(', ') || '—';
        return `<tr>
          <td>${i.nome}</td>
          <td>${i.subcategoria || '—'}</td>
          <td>${i.fonte}</td>
          <td>${i.tendencia || '—'}</td>
          <td style="font-family:monospace;font-size:9px">${artigos}</td>
        </tr>`;
      }).join('');
      return `<h3>${catLabel(cat)} (${items.length})</h3>
      <table><tr><th>Indicador</th><th>Subcategoria</th><th>Fonte</th><th>Tendência</th><th>Artigos ICERD</th></tr>
      ${rows}</table>`;
    }).join('');

  // ── Normativos por categoria
  const normPorCat: Record<string, any[]> = {};
  normativos.forEach(n => {
    const cat = n.categoria || 'outros';
    if (!normPorCat[cat]) normPorCat[cat] = [];
    normPorCat[cat].push(n);
  });

  const normRows = Object.entries(normPorCat)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([cat, items]) => {
      const rows = items.map(n => {
        const artigos = (n.artigos_convencao || []).join(', ') || '—';
        const recs = (n.recomendacoes_impactadas || []).join(', ') || '—';
        return `<tr>
          <td>${n.titulo}</td>
          <td>${n.status}</td>
          <td style="font-family:monospace;font-size:9px">${artigos}</td>
          <td style="font-size:9px">${recs}</td>
        </tr>`;
      }).join('');
      return `<h3>${catLabel(cat)} (${items.length})</h3>
      <table><tr><th>Título</th><th>Status</th><th>Artigos ICERD</th><th>Recomendações Impactadas</th></tr>
      ${rows}</table>`;
    }).join('');

  // ── Orçamento por órgão e programa
  const orcPorOrgao: Record<string, any[]> = {};
  orcamento.forEach(o => {
    const org = o.orgao || 'Outros';
    if (!orcPorOrgao[org]) orcPorOrgao[org] = [];
    orcPorOrgao[org].push(o);
  });

  // Deduplicate programs within each orgao
  const orcRows = Object.entries(orcPorOrgao)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([orgao, items]) => {
      // Group by programa
      const porProg: Record<string, any[]> = {};
      items.forEach(i => {
        const prog = i.programa || 'Sem programa';
        if (!porProg[prog]) porProg[prog] = [];
        porProg[prog].push(i);
      });

      const progRows = Object.entries(porProg)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([prog, regs]) => {
          const anos = [...new Set(regs.map((r: any) => r.ano))].sort().join(', ');
          const totalLiq = regs.reduce((s: number, r: any) => s + (r.liquidado || 0), 0);
          const artigos = [...new Set(regs.flatMap((r: any) => r.artigos_convencao || []))].join(', ') || '—';
          const eixo = regs[0]?.eixo_tematico?.replace(/_/g, ' ') || '—';
          return `<tr>
            <td>${prog}</td>
            <td>${regs.length}</td>
            <td>${anos}</td>
            <td style="text-align:right">${totalLiq > 0 ? 'R$ ' + totalLiq.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '—'}</td>
            <td>${eixo}</td>
            <td style="font-family:monospace;font-size:9px">${artigos}</td>
          </tr>`;
        }).join('');

      return `<h3>${orgao} (${items.length} registros, ${Object.keys(porProg).length} programas)</h3>
      <table><tr><th>Programa / Ação</th><th>Reg.</th><th>Anos</th><th>Liquidado Acum.</th><th>Eixo</th><th>Artigos ICERD</th></tr>
      ${progRows}</table>`;
    }).join('');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Inventário Consolidado das 3 Bases de Evidências — CERD IV</title>
<style>
body{font-family:'Segoe UI',Arial,sans-serif;max-width:1100px;margin:0 auto;padding:20px;font-size:11px;line-height:1.5;color:#1a1a2e}
h1{font-size:20px;color:#0f3460;border-bottom:3px solid #0f3460;padding-bottom:8px}
h2{font-size:16px;color:#16213e;margin-top:30px;border-left:4px solid #0f3460;padding-left:10px;page-break-after:avoid}
h3{font-size:12px;margin-top:14px;color:#0f3460;page-break-after:avoid}
.header{text-align:center;margin-bottom:24px;border:2px solid #0f3460;padding:16px;border-radius:8px;background:linear-gradient(135deg,#f8f9ff,#eef2ff)}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:16px 0}
.stat-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;text-align:center}
.stat-card .value{font-size:26px;font-weight:800;color:#0f3460}
.stat-card .label{font-size:10px;color:#64748b}
table{width:100%;border-collapse:collapse;margin:8px 0;font-size:10px}
th{background:#0f3460;color:white;padding:5px 8px;text-align:left;font-weight:600;font-size:9px}
td{padding:4px 8px;border-bottom:1px solid #e2e8f0}
tr:nth-child(even){background:#f8fafc}
.note{font-size:10px;color:#64748b;font-style:italic;padding:8px;background:#fffbeb;border-left:3px solid #f59e0b;margin:12px 0;border-radius:4px}
.footer{margin-top:30px;padding-top:12px;border-top:2px solid #e2e8f0;font-size:10px;color:#94a3b8}
@media print{.no-print{display:none!important}body{padding:10px}}
@page{margin:1.5cm;size:A4 landscape}
</style></head><body>
${getExportToolbarHTML('Inventario-3-Bases-Evidencias-CERD-IV')}

<div class="header">
<h1>📋 Inventário Consolidado das 3 Bases de Evidências</h1>
<p><strong>Sistema de Subsídios — IV Relatório CERD</strong></p>
<p>Finalidade: Facilitar a auditoria manual da vinculação de evidências às Recomendações e Artigos ICERD</p>
<p>Gerado em: ${now}</p>
</div>

<div class="stats-grid">
<div class="stat-card"><div class="value">${indicadores.length}</div><div class="label">INDICADORES (Base Estatística)</div></div>
<div class="stat-card"><div class="value">${normativos.length}</div><div class="label">NORMATIVOS (Base Normativa)</div></div>
<div class="stat-card"><div class="value">${orcamento.length}</div><div class="label">REGISTROS ORÇAMENTÁRIOS (Base Orçamentária)</div></div>
</div>

<div class="note">
<strong>Como usar:</strong> Cada item lista os Artigos ICERD vinculados (tags explícitas do banco de dados). 
O motor de vinculação automática também cruza palavras-chave dos temas/parágrafos das recomendações com os nomes e descritivos de cada item abaixo.
Ao editar evidências no pop-up de auditoria (Acompanhamento Gerencial → Recomendações), consulte este inventário para identificar itens relevantes que possam ter escapado do cruzamento automático.
</div>

<!-- ═══════════ BASE ESTATÍSTICA ═══════════ -->
<h2>1. BASE ESTATÍSTICA — Indicadores Interseccionais (${indicadores.length})</h2>
${indRows}

<!-- ═══════════ BASE NORMATIVA ═══════════ -->
<h2>2. BASE NORMATIVA — Documentos e Instrumentos Legais (${normativos.length})</h2>
${normRows}

<!-- ═══════════ BASE ORÇAMENTÁRIA ═══════════ -->
<h2>3. BASE ORÇAMENTÁRIA — Ações e Programas por Órgão (${orcamento.length} registros)</h2>
${orcRows}

<div class="footer">
📋 Inventário gerado pelo Sistema de Subsídios CERD IV — ${now}<br/>
Dados extraídos em tempo real do banco de dados. Qualquer alteração nas bases se reflete automaticamente na próxima geração.
</div>
</body></html>`;
}

export function EvidenceInventoryReport() {
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: orcamento } = useDadosOrcamentarios();
  const { data: normativos } = useQuery({
    queryKey: ['documentos_normativos_inventory'],
    queryFn: async () => {
      const { data } = await supabase.from('documentos_normativos').select('*').order('titulo');
      return data || [];
    },
  });

  const [generating, setGenerating] = useState<string | null>(null);

  const handleExport = async (format: 'html' | 'docx') => {
    setGenerating(format);
    const previewWindow = format === 'html' ? prepareHtmlPreview('Inventario-3-Bases-Evidencias') : null;
    try {
      const html = generateEvidenceInventoryHTML(indicadores || [], normativos || [], orcamento || []);
      if (format === 'docx') {
        await downloadAsDocx(html, 'Inventario-3-Bases-Evidencias-CERD-IV');
      } else {
        openHtmlPreview(html, 'Inventario-3-Bases-Evidencias-CERD-IV', previewWindow);
      }
    } catch (err) {
      console.error('Erro ao gerar inventário:', err);
      toast.error('Falha ao gerar inventário de evidências');
      previewWindow?.close();
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Card className="border-l-4 border-l-chart-5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-chart-5" />
          Inventário das 3 Bases de Evidências
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Listagem completa de <strong>Indicadores</strong>, <strong>Normativos</strong> e <strong>Ações Orçamentárias</strong> 
          {' '}com seus respectivos Artigos ICERD vinculados — para auditoria manual da vinculação de evidências.
        </p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{indicadores?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Indicadores</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{normativos?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Normativos</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{orcamento?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Orçamentários</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="default" size="sm" className="gap-1.5" onClick={() => handleExport('html')} disabled={!!generating}>
            {generating === 'html' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
            PDF / HTML
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleExport('docx')} disabled={!!generating}>
            {generating === 'docx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            DOCX
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
