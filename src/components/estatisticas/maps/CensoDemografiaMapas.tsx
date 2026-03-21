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
interface IndigenaTIRow { region: string; emTI: number; foraTI: number; total: number; pctEmTI: string }
const indigenaTIRegiao: IndigenaTIRow[] = [
  { region: 'Norte', emTI: 316827, foraTI: 436953, total: 753780, pctEmTI: '42,0%' },
  { region: 'Nordeste', emTI: 129882, foraTI: 399246, total: 529128, pctEmTI: '24,5%' },
  { region: 'Centro-Oeste', emTI: 114201, foraTI: 85952, total: 200153, pctEmTI: '57,1%' },
  { region: 'Sudeste', emTI: 21525, foraTI: 101909, total: 123434, pctEmTI: '17,4%' },
  { region: 'Sul', emTI: 40409, foraTI: 47932, total: 88341, pctEmTI: '45,7%' },
];
const indigenaEmTIPorUF: StateDataEntry[] = [
  { uf: 'AM', value: 149080, label: '30,4% em TI' }, { uf: 'RR', value: 71754, label: '73,5% em TI' },
  { uf: 'MS', value: 68682, label: '59,0% em TI' }, { uf: 'MT', value: 45175, label: '77,4% em TI' },
  { uf: 'MA', value: 41677, label: '72,9% em TI' }, { uf: 'PA', value: 41819, label: '51,6% em TI' },
  { uf: 'PE', value: 34314, label: '32,2% em TI' }, { uf: 'AC', value: 19583, label: '61,8% em TI' },
  { uf: 'PB', value: 19044, label: '63,2% em TI' }, { uf: 'BA', value: 17211, label: '7,5% em TI' },
  { uf: 'RS', value: 15724, label: '43,6% em TI' }, { uf: 'TO', value: 15213, label: '76,0% em TI' },
  { uf: 'PR', value: 13893, label: '45,6% em TI' }, { uf: 'MG', value: 12137, label: '33,1% em TI' },
  { uf: 'RO', value: 11525, label: '54,5% em TI' }, { uf: 'SC', value: 10792, label: '49,6% em TI' },
  { uf: 'CE', value: 10521, label: '18,7% em TI' }, { uf: 'AP', value: 7853, label: '69,3% em TI' },
  { uf: 'AL', value: 6672, label: '25,9% em TI' }, { uf: 'ES', value: 4663, label: '32,4% em TI' },
  { uf: 'SP', value: 4179, label: '7,6% em TI' }, { uf: 'RJ', value: 546, label: '3,2% em TI' },
  { uf: 'GO', value: 344, label: '1,8% em TI' }, { uf: 'SE', value: 329, label: '7,0% em TI' },
  { uf: 'PI', value: 114, label: '1,6% em TI' }, { uf: 'DF', value: 0, label: '0% em TI' },
  { uf: 'RN', value: 0, label: '0% em TI' },
];

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
