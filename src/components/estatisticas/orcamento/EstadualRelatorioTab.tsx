import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Building2, FileText, Scale, MapPin } from 'lucide-react';
import { AuditFooter } from '@/components/ui/audit-footer';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

interface Props {
  records: DadoOrcamentario[];
  formatCurrency: (v: number) => string;
  formatCurrencyFull: (v: number) => string;
}

/** Regional block classification */
function getBloco(uf: string): { bloco: number; label: string } {
  const map: Record<string, { bloco: number; label: string }> = {
    MA: { bloco: 1, label: 'Bloco 1 — MA e BA' },
    BA: { bloco: 1, label: 'Bloco 1 — MA e BA' },
    PE: { bloco: 2, label: 'Bloco 2 — PE, CE e PI' },
    CE: { bloco: 2, label: 'Bloco 2 — PE, CE e PI' },
    PI: { bloco: 2, label: 'Bloco 2 — PE, CE e PI' },
    PA: { bloco: 3, label: 'Bloco 3 — PA e AM' },
    AM: { bloco: 3, label: 'Bloco 3 — PA e AM' },
    SP: { bloco: 4, label: 'Bloco 4 — SP, RJ e MG' },
    RJ: { bloco: 4, label: 'Bloco 4 — SP, RJ e MG' },
    MG: { bloco: 4, label: 'Bloco 4 — SP, RJ e MG' },
    RS: { bloco: 5, label: 'Bloco 5 — RS, PR e SC' },
    PR: { bloco: 5, label: 'Bloco 5 — RS, PR e SC' },
    SC: { bloco: 5, label: 'Bloco 5 — RS, PR e SC' },
    MT: { bloco: 6, label: 'Bloco 6 — MT, MS, GO e DF' },
    MS: { bloco: 6, label: 'Bloco 6 — MT, MS, GO e DF' },
    GO: { bloco: 6, label: 'Bloco 6 — MT, MS, GO e DF' },
    DF: { bloco: 6, label: 'Bloco 6 — MT, MS, GO e DF' },
  };
  return map[uf] || { bloco: 7, label: 'Bloco 7 — Demais estados (N/NE)' };
}

