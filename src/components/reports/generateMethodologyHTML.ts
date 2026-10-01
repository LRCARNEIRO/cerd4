import { getExportToolbarHTML } from '@/utils/reportExportToolbar';

export function generateMethodologyHTML(): string {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Catálogo espelha EXATAMENTE as subabas existentes em /estatisticas (Estatisticas.tsx).
  // Sem números fixos: valores e tendências vêm sempre dos cards auditados (dados ao vivo).
  const tabs = [
    {
      secao: 'BASE ESTATÍSTICA — ESTATÍSTICAS E INDICADORES',
      abas: [
        { nome: 'Complemento CERD III', icone: '📄', origem: 'Inventário canônico + Relatório CERD III',
          motivacao: `Reúne os <strong>indicadores que complementam as lacunas de dados do III Relatório</strong>. A tendência de cada indicador é recalculada a partir da própria série histórica e da forma de leitura (maior é melhor / menor é melhor); sem série histórica, exibe-se o dado único com seu código IND-NNN.`,
          documentosFonte: ['cerd-iii-relatorio-do-estado-brasileiro.pdf', 'Inventário canônico de evidências'],
          promptOrigem: 'Exibir os indicadores complementares ao CERD III com tendência recalculada pelos dados e pela forma de leitura.',
          artigos: ['Art. IX (Relatórios periódicos)', 'Art. V (Direitos)'] },
        { nome: 'Dados Gerais', icone: '📊', origem: 'Censo 2022 (IBGE) + Diretrizes CERD/C/2007/1',
          motivacao: `Indicadores <strong>demográficos e socioeconômicos fundamentais</strong> desagregados por raça/cor, conforme as Diretrizes do CERD (CERD/C/2007/1).`,
          documentosFonte: ['CERD-Guidelines-2007.pdf', 'Censo-2022-IBGE.pdf'],
          promptOrigem: 'Estruturar os dados demográficos gerais do Brasil com desagregação racial.',
          artigos: ['Art. I (Definição de discriminação racial)', 'Art. V.e (Direitos econômicos e sociais)'] },
        { nome: 'Segurança / Saúde / Educação', icone: '🛡️', origem: 'Observações Finais 2022 + FBSP/DataSUS/INEP/IBGE',
          motivacao: `Séries temporais dos três eixos mais demandados pelo Comitê: <strong>segurança pública, saúde e educação</strong>. Cada série encerra no último dado real disponível; a evolução é lida segundo a forma de leitura do indicador.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf'],
          promptOrigem: 'Séries históricas por raça para segurança, saúde e educação com fontes oficiais.',
          artigos: ['Art. V.b (Segurança pessoal)', 'Art. V.e.iv (Saúde pública)', 'Art. V.e.v (Educação)'] },
        { nome: 'Adm Pública (MUNIC/ESTADIC)', icone: '🏛️', origem: 'IBGE — MUNIC/ESTADIC',
          motivacao: `Mapeia a <strong>capacidade institucional</strong> de municípios e estados para políticas de igualdade racial (órgãos, conselhos, planos e orçamento dedicado).`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'cerd-iii-relatorio-do-estado-brasileiro.pdf'],
          promptOrigem: 'Integrar MUNIC/ESTADIC sobre capacidade institucional para igualdade racial.',
          artigos: ['Art. II.1 (Medidas legislativas e administrativas)'] },
        { nome: 'COVID', icone: '🦠', origem: 'DataSUS (SIVEP-Gripe, e-SUS)',
          motivacao: `Impacto <strong>desproporcional da COVID-19</strong> sobre a população negra e indígena, incluindo a incompletude do quesito raça/cor nos registros.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf'],
          promptOrigem: 'Documentar o impacto racial da pandemia com dados do DataSUS.',
          artigos: ['Art. V.e.iv (Saúde pública)', 'Art. II (Medidas de eliminação)'] },
        { nome: 'Grupos Focais', icone: '👥', origem: 'Observações Finais + INCRA/FUNAI/FBSP/DataSUS + tabela lacunas_identificadas',
          motivacao: `Subaba com quatro visões: <strong>Série Temporal</strong>, <strong>Direitos Territoriais</strong> (quilombolas e indígenas), <strong>Indicadores de Vulnerabilidade</strong> e <strong>Lacunas por Grupo</strong>. Os números exibidos vêm dos cards auditados.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'CERD-Follow-up-Brasil-2026.pdf'],
          promptOrigem: 'Análise focalizada por grupo (quilombolas, indígenas, juventude negra, mulheres negras e população negra).',
          artigos: ['Art. V.d.v (Propriedade)', 'Art. V.b (Segurança)', 'Art. II (Medidas específicas)'] },
        { nome: 'ODS Racial', icone: '🌍', origem: 'Portal ODS Racial',
          motivacao: `Indicadores dos <strong>Objetivos de Desenvolvimento Sustentável com recorte racial</strong>, integrados ao inventário canônico e à matriz de vínculos de evidência.`,
          documentosFonte: ['Portal ODS Racial'],
          promptOrigem: 'Integrar os indicadores do Portal ODS Racial ao sistema.',
          artigos: ['Art. V.e (Direitos econômicos e sociais)'] },
        { nome: 'Vulnerabilidades', icone: '🔗', origem: 'FBSP/Atlas da Violência/DataSUS',
          motivacao: `Indicadores de vulnerabilidade com <strong>cruzamento raça × outras dimensões</strong> (RG nº 25 e nº 32), cada um com badge de auditoria e deep link.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'Recomendacoes-Gerais-Paragrafos-NOVA.pdf'],
          promptOrigem: 'Consolidar indicadores de vulnerabilidade interseccional.',
          artigos: ['Art. V.b (Segurança)', 'Art. V.e.iv (Saúde)', 'Art. I e II'] },
        { nome: 'Raça × Gênero', icone: '👩🏾', origem: 'Recomendação Geral nº 25',
          motivacao: `Dimensão de <strong>gênero da discriminação racial</strong>; cruzamentos sem publicação oficial são registrados como lacunas documentadas.`,
          documentosFonte: ['Recomendacoes-Gerais-Paragrafos-NOVA.pdf', 'CERD-Observacoes-Brasil-2022.pdf'],
          promptOrigem: 'Análise interseccional raça × gênero conforme RG nº 25.',
          artigos: ['Art. V.b (Segurança pessoal)', 'Art. I (Discriminação interseccional)'] },
        { nome: 'LGBTQIA+', icone: '🏳️‍🌈', origem: 'Observações Finais + ANTRA/GGB',
          motivacao: `Discriminação múltipla contra <strong>pessoas LGBTQIA+ negras</strong>, registrando a ausência de pesquisa oficial nacional desagregada por raça.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf'],
          promptOrigem: 'Interseccionalidade raça × orientação sexual/identidade de gênero.',
          artigos: ['Art. V.b (Segurança)', 'Art. I (Discriminação múltipla)'] },
        { nome: 'Deficiência', icone: '♿', origem: 'Censo 2022 + PNADC (SIDRA)',
          motivacao: `Prevalência, ocupação e renda de <strong>pessoas com deficiência por raça/cor</strong>.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf'],
          promptOrigem: 'Integrar dados SIDRA sobre pessoas com deficiência por raça.',
          artigos: ['Art. V.e (Direitos econômicos e sociais)', 'Art. I (Discriminação múltipla)'] },
        { nome: 'Juventude', icone: '🧑🏾', origem: 'Observações Finais + Atlas da Violência/FBSP',
          motivacao: `Violência contra a <strong>juventude negra</strong>, tema prioritário das Observações Finais 2022, e políticas específicas registradas na Base Normativa.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'CERD-Follow-up-Brasil-2026.pdf'],
          promptOrigem: 'Consolidar dados sobre violência contra juventude negra.',
          artigos: ['Art. V.b (Segurança pessoal)', 'Art. II (Medidas de eliminação)'] },
        { nome: 'Classe Social', icone: '💼', origem: 'SIS/IBGE',
          motivacao: `Desigualdade socioeconômica por raça (<strong>pobreza e extrema pobreza</strong>) a partir de indicadores verificados.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf'],
          promptOrigem: 'Indicadores verificados de pobreza por raça/cor.',
          artigos: ['Art. V.e (Direitos econômicos e sociais)'] },
      ],
    },
  ];

  const abasHTML = tabs.map(secao => {
    const abasContent = secao.abas.map((aba, idx) => `
      <div class="aba-card" style="page-break-inside:avoid;">
        <div class="aba-header">
          <span class="aba-icon">${aba.icone}</span>
          <div>
            <h3 class="aba-title">${aba.nome}</h3>
            <p class="aba-origem">${aba.origem}</p>
          </div>
        </div>
        
        <div class="aba-section">
          <h4>📌 Por que esta aba existe?</h4>
          <p>${aba.motivacao}</p>
        </div>

        <div class="aba-section">
          <h4>📄 Documentos-fonte que a originaram</h4>
          <ul>
            ${aba.documentosFonte.map(d => `<li><code>${d}</code></li>`).join('')}
          </ul>
        </div>

        <div class="aba-section">
          <h4>💬 Prompt / instrução de criação</h4>
          <div class="prompt-box">${aba.promptOrigem}</div>
        </div>

        <div class="aba-section">
          <h4>⚖️ Artigos ICERD vinculados</h4>
          <div class="artigos-list">
            ${aba.artigos.map(a => `<span class="artigo-badge">${a}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');

    return `
      <div class="secao-block">
        <h2 class="secao-titulo">${secao.secao}</h2>
        <p class="secao-desc">${secao.abas.length} abas documentadas</p>
        ${abasContent}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Metodologia do Escopo — Base Estatística e Grupos Focais</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20px; font-size: 11px; line-height: 1.6; color: #1a1a2e; }
  h1 { font-size: 22px; color: #0f3460; border-bottom: 3px solid #0f3460; padding-bottom: 8px; margin-bottom: 6px; }
  h2 { font-size: 18px; color: #16213e; margin-top: 32px; border-left: 4px solid #0f3460; padding-left: 12px; }
  h3 { font-size: 14px; margin: 0; }
  h4 { font-size: 12px; color: #0f3460; margin: 10px 0 6px; }
  .header { text-align: center; margin-bottom: 28px; border: 2px solid #0f3460; padding: 20px; border-radius: 10px; background: linear-gradient(135deg, #f8f9ff, #eef2ff); }
  .header p { margin: 4px 0; color: #555; font-size: 12px; }
  .header .subtitle { font-size: 10px; color: #94a3b8; margin-top: 8px; }
  .secao-block { margin-bottom: 32px; }
  .secao-titulo { background: linear-gradient(90deg, #0f3460, #16213e); color: white; padding: 10px 16px; border-radius: 8px; border: none; margin-bottom: 4px; }
  .secao-desc { color: #64748b; font-size: 11px; margin-bottom: 16px; padding-left: 16px; }
  .aba-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 12px 0; background: #fafbfc; }
  .aba-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
  .aba-icon { font-size: 28px; }
  .aba-title { color: #0f3460; font-weight: 700; }
  .aba-origem { font-size: 10px; color: #64748b; margin-top: 2px; }
  .aba-section { margin: 10px 0; }
  .aba-section p { margin: 4px 0; }
  .aba-section ul { margin: 4px 0; padding-left: 20px; }
  .aba-section li { margin: 2px 0; }
  .aba-section code { background: #e2e8f0; padding: 1px 5px; border-radius: 3px; font-size: 10px; }
  .prompt-box { background: #f0f4ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 10px; font-size: 11px; font-style: italic; color: #3730a3; }
  .artigos-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .artigo-badge { background: #0f3460; color: white; padding: 3px 10px; border-radius: 12px; font-size: 9px; font-weight: 600; }
  .legenda { margin-top: 24px; padding: 16px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; }
  .legenda h4 { color: #92400e; margin-top: 0; }
  .legenda ul { margin: 6px 0; padding-left: 20px; }
  .legenda li { margin: 3px 0; font-size: 10px; }
  .source { font-size: 9px; color: #94a3b8; font-style: italic; margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
  @media print { .no-print { display: none; } body { padding: 0; } }
  @page { size: A4; margin: 2cm; @bottom-center { content: counter(page); font-size: 9pt; color: #64748b; } }
  @page :first { @bottom-center { content: none; } }
</style></head><body>
${getExportToolbarHTML('Metodologia-Escopo-Projeto')}

<div class="header">
  <h1>📐 Metodologia do Escopo do Projeto</h1>
  <p><strong>Base Estatística (Estatísticas Gerais) e Grupos Focais — Lógica de cada aba</strong></p>
  <p>IV Relatório Periódico do Brasil ao CERD | Sistema de Subsídios</p>
  <p class="subtitle">Gerado em: ${now} | ${tabs.reduce((acc, s) => acc + s.abas.length, 0)} abas documentadas</p>
</div>

<div class="legenda">
  <h4>📋 Legenda de Origens</h4>
  <ul>
    <li><strong>Recomendações CERD</strong> — Aba criada para responder a recomendações específicas das Observações Finais (CERD/C/BRA/CO/18-20, 2022)</li>
    <li><strong>Recomendações ONU</strong> — Aba criada a partir da leitura das lacunas identificadas nos documentos ONU</li>
    <li><strong>Relatório CERD III</strong> — Aba criada em resposta a críticas ou omissões do III Relatório Periódico (2018)</li>
    <li><strong>Diretrizes CERD</strong> — Aba criada para cumprir orientações das Diretrizes de Elaboração de Relatórios (CERD/C/2007/1)</li>
    <li><strong>Auditoria do sistema</strong> — Aba criada durante as fases de auditoria técnica (Fases 1-3) para transparência e controle de qualidade</li>
  </ul>
</div>

${abasHTML}

<div class="legenda" style="background:#f0fdf4;border-color:#86efac;">
  <h4 style="color:#166534;">✅ Regra de Ouro aplicada</h4>
  <p style="font-size:10px;">Todos os dados apresentados nas abas seguem a <strong>Regra de Ouro</strong>: proibição absoluta de dados fabricados, projeções futuras ou estimativas baseadas em proxies multiplicadores. Quando um dado não existe como publicação oficial direta, ele é registrado como <strong>lacuna documentada</strong> (⚠️) com indicação da fonte esperada. Cruzamentos indiretos (🔀) com 2+ fontes auditáveis são permitidos, desde que a metodologia de cálculo seja explicitamente documentada.</p>
</div>

<div class="source">
  📐 Relatório de Metodologia gerado pelo Sistema de Subsídios CERD IV — ${now}
</div>
</body></html>`;
}
