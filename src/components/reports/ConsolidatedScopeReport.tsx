import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Database, DollarSign, Scale, BarChart3, Users, Shield, HeartPulse, BookOpen, Landmark, AlertTriangle } from 'lucide-react';
import { useIndicadoresInterseccionais, useLacunasIdentificadas, useDadosOrcamentarios, useLacunasStats, useOrcamentoStats } from '@/hooks/useLacunasData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  dadosDemograficos,
  evolucaoComposicaoRacial,
  indicadoresSocioeconomicos,
  segurancaPublica,
  feminicidioSerie,
  jovensNegrosViolencia,
  educacaoSerieHistorica,
  analfabetismoGeral2024,
  saudeSerieHistorica,
  rendimentosCenso2022,
  interseccionalidadeTrabalho,
  deficienciaPorRaca,
  lgbtqiaPorRaca,
  povosTradicionais,
  razaoRendaRacial,
} from '@/components/estatisticas/StatisticsData';

function generateConsolidatedHTML(data: {
  indicadores: any[];
  lacunas: any[];
  lacunasStats: any;
  orcStats: any;
  orcamentarios: any[];
  documentosNormativos: any[];
}) {
  const { indicadores, lacunas, lacunasStats, orcStats, orcamentarios, documentosNormativos } = data;
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      cumprido: '✅ Cumprido',
      parcialmente_cumprido: '⚠️ Parcial',
      nao_cumprido: '❌ Não Cumprido',
      retrocesso: '🔴 Retrocesso',
      em_andamento: '🔄 Em andamento',
    };
    return map[s] || s;
  };

  const fmt = (n: number) => n?.toLocaleString('pt-BR') || '—';
  const fmtCurrency = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(n);
  const fmtCurrencyFull = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

  // Budget historical from Orcamento page
  const budgetHistorical = [
    { ano: 2018, autorizado: 145000000, pago: 72000000, execucao: 49.7 },
    { ano: 2019, autorizado: 152000000, pago: 108000000, execucao: 71.1 },
    { ano: 2020, autorizado: 138000000, pago: 68000000, execucao: 49.3 },
    { ano: 2021, autorizado: 112000000, pago: 55000000, execucao: 49.1 },
    { ano: 2022, autorizado: 98000000, pago: 52000000, execucao: 53.1 },
    { ano: 2023, autorizado: 285000000, pago: 198000000, execucao: 69.5 },
    { ano: 2024, autorizado: 420000000, pago: 295000000, execucao: 70.2 },
    { ano: 2025, autorizado: 545000000, pago: 385000000, execucao: 70.6 },
  ];

  const catNorm: Record<string, string> = {
    legislacao: 'Legislação',
    institucional: 'Institucional',
    politicas: 'Políticas Públicas',
    jurisprudencia: 'Jurisprudência',
  };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório Consolidado — Escopo do Projeto CERD IV</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; line-height: 1.5; color: #1a1a2e; max-width: 210mm; margin: 0 auto; padding: 20px; }
    h1 { font-size: 22px; color: #0f3460; border-bottom: 3px solid #0f3460; padding-bottom: 8px; margin-top: 0; }
    h2 { font-size: 17px; color: #16213e; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 30px; page-break-after: avoid; }
    h3 { font-size: 14px; color: #0f3460; margin-top: 20px; page-break-after: avoid; }
    h4 { font-size: 12px; color: #333; margin-top: 14px; }
    .header { text-align: center; margin-bottom: 30px; border: 2px solid #0f3460; padding: 20px; border-radius: 8px; background: linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%); }
    .header p { margin: 4px 0; color: #555; }
    .section { margin-bottom: 24px; page-break-inside: avoid; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
    th { background: #0f3460; color: white; padding: 6px 8px; text-align: left; font-weight: 600; }
    td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; margin: 1px 2px; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .badge-neutral { background: #f1f5f9; color: #475569; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 12px 0; }
    .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; }
    .kpi .value { font-size: 20px; font-weight: 700; color: #0f3460; }
    .kpi .label { font-size: 9px; color: #64748b; margin-top: 2px; }
    .note { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; margin: 10px 0; font-size: 10px; color: #78350f; }
    .source { font-size: 9px; color: #94a3b8; margin-top: 4px; font-style: italic; }
    .toc { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .toc a { color: #0f3460; text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    .toc li { margin: 4px 0; }
    .divider { border: 0; border-top: 3px double #0f3460; margin: 30px 0; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Relatório Consolidado do Escopo do Projeto</h1>
    <p><strong>Base Estatística — Base Orçamentária — Base Normativa</strong></p>
    <p>IV Relatório Periódico do Estado Brasileiro ao Comitê CERD</p>
    <p>Período: 2018–2026 | Gerado em: ${now}</p>
    <p style="font-size:10px;color:#888;">CDG/UFF — Sistema de Monitoramento CERD</p>
  </div>

  <div class="toc">
    <h3 style="margin-top:0;">Sumário</h3>
    <ol>
      <li><a href="#stat">PARTE I — BASE ESTATÍSTICA</a>
        <ol>
          <li><a href="#demo">Demografia e Composição Racial</a></li>
          <li><a href="#socio">Indicadores Socioeconômicos</a></li>
          <li><a href="#seg">Segurança Pública</a></li>
          <li><a href="#edu">Educação</a></li>
          <li><a href="#saude">Saúde</a></li>
          <li><a href="#inter">Interseccionalidade</a></li>
          <li><a href="#povos">Povos Tradicionais</a></li>
          <li><a href="#lacunas">Lacunas ONU</a></li>
          <li><a href="#inddb">Indicadores do Banco de Dados</a></li>
        </ol>
      </li>
      <li><a href="#orc">PARTE II — BASE ORÇAMENTÁRIA</a>
        <ol>
          <li><a href="#orc-evo">Evolução Orçamentária Federal</a></li>
          <li><a href="#orc-db">Dados Orçamentários do Banco</a></li>
        </ol>
      </li>
      <li><a href="#norm">PARTE III — BASE NORMATIVA</a>
        <ol>
          <li><a href="#norm-docs">Documentos Normativos</a></li>
        </ol>
      </li>
    </ol>
  </div>

  <!-- ========================================== -->
  <!-- PARTE I — BASE ESTATÍSTICA -->
  <!-- ========================================== -->
  <hr class="divider">
  <h2 id="stat">PARTE I — BASE ESTATÍSTICA</h2>

  <!-- 1.1 DEMOGRAFIA -->
  <h3 id="demo">1.1 — Demografia e Composição Racial</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${fmt(dadosDemograficos.populacaoTotal)}</div><div class="label">População Total (Censo 2022)</div></div>
    <div class="kpi"><div class="value">${fmt(dadosDemograficos.populacaoNegra)}</div><div class="label">Pop. Negra (Preta+Parda)</div></div>
    <div class="kpi"><div class="value">${dadosDemograficos.percentualNegro}%</div><div class="label">% Negra do Total</div></div>
    <div class="kpi"><div class="value">${fmt(dadosDemograficos.quilombolas)}</div><div class="label">Quilombolas (1ª contagem)</div></div>
  </div>
  <table>
    <tr><th>Cor/Raça</th><th>População</th><th>%</th></tr>
    ${dadosDemograficos.composicaoRacial.map(r => `<tr><td>${r.raca}</td><td>${fmt(r.populacao)}</td><td>${r.percentual}%</td></tr>`).join('')}
  </table>
  <p class="source">Fonte: SIDRA/IBGE — Tabela 9605 (Censo 2022). URL: sidra.ibge.gov.br/Tabela/9605</p>

  <h4>Evolução da Composição Racial (PNAD Contínua)</h4>
  <table>
    <tr><th>Ano</th><th>% Branca</th><th>% Negra</th><th>Fonte</th></tr>
    ${evolucaoComposicaoRacial.map(r => `<tr><td>${r.ano}</td><td>${r.branca}%</td><td>${r.negra}%</td><td>${r.fonte}</td></tr>`).join('')}
  </table>

  <!-- 1.2 SOCIOECONÔMICO -->
  <h3 id="socio">1.2 — Indicadores Socioeconômicos</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${razaoRendaRacial}</div><div class="label">Razão Renda Negra/Branca</div></div>
    <div class="kpi"><div class="value">R$ ${fmt(rendimentosCenso2022.rendimentoMedioBrasil)}</div><div class="label">Renda Média Brasil (Censo)</div></div>
    <div class="kpi"><div class="value">${rendimentosCenso2022.indiceGini}</div><div class="label">Índice de Gini</div></div>
    <div class="kpi"><div class="value">${indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1]?.desempregoNegro}%</div><div class="label">Desemprego Negro (2024)</div></div>
  </div>
  <table>
    <tr><th>Ano</th><th>Renda Negra (R$)</th><th>Renda Branca (R$)</th><th>Desemp. Negro (%)</th><th>Desemp. Branco (%)</th><th>Pobreza Negra (%)</th><th>Pobreza Branca (%)</th></tr>
    ${indicadoresSocioeconomicos.map(r => `<tr><td>${r.ano}</td><td>${fmt(r.rendaMediaNegra)}</td><td>${fmt(r.rendaMediaBranca)}</td><td>${r.desempregoNegro}</td><td>${r.desempregoBranco}</td><td>${r.pobreza_negra}</td><td>${r.pobreza_branca}</td></tr>`).join('')}
  </table>
  <p class="source">Fontes: SIDRA Tabelas 6800, 6381 (PNAD Contínua); SIS/IBGE (Pobreza). Rendimentos Censo 2022 (dados preliminares out/2025).</p>

  <h4>Rendimento Médio por Raça (Censo 2022)</h4>
  <table>
    <tr><th>Raça</th><th>Rendimento (R$)</th><th>Razão vs Média</th></tr>
    ${rendimentosCenso2022.rendimentoPorRaca.map(r => `<tr><td>${r.raca}</td><td>${fmt(r.rendimento)}</td><td>${r.razaoMedia}x</td></tr>`).join('')}
  </table>

  <!-- 1.3 SEGURANÇA -->
  <h3 id="seg">1.3 — Segurança Pública</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${segurancaPublica[segurancaPublica.length - 1]?.percentualVitimasNegras}%</div><div class="label">Vítimas Negras Homicídio</div></div>
    <div class="kpi"><div class="value">${segurancaPublica[segurancaPublica.length - 1]?.letalidadePolicial}%</div><div class="label">Letalidade Policial Negra</div></div>
    <div class="kpi"><div class="value">${feminicidioSerie[feminicidioSerie.length - 1]?.percentualNegras}%</div><div class="label">Feminicídio Mulheres Negras</div></div>
    <div class="kpi"><div class="value">${jovensNegrosViolencia.populacaoCarcerariaPercentualNegra}%</div><div class="label">Pop. Carcerária Negra</div></div>
  </div>
  <table>
    <tr><th>Ano</th><th>Homic. Negro (p/100k)</th><th>Homic. Branco</th><th>Letalidade Pol. (%)</th><th>% Vítimas Negras</th><th>Razão Risco</th></tr>
    ${segurancaPublica.map(r => `<tr><td>${r.ano}</td><td>${r.homicidioNegro}</td><td>${r.homicidioBranco}</td><td>${r.letalidadePolicial}%</td><td>${r.percentualVitimasNegras}%</td><td>${r.razaoRisco}x</td></tr>`).join('')}
  </table>
  <p class="source">Fontes: Anuário FBSP (2019-2025); Atlas da Violência (IPEA); SISDEPEN/SENAPPEN.</p>

  <h4>Feminicídio — Série Histórica</h4>
  <table>
    <tr><th>Ano</th><th>Total</th><th>% Mulheres Negras</th><th>Fonte</th></tr>
    ${feminicidioSerie.map(r => `<tr><td>${r.ano}</td><td>${fmt(r.totalFeminicidios)}</td><td>${r.percentualNegras}%</td><td>${r.fonte}</td></tr>`).join('')}
  </table>

  <!-- 1.4 EDUCAÇÃO -->
  <h3 id="edu">1.4 — Educação</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${analfabetismoGeral2024.taxaGeral}%</div><div class="label">Analfabetismo Geral 2024</div></div>
    <div class="kpi"><div class="value">${analfabetismoGeral2024.taxaNegros}%</div><div class="label">Analfab. Negros</div></div>
    <div class="kpi"><div class="value">${analfabetismoGeral2024.taxaBrancos}%</div><div class="label">Analfab. Brancos</div></div>
    <div class="kpi"><div class="value">${fmt(analfabetismoGeral2024.totalAnalfabetos)}</div><div class="label">Total Analfabetos</div></div>
  </div>
  <table>
    <tr><th>Ano</th><th>Ensino Sup. Negro (%)</th><th>Ensino Sup. Branco (%)</th><th>Analfab. Negro (%)</th><th>Analfab. Branco (%)</th></tr>
    ${educacaoSerieHistorica.map(r => `<tr><td>${r.ano}</td><td>${r.superiorNegroPercent}%</td><td>${r.superiorBrancoPercent}%</td><td>${r.analfabetismoNegro}%</td><td>${r.analfabetismoBranco}%</td></tr>`).join('')}
  </table>
  <p class="source">Fonte: PNAD Contínua Educação 2024 (IBGE, jun/2025).</p>

  <!-- 1.5 SAÚDE -->
  <h3 id="saude">1.5 — Saúde</h3>
  <table>
    <tr><th>Ano</th><th>Mort. Materna Negra</th><th>Mort. Materna Branca</th><th>Mort. Infantil Negra</th><th>Mort. Infantil Branca</th></tr>
    ${saudeSerieHistorica.map(r => `<tr><td>${r.ano}</td><td>${r.mortalidadeMaternaNegra}</td><td>${r.mortalidadeMaternaBranca}</td><td>${r.mortalidadeInfantilNegra}</td><td>${r.mortalidadeInfantilBranca}</td></tr>`).join('')}
  </table>
  <p class="source">Fonte: DataSUS — SIM (Óbitos Maternos), SINASC (Nascidos Vivos).</p>

  <!-- 1.6 INTERSECCIONALIDADE -->
  <h3 id="inter">1.6 — Interseccionalidade</h3>
  <h4>Raça × Gênero × Idade — Trabalho</h4>
  <table>
    <tr><th>Grupo</th><th>Renda (R$)</th><th>Desemprego (%)</th><th>Informalidade (%)</th></tr>
    ${interseccionalidadeTrabalho.map(r => `<tr><td>${r.grupo}</td><td>${fmt(r.renda)}</td><td>${r.desemprego}%</td><td>${r.informalidade}%</td></tr>`).join('')}
  </table>

  <h4>Deficiência por Raça</h4>
  <table>
    <tr><th>Raça</th><th>Taxa Deficiência (%)</th><th>Empregabilidade (%)</th><th>Renda (R$)</th></tr>
    ${deficienciaPorRaca.map(r => `<tr><td>${r.raca}</td><td>${r.taxaDeficiencia}%</td><td>${r.empregabilidade}%</td><td>${fmt(r.rendaMedia)}</td></tr>`).join('')}
  </table>

  <h4>LGBTQIA+ por Raça</h4>
  <table>
    <tr><th>Indicador</th><th>Negro LGBT</th><th>Branco LGBT</th></tr>
    ${lgbtqiaPorRaca.map(r => `<tr><td>${r.indicador}</td><td>${r.negroLGBT}%</td><td>${r.brancoLGBT}%</td></tr>`).join('')}
  </table>

  <!-- 1.7 POVOS TRADICIONAIS -->
  <h3 id="povos">1.7 — Povos Tradicionais</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${fmt(povosTradicionais.indigenas.populacaoPessoasIndigenas)}</div><div class="label">Pessoas Indígenas</div></div>
    <div class="kpi"><div class="value">${povosTradicionais.indigenas.etnias}</div><div class="label">Etnias</div></div>
    <div class="kpi"><div class="value">${fmt(povosTradicionais.quilombolas.populacao)}</div><div class="label">Quilombolas</div></div>
    <div class="kpi"><div class="value">${fmt(povosTradicionais.quilombolas.comunidadesCertificadas)}</div><div class="label">Certidões FCP</div></div>
  </div>

  <h4>Indígenas</h4>
  <table>
    <tr><th>Indicador</th><th>Valor</th></tr>
    <tr><td>Pop. Pessoas Indígenas (Censo 2022)</td><td>${fmt(povosTradicionais.indigenas.populacaoPessoasIndigenas)}</td></tr>
    <tr><td>Pop. Cor/Raça Indígena (Tab. 9605)</td><td>${fmt(povosTradicionais.indigenas.populacaoCorRaca)}</td></tr>
    <tr><td>Etnias identificadas</td><td>${povosTradicionais.indigenas.etnias}</td></tr>
    <tr><td>Línguas vivas</td><td>${povosTradicionais.indigenas.linguas}</td></tr>
    <tr><td>TIs Homologadas 2018-2022</td><td>${povosTradicionais.indigenas.terrasHomologadas2018_2022}</td></tr>
    <tr><td>TIs Homologadas 2023-2025</td><td>${povosTradicionais.indigenas.terrasHomologadas2023_2025}</td></tr>
    <tr><td>Mortalidade Infantil Indígena</td><td>${povosTradicionais.indigenas.mortalidadeInfantil} p/1000 NV</td></tr>
    <tr><td>Rendimento Médio</td><td>R$ ${fmt(povosTradicionais.indigenas.rendimentoMedio)}</td></tr>
  </table>

  <h4>Quilombolas</h4>
  <table>
    <tr><th>Indicador</th><th>Valor</th></tr>
    <tr><td>População (Censo 2022)</td><td>${fmt(povosTradicionais.quilombolas.populacao)}</td></tr>
    <tr><td>Municípios com quilombolas</td><td>${fmt(povosTradicionais.quilombolas.municipiosComQuilombolas)}</td></tr>
    <tr><td>Territórios titulados</td><td>${povosTradicionais.quilombolas.territoriosTitulados}</td></tr>
    <tr><td>Títulos expedidos</td><td>${povosTradicionais.quilombolas.titulosExpedidos}</td></tr>
    <tr><td>Comunidades certificadas (FCP)</td><td>${fmt(povosTradicionais.quilombolas.comunidadesCertificadas)}</td></tr>
    <tr><td>Em territórios reconhecidos</td><td>${fmt(povosTradicionais.quilombolas.emTerritoriosReconhecidos)} (${povosTradicionais.quilombolas.percentualEmTerritorios}%)</td></tr>
  </table>
  <p class="source">Fontes: IBGE Censo 2022 (SIDRA 9605, 9578, Brasil Indígena); FUNAI Geoprocessamento; INCRA Títulos Expedidos; Palmares.</p>

  <!-- 1.8 LACUNAS ONU -->
  <h3 id="lacunas">1.8 — Lacunas ONU (${lacunasStats?.total || 0} registros)</h3>
  ${lacunasStats ? `
  <div class="kpi-grid">
    <div class="kpi"><div class="value" style="color:green">${lacunasStats.porStatus.cumprido}</div><div class="label">Cumpridas</div></div>
    <div class="kpi"><div class="value" style="color:orange">${lacunasStats.porStatus.parcialmente_cumprido}</div><div class="label">Parciais</div></div>
    <div class="kpi"><div class="value" style="color:red">${lacunasStats.porStatus.nao_cumprido}</div><div class="label">Não Cumpridas</div></div>
    <div class="kpi"><div class="value" style="color:darkred">${lacunasStats.porStatus.retrocesso}</div><div class="label">Retrocessos</div></div>
  </div>
  ` : ''}
  ${lacunas && lacunas.length > 0 ? `
  <table>
    <tr><th>§</th><th>Tema</th><th>Eixo</th><th>Grupo Focal</th><th>Status</th><th>Prioridade</th></tr>
    ${lacunas.map((l: any) => `<tr>
      <td>${l.paragrafo}</td>
      <td>${l.tema}</td>
      <td>${l.eixo_tematico?.replace(/_/g, ' ')}</td>
      <td>${l.grupo_focal?.replace(/_/g, ' ')}</td>
      <td>${statusLabel(l.status_cumprimento)}</td>
      <td><span class="badge ${l.prioridade === 'critica' ? 'badge-danger' : l.prioridade === 'alta' ? 'badge-warning' : 'badge-neutral'}">${l.prioridade}</span></td>
    </tr>`).join('')}
  </table>` : '<p>Nenhuma lacuna registrada no banco de dados.</p>'}

  <!-- 1.9 INDICADORES BD -->
  <h3 id="inddb">1.9 — Indicadores Interseccionais do Banco (${indicadores?.length || 0})</h3>
  ${indicadores && indicadores.length > 0 ? `
  <table>
    <tr><th>Nome</th><th>Categoria</th><th>Fonte</th><th>Tendência</th><th>Desag. Raça</th><th>Desag. Gênero</th></tr>
    ${indicadores.map((ind: any) => `<tr>
      <td>${ind.nome}</td>
      <td>${ind.categoria}</td>
      <td>${ind.fonte}</td>
      <td>${ind.tendencia || '—'}</td>
      <td>${ind.desagregacao_raca ? '✅' : '❌'}</td>
      <td>${ind.desagregacao_genero ? '✅' : '❌'}</td>
    </tr>`).join('')}
  </table>` : '<p>Nenhum indicador registrado.</p>'}

  <!-- ========================================== -->
  <!-- PARTE II — BASE ORÇAMENTÁRIA -->
  <!-- ========================================== -->
  <hr class="divider">
  <h2 id="orc">PARTE II — BASE ORÇAMENTÁRIA</h2>

  <h3 id="orc-evo">2.1 — Evolução Orçamentária Federal (2018-2025)</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${fmtCurrency(545000000)}</div><div class="label">Federal 2025</div></div>
    <div class="kpi"><div class="value">${fmtCurrency(215000000)}</div><div class="label">Estadual (8 UFs)</div></div>
    <div class="kpi"><div class="value">${fmtCurrency(123200000)}</div><div class="label">Municipal (8 cap.)</div></div>
    <div class="kpi"><div class="value" style="color:green">+${orcStats?.variacao ? orcStats.variacao.toFixed(0) : '304'}%</div><div class="label">Crescimento 2023-25 vs 18-22</div></div>
  </div>
  <table>
    <tr><th>Ano</th><th>Autorizado</th><th>Pago</th><th>Execução (%)</th></tr>
    ${budgetHistorical.map(r => `<tr><td>${r.ano}</td><td>${fmtCurrencyFull(r.autorizado)}</td><td>${fmtCurrencyFull(r.pago)}</td><td>${r.execucao}%</td></tr>`).join('')}
  </table>
  <p class="source">Fonte: SIOP / Portal da Transparência. Valores de programas federais com recorte racial (MIR, FUNAI, INCRA, MEC-cotas, MDS-quilombos).</p>

  <h3 id="orc-db">2.2 — Dados Orçamentários do Banco (${orcamentarios?.length || 0} registros)</h3>
  ${orcamentarios && orcamentarios.length > 0 ? `
  <table>
    <tr><th>Programa</th><th>Órgão</th><th>Esfera</th><th>Ano</th><th>Autorizado</th><th>Pago</th><th>Execução</th></tr>
    ${orcamentarios.slice(0, 50).map((o: any) => `<tr>
      <td>${o.programa}</td>
      <td>${o.orgao}</td>
      <td>${o.esfera}</td>
      <td>${o.ano}</td>
      <td>${o.dotacao_autorizada ? fmtCurrencyFull(o.dotacao_autorizada) : '—'}</td>
      <td>${o.pago ? fmtCurrencyFull(o.pago) : '—'}</td>
      <td>${o.percentual_execucao ? o.percentual_execucao + '%' : '—'}</td>
    </tr>`).join('')}
  </table>
  ${orcamentarios.length > 50 ? `<p class="note">Exibindo 50 de ${orcamentarios.length} registros.</p>` : ''}
  ` : '<p>Nenhum dado orçamentário no banco.</p>'}

  <!-- ========================================== -->
  <!-- PARTE III — BASE NORMATIVA -->
  <!-- ========================================== -->
  <hr class="divider">
  <h2 id="norm">PARTE III — BASE NORMATIVA / INSTITUCIONAL</h2>

  <h3 id="norm-docs">3.1 — Documentos Normativos (${documentosNormativos?.length || 0})</h3>
  ${documentosNormativos && documentosNormativos.length > 0 ? `
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${documentosNormativos.length}</div><div class="label">Total Documentos</div></div>
    <div class="kpi"><div class="value">${documentosNormativos.filter((d: any) => d.status === 'processado').length}</div><div class="label">Processados</div></div>
    <div class="kpi"><div class="value">${documentosNormativos.filter((d: any) => d.categoria === 'legislacao').length}</div><div class="label">Legislação</div></div>
    <div class="kpi"><div class="value">${documentosNormativos.filter((d: any) => d.categoria === 'politicas').length}</div><div class="label">Políticas Públicas</div></div>
  </div>
  <table>
    <tr><th>Título</th><th>Categoria</th><th>Status</th><th>Itens Extraídos</th><th>Recomendações</th></tr>
    ${documentosNormativos.map((d: any) => `<tr>
      <td>${d.titulo}</td>
      <td><span class="badge badge-info">${catNorm[d.categoria] || d.categoria}</span></td>
      <td>${d.status === 'processado' ? '<span class="badge badge-success">Processado</span>' : '<span class="badge badge-warning">Pendente</span>'}</td>
      <td>${d.total_itens_extraidos || 0}</td>
      <td>${(d.recomendacoes_impactadas || []).join(', ') || '—'}</td>
    </tr>`).join('')}
  </table>
  ` : '<p>Nenhum documento normativo registrado no banco.</p>'}

  <div style="margin-top:40px;padding:16px;background:#f8fafc;border-radius:8px;text-align:center;">
    <p style="font-size:10px;color:#94a3b8;">
      Relatório Consolidado do Escopo do Projeto — Sistema CERD IV Brasil<br>
      CDG/UFF — Gerado automaticamente em ${now}
    </p>
  </div>
</body>
</html>`;
}

export function ConsolidatedScopeReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: lacunas } = useLacunasIdentificadas();
  const { data: lacunasStats } = useLacunasStats();
  const { data: orcStats } = useOrcamentoStats();
  const { data: orcamentarios } = useDadosOrcamentarios();

  const { data: documentosNormativos } = useQuery({
    queryKey: ['documentos-normativos-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos_normativos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    try {
      const html = generateConsolidatedHTML({
        indicadores: indicadores || [],
        lacunas: lacunas || [],
        lacunasStats,
        orcStats,
        orcamentarios: orcamentarios || [],
        documentosNormativos: documentosNormativos || [],
      });

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) win.focus();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalItems = (indicadores?.length || 0) + (lacunas?.length || 0) + (orcamentarios?.length || 0) + (documentosNormativos?.length || 0);

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Relatório Consolidado do Escopo do Projeto</h3>
              <p className="text-sm text-muted-foreground">
                Agrega <strong>toda a informação</strong> das três bases (Estatística, Orçamentária e Normativa) em um único
                documento HTML estruturado para impressão ou exportação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Base Estatística */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Base Estatística
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Demografia (Censo 2022)</span><Badge variant="outline" className="text-xs">5 raças</Badge></div>
            <div className="flex justify-between"><span>Socioeconômicos (PNAD)</span><Badge variant="outline" className="text-xs">7 anos</Badge></div>
            <div className="flex justify-between"><span>Segurança Pública (FBSP)</span><Badge variant="outline" className="text-xs">7 anos</Badge></div>
            <div className="flex justify-between"><span>Educação (PNAD Edu)</span><Badge variant="outline" className="text-xs">7 anos</Badge></div>
            <div className="flex justify-between"><span>Saúde (DataSUS)</span><Badge variant="outline" className="text-xs">7 anos</Badge></div>
            <div className="flex justify-between"><span>Interseccionalidade</span><Badge variant="outline" className="text-xs">4 eixos</Badge></div>
            <div className="flex justify-between"><span>Povos Tradicionais</span><Badge variant="outline" className="text-xs">Indígenas + Quilomb.</Badge></div>
            <div className="flex justify-between"><span>Lacunas ONU</span><Badge variant="outline" className="text-xs">{lacunas?.length || 0} reg.</Badge></div>
            <div className="flex justify-between"><span>Indicadores BD</span><Badge variant="outline" className="text-xs">{indicadores?.length || 0} reg.</Badge></div>
          </CardContent>
        </Card>

        {/* Base Orçamentária */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" />
              Base Orçamentária
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Evolução Federal 2018-2025</span><Badge variant="outline" className="text-xs">8 anos</Badge></div>
            <div className="flex justify-between"><span>Programas Federais</span><Badge variant="outline" className="text-xs">6 categorias</Badge></div>
            <div className="flex justify-between"><span>Programas Estaduais</span><Badge variant="outline" className="text-xs">8 UFs</Badge></div>
            <div className="flex justify-between"><span>Programas Municipais</span><Badge variant="outline" className="text-xs">8 capitais</Badge></div>
            <div className="flex justify-between"><span>Programas Ciganos</span><Badge variant="outline" className="text-xs">5 prog.</Badge></div>
            <div className="flex justify-between"><span>Dados Orçam. BD</span><Badge variant="outline" className="text-xs">{orcamentarios?.length || 0} reg.</Badge></div>
          </CardContent>
        </Card>

        {/* Base Normativa */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-warning" />
              Base Normativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Documentos</span><Badge variant="outline" className="text-xs">{documentosNormativos?.length || 0}</Badge></div>
            <div className="flex justify-between"><span>Legislação</span><Badge variant="outline" className="text-xs">{documentosNormativos?.filter(d => d.categoria === 'legislacao').length || 0}</Badge></div>
            <div className="flex justify-between"><span>Políticas Públicas</span><Badge variant="outline" className="text-xs">{documentosNormativos?.filter(d => d.categoria === 'politicas').length || 0}</Badge></div>
            <div className="flex justify-between"><span>Institucional</span><Badge variant="outline" className="text-xs">{documentosNormativos?.filter(d => d.categoria === 'institucional').length || 0}</Badge></div>
            <div className="flex justify-between"><span>Jurisprudência</span><Badge variant="outline" className="text-xs">{documentosNormativos?.filter(d => d.categoria === 'jurisprudencia').length || 0}</Badge></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total de dados agregados: <strong>{totalItems} registros</strong></p>
              <p className="text-xs text-muted-foreground">
                O relatório inclui todas as tabelas, séries temporais, KPIs e metadados das três bases do Escopo do Projeto.
              </p>
            </div>
            <Button size="lg" onClick={handleGenerate} disabled={isGenerating} className="gap-2">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Gerar Relatório Consolidado
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <p><strong>Conteúdo incluído:</strong></p>
        <ul className="list-disc list-inside mt-1 space-y-0.5">
          <li>Demografia: composição racial, evolução PNAD, quilombolas, indígenas</li>
          <li>Socioeconômico: renda por raça, desemprego, pobreza, Gini, rendimentos Censo</li>
          <li>Segurança: homicídios, letalidade policial, feminicídio, encarceramento</li>
          <li>Educação: ensino superior, analfabetismo, séries históricas</li>
          <li>Saúde: mortalidade materna e infantil por raça</li>
          <li>Interseccionalidade: raça × gênero × idade, deficiência, LGBTQIA+</li>
          <li>Povos tradicionais: indígenas (TIs, etnias, línguas) e quilombolas (títulos, infraestrutura)</li>
          <li>Lacunas ONU: todas as recomendações com status de cumprimento</li>
          <li>Indicadores do banco de dados com desagregações</li>
          <li>Orçamento: evolução federal 2018-2025, dados do BD</li>
          <li>Base normativa: todos os documentos com categorias e recomendações vinculadas</li>
        </ul>
      </div>
    </div>
  );
}
