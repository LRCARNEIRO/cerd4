import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts';
import { Layers, Filter, FileText, ExternalLink, AlertTriangle, ShieldAlert, Home, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditFooter } from '@/components/ui/audit-footer';
import { EstimativaBadge } from '@/components/ui/estimativa-badge';
import { 
  evolucaoDesigualdade, 
  interseccionalidadeTrabalho,
  interseccionalidadeTrabalhoFontes,
  chefiaFamiliarRacaGenero
} from './StatisticsData';

// Dados de vulnerabilidade multidimensional — cruzamento indireto auditável
// Fontes: RASEAM 2023/2024 + II VIGISAN 2022 + Censo 2022 + SIS/IBGE 2024
const vulnerabilidadeMultidimensional = [
  {
    dimensao: 'Chefia monoparental feminina negra',
    indicador: '65,8% das famílias monoparentais femininas são chefiadas por mulheres negras',
    valor: 65.8,
    referencia: 34.2, // brancas
    unidade: '%',
    fonte: 'RASEAM 2023',
    url: 'https://www.gov.br/mulheres/pt-br/observatorio-brasil-da-igualdade-de-genero/raseam/ministeriodasmulheres-obig-raseam-2024.pdf',
    icone: Home,
  },
  {
    dimensao: 'Insegurança alimentar (domicílios femininos)',
    indicador: '63% dos domicílios chefiados por mulheres vivem com insegurança alimentar',
    valor: 63.0,
    referencia: null,
    unidade: '%',
    fonte: 'II VIGISAN 2022',
    url: 'https://olheparaafome.com.br/',
    icone: Utensils,
  },
  {
    dimensao: 'Inseg. alimentar (domicílios negros)',
    indicador: '60% dos domicílios com pessoa negra de referência estão em insegurança alimentar',
    valor: 60.0,
    referencia: null,
    unidade: '%',
    fonte: 'II VIGISAN 2022',
    url: 'https://olheparaafome.com.br/',
    icone: Utensils,
  },
  {
    dimensao: 'CadÚnico — mulheres negras',
    indicador: '38,5% das mulheres negras estão no CadÚnico vs 17% das brancas',
    valor: 38.5,
    referencia: 17.0, // brancas
    unidade: '%',
    fonte: 'Fiocruz/MIR 2023',
    url: 'https://fiocruz.br/sites/fiocruz.br/files/documentos_2/o_que_dizem_os_dados_sobre_a_vida_das_mulheres_negras_no_brasil.pdf',
    icone: ShieldAlert,
  },
  {
    dimensao: 'Fome (domicílios femininos)',
    indicador: '18,8% dos domicílios chefiados por mulheres vivem em situação de fome',
    valor: 18.8,
    referencia: null,
    unidade: '%',
    fonte: 'II VIGISAN 2022',
    url: 'https://olheparaafome.com.br/',
    icone: AlertTriangle,
  },
];

const vulnerabilidadeBarData = [
  { nome: 'Chefia monop.\n(negras)', negras: 65.8, brancas: 34.2 },
  { nome: 'CadÚnico\n(mulheres)', negras: 38.5, brancas: 17.0 },
  { nome: 'IA domicílios\n(negros)', negros: 60.0, naoNegros: 40.0 },
  { nome: 'Fome\n(dom. femininos)', valor: 18.8 },
];

const vulnerabilidadeFontes = [
  { nome: 'RASEAM 2024 — Chefia familiar monoparental (PDF)', url: 'https://www.gov.br/mulheres/pt-br/observatorio-brasil-da-igualdade-de-genero/raseam/ministeriodasmulheres-obig-raseam-2024.pdf' },
  { nome: 'II VIGISAN 2022 — Insegurança Alimentar', url: 'https://olheparaafome.com.br/' },
  { nome: 'Fiocruz/MIR — Informe Mulheres Negras', url: 'https://fiocruz.br/sites/fiocruz.br/files/documentos_2/o_que_dizem_os_dados_sobre_a_vida_das_mulheres_negras_no_brasil.pdf' },
  { nome: 'Censo 2022 — Arranjos domiciliares', url: 'https://sidra.ibge.gov.br/tabela/6403' },
];

