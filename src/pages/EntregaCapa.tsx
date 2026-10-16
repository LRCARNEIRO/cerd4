import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, BarChart3, DollarSign, Gavel, Scale, ArrowRight } from 'lucide-react';
import { ENTREGA_TITULO } from '@/components/entrega/EntregaContext';
import uffLogo from '@/assets/uff.png.asset.json';
import cdgLogo from '@/assets/cdg_logo_vertical.png.asset.json';

const coordenadores = [
  { nome: 'Douglas Leite', funcao: 'Coordenação Geral' },
  { nome: 'Juliana Nunes Rodrigues', funcao: 'Coordenação Geral' },
];

const equipe = [
  'Eduardo Celestino Cordeiro',
  'Laura Carneiro',
  'Henrique Silva',
];

function Atalho({ to, icon: Icon, titulo }: { to: string; icon: React.ElementType; titulo: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
    >
      <Icon className="w-4 h-4 text-primary" /> <span>{titulo}</span>
    </Link>
  );
}

export default function EntregaCapa() {
  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Leitura ampliada: mesmo zoom das demais telas; h/w-full mantêm a capa em uma tela. */}
      <div className="flex h-full w-full flex-col" style={{ zoom: 1.15 }}>
        <header className="bg-sidebar text-sidebar-foreground">
          <div className="max-w-6xl mx-auto px-6 py-[1.5vh] flex flex-col items-center gap-[1vh] text-center">
            <div className="inline-flex items-center justify-center gap-6 rounded-lg bg-card px-6 py-2" aria-label="Logos institucionais">
              <img src={uffLogo.url} alt="Universidade Federal Fluminense (UFF)" className="h-[5.5vh] w-auto object-contain" />
              <img src={cdgLogo.url} alt="CDG" className="h-[7vh] w-auto object-contain" />
            </div>
            <h1 className="text-lg md:text-xl font-semibold leading-snug uppercase max-w-4xl">{ENTREGA_TITULO}</h1>
            <Link
              to="/entrega/painel"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-base font-medium text-primary-foreground hover:opacity-90"
            >
              Iniciar pelo Painel Geral <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-[1vh] flex flex-col justify-center gap-[1.5vh]">
          <section className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold text-primary uppercase">Produto 1</p>
                <h2 className="text-lg font-semibold leading-snug">Painel de Monitoramento de Recomendações (Compliance ONU)</h2>
                <p className="text-[15px] text-muted-foreground leading-snug">
                  Ferramenta gerencial para acompanhamento do cumprimento das recomendações do Comitê CERD ao Estado brasileiro,
                  com evidências técnicas vinculadas diretamente aos indicadores, ações orçamentárias e normativos monitorados.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Atalho to="/entrega/recomendacoes" icon={AlertTriangle} titulo="Recomendações" />
                  <Atalho to="/entrega/artigos" icon={Scale} titulo="Artigos I–VII" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold text-primary uppercase">Produto 3</p>
                <h2 className="text-lg font-semibold leading-snug">Base de Evidências Estratégicas (Data-Lake de Indicadores)</h2>
                <p className="text-[15px] text-muted-foreground leading-snug">
                  Repositório dinâmico com séries históricas, gráficos e tabelas processadas para o Relatório CERD IV, organizado
                  por eixos temáticos para subsidiar Notas Técnicas, discursos e justificativas orçamentárias.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Atalho to="/entrega/estatisticas" icon={BarChart3} titulo="Base Estatística" />
                  <Atalho to="/entrega/orcamento" icon={DollarSign} titulo="Base Orçamentária" />
                  <Atalho to="/entrega/normativa" icon={Gavel} titulo="Base Normativa" />
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="rounded-lg border bg-card px-6 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Equipe técnica</h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {coordenadores.map(p => (
                <div key={p.nome} className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-primary">{p.nome}</span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">{p.funcao}</span>
                </div>
              ))}
              <span className="hidden md:block h-4 w-px bg-border" aria-hidden="true" />
              {equipe.map(nome => (
                <span key={nome} className="text-base text-foreground/90">{nome}</span>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
