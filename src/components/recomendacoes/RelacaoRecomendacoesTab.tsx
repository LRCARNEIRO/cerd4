import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { classificarOrigemLacuna, ORIGEM_CONFIG, type OrigemLacuna } from '@/utils/classificarOrigemLacuna';
import { Loader2, ListChecks } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { useMemo, useCallback } from 'react';
import { useDiagnosticSensor, type LacunaDiagnostic } from '@/hooks/useDiagnosticSensor';
import { EIXO_PARA_ARTIGOS, ARTIGOS_CONVENCAO, type ArtigoConvencao } from '@/utils/artigosConvencao';
import type { ComplianceStatus } from '@/hooks/useLacunasData';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';

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
  dados_estatisticas: 'Dados e Estatísticas',
};

const ARTIGO_DESCRICOES: Record<string, string> = {
  I: 'Definição de Discriminação Racial — conceituação, alcance, interseccionalidade',
  II: 'Obrigações dos Estados — políticas públicas, marco institucional, ações afirmativas',
  III: 'Segregação e Apartheid — segregação espacial, territórios, exclusão',
  IV: 'Propaganda e Organizações Racistas — discurso de ódio, crimes de ódio, internet',
  V: 'Igualdade de Direitos — civis, políticos, DESCA (trabalho, moradia, saúde, educação)',
  VI: 'Proteção Judicial — acesso à justiça, reparação, remédios jurídicos',
  VII: 'Ensino, Educação e Cultura — currículo, formação docente, mídia, Lei 10.639',
};

function getArtigosFromLacuna(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): string[] {
  if (l.artigos_convencao && l.artigos_convencao.length > 0) return l.artigos_convencao;
  return EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
}

function getVinculacaoJustificativa(l: { artigos_convencao?: string[] | null; eixo_tematico: string; tema: string; descricao_lacuna: string }): string {
  if (l.artigos_convencao && l.artigos_convencao.length > 0) {
    return 'Tag explícita no banco de dados (artigos_convencao)';
  }
  const mapped = EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS];
  if (mapped && mapped.length > 0) {
    return `Inferência por eixo temático: "${eixoLabels[l.eixo_tematico] || l.eixo_tematico}" → Art. ${mapped.join(', ')}`;
  }
  return 'Sem vinculação identificada';
}

