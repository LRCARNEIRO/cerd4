import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Star } from 'lucide-react';

interface RecomendacaoCEDR {
  tema: string;
  paragrafo: string;
  numRecomendacoes: string;
  prioritaria: boolean;
  detalhePrioritaria?: string;
}

const indiceRecomendacoes: RecomendacaoCEDR[] = [
  { tema: 'Coleta de dados demográficos desagregados', paragrafo: '6', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Implementação doméstica da Convenção', paragrafo: '8', numRecomendacoes: '3 (a-c)', prioritaria: false },
  { tema: 'Estrutura institucional', paragrafo: '10', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Acesso à justiça', paragrafo: '12', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Situação de mulheres afro-brasileiras, indígenas e quilombolas', paragrafo: '14', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Direito à saúde e impacto da COVID-19', paragrafo: '17', numRecomendacoes: '6 (a-f)', prioritaria: true, detalhePrioritaria: 'a-c, e-f' },
  { tema: 'Disparidades no acesso à educação', paragrafo: '19', numRecomendacoes: '3 (a-c)', prioritaria: true, detalhePrioritaria: 'c' },
  { tema: 'Pobreza, trabalho e renda', paragrafo: '23', numRecomendacoes: '6 (a-f)', prioritaria: true, detalhePrioritaria: 'a' },
  { tema: 'Discriminação e segregação na moradia', paragrafo: '25', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Representação política', paragrafo: '27', numRecomendacoes: '3 (a-c)', prioritaria: true, detalhePrioritaria: 'c' },
  { tema: 'Medidas especiais', paragrafo: '29', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Discurso de ódio racista e crimes de ódio', paragrafo: '31', numRecomendacoes: '6 (a-f)', prioritaria: false },
  { tema: 'Homicídios motivados pela raça', paragrafo: '33', numRecomendacoes: '3 (a-c)', prioritaria: true },
  { tema: 'Uso excessivo da força pela polícia e militares', paragrafo: '36', numRecomendacoes: '8 (a-h)', prioritaria: true, detalhePrioritaria: 'a-d' },
  { tema: 'Justiça criminal', paragrafo: '38', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Perfilamento racial (racial profiling)', paragrafo: '40', numRecomendacoes: '4 (a-d)', prioritaria: false },
  { tema: 'Reunião pacífica (peaceful assembly)', paragrafo: '42', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Perseguição a religiões afro-brasileiras', paragrafo: '44', numRecomendacoes: '5 (a-e)', prioritaria: false },
  { tema: 'Defensores de direitos humanos', paragrafo: '46', numRecomendacoes: '1', prioritaria: true },
  { tema: 'Desenvolvimento, meio-ambiente e direitos humanos', paragrafo: '48', numRecomendacoes: '5 (a-e)', prioritaria: true },
  { tema: 'Comunidades indígenas e quilombolas', paragrafo: '50', numRecomendacoes: '4 (a-d)', prioritaria: true },
  { tema: 'Proteção legal de terras indígenas e quilombolas', paragrafo: '53', numRecomendacoes: '1', prioritaria: true },
  { tema: 'Imigrantes, refugiados e requerentes de asilo', paragrafo: '55', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Povos ciganos', paragrafo: '57', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Combate a preconceitos e legados de injustiças históricas', paragrafo: '60', numRecomendacoes: '5 (a-e)', prioritaria: true, detalhePrioritaria: 'e' },
  { tema: 'Ratificação de outros tratados', paragrafo: '61', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Emenda ao artigo 8º da Convenção', paragrafo: '62', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Declaração opcional (artigo 14)', paragrafo: '63', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Declaração e Programa de Ação de Durban', paragrafo: '64', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Década Internacional Afrodescendentes', paragrafo: '65', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Consultas à sociedade civil', paragrafo: '66', numRecomendacoes: '1', prioritaria: false },
  { tema: 'Disseminação da informação', paragrafo: '67', numRecomendacoes: '1', prioritaria: false },
];

export function ObservacoesFinaisTab() {
  const totalRecs = indiceRecomendacoes.length;
  const prioritarias = indiceRecomendacoes.filter(r => r.prioritaria).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">CERD/C/BRA/CO/18-20 — Índice Completo de Recomendações</CardTitle>
          <p className="text-sm text-muted-foreground">
            Observações Finais do CERD ao Brasil (19/12/2022). Total de {totalRecs} temas com recomendações diretas, 
            das quais {prioritarias} são tratadas como prioritárias (§68-69).
          </p>
          <p className="text-xs text-muted-foreground mt-1 p-2 bg-primary/5 rounded border border-primary/10">
            ℹ️ Este índice contém apenas as <strong>{totalRecs} recomendações do Comitê CERD</strong> (parágrafos §6-§67). 
            A base completa do sistema inclui também recomendações do CNJ (Audiências de Custódia) e do STF (ADO 26), 
            visíveis na aba "Lacunas Identificadas" em Conclusões.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-1.5 text-xs">
              <Star className="w-3.5 h-3.5 text-warning fill-warning" />
              <span className="text-muted-foreground">Prioritária (§68-69)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-muted-foreground">Follow-up obrigatório (§68)</span>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium text-xs">Tema</th>
                  <th className="text-center p-3 font-medium text-xs w-20">§</th>
                  <th className="text-center p-3 font-medium text-xs w-28">Nº Rec.</th>
                  <th className="text-center p-3 font-medium text-xs w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                {indiceRecomendacoes.map((rec) => {
                  const isFollowUp = ['17', '19', '23', '36'].includes(rec.paragrafo);
                  return (
                    <tr
                      key={rec.paragrafo}
                      className={`border-t ${rec.prioritaria ? 'bg-warning/5' : ''} ${isFollowUp ? 'bg-destructive/5' : ''}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {isFollowUp && <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />}
                          {rec.prioritaria && !isFollowUp && <Star className="w-3.5 h-3.5 text-warning fill-warning flex-shrink-0" />}
                          <span className={rec.prioritaria ? 'font-medium' : ''}>{rec.tema}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-xs">{rec.paragrafo}</td>
                      <td className="p-3 text-center text-xs">{rec.numRecomendacoes}</td>
                      <td className="p-3 text-center">
                        {rec.prioritaria && (
                          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                            {rec.detalhePrioritaria ? `Prio: ${rec.detalhePrioritaria}` : 'Prioritária'}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Follow-up note */}
          <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Follow-up obrigatório (§68)
            </h4>
            <p className="text-sm text-muted-foreground">
              O Brasil deveria ter respondido em 1 ano (até dez/2023) sobre: §17(a) saúde/COVID-19, 
              §19(c) educação, §23(a) pobreza/trabalho e §36(a-d) uso de força policial.
              A resposta foi submetida em janeiro de 2026 (CERD/C/BRA/FCO/18-20).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
