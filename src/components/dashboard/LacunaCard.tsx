import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { LacunaIdentificada, PriorityLevel, ThematicAxis, FocalGroupType } from '@/hooks/useLacunasData';
import { DiagnosticBadges } from '@/components/dashboard/DiagnosticBadges';
import type { LacunaDiagnostic } from '@/hooks/useDiagnosticSensor';

interface LacunaCardProps {
  lacuna: LacunaIdentificada;
  diagnostic?: LacunaDiagnostic;
}

const priorityConfig: Record<PriorityLevel, { icon: typeof AlertCircle; className: string; label: string }> = {
  critica: { icon: AlertCircle, className: 'text-destructive', label: 'Crítica' },
  alta: { icon: AlertTriangle, className: 'text-warning', label: 'Alta' },
  media: { icon: Info, className: 'text-info', label: 'Média' },
  baixa: { icon: MinusCircle, className: 'text-muted-foreground', label: 'Baixa' }
};

const eixoLabels: Record<ThematicAxis, string> = {
  legislacao_justica: 'Legislação',
  politicas_institucionais: 'Políticas',
  seguranca_publica: 'Segurança',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho',
  terra_territorio: 'Território',
  cultura_patrimonio: 'Cultura',
  participacao_social: 'Participação',
  dados_estatisticas: 'Dados'
};

const grupoLabels: Record<FocalGroupType, string> = {
  negros: 'Pop. Negra',
  indigenas: 'Indígenas',
  quilombolas: 'Quilombolas',
  ciganos: 'Ciganos',
  religioes_matriz_africana: 'Matriz Africana',
  juventude_negra: 'Juventude Negra',
  mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+',
  pcd_negros: 'PcD',
  idosos_negros: 'Idosos',
  geral: 'Geral'
};

