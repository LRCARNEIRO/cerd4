import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Database, DollarSign, Scale, BarChart3, Users, Shield, HeartPulse, BookOpen, Landmark, AlertTriangle, Lightbulb } from 'lucide-react';
import { useIndicadoresInterseccionais, useLacunasIdentificadas, useDadosOrcamentarios, useLacunasStats, useOrcamentoStats, useRespostasLacunasCerdIII } from '@/hooks/useLacunasData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import { getExportToolbarHTML, downloadAsDocx } from '@/utils/reportExportToolbar';
import type { FioCondutor, InsightCruzamento, ConclusaoDinamica } from '@/hooks/useAnalyticalInsights';
import {
  dadosDemograficos as hcDemo,
  evolucaoComposicaoRacial as hcEvolucao,
  indicadoresSocioeconomicos as hcSocioEco,
  segurancaPublica as hcSeguranca,
  feminicidioSerie as hcFeminicidio,
  jovensNegrosViolencia as hcJovensViolencia,
  educacaoSerieHistorica as hcEducacao,
  analfabetismoGeral2024 as hcAnalfabetismo,
  saudeSerieHistorica as hcSaude,
  rendimentosCenso2022 as hcRendimentos,
  interseccionalidadeTrabalho as hcIntersecTrabalho,
  deficienciaPorRaca as hcDeficiencia,
  lgbtqiaPorRaca as hcLgbtqia,
  povosTradicionais as hcPovos,
  razaoRendaRacial,
  violenciaInterseccional as hcViolencia,
  radarVulnerabilidades,
  evolucaoDesigualdade as hcEvolDesig,
  classePorRaca as hcClasse,
} from '@/components/estatisticas/StatisticsData';
import { useMirrorData } from '@/hooks/useMirrorData';

