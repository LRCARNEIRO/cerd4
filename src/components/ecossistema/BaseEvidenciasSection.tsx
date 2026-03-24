import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3, Heart, GraduationCap, Shield, Landmark,
  Users, MapPin, Briefcase, ChevronRight, Database
} from 'lucide-react';

const EIXOS = [
  { icon: Heart, label: 'Saúde', count: 42, color: 'hsl(0,65%,50%)' },
  { icon: GraduationCap, label: 'Educação', count: 58, color: 'hsl(210,85%,45%)' },
  { icon: Shield, label: 'Segurança Pública', count: 35, color: 'hsl(30,80%,50%)' },
  { icon: Briefcase, label: 'Trabalho e Renda', count: 31, color: 'hsl(145,55%,35%)' },
  { icon: Landmark, label: 'Legislação e Justiça', count: 27, color: 'hsl(260,50%,50%)' },
  { icon: MapPin, label: 'Terra e Território', count: 24, color: 'hsl(35,70%,45%)' },
  { icon: Users, label: 'Participação Social', count: 18, color: 'hsl(190,60%,40%)' },
  { icon: BarChart3, label: 'Dados e Estatísticas', count: 45, color: 'hsl(210,45%,30%)' },
];

export default function BaseEvidenciasSection() {
  return (
    <section id="base-evidencias" className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          number="01"
          title="Base de Evidências Estratégicas"
          subtitle="Repositório estruturado de indicadores, gráficos e tabelas por eixo temático da Convenção CERD"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {EIXOS.map((eixo) => {
            const Icon = eixo.icon;
            return (
              <Card key={eixo.label} className="border-border/60 hover:border-primary/30 transition-colors group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: eixo.color + '12', color: eixo.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-bold text-foreground">{eixo.count}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground mt-3 leading-snug">{eixo.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">indicadores com série histórica</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/estatisticas">
              <Database className="w-3.5 h-3.5 mr-1.5" />
              Explorar Base Completa
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
          <span className="text-[10px] text-muted-foreground">
            Desagregação por raça/cor, gênero, território e faixa etária
          </span>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-[9px] font-mono px-1.5 py-0 tracking-wider border-primary/30 text-primary">
          {number}
        </Badge>
        <Separator className="w-10" />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>
    </div>
  );
}
