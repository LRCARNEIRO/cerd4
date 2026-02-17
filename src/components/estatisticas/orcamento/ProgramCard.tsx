import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, Calendar, ExternalLink, Users, EyeOff, Info } from 'lucide-react';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

interface ProgramCardProps {
  programa: string;
  registros: DadoOrcamentario[];
  excluded?: boolean;
  exclusionReason?: string;
}

function extractCode(programa: string): string | null {
  const match = programa.match(/\((\d+)\)$/);
  return match ? match[1] : null;
}

function extractName(programa: string): string {
  return programa.replace(/\s*\(\d+\)$/, '').trim();
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
  return formatCurrency(value);
};

export function ProgramCard({ programa, registros, excluded = false, exclusionReason }: ProgramCardProps) {
  const [expanded, setExpanded] = useState(false);

  const code = extractCode(programa);
  const name = extractName(programa);
  const orgao = registros[0]?.orgao;
  const descritivo = registros[0]?.descritivo;

  // Deduplicate by year: keep the record with most data per year
  const byYear = new Map<number, DadoOrcamentario>();
  for (const r of registros) {
    const existing = byYear.get(r.ano);
    if (!existing || (r.pago && (!existing.pago || r.pago > existing.pago))) {
      byYear.set(r.ano, r);
    }
  }
  const sorted = Array.from(byYear.values()).sort((a, b) => a.ano - b.ano);

  const firstYear = sorted[0]?.ano;
  const latestRecord = sorted[sorted.length - 1];
  const latestValue = latestRecord?.pago || latestRecord?.dotacao_autorizada || 0;
  const fonte = registros[0]?.fonte_dados;
  const urlFonte = registros[0]?.url_fonte;

  return (
    <Card className={`overflow-hidden ${excluded ? 'opacity-60 border-dashed border-muted-foreground/30' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {excluded && <EyeOff className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
            <span className={`font-semibold text-sm ${excluded ? 'text-muted-foreground' : ''}`}>{name}</span>
            {code && (
              <Badge variant="secondary" className="text-xs font-mono">
                {code}
              </Badge>
            )}
            {excluded && (
              <Badge variant="outline" className="text-xs border-warning text-warning">
                Excluído do cálculo
              </Badge>
            )}
          </div>
          {excluded && exclusionReason && (
            <p className="text-[10px] text-warning mt-0.5">{exclusionReason}</p>
          )}
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {orgao && (
              <>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {orgao}
                </span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Início: {firstYear}
            </span>
            <span>•</span>
            <span>{latestRecord?.ano}: {formatCompact(latestValue)}</span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />}
      </button>

      {expanded && (
        <CardContent className="pt-0 border-t">
          {/* Metadados descritivos */}
          {descritivo && (
            <div className="mt-3 mb-4 space-y-2 bg-muted/40 rounded-md p-3 text-xs">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <span className="font-semibold text-foreground">Descritivo: </span>
                  <span className="text-muted-foreground">{descritivo}</span>
                </div>
              </div>
            </div>
          )}

          {/* Evolução ano a ano */}
          <div className="overflow-x-auto mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Ano</TableHead>
                  <TableHead className="text-xs text-right">Dotação Autorizada</TableHead>
                  <TableHead className="text-xs text-right">Empenhado</TableHead>
                  <TableHead className="text-xs text-right">Liquidado</TableHead>
                  <TableHead className="text-xs text-right">Pago</TableHead>
                  <TableHead className="text-xs text-right">Exec. (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map(r => (
                  <TableRow key={r.ano}>
                    <TableCell className="text-xs font-medium">{r.ano}</TableCell>
                    <TableCell className="text-xs text-right">
                      {r.dotacao_autorizada ? formatCompact(r.dotacao_autorizada) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {r.empenhado ? formatCompact(r.empenhado) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {r.liquidado ? formatCompact(r.liquidado) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-right font-medium">
                      {r.pago ? formatCompact(r.pago) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      {r.percentual_execucao ? (
                        <Badge
                          variant="outline"
                          className={
                            r.percentual_execucao >= 80 ? 'border-success text-success' :
                            r.percentual_execucao >= 50 ? 'border-warning text-warning' :
                            'border-destructive text-destructive'
                          }
                        >
                          {r.percentual_execucao.toFixed(0)}%
                        </Badge>
                      ) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Fonte */}
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span>Fonte:</span>
            {urlFonte ? (
              <a
                href={urlFonte}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {fonte} <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span>{fonte}</span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