export function LacunaCard({ lacuna, diagnostic }: LacunaCardProps) {
  const isNaoCumprido = lacuna.status_cumprimento === 'nao_cumprido' || lacuna.status_cumprimento === 'retrocesso';
  const [expanded, setExpanded] = useState(isNaoCumprido);
  const priorityInfo = priorityConfig[lacuna.prioridade];
  const PriorityIcon = priorityInfo.icon;

  // Build justification for "não cumprido" / "retrocesso"
  const justificativas: { icon: string; text: string; severity: 'critical' | 'warning' | 'info' }[] = [];
  if (isNaoCumprido) {
    const hasEvidencias = lacuna.evidencias_encontradas && lacuna.evidencias_encontradas.length > 0;
    const hasAcoes = lacuna.acoes_brasil && lacuna.acoes_brasil.length > 0;
    const hasFontes = lacuna.fontes_dados && lacuna.fontes_dados.length > 0;

    // Check diagnostic signals for justification
    if (diagnostic) {
      const tendenciaPiora = diagnostic.signals.find(s => s.type === 'tendencia' && s.severity === 'critical');
      if (tendenciaPiora) {
        justificativas.push({ icon: '📊', text: `Indicadores vinculados mostram tendência de piora: ${tendenciaPiora.detail || tendenciaPiora.message}`, severity: 'critical' });
      }
      const orcSimbolico = diagnostic.signals.find(s => s.type === 'orcamento_simbolico');
      if (orcSimbolico) {
        justificativas.push({ icon: '💰', text: `Orçamento simbólico detectado: ${orcSimbolico.detail || orcSimbolico.message}`, severity: 'warning' });
      }
      const semNormativa = diagnostic.signals.find(s => s.type === 'cobertura_normativa' && s.severity === 'warning');
      if (semNormativa) {
        justificativas.push({ icon: '📋', text: 'Sem cobertura normativa identificada para os artigos vinculados', severity: 'warning' });
      }
    }

    if (!hasEvidencias) {
      justificativas.push({ icon: '🔍', text: 'Nenhuma evidência quantitativa ou qualitativa encontrada que demonstre cumprimento', severity: 'critical' });
    }
    if (!hasAcoes || (lacuna.acoes_brasil && lacuna.acoes_brasil.length === 0)) {
      justificativas.push({ icon: '🚫', text: 'Nenhuma ação governamental registrada em resposta à recomendação da ONU', severity: 'critical' });
    }
    if (!hasFontes) {
      justificativas.push({ icon: '📭', text: 'Nenhuma fonte de dados oficial identificada para monitoramento', severity: 'warning' });
    }
  }

  return (
    <div className={cn('data-card', isNaoCumprido && 'border-l-4 border-l-destructive')}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', priorityInfo.className)}>
          <PriorityIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">
              §{lacuna.paragrafo}
            </span>
            <Badge variant="outline" className="text-xs">
              {eixoLabels[lacuna.eixo_tematico]}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {grupoLabels[lacuna.grupo_focal]}
            </Badge>
            <StatusBadge status={lacuna.status_cumprimento} size="sm" />
          </div>
          
          <h3 className="font-medium text-sm text-foreground">
            {lacuna.tema}
          </h3>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {lacuna.descricao_lacuna}
          </p>
          
          {/* Diagnostic Signals */}
          <DiagnosticBadges diagnostic={diagnostic} />

          {/* Justificativa "Não Cumprido" — always visible */}
          {isNaoCumprido && justificativas.length > 0 && (
            <div className="mt-2 p-2.5 bg-destructive/5 rounded-md border border-destructive/20">
              <p className="text-xs font-semibold text-destructive mb-1.5">
                ⚠️ Justificativa — {lacuna.status_cumprimento === 'retrocesso' ? 'Retrocesso' : 'Não Cumprido'}:
              </p>
              <ul className="text-xs space-y-1">
                {justificativas.map((j, i) => (
                  <li key={i} className={cn(
                    'flex items-start gap-1.5',
                    j.severity === 'critical' ? 'text-destructive' : 'text-warning'
                  )}>
                    <span>{j.icon}</span>
                    <span>{j.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interseccionalidades */}
          {lacuna.interseccionalidades && lacuna.interseccionalidades.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {lacuna.interseccionalidades.map((inter, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  {inter}
                </span>
              ))}
            </div>
          )}

          {/* Expandable section — default open */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" /> Menos detalhes
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> Mais detalhes
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3">
              {/* Texto original ONU */}
              {lacuna.texto_original_onu && (
                <div className="p-2 bg-muted/50 rounded-md border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Texto Original (ONU):</p>
                  <p className="text-xs italic">{lacuna.texto_original_onu}</p>
                </div>
              )}

              {/* Ações do Brasil */}
              {lacuna.acoes_brasil && lacuna.acoes_brasil.length > 0 && (
                <div className="p-2 bg-success/5 rounded-md border border-success/20">
                  <p className="text-xs font-medium text-success mb-1">Ações do Brasil:</p>
                  <ul className="text-xs space-y-0.5">
                    {lacuna.acoes_brasil.map((acao, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-success">•</span>
                        {acao}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidências encontradas */}
              {lacuna.evidencias_encontradas && lacuna.evidencias_encontradas.length > 0 && (
                <div className="p-2 bg-info/5 rounded-md border border-info/20">
                  <p className="text-xs font-medium text-info mb-1">Evidências:</p>
                  <ul className="text-xs space-y-0.5">
                    {lacuna.evidencias_encontradas.map((ev, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-info">•</span>
                        {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fontes de dados */}
              {lacuna.fontes_dados && lacuna.fontes_dados.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">Fontes:</span>
                  {lacuna.fontes_dados.map((fonte, i) => (
                    <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {fonte}
                    </span>
                  ))}
                </div>
              )}

              {/* Resposta sugerida para CERD IV */}
              {lacuna.resposta_sugerida_cerd_iv && (
                <div className="p-2 bg-primary/5 rounded-md border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-1">Resposta sugerida (CERD IV):</p>
                  <p className="text-xs">{lacuna.resposta_sugerida_cerd_iv}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
