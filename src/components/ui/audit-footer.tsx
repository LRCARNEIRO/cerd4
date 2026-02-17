import { ExternalLink, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface AuditSource {
  nome: string;
  url: string;
}

interface AuditFooterProps {
  /** Sources with name + URL */
  fontes: AuditSource[];
  /** Optional normative document badges (e.g., "CERD 2022", "Plano de Durban") */
  documentos?: string[];
  /** Optional compact mode for summary cards */
  compact?: boolean;
}

/**
 * Reusable audit block for charts, cards, and infographics.
 * Renders source links and optional document badges below visualizations.
 */
export function AuditFooter({ fontes, documentos, compact = false }: AuditFooterProps) {
  if (fontes.length === 0 && (!documentos || documentos.length === 0)) return null;

  return (
    <div className={`border-t border-border/50 space-y-1 ${compact ? 'mt-2 pt-1.5' : 'mt-3 pt-2'}`}>
      {fontes.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
            <FileText className="w-3 h-3" /> <strong>Fonte{fontes.length > 1 ? 's' : ''}:</strong>
          </span>
          {fontes.map((f, i) => (
            <a
              key={i}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
            >
              <ExternalLink className="w-2.5 h-2.5 shrink-0" /> {f.nome}
            </a>
          ))}
        </div>
      )}
      {documentos && documentos.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground shrink-0">Ref.:</span>
          {documentos.map((doc, i) => (
            <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0">
              {doc}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
