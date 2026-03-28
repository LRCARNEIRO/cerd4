import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, Download, Loader2, BookOpen, FileText } from 'lucide-react';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMirrorData } from '@/hooks/useMirrorData';
import { generateCerdIVFullHTML, type CerdIVFullData } from './generateCerdIVHTML';
import { downloadAsDocx } from '@/utils/reportExportToolbar';
import { openReportPreview } from '@/utils/reportPreview';

export function FinalCerdIVReport() {
  const {
    isLoading, fiosCondutores, conclusoesDinamicas, insightsCruzamento,
    sinteseExecutiva, stats, lacunas, respostas, orcStats, indicadores, orcDados,
  } = useAnalyticalInsights();

  const mirror = useMirrorData();

  const { data: documentosNormativos, isLoading: loadingNorm } = useQuery({
    queryKey: ['documentos_normativos_final_cerd'],
    queryFn: async () => {
      const { data } = await supabase.from('documentos_normativos').select('*');
      return data || [];
    },
  });

  const loading = isLoading || loadingNorm;

  const buildFullData = (): CerdIVFullData => ({
    lacunas: lacunas || [],
    respostas: respostas || [],
    stats,
    indicadores: indicadores || [],
    orcStats,
    orcDados: orcDados || [],
    fiosCondutores,
    conclusoesDinamicas,
    insightsCruzamento,
    sinteseExecutiva,
    normativos: documentosNormativos || [],
    mirror: {
      segurancaPublica: mirror.segurancaPublica,
      feminicidioSerie: mirror.feminicidioSerie,
      educacaoSerieHistorica: mirror.educacaoSerieHistorica,
      saudeSerieHistorica: mirror.saudeSerieHistorica,
      indicadoresSocioeconomicos: mirror.indicadoresSocioeconomicos,
      evolucaoDesigualdade: mirror.evolucaoDesigualdade,
      dadosDemograficos: mirror.dadosDemograficos,
      povosTradicionais: mirror.povosTradicionais,
      atlasViolencia2025: mirror.atlasViolencia2025,
      jovensNegrosViolencia: mirror.jovensNegrosViolencia,
      saudeMaternaRaca: mirror.saudeMaternaRaca,
      analfabetismoGeral2024: mirror.analfabetismoGeral2024,
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

  const handleGenerateHTML = () => {
    const html = generateCerdIVFullHTML(buildFullData());
    openReportPreview(html);
  };

  const handleGenerateDocx = () => {
    const html = generateCerdIVFullHTML(buildFullData());
    downloadAsDocx(html, 'Relatorio-Final-CERD-IV');
  };

  const totalLacunas = stats?.total || 0;
  const cumpridas = stats?.porStatus?.cumprido || 0;
  const parciais = stats?.porStatus?.parcialmente_cumprido || 0;
  const naoCumpridas = stats?.porStatus?.nao_cumprido || 0;
  const retrocessos = stats?.porStatus?.retrocesso || 0;

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            Relatório Final CERD IV — CERD/C/BRA/21-23
          </CardTitle>
          <CardDescription>
            Relatório periódico combinado (21º a 23º) do Brasil ao Comitê para a Eliminação da Discriminação Racial.
            Integra narrativa oficial (§1–§84), análise por Artigos I–VII, orçamento, indicadores, normativos e anexos analíticos.
            <strong> Todos os textos e dados são regenerados dinamicamente a cada atualização do sistema.</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <FileText className="w-3 h-3" /> §1–§84 parágrafos narrativos
            </Badge>
            <Badge variant="outline" className="gap-1">
              {totalLacunas} recomendações analisadas
            </Badge>
            <Badge variant="outline" className="gap-1">
              {indicadores?.length || 0} indicadores
            </Badge>
            <Badge variant="outline" className="gap-1">
              {orcDados?.length || 0} ações orçamentárias
            </Badge>
            <Badge variant="outline" className="gap-1">
              {documentosNormativos?.length || 0} normativos
            </Badge>
            <Badge variant="outline" className="gap-1">
              {respostas?.length || 0} respostas CERD III
            </Badge>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Cumpridas</p>
              <p className="text-xl font-bold text-success">{cumpridas}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Parciais</p>
              <p className="text-xl font-bold text-warning">{parciais}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Não Cumpridas</p>
              <p className="text-xl font-bold text-destructive">{naoCumpridas}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Retrocessos</p>
              <p className="text-xl font-bold text-destructive">{retrocessos}</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Variação Orçam.</p>
              <p className="text-xl font-bold">
                {orcStats?.variacaoPago ? `${orcStats.variacaoPago > 0 ? '+' : ''}${orcStats.variacaoPago.toFixed(0)}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Structure preview */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-1">
            <p className="font-semibold text-foreground mb-2">Estrutura do Relatório:</p>
            <p>📄 <strong>I.</strong> Introdução, Metodologia e Contexto Demográfico (§1–§4)</p>
            <p>📄 <strong>II.</strong> Fundamentação por Artigos I–VII (§5–§65) — com gráficos, vereditos e narrativas</p>
            <p>📄 <strong>III.</strong> Cruzamento: Recomendações × Artigos × Evidências</p>
            <p>📄 <strong>IV.</strong> Três Perspectivas Fundamentais (Storytelling Analítico)</p>
            <p>📄 <strong>V.</strong> Fios Condutores e Síntese Cruzada</p>
            <p>📄 <strong>VI.</strong> Informações Complementares (Guideline CERD/C/2007/1, §75–§81)</p>
            <p>📄 <strong>VII.</strong> Diálogo com a Sociedade Civil — Relatório Sombra (§86–§90)</p>
            <p>📄 <strong>VIII.</strong> Considerações Finais (§82–§85)</p>
            <p className="border-t pt-1 mt-1">📎 <strong>Anexo A</strong> — 87 Recomendações × Evidências</p>
            <p>📎 <strong>Anexo B</strong> — Respostas às Observações Finais (CERD III)</p>
            <p>📎 <strong>Anexo C</strong> — Base Estatística Completa por Artigo</p>
            <p>📎 <strong>Anexo D</strong> — Ações Orçamentárias + Diagrama Metodológico</p>
            <p>📎 <strong>Anexo E</strong> — Instrumentos Normativos + Linha do Tempo</p>
          </div>

          {/* Generate buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleGenerateHTML}
              disabled={loading}
              className="gap-2"
              size="lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Gerar Relatório Final (HTML/PDF)
            </Button>
            <Button
              onClick={handleGenerateDocx}
              disabled={loading}
              variant="outline"
              className="gap-2"
              size="lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exportar DOCX Editável
            </Button>
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground animate-pulse">
              ⏳ Carregando dados do sistema para geração dinâmica do relatório...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
