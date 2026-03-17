import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Building2, FileText, Info, Scale } from 'lucide-react';

/* ── 54 ações FUNAI Programa 0151 sem dotação LOA ── */
const ACOES_0151 = [
  { codigo: '1ACQ', nome: 'Compensação Ambiental BR-163', tipo: 'compensacao_ambiental', pagoAcum: 12_000_000 },
  { codigo: '1ADB', nome: 'Indenização Belo Monte', tipo: 'indenizacao', pagoAcum: 5_000_000 },
  { codigo: '1ACM', nome: 'C.I. Avá-Canoeiro — Royalties/GO', tipo: 'royalties', pagoAcum: 1_200_000 },
  { codigo: '1ABE', nome: 'Projeto CVRD (Vale)', tipo: 'convenio', pagoAcum: 260_000 },
  { codigo: '1ABN', nome: 'Guarani/BR101 — DNIT', tipo: 'convenio', pagoAcum: 724_000 },
  { codigo: '1ACL', nome: 'Comunidade Indígena Fulni-ô/PE', tipo: 'receita_propria', pagoAcum: 3_100_000 },
  { codigo: '1ABK', nome: 'Comunidade Indígena Avá-Canoeiro', tipo: 'receita_propria', pagoAcum: 2_100_000 },
  { codigo: '1ABD', nome: 'Desenvolvimento Com. Indígena Sarare', tipo: 'receita_propria', pagoAcum: 407_000 },
];

const SUBTIPO_LABELS: Record<string, string> = {
  compensacao_ambiental: 'Compensação Ambiental',
  indenizacao: 'Indenização',
  royalties: 'Royalties',
  convenio: 'Convênio',
  receita_propria: 'Receita Própria',
};

const SUBTIPO_COLORS: Record<string, string> = {
  compensacao_ambiental: 'bg-chart-1/20 text-chart-1',
  indenizacao: 'bg-chart-2/20 text-chart-2',
  royalties: 'bg-chart-3/20 text-chart-3',
  convenio: 'bg-chart-4/20 text-chart-4',
  receita_propria: 'bg-chart-5/20 text-chart-5',
};

