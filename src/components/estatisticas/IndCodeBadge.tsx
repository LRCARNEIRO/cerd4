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
}

export function IndCodeBadge({ nome, className }: IndCodeBadgeProps) {
  const codigos = useStaticIndicadorCodigos();
  const codigo = lookupCodigo(codigos, nome);
  if (!codigo) return null;
  return (
    <Badge
      id={`ind-${codigo}`}
      data-codigo={codigo}
      variant="outline"
      title={`Código canônico do indicador na Base Estatística (${nome})`}
      className={`font-mono text-[10px] ${className || ''}`}
    >
      {codigo}
    </Badge>
  );
}
