import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  BarChart3,
  Database,
  FileText,
  Globe,
  ArrowRight,
  CheckCircle2,
  Layers,
  Monitor,
  BookOpen,
  Workflow,
  Shield,
  TrendingUp,
  Users,
  Target,
  Zap,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const PRODUCTS = [
  {
    id: 'smci',
    number: '01',
    name: 'Sistema de Monitoramento de Compromissos Internacionais',
    shortName: 'SMCI',
    subtitle: 'Dashboard de Monitoramento do Artigo 9º da Convenção CERD',
    icon: Monitor,
    color: 'hsl(var(--primary))',
    description:
      'Painel de Business Intelligence voltado para a diplomacia de direitos humanos. Organiza indicadores, séries históricas e evidências por eixo temático da Convenção CERD, permitindo ao MIR acompanhar, em tempo quase real, o cumprimento de compromissos assumidos junto ao sistema ONU.',
    benefits: [
      'Redução da dependência de relatórios PDF estáticos, com visualizações dinâmicas e atualizáveis pelo time técnico.',
      'Visão consolidada por ministério, programa e público-alvo, apoiando negociações interministeriais.',
      'Ferramenta pronta para ser ampliada a outros relatórios internacionais e organismos (OEA, Sistema Interamericano etc.).',
    ],
    linkTo: '/',
    linkLabel: 'Acessar Painel',
  },
  {
    id: 'evidencias',
    number: '02',
    name: 'Matriz de Evidências para Políticas de Promoção da Igualdade Racial',
    shortName: 'Base de Evidências',
    subtitle: 'Base de Evidências Estratégicas CERD IV',
    icon: Database,
    color: 'hsl(var(--accent))',
    description:
      'Reúne as bases de dados, tabelas, filtros e visualizações que sustentam o IV Relatório CERD, estruturadas para uso recorrente pelas equipes técnicas do MIR. Em vez de um acervo fechado no texto final, o MIR recebe a "cozinha dos dados" organizada para reutilização em discursos, notas técnicas e justificativas orçamentárias.',
    benefits: [
      'Reaproveitamento ágil de tabelas e indicadores em produtos como Informe MIR, apresentações e relatórios internos.',
      'Rastreabilidade metodológica: cada visualização aponta para sua fonte, período e recorte (raça/cor, gênero, território).',
      'Base preparada para expansão com novas bases administrativas federais e pesquisas acadêmicas parceiras.',
    ],
    linkTo: '/estatisticas',
    linkLabel: 'Explorar Base',
  },
  {
    id: 'sumario',
    number: '03',
    name: 'Sumário Executivo Interativo',
    shortName: 'Sumário Executivo',
    subtitle: 'Relatório de Gestão CERD: Versão Digital e Dialógica',
    icon: Layers,
    color: 'hsl(var(--warning))',
    description:
      'Porta de entrada para a alta gestão: uma versão "light", navegável e visual do Relatório CERD. Ministros, Secretários e assessorias acessam uma síntese estratégica em poucos cliques ou via QR Code, com indicadores-chave, destaques e linhas de ação recomendadas.',
    benefits: [
      'Comunicação executiva: foco em mensagens-chave, gráficos de alto nível e trilha de navegação intuitiva.',
      'Ferramenta para reuniões ministeriais, audiências públicas e apresentações internacionais.',
      'Versão sempre atualizada: ao atualizar dados no painel, o Sumário se atualiza automaticamente.',
    ],
    linkTo: '/gerar-relatorios',
    linkLabel: 'Gerar Relatório',
  },
  {
    id: 'metodologia',
    number: '04',
    name: 'Metodologia de Integração de Bases Administrativas Federais',
    shortName: 'Protocolo Metodológico',
    subtitle: 'Protocolo Metodológico de Integração de Indicadores Raciais',
    icon: Workflow,
    color: 'hsl(var(--info))',
    description:
      'Sistematiza a forma como as bases administrativas federais foram integradas, tratadas e harmonizadas para produzir o IV Relatório CERD e alimentar o painel, incluindo critérios de qualidade, vinculação e recortes de raça/cor. O método torna-se um ativo de tecnologia de gestão de dados raciais.',
    benefits: [
      'Roteiro replicável para integração de dados de Saúde, Justiça, Educação e outros ministérios.',
      'Fortalecimento da governança de dados do MIR, com clareza sobre fluxos, responsabilidades e fontes.',
      'Possibilidade de formalizar o protocolo como guia interno, curso de capacitação ou manual técnico.',
    ],
    linkTo: '/fontes',
    linkLabel: 'Ver Metodologia',
  },
];

