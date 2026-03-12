import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { 
  Heart, GraduationCap, Users, AlertTriangle, Baby, Briefcase, Rainbow, Accessibility, FileText, ExternalLink, TrendingUp, Info, Home, Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditFooter } from '@/components/ui/audit-footer';
import { EstimativaBadge } from '@/components/ui/estimativa-badge';
import { atlasViolencia2025 } from './StatisticsData';
import {
  narrativaViolencia, narrativaTrabalho, narrativaChefia,
  narrativaSaudeMaterna, narrativaEducacao, narrativaLGBTQIA,
  fmt,
} from '@/utils/narrativeHelpers';
import { 
  violenciaInterseccional, 
  lacunasDocumentadas,
  lgbtqiaPorRaca,
  serieAntraTrans,
  deficienciaPorRaca,
  juventudeNegra,
  classePorRaca,
  povosTradicionais,
  fonteDados,
  trabalhoRacaGenero,
  trabalhoRacaGeneroFontes,
  chefiaFamiliarRacaGenero,
  educacaoRacaGenero,
  educacaoRacaGeneroFontes,
  saudeMaternaRaca,
} from './StatisticsData';

export function RacaGeneroTab() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* ═══ 1. Violência + Mercado de Trabalho ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive" />
              Violência contra Mulheres por Raça (%)
            </CardTitle>
            <CardDescription>19º Anuário FBSP 2025 (dados 2024)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={violenciaInterseccional} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="tipo" type="category" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="mulherNegra" name="Mulher Negra" fill="hsl(var(--destructive))" stackId="a" />
                  <Bar dataKey="mulherBranca" name="Mulher Branca" fill="hsl(var(--chart-1))" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground">
                <FileText className="w-3 h-3 inline mr-1" />
                Mulheres negras são 63,6% das vítimas de feminicídio (19º Anuário FBSP 2025, dados 2024). Em 2018: 61%.
              </p>
              <a href="https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> 19º Anuário FBSP 2025 (PDF)
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Mercado de Trabalho por Raça × Gênero
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              DIEESE/PNAD Q2 2024
              <EstimativaBadge tipo="cruzamento" metodologia="Cálculo: rendimento, desemprego e informalidade por raça × gênero extraídos do Boletim DIEESE 'Consciência Negra' (Nov/2024, p.5-12, dados PNAD Contínua Q2/2024). O IBGE/PNAD não publica tabela única com os 3 indicadores cruzados por raça e sexo. DIEESE consolida a partir de microdados. Link: dieese.org.br/boletimespecial/2024/boletimEspecial02.html" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicador</TableHead>
                  <TableHead className="text-right">H. Branco</TableHead>
                  <TableHead className="text-right">M. Branca</TableHead>
                  <TableHead className="text-right">H. Negro</TableHead>
                  <TableHead className="text-right text-destructive">M. Negra</TableHead>
                  <TableHead className="text-right">Razão M.N/H.B</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trabalhoRacaGenero.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-sm">{item.indicador}</TableCell>
                    <TableCell className="text-right text-sm">
                      {item.unidade === 'R$' ? formatCurrency(item.homemBranco) : `${item.homemBranco}%`}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.unidade === 'R$' ? formatCurrency(item.mulherBranca) : `${item.mulherBranca}%`}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.unidade === 'R$' ? formatCurrency(item.homemNegro) : `${item.homemNegro}%`}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-destructive">
                      {item.unidade === 'R$' ? formatCurrency(item.mulherNegra) : `${item.mulherNegra}%`}
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold text-destructive">
                      {item.razaoMulherNegraHomemBranco < 1
                        ? `${(item.razaoMulherNegraHomemBranco * 100).toFixed(0)}%`
                        : `${item.razaoMulherNegraHomemBranco.toFixed(1)}x`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AuditFooter fontes={trabalhoRacaGeneroFontes} documentos={['CERD 2022 §21', 'Common Core']} />
          </CardContent>
        </Card>
      </div>

      {/* Análise: Violência + Mercado de Trabalho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <h4 className="text-sm font-semibold text-destructive mb-1">📊 Análise: Violência de Gênero Racializada</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mulheres negras representam <strong>{fmt(narrativaViolencia.feminicidioNegrasPct)}%</strong> das vítimas de feminicídio (2024), proporção que cresceu em relação a 2018 ({fmt(narrativaViolencia.feminicidio2018Pct, 0)}%). 
            A sobreposição raça + gênero configura <strong>risco desproporcional e crescente</strong>, evidenciando falha 
            na efetividade das políticas de proteção para esse grupo. A CERD (§29-30) recomenda ações afirmativas específicas.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 italic">Fonte: 19º Anuário FBSP 2025 · Art. 5(b) ICERD</p>
        </div>
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="text-sm font-semibold text-primary mb-1">📊 Análise: Dupla Penalidade no Mercado de Trabalho</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A mulher negra recebe <strong>{fmt(narrativaTrabalho.razaoRendaPct)}%</strong> do rendimento do homem branco, demonstrando que raça e gênero 
            operam como <strong>vetores cumulativos de desigualdade</strong>. A desocupação feminina negra ({fmt(narrativaTrabalho.desempregoMulherNegra)}%) é 
            {fmt(narrativaTrabalho.razaoDesemprego)}× superior à masculina branca ({fmt(narrativaTrabalho.desempregoHomemBranco)}%), e a informalidade negra feminina ({fmt(narrativaTrabalho.informalidadeMulherNegra)}%) inviabiliza proteção social. 
            O cruzamento confirma o <strong>"piso pegajoso"</strong> descrito na literatura interseccional.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 italic">Fonte: DIEESE Q2/2024 · Art. 5(e)(i) ICERD</p>
        </div>
      </div>

      {/* ═══ 2. Chefia Familiar + Saúde Materna ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="w-5 h-5 text-warning" />
              Chefia Familiar e Vulnerabilidade por Raça × Gênero
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              RASEAM 2023 + II VIGISAN 2022 + CadÚnico 2023
              <EstimativaBadge tipo="cruzamento" metodologia={chefiaFamiliarRacaGenero.metodologia} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Mulheres chefes monoparentais</p>
                <p className="text-xl font-bold">{(chefiaFamiliarRacaGenero.mulheresChefesMonoparentais / 1_000_000).toFixed(1)} mi</p>
                <p className="text-xs font-medium text-destructive">{chefiaFamiliarRacaGenero.percentualNegras}% negras</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Homens chefes monoparentais</p>
                <p className="text-xl font-bold">{(chefiaFamiliarRacaGenero.homensChefesMonoparentais / 1_000).toFixed(0)} mil</p>
                <p className="text-xs text-muted-foreground">8,6× menor</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">Domicílios femininos c/ insegurança alimentar</span>
                <span className="text-sm font-bold text-destructive">{chefiaFamiliarRacaGenero.domiciliosFemininosIA}%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">Destes, em situação de fome</span>
                <span className="text-sm font-bold text-destructive">{chefiaFamiliarRacaGenero.domiciliosFemininosFome}%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">Mulheres negras no CadÚnico</span>
                <span className="text-sm font-bold">{chefiaFamiliarRacaGenero.cadUnicoMulheresNegras}%</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                <span className="text-sm">Mulheres brancas no CadÚnico</span>
                <span className="text-sm font-bold">{chefiaFamiliarRacaGenero.cadUnicoMulheresBrancas}%</span>
              </div>
            </div>
            <AuditFooter fontes={chefiaFamiliarRacaGenero.fontes} documentos={['CERD 2022 §21', 'Common Core']} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-destructive" />
              Saúde Materna por Raça
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              RASEAM 2025 (SIM {saudeMaternaRaca.anoReferencia}) + IEPS Jul/2025 (série até 2023) + Fiocruz
              <EstimativaBadge tipo="cruzamento" metodologia={saudeMaternaRaca.metodologia} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Mortes maternas negras</p>
                <p className="text-2xl font-bold text-destructive">{saudeMaternaRaca.mortalidadeMaternaNegraPercentual}%</p>
                <p className="text-xs text-muted-foreground">(SIM {saudeMaternaRaca.anoReferencia})</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Mortes maternas brancas</p>
                <p className="text-2xl font-bold">{saudeMaternaRaca.mortalidadeMaternaBrancaPercentual}%</p>
                <p className="text-xs text-muted-foreground">(SIM {saudeMaternaRaca.anoReferencia})</p>
              </div>
            </div>
            {/* IEPS — dado mais recente disponível (série até 2023) */}
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg mb-3">
              <p className="text-xs flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
                <span>
                  <strong>IEPS Boletim Jul/2025 ({saudeMaternaRaca.periodoIEPS}):</strong> Razão de mortalidade materna pretas/brancas = <strong>{saudeMaternaRaca.razaoMortalidadePretasBrancas}×</strong> ({saudeMaternaRaca.taxaPretasPor100milNV} vs {saudeMaternaRaca.taxaBrancasPor100milNV} por 100 mil NV). Pardas: {saudeMaternaRaca.taxaPardasPor100milNV}/100 mil NV.
                </span>
              </p>
            </div>
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg mb-3">
              <p className="text-xs flex items-start gap-1">
                <Info className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
                <span><strong>Nascer no Brasil II (Fiocruz):</strong> {saudeMaternaRaca.nascerBrasil2Nota}</span>
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs">
                <strong>Grupo de risco ampliado:</strong> {saudeMaternaRaca.violenciaObstetricaGrupoRisco}
              </p>
            </div>
            <AuditFooter fontes={saudeMaternaRaca.fontes} documentos={['CERD 2022 §27-28', 'Common Core']} />
          </CardContent>
        </Card>
      </div>

      {/* Análise: Chefia Familiar + Saúde Materna */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
          <h4 className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--warning))' }}>📊 Análise: Feminização e Racialização da Pobreza</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>{fmt(narrativaChefia.percentualNegras)}%</strong> dos {(narrativaChefia.totalMulheres ?? 0).toLocaleString('pt-BR')} lares monoparentais femininos são chefiados por mulheres negras 
            ({(narrativaChefia.totalMulheresNegras ?? 0).toLocaleString('pt-BR')} domicílios, Censo 2022).
            {narrativaChefia.cadUnicoNegras != null ? ` Respondem por ${fmt(narrativaChefia.cadUnicoNegras)}% das inscritas no CadÚnico (vs ${fmt(narrativaChefia.cadUnicoBrancas, 0)}% das brancas).` : ' Dados CadÚnico pendentes de verificação.'}
            {' '}A insegurança alimentar atinge {fmt(narrativaChefia.domiciliosIA, 0)}% desses domicílios, 
            com {fmt(narrativaChefia.domiciliosFome)}% em situação de fome. O cruzamento revela um <strong>ciclo de vulnerabilidade estrutural</strong> onde 
            gênero e raça se retroalimentam na reprodução da pobreza intergeracional.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 italic">Fonte: Censo 2022/SIDRA 10179-10182 + II VIGISAN 2022 · Art. 5(e)(iv) ICERD</p>
        </div>
        <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <h4 className="text-sm font-semibold text-destructive mb-1">📊 Análise: Racismo Obstétrico e Mortalidade Materna</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Mulheres negras constituem <strong>{fmt(narrativaSaudeMaterna.mortesNegrasPct, 0)}%</strong> das mortes maternas (SIM {narrativaSaudeMaterna.anoSIM}), apesar de representarem {fmt(narrativaSaudeMaterna.popFemininaNegraPct)}% da 
            população feminina. O Boletim IEPS (jul/2025) confirma que a razão de mortalidade materna entre pretas e brancas é de 
            <strong>{fmt(narrativaSaudeMaterna.razaoIEPS)}×</strong> na série 2010-2023 ({fmt(narrativaSaudeMaterna.taxaPretasIEPS)} vs {fmt(narrativaSaudeMaterna.taxaBrancasIEPS)} por 100 mil NV). O estudo Nascer no Brasil II (Fiocruz) documenta 
            <strong>menor acesso a pré-natal adequado, peregrinação hospitalar</strong> e menor uso de analgesia no parto entre negras. 
            Nota: o dado mais recente consolidado do SIM é {narrativaSaudeMaterna.anoSIM}; o RASEAM 2025 mantém esse recorte.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 italic">Fontes: RASEAM 2025 + IEPS Jul/2025 + Fiocruz 2023 · Art. 5(e)(iv) ICERD</p>
        </div>
      </div>

      {/* ═══ 3. Educação ═══ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Educação por Raça × Gênero
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Informe MIR 2023 + PNAD Educação 2023 + Fiocruz
            <EstimativaBadge tipo="cruzamento" metodologia="Cruzamento de 3 fontes: (1) Informe MIR/Fiocruz 2023 — analfabetismo e escolaridade por raça × gênero (fiocruz.br/sites/fiocruz.br/files/documentos_2/o_que_dizem_os_dados_sobre_a_vida_das_mulheres_negras_no_brasil.pdf); (2) PNAD Educação 2023 — taxa analfabetismo geral por raça (sidra.ibge.gov.br/Tabela/7113); (3) INEP Censo Escolar 2022 — matrículas por cor/raça (inep.gov.br/censo-escolar). Nenhuma fonte publica todos os indicadores educacionais cruzados por raça × gênero conjuntamente." />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead className="text-right">M. Negra</TableHead>
                <TableHead className="text-right">M. Branca</TableHead>
                <TableHead className="text-right">H. Negro</TableHead>
                <TableHead className="text-right">H. Branco</TableHead>
                <TableHead>Nota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {educacaoRacaGenero.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium text-sm">{item.indicador}</TableCell>
                  <TableCell className="text-right text-sm font-semibold text-destructive">{item.mulherNegra}%</TableCell>
                  <TableCell className="text-right text-sm">{item.mulherBranca}%</TableCell>
                  <TableCell className="text-right text-sm">{item.homemNegro}%</TableCell>
                  <TableCell className="text-right text-sm">{item.homemBranco}%</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px]">{item.nota}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AuditFooter fontes={educacaoRacaGeneroFontes} documentos={['CERD 2022 §25-26', 'Common Core']} />
        </CardContent>
      </Card>

      {/* Análise: Educação */}
      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <h4 className="text-sm font-semibold text-primary mb-1">📊 Análise: Educação — Avanço Insuficiente com Gap Persistente</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          A conclusão do ensino superior entre mulheres negras (<strong>{fmt(narrativaEducacao.superiorMulherNegra)}%</strong>) é metade da taxa de mulheres brancas ({fmt(narrativaEducacao.superiorMulherBranca, 0)}%), 
          apesar dos avanços com cotas (Lei 12.711/2012). Mulheres negras abandonam mais a escola por necessidade de trabalho 
          e cuidado. O cruzamento indica que <strong>políticas universais de expansão do ensino superior não eliminam a 
          desigualdade racial-de-gênero</strong> sem ações afirmativas complementares.
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 italic">Fonte: MIR 2023 + PNAD Educação 2023 · Art. 5(e)(v) ICERD</p>
      </div>

      {/* ═══ Conclusão Transversal ═══ */}
      <div className="p-4 bg-foreground/5 border-2 border-foreground/20 rounded-lg">
        <h4 className="text-sm font-bold mb-2">⚖️ Conclusão Transversal — Raça × Gênero</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Os cinco subtemas convergem para uma conclusão central: <strong>a interseção raça × gênero produz desvantagens 
          que não são capturadas por análises unidimensionais</strong>. Mulheres negras ocupam sistematicamente a posição 
          mais vulnerável em todos os indicadores analisados — violência, renda, moradia, saúde e educação. 
          Essa convergência sustenta a recomendação de que o CERD IV adote uma <strong>abordagem explicitamente 
          interseccional</strong> em todas as seções, conforme Recomendação Geral nº 25 e §21 das Observações Finais 2022.
        </p>
      </div>
    </div>
  );
}

