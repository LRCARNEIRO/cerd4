import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AlertTriangle, BarChart3, BookOpen, DollarSign, Scale, Gavel } from 'lucide-react';

const grupos = [
  {
    titulo: 'Produto 1 · Painel de Monitoramento de Recomendações',
    itens: [
      { title: 'Recomendações', href: '/entrega/recomendacoes', icon: AlertTriangle },
      { title: 'Artigos I–VII', href: '/entrega/artigos', icon: Scale },
    ],
  },
  {
    titulo: 'Produto 3 · Base de Evidências Estratégicas',
    itens: [
      { title: 'Base Estatística', href: '/entrega/estatisticas', icon: BarChart3 },
      { title: 'Base Orçamentária', href: '/entrega/orcamento', icon: DollarSign },
      { title: 'Base Normativa', href: '/entrega/normativa', icon: Gavel },
    ],
  },
];

export function EntregaSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <aside className="h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <Link to="/entrega" onClick={onNavigate} className="p-4 border-b border-sidebar-border flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-sidebar-primary shrink-0" />
        <div>
          <p className="font-semibold text-sm text-sidebar-foreground">CERD IV · Entrega</p>
          <p className="text-xs text-sidebar-foreground/60">Ciclo 2018–2025</p>
        </div>
      </Link>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        <Link
          to="/entrega"
          onClick={onNavigate}
          className={cn('block px-3 py-2 rounded-md text-xs',
            pathname === '/entrega' ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent')}
        >
          Capa e apresentação
        </Link>
        {grupos.map(g => (
          <div key={g.titulo}>
            <p className="px-3 pb-1 text-[10px] uppercase tracking-wide text-sidebar-foreground/60">{g.titulo}</p>
            <ul className="space-y-1">
              {g.itens.map(i => {
                const Icon = i.icon;
                const active = pathname === i.href;
                return (
                  <li key={i.href}>
                    <Link
                      to={i.href}
                      onClick={onNavigate}
                      className={cn('flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-colors',
                        active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent')}
                    >
                      <Icon className="w-4 h-4" /> {i.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