function generateConsolidatedHTML(data: {
  indicadores: any[];
  lacunas: any[];
  lacunasStats: any;
  orcStats: any;
  orcamentarios: any[];
  documentosNormativos: any[];
  fiosCondutores: FioCondutor[];
  conclusoesDinamicas: ConclusaoDinamica[];
  insightsCruzamento: InsightCruzamento[];
  sinteseExecutiva: any;
  respostas: any[];
  mirrorData?: any;
}) {
  const { indicadores, lacunas, lacunasStats, orcStats, orcamentarios, documentosNormativos,
    fiosCondutores, conclusoesDinamicas, insightsCruzamento, sinteseExecutiva, respostas, mirrorData } = data;
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // SSoT: use mirror data from BD if available, fallback to hardcoded
  const m = mirrorData || {};
  const dadosDemograficos = m.dadosDemograficos || hcDemo;
  const evolucaoComposicaoRacial = m.evolucaoComposicaoRacial || hcEvolucao;
  const segurancaPublica = m.segurancaPublica || hcSeguranca;
  const feminicidioSerie = m.feminicidioSerie || hcFeminicidio;
  const educacaoSerieHistorica = m.educacaoSerieHistorica || hcEducacao;
  const indicadoresSocioeconomicos = m.indicadoresSocioeconomicos || hcSocioEco;
  const analfabetismoGeral2024 = m.analfabetismoGeral2024 || hcAnalfabetismo;
  const saudeSerieHistorica = m.saudeSerieHistorica || hcSaude;
  const rendimentosCenso2022 = m.rendimentosCenso2022 || hcRendimentos;
  const interseccionalidadeTrabalho = m.interseccionalidadeTrabalho || hcIntersecTrabalho;
  const deficienciaPorRaca = m.deficienciaPorRaca || hcDeficiencia;
  const lgbtqiaPorRaca = m.lgbtqiaPorRaca || hcLgbtqia;
  const povosTradicionais = m.povosTradicionais || hcPovos;
  const violenciaInterseccional = m.violenciaInterseccional || hcViolencia;
  const evolucaoDesigualdade = m.evolucaoDesigualdade || hcEvolDesig;
  const classePorRaca = m.classePorRaca || hcClasse;
  const jovensNegrosViolencia = m.jovensNegrosViolencia || hcJovensViolencia;

  // Shorthand for comparisons
  const seg2018 = segurancaPublica[0];
  const seg2024 = segurancaPublica[segurancaPublica.length - 1];
  const edu2018 = educacaoSerieHistorica[0];
  const edu2024 = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];
  const eco2018 = indicadoresSocioeconomicos[0];
  const eco2024 = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];
  const fem2018 = feminicidioSerie[0];
  const fem2024 = feminicidioSerie[feminicidioSerie.length - 1];

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

  // Budget historical — agregação dinâmica a partir dos dados reais do banco (dados_orcamentarios)
  // REGRA DE OURO: Zero dados fabricados — usar exclusivamente dados do BD
  const budgetHistorical = (() => {
    if (!orcamentarios || orcamentarios.length === 0) return [];
    const byYear = new Map<number, { autorizado: number; pago: number }>();
    orcamentarios.forEach((o: any) => {
      const entry = byYear.get(o.ano) || { autorizado: 0, pago: 0 };
      entry.autorizado += Number(o.dotacao_autorizada || 0);
      entry.pago += Number(o.pago || 0);
      byYear.set(o.ano, entry);
    });
    return Array.from(byYear.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([ano, v]) => ({
        ano,
        autorizado: v.autorizado,
        pago: v.pago,
        execucao: v.autorizado > 0 ? Math.round((v.pago / v.autorizado) * 1000) / 10 : 0,
      }));
  })();

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
      <li><a href="#concl">PARTE IV — CONCLUSÕES ANALÍTICAS</a>
        <ol>
          <li><a href="#concl-sintese">Síntese Executiva</a></li>
          <li><a href="#concl-infog">Infográficos Comparativos (2018→2024)</a></li>
          <li><a href="#concl-tabsint">Tabela Síntese Comparativa</a></li>
          <li><a href="#concl-fios">Fios Condutores</a></li>
          <li><a href="#concl-cruz">Cruzamentos Analíticos</a></li>
          <li><a href="#concl-vered">Conclusão-Síntese (Veredicto)</a></li>
          <li><a href="#concl-lac">Lacunas Persistentes</a></li>
          <li><a href="#concl-av">Avanços</a></li>
          <li><a href="#concl-ret">Retrocessos</a></li>
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
    <tr><th>Ano</th><th>Homic. Negro (p/100k)</th><th>Homic. Não Negro</th><th>Letalidade Pol. (%)</th><th>% Vítimas Negras</th><th>Razão Risco</th></tr>
    ${segurancaPublica.map(r => `<tr><td>${r.ano}</td><td>${r.homicidioNegro ?? 'n/a'}</td><td>${r.homicidioBranco ?? 'n/a'}</td><td>${r.letalidadePolicial}%</td><td>${r.percentualVitimasNegras}%</td><td>${r.razaoRisco != null ? r.razaoRisco + 'x' : 'n/a'}</td></tr>`).join('')}
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
    <tr><th>Raça</th><th>% com Deficiência</th><th>Nível Ocupação PcD (%)</th><th>Renda Média PcD (R$)</th></tr>
    ${deficienciaPorRaca.map(r => `<tr><td>${r.raca}</td><td>${r.taxaDeficiencia}%</td><td>${r.empregabilidade != null ? r.empregabilidade + '%' : 'N/D'}</td><td>${r.rendaMedia != null ? 'R$ ' + r.rendaMedia.toLocaleString('pt-BR') : 'N/D'}</td></tr>`).join('')}
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

  <h3 id="orc-evo">2.1 — Evolução Orçamentária (dados do banco)</h3>
  ${budgetHistorical.length > 0 ? `
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${budgetHistorical.length}</div><div class="label">Anos com dados</div></div>
    <div class="kpi"><div class="value">${fmtCurrency(budgetHistorical[budgetHistorical.length - 1]?.autorizado || 0)}</div><div class="label">Último ano (${budgetHistorical[budgetHistorical.length - 1]?.ano})</div></div>
    <div class="kpi"><div class="value">${orcStats?.totalRegistros || 0}</div><div class="label">Registros no BD</div></div>
    <div class="kpi"><div class="value" style="color:green">${orcStats?.variacao ? `${orcStats.variacao >= 0 ? '+' : ''}${orcStats.variacao.toFixed(0)}%` : 'N/D'}</div><div class="label">Variação entre períodos</div></div>
  </div>
  <table>
    <tr><th>Ano</th><th>Autorizado</th><th>Pago</th><th>Execução (%)</th></tr>
    ${budgetHistorical.map(r => `<tr><td>${r.ano}</td><td>${fmtCurrencyFull(r.autorizado)}</td><td>${fmtCurrencyFull(r.pago)}</td><td>${r.execucao}%</td></tr>`).join('')}
  </table>
  <p class="source">Fonte: Dados agregados a partir de ${orcamentarios?.length || 0} registros do banco de dados (dados_orcamentarios). Origem: SIOP / Portal da Transparência / SICONFI.</p>
  ` : '<p class="note">⚠️ Nenhum dado orçamentário no banco. Importe dados via painel de ingestão.</p>'}

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

  <!-- ========================================== -->
  <!-- PARTE IV — CONCLUSÕES ANALÍTICAS -->
  <!-- ========================================== -->
  <hr class="divider">
  <h2 id="concl">PARTE IV — CONCLUSÕES ANALÍTICAS</h2>
  <p class="source">Cruzamento exaustivo: Base Estatística × Orçamentária × Normativa × MUNIC/ESTADIC × COVID-19 (2018→2024)</p>

  <!-- 4.1 SÍNTESE EXECUTIVA -->
  <h3 id="concl-sintese">4.1 — Síntese Executiva</h3>
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${dadosDemograficos.percentualNegro}%</div><div class="label">Pop. Negra</div></div>
    <div class="kpi"><div class="value" style="color:red">${seg2024.percentualVitimasNegras}%</div><div class="label">Vítimas Negras Homicídio</div></div>
    <div class="kpi"><div class="value" style="color:red">${fem2024.percentualNegras}%</div><div class="label">Feminicídio Negro</div></div>
    <div class="kpi"><div class="value" style="color:green">${edu2024.superiorNegroPercent}%</div><div class="label">Superior Negro</div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0;">
    <div style="padding:10px;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;">
      <p style="font-size:10px;font-weight:600;color:#991b1b;margin-bottom:4px;">⚠️ PIORA RELATIVA (2018→2024)</p>
      <ul style="font-size:9px;color:#7f1d1d;margin:0;padding-left:14px;">
        <li>Homicídio: vítimas negras ${seg2018.percentualVitimasNegras}% → ${seg2024.percentualVitimasNegras}% (+${(seg2024.percentualVitimasNegras - seg2018.percentualVitimasNegras).toFixed(1)}pp)</li>
        <li>Letalidade policial negra: ${seg2018.letalidadePolicial}% → ${seg2024.letalidadePolicial}% (+${(seg2024.letalidadePolicial - seg2018.letalidadePolicial).toFixed(1)}pp)</li>
        <li>Feminicídio mulheres negras: ${fem2018.percentualNegras}% → ${fem2024.percentualNegras}% (+${(fem2024.percentualNegras - fem2018.percentualNegras).toFixed(1)}pp)</li>
        <li>Risco homicídio negro: persistente em ${seg2024.razaoRisco}x maior</li>
        <li>Gap absoluto renda: R$ ${eco2018.rendaMediaBranca - eco2018.rendaMediaNegra} → R$ ${eco2024.rendaMediaBranca - eco2024.rendaMediaNegra} (ampliou)</li>
      </ul>
    </div>
    <div style="padding:10px;background:#dcfce7;border:1px solid #86efac;border-radius:6px;">
      <p style="font-size:10px;font-weight:600;color:#166534;margin-bottom:4px;">✓ AVANÇOS (2018→2024)</p>
      <ul style="font-size:9px;color:#14532d;margin:0;padding-left:14px;">
        <li>Superior completo negro: ${edu2018.superiorNegroPercent}% → ${edu2024.superiorNegroPercent}% (+${(edu2024.superiorNegroPercent - edu2018.superiorNegroPercent).toFixed(1)}pp)</li>
        <li>Analfabetismo negro: ${edu2018.analfabetismoNegro}% → ${edu2024.analfabetismoNegro}% (${(edu2024.analfabetismoNegro - edu2018.analfabetismoNegro).toFixed(1)}pp)</li>
        <li>Desemprego negro: ${eco2018.desempregoNegro}% → ${eco2024.desempregoNegro}% (${(eco2024.desempregoNegro - eco2018.desempregoNegro).toFixed(1)}pp)</li>
        <li>Renda média negra: R$ ${eco2018.rendaMediaNegra} → R$ ${eco2024.rendaMediaNegra} (+${((eco2024.rendaMediaNegra / eco2018.rendaMediaNegra - 1) * 100).toFixed(0)}%)</li>
        <li>Censo 2022: primeira contagem de quilombolas (${povosTradicionais.quilombolas.populacao.toLocaleString('pt-BR')})</li>
        <li>Recriação do MIR e Lei 14.532/2023 (racismo = crime inafiançável)</li>
      </ul>
    </div>
  </div>
  ${sinteseExecutiva && sinteseExecutiva.eixosMaisProblematicos?.length > 0 ? `
  <div style="padding:10px;background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;margin:10px 0;">
    <p style="font-size:10px;font-weight:600;color:#92400e;margin-bottom:4px;">⚡ EIXOS MAIS CRÍTICOS (lacunas ONU não cumpridas)</p>
    <table>
      <tr><th>Eixo</th><th>Total Lacunas</th><th>% Não Cumprido</th></tr>
      ${sinteseExecutiva.eixosMaisProblematicos.map((e: any) => `<tr><td>${e.eixo}</td><td>${e.total}</td><td style="color:red;font-weight:600">${Math.round(e.gravidade * 100)}%</td></tr>`).join('')}
    </table>
  </div>` : ''}
  ${sinteseExecutiva?.narrativa ? `<div class="note">${sinteseExecutiva.narrativa}</div>` : ''}

  <!-- 4.2 INFOGRÁFICOS COMPARATIVOS -->
  <h3 id="concl-infog">4.2 — Infográficos Comparativos (2018→2024)</h3>
  <p class="source">Dados do Escopo do Projeto — FBSP, PNAD, DataSUS, SIDRA/IBGE. Cada tabela fundamenta um argumento para o CERD IV / Common Core.</p>

  <h4>Violência Racial</h4>
  <table>
    <tr><th>Ano</th><th>Homic. Negro (p/100k)</th><th>Homic. Não Negro</th><th>% Vítimas Negras</th><th>Letalidade Pol. (%)</th><th>Razão Risco</th></tr>
    ${segurancaPublica.map(r => `<tr><td>${r.ano}</td><td>${r.homicidioNegro ?? 'n/a'}</td><td>${r.homicidioBranco ?? 'n/a'}</td><td>${r.percentualVitimasNegras}%</td><td>${r.letalidadePolicial}%</td><td>${r.razaoRisco != null ? r.razaoRisco + 'x' : 'n/a'}</td></tr>`).join('')}
  </table>

  <h4>Feminicídio</h4>
  <table>
    <tr><th>Ano</th><th>Total</th><th>% Mulheres Negras</th><th>Fonte</th></tr>
    ${feminicidioSerie.map(r => `<tr><td>${r.ano}</td><td>${fmt(r.totalFeminicidios)}</td><td>${r.percentualNegras}%</td><td>${r.fonte}</td></tr>`).join('')}
  </table>

  <h4>Violência Interseccional (Raça × Gênero)</h4>
  <table>
    <tr><th>Tipo de Violência</th><th>Mulher Negra</th><th>Mulher Não Negra</th><th>Fonte</th></tr>
    ${violenciaInterseccional.map(r => {
      const isAbsoluto = (r as any).unidadeAbsoluta;
      return `<tr><td>${r.tipo}</td><td>${isAbsoluto ? r.mulherNegra.toLocaleString('pt-BR') + ' notificações' : r.mulherNegra + '%'}</td><td>${isAbsoluto ? r.mulherBranca.toLocaleString('pt-BR') + ' notificações' : r.mulherBranca + '%'}</td><td>${r.fonte}</td></tr>`;
    }).join('')}
  </table>

  <h4>Radar de Vulnerabilidades por Grupo</h4>
  <p class="alert"><strong>⚠️ Removido:</strong> Índice composto com normalização arbitrária (0-100) — viola Regra de Ouro. Os dados subjacentes (PNAD, FBSP, DataSUS) são válidos e estão disponíveis nas seções individuais.</p>


  <h4>Educação Comparativa</h4>
  <table>
    <tr><th>Ano</th><th>Sup. Negro (%)</th><th>Sup. Branco (%)</th><th>Analfab. Negro (%)</th><th>Analfab. Branco (%)</th></tr>
    ${educacaoSerieHistorica.map(r => `<tr><td>${r.ano}</td><td>${r.superiorNegroPercent}%</td><td>${r.superiorBrancoPercent}%</td><td>${r.analfabetismoNegro}%</td><td>${r.analfabetismoBranco}%</td></tr>`).join('')}
  </table>

  <h4>Saúde Comparativa</h4>
  <table>
    <tr><th>Ano</th><th>Mort. Materna Negra</th><th>Mort. Materna Branca</th><th>Mort. Infantil Negra</th><th>Mort. Infantil Branca</th></tr>
    ${saudeSerieHistorica.map(r => `<tr><td>${r.ano}</td><td>${r.mortalidadeMaternaNegra}</td><td>${r.mortalidadeMaternaBranca}</td><td>${r.mortalidadeInfantilNegra}</td><td>${r.mortalidadeInfantilBranca}</td></tr>`).join('')}
  </table>

  <h4>Renda e Desigualdade</h4>
  <table>
    <tr><th>Ano</th><th>Renda Negra (R$)</th><th>Renda Branca (R$)</th><th>Razão Renda</th><th>Razão Desemprego</th><th>Razão Homicídio</th></tr>
    ${evolucaoDesigualdade.map(r => `<tr><td>${r.ano}</td><td>${indicadoresSocioeconomicos.find(i => i.ano === r.ano)?.rendaMediaNegra || '—'}</td><td>${indicadoresSocioeconomicos.find(i => i.ano === r.ano)?.rendaMediaBranca || '—'}</td><td>${r.razaoRenda}x</td><td>${r.razaoDesemprego}x</td><td>${r.razaoHomicidio}x</td></tr>`).join('')}
  </table>

  <h4>Pobreza por Raça/Cor (SIS/IBGE 2024)</h4>
  <table>
    <tr><th>Faixa</th><th>Branca (%)</th><th>Parda (%)</th><th>Preta (%)</th><th>Total (%)</th></tr>
    ${classePorRaca.map(r => `<tr><td>${r.faixa}</td><td>${r.branca}%</td><td>${r.parda}%</td><td>${r.preta}%</td><td>${r.total}%</td></tr>`).join('')}
  </table>
  <p class="source">Fonte: SIS/IBGE 2024 (dados 2023) — Linhas do Banco Mundial.</p>

  <!-- 4.3 TABELA SÍNTESE COMPARATIVA -->
  <h3 id="concl-tabsint">4.3 — Tabela Síntese Comparativa (2018→2024)</h3>
  <table>
    <tr><th>Indicador</th><th>2018</th><th>2024</th><th>Variação</th><th>Direção</th></tr>
    <tr><td>Vítimas negras homicídio (%)</td><td>${seg2018.percentualVitimasNegras}%</td><td>${seg2024.percentualVitimasNegras}%</td><td>+${(seg2024.percentualVitimasNegras - seg2018.percentualVitimasNegras).toFixed(1)}pp</td><td><span class="badge badge-danger">Piora</span></td></tr>
    <tr><td>Letalidade policial negra (%)</td><td>${seg2018.letalidadePolicial}%</td><td>${seg2024.letalidadePolicial}%</td><td>+${(seg2024.letalidadePolicial - seg2018.letalidadePolicial).toFixed(1)}pp</td><td><span class="badge badge-danger">Piora</span></td></tr>
    <tr><td>Feminicídio negro (%)</td><td>${fem2018.percentualNegras}%</td><td>${fem2024.percentualNegras}%</td><td>+${(fem2024.percentualNegras - fem2018.percentualNegras).toFixed(1)}pp</td><td><span class="badge badge-danger">Piora</span></td></tr>
    <tr><td>Superior completo negro (%)</td><td>${edu2018.superiorNegroPercent}%</td><td>${edu2024.superiorNegroPercent}%</td><td>+${(edu2024.superiorNegroPercent - edu2018.superiorNegroPercent).toFixed(1)}pp</td><td><span class="badge badge-success">Avanço</span></td></tr>
    <tr><td>Analfabetismo negro (%)</td><td>${edu2018.analfabetismoNegro}%</td><td>${edu2024.analfabetismoNegro}%</td><td>${(edu2024.analfabetismoNegro - edu2018.analfabetismoNegro).toFixed(1)}pp</td><td><span class="badge badge-success">Avanço</span></td></tr>
    <tr><td>Desemprego negro (%)</td><td>${eco2018.desempregoNegro}%</td><td>${eco2024.desempregoNegro}%</td><td>${(eco2024.desempregoNegro - eco2018.desempregoNegro).toFixed(1)}pp</td><td><span class="badge badge-success">Avanço</span></td></tr>
    <tr><td>Renda média negra (R$)</td><td>R$ ${eco2018.rendaMediaNegra}</td><td>R$ ${eco2024.rendaMediaNegra}</td><td>+${((eco2024.rendaMediaNegra / eco2018.rendaMediaNegra - 1) * 100).toFixed(0)}%</td><td><span class="badge badge-success">Avanço</span></td></tr>
    <tr><td>Gap renda branca-negra (R$)</td><td>R$ ${eco2018.rendaMediaBranca - eco2018.rendaMediaNegra}</td><td>R$ ${eco2024.rendaMediaBranca - eco2024.rendaMediaNegra}</td><td>Ampliou</td><td><span class="badge badge-danger">Piora</span></td></tr>
    <tr><td>Razão risco homicídio negro</td><td>${seg2018.razaoRisco}x</td><td>${seg2024.razaoRisco}x</td><td>Persistente</td><td><span class="badge badge-warning">Estagnação</span></td></tr>
    <tr><td>Mort. materna negra (p/100k NV)</td><td>${saudeSerieHistorica[0]?.mortalidadeMaternaNegra}</td><td>${saudeSerieHistorica[saudeSerieHistorica.length-1]?.mortalidadeMaternaNegra}</td><td>—</td><td><span class="badge badge-info">Ver série</span></td></tr>
  </table>
  <p class="source">Fontes: FBSP 2025, PNAD 2024, DataSUS/SIM, SIDRA/IBGE.</p>

  <!-- 4.4 FIOS CONDUTORES -->
  <h3 id="concl-fios">4.4 — Fios Condutores (${fiosCondutores.length} argumentos transversais)</h3>
  <p style="font-size:10px;color:#64748b;margin-bottom:10px;">Argumentos transversais gerados pelo cruzamento das bases do Escopo: dados estatísticos (FBSP, PNAD, DataSUS) × lacunas ONU × respostas CERD III × registros orçamentários.</p>
  ${fiosCondutores.map(fio => {
    const tipoLabel: Record<string, string> = { paradoxo: '⚖️ Paradoxo', correlacao: '🔗 Correlação', tendencia: '📈 Tendência', lacuna_critica: '⚠️ Lacuna Crítica', avanco: '✅ Avanço', retrocesso: '🔴 Retrocesso' };
    const tipoBadge: Record<string, string> = { paradoxo: 'badge-info', correlacao: 'badge-info', tendencia: 'badge-success', lacuna_critica: 'badge-danger', avanco: 'badge-success', retrocesso: 'badge-danger' };
    return `
    <div class="section" style="border-left:3px solid ${fio.tipo === 'avanco' ? '#22c55e' : fio.tipo === 'retrocesso' || fio.tipo === 'lacuna_critica' ? '#ef4444' : '#3b82f6'};padding-left:12px;margin-bottom:14px;">
      <p style="font-weight:600;font-size:12px;margin-bottom:4px;">${fio.titulo} <span class="badge ${tipoBadge[fio.tipo]}">${tipoLabel[fio.tipo]}</span> <span class="badge ${fio.relevancia === 'alta' ? 'badge-danger' : 'badge-neutral'}">${fio.relevancia}</span></p>
      <p style="font-size:10px;color:#374151;margin-bottom:6px;">${fio.argumento}</p>
      ${fio.comparativo2018 ? `<div class="note">📊 <strong>Comparativo 2018→2024:</strong> ${fio.comparativo2018}</div>` : ''}
      ${fio.evidencias.length > 0 ? `<ul style="font-size:9px;color:#6b7280;margin:4px 0;">${fio.evidencias.slice(0, 6).map(ev => `<li>→ <strong>${ev.texto}</strong> (${ev.fonte})</li>`).join('')}</ul>` : ''}
      <div style="margin-top:4px;">${fio.eixos.map(e => `<span class="badge badge-neutral">${e.replace(/_/g, ' ')}</span>`).join(' ')}</div>
    </div>`;
  }).join('')}

  <!-- 4.5 CRUZAMENTOS ANALÍTICOS -->
  <h3 id="concl-cruz">4.5 — Cruzamentos Analíticos (${insightsCruzamento.length} insights)</h3>
  <p style="font-size:10px;color:#64748b;margin-bottom:10px;">Insights gerados pelo cruzamento: lacunas ONU × orçamento × indicadores × respostas CERD III.</p>
  ${insightsCruzamento.map(ins => {
    const tipoBadge: Record<string, string> = { alerta: 'badge-danger', progresso: 'badge-success', 'contradição': 'badge-warning', 'correlação': 'badge-info' };
    return `
    <div class="section" style="border:1px solid #e2e8f0;border-radius:6px;padding:10px;margin-bottom:10px;">
      <p style="font-weight:600;font-size:11px;margin-bottom:4px;">${ins.titulo} <span class="badge ${tipoBadge[ins.tipo] || 'badge-neutral'}">${ins.tipo}</span></p>
      <p style="font-size:10px;color:#374151;margin-bottom:6px;">${ins.descricao}</p>
      ${ins.dados.length > 0 ? `<ul style="font-size:9px;color:#6b7280;margin:4px 0;">${ins.dados.map(d => `<li>• ${d}</li>`).join('')}</ul>` : ''}
    </div>`;
  }).join('')}

  <!-- 4.6 CONCLUSÃO-SÍNTESE (VEREDICTO) -->
  <h3 id="concl-vered">4.6 — Conclusão-Síntese: O Estado Brasileiro Avançou nas Políticas Raciais (2018–2025)?</h3>
  <div style="padding:12px;background:#fef3c7;border:2px solid #f59e0b;border-radius:8px;margin:12px 0;">
    <p style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:8px;">⚖️ Veredicto: Avanço normativo-institucional real, porém insuficiente para reverter desigualdades estruturais</p>
    <p style="font-size:10px;color:#78350f;">
      O cruzamento exaustivo dos ${fiosCondutores.length} fios condutores revela um quadro de avanço parcial e assimétrico.
      O Estado brasileiro avançou no plano normativo e institucional — recriação do MIR (2023), Lei 14.532/2023 (racismo crime inafiançável),
      Censo 2022 com contagem inédita de quilombolas, execução orçamentária recorde.
      Houve ganhos em educação (superior negro: ${edu2018.superiorNegroPercent}% → ${edu2024.superiorNegroPercent}%),
      emprego (desemprego negro: ${eco2018.desempregoNegro}% → ${eco2024.desempregoNegro}%) e renda nominal.
    </p>
    <p style="font-size:10px;color:#78350f;margin-top:6px;">
      Porém, os indicadores estruturais de violência e desigualdade pioraram ou estagnaram:
      vítimas negras de homicídio: ${seg2018.percentualVitimasNegras}% → ${seg2024.percentualVitimasNegras}%,
      feminicídio: ${fem2018.percentualNegras}% → ${fem2024.percentualNegras}%,
      letalidade policial: ${seg2018.letalidadePolicial}% → ${seg2024.letalidadePolicial}%,
      gap absoluto de renda ampliou. A MUNIC/ESTADIC 2024 revela que menos de 5% dos municípios possuem legislação racial específica.
    </p>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0;">
    <div style="padding:8px;background:#dcfce7;border-radius:6px;">
      <p style="font-size:10px;font-weight:700;color:#166534;">✓ ONDE AVANÇOU</p>
      <ul style="font-size:9px;color:#14532d;margin:0;padding-left:12px;">
        <li>Marco legal antirracista</li><li>Recriação do MIR</li><li>Educação superior negra</li><li>Execução orçamentária 2023-25</li><li>Censo quilombola inédito</li>
      </ul>
    </div>
    <div style="padding:8px;background:#fee2e2;border-radius:6px;">
      <p style="font-size:10px;font-weight:700;color:#991b1b;">✗ ONDE NÃO AVANÇOU</p>
      <ul style="font-size:9px;color:#7f1d1d;margin:0;padding-left:12px;">
        <li>Violência letal racial</li><li>Feminicídio negro</li><li>Letalidade policial</li><li>Gap absoluto de renda</li><li>Demarcação territorial</li>
      </ul>
    </div>
    <div style="padding:8px;background:#fef3c7;border-radius:6px;">
      <p style="font-size:10px;font-weight:700;color:#92400e;">⚠ PARADOXO CENTRAL</p>
      <ul style="font-size:9px;color:#78350f;margin:0;padding-left:12px;">
        <li>Leis avançam, implementação não</li><li>Orçamento cresce, resultados limitados</li><li>Federal avança, municipal estagna</li><li>Renda sobe, desigualdade persiste</li>
      </ul>
    </div>
  </div>

  <!-- 4.7 LACUNAS PERSISTENTES -->
  ${(() => {
    const lacunasPersistentes = conclusoesDinamicas.filter(c => c.tipo === 'lacuna_persistente');
    const avancos = conclusoesDinamicas.filter(c => c.tipo === 'avanco');
    const retrocessos = conclusoesDinamicas.filter(c => c.tipo === 'retrocesso');

    const renderConclusoes = (items: ConclusaoDinamica[], tipo: string) => items.map(c => {
      const badge = tipo === 'avanco' ? 'badge-success' : tipo === 'retrocesso' ? 'badge-danger' : 'badge-warning';
      return `<div class="section" style="border:1px solid #e2e8f0;border-radius:6px;padding:10px;margin-bottom:8px;">
        <p style="font-weight:600;font-size:11px;margin-bottom:4px;">${c.titulo} <span class="badge ${badge}">${c.periodo}</span> ${c.relevancia_cerd_iv ? '<span class="badge badge-info">CERD IV</span>' : ''} ${c.relevancia_common_core ? '<span class="badge badge-info">Common Core</span>' : ''}</p>
        <p style="font-size:10px;color:#374151;margin-bottom:4px;">${c.argumento_central}</p>
        ${c.evidencias.length > 0 ? `<ul style="font-size:9px;color:#6b7280;margin:4px 0;">${c.evidencias.slice(0, 4).map(e => `<li>• ${e}</li>`).join('')}</ul>` : ''}
        <div style="margin-top:4px;">${c.eixos.map(e => `<span class="badge badge-neutral">${e.replace(/_/g, ' ')}</span>`).join(' ')}</div>
      </div>`;
    }).join('');

    return `
    <h3 id="concl-lac">4.7 — Lacunas Persistentes (${lacunasPersistentes.length})</h3>
    ${lacunasPersistentes.length > 0 ? renderConclusoes(lacunasPersistentes, 'lacuna_persistente') : '<p>Nenhuma lacuna persistente identificada.</p>'}

    <h3 id="concl-av">4.8 — Avanços Identificados (${avancos.length})</h3>
    ${avancos.length > 0 ? renderConclusoes(avancos, 'avanco') : '<p>Nenhum avanço identificado.</p>'}

    <h3 id="concl-ret">4.9 — Retrocessos Identificados (${retrocessos.length})</h3>
    ${retrocessos.length > 0 ? renderConclusoes(retrocessos, 'retrocesso') : '<p>Nenhum retrocesso identificado.</p>'}
    `;
  })()}

  <p class="source" style="margin-top:16px;">
    <strong>Fontes integradas:</strong> ${fiosCondutores.length} fios condutores analíticos, ${lacunasStats?.total || 0} lacunas ONU (CERD/C/BRA/CO/18-20),
    ${respostas?.length || 0} respostas CERD III, ${indicadores?.length || 0} indicadores interseccionais,
    ${orcStats?.totalRegistros || 0} registros orçamentários (SIOP), dados FBSP 2025, PNAD 2024, DataSUS 2024, Censo 2022, MUNIC/ESTADIC 2024.
  </p>

  <div style="margin-top:40px;padding:16px;background:#f8fafc;border-radius:8px;text-align:center;">
    <p style="font-size:10px;color:#94a3b8;">
      Relatório Consolidado do Escopo do Projeto + Conclusões Analíticas — Sistema CERD IV Brasil<br>
      CDG/UFF — Gerado automaticamente em ${now}
    </p>
  ${getExportToolbarHTML('Relatorio-Consolidado-Escopo-CERD-IV')}
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
  const { data: respostas } = useRespostasLacunasCerdIII();
  const mirrorData = useMirrorData();

  const {
    fiosCondutores, conclusoesDinamicas, insightsCruzamento, sinteseExecutiva,
  } = useAnalyticalInsights();

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
        fiosCondutores,
        conclusoesDinamicas,
        insightsCruzamento,
        sinteseExecutiva,
        respostas: respostas || [],
        mirrorData,
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
                Agrega <strong>toda a informação</strong> das três bases (Estatística, Orçamentária e Normativa) + <strong>Conclusões Analíticas</strong> completas
                (síntese executiva, infográficos, fios condutores, cruzamentos, veredicto) em um único documento HTML estruturado.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Conclusões */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-chart-3" />
              Conclusões Analíticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between"><span>Síntese Executiva</span><Badge variant="outline" className="text-xs">2018→2024</Badge></div>
            <div className="flex justify-between"><span>Infográficos</span><Badge variant="outline" className="text-xs">9 tabelas</Badge></div>
            <div className="flex justify-between"><span>Fios Condutores</span><Badge variant="outline" className="text-xs">{fiosCondutores.length}</Badge></div>
            <div className="flex justify-between"><span>Cruzamentos</span><Badge variant="outline" className="text-xs">{insightsCruzamento.length}</Badge></div>
            <div className="flex justify-between"><span>Conclusões Dinâmicas</span><Badge variant="outline" className="text-xs">{conclusoesDinamicas.length}</Badge></div>
            <div className="flex justify-between"><span>Veredicto</span><Badge variant="outline" className="text-xs">Integrado</Badge></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Total de dados agregados: <strong>{totalItems} registros</strong></p>
              <p className="text-xs text-muted-foreground">
                O relatório inclui todas as tabelas, séries temporais, KPIs das três bases do Escopo + Conclusões Analíticas completas.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="lg" onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PDF / HTML
              </Button>
              <Button size="lg" variant="outline" className="gap-2" disabled={isGenerating} onClick={() => {
                setIsGenerating(true);
                try {
                  const html = generateConsolidatedHTML({
                    indicadores: indicadores || [], lacunas: lacunas || [], lacunasStats, orcStats,
                    orcamentarios: orcamentarios || [], documentosNormativos: documentosNormativos || [],
                    fiosCondutores, conclusoesDinamicas, insightsCruzamento, sinteseExecutiva, respostas: respostas || [],
                    mirrorData,
                  });
                  downloadAsDocx(html, 'Relatorio-Consolidado-Escopo-CERD-IV');
                } finally { setIsGenerating(false); }
              }}>
                <Download className="w-4 h-4" /> DOCX
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <p><strong>Conteúdo incluído (Partes I–IV):</strong></p>
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
          <li><strong>Conclusões:</strong> Síntese executiva, infográficos comparativos, tabela síntese, fios condutores, cruzamentos, veredicto, lacunas/avanços/retrocessos</li>
        </ul>
      </div>
    </div>
  );
}
