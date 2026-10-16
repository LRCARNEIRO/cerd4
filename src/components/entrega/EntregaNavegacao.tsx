import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ENTREGA_SEQUENCIA } from './EntregaContext';

/** Botões Anterior/Próximo que encadeiam as telas da entrega. */
export function EntregaNavegacao() {
  const { pathname } = useLocation();
  const i = ENTREGA_SEQUENCIA.findIndex(s => s.href === pathname);
  if (i < 0) return null;
  const ant = ENTREGA_SEQUENCIA[i - 1];
  const prox = ENTREGA_SEQUENCIA[i + 1];
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t pt-4">
      {ant ? (
        <Button asChild variant="outline" size="sm">
          <Link to={ant.href}><ArrowLeft className="w-4 h-4 mr-1" /> {ant.titulo}</Link>
        </Button>
      ) : <span />}
      <span className="text-xs text-muted-foreground">{i + 1} de {ENTREGA_SEQUENCIA.length}</span>
      {prox ? (
        <Button asChild size="sm">
          <Link to={prox.href}>{prox.titulo} <ArrowRight className="w-4 h-4 ml-1" /></Link>
        </Button>
      ) : <span />}
    </div>
  );
}

/** Breve apresentação exibida no topo do Painel Geral da entrega. */
export function EntregaIntroPainel() {
  const { pathname } = useLocation();
  if (pathname !== '/entrega/painel') return null;
  return (
    <div className="mb-6 rounded-lg border bg-card p-5 space-y-2">
      <p className="text-xs font-semibold uppercase text-primary">Visão integrada dos produtos</p>
      <p className="text-sm text-muted-foreground">
        Este painel reúne, em uma leitura única, os resultados do monitoramento das 42 recomendações do Comitê CERD
        (Produto 1) e as evidências estatísticas, orçamentárias e normativas que as sustentam (Produto 3). Os números
        abaixo são calculados ao vivo a partir das bases; use os botões ao final de cada tela para seguir pelas
        recomendações, pelos artigos da Convenção e pelas três bases de evidências.
      </p>
    </div>
  );
}
