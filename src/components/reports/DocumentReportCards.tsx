import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Globe, FileDown, Loader2, Download, Scale, Compass, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { useLacunasIdentificadas, useRespostasLacunasCerdIII, useLacunasStats, useIndicadoresInterseccionais, useOrcamentoStats, useDadosOrcamentarios } from '@/hooks/useLacunasData';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import { generateCommonCoreHTML } from './generateCommonCoreHTML';
import { generateCerdIVFullHTML } from './generateCerdIVHTML';
import { generateMethodologyHTML } from './generateMethodologyHTML';
import { downloadAsDocx } from '@/utils/reportExportToolbar';
import { useMirrorData } from '@/hooks/useMirrorData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function DocumentReportCards() {
  const { data: lacunas } = useLacunasIdentificadas();
  const { data: respostas } = useRespostasLacunasCerdIII();
  const { data: stats } = useLacunasStats();
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: orcStats } = useOrcamentoStats();
  const { data: orcDados } = useDadosOrcamentarios();
  const mirror = useMirrorData();

  // Fetch normativos for CERD IV report
  const { data: normativos } = useQuery({
    queryKey: ['documentos_normativos_cerdiv'],
    queryFn: async () => {
      const { data } = await supabase.from('documentos_normativos').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const [generatingCCD, setGeneratingCCD] = useState(false);
  const [generatingCERD, setGeneratingCERD] = useState(false);
  const [generatingConclusoes, setGeneratingConclusoes] = useState(false);
  const [generatingMethodology, setGeneratingMethodology] = useState(false);

  const {
    fiosCondutores, conclusoesDinamicas, insightsCruzamento, sinteseExecutiva,
  } = useAnalyticalInsights();

  const totalLacunas = stats?.total || 0;
  const indicadoresCount = indicadores?.length || 0;

  // Common Core progress: based on indicadores filled
  const ccdProgress = Math.round((indicadoresCount / 77) * 100);

  // CERD IV progress: based on lacunas with responses
  const respostasCount = respostas?.length || 0;
  const lacunasComResposta = lacunas?.filter(l => l.resposta_sugerida_cerd_iv).length || 0;
  const cerdRespostasOF = respostasCount > 0 ? Math.round((respostas?.filter(r => r.grau_atendimento !== 'nao_cumprido').length || 0) / respostasCount * 100) : 0;
  const cerdDados = indicadoresCount > 0 ? Math.round((indicadoresCount / (indicadoresCount + 6)) * 100) : 0;
  const cerdPovos = 100; // All groups covered
  const cerdProgress = Math.round((cerdRespostasOF + cerdDados + cerdPovos) / 3);

  // Conclusões progress
  const avancos = conclusoesDinamicas.filter(c => c.tipo === 'avanco').length;
  const retrocessos = conclusoesDinamicas.filter(c => c.tipo === 'retrocesso').length;
  const lacunasPersist = conclusoesDinamicas.filter(c => c.tipo === 'lacuna_persistente').length;
  const totalConclusoes = fiosCondutores.length + insightsCruzamento.length + avancos + retrocessos + lacunasPersist;
  const conclusoesProgress = Math.min(100, Math.round((totalConclusoes / 25) * 100));

  const handleGenerateCCD = async () => {
    setGeneratingCCD(true);
    try {
      const html = generateCommonCoreHTML(indicadores || [], lacunas || [], stats, orcStats, {
        segurancaPublica: mirror.segurancaPublica,
        ccTablesFromBD: mirror.ccTablesFromBD,
      });
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } finally {
      setGeneratingCCD(false);
    }
  };

  const buildCerdIVData = () => ({
    lacunas: lacunas || [], respostas: respostas || [], stats, indicadores: indicadores || [],
    orcStats, orcDados: orcDados || [], normativos: normativos || [],
    fiosCondutores, conclusoesDinamicas, insightsCruzamento, sinteseExecutiva,
    mirror: {
      segurancaPublica: mirror.segurancaPublica,
      feminicidioSerie: mirror.feminicidioSerie,
      educacaoSerieHistorica: mirror.educacaoSerieHistorica,
      saudeSerieHistorica: mirror.saudeSerieHistorica,
      atlasViolencia2025: mirror.atlasViolencia2025,
      jovensNegrosViolencia: mirror.jovensNegrosViolencia,
      saudeMaternaRaca: mirror.saudeMaternaRaca,
      analfabetismoGeral2024: mirror.analfabetismoGeral2024,
      indicadoresSocioeconomicos: mirror.indicadoresSocioeconomicos,
      evolucaoDesigualdade: mirror.evolucaoDesigualdade,
      dadosDemograficos: mirror.dadosDemograficos,
      povosTradicionais: mirror.povosTradicionais,
      violenciaInterseccional: mirror.violenciaInterseccional,
      juventudeNegra: mirror.juventudeNegra,
      classePorRaca: mirror.classePorRaca,
      deficitHabitacionalSerie: mirror.deficitHabitacionalSerie,
      evasaoEscolarSerie: mirror.evasaoEscolarSerie,
      rendimentosCenso2022: mirror.rendimentosCenso2022,
      terrasQuilombolasHistorico: mirror.terrasQuilombolasHistorico,
      resumoExecutivo: mirror.resumoExecutivo,
      ccTablesFromBD: mirror.ccTablesFromBD,
      gfMirrors: mirror.gfMirrors,
      covidMirrors: mirror.covidMirrors,
      usandoBD: mirror.usandoBD,
    },
  });

  const handleGenerateCERD = async () => {
    setGeneratingCERD(true);
    try {
      const html = generateCerdIVFullHTML(buildCerdIVData());
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } finally {
      setGeneratingCERD(false);
    }
  };

  const handleGenerateConclusoes = async () => {
    setGeneratingConclusoes(true);
    try {
      // Dynamically import to avoid circular deps
      const { generateConclusoesFullHTML } = await import('./generateConclusoesFullHTML');
      const html = generateConclusoesFullHTML({
        fiosCondutores, conclusoesDinamicas, insightsCruzamento,
        stats, lacunas: lacunas || [], respostas: respostas || [],
        indicadores: indicadores || [], orcStats,
        mirrorData: {
          segurancaPublica: mirror.segurancaPublica,
          feminicidioSerie: mirror.feminicidioSerie,
          educacaoSerieHistorica: mirror.educacaoSerieHistorica,
          saudeSerieHistorica: mirror.saudeSerieHistorica,
          indicadoresSocioeconomicos: mirror.indicadoresSocioeconomicos,
          evolucaoDesigualdade: mirror.evolucaoDesigualdade,
          violenciaInterseccional: mirror.violenciaInterseccional,
          classePorRaca: mirror.classePorRaca,
          dadosDemograficos: mirror.dadosDemograficos,
          povosTradicionais: mirror.povosTradicionais,
        },
      });
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } finally {
      setGeneratingConclusoes(false);
    }
  };

  const [generatingBudget, setGeneratingBudget] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-6">
      {/* Common Core Document */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <BookOpen className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Common Core Document (HRI/CORE/BRA)</h3>
              <p className="text-sm text-muted-foreground">Período: 2018-2025</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progresso (<span className="text-primary">Dinâmico</span>)</span>
              <span>{ccdProgress}%</span>
            </div>
            <Progress value={ccdProgress} className="h-2" />
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Prazo:</p>
              <p className="font-medium">Dezembro 2025</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Indicadores:</p>
              <p className="font-medium">{indicadoresCount}/77 indicadores</p>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs">
              <strong>Status:</strong>{' '}
              {indicadoresCount} atualizados, {77 - indicadoresCount} parciais, 0 desatualizados
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              className="gap-2" 
              onClick={handleGenerateCCD}
              disabled={generatingCCD}
            >
              {generatingCCD ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              PDF / HTML
            </Button>
            <Button 
              variant="outline"
              className="gap-2" 
              onClick={() => {
                const html = generateCommonCoreHTML(indicadores || [], lacunas || [], stats, orcStats, {
                  segurancaPublica: mirror.segurancaPublica,
                  ccTablesFromBD: mirror.ccTablesFromBD,
                });
                downloadAsDocx(html, 'Common-Core-HRI-CORE-BRA');
              }}
            >
              <Download className="w-4 h-4" />
              DOCX
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CERD IV */}
      <Card className="border-l-4 border-l-success">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Globe className="w-6 h-6 text-success flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">CERD IV - Relatório Periódico</h3>
              <p className="text-sm text-muted-foreground">Período: 2018-2025</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progresso (baseado no banco)</span>
              <span className="font-bold">{cerdProgress}%</span>
            </div>
            <Progress value={cerdProgress} className="h-2.5 [&>div]:bg-[hsl(var(--chart-1))]" />
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Prazo:</p>
              <p className="font-medium">Março 2026</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Lacunas no banco:</p>
              <p className="font-medium">{totalLacunas}</p>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs">
              <strong>Seções:</strong>{' '}
              Respostas OF {cerdRespostasOF}%, Dados {cerdDados}%, Povos {cerdPovos}%
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="gap-2"
              onClick={handleGenerateCERD}
              disabled={generatingCERD}
            >
              {generatingCERD ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              PDF / HTML
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const html = generateCerdIVFullHTML(buildCerdIVData());
                downloadAsDocx(html, 'CERD-IV-Relatorio-Periodico');
              }}
            >
              <Download className="w-4 h-4" />
              DOCX
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conclusões Analíticas */}
      <Card className="border-l-4 border-l-accent">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Scale className="w-6 h-6 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Conclusões Analíticas (Integral)</h3>
              <p className="text-sm text-muted-foreground">Todas as 8 abas consolidadas</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Cobertura analítica</span>
              <span className="font-bold">{conclusoesProgress}%</span>
            </div>
            <Progress value={conclusoesProgress} className="h-2.5 [&>div]:bg-[hsl(var(--chart-3))]" />
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Fios condutores:</p>
              <p className="font-medium">{fiosCondutores.length}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Cruzamentos:</p>
              <p className="font-medium">{insightsCruzamento.length}</p>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs">
              <strong>Conteúdo:</strong>{' '}
              {avancos} avanços, {retrocessos} retrocessos, {lacunasPersist} lacunas persist.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="gap-2"
              onClick={handleGenerateConclusoes}
              disabled={generatingConclusoes}
            >
              {generatingConclusoes ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              PDF / HTML
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={async () => {
                const { generateConclusoesFullHTML } = await import('./generateConclusoesFullHTML');
                const html = generateConclusoesFullHTML({
                  fiosCondutores, conclusoesDinamicas, insightsCruzamento,
                  stats, lacunas: lacunas || [], respostas: respostas || [],
                  indicadores: indicadores || [], orcStats,
                  mirrorData: {
                    segurancaPublica: mirror.segurancaPublica,
                    feminicidioSerie: mirror.feminicidioSerie,
                    educacaoSerieHistorica: mirror.educacaoSerieHistorica,
                    saudeSerieHistorica: mirror.saudeSerieHistorica,
                    indicadoresSocioeconomicos: mirror.indicadoresSocioeconomicos,
                    evolucaoDesigualdade: mirror.evolucaoDesigualdade,
                    violenciaInterseccional: mirror.violenciaInterseccional,
                    classePorRaca: mirror.classePorRaca,
                    dadosDemograficos: mirror.dadosDemograficos,
                    povosTradicionais: mirror.povosTradicionais,
                  },
                });
                downloadAsDocx(html, 'Conclusoes-Analiticas-Integral');
              }}
            >
              <Download className="w-4 h-4" />
              DOCX
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metodologia do Escopo */}
      <Card className="border-l-4 border-l-chart-4">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Compass className="w-6 h-6 text-chart-4 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Metodologia do Escopo</h3>
              <p className="text-sm text-muted-foreground">Lógica de cada aba explicada</p>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs">
              <strong>Conteúdo:</strong>{' '}
              19 abas documentadas — origem, prompt, documentos-fonte e artigos ICERD vinculados
            </p>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Estatísticas:</p>
              <p className="font-medium">15 abas</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Grupos Focais:</p>
              <p className="font-medium">4 abas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="gap-2"
              onClick={() => {
                setGeneratingMethodology(true);
                try {
                  const html = generateMethodologyHTML();
                  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                  window.open(URL.createObjectURL(blob), '_blank');
                } finally {
                  setGeneratingMethodology(false);
                }
              }}
              disabled={generatingMethodology}
            >
              {generatingMethodology ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              PDF / HTML
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const html = generateMethodologyHTML();
                downloadAsDocx(html, 'Metodologia-Escopo-Projeto');
              }}
            >
              <Download className="w-4 h-4" />
              DOCX
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatório Orçamentário Consolidado */}
      <Card className="border-l-4 border-l-emerald-600">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Relatório Orçamentário Consolidado</h3>
              <p className="text-sm text-muted-foreground">Período: 2018-2025</p>
            </div>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs">
              <strong>Conteúdo:</strong>{' '}
              Metodologia (7 camadas), KPIs, evolução histórica, Orçamento Simbólico, Efeito Mascaramento, Artigos ICERD e Anexo de Programas/Ações
            </p>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Registros:</p>
              <p className="font-medium">{orcStats?.totalRegistros || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Variação:</p>
              <p className="font-medium">{orcStats?.variacao ? `${orcStats.variacao >= 0 ? '+' : ''}${orcStats.variacao.toFixed(0)}%` : 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={async () => {
                setGeneratingBudget(true);
                try {
                  const { data, error } = await supabase.functions.invoke('generate-budget-report', { body: {} });
                  if (error) throw error;
                  const { injectExportToolbar } = await import('@/utils/reportExportToolbar');
                  const html = injectExportToolbar(data, 'Relatorio-Orcamentario-Consolidado');
                  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                  window.open(URL.createObjectURL(blob), '_blank');
                } catch (e) {
                  console.error('Budget report error:', e);
                } finally {
                  setGeneratingBudget(false);
                }
              }}
              disabled={generatingBudget}
            >
              {generatingBudget ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              PDF / HTML
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={async () => {
                setGeneratingBudget(true);
                try {
                  const { data, error } = await supabase.functions.invoke('generate-budget-report', { body: {} });
                  if (error) throw error;
                  const { injectExportToolbar } = await import('@/utils/reportExportToolbar');
                  const html = injectExportToolbar(data, 'Relatorio-Orcamentario-Consolidado');
                  downloadAsDocx(html, 'Relatorio-Orcamentario-Consolidado');
                } catch (e) {
                  console.error('Budget DOCX error:', e);
                } finally {
                  setGeneratingBudget(false);
                }
              }}
              disabled={generatingBudget}
            >
              <Download className="w-4 h-4" />
              DOCX
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
