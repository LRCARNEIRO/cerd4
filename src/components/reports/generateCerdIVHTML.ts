import type { LacunaIdentificada, RespostaLacunaCerdIII, IndicadorInterseccional } from '@/hooks/useLacunasData';
import { getExportToolbarHTML } from '@/utils/reportExportToolbar';
import {
  segurancaPublica as hcSeguranca, feminicidioSerie as hcFeminicidio,
  educacaoSerieHistorica as hcEducacao, indicadoresSocioeconomicos as hcSocioEco,
  povosTradicionais as hcPovos
} from '@/components/estatisticas/StatisticsData';

export interface CerdIVMirrorData {
  segurancaPublica?: any[];
  feminicidioSerie?: any[];
  educacaoSerieHistorica?: any[];
  indicadoresSocioeconomicos?: any[];
  povosTradicionais?: any;
}

const STYLES = `
@page { size: A4; margin: 2.5cm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Open Sans', sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a2e; max-width: 21cm; margin: 0 auto; padding: 2cm; background: white; }
.header { text-align: center; margin-bottom: 2cm; border-bottom: 3px solid #1e3a5f; padding-bottom: 1.5cm; }
.header h1 { font-family: 'Merriweather', serif; font-size: 18pt; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 1px; }
.header .subtitle { font-size: 14pt; margin-top: 0.5cm; color: #2c5282; }
.header .date { font-size: 12pt; margin-top: 0.5cm; font-style: italic; color: #64748b; }
.un-logo { text-align: center; font-size: 32pt; margin-bottom: 1cm; }
h2 { font-family: 'Merriweather', serif; font-size: 14pt; font-weight: 700; margin-top: 1.5cm; margin-bottom: 0.5cm; color: #1e3a5f; border-bottom: 2px solid #c7a82b; padding-bottom: 0.3cm; page-break-after: avoid; }
h3 { font-family: 'Merriweather', serif; font-size: 12pt; font-weight: 700; margin-top: 1cm; margin-bottom: 0.3cm; color: #2c5282; }
h4 { font-size: 11pt; font-weight: 600; margin-top: 0.8cm; margin-bottom: 0.2cm; color: #334155; }
p { text-align: justify; margin-bottom: 0.5cm; }
.paragraph-ref { font-weight: 700; color: #1e3a5f; font-family: monospace; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
.section { margin-bottom: 1.5cm; page-break-inside: avoid; }
.highlight-box { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 0.8cm; margin: 0.5cm 0; border-left: 4px solid #1e3a5f; border-radius: 0 8px 8px 0; }
.recommendation { background: #f8fafc; padding: 0.5cm; margin: 0.5cm 0; border-left: 4px solid #64748b; border-radius: 0 4px 4px 0; }
.response { background: #ecfdf5; padding: 0.5cm; margin: 0.5cm 0; border-left: 4px solid #22c55e; border-radius: 0 4px 4px 0; }
.gap { background: #fffbeb; padding: 0.5cm; margin: 0.5cm 0; border-left: 4px solid #eab308; border-radius: 0 4px 4px 0; }
.critical { background: #fef2f2; padding: 0.5cm; margin: 0.5cm 0; border-left: 4px solid #ef4444; border-radius: 0 4px 4px 0; }
table { width: 100%; border-collapse: collapse; margin: 0.5cm 0; font-size: 10pt; }
th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
th { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; font-weight: 600; }
tr:nth-child(even) { background: #f8fafc; }
.status-cumprido { color: #166534; font-weight: 600; } .status-parcial { color: #ca8a04; font-weight: 600; } .status-nao-cumprido { color: #dc2626; font-weight: 600; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 9pt; font-weight: 600; }
.badge-success { background: #dcfce7; color: #166534; } .badge-warning { background: #fef3c7; color: #92400e; } .badge-danger { background: #fee2e2; color: #991b1b; } .badge-info { background: #dbeafe; color: #1e40af; }
.data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1cm; margin: 0.5cm 0; }
.data-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.8cm; text-align: center; }
.data-card-value { font-size: 24pt; font-weight: 700; color: #1e3a5f; }
.data-card-label { font-size: 9pt; color: #64748b; margin-top: 0.2cm; }
.footer { margin-top: 2cm; padding-top: 1cm; border-top: 2px solid #1e3a5f; font-size: 9pt; text-align: center; color: #64748b; }
.toc { margin: 1cm 0; padding: 1cm; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.toc h3 { margin-top: 0; color: #1e3a5f; }
.toc ul { list-style: none; padding-left: 0; }
.toc li { margin: 0.3cm 0; padding-left: 1cm; position: relative; }
.toc li::before { content: "→"; position: absolute; left: 0; color: #c7a82b; }
ul, ol { margin-left: 1cm; margin-bottom: 0.5cm; }
li { margin-bottom: 0.2cm; }
.print-instructions { background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); padding: 1cm; margin-bottom: 1cm; border: 1px solid #3b82f6; border-radius: 8px; }
.print-instructions strong { color: #1e40af; }
@media print { .print-instructions { display: none; } body { padding: 0; } }
`;

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça',
  politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda',
  terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio',
  participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas'
};

