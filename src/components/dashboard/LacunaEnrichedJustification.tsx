import { cn } from '@/lib/utils';
import type { LacunaDiagnostic } from '@/hooks/useDiagnosticSensor';
import type { LacunaIdentificada } from '@/hooks/useLacunasData';

interface Props {
  lacuna: LacunaIdentificada;
  diagnostic?: LacunaDiagnostic;
}

function formatCurrency(val: number | null): string {
  if (!val) return 'R$ 0';
  if (val >= 1e9) return `R$ ${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `R$ ${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `R$ ${(val / 1e3).toFixed(0)}K`;
  return `R$ ${val.toFixed(0)}`;
}

function execPercent(dotacao: number | null, pago: number | null): string {
  if (!dotacao || dotacao === 0) return '—';
  return `${(((pago || 0) / dotacao) * 100).toFixed(1)}%`;
}

export function LacunaEnrichedJustification({ lacuna, diagnostic }: Props) {
  // Use status COMPUTADO como primário
  const effectiveStatus = diagnostic?.statusComputado ?? lacuna.status_cumprimento;
  const isNaoCumprido = effectiveStatus === 'nao_cumprido' || effectiveStatus === 'retrocesso';
  const isParcial = effectiveStatus === 'parcialmente_cumprido';
  const isCumprido = effectiveStatus === 'cumprido';
  const isEmAndamento = effectiveStatus === 'em_andamento';

  const hasLinkedIndicadores = diagnostic && diagnostic.linkedIndicadores.length > 0;
  const hasLinkedOrcamento = diagnostic && diagnostic.linkedOrcamento.length > 0;
  const hasLinkedNormativos = diagnostic && diagnostic.linkedNormativos.length > 0;
  const hasOwnEvidencias = lacuna.evidencias_encontradas && lacuna.evidencias_encontradas.length > 0;
  const hasOwnAcoes = lacuna.acoes_brasil && lacuna.acoes_brasil.length > 0;
  const hasOwnFontes = lacuna.fontes_dados && lacuna.fontes_dados.length > 0;

  const totalEvidences = (hasLinkedIndicadores ? diagnostic!.linkedIndicadores.length : 0) +
    (hasLinkedOrcamento ? diagnostic!.linkedOrcamento.length : 0) +
    (hasLinkedNormativos ? diagnostic!.linkedNormativos.length : 0) +
    (hasOwnEvidencias ? lacuna.evidencias_encontradas!.length : 0) +
    (hasOwnAcoes ? lacuna.acoes_brasil!.length : 0);

  // Determine border/bg based on status
  const statusStyle = isNaoCumprido
    ? 'bg-destructive/5 border-destructive/20'
    : isParcial
      ? 'bg-warning/5 border-warning/20'
      : isCumprido
        ? 'bg-success/5 border-success/20'
        : 'bg-muted/50 border-muted';

  const statusLabel = {
    cumprido: '✅ Cumprido',
    parcialmente_cumprido: '⚡ Parcialmente Cumprido',
    nao_cumprido: '⚠️ Não Cumprido',
    retrocesso: '🔴 Retrocesso',
    em_andamento: '🔄 Em Andamento',
  }[effectiveStatus];

  const headerColor = isNaoCumprido
    ? 'text-destructive'
    : isParcial
      ? 'text-warning'
      : isCumprido
        ? 'text-success'
        : 'text-muted-foreground';

  const aud = diagnostic?.auditoria;

  return (
    <div className={cn('mt-2 p-3 rounded-md border space-y-3', statusStyle)}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className={cn('text-xs font-bold', headerColor)}>
          {statusLabel} — Fundamentação Cruzada ({totalEvidences} evidências)
          {aud && <span className="font-mono ml-1 text-[10px]">[Score {aud.scoreGlobal}/100]</span>}
        </p>
      </div>

      {/* ── AUDITORIA DO SCORE ── */}
      {aud && (
        <div className="p-2 bg-card/80 rounded border border-border/50 space-y-1.5">
          <p className="text-[10px] font-bold text-foreground">🔍 Auditoria do Score (Metodologia Ponderada)</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">📊 Indicadores</p>
              <p className="text-sm font-bold">{aud.indicadores.score}<span className="text-[10px] font-normal text-muted-foreground">/100</span></p>
              <p className="text-[9px] text-muted-foreground">peso 40% • {aud.indicadores.total} ind.</p>
              <div className="flex justify-center gap-1 mt-0.5">
                {aud.indicadores.melhoram > 0 && <span className="text-[9px] text-success">↑{aud.indicadores.melhoram}</span>}
                {aud.indicadores.pioram > 0 && <span className="text-[9px] text-destructive">↓{aud.indicadores.pioram}</span>}
                {aud.indicadores.estaveis > 0 && <span className="text-[9px] text-muted-foreground">→{aud.indicadores.estaveis}</span>}
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">💰 Orçamento</p>
              <p className="text-sm font-bold">{aud.orcamento.score}<span className="text-[10px] font-normal text-muted-foreground">/100</span></p>
              <p className="text-[9px] text-muted-foreground">peso 30% • {aud.orcamento.total} ações</p>
              {aud.orcamento.total > 0 && <p className="text-[9px] text-muted-foreground">exec. {aud.orcamento.execucaoMedia}%</p>}
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground">📋 Normativos</p>
              <p className="text-sm font-bold">{aud.normativos.score}<span className="text-[10px] font-normal text-muted-foreground">/100</span></p>
              <p className="text-[9px] text-muted-foreground">peso 30% • {aud.normativos.total} docs</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-border/30">
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', aud.scoreGlobal >= 75 ? 'bg-success' : aud.scoreGlobal >= 55 ? 'bg-warning' : aud.scoreGlobal >= 35 ? 'bg-orange-400' : 'bg-destructive')}
                style={{ width: `${aud.scoreGlobal}%` }}
              />
            </div>
            <span className="text-xs font-bold">{aud.scoreGlobal}%</span>
          </div>
          <p className="text-[9px] text-muted-foreground">Faixas: ≥80 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | &lt;15 Retrocesso</p>
        </div>
      )}

      {/* ── Indicadores vinculados via artigos_convencao ──────────── */}
      {hasLinkedIndicadores && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">📊 Indicadores vinculados ({diagnostic!.linkedIndicadores.length}):</p>
          <div className="grid gap-1">
            {diagnostic!.linkedIndicadores.map((ind, i) => {
              const tendLabel = ind.tendencia === 'crescente' ? '↑' : ind.tendencia === 'decrescente' ? '↓' : ind.tendencia === 'estavel' || ind.tendencia === 'estável' ? '→' : '?';
              const tendColor = ind.tendencia === 'crescente' ? 'text-info' : ind.tendencia === 'decrescente' ? 'text-destructive' : 'text-muted-foreground';
              
              // Extract most recent value from dados
              let latestValue = '';
              if (ind.dados && typeof ind.dados === 'object') {
                const entries = Object.entries(ind.dados as Record<string, any>);
                if (entries.length > 0) {
                  // Get the last entry (most recent)
                  const lastEntry = entries[entries.length - 1];
                  const val = lastEntry[1];
                  if (typeof val === 'object' && val !== null) {
                    const subEntries = Object.entries(val);
                    if (subEntries.length <= 3) {
                      latestValue = `(${lastEntry[0]}: ${subEntries.map(([k, v]) => `${k}=${v}`).join(', ')})`;
                    } else {
                      latestValue = `(${lastEntry[0]}: ${subEntries.length} desagregações)`;
                    }
                  } else {
                    latestValue = `(${lastEntry[0]}: ${val})`;
                  }
                }
              }

              return (
                <div key={i} className="flex items-start gap-1.5 text-xs">
                  <span className={cn('font-mono', tendColor)}>{tendLabel}</span>
                  <span className="font-medium">{ind.nome}</span>
                  <span className="text-muted-foreground">— {ind.categoria}</span>
                  {latestValue && <span className="text-muted-foreground text-[10px]">{latestValue}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Orçamento vinculado ──────────────────────────────────── */}
      {hasLinkedOrcamento && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">💰 Ações orçamentárias vinculadas ({diagnostic!.linkedOrcamento.length}):</p>
          <div className="grid gap-1">
            {diagnostic!.linkedOrcamento.slice(0, 10).map((orc, i) => {
              const dotacao = Number(orc.dotacao_autorizada) || 0;
              const pago = Number(orc.pago) || 0;
              const exec = dotacao > 0 ? ((pago / dotacao) * 100) : 0;
              const execColor = exec < 5 ? 'text-destructive' : exec < 50 ? 'text-warning' : 'text-success';

              return (
                <div key={i} className="flex items-start gap-1.5 text-xs">
                  <span className={cn('font-mono', execColor)}>{execPercent(orc.dotacao_autorizada, orc.pago)}</span>
                  <span className="font-medium">{orc.programa}</span>
                  <span className="text-muted-foreground">({orc.orgao}, {orc.ano})</span>
                  <span className="text-muted-foreground">— Autorizado: {formatCurrency(orc.dotacao_autorizada)}, Pago: {formatCurrency(orc.pago)}</span>
                </div>
              );
            })}
            {diagnostic!.linkedOrcamento.length > 10 && (
              <p className="text-[10px] text-muted-foreground">… e mais {diagnostic!.linkedOrcamento.length - 10} ações</p>
            )}
          </div>
        </div>
      )}

      {/* ── Normativos vinculados ────────────────────────────────── */}
      {hasLinkedNormativos && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">📋 Marco normativo ({diagnostic!.linkedNormativos.length}):</p>
          <div className="grid gap-1">
            {diagnostic!.linkedNormativos.map((norm, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs">
                <span className="text-success">✓</span>
                <span>{norm.titulo}</span>
                <span className="text-muted-foreground text-[10px]">({norm.status})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Evidências próprias da lacuna ─────────────────────────── */}
      {hasOwnEvidencias && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">🔍 Evidências registradas:</p>
          <ul className="text-xs space-y-0.5">
            {lacuna.evidencias_encontradas!.map((ev, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-info">•</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Ações do Brasil próprias da lacuna ───────────────────── */}
      {hasOwnAcoes && (
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">🏛️ Ações governamentais registradas:</p>
          <ul className="text-xs space-y-0.5">
            {lacuna.acoes_brasil!.map((acao, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-success">•</span>
                <span>{acao}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── When no evidence at all ──────────────────────────────── */}
      {!hasLinkedIndicadores && !hasLinkedOrcamento && !hasLinkedNormativos && !hasOwnEvidencias && !hasOwnAcoes && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground italic">
            ⚠️ Nenhuma evidência cruzada encontrada no sistema. Verifique se os artigos da Convenção estão corretamente vinculados a esta lacuna.
          </p>
        </div>
      )}

      {/* ── Diagnostic signals summary ───────────────────────────── */}
      {diagnostic && diagnostic.signals.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-[10px] font-semibold text-muted-foreground mb-1">Sinais do Sensor Diagnóstico:</p>
          <ul className="text-[10px] space-y-0.5">
            {diagnostic.signals.map((s, i) => (
              <li key={i} className={cn(
                'flex items-start gap-1',
                s.severity === 'critical' ? 'text-destructive' : s.severity === 'warning' ? 'text-warning' : 'text-info'
              )}>
                <span>{s.type === 'tendencia' ? '📊' : s.type === 'orcamento_simbolico' ? '💰' : s.type === 'cobertura_normativa' ? '📋' : '⚠️'}</span>
                <span>{s.message}{s.detail ? ` — ${s.detail}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
