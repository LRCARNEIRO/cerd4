import type { LacunaDiagnostic } from '@/hooks/useDiagnosticSensor';
import type { LacunaIdentificada } from '@/hooks/useLacunasData';

/**
 * Generates a dynamic CERD IV suggested response based on cross-referenced
 * evidence from the diagnostic sensor (indicators, budget, normative framework).
 */
export function generateSuggestedResponse(
  lacuna: LacunaIdentificada,
  diagnostic?: LacunaDiagnostic
): string | null {
  if (!diagnostic) return null;

  const { linkedIndicadores, linkedOrcamento, linkedNormativos, signals, statusComputado } = diagnostic;

  // If no cross-referenced data at all, can't generate
  if (linkedIndicadores.length === 0 && linkedOrcamento.length === 0 && linkedNormativos.length === 0) {
    return null;
  }

  const parts: string[] = [];
  const tema = lacuna.tema;
  const paragrafo = lacuna.paragrafo;

  // ── Opening paragraph ──
  parts.push(`Em resposta ao §${paragrafo} das Observações Finais (CERD/C/BRA/CO/18-20), relativo a "${tema}", o Estado brasileiro apresenta os seguintes avanços e desafios identificados no período ${lacuna.periodo_analise_inicio}–${lacuna.periodo_analise_fim}:`);

  // ── Indicators section ──
  if (linkedIndicadores.length > 0) {
    const melhoram = linkedIndicadores.filter(i => {
      const t = (i.tendencia || '').toLowerCase();
      return t === 'crescente' || t === 'melhora';
    });
    const pioram = linkedIndicadores.filter(i => {
      const t = (i.tendencia || '').toLowerCase();
      return t === 'decrescente' || t === 'piora';
    });
    const estaveis = linkedIndicadores.filter(i => {
      const t = (i.tendencia || '').toLowerCase();
      return t === 'estavel' || t === 'estável';
    });

    const indicatorLines: string[] = [];

    if (melhoram.length > 0) {
      const nomes = melhoram.slice(0, 5).map(i => i.nome).join('; ');
      indicatorLines.push(`Registrou-se tendência positiva em ${melhoram.length} indicador(es): ${nomes}.`);
    }
    if (pioram.length > 0) {
      const nomes = pioram.slice(0, 5).map(i => i.nome).join('; ');
      indicatorLines.push(`Persistem desafios em ${pioram.length} indicador(es) com tendência desfavorável: ${nomes}.`);
    }
    if (estaveis.length > 0) {
      indicatorLines.push(`${estaveis.length} indicador(es) apresenta(m) estabilidade no período.`);
    }

    // Extract latest values for top indicators
    const topIndicators = linkedIndicadores.slice(0, 5);
    const valorLines = topIndicators.map(ind => {
      const dados = ind.dados as Record<string, any> | null;
      if (!dados || typeof dados !== 'object') return null;
      const entries = Object.entries(dados);
      if (entries.length === 0) return null;
      const last = entries[entries.length - 1];
      const val = last[1];
      if (typeof val === 'object' && val !== null) {
        const subEntries = Object.entries(val).slice(0, 3);
        const formatted = subEntries.map(([k, v]) => `${k}: ${v}`).join(', ');
        return `${ind.nome} (${last[0]}): ${formatted}`;
      }
      return `${ind.nome} (${last[0]}): ${val}`;
    }).filter(Boolean);

    if (valorLines.length > 0) {
      indicatorLines.push(`Dados recentes: ${valorLines.join('; ')}.`);
    }

    parts.push(`\nNo campo estatístico, o sistema identificou ${linkedIndicadores.length} indicador(es) vinculado(s) aos artigos da Convenção correspondentes. ${indicatorLines.join(' ')}`);
  }

  // ── Budget section ──
  if (linkedOrcamento.length > 0) {
    const totalDotacao = linkedOrcamento.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0), 0);
    const totalPago = linkedOrcamento.reduce((s, o) => s + (Number(o.pago) || 0), 0);
    const execGlobal = totalDotacao > 0 ? ((totalPago / totalDotacao) * 100).toFixed(1) : '0';

    const simbolicos = linkedOrcamento.filter(o => {
      const dot = Number(o.dotacao_autorizada) || 0;
      const pg = Number(o.pago) || 0;
      return dot > 100000 && pg < dot * 0.05;
    });

    const topProgramas = [...new Set(linkedOrcamento.map(o => o.programa))].slice(0, 4).join('; ');

    let budgetText = `\nQuanto ao investimento público, foram identificadas ${linkedOrcamento.length} ação(ões) orçamentária(s) vinculada(s), com dotação total autorizada de R$ ${formatBRL(totalDotacao)} e execução global de ${execGlobal}%. Programas relevantes incluem: ${topProgramas}.`;

    if (simbolicos.length > 0) {
      budgetText += ` Alerta-se que ${simbolicos.length} ação(ões) apresenta(m) execução inferior a 5% do autorizado, configurando orçamento simbólico que compromete a efetividade da política pública.`;
    }

    parts.push(budgetText);
  }

  // ── Normative section ──
  if (linkedNormativos.length > 0) {
    const nomes = linkedNormativos.slice(0, 5).map(n => n.titulo).join('; ');
    parts.push(`\nNo marco normativo-institucional, identificaram-se ${linkedNormativos.length} documento(s) relevante(s): ${nomes}. ${linkedNormativos.length > 5 ? `E outros ${linkedNormativos.length - 5} documentos complementares.` : ''}`);
  }

  // ── Own evidence from lacuna ──
  if (lacuna.acoes_brasil && lacuna.acoes_brasil.length > 0) {
    const acoes = lacuna.acoes_brasil.slice(0, 4).join('; ');
    parts.push(`\nEntre as ações governamentais registradas: ${acoes}.`);
  }

  if (lacuna.evidencias_encontradas && lacuna.evidencias_encontradas.length > 0) {
    const evs = lacuna.evidencias_encontradas.slice(0, 3).join('; ');
    parts.push(`\nEvidências documentais: ${evs}.`);
  }

  // ── Closing assessment ──
  const statusText: Record<string, string> = {
    cumprido: 'considera-se que a recomendação foi substancialmente cumprida, com base nas evidências cruzadas identificadas',
    parcialmente_cumprido: 'avalia-se cumprimento parcial, requerendo aprofundamento das políticas públicas e maior alocação orçamentária efetiva',
    nao_cumprido: 'constata-se que a recomendação permanece sem cumprimento adequado, demandando ação governamental urgente e alocação de recursos compatíveis',
    retrocesso: 'identifica-se retrocesso em relação ao ciclo anterior, com piora de indicadores e/ou desmantelamento de políticas existentes, exigindo atenção prioritária do Comitê',
    em_andamento: 'registram-se iniciativas em andamento cujos resultados ainda não são mensuráveis no período analisado',
  };

  parts.push(`\nDiante do exposto, ${statusText[statusComputado] || statusText.nao_cumprido}.`);

  return parts.join('\n');
}

function formatBRL(val: number): string {
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)} bilhões`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(1)} milhões`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(0)} mil`;
  return val.toFixed(0);
}

function formatStatusLabel(status: string): string {
  const map: Record<string, string> = {
    cumprido: 'Cumprido',
    parcialmente_cumprido: 'Parcialmente Cumprido',
    nao_cumprido: 'Não Cumprido',
    retrocesso: 'Retrocesso',
    em_andamento: 'Em Andamento',
  };
  return map[status] || status;
}
