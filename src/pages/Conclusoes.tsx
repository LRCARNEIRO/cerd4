import { useState, useRef, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Lightbulb, BarChart3, Loader2, Database, RefreshCw, FileText, Scale, BookOpen, Users, Landmark, Link2, Zap, Eye, ArrowRight, Shield, GraduationCap, Heart, DollarSign, HeartPulse, Printer, Filter, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import type { FioCondutor, InsightCruzamento, ConclusaoDinamica } from '@/hooks/useAnalyticalInsights';
import { generateSectionPDF, cardHTML, evidenceListHTML, tagsHTML, sectionTitleHTML, statCardHTML } from '@/utils/generateSectionPDF';
import {
  ViolenciaRacialChart, FeminicidioChart, EducacaoComparativaChart,
  SaudeComparativaChart, RendaComparativaChart, DesigualdadeEvolucaoChart,
  ViolenciaInterseccionalChart, TabelaSinteseComparativa,
  ClassePorRacaChart
} from '@/components/conclusoes/ComparativeCharts';
import { useMirrorData } from '@/hooks/useMirrorData';
import { ARTIGOS_CONVENCAO, type ArtigoConvencao } from '@/utils/artigosConvencao';
const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça',
  politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda',
  terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio',
  participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas'
};

import { RefreshDiffDialog, captureSnapshot, type SnapshotData } from '@/components/conclusoes/RefreshDiffDialog';
import { FarolEvolucaoPanel } from '@/components/conclusoes/FarolEvolucaoPanel';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function Conclusoes() {
  const queryClient = useQueryClient();
  const {
    isLoading, isFetching, fiosCondutores, conclusoesDinamicas, insightsCruzamento,
    sinteseExecutiva, stats, lacunas, respostas, orcStats, indicadores, orcDados, lastUpdated,
  } = useAnalyticalInsights();
  const { dadosDemograficos, segurancaPublica, feminicidioSerie, educacaoSerieHistorica, saudeSerieHistorica, indicadoresSocioeconomicos, povosTradicionais } = useMirrorData();

  const { data: documentosNormativos } = useQuery({
    queryKey: ['documentos_normativos_aderencia'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos_normativos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const [diffOpen, setDiffOpen] = useState(false);
  const [beforeSnap, setBeforeSnap] = useState<SnapshotData | null>(null);
  const [afterSnap, setAfterSnap] = useState<SnapshotData | null>(null);
  const [artigoFiltro, setArtigoFiltro] = useState<ArtigoConvencao | null>(null);
  const waitingRefresh = useRef(false);
  const wasFetching = useRef(false);

  // Filter fios/conclusões by selected article
  const fiosFiltrados = useMemo(() => {
    if (!artigoFiltro) return fiosCondutores;
    return fiosCondutores.filter(f => f.artigosConvencao?.includes(artigoFiltro));
  }, [fiosCondutores, artigoFiltro]);

  const conclusoesFiltradas = useMemo(() => {
    if (!artigoFiltro) return conclusoesDinamicas;
    return conclusoesDinamicas.filter(c => c.artigosConvencao?.includes(artigoFiltro));
  }, [conclusoesDinamicas, artigoFiltro]);

  const handleRefresh = () => {
    setBeforeSnap(captureSnapshot(stats, fiosCondutores, insightsCruzamento, conclusoesDinamicas, indicadores, respostas, orcStats));
    waitingRefresh.current = true;
    queryClient.invalidateQueries();
  };

  // Track fetching transitions: true→false means refetch completed
  useEffect(() => {
    if (waitingRefresh.current && isFetching) {
      wasFetching.current = true;
    }
    if (waitingRefresh.current && wasFetching.current && !isFetching) {
      waitingRefresh.current = false;
      wasFetching.current = false;
      setAfterSnap(captureSnapshot(stats, fiosCondutores, insightsCruzamento, conclusoesDinamicas, indicadores, respostas, orcStats));
      setDiffOpen(true);
    }
  }, [isFetching, stats, fiosCondutores, insightsCruzamento, conclusoesDinamicas, indicadores, respostas, orcStats]);

  const now = new Date().toLocaleString('pt-BR');

  // PDF generators per section
  const gerarPDFFios = () => {
    const content = fiosCondutores.map(fio => {
      const badgeType = fio.tipo === 'avanco' ? 'success' : fio.tipo === 'retrocesso' || fio.tipo === 'lacuna_critica' ? 'destructive' : 'info';
      const evidencias = fio.evidencias.map(ev => `<strong>${ev.texto}</strong> (${ev.fonte})`);
      const comparativo = fio.comparativo2018 ? `<div class="comparativo"><strong>📊 Comparativo 2018→2024:</strong> ${fio.comparativo2018}</div>` : '';
      const eixos = fio.eixos.map(e => eixoLabels[e] || e);
      return cardHTML(fio.titulo, fio.argumento, { text: fio.tipo.replace(/_/g, ' '), type: badgeType },
        comparativo + evidenceListHTML(evidencias) + tagsHTML(eixos)
      );
    }).join('');
    generateSectionPDF({ titulo: 'Fios Condutores', subtitulo: `${fiosCondutores.length} argumentos transversais — Base Estatística × Orçamentária × Normativa`, dataGeracao: now, conteudo: content });
  };

  const gerarPDFCruzamentos = () => {
    const content = insightsCruzamento.map(ins => {
      const badgeType = ins.tipo === 'alerta' ? 'destructive' : ins.tipo === 'progresso' ? 'success' : ins.tipo === 'contradição' ? 'warning' : 'info';
      return cardHTML(ins.titulo, ins.descricao, { text: ins.tipo, type: badgeType }, evidenceListHTML(ins.dados));
    }).join('');
    generateSectionPDF({ titulo: 'Cruzamentos Analíticos', subtitulo: `${insightsCruzamento.length} insights identificados`, dataGeracao: now, conteudo: content });
  };

  const gerarPDFConclusoes = (tipo: 'lacuna_persistente' | 'avanco' | 'retrocesso', label: string) => {
    const items = conclusoesDinamicas.filter(c => c.tipo === tipo);
    const content = items.map(c => {
      const badgeType = c.tipo === 'avanco' ? 'success' : c.tipo === 'retrocesso' ? 'destructive' : 'warning';
      const eixos = c.eixos.map(e => eixoLabels[e] || e);
      const extras = evidenceListHTML(c.evidencias) + tagsHTML([...eixos, ...(c.relevancia_cerd_iv ? ['CERD IV'] : [])]);
      return cardHTML(c.titulo, c.argumento_central, { text: c.periodo, type: badgeType }, extras);
    }).join('');
    generateSectionPDF({ titulo: label, subtitulo: `${items.length} item(ns) identificado(s)`, dataGeracao: now, conteudo: content });
  };

  const gerarPDFSintese = () => {
    const seg2018L = segurancaPublica[0];
    const seg2024L = segurancaPublica[segurancaPublica.length - 1];
    const edu2018L = educacaoSerieHistorica[0];
    const edu2024L = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];
    const eco2018L = indicadoresSocioeconomicos[0];
    const eco2024L = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];
    const fem2018L = feminicidioSerie[0];
    const fem2024L = feminicidioSerie[feminicidioSerie.length - 1];
    
    let content = sectionTitleHTML('Indicadores-Chave 2018 → 2024');
    content += '<div class="grid-2">';
    content += statCardHTML('Homicídio negro', `${seg2024L.percentualVitimasNegras}%`, `2018: ${seg2018L.percentualVitimasNegras}%`, 'negative');
    content += statCardHTML('Feminicídio negro', `${fem2024L.percentualNegras}%`, `2018: ${fem2018L.percentualNegras}%`, 'negative');
    content += statCardHTML('Superior negro', `${edu2024L.superiorNegroPercent}%`, `2018: ${edu2018L.superiorNegroPercent}%`, 'positive');
    content += statCardHTML('Renda negra', `R$ ${eco2024L.rendaMediaNegra}`, `2018: R$ ${eco2018L.rendaMediaNegra}`, 'positive');
    content += '</div>';

    content += sectionTitleHTML('Tabela Síntese Comparativa');
    content += `<table>
      <thead><tr><th>Indicador</th><th>2018</th><th>2024</th><th>Variação</th></tr></thead>
      <tbody>
        <tr><td>Vítimas negras homicídio (%)</td><td>${seg2018L.percentualVitimasNegras}%</td><td>${seg2024L.percentualVitimasNegras}%</td><td class="stat-change negative">+${(seg2024L.percentualVitimasNegras - seg2018L.percentualVitimasNegras).toFixed(1)}pp</td></tr>
        <tr><td>Letalidade policial negra (%)</td><td>${seg2018L.letalidadePolicial}%</td><td>${seg2024L.letalidadePolicial}%</td><td class="stat-change negative">+${(seg2024L.letalidadePolicial - seg2018L.letalidadePolicial).toFixed(1)}pp</td></tr>
        <tr><td>Feminicídio negro (%)</td><td>${fem2018L.percentualNegras}%</td><td>${fem2024L.percentualNegras}%</td><td class="stat-change negative">+${(fem2024L.percentualNegras - fem2018L.percentualNegras).toFixed(1)}pp</td></tr>
        <tr><td>Superior completo negro (%)</td><td>${edu2018L.superiorNegroPercent}%</td><td>${edu2024L.superiorNegroPercent}%</td><td class="stat-change positive">+${(edu2024L.superiorNegroPercent - edu2018L.superiorNegroPercent).toFixed(1)}pp</td></tr>
        <tr><td>Renda média negra (R$)</td><td>R$ ${eco2018L.rendaMediaNegra}</td><td>R$ ${eco2024L.rendaMediaNegra}</td><td class="stat-change positive">+${((eco2024L.rendaMediaNegra / eco2018L.rendaMediaNegra - 1) * 100).toFixed(0)}%</td></tr>
        <tr><td>Gap renda branca-negra (R$)</td><td>R$ ${eco2018L.rendaMediaBranca - eco2018L.rendaMediaNegra}</td><td>R$ ${eco2024L.rendaMediaBranca - eco2024L.rendaMediaNegra}</td><td class="stat-change negative">Ampliou</td></tr>
      </tbody>
    </table>`;

    generateSectionPDF({ titulo: 'Tabela Síntese Comparativa', subtitulo: 'Indicadores 2018 → 2024 — Fontes: FBSP, PNAD, DataSUS, SIDRA/IBGE', dataGeracao: now, conteudo: content });
  };

  const gerarPDFSinteseExecutiva = () => {
    if (!sinteseExecutiva) return;
    let content = cardHTML('Síntese Executiva', sinteseExecutiva.narrativa, { text: 'Consolidação', type: 'info' });

    if (sinteseExecutiva.eixosMaisProblematicos.length > 0) {
      content += sectionTitleHTML('Eixos Mais Críticos');
      content += `<table><thead><tr><th>Eixo</th><th>Total Lacunas</th><th>% Não Cumprido</th></tr></thead><tbody>`;
      sinteseExecutiva.eixosMaisProblematicos.forEach(e => {
        content += `<tr><td>${e.eixo}</td><td>${e.total}</td><td class="stat-change negative">${Math.round(e.gravidade * 100)}%</td></tr>`;
      });
      content += '</tbody></table>';
    }

    generateSectionPDF({ titulo: 'Síntese Executiva', subtitulo: `${stats?.total || 0} lacunas ONU × ${respostas?.length || 0} respostas CERD III`, dataGeracao: now, conteudo: content });
  };

  const conclusoesAgrupadas = {
    lacuna_persistente: conclusoesFiltradas.filter(c => c.tipo === 'lacuna_persistente'),
    avanco: conclusoesFiltradas.filter(c => c.tipo === 'avanco'),
    retrocesso: conclusoesFiltradas.filter(c => c.tipo === 'retrocesso'),
  };

  // Dados do Escopo para síntese
  const seg2018 = segurancaPublica[0];
  const seg2024 = segurancaPublica[segurancaPublica.length - 1];
  const edu2018 = educacaoSerieHistorica[0];
  const edu2024 = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];
  const eco2018 = indicadoresSocioeconomicos[0];
  const eco2024 = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];
  const fem2018 = feminicidioSerie[0];
  const fem2024 = feminicidioSerie[feminicidioSerie.length - 1];

  return (
    <DashboardLayout
      title="Conclusões Analíticas — Política Racial no Brasil"
      subtitle="Cruzamento exaustivo: Base Estatística × Orçamentária × Normativa × MUNIC/ESTADIC × COVID-19 (2018→2024)"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="gap-1"><BarChart3 className="w-3 h-3" />Estatísticas</Badge>
          <Badge variant="outline" className="gap-1"><DollarSign className="w-3 h-3" />Orçamento</Badge>
          <Badge variant="outline" className="gap-1"><Scale className="w-3 h-3" />Normativa</Badge>
          <Badge variant="outline" className="gap-1 bg-chart-3/10"><Landmark className="w-3 h-3" />MUNIC/ESTADIC</Badge>
          <Badge variant="outline" className="gap-1 bg-destructive/10"><Heart className="w-3 h-3" />COVID-19</Badge>
          <Badge variant="outline" className="gap-1"><Database className="w-3 h-3" />{stats?.total || 0} lacunas ONU</Badge>
          <Badge variant="outline" className="gap-1"><Users className="w-3 h-3" />{indicadores?.length || 0} indicadores analíticos</Badge>
          {lastUpdated && (
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Zap className="w-3 h-3" />
              Dados atualizados: {new Date(lastUpdated).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Filtro por Artigo da Convenção ICERD */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Artigo ICERD:</span>
        <Badge
          variant={artigoFiltro === null ? "default" : "outline"}
          className="cursor-pointer text-xs"
          onClick={() => setArtigoFiltro(null)}
        >
          Todos
        </Badge>
        {ARTIGOS_CONVENCAO.map(art => (
          <Badge
            key={art.numero}
            variant={artigoFiltro === art.numero ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setArtigoFiltro(artigoFiltro === art.numero ? null : art.numero)}
            title={art.tituloCompleto}
          >
            Art. {art.numero}
          </Badge>
        ))}
        {artigoFiltro && (
          <span className="text-xs text-muted-foreground ml-2">
            — {ARTIGOS_CONVENCAO.find(a => a.numero === artigoFiltro)?.titulo}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Cruzando dados do Escopo...</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* DADOS-CHAVE DO ESCOPO - Cards numéricos */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            <Card>
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Pop. negra</p>
                <p className="text-lg font-bold">{dadosDemograficos.percentualNegro}%</p>
                <p className="text-xs text-muted-foreground">{(dadosDemograficos.populacaoNegra / 1e6).toFixed(0)}M</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/30">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Homicídio negro</p>
                <p className="text-lg font-bold text-destructive">{seg2024.percentualVitimasNegras}%</p>
                <p className="text-xs text-muted-foreground">2018: {seg2018.percentualVitimasNegras}%</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/30">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Feminicídio negro</p>
                <p className="text-lg font-bold text-destructive">{fem2024.percentualNegras}%</p>
                <p className="text-xs text-muted-foreground">2018: {fem2018.percentualNegras}%</p>
              </CardContent>
            </Card>
            <Card className="border-success/30">
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Superior negro</p>
                <p className="text-lg font-bold text-success">{edu2024.superiorNegroPercent}%</p>
                <p className="text-xs text-muted-foreground">2018: {edu2018.superiorNegroPercent}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Renda negra</p>
                <p className="text-lg font-bold">R$ {eco2024.rendaMediaNegra}</p>
                <p className="text-xs text-success">+{((eco2024.rendaMediaNegra/eco2018.rendaMediaNegra-1)*100).toFixed(0)}% vs 2018</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-3 pb-3 text-center">
                <p className="text-xs text-muted-foreground">Razão renda</p>
                <p className="text-lg font-bold text-warning">{(eco2024.rendaMediaBranca/eco2024.rendaMediaNegra).toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">Negro = {(eco2024.rendaMediaNegra/eco2024.rendaMediaBranca*100).toFixed(0)}% do branco</p>
              </CardContent>
            </Card>
          </div>

          {/* SÍNTESE EXECUTIVA */}
          <Card className="mb-6 border-2 border-primary">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  Síntese Executiva: O que os dados revelam
                </CardTitle>
                <Button variant="outline" size="sm" onClick={gerarPDFSinteseExecutiva} className="gap-1">
                  <Printer className="w-3 h-3" /> PDF
                </Button>
              </div>
              <CardDescription>
                Cruzamento de {stats?.total || 0} lacunas ONU + {respostas?.length || 0} respostas CERD III + dados FBSP/PNAD/DataSUS/SIOP 2018→2024
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-xs font-semibold text-destructive mb-2">⚠️ PIORA RELATIVA (2018→2024)</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Homicídio: vítimas negras {seg2018.percentualVitimasNegras}% → {seg2024.percentualVitimasNegras}% (+{(seg2024.percentualVitimasNegras-seg2018.percentualVitimasNegras).toFixed(1)}pp)</li>
                    <li>• Letalidade policial negra: {seg2018.letalidadePolicial}% → {seg2024.letalidadePolicial}% (+{(seg2024.letalidadePolicial-seg2018.letalidadePolicial).toFixed(1)}pp)</li>
                    <li>• Feminicídio mulheres negras: {fem2018.percentualNegras}% → {fem2024.percentualNegras}% (+{(fem2024.percentualNegras-fem2018.percentualNegras).toFixed(1)}pp)</li>
                    <li>• Risco homicídio negro: persistente em {seg2024.razaoRisco}x maior</li>
                    <li>• Gap absoluto renda: R$ {eco2018.rendaMediaBranca-eco2018.rendaMediaNegra} → R$ {eco2024.rendaMediaBranca-eco2024.rendaMediaNegra} (aumentou!)</li>
                  </ul>
                </div>
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <p className="text-xs font-semibold text-success mb-2">✓ AVANÇOS (2018→2024)</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Superior completo negro: {edu2018.superiorNegroPercent}% → {edu2024.superiorNegroPercent}% (+{(edu2024.superiorNegroPercent-edu2018.superiorNegroPercent).toFixed(1)}pp)</li>
                    <li>• Analfabetismo negro: {edu2018.analfabetismoNegro}% → {edu2024.analfabetismoNegro}% ({(edu2024.analfabetismoNegro-edu2018.analfabetismoNegro).toFixed(1)}pp)</li>
                    <li>• Desemprego negro: {eco2018.desempregoNegro}% → {eco2024.desempregoNegro}% ({(eco2024.desempregoNegro-eco2018.desempregoNegro).toFixed(1)}pp)</li>
                    <li>• Renda média negra: R$ {eco2018.rendaMediaNegra} → R$ {eco2024.rendaMediaNegra} (+{((eco2024.rendaMediaNegra/eco2018.rendaMediaNegra-1)*100).toFixed(0)}%)</li>
                    <li>• Censo 2022: primeira contagem de quilombolas ({povosTradicionais.quilombolas.populacao.toLocaleString('pt-BR')})</li>
                    <li>• Recriação do MIR e Lei 14.532/2023 (racismo = crime inafiançável)</li>
                  </ul>
                </div>
              </div>
              
              {sinteseExecutiva && sinteseExecutiva.eixosMaisProblematicos.length > 0 && (
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="text-xs font-semibold text-warning mb-2">⚡ EIXOS MAIS CRÍTICOS (lacunas ONU não cumpridas)</p>
                  <div className="space-y-2">
                    {sinteseExecutiva.eixosMaisProblematicos.map((e, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs">{e.eixo} ({e.total} lacunas)</span>
                        <Badge variant="destructive" className="text-xs">{Math.round(e.gravidade * 100)}% não cumprido</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bloco de auditoria — Deep links */}
              <div className="p-3 bg-muted/30 border border-border/50 rounded-md">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Fontes para auditoria dos dados acima:
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  <a href="https://forumseguranca.org.br/anuario-brasileiro-de-seguranca-publica/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">19º Anuário FBSP 2025 <ExternalLink className="w-2.5 h-2.5" /></a>
                  <a href="https://www.ipea.gov.br/atlasviolencia/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">Atlas da Violência 2025 <ExternalLink className="w-2.5 h-2.5" /></a>
                  <a href="https://sidra.ibge.gov.br/Tabela/7129" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">SIDRA 7129 — Educação Superior <ExternalLink className="w-2.5 h-2.5" /></a>
                  <a href="https://sidra.ibge.gov.br/tabela/6405" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">SIDRA 6405 — Rendimento <ExternalLink className="w-2.5 h-2.5" /></a>
                  <a href="https://sidra.ibge.gov.br/Tabela/9605" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">Censo 2022 (SIDRA 9605) <ExternalLink className="w-2.5 h-2.5" /></a>
                  <a href="http://tabnet.datasus.gov.br/cgi/tabcgi.exe?sim/cnv/mat10uf.def" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">DataSUS/SIM <ExternalLink className="w-2.5 h-2.5" /></a>
                  <a href="https://www.dieese.org.br/boletimespecial/2024/boletimEspecial01.html" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">DIEESE Racial 2024 <ExternalLink className="w-2.5 h-2.5" /></a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="infograficos" className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="infograficos" className="gap-1"><BarChart3 className="w-4 h-4" /> Infográficos Comparativos</TabsTrigger>
              <TabsTrigger value="sintese" className="gap-1"><FileText className="w-4 h-4" /> Tabela Síntese</TabsTrigger>
              <TabsTrigger value="fios" className="gap-1"><Link2 className="w-4 h-4" /> Fios Condutores ({fiosFiltrados.length})</TabsTrigger>
              <TabsTrigger value="cruzamentos" className="gap-1"><Zap className="w-4 h-4" /> Cruzamentos</TabsTrigger>
              <TabsTrigger value="lacunas" className="gap-1"><AlertTriangle className="w-4 h-4" /> Lacunas ({conclusoesAgrupadas.lacuna_persistente.length})</TabsTrigger>
              <TabsTrigger value="avancos" className="gap-1"><TrendingUp className="w-4 h-4" /> Avanços ({conclusoesAgrupadas.avanco.length})</TabsTrigger>
              <TabsTrigger value="retrocessos" className="gap-1"><TrendingDown className="w-4 h-4" /> Retrocessos ({conclusoesAgrupadas.retrocesso.length})</TabsTrigger>
              <TabsTrigger value="farol" className="gap-1"><Scale className="w-4 h-4" /> Farol de Evolução</TabsTrigger>
            </TabsList>

            {/* ABA: INFOGRÁFICOS */}
            <TabsContent value="infograficos">
              <div className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      <strong>Dados do Escopo do Projeto</strong> — Gráficos comparativos 2018→2024 extraídos da Base Estatística (FBSP, PNAD, DataSUS, SIDRA/IBGE). 
                      Cada gráfico fundamenta um argumento para o CERD IV / Common Core.
                    </p>
                  </CardContent>
                </Card>

                {/* Segurança + Feminicídio */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ViolenciaRacialChart />
                  <FeminicidioChart />
                </div>

                {/* Violência interseccional + Radar */}
                <ViolenciaInterseccionalChart />

                {/* Educação + Saúde */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EducacaoComparativaChart />
                  <SaudeComparativaChart />
                </div>

                {/* Renda + Desigualdade */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RendaComparativaChart />
                  <DesigualdadeEvolucaoChart />
                </div>

                {/* Classe por raça */}
                <ClassePorRacaChart />
              </div>
            </TabsContent>

            {/* ABA: TABELA SÍNTESE */}
            <TabsContent value="sintese">
              <div className="flex justify-end mb-3">
                <Button variant="outline" size="sm" onClick={gerarPDFSintese} className="gap-1">
                  <Printer className="w-3 h-3" /> Gerar PDF
                </Button>
              </div>
              <TabelaSinteseComparativa />
            </TabsContent>

            {/* ABA: FIOS CONDUTORES */}
            <TabsContent value="fios">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <Card className="bg-primary/5 border-primary/20 flex-1">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Link2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">Fios Condutores — a "cola" do quebra-cabeças</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Argumentos transversais gerados pelo cruzamento das bases do Escopo: dados estatísticos (FBSP, PNAD, DataSUS) × 
                          {stats?.total || 0} lacunas ONU × {respostas?.length || 0} respostas CERD III × {orcStats?.totalRegistros || 0} registros orçamentários. 
                          Cada fio conecta números, eixos e comparativos para formar narrativas consistentes para o relatório.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  <Button variant="outline" size="sm" onClick={gerarPDFFios} className="gap-1 flex-shrink-0">
                    <Printer className="w-3 h-3" /> Gerar PDF
                  </Button>
                </div>
                {fiosFiltrados.map((fio) => (
                  <FioCondutorCard key={fio.id} fio={fio} />
                ))}
              </div>
            </TabsContent>

            {/* ABA: CRUZAMENTOS */}
            <TabsContent value="cruzamentos">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Card className="bg-muted/30 flex-1">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">
                        Insights gerados pelo cruzamento: lacunas ONU × orçamento × indicadores FBSP/PNAD × respostas CERD III. 
                        Identificam padrões, contradições e correlações na política racial brasileira.
                      </p>
                    </CardContent>
                  </Card>
                  <Button variant="outline" size="sm" onClick={gerarPDFCruzamentos} className="gap-1 ml-3 flex-shrink-0">
                    <Printer className="w-3 h-3" /> Gerar PDF
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insightsCruzamento.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>

                {/* CONCLUSÃO-SÍNTESE: O Estado avançou? */}
                <Card className="border-2 border-primary mt-6">
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Scale className="w-6 h-6 text-primary" />
                      Conclusão-Síntese: O Estado Brasileiro Avançou nas Políticas Raciais (2018–2025)?
                    </CardTitle>
                    <CardDescription>
                      Resposta integrada a partir dos {fiosCondutores.length} fios condutores × {stats?.total || 0} lacunas ONU × dados FBSP/PNAD/DataSUS/SIOP
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                      <p className="text-sm font-semibold text-warning mb-2">⚖️ Veredicto: Avanço normativo-institucional real, porém insuficiente para reverter desigualdades estruturais</p>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      O cruzamento exaustivo dos fios condutores revela um quadro de <strong>avanço parcial e assimétrico</strong>. 
                      O Estado brasileiro avançou no plano <strong>normativo e institucional</strong> — recriação do MIR (2023), Lei 14.532/2023 
                      (racismo crime inafiançável), Censo 2022 com contagem inédita de quilombolas, execução orçamentária recorde do MIR (~99% em 2024-2025) 
                      e variação de {orcStats?.variacao >= 0 ? `+${orcStats?.variacao?.toFixed(0)}` : orcStats?.variacao?.toFixed(0)}% no orçamento entre períodos. 
                      Houve também ganhos em <strong>educação</strong> (superior negro: {edu2018.superiorNegroPercent}% → {edu2024.superiorNegroPercent}%), 
                      <strong>emprego</strong> (desemprego negro: {eco2018.desempregoNegro}% → {eco2024.desempregoNegro}%) e <strong>renda nominal</strong> (R$ {eco2018.rendaMediaNegra} → R$ {eco2024.rendaMediaNegra}).
                    </p>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Porém, os indicadores estruturais de <strong>violência e desigualdade pioraram ou estagnaram</strong>: 
                      vítimas negras de homicídio subiram de {seg2018.percentualVitimasNegras}% para {seg2024.percentualVitimasNegras}%, 
                      feminicídio de mulheres negras de {fem2018.percentualNegras}% para {fem2024.percentualNegras}%, 
                      letalidade policial negra de {seg2018.letalidadePolicial}% para {seg2024.letalidadePolicial}%, 
                      e o gap absoluto de renda branca-negra <strong>aumentou</strong> (R$ {eco2018.rendaMediaBranca - eco2018.rendaMediaNegra} → R$ {eco2024.rendaMediaBranca - eco2024.rendaMediaNegra}). 
                      A MUNIC/ESTADIC 2024 revela que menos de 5% dos municípios possuem legislação racial específica e apenas 2 UFs mantêm Fundos de Igualdade Racial ativos, 
                      evidenciando que os avanços federais não capilarizaram para governos subnacionais. 
                      A COVID-19 (2020-2022) aprofundou todas as disparidades, e a recuperação pós-pandemia atinge desigualmente a população negra.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                        <p className="text-xs font-bold text-success mb-1">✓ ONDE AVANÇOU</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          <li>• Marco legal antirracista</li>
                          <li>• Recriação do MIR</li>
                          <li>• Educação superior negra</li>
                          <li>• Execução orçamentária 2023-25</li>
                          <li>• Censo quilombola inédito</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-xs font-bold text-destructive mb-1">✗ ONDE NÃO AVANÇOU</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          <li>• Violência letal racial</li>
                          <li>• Feminicídio negro</li>
                          <li>• Letalidade policial</li>
                          <li>• Gap absoluto de renda</li>
                          <li>• Demarcação territorial</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-xs font-bold text-warning mb-1">⚠ PARADOXO CENTRAL</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          <li>• Leis avançam, implementação não</li>
                          <li>• Orçamento cresce, resultados limitados</li>
                          <li>• Federal avança, municipal estagna</li>
                          <li>• Renda sobe, desigualdade persiste</li>
                          <li>• Dados melhoram, lacunas permanecem</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground italic mb-2">
                        <strong>Fontes integradas:</strong> {fiosCondutores.length} fios condutores analíticos, {stats?.total || 0} lacunas ONU (CERD/C/BRA/CO/18-20), 
                        {respostas?.length || 0} respostas CERD III, {indicadores?.length || 0} indicadores interseccionais, 
                        {orcStats?.totalRegistros || 0} registros orçamentários (SIOP), dados FBSP 2025, PNAD 2024, DataSUS 2024, Censo 2022, MUNIC/ESTADIC 2024.
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        <a href="https://forumseguranca.org.br/anuario-brasileiro-de-seguranca-publica/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">FBSP 2025 <ExternalLink className="w-2.5 h-2.5" /></a>
                        <a href="https://www.ipea.gov.br/atlasviolencia/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">Atlas Violência <ExternalLink className="w-2.5 h-2.5" /></a>
                        <a href="https://sidra.ibge.gov.br/tabela/6405" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">SIDRA 6405 <ExternalLink className="w-2.5 h-2.5" /></a>
                        <a href="https://sidra.ibge.gov.br/Tabela/7129" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">SIDRA 7129 <ExternalLink className="w-2.5 h-2.5" /></a>
                        <a href="http://tabnet.datasus.gov.br/cgi/tabcgi.exe?sim/cnv/mat10uf.def" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">DataSUS/SIM <ExternalLink className="w-2.5 h-2.5" /></a>
                        <a href="https://sidra.ibge.gov.br/Tabela/9605" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">Censo 2022 <ExternalLink className="w-2.5 h-2.5" /></a>
                        <a href="https://portaldatransparencia.gov.br/despesas" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">Portal Transparência <ExternalLink className="w-2.5 h-2.5" /></a>
                        <a href="https://www.ibge.gov.br/estatisticas/sociais/saude/10586-pesquisa-de-informacoes-basicas-municipais.html" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">MUNIC/ESTADIC 2024 <ExternalLink className="w-2.5 h-2.5" /></a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ABA: LACUNAS */}
            <TabsContent value="lacunas">
              <div className="flex justify-end mb-3">
                <Button variant="outline" size="sm" onClick={() => gerarPDFConclusoes('lacuna_persistente', 'Lacunas Persistentes')} className="gap-1">
                  <Printer className="w-3 h-3" /> Gerar PDF
                </Button>
              </div>
              <div className="space-y-4">
                {conclusoesAgrupadas.lacuna_persistente.length === 0 ? (
                  <EmptyState message="Nenhuma lacuna persistente identificada." />
                ) : (
                  conclusoesAgrupadas.lacuna_persistente.map((c) => (
                    <ConclusaoCard key={c.id} conclusao={c} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* ABA: AVANÇOS */}
            <TabsContent value="avancos">
              <div className="flex justify-end mb-3">
                <Button variant="outline" size="sm" onClick={() => gerarPDFConclusoes('avanco', 'Avanços Identificados')} className="gap-1">
                  <Printer className="w-3 h-3" /> Gerar PDF
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conclusoesAgrupadas.avanco.length === 0 ? (
                  <EmptyState message="Nenhum avanço identificado." />
                ) : (
                  conclusoesAgrupadas.avanco.map((c) => (
                    <ConclusaoCard key={c.id} conclusao={c} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* ABA: RETROCESSOS */}
            <TabsContent value="retrocessos">
              <div className="flex justify-end mb-3">
                <Button variant="outline" size="sm" onClick={() => gerarPDFConclusoes('retrocesso', 'Retrocessos Identificados')} className="gap-1">
                  <Printer className="w-3 h-3" /> Gerar PDF
                </Button>
              </div>
              <div className="space-y-4">
                {conclusoesAgrupadas.retrocesso.length === 0 ? (
                  <EmptyState message="Nenhum retrocesso identificado." />
                ) : (
                  conclusoesAgrupadas.retrocesso.map((c) => (
                    <ConclusaoCard key={c.id} conclusao={c} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* ABA: FAROL DE EVOLUÇÃO */}
            <TabsContent value="farol">
              <FarolEvolucaoPanel
                lacunas={lacunas || []}
                orcamentoRecords={orcDados || []}
                indicadores={indicadores || []}
                stats={stats}
                documentosNormativos={documentosNormativos || []}
                respostasCerdIII={respostas || []}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
      <RefreshDiffDialog open={diffOpen} onOpenChange={setDiffOpen} before={beforeSnap} after={afterSnap} />
    </DashboardLayout>
  );
}

// =============================================
// COMPONENTES AUXILIARES
// =============================================

function FioCondutorCard({ fio }: { fio: FioCondutor }) {
  const tipoConfig = {
    paradoxo: { icon: Scale, color: 'border-l-primary', bg: 'bg-primary/5', label: 'Paradoxo' },
    correlacao: { icon: Link2, color: 'border-l-accent', bg: 'bg-accent/5', label: 'Correlação' },
    tendencia: { icon: TrendingUp, color: 'border-l-success', bg: 'bg-success/5', label: 'Tendência' },
    lacuna_critica: { icon: AlertTriangle, color: 'border-l-destructive', bg: 'bg-destructive/5', label: 'Lacuna Crítica' },
    avanco: { icon: CheckCircle2, color: 'border-l-success', bg: 'bg-success/5', label: 'Avanço' },
    retrocesso: { icon: TrendingDown, color: 'border-l-destructive', bg: 'bg-destructive/5', label: 'Retrocesso' },
  };
  const config = tipoConfig[fio.tipo];
  const Icon = config.icon;

  return (
    <Card className={cn('border-l-4', config.color)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {fio.titulo}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{config.label}</Badge>
            <Badge className={fio.relevancia === 'alta' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}>
              {fio.relevancia}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{fio.argumento}</p>
        {fio.comparativo2018 && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
            <p className="text-xs font-semibold text-primary mb-1">📊 Comparativo 2018 → 2024:</p>
            <p className="text-xs text-muted-foreground">{fio.comparativo2018}</p>
          </div>
        )}
        {fio.evidencias.length > 0 && (
          <div className={cn('p-3 rounded-lg mb-3', config.bg)}>
            <p className="text-xs font-medium text-muted-foreground mb-2">Evidências ({fio.evidencias.length}):</p>
            <ul className="space-y-1">
              {fio.evidencias.slice(0, 8).map((ev, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <span><strong>{ev.texto}</strong> <span className="text-muted-foreground">({ev.fonte})</span></span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {fio.artigosConvencao && fio.artigosConvencao.length > 0 && fio.artigosConvencao.map((art, i) => (
            <Badge key={`art-${i}`} className="text-[10px] bg-primary/15 text-primary border-primary/30" variant="outline">
              Art. {art}
            </Badge>
          ))}
          {fio.eixos.map((e, i) => (
            <Badge key={i} variant="outline" className="text-xs">{eixoLabels[e] || e}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: InsightCruzamento }) {
  const tipoConfig = {
    alerta: { color: 'border-l-destructive', icon: AlertTriangle, iconColor: 'text-destructive' },
    progresso: { color: 'border-l-success', icon: CheckCircle2, iconColor: 'text-success' },
    contradição: { color: 'border-l-warning', icon: Zap, iconColor: 'text-warning' },
    correlação: { color: 'border-l-primary', icon: Link2, iconColor: 'text-primary' },
  };
  const config = tipoConfig[insight.tipo];
  const Icon = config.icon;

  return (
    <Card className={cn('border-l-4', config.color)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className={cn('w-4 h-4', config.iconColor)} />
          {insight.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">{insight.descricao}</p>
        <ul className="space-y-1">
          {insight.dados.slice(0, 5).map((d, i) => (
            <li key={i} className="text-xs flex items-start gap-1.5">
              <span className="text-muted-foreground">•</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ConclusaoCard({ conclusao }: { conclusao: ConclusaoDinamica }) {
  return (
    <Card className={cn(
      'border-l-4',
      conclusao.tipo === 'avanco' && 'border-l-success',
      conclusao.tipo === 'retrocesso' && 'border-l-destructive',
      conclusao.tipo === 'lacuna_persistente' && 'border-l-warning'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            {conclusao.tipo === 'avanco' && <TrendingUp className="w-5 h-5 text-success" />}
            {conclusao.tipo === 'retrocesso' && <TrendingDown className="w-5 h-5 text-destructive" />}
            {conclusao.tipo === 'lacuna_persistente' && <AlertTriangle className="w-5 h-5 text-warning" />}
            {conclusao.titulo}
          </CardTitle>
          <Badge variant="outline">{conclusao.periodo}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">{conclusao.argumento_central}</p>
        {conclusao.evidencias.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Evidências ({conclusao.evidencias.length}):</p>
            <ul className="text-sm space-y-1">
              {conclusao.evidencias.slice(0, 6).map((ev, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-xs">{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {conclusao.fiosCondutores.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <Link2 className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-medium">Conectado a: {conclusao.fiosCondutores.join(', ')}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {conclusao.artigosConvencao && conclusao.artigosConvencao.length > 0 && conclusao.artigosConvencao.map((art, i) => (
            <Badge key={`art-${i}`} className="text-[10px] bg-primary/15 text-primary border-primary/30" variant="outline">
              Art. {art}
            </Badge>
          ))}
          {conclusao.eixos.map((eixo, i) => (
            <Badge key={i} variant="outline" className="text-xs">{eixoLabels[eixo] || eixo.replace(/_/g, ' ')}</Badge>
          ))}
          {conclusao.relevancia_cerd_iv && (
            <Badge className="bg-accent/10 text-accent-foreground text-xs">CERD IV</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground col-span-full">
      <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p>{message}</p>
    </div>
  );
}
