import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLacunasIdentificadas, useIndicadoresInterseccionais, useOrcamentoCanonico, useRespostasLacunasCerdIII, useLacunasStats } from '@/hooks/useLacunasData';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { useEvidenceOverridesReadOnly } from '@/hooks/useEvidenceOverrides';
import { toast } from 'sonner';
import { getExportRegistry } from '@/utils/exportRegistry';

type Item = { titulo: string; html: () => string | Promise<string> };

/** Extrai estilos e corpo de um documento HTML completo, removendo barras de ferramentas. */
function extrair(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, .no-print, .export-toolbar, #export-toolbar').forEach(el => el.remove());
  const styles = Array.from(doc.querySelectorAll('style')).map(s => s.textContent || '').join('\n');
  return { styles, body: doc.body?.innerHTML || '' };
}

const espera = (ms: number) => new Promise(res => setTimeout(res, ms));

/**
 * Abre uma página do sistema em iframe oculto (mesma sessão) e coleta:
 * - `chaves`: relatórios registrados pela página (mesmos geradores dos botões PDF/DOCX);
 * - `seletor`: a área exportável da tela, como faz o botão "PDF/HTML" da página.
 */
async function coletarPagina(rota: string, opt: { chaves?: string[]; seletor?: string; titulo?: string; aba?: string; todasAbas?: boolean }, timeoutMs = 60000) {
  const itens: { titulo: string; html: string }[] = [];
  const falhas: string[] = [];
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-20000px;top:0;width:1280px;height:1800px;border:0;';
  iframe.src = rota;
  document.body.appendChild(iframe);
  const inicio = Date.now();
  try {
    if (opt.aba) {
      let aba: HTMLElement | null = null;
      while (Date.now() - inicio < timeoutMs) {
        aba = iframe.contentDocument?.querySelector<HTMLElement>(`[data-export-tab="${opt.aba}"]`) || null;
        if (aba) break;
        await espera(500);
      }
      if (!aba) return { itens, falhas: [opt.titulo || `${rota} (${opt.aba})`] };
      // Radix Tabs ativa no teclado; click() programático fora da viewport é ignorado.
      aba.focus();
      aba.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
      aba.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));
    }
    if (opt.todasAbas && opt.seletor) {
      let container: HTMLElement | null = null;
      while (Date.now() - inicio < timeoutMs) {
        container = iframe.contentDocument?.querySelector<HTMLElement>(opt.seletor) || null;
        if (container?.querySelector('[role="tab"]')) break;
        await espera(500);
      }
      const abas = Array.from(container?.querySelectorAll<HTMLElement>('[role="tab"]') || []);
      const { buildExportHtmlFromElement } = await import('@/utils/reportExportToolbar');
      for (const aba of abas) {
        const titulo = `${opt.titulo} — ${aba.innerText.trim()}`;
        aba.focus();
        aba.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
        aba.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true }));
        let ultimo = -1, estavel = 0, painel: HTMLElement | null = null;
        const prazo = Date.now() + timeoutMs;
        while (Date.now() < prazo) {
          painel = container?.querySelector<HTMLElement>('[role="tabpanel"][data-state="active"]') || null;
          const n = painel?.innerText.length ?? -1;
          const carregando = !!painel?.querySelector('.animate-spin');
          if (aba.getAttribute('data-state') === 'active' && n > 0 && n === ultimo && !carregando) {
            if (++estavel >= 4) break;
          } else estavel = 0;
          ultimo = n;
          await espera(500);
        }
        if (aba.getAttribute('data-state') === 'active' && painel?.innerText.trim()) {
          itens.push({ titulo, html: buildExportHtmlFromElement(painel, rota, titulo) });
        } else falhas.push(titulo);
      }
      if (!abas.length) falhas.push(opt.titulo || rota);
    } else if (opt.chaves) {
      let regs: Map<string, any> | undefined;
      while (Date.now() - inicio < timeoutMs) {
        regs = iframe.contentWindow ? getExportRegistry(iframe.contentWindow) : undefined;
        if (regs && opt.chaves.every(k => regs.has(k))) break;
        await espera(500);
      }
      await espera(800);
      for (const k of opt.chaves) {
        const e = regs?.get(k);
        if (!e) { falhas.push(`${rota} (${k})`); continue; }
        try { itens.push({ titulo: e.titulo, html: await e.html() }); } catch { falhas.push(e.titulo); }
      }
    } else if (opt.seletor) {
      let ultimo = -1, estavel = 0, el: HTMLElement | null = null;
      while (Date.now() - inicio < timeoutMs) {
        el = iframe.contentDocument?.querySelector<HTMLElement>(opt.seletor) || null;
        const n = el?.innerText.length ?? -1;
        const carregando = !!iframe.contentDocument?.querySelector('.animate-spin');
        if (el && n > 0 && n === ultimo && !carregando) { if (++estavel >= 4) break; } else estavel = 0;
        ultimo = n;
        await espera(500);
      }
      if (el) {
        const { buildExportHtmlFromElement } = await import('@/utils/reportExportToolbar');
        itens.push({ titulo: opt.titulo || rota, html: buildExportHtmlFromElement(el, rota, opt.titulo) });
      } else falhas.push(opt.titulo || rota);
    }
  } finally {
    iframe.remove();
  }
  return { itens, falhas };
}

