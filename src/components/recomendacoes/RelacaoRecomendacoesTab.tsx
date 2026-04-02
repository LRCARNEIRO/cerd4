import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { classificarOrigemLacuna, ORIGEM_CONFIG, type OrigemLacuna } from '@/utils/classificarOrigemLacuna';
import { Loader2, ListChecks } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { EIXO_PARA_ARTIGOS, ARTIGOS_CONVENCAO } from '@/utils/artigosConvencao';
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
  I: 'Definição de Discriminação Racial',
  II: 'Obrigações dos Estados',
  III: 'Segregação e Apartheid',
  IV: 'Propaganda e Organizações Racistas',
  V: 'Igualdade de Direitos (DESCA)',
  VI: 'Proteção Judicial',
  VII: 'Ensino, Educação e Cultura',
};

function getArtigosFromRecomendacao(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): string[] {
  if (l.artigos_convencao && l.artigos_convencao.length > 0) return l.artigos_convencao;
  return EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
}

function getVinculacaoJustificativa(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): string {
  if (l.artigos_convencao && l.artigos_convencao.length > 0) {
    return 'Tag explícita (BD)';
  }
  const mapped = EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS];
  if (mapped && mapped.length > 0) {
    return `Eixo: ${eixoLabels[l.eixo_tematico] || l.eixo_tematico}`;
  }
  return 'Sem vinculação';
}

/**
 * Relação Completa — visão de VINCULAÇÃO recomendação × artigos ICERD.
 * Sem status/scores (isso fica em Conclusões > Evolução Recomendações).
 */
