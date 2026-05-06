import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Protocolo Triple-Check — Fase 1: Inventário Sistêmico
 * 
 * Cataloga TODOS os itens auditáveis do sistema com status de auditoria:
 *   1. Constantes numéricas em StatisticsData.ts (via mapeamento estático)
 *   2. Deep links em deepLinksRegistry.ts (via mapeamento estático)
 *   3. Registros orçamentários (dados_orcamentarios)
 *   4. Indicadores do BD (indicadores_interseccionais)
 *   5. Conclusões analíticas (conclusoes_analiticas)
 */

interface AuditItem {
  id: string;
  tipo: 'constante' | 'url' | 'serie' | 'registro_bd' | 'narrativa';
  secao: string;
  indicador: string;
  valor_atual: string | number | null;
  fonte_declarada: string;
  url_fonte: string | null;
  origem: string;
  nivel_confianca: 'A' | 'B' | 'C' | 'pendente';
  notas_auditoria: string | null;
  auditado: boolean;
}

interface InventoryResult {
  success: boolean;
  timestamp: string;
  totals: {
    constantes: number;
    urls: number;
    series: number;
    registros_bd: number;
    total: number;
    auditados: number;
    pendentes: number;
  };
  sections: Record<string, number>;
  audit_by_section: Record<string, { auditados: number; pendentes: number; total: number }>;
  items: AuditItem[];
}

const INVALID_EVIDENCE_INDICATOR_IDS = new Set([
  '015fc7a1-0b15-4716-9e49-f81788130ed9', // Titularidade Feminina Negra no MCMV
  '1ab9ca2e-5164-4336-85b1-202be6eeb76e', // Perfil Racial Beneficiários MCMV (CadÚnico)
]);

const INVALID_NAME_PATTERNS: RegExp[] = [
  /titularidade feminina negra.*mcmv/,
  /perfil racial.*beneficiarios.*mcmv/,
  /\bmcmv\b(?!.*(negr|indigena|quilombo|cigano|rom\b|racial|raca|cor))/,
  /\bsishab\b(?!.*(negr|indigena|quilombo|cigano|rom\b|racial|raca|cor))/,
];

const RACIAL_CUT_MARKERS: RegExp[] = [
  /\bnegr[oa]s?\b/, /\bpreta?s?\b/, /\bpard[oa]s?\b/, /\bindigena/, /\bquilombo/,
  /\bcigan[oa]s?\b/, /\brom\b|\broma\b|\bromani\b/, /\bpovos? tradicionai?s?\b/,
  /\bterreir/, /\bracial\b/, /\bracializad/, /raca.cor|raca\/cor|raca cor/,
  /\betnic/, /\bafro/, /igualdade racial/, /antirracis/,
];