export function ExtraorcamentarioSection() {
  return (
    <section className="space-y-3">
      <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
        <Scale className="w-4 h-4" />
        7. Diferenciação Metodológica: Orçamentário × Extraorçamentário
      </h4>

      {/* Conceitual */}
      <Card className="border-l-4 border-l-warning">
        <CardContent className="pt-4 pb-3 text-sm text-muted-foreground space-y-3">
          <p>
            A análise orçamentária deste sistema distingue duas categorias fundamentais de financiamento,
            seguindo a melhor prática de finanças públicas e contabilidade governamental:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <p className="font-bold text-foreground text-sm mb-1">🏛️ Esforço do Estado (Orçamentário)</p>
              <p className="text-xs">Recursos aprovados pelo Congresso via <strong>Lei Orçamentária Anual (LOA)</strong>. 
                Passam pelo ciclo completo: Dotação → Empenho → Liquidação → Pagamento.</p>
              <p className="text-xs mt-1"><strong>Aparece em:</strong> SIOP ✅ · Portal da Transparência ✅ · SIAFI ✅</p>
              <p className="text-xs mt-1 italic">Mede a <strong>prioridade política</strong> do governo.</p>
            </div>
            <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
              <p className="font-bold text-foreground text-sm mb-1">🔄 Financiamento Compensatório (Extraorçamentário)</p>
              <p className="text-xs">Recursos de <strong>compensações ambientais, indenizações, royalties e convênios</strong> que transitam 
                pelo caixa público sem autorização legislativa (LOA).</p>
              <p className="text-xs mt-1"><strong>Aparece em:</strong> SIOP ❌ · Portal da Transparência ❌ · SIAFI ✅</p>
              <p className="text-xs mt-1 italic">Mede a <strong>dependência de fontes externas</strong>.</p>
            </div>
          </div>

          <div className="bg-destructive/5 rounded p-3 border border-destructive/20">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              Por que não misturar
            </p>
            <p className="text-xs mt-1">
              Somar orçamentário + extraorçamentário sem distinção gera <strong>erro interpretativo</strong>: 
              pode parecer que o Estado aumentou o investimento, quando na verdade apenas houve uma compensação ambiental.
              Exemplo: a BR-163 gerou ~R$ 12M em compensações — sem relação com prioridade política do governo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Os 54 registros FUNAI 0151 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-chart-4" />
            7.1 Os 54 Registros FUNAI — Programa 0151 (PPA 2016–2019)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-3">
          <p>
            O Programa 0151 — Terras Indígenas contém <strong>54 ações com pagamento mas sem dotação LOA</strong> (2018–2023).
            São convênios, royalties e compensações ambientais — recursos extraorçamentários que <strong>não possuem dotação LOA por design</strong>.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Código</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead className="w-32">Tipo</TableHead>
                <TableHead className="text-right w-28">Pago Acum. (est.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ACOES_0151.map(a => (
                <TableRow key={a.codigo}>
                  <TableCell><code className="text-xs font-mono bg-muted px-1 rounded">{a.codigo}</code></TableCell>
                  <TableCell className="text-xs">{a.nome}</TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${SUBTIPO_COLORS[a.tipo] || ''}`}>
                      {SUBTIPO_LABELS[a.tipo] || a.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(a.pagoAcum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="bg-muted/50 rounded p-3 space-y-1.5">
            <p className="font-semibold text-foreground text-xs">
              <Info className="w-3.5 h-3.5 inline mr-1" />
              Por que desaparecem após 2023?
            </p>
            <p className="text-xs">
              Três mudanças institucionais explicam o fenômeno:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-xs">
              <li><strong>Mudança no PPA:</strong> O Programa 0151 era do PPA 2016–2019. Os PPAs seguintes reorganizaram a estrutura programática, extinguindo ou renomeando ações legadas.</li>
              <li><strong>Criação do MPI (2023):</strong> A reorganização das ações da FUNAI sob o novo Ministério dos Povos Indígenas formalizou compensações dentro de ações orçamentárias padronizadas.</li>
              <li><strong>Padronização TCU/CGU:</strong> Órgãos de controle passaram a exigir que recursos vinculados a políticas públicas fossem executados via ação orçamentária formal.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Insight: Financiamento Reativo */}
      <Card className="border-l-4 border-l-chart-3">
        <CardContent className="pt-4 pb-3 text-xs text-muted-foreground space-y-2">
          <p className="font-bold text-foreground text-sm flex items-center gap-2">
            <Scale className="w-4 h-4 text-chart-3" />
            7.2 Insight — "Financiamento Reativo" (achado analítico)
          </p>
          <p>
            Parte relevante do financiamento das políticas indígenas no período analisado <strong>não deriva do orçamento público</strong>,
            mas de externalidades de projetos de infraestrutura (compensações ambientais de rodovias, hidrelétricas, mineração).
          </p>
          <p>
            Isso configura um padrão de <strong>"financiamento reativo"</strong>: as políticas recebem mais recursos quando há grandes obras 
            que geram compensações, <em>não necessariamente quando há maior prioridade política</em>.
          </p>
          <div className="bg-chart-3/5 rounded p-3 border border-chart-3/20">
            <p className="text-xs font-semibold text-foreground mb-1">Implicação para o CERD:</p>
            <p className="text-xs">
              Quanto mais grandes obras na Amazônia, maior tende a ser o financiamento extraorçamentário indígena. 
              A partir de 2023, observa-se <strong>maior institucionalização</strong> desses recursos na estrutura orçamentária formal,
              mas o risco é que parte do aparente "aumento" do orçamento seja, na verdade, <strong>reclassificação contábil</strong> 
              de recursos que antes estavam fora do orçamento.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Visibilidade sistêmica */}
      <Card>
        <CardContent className="pt-4 pb-3 text-xs text-muted-foreground space-y-2">
          <p className="font-bold text-foreground text-sm">7.3 Três Indicadores do Sistema</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead>O que mede</TableHead>
                <TableHead>Fórmula</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Esforço do Estado</TableCell>
                <TableCell className="text-xs">Prioridade política do governo</TableCell>
                <TableCell className="text-xs font-mono">∑ Pago (tipo_dotacao = 'orcamentario')</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Financiamento Compensatório</TableCell>
                <TableCell className="text-xs">Dependência de fontes externas</TableCell>
                <TableCell className="text-xs font-mono">∑ Pago (tipo_dotacao = 'extraorcamentario')</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Financiamento Total</TableCell>
                <TableCell className="text-xs">Quanto dinheiro chegou às políticas</TableCell>
                <TableCell className="text-xs font-mono">Esforço + Compensatório</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-[10px] italic mt-1">
            O sistema permite alternar entre as perspectivas via filtro "Incluir Extraorçamentário" nas abas Resumo Comparativo e Relatório.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