export function RelacaoRecomendacoesTab() {
  const { data: lacunas, isLoading } = useLacunasIdentificadas({});
  const { diagnosticMap, isReady: sensorReady } = useDiagnosticSensor(lacunas);

  const grouped = useMemo(() => {
    if (!lacunas) return { cerd: [], rg: [], durban: [] };
    const result: Record<OrigemLacuna, typeof lacunas> = { cerd: [], rg: [], durban: [] };
    for (const l of lacunas) {
      result[classificarOrigemLacuna(l.paragrafo)].push(l);
    }
    result.cerd.sort((a, b) => {
      const na = parseInt(a.paragrafo.replace(/\D/g, '')) || 0;
      const nb = parseInt(b.paragrafo.replace(/\D/g, '')) || 0;
      return na - nb;
    });
    result.rg.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    result.durban.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    return result;
  }, [lacunas]);

  const getEffectiveStatus = (l: { id: string; status_cumprimento: ComplianceStatus }): ComplianceStatus => {
    const diag = diagnosticMap.get(l.id);
    return diag?.statusComputado ?? l.status_cumprimento;
  };

  const generateExportHTML = useCallback(() => {
    if (!lacunas) return '<html><body>Sem dados</body></html>';
    const allItems = [...(grouped.cerd || []), ...(grouped.rg || []), ...(grouped.durban || [])];
    
    const renderRows = (items: typeof allItems, origem: string) => items.map(l => {
      const artigos = getArtigosFromLacuna(l);
      const diag = diagnosticMap.get(l.id);
      const effectiveStatus = diag?.statusComputado ?? l.status_cumprimento;
      const score = diag?.auditoria?.scoreGlobal;
      const justificativa = getVinculacaoJustificativa(l);
      
      const statusColor = effectiveStatus === 'cumprido' ? '#16a34a' : 
        effectiveStatus === 'parcialmente_cumprido' ? '#ca8a04' : 
        effectiveStatus === 'em_andamento' ? '#2563eb' : '#dc2626';
      const statusLabel = effectiveStatus === 'cumprido' ? 'Cumprido' :
        effectiveStatus === 'parcialmente_cumprido' ? 'Parcial' :
        effectiveStatus === 'em_andamento' ? 'Em Andamento' :
        effectiveStatus === 'retrocesso' ? 'Retrocesso' : 'Não Cumprido';

      return `<tr>
        <td style="font-family:monospace;font-weight:bold">${l.paragrafo}</td>
        <td>${l.tema}</td>
        <td>${origem}</td>
        <td>${artigos.map(a => `<span style="display:inline-block;padding:1px 6px;border:1px solid #ccc;border-radius:3px;font-size:10px;margin:1px">Art. ${a}</span>`).join(' ')}</td>
        <td style="color:${statusColor};font-weight:bold">${statusLabel}</td>
        <td style="font-family:monospace;font-weight:bold">${score != null ? score : '—'}</td>
        <td>${eixoLabels[l.eixo_tematico] || l.eixo_tematico}</td>
        <td style="font-size:10px;color:#555">${justificativa}</td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relação Consolidada de Recomendações — CERD IV</title>
<style>
body{font-family:Arial,sans-serif;max-width:1200px;margin:20px auto;color:#222;font-size:12px}
h1{font-size:18px;border-bottom:2px solid #1e40af;padding-bottom:8px}
h2{font-size:15px;margin-top:24px;color:#1e40af}
h3{font-size:13px;margin-top:16px;color:#333}
table{width:100%;border-collapse:collapse;margin:8px 0}
th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;font-size:11px}
th{background:#f1f5f9;font-size:10px}
.methodology{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:16px;margin:16px 0}
.nota{font-size:10px;color:#666;margin-top:4px}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:bold}
.green{background:#dcfce7;color:#166534}.yellow{background:#fef9c3;color:#854d0e}
.blue{background:#dbeafe;color:#1e40af}.red{background:#fee2e2;color:#991b1b}
</style></head><body>
<h1>📋 Relação Consolidada de Recomendações Monitoradas</h1>
<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
<p><strong>Total:</strong> ${lacunas.length} recomendações ativas — Observações Finais (${grouped.cerd.length}), Recomendações Gerais (${grouped.rg.length}), Durban (${grouped.durban.length}).</p>

<div class="methodology">
<h2>📐 Metodologia de Cálculo do Score (0-100)</h2>
<p>O status de cada recomendação é calculado automaticamente pelo motor de diagnóstico, composto por três dimensões de evidências externas:</p>
<table>
<tr><th>Dimensão</th><th>Peso</th><th>Descrição</th></tr>
<tr><td>Indicadores Estatísticos</td><td>40%</td><td>Dados quantitativos vinculados por tags explícitas ou palavras-chave extraídas do tema/descrição da recomendação</td></tr>
<tr><td>Orçamento</td><td>30%</td><td>Ações orçamentárias vinculadas por palavras-chave, avaliando cobertura (não valor em R$)</td></tr>
<tr><td>Normativos</td><td>30%</td><td>Instrumentos legislativos vinculados ao artigo/eixo temático</td></tr>
</table>
<p class="nota"><strong>Modelo Híbrido Anti-Coringa:</strong> Evidências vinculadas por tags explícitas = Peso 1.0 (100%). Vínculos por eixo temático = Peso 0.5 (50%). Artigos presentes em >40% dos registros (ex: Art. V) têm peso de eixo reduzido (~12%).</p>
<p class="nota"><strong>Cap de Piora:</strong> Se indicadores mostram piora > melhora, score máximo = 55 (Parcial).</p>
<p class="nota"><strong>Faixas:</strong> ≥80 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | &lt;15 Retrocesso</p>
</div>

<div class="methodology">
<h2>🔗 Metodologia de Vinculação Recomendação × Artigo ICERD</h2>
<p>Cada recomendação é vinculada a 1+ Artigos da Convenção ICERD (I-VII) por <strong>coerência temática</strong>:</p>
<ol>
<li><strong>Tags Explícitas (Prioridade 1):</strong> Campo <code>artigos_convencao</code> preenchido no banco de dados por curadoria manual/auditoria.</li>
<li><strong>Eixo Temático (Fallback):</strong> Se sem tags, o eixo temático da recomendação é mapeado para artigos via tabela EIXO_PARA_ARTIGOS.</li>
</ol>
<h3>Definições dos Artigos ICERD</h3>
<table>
<tr><th>Artigo</th><th>Escopo</th></tr>
${Object.entries(ARTIGO_DESCRICOES).map(([k, v]) => `<tr><td><strong>Art. ${k}</strong></td><td>${v}</td></tr>`).join('')}
</table>
<h3>Mapeamento Eixo Temático → Artigos</h3>
<table>
<tr><th>Eixo Temático</th><th>Artigos Vinculados</th><th>Justificativa</th></tr>
${Object.entries(EIXO_PARA_ARTIGOS).map(([eixo, arts]) => `<tr><td>${eixoLabels[eixo] || eixo}</td><td>Art. ${arts.join(', ')}</td><td>Correspondência temática com escopo do(s) artigo(s)</td></tr>`).join('')}
</table>
<p class="nota"><strong>Exceção Art. IV:</strong> Vinculação restrita a keywords de discurso de ódio (ódio, neonazi, incitação, propaganda racista). Eixos amplos como "Legislação" não geram vínculo com Art. IV.</p>
</div>

<h2>Observações Finais do Comitê CERD (${grouped.cerd.length})</h2>
<table>
<tr><th>§</th><th>Tema</th><th>Origem</th><th>Artigos ICERD</th><th>Status</th><th>Score</th><th>Eixo</th><th>Justificativa da Vinculação</th></tr>
${renderRows(grouped.cerd, 'CERD CO')}
</table>

<h2>Recomendações Gerais (${grouped.rg.length})</h2>
<table>
<tr><th>§</th><th>Tema</th><th>Origem</th><th>Artigos ICERD</th><th>Status</th><th>Score</th><th>Eixo</th><th>Justificativa da Vinculação</th></tr>
${renderRows(grouped.rg, 'RG CERD')}
</table>

<h2>Declaração e Programa de Ação de Durban (${grouped.durban.length})</h2>
<table>
<tr><th>§</th><th>Tema</th><th>Origem</th><th>Artigos ICERD</th><th>Status</th><th>Score</th><th>Eixo</th><th>Justificativa da Vinculação</th></tr>
${renderRows(grouped.durban, 'Durban')}
</table>

<hr/>
<div class="methodology">
<h3>Distinção: Aderência ICERD vs. Evolução dos Artigos</h3>
<table>
<tr><th>Métrica</th><th>Pergunta Central</th><th>Dimensões</th></tr>
<tr><td><strong>Aderência ICERD</strong></td><td>O sistema tem dados suficientes para avaliar este artigo?</td><td>Recomendações (20%) + Normativos (25%) + Orçamento (20%) + Indicadores/Séries (25%) + Amplitude (10%)</td></tr>
<tr><td><strong>Evolução dos Artigos</strong></td><td>Os dados mostram melhora nos indicadores?</td><td>Orçamento (35%) + Normativa (35%) + Indicadores (30%) — foco em tendências</td></tr>
</table>
</div>

<p class="nota">Documento gerado pelo Sistema de Monitoramento CERD IV — ${new Date().toLocaleDateString('pt-BR')}</p>
</body></html>`;
  }, [lacunas, grouped, diagnosticMap]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderGroup = (key: OrigemLacuna, items: typeof lacunas extends (infer T)[] ? T[] : never[]) => {
    const config = ORIGEM_CONFIG[key];
    if (items.length === 0) return null;

    const statusCount: Record<string, number> = {};
    items.forEach(l => {
      const eff = getEffectiveStatus(l);
      statusCount[eff] = (statusCount[eff] || 0) + 1;
    });

    return (
      <Card key={key} className="border-l-4" style={{ borderLeftColor: key === 'cerd' ? 'hsl(var(--primary))' : key === 'rg' ? '#d97706' : '#7c3aed' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            {config.label}
            <Badge variant="secondary" className="ml-auto">{items.length} recomendações</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">{config.documento}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusCount.cumprido > 0 && <Badge variant="outline" className="text-success border-success/30 text-xs">{statusCount.cumprido} Cumprida(s)</Badge>}
            {statusCount.parcialmente_cumprido > 0 && <Badge variant="outline" className="text-warning border-warning/30 text-xs">{statusCount.parcialmente_cumprido} Parcial(is)</Badge>}
            {statusCount.em_andamento > 0 && <Badge variant="outline" className="text-info border-info/30 text-xs">{statusCount.em_andamento} Em Andamento</Badge>}
            {statusCount.nao_cumprido > 0 && <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">{statusCount.nao_cumprido} Não Cumprida(s)</Badge>}
            {statusCount.retrocesso > 0 && <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">{statusCount.retrocesso} Retrocesso(s)</Badge>}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">§</TableHead>
                  <TableHead>Tema</TableHead>
                  <TableHead className="w-[100px]">Artigos ICERD</TableHead>
                  <TableHead className="w-[140px]">Eixo Temático</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[60px]">Score</TableHead>
                  <TableHead className="w-[80px]">Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(l => {
                  const diag = diagnosticMap.get(l.id);
                  const effectiveStatus = diag?.statusComputado ?? l.status_cumprimento;
                  const artigos = getArtigosFromLacuna(l);
                  const score = diag?.auditoria?.scoreGlobal;

                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono font-semibold text-xs">{l.paragrafo}</TableCell>
                      <TableCell className="text-sm">{l.tema}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-0.5">
                          {artigos.map(a => (
                            <Badge key={a} variant="outline" className="text-[10px] px-1 py-0">{a}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{eixoLabels[l.eixo_tematico] || l.eixo_tematico}</TableCell>
                      <TableCell>
                        <StatusBadge status={effectiveStatus} size="sm" />
                      </TableCell>
                      <TableCell>
                        {score != null && (
                          <span className={`text-xs font-mono font-bold ${score >= 75 ? 'text-success' : score >= 55 ? 'text-warning' : score >= 35 ? 'text-orange-500' : 'text-destructive'}`}>
                            {score}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={l.prioridade === 'critica' ? 'destructive' : 'outline'} className="text-xs capitalize">
                          {l.prioridade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Relação Consolidada de Recomendações Monitoradas</h3>
          <ExportTabButtons
            generateHTML={generateExportHTML}
            fileName="relacao-recomendacoes-cerd"
            label="Exportar"
            compact
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Total de <strong>{lacunas?.length || 0}</strong> recomendações ativas com status calculado automaticamente (Score 0-100).
          Distribuídas em: Observações Finais ({grouped.cerd.length}), Recomendações Gerais ({grouped.rg.length}) e Durban ({grouped.durban.length}).
        </p>
        {sensorReady && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Metodologia: Indicadores (40%) + Orçamento (30%) + Normativos (30%) → Faixas: ≥80 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | &lt;15 Retrocesso
          </p>
        )}
      </div>

      {renderGroup('cerd', grouped.cerd)}
      {renderGroup('rg', grouped.rg)}
      {renderGroup('durban', grouped.durban)}

      {/* Status legend */}
      <div className="bg-muted/20 rounded-lg border p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Legenda de Status:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> <strong>Cumprido (≥80):</strong> Evidências indicam cumprimento integral</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> <strong>Parcial (≥55):</strong> Avanço significativo, lacunas remanescentes</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-info" /> <strong>Em Andamento (≥35):</strong> Esforço institucional detectado</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> <strong>Não Cumprido (≥15):</strong> Evidências insuficientes de ação</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> <strong>Retrocesso (&lt;15):</strong> Piora detectada nos indicadores</span>
        </div>
      </div>
    </div>
  );
}
