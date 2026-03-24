import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Gauge, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { SectionHeader } from './BaseEvidenciasSection';

const EIXOS_IEAT = [
  { eixo: 'Saúde', orcamentoVar: '+12,3%', indicadorVar: '-2,1%', eficacia: 'Crítica', color: 'destructive' as const },
  { eixo: 'Educação', orcamentoVar: '+8,7%', indicadorVar: '+40,7%', eficacia: 'Alta', color: 'success' as const },
  { eixo: 'Segurança Pública', orcamentoVar: '+5,2%', indicadorVar: '+1,7%', eficacia: 'Baixa', color: 'warning' as const },
  { eixo: 'Trabalho e Renda', orcamentoVar: '+15,1%', indicadorVar: '+49%', eficacia: 'Alta', color: 'success' as const },
];

const colorMap = {
  success: { bg: 'bg-[hsl(145,55%,32%)]/10', text: 'text-[hsl(145,55%,32%)]', bar: 'hsl(145,55%,32%)' },
  warning: { bg: 'bg-[hsl(45,93%,47%)]/10', text: 'text-[hsl(45,93%,47%)]', bar: 'hsl(45,93%,47%)' },
  destructive: { bg: 'bg-destructive/10', text: 'text-destructive', bar: 'hsl(0,72%,50%)' },
};

export default function IEATSection() {
  return (
    <section id="ieat-racial" className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          number="05"
          title="Índice de Eficácia da Agenda Transversal (IEAT-Racial)"
          subtitle="Auditoria de impacto: cruzamento da execução orçamentária da Agenda Transversal (PPA 2024-2027) com indicadores finalísticos"
        />

        <Card className="mt-8 border-border/60">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Eixo Temático</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-3">Var. Orçamento</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-3">Var. Indicador</th>
                    <th className="text-center font-medium text-muted-foreground px-4 py-3">Eficácia</th>
                    <th className="text-center font-medium text-muted-foreground px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {EIXOS_IEAT.map((e) => {
                    const c = colorMap[e.color];
                    return (
                      <tr key={e.eixo} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{e.eixo}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{e.orcamentoVar}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={e.indicadorVar.startsWith('-') ? 'text-destructive' : 'text-[hsl(145,55%,32%)]'}>
                            {e.indicadorVar}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`${c.bg} ${c.text} border-0 text-[10px]`}>
                            {e.eficacia}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {e.color === 'destructive' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive inline" />
                          ) : e.color === 'success' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-[hsl(145,55%,32%)] inline" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-[hsl(45,93%,47%)] inline" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-start gap-2 bg-muted/50 border border-border/60 rounded-lg p-3">
          <Gauge className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Lógica de Cálculo:</strong>{' '}
            IEAT = Variação % do Indicador Social ÷ Variação % do Orçamento Específico.
            Quando o orçamento cresce e o indicador social estagna ou retrocede, o sistema emite
            um "Alerta de Eficiência Crítica". Base orçamentária: Relatório de Agendas Transversais MPO 2024.
          </div>
        </div>

        <div className="mt-5">
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/orcamento">
              <Gauge className="w-3.5 h-3.5 mr-1.5" />
              Ver Módulo Orçamentário Completo
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
