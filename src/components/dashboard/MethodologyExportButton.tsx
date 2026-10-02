import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { downloadAsDocx } from '@/utils/reportExportToolbar';
import { useIndicadoresInterseccionais, useOrcamentoCanonico } from '@/hooks/useLacunasData';
import { buildRolEstatistico } from '@/utils/rolEstatisticoCanonico';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useMatrizAuditada } from '@/utils/matrizAuditada';
import { useRegisterExport } from '@/utils/exportRegistry';

type Contagens = { est: number; orc: number; norm: number; enderecos: number; rel: { total: number; est: number; orc: number; norm: number } };

function generateMethodologyHTML({ est, orc, norm, enderecos, rel }: Contagens): string {
  const tot = est + orc + norm;
  const f = (n: number) => n.toLocaleString('pt-BR');
  const now = new Date().toLocaleString('pt-BR');
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Metodologia de Alimentação de Dados — Sistema CERD IV</title>
<style>
body{font-family:'Segoe UI',Arial,sans-serif;max-width:210mm;margin:0 auto;padding:20px;font-size:12px;line-height:1.6;color:#1a1a2e}
h1{font-size:20px;color:#0f3460;border-bottom:3px solid #0f3460;padding-bottom:8px}
h2{font-size:16px;color:#16213e;margin-top:24px}
h3{font-size:13px;color:#0f3460;margin-top:16px}
.step{border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin:10px 0;background:#f8fafc}
.step-num{display:inline-block;width:28px;height:28px;border-radius:50%;background:#0f3460;color:white;text-align:center;line-height:28px;font-weight:bold;font-size:13px;margin-right:8px}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11px}
th{background:#0f3460;color:white;padding:6px 10px;text-align:left}
td{padding:6px 10px;border-bottom:1px solid #e2e8f0}
tr:nth-child(even){background:#f8fafc}
.note{font-size:10px;color:#64748b;font-style:italic;padding:8px;background:#fffbeb;border-left:3px solid #f59e0b;margin:12px 0;border-radius:4px}
ul{padding-left:20px}li{margin-bottom:4px}
@media print{body{padding:0}@page{size:A4;margin:2cm}}
</style></head><body>
<h1>📋 Metodologia de Alimentação de Dados</h1>
<p><strong>Sistema de Subsídios para o IV Relatório CERD</strong></p>
<p>Gerado em: ${now}</p>

<h2>1. Fontes canônicas e fluxo de atualização — Metodologia v7</h2>
<p>O sistema parte de três bases canônicas e imutáveis na camada analítica: <strong>${f(est)} evidências estatísticas, ${f(orc)} orçamentárias e ${f(norm)} normativas</strong>, totalizando <strong>${f(tot)} evidências</strong>. Os vínculos auditados entre essas bases e as recomendações alimentam Produtos, Conclusões, relatórios e o Painel Geral. Ajustes nos produtos não retornam nem alteram as três bases.</p>
<ul>
<li>Inventário canônico: ${f(tot)} evidências — ${f(est)} estatísticas, ${f(orc)} orçamentárias e ${f(norm)} normativas</li>
<li>Matriz relacional auditada: ${f(enderecos)} endereços válidos Artigo × Recomendação × Evidência</li>
<li>Após deduplicar a mesma evidência para a mesma recomendação entre artigos: ${f(rel.total)} relações distintas — ${f(rel.est)} estatísticas, ${f(rel.orc)} orçamentárias e ${f(rel.norm)} normativas</li>
<li>As 42 recomendações originais permanecem no universo analítico, inclusive quando não possuem evidência vinculada</li>
</ul>

<h2>2. Fluxo de Dados — Passo a Passo</h2>

<div class="step">
<span class="step-num">1</span><strong>Bases de Evidências e Matriz Relacional Auditada</strong>
<p>Ponto de partida: o inventário canônico, as 42 recomendações originais e os ${f(enderecos)} endereços válidos da matriz auditada. Para calcular cada recomendação, uma evidência repetida entre artigos é contada uma única vez.</p>
<table>
<tr><th>Base</th><th>Teto do Esforço</th><th>Peso</th></tr>
<tr><td>Estatística</td><td>31 evidências</td><td>1/3</td></tr>
<tr><td>Orçamentária</td><td>25 evidências</td><td>1/3</td></tr>
<tr><td>Normativa</td><td>4 evidências</td><td>1/3</td></tr>
</table>
<p><strong>Esforço:</strong> E = [100×min(nEst/31;1) + 100×min(nOrç/25;1) + 100×min(nNorm/4;1)] ÷ 3.</p>
<p><strong>Realização:</strong> R_est = (melhorou + estável) ÷ total mensurável × 100; R_orç = Σ Liquidado ÷ Σ Dotação autorizada válida × 100; R_norm = presença 100, ausência 0; R = (R_est + R_orç + R_norm) ÷ 3.</p>
<p><strong>Impacto Evidenciado:</strong> I = E × R ÷ 100. Estável representa manutenção e vale 1; apenas piora vale 0.</p>
<p><strong>Faixas:</strong> Baixo &lt;25 | Intermediário 25–59,9 | Alto ≥60.</p>
</div>

<div class="step">
<span class="step-num">2</span><strong>Artigos ICERD (Acompanhamento Gerencial)</strong>
<p>Cada artigo recebe a média simples do Esforço e do Impacto das recomendações formalmente associadas. Recomendações sem evidência permanecem no denominador com zero, evitando favorecer artigos com maior número de recomendações.</p>
</div>

<div class="step">
<span class="step-num">3</span><strong>Diagnóstico e Painel Geral</strong>
<p>Visualização das lacunas remanescentes e das evidências auditadas. Os resultados são recalculados quando as bases canônicas ou os vínculos curados são atualizados, sem criar uma fonte paralela de dados.</p>
</div>

<h2>3. Reflexo no Painel Geral</h2>
<table>
<tr><th>Seção do Painel</th><th>Fonte de Dados</th></tr>
<tr><td>Esforço Governamental</td><td>Distribuição e média do índice de Esforço das recomendações</td></tr>
<tr><td>Impacto Evidenciado</td><td>Distribuição e média do índice E × R ÷ 100 das recomendações</td></tr>
<tr><td>Lente dos Artigos — Esforço e Impacto</td><td>Média simples do Esforço e do Impacto Evidenciado das recomendações do artigo</td></tr>
<tr><td>Execução Orçamentária</td><td>Base Orçamentária canônica, por Ação × Ano, após deduplicação lógica; inclui SESAI</td></tr>
</table>

<div class="note">
<strong>Nenhuma retroalimentação paralela:</strong> o Painel Geral apenas apresenta os resultados dos motores analíticos e os totais das bases canônicas. Ele não grava, altera ou devolve dados às bases Estatística, Orçamentária e Normativa.
</div>

<hr/>
<p style="font-size:10px;color:#94a3b8;">📋 Documento gerado pelo Sistema de Subsídios CERD IV — ${now}</p>
</body></html>`;
}

export function MethodologyExportButton() {
  const [generating, setGenerating] = useState(false);
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: orcamento } = useOrcamentoCanonico();
  const { data: normCount } = useQuery({
    queryKey: ['metodologia-normativos-count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('documentos_normativos').select('id', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });
  const { data: matriz } = useMatrizAuditada();
  const contagens = (): Contagens => ({
    enderecos: matriz?.enderecos ?? 0,
    rel: matriz?.relacoes ?? { total: 0, est: 0, orc: 0, norm: 0 },
    est: buildRolEstatistico(indicadores as any[]).total,
    orc: (orcamento as any[] | undefined)?.length || 0,
    norm: normCount || 0,
  });

  const handleExport = () => {
    const html = generateMethodologyHTML(contagens());
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  const handleDocx = async () => {
    setGenerating(true);
    try {
      const html = generateMethodologyHTML(contagens());
      await downloadAsDocx(html, 'metodologia-alimentacao-dados');
    } finally {
      setGenerating(false);
    }
  };

  useRegisterExport('met-alim', 'Metodologia de Alimentação de Dados', 160, !!(indicadores && orcamento && matriz && normCount !== undefined), () => generateMethodologyHTML(contagens()));

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
        <FileText className="w-3.5 h-3.5" />
        Metodologia de Alimentação de Dados
      </Button>
      <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleDocx} disabled={generating}>
        {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
        DOCX
      </Button>
    </div>
  );
}
