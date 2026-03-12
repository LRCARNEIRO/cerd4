import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell
} from 'recharts';
import {
  segurancaPublica, feminicidioSerie, educacaoSerieHistorica, saudeSerieHistorica,
  indicadoresSocioeconomicos, evolucaoDesigualdade,
  violenciaInterseccional, classePorRaca
} from '@/components/estatisticas/StatisticsData';

const COLORS = {
  destructive: 'hsl(var(--destructive))',
  success: 'hsl(var(--chart-2))',
  warning: 'hsl(var(--chart-4))',
  primary: 'hsl(var(--primary))',
  accent: 'hsl(var(--chart-3))',
  muted: 'hsl(var(--muted-foreground))',
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

// ====== BLOCO DE AUDITORIA REUTILIZÁVEL ======
interface SourceLink {
  label: string;
  url: string;
  detail?: string;
}

function AuditSourceBlock({ sources, className = '' }: { sources: SourceLink[]; className?: string }) {
  return (
    <div className={`mt-2 p-2 bg-muted/30 border border-border/50 rounded-md ${className}`}>
      <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
        <ExternalLink className="w-3 h-3" /> Fontes para auditoria:
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {sources.map((s, i) => (
          <a
            key={i}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
            title={s.detail || s.label}
          >
            {s.label} <ExternalLink className="w-2.5 h-2.5 inline" />
          </a>
        ))}
      </div>
    </div>
  );
}

// Deep link sources by theme
const SOURCES = {
  seguranca: [
    { label: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-de-seguranca-publica/', detail: 'Dados de letalidade policial e homicídios por raça (2024)' },
    { label: 'Atlas da Violência 2025 (IPEA)', url: 'https://www.ipea.gov.br/atlasviolencia/', detail: 'Taxas de homicídio por raça/100 mil hab' },
    { label: 'Repositório FBSP', url: 'https://forumseguranca.org.br/estatisticas/painel-de-dados/', detail: 'Painel interativo de dados — séries históricas' },
  ] as SourceLink[],
  feminicidio: [
    { label: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-de-seguranca-publica/', detail: 'Feminicídios por raça — série 2018-2024' },
    { label: 'Agência Brasil (FBSP 2025)', url: 'https://agenciabrasil.ebc.com.br/geral/noticia/2025-07/brasil-registra-recorde-de-feminicidios-em-2024', detail: '1.492 feminicídios em 2024 — recorde histórico' },
    { label: 'SINPAF (Anuário 2025)', url: 'https://sinpaf.org.br/violencia-mulher-anuario-2025/', detail: '63,6% das vítimas são mulheres negras' },
  ] as SourceLink[],
  educacao: [
    { label: 'SIDRA 7129 — Ensino Superior por raça', url: 'https://sidra.ibge.gov.br/Tabela/7129', detail: 'PNAD Contínua Educação — Ensino superior completo por cor/raça' },
    { label: 'SIDRA 7125 — Analfabetismo por raça', url: 'https://sidra.ibge.gov.br/Tabela/7125', detail: 'PNAD Contínua Educação — Taxa de analfabetismo por cor/raça' },
    { label: 'IBGE — PNAD Educação 2024', url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/17270-pnad-continua.html', detail: 'Publicação oficial da PNAD Contínua Educação' },
  ] as SourceLink[],
  saude: [
    { label: 'DataSUS/SIM — Mortalidade Materna', url: 'http://tabnet.datasus.gov.br/cgi/tabcgi.exe?sim/cnv/mat10uf.def', detail: 'Sistema de Informações sobre Mortalidade — óbitos maternos por raça' },
    { label: 'DataSUS/SINASC — Nascidos Vivos', url: 'http://tabnet.datasus.gov.br/cgi/tabcgi.exe?sinasc/cnv/nvuf.def', detail: 'Sistema de Informações sobre Nascidos Vivos (denominador RMM)' },
    { label: 'Pesquisa Nascer no Brasil II', url: 'https://www.gov.br/saude/pt-br/assuntos/noticias/2023/novembro/morte-de-maes-negras-e-duas-vezes-maior-que-de-brancas-aponta-pesquisa', detail: 'Fiocruz/MS Nov/2023 — mortalidade materna por raça' },
  ] as SourceLink[],
  renda: [
    { label: 'SIDRA 6405 — Rendimento por raça', url: 'https://sidra.ibge.gov.br/tabela/6405', detail: 'PNAD Contínua — Rendimento médio mensal por cor/raça' },
    { label: 'DIEESE — Boletim Racial Q2/2024', url: 'https://www.dieese.org.br/boletimespecial/2024/boletimEspecial01.html', detail: 'Rendimento e desemprego por raça — 2º trimestre 2024' },
    { label: 'Censo 2022 — Rendimentos', url: 'https://sidra.ibge.gov.br/Tabela/9605', detail: 'Rendimento médio por cor/raça — Censo Demográfico 2022' },
  ] as SourceLink[],
  desigualdade: [
    { label: 'SIDRA 6405 — Renda por raça', url: 'https://sidra.ibge.gov.br/tabela/6405', detail: 'Razão de renda branca/negra' },
    { label: 'PNAD Contínua — Desocupação', url: 'https://sidra.ibge.gov.br/Tabela/6402', detail: 'Taxa de desocupação por cor/raça' },
    { label: 'Atlas da Violência 2025', url: 'https://www.ipea.gov.br/atlasviolencia/', detail: 'Razão de homicídio negro/não negro' },
    { label: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-de-seguranca-publica/', detail: 'Letalidade policial e vítimas por raça' },
  ] as SourceLink[],
  violenciaInterseccional: [
    { label: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-de-seguranca-publica/', detail: 'Violência contra mulheres negras — feminicídio, estupro, lesão corporal' },
    { label: 'Atlas da Violência 2025', url: 'https://www.ipea.gov.br/atlasviolencia/', detail: 'Homicídios femininos por raça' },
  ] as SourceLink[],
  radar: [] as SourceLink[],
  classe: [
    { label: 'SIS/IBGE 2024', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html', detail: 'Síntese de Indicadores Sociais 2024 — pobreza por raça' },
    { label: 'Banco Mundial — Linhas de Pobreza', url: 'https://www.worldbank.org/en/topic/poverty', detail: 'Definição das linhas de pobreza US$ 2,15/6,85/dia' },
  ] as SourceLink[],
  trabalho: [
    { label: 'DIEESE — Boletim Racial 2024', url: 'https://www.dieese.org.br/boletimespecial/2024/boletimEspecial01.html', detail: 'Rendimento e emprego por raça e gênero — Q2 2024' },
    { label: 'SIDRA 6402 — Desocupação', url: 'https://sidra.ibge.gov.br/Tabela/6402', detail: 'Taxa de desocupação por cor/raça e sexo' },
  ] as SourceLink[],
};

// ============== SEGURANÇA PÚBLICA ==============
export function ViolenciaRacialChart() {
  const dado2018 = segurancaPublica[0];
  const dado2024 = segurancaPublica[segurancaPublica.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          Violência Racial: Evolução 2018→2024
        </CardTitle>
        <CardDescription className="text-xs">
          Fontes: 19º Anuário FBSP 2025 / Atlas da Violência 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-destructive/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Vítimas negras homicídio</p>
            <p className="text-sm font-bold text-destructive">{dado2018.percentualVitimasNegras}% → {dado2024.percentualVitimasNegras}%</p>
            <Badge variant="destructive" className="text-xs mt-1">+{(dado2024.percentualVitimasNegras - dado2018.percentualVitimasNegras).toFixed(1)}pp</Badge>
          </div>
          <div className="text-center p-2 bg-destructive/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Letalidade policial negra</p>
            <p className="text-sm font-bold text-destructive">{dado2018.letalidadePolicial}% → {dado2024.letalidadePolicial}%</p>
            <Badge variant="destructive" className="text-xs mt-1">+{(dado2024.letalidadePolicial - dado2018.letalidadePolicial).toFixed(1)}pp</Badge>
          </div>
          <div className="text-center p-2 bg-destructive/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Risco homicídio negro</p>
            <p className="text-sm font-bold text-destructive">{dado2018.razaoRisco}x → {dado2024.razaoRisco}x</p>
            <Badge variant="outline" className="text-xs mt-1">Persistente</Badge>
          </div>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={segurancaPublica} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[60, 90]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="percentualVitimasNegras" name="% Vítimas negras" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="letalidadePolicial" name="% Letalidade policial" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <AuditSourceBlock sources={SOURCES.seguranca} />
      </CardContent>
    </Card>
  );
}

// ============== FEMINICÍDIO ==============
export function FeminicidioChart() {
  const dado2018 = feminicidioSerie[0];
  const dado2024 = feminicidioSerie[feminicidioSerie.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Feminicídio por Raça: 2018→2024</CardTitle>
        <CardDescription className="text-xs">
          Fonte: 19º Anuário FBSP 2025 (dados 2024) — {dado2018.percentualNegras}% → {dado2024.percentualNegras}% mulheres negras
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-destructive/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Mulheres negras vítimas</p>
            <p className="text-lg font-bold text-destructive">{dado2024.percentualNegras}%</p>
            <p className="text-xs text-muted-foreground">2018: {dado2018.percentualNegras}% (+{(dado2024.percentualNegras - dado2018.percentualNegras).toFixed(1)}pp)</p>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Total feminicídios 2024</p>
            <p className="text-lg font-bold">{dado2024.totalFeminicidios.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">2018: {dado2018.totalFeminicidios.toLocaleString('pt-BR')} (+{((dado2024.totalFeminicidios/dado2018.totalFeminicidios - 1)*100).toFixed(0)}%)</p>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feminicidioSerie} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[55, 70]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="percentualNegras" name="% Mulheres negras" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <AuditSourceBlock sources={SOURCES.feminicidio} />
      </CardContent>
    </Card>
  );
}

// ============== EDUCAÇÃO ==============
export function EducacaoComparativaChart() {
  const dado2018 = educacaoSerieHistorica[0];
  const dado2024 = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Educação: Ensino Superior por Raça 2018→2024</CardTitle>
        <CardDescription className="text-xs">
          Fonte: PNAD Contínua Educação 2024 — Negro: {dado2018.superiorNegroPercent}% → {dado2024.superiorNegroPercent}% | Branco: {dado2018.superiorBrancoPercent}% → {dado2024.superiorBrancoPercent}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-success/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Superior completo (negro)</p>
            <p className="text-lg font-bold text-success">{dado2024.superiorNegroPercent}%</p>
            <p className="text-xs text-muted-foreground">2018: {dado2018.superiorNegroPercent}% (+{(dado2024.superiorNegroPercent - dado2018.superiorNegroPercent).toFixed(1)}pp)</p>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Razão branco/negro</p>
            <p className="text-lg font-bold">{(dado2024.superiorBrancoPercent / dado2024.superiorNegroPercent).toFixed(1)}x</p>
            <p className="text-xs text-muted-foreground">2018: {(dado2018.superiorBrancoPercent / dado2018.superiorNegroPercent).toFixed(1)}x (melhoria)</p>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={educacaoSerieHistorica} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="superiorNegroPercent" name="Negro (%)" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="superiorBrancoPercent" name="Branco (%)" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <AuditSourceBlock sources={SOURCES.educacao} />
      </CardContent>
    </Card>
  );
}

// ============== SAÚDE ==============
export function SaudeComparativaChart() {
  const dado2018 = saudeSerieHistorica[0];
  const dado2024 = saudeSerieHistorica[saudeSerieHistorica.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Saúde: Mortalidade Materna por Raça 2018→2024</CardTitle>
        <CardDescription className="text-xs">
          Fonte: DataSUS/SIM — Negra: {dado2018.mortalidadeMaternaNegra} → {dado2024.mortalidadeMaternaNegra} por 100 mil NV | Branca: {dado2018.mortalidadeMaternaBranca} → {dado2024.mortalidadeMaternaBranca}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-2 bg-warning/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Razão mortalidade negra/branca</p>
            <p className="text-lg font-bold text-warning">{(dado2024.mortalidadeMaternaNegra / dado2024.mortalidadeMaternaBranca).toFixed(1)}x</p>
            <p className="text-xs text-muted-foreground">2018: {(dado2018.mortalidadeMaternaNegra / dado2018.mortalidadeMaternaBranca).toFixed(1)}x</p>
          </div>
          <div className="text-center p-2 bg-success/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Redução mortalidade negra</p>
            <p className="text-lg font-bold text-success">-{((1 - dado2024.mortalidadeMaternaNegra/dado2018.mortalidadeMaternaNegra)*100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">{dado2018.mortalidadeMaternaNegra} → {dado2024.mortalidadeMaternaNegra}</p>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={saudeSerieHistorica} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="mortalidadeMaternaNegra" name="Negra" stroke="hsl(var(--destructive))" strokeWidth={2} />
              <Line type="monotone" dataKey="mortalidadeMaternaBranca" name="Branca" stroke="hsl(var(--muted-foreground))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <AuditSourceBlock sources={SOURCES.saude} />
      </CardContent>
    </Card>
  );
}

// ============== DESIGUALDADE DE RENDA ==============
export function RendaComparativaChart() {
  const dado2018 = indicadoresSocioeconomicos[0];
  const dado2024 = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Renda Média Mensal por Raça: 2018→2024</CardTitle>
        <CardDescription className="text-xs">
          Fonte: PNAD Contínua (SIDRA 6800) — Razão renda negra/branca: {(dado2018.rendaMediaNegra/dado2018.rendaMediaBranca*100).toFixed(0)}% → {(dado2024.rendaMediaNegra/dado2024.rendaMediaBranca*100).toFixed(0)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 bg-primary/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Renda negra 2024</p>
            <p className="text-sm font-bold">R$ {dado2024.rendaMediaNegra.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-success">+{((dado2024.rendaMediaNegra/dado2018.rendaMediaNegra - 1)*100).toFixed(0)}% vs 2018</p>
          </div>
          <div className="text-center p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">Renda branca 2024</p>
            <p className="text-sm font-bold">R$ {dado2024.rendaMediaBranca.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">+{((dado2024.rendaMediaBranca/dado2018.rendaMediaBranca - 1)*100).toFixed(0)}% vs 2018</p>
          </div>
          <div className="text-center p-2 bg-warning/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Gap absoluto</p>
            <p className="text-sm font-bold text-warning">R$ {(dado2024.rendaMediaBranca - dado2024.rendaMediaNegra).toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">2018: R$ {(dado2018.rendaMediaBranca - dado2018.rendaMediaNegra).toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={indicadoresSocioeconomicos} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `R$${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR')}`} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="rendaMediaNegra" name="Negra" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="rendaMediaBranca" name="Branca" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <AuditSourceBlock sources={SOURCES.renda} />
      </CardContent>
    </Card>
  );
}

// ============== EVOLUÇÃO DA DESIGUALDADE ==============
export function DesigualdadeEvolucaoChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Evolução das Razões de Desigualdade 2018→2024</CardTitle>
        <CardDescription className="text-xs">
          Razão branco/negro em renda, desemprego e homicídio — Fontes: PNAD/SIDRA, FBSP 2025, Atlas 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucaoDesigualdade} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[1, 3]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v.toFixed(2)}x`} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="razaoRenda" name="Renda (branco/negro)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              <Line type="monotone" dataKey="razaoDesemprego" name="Desemprego (negro/branco)" stroke="hsl(var(--chart-4))" strokeWidth={2} />
              <Line type="monotone" dataKey="razaoHomicidio" name="Homicídio (negro/não negro)" stroke="hsl(var(--destructive))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Conclusão:</strong> Apesar de melhorias pontuais em renda e emprego, a razão de homicídio 
            permanece estável em ~2,7x (negro tem 2,7x mais risco). A desigualdade estrutural se mantém 
            mesmo com políticas afirmativas — demonstrando o caráter sistêmico da discriminação racial.
          </p>
        </div>
        <AuditSourceBlock sources={SOURCES.desigualdade} />
      </CardContent>
    </Card>
  );
}

// ============== VIOLÊNCIA INTERSECCIONAL ==============
export function ViolenciaInterseccionalChart() {
  // Filtrar apenas dados percentuais para o gráfico de barras
  const dadosPercentuais = violenciaInterseccional.filter(v => !(v as any).unidadeAbsoluta);
  const dadosAbsolutos = violenciaInterseccional.filter(v => (v as any).unidadeAbsoluta);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Violência Interseccional: Mulheres Negras</CardTitle>
        <CardDescription className="text-xs">Fonte: 19º Anuário FBSP 2025 / DataSUS SINAN (dados 2024)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosPercentuais} layout="vertical" margin={{ top: 5, right: 10, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
              <YAxis type="category" dataKey="tipo" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="mulherNegra" name="Mulher negra" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="mulherBranca" name="Mulher não negra" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {dadosAbsolutos.length > 0 && (
          <div className="mt-2 p-2 bg-muted/30 rounded text-xs text-muted-foreground">
            {dadosAbsolutos.map(d => (
              <p key={d.tipo}>
                <strong>{d.tipo}:</strong> {d.mulherNegra.toLocaleString('pt-BR')} notificações (negras) vs {d.mulherBranca.toLocaleString('pt-BR')} (não negras) — {d.fonte}
              </p>
            ))}
          </div>
        )}
        <AuditSourceBlock sources={SOURCES.violenciaInterseccional} />
      </CardContent>
    </Card>
  );
}

// ============== TABELA COMPARATIVA SÍNTESE ==============
export function TabelaSinteseComparativa() {
  const dado2018Seg = segurancaPublica[0];
  const dado2024Seg = segurancaPublica[segurancaPublica.length - 1];
  const dado2018Edu = educacaoSerieHistorica[0];
  const dado2024Edu = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];
  const dado2018Sau = saudeSerieHistorica[0];
  const dado2024Sau = saudeSerieHistorica[saudeSerieHistorica.length - 1];
  const dado2018Eco = indicadoresSocioeconomicos[0];
  const dado2024Eco = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];
  const dado2018Fem = feminicidioSerie[0];
  const dado2024Fem = feminicidioSerie[feminicidioSerie.length - 1];

  const sourceUrls: Record<string, string> = {
    'FBSP 2025': 'https://forumseguranca.org.br/anuario-brasileiro-de-seguranca-publica/',
    'Atlas 2025': 'https://www.ipea.gov.br/atlasviolencia/',
    'PNAD 2024': 'https://sidra.ibge.gov.br/tabela/6405',
    'PNAD Edu 2024': 'https://sidra.ibge.gov.br/Tabela/7129',
    'DataSUS': 'http://tabnet.datasus.gov.br/cgi/tabcgi.exe?sim/cnv/mat10uf.def',
  };

  const dados = [
    { indicador: 'Vítimas de homicídio negras', v2018: `${dado2018Seg.percentualVitimasNegras}%`, v2024: `${dado2024Seg.percentualVitimasNegras}%`, variacao: `+${(dado2024Seg.percentualVitimasNegras - dado2018Seg.percentualVitimasNegras).toFixed(1)}pp`, tendencia: 'piora', fonte: 'FBSP 2025' },
    { indicador: 'Letalidade policial negra', v2018: `${dado2018Seg.letalidadePolicial}%`, v2024: `${dado2024Seg.letalidadePolicial}%`, variacao: `+${(dado2024Seg.letalidadePolicial - dado2018Seg.letalidadePolicial).toFixed(1)}pp`, tendencia: 'piora', fonte: 'FBSP 2025' },
    { indicador: 'Feminicídio mulheres negras', v2018: `${dado2018Fem.percentualNegras}%`, v2024: `${dado2024Fem.percentualNegras}%`, variacao: `+${(dado2024Fem.percentualNegras - dado2018Fem.percentualNegras).toFixed(1)}pp`, tendencia: 'piora', fonte: 'FBSP 2025' },
    { indicador: 'Risco homicídio negro', v2018: `${dado2018Seg.razaoRisco}x`, v2024: `${dado2024Seg.razaoRisco}x`, variacao: `+${(dado2024Seg.razaoRisco - dado2018Seg.razaoRisco).toFixed(1)}x`, tendencia: 'piora', fonte: 'Atlas 2025' },
    { indicador: 'Renda média negra', v2018: `R$ ${dado2018Eco.rendaMediaNegra}`, v2024: `R$ ${dado2024Eco.rendaMediaNegra}`, variacao: `+${((dado2024Eco.rendaMediaNegra/dado2018Eco.rendaMediaNegra - 1)*100).toFixed(0)}%`, tendencia: 'melhora', fonte: 'PNAD 2024' },
    { indicador: 'Razão renda branca/negra', v2018: `${(dado2018Eco.rendaMediaBranca/dado2018Eco.rendaMediaNegra).toFixed(2)}x`, v2024: `${(dado2024Eco.rendaMediaBranca/dado2024Eco.rendaMediaNegra).toFixed(2)}x`, variacao: `${((dado2024Eco.rendaMediaBranca/dado2024Eco.rendaMediaNegra) < (dado2018Eco.rendaMediaBranca/dado2018Eco.rendaMediaNegra)) ? '↓' : '↑'}`, tendencia: (dado2024Eco.rendaMediaBranca/dado2024Eco.rendaMediaNegra) < (dado2018Eco.rendaMediaBranca/dado2018Eco.rendaMediaNegra) ? 'melhora' : 'piora', fonte: 'PNAD 2024' },
    { indicador: 'Desemprego negro', v2018: `${dado2018Eco.desempregoNegro}%`, v2024: `${dado2024Eco.desempregoNegro}%`, variacao: `${(dado2024Eco.desempregoNegro - dado2018Eco.desempregoNegro).toFixed(1)}pp`, tendencia: 'melhora', fonte: 'PNAD 2024' },
    { indicador: 'Superior completo negro', v2018: `${dado2018Edu.superiorNegroPercent}%`, v2024: `${dado2024Edu.superiorNegroPercent}%`, variacao: `+${(dado2024Edu.superiorNegroPercent - dado2018Edu.superiorNegroPercent).toFixed(1)}pp`, tendencia: 'melhora', fonte: 'PNAD Edu 2024' },
    { indicador: 'Analfabetismo negro', v2018: `${dado2018Edu.analfabetismoNegro}%`, v2024: `${dado2024Edu.analfabetismoNegro}%`, variacao: `${(dado2024Edu.analfabetismoNegro - dado2018Edu.analfabetismoNegro).toFixed(1)}pp`, tendencia: 'melhora', fonte: 'PNAD Edu 2024' },
    { indicador: 'Mortalidade materna negra', v2018: `${dado2018Sau.mortalidadeMaternaNegra}`, v2024: `${dado2024Sau.mortalidadeMaternaNegra}`, variacao: `${((dado2024Sau.mortalidadeMaternaNegra/dado2018Sau.mortalidadeMaternaNegra - 1)*100).toFixed(0)}%`, tendencia: 'melhora', fonte: 'DataSUS' },
    { indicador: 'Razão mort. materna negra/branca', v2018: `${(dado2018Sau.mortalidadeMaternaNegra/dado2018Sau.mortalidadeMaternaBranca).toFixed(1)}x`, v2024: `${(dado2024Sau.mortalidadeMaternaNegra/dado2024Sau.mortalidadeMaternaBranca).toFixed(1)}x`, variacao: 'Persistente', tendencia: 'piora', fonte: 'DataSUS' },
  ];

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Síntese Comparativa 2018 → 2024: Indicadores-Chave por Raça</CardTitle>
        <CardDescription className="text-xs">Dados oficiais das fontes primárias — Base para argumentação CERD IV</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Indicador</th>
                <th className="text-center p-2 font-medium">2018</th>
                <th className="text-center p-2 font-medium">2024</th>
                <th className="text-center p-2 font-medium">Variação</th>
                <th className="text-center p-2 font-medium">Tendência</th>
                <th className="text-center p-2 font-medium">Fonte</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((d, i) => (
                <tr key={i} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{d.indicador}</td>
                  <td className="text-center p-2">{d.v2018}</td>
                  <td className="text-center p-2 font-bold">{d.v2024}</td>
                  <td className="text-center p-2">{d.variacao}</td>
                  <td className="text-center p-2">
                    <Badge variant={d.tendencia === 'melhora' ? 'default' : 'destructive'} className="text-xs">
                      {d.tendencia === 'melhora' ? '↑ Melhora' : '↓ Piora'}
                    </Badge>
                  </td>
                  <td className="text-center p-2">
                    {sourceUrls[d.fonte] ? (
                      <a href={sourceUrls[d.fonte]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center justify-center gap-0.5">
                        {d.fonte} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">{d.fonte}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Fio Condutor:</strong> Os dados revelam um padrão claro: houve avanços em educação e emprego (resultado de políticas afirmativas), 
            mas a violência racial (homicídio, letalidade policial, feminicídio) <strong>piorou em termos relativos</strong>. 
            A desigualdade de renda persiste estruturalmente (razão ~1,6x) e a mortalidade materna negra permanece {(dado2024Sau.mortalidadeMaternaNegra/dado2024Sau.mortalidadeMaternaBranca).toFixed(1)}x maior que a branca ({dado2024Sau.mortalidadeMaternaNegra} vs {dado2024Sau.mortalidadeMaternaBranca} por 100 mil NV em {dado2024Sau.ano}).
          </p>
        </div>
        <AuditSourceBlock sources={[...SOURCES.seguranca, ...SOURCES.renda, ...SOURCES.educacao, ...SOURCES.saude]} className="mt-2" />
      </CardContent>
    </Card>
  );
}

// RadarVulnerabilidadesChart REMOVIDO — violava Regra de Ouro (índice composto não auditável)

// ============== CLASSE POR RAÇA ==============
export function ClassePorRacaChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Pobreza por Raça/Cor (SIS/IBGE 2024)</CardTitle>
        <CardDescription className="text-xs">Fonte: SIS/IBGE 2024 (dados 2023) — Linhas Banco Mundial</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classePorRaca} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="faixa" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="branca" name="Branca" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="parda" name="Parda" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="preta" name="Preta" fill="hsl(var(--chart-4))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <AuditSourceBlock sources={SOURCES.classe} />
      </CardContent>
    </Card>
  );
}