function normalizeEvidenceText(value: unknown): string {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s\/\.]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isEvidenceEligibleIndicator(r: any): boolean {
  if (r?.categoria === 'common_core' || /^\[CC-/i.test(String(r?.nome || ''))) return false;
  if (r?.id && INVALID_EVIDENCE_INDICATOR_IDS.has(r.id)) return false;
  const haystack = normalizeEvidenceText([r?.nome, r?.categoria, r?.subcategoria, r?.fonte].filter(Boolean).join(' '));
  if (INVALID_NAME_PATTERNS.some((rx) => rx.test(haystack))) return false;
  if (r?.desagregacao_raca === false) {
    const hasRacialMarker = RACIAL_CUT_MARKERS.some((rx) => rx.test(haystack));
    if (!hasRacialMarker) return false;
  }
  return true;
}

// ===============================
// MAPEAMENTO ESTÁTICO — StatisticsData.ts
// Itens marcados como auditados = true são os que passaram por verificação humana
// ===============================
function inventoryStatisticsConstants(): AuditItem[] {
  const items: AuditItem[] = [];
  let idx = 0;
  const id = () => `STAT-${String(++idx).padStart(4, '0')}`;

  // --- dadosDemograficos (AUDITADOS) ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'Dados Gerais', indicador: 'População total Brasil (Censo 2022)', valor_atual: 203080756, fonte_declarada: 'IBGE/SIDRA Tabela 9605', url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605', origem: 'StatisticsData.ts::dadosDemograficos', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Dados Gerais', indicador: 'Pop. Parda (%)', valor_atual: 45.34, fonte_declarada: 'SIDRA 9605', url_fonte: 'https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/all', origem: 'StatisticsData.ts::dadosDemograficos', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Dados Gerais', indicador: 'Pop. Branca (%)', valor_atual: 43.46, fonte_declarada: 'SIDRA 9605', url_fonte: 'https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/all', origem: 'StatisticsData.ts::dadosDemograficos', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Dados Gerais', indicador: 'Pop. Preta (%)', valor_atual: 10.17, fonte_declarada: 'SIDRA 9605', url_fonte: 'https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/all', origem: 'StatisticsData.ts::dadosDemograficos', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Dados Gerais', indicador: 'Pop. Indígena (%)', valor_atual: 0.83, fonte_declarada: 'SIDRA 9605', url_fonte: 'https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/all', origem: 'StatisticsData.ts::dadosDemograficos', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Dados Gerais', indicador: 'Pop. Quilombola', valor_atual: 1330186, fonte_declarada: 'SIDRA 9578', url_fonte: 'https://sidra.ibge.gov.br/Tabela/9578', origem: 'StatisticsData.ts::dadosDemograficos', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Dados Gerais', indicador: 'Pop. Negra (pretos+pardos)', valor_atual: 112739744, fonte_declarada: 'SIDRA 9605', url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605', origem: 'StatisticsData.ts::dadosDemograficos', nivel_confianca: 'A', notas_auditoria: 'Soma de pretos (20.656.458) + pardos (92.083.286)', auditado: true },
    { id: id(), tipo: 'constante', secao: 'Dados Gerais', indicador: '% Negro', valor_atual: 55.51, fonte_declarada: 'SIDRA 9605', url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605', origem: 'StatisticsData.ts::dadosDemograficos', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
  );

  // --- evolucaoComposicaoRacial (série) — AUDITADOS ---
  const anos = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  for (const ano of anos) {
    items.push({ id: id(), tipo: 'serie', secao: 'Dados Gerais', indicador: `Composição racial ${ano} (branca/negra)`, valor_atual: `ver série`, fonte_declarada: ano <= 2023 ? `PNAD Contínua Trimestral ${ano} (SIDRA 6403)` : 'PNAD Q2 2024 (DIEESE)', url_fonte: 'https://sidra.ibge.gov.br/Tabela/6403', origem: 'StatisticsData.ts::evolucaoComposicaoRacial', nivel_confianca: 'A', notas_auditoria: ano === 2024 ? 'Fonte DIEESE/SINESP Nov/2024' : null, auditado: true });
  }

  // --- indicadoresSocioeconomicos (série 2018-2024) — PARCIALMENTE AUDITADOS ---
  for (const ano of [2018, 2019, 2020, 2021, 2022]) {
    items.push({ id: id(), tipo: 'serie', secao: 'Dados Gerais', indicador: `Renda/desemprego/pobreza por raça ${ano}`, valor_atual: 'ver série', fonte_declarada: `PNAD Contínua ${ano}`, url_fonte: 'https://sidra.ibge.gov.br/tabela/6405', origem: 'StatisticsData.ts::indicadoresSocioeconomicos', nivel_confianca: 'pendente', notas_auditoria: 'Anos 2018-2022: mantidos da carga original, pendentes de verificação com SIS/IBGE', auditado: false });
  }
  items.push({ id: id(), tipo: 'serie', secao: 'Dados Gerais', indicador: 'Renda/desemprego por raça 2023', valor_atual: 'R$2.199 negros / R$3.730 brancos', fonte_declarada: 'PNAD 2023 (SIDRA 6405)', url_fonte: 'https://sidra.ibge.gov.br/tabela/6405', origem: 'StatisticsData.ts::indicadoresSocioeconomicos', nivel_confianca: 'A', notas_auditoria: 'Verificado via SIDRA 6405', auditado: true });
  items.push({ id: id(), tipo: 'serie', secao: 'Dados Gerais', indicador: 'Renda/desemprego por raça 2024', valor_atual: 'R$2.392 negros / R$4.009 brancos', fonte_declarada: 'PNAD Q2 2024 (DIEESE)', url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf', origem: 'StatisticsData.ts::indicadoresSocioeconomicos', nivel_confianca: 'A', notas_auditoria: 'Pobreza 2024 = null (SIS não publicado)', auditado: true });

  // --- educacaoSerieHistorica (AUDITADA) ---
  for (const ano of [2018, 2019, 2022, 2023, 2024]) {
    items.push({ id: id(), tipo: 'serie', secao: 'Segurança/Saúde/Educação', indicador: `Ensino superior e analfabetismo por raça ${ano}`, valor_atual: 'ver série', fonte_declarada: `PNAD Contínua Educação ${ano}`, url_fonte: 'https://sidra.ibge.gov.br/tabela/7129', origem: 'StatisticsData.ts::educacaoSerieHistorica', nivel_confianca: 'A', notas_auditoria: 'Fonte corrigida: SIDRA 7129/7125', auditado: true });
  }

  // --- evasaoEscolarSerie (AUDITADA) ---
  items.push({ id: id(), tipo: 'serie', secao: 'Segurança/Saúde/Educação', indicador: 'Evasão escolar por raça 2018-2024 (Jovens 15-29)', valor_atual: 'ver série', fonte_declarada: 'IBGE — Síntese de Indicadores Sociais 2025, Tabela 4.16', url_fonte: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html?edicao=45341&t=resultados', origem: 'StatisticsData.ts::evasaoEscolarSerie', nivel_confianca: 'A', notas_auditoria: 'Auditado manualmente Mar/2026', auditado: true });

  // --- segurancaPublica (AUDITADA) ---
  for (const ano of [2018, 2019, 2020, 2021, 2022, 2023, 2024]) {
    items.push({ id: id(), tipo: 'serie', secao: 'Segurança/Saúde/Educação', indicador: `Homicídio/letalidade por raça ${ano}`, valor_atual: 'ver série', fonte_declarada: 'Atlas da Violência 2025 / 19º Anuário FBSP 2025', url_fonte: 'https://www.ipea.gov.br/atlasviolencia', origem: 'StatisticsData.ts::segurancaPublica', nivel_confianca: 'A', notas_auditoria: 'Auditado — FBSP + Atlas', auditado: true });
  }

  // --- saudeSerieHistorica (AUDITADA) ---
  for (const ano of [2018, 2019, 2020, 2021, 2022, 2023]) {
    items.push({ id: id(), tipo: 'serie', secao: 'Segurança/Saúde/Educação', indicador: `Mortalidade materna e infantil por raça ${ano}`, valor_atual: 'ver série', fonte_declarada: 'DataSUS/SIM + SINASC', url_fonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def', origem: 'StatisticsData.ts::saudeSerieHistorica', nivel_confianca: 'A', notas_auditoria: 'Auditado — TabNet/DataSUS', auditado: true });
  }

  // --- Rendimentos Censo 2022 (PENDENTE) ---
  items.push({ id: id(), tipo: 'constante', secao: 'Dados Gerais', indicador: 'Rendimento médio Brasil (Censo 2022)', valor_atual: 2851, fonte_declarada: 'Censo 2022 preliminar', url_fonte: null, origem: 'StatisticsData.ts::rendimentosCenso2022', nivel_confianca: 'pendente', notas_auditoria: 'Dados preliminares de rendimento — Outubro/2025', auditado: false });

  // --- interseccionalidadeTrabalho (AUDITADA) ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'Raça × Gênero', indicador: 'Renda mulher negra (Q2 2024)', valor_atual: 2003, fonte_declarada: 'DIEESE/PNAD Q2 2024', url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf', origem: 'StatisticsData.ts::interseccionalidadeTrabalho', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Raça × Gênero', indicador: 'Renda homem negro (Q2 2024)', valor_atual: 0, fonte_declarada: 'DIEESE', url_fonte: null, origem: 'StatisticsData.ts::interseccionalidadeTrabalho', nivel_confianca: 'C', notas_auditoria: 'REMOVIDO (Regra de Ouro). DIEESE não desagrega renda por sexo × raça para homens negros. Valor=0 → N/D na UI.', auditado: true },
  );

  // --- deficienciaPorRaca (AUDITADA Mar/2026) ---
  items.push({ id: id(), tipo: 'constante', secao: 'Deficiência', indicador: 'Prevalência PcD por raça (Censo 2022)', valor_atual: '7.1% branca / 8.6% preta / 7.2% parda / 6.6% amarela / 6.6% indígena', fonte_declarada: 'Censo 2022 — SIDRA 10126', url_fonte: 'https://sidra.ibge.gov.br/tabela/10126', origem: 'BD::indicadores_interseccionais (categoria=deficiencia)', nivel_confianca: 'A', notas_auditoria: 'Auditado manualmente Mar/2026.', auditado: true });

  // --- serieAntraTrans (PARCIALMENTE AUDITADA) ---
  for (const ano of [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]) {
    const auditado = ano >= 2023;
    items.push({ id: id(), tipo: 'serie', secao: 'LGBTQIA+', indicador: `Assassinatos trans ${ano}`, valor_atual: 'ver série', fonte_declarada: `Dossiê ANTRA ${ano + 1} (dados ${ano})`, url_fonte: 'https://antrabrasil.org/assassinatos/', origem: 'StatisticsData.ts::serieAntraTrans', nivel_confianca: auditado ? 'A' : 'pendente', notas_auditoria: auditado ? 'Auditado — Dossiê ANTRA' : '% racial pendente verificação nos PDFs dos dossiês', auditado });
  }

  // --- povosTradicionais (AUDITADOS) ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'Povos Tradicionais', indicador: 'Pop. indígena cor/raça (Censo 2022)', valor_atual: 1227642, fonte_declarada: 'SIDRA 9605', url_fonte: 'https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/2780', origem: 'StatisticsData.ts::povosTradicionais', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Povos Tradicionais', indicador: 'Pop. pessoas indígenas (contagem específica)', valor_atual: 1694836, fonte_declarada: 'IBGE Tabela 9718', url_fonte: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html', origem: 'StatisticsData.ts::povosTradicionais', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Povos Tradicionais', indicador: 'TIs homologadas 2023-2025', valor_atual: 20, fonte_declarada: 'FUNAI/ISA', url_fonte: 'https://terrasindigenas.org.br/pt-br/brasil', origem: 'StatisticsData.ts::povosTradicionais', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Povos Tradicionais', indicador: 'Acampamentos ciganos (MUNIC 2019)', valor_atual: 291, fonte_declarada: 'MUNIC/IBGE 2019', url_fonte: null, origem: 'StatisticsData.ts::povosTradicionais', nivel_confianca: 'A', notas_auditoria: 'Dados ciganos: maioria dos campos = null (sem fonte)', auditado: true },
  );

  // --- classePorRaca (AUDITADA) ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'Classe Social', indicador: 'Extrema pobreza por raça (SIS 2024)', valor_atual: 'brancos 2,6% / pardos 6,0% / pretos 4,7%', fonte_declarada: 'SIS/IBGE 2024 (dados 2023)', url_fonte: 'https://agenciabrasil.ebc.com.br/geral/noticia/2024-12/ibge-pobreza-e-extrema-pobreza-atingem-menor-nivel-no-pais-desde-2012', origem: 'StatisticsData.ts::classePorRaca', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Classe Social', indicador: 'Pobreza por raça (SIS 2024)', valor_atual: 'brancos 17,7% / pardos 35,5% / pretos 30,8%', fonte_declarada: 'SIS/IBGE 2024 (dados 2023)', url_fonte: 'https://agenciabrasil.ebc.com.br/geral/noticia/2024-12/ibge-pobreza-e-extrema-pobreza-atingem-menor-nivel-no-pais-desde-2012', origem: 'StatisticsData.ts::classePorRaca', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
  );

  // --- violenciaInterseccional (AUDITADA) ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'Vulnerabilidades', indicador: 'Feminicídio % mulheres negras (2024)', valor_atual: 63.6, fonte_declarada: '19º Anuário FBSP 2025, p.156', url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf', origem: 'StatisticsData.ts::violenciaInterseccional', nivel_confianca: 'A', notas_auditoria: 'AUDITADO 12/03/2026 — confirmado p.156', auditado: true },
    { id: id(), tipo: 'constante', secao: 'Vulnerabilidades', indicador: 'Violência doméstica notificações mulheres negras (abs)', valor_atual: 111209, fonte_declarada: 'DataSUS/SINAN 2024', url_fonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinannet/cnv/violebr.def', origem: 'StatisticsData.ts::violenciaInterseccional', nivel_confianca: 'A', notas_auditoria: 'AUDITADO 12/03/2026 — valores absolutos, NÃO percentuais', auditado: true },
    { id: id(), tipo: 'constante', secao: 'Vulnerabilidades', indicador: 'Estupro % mulheres negras (2024)', valor_atual: 55.6, fonte_declarada: '19º Anuário FBSP 2025', url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf', origem: 'StatisticsData.ts::violenciaInterseccional', nivel_confianca: 'A', notas_auditoria: 'AUDITADO 12/03/2026 — corrigido de 54,2% para 55,6%', auditado: true },
  );

  // --- juventudeNegra (AUDITADA) ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'Juventude', indicador: 'Taxa homicídio negros (por 100 mil)', valor_atual: 28.9, fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP) — p.79', url_fonte: 'https://www.ipea.gov.br/atlasviolencia', origem: 'StatisticsData.ts::juventudeNegra', nivel_confianca: 'A', notas_auditoria: 'Auditado 12/03/2026 — SIM (Atlas 2025, p.79)', auditado: true },
    { id: id(), tipo: 'constante', secao: 'Juventude', indicador: 'Pop. carcerária % negra', valor_atual: 68.7, fonte_declarada: '19º Anuário FBSP 2025, p.19 e 399', url_fonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/', origem: 'StatisticsData.ts::juventudeNegra', nivel_confianca: 'A', notas_auditoria: 'Auditado 12/03/2026 — corrigido de SISDEPEN 68,2% para FBSP 68,7%.', auditado: true },
  );

  // --- trabalhoRacaGenero (AUDITADA) ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'Raça × Gênero', indicador: 'Renda homem não negro (Q2 2024)', valor_atual: 4492, fonte_declarada: 'DIEESE Q2 2024, p.8', url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf', origem: 'StatisticsData.ts::trabalhoRacaGenero', nivel_confianca: 'A', notas_auditoria: 'AUDITADO 12/03/2026 — corrigido de 4568 para 4492', auditado: true },
    { id: id(), tipo: 'constante', secao: 'Raça × Gênero', indicador: 'Razão mulher negra / homem não negro', valor_atual: 0.463, fonte_declarada: 'DIEESE', url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf', origem: 'StatisticsData.ts::trabalhoRacaGenero', nivel_confianca: 'A', notas_auditoria: 'AUDITADO 12/03/2026 — 2079/4492 = 46,3%', auditado: true },
  );

  // --- saudeMaternaRaca (AUDITADA) ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'Raça × Gênero', indicador: 'Mortalidade materna negra (%)', valor_atual: 68.0, fonte_declarada: 'RASEAM 2025 (SIM 2022)', url_fonte: 'https://www.gov.br/mulheres/pt-br/central-de-conteudos/publicacoes/raseam-2025.pdf', origem: 'StatisticsData.ts::saudeMaternaRaca', nivel_confianca: 'A', notas_auditoria: null, auditado: true },
    { id: id(), tipo: 'constante', secao: 'Raça × Gênero', indicador: 'Razão mortalidade materna pretas/brancas', valor_atual: 2.3, fonte_declarada: 'IEPS Jul/2025', url_fonte: 'https://ieps.org.br/mortalidade-materna-de-mulheres-pretas-e-duas-vezes-maior-do-que-de-brancas/', origem: 'StatisticsData.ts::saudeMaternaRaca', nivel_confianca: 'A', notas_auditoria: 'Série 2010-2023: 108,6 vs 46,9 por 100 mil NV', auditado: true },
  );

  // --- chefiaFamiliarRacaGenero (AUDITADA) ---
  items.push({ id: id(), tipo: 'constante', secao: 'Vulnerabilidades', indicador: 'Mulheres chefes monoparentais (total)', valor_atual: 7810826, fonte_declarada: 'Censo 2022/SIDRA 10179', url_fonte: 'https://sidra.ibge.gov.br/Tabela/10179', origem: 'StatisticsData.ts::chefiaFamiliarRacaGenero', nivel_confianca: 'A', notas_auditoria: 'AUDITADO 12/03/2026 — Censo 2022', auditado: true });

  // --- Adm Pública ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'Adm Pública', indicador: 'SINAPIR entes participantes', valor_atual: 'ver BD', fonte_declarada: 'MIR/SINAPIR', url_fonte: 'https://www.gov.br/igualdaderacial/pt-br/assuntos/sinapir', origem: 'AdmPublicaSection', nivel_confianca: 'A', notas_auditoria: null, auditado: false },
  );

  // --- COVID Racial ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'COVID Racial', indicador: 'Mortalidade COVID por raça', valor_atual: 'ver componente', fonte_declarada: 'SIM/DataSUS + Raça e Saúde', url_fonte: 'https://www.racaesaude.org.br/', origem: 'CovidRacialSection', nivel_confianca: 'A', notas_auditoria: null, auditado: false },
  );

  // --- ODS Racial (AUDITADA) ---
  items.push(
    { id: id(), tipo: 'constante', secao: 'ODS Racial', indicador: 'Indicadores ODS com recorte racial', valor_atual: 'ver aba', fonte_declarada: 'IPEA/ODS + IBGE', url_fonte: 'https://odsbrasil.gov.br/', origem: 'OdsRacialTab', nivel_confianca: 'A', notas_auditoria: 'Aba ODS Racial auditada', auditado: true },
  );

  return items;
}

// ===============================
// MAPEAMENTO — deepLinksRegistry.ts
// ===============================
function inventoryDeepLinks(): AuditItem[] {
  const deepLinks = [
    { secao: 'Dados Gerais', indicador: 'População total — Censo 2022', url: 'https://sidra.ibge.gov.br/Tabela/9514', fonte: 'SIDRA/IBGE' },
    { secao: 'Dados Gerais', indicador: 'Composição racial — Censo 2022', url: 'https://sidra.ibge.gov.br/Tabela/9605', fonte: 'SIDRA/IBGE' },
    { secao: 'Dados Gerais', indicador: 'População indígena — Censo 2022', url: 'https://www.ibge.gov.br/brasil-indigena/', fonte: 'IBGE' },
    { secao: 'Dados Gerais', indicador: 'População quilombola — Censo 2022', url: 'https://sidra.ibge.gov.br/Tabela/9578', fonte: 'SIDRA/IBGE' },
    { secao: 'Dados Gerais', indicador: 'Cor/raça PNAD Contínua', url: 'https://sidra.ibge.gov.br/Tabela/6403', fonte: 'SIDRA/IBGE' },
    { secao: 'Dados Gerais', indicador: 'Rendimento médio por cor/raça', url: 'https://sidra.ibge.gov.br/tabela/6405', fonte: 'SIDRA/IBGE' },
    { secao: 'Dados Gerais', indicador: 'Desocupação por cor/raça', url: 'https://sidra.ibge.gov.br/tabela/6402', fonte: 'SIDRA/IBGE' },
    { secao: 'Common Core', indicador: 'Indicadores vitais', url: 'https://sidra.ibge.gov.br/tabela/7358', fonte: 'SIDRA/IBGE' },
    { secao: 'Interseccionalidade', indicador: 'Feminicídio mulheres negras', url: 'https://publicacoes.forumseguranca.org.br/items/c3605778-37b3-4ad6-8239-94e4cb236444', fonte: 'FBSP' },
    { secao: 'Interseccionalidade', indicador: 'Quilombolas — Censo 2022', url: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22327-quilombolas.html', fonte: 'IBGE' },
    { secao: 'Interseccionalidade', indicador: 'Indígenas — Censo 2022', url: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html', fonte: 'IBGE' },
    { secao: 'Interseccionalidade', indicador: 'Violência contra pessoas trans', url: 'https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf', fonte: 'ANTRA' },
    { secao: 'Interseccionalidade', indicador: 'Mercado raça × gênero', url: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html', fonte: 'DIEESE' },
    { secao: 'Interseccionalidade', indicador: 'Saúde materna raça × classe', url: 'https://ieps.org.br/mortalidade-materna-de-mulheres-pretas-e-duas-vezes-maior-do-que-de-brancas/', fonte: 'IEPS' },
    { secao: 'Interseccionalidade', indicador: 'Disque 100 LGBTQIA+', url: 'https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100', fonte: 'ONDH' },
    { secao: 'COVID Racial', indicador: 'Raça e Saúde COVID', url: 'https://www.racaesaude.org.br/', fonte: 'Raça e Saúde' },
    { secao: 'COVID Racial', indicador: 'SciELO cor da morte', url: 'https://www.scielosp.org/article/physis/2024.v34/e34053/', fonte: 'SciELO' },
    { secao: 'COVID Racial', indicador: 'PNAD COVID-19', url: 'https://covid19.ibge.gov.br/pnad-covid/', fonte: 'IBGE' },
    { secao: 'Vulnerabilidades', indicador: 'Chefia familiar negra', url: 'https://www.gov.br/mulheres/pt-br/observatorio-brasil-da-igualdade-de-genero/raseam/ministeriodasmulheres-obig-raseam-2024.pdf', fonte: 'RASEAM' },
    { secao: 'Vulnerabilidades', indicador: 'Insegurança alimentar negra', url: 'https://dssbr.ensp.fiocruz.br/uma-em-cada-cinco-familias-chefiadas-por-pessoas-autodeclaradas-pardas-ou-pretas-sofre-com-a-fome-no-brasil-a-situacao-e-pior-nos-lares-chefiados-por-mulheres-pardas-ou-pretas/', fonte: 'Fiocruz/DSBR' },
    { secao: 'Adm Pública', indicador: 'ESTADIC 2024', url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/16770-pesquisa-de-informacoes-basicas-estaduais.html', fonte: 'IBGE' },
    { secao: 'Adm Pública', indicador: 'MUNIC 2024', url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/10586-pesquisa-de-informacoes-basicas-municipais.html', fonte: 'IBGE' },
    { secao: 'Adm Pública', indicador: 'SINAPIR', url: 'https://www.gov.br/igualdaderacial/pt-br/assuntos/sinapir', fonte: 'MIR' },
    { secao: 'Lacunas CERD', indicador: 'Analfabetismo', url: 'https://sidra.ibge.gov.br/Tabela/7125', fonte: 'SIDRA/IBGE' },
    { secao: 'Lacunas CERD', indicador: 'Boletim DIEESE', url: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf', fonte: 'DIEESE' },
    { secao: 'Dados Novos', indicador: 'Denúncias discriminação', url: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados', fonte: 'ONDH' },
    { secao: 'Dados Novos', indicador: 'Candidaturas negras TSE', url: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2024', fonte: 'TSE' },
    { secao: 'Dados Novos', indicador: 'SISDEPEN', url: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen', fonte: 'SISDEPEN' },
    { secao: 'Dados Novos', indicador: 'Déficit habitacional', url: 'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/', fonte: 'FJP' },
    { secao: 'Dados Novos', indicador: 'VIGITEL', url: 'https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/svsa/vigitel/vigitel-brasil-2006-2024.pdf/view', fonte: 'VIGITEL/MS' },
    { secao: 'Dados Novos', indicador: 'Terras Indígenas', url: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas', fonte: 'FUNAI' },
    { secao: 'Dados Novos', indicador: 'Certidões Palmares', url: 'https://www.gov.br/palmares/pt-br/acesso-a-informacao/copy6_of___Download_do_PDF_das_Comunidades_certificadas__Certidoes_expedidas_____Posicao_14.04.2025.pdf/view', fonte: 'Palmares' },
    { secao: 'Orçamento', indicador: 'Execução federal', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026', fonte: 'CGU' },
    { secao: 'Orçamento', indicador: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/', fonte: 'MPO' },
    { secao: 'Orçamento', indicador: 'SICONFI', url: 'https://siconfi.tesouro.gov.br/', fonte: 'STN' },
    { secao: 'Orçamento', indicador: 'Portal Transparência — MIR', url: 'https://portaldatransparencia.gov.br/orgaos/92000-MINISTERIO-DA-IGUALDADE-RACIAL', fonte: 'CGU' },
    { secao: 'Fontes de Dados', indicador: 'Censo 2022 SIDRA', url: 'https://censo2022.ibge.gov.br', fonte: 'IBGE' },
    { secao: 'Fontes de Dados', indicador: 'PNAD Contínua SIDRA', url: 'https://sidra.ibge.gov.br/pesquisa/pnadct', fonte: 'IBGE' },
    { secao: 'Fontes de Dados', indicador: 'SINESP', url: 'https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/sinesp-1', fonte: 'MJSP' },
    { secao: 'Fontes de Dados', indicador: 'TabNet mortalidade materna', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def', fonte: 'DataSUS' },
    { secao: 'Fontes de Dados', indicador: 'SESAI', url: 'https://www.gov.br/saude/pt-br/composicao/sesai', fonte: 'MS' },
    { secao: 'Fontes de Dados', indicador: 'CadÚnico', url: 'https://aplicacoes.mds.gov.br/sagi/vis/data3/v.php', fonte: 'MDS' },
    { secao: 'Grupos Focais', indicador: 'Juventude Negra estimativa', url: 'https://sidra.ibge.gov.br/Tabela/7113', fonte: 'SIDRA/IBGE' },
    { secao: 'Séries Temporais', indicador: 'Desemprego negro série', url: 'https://sidra.ibge.gov.br/Tabela/6800', fonte: 'SIDRA/IBGE' },
  ];

  return deepLinks.map((dl, i) => ({
    id: `LINK-${String(i + 1).padStart(4, '0')}`,
    tipo: 'url' as const,
    secao: dl.secao,
    indicador: dl.indicador,
    valor_atual: dl.url,
    fonte_declarada: dl.fonte,
    url_fonte: dl.url,
    origem: 'deepLinksRegistry.ts',
    nivel_confianca: 'pendente' as const,
    notas_auditoria: null,
    auditado: false,
  }));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Constantes estatísticas
    const statsItems = inventoryStatisticsConstants();

    // 2. Deep links
    const linkItems = inventoryDeepLinks();

    // 3. Registros orçamentários do BD
    const { data: orcData } = await supabase
      .from('dados_orcamentarios')
      .select('id, programa, orgao, esfera, ano, fonte_dados, url_fonte')
      .order('ano', { ascending: false });

    const orcItems: AuditItem[] = (orcData || []).map((r: any) => ({
      id: r.id,
      tipo: 'registro_bd' as const,
      secao: 'Orçamento',
      indicador: `${r.programa} — ${r.orgao} (${r.esfera} ${r.ano})`,
      valor_atual: `${r.esfera} ${r.ano}`,
      fonte_declarada: r.fonte_dados,
      url_fonte: r.url_fonte,
      origem: `dados_orcamentarios:${r.id}`,
      nivel_confianca: r.url_fonte ? 'A' as const : 'pendente' as const,
      notas_auditoria: r.url_fonte ? null : 'Sem URL de fonte — pendente de verificação',
      auditado: false,
    }));

    // 4. Indicadores interseccionais do BD
    const { data: indData } = await supabase
      .from('indicadores_interseccionais')
      .select('id, nome, categoria, fonte, url_fonte, documento_origem, auditado_manualmente');

    const indItems: AuditItem[] = (indData || []).filter(isEvidenceEligibleIndicator).map((r: any) => ({
      id: r.id,
      tipo: 'registro_bd' as const,
      secao: `Indicadores BD — ${r.categoria}`,
      indicador: r.nome,
      valor_atual: 'ver BD',
      fonte_declarada: r.fonte,
      url_fonte: r.url_fonte,
      origem: `indicadores_interseccionais:${r.id}`,
      nivel_confianca: r.url_fonte ? 'A' as const : 'pendente' as const,
      notas_auditoria: null,
      auditado: r.auditado_manualmente === true,
    }));

    // 5. Conclusões analíticas
    const { data: concData } = await supabase
      .from('conclusoes_analiticas')
      .select('id, titulo, tipo, secao_relatorio, evidencias');

    const concItems: AuditItem[] = (concData || []).map((r: any) => ({
      id: r.id,
      tipo: 'narrativa' as const,
      secao: `Conclusões — ${r.secao_relatorio || r.tipo}`,
      indicador: r.titulo,
      valor_atual: `${r.tipo}`,
      fonte_declarada: 'conclusoes_analiticas',
      url_fonte: null,
      origem: `conclusoes_analiticas:${r.id}`,
      nivel_confianca: 'pendente' as const,
      notas_auditoria: r.evidencias?.length ? `${r.evidencias.length} evidências vinculadas` : 'Sem evidências',
      auditado: false,
    }));

    // Combine all
    const allItems = [...statsItems, ...linkItems, ...orcItems, ...indItems, ...concItems];

    // Section counts
    const sections: Record<string, number> = {};
    const auditBySection: Record<string, { auditados: number; pendentes: number; total: number }> = {};
    for (const item of allItems) {
      sections[item.secao] = (sections[item.secao] || 0) + 1;
      if (!auditBySection[item.secao]) {
        auditBySection[item.secao] = { auditados: 0, pendentes: 0, total: 0 };
      }
      auditBySection[item.secao].total++;
      if (item.auditado) {
        auditBySection[item.secao].auditados++;
      } else {
        auditBySection[item.secao].pendentes++;
      }
    }

    const totalAuditados = allItems.filter(i => i.auditado).length;
    const totalPendentes = allItems.filter(i => !i.auditado).length;

    const result: InventoryResult = {
      success: true,
      timestamp: new Date().toISOString(),
      totals: {
        constantes: allItems.filter(i => i.tipo === 'constante').length,
        urls: allItems.filter(i => i.tipo === 'url').length,
        series: allItems.filter(i => i.tipo === 'serie').length,
        registros_bd: allItems.filter(i => i.tipo === 'registro_bd').length,
        total: allItems.length,
        auditados: totalAuditados,
        pendentes: totalPendentes,
      },
      sections,
      audit_by_section: auditBySection,
      items: allItems,
    };

    console.log(`Audit inventory complete: ${allItems.length} items (${totalAuditados} auditados, ${totalPendentes} pendentes)`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Audit inventory error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
