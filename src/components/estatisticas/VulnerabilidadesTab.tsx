import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts';
import { Layers, Filter, FileText, ExternalLink, AlertTriangle, ShieldAlert, Home, Utensils, Database, HardDrive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditFooter } from '@/components/ui/audit-footer';
import { EstimativaBadge } from '@/components/ui/estimativa-badge';
import { 
  interseccionalidadeTrabalhoFontes,
} from './StatisticsData';
import { useMirrorData } from '@/hooks/useMirrorData';

const vulnerabilidadeFontes = [
  { nome: 'Censo 2022/SIDRA 10179 — Chefia familiar monoparental (Raça)', url: 'https://sidra.ibge.gov.br/Tabela/10179' },
  { nome: 'Fiocruz/DSBR — Inseg. Alimentar por Raça/Gênero', url: 'https://dssbr.ensp.fiocruz.br/uma-em-cada-cinco-familias-chefiadas-por-pessoas-autodeclaradas-pardas-ou-pretas-sofre-com-a-fome-no-brasil-a-situacao-e-pior-nos-lares-chefiados-por-mulheres-pardas-ou-pretas/' },
  { nome: 'SIDRA 9553 — Insegurança Alimentar 2024', url: 'https://sidra.ibge.gov.br/tabela/9553#resultado' },
  { nome: 'MDS 2024 — Fome em lares chefiados por mulheres', url: 'https://www.gov.br/mds/pt-br/noticias-e-conteudos/desenvolvimento-social/noticias-desenvolvimento-social/lares-chefiados-por-mulheres-negras-atingem-menor-indice-de-fome-da-historia' },
  { nome: 'Censo 2022 — Arranjos domiciliares', url: 'https://sidra.ibge.gov.br/Tabela/10179' },
];

