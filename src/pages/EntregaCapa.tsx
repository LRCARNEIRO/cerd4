import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, BarChart3, DollarSign, Gavel, Scale, ArrowRight } from 'lucide-react';
import { ENTREGA_TITULO } from '@/components/entrega/EntregaContext';
import uffLogo from '@/assets/uff.png.asset.json';
import cdgLogo from '@/assets/cdg_logo_vertical.png.asset.json';

const equipe = [
  { nome: 'Douglas Leite', funcao: 'Coordenação Geral', bio: 'Graduado em Direito e Doutor em História Social. Coordenador do INDEPIR, especialista em História Social da Escravidão e do Trabalho. Tem reconhecida atuação na coordenação de projetos relacionados a políticas públicas de igualdade racial.' },
  { nome: 'Juliana Nunes Rodrigues', funcao: 'Coordenação Geral', bio: 'Geógrafa, especialista em Geografia Política, com foco nas temáticas das desigualdades e democratização, ativismos, institucionalização, participação política e políticas públicas. Coordenou projetos e iniciativas aplicadas relacionadas a orçamentos sensíveis a gênero e raça.' },
  { nome: 'Eduardo Celestino Cordeiro', funcao: 'Analista de Monitoramento Governamental', bio: 'Geógrafo e Coordenador de Estudos Sociais e Territoriais do Departamento de Informação e Inteligência Econômica do Município de São Luís – MA. Tem experiência em desenho de políticas públicas e atuação no desenvolvimento do projeto de regionalização do orçamento público de São Luís-MA.' },
  { nome: 'Laura Carneiro', funcao: 'Analista de Monitoramento Governamental', bio: 'Economista, especialista em gestão pública e estatística. Atua na concepção e monitoramento das peças orçamentárias da capital maranhense desde 2014.' },
  { nome: 'Henrique Silva', funcao: 'Pesquisador (Análise Legislativa)', bio: 'Tem experiência com história política, análise do discurso e análise de textos legislativos desde a graduação em História. Desde 2022, dedica-se ao tema das reformas eleitorais no Brasil, utilizando metodologias para a análise de textos de lei e processos políticos de deliberação e implementação. Tem experiência com mapeamento, seleção e catalogação de documentos oficiais em bancos de dados e a produção de sínteses e relações entre diferentes fontes discursivas originadas dos poderes Legislativo e Executivo.' },
];

function Atalho({ to, icon: Icon, titulo }: { to: string; icon: React.ElementType; titulo: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted transition-colors">
      <Icon className="w-4 h-4 text-primary" /> <span className="flex-1">{titulo}</span> <ArrowRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}

export default function EntregaCapa() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-sidebar text-sidebar-foreground">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center space-y-6">
          <div className="inline-flex items-center justify-center gap-8 rounded-xl bg-card px-8 py-4" aria-label="Logos institucionais">
            <img src={uffLogo.url} alt="Universidade Federal Fluminense (UFF)" className="h-14 w-auto object-contain" />
            <img src={cdgLogo.url} alt="CDG" className="h-20 w-auto object-contain" />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-sidebar-foreground/70">Entrega de produto · Plano de Trabalho 62949849 · SEI 21290.000127/2026-28</p>
          <h1 className="text-2xl md:text-3xl font-semibold leading-snug uppercase">{ENTREGA_TITULO}</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <section className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <p className="text-xs font-semibold text-primary uppercase">Produto 1</p>
              <h2 className="text-lg font-semibold">Painel de Monitoramento de Recomendações (Compliance ONU)</h2>
              <p className="text-sm text-muted-foreground">Ferramenta gerencial para acompanhamento do cumprimento das recomendações do Comitê CERD ao Estado brasileiro, com evidências técnicas vinculadas diretamente aos indicadores, ações orçamentárias e normativos monitorados.</p>
              <p className="text-xs text-muted-foreground border-l-2 border-primary pl-3">
                Nota metodológica: a classificação prevista no Plano de Trabalho (Atendida / Parcial / Não Atendida) é operacionalizada pelos índices de Esforço e Impacto Evidenciado, com faixas Baixo, Intermediário e Alto, calculados a partir das evidências vinculadas a cada recomendação e agregados por Artigo da Convenção.
              </p>
              <div className="space-y-2 pt-2">
                <Atalho to="/entrega/recomendacoes" icon={AlertTriangle} titulo="Recomendações" />
                <Atalho to="/entrega/artigos" icon={Scale} titulo="Artigos I–VII da Convenção" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-3">
              <p className="text-xs font-semibold text-primary uppercase">Produto 3</p>
              <h2 className="text-lg font-semibold">Base de Evidências Estratégicas (Data-Lake de Indicadores)</h2>
              <p className="text-sm text-muted-foreground">Repositório dinâmico com séries históricas, gráficos e tabelas processadas para o Relatório CERD IV, organizado por eixos temáticos para subsidiar Notas Técnicas, discursos e justificativas orçamentárias.</p>
              <div className="space-y-2 pt-2">
                <Atalho to="/entrega/estatisticas" icon={BarChart3} titulo="Base Estatística" />
                <Atalho to="/entrega/orcamento" icon={DollarSign} titulo="Base Orçamentária" />
                <Atalho to="/entrega/normativa" icon={Gavel} titulo="Base Normativa" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Equipe técnica</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {equipe.map(p => (
              <Card key={p.nome}>
                <CardContent className="p-5 space-y-1">
                  <p className="font-semibold">{p.nome}</p>
                  <p className="text-xs text-primary font-medium">{p.funcao}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
