import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ENTREGA_SEQUENCIA } from './EntregaContext';

/** Fio narrativo da entrega: do resultado (Produto 1) para a prova (Produto 3). */
const PASSAGEM: Record<string, string> = {
  '/entrega/painel':
    'Você viu o retrato geral. A seguir: como está o cumprimento de cada uma das 42 recomendações do Comitê CERD.',
  '/entrega/recomendacoes':
    'Você viu o cumprimento recomendação por recomendação. A seguir: a mesma leitura reunida pelos sete artigos da Convenção.',
  '/entrega/artigos':
    'Até aqui, a pergunta foi "como o Brasil está no cumprimento". A partir de agora, as três bases respondem "de onde vem isso": primeiro, os indicadores estatísticos.',
  '/entrega/estatisticas':
    'Você viu as evidências estatísticas. A seguir: as ações orçamentárias que comprovam o esforço do Estado.',
  '/entrega/orcamento':
    'Você viu as evidências orçamentárias. Por fim: as normas que sustentam as políticas monitoradas.',
  '/entrega/normativa':
    'Você chegou ao alicerce completo: os resultados apresentados no início se apoiam nestas três bases de evidências.',
};

/** Botões Anterior/Próximo que encadeiam as telas da entrega. */
export function EntregaNavegacao() {
  const { pathname } = useLocation();
  const i = ENTREGA_SEQUENCIA.findIndex(s => s.href === pathname);
  if (i < 0) return null;
  const ant = ENTREGA_SEQUENCIA[i - 1];
  const prox = ENTREGA_SEQUENCIA[i + 1];
  const passagem = PASSAGEM[pathname];
  return (
    <div className="mt-8 border-t pt-4 space-y-3">
      {passagem && (
        <p className="text-sm text-muted-foreground italic text-center">{passagem}</p>
      )}
      <div className="flex items-center justify-between gap-3">
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
      <p className="text-sm text-muted-foreground">
        A apresentação segue do resultado para a prova: primeiro, como o Brasil está no cumprimento das
        recomendações; depois, de onde vem essa leitura. Todas as conclusões se apoiam nas três bases de
        evidências — estatística, orçamentária e normativa —, que vêm ao final como alicerce do trabalho.
      </p>
    </div>
  );
}
