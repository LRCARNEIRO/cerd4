import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, Globe, Target, FileText } from 'lucide-react';
import { 
  odsRacialIndicators, 
  odsGroups, 
  getOdsColor, 
  TOTAL_ODS_RACIAL,
  type OdsRacialIndicator 
} from '@/data/odsRacialIndicators';

export function OdsRacialTab() {
  const [search, setSearch] = useState('');
  const [odsFilter, setOdsFilter] = useState<string>('todos');

  const filtered = odsRacialIndicators.filter(ind => {
    const matchSearch = !search || ind.name.toLowerCase().includes(search.toLowerCase()) || 
      ind.id.toLowerCase().includes(search.toLowerCase()) ||
      ind.fonte.toLowerCase().includes(search.toLowerCase());
    const matchOds = odsFilter === 'todos' || ind.group === odsFilter;
    return matchSearch && matchOds;
  });

  // Agrupar por ODS
  const grouped = odsGroups.reduce((acc, group) => {
    const items = filtered.filter(ind => ind.group === group);
    if (items.length > 0) acc.push({ group, items });
    return acc;
  }, [] as { group: string; items: OdsRacialIndicator[] }[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4" style={{ borderLeftColor: '#DD1367' }}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Globe className="w-6 h-6 flex-shrink-0" style={{ color: '#DD1367' }} />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Plataforma ODS Racial — ODSR/UFPB
              </h3>
              <p className="text-sm text-muted-foreground">
                Catálogo completo de <strong>{TOTAL_ODS_RACIAL} indicadores</strong> de igualdade étnico-racial, 
                organizados por Objetivos de Desenvolvimento Sustentável (ODS). 
                Dados desagregados por raça/cor (Amarela, Branca, Negra, Indígena) com séries temporais 2018-2025.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="text-xs" style={{ backgroundColor: '#DD1367', color: 'white' }}>
                  {TOTAL_ODS_RACIAL} Indicadores
                </Badge>
                <Badge variant="outline" className="text-xs">RAIS/MTE</Badge>
                <Badge variant="outline" className="text-xs">DataSUS (SIM/SIH/SINAN/SINASC)</Badge>
                <Badge variant="outline" className="text-xs">INEP (Censo Escolar/IDEB/ENEM)</Badge>
                <Badge variant="outline" className="text-xs">TSE</Badge>
                <Badge variant="outline" className="text-xs">CadÚnico/MDS</Badge>
              </div>
              <a 
                href="https://odsr.lema.ufpb.br/tabelas?region=brasil-br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs mt-2 hover:underline"
                style={{ color: '#DD1367' }}
              >
                <ExternalLink className="w-3 h-3" /> Acessar plataforma ODSR
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar indicador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={odsFilter} onValueChange={setOdsFilter}>
          <SelectTrigger className="w-full sm:w-[320px]">
            <SelectValue placeholder="Filtrar por ODS" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os ODS ({TOTAL_ODS_RACIAL})</SelectItem>
            {odsGroups.map(g => {
              const count = odsRacialIndicators.filter(i => i.group === g).length;
              return (
                <SelectItem key={g} value={g}>
                  {g} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Contagem */}
      <p className="text-sm text-muted-foreground">
        Exibindo <strong>{filtered.length}</strong> de {TOTAL_ODS_RACIAL} indicadores
      </p>

      {/* Indicadores agrupados por ODS */}
      {grouped.map(({ group, items }) => {
        const color = getOdsColor(group);
        const odsNum = group.match(/ODS (\d+)/)?.[1] || '';
        return (
          <Card key={group} className="border-l-4" style={{ borderLeftColor: color }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span 
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {odsNum}
                </span>
                {group}
                <Badge variant="outline" className="ml-auto text-xs">{items.length} indicadores</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-border">
                {items.map(ind => (
                  <div key={ind.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {ind.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {ind.fonte}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {ind.id}
                          </span>
                          {ind.artigoCerd?.map(art => (
                            <Badge key={art} variant="outline" className="text-[10px] px-1.5 py-0">
                              <FileText className="w-2.5 h-2.5 mr-0.5" />{art}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <a
                        href={ind.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors"
                      >
                        <Target className="w-3 h-3" />
                        <span className="hidden sm:inline">Ver série</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum indicador encontrado para o filtro aplicado.
          </CardContent>
        </Card>
      )}

      {/* Nota metodológica */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground">
            <strong>Nota Metodológica:</strong> Os indicadores são provenientes da Plataforma ODS Racial (ODSR/UFPB), 
            vinculada ao Governo Federal. Os dados são desagregados por raça/cor (Amarela, Branca, Negra, Indígena) 
            utilizando fontes primárias oficiais. Cada indicador possui deep link direto para a plataforma ODSR, 
            onde podem ser consultadas as séries temporais completas e a metodologia de cálculo. 
            Recorte temporal do projeto: 2018-2025.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