function buildVulnerabilidadeData(chefiaFamiliarRacaGenero: any) {
  const fiocruzUrl = 'https://dssbr.ensp.fiocruz.br/uma-em-cada-cinco-familias-chefiadas-por-pessoas-autodeclaradas-pardas-ou-pretas-sofre-com-a-fome-no-brasil-a-situacao-e-pior-nos-lares-chefiados-por-mulheres-pardas-ou-pretas/';
  const multidimensional = [
    {
      dimensao: 'Chefia monoparental feminina negra',
      indicador: `${chefiaFamiliarRacaGenero.percentualNegras}% das famílias monoparentais femininas são chefiadas por mulheres negras`,
      valor: chefiaFamiliarRacaGenero.percentualNegras,
      referencia: chefiaFamiliarRacaGenero.percentualBrancas,
      unidade: '%',
      fonte: 'Censo 2022/SIDRA 10179',
      url: 'https://sidra.ibge.gov.br/Tabela/10179',
      icone: Home,
    },
    {
      dimensao: 'Fome — domicílios chefiados por mulheres negras',
      indicador: `${chefiaFamiliarRacaGenero.fomeMulheresNegras}% dos lares chefiados por mulheres negras sofrem com fome (vs ${chefiaFamiliarRacaGenero.fomeMulheresBrancas}% mulheres brancas)`,
      valor: chefiaFamiliarRacaGenero.fomeMulheresNegras,
      referencia: chefiaFamiliarRacaGenero.fomeMulheresBrancas,
      unidade: '%',
      fonte: 'Fiocruz/DSBR 2023',
      url: fiocruzUrl,
      icone: AlertTriangle,
    },
    {
      dimensao: 'Segurança alimentar — domicílios chefiados por mulheres negras',
      indicador: `${chefiaFamiliarRacaGenero.fomeCriancasMulheresNegras}% em segurança alimentar (negras) vs ${chefiaFamiliarRacaGenero.segAlimentarCriancasMulheresBrancas}% (brancas)`,
      valor: chefiaFamiliarRacaGenero.fomeCriancasMulheresNegras,
      referencia: chefiaFamiliarRacaGenero.segAlimentarCriancasMulheresBrancas,
      unidade: '%',
      fonte: 'Fiocruz/DSBR 2023',
      url: fiocruzUrl,
      icone: Utensils,
      observacao: `Domicílios chefiados por homens brancos em segurança alimentar: ${chefiaFamiliarRacaGenero.segAlimentarCriancasHomensBrancos}%`,
    },
    {
      dimensao: 'Taxa de Vulnerabilidade — famílias chefiadas por mulheres negras',
      indicador: `${chefiaFamiliarRacaGenero.fomeDesempregoMulheresNegras}% (negras) vs ${chefiaFamiliarRacaGenero.fomeDesempregoHomensNegros}% (brancas)`,
      valor: chefiaFamiliarRacaGenero.fomeDesempregoMulheresNegras,
      referencia: chefiaFamiliarRacaGenero.fomeDesempregoHomensNegros,
      unidade: '%',
      fonte: 'SIDRA IBGE Tabela 10179',
      url: 'https://sidra.ibge.gov.br/Tabela/10179',
      icone: AlertTriangle,
      observacao: 'Proporção de domicílios com rendimento mensal per capita de até 1/2 salário mínimo',
    },
    {
      dimensao: 'Escolaridade não protege (mulheres negras)',
      indicador: `${chefiaFamiliarRacaGenero.iaModeradaGraveMulheresNegrasEscolarizadas}% de IA mod.+grave mesmo c/ 8+ anos estudo (vs ${chefiaFamiliarRacaGenero.iaModeradaGraveHomensBrancosEscolarizados}% homens brancos)`,
      valor: chefiaFamiliarRacaGenero.iaModeradaGraveMulheresNegrasEscolarizadas,
      referencia: chefiaFamiliarRacaGenero.iaModeradaGraveHomensBrancosEscolarizados,
      unidade: '%',
      fonte: 'Fiocruz/DSBR 2023',
      url: fiocruzUrl,
      icone: ShieldAlert,
    },
    {
      dimensao: 'CadÚnico — mulheres negras',
      indicador: chefiaFamiliarRacaGenero.cadUnicoMulheresNegras != null 
        ? `${chefiaFamiliarRacaGenero.cadUnicoMulheresNegras}% das mulheres negras estão no CadÚnico vs ${chefiaFamiliarRacaGenero.cadUnicoMulheresBrancas}% das brancas`
        : '⏳ Dados CadÚnico pendentes de verificação',
      valor: chefiaFamiliarRacaGenero.cadUnicoMulheresNegras,
      referencia: chefiaFamiliarRacaGenero.cadUnicoMulheresBrancas,
      unidade: '%',
      fonte: 'FPA Brasil/CadÚnico 2023',
      url: '',
      icone: ShieldAlert,
    },
  ];

  const barData = [
    { nome: 'Chefia monop.\n(negras)', negras: chefiaFamiliarRacaGenero.percentualNegras, brancas: chefiaFamiliarRacaGenero.percentualBrancas },
    { nome: 'CadÚnico\n(mulheres)', negras: chefiaFamiliarRacaGenero.cadUnicoMulheresNegras, brancas: chefiaFamiliarRacaGenero.cadUnicoMulheresBrancas },
    { nome: 'IA domicílios\n(negros)', negros: chefiaFamiliarRacaGenero.domiciliosNegrosIA, naoNegros: 100 - chefiaFamiliarRacaGenero.domiciliosNegrosIA },
    { nome: 'Fome\n(dom. femininos)', valor: chefiaFamiliarRacaGenero.domiciliosFemininosFome },
  ];

  return { multidimensional, barData };
}