export function PovosTradicionaisTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Indígenas */}
        <Card className="border-t-4 border-t-accent">
          <CardHeader>
            <CardTitle className="text-base">Povos Indígenas</CardTitle>
            <CardDescription>
              Censo 2022: {povosTradicionais.indigenas.populacaoPessoasIndigenas.toLocaleString('pt-BR')} pessoas indígenas
              <br />
              <span className="text-xs">(cor/raça: {povosTradicionais.indigenas.populacaoCorRaca.toLocaleString('pt-BR')})</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Terras 2018-2022</p>
                <p className="text-xl font-bold text-destructive">{povosTradicionais.indigenas.terrasHomologadas2018_2022}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Terras 2023-2025</p>
                <p className="text-xl font-bold text-success">{povosTradicionais.indigenas.terrasHomologadas2023_2025}</p>
              </div>
            </div>
             <div className="space-y-2">
              {povosTradicionais.indigenas.mortalidadeInfantil != null ? (
                <div className="flex justify-between text-sm">
                  <span>Mortalidade infantil (‰)</span>
                  <span className="font-semibold text-destructive">{povosTradicionais.indigenas.mortalidadeInfantil}</span>
                </div>
              ) : (
                <div className="p-2 bg-destructive/5 rounded text-xs text-muted-foreground">
                  <strong className="text-destructive">Mortalidade infantil:</strong> Dado removido — sem fonte auditável (SESAI não publica taxa consolidada desagregada)
                </div>
              )}
              {povosTradicionais.indigenas.acessoSaude != null ? (
                <div className="flex justify-between text-sm">
                  <span>Acesso regular à saúde</span>
                  <span className="font-semibold">{povosTradicionais.indigenas.acessoSaude}%</span>
                </div>
              ) : (
                <div className="p-2 bg-destructive/5 rounded text-xs text-muted-foreground">
                  <strong className="text-destructive">Acesso à saúde:</strong> Dado removido — sem fonte auditável
                </div>
              )}
              {povosTradicionais.indigenas.educacaoBilingue != null ? (
                <div className="flex justify-between text-sm">
                  <span>Educação bilíngue</span>
                  <span className="font-semibold text-warning">{povosTradicionais.indigenas.educacaoBilingue}%</span>
                </div>
              ) : (
                <div className="p-2 bg-destructive/5 rounded text-xs text-muted-foreground">
                  <strong className="text-destructive">Educação bilíngue:</strong> Dado removido — sem fonte auditável
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quilombolas */}
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-base">Comunidades Quilombolas</CardTitle>
            <CardDescription>Censo 2022: {povosTradicionais.quilombolas.populacao.toLocaleString('pt-BR')} pessoas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Certificadas</p>
                <p className="text-xl font-bold">{povosTradicionais.quilombolas.comunidadesCertificadas.toLocaleString('pt-BR')}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Territórios Titulados</p>
                <p className="text-xl font-bold text-warning">{povosTradicionais.quilombolas.territoriosTitulados}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rede geral de água</span>
                <span className="font-semibold text-warning">{povosTradicionais.quilombolas.acessoRedeAgua}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Esgotamento adequado</span>
                <span className="font-semibold text-destructive">{povosTradicionais.quilombolas.esgotamentoAdequado}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Coleta de lixo</span>
                <span className="font-semibold">{povosTradicionais.quilombolas.coletaLixo}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ciganos */}
        <Card className="border-t-4 border-t-warning">
          <CardHeader>
            <CardTitle className="text-base">Povos Ciganos (Rom, Calon, Sinti)</CardTitle>
            <CardDescription>Sem dados censitários desagregados</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-xs font-medium text-destructive">⚠️ Dados Removidos — Regra de Ouro</p>
              <p className="text-xs text-muted-foreground mt-1">
                Os dados anteriores (população 800 mil, educação 12,5%, documentação 35,2%, saúde 28,5%) 
                <strong> não possuíam fonte auditável</strong>. Foram removidos.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Acampamentos identificados</span>
                <span className="font-semibold">{povosTradicionais.ciganos.acampamentosIdentificados}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Fonte: MUNIC/IBGE 2019</p>
            </div>
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
              <p className="text-xs font-medium text-warning">Lacuna Crítica</p>
              <p className="text-xs text-muted-foreground mt-1">
                {povosTradicionais.ciganos.lacunaDocumentada}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fontes oficiais Povos Tradicionais */}
      <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" /> <strong>Fontes oficiais:</strong>
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <a href="https://sidra.ibge.gov.br/Tabela/9605" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> SIDRA 9605 — Cor/raça
          </a>
          <a href="https://sidra.ibge.gov.br/Tabela/9578" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> SIDRA 9578 — Quilombolas
          </a>
          <a href="https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> IBGE — Indígenas
          </a>
          <a href="https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22327-quilombolas.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> IBGE — Quilombolas
          </a>
          <a href="https://www.gov.br/funai/pt-br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> FUNAI
          </a>
          <a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> INCRA — Quilombolas
          </a>
        </div>
      </div>

      <Card className="border-l-4 border-l-warning">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">Lacunas Críticas Identificadas pelo Comitê CERD</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Indígenas:</strong> Paralisia na demarcação de terras (2019-2022) e aumento de conflitos fundiários</li>
                <li>• <strong>Quilombolas:</strong> Apenas 5% das comunidades certificadas foram tituladas; déficit de infraestrutura básica</li>
                <li>• <strong>Ciganos:</strong> Ausência de políticas específicas até 2024; inexistência de dados desagregados no Censo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LgbtqiaTab() {
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Intersecção LGBTQIA+ × Raça — Dados de Pessoas Trans e Travestis</h3>
              <p className="text-sm text-muted-foreground">
                Os dados desta aba referem-se exclusivamente a <strong>pessoas trans e travestis assassinadas</strong>, conforme documentado pelo Dossiê ANTRA. 
                Em 2025, {narrativaLGBTQIA.vitimasNegras2025}% das vítimas eram negras. O Brasil segue líder mundial nesta violência, com mulheres trans negras sendo as mais vulneráveis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico: Perfil das vítimas por raça e etnia — reproduz gráfico oficial ANTRA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Rainbow className="w-5 h-5 text-primary" />
            Assassinatos de Pessoas Trans e Travestis por Raça — 2017-2025 (%)
          </CardTitle>
          <CardDescription>Dossiê ANTRA — série histórica completa. Média: Negros {narrativaLGBTQIA.mediaSerieNegros}%, Não Negros {100 - narrativaLGBTQIA.mediaSerieNegros - 1}%, Indígenas 1%</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serieAntraTrans}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="negros" name="Negros (pretos e pardos)" fill="hsl(var(--chart-1))" />
                <Bar dataKey="brancos" name="Não Negros" fill="hsl(var(--muted-foreground))" opacity={0.5} />
                <Bar dataKey="indigenas" name="Indígenas" fill="hsl(var(--destructive))" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <AuditFooter
            fontes={[
              { nome: 'ANTRA — Dossiê 2026 (dados 2025), p.30', url: 'https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf' },
              { nome: 'ANTRA — Página Assassinatos', url: 'https://antrabrasil.org/assassinatos/' },
            ]}
            documentos={['CERD 2022', 'Plano de Durban']}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela da série com recorte racial completo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados Anuais — Assassinatos de Pessoas Trans e Travestis</CardTitle>
            <CardDescription>Dossiê ANTRA — perfil racial das vítimas (2017-2025)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">% Negros</TableHead>
                  <TableHead className="text-right">% Não Negros</TableHead>
                  <TableHead className="text-right">% Indígenas</TableHead>
                  <TableHead>Dossiê</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serieAntraTrans.map(item => (
                  <TableRow key={item.ano}>
                    <TableCell className="font-medium">{item.ano}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">{item.totalAssassinatos}</TableCell>
                    <TableCell className="text-right">{item.negros}%</TableCell>
                    <TableCell className="text-right">{item.brancos}%</TableCell>
                    <TableCell className="text-right">{item.indigenas > 0 ? `${item.indigenas}%` : '—'}</TableCell>
                    <TableCell>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> PDF
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AuditFooter
              fontes={[
                { nome: 'ANTRA — Todos os dossiês', url: 'https://antrabrasil.org/assassinatos/' },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados-Chave (2025)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                <p className="text-xs text-muted-foreground">Assassinatos (2025)</p>
                <p className="text-2xl font-bold text-destructive">{narrativaLGBTQIA.assassinatos2025}</p>
                <p className="text-xs text-muted-foreground">{narrativaLGBTQIA.variacaoVs2024}% vs 2024</p>
              </div>
              <div className="p-3 bg-chart-1/10 rounded-lg border border-chart-1/30">
                <p className="text-xs text-muted-foreground">Vítimas negras</p>
                <p className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-1))' }}>{narrativaLGBTQIA.vitimasNegras2025}%</p>
                <p className="text-xs text-muted-foreground">Média série: {narrativaLGBTQIA.mediaSerieNegros}%</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                <p className="text-xs text-muted-foreground">Vítimas indígenas</p>
                <p className="text-2xl font-bold text-accent-foreground">{narrativaLGBTQIA.vitimasIndigenas2025}%</p>
                <p className="text-xs text-muted-foreground">Maior % da série</p>
              </div>
            </div>
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium mb-1">Tendência 2017→2025</p>
              <p className="text-xs text-muted-foreground">
                Assassinatos: {narrativaLGBTQIA.assassinatos2017} → {narrativaLGBTQIA.assassinatos2025} ({narrativaLGBTQIA.reducaoSerie}%), porém aumento de 45% em tentativas de homicídio (2024→2025). 
                Vítimas negras: mantiveram-se acima de 70% em toda a série (média {narrativaLGBTQIA.mediaSerieNegros}%). 
                Vítimas indígenas: de 0% (2017-2020) para {narrativaLGBTQIA.vitimasIndigenas2025}% em 2025, revelando vulnerabilidade crescente.
              </p>
            </div>
            <div className="p-4 bg-chart-4/10 rounded-lg border border-chart-4/30">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-chart-4" />
                Limitações das Fontes sobre Violência × Sexualidade × Raça
              </p>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li><strong>ANTRA Dossiê:</strong> Cobre apenas assassinatos de <strong>pessoas trans e travestis</strong>, com recorte racial. Não inclui outras identidades LGBTQIA+.</li>
                <li><strong>FBSP Anuário:</strong> Homicídios, feminicídios e letalidade policial com recorte racial e etário, mas <strong>sem campo de orientação sexual</strong>.</li>
                <li><strong>Atlas da Violência (IPEA):</strong> Mesma base SIM/DataSUS — <strong>não desagrega por sexualidade</strong>.</li>
                <li><strong>Disque 100/ONDH:</strong> Microdados disponíveis como <a href="https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dados abertos (CSV)</a>, mas relatórios publicados <strong>não cruzam LGBTQIA+ por raça</strong>.</li>
                <li><strong>Censo IBGE:</strong> <strong>Não possui campo de orientação sexual</strong>, impedindo análise interseccional ampla.</li>
              </ul>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'ANTRA — Dossiê 2026', url: 'https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf' },
                { nome: 'Agência Brasil — Jan/2026', url: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2026-01/brasil-ainda-e-o-pais-que-mais-mata-pessoas-trans-e-travestis-no-mundo' },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function DeficienciaTab() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-primary" />
              Pessoas com Deficiência por Raça
            </CardTitle>
            <CardDescription>
              PNAD Contínua 2022 (IBGE) |{' '}
              <a href="https://www.washingtongroup-disability.com/question-sets/wg-short-set-on-functioning-wg-ss/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Metodologia do Grupo de Washington (WG-SS)
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raça/Cor</TableHead>
                  <TableHead className="text-right">% com Deficiência</TableHead>
                  <TableHead className="text-right">Nível Ocupação PcD</TableHead>
                  <TableHead className="text-right">Renda Média PcD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deficienciaPorRaca.map(item => (
                  <TableRow key={item.raca}>
                    <TableCell className="font-medium">
                      {item.raca}
                      {(item as any).cruzamento && (
                        <EstimativaBadge tipo="cruzamento" metodologia={(item as any).metodologiaCruzamento} />
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.taxaDeficiencia}%</TableCell>
                    <TableCell className={cn("text-right", item.empregabilidade < 25 && "text-destructive font-semibold")}>
                      {item.empregabilidade}%
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.rendaMedia)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AuditFooter
              fontes={[
                { nome: 'SIDRA 9324 — Prevalência PcD por cor/raça (PNAD 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9324' },
                { nome: 'SIDRA 9339 — Ocupação e rendimento PcD (PNAD 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9339' },
              ]}
              documentos={['CERD 2022', 'Common Core']}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Disparidades Interseccionais PcD</CardTitle>
            <CardDescription>Nível de ocupação e prevalência por cor/raça — PNAD Contínua 2022</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deficienciaPorRaca}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="raca" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'rendaMedia' ? formatCurrency(value) : `${value}%`,
                      ''
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="empregabilidade" name="Nível Ocupação PcD (%)" fill="hsl(var(--primary))" />
                  <Bar dataKey="taxaDeficiencia" name="% com Deficiência" fill="hsl(var(--warning))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-xs">
                <strong>Dupla desvantagem:</strong> Pessoas pretas com deficiência têm nível de ocupação 16% menor
                e renda 34% inferior às pessoas brancas com deficiência (SIDRA 9339, PNAD 2022).
              </p>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'SIDRA 9324 — Prevalência PcD (PNAD 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9324' },
                { nome: 'SIDRA 9339 — Ocupação PcD (PNAD 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9339' },
                { nome: 'SIDRA 9514 — PcD por tipo de deficiência e cor (Censo 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9514' },
              ]}
              documentos={['CERD 2022']}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function JuventudeTab() {
  return (
    <div className="space-y-6">
      {/* Atlas da Violência 2025 — Cards de Juventude */}
      <Card className="bg-gradient-to-r from-warning/5 to-warning/10 border-warning/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Atlas da Violência 2025 (IPEA/FBSP) — Juventude Negra (15-29 anos)</h3>
              <p className="text-sm text-muted-foreground">
                Juventude definida como <strong>15 a 29 anos</strong> conforme padrão ONU e Estatuto da Juventude (Lei 12.852/2013).
                Este é o principal ponto de crítica do Comitê CERD (§23, §32-36).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Violência Letal Juventude 15-29 */}
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Violência Letal — Juventude (15-29 anos)</CardTitle>
            <CardDescription>Atlas da Violência 2025 | {atlasViolencia2025.juventude15_29.ano}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-warning">{atlasViolencia2025.juventude15_29.percentualVitimas}%</p>
              <p className="text-sm text-muted-foreground">das vítimas de homicídio tinham 15-29 anos</p>
            </div>
            {atlasViolencia2025.juventude15_29.percentualNegrosHomens != null ? (
              <div className="p-2 bg-destructive/10 rounded text-center mb-3">
                <p className="text-sm font-bold text-destructive">
                  {atlasViolencia2025.juventude15_29.percentualNegrosHomens}% jovens negros do sexo masculino
                </p>
                <p className="text-xs text-muted-foreground">entre as vítimas de mortes violentas intencionais</p>
              </div>
            ) : (
              <div className="p-2 bg-muted rounded text-center mb-3">
                <p className="text-xs text-muted-foreground italic">⏳ Percentual de jovens negros masculinos entre vítimas — Pendente de verificação humana</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* IVJ-N */}
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">IVJ-N — Vulnerabilidade da Juventude Negra</CardTitle>
            <CardDescription>Atlas da Violência 2025 | {atlasViolencia2025.ivjn.ano}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-warning">{atlasViolencia2025.ivjn.riscoRelativo}x</p>
              <p className="text-sm text-muted-foreground">risco de homicídio para jovens negros vs não negros</p>
            </div>
            <div className="text-xs space-y-1 mb-3">
              <p className="font-medium text-muted-foreground">Evolução:</p>
              <p className="flex items-center gap-1 text-destructive">
                <TrendingUp className="w-3 h-3" />
                Desigualdade persistente: {atlasViolencia2025.ivjn.riscoRelativo2017}x (2017) → {atlasViolencia2025.ivjn.riscoRelativo}x (2021)
              </p>
              <p className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="w-3 h-3" />
                Jovens negros c/ ensino superior: risco até {atlasViolencia2025.ivjn.riscoSuperiorNegro}x maior
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Genocídio da Juventude Negra</h3>
              <p className="text-sm text-muted-foreground">
                Jovens negros (15-29 anos) representam a maioria absoluta das vítimas de homicídio no Brasil.
                A taxa de homicídio de jovens negros é <strong>{atlasViolencia2025.ivjn.riscoRelativo}x maior</strong> que a de jovens não negros (Atlas da Violência 2025).
                Este é o principal ponto de crítica do Comitê CERD.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Baby className="w-5 h-5 text-warning" />
              Indicadores da Juventude Negra vs. Não Negra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {juventudeNegra.map(item => (
                <div key={item.indicador} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium">{item.indicador}</p>
                    {(item as any).cruzamento && (
                      <EstimativaBadge tipo="cruzamento" metodologia={(item as any).metodologiaCruzamento || 'ERRO: metodologia de cruzamento não documentada — verificar fonte'} />
                    )}
                    {/* REMOVIDO: EstimativaBadge tipo="simples" — estimativas/proxies PROIBIDOS pela Regra de Ouro */}
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Fonte: {(item as any).cruzamento && (item as any).fontesCruzamento ? (
                      (item as any).fontesCruzamento.map((f: any, i: number) => (
                        <span key={i}>
                          {i > 0 && ' × '}
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{f.nome}</a>
                        </span>
                      ))
                    ) : item.fonte}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Jovens Negros</span>
                        <span className="font-bold text-destructive">{item.valor}</span>
                      </div>
                      <div className="h-2 bg-destructive/20 rounded-full">
                        <div 
                          className="h-2 bg-destructive rounded-full" 
                          style={{ width: `${Math.min((item.valor / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Jovens Não Negros</span>
                        <span className="font-bold">{item.referencia}</span>
                      </div>
                      <div className="h-2 bg-primary/20 rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ width: `${Math.min((item.referencia / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <AuditFooter
              fontes={[
                { nome: 'Atlas da Violência 2025 (IPEA/FBSP)', url: 'https://www.ipea.gov.br/atlasviolencia' },
                { nome: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
                { nome: 'SIDRA 7113 — Desocupação por idade e cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/7113' },
                { nome: 'SISDEPEN/SENAPPEN', url: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen' },
                { nome: 'SIM/DataSUS — Mortalidade por causas externas', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
              ]}
              documentos={['CERD 2022', '19º Anuário FBSP 2025']}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desafios Persistentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center gap-1">
                  • Taxa de homicídio ainda{' '}
                  <a href="https://www.ipea.gov.br/atlasviolencia" target="_blank" rel="noopener noreferrer" className="font-bold text-destructive hover:underline">{atlasViolencia2025.riscoRelativo}x maior</a>{' '}
                  (Atlas da Violência 2025)
                </li>
                <li className="flex items-center gap-1">
                  • Letalidade policial:{' '}
                  <a href="https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/" target="_blank" rel="noopener noreferrer" className="font-bold text-destructive hover:underline">82% das vítimas são negras</a>{' '}
                  (19º Anuário FBSP 2025)
                </li>
                <li className="flex items-center gap-1">
                  • Encarceramento:{' '}
                  <a href="https://www.gov.br/senappen/pt-br/servicos/sisdepen" target="_blank" rel="noopener noreferrer" className="font-bold text-destructive hover:underline">68,2% dos presos são negros</a>{' '}
                  (SISDEPEN 2024)
                </li>
              </ul>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'Atlas da Violência 2025 (IPEA/FBSP)', url: 'https://www.ipea.gov.br/atlasviolencia' },
                { nome: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
                { nome: 'SISDEPEN/SENAPPEN', url: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen' },
              ]}
              documentos={['CERD 2022']}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ClasseSocialTab() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Distribuição por Faixa de Renda × Raça (%)
            </CardTitle>
            <CardDescription>SIS/IBGE 2024 | Linhas de pobreza: Banco Mundial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classePorRaca}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="faixa" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="branca" name="Branca" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="parda" name="Parda" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="preta" name="Preta" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">
              Fonte verificada: SIS/IBGE 2024 (dados 2023). Linhas de pobreza Banco Mundial (US$2,15/dia e US$6,85/dia).
            </div>
            <AuditFooter
              fontes={[
                { nome: 'SIS/IBGE 2024 — Síntese de Indicadores Sociais', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html' },
                { nome: 'SIDRA 6405 — Rendimento por cor/raça', url: 'https://sidra.ibge.gov.br/tabela/6405' },
              ]}
              documentos={['CERD 2022', 'Common Core']}
            />
          </CardContent>
        </Card>

        {/* Saúde × Raça × Classe — dados auditáveis */}
        <Card className="border-l-4 border-l-warning">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Saúde × Raça × Classe
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              IEPS Boletim Jul/2025 + RASEAM 2025 + Nascer no Brasil II (Fiocruz)
              <EstimativaBadge tipo="cruzamento" metodologia="Cruzamento de 3 fontes: (1) IEPS Boletim Jul/2025 — série mortalidade materna por raça 2010-2023, razão pretas/brancas 2,3× (ieps.org.br/pesquisas/boletim-care); (2) RASEAM 2025 — 68% dos óbitos maternos são de mulheres negras, SIM 2022 (gov.br/mulheres/pt-br/observatorio-brasil-da-igualdade-de-genero/raseam); (3) Nascer no Brasil II (Fiocruz) — near miss obstétrico 2× maior em negras (portal.fiocruz.br/pesquisa/nascer-no-brasil-ii). Nenhuma fonte consolida mortalidade + near miss + cobertura pré-natal por raça." />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-destructive mb-1">Mortalidade Materna por Raça</p>
                <p className="text-xs text-muted-foreground">
                  <strong>IEPS (jul/2025, série 2010-2023):</strong> razão mortalidade materna pretas/brancas = <strong>2,3×</strong> (108,6 vs 46,9 por 100 mil NV). Pardas: 56,6/100 mil NV.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>RASEAM 2025 (SIM 2022):</strong> mulheres negras = 68% das mortes maternas.
                </p>
              </div>
              <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-xs">
                  <strong>Nascer no Brasil II (Fiocruz, 2023):</strong> razão ~2× entre negras e brancas em amostra hospitalar (24 mil mulheres, 465 maternidades). Diferenças com SIM decorrem de subnotificação racial no sistema de vigilância.
                </p>
              </div>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'IEPS — Mortalidade materna por raça (Jul/2025)', url: 'https://ieps.org.br/mortalidade-materna-de-mulheres-pretas-e-duas-vezes-maior-do-que-de-brancas/' },
                { nome: 'RASEAM 2025 (PDF)', url: 'https://www.gov.br/mulheres/pt-br/central-de-conteudos/publicacoes/raseam-2025.pdf' },
                { nome: 'Nascer no Brasil II — Fiocruz', url: 'https://www.gov.br/saude/pt-br/assuntos/noticias/2023/novembro/morte-de-maes-negras-e-duas-vezes-maior-que-de-brancas-aponta-pesquisa' },
              ]}
              documentos={['CERD 2022 §27-28']}
            />
          </CardContent>
        </Card>
      </div>

      {/* Mobilidade Social — OCDE 2018 (dado geral, sem desagregação racial auditável) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Mobilidade Social Intergeracional
          </CardTitle>
          <CardDescription>
            OCDE — "A Broken Social Elevator?" (2018) + SIS/IBGE 2024 + Min. Fazenda (Dez/2024)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Gerações para família pobre alcançar renda média</p>
              <p className="text-3xl font-bold text-destructive">9</p>
              <p className="text-xs text-muted-foreground">OCDE 2018 — Brasil geral</p>
              <p className="text-[10px] text-muted-foreground">(2º pior entre 30 países)</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">Rendimento/hora negros vs não negros</p>
              <p className="text-3xl font-bold text-destructive">40%</p>
              <p className="text-xs text-muted-foreground">menor (R$13,70 vs R$23,00)</p>
              <p className="text-[10px] text-muted-foreground">SIS/IBGE 2024 (dados 2023)</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">1% mais rico detém</p>
              <p className="text-3xl font-bold text-destructive">37%</p>
              <p className="text-xs text-muted-foreground">da riqueza brasileira</p>
              <p className="text-[10px] text-muted-foreground">Min. Fazenda (Dez/2024)</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Nota metodológica:</strong> O dado OCDE (9 gerações) refere-se ao Brasil geral — não há desagregação por raça na publicação original. 
              A desigualdade racial no topo da distribuição de renda é documentada pelo SIS/IBGE e pelo Relatório da Distribuição da Renda (Min. Fazenda, Dez/2024), 
              mas nenhum deles publica a composição racial exata do 1% mais rico em formato desagregado por cor/raça.
            </p>
          </div>
          <AuditFooter
            fontes={[
              { nome: 'OCDE — A Broken Social Elevator? (2018)', url: 'https://www.oecd.org/en/publications/a-broken-social-elevator-how-to-promote-social-mobility_9789264301085-en.html' },
              { nome: 'SIS/IBGE 2024 — Síntese de Indicadores Sociais', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html' },
              { nome: 'Min. Fazenda — Distribuição da Renda e Riqueza (Dez/2024)', url: 'https://www.gov.br/fazenda/pt-br/centrais-de-conteudo/publicacoes/relatorio-da-distribuicao-pessoal-da-renda-e-da-riqueza' },
              { nome: 'Agência Brasil — OCDE mobilidade social', url: 'https://agenciabrasil.ebc.com.br/geral/noticia/2018-06/pobres-do-pais-levam-nove-geracoes-para-alcancar-renda-media-diz-ocde' },
            ]}
            documentos={['CERD 2022', 'Common Core']}
          />
        </CardContent>
      </Card>
    </div>
  );
}
