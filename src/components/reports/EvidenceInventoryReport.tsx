import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Loader2, Printer, FileDown } from 'lucide-react';
import { useIndicadoresInterseccionais, useDadosOrcamentarios } from '@/hooks/useLacunasData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getExportToolbarHTML, downloadAsDocx } from '@/utils/reportExportToolbar';
import { openHtmlPreview, prepareHtmlPreview } from '@/utils/reportPreview';
import { matchesRecommendationEvidence, normalizeSearchText } from '@/utils/recommendationKeywordMatching';
import { toast } from 'sonner';

type Rec = {
  paragrafo: string;
  tema: string;
  descricao_lacuna: string;
  texto_original_onu?: string | null;
  grupo_focal?: string | null;
};

/** For each evidence item text, find which recommendations match via keyword engine */
function computeReverseMap(
  recomendacoes: Rec[],
  items: { text: string; id: string }[]
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const item of items) {
    const matched: string[] = [];
    for (const rec of recomendacoes) {
      if (matchesRecommendationEvidence(rec, item.text)) {
        matched.push(`§${rec.paragrafo}`);
      }
    }
    map.set(item.id, matched);
  }
  return map;
}

function generateEvidenceInventoryHTML(
  indicadores: any[],
  normativos: any[],
  orcamento: any[],
  recomendacoes: Rec[],
): string {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Pre-compute reverse recommendation mappings
  const indItems = indicadores.map(i => ({
    id: i.id,
    text: [i.nome, i.subcategoria, i.fonte, i.analise_interseccional].filter(Boolean).join(' ')
  }));
  const indRecMap = computeReverseMap(recomendacoes, indItems);

  const normItems = normativos.map(n => ({
    id: n.id,
    text: [n.titulo, n.categoria].filter(Boolean).join(' ')
  }));
  const normRecMap = computeReverseMap(recomendacoes, normItems);

  const orcItems = orcamento.map(o => ({
    id: o.id,
    text: [o.programa, o.orgao, o.descritivo, o.observacoes, o.eixo_tematico, o.publico_alvo, o.razao_selecao, o.grupo_focal].filter(Boolean).join(' ')
  }));
  const orcRecMap = computeReverseMap(recomendacoes, orcItems);

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
        const recs = (indRecMap.get(i.id) || []).join(', ') || '—';
        return `<tr>
          <td>${i.nome}</td>
          <td>${i.subcategoria || '—'}</td>
          <td>${i.fonte}</td>
          <td>${i.tendencia || '—'}</td>
          <td style="font-family:monospace;font-size:9px">${artigos}</td>
          <td style="font-size:9px">${recs}</td>
        </tr>`;
      }).join('');
      return `<h3>${catLabel(cat)} (${items.length})</h3>
      <table><tr><th>Indicador</th><th>Subcategoria</th><th>Fonte</th><th>Tendência</th><th>Artigos ICERD</th><th>Recomendações Vinculadas</th></tr>
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
        const recsCadastradas = (n.recomendacoes_impactadas || []).join(', ') || '—';
        const recsMotor = (normRecMap.get(n.id) || []).join(', ') || '—';
        return `<tr>
          <td>${n.titulo}</td>
          <td>${n.status}</td>
          <td style="font-family:monospace;font-size:9px">${artigos}</td>
          <td style="font-size:9px">${recsCadastradas}</td>
          <td style="font-size:9px">${recsMotor}</td>
        </tr>`;
      }).join('');
      return `<h3>${catLabel(cat)} (${items.length})</h3>
      <table><tr><th>Título</th><th>Status</th><th>Artigos ICERD</th><th>Recs. Cadastradas</th><th>Recs. Motor Keyword</th></tr>
      ${rows}</table>`;
    }).join('');

  // ── Orçamento por órgão e programa
  const orcPorOrgao: Record<string, any[]> = {};
  orcamento.forEach(o => {
    const org = o.orgao || 'Outros';
    if (!orcPorOrgao[org]) orcPorOrgao[org] = [];
    orcPorOrgao[org].push(o);
  });

  const orcRows = Object.entries(orcPorOrgao)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([orgao, items]) => {
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
          const grupoFocal = [...new Set(regs.map((r: any) => r.grupo_focal).filter(Boolean))].join(', ') || '—';
          const publicoAlvo = [...new Set(regs.map((r: any) => r.publico_alvo).filter(Boolean))].join(', ') || '—';
          const razaoSelecao = [...new Set(regs.map((r: any) => r.razao_selecao).filter(Boolean))].join('; ') || '—';
          // Aggregate recommendation matches from all records in this program
          const recsSet = new Set<string>();
          regs.forEach((r: any) => {
            (orcRecMap.get(r.id) || []).forEach(p => recsSet.add(p));
          });
          const recsStr = recsSet.size > 0 ? [...recsSet].sort().join(', ') : '—';
          return `<tr>
            <td>${prog}</td>
            <td>${regs.length}</td>
            <td>${anos}</td>
            <td style="text-align:right">${totalLiq > 0 ? 'R$ ' + totalLiq.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '—'}</td>
            <td>${eixo}</td>
            <td>${grupoFocal}</td>
            <td style="font-size:9px">${publicoAlvo !== '—' ? publicoAlvo : razaoSelecao}</td>
            <td style="font-family:monospace;font-size:9px">${artigos}</td>
            <td style="font-size:9px">${recsStr}</td>
          </tr>`;
        }).join('');

      return `<h3>${orgao} (${items.length} registros, ${Object.keys(porProg).length} programas)</h3>
      <table><tr><th>Programa / Ação</th><th>Reg.</th><th>Anos</th><th>Liquidado Acum.</th><th>Eixo</th><th>Grupo Focal</th><th>Público-Alvo / Razão</th><th>Artigos ICERD</th><th>Recomendações Vinculadas</th></tr>
      ${progRows}</table>`;
    }).join('');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Inventário Consolidado das 3 Bases de Evidências — CERD IV</title>
<style>
body{font-family:'Segoe UI',Arial,sans-serif;max-width:1200px;margin:0 auto;padding:20px;font-size:11px;line-height:1.5;color:#1a1a2e}
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
<strong>Como usar:</strong> A coluna <em>Artigos ICERD</em> mostra as tags explícitas do banco de dados. 
A coluna <em>Recomendações Vinculadas</em> mostra os parágrafos vinculados pelo motor de palavras-chave (mesma lógica do Sensor Diagnóstico).
Para Normativos, são exibidas tanto as recomendações cadastradas manualmente quanto as detectadas automaticamente pelo motor.
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
Dados extraídos em tempo real do banco de dados. A coluna "Recomendações Vinculadas" reflete o motor de palavras-chave v5.3 com concept bundles e tokens de sinal focal.
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
  const { data: recomendacoes } = useQuery({
    queryKey: ['recomendacoes_for_inventory'],
    queryFn: async () => {
      const { data } = await supabase.from('lacunas_identificadas').select('paragrafo, tema, descricao_lacuna, texto_original_onu, grupo_focal').order('paragrafo');
      return (data || []) as Rec[];
    },
  });

  const [generating, setGenerating] = useState<string | null>(null);

  const handleExport = async (format: 'html' | 'docx') => {
    setGenerating(format);
    const previewWindow = format === 'html' ? prepareHtmlPreview('Inventario-3-Bases-Evidencias') : null;
    try {
      const html = generateEvidenceInventoryHTML(indicadores || [], normativos || [], orcamento || [], recomendacoes || []);
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
          {' '}com seus respectivos <strong>Artigos ICERD</strong> e <strong>Recomendações vinculadas</strong> (§ parágrafos) — para auditoria manual.
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