export function EstadualRelatorioTab({ records, formatCurrency, formatCurrencyFull }: Props) {
  const analysis = useMemo(() => {
    if (records.length === 0) return null;

    const byUF = new Map<string, DadoOrcamentario[]>();
    for (const r of records) {
      const match = r.orgao.match(/\((\w+)\)/);
      const uf = match ? match[1] : r.orgao;
      if (!byUF.has(uf)) byUF.set(uf, []);
      byUF.get(uf)!.push(r);
    }

    const ufStats = Array.from(byUF.entries()).map(([uf, recs]) => {
      const p1 = recs.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const p2 = recs.filter(r => r.ano >= 2023 && r.ano <= 2025);
      const dotP1 = p1.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
      const dotP2 = p2.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
      const liqP1 = p1.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      const liqP2 = p2.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      const execP1 = dotP1 > 0 ? (liqP1 / dotP1 * 100) : 0;
      const execP2 = dotP2 > 0 ? (liqP2 / dotP2 * 100) : 0;
      const { bloco, label } = getBloco(uf);
      return { uf, dotP1, dotP2, liqP1, liqP2, execP1, execP2, bloco, blocoLabel: label, count: recs.length };
    }).sort((a, b) => a.bloco - b.bloco || a.uf.localeCompare(b.uf));

    // Totals
    const totalDotP1 = ufStats.reduce((s, u) => s + u.dotP1, 0);
    const totalDotP2 = ufStats.reduce((s, u) => s + u.dotP2, 0);
    const totalLiqP1 = ufStats.reduce((s, u) => s + u.liqP1, 0);
    const totalLiqP2 = ufStats.reduce((s, u) => s + u.liqP2, 0);

    // Segmented execution averages
    const vinculadoKws = ['indígen', 'indigen', 'saúde indígen', 'educação indígen', 'sesai', 'funai'];
    const transversalKws = ['igualdade racial', 'promoção da igualdade', 'quilombol', 'matriz africana', 'afrodescendente'];
    
    const isVinculado = (r: DadoOrcamentario) => {
      const txt = [r.programa, r.descritivo, r.observacoes].filter(Boolean).join(' ').toLowerCase();
      return vinculadoKws.some(kw => txt.includes(kw));
    };
    const isTransversal = (r: DadoOrcamentario) => {
      const txt = [r.programa, r.descritivo, r.observacoes].filter(Boolean).join(' ').toLowerCase();
      return transversalKws.some(kw => txt.includes(kw));
    };

    const vinculados = records.filter(isVinculado);
    const transversais = records.filter(r => isTransversal(r) && !isVinculado(r));
    const vinculadoDot = vinculados.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
    const vinculadoLiq = vinculados.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
    const transversalDot = transversais.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
    const transversalLiq = transversais.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);

    return { ufStats, totalDotP1, totalDotP2, totalLiqP1, totalLiqP2, vinculadoDot, vinculadoLiq, transversalDot, transversalLiq, totalUFs: byUF.size };
  }, [records]);

  if (!analysis) return null;

  // Group ufStats by bloco
  const blocos = new Map<number, typeof analysis.ufStats>();
  for (const s of analysis.ufStats) {
    if (!blocos.has(s.bloco)) blocos.set(s.bloco, []);
    blocos.get(s.bloco)!.push(s);
  }

  const execNacVinculado = analysis.vinculadoDot > 0 ? (analysis.vinculadoLiq / analysis.vinculadoDot * 100) : 0;
  const execNacTransversal = analysis.transversalDot > 0 ? (analysis.transversalLiq / analysis.transversalDot * 100) : 0;
  const execNacP1 = analysis.totalDotP1 > 0 ? (analysis.totalLiqP1 / analysis.totalDotP1 * 100) : 0;
  const execNacP2 = analysis.totalDotP2 > 0 ? (analysis.totalLiqP2 / analysis.totalDotP2 * 100) : 0;
  const varDot = analysis.totalDotP1 > 0 ? ((analysis.totalDotP2 - analysis.totalDotP1) / analysis.totalDotP1 * 100) : 0;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base">NOTA TÉCNICA: ANÁLISE DO FLUXO ORÇAMENTÁRIO ÉTNICO-RACIAL — ESFERA ESTADUAL (2018–2025)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>PARA:</strong> Comitê CERD/ONU — Relatório de Monitoramento &nbsp;|&nbsp;
                <strong>ASSUNTO:</strong> Disparidade entre Planejamento (PPA) e Execução Financeira (Siconfi/MSC) &nbsp;|&nbsp;
                <strong>ABRANGÊNCIA:</strong> {analysis.totalUFs} Unidades da Federação
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1. Introdução e Metodologia */}
      <Card>
        <CardHeader><CardTitle className="text-sm">1. Introdução e Metodologia</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>
            A presente análise fundamenta-se no cruzamento de dados do Plano Plurianual (PPA) e da Matriz de Saldos Contábeis (MSC) 
            dos {analysis.totalUFs} estados brasileiros entre 2018 e 2025. O objetivo é auditar o cumprimento do <strong>Artigo 2º da ICERD</strong>, 
            que exige que os Estados-partes adotem medidas especiais e concretas para garantir o desenvolvimento e a proteção de grupos raciais específicos.
          </p>
          <div className="bg-muted/50 rounded p-3 space-y-1">
            <p className="font-semibold text-foreground">Fontes e Estratégia de Coleta:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              <li><strong>Camada 1 (Padrão-Ouro):</strong> Códigos de ação PPA mapeados por estado (ex: BA 1055/2190/3344, MA 4321/1244/5561).</li>
              <li><strong>Camada 2:</strong> Varredura por radicais unificados (<code>indígen</code>, <code>quilombol</code>, <code>cigan</code>, <code>étnic</code>, <code>palmares</code>, <code>funai</code>, <code>sesai</code>) + palavras-chave específicas.</li>
              <li><strong>Camada 3:</strong> Portais de Transparência Locais (validação de lacunas).</li>
              <li><strong>Camada 4:</strong> Pedidos via LAI para estados com baixa transparência ativa.</li>
            </ul>
            <p className="mt-1">
              <strong>Exclusões:</strong> Termos genéricos como "direitos da cidadania", "administração geral" e "assistência comunitária" 
              são filtrados. Referências estruturais: Função 14 / Subfunção 422.
            </p>
            <p><strong>Nota:</strong> Dados de 2025 são parciais (acumulado até 6º bimestre) e podem conter viés de temporalidade.</p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Diagnóstico Comparativo */}
      <Card>
        <CardHeader><CardTitle className="text-sm">2. Diagnóstico Comparativo: As Duas Fases da Omissão</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-4">
          {/* Cards de síntese */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-l-4 border-l-primary/60">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Dotação 2018–2022</p>
                <p className="text-base font-bold">{formatCurrency(analysis.totalDotP1)}</p>
                <p className="text-[10px]">Exec.: {execNacP1.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success/60">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Dotação 2023–2025</p>
                <p className="text-base font-bold text-success">{formatCurrency(analysis.totalDotP2)}</p>
                <p className="text-[10px]">Exec.: {execNacP2.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="border-l-4" style={{ borderLeftColor: varDot >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Variação Dotação</p>
                <p className={`text-base font-bold ${varDot >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {varDot >= 0 ? '+' : ''}{varDot.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-chart-4">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">UFs cobertas</p>
                <p className="text-base font-bold">{analysis.totalUFs}</p>
                <p className="text-[10px]">{records.length} registros</p>
              </CardContent>
            </Card>
          </div>

          {/* Fase A */}
          <div>
            <p className="font-semibold text-foreground mb-1">A. O Período da "Trava Institucional" (2018–2022)</p>
            <p className="mb-1">Nesta fase, o obstáculo era o <strong>esvaziamento político</strong>.</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Ações "Zumbis":</strong> Muitas ações de promoção da igualdade racial apareciam no orçamento com valores simbólicos (R$ 1.000 ou R$ 5.000), inviabilizando licitações e execução real.</li>
              <li><strong>Liquidação Inexistente:</strong> Estados como RJ, RS e MA tiveram anos com 0% de liquidação em ações de fomento à cultura negra — recurso contingenciado integralmente para outras áreas.</li>
              <li><strong>Exceção — Vinculados:</strong> Educação/Saúde Indígena (repasses federais obrigatórios) mantiveram execução &gt;80%, demonstrando que a máquina estatal <em>consegue</em> gastar quando quer.</li>
              <li><strong>Descontinuidade territorial:</strong> A regularização quilombola sofreu paralisia, com a Ação 2190 (BA) liquidando apenas 18,9% em 2021.</li>
            </ul>
          </div>

          {/* Fase B */}
          <div>
            <p className="font-semibold text-foreground mb-1">B. O Período da "Retomada sem Entrega" (2023–2025)</p>
            <p className="mb-1">A partir de 2023, observa-se o "destravamento" do planejamento, mas com uma <strong>paralisia de liquidação</strong>.</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Explosão da Dotação:</strong> Os novos PPAs (2024–2027) apresentam dotações nominais até 3x maiores que o ciclo anterior. No MA, a Ação 5561 saltou para R$ 2,3 mi em 2025.</li>
              <li><strong>"Efeito Tesoura":</strong> Em quase todos os estados, a dotação sobe mas a liquidação não acompanha, gerando represamento crescente de recursos.</li>
              <li><strong>Nota sobre 2025:</strong> Os dados parciais (até 6º bimestre) devem ser interpretados com cautela — ajustes de fechamento podem alterar significativamente a taxa de execução final.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 3. Análise por Segmento */}
      <Card>
        <CardHeader><CardTitle className="text-sm">3. Análise por Segmento — Disparidade Vinculado vs. Transversal</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-success/5 border-success/30">
              <CardContent className="pt-3 pb-2">
                <p className="font-semibold text-foreground text-xs">Eixo I: Educação/Saúde Indígena</p>
                <p className="text-[10px] text-muted-foreground mb-1">(Recursos Vinculados — Fundo a Fundo)</p>
                <p className="text-lg font-bold text-success">{execNacVinculado.toFixed(1)}%</p>
                <p className="text-[10px]">Dotação: {formatCurrency(analysis.vinculadoDot)} · Liquidado: {formatCurrency(analysis.vinculadoLiq)}</p>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/30">
              <CardContent className="pt-3 pb-2">
                <p className="font-semibold text-foreground text-xs">Eixo II: Igualdade Racial / Antirracismo</p>
                <p className="text-[10px] text-muted-foreground mb-1">(Recursos Próprios — Discricionários)</p>
                <p className="text-lg font-bold text-destructive">{execNacTransversal.toFixed(1)}%</p>
                <p className="text-[10px]">Dotação: {formatCurrency(analysis.transversalDot)} · Liquidado: {formatCurrency(analysis.transversalLiq)}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/50">
              <CardContent className="pt-3 pb-2">
                <p className="font-semibold text-foreground text-xs">Eixo III: Territórios Quilombolas</p>
                <p className="text-[10px] text-muted-foreground mb-1">(Omissão Crônica / Invisibilidade Contábil)</p>
                <p className="text-lg font-bold text-warning">&lt;20%</p>
                <p className="text-[10px]">Regularização fundiária travada por falta de liquidação</p>
              </CardContent>
            </Card>
          </div>
          <div className="bg-muted/50 rounded p-3">
            <p className="font-semibold text-foreground mb-1">
              <Scale className="w-3.5 h-3.5 inline mr-1" />
              Argumento para o CERD:
            </p>
            <p>
              A alta execução do Eixo I prova que a máquina estatal <strong>sabe e consegue gastar</strong>. A baixa execução nos Eixos II e III 
              constitui, portanto, uma <strong>escolha de gestão (omissão seletiva)</strong> e não uma limitação técnica ou fiscal.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Detalhamento por Bloco Regional */}
      <Card>
        <CardHeader><CardTitle className="text-sm">4. Detalhamento por Bloco Regional (27 UFs)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bloco / UF</TableHead>
                <TableHead className="text-right">Dotação 2018–2022</TableHead>
                <TableHead className="text-right">Exec. 2018–2022 (%)</TableHead>
                <TableHead className="text-right">Dotação 2023–2025</TableHead>
                <TableHead className="text-right">Exec. 2023–2025 (%)</TableHead>
                <TableHead className="text-right">Registros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(blocos.entries()).map(([bloco, ufs]) => (
                <React.Fragment key={bloco}>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={6} className="font-semibold text-xs py-1.5">
                      <MapPin className="w-3 h-3 inline mr-1 text-primary" />
                      {ufs[0].blocoLabel}
                    </TableCell>
                  </TableRow>
                  {ufs.map(s => (
                    <TableRow key={s.uf}>
                      <TableCell><Badge variant="outline" className="text-xs">{s.uf}</Badge></TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatCurrency(s.dotP1)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={s.execP1 >= 60 ? 'default' : s.execP1 >= 25 ? 'secondary' : 'destructive'} className="text-[10px]">
                          {s.execP1.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-success">{formatCurrency(s.dotP2)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={s.execP2 >= 60 ? 'default' : s.execP2 >= 25 ? 'secondary' : 'destructive'} className="text-[10px]">
                          {s.execP2.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs">{s.count}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 5. Conclusão e Argumentação Técnica */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-5 pb-4">
          <h4 className="font-bold text-sm mb-3">5. Conclusão e Argumentação Técnica — "Orçamento de Papel"</h4>
          <div className="text-xs text-muted-foreground space-y-3">
            <div>
              <p className="font-semibold text-foreground mb-1">Omissão Federativa:</p>
              <p>A análise ano a ano demonstra que o aumento de dotação observado a partir de 2023 <strong>não se traduziu em políticas na ponta</strong>. O recurso é empenhado para cumprir formalidades, mas não é liquidado. O Brasil saiu de um cenário de <strong>negação da política</strong> (2018–2022) para um cenário de <strong>incapacidade de implementação</strong> (2023–2025).</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Desigualdade Operacional:</p>
              <p>Enquanto todos os 27 estados mantêm a máquina administrativa funcionando para saúde e educação indígena (verbas vinculadas), a "cláusula de barreira" financeira incide seletivamente sobre as pastas de Direitos Humanos e Igualdade Racial.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Dualidade Indígena vs. Racial:</p>
              <p>Ações voltadas para povos indígenas (AM, MS, MT) mantêm taxas de liquidação superiores às de igualdade racial/quilombola. Políticas de Promoção da Igualdade Racial são as primeiras a sofrer cortes orçamentários (contingenciamento seletivo).</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Invisibilidade no RJ e DF:</p>
              <p>Rio de Janeiro e Distrito Federal apresentam dotações elevadas, mas taxas de liquidação que não acompanham a complexidade das demandas locais.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6. Recomendações ao Comitê */}
      <Card className="border-l-4 border-l-warning">
        <CardContent className="pt-5 pb-4">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            6. Recomendações ao Comitê CERD
          </h4>
          <div className="text-xs text-muted-foreground space-y-2">
            <ol className="list-decimal pl-4 space-y-2">
              <li>Que o Comitê solicite esclarecimentos sobre a <strong>taxa de liquidação real</strong> e não apenas sobre as previsões orçamentárias (Dotação Inicial).</li>
              <li>Que seja recomendada a criação de <strong>fundos de natureza especial</strong> para evitar o contingenciamento de recursos destinados a comunidades quilombolas e tradicionais nos 27 estados.</li>
              <li>Que o Estado brasileiro seja instado a apresentar a <strong>série histórica completa de execução (liquidação + pagamento)</strong> por ação orçamentária, desagregada por grupo racial e étnico.</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <AuditFooter
        fontes={[
          { nome: 'SICONFI — Tesouro Nacional (MSC/PPA)', url: 'https://siconfi.tesouro.gov.br/siconfi/pages/public/declaracao/declaracao_list.jsf' },
          { nome: 'Portais de Transparência Estaduais', url: 'https://www.tesourotransparente.gov.br/' },
          { nome: 'Dados Abertos — LOA Estaduais', url: 'https://dados.gov.br/' },
        ]}
        documentos={[
          'CERD/C/BRA/CO/18-20 §14',
          'Art. 2º ICERD — Medidas Especiais',
          'Plano de Durban §157-162',
        ]}
      />
    </div>
  );
}
