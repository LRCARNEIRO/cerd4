import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, ArrowRight } from 'lucide-react';

export default function EcossistemaHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[hsl(210,45%,12%)]" />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 20h40v1H0z'/%3E%3Cpath d='M20 0v40h1V0z'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="max-w-3xl">
          <Badge className="mb-4 bg-white/10 text-white/80 border-white/15 text-[10px] tracking-[0.15em] uppercase font-medium rounded-sm">
            Ministério da Igualdade Racial — Plataforma Institucional
          </Badge>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
            Ecossistema de Inteligência
            <span className="block text-white/50 mt-1">para Políticas de Igualdade Racial</span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/60 leading-relaxed max-w-2xl">
            Conjunto integrado de ferramentas de monitoramento, auditoria e gestão baseada em evidências
            para o ciclo de prestação de contas à Convenção Internacional sobre a Eliminação de Todas
            as Formas de Discriminação Racial (CERD).
          </p>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniStat value="500+" label="Indicadores Monitorados" />
            <MiniStat value="87" label="Recomendações ONU Rastreadas" />
            <MiniStat value="R$ 16,6B" label="Orçamento Analisado (2018-25)" />
            <MiniStat value="15+" label="Fontes Oficiais Integradas" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="sm" className="bg-white text-[hsl(210,45%,12%)] hover:bg-white/90 font-medium text-xs" asChild>
              <Link to="/">
                <Monitor className="w-3.5 h-3.5 mr-1.5" />
                Acessar Painel de Monitoramento
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="border-white/20 text-white/70 hover:bg-white/10 text-xs" asChild>
              <Link to="/fontes">
                Consultar Fontes e Metodologia
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded px-3 py-2.5">
      <p className="text-lg font-bold text-white tracking-tight">{value}</p>
      <p className="text-[10px] text-white/45 leading-tight mt-0.5">{label}</p>
    </div>
  );
}
