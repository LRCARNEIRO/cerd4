/**
 * siglas.ts — Lista de Siglas para o Relatório CERD IV
 */

export function renderListaSiglas(): string {
  const siglas = [
    ['ANTRA', 'Associação Nacional de Travestis e Transexuais'],
    ['CF', 'Constituição Federal'],
    ['CERD', 'Comitê para a Eliminação da Discriminação Racial'],
    ['CNJ', 'Conselho Nacional de Justiça'],
    ['CONAPIR', 'Conferência Nacional de Promoção da Igualdade Racial'],
    ['DIEESE', 'Departamento Intersindical de Estatística e Estudos Socioeconômicos'],
    ['FBSP', 'Fórum Brasileiro de Segurança Pública'],
    ['FJP', 'Fundação João Pinheiro'],
    ['IBGE', 'Instituto Brasileiro de Geografia e Estatística'],
    ['INCRA', 'Instituto Nacional de Colonização e Reforma Agrária'],
    ['INEP', 'Instituto Nacional de Estudos e Pesquisas Educacionais'],
    ['IPEA', 'Instituto de Pesquisa Econômica Aplicada'],
    ['MIR', 'Ministério da Igualdade Racial'],
    ['MDHC', 'Ministério dos Direitos Humanos e da Cidadania'],
    ['MPI', 'Ministério dos Povos Indígenas'],
    ['ONDH', 'Ouvidoria Nacional de Direitos Humanos'],
    ['PNAD', 'Pesquisa Nacional por Amostra de Domicílios Contínua'],
    ['PNIR', 'Política Nacional de Igualdade Racial'],
    ['PNSIPN', 'Política Nacional de Saúde Integral da População Negra'],
    ['PROUNI', 'Programa Universidade para Todos'],
    ['RASEAM', 'Relatório Anual Socioeconômico das Mulheres'],
    ['SESAI', 'Secretaria Especial de Saúde Indígena'],
    ['SIDRA', 'Sistema IBGE de Recuperação Automática'],
    ['SIM', 'Sistema de Informações sobre Mortalidade'],
    ['SINASC', 'Sistema de Informações sobre Nascidos Vivos'],
    ['SINAPIR', 'Sistema Nacional de Promoção da Igualdade Racial'],
    ['SIS', 'Síntese de Indicadores Sociais (IBGE)'],
    ['STF', 'Supremo Tribunal Federal'],
    ['STJ', 'Superior Tribunal de Justiça'],
    ['SUS', 'Sistema Único de Saúde'],
    ['TSE', 'Tribunal Superior Eleitoral'],
  ];

  return `
  <div style="page-break-after:always"></div>
  <h2>Lista de Siglas</h2>
  <table>
    <thead><tr><th style="width:15%">Sigla</th><th>Significado</th></tr></thead>
    <tbody>${siglas.map(([s, desc]) => `<tr><td><strong>${s}</strong></td><td>${desc}</td></tr>`).join('')}</tbody>
  </table>`;
}
