import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Users } from 'lucide-react';
import { BrazilChoroplethMap, type StateDataEntry } from './BrazilChoroplethMap';
import { cn } from '@/lib/utils';

/* ================================================================
   1. QUILOMBOLA POR UF — Censo 2022 / SIDRA 9943
   ================================================================ */
const quilombolaPorUF: StateDataEntry[] = [
  { uf: 'BA', value: 397502 }, { uf: 'MA', value: 269168 }, { uf: 'PA', value: 135603 },
  { uf: 'MG', value: 135315 }, { uf: 'PE', value: 78864 }, { uf: 'AL', value: 37724 },
  { uf: 'PI', value: 31786 }, { uf: 'GO', value: 30391 }, { uf: 'SE', value: 28163 },
  { uf: 'CE', value: 23994 }, { uf: 'RN', value: 22371 }, { uf: 'RJ', value: 20447 },
  { uf: 'RS', value: 17552 }, { uf: 'PB', value: 16765 }, { uf: 'ES', value: 15659 },
  { uf: 'TO', value: 13077 }, { uf: 'AP', value: 12894 }, { uf: 'MT', value: 11729 },
  { uf: 'SP', value: 11006 }, { uf: 'PR', value: 7113 }, { uf: 'SC', value: 4449 },
  { uf: 'RO', value: 2925 }, { uf: 'AM', value: 2812 }, { uf: 'MS', value: 2572 },
  { uf: 'DF', value: 305 }, { uf: 'AC', value: 0 }, { uf: 'RR', value: 0 },
];

/* ================================================================
   2. INDÍGENAS EM TIs vs FORA — Censo 2022 / SIDRA 9970
   ================================================================ */
interface IndigenaTIRow { uf: string; emTI: number; foraTI: number; total: number; pctEmTI: string }
const indigenaTIUF: IndigenaTIRow[] = [
  { uf: 'AC', emTI: 19583, foraTI: 12111, total: 31694, pctEmTI: '61,8%' },
  { uf: 'AL', emTI: 6672, foraTI: 19053, total: 25725, pctEmTI: '25,9%' },
  { uf: 'AM', emTI: 149080, foraTI: 341855, total: 490935, pctEmTI: '30,4%' },
  { uf: 'AP', emTI: 7853, foraTI: 3481, total: 11334, pctEmTI: '69,3%' },
  { uf: 'BA', emTI: 17211, foraTI: 212232, total: 229443, pctEmTI: '7,5%' },
  { uf: 'CE', emTI: 10521, foraTI: 45851, total: 56372, pctEmTI: '18,7%' },
  { uf: 'DF', emTI: 0, foraTI: 5811, total: 5811, pctEmTI: '0%' },
  { uf: 'ES', emTI: 4663, foraTI: 9747, total: 14410, pctEmTI: '32,4%' },
  { uf: 'GO', emTI: 344, foraTI: 19173, total: 19517, pctEmTI: '1,8%' },
  { uf: 'MA', emTI: 41677, foraTI: 15489, total: 57166, pctEmTI: '72,9%' },
  { uf: 'MG', emTI: 12137, foraTI: 24562, total: 36699, pctEmTI: '33,1%' },
  { uf: 'MS', emTI: 68682, foraTI: 47787, total: 116469, pctEmTI: '59,0%' },
  { uf: 'MT', emTI: 45175, foraTI: 13181, total: 58356, pctEmTI: '77,4%' },
  { uf: 'PA', emTI: 41819, foraTI: 39161, total: 80980, pctEmTI: '51,6%' },
  { uf: 'PB', emTI: 19044, foraTI: 11096, total: 30140, pctEmTI: '63,2%' },
  { uf: 'PE', emTI: 34314, foraTI: 72332, total: 106646, pctEmTI: '32,2%' },
  { uf: 'PI', emTI: 114, foraTI: 7088, total: 7202, pctEmTI: '1,6%' },
  { uf: 'PR', emTI: 13893, foraTI: 16573, total: 30466, pctEmTI: '45,6%' },
  { uf: 'RJ', emTI: 546, foraTI: 16448, total: 16994, pctEmTI: '3,2%' },
  { uf: 'RN', emTI: 0, foraTI: 11724, total: 11724, pctEmTI: '0%' },
  { uf: 'RO', emTI: 11525, foraTI: 9621, total: 21146, pctEmTI: '54,5%' },
  { uf: 'RR', emTI: 71754, foraTI: 25914, total: 97668, pctEmTI: '73,5%' },
  { uf: 'RS', emTI: 15724, foraTI: 20378, total: 36102, pctEmTI: '43,6%' },
  { uf: 'SC', emTI: 10792, foraTI: 10981, total: 21773, pctEmTI: '49,6%' },
  { uf: 'SE', emTI: 329, foraTI: 4381, total: 4710, pctEmTI: '7,0%' },
  { uf: 'SP', emTI: 4179, foraTI: 51152, total: 55331, pctEmTI: '7,6%' },
  { uf: 'TO', emTI: 15213, foraTI: 4810, total: 20023, pctEmTI: '76,0%' },
];
const indigenaEmTIPorUF: StateDataEntry[] = indigenaTIUF.map((item) => ({
  uf: item.uf,
  value: item.emTI,
  label: `${item.pctEmTI} em TI`,
}));