export function RelacaoRecomendacoesTab() {
  const { data: recomendacoes, isLoading } = useLacunasIdentificadas({});

  const grouped = useMemo(() => {
    if (!recomendacoes) return { cerd: [] as typeof recomendacoes, rg: [] as typeof recomendacoes, durban: [] as typeof recomendacoes };
    const result: Record<OrigemLacuna, typeof recomendacoes> = { cerd: [], rg: [], durban: [] };
    for (const l of recomendacoes) {
      result[classificarOrigemLacuna(l.paragrafo)].push(l);
    }
    result.cerd.sort((a, b) => (parseInt(a.paragrafo.replace(/\D/g, '')) || 0) - (parseInt(b.paragrafo.replace(/\D/g, '')) || 0));
    result.rg.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    result.durban.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    return result;
  }, [recomendacoes]);

  const generateExportHTML = useCallback(() => {
    if (!recomendacoes) return '<html><body>Sem dados</body></html>';

    const renderRows = (items: typeof recomendacoes, origem: string) => items.map(l => {
      const artigos = getArtigosFromRecomendacao(l);
      const justificativa = getVinculacaoJustificativa(l);
      return `<tr>
        <td style="font-family:monospace;font-weight:bold">${l.paragrafo}</td>
        <td>${l.tema}</td>
        <td>${origem}</td>
        <td>${artigos.map(a => `<span style="display:inline-block;padding:1px 6px;border:1px solid #ccc;border-radius:3px;font-size:10px;margin:1px">Art. ${a}</span>`).join(' ')}</td>
        <td>${eixoLabels[l.eixo_tematico] || l.eixo_tematico}</td>
        <td style="font-size:10px;color:#555">${justificativa}</td>
        <td style="text-transform:capitalize">${l.prioridade}</td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relação Completa — Recomendações e Vinculações ICERD</title>
<style>
body{font-family:Arial,sans-serif;max-width:1100px;margin:20px auto;color:#222;font-size:12px}
h1{font-size:18px;border-bottom:2px solid #1e40af;padding-bottom:8px}
h2{font-size:14px;margin-top:20px;color:#1e40af}
table{width:100%;border-collapse:collapse;margin:8px 0}
th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;font-size:11px}
th{background:#f1f5f9;font-size:10px}
.methodology{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px;margin:12px 0}
.nota{font-size:10px;color:#666}
</style></head><body>
<h1>📋 Relação Completa — Recomendações e Vinculações aos Artigos ICERD</h1>
<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
<p><strong>Total:</strong> ${recomendacoes.length} recomendações — CERD (${grouped.cerd.length}), RG (${grouped.rg.length}), Durban (${grouped.durban.length})</p>

<div class="methodology">
<h2>🔗 Metodologia de Vinculação Recomendação × Artigo ICERD</h2>
<ol>
<li><strong>Tags Explícitas (Prioridade 1):</strong> Campo artigos_convencao no BD, preenchido por curadoria/auditoria.</li>
<li><strong>Eixo Temático (Fallback):</strong> Mapeamento automático do eixo temático para artigos ICERD.</li>
</ol>
<table>
<tr><th>Artigo</th><th>Escopo</th></tr>
${Object.entries(ARTIGO_DESCRICOES).map(([k, v]) => `<tr><td><strong>Art. ${k}</strong></td><td>${v}</td></tr>`).join('')}
</table>
<table>
<tr><th>Eixo Temático</th><th>Artigos Vinculados</th></tr>
${Object.entries(EIXO_PARA_ARTIGOS).map(([eixo, arts]) => `<tr><td>${eixoLabels[eixo] || eixo}</td><td>Art. ${arts.join(', ')}</td></tr>`).join('')}
</table>
<p class="nota"><strong>Exceção Art. IV:</strong> Vinculação restrita a keywords de discurso de ódio.</p>
</div>

<h2>Observações Finais (${grouped.cerd.length})</h2>
<table><tr><th>§</th><th>Tema</th><th>Origem</th><th>Artigos ICERD</th><th>Eixo</th><th>Justificativa</th><th>Prioridade</th></tr>
${renderRows(grouped.cerd, 'CERD CO')}</table>

<h2>Recomendações Gerais (${grouped.rg.length})</h2>
<table><tr><th>§</th><th>Tema</th><th>Origem</th><th>Artigos ICERD</th><th>Eixo</th><th>Justificativa</th><th>Prioridade</th></tr>
${renderRows(grouped.rg, 'RG CERD')}</table>

<h2>Durban (${grouped.durban.length})</h2>
<table><tr><th>§</th><th>Tema</th><th>Origem</th><th>Artigos ICERD</th><th>Eixo</th><th>Justificativa</th><th>Prioridade</th></tr>
${renderRows(grouped.durban, 'Durban')}</table>

<p class="nota" style="margin-top:16px">Documento gerado pelo Sistema de Monitoramento CERD IV — ${new Date().toLocaleDateString('pt-BR')}</p>
</body></html>`;
  }, [recomendacoes, grouped]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderGroup = (key: OrigemLacuna, items: any[]) => {
    const config = ORIGEM_CONFIG[key];
    if (items.length === 0) return null;

    return (
      <Card key={key} className="border-l-4" style={{ borderLeftColor: key === 'cerd' ? 'hsl(var(--primary))' : key === 'rg' ? '#d97706' : '#7c3aed' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            {config.label}
            <Badge variant="secondary" className="ml-auto">{items.length} recomendações</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">{config.documento}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">§</TableHead>
                  <TableHead>Tema</TableHead>
                  <TableHead className="w-[120px]">Artigos ICERD</TableHead>
                  <TableHead className="w-[140px]">Eixo Temático</TableHead>
                  <TableHead className="w-[160px]">Justificativa Vinculação</TableHead>
                  <TableHead className="w-[80px]">Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((l: any) => {
                  const artigos = getArtigosFromRecomendacao(l);
                  const justificativa = getVinculacaoJustificativa(l);
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
                      <TableCell className="text-[10px] text-muted-foreground">{justificativa}</TableCell>
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
          <h3 className="font-semibold text-sm">Relação Completa — Recomendações e Vinculações ICERD</h3>
          <ExportTabButtons
            generateHTML={generateExportHTML}
            fileName="relacao-recomendacoes-vinculacoes"
            label="Exportar"
            compact
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Total de <strong>{recomendacoes?.length || 0}</strong> recomendações monitoradas com suas vinculações aos Artigos I-VII da Convenção ICERD.
          <br />
          <span className="italic">Para status de cumprimento e scores baseados em evidências, consulte Produtos → Conclusões → Evolução Recomendações.</span>
        </p>
      </div>

      {renderGroup('cerd', grouped.cerd)}
      {renderGroup('rg', grouped.rg)}
      {renderGroup('durban', grouped.durban)}
    </div>
  );
}
