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
  ChevronDown,
  Globe,
  Lightbulb,
  FileOutput,
  BookOpen,
  Scale,
  Upload,
  FolderOpen,
  Settings,
  FlaskConical,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
}

// Estrutura reorganizada conforme solicitado
const navSections: NavSection[] = [
  {
    title: 'Acompanhamento Gerencial',
    icon: Settings,
    defaultOpen: true,
    items: [
      { title: 'Painel Geral', href: '/', icon: LayoutDashboard },
      { title: 'Plano de Trabalho', href: '/plano-trabalho', icon: ClipboardList },
      { title: 'Common Core (77)', href: '/common-core', icon: BookOpen, badge: '77' },
      { title: 'Recomendações', href: '/recomendacoes', icon: AlertTriangle },
      { title: 'Documentos Balizadores', href: '/documentos-balizadores', icon: FileText },
      { title: 'Fontes de Dados', href: '/fontes', icon: Database },
    ]
  },
  {
    title: 'Escopo do Projeto',
    icon: FolderOpen,
    defaultOpen: true,
    items: []
  }
];

// Sub-seções do Escopo do Projeto
const escopoSubsections: NavSection[] = [
  {
    title: 'Base Estatística (Meta 3)',
    icon: BarChart3,
    defaultOpen: false,
    items: [
      { title: 'Estatísticas Gerais', href: '/estatisticas', icon: BarChart3 },
    ]
  },
  {
    title: 'Base Orçamentária (Meta 3)',
    icon: DollarSign,
    defaultOpen: false,
    items: [
      { title: 'Orçamento', href: '/orcamento', icon: DollarSign },
      { title: 'Guia de Auditoria', href: '/guia-auditoria', icon: ClipboardCheck },
    ]
  },
  {
    title: 'Base Normativa (Meta 1-2)',
    icon: Scale,
    defaultOpen: false,
    items: [
      { title: 'Normativa/Institucional', href: '/normativa', icon: Scale, badge: 'Novo' },
    ]
  },
  {
    title: 'Produtos',
    icon: FileOutput,
    defaultOpen: false,
    items: [
      { title: 'Conclusões', href: '/conclusoes', icon: Lightbulb },
      { title: 'Gerar Relatórios', href: '/gerar-relatorios', icon: FileOutput },
      { title: 'Ecossistema MIR', href: '/ecossistema', icon: Globe, badge: 'Novo' },
    ]
  }
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Acompanhamento Gerencial': true,
    'Escopo do Projeto': true,
    'Base Estatística (Meta 3)': false,
    'Base Orçamentária (Meta 3)': false,
    'Base Normativa (Meta 1-2)': false,
    'Produtos': false,
  });
  const location = useLocation();

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    
    return (
      <li key={item.href}>
        <Link
          to={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm',
            isActive
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-xs">{item.title}</span>
              {item.badge && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
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
  };

  const renderSection = (section: NavSection, isSubsection = false) => {
    const Icon = section.icon;
    const isOpen = openSections[section.title];

    return (
      <Collapsible
        key={section.title}
        open={isOpen}
        onOpenChange={() => toggleSection(section.title)}
      >
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium',
              'text-sidebar-foreground hover:bg-sidebar-accent/50',
              isSubsection && 'pl-5 text-xs'
            )}
          >
            <Icon className={cn('flex-shrink-0', isSubsection ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{section.title}</span>
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  isOpen && 'rotate-180'
                )} />
              </>
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className={cn('space-y-0.5 mt-1', isSubsection ? 'ml-3' : 'ml-2')}>
            {section.items.map(renderNavItem)}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <aside
      className={cn(
        'bg-sidebar text-sidebar-foreground h-screen flex flex-col transition-all duration-300 border-r border-sidebar-border',
        collapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden">
            <img src="/favicon.png" alt="CERD Brasil" className="w-full h-full object-cover" />
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
      <nav className="flex-1 py-3 overflow-y-auto">
        <div className="space-y-2 px-2">
          {/* Acompanhamento Gerencial */}
          {renderSection(navSections[0])}

          {/* Escopo do Projeto - Seção principal */}
          <Collapsible
            open={openSections['Escopo do Projeto']}
            onOpenChange={() => toggleSection('Escopo do Projeto')}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50">
                <FolderOpen className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">Escopo do Projeto</span>
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform',
                      openSections['Escopo do Projeto'] && 'rotate-180'
                    )} />
                  </>
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-1 mt-1 ml-2">
                {escopoSubsections.map(subsection => renderSection(subsection, true))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
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