export function VulnerabilidadesTab() {
  const { chefiaFamiliarRacaGenero, evolucaoDesigualdade, interseccionalidadeTrabalho } = useMirrorData();
  
  const { multidimensional: vulnerabilidadeMultidimensional, barData: vulnerabilidadeBarData } = buildVulnerabilidadeData(chefiaFamiliarRacaGenero);

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
            Cruzamento indireto de 5 fontes oficiais: RASEAM 2025, Fiocruz/DSBR 2023, Censo 2022, SIDRA 9553 (2024), MDS 2024
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
                      {(item as any).observacao && (
                        <p className="text-[10px] text-warning mt-1 italic">
                          ℹ️ {(item as any).observacao}
                        </p>
                      )}
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
               <strong>🔀 Cruzamento indireto de 5 fontes:</strong> RASEAM 2025 (chefia monoparental × raça) + 
               Fiocruz/DSBR 2023 (insegurança alimentar × sexo da pessoa de referência e × raça) + 
               SIDRA 9553/2024 (IA × raça/sexo) + MDS 2024 (fome × chefia feminina) + CadÚnico 2023 via Fiocruz/MIR (perfil beneficiários × raça × gênero).
              Nenhuma fonte publica todos os indicadores cruzados simultaneamente.
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <EstimativaBadge
              tipo="cruzamento"
              metodologia="Cruzamento de RASEAM 2025 × Fiocruz/DSBR 2023 × SIDRA 9553/2024 × MDS 2024 × Fiocruz/MIR 2023. Nenhuma fonte publica chefia monoparental × raça × insegurança alimentar × cadastro social conjuntamente."
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
                  <Line type="monotone" dataKey="razaoHomicidio" name="Homicídio (negros/não negros)" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium">Interpretação (19º Anuário FBSP 2025, Atlas da Violência 2025, PNAD 2024):</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• <strong>Renda:</strong> Pessoas negras ganham 58,9% do que ganham pessoas brancas (PNAD Contínua 2024)</li>
                <li>• <strong>Desemprego:</strong> Negros têm 1,5x mais desemprego que brancos (PNAD 2024)</li>
                <li>• <strong>Homicídio:</strong> 77% das vítimas são negras; risco 2,7x maior vs não negros (19º Anuário FBSP 2025 / Atlas 2025)</li>
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
              Cruzamento: Censo 2022/SIDRA 10179 + Fiocruz/DSBR 2023 + SIDRA 9553/2024 + MDS 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-center">
                  <p className="text-2xl font-bold text-destructive">{(chefiaFamiliarRacaGenero.mulheresChefesMonoparentais / 1e6).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground">Famílias monoparentais femininas</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                  <p className="text-2xl font-bold text-primary">{chefiaFamiliarRacaGenero.percentualNegras}%</p>
                  <p className="text-xs text-muted-foreground">Chefiadas por mulheres negras (SIDRA 10179)</p>
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
                    <TableCell className="text-right font-semibold text-destructive">{chefiaFamiliarRacaGenero.cadUnicoMulheresNegras}%</TableCell>
                    <TableCell className="text-right">{chefiaFamiliarRacaGenero.cadUnicoMulheresBrancas}%</TableCell>
                    <TableCell className="text-right font-semibold">{(chefiaFamiliarRacaGenero.cadUnicoMulheresNegras / chefiaFamiliarRacaGenero.cadUnicoMulheresBrancas).toFixed(1)}×</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">Chefia monoparental</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">{chefiaFamiliarRacaGenero.percentualNegras}%</TableCell>
                    <TableCell className="text-right">{chefiaFamiliarRacaGenero.percentualBrancas}%</TableCell>
                    <TableCell className="text-right font-semibold">{(chefiaFamiliarRacaGenero.percentualNegras / chefiaFamiliarRacaGenero.percentualBrancas).toFixed(1)}×</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-2 flex items-center gap-2">
                <EstimativaBadge
                  tipo="cruzamento"
                  metodologia="Censo 2022/SIDRA 10179 (chefia monoparental × raça) + SIDRA 9553/2024 (IA × raça/sexo) + MDS 2024 (fome) + CadÚnico 2023 via Fiocruz/MIR."
                />
              </div>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'Censo 2022/SIDRA 10179', url: 'https://sidra.ibge.gov.br/Tabela/10179' },
                { nome: 'SIDRA 9553 — IA 2024', url: 'https://sidra.ibge.gov.br/tabela/9553#resultado' },
                { nome: 'MDS 2024 — Fome/chefia', url: 'https://www.gov.br/mds/pt-br/noticias-e-conteudos/desenvolvimento-social/noticias-desenvolvimento-social/lares-chefiados-por-mulheres-negras-atingem-menor-indice-de-fome-da-historia' },
                { nome: 'Fiocruz/MIR — Mulheres Negras', url: 'https://fiocruz.br/sites/fiocruz.br/files/documentos_2/o_que_dizem_os_dados_sobre_a_vida_das_mulheres_negras_no_brasil.pdf' },
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
            DIEESE Infográfico Consciência Negra 2025
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
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.renda)}
                  </TableCell>
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
          <p className="text-[10px] text-muted-foreground mt-2">Fonte: DIEESE Infográfico Consciência Negra 2025.</p>
          <div className="mt-2 flex items-center gap-2">
            <EstimativaBadge
              tipo="cruzamento"
              metodologia="Cruzamento de 3 tabelas SIDRA/IBGE: rendimento por cor/raça (6800) × desocupação por cor/raça (6381) × informalidade e características gerais (6403). O IBGE não publica tabela única com renda × desemprego × informalidade por raça × sexo."
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
