import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { LacunaIdentificada, PriorityLevel, ThematicAxis, FocalGroupType } from '@/hooks/useLacunasData';
import { DiagnosticBadges } from '@/components/dashboard/DiagnosticBadges';
import { LacunaEnrichedJustification } from '@/components/dashboard/LacunaEnrichedJustification';
import type { LacunaDiagnostic } from '@/hooks/useDiagnosticSensor';
import { generateSuggestedResponse } from '@/utils/generateSuggestedResponse';
import { useMemo } from 'react';
import { classificarOrigemLacuna, ORIGEM_CONFIG } from '@/utils/classificarOrigemLacuna';

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
  // Status COMPUTADO é o primário; fallback para manual se sensor não disponível
  const effectiveStatus = diagnostic?.statusComputado ?? lacuna.status_cumprimento;
  const manualStatus = lacuna.status_cumprimento;
  const isDivergent = diagnostic?.divergente ?? false;
  const isNaoCumprido = effectiveStatus === 'nao_cumprido' || effectiveStatus === 'retrocesso';
  const isParcial = effectiveStatus === 'parcialmente_cumprido';
  const [expanded, setExpanded] = useState(true);
  const priorityInfo = priorityConfig[lacuna.prioridade];
  const PriorityIcon = priorityInfo.icon;

  const dynamicResponse = useMemo(
    () => generateSuggestedResponse(lacuna, diagnostic),
    [lacuna, diagnostic]
  );
  const respostaCerdIV = lacuna.resposta_sugerida_cerd_iv || dynamicResponse;

  const origem = classificarOrigemLacuna(lacuna.paragrafo);
  const origemCfg = ORIGEM_CONFIG[origem];

  return (
    <div className={cn('data-card', isNaoCumprido && 'border-l-4 border-l-destructive', isParcial && 'border-l-4 border-l-warning')}>
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', priorityInfo.className)}>
          <PriorityIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {origem !== 'cerd' && (
              <Badge variant="outline" className={cn('text-xs border', origemCfg.cor)}>
                {origemCfg.labelCurto}
              </Badge>
            )}
            <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">
              {origem === 'cerd' ? '§' : ''}{lacuna.paragrafo}
            </span>
            <Badge variant="outline" className="text-xs">
              {eixoLabels[lacuna.eixo_tematico]}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {grupoLabels[lacuna.grupo_focal]}
            </Badge>
            <StatusBadge status={effectiveStatus} size="sm" />
            {diagnostic?.auditoria && (
              <Badge variant="outline" className="text-[10px] font-mono bg-primary/5 border-primary/30 text-primary">
                Score: {diagnostic.auditoria.scoreGlobal}/100
              </Badge>
            )}
            {isDivergent && (
              <Badge variant="outline" className="text-[10px] border-warning/30 text-warning">
                manual: {manualStatus === 'cumprido' ? 'Cumprido' : manualStatus === 'parcialmente_cumprido' ? 'Parcial' : manualStatus === 'nao_cumprido' ? 'Não Cumprido' : manualStatus === 'retrocesso' ? 'Retrocesso' : 'Em Andamento'}
              </Badge>
            )}
          </div>
          
          <h3 className="font-medium text-sm text-foreground">
            {lacuna.tema}
          </h3>
          
          <p className="text-xs text-muted-foreground mt-1">
            {lacuna.descricao_lacuna}
          </p>
          
          {/* Diagnostic Signals */}
          <DiagnosticBadges diagnostic={diagnostic} />

          {/* Enriched Justification — for ALL statuses */}
          <LacunaEnrichedJustification lacuna={lacuna} diagnostic={diagnostic} />

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
              <div className="p-2 bg-muted/50 rounded-md border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Texto Original (ONU):</p>
                <p className="text-xs italic">{lacuna.texto_original_onu || <span className="text-muted-foreground">Texto original não disponível no banco de dados</span>}</p>
              </div>

              {/* Resposta sugerida para CERD IV */}
              <div className="p-2 bg-primary/5 rounded-md border border-primary/20">
                <p className="text-xs font-medium text-primary mb-1">
                  Resposta sugerida (CERD IV):
                  {!lacuna.resposta_sugerida_cerd_iv && dynamicResponse && (
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">— gerada automaticamente a partir das evidências cruzadas</span>
                  )}
                </p>
                {respostaCerdIV ? (
                  <p className="text-xs whitespace-pre-line">{respostaCerdIV}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Sem evidências cruzadas suficientes para gerar resposta automática</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
