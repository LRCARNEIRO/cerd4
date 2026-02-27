import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { isDocumentoBalizador, getFontesNaoBalizadoras } from '@/utils/artigosConvencao';

interface BalizadorValidationProps {
  /** Siglas dos documentos-fonte utilizados */
  fontesDocumento: string[];
  /** Se true, mostra apenas o ícone sem texto */
  compact?: boolean;
}

/**
 * Componente de validação da Regra de Ouro Normativa.
 * Exibe alerta quando fontes não-balizadoras são detectadas.
 */
export function BalizadorValidation({ fontesDocumento, compact }: BalizadorValidationProps) {
  const invalidas = getFontesNaoBalizadoras(fontesDocumento);
  
  if (invalidas.length === 0) {
    return compact ? null : (
      <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
        <ShieldAlert className="w-3 h-3 mr-1" />
        Fonte balizadora ✓
      </Badge>
    );
  }

  return (
    <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/30">
      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
      <div className="text-xs">
        <p className="font-medium text-destructive">
          Bloqueio: Fonte não-balizadora
        </p>
        <p className="text-muted-foreground mt-0.5">
          {invalidas.map(s => `"${s}"`).join(', ')} não consta{invalidas.length > 1 ? 'm' : ''} entre
          os 20 Documentos Balizadores. Recomendações derivadas de fontes externas são bloqueadas.
        </p>
      </div>
    </div>
  );
}

/**
 * Hook de validação para uso em formulários.
 * Retorna true se TODAS as fontes são balizadoras.
 */
export function validateFontesBalizadoras(fontes: string[]): {
  valido: boolean;
  invalidas: string[];
} {
  const invalidas = getFontesNaoBalizadoras(fontes);
  return { valido: invalidas.length === 0, invalidas };
}
