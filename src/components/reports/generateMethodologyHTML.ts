import { getExportToolbarHTML } from '@/utils/reportExportToolbar';

export function generateMethodologyHTML(): string {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const tabs = [
    {
      secao: 'BASE ESTATÍSTICA — ESTATÍSTICAS E INDICADORES',
      abas: [
        {
          nome: 'Common Core (77 Tabelas)',
          icone: '📖',
          origem: 'Common Core Document (CCD Brasil 2020)',
          motivacao: `Criada para atender à obrigação de atualização do <strong>Common Core Document (HRI/CORE/BRA)</strong>, que é o documento básico comum a todos os tratados de direitos humanos da ONU. O CCD Brasil 2020 continha 77 tabelas estatísticas cobrindo dados demográficos, econômicos e sociais. Esta aba replica a estrutura integral dessas 77 tabelas, monitorando quais possuem dados atualizados (Censo 2022, PNAD 2024, SIS 2024) e quais permanecem com dados de 2018 ou anteriores.`,
          documentosFonte: ['CCD-Brasil-2020.pdf', 'CCD-Brasil-2020-Dados-Atualizacao.docx'],
          promptOrigem: 'Integrar as 77 tabelas estatísticas do Common Core Document 2020, criando uma interface de gestão que monitore o status de atualização de cada tabela com dados de fontes oficiais (SIDRA/IBGE).',
          artigos: ['Art. I (Definição)', 'Art. V (Direitos Econômicos/Sociais)'],
        },
        {
          nome: 'Dados Novos (Auditáveis)',
          icone: '➕',
          origem: 'Auditoria do sistema — dados coletados além do CCD original',
          motivacao: `Inventário de todos os indicadores estatísticos que foram <strong>adicionados ao sistema além das 77 tabelas originais</strong> do Common Core. Inclui séries temporais (FBSP, Atlas da Violência, DataSUS), dados interseccionais e indicadores de vulnerabilidade. Cada registro possui badge de origem (série temporal, banco de dados, cruzamento) e deep link para a fonte primária. Criada para dar transparência ao "delta" entre o CCD 2020 e a base expandida do sistema.`,
          documentosFonte: ['Quadro-Monitoramento-CERD-Brasil.xlsx', 'CERD-Observacoes-Brasil-2022.pdf'],
          promptOrigem: 'Criar um inventário de todos os dados que foram adicionados ao sistema além das 77 tabelas do Common Core original, classificando cada um por tipo de fonte e auditabilidade.',
          artigos: ['Transversal — todos os artigos'],
        },
        {
          nome: 'Dados Gerais',
          icone: '📊',
          origem: 'Common Core Document + Censo 2022',
          motivacao: `Apresenta os <strong>indicadores demográficos e socioeconômicos fundamentais</strong> exigidos pelo Common Core: população total, composição por raça/cor, distribuição regional, PIB per capita, IDH, expectativa de vida e indicadores de pobreza. Todos desagregados por raça conforme exigência das <strong>Diretrizes do CERD (CERD/C/2007/1)</strong>, que determinam que os Estados-partes apresentem dados desagregados por raça, etnia e gênero.`,
          documentosFonte: ['CCD-Brasil-2020.pdf', 'CERD-Guidelines-2007.pdf'],
          promptOrigem: 'Estruturar os dados demográficos gerais do Brasil conforme as seções I-III do Common Core Document, com dados do Censo 2022 e desagregação racial.',
          artigos: ['Art. I (Definição de discriminação racial)', 'Art. V.e (Direitos econômicos e sociais)'],
        },
        {
          nome: 'Segurança / Saúde / Educação',
          icone: '🛡️',
          origem: 'Recomendações CERD + Lacunas ONU + FBSP/DataSUS/INEP',
          motivacao: `Consolidou as <strong>séries temporais 2018-2024</strong> dos três eixos mais demandados pelo Comitê CERD nas Observações Finais de 2022: (1) <strong>Segurança pública</strong> (homicídios por raça, letalidade policial, feminicídio — fonte FBSP 19º Anuário 2025); (2) <strong>Saúde</strong> (mortalidade materna por raça, mortalidade infantil — fonte DataSUS/SIM/SINASC); (3) <strong>Educação</strong> (taxa de analfabetismo por raça, ensino superior — fonte PNAD/Censo). Cada série encerra no último dado real disponível (Regra de Ouro).`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'Quadro-Monitoramento-CERD-Brasil.xlsx'],
          promptOrigem: 'Criar séries temporais 2018-2024 para segurança pública (homicídios, letalidade policial, feminicídio), saúde (mortalidade materna/infantil por raça) e educação (analfabetismo, ensino superior) usando dados reais do FBSP, DataSUS e IBGE.',
          artigos: ['Art. V.b (Segurança pessoal)', 'Art. V.e.iv (Saúde pública)', 'Art. V.e.v (Educação)', 'Art. V.e.i (Trabalho)'],
        },
        {
          nome: 'Lacunas CERD',
          icone: '⚠️',
          origem: 'Observações Finais CERD 2022 + Follow-up 2026',
          motivacao: `Aba de <strong>vinculação direta entre as recomendações da ONU e os dados estatísticos</strong>. Cada lacuna identificada nas Observações Finais (CERD/C/BRA/CO/18-20, 2022) é pareada com evidências quantitativas do sistema. Exemplo: §32-36 (violência contra juventude negra) → série de homicídios FBSP; §23-28 (saúde) → mortalidade materna DataSUS. Permite identificar quais recomendações possuem evidência quantitativa para resposta e quais permanecem como lacunas de dados.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'CERD-Follow-up-Brasil-2026.pdf', 'Follow-up-2026-Resumo-Anotacoes.docx'],
          promptOrigem: 'Vincular cada lacuna/recomendação da ONU (tabela lacunas_identificadas do banco) a indicadores e séries temporais existentes no sistema, criando uma ponte entre evidência qualitativa (texto ONU) e quantitativa (dados SIDRA/FBSP/DataSUS).',
          artigos: ['Art. IX (Relatórios periódicos)', 'Art. II (Medidas de eliminação)'],
        },
        {
          nome: 'Indicadores (BD)',
          icone: '📈',
          origem: 'Banco de dados — tabela indicadores_interseccionais',
          motivacao: `Exibe os <strong>indicadores armazenados diretamente no banco de dados</strong> do sistema (tabela <code>indicadores_interseccionais</code>), permitindo consulta, filtragem por categoria/eixo e verificação de quais possuem desagregação interseccional (raça × gênero × idade × classe × deficiência × território). Serve como painel de controle para a equipe avaliar a cobertura do banco antes da geração de relatórios.`,
          documentosFonte: ['Quadro-Monitoramento-CERD-Brasil.xlsx', 'CERD-Guidelines-2007.pdf'],
          promptOrigem: 'Exibir os indicadores interseccionais do banco de dados com filtros por categoria, eixo e tipo de desagregação, mostrando cobertura real vs. esperada.',
          artigos: ['Art. V (Direitos — todas as alíneas)', 'Art. I (Definição e alcance)'],
        },
        {
          nome: 'Adm Pública (MUNIC/ESTADIC 2024)',
          icone: '🏛️',
          origem: 'CERD III Relatório + Recomendações sobre capacidade institucional',
          motivacao: `Responde à demanda recorrente do Comitê CERD sobre <strong>capacidade institucional</strong> dos entes federados para implementar políticas raciais. Utiliza dados da <strong>MUNIC 2024</strong> (Pesquisa de Informações Básicas Municipais) e <strong>ESTADIC 2024</strong> (Pesquisa de Informações Básicas Estaduais) do IBGE para mapear quais municípios/estados possuem órgão de promoção da igualdade racial, conselho de participação social, plano de igualdade racial e orçamento dedicado. Sustenta o argumento do "Paradoxo Normativo-Implementação" (legislação avançada × implementação frágil).`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'cerd-iii-relatorio-do-estado-brasileiro.pdf'],
          promptOrigem: 'Integrar dados MUNIC/ESTADIC 2024 (IBGE) sobre capacidade institucional dos municípios e estados para políticas de igualdade racial, sustentando o argumento de fragilidade institucional.',
          artigos: ['Art. II.1 (Medidas legislativas e administrativas)', 'Art. VII (Medidas de ensino e educação)'],
        },
        {
          nome: 'COVID-19 e Desigualdade Racial',
          icone: '🦠',
          origem: 'Recomendações CERD + Relatório III + DataSUS',
          motivacao: `O Comitê CERD expressou preocupação específica sobre o <strong>impacto desproporcional da COVID-19 na população negra e indígena</strong>. Esta aba consolida dados do DataSUS (SIVEP-Gripe, e-SUS) sobre mortalidade, hospitalização e vacinação desagregados por raça/cor. Documenta o apagão racial nos registros de saúde (34% dos óbitos sem raça/cor declarada) e as taxas de mortalidade 1,5x maiores para negros, sustentando a conclusão analítica "Impacto Racial da COVID-19".`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'HRC-Compilation-Brasil-2022.pdf'],
          promptOrigem: 'Documentar o impacto racial da pandemia de COVID-19 no Brasil usando dados do DataSUS, incluindo o apagão racial nos registros e a mortalidade desproporcional por raça/cor.',
          artigos: ['Art. V.e.iv (Saúde pública)', 'Art. II (Medidas de eliminação)'],
        },
        {
          nome: 'Fontes de Dados',
          icone: '🌐',
          origem: 'Diretrizes CERD (Guidelines 2007) + Necessidades operacionais',
          motivacao: `Catálogo de <strong>todas as fontes de dados oficiais</strong> utilizadas pelo sistema, com URL de acesso, tipo de API (SIDRA, REST, download), periodicidade e indicadores disponíveis. Criada para cumprir as Diretrizes do CERD que exigem que os Estados-partes informem as fontes e metodologias dos dados estatísticos apresentados. Também serve como referência operacional para a equipe do projeto.`,
          documentosFonte: ['CERD-Guidelines-2007.pdf', 'Guidelines-Elaboration-General-Recommendations.pdf'],
          promptOrigem: 'Criar catálogo de fontes de dados oficiais do Brasil relevantes para o CERD, incluindo IBGE/SIDRA, DataSUS, FBSP, INCRA, FUNAI, SIOP e outros.',
          artigos: ['Art. IX (Relatórios — metodologia)'],
        },
        {
          nome: 'Vulnerabilidades (Cruzadas)',
          icone: '🔗',
          origem: 'Recomendações CERD + Análise interseccional',
          motivacao: `Apresenta os <strong>indicadores de vulnerabilidade com cruzamento raça × outras dimensões</strong>: homicídios por raça (FBSP), letalidade policial (82% negros — FBSP 2025), mortalidade materna (1,2x maior para negras em 2022 — DataSUS; pico de 2,3x em 2021/COVID), feminicídio (63,6% negras — FBSP 2025). Responde à demanda interseccional do Comitê e às Recomendações Gerais nº 25 (dimensões de gênero) e nº 32 (medidas especiais). Cada indicador possui badge de auditoria e deep link.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'Recomendacoes-Gerais-Paragrafos-NOVA.pdf'],
          promptOrigem: 'Consolidar indicadores de vulnerabilidade interseccional (raça × gênero × idade) usando séries temporais reais do FBSP, Atlas da Violência e DataSUS.',
          artigos: ['Art. V.b (Segurança)', 'Art. V.e.iv (Saúde)', 'Art. I e II (Discriminação interseccional)'],
        },
        {
          nome: 'Raça × Gênero',
          icone: '👥',
          origem: 'Recomendação Geral nº 25 (Gênero) + Observações Finais §15-17',
          motivacao: `Responde à <strong>Recomendação Geral nº 25 do CERD</strong> que exige análise da dimensão de gênero da discriminação racial. Apresenta dados de feminicídio (63,6% negras — FBSP 2025) e violência interseccional raça × gênero. Após auditoria da Fase 3, os dados fabricados de "educação interseccional" e "mulheres chefes de família" foram removidos e substituídos por <strong>cards de lacuna documentada</strong> — indicando que esses cruzamentos específicos não existem como publicação oficial direta.`,
          documentosFonte: ['Recomendacoes-Gerais-Paragrafos-NOVA.pdf', 'CERD-Observacoes-Brasil-2022.pdf'],
          promptOrigem: 'Implementar análise interseccional raça × gênero conforme RG nº 25 do CERD, usando dados reais de feminicídio (FBSP) e violência. Dados fabricados removidos na Fase 3 e registrados como lacunas documentadas.',
          artigos: ['Art. V.b (Segurança pessoal)', 'Art. I (Discriminação interseccional)', 'RG nº 25 (Gênero)'],
        },
        {
          nome: 'LGBTQIA+',
          icone: '🏳️‍🌈',
          origem: 'Observações Finais §19-20 + Recomendação Geral nº 35',
          motivacao: `O Comitê CERD solicitou dados sobre <strong>discriminação múltipla contra pessoas LGBTQIA+ negras</strong> (§19-20 das OF 2022). Esta aba apresenta dados da ANTRA (Associação Nacional de Travestis e Transexuais) sobre assassinatos de pessoas trans (79% negras), além de dados do GGB (Grupo Gay da Bahia). Documenta a lacuna crítica: o Brasil não possui pesquisa oficial nacional sobre população LGBTQIA+ desagregada por raça.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'HRC-Compilation-Brasil-2022.pdf'],
          promptOrigem: 'Documentar interseccionalidade raça × orientação sexual/identidade de gênero conforme demandado pelo CERD §19-20, usando dados disponíveis (ANTRA, GGB) e registrando lacunas oficiais.',
          artigos: ['Art. V.b (Segurança)', 'Art. I (Discriminação múltipla)', 'RG nº 35 (Xenofobia)'],
        },
        {
          nome: 'Deficiência',
          icone: '♿',
          origem: 'Observações Finais + Censo 2022 (SIDRA 10126) + PNADC (SIDRA 4178/9384/9354)',
          motivacao: `Responde à demanda do CERD sobre <strong>pessoas com deficiência pertencentes a grupos raciais</strong>. Apresenta prevalência de deficiência por raça/cor usando dados do <strong>Censo 2022 (SIDRA Tabela 10126)</strong>: Branca 7,1%, Preta 8,6%, Parda 7,2%, Amarela 6,6%, Indígena 6,6%. Nível de ocupação PcD por raça (SIDRA 4178): Branca 24,4%, Preta 31,2%, Parda 27,4%. Renda média PcD (SIDRA 9384): Branca R$2.358, Preta R$1.485, Parda R$1.547. Disparidades 14-59 anos (SIDRA 9354): taxa de ocupação PcD Parda 61,7%, Preta 49,6%, Branca 44,7%.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'Recomendacoes-Gerais-Paragrafos-NOVA.pdf'],
          promptOrigem: 'Integrar dados do Censo 2022 (SIDRA 10126) sobre prevalência PcD por raça, PNADC (SIDRA 4178) para ocupação, PNADC (SIDRA 9384) para renda e PNADC (SIDRA 9354) para disparidades 14-59 anos.',
          artigos: ['Art. V.e (Direitos econômicos e sociais)', 'Art. I (Discriminação múltipla)'],
        },
        {
          nome: 'Juventude',
          icone: '👶',
          origem: 'Observações Finais §32-36 + Atlas da Violência 2025',
          motivacao: `O Comitê CERD dedicou 5 parágrafos (§32-36) à <strong>violência contra a juventude negra</strong>, tornando este o tema prioritário das Observações Finais 2022. A aba apresenta dados do Atlas da Violência 2025 (IVJ-N — Índice de Vulnerabilidade da Juventude Negra: risco 2,0x maior entre jovens com ensino fundamental incompleto, chegando a 3,0x entre jovens com ensino superior em 2021), homicídios de jovens (47,8% das vítimas têm 15-29 anos) e o Programa Juventude Negra Viva (Decreto 11.956/2024).`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'CERD-Follow-up-Brasil-2026.pdf'],
          promptOrigem: 'Consolidar dados sobre violência contra juventude negra conforme §32-36 das Observações Finais, usando Atlas da Violência 2025 e FBSP, incluindo IVJ-N e políticas específicas.',
          artigos: ['Art. V.b (Segurança pessoal)', 'Art. II (Medidas de eliminação)', 'Art. V.e (Direitos sociais)'],
        },
        {
          nome: 'Classe Social',
          icone: '💼',
          origem: 'Recomendações CERD + SIS/IBGE 2024',
          motivacao: `Responde à análise de <strong>desigualdade socioeconômica por raça</strong> exigida pelo Art. V.e da Convenção. Após auditoria da Fase 3, os 5 faixas de classe fabricadas foram substituídos por <strong>2 indicadores verificados do SIS/IBGE 2024</strong>: extrema pobreza (Branca 2,6%, Parda 6,0%, Preta 4,7%) e pobreza (Branca 17,7%, Parda 35,5%, Preta 30,8%). Demonstra que a população parda é a mais afetada pela pobreza em termos absolutos.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'Recomendacoes-Gerais-Paragrafos-NOVA.pdf'],
          promptOrigem: 'Substituir dados fabricados de classe social por dados verificados do SIS/IBGE 2024 (Síntese de Indicadores Sociais), mantendo apenas extrema pobreza e pobreza desagregados por raça/cor.',
          artigos: ['Art. V.e.i (Trabalho)', 'Art. V.e.iv (Saúde)', 'Art. II (Medidas)'],
        },
      ],
    },
    {
      secao: 'GRUPOS FOCAIS',
      abas: [
        {
          nome: 'Série Temporal',
          icone: '📈',
          origem: 'Diretrizes CERD + INCRA/FUNAI/FBSP (séries históricas)',
          motivacao: `Gráficos de evolução temporal dos <strong>indicadores-chave de cada grupo focal</strong> (quilombolas, indígenas, ciganos, juventude negra, população negra, mulheres negras) no período 2018-2025. Inclui séries de titulação quilombola (INCRA), demarcação indígena (FUNAI), homicídios por raça (FBSP) e mortalidade materna (DataSUS). Permite ao Comitê CERD visualizar progresso ou retrocesso entre o III e o IV relatório.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'cerd-iii-relatorio-do-estado-brasileiro.pdf'],
          promptOrigem: 'Criar gráficos de série temporal para cada grupo focal, mostrando evolução 2018-2025 dos indicadores territoriais (INCRA/FUNAI) e de vulnerabilidade (FBSP/DataSUS).',
          artigos: ['Art. V.d.iii (Nacionalidade)', 'Art. V.e (Direitos sociais)', 'Art. IX (Relatórios periódicos)'],
        },
        {
          nome: 'Direitos Territoriais',
          icone: '🗺️',
          origem: 'Observações Finais §47-53 + INCRA/FUNAI',
          motivacao: `Responde diretamente aos <strong>§47-53 das Observações Finais de 2022</strong>, que expressam preocupação com (a) a lentidão na titulação de territórios quilombolas (INCRA — 384 títulos acumulados, de 2.019 processos abertos) e (b) a paralisação de demarcações de terras indígenas (FUNAI — 496 homologadas de 646 identificadas). Apresenta série histórica comparando períodos de trava (2018-2022) e retomada (2023-2025), com deep links para documentos-fonte do INCRA e FUNAI.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'CERD-Follow-up-Brasil-2026.pdf'],
          promptOrigem: 'Documentar direitos territoriais quilombolas (INCRA — títulos, processos, certidões FCP) e indígenas (FUNAI — TIs homologadas, em estudo, etnias, línguas) com série histórica 2018-2025 e comparação de períodos.',
          artigos: ['Art. V.d.v (Propriedade)', 'Art. V.e (Direitos econômicos)', 'Art. II (Medidas)'],
        },
        {
          nome: 'Indicadores de Vulnerabilidade',
          icone: '⚡',
          origem: 'Observações Finais + FBSP/Atlas da Violência/DataSUS',
          motivacao: `Consolida os <strong>indicadores de risco por grupo focal</strong>: homicídios (77% negros — FBSP 2025), letalidade policial (82% negros, 5.417 mortes — FBSP 2025), mortalidade materna (negras 57,3 vs. brancas 46,6 por 100 mil NV — DataSUS 2022), taxa de homicídio por 100 mil hab. (negros 28,9 vs. não-negros 10,6 — Atlas 2025), IVJ-N (risco 2,0x para jovens c/ ensino fundamental incompleto — Atlas 2025). Encarceramento: 68,7% negros (FBSP 2025). Cada indicador referencia parágrafo ONU e artigo ICERD correspondente.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'Quadro-Monitoramento-CERD-Brasil.xlsx'],
          promptOrigem: 'Consolidar indicadores de vulnerabilidade por grupo focal usando FBSP 19º Anuário 2025, Atlas da Violência 2025 e DataSUS, vinculando cada indicador a parágrafos ONU e artigos ICERD.',
          artigos: ['Art. V.b (Segurança)', 'Art. V.e.iv (Saúde)', 'Art. I-II (Discriminação e medidas)'],
        },
        {
          nome: 'Lacunas por Grupo',
          icone: '🔍',
          origem: 'Banco de dados — tabela lacunas_identificadas',
          motivacao: `Filtra as <strong>lacunas identificadas no banco de dados por grupo focal</strong> (quilombolas, indígenas, ciganos, juventude negra etc.), permitindo análise focalizada. Exemplo: ciganos possuem lacuna crítica (§54-55) por ausência total de dados no Censo 2022. Cada lacuna exibe status de cumprimento, prioridade, texto original da ONU e resposta sugerida para o CERD IV. Alimentada diretamente pela tabela <code>lacunas_identificadas</code>.`,
          documentosFonte: ['CERD-Observacoes-Brasil-2022.pdf', 'CERD-Follow-up-Brasil-2026.pdf', 'Follow-up-2026-Resumo-Anotacoes.docx'],
          promptOrigem: 'Filtrar lacunas da ONU por grupo focal (quilombolas, indígenas, ciganos, juventude negra), exibindo texto original, status de cumprimento e resposta sugerida para o CERD IV.',
          artigos: ['Art. IX (Relatórios)', 'Art. II (Medidas específicas por grupo)'],
        },
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
  @page { size: A4; margin: 2cm; }
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
    <li><strong>Common Core Document</strong> — Aba criada para atender obrigações do Documento Básico Comum (HRI/CORE/BRA)</li>
    <li><strong>Lacunas ONU</strong> — Aba criada a partir da leitura das lacunas identificadas nos documentos ONU</li>
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
