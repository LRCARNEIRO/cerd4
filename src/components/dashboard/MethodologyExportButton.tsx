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
<li>Esforço e Impacto de cada recomendação</li>
<li>Esforço e Impacto por artigo ICERD</li>
<li>Diagnóstico de lacunas remanescentes</li>
<li>Gráficos e badges do Painel Geral</li>
</ul>

<h2>2. Fluxo de Dados — Passo a Passo</h2>

<div class="step">
<span class="step-num">1</span><strong>Base de Evidências — Recomendações (Acompanhamento Gerencial)</strong>
<p>Ponto de partida: as 42 recomendações ONU e a matriz auditada Artigo × Recomendação × Evidência.</p>
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
<tr><td>Esforço Governamental</td><td>Distribuição e média do índice de Esforço das recomendações</td></tr>
<tr><td>Impacto Real</td><td>Resultado consolidado de Evolução das Recomendações (Evolução/Estagnação/Retrocesso)</td></tr>
<tr><td>Lente dos Artigos — Esforço e Impacto</td><td>Média simples do Esforço e do Impacto Evidenciado das recomendações do artigo</td></tr>
<tr><td>Lente dos Artigos — Evolução %</td><td>Score de Evolução dos Artigos por artigo</td></tr>
</table>

<div class="note">
<strong>Nenhum cálculo próprio:</strong> O Painel Geral é um espelho puro dos motores analíticos. Qualquer edição em Recomendações se reflete automaticamente em todos os painéis e no Painel Geral.
</div>

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
