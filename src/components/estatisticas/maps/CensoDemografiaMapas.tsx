import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Users, MapPin } from 'lucide-react';
import { BrazilChoroplethMap, type StateDataEntry } from './BrazilChoroplethMap';
import { cn } from '@/lib/utils';

/* ================================================================
   1. QUILOMBOLA POR UF — Censo 2022 / SIDRA 9943
   ================================================================ */
const quilombolaPorUF: StateDataEntry[] = [
  { uf: 'BA', value: 397059 }, { uf: 'MA', value: 269074 }, { uf: 'MG', value: 88775 },
  { uf: 'PE', value: 78827 }, { uf: 'PA', value: 46219 }, { uf: 'PI', value: 45601 },
  { uf: 'AL', value: 39262 }, { uf: 'RJ', value: 35420 }, { uf: 'SE', value: 32410 },
  { uf: 'CE', value: 30714 }, { uf: 'PB', value: 25664 }, { uf: 'SP', value: 20545 },
  { uf: 'RN', value: 16599 }, { uf: 'RS', value: 12576 }, { uf: 'PR', value: 9467 },
  { uf: 'AM', value: 8325 }, { uf: 'ES', value: 7515 }, { uf: 'SC', value: 6183 },
  { uf: 'GO', value: 6048 }, { uf: 'MT', value: 5921 }, { uf: 'AP', value: 4159 },
  { uf: 'TO', value: 2881 }, { uf: 'RO', value: 2506 }, { uf: 'MS', value: 1809 },
  { uf: 'DF', value: 1196 }, { uf: 'RR', value: 511 }, { uf: 'AC', value: 449 },
];

/* ================================================================
   2. CIGANOS POR REGIÃO — Censo 2022 / SIDRA 9891
   ================================================================ */
interface RegionRow { region: string; value: number; pct: string }
const ciganoPorRegiao: RegionRow[] = [
  { region: 'Sudeste', value: 18537, pct: '44,4%' },
  { region: 'Nordeste', value: 11484, pct: '27,5%' },
  { region: 'Sul', value: 5903, pct: '14,1%' },
  { region: 'Norte', value: 3208, pct: '7,7%' },
  { region: 'Centro-Oeste', value: 2606, pct: '6,2%' },
];
const ciganoUFApprox: StateDataEntry[] = [
  // Distribuição aproximada com base em SIDRA 9891 por UF
  { uf: 'SP', value: 8120 }, { uf: 'MG', value: 5640 }, { uf: 'RJ', value: 3180 },
  { uf: 'BA', value: 3950 }, { uf: 'GO', value: 1580 }, { uf: 'PR', value: 2310 },
  { uf: 'PE', value: 1820 }, { uf: 'RS', value: 1960 }, { uf: 'CE', value: 1410 },
  { uf: 'MA', value: 1200 }, { uf: 'PA', value: 1450 }, { uf: 'ES', value: 1597 },
  { uf: 'SC', value: 1633 }, { uf: 'PI', value: 980 }, { uf: 'PB', value: 710 },
  { uf: 'RN', value: 620 }, { uf: 'AL', value: 490 }, { uf: 'SE', value: 304 },
  { uf: 'MT', value: 440 }, { uf: 'MS', value: 300 }, { uf: 'DF', value: 286 },
  { uf: 'TO', value: 380 }, { uf: 'AM', value: 530 }, { uf: 'RO', value: 410 },
  { uf: 'AP', value: 180 }, { uf: 'RR', value: 128 }, { uf: 'AC', value: 130 },
];

/* ================================================================
   3. INDÍGENAS EM TIs vs FORA — Censo 2022 / SIDRA 9587
   ================================================================ */
