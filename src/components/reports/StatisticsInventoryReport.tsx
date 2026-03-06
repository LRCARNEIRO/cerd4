import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, Loader2, Database, BarChart3 } from 'lucide-react';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { getExportToolbarHTML } from '@/utils/reportExportToolbar';
import {
  dadosDemograficos,
  evolucaoComposicaoRacial,
  indicadoresSocioeconomicos,
  segurancaPublica,
  feminicidioSerie,
  educacaoSerieHistorica,
  saudeSerieHistorica,
  interseccionalidadeTrabalho,
  deficienciaPorRaca,
  serieAntraTrans,
  lgbtqiaPorRaca,
  classePorRaca,
  mulheresChefeFamilia,
  violenciaInterseccional,
  juventudeNegra,
  educacaoInterseccional,
  saudeInterseccional,
  radarVulnerabilidades,
  evolucaoDesigualdade,
} from '@/components/estatisticas/StatisticsData';
import {
  tabelasDemograficas,
  tabelasEconomicas,
  tabelasEducacao,
  tabelasSaude,
  tabelasTrabalho,
  tabelasPobreza,
  tabelasSeguranca,
  tabelasHabitacao,
  tabelasSistemaPolitico,
} from '@/components/estatisticas/CommonCoreTab';
import { TOTAL_DADOS_NOVOS } from '@/components/estatisticas/DadosNovosTab';
import { TOTAL_DADOS_ESTATISTICAS, TOTAL_TABELAS_COMMON_CORE, TOTAL_DADOS_COMMON_CORE } from '@/utils/countStatisticsIndicators';