/* ================================================================
   COMPONENT
   ================================================================ */
export function CensoDemografiaMapas() {
  return (
    <div className="space-y-6">
      {/* QUILOMBOLA */}
      <Card className="border-l-4 border-l-chart-2">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="w-5 h-5 text-chart-2" />
            <CardTitle className="text-base">População Quilombola por UF — Censo 2022</CardTitle>
             <Badge variant="outline" className="text-[10px]">1,33 milhão</Badge>
          </div>
          <CardDescription className="text-xs">
            Primeiro recenseamento oficial. 80,5% concentrados no Nordeste. Fonte:{' '}
             <a href="https://sidra.ibge.gov.br/tabela/10089"
              target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
              SIDRA Tabela 10089 <ExternalLink className="w-3 h-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BrazilChoroplethMap
              data={quilombolaPorUF}
              colorScale={['hsl(40, 90, 92)', 'hsl(25, 85, 45)', 'hsl(15, 90, 30)']}
              unit="pessoas"
            />
            <div className="max-h-[420px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sticky top-0 bg-card">UF</TableHead>
                    <TableHead className="text-xs text-right sticky top-0 bg-card">População</TableHead>
                    <TableHead className="text-xs text-right sticky top-0 bg-card">% Brasil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...quilombolaPorUF].sort((a, b) => b.value - a.value).map((r, i) => (
                    <TableRow key={r.uf} className={cn(i % 2 === 0 && 'bg-muted/10')}>
                      <TableCell className="text-xs font-bold">{r.uf}</TableCell>
                      <TableCell className="text-xs text-right tabular-nums font-semibold">
                        {r.value.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums text-muted-foreground">
                        {((r.value / 1330186) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* INDÍGENAS EM TIs vs FORA */}
      <Card className="border-l-4 border-l-chart-1">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Users className="w-5 h-5 text-chart-1" />
            <CardTitle className="text-base">Indígenas em TIs vs. Fora — Censo 2022</CardTitle>
             <Badge variant="outline" className="text-[10px]">1,69 milhão</Badge>
            <Badge variant="outline" className="text-[10px] bg-chart-1/10 text-chart-1 border-chart-1/30">
              63,4% fora de TIs
            </Badge>
          </div>
          <CardDescription className="text-xs">
             Inversão do paradigma: maioria vive fora de Terras Indígenas. Fonte:{' '}
             <a href="https://sidra.ibge.gov.br/tabela/9970"
              target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
              SIDRA Tabela 9970 <ExternalLink className="w-3 h-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BrazilChoroplethMap
              data={indigenaEmTIPorUF}
              colorScale={['hsl(160, 40, 90)', 'hsl(160, 70, 45)', 'hsl(160, 90, 25)']}
              unit="em TI"
              title="Pop. indígena em TIs por UF"
            />
            <div>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-chart-1/10 rounded-lg p-3 text-center">
                   <p className="text-lg font-bold text-chart-1">623 mil</p>
                  <p className="text-[10px] text-muted-foreground">Em TIs (36,6%)</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                   <p className="text-lg font-bold text-foreground">1,07 mi</p>
                  <p className="text-[10px] text-muted-foreground">Fora de TIs (63,4%)</p>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Região</TableHead>
                    <TableHead className="text-xs text-right">Em TI</TableHead>
                    <TableHead className="text-xs text-right">Fora TI</TableHead>
                    <TableHead className="text-xs text-right">% em TI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indigenaTIRegiao.map((r, i) => (
                    <TableRow key={r.region} className={cn(i % 2 === 0 && 'bg-muted/10')}>
                      <TableCell className="text-xs font-bold">{r.region}</TableCell>
                      <TableCell className="text-xs text-right tabular-nums font-semibold">
                        {r.emTI.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums">
                        {r.foraTI.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums text-muted-foreground">{r.pctEmTI}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-[10px] text-muted-foreground mt-3 px-1">
                §21-22 do CERD III. A inversão (63,4% fora de TIs) demanda políticas urbanas específicas
                para indígenas — saúde, educação e moradia fora de territórios demarcados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