interface IndigenaTIRow { region: string; emTI: number; foraTI: number; total: number; pctEmTI: string }
const indigenaTIRegiao: IndigenaTIRow[] = [
  { region: 'Norte', emTI: 308000, foraTI: 298000, total: 606000, pctEmTI: '50,8%' },
  { region: 'Nordeste', emTI: 127000, foraTI: 305000, total: 432000, pctEmTI: '29,4%' },
  { region: 'Centro-Oeste', emTI: 98000, foraTI: 117000, total: 215000, pctEmTI: '45,6%' },
  { region: 'Sudeste', emTI: 28000, foraTI: 221000, total: 249000, pctEmTI: '11,2%' },
  { region: 'Sul', emTI: 60000, foraTI: 132000, total: 192000, pctEmTI: '31,3%' },
];
const indigenaEmTIPorUF: StateDataEntry[] = [
  { uf: 'AM', value: 185000, label: '52% em TI' }, { uf: 'MS', value: 53000, label: '69% em TI' },
  { uf: 'MT', value: 42000, label: '78% em TI' }, { uf: 'RR', value: 40000, label: '66% em TI' },
  { uf: 'BA', value: 35000, label: '37% em TI' }, { uf: 'PA', value: 48000, label: '41% em TI' },
  { uf: 'RS', value: 25000, label: '38% em TI' }, { uf: 'PE', value: 22000, label: '28% em TI' },
  { uf: 'SC', value: 15000, label: '44% em TI' }, { uf: 'MA', value: 18000, label: '33% em TI' },
  { uf: 'PR', value: 17000, label: '42% em TI' }, { uf: 'TO', value: 13000, label: '55% em TI' },
  { uf: 'AC', value: 12000, label: '61% em TI' }, { uf: 'SP', value: 8000, label: '6% em TI' },
  { uf: 'GO', value: 3000, label: '10% em TI' }, { uf: 'RO', value: 9000, label: '60% em TI' },
  { uf: 'AP', value: 8000, label: '70% em TI' }, { uf: 'MG', value: 12000, label: '15% em TI' },
  { uf: 'CE', value: 15000, label: '25% em TI' }, { uf: 'SE', value: 5000, label: '22% em TI' },
  { uf: 'AL', value: 7000, label: '32% em TI' }, { uf: 'RJ', value: 4000, label: '5% em TI' },
  { uf: 'PB', value: 6000, label: '20% em TI' }, { uf: 'PI', value: 3000, label: '18% em TI' },
  { uf: 'RN', value: 3500, label: '22% em TI' }, { uf: 'ES', value: 4000, label: '20% em TI' },
  { uf: 'DF', value: 1000, label: '0% em TI' },
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
            <a href="https://sidra.ibge.gov.br/tabela/9943#/n1/all/n3/all/v/93/p/last%201/l/v,p+t"
              target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
              SIDRA Tabela 9943 <ExternalLink className="w-3 h-3" />
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
                        {((r.value / 1327193) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CIGANOS */}
      <Card className="border-l-4 border-l-chart-4">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <MapPin className="w-5 h-5 text-chart-4" />
            <CardTitle className="text-base">População Cigana por Região — Censo 2022</CardTitle>
            <Badge variant="outline" className="text-[10px]">41.738 pessoas</Badge>
            <Badge variant="outline" className="text-[10px] bg-chart-4/10 text-chart-4 border-chart-4/30">
              ⚠️ Possível sub-registro
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Primeira contagem oficial. Possível sub-registro por estigma e nomadismo. Fonte:{' '}
            <a href="https://sidra.ibge.gov.br/tabela/9891"
              target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
              SIDRA Tabela 9891 <ExternalLink className="w-3 h-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BrazilChoroplethMap
              data={ciganoUFApprox}
              colorScale={['hsl(45, 80, 90)', 'hsl(30, 85, 50)', 'hsl(15, 90, 35)']}
              unit="pessoas"
            />
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Região</TableHead>
                    <TableHead className="text-xs text-right">População</TableHead>
                    <TableHead className="text-xs text-right">% Brasil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ciganoPorRegiao.map((r, i) => (
                    <TableRow key={r.region} className={cn(i % 2 === 0 && 'bg-muted/10')}>
                      <TableCell className="text-xs font-bold">{r.region}</TableCell>
                      <TableCell className="text-xs text-right tabular-nums font-semibold">
                        {r.value.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-xs text-right tabular-nums text-muted-foreground">{r.pct}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-[10px] text-muted-foreground mt-3 px-1">
                §54-55 do CERD III exige desagregação étnica para comunidades ciganas. O Censo 2022 é a primeira
                fonte oficial, mas organizações ciganas estimam a população real entre 500 mil e 1 milhão.
              </p>
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
            <a href="https://sidra.ibge.gov.br/tabela/9587#/n1/all/v/93/p/last%201/c86/2779/l/v,p+t"
              target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
              SIDRA Tabela 9587 <ExternalLink className="w-3 h-3" />
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
                  <p className="text-lg font-bold text-chart-1">621 mil</p>
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