const grupoLabels: Record<string, string> = {
  negros: 'População Negra', indigenas: 'Povos Indígenas', quilombolas: 'Quilombolas',
  ciganos: 'Povos Ciganos', religioes_matriz_africana: 'Religiões de Matriz Africana',
  juventude_negra: 'Juventude Negra', mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+ Negros', pcd_negros: 'PcD Negros', idosos_negros: 'Idosos Negros', geral: 'Geral'
};

const statusConfig: Record<string, { label: string; cssClass: string; badge: string }> = {
  cumprido: { label: 'Cumprido', cssClass: 'status-cumprido', badge: 'badge-success' },
  parcialmente_cumprido: { label: 'Parcialmente Cumprido', cssClass: 'status-parcial', badge: 'badge-warning' },
  nao_cumprido: { label: 'Não Cumprido', cssClass: 'status-nao-cumprido', badge: 'badge-danger' },
  retrocesso: { label: 'Retrocesso', cssClass: 'status-nao-cumprido', badge: 'badge-danger' },
  em_andamento: { label: 'Em Andamento', cssClass: 'status-parcial', badge: 'badge-info' },
};

const prioridadeLabels: Record<string, string> = {
  critica: 'Crítica', alta: 'Alta', media: 'Média', baixa: 'Baixa'
};

