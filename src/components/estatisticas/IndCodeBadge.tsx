/**
 * IndCodeBadge — exibe o código canônico IND-NNN ao lado do título de um
 * indicador renderizado em abas temáticas (Dados Gerais, Classe Social…).
 *
 * O código é resolvido pelo NOME exato gravado em `indicadores_interseccionais`
 * (mesma regra do Espelho Seguro). Se o indicador ainda não foi espelhado,
 * nada é exibido — nunca inventamos um código.
 */

import { Badge } from '@/components/ui/badge';
import { useStaticIndicadorCodigos, lookupCodigo } from '@/hooks/useStaticIndicadorCodigos';

interface IndCodeBadgeProps {
  /** nome exato do registro no banco */
  nome: string;
  className?: string;
  /**
   * Quando preenchido, sinaliza que este bloco é UMA das séries gravadas
   * dentro do registro canônico (não possui código próprio no banco).
   * Ex.: sub="renda" → "IND-135 · sub: renda".
   */
  sub?: string;
}

export function IndCodeBadge({ nome, className, sub }: IndCodeBadgeProps) {
  const codigos = useStaticIndicadorCodigos();
  const codigo = lookupCodigo(codigos, nome);
  if (!codigo) return null;
  return (
    <Badge
      id={sub ? undefined : `ind-${codigo}`}
      data-codigo={sub ? undefined : codigo}
      data-ind-badge="1"
      variant="outline"
      title={
        sub
          ? `Série "${sub}" gravada dentro do registro canônico ${codigo} (${nome}). Não possui código próprio na Base Estatística.`
          : `Código canônico do indicador na Base Estatística (${nome})`
      }
      className={`font-mono text-[10px] ${className || ''}`}
    >
      {sub ? `${codigo} · sub: ${sub}` : codigo}
    </Badge>
  );
}

