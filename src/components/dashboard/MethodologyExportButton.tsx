import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2 } from 'lucide-react';
import { downloadAsDocx } from '@/utils/reportExportToolbar';

function generateMethodologyHTML(): string {
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

<h2>1. Princípio de Retroalimentação Automática (Single Source of Truth)</h2>
<p>O sistema opera sob o princípio de <strong>Fonte Única de Verdade</strong>: toda evidência cadastrada ou editada na aba <em>Recomendações</em> (Acompanhamento Gerencial) propaga automaticamente para todas as abas dependentes. Ao incluir ou excluir um indicador, ação orçamentária ou normativo, os seguintes painéis recalculam instantaneamente:</p>
<ul>
<li>Score e status de cada recomendação</li>
<li>Aderência por artigo ICERD</li>
<li>Score de evolução por recomendação e por artigo</li>
<li>Diagnóstico de lacunas remanescentes</li>
<li>Gráficos e badges do Painel Geral</li>
</ul>

<h2>2. Fluxo de Dados — Passo a Passo</h2>

<div class="step">
<span class="step-num">1</span><strong>Base de Evidências — Recomendações (Acompanhamento Gerencial)</strong>
<p>Ponto de partida: as 43 recomendações ONU com evidências vinculadas automaticamente por coerência temática. O usuário pode editar manualmente (incluir/excluir indicadores, ações orçamentárias e normativos) no pop-up de auditagem de cada recomendação.</p>
<table>
<tr><th>Dimensão</th><th>Peso</th><th>Critério</th></tr>
<tr><td>Indicadores vinculados</td><td>40%</td><td>Quantidade de indicadores com correspondência temática</td></tr>
<tr><td>Ações Orçamentárias</td><td>30%</td><td>Quantidade de ações/programas mapeados</td></tr>
<tr><td>Normativos</td><td>30%</td><td>Quantidade de instrumentos legislativos vinculados</td></tr>
</table>
<p><strong>Status:</strong> Cumprido (Score ≥ 65) | Parcial (Score ≥ 35) | Não Cumprido (Score &lt; 35)</p>
</div>

<div class="step">
<span class="step-num">2</span><strong>Artigos ICERD (Acompanhamento Gerencial)</strong>
<p>Consolida as recomendações por artigo da Convenção (I–VII). As evidências são as mesmas de Recomendações, filtradas por artigo.</p>
<table>
<tr><th>Dimensão</th><th>Peso</th></tr>
<tr><td>Recomendações ONU Cumpridas (taxa relativa)</td><td>50%</td></tr>
<tr><td>Cobertura Normativa</td><td>15%</td></tr>
<tr><td>Cobertura Orçamentária (contagem de ações)</td><td>10%</td></tr>
<tr><td>Indicadores</td><td>15%</td></tr>
<tr><td>Amplitude de Fontes</td><td>10%</td></tr>
</table>
<p><strong>Faixas:</strong> Boa Aderência (≥ 70%) | Aderência Parcial (40–69%) | Baixa Aderência (&lt; 40%)</p>
</div>

<div class="step">
<span class="step-num">3</span><strong>Evolução das Recomendações (Produtos → Conclusões)</strong>
<p>Avalia se o esforço gerou resultado no período 2018-2025. Base de evidências idêntica à de Recomendações.</p>
<table>
<tr><th>Dimensão</th><th>Peso</th><th>Critério</th></tr>
<tr><td>Indicadores (tendência histórica)</td><td>50%</td><td>Somente melhorias comprovadas ou novas medições pontuam</td></tr>
<tr><td>Orçamento (R$ liquidado)</td><td>30%</td><td>Valor liquidado acumulado</td></tr>
<tr><td>Normativos (estoque)</td><td>20%</td><td>Quantidade de instrumentos</td></tr>
</table>
<p><strong>Classifica:</strong> Evolução (≥ 60%) | Estagnação (35–59%) | Retrocesso (&lt; 35%)</p>
</div>

<div class="step">
<span class="step-num">4</span><strong>Evolução dos Artigos (Produtos → Conclusões)</strong>
<p>Avalia impacto real por artigo. Complementa a Aderência com a dimensão de resultado efetivo.</p>
<table>
<tr><th>Dimensão</th><th>Peso</th><th>Critério</th></tr>
<tr><td>Orçamento (valor liquidado por faixas)</td><td>35%</td><td>Faixas: &gt;0 (20pts), ≥R$100M (40), ≥R$1B (60), ≥R$5B (80), ≥R$10B (100)</td></tr>
<tr><td>Normativos (estoque por faixas)</td><td>35%</td><td>Faixas: 1 (25pts), 3 (50), 6 (75), 10+ (100)</td></tr>
<tr><td>Indicadores (tendência)</td><td>30%</td><td>Melhorias = 100%, pioras penalizam na proporção 1:1</td></tr>
</table>
</div>

<div class="step">
<span class="step-num">5</span><strong>Diagnóstico de Lacunas (Produtos → Conclusões)</strong>
<p>Mesma base de Recomendações, com visualização focada nas lacunas remanescentes. Apresenta resposta sugerida textual que amarra as evidências encontradas. Atualiza automaticamente ao editar evidências em Recomendações.</p>
</div>

<h2>3. Reflexo no Painel Geral</h2>
<table>
<tr><th>Seção do Painel</th><th>Fonte de Dados</th></tr>
<tr><td>Esforço Governamental</td><td>Status consolidado de Recomendações (Cumprido/Parcial/Não Cumprido)</td></tr>
<tr><td>Impacto Real</td><td>Resultado consolidado de Evolução das Recomendações (Evolução/Estagnação/Retrocesso)</td></tr>
<tr><td>Lente dos Artigos — Esforço %</td><td>Score de Aderência ICERD por artigo</td></tr>
<tr><td>Lente dos Artigos — Evolução %</td><td>Score de Evolução dos Artigos por artigo</td></tr>
</table>

<div class="note">
<strong>Nenhum cálculo próprio:</strong> O Painel Geral é um espelho puro dos motores analíticos. Qualquer edição em Recomendações se reflete automaticamente em todos os painéis e no Painel Geral.
</div>

<h2>4. Progresso Global — Ponderação</h2>
<table>
<tr><th>Status</th><th>Peso no Progresso</th></tr>
<tr><td>Cumprido</td><td>100%</td></tr>
<tr><td>Parcialmente Cumprido</td><td>50%</td></tr>
<tr><td>Não Cumprido</td><td>10%</td></tr>
</table>

<hr/>
<p style="font-size:10px;color:#94a3b8;">📋 Documento gerado pelo Sistema de Subsídios CERD IV — ${now}</p>
</body></html>`;
}

export function MethodologyExportButton() {
  const [generating, setGenerating] = useState(false);

  const handleExport = () => {
    const html = generateMethodologyHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  const handleDocx = async () => {
    setGenerating(true);
    try {
      const html = generateMethodologyHTML();
      await downloadAsDocx(html, 'metodologia-alimentacao-dados');
    } finally {
      setGenerating(false);
    }
  };

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