export function generateCerdIVHTML(
  lacunas: LacunaIdentificada[],
  respostas: RespostaLacunaCerdIII[],
  stats: any,
  indicadores: IndicadorInterseccional[],
  orcStats: any,
  mirror?: CerdIVMirrorData
): string {
  // SSoT: use mirror data from BD if available, fallback to hardcoded
  const segurancaPublica = mirror?.segurancaPublica?.length ? mirror.segurancaPublica : hcSeguranca;
  const feminicidioSerie = mirror?.feminicidioSerie?.length ? mirror.feminicidioSerie : hcFeminicidio;
  const educacaoSerieHistorica = mirror?.educacaoSerieHistorica?.length ? mirror.educacaoSerieHistorica : hcEducacao;
  const indicadoresSocioeconomicos = mirror?.indicadoresSocioeconomicos?.length ? mirror.indicadoresSocioeconomicos : hcSocioEco;
  const povosTradicionais = mirror?.povosTradicionais || hcPovos;

  const cumpridas = stats?.porStatus?.cumprido || 0;
  const parciais = stats?.porStatus?.parcialmente_cumprido || 0;
  const naoCumpridas = stats?.porStatus?.nao_cumprido || 0;
  const retrocessos = stats?.porStatus?.retrocesso || 0;
  const total = stats?.total || 0;

  // Section II: Respostas
  const respostasHTML = respostas.map(r => {
    const st = statusConfig[r.grau_atendimento] || statusConfig.nao_cumprido;
    const lacunasRem = r.lacunas_remanescentes && r.lacunas_remanescentes.length > 0
      ? `<div class="gap"><p><strong>Lacunas remanescentes:</strong></p><ul>${r.lacunas_remanescentes.map(l => `<li>${l}</li>`).join('')}</ul></div>`
      : '';
    return `
      <div class="recommendation">
        <h4><span class="paragraph-ref">Parágrafo ${r.paragrafo_cerd_iii}</span></h4>
        <p><strong>Crítica original:</strong> ${r.critica_original}</p>
      </div>
      <div class="response">
        <p><strong>Resposta do Brasil:</strong> ${r.resposta_brasil}</p>
        <p><strong>Avaliação:</strong> <span class="${st.cssClass}">${st.label}</span></p>
        ${lacunasRem}
      </div>
    `;
  }).join('');

  // Section IV: By eixo
  const porEixo: Record<string, LacunaIdentificada[]> = {};
  lacunas.forEach(l => {
    if (!porEixo[l.eixo_tematico]) porEixo[l.eixo_tematico] = [];
    porEixo[l.eixo_tematico].push(l);
  });

  const eixosHTML = Object.entries(porEixo).map(([eixo, lacs]) => {
    const rows = lacs.map(l => {
      const st = statusConfig[l.status_cumprimento] || statusConfig.nao_cumprido;
      return `<tr>
        <td><span class="paragraph-ref">${l.paragrafo}</span></td>
        <td><strong>${l.tema}</strong><br><small style="color:#64748b">${l.descricao_lacuna.substring(0, 120)}...</small></td>
        <td>${grupoLabels[l.grupo_focal] || l.grupo_focal}</td>
        <td><span class="badge ${st.badge}">${st.label}</span></td>
        <td>${prioridadeLabels[l.prioridade] || l.prioridade}</td>
      </tr>`;
    }).join('');

    return `
      <h3>${eixoLabels[eixo] || eixo}</h3>
      <table>
        <thead><tr><th>§</th><th>Tema</th><th>Grupo Focal</th><th>Status</th><th>Prioridade</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }).join('');

  // Section V: Dados
  const seg2024 = segurancaPublica[segurancaPublica.length - 1];
  const fem2024 = feminicidioSerie[feminicidioSerie.length - 1];
  const edu2024 = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];
  const eco2024 = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];

  // Section VI: Povos
  const povosHTML = `
    <h3>A. Povos Indígenas</h3>
    <div class="highlight-box">
      <p><strong>População:</strong> ${povosTradicionais.indigenas.populacaoPessoasIndigenas.toLocaleString('pt-BR')} (Censo 2022) — ${povosTradicionais.indigenas.etnias} etnias, ${povosTradicionais.indigenas.linguas} línguas</p>
      <p><strong>Territórios:</strong> ${povosTradicionais.indigenas.terrasHomologadas2018_2022} terras homologadas (2018-2022), ${povosTradicionais.indigenas.terrasHomologadas2023_2025} em 2023-2025</p>
    </div>
    <h3>B. Comunidades Quilombolas</h3>
    <div class="highlight-box">
      <p><strong>População:</strong> ${povosTradicionais.quilombolas.populacao.toLocaleString('pt-BR')} (primeira contagem censitária, 2022)</p>
      <p><strong>Comunidades certificadas:</strong> ${povosTradicionais.quilombolas.comunidadesCertificadas.toLocaleString('pt-BR')}</p>
      <p><strong>Territórios titulados:</strong> ${povosTradicionais.quilombolas.territoriosTitulados} (${povosTradicionais.quilombolas.titulosExpedidos} títulos expedidos para ${povosTradicionais.quilombolas.comunidadesAbrangidas} comunidades)</p>
    </div>
  `;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CERD/C/BRA/21-23 - Relatório Periódico</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${STYLES}</style>
</head>
<body>
  <div class="print-instructions">
    <strong>📄 Para salvar como PDF:</strong> Use Ctrl+P (ou Cmd+P no Mac) e selecione "Salvar como PDF" como destino.
    <br>
    <strong>📝 Para salvar como DOCX:</strong> Copie todo o conteúdo (Ctrl+A) e cole no Microsoft Word ou Google Docs.
  </div>

  <div class="header">
    <div class="un-logo">🇺🇳</div>
    <h1>Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial</h1>
    <div class="subtitle">CERD/C/BRA/21-23</div>
    <div class="subtitle">Relatórios periódicos combinados (21º a 23º) do Brasil</div>
    <div class="date">Período de cobertura: 2018-2025</div>
  </div>

  <div class="toc">
    <h3>Sumário</h3>
    <ul>
      <li><strong>I.</strong> Introdução e Metodologia</li>
      <li><strong>II.</strong> Respostas às Observações Finais (CERD/C/BRA/CO/18-20)</li>
      <li><strong>III.</strong> Medidas Legislativas, Judiciais e Administrativas</li>
      <li><strong>IV.</strong> Implementação por Eixo Temático</li>
      <li><strong>V.</strong> Dados Estatísticos Desagregados</li>
      <li><strong>VI.</strong> Povos Tradicionais</li>
      <li><strong>VII.</strong> Conclusões e Compromissos</li>
    </ul>
  </div>

  <h2>I. Introdução</h2>
  <div class="section">
    <p>A República Federativa do Brasil submete seus relatórios periódicos combinados (21º a 23º) 
    ao Comitê para a Eliminação da Discriminação Racial, cobrindo o período de 2018 a 2026.</p>
    <div class="highlight-box">
      <h4>📋 Metodologia</h4>
      <p>Este relatório foi elaborado com participação de organizações da sociedade civil, 
      instituições acadêmicas e órgãos governamentais, coordenado pelo Grupo de Pesquisa sobre 
      Tratados de Direitos Humanos da Universidade Federal Fluminense (CDG/UFF), em parceria 
      com o Ministério da Igualdade Racial (MIR) e o Ministério das Relações Exteriores (MRE).</p>
    </div>
    <div class="data-grid">
      <div class="data-card"><div class="data-card-value">${total}</div><div class="data-card-label">Recomendações Analisadas</div></div>
      <div class="data-card"><div class="data-card-value" style="color:#22c55e">${cumpridas}</div><div class="data-card-label">Cumpridas</div></div>
      <div class="data-card"><div class="data-card-value" style="color:#eab308">${parciais}</div><div class="data-card-label">Parciais</div></div>
      <div class="data-card"><div class="data-card-value" style="color:#ef4444">${naoCumpridas + retrocessos}</div><div class="data-card-label">Não Cumpridas/Retrocesso</div></div>
    </div>
  </div>

  <h2>II. Respostas às Observações Finais (CERD/C/BRA/CO/18-20)</h2>
  <div class="section">
    <p>Em resposta às observações finais do Comitê de agosto de 2022, o Brasil apresenta 
    as seguintes informações sobre as medidas adotadas para implementar as recomendações:</p>
    ${respostasHTML}
  </div>

  <h2>III. Medidas Legislativas, Judiciais e Administrativas (2018-2025)</h2>
  <div class="section">
    <h3>A. Principais Avanços Legislativos</h3>
    <table>
      <thead><tr><th>Norma</th><th>Ano</th><th>Descrição</th><th>Impacto</th></tr></thead>
      <tbody>
        <tr><td><strong>Lei 14.532/2023</strong></td><td>2023</td><td>Equipara injúria racial ao crime de racismo</td><td><span class="badge badge-success">Alto</span></td></tr>
        <tr><td><strong>Lei 14.723/2023</strong></td><td>2023</td><td>Renova sistema de cotas no ensino superior por 10 anos</td><td><span class="badge badge-success">Alto</span></td></tr>
        <tr><td><strong>Decreto 11.956/2024</strong></td><td>2024</td><td>Programa Juventude Negra Viva</td><td><span class="badge badge-info">Médio</span></td></tr>
        <tr><td><strong>Decreto 11.786/2023</strong></td><td>2023</td><td>Política Nacional de Gestão Territorial Quilombola (PNGTAQ)</td><td><span class="badge badge-success">Alto</span></td></tr>
      </tbody>
    </table>
    <h3>B. Mudanças Institucionais</h3>
    <ul>
      <li>Criação do Ministério da Igualdade Racial (MIR) - Janeiro de 2023</li>
      <li>Criação do Ministério dos Povos Indígenas (MPI) - Janeiro de 2023</li>
      <li>Reestruturação da FUNAI e fortalecimento do INCRA</li>
      <li>Recomposição do Conselho Nacional de Direitos Humanos (CNDH)</li>
    </ul>
  </div>

  <h2>IV. Implementação por Eixo Temático</h2>
  <div class="section">
    ${eixosHTML}
  </div>

  <h2>V. Dados Estatísticos Desagregados</h2>
  <div class="section">
    <table>
      <thead><tr><th>Indicador</th><th>Negro 2024</th><th>Branco 2024</th><th>Variação 2018→2024</th></tr></thead>
      <tbody>
        <tr><td>Vítimas de homicídio (%)</td><td>${seg2024.percentualVitimasNegras}%</td><td>${(100 - seg2024.percentualVitimasNegras).toFixed(1)}%</td><td class="trend-down">↑ piora (+1,3pp)</td></tr>
        <tr><td>Letalidade policial (%)</td><td>${seg2024.letalidadePolicial}%</td><td>-</td><td class="trend-down">↑ piora (+4pp)</td></tr>
        <tr><td>Feminicídio - mulheres negras (%)</td><td>${fem2024.percentualNegras}%</td><td>${(100 - fem2024.percentualNegras).toFixed(1)}%</td><td class="trend-down">↑ piora (+2,6pp)</td></tr>
        <tr><td>Ensino superior completo (%)</td><td>${edu2024.superiorNegroPercent}%</td><td>${edu2024.superiorBrancoPercent}%</td><td class="trend-up">↑ melhoria (+6,4pp)</td></tr>
        <tr><td>Renda média mensal (R$)</td><td>${eco2024.rendaMediaNegra.toLocaleString('pt-BR')}</td><td>${eco2024.rendaMediaBranca.toLocaleString('pt-BR')}</td><td class="trend-up">↑ melhoria (+49%)</td></tr>
        <tr><td>Desemprego (%)</td><td>${eco2024.desempregoNegro}%</td><td>${eco2024.desempregoBranco}%</td><td class="trend-up">↓ melhoria (-6,8pp)</td></tr>
      </tbody>
    </table>
  </div>

  <h2>VI. Povos Tradicionais</h2>
  <div class="section">
    ${povosHTML}
  </div>

  <h2>VII. Conclusões e Compromissos</h2>
  <div class="section">
    <div class="highlight-box">
      <h4>Síntese</h4>
      <p>O Brasil reconhece avanços significativos no período 2023-2025, com a recriação de institucionalidade 
      e novos marcos legais. Porém, ${naoCumpridas + retrocessos} de ${total} recomendações permanecem não cumpridas ou 
      em retrocesso, evidenciando que a desigualdade racial estrutural persiste apesar dos esforços normativos.</p>
    </div>

    <div class="gap">
      <h4>⚠️ Nota Metodológica: Programas Transversais com Recorte Racial</h4>
      <p>Os dados orçamentários deste relatório referem-se <strong>exclusivamente a programas com componente institucional 
      explícito de igualdade racial</strong> (MIR, FUNAI, INCRA, Fundação Palmares etc.). Foram excluídos 7 programas 
      governamentais de escopo amplo que beneficiam indiretamente populações racializadas, mas que não são políticas 
      específicas de igualdade racial:</p>
      <table>
        <thead><tr><th>Programa</th><th>Órgão</th><th>Dotação (2024)</th><th>Motivo da Exclusão</th></tr></thead>
        <tbody>
          <tr><td>Agendas Transversais PPA (5 agendas)</td><td>Governo Federal / MPO</td><td>R$ 405,3 bi</td><td>Orçamento global compartilhado entre 5 agendas</td></tr>
          <tr><td>Minha Casa Minha Vida — Faixa 1</td><td>Min. das Cidades</td><td>R$ 42,8 bi</td><td>Programa habitacional universal (~75% beneficiários negros)</td></tr>
          <tr><td>FEFC — Candidaturas Negras</td><td>TSE</td><td>R$ 4,9 bi</td><td>Fundo eleitoral geral; cota racial é proporção</td></tr>
          <tr><td>Fundo Amazônia</td><td>BNDES</td><td>R$ 3,4 bi</td><td>Fundo ambiental; benefício indireto a indígenas e quilombolas</td></tr>
          <tr><td>Urbanização de Favelas</td><td>Min. das Cidades</td><td>R$ 3,2 bi</td><td>Infraestrutura urbana sem componente racial institucional</td></tr>
          <tr><td>Proteção de Terras Indígenas</td><td>IBAMA/ICMBio</td><td>R$ 1,85 bi</td><td>Orçamento global de fiscalização ambiental</td></tr>
          <tr><td>Operação Acolhida</td><td>MJ/MRE</td><td>R$ 280 mi</td><td>Política migratória, não de igualdade racial</td></tr>
        </tbody>
      </table>
      <p><strong>Total excluído:</strong> R$ 461,7 bilhões em dotação autorizada / R$ 43,2 bilhões em valores pagos. 
      Esses montantes distorceriam a análise do investimento efetivamente direcionado a políticas de igualdade racial.</p>
    </div>

    <h3>Compromissos Prioritários</h3>
    <ul>
      <li>Fortalecer a implementação efetiva da legislação antirracista</li>
      <li>Reduzir a letalidade policial e a violência contra juventude negra</li>
      <li>Acelerar titulações quilombolas e demarcações indígenas</li>
      <li>Ampliar dados interseccionais para povos ciganos, PcD e LGBTQIA+ negros</li>
      <li>Manter e ampliar investimento orçamentário em igualdade racial</li>
    </ul>
  </div>

  <div class="footer">
    <p>CERD/C/BRA/21-23 — Relatórios Periódicos Combinados do Brasil</p>
    <p>Elaborado pelo Grupo de Pesquisa CDG/UFF em parceria com MIR e MRE</p>
    <p>Gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} — Dados de fontes oficiais</p>
  </div>
  ${getExportToolbarHTML('CERD-IV-Relatorio-Periodico-Brasil')}
</body>
</html>`;
}
