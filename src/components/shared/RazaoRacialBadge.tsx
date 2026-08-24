/**
 * Selo único de razão racial (Negros ÷ Brancos).
 *
 * Espelha exatamente a leitura do Espelho Seguro (BD): a polaridade vem da
 * SSoT `indicadorPolaridade.ts` — nenhum número é recalculado ou inventado,
 * apenas o veredito/cor/legenda são derivados de valor ÷ referência.
 */
import { cn } from '@/lib/utils';
import { isLowerBetterNome } from '@/utils/indicadorPolaridade';

export function razaoVerdict(
  razao: number | null,
  nome: string,
  categoria?: string,
): { text: string; color: string; sufixo: string } {
  if (razao === null || !Number.isFinite(razao)) {
    return { text: 'Sem comparação', color: 'text-muted-foreground', sufixo: '' };
  }
  const lowerBetter = isLowerBetterNome(nome, categoria);
  if (lowerBetter) {
    if (razao > 2) return { text: 'Disparidade crítica — negros duplamente expostos', color: 'text-destructive font-black', sufixo: 'mais expostos (pior)' };
    if (razao > 1.3) return { text: 'Negros significativamente mais afetados', color: 'text-destructive font-bold', sufixo: 'mais expostos (pior)' };
    if (razao > 1.05) return { text: 'Negros moderadamente mais afetados', color: 'text-chart-4 font-semibold', sufixo: 'mais expostos (pior)' };
    if (razao < 0.95) return { text: 'Brancos mais afetados neste indicador', color: 'text-muted-foreground', sufixo: 'exposição' };
    return { text: 'Paridade aproximada', color: 'text-success', sufixo: 'exposição' };
  }
  if (razao < 0.5) return { text: 'Disparidade crítica — acesso negro ≤50%', color: 'text-destructive font-black', sufixo: 'de acesso (pior)' };
  if (razao < 0.75) return { text: 'Déficit significativo para negros', color: 'text-destructive font-bold', sufixo: 'de acesso (pior)' };
  if (razao < 0.95) return { text: 'Negros em desvantagem moderada', color: 'text-chart-4 font-semibold', sufixo: 'de acesso (pior)' };
  if (razao > 1.3) return { text: 'Negros à frente neste indicador', color: 'text-primary', sufixo: 'de acesso' };
  return { text: 'Paridade aproximada', color: 'text-success', sufixo: 'de acesso' };
}

interface Props {
  /** Nome do indicador — usado pela SSoT de polaridade */
  nome: string;
  categoria?: string;
  /** Valor do grupo negro (pretos+pardos) */
  valor: number | null | undefined;
  /** Valor de referência (brancos / não negros / nacional) */
  referencia: number | null | undefined;
  decimals?: number;
  /** Exibe apenas o multiplicador, sem o sufixo textual */
  compact?: boolean;
  className?: string;
}

export function RazaoRacialBadge({ nome, categoria, valor, referencia, decimals = 2, compact, className }: Props) {
  if (valor == null || referencia == null || !Number.isFinite(valor) || !Number.isFinite(referencia) || referencia === 0) {
    return <span className={cn('text-muted-foreground', className)}>—</span>;
  }
  const razao = valor / referencia;
  const v = razaoVerdict(razao, nome, categoria);
  return (
    <span className={cn(v.color, className)} title={v.text}>
      {razao.toFixed(decimals).replace('.', ',')}×{compact ? '' : ` ${v.sufixo}`}
    </span>
  );
}
