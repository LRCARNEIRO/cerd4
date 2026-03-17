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

export function LacunaCard({ lacuna }: LacunaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const priorityInfo = priorityConfig[lacuna.prioridade];
  const PriorityIcon = priorityInfo.icon;
  
  return (
    <div className="data-card">
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

          {/* Expandable section */}
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