function generateInventoryHTML(indicadoresBD: any[]) {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Series data
  const series = [
    { nome: 'Composição Racial (PNAD)', registros: evolucaoComposicaoRacial.length, fonte: 'SIDRA/IBGE Tab. 6403', periodo: '2018-2024' },
    { nome: 'Dados Demográficos (Censo 2022)', registros: dadosDemograficos.composicaoRacial.length, fonte: 'SIDRA/IBGE Tab. 9605', periodo: '2022' },
    { nome: 'Indicadores Socioeconômicos', registros: indicadoresSocioeconomicos.length, fonte: 'PNAD Contínua', periodo: '2018-2024' },
    { nome: 'Segurança Pública', registros: segurancaPublica.length, fonte: 'FBSP / SIM-DataSUS', periodo: '2018-2024' },
    { nome: 'Feminicídio', registros: feminicidioSerie.length, fonte: 'FBSP', periodo: '2018-2024' },
    { nome: 'Educação — Série Histórica', registros: educacaoSerieHistorica.length, fonte: 'INEP / PNAD', periodo: '2018-2024' },
    { nome: 'Saúde — Série Histórica', registros: saudeSerieHistorica.length, fonte: 'DataSUS / SIM / SINASC', periodo: '2018-2024' },
    { nome: 'Trabalho Interseccional', registros: interseccionalidadeTrabalho.length, fonte: 'PNAD Contínua', periodo: '2018-2024' },
    { nome: 'Deficiência × Raça', registros: deficienciaPorRaca.length, fonte: 'IBGE / Censo 2022', periodo: '2022' },
    { nome: 'LGBTQIA+ — ANTRA/Trans', registros: serieAntraTrans.length, fonte: 'ANTRA / FBSP', periodo: '2018-2024' },
    { nome: 'LGBTQIA+ × Raça', registros: lgbtqiaPorRaca.length, fonte: 'Pesquisa Sexualidade IBGE', periodo: '2022' },
    { nome: 'Classe Social × Raça', registros: classePorRaca.length, fonte: 'PNAD Contínua / SIS', periodo: '2022' },
    { nome: 'Mulheres Chefes de Família', registros: mulheresChefeFamilia.length, fonte: 'PNAD / Censo 2022', periodo: '2010-2024' },
    { nome: 'Violência Interseccional', registros: violenciaInterseccional.length, fonte: 'FBSP / DataSUS', periodo: '2018-2024' },
    { nome: 'Juventude Negra', registros: juventudeNegra.length, fonte: 'FBSP / PNAD', periodo: '2018-2024' },
    { nome: 'Educação Interseccional', registros: educacaoInterseccional.length, fonte: 'INEP', periodo: '2018-2024' },
    { nome: 'Saúde Interseccional', registros: saudeInterseccional.length, fonte: 'DataSUS', periodo: '2018-2024' },
    { nome: 'Radar de Vulnerabilidades', registros: radarVulnerabilidades.length, fonte: 'Múltiplas', periodo: '2022-2024' },
    { nome: 'Evolução da Desigualdade', registros: evolucaoDesigualdade.length, fonte: 'IBGE / PNAD', periodo: '2018-2024' },
  ];

  const totalSeriesRegistros = series.reduce((s, a) => s + a.registros, 0);

  // Common Core tables by category
  const ccCategorias = [
    { nome: 'Demográficas', tabelas: tabelasDemograficas },
    { nome: 'Econômicas', tabelas: tabelasEconomicas },
    { nome: 'Educação', tabelas: tabelasEducacao },
    { nome: 'Saúde', tabelas: tabelasSaude },
    { nome: 'Trabalho', tabelas: tabelasTrabalho },
    { nome: 'Pobreza', tabelas: tabelasPobreza },
    { nome: 'Segurança', tabelas: tabelasSeguranca },
    { nome: 'Habitação', tabelas: tabelasHabitacao },
    { nome: 'Sistema Político', tabelas: tabelasSistemaPolitico },
  ];

  // BD indicators by category
  const bdCategorias: Record<string, any[]> = {};
  indicadoresBD.forEach(i => {
    const cat = i.categoria || 'outros';
    if (!bdCategorias[cat]) bdCategorias[cat] = [];
    bdCategorias[cat].push(i);
  });

  const catLabels: Record<string, string> = {
    seguranca_publica: 'Segurança Pública',
    saude: 'Saúde',
    educacao: 'Educação',
    terra_territorio: 'Terras e Territórios',
    trabalho_renda: 'Trabalho e Renda',
    politicas_institucionais: 'Políticas Institucionais',
    legislacao_justica: 'Legislação e Justiça',
    participacao_social: 'Participação Social',
    dados_estatisticas: 'Dados e Estatísticas',
    cultura_patrimonio: 'Cultura e Patrimônio',
    habitacao: 'Habitação',
  };

  const totalGeral = totalSeriesRegistros + TOTAL_DADOS_COMMON_CORE + TOTAL_DADOS_NOVOS + indicadoresBD.length;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Inventário Completo — Base Estatística CERD IV</title>
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 1100px; margin: 0 auto; padding: 20px; color: #1a1a2e; line-height: 1.6; }
  h1 { color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 10px; }
  h2 { color: #e94560; margin-top: 30px; border-left: 4px solid #e94560; padding-left: 12px; }
  h3 { color: #0f3460; margin-top: 20px; }
  .meta-box { background: #f0f4ff; border: 1px solid #d0d8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
  .stat-card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 14px; text-align: center; }
  .stat-card .value { font-size: 28px; font-weight: 800; color: #e94560; }
  .stat-card .label { font-size: 11px; color: #666; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
  th { background: #1a1a2e; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
  td { padding: 6px 10px; border-bottom: 1px solid #e8e8e8; }
  tr:nth-child(even) { background: #f8f9fc; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; margin-right: 4px; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-purple { background: #f3e8ff; color: #6b21a8; }
  .badge-amber { background: #fef3c7; color: #92400e; }
  .section-summary { background: #fafafa; border-left: 3px solid #0f3460; padding: 10px 14px; margin: 10px 0; font-size: 13px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #e8e8e8; font-size: 11px; color: #888; }
  @media print { .no-print { display: none !important; } body { padding: 10px; } }
</style>
</head>
<body>
${getExportToolbarHTML()}

<h1>📊 Inventário Completo — Base Estatística</h1>
<p style="color:#666;">Sistema de Subsídios para o IV Relatório CERD — Gerado em ${now}</p>

<div class="meta-box">
  <strong>Objetivo:</strong> Consolidar a dimensão total dos dados disponíveis na Base Estatística do sistema, 
  incluindo séries temporais, tabelas do Common Core (HRI/CORE), indicadores do banco de dados e dados novos auditáveis.
  Todos os dados seguem a <em>Regra de Ouro</em>: apenas fontes oficiais auditáveis.
</div>

<div class="stats-grid">
  <div class="stat-card">
    <div class="value">${totalGeral.toLocaleString('pt-BR')}</div>
    <div class="label">TOTAL GERAL DE REGISTROS</div>
  </div>
  <div class="stat-card">
    <div class="value">${TOTAL_TABELAS_COMMON_CORE}</div>
    <div class="label">TABELAS COMMON CORE</div>
  </div>
  <div class="stat-card">
    <div class="value">${indicadoresBD.length}</div>
    <div class="label">INDICADORES NO BANCO</div>
  </div>
  <div class="stat-card">
    <div class="value">${TOTAL_DADOS_NOVOS}</div>
    <div class="label">DADOS NOVOS AUDITÁVEIS</div>
  </div>
</div>

<!-- SEÇÃO 1: SÉRIES TEMPORAIS -->
<h2>1. Séries Temporais — Dados Gerais e Interseccionais</h2>
<p style="font-size:13px;color:#555;">Dados das abas: <em>Dados Gerais, Segurança/Saúde/Educação, Vulnerabilidades, Raça×Gênero, LGBTQIA+, Deficiência, Juventude, Classe Social</em></p>

<table>
  <thead>
    <tr><th>#</th><th>Série / Indicador</th><th>Registros</th><th>Fonte</th><th>Período</th></tr>
  </thead>
  <tbody>
    ${series.map((s, i) => `<tr><td>${i + 1}</td><td>${s.nome}</td><td><strong>${s.registros}</strong></td><td>${s.fonte}</td><td>${s.periodo}</td></tr>`).join('')}
  </tbody>
  <tfoot>
    <tr style="background:#f0f4ff;font-weight:600;">
      <td colspan="2">Total — Séries Temporais</td>
      <td>${totalSeriesRegistros}</td>
      <td colspan="2">${series.length} séries</td>
    </tr>
  </tfoot>
</table>

<!-- SEÇÃO 2: COMMON CORE -->
<h2>2. Common Core Document (HRI/CORE/BRA) — ${TOTAL_TABELAS_COMMON_CORE} Tabelas</h2>
<p style="font-size:13px;color:#555;">Aba: <em>Common Core (77)</em> — Atualização do documento HRI/CORE/BRA/2020</p>

${ccCategorias.map(cat => `
<h3>${cat.nome} (${cat.tabelas.length} tabelas)</h3>
<table>
  <thead>
    <tr><th>Nº</th><th>Título</th><th>Fonte</th><th>Período</th><th>Status</th><th>Linhas</th></tr>
  </thead>
  <tbody>
    ${cat.tabelas.map(t => `<tr>
      <td>${t.numero}</td>
      <td>${t.titulo}</td>
      <td>${t.fonte}</td>
      <td>${t.periodoAtualizado}</td>
      <td><span class="badge ${t.statusAtualizacao === 'atualizado' ? 'badge-green' : t.statusAtualizacao === 'parcial' ? 'badge-amber' : 'badge-red'}">${t.statusAtualizacao}</span></td>
      <td>${t.dados.rows.length}</td>
    </tr>`).join('')}
  </tbody>
</table>`).join('')}

<div class="section-summary">
  <strong>Resumo Common Core:</strong> ${TOTAL_TABELAS_COMMON_CORE} tabelas com ${TOTAL_DADOS_COMMON_CORE.toLocaleString('pt-BR')} linhas de dados individuais.
</div>

<!-- SEÇÃO 3: INDICADORES DO BANCO DE DADOS -->
<h2>3. Indicadores no Banco de Dados — ${indicadoresBD.length} registros</h2>
<p style="font-size:13px;color:#555;">Aba: <em>Indicadores (BD)</em> — Dados persistidos e consultáveis por todos os módulos analíticos</p>

${Object.entries(bdCategorias).sort((a, b) => b[1].length - a[1].length).map(([cat, inds]) => `
<h3>${catLabels[cat] || cat} (${inds.length} indicadores)</h3>
<table>
  <thead>
    <tr><th>Indicador</th><th>Fonte</th><th>Artigos ICERD</th><th>Desagregações</th></tr>
  </thead>
  <tbody>
    ${inds.map((ind: any) => {
      const desags = [];
      if (ind.desagregacao_raca) desags.push('Raça');
      if (ind.desagregacao_genero) desags.push('Gênero');
      if (ind.desagregacao_idade) desags.push('Idade');
      if (ind.desagregacao_territorio) desags.push('Território');
      if (ind.desagregacao_classe) desags.push('Classe');
      if (ind.desagregacao_deficiencia) desags.push('Deficiência');
      const arts = (ind.artigos_convencao || []).map((a: string) => `<span class="badge badge-purple">Art. ${a}</span>`).join('');
      return `<tr>
        <td>${ind.nome}</td>
        <td>${ind.fonte}</td>
        <td>${arts || '—'}</td>
        <td>${desags.map(d => `<span class="badge badge-blue">${d}</span>`).join('')}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>`).join('')}

<!-- SEÇÃO 4: DADOS NOVOS -->
<h2>4. Dados Novos Auditáveis — ${TOTAL_DADOS_NOVOS} indicadores</h2>
<p style="font-size:13px;color:#555;">Aba: <em>Dados Novos</em> — Indicadores confirmados com deep links para fontes oficiais (TSE, CNJ, SISDEPEN, DataSUS, FBSP)</p>
<div class="section-summary">
  <strong>${TOTAL_DADOS_NOVOS} indicadores auditáveis</strong> distribuídos em 9 categorias temáticas: Judiciário, Representatividade Política, Sistema Prisional, Segurança, Saúde, Educação, Habitação, Território e Orçamento.
  Todos os indicadores de prioridade alta foram persistidos no banco de dados (Seção 3).
</div>

<!-- SEÇÃO 5: ABAS ESPECIAIS -->
<h2>5. Abas Especiais</h2>

<h3>Administração Pública (MUNIC/ESTADIC 2024)</h3>
<div class="section-summary">
  Dados da MUNIC/IBGE 2023-2024 sobre existência de órgãos municipais de igualdade racial, conselhos, 
  planos municipais e adesão ao SINAPIR. Evidência da fragilidade institucional local.
</div>

<h3>COVID-19 e Desigualdade Racial</h3>
<div class="section-summary">
  Dados de mortalidade por COVID-19 desagregados por raça/cor (DataSUS/SIVEP-Gripe).
  Impacto desproporcional na população negra e indígena. Séries 2020-2023.
</div>

<h3>Fontes de Dados</h3>
<div class="section-summary">
  Catálogo de fontes oficiais utilizadas no projeto: SIDRA/IBGE, DataSUS, FBSP, TSE, SISDEPEN, 
  RAIS/CAGED, CadÚnico, SIOP, Portal da Transparência, FUNAI, FCP, INCRA, CNJ.
</div>

<h3>Lacunas CERD</h3>
<div class="section-summary">
  Vinculação das lacunas identificadas pelo Comitê CERD com evidências quantitativas 
  (séries históricas 2010-2025) extraídas das fontes oficiais.
</div>

<!-- RESUMO FINAL -->
<h2>Resumo Executivo</h2>
<div class="stats-grid">
  <div class="stat-card">
    <div class="value">${series.length}</div>
    <div class="label">Séries Temporais</div>
  </div>
  <div class="stat-card">
    <div class="value">${totalSeriesRegistros}</div>
    <div class="label">Registros em Séries</div>
  </div>
  <div class="stat-card">
    <div class="value">${TOTAL_TABELAS_COMMON_CORE}</div>
    <div class="label">Tabelas Common Core</div>
  </div>
  <div class="stat-card">
    <div class="value">${TOTAL_DADOS_COMMON_CORE.toLocaleString('pt-BR')}</div>
    <div class="label">Linhas Common Core</div>
  </div>
</div>
<div class="stats-grid">
  <div class="stat-card">
    <div class="value">${indicadoresBD.length}</div>
    <div class="label">Indicadores no BD</div>
  </div>
  <div class="stat-card">
    <div class="value">${TOTAL_DADOS_NOVOS}</div>
    <div class="label">Dados Novos</div>
  </div>
  <div class="stat-card">
    <div class="value">${Object.keys(bdCategorias).length}</div>
    <div class="label">Eixos Temáticos</div>
  </div>
  <div class="stat-card">
    <div class="value" style="color:#0f3460;">${totalGeral.toLocaleString('pt-BR')}</div>
    <div class="label" style="font-weight:700;">TOTAL GERAL</div>
  </div>
</div>

<div class="footer">
  <p>📋 Inventário gerado automaticamente pelo Sistema de Subsídios CERD IV — ${now}</p>
  <p>Todos os dados seguem a Regra de Ouro: apenas fontes oficiais auditáveis. Proibição absoluta de projeções, estimativas e dados fabricados.</p>
</div>

</body>
</html>`;
}

export function StatisticsInventoryReport() {
  const { data: indicadoresBD } = useIndicadoresInterseccionais();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    try {
      const html = generateInventoryHTML(indicadoresBD || []);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } finally {
      setGenerating(false);
    }
  };

  const totalGeral = TOTAL_DADOS_ESTATISTICAS + TOTAL_DADOS_COMMON_CORE + TOTAL_DADOS_NOVOS + (indicadoresBD?.length || 0);

  return (
    <Card className="border-l-4 border-l-chart-3">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="w-5 h-5 text-chart-3" />
          Inventário Completo — Base Estatística
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Listagem de <strong>todos os dados</strong> contidos na Base Estatística: 
          séries temporais, {TOTAL_TABELAS_COMMON_CORE} tabelas Common Core, {indicadoresBD?.length || 0} indicadores do BD 
          e {TOTAL_DADOS_NOVOS} dados novos auditáveis.
        </p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{totalGeral.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">Registros totais</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{TOTAL_TABELAS_COMMON_CORE + 19 + 9}</p>
            <p className="text-xs text-muted-foreground">Tabelas + Séries + Abas</p>
          </div>
        </div>
        <Button className="w-full gap-2" variant="outline" onClick={handleGenerate} disabled={generating}>
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          Gerar Inventário HTML/PDF
        </Button>
      </CardContent>
    </Card>
  );
}
