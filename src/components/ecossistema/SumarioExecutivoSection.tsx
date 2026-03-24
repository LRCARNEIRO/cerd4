import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SectionHeader } from './BaseEvidenciasSection';

const KEY_FINDINGS = [
  {
    label: 'População Negra',
    value: '55,5%',
    detail: '112,7 milhões (Censo 2022)',
    trend: 'neutral' as const,
  },
  {
    label: 'Homicídio de Negros',
    value: '77%',
    detail: 'das vítimas em 2022 (era 75,7% em 2018)',
    trend: 'down' as const,
  },
  {
    label: 'Ensino Superior Negro',
    value: '11,4%',
    detail: 'aumento de 40,7% desde 2018 (8,1%)',
    trend: 'up' as const,
  },
  {
    label: 'Renda Média Negra',
    value: 'R$ 2.392',
    detail: 'crescimento de ~49% vs 2018',
    trend: 'up' as const,
  },
  {
    label: 'Razão de Renda (B/N)',
    value: '1,68x',
    detail: 'rendimento negro ≈ 60% do branco',
    trend: 'down' as const,
  },
  {
    label: 'Feminicídio Negro',
    value: '63,6%',
    detail: 'das vítimas (era 61,0% em 2018)',
    trend: 'down' as const,
  },
];

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-[hsl(var(--success))]" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

export default function SumarioExecutivoSection() {
  return (
    <section id="sumario-executivo" className="py-14 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          number="02"
          title="Sumário Executivo Interativo"
          subtitle="Síntese dos principais achados do IV Relatório CERD — navegação dinâmica com vínculos diretos às evidências"
        />

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {KEY_FINDINGS.map((f) => (
            <Card key={f.label} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{f.label}</span>
                  <TrendIcon trend={f.trend} />
                </div>
                <p className="text-xl font-bold text-foreground tracking-tight">{f.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{f.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 border-border/60 bg-card">
          <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Leitura Guiada do Relatório CERD IV</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Navegue pelos eixos temáticos com visualizações interativas. Cada achado vincula-se
                  diretamente aos gráficos, tabelas e fontes oficiais que o sustentam.
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link to="/gerar-relatorios">
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Gerar Sumário
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
