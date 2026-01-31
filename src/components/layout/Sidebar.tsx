import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Database,
  Users,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lightbulb,
  FileOutput
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { title: 'Painel Geral', href: '/', icon: LayoutDashboard },
  { title: 'Plano de Trabalho', href: '/plano-trabalho', icon: ClipboardList },
  { title: 'Common Core', href: '/common-core', icon: FileText },
  { title: 'Estatísticas', href: '/estatisticas', icon: BarChart3, badge: 'Interseccional' },
  { title: 'Orçamento', href: '/orcamento', icon: DollarSign },
  { title: 'Recomendações ONU', href: '/recomendacoes', icon: AlertTriangle, badge: '5' },
  { title: 'Fontes de Dados', href: '/fontes', icon: Database },
  { title: 'Grupos Focais', href: '/grupos-focais', icon: Users },
  { title: 'Conclusões', href: '/conclusoes', icon: Lightbulb, badge: 'Novo' },
  { title: 'Gerar Relatórios', href: '/gerar-relatorios', icon: FileOutput, badge: 'Novo' }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground h-screen flex flex-col transition-all duration-300 border-r border-sidebar-border',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Globe className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-semibold text-sm text-sidebar-foreground">CERD Brasil</h1>
              <p className="text-xs text-sidebar-foreground/60">IV Relatório 2018-2025</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          isActive 
                            ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground'
                            : 'bg-sidebar-primary/20 text-sidebar-primary'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  );
}