export function VulnerabilidadesTab() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Card 1: Vulnerabilidade Multidimensional — cruzamento indireto auditável */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-destructive" />
            Vulnerabilidade Multidimensional — Raça × Gênero × Renda
          </CardTitle>
          <CardDescription>
            Cruzamento indireto de 4 fontes oficiais: RASEAM 2023, II VIGISAN 2022, Censo 2022, Fiocruz/MIR 2023
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
            {vulnerabilidadeMultidimensional.map((item, i) => {
              const Icon = item.icone;
              return (
                <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                  <div className="flex items-start gap-2">
                    <Icon className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground">{item.dimensao}</p>
                      <p className="text-2xl font-bold text-destructive">{item.valor}{item.unidade}</p>
                      {item.referencia !== null && (
                        <p className="text-xs text-muted-foreground">
                          vs. {item.referencia}% (brancas)
                          <span className="ml-1 text-destructive font-medium">
                            ({(item.valor / item.referencia).toFixed(1)}×)
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                  >
                    <ExternalLink className="w-2.5 h-2.5" /> {item.fonte}
                  </a>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-2">
            <p className="text-xs font-medium flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Metodologia do cruzamento
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>🔀 Cruzamento indireto de 4 fontes:</strong> RASEAM 2023 (chefia monoparental × raça) + 
              II VIGISAN 2022 (insegurança alimentar × sexo da pessoa de referência e × raça) + 
              Censo 2022/SIDRA 6403 (arranjos domiciliares) + CadÚnico 2023 via Fiocruz/MIR (perfil beneficiários × raça × gênero).
              Nenhuma fonte publica todos os indicadores cruzados simultaneamente.
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <EstimativaBadge
              tipo="cruzamento"
              metodologia="Cruzamento de RASEAM 2023 × II VIGISAN 2022 × Censo 2022 × Fiocruz/MIR 2023. Nenhuma fonte publica chefia monoparental × raça × insegurança alimentar × cadastro social conjuntamente."
            />
          </div>

          <AuditFooter
            fontes={vulnerabilidadeFontes}
            documentos={['CERD 2022 §20', 'Common Core', 'Durban §15']}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 2: Evolução das Razões de Desigualdade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução das Razões de Desigualdade Racial (2018-2024)</CardTitle>
            <CardDescription>
              Razão entre indicadores de negros e brancos (1.0 = igualdade)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoDesigualdade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                  <YAxis domain={[1, 3]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(2), '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="razaoRenda" name="Renda (brancos/negros)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="razaoDesemprego" name="Desemprego (negros/brancos)" stroke="hsl(var(--warning))" strokeWidth={2} />
                  <Line type="monotone" dataKey="razaoHomicidio" name="Homicídio (negros/brancos)" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium">Interpretação (19º Anuário FBSP 2025, Atlas da Violência 2025, PNAD 2024):</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• <strong>Renda:</strong> Pessoas negras ganham 58,9% do que ganham pessoas brancas (PNAD Contínua 2024)</li>
                <li>• <strong>Desemprego:</strong> Negros têm 1,5x mais desemprego que brancos (PNAD 2024)</li>
                <li>• <strong>Homicídio:</strong> 77% das vítimas são negras; risco 2,7x maior (19º Anuário FBSP 2025 / Atlas 2025)</li>
              </ul>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'SIDRA 6405 — Renda por cor/raça', url: 'https://sidra.ibge.gov.br/tabela/6405' },
                { nome: 'SIDRA 6381 — Desocupação', url: 'https://sidra.ibge.gov.br/Tabela/6381' },
                { nome: '19º Anuário FBSP 2025 (PDF)', url: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf' },
                { nome: 'Atlas da Violência 2025 (PDF)', url: 'https://www.ipea.gov.br/atlasviolencia/arquivos/artigos/5999-atlasdaviolencia2025.pdf' },
              ]}
              documentos={['CERD 2022 §23', 'CERD 2022 §32-36']}
            />
          </CardContent>
        </Card>

        {/* Card 3: Perfil de vulnerabilidade — chefia familiar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Chefia Familiar e Proteção Social
            </CardTitle>
            <CardDescription>
              Cruzamento: RASEAM 2023 + Fiocruz/MIR 2023 + Censo 2022
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-center">
                  <p className="text-2xl font-bold text-destructive">4,3M</p>
                  <p className="text-xs text-muted-foreground">Famílias monoparentais femininas</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                  <p className="text-2xl font-bold text-primary">65,8%</p>
                  <p className="text-xs text-muted-foreground">Chefiadas por mulheres negras</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicador</TableHead>
                    <TableHead className="text-right">Negras</TableHead>
                    <TableHead className="text-right">Brancas</TableHead>
                    <TableHead className="text-right">Razão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-sm">CadÚnico (mulheres)</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">38,5%</TableCell>
                    <TableCell className="text-right">17,0%</TableCell>
                    <TableCell className="text-right font-semibold">2,3×</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">Chefia monoparental</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">65,8%</TableCell>
                    <TableCell className="text-right">34,2%</TableCell>
                    <TableCell className="text-right font-semibold">1,9×</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-2 flex items-center gap-2">
                <EstimativaBadge
                  tipo="cruzamento"
                  metodologia="RASEAM 2023 (chefia monoparental × raça) + CadÚnico 2023 via Fiocruz/MIR (perfil beneficiários × raça × gênero) + Censo 2022 (arranjos domiciliares)."
                />
              </div>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'RASEAM 2023', url: 'https://www.gov.br/mdh/pt-br/navegue-por-temas/politicas-para-mulheres/publicacoes-1/raseam' },
                { nome: 'Fiocruz/MIR — Mulheres Negras', url: 'https://fiocruz.br/sites/fiocruz.br/files/documentos_2/o_que_dizem_os_dados_sobre_a_vida_das_mulheres_negras_no_brasil.pdf' },
                { nome: 'Censo 2022 — Arranjos', url: 'https://sidra.ibge.gov.br/tabela/6403' },
              ]}
              documentos={['CERD 2022 §20', 'Durban §15']}
            />
          </CardContent>
        </Card>
      </div>

      {/* Card 4: Cruzamento Trabalho */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Cruzamento: Raça × Gênero (Trabalho)
          </CardTitle>
          <CardDescription>
            Dados de Q2/2024 — DIEESE / PNAD Contínua
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead className="text-right">Renda Média</TableHead>
                <TableHead className="text-right">Desemprego (%)</TableHead>
                <TableHead className="text-right">Informalidade (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interseccionalidadeTrabalho.map(item => (
                <TableRow key={item.grupo}>
                  <TableCell className="font-medium text-sm">
                    {item.grupo}
                    {item.grupo === 'Homem Negro' && (
                      <EstimativaBadge
                        tipo="simples"
                        metodologia="Renda estimada: (total negros R$2.392 × 2 − mulher negra R$2.079) ≈ R$2.676. Proporção inferida do DIEESE Q2 2024."
                        className="ml-1"
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.renda)}</TableCell>
                  <TableCell className={cn("text-right", item.desemprego > 15 && "text-destructive font-semibold")}>
                    {item.desemprego}%
                  </TableCell>
                  <TableCell className={cn("text-right", item.informalidade > 50 && "text-warning font-semibold")}>
                    {item.informalidade}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-2 flex items-center gap-2">
            <EstimativaBadge
              tipo="cruzamento"
              metodologia="Cruzamento de 3 tabelas SIDRA/IBGE: rendimento por cor/raça (6800) × desocupação por cor/raça (6381) × informalidade e características gerais (6403). O IBGE não publica tabela única com renda × desemprego × informalidade por raça × sexo × faixa etária."
            />
            <span className="text-[10px] text-muted-foreground">SIDRA 6800 × 6381 × 6403</span>
          </div>
          <AuditFooter
            fontes={interseccionalidadeTrabalhoFontes}
            documentos={['CERD 2022', 'Common Core']}
          />
        </CardContent>
      </Card>
    </div>
  );
}