export function BaixarTudoButton() {
  const [gerando, setGerando] = useState(false);
  const { data: recomendacoes, isLoading: l1 } = useLacunasIdentificadas();
  const { data: indicadores, isLoading: l2 } = useIndicadoresInterseccionais();
  const { data: orc, isLoading: l3 } = useOrcamentoCanonico();
  const { data: respostas, isLoading: l4 } = useRespostasLacunasCerdIII();
  const { data: stats } = useLacunasStats();
  const { data: normativos, isLoading: l5 } = useQuery({
    queryKey: ['documentos_normativos_baixar_tudo'],
    queryFn: async () => (await supabase.from('documentos_normativos').select('*')).data || [],
  });
  const overrides = useEvidenceOverridesReadOnly();
  const { diagnosticMap, isReady, rawIndicadores, rawOrcamento, rawNormativos, artigoEvidencia } = useDiagnosticSensor(recomendacoes, overrides) as any;
  const carregando = l1 || l2 || l3 || l4 || l5 || !isReady;

  const gerar = async () => {
    setGerando(true);
    try {
      const [o, rec, fu, met, metDet, prOrc, prGov] = await Promise.all([
        import('@/components/estatisticas/orcamento/generateOrcamentoHTML'),
        import('@/components/recomendacoes/generateRecomendacoesHTML'),
        import('@/components/recomendacoes/generateFollowUpHTML'),
        import('@/components/reports/generateMethodologyHTML'),
        import('@/components/shared/generateMetodologiaDetalhadaHTML'),
        import('@/components/reports/generateProtocoloOrcamentarioHTML'),
        import('@/components/reports/generateProtocoloGovernancaHTML'),
      ]);
      const [indTab, guards, tab, recAudit, artAudit, shared, artConv] = await Promise.all([
        import('@/components/estatisticas/IndicadoresDbTab'),
        import('@/utils/indicatorEvidenceGuards'),
        import('@/utils/generateTabReportHTML'),
        import('@/components/recomendacoes/generateRecomendacaoAuditHTML'),
        import('@/components/artigos/generateArtigoAuditHTML'),
        import('@/components/recomendacoes/recomendacaoExportShared'),
        import('@/utils/artigosConvencao'),
      ]);
      const matriz = await (await import('@/utils/matrizAuditada')).fetchMatrizAuditada();
      const lookups = shared.buildExportLookups(rawIndicadores || indicadores || [], rawOrcamento || orc || [], rawNormativos || normativos || []);
      const esc = (v: any) => String(v ?? '—').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
      const normativaHTML = () => {
        const docs = [...((normativos || []) as any[])].sort((a, b) => String(a.categoria).localeCompare(String(b.categoria)) || String(a.titulo).localeCompare(String(b.titulo)));
        const linhas = docs.map(d => `<tr><td>${esc(d.titulo)}</td><td>${esc(d.categoria)}</td><td>${esc((d.artigos_convencao || []).join(', '))}</td><td>${esc((d.recomendacoes_impactadas || []).map((x: string) => '§' + String(x).replace(/^§/, '')).join(', '))}</td><td>${d.url_origem ? `<a href="${esc(d.url_origem)}">fonte</a>` : '—'}</td></tr>`).join('');
        return tab.generateTabReportHTML({ title: 'Base Normativa/Institucional', subtitle: `${docs.length} documentos normativos`, content: `<table><thead><tr><th>Documento</th><th>Categoria</th><th>Artigos ICERD</th><th>Recomendações</th><th>Fonte</th></tr></thead><tbody>${linhas}</tbody></table>` });
      };
      const indFiltrados = ((indicadores || []) as any[]).filter(i => !guards.isPendingAuditIndicator(i));
      const r = (orc || []) as any[];
      const itens: Item[] = [
        { titulo: 'Metodologia do Sistema', html: () => met.generateMethodologyHTML() },
        { titulo: 'Metodologia Detalhada — Esforço e Impacto', html: () => metDet.generateMetodologiaDetalhadaHTML() },
        { titulo: 'Protocolo Metodológico de Governança', html: () => prGov.generateProtocoloGovernancaHTML({ indicadores: indicadores || [], orcDados: r, normativos: normativos || [], recomendacoes: recomendacoes || [], diagnosticMap } as any) },
        { titulo: 'Recomendações — Observações Finais', html: () => rec.generateObservacoesFinaisHTML() },
        { titulo: 'Recomendações — Lacunas', html: () => rec.generateLacunasExportHTML(recomendacoes || [], stats) },
        { titulo: 'Respostas às críticas do CERD III', html: () => rec.generateRespostasCerdIIIExportHTML(respostas || []) },
        { titulo: 'Recomendações Gerais', html: () => rec.generateRecomendacoesGeraisHTML() },
        { titulo: 'Durban — Cruzamento', html: () => rec.generateDurbanExportHTML() },
        { titulo: 'Follow-up 2026', html: () => fu.generateFollowUpHTML() },
        { titulo: 'Base Orçamentária — Visão Geral', html: () => o.generateVisaoGeralHTML(r) },
        { titulo: 'Base Orçamentária — Universo da Base', html: () => o.generateUniversoBaseHTML(r) },
        { titulo: 'Base Orçamentária — Resumo Comparativo', html: () => o.generateResumoComparativoHTML(r) },
        { titulo: 'Base Orçamentária — Relatório', html: () => o.generateRelatorioHTML(r) },
        { titulo: 'Base Orçamentária — Metodologia', html: () => o.generateMetodologiaHTML() },
        { titulo: 'Base Orçamentária — Artigos ICERD', html: () => o.generateArtigosCruzamentoHTML(r, matriz.artigosPorOrcamento) },
        { titulo: 'Base Estatística — Indicadores', html: () => indTab.generateIndicadoresHTML(indFiltrados as any) },
        { titulo: 'Base Normativa/Institucional', html: normativaHTML },
        ...((recomendacoes || []) as any[]).map((rec): Item => ({
          titulo: `Recomendação §${rec.paragrafo} — ${rec.tema}`,
          html: () => recAudit.generateRecomendacaoAuditHTML({ recomendacao: rec, diagnostic: diagnosticMap.get(rec.id), ...lookups } as any),
        })),
        ...artConv.ARTIGOS_CONVENCAO.map((def: any): Item => ({
          titulo: `Artigo ${def.numero} ICERD — ${def.titulo}`,
          html: () => artAudit.generateArtigoAuditHTML({ artigo: def.numero, recomendacoes: recomendacoes || [], diagnosticMap, lookups, artigoEvidencia } as any),
        })),
        { titulo: 'Protocolo Orçamentário', html: () => prOrc.generateProtocoloOrcamentarioHTML({ orcDados: r } as any) },
      ];

      // Os inventários ficam montados nesta página; Escopo e Conclusões só montam ao abrir suas abas.
      const locais = [...getExportRegistry().entries()].filter(([k]) => ['inv-est', 'inv-evid'].includes(k)).sort((a, b) => a[1].ordem - b[1].ordem);
      for (const [, e] of locais) itens.push({ titulo: e.titulo, html: e.html as any });
      const faltandoLocais = ['inv-est', 'inv-evid'].filter(k => !getExportRegistry().has(k));

      // Outras páginas: carregadas em segundo plano para usar os mesmos dados e geradores da tela.
      toast.info('Reunindo páginas (Painel Geral, Conclusões, Estatísticas, Fontes, Balizadores, Guia)…');
      const [integral, escopo, painel, conc, ...telas] = await Promise.all([
        coletarPagina('/gerar-relatorios', { aba: 'conclusoes-full', chaves: ['conc-integral'], titulo: 'Conclusões Analíticas — Relatório integral' }),
        coletarPagina('/gerar-relatorios', { aba: 'consolidado', chaves: ['escopo'], titulo: 'Escopo Consolidado' }),
        coletarPagina('/', { chaves: ['met-alim'] }),
        coletarPagina('/conclusoes', { chaves: ['conc-fios', 'conc-cruz', 'conc-alr', 'conc-tab', 'conc-sint'] }),
        coletarPagina('/estatisticas', { seletor: '#export-estatisticas', titulo: 'Estatísticas — visão da tela', todasAbas: true }),
        coletarPagina('/fontes', { seletor: '#export-fontes-dados', titulo: 'Fontes de Dados' }),
        coletarPagina('/documentos-balizadores', { seletor: '#export-documentos-balizadores', titulo: 'Documentos Balizadores' }),
        coletarPagina('/guia-auditoria', { seletor: '#export-guia-auditoria', titulo: 'Guia de Auditoria' }),
      ]);
      for (const p of [integral, escopo, painel, conc, ...telas]) {
        for (const s of p.itens) itens.push({ titulo: s.titulo, html: () => s.html });
      }
      const naoColetados = [...faltandoLocais.map(k => `relatório ${k} (dados ainda carregando)`), ...[integral, escopo, painel, conc, ...telas].flatMap(p => p.falhas)];

      // Folhas de estilo da aplicação embutidas (necessárias às capturas de tela).
      const appCss = (await Promise.all(Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map(l => fetch(l.href).then(x => x.text()).catch(() => '')))).join('\n');

      const estilos = new Set<string>();
      if (appCss) estilos.add(appCss);
      const secoes: string[] = [];
      const falhas: string[] = [...naoColetados];
      for (let i = 0; i < itens.length; i++) {
        if (i % 5 === 0) await new Promise(res => setTimeout(res, 0));
        try {
          const { styles, body } = extrair(await itens[i].html());
          if (styles) estilos.add(styles);
          secoes.push(`<section class="bt-sec" id="sec-${i}"><div class="bt-cab">${i + 1}. ${itens[i].titulo}</div>${body}</section>`);
        } catch (e) {
          console.error('Falha em', itens[i].titulo, e);
          falhas.push(itens[i].titulo);
        }
      }
      const ok = itens.filter(it => !falhas.includes(it.titulo));
      const indice = ok.map((it) => `<li><a href="#sec-${itens.indexOf(it)}">${it.titulo}</a></li>`).join('');
      const agora = new Date().toLocaleString('pt-BR');
      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Sistema CERD IV — Conteúdo completo</title>
<style>${[...estilos].join('\n')}
.bt-sec{page-break-before:always;break-before:page}
.bt-cab{font:600 11px sans-serif;color:#555;border-bottom:1px solid #ccc;padding:4px 0;margin-bottom:12px}
.bt-capa{font-family:sans-serif;padding:40px}
.bt-print{position:fixed;top:12px;right:12px;padding:8px 14px;font:600 13px sans-serif;cursor:pointer}
@media print{.bt-print{display:none}}
</style></head><body>
<button class="bt-print" onclick="window.print()">Salvar como PDF</button>
<div class="bt-capa"><h1>Sistema CERD IV — Conteúdo completo</h1><p>Gerado em ${agora}, a partir dos dados atuais do sistema.</p><h2>Índice</h2><ol>${indice}</ol></div>
${secoes.join('\n')}
</body></html>`;
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sistema-CERD-IV-completo-${new Date().toISOString().slice(0, 10)}.html`;
      document.body.appendChild(a); a.click(); a.remove();
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast.success(`${ok.length} relatórios reunidos em um único arquivo.`);
      if (falhas.length) toast.warning(`Não incluídos: ${falhas.join(', ')}`);
    } finally {
      setGerando(false);
    }
  };

  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardContent className="pt-6 flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3">
          <Package className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Baixar tudo — todos os relatórios em um único arquivo</h3>
            <p className="text-sm text-muted-foreground">Reúne, com os dados atuais, metodologias, protocolos, bases, recomendações, artigos, Conclusões, inventários, escopo e as telas de Estatísticas, Fontes, Balizadores e Guia, com índice (cerca de 1 minuto). Use “Salvar como PDF” no arquivo aberto.</p>
          </div>
        </div>
        <Button onClick={gerar} disabled={carregando || gerando} className="gap-2">
          {carregando || gerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {carregando ? 'Carregando dados…' : gerando ? 'Montando…' : 'Baixar tudo'}
        </Button>
      </CardContent>
    </Card>
  );
}