const APPLICATIONS = [
  {
    icon: FileText,
    text: 'Apoiar Informes MIR — Monitoramento e Avaliação e outros produtos de disseminação de dados.',
  },
  {
    icon: Globe,
    text: 'Suporte à coordenação interministerial e à resposta a organismos internacionais de direitos humanos.',
  },
  {
    icon: TrendingUp,
    text: 'Defesa orçamentária com evidências: justificar programas como Juventude Negra Viva com dados sólidos.',
  },
  {
    icon: Target,
    text: 'Base para expansão do ecossistema a outros tratados e agendas estratégicas do MIR.',
  },
];

export default function Ecossistema() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded overflow-hidden">
              <img src="/favicon.png" alt="CERD Brasil" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-sm text-foreground tracking-tight">Ecossistema CERD IV</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Monitor className="w-4 h-4 mr-1.5" />
                Painel
              </Link>
            </Button>
            <Button size="sm" asChild>
              <a href="mailto:contato@cerd4.gov.br">
                Agendar Demonstração
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/60" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0djJoLTJWOGgydjZoMnYyaC00di0yaDJ2LTRoLTR2LTJoNHptLTIgMGg0djJoLTR2LTJ6bTIgMjRoMnYyaC0ydi0yem0wIDRoMnYyaC0ydi0yem0wIDRoMnYyaC0ydi0yem0wIDRoMnYyaC0ydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4 bg-white/15 text-white border-white/20 text-xs tracking-wide">
              Ministério da Igualdade Racial — Convenção CERD
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Ecossistema de Inteligência
              <br />
              <span className="text-white/80">CERD IV</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/80 leading-relaxed max-w-2xl">
              Do Relatório à Gestão em Tempo Real — monitoramento dinâmico da Convenção CERD, integração de bases administrativas federais e produtos digitais para apoiar decisões estratégicas.
            </p>

            <ul className="mt-6 space-y-2.5">
              {[
                'Transformação de um relatório internacional em um sistema contínuo de monitoramento.',
                'Ferramentas digitais para gestão, comunicação e defesa orçamentária em políticas de igualdade racial.',
                'Arquitetura pronta para ampliação a outros tratados, temas e programas estratégicos.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-white/90 text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-300 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="secondary" className="font-semibold" asChild>
                <a href="mailto:contato@cerd4.gov.br">
                  Agendar demonstração
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-medium"
                asChild
              >
                <Link to="/">
                  <Monitor className="w-4 h-4 mr-2" />
                  Acessar versão de demonstração
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT MIR IS CONTRACTING ═══ */}
      <section className="py-16 bg-muted/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-3 text-xs">O que o MIR está contratando</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Não é apenas um relatório.
              <br />
              É um <span className="text-primary">Ecossistema de Inteligência</span>.
            </h2>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Quatro produtos integrados que transformam o ciclo de prestação de contas internacionais em uma infraestrutura permanente de gestão baseada em evidências.
            </p>
          </div>

          {/* 4 product mini cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCTS.map((p) => {
              const Icon = p.icon;
              return (
                <a key={p.id} href={`#${p.id}`} className="group">
                  <Card className="h-full border-border/60 hover:border-primary/40 hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: p.color + '15', color: p.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{p.number}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {p.shortName}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.subtitle}</p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 4 PRODUCT SECTIONS ═══ */}
      {PRODUCTS.map((product, idx) => {
        const Icon = product.icon;
        const isEven = idx % 2 === 0;
        return (
          <section
            key={product.id}
            id={product.id}
            className={`py-16 ${isEven ? 'bg-background' : 'bg-muted/30'}`}
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Text */}
                <div className={isEven ? '' : 'lg:order-2'}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-mono text-muted-foreground tracking-widest">{product.number}</span>
                    <Separator className="w-8" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight tracking-tight">
                    {product.name}
                  </h2>
                  <p className="text-sm text-primary font-medium mt-1">{product.subtitle}</p>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{product.description}</p>

                  <ul className="mt-5 space-y-3">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <Button variant="outline" size="sm" className="mt-6" asChild>
                    <Link to={product.linkTo}>
                      {product.linkLabel}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                {/* Visual card */}
                <div className={isEven ? '' : 'lg:order-1'}>
                  <Card className="border-border/50 overflow-hidden">
                    <div
                      className="h-2"
                      style={{ background: `linear-gradient(90deg, ${product.color}, ${product.color}80)` }}
                    />
                    <CardContent className="p-8 flex flex-col items-center justify-center min-h-[220px] text-center">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: product.color + '12', color: product.color }}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      <h3 className="font-semibold text-foreground">{product.shortName}</h3>
                      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{product.subtitle}</p>

                      {/* Mini stats */}
                      <div className="grid grid-cols-3 gap-4 mt-6 w-full max-w-sm">
                        {idx === 0 && (
                          <>
                            <Stat label="Indicadores" value="500+" />
                            <Stat label="Ministérios" value="8" />
                            <Stat label="Atualização" value="Dinâmica" />
                          </>
                        )}
                        {idx === 1 && (
                          <>
                            <Stat label="Tabelas" value="77+" />
                            <Stat label="Fontes" value="15+" />
                            <Stat label="Recortes" value="Raça/Gênero" />
                          </>
                        )}
                        {idx === 2 && (
                          <>
                            <Stat label="KPIs" value="12" />
                            <Stat label="Eixos" value="7" />
                            <Stat label="Formato" value="Digital" />
                          </>
                        )}
                        {idx === 3 && (
                          <>
                            <Stat label="Bases" value="10+" />
                            <Stat label="Etapas" value="6" />
                            <Stat label="Replicável" value="Sim" />
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ═══ APPLICATIONS ═══ */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Aplicações práticas para o MIR
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Como o Ecossistema CERD IV se integra ao dia-a-dia das equipes técnicas e de gestão do Ministério.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {APPLICATIONS.map((app, i) => {
              const Icon = app.icon;
              return (
                <Card key={i} className="border-border/60">
                  <CardContent className="p-5 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{app.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary/95 to-accent/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0djJoLTJWOGgydjZoMnYyaC00di0yaDJ2LTRoLTR2LTJoNHptLTIgMGg0djJoLTR2LTJ6bTIgMjRoMnYyaC0ydi0yem0wIDRoMnYyaC0ydi0yem0wIDRoMnYyaC0ydi0yem0wIDRoMnYyaC0ydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Pronto para levar o CERD da lógica de relatório para a lógica de sistema?
          </h2>
          <p className="mt-3 text-white/80 text-sm leading-relaxed max-w-xl mx-auto">
            Agende uma demonstração técnica e discuta com nossa equipe como customizar o ecossistema para as necessidades específicas do MIR.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" className="font-semibold" asChild>
              <a href="mailto:contato@cerd4.gov.br">
                Agendar demonstração com a equipe técnica
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              asChild
            >
              <Link to="/">
                Acessar Painel de Demonstração
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-foreground/5 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} — Ecossistema de Inteligência CERD IV · Ministério da Igualdade Racial</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-primary transition-colors">Painel</Link>
            <a href="https://www.gov.br/igualdaderacial" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
              gov.br/igualdaderacial
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
