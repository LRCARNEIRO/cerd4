import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, TrendingDown, Building, Building2, MapPin } from 'lucide-react';
import { useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';
import { OrgaoSection } from './orcamento/OrgaoSection';
import { EmptyEsferaCard } from './orcamento/EmptyEsferaCard';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

export function OrcamentoTab() {
  const { data: dadosOrcamentarios, isLoading: orcLoading } = useDadosOrcamentarios();
  const { data: stats, isLoading: statsLoading } = useOrcamentoStats();

  // Group data by esfera → orgao → programa
  const grouped = useMemo(() => {
    if (!dadosOrcamentarios) return { federal: new Map(), estadual: new Map(), municipal: new Map() };

    const result = {
      federal: new Map<string, Map<string, DadoOrcamentario[]>>(),
      estadual: new Map<string, Map<string, DadoOrcamentario[]>>(),
      municipal: new Map<string, Map<string, DadoOrcamentario[]>>(),
    };

    for (const item of dadosOrcamentarios) {
      const esfera = item.esfera as keyof typeof result;
      if (!result[esfera]) continue;

      if (!result[esfera].has(item.orgao)) {
        result[esfera].set(item.orgao, new Map());
      }
      const orgaoMap = result[esfera].get(item.orgao)!;
      if (!orgaoMap.has(item.programa)) {
        orgaoMap.set(item.programa, []);
      }
      orgaoMap.get(item.programa)!.push(item);
    }

    return result;
  }, [dadosOrcamentarios]);

  const isLoading = orcLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const federalCount = grouped.federal.size;
  const estadualCount = grouped.estadual.size;
  const municipalCount = grouped.municipal.size;
  const variacaoPositiva = stats && stats.variacao > 0;

  // Count programs per esfera
  const countPrograms = (esferaMap: Map<string, Map<string, DadoOrcamentario[]>>) => {
    let count = 0;
    esferaMap.forEach(orgao => { count += orgao.size; });
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Building className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Federal ({federalCount} órgãos)</p>
            </div>
            <p className="text-xl font-bold">{countPrograms(grouped.federal)} programas</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-success" />
              <p className="text-xs text-muted-foreground">Estadual</p>
            </div>
            <p className="text-xl font-bold">{estadualCount > 0 ? `${countPrograms(grouped.estadual)} programas` : 'Sem dados'}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-chart-1" />
              <p className="text-xs text-muted-foreground">Municipal</p>
            </div>
            <p className="text-xl font-bold">{municipalCount > 0 ? `${countPrograms(grouped.municipal)} programas` : 'Sem dados'}</p>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${variacaoPositiva ? 'border-l-success' : 'border-l-destructive'}`}>
          <CardContent className="pt-4 flex items-center gap-2">
            {variacaoPositiva ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Variação 2018-22 vs 2023-26</p>
              <p className={`text-xl font-bold ${variacaoPositiva ? 'text-success' : 'text-destructive'}`}>
                {variacaoPositiva ? '+' : ''}{stats?.variacao.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="federal" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="federal">
            Programas Federais
            {federalCount > 0 && <Badge variant="secondary" className="ml-1 text-xs">{countPrograms(grouped.federal)}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="estadual">
            Programas Estaduais
            {estadualCount > 0 && <Badge variant="secondary" className="ml-1 text-xs">{countPrograms(grouped.estadual)}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="municipal">
            Programas Municipais
            {municipalCount > 0 && <Badge variant="secondary" className="ml-1 text-xs">{countPrograms(grouped.municipal)}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="federal">
          {grouped.federal.size > 0 ? (
            <div className="space-y-8">
              {Array.from(grouped.federal.entries()).map(([orgao, programas]) => (
                <OrgaoSection key={orgao} orgao={orgao} programas={programas} />
              ))}
            </div>
          ) : (
            <EmptyEsferaCard
              esfera="federais"
              descricao="Nenhum dado federal verificado encontrado no banco. Insira dados usando a edge function de ingestão ou manualmente."
            />
          )}
        </TabsContent>

        <TabsContent value="estadual">
          {grouped.estadual.size > 0 ? (
            <div className="space-y-8">
              {Array.from(grouped.estadual.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([estado, programas]) => (
                  <div key={estado} className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2 px-1">
                      <MapPin className="w-4 h-4 text-success" />
                      {estado}
                    </h3>
                    <div className="space-y-2">
                      {Array.from(programas.entries()).map(([prog, registros]) => (
                        <Card key={prog} className="p-4">
                          <p className="text-sm font-medium">{prog}</p>
                          <p className="text-xs text-muted-foreground">{registros.length} registros</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyEsferaCard
              esfera="estaduais"
              descricao="Dados estaduais ainda não foram coletados de forma verificável. Utilize as fontes SICONFI/RREO dos portais de transparência estaduais para inserir dados auditáveis por estado."
            />
          )}
        </TabsContent>

        <TabsContent value="municipal">
          {grouped.municipal.size > 0 ? (
            <div className="space-y-8">
              {Array.from(grouped.municipal.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([cidade, programas]) => (
                  <div key={cidade} className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2 px-1">
                      <MapPin className="w-4 h-4 text-chart-1" />
                      {cidade}
                    </h3>
                    <div className="space-y-2">
                      {Array.from(programas.entries()).map(([prog, registros]) => (
                        <Card key={prog} className="p-4">
                          <p className="text-sm font-medium">{prog}</p>
                          <p className="text-xs text-muted-foreground">{registros.length} registros</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <EmptyEsferaCard
              esfera="municipais"
              descricao="Dados municipais ainda não foram coletados de forma verificável. Utilize os portais de transparência municipais para inserir dados auditáveis por cidade."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
