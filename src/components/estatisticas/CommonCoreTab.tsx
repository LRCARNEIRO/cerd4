import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ============================================
// COMMON CORE DOCUMENT - 77 TABELAS COMPLETAS
// HRI/CORE/BRA/2020 - Atualização 2018-2025
// ============================================

// Status de atualização das tabelas
export type UpdateStatus = 'atualizado' | 'parcial' | 'desatualizado';

export interface CommonCoreTable {
  id: string;
  numero: number;
  titulo: string;
  tituloIngles: string;
  categoria: string;
  descricao: string;
  fonte: string;
  fonteCompleta: string;
  urlFonte?: string;
  tabelaSidra?: string;
  periodoOriginal: string;
  periodoAtualizado: string;
  statusAtualizacao: UpdateStatus;
  dados: {
    headers: string[];
    rows: (string | number)[][];
  };
  notas?: string;
  tendencia?: 'crescente' | 'decrescente' | 'estavel';
}

// ============================================
// EIXO I - DADOS DEMOGRÁFICOS (Tabelas 1-10)
// ============================================

export const tabelasDemograficas: CommonCoreTable[] = [
  {
    id: 'cc-1',
    numero: 1,
    titulo: 'População Total e Taxa de Crescimento',
    tituloIngles: 'Total population and average annual growth rate',
    categoria: 'Demografia',
    descricao: 'Evolução da população brasileira nos censos demográficos',
    fonte: 'IBGE/SIDRA',
    fonteCompleta: 'Instituto Brasileiro de Geografia e Estatística - Censo Demográfico',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9514',
    tabelaSidra: 'Tabela 9514',
    periodoOriginal: '1980-2010',
    periodoAtualizado: '1980-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '1980', '1991', '2000', '2010', '2022'],
      rows: [
        // SIDRA Tabela 9514: https://sidra.ibge.gov.br/Tabela/9514 - Valor oficial: 203.080.756
        ['População total', '119.002.706', '146.825.475', '169.799.170', '190.755.799', '203.080.756'],
        ['Taxa crescimento anual (%)', '2,48*', '1,93', '1,64', '1,17', '0,52']
      ]
    },
    notas: '* Em comparação com 1970 (93.139.037). Censo 2022 realizado com atraso devido à pandemia.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-2',
    numero: 2,
    titulo: 'Taxa Bruta de Natalidade',
    tituloIngles: 'Gross birth rate',
    categoria: 'Demografia',
    descricao: 'Nascidos vivos por mil habitantes',
    fonte: 'IBGE/MS',
    fonteCompleta: 'IBGE e Ministério da Saúde - SVS/CGIAE',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7358',
    tabelaSidra: 'Tabela 7358',
    periodoOriginal: '2000-2015',
    periodoAtualizado: '2000-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Brasil', '2000', '2005', '2010', '2015', '2020', '2022', '2024'],
      rows: [
        ['Taxa ‰', '20,3', '17,5', '15,8', '14,2', '13,1', '12,8', '12,5']
      ]
    },
    tendencia: 'decrescente'
  },
  {
    id: 'cc-3',
    numero: 3,
    titulo: 'Taxa Bruta de Mortalidade',
    tituloIngles: 'Gross mortality rate',
    categoria: 'Demografia',
    descricao: 'Óbitos por mil habitantes',
    fonte: 'IBGE/SIM',
    fonteCompleta: 'IBGE e MS - Sistema de Informações sobre Mortalidade',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7358',
    tabelaSidra: 'Tabela 7358',
    periodoOriginal: '2000-2015',
    periodoAtualizado: '2000-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Brasil', '2000', '2005', '2010', '2015', '2020', '2021', '2022', '2024'],
      rows: [
        ['Taxa ‰', '6,7', '6,2', '6,0', '6,1', '7,7', '8,5', '7,2', '6,8']
      ]
    },
    notas: 'Pico em 2021 devido à pandemia de COVID-19.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-4',
    numero: 4,
    titulo: 'Composição Urbana e Rural',
    tituloIngles: 'Composition of the total population in demographic censuses',
    categoria: 'Demografia',
    descricao: 'Distribuição da população por situação de domicílio',
    fonte: 'IBGE/SIDRA',
    fonteCompleta: 'IBGE - Censo Demográfico',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9514',
    tabelaSidra: 'Tabela 9514',
    periodoOriginal: '1980-2010',
    periodoAtualizado: '1980-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Situação', '1980', '1991', '2000', '2010', '2022'],
      rows: [
        // SIDRA Tabela 9514: https://sidra.ibge.gov.br/Tabela/9514 - Valor oficial: 203.080.756
        ['Brasil (total)', '121.150.573', '146.917.459', '169.590.693', '190.755.799', '203.080.756'],
        ['Urbana', '82.013.375', '110.875.826', '137.755.550', '160.925.792', '175.069.012'],
        ['Rural', '39.137.198', '36.041.633', '31.835.143', '29.830.007', '28.011.744'],
        ['% Urbana', '67,7%', '75,5%', '81,2%', '84,4%', '86,2%']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-5',
    numero: 5,
    titulo: 'Densidade Demográfica',
    tituloIngles: 'Demographic Density in Demographic Censuses',
    categoria: 'Demografia',
    descricao: 'Habitantes por km² nos censos demográficos',
    fonte: 'IBGE/SIDRA',
    fonteCompleta: 'IBGE - Censos Demográficos',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9514',
    tabelaSidra: 'Tabela 9514',
    periodoOriginal: '1960-2010',
    periodoAtualizado: '1960-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Brasil', '1960', '1970', '1980', '1991', '2000', '2010', '2022'],
      rows: [
        ['Hab/km²', '8,34', '11,10', '14,23', '17,26', '19,92', '22,43', '23,86']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-6',
    numero: 6,
    titulo: 'Composição por Sexo',
    tituloIngles: 'Composition of the total resident population, by sex',
    categoria: 'Demografia',
    descricao: 'População residente por sexo',
    fonte: 'IBGE/SIDRA',
    fonteCompleta: 'IBGE - Censo Demográfico',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    tabelaSidra: 'Tabela 9605',
    periodoOriginal: '1991-2010',
    periodoAtualizado: '1991-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Sexo', '1991', '2000', '2010', '2022'],
      rows: [
        // SIDRA Tabela 9605: https://sidra.ibge.gov.br/Tabela/9605
        ['Homens', '72.485.122', '83.576.015', '93.406.990', '98.514.545'],
        ['Mulheres', '74.340.353', '86.223.155', '97.348.809', '104.566.211'],
        ['Razão de sexo (H/M)', '0,975', '0,969', '0,959', '0,942']
      ]
    },
    notas: 'Soma H+M = 203.080.756 (Tabela 9514). Dados Censo 2022.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-7',
    numero: 7,
    titulo: 'Estrutura Etária por Sexo',
    tituloIngles: 'Composition of the total resident population, by sex and age group',
    categoria: 'Demografia',
    descricao: 'População por faixa etária e sexo',
    fonte: 'IBGE/SIDRA',
    fonteCompleta: 'IBGE - Censo Demográfico',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    tabelaSidra: 'Tabela 9605',
    periodoOriginal: '1991-2010',
    periodoAtualizado: '1991-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Faixa etária', '2010 (Total)', '2022 (Total)', '% 2022'],
      rows: [
        ['0-14 anos', '45.932.294', '40.168.345', '19,8%'],
        ['15-29 anos', '51.340.473', '45.215.842', '22,3%'],
        ['30-59 anos', '69.957.451', '84.950.328', '41,8%'],
        ['60+ anos', '23.525.581', '32.727.997', '16,1%']
      ]
    },
    notas: 'Envelhecimento acelerado da população brasileira.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-8',
    numero: 8,
    titulo: 'Razão de Dependência e Envelhecimento',
    tituloIngles: 'Youth, elderly and total dependency ratio and aging rate',
    categoria: 'Demografia',
    descricao: 'Razões de dependência juvenil, idosa e total',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7109',
    tabelaSidra: 'Tabela 7109',
    periodoOriginal: '2015',
    periodoAtualizado: '2015-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '2015', '2018', '2020', '2022', '2024'],
      rows: [
        ['Razão dep. juvenil', '32,5', '30,8', '29,5', '28,0', '26,8'],
        ['Razão dep. idosa', '22,2', '24,5', '26,2', '28,5', '30,2'],
        ['Razão dep. total', '54,7', '55,3', '55,7', '56,5', '57,0'],
        ['% 60+ anos', '11,7%', '13,0%', '14,3%', '15,6%', '16,8%']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-9',
    numero: 9,
    titulo: 'População por Raça/Cor',
    tituloIngles: 'Resident population by color or race',
    categoria: 'Demografia',
    descricao: 'Distribuição da população por autodeclaração de cor ou raça',
    fonte: 'IBGE/SIDRA',
    fonteCompleta: 'IBGE - Censo Demográfico 2022',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    tabelaSidra: 'Tabela 9605',
    periodoOriginal: '1991-2010',
    periodoAtualizado: '1991-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Raça/Cor', '1991', '2000', '2010', '2022', '% 2022'],
      rows: [
        // SIDRA Tabela 9605: https://sidra.ibge.gov.br/Tabela/9605 - Censo 2022 Universo
        // Valores validados: API https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/all
        ['Branca', '75.704.922', '91.298.042', '90.621.281', '88.252.121', '43,46%'],
        ['Preta', '7.335.130', '10.554.336', '14.351.162', '20.656.458', '10,17%'],
        ['Parda', '62.316.085', '65.318.092', '82.820.452', '92.083.286', '45,34%'],
        ['Amarela', '630.658', '761.583', '2.105.353', '850.130', '0,42%'],
        // ATENÇÃO: Indígena por COR/RAÇA (Tabela 9605) = 1.227.642
        // Pessoas Indígenas (metodologia ampliada) = 1.694.836 (ver ibge.gov.br/brasil-indigena)
        ['Indígena (cor/raça)', '294.148', '734.127', '821.501', '1.227.642', '0,60%'],
        ['Negra (Preta+Parda)', '69.651.215', '75.872.428', '97.171.614', '112.739.744', '55,51%']
      ]
    },
    notas: 'População negra = pretos + pardos. Indígenas por cor/raça (Tab. 9605): 1.227.642. Contagem ampliada de Pessoas Indígenas (Censo 2022): 1.694.836 (fonte: ibge.gov.br/brasil-indigena).',
    tendencia: 'crescente'
  },
  {
    id: 'cc-10',
    numero: 10,
    titulo: 'Arranjos Familiares por Sexo do Responsável',
    tituloIngles: 'Percentage distribution of the family arrangements',
    categoria: 'Demografia',
    descricao: 'Composição dos arranjos familiares por tipo e sexo do responsável',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7106',
    tabelaSidra: 'Tabela 7106',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Tipo de Arranjo', '2004 H', '2004 M', '2014 H', '2014 M', '2023 H', '2023 M'],
      rows: [
        ['Casal sem filhos', '48,0%', '3,4%', '40,4%', '10,9%', '35,2%', '15,8%'],
        ['Casal com filhos', '67,7%', '3,6%', '54,9%', '15,1%', '48,5%', '20,3%'],
        ['Monoparental', '3,1%', '25,6%', '3,4%', '26,6%', '4,2%', '28,5%']
      ]
    },
    notas: 'H = Homem responsável; M = Mulher responsável. Aumento de mulheres chefiando famílias.',
    tendencia: 'crescente'
  }
];

// ============================================
// EIXO II - DADOS ECONÔMICOS (Tabelas 11-17)
// ============================================

export const tabelasEconomicas: CommonCoreTable[] = [
  {
    id: 'cc-11',
    numero: 11,
    titulo: 'Indicadores Macroeconômicos',
    tituloIngles: 'Macroeconomic Indicators',
    categoria: 'Economia',
    descricao: 'PIB, variação real, PIB per capita e crescimento global',
    fonte: 'IBGE/BCB',
    fonteCompleta: 'IBGE - Contas Nacionais e Banco Central do Brasil',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6612',
    tabelaSidra: 'Tabela 6612',
    periodoOriginal: '2000-2015',
    periodoAtualizado: '2000-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', 'Var. Real %', 'PIB (R$ bi)', 'PIB per capita (R$)', 'Câmbio (US$)'],
      rows: [
        ['2010', '7,5', '3.822', '19.878', '1,76'],
        ['2015', '-3,8', '6.001', '29.349', '3,90'],
        ['2018', '1,8', '7.004', '33.594', '3,87'],
        ['2020', '-3,3', '7.610', '36.200', '5,16'],
        ['2022', '3,0', '9.915', '47.607', '5,17'],
        ['2023', '2,9', '10.900', '52.092', '4,99'],
        ['2024', 'N/D — Pendente de verificação', 'N/D', 'N/D', 'N/D']
      ]
    },
    notas: 'Valores nominais em R$ bilhões. Dado de 2024 pendente de publicação oficial pelo IBGE.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-12',
    numero: 12,
    titulo: 'Índice de Inflação IPCA',
    tituloIngles: 'Accrued variation of the IPCA Index',
    categoria: 'Economia',
    descricao: 'Variação acumulada do IPCA por ano',
    fonte: 'IBGE/SNIPC',
    fonteCompleta: 'IBGE - Sistema Nacional de Índices de Preços ao Consumidor',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/1419',
    tabelaSidra: 'Tabela 1419',
    periodoOriginal: '2005-2016',
    periodoAtualizado: '2005-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2010', '2015', '2018', '2020', '2021', '2022', '2023', '2024'],
      rows: [
        ['IPCA %', '5,91', '10,67', '3,75', '4,52', '10,06', '5,79', '4,62', 'N/D']
      ]
    },
    notas: 'Pico inflacionário em 2015 e 2021. Dado de 2024 pendente de consolidação pelo IBGE/SNIPC.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-13',
    numero: 13,
    titulo: 'IPCA por Grupo de Produtos',
    tituloIngles: 'IPCA Index by groups of products and services',
    categoria: 'Economia',
    descricao: 'Composição da inflação por categoria de consumo',
    fonte: 'IBGE/SNIPC',
    fonteCompleta: 'IBGE - Sistema Nacional de Índices de Preços ao Consumidor',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7060',
    tabelaSidra: 'Tabela 7060',
    periodoOriginal: '2016',
    periodoAtualizado: '2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Grupo', 'Variação 2023 %', 'Peso Médio %'],
      rows: [
        ['Alimentação e bebidas', '1,03', '21,67'],
        ['Habitação', '4,41', '15,87'],
        ['Artigos de residência', '3,88', '3,71'],
        ['Vestuário', '6,25', '4,80'],
        ['Transportes', '3,35', '20,81'],
        ['Saúde e cuidados pessoais', '6,85', '14,18'],
        ['Despesas pessoais', '8,21', '10,22'],
        ['Educação', '7,44', '5,80'],
        ['Comunicação', '1,85', '2,94']
      ]
    },
    tendencia: 'estavel'
  },
  {
    id: 'cc-14',
    numero: 14,
    titulo: 'Dívida Externa e Dívida Pública',
    tituloIngles: 'External debt and public sector debt',
    categoria: 'Economia',
    descricao: 'Evolução da dívida externa e dívida líquida do setor público',
    fonte: 'BCB',
    fonteCompleta: 'Banco Central do Brasil',
    urlFonte: 'https://www.bcb.gov.br/estatisticas/tabelasespeciais',
    periodoOriginal: '2000-2015',
    periodoAtualizado: '2000-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', 'Dívida Externa (US$ bi)', 'Dívida Líquida SP (R$ bi)', 'DLSP % PIB'],
      rows: [
        ['2010', '352', '1.476', '38,0%'],
        ['2015', '335', '2.137', '35,6%'],
        ['2018', '318', '3.405', '52,8%'],
        ['2020', '341', '4.679', '61,4%'],
        ['2022', '368', '5.312', '56,1%'],
        ['2023', '378', '6.050', '60,8%'],
        ['2024', 'N/D', 'N/D', 'N/D']
      ]
    },
    notas: 'DLSP = Dívida Líquida do Setor Público. Dado de 2024 pendente de publicação oficial pelo BCB.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-15',
    numero: 15,
    titulo: 'Gasto Social Federal (GSF)',
    tituloIngles: 'Federal Social Spending, GDP, GSF/GDP',
    categoria: 'Economia',
    descricao: 'Gasto social federal em relação ao PIB',
    fonte: 'ME/IBGE',
    fonteCompleta: 'Ministério da Economia e IBGE',
    urlFonte: 'https://www.tesourotransparente.gov.br/visualizacao/painel-de-monitoramento-dos-gastos-com-pessoal',
    periodoOriginal: '2002-2015',
    periodoAtualizado: '2002-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', 'GSF % PIB', 'Previdência', 'Saúde', 'Educação', 'Assistência'],
      rows: [
        ['2010', '14,0%', '8,5%', '1,9%', '2,1%', '1,3%'],
        ['2015', '15,7%', '9,3%', '2,1%', '2,7%', '1,5%'],
        ['2018', '17,2%', '10,2%', '2,0%', '2,8%', '1,6%'],
        ['2020', '21,3%', '10,8%', '2,8%', '2,4%', '4,2%'],
        ['2022', '18,5%', '10,5%', '2,2%', '2,6%', '2,8%'],
        ['2023', '19,2%', '10,8%', '2,3%', '2,8%', '3,0%'],
        ['2024', 'N/D', 'N/D', 'N/D', 'N/D', 'N/D']
      ]
    },
    notas: 'Pico em 2020 devido ao Auxílio Emergencial na pandemia. Dado de 2024 pendente de publicação oficial.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-16',
    numero: 16,
    titulo: 'GSF por Área de Atuação (% PIB)',
    tituloIngles: 'Trajectory of the Federal Social Spending by field',
    categoria: 'Economia',
    descricao: 'Participação de cada área no gasto social como % do PIB',
    fonte: 'ME/IBGE',
    fonteCompleta: 'Ministério da Economia e IBGE',
    urlFonte: 'https://www.tesourotransparente.gov.br/visualizacao/painel-de-monitoramento-dos-gastos-com-pessoal',
    periodoOriginal: '2002-2015',
    periodoAtualizado: '2002-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Área', '2010', '2015', '2018', '2020', '2022'],
      rows: [
        ['Previdência Social', '8,5%', '9,3%', '10,2%', '10,8%', '10,5%'],
        ['Saúde', '1,9%', '2,1%', '2,0%', '2,8%', '2,2%'],
        ['Educação e Cultura', '2,1%', '2,7%', '2,8%', '2,4%', '2,6%'],
        ['Assistência Social', '1,3%', '1,5%', '1,6%', '4,2%', '2,8%'],
        ['Trabalho e Emprego', '0,8%', '1,2%', '1,5%', '1,8%', '1,6%'],
        ['Saneamento e Habitação', '0,2%', '0,5%', '0,3%', '0,2%', '0,3%'],
        ['Organização Agrária', '0,1%', '0,2%', '0,1%', '0,1%', '0,2%']
      ]
    },
    notas: 'Coluna 2024 removida — dado pendente de publicação oficial.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-17',
    numero: 17,
    titulo: 'Participação % de cada Área no GSF Total',
    tituloIngles: 'Percentage share of each field in total Federal Social Spending',
    categoria: 'Economia',
    descricao: 'Composição percentual do gasto social federal por área',
    fonte: 'ME/IBGE',
    fonteCompleta: 'Ministério da Economia e IBGE',
    urlFonte: 'https://www.tesourotransparente.gov.br/visualizacao/painel-de-monitoramento-dos-gastos-com-pessoal',
    periodoOriginal: '2002-2015',
    periodoAtualizado: '2002-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Área', '2010', '2015', '2020', '2022'],
      rows: [
        ['Previdência Social', '57,1%', '53,2%', '50,7%', 'N/D'],
        ['Saúde', '12,6%', '11,8%', '13,1%', 'N/D'],
        ['Educação e Cultura', '13,7%', '15,4%', '11,3%', 'N/D'],
        ['Assistência Social', '9,0%', '8,8%', '19,7%', 'N/D'],
        ['Trabalho e Emprego', '5,4%', '6,8%', '8,5%', 'N/D'],
        ['Outros', '2,2%', '4,0%', '-3,3%', 'N/D']
      ]
    },
    notas: 'Assistência Social expandiu significativamente em 2020. Dados de 2022 pendentes de consolidação oficial.',
    tendencia: 'estavel'
  }
];

// ============================================
// EIXO III - EDUCAÇÃO (Tabelas 18-29)
// ============================================

export const tabelasEducacao: CommonCoreTable[] = [
  {
    id: 'cc-18',
    numero: 18,
    titulo: 'Taxa de Analfabetismo por Faixa Etária',
    tituloIngles: 'Illiteracy rate per age groups',
    categoria: 'Educação',
    descricao: 'Percentual de pessoas de 15+ anos que não sabem ler e escrever',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua Educação',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7113',
    tabelaSidra: 'Tabela 7113',
    periodoOriginal: '2004-2015',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Faixa etária', '2004', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['15+ anos (total)', '11,5%', '9,6%', '8,0%', '6,6%', '5,6%', '5,4%'],
        ['15-19 anos', '2,4%', '1,5%', '0,8%', '0,6%', '0,4%', '0,4%'],
        ['20-24 anos', '4,0%', '2,5%', '1,3%', '1,0%', '0,8%', '0,7%'],
        ['55-64 anos', '23,5%', '17,9%', '12,9%', '9,8%', '8,5%', '8,1%'],
        ['65+ anos', '34,4%', '30,8%', '25,7%', '18,6%', '15,8%', '14,9%']
      ]
    },
    notas: 'Queda consistente do analfabetismo, especialmente entre jovens.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-19',
    numero: 19,
    titulo: 'Taxa de Analfabetismo Funcional por Região',
    tituloIngles: 'Functional illiteracy rate by Major Region',
    categoria: 'Educação',
    descricao: 'Pessoas com menos de 4 anos de estudo',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7113',
    tabelaSidra: 'Tabela 7113',
    periodoOriginal: '2014-2015',
    periodoAtualizado: '2014-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Região', '2014', '2018', '2022', '2023'],
      rows: [
        ['Brasil', '17,6%', '16,5%', '14,8%', '14,2%'],
        ['Norte', '20,4%', '18,8%', '17,5%', '16,8%'],
        ['Nordeste', '27,1%', '24,9%', '22,8%', '21,9%'],
        ['Sudeste', '12,7%', '12,0%', '10,5%', '10,2%'],
        ['Sul', '13,8%', '12,8%', '11,2%', '10,8%'],
        ['Centro-Oeste', '16,1%', '14,2%', '12,8%', '12,3%']
      ]
    },
    tendencia: 'decrescente'
  },
  {
    id: 'cc-20',
    numero: 20,
    titulo: 'Taxa Bruta de Frequência Escolar',
    tituloIngles: 'Gross rate of attendance to education institutions',
    categoria: 'Educação',
    descricao: 'Frequência escolar por faixa etária',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua Educação',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7114',
    tabelaSidra: 'Tabela 7114',
    periodoOriginal: '2004-2015',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Faixa etária', '2004', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['0-3 anos (creche)', '13,4%', '23,2%', '25,6%', '35,6%', '37,2%', '38,5%'],
        ['4-5 anos (pré-escola)', '61,5%', '80,1%', '84,3%', '93,8%', '92,5%', '93,8%'],
        ['6-14 anos (fundamental)', '96,1%', '98,2%', '98,6%', '99,5%', '99,2%', '99,3%'],
        ['15-17 anos (médio)', '81,8%', '85,2%', '85,0%', '89,2%', '92,8%', '93,5%']
      ]
    },
    notas: 'Universalização do ensino fundamental praticamente alcançada.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-21',
    numero: 21,
    titulo: 'Taxa Líquida de Frequência Escolar',
    tituloIngles: 'Net rate of attendance by level of education',
    categoria: 'Educação',
    descricao: 'Frequência na idade adequada por nível de ensino',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua Educação',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7114',
    tabelaSidra: 'Tabela 7114',
    periodoOriginal: '2007-2014',
    periodoAtualizado: '2007-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Nível', '2007', '2010', '2014', '2019', '2022', '2023'],
      rows: [
        ['Fundamental I (6-10)', '84,7%', '89,0%', '91,3%', '95,8%', '95,5%', '96,0%'],
        ['Fundamental II (11-14)', '72,5%', '73,7%', '78,3%', '86,5%', '86,8%', '87,2%'],
        ['Ensino Médio (15-17)', '49,0%', '53,5%', '58,6%', '73,1%', '76,8%', '78,5%']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-22',
    numero: 22,
    titulo: 'Taxa de Não Aprovação (Reprovação + Abandono)',
    tituloIngles: 'Non-passing rate by grades',
    categoria: 'Educação',
    descricao: 'Soma das taxas de reprovação e abandono escolar',
    fonte: 'MEC/INEP',
    fonteCompleta: 'MEC - Censo Escolar',
    urlFonte: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar',
    periodoOriginal: '2015',
    periodoAtualizado: '2015-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Nível', '2015 Total', '2015 Pública', '2019 Total', '2022 Total', '2023 Total'],
      rows: [
        ['Fundamental I (1º-5º)', '5,6%', '6,3%', '4,2%', '4,8%', '4,5%'],
        ['Fundamental II (6º-9º)', '14,2%', '15,8%', '10,5%', '11,2%', '10,8%'],
        ['Ensino Médio', '17,4%', '18,9%', '12,8%', '13,5%', '12,2%']
      ]
    },
    notas: 'Impacto da pandemia visível em 2022, com recuperação em 2023.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-23',
    numero: 23,
    titulo: 'Taxa de Aprovação por Nível de Ensino',
    tituloIngles: 'Evolution of the passing rates by level',
    categoria: 'Educação',
    descricao: 'Percentual de aprovação no ensino fundamental e médio',
    fonte: 'MEC/INEP',
    fonteCompleta: 'MEC - Censo Escolar',
    urlFonte: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar',
    periodoOriginal: '2008-2015',
    periodoAtualizado: '2008-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', 'Fund. I', 'Fund. II', 'Médio'],
      rows: [
        ['2008', '87,0%', '79,9%', '73,5%'],
        ['2010', '89,9%', '82,7%', '77,2%'],
        ['2015', '93,2%', '85,7%', '81,7%'],
        ['2019', '95,2%', '89,0%', '86,5%'],
        ['2022', '94,5%', '88,2%', '85,8%'],
        ['2023', '95,0%', '88,8%', '87,2%']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-24',
    numero: 24,
    titulo: 'Taxa de Distorção Idade-Série',
    tituloIngles: 'Evolution of the age-grade distortion rates',
    categoria: 'Educação',
    descricao: 'Percentual de alunos com 2+ anos de atraso escolar',
    fonte: 'MEC/INEP',
    fonteCompleta: 'MEC - Censo Escolar',
    urlFonte: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar',
    periodoOriginal: '2008-2016',
    periodoAtualizado: '2008-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', 'Fund. I', 'Fund. II', 'Médio'],
      rows: [
        ['2008', '17,6%', '29,5%', '33,7%'],
        ['2010', '18,5%', '29,6%', '32,8%'],
        ['2015', '13,2%', '24,9%', '26,7%'],
        ['2019', '10,4%', '21,8%', '23,1%'],
        ['2022', '9,8%', '19,5%', '19,8%'],
        ['2023', '9,2%', '18,8%', '18,5%']
      ]
    },
    tendencia: 'decrescente'
  },
  {
    id: 'cc-25',
    numero: 25,
    titulo: 'Taxa de Conclusão do Ensino Fundamental e Médio',
    tituloIngles: 'Elementary, middle, and high school completion rate',
    categoria: 'Educação',
    descricao: 'Conclusão por nível de ensino, sexo e situação de domicílio',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua Educação',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7113',
    tabelaSidra: 'Tabela 7113',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '2004', '2010', '2014', '2019', '2022', '2023'],
      rows: [
        ['Fundamental (Total)', '65,4%', '76,5%', '80,9%', '86,3%', '87,5%', '88,2%'],
        ['Fund. Homens', '60,6%', '71,5%', '76,5%', '83,5%', '84,8%', '85,6%'],
        ['Fund. Mulheres', '70,3%', '81,8%', '85,4%', '89,2%', '90,3%', '90,9%'],
        ['Fund. Urbano', '71,6%', '79,3%', '83,3%', '88,0%', '89,0%', '89,5%'],
        ['Fund. Rural', '37,1%', '61,0%', '68,4%', '76,8%', '78,5%', '79,5%'],
        ['Médio (Total)', '45,5%', '58,5%', '60,8%', '70,2%', '74,5%', '76,2%']
      ]
    },
    notas: 'Persistem disparidades urbano/rural e de gênero.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-26',
    numero: 26,
    titulo: 'Proporção de Frequência ao Ensino Superior (18-24 anos)',
    tituloIngles: 'Proportion of attendance to higher education',
    categoria: 'Educação',
    descricao: 'Taxa líquida de frequência ao ensino superior',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua Educação',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7114',
    tabelaSidra: 'Tabela 7114',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '2004', '2010', '2014', '2019', '2022', '2023'],
      rows: [
        ['Taxa líquida (18-24)', '10,5%', '14,4%', '17,6%', '23,8%', '25,5%', '26,2%'],
        ['Homens', '9,2%', '12,1%', '14,8%', '20,1%', '21,8%', '22,5%'],
        ['Mulheres', '11,8%', '16,7%', '20,4%', '27,5%', '29,2%', '29,9%'],
        ['Brancos', '16,6%', '21,3%', '25,3%', '31,5%', '32,8%', '33,5%'],
        ['Negros', '5,2%', '8,5%', '11,8%', '18,2%', '20,5%', '21,3%']
      ]
    },
    notas: 'Expansão significativa do acesso, mas persistem desigualdades raciais.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-27',
    numero: 27,
    titulo: 'Média de Anos de Estudo (25+ anos)',
    tituloIngles: 'Average years of study by sex and color/race',
    categoria: 'Educação',
    descricao: 'Escolaridade média da população adulta',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua Educação',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7113',
    tabelaSidra: 'Tabela 7113',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Grupo', '2004', '2010', '2014', '2019', '2022', '2023'],
      rows: [
        ['Total', '6,1', '7,2', '7,8', '9,4', '9,9', '10,2'],
        ['Homens', '5,9', '7,0', '7,5', '9,1', '9,6', '9,9'],
        ['Mulheres', '6,3', '7,5', '8,1', '9,7', '10,2', '10,5'],
        ['Brancos', '7,3', '8,5', '9,1', '10,7', '11,1', '11,4'],
        ['Negros', '4,7', '6,1', '6,8', '8,3', '8,9', '9,2'],
        ['Diferença B-N', '2,6', '2,4', '2,3', '2,4', '2,2', '2,2']
      ]
    },
    notas: 'Diferença racial reduziu levemente, mas ainda é de 2,2 anos.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-28',
    numero: 28,
    titulo: 'Taxa de Conclusão do Ensino Superior (25-34 anos)',
    tituloIngles: 'Higher education completion rate',
    categoria: 'Educação',
    descricao: 'Percentual de jovens adultos com diploma universitário',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua Educação',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7113',
    tabelaSidra: 'Tabela 7113',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Grupo', '2010', '2014', '2019', '2022', '2023'],
      rows: [
        ['Total', '11,4%', '14,2%', '21,3%', '24,8%', '25,9%'],
        ['Homens', '9,8%', '11,8%', '18,1%', '21,5%', '22,5%'],
        ['Mulheres', '12,9%', '16,5%', '24,5%', '28,1%', '29,3%'],
        ['Brancos', '16,2%', '20,5%', '29,8%', '33,5%', '34,8%'],
        ['Negros', '5,8%', '8,2%', '14,2%', '17,8%', '18,9%']
      ]
    },
    notas: 'Expansão das cotas no ensino superior impacta positivamente população negra.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-29',
    numero: 29,
    titulo: 'Proporção de Crianças Fora da Escola',
    tituloIngles: 'Proportion of children out of school',
    categoria: 'Educação',
    descricao: 'Crianças e adolescentes fora da escola por faixa etária',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua Educação',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7114',
    tabelaSidra: 'Tabela 7114',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Faixa etária', '2004', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['4-5 anos', '38,5%', '19,9%', '15,7%', '6,2%', '7,5%', '6,2%'],
        ['6-14 anos', '3,9%', '1,8%', '1,4%', '0,5%', '0,8%', '0,7%'],
        ['15-17 anos', '18,2%', '14,8%', '15,0%', '10,8%', '7,2%', '6,5%']
      ]
    },
    notas: 'Pandemia causou aumento temporário em 2020-2021, revertido em 2022-2023.',
    tendencia: 'decrescente'
  }
];

// ============================================
// EIXO IV - SAÚDE (Tabelas 30-42)
// ============================================

export const tabelasSaude: CommonCoreTable[] = [
  {
    id: 'cc-30',
    numero: 30,
    titulo: 'Expectativa de Vida ao Nascer',
    tituloIngles: 'Life expectancy at birth',
    categoria: 'Saúde',
    descricao: 'Esperança de vida ao nascer por sexo',
    fonte: 'IBGE/Tábuas de Mortalidade',
    fonteCompleta: 'IBGE - Tábuas Completas de Mortalidade',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7362',
    tabelaSidra: 'Tabela 7362',
    periodoOriginal: '2000-2015',
    periodoAtualizado: '2000-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Sexo', '2000', '2010', '2015', '2019', '2021', '2023'],
      rows: [
        ['Total', '69,7', '73,4', '75,2', '76,6', '73,0', '75,5'],
        ['Homens', '66,0', '69,7', '71,7', '73,1', '69,8', '72,1'],
        ['Mulheres', '73,5', '77,0', '78,6', '80,1', '76,2', '78,9']
      ]
    },
    notas: 'Queda abrupta em 2021 devido à COVID-19. Recuperação progressiva. Coluna 2024 removida — dado preliminar (Tábuas de Mortalidade ainda não publicadas).',
    tendencia: 'crescente'
  },
  {
    id: 'cc-31',
    numero: 31,
    titulo: 'Taxa de Fecundidade',
    tituloIngles: 'Fertility rate',
    categoria: 'Saúde',
    descricao: 'Número médio de filhos por mulher',
    fonte: 'IBGE/SIDRA',
    fonteCompleta: 'IBGE - Projeções Populacionais',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7358',
    tabelaSidra: 'Tabela 7358',
    periodoOriginal: '2000-2015',
    periodoAtualizado: '2000-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Brasil', '2000', '2005', '2010', '2015', '2020', '2022'],
      rows: [
        ['Filhos/mulher', '2,38', '2,06', '1,87', '1,72', '1,65', '1,60']
      ]
    },
    notas: 'Fecundidade abaixo do nível de reposição (2,1) desde 2006. Coluna 2024 removida — dado preliminar não publicado oficialmente.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-32',
    numero: 32,
    titulo: 'Principais Causas de Morte por Faixa Etária',
    tituloIngles: 'Main causes of death by age group',
    categoria: 'Saúde',
    descricao: 'Cinco principais causas de morte por grupo etário',
    fonte: 'MS/SIM',
    fonteCompleta: 'Ministério da Saúde - Sistema de Informações sobre Mortalidade',
    urlFonte: 'https://datasus.saude.gov.br/mortalidade-desde-1996-pela-cid-10',
    periodoOriginal: '2015',
    periodoAtualizado: '2015-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Faixa etária', '1ª Causa', '2ª Causa', '3ª Causa'],
      rows: [
        ['0-1 ano', 'Afecções perinatais (40%)', 'Malformações congênitas (25%)', 'Pneumonia (5%)'],
        ['1-4 anos', 'Pneumonia (10%)', 'Transp. (6%)', 'Afogamento (6%)'],
        ['5-14 anos', 'Transporte (12%)', 'Agressões (9%)', 'Afogamento (7%)'],
        ['15-24 anos', 'Agressões (45%)', 'Transporte (17%)', 'Suicídio (5%)'],
        ['25-34 anos', 'Agressões (30%)', 'Transporte (15%)', 'HIV/AIDS (5%)'],
        ['35-44 anos', 'Agressões (13%)', 'Transporte (10%)', 'D. isquêmicas (6%)'],
        ['45-54 anos', 'D. isquêmicas (10%)', 'D. cerebrovasc. (6%)', 'Fígado (5%)'],
        ['55-64 anos', 'D. isquêmicas (12%)', 'D. cerebrovasc. (8%)', 'Diabetes (6%)'],
        ['65-74 anos', 'D. isquêmicas (12%)', 'D. cerebrovasc. (10%)', 'Diabetes (7%)'],
        ['75+ anos', 'D. cerebrovasc. (11%)', 'Pneumonia (10%)', 'D. isquêmicas (9%)']
      ]
    },
    notas: 'Agressões/homicídios são a principal causa entre 15-44 anos.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-33',
    numero: 33,
    titulo: 'Taxa de Mortalidade Infantil',
    tituloIngles: 'Infant mortality rate (IMR)',
    categoria: 'Saúde',
    descricao: 'Óbitos de menores de 1 ano por 1.000 nascidos vivos',
    fonte: 'MS/SIM-SINASC',
    fonteCompleta: 'Ministério da Saúde - SIM e SINASC',
    urlFonte: 'https://datasus.saude.gov.br/mortalidade-desde-1996-pela-cid-10',
    periodoOriginal: '2000-2015',
    periodoAtualizado: '2000-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2000', '2005', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['TMI ‰', '29,0', '22,2', '16,4', '13,8', '12,4', '11,9', '11,5']
      ]
    },
    notas: 'Brasil superou meta do ODM (15,7‰ em 2015). Queda consistente.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-34',
    numero: 34,
    titulo: 'Mortalidade de Menores de 5 Anos',
    tituloIngles: 'Number of deaths of children under 5 per 1,000 live births',
    categoria: 'Saúde',
    descricao: 'Óbitos de menores de 5 anos por 1.000 nascidos vivos',
    fonte: 'MS/SIM-SINASC',
    fonteCompleta: 'Ministério da Saúde - SIM e SINASC',
    urlFonte: 'https://datasus.saude.gov.br/mortalidade-desde-1996-pela-cid-10',
    periodoOriginal: '2005-2015',
    periodoAtualizado: '2005-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2005', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['Taxa ‰', '19,9', '16,4', '14,3', '13,5', '13,0', '12,6']
      ]
    },
    tendencia: 'decrescente'
  },
  {
    id: 'cc-35',
    numero: 35,
    titulo: 'Prevalência de Déficit Ponderal em < 5 anos',
    tituloIngles: 'Ponderal deficit prevalence for children under 5',
    categoria: 'Saúde',
    descricao: 'Desnutrição infantil - peso para idade',
    fonte: 'MS/PNDS',
    fonteCompleta: 'Ministério da Saúde - PNDS e SISVAN',
    urlFonte: 'https://sisaps.saude.gov.br/sisvan/',
    periodoOriginal: '1989-2006',
    periodoAtualizado: '1989-2023',
    statusAtualizacao: 'parcial',
    dados: {
      headers: ['Ano', '1989', '1996', '2006', '2019 (SISVAN)', '2023 (SISVAN)'],
      rows: [
        ['Homens', '5,4%', '4,5%', '1,8%', '2,1%', '2,3%'],
        ['Mulheres', '5,4%', '4,0%', '2,0%', '2,0%', '2,2%'],
        ['Total', '5,4%', '4,2%', '1,9%', '2,1%', '2,2%']
      ]
    },
    notas: 'Dados 1989-2006: PNDS (pesquisa domiciliar representativa). Dados 2019-2023: SISVAN (crianças acompanhadas em UBS — amostra não-representativa). Metodologias distintas: comparação direta requer cautela.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-36',
    numero: 36,
    titulo: 'Prevalência de Baixo Peso ao Nascer',
    tituloIngles: 'Prevalence of low birth weight by region',
    categoria: 'Saúde',
    descricao: 'Nascidos vivos com menos de 2.500g',
    fonte: 'MS/SINASC',
    fonteCompleta: 'Ministério da Saúde - SINASC',
    urlFonte: 'https://datasus.saude.gov.br/nascidos-vivos-desde-1994',
    periodoOriginal: '2004-2011',
    periodoAtualizado: '2004-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Região', '2004', '2011', '2015', '2019', '2022'],
      rows: [
        ['Brasil', '8,2%', '8,5%', '8,4%', '8,5%', '8,6%'],
        ['Norte', '7,4%', '7,6%', '7,5%', '7,6%', '7,7%'],
        ['Nordeste', '7,8%', '7,9%', '7,8%', '7,9%', '8,0%'],
        ['Sudeste', '9,0%', '9,2%', '9,1%', '9,2%', '9,3%'],
        ['Sul', '8,5%', '8,8%', '8,7%', '8,8%', '8,9%'],
        ['Centro-Oeste', '8,0%', '8,2%', '8,2%', '8,3%', '8,4%']
      ]
    },
    notas: 'Taxa relativamente estável. Sudeste tem maior prevalência (mais diagnósticos?).',
    tendencia: 'estavel'
  },
  {
    id: 'cc-37',
    numero: 37,
    titulo: 'Razão de Mortalidade Materna',
    tituloIngles: 'Maternal mortality ratio (MMR)',
    categoria: 'Saúde',
    descricao: 'Óbitos maternos por 100.000 nascidos vivos',
    fonte: 'MS/SIM',
    fonteCompleta: 'Ministério da Saúde - SIM',
    urlFonte: 'https://datasus.saude.gov.br/mortalidade-desde-1996-pela-cid-10',
    periodoOriginal: '2001-2011',
    periodoAtualizado: '2001-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2001', '2010', '2015', '2019', '2020', '2021', '2022'],
      rows: [
        ['RMM', '70,9', '68,2', '57,6', '55,3', '71,9', '107,5', '62,8']
      ]
    },
    notas: 'Pico em 2021 devido à COVID-19. Meta ODS: 30/100mil até 2030.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-38',
    numero: 38,
    titulo: 'Mortalidade Materna por Causas',
    tituloIngles: 'Maternal mortality according to causes',
    categoria: 'Saúde',
    descricao: 'Distribuição percentual dos óbitos maternos por tipo de causa',
    fonte: 'MS/SIM',
    fonteCompleta: 'Ministério da Saúde - SIM',
    urlFonte: 'https://datasus.saude.gov.br/mortalidade-desde-1996-pela-cid-10',
    periodoOriginal: '2001-2015',
    periodoAtualizado: '2001-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Causa', '2010', '2015', '2019', '2021', '2022'],
      rows: [
        ['Causas diretas', '66,7%', '66,5%', '65,0%', '52,8%', '64,5%'],
        ['Causas indiretas', '30,7%', '31,0%', '32,5%', '45,2%', '33,0%'],
        ['Não especificadas', '2,6%', '2,5%', '2,5%', '2,0%', '2,5%']
      ]
    },
    notas: 'COVID-19 elevou causas indiretas em 2021.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-39',
    numero: 39,
    titulo: 'Uso de Métodos Contraceptivos',
    tituloIngles: 'Percentage of use of contraceptive methods',
    categoria: 'Saúde',
    descricao: 'Uso de métodos contraceptivos por mulheres em idade fértil',
    fonte: 'MS/PNDS',
    fonteCompleta: 'Ministério da Saúde - PNDS',
    urlFonte: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-mulher',
    periodoOriginal: '1996-2006',
    periodoAtualizado: '1996-2019',
    statusAtualizacao: 'desatualizado',
    dados: {
      headers: ['Método', '1996', '2006', '2019'],
      rows: [
        ['Qualquer método', '76,7%', '80,6%', 'N/D — Pendente de verificação'],
        ['Esterilização feminina', '40,1%', '29,1%', 'N/D'],
        ['Pílula', '20,7%', '24,7%', 'N/D'],
        ['Preservativo masculino', '4,4%', '12,2%', 'N/D'],
        ['DIU', '1,1%', '1,9%', 'N/D'],
        ['Esterilização masculina', '2,6%', '5,1%', 'N/D']
      ]
    },
    notas: 'Dados de 2019 removidos por serem estimativas (SISCAN/SIAB). Última PNDS oficial: 2006. Aguardando nova pesquisa nacional.',
    
    tendencia: 'estavel'
  },
  {
    id: 'cc-40',
    numero: 40,
    titulo: 'Taxa de Atendimentos Pré-Natal',
    tituloIngles: 'Rate of prenatal care',
    categoria: 'Saúde',
    descricao: 'Percentual de gestantes com 7+ consultas de pré-natal',
    fonte: 'MS/SINASC',
    fonteCompleta: 'Ministério da Saúde - SINASC',
    urlFonte: 'https://datasus.saude.gov.br/nascidos-vivos-desde-1994',
    periodoOriginal: '2004-2011',
    periodoAtualizado: '2004-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '2004', '2010', '2015', '2019', '2022'],
      rows: [
        ['7+ consultas', '52,5%', '61,1%', '66,1%', '72,8%', '74,5%'],
        ['Nenhuma consulta', '2,4%', '1,5%', '0,9%', '0,6%', '0,5%'],
        ['1-3 consultas', '7,8%', '5,2%', '3,8%', '2,8%', '2,5%']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-41',
    numero: 41,
    titulo: 'Cobertura de Imunização Infantil',
    tituloIngles: 'Percentage of children vaccinated',
    categoria: 'Saúde',
    descricao: 'Cobertura vacinal de menores de 1 ano',
    fonte: 'MS/PNI',
    fonteCompleta: 'Ministério da Saúde - Programa Nacional de Imunizações',
    urlFonte: 'https://sipni.datasus.gov.br/',
    periodoOriginal: '2004-2015',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Vacina', '2010', '2015', '2019', '2021', '2023'],
      rows: [
        ['BCG', '106,5%', '105,1%', '86,9%', '68,3%', '79,5%'],
        ['Hepatite B (<1a)', '96,8%', '97,7%', '85,9%', '68,5%', '77,8%'],
        ['Poliomielite', '99,1%', '98,3%', '84,2%', '67,0%', '77,5%'],
        ['Tríplice Viral', '99,5%', '96,1%', '93,1%', '71,5%', '82,5%'],
        ['Pentavalente', '96,2%', '95,7%', '70,7%', '68,0%', '75,2%']
      ]
    },
    notas: 'Queda significativa na cobertura vacinal desde 2017. Recuperação lenta.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-42',
    numero: 42,
    titulo: 'Prevalência de HIV/AIDS',
    tituloIngles: 'HIV/AIDS prevalence',
    categoria: 'Saúde',
    descricao: 'Taxa de detecção de HIV/AIDS por 100.000 habitantes',
    fonte: 'MS/SINAN',
    fonteCompleta: 'Ministério da Saúde - SINAN e Boletim Epidemiológico HIV/AIDS',
    urlFonte: 'https://www.gov.br/aids/pt-br',
    periodoOriginal: '2006-2015',
    periodoAtualizado: '2006-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '2010', '2015', '2019', '2022'],
      rows: [
        ['Detecção AIDS', '21,2', '20,6', '17,8', '14,8'],
        ['Detecção HIV', '-', '24,1', '25,3', '18,5'],
        ['Mortalidade AIDS', '6,3', '5,6', '4,3', '3,5']
      ]
    },
    notas: 'Detecção de AIDS em queda; HIV aumentou até 2019, depois caiu. Mortalidade em queda.',
    tendencia: 'decrescente'
  }
];

// ============================================
// EIXO V - TRABALHO (Tabelas 43-50)
// ============================================

export const tabelasTrabalho: CommonCoreTable[] = [
  {
    id: 'cc-43',
    numero: 43,
    titulo: 'Taxa de Participação na Força de Trabalho',
    tituloIngles: 'Labor force participation rate',
    categoria: 'Trabalho',
    descricao: 'Percentual da PIA que está ocupada ou buscando trabalho',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6318',
    tabelaSidra: 'Tabela 6318',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Grupo', '2004', '2010', '2015', '2019', '2022', '2024'],
      rows: [
        ['Total', '58,9%', '59,7%', '61,4%', '61,8%', '62,5%', '62,8%'],
        ['Homens', '72,1%', '72,3%', '73,5%', '72,8%', '73,2%', '73,5%'],
        ['Mulheres', '46,6%', '48,1%', '50,2%', '51,6%', '52,6%', '53,0%']
      ]
    },
    notas: 'PNAD Contínua trimestral — valores anuais são médias dos 4 trimestres. Dado 2024: média T1-T4.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-44',
    numero: 44,
    titulo: 'Taxa de Desemprego',
    tituloIngles: 'Unemployment rate',
    categoria: 'Trabalho',
    descricao: 'Percentual de desocupados na força de trabalho',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6318',
    tabelaSidra: 'Tabela 6318',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Grupo', '2010', '2015', '2019', '2021', '2022', '2024'],
      rows: [
        ['Total', '7,1%', '8,5%', '11,9%', '13,5%', '9,3%', '6,8%'],
        ['Homens', '5,7%', '6,8%', '9,7%', '11,0%', '7,5%', '5,5%'],
        ['Mulheres', '9,1%', '10,8%', '14,7%', '16,5%', '11,6%', '8,5%'],
        ['Brancos', '5,8%', '6,9%', '9,8%', '11,3%', '7,5%', '5,2%'],
        ['Negros', '8,1%', '9,9%', '13,8%', '15,6%', '10,9%', '8,2%'],
        ['Jovens 18-24', '16,8%', '18,9%', '25,3%', '29,8%', '19,2%', '15,5%']
      ]
    },
    notas: 'PNAD Contínua trimestral — valores anuais são médias dos 4 trimestres. Pico em 2021 devido à pandemia. Recuperação significativa em 2022-2024.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-45',
    numero: 45,
    titulo: 'Taxa de Ocupação por Sexo e Raça',
    tituloIngles: 'Employment rate by sex and color/race',
    categoria: 'Trabalho',
    descricao: 'Percentual de ocupados na PIA',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6318',
    tabelaSidra: 'Tabela 6318',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Grupo', '2010', '2015', '2019', '2022', '2024'],
      rows: [
        ['Total', '55,5%', '56,2%', '54,4%', '56,7%', '58,5%'],
        ['Homens', '68,2%', '68,5%', '65,8%', '67,7%', '69,5%'],
        ['Mulheres', '43,6%', '44,7%', '43,9%', '46,5%', '48,2%'],
        ['Brancos', '57,8%', '58,5%', '56,5%', '58,8%', '60,2%'],
        ['Negros', '53,4%', '54,0%', '52,5%', '54,8%', '57,0%']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-46',
    numero: 46,
    titulo: 'Taxa de Informalidade',
    tituloIngles: 'Informality rate',
    categoria: 'Trabalho',
    descricao: 'Trabalhadores informais em relação ao total de ocupados',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6323',
    tabelaSidra: 'Tabela 6323',
    periodoOriginal: '2012-2014',
    periodoAtualizado: '2012-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Grupo', '2012', '2015', '2019', '2022', '2024'],
      rows: [
        ['Total', '43,8%', '44,6%', '41,1%', '39,8%', '38,2%'],
        ['Homens', '41,8%', '42,5%', '39,2%', '38,0%', '36,5%'],
        ['Mulheres', '46,3%', '47,2%', '43,5%', '42,0%', '40,2%'],
        ['Brancos', '37,5%', '38,2%', '35,0%', '33,5%', '32,1%'],
        ['Negros', '49,5%', '50,5%', '46,8%', '45,5%', '43,8%']
      ]
    },
    notas: 'Informalidade estruturalmente maior entre negros.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-47',
    numero: 47,
    titulo: 'Rendimento Médio do Trabalho',
    tituloIngles: 'Average monthly earnings from work',
    categoria: 'Trabalho',
    descricao: 'Rendimento médio habitual do trabalho principal (R$ correntes)',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6387',
    tabelaSidra: 'Tabela 6387',
    periodoOriginal: '2005-2015',
    periodoAtualizado: '2012-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Grupo', '2012', '2015', '2019', '2022', '2024'],
      rows: [
        ['Total', 'R$ 1.893', 'R$ 2.180', 'R$ 2.415', 'R$ 2.787', 'R$ 3.225'],
        ['Homens', 'R$ 2.152', 'R$ 2.478', 'R$ 2.782', 'R$ 3.180', 'R$ 3.680'],
        ['Mulheres', 'R$ 1.552', 'R$ 1.793', 'R$ 1.972', 'R$ 2.305', 'R$ 2.685'],
        ['Brancos', 'R$ 2.396', 'R$ 2.785', 'R$ 3.115', 'R$ 3.548', 'R$ 4.120'],
        ['Negros', 'R$ 1.388', 'R$ 1.588', 'R$ 1.762', 'R$ 2.085', 'R$ 2.425'],
        ['Razão N/B', '57,9%', '57,0%', '56,6%', '58,8%', '58,9%']
      ]
    },
    notas: 'Negros recebem cerca de 59% do rendimento de brancos.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-48',
    numero: 48,
    titulo: 'Ocupados por Setor de Atividade',
    tituloIngles: 'Employed persons by sector of activity',
    categoria: 'Trabalho',
    descricao: 'Distribuição dos ocupados por setor econômico',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6321',
    tabelaSidra: 'Tabela 6321',
    periodoOriginal: '2005-2014',
    periodoAtualizado: '2005-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Setor', '2010', '2015', '2019', '2024'],
      rows: [
        ['Agricultura', '15,8%', '13,0%', '9,4%', '8,2%'],
        ['Indústria', '15,5%', '12,9%', '12,8%', '12,5%'],
        ['Construção', '8,3%', '8,5%', '6,8%', '7,2%'],
        ['Comércio/Reparação', '17,5%', '17,1%', '18,5%', '18,8%'],
        ['Transporte/Armazen.', '4,5%', '5,3%', '5,2%', '5,5%'],
        ['Alojamento/Aliment.', '3,8%', '4,6%', '5,8%', '6,2%'],
        ['Administração Pública', '5,0%', '5,0%', '5,2%', '5,0%'],
        ['Educ./Saúde/Serv. Soc.', '9,8%', '10,3%', '11,2%', '12,0%'],
        ['Outros Serviços', '17,5%', '18,5%', '20,2%', '19,8%'],
        ['Serviços Domésticos', '6,8%', '6,2%', '6,3%', '5,8%']
      ]
    },
    tendencia: 'estavel'
  },
  {
    id: 'cc-49',
    numero: 49,
    titulo: 'Contribuintes da Previdência Social',
    tituloIngles: 'Proportion of taxpayers in the economically active population',
    categoria: 'Trabalho',
    descricao: 'Proporção de contribuintes na PEA',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6326',
    tabelaSidra: 'Tabela 6326',
    periodoOriginal: '2001-2011',
    periodoAtualizado: '2001-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Sexo', '2005', '2010', '2015', '2019', '2022', '2024'],
      rows: [
        ['Total', '47,5%', '55,8%', '60,5%', '62,8%', '65,2%', '66,5%'],
        ['Homens', '48,4%', '56,6%', '61,2%', '63,5%', '66,0%', '67,2%'],
        ['Mulheres', '46,3%', '54,9%', '59,6%', '62,0%', '64,2%', '65,6%']
      ]
    },
    notas: 'Aumento consistente na formalização e contribuição previdenciária.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-50',
    numero: 50,
    titulo: 'Cobertura da Proteção Social Básica',
    tituloIngles: 'Proportion of basic public social security coverage',
    categoria: 'Trabalho',
    descricao: 'Cobertura direta e indireta da previdência para PIA',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6326',
    tabelaSidra: 'Tabela 6326',
    periodoOriginal: '2001-2011',
    periodoAtualizado: '2001-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Sexo', '2005', '2010', '2015', '2019', '2022', '2024'],
      rows: [
        ['Total', '51,7%', '55,0%', '59,8%', '63,5%', '66,8%', '68,2%'],
        ['Homens', '50,3%', '53,5%', '58,0%', '62,0%', '65,5%', '67,0%'],
        ['Mulheres', '53,1%', '56,5%', '61,5%', '65,0%', '68,2%', '69,5%']
      ]
    },
    notas: 'Cobertura inclui contribuintes, cônjuges e dependentes até 21 anos.',
    tendencia: 'crescente'
  }
];

// ============================================
// EIXO VI - POBREZA E DESIGUALDADE (Tabelas 51-58)
// ============================================

export const tabelasPobreza: CommonCoreTable[] = [
  {
    id: 'cc-51',
    numero: 51,
    titulo: 'Rede de Assistência Social (CRAS e CREAS)',
    tituloIngles: 'Number of CRAS and CREAS facilities',
    categoria: 'Pobreza',
    descricao: 'Unidades de referência do SUAS',
    fonte: 'MDS/SUAS',
    fonteCompleta: 'Ministério do Desenvolvimento Social - Censo SUAS',
    urlFonte: 'https://aplicacoes.mds.gov.br/snas/vigilancia/index2.php',
    periodoOriginal: '2007-2016',
    periodoAtualizado: '2007-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Equipamento', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['CRAS', '6.801', '8.155', '8.358', '8.540', '8.605'],
        ['CREAS', '1.590', '2.435', '2.728', '2.852', '2.895']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-52',
    numero: 52,
    titulo: 'Benefícios de Assistência Social (BPC)',
    tituloIngles: 'Amount of active benefits of social assistance support',
    categoria: 'Pobreza',
    descricao: 'Benefícios de Prestação Continuada ativos',
    fonte: 'MDS/INSS',
    fonteCompleta: 'MDS e INSS - Anuário Estatístico',
    urlFonte: 'https://www.gov.br/previdencia/pt-br/assuntos/previdencia-social/bpc',
    periodoOriginal: '2010-2016',
    periodoAtualizado: '2010-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Tipo', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['Total', '3.413.084', '4.251.726', '4.694.852', '5.852.145', '6.125.380'],
        ['PcD', '1.785.185', '2.326.506', '2.612.358', '3.148.520', '3.285.450'],
        ['Idosos', '1.627.899', '1.925.220', '2.082.494', '2.703.625', '2.839.930']
      ]
    },
    notas: 'Expansão significativa pós-pandemia.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-53',
    numero: 53,
    titulo: 'Distribuição de Renda (Palma e participação)',
    tituloIngles: 'Percentage distribution of income',
    categoria: 'Pobreza',
    descricao: 'Participação na renda por grupos e índice de Palma',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7435',
    tabelaSidra: 'Tabela 7435',
    periodoOriginal: '2005-2015',
    periodoAtualizado: '2005-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Grupo', '2005', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['40% mais pobres', '11,0%', '12,8%', '13,6%', '12,4%', '12,8%', '13,1%'],
        ['40-90%', '43,6%', '45,1%', '45,9%', '44,2%', '45,0%', '45,2%'],
        ['10% mais ricos', '45,3%', '42,1%', '40,5%', '43,4%', '42,2%', '41,7%'],
        ['Índice de Palma', '4,1', '3,3', '3,0', '3,5', '3,3', '3,2']
      ]
    },
    notas: 'Índice de Palma = renda 10% mais ricos / 40% mais pobres. Quanto menor, mais igual.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-54',
    numero: 54,
    titulo: 'Renda Domiciliar Per Capita',
    tituloIngles: 'Per capita monthly household income',
    categoria: 'Pobreza',
    descricao: 'Renda média e mediana do domicílio (R$ correntes)',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7435',
    tabelaSidra: 'Tabela 7435',
    periodoOriginal: '2005-2015',
    periodoAtualizado: '2005-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['Média', 'R$ 1.206', 'R$ 1.270', 'R$ 1.439', 'R$ 1.625', 'R$ 1.848'],
        ['Mediana', 'R$ 712', 'R$ 788', 'R$ 928', 'R$ 1.085', 'R$ 1.250']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-55',
    numero: 55,
    titulo: 'Razão de Desigualdade por Sexo e Raça',
    tituloIngles: 'Social inequality ratios by sex and race',
    categoria: 'Pobreza',
    descricao: 'Razão de rendimento entre grupos',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7435',
    tabelaSidra: 'Tabela 7435',
    periodoOriginal: '2005-2015',
    periodoAtualizado: '2005-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Razão', '2005', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['Homens/Mulheres', '1,51', '1,49', '1,50', '1,45', '1,42', '1,40'],
        ['Brancos/Negros', '1,89', '1,74', '1,89', '1,73', '1,68', '1,65']
      ]
    },
    notas: 'Redução lenta das desigualdades de gênero e raça na renda.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-56',
    numero: 56,
    titulo: 'Proporção da População por Faixa de Renda',
    tituloIngles: 'Percentage distribution of population by income groups',
    categoria: 'Pobreza',
    descricao: 'Distribuição por faixas de salário mínimo per capita',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7435',
    tabelaSidra: 'Tabela 7435',
    periodoOriginal: '2005-2015',
    periodoAtualizado: '2005-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Faixa (SM pc)', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['Até 1/4', '8,5%', '9,2%', '6,2%', '4,8%', '4,2%'],
        ['1/4 a 1/2', '17,8%', '17,8%', '13,5%', '11,2%', '10,5%'],
        ['1/2 a 1', '28,5%', '30,3%', '25,8%', '23,5%', '22,8%'],
        ['1 a 2', '25,2%', '24,7%', '30,2%', '32,5%', '33,2%'],
        ['Mais de 2', '16,8%', '15,0%', '18,5%', '22,8%', '24,2%']
      ]
    },
    notas: 'Redução significativa da pobreza extrema (até 1/4 SM).',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-57',
    numero: 57,
    titulo: 'Pobreza Infantil por Faixa Etária',
    tituloIngles: 'Percentage of population in poverty by age group',
    categoria: 'Pobreza',
    descricao: 'Proporção de crianças em domicílios com até 1/4 SM pc',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7435',
    tabelaSidra: 'Tabela 7435',
    periodoOriginal: '2005-2015',
    periodoAtualizado: '2005-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Faixa etária', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['0-4 anos', '15,8%', '17,6%', '10,2%', '7,5%', '6,5%'],
        ['5-14 anos', '16,2%', '18,0%', '10,8%', '8,0%', '7,0%'],
        ['15-29 anos', '8,5%', '9,9%', '5,8%', '4,2%', '3,8%'],
        ['30-59 anos', '6,5%', '7,1%', '4,2%', '3,0%', '2,6%'],
        ['60+ anos', '1,2%', '1,4%', '0,8%', '0,5%', '0,4%']
      ]
    },
    notas: 'Crianças são proporcionalmente mais afetadas pela pobreza.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-58',
    numero: 58,
    titulo: 'Insegurança Alimentar por Faixa Etária',
    tituloIngles: 'Percentage distribution by household food security situation',
    categoria: 'Pobreza',
    descricao: 'Situação de segurança alimentar domiciliar',
    fonte: 'IBGE/POF-PNAD',
    fonteCompleta: 'IBGE - PNAD Contínua / POF',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7437',
    tabelaSidra: 'Tabela 7437',
    periodoOriginal: '2004-2013',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Situação', '2004', '2013', '2018', '2022', '2023'],
      rows: [
        ['Segurança alimentar', '60,1%', '74,2%', '63,3%', '58,8%', '72,5%'],
        ['Inseg. leve', '18,0%', '17,1%', '24,0%', '28,0%', '18,2%'],
        ['Inseg. moderada', '14,1%', '5,1%', '8,1%', '8,8%', '6,0%'],
        ['Inseg. grave', '7,7%', '3,6%', '4,6%', '4,4%', '3,3%']
      ]
    },
    notas: 'Piora durante pandemia (2020-2022), com recuperação significativa em 2023.',
    tendencia: 'decrescente'
  }
];

// ============================================
// EIXO VII - SEGURANÇA PÚBLICA (Tabelas 59-69)
// ============================================

export const tabelasSeguranca: CommonCoreTable[] = [
  {
    id: 'cc-59',
    numero: 59,
    titulo: 'Taxa de Homicídios por 100 mil habitantes',
    tituloIngles: 'Homicide rate per 100,000 inhabitants',
    categoria: 'Segurança',
    descricao: 'Mortes por agressão (homicídios intencionais)',
    fonte: 'FBSP/SIM',
    fonteCompleta: 'Fórum Brasileiro de Segurança Pública / MS-SIM',
    urlFonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2010', '2015', '2018', '2019', '2022', '2023'],
      rows: [
        ['Total', '27,4', '28,9', '27,8', '21,7', '22,5', '21,2'],
        ['Homens', '51,5', '54,2', '52,3', '40,8', '42,5', '39,8'],
        ['Mulheres', '4,5', '4,5', '4,3', '3,8', '3,9', '3,6'],
        ['Negros', '36,5', '38,0', '37,5', '29,5', '30,2', '28,5'],
        ['Não-negros', '15,3', '14,5', '13,8', '11,2', '11,8', '11,0']
      ]
    },
    notas: 'Negros têm taxa 2,6x maior que não-negros.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-60',
    numero: 60,
    titulo: 'Mortes por Intervenção Policial',
    tituloIngles: 'Deaths from police intervention',
    categoria: 'Segurança',
    descricao: 'Óbitos decorrentes de intervenção de agentes do Estado',
    fonte: 'FBSP',
    fonteCompleta: 'Fórum Brasileiro de Segurança Pública - Anuário',
    urlFonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    periodoOriginal: '2013-2015',
    periodoAtualizado: '2013-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2013', '2015', '2018', '2020', '2022', '2023'],
      rows: [
        ['Total', '2.212', '3.320', '6.160', '6.416', '6.392', '5.628'],
        ['% Negros', '67,8%', '71,5%', '75,4%', '78,9%', '83,1%', '83,6%'],
        ['Taxa/100mil', '1,1', '1,6', '3,0', '3,0', '3,1', '2,7']
      ]
    },
    notas: 'Negros representam 83,6% das vítimas de letalidade policial.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-61',
    numero: 61,
    titulo: 'População Carcerária',
    tituloIngles: 'Prison population',
    categoria: 'Segurança',
    descricao: 'Pessoas privadas de liberdade no sistema penitenciário',
    fonte: 'SENAPPEN',
    fonteCompleta: 'Secretaria Nacional de Políticas Penais',
    urlFonte: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen',
    periodoOriginal: '2000-2016',
    periodoAtualizado: '2000-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2000', '2010', '2016', '2019', '2022', '2023'],
      rows: [
        ['Total', '232.755', '496.251', '726.712', '773.151', '821.475', '838.256'],
        ['% Negros', '46,5%', '54,2%', '64,0%', '66,3%', '67,5%', '68,2%'],
        ['Taxa/100mil', '137', '260', '353', '367', '396', '401'],
        ['Déficit de vagas', '-', '195.856', '358.663', '312.925', '218.350', '205.520']
      ]
    },
    notas: 'Brasil tem 3ª maior população carcerária do mundo. Negros sobre-representados.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-62',
    numero: 62,
    titulo: 'Presos Provisórios',
    tituloIngles: 'Pre-trial detainees',
    categoria: 'Segurança',
    descricao: 'Pessoas encarceradas sem condenação definitiva',
    fonte: 'SENAPPEN',
    fonteCompleta: 'Secretaria Nacional de Políticas Penais',
    urlFonte: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen',
    periodoOriginal: '2000-2016',
    periodoAtualizado: '2000-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2010', '2016', '2019', '2022', '2023'],
      rows: [
        ['Total provisórios', '164.683', '292.450', '246.580', '212.480', '198.650'],
        ['% do total', '33,2%', '40,2%', '31,9%', '25,9%', '23,7%']
      ]
    },
    notas: 'Audiências de custódia contribuíram para redução desde 2016.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-63',
    numero: 63,
    titulo: 'Escolaridade da População Carcerária',
    tituloIngles: 'Education level of prison population',
    categoria: 'Segurança',
    descricao: 'Nível de escolaridade dos presos',
    fonte: 'SENAPPEN',
    fonteCompleta: 'Secretaria Nacional de Políticas Penais',
    urlFonte: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen',
    periodoOriginal: '2016',
    periodoAtualizado: '2016-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Nível', '2016', '2019', '2023'],
      rows: [
        ['Analfabeto', '4,0%', '3,5%', '3,2%'],
        ['Fund. incompleto', '51,3%', '48,5%', '45,8%'],
        ['Fund. completo', '14,9%', '15,2%', '16,5%'],
        ['Médio incompleto', '14,8%', '16,0%', '17,2%'],
        ['Médio completo', '9,5%', '11,5%', '12,8%'],
        ['Superior', '0,8%', '1,2%', '1,5%']
      ]
    },
    notas: 'Maioria tem baixa escolaridade. Melhora leve ao longo do tempo.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-64',
    numero: 64,
    titulo: 'Crimes por Tipo',
    tituloIngles: 'Number of crimes by type',
    categoria: 'Segurança',
    descricao: 'Ocorrências registradas por natureza do crime',
    fonte: 'FBSP/SINESP',
    fonteCompleta: 'Fórum Brasileiro de Segurança Pública / SINESP',
    urlFonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    periodoOriginal: '2015',
    periodoAtualizado: '2015-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Tipo', '2015', '2019', '2022', '2023'],
      rows: [
        ['Homicídio doloso', '58.459', '45.503', '47.508', '44.982'],
        ['Latrocínio', '2.084', '1.422', '1.458', '1.385'],
        ['Estupro', '47.646', '66.123', '74.930', '78.523'],
        ['Roubo', '1.212.082', '967.558', '858.245', '812.450'],
        ['Furto', '1.832.456', '1.642.185', '1.425.680', '1.385.220']
      ]
    },
    notas: 'Estupros em alta; roubos e furtos em queda.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-65',
    numero: 65,
    titulo: 'Violência Doméstica',
    tituloIngles: 'Domestic violence',
    categoria: 'Segurança',
    descricao: 'Registros de violência doméstica contra mulheres',
    fonte: 'FBSP',
    fonteCompleta: 'Fórum Brasileiro de Segurança Pública',
    urlFonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    periodoOriginal: '2015',
    periodoAtualizado: '2015-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '2015', '2019', '2022', '2023'],
      rows: [
        ['Lesão corporal (dom.)', '188.215', '266.310', '245.713', '252.480'],
        ['Ameaça (dom.)', '340.543', '398.254', '388.652', '395.120'],
        ['Feminicídio', '1.017', '1.326', '1.410', '1.463'],
        ['Medidas protetivas', '289.432', '358.612', '412.580', '428.650']
      ]
    },
    notas: 'Feminicídios em alta. Medidas protetivas em expansão.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-66',
    numero: 66,
    titulo: 'Efetivo Policial',
    tituloIngles: 'Police force',
    categoria: 'Segurança',
    descricao: 'Número de policiais civis e militares',
    fonte: 'FBSP',
    fonteCompleta: 'Fórum Brasileiro de Segurança Pública',
    urlFonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    periodoOriginal: '2015',
    periodoAtualizado: '2015-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Corporação', '2015', '2019', '2022', '2023'],
      rows: [
        ['Polícia Militar', '417.832', '413.568', '402.145', '398.520'],
        ['Polícia Civil', '117.645', '115.892', '110.852', '108.650'],
        ['Total estadual', '535.477', '529.460', '512.997', '507.170'],
        ['Pol/100mil hab', '261', '252', '246', '243']
      ]
    },
    notas: 'Redução gradual do efetivo policial.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-67',
    numero: 67,
    titulo: 'Policiais Mortos em Serviço',
    tituloIngles: 'Police officers killed on duty',
    categoria: 'Segurança',
    descricao: 'Óbitos de policiais em serviço e fora de serviço',
    fonte: 'FBSP',
    fonteCompleta: 'Fórum Brasileiro de Segurança Pública',
    urlFonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    periodoOriginal: '2015',
    periodoAtualizado: '2015-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Situação', '2015', '2019', '2022', '2023'],
      rows: [
        ['Em serviço', '103', '97', '75', '68'],
        ['Fora de serviço', '290', '227', '148', '132'],
        ['Total', '393', '324', '223', '200']
      ]
    },
    notas: 'Queda significativa na mortalidade policial.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-68',
    numero: 68,
    titulo: 'Acidentes de Trânsito',
    tituloIngles: 'Traffic accidents',
    categoria: 'Segurança',
    descricao: 'Mortes por acidentes de transporte terrestre',
    fonte: 'MS/SIM',
    fonteCompleta: 'Ministério da Saúde - SIM',
    urlFonte: 'https://datasus.saude.gov.br/mortalidade-desde-1996-pela-cid-10',
    periodoOriginal: '2000-2015',
    periodoAtualizado: '2000-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['Total óbitos', '42.844', '38.651', '31.945', '33.815', '32.450'],
        ['Taxa/100mil', '22,5', '18,9', '15,2', '16,2', '15,5']
      ]
    },
    notas: 'Queda significativa após Lei Seca (2008) e fiscalização.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-69',
    numero: 69,
    titulo: 'Suicídios',
    tituloIngles: 'Suicides',
    categoria: 'Segurança',
    descricao: 'Mortes por lesões autoprovocadas intencionalmente',
    fonte: 'MS/SIM',
    fonteCompleta: 'Ministério da Saúde - SIM',
    urlFonte: 'https://datasus.saude.gov.br/mortalidade-desde-1996-pela-cid-10',
    periodoOriginal: '2004-2014',
    periodoAtualizado: '2004-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2010', '2015', '2019', '2022', '2023'],
      rows: [
        ['Total', '9.448', '11.736', '13.523', '16.218', '16.952'],
        ['Taxa/100mil', '5,0', '5,7', '6,4', '7,8', '8,1'],
        ['Homens', '7.486', '9.296', '10.758', '12.850', '13.420'],
        ['Mulheres', '1.962', '2.440', '2.765', '3.368', '3.532']
      ]
    },
    notas: 'Aumento preocupante, especialmente após pandemia.',
    tendencia: 'crescente'
  }
];

// ============================================
// EIXO VIII - HABITAÇÃO E SANEAMENTO (Tabelas 70-75)
// ============================================

export const tabelasHabitacao: CommonCoreTable[] = [
  {
    id: 'cc-70',
    numero: 70,
    titulo: 'Eleitorado',
    tituloIngles: 'Eligible voting population',
    categoria: 'Sistema Político',
    descricao: 'População apta a votar nas eleições',
    fonte: 'TSE',
    fonteCompleta: 'Tribunal Superior Eleitoral',
    urlFonte: 'https://sig.tse.jus.br/ords/dwapr/r/seai/sig-eleicao/home',
    periodoOriginal: '2010-2016',
    periodoAtualizado: '2010-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', '2010', '2014', '2018', '2022', '2024'],
      rows: [
        ['Pop. Brasil', '190.732.694', '201.032.714', '209.469.333', '215.312.518', '212.583.750'],
        ['Eleitorado', '135.804.433', '142.822.046', '147.306.294', '156.454.011', '155.912.680'],
        ['% da pop.', '71%', '71%', '70%', '73%', '73%']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-71',
    numero: 71,
    titulo: 'Comparecimento nas Eleições',
    tituloIngles: 'Number of voters',
    categoria: 'Sistema Político',
    descricao: 'Eleitores que compareceram às urnas',
    fonte: 'TSE',
    fonteCompleta: 'Tribunal Superior Eleitoral',
    urlFonte: 'https://sig.tse.jus.br/ords/dwapr/r/seai/sig-eleicao/home',
    periodoOriginal: '2010-2014',
    periodoAtualizado: '2010-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Eleição', 'Eleitorado', 'Comparecimento', '% Abstenção'],
      rows: [
        ['2010 (1º turno)', '135.804.433', '111.193.747', '18,1%'],
        ['2014 (1º turno)', '142.822.046', '115.122.883', '19,4%'],
        ['2018 (1º turno)', '147.306.294', '117.364.560', '20,3%'],
        ['2022 (1º turno)', '156.454.011', '124.252.796', '20,6%']
      ]
    },
    notas: 'Leve aumento na abstenção ao longo do tempo.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-72',
    numero: 72,
    titulo: 'Processos Eleitorais no TSE',
    tituloIngles: 'Number of appeals processed in the Superior Electoral Court',
    categoria: 'Sistema Político',
    descricao: 'Recursos e reclamações eleitorais',
    fonte: 'TSE',
    fonteCompleta: 'Tribunal Superior Eleitoral',
    urlFonte: 'https://www.tse.jus.br/',
    periodoOriginal: '2010',
    periodoAtualizado: '2010-2022',
    statusAtualizacao: 'parcial',
    dados: {
      headers: ['Tipo', '2010', '2014', '2018', '2022'],
      rows: [
        ['Propaganda irregular', '2.034', '2.458', '3.125', '4.580'],
        ['Captação ilícita', '917', '1.085', '1.352', '1.680'],
        ['Abuso de poder', '184', '215', '285', '345'],
        ['Compra de votos', '172', '198', '245', '312']
      ]
    },
    tendencia: 'crescente'
  },
  {
    id: 'cc-73',
    numero: 73,
    titulo: 'Partidos Políticos',
    tituloIngles: 'Political parties',
    categoria: 'Sistema Político',
    descricao: 'Partidos registrados no TSE',
    fonte: 'TSE',
    fonteCompleta: 'Tribunal Superior Eleitoral',
    urlFonte: 'https://www.tse.jus.br/partidos/partidos-registrados-no-tse',
    periodoOriginal: '2017',
    periodoAtualizado: '2017-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Ano', 'Partidos registrados'],
      rows: [
        ['2017', '35'],
        ['2019', '33'],
        ['2022', '32'],
        ['2024', '29']
      ]
    },
    notas: 'Cláusula de barreira e fusões reduziram número de partidos.',
    tendencia: 'decrescente'
  },
  {
    id: 'cc-74',
    numero: 74,
    titulo: 'Composição da Câmara dos Deputados',
    tituloIngles: 'Groups of legislators - House of Representatives',
    categoria: 'Sistema Político',
    descricao: 'Bancadas partidárias na Câmara',
    fonte: 'Câmara dos Deputados',
    fonteCompleta: 'Câmara dos Deputados',
    urlFonte: 'https://www.camara.leg.br/deputados/bancada',
    periodoOriginal: '2019',
    periodoAtualizado: '2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Partido', 'Deputados 2019', 'Deputados 2023'],
      rows: [
        ['PL', '38', '99'],
        ['PT', '54', '68'],
        ['UNIÃO', '-', '59'],
        ['PP', '41', '47'],
        ['MDB', '34', '44'],
        ['PSD', '36', '42'],
        ['Republicanos', '31', '41'],
        ['PSDB', '30', '13'],
        ['Outros', '249', '100']
      ]
    },
    notas: 'UNIÃO BRASIL formado em 2022 (fusão DEM + PSL).',
    tendencia: 'estavel'
  },
  {
    id: 'cc-75',
    numero: 75,
    titulo: 'Composição do Senado Federal',
    tituloIngles: 'Groups of legislators - Federal Senate',
    categoria: 'Sistema Político',
    descricao: 'Bancadas partidárias no Senado',
    fonte: 'Senado Federal',
    fonteCompleta: 'Senado Federal',
    urlFonte: 'https://www25.senado.leg.br/web/senadores/em-exercicio/-/e/por-partido',
    periodoOriginal: '2019',
    periodoAtualizado: '2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Partido', 'Senadores 2019', 'Senadores 2023'],
      rows: [
        ['PL', '4', '14'],
        ['MDB', '13', '10'],
        ['UNIÃO', '-', '10'],
        ['PSD', '9', '9'],
        ['PT', '6', '9'],
        ['PSDB', '8', '4'],
        ['Outros', '41', '25']
      ]
    },
    tendencia: 'estavel'
  }
];

// ============================================
// EIXO IX - SISTEMA POLÍTICO (Tabelas 76-77)
// ============================================

// ============================================
// EIXO X - HABITAÇÃO E MORADIA (Tabelas 78-84)
// Art. V(e)(iii) ICERD - Direito à Habitação
// ============================================

export const tabelasMoradia: CommonCoreTable[] = [
  {
    id: 'cc-78',
    numero: 78,
    titulo: 'Déficit Habitacional por Cor/Raça',
    tituloIngles: 'Housing deficit by race/color',
    categoria: 'Habitação',
    descricao: 'Déficit habitacional estimado por cor/raça do responsável pelo domicílio. Dados da Fundação João Pinheiro com base no Censo 2022.',
    fonte: 'FJP/IBGE',
    fonteCompleta: 'Fundação João Pinheiro — Déficit Habitacional no Brasil (Censo 2022)',
    urlFonte: 'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/',
    periodoOriginal: '2019',
    periodoAtualizado: '2019-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Cor/Raça', 'Déficit 2019 (mil)', '% do déficit', 'Déficit 2022 (mil)', '% do déficit'],
      rows: [
        ['Negros (Pretos+Pardos)', '3.650', '58,2%', '3.870', '59,8%'],
        ['Brancos', '2.350', '37,5%', '2.280', '35,2%'],
        ['Indígenas', '85', '1,4%', '92', '1,4%'],
        ['Outros/NI', '185', '2,9%', '230', '3,6%'],
        ['Total Brasil', '6.270', '100%', '6.472', '100%']
      ]
    },
    notas: '⚠️ Nível B — Cruzamento indireto 🔀: FJP (Déficit Habitacional) + IBGE Censo 2022 (Tabela 9879). Negros representam 55,5% da população mas 59,8% do déficit habitacional. Requer validação humana.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-79',
    numero: 79,
    titulo: 'Inadequação Habitacional por Cor/Raça',
    tituloIngles: 'Housing inadequacy by race/color',
    categoria: 'Habitação',
    descricao: 'Domicílios com inadequação (sem banheiro exclusivo, adensamento excessivo, cobertura precária) por cor/raça.',
    fonte: 'IBGE/Censo',
    fonteCompleta: 'IBGE — Censo Demográfico 2022 / SIDRA Tabela 9878',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/9878',
    tabelaSidra: 'Tabela 9878',
    periodoOriginal: '2010',
    periodoAtualizado: '2010-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', 'Negros (%)', 'Brancos (%)', 'Razão N/B'],
      rows: [
        ['Sem banheiro exclusivo', '6,8%', '2,1%', '3,2x'],
        ['Adensamento excessivo', '8,5%', '4,2%', '2,0x'],
        ['Material precário (paredes)', '4,2%', '1,3%', '3,2x'],
        ['Cobertura inadequada', '3,8%', '1,5%', '2,5x'],
        ['Ônus excessivo com aluguel (>30% renda)', '12,4%', '7,8%', '1,6x']
      ]
    },
    notas: 'Censo 2022. Todas as formas de inadequação habitacional são significativamente maiores para a população negra.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-80',
    numero: 80,
    titulo: 'Domicílios em Aglomerados Subnormais por Cor/Raça',
    tituloIngles: 'Households in subnormal agglomerates (favelas) by race/color',
    categoria: 'Habitação',
    descricao: 'Pessoas residentes em favelas e comunidades urbanas por cor/raça do responsável.',
    fonte: 'IBGE/Censo',
    fonteCompleta: 'IBGE — Censo Demográfico 2022 / SIDRA Tabela 9587',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/9587',
    tabelaSidra: 'Tabela 9587',
    periodoOriginal: '2010',
    periodoAtualizado: '2010-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '2010', '2022'],
      rows: [
        ['Total em aglom. subnormais', '11.425.644', '16.390.000'],
        ['Negros (Pretos+Pardos)', '7.398.000 (64,7%)', '11.310.000 (69,0%)'],
        ['Brancos', '3.542.000 (31,0%)', '4.425.000 (27,0%)'],
        ['% negros na pop. geral', '50,7%', '55,5%'],
        ['Sobre-representação negra', '+14,0 p.p.', '+13,5 p.p.']
      ]
    },
    notas: 'Negros são sobre-representados em favelas: 69% dos moradores vs 55,5% da população geral.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-81',
    numero: 81,
    titulo: 'Perfil Racial dos Beneficiários MCMV (CadÚnico)',
    tituloIngles: 'Racial profile of MCMV housing program beneficiaries (CadÚnico)',
    categoria: 'Habitação',
    descricao: 'Composição racial das famílias beneficiárias do Minha Casa Minha Vida por faixa do programa, com base no CadÚnico/MDS.',
    fonte: 'MDS/CadÚnico',
    fonteCompleta: 'Ministério do Desenvolvimento Social — CadÚnico / VIS Data',
    urlFonte: 'https://aplicacoes.mds.gov.br/sagi/vis/data3/',
    periodoOriginal: '2023',
    periodoAtualizado: '2023-2024',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Faixa MCMV', '% Negros', '% Brancos', '% Outros', 'Total famílias (mil)'],
      rows: [
        ['Faixa 1 (até R$ 2.640)', '72,4%', '24,8%', '2,8%', '4.250'],
        ['Faixa 2 (R$ 2.640-4.400)', '58,3%', '38,2%', '3,5%', '1.850'],
        ['Faixa 3 (R$ 4.400-8.000)', '42,1%', '54,6%', '3,3%', '920'],
        ['Total MCMV', '64,8%', '32,0%', '3,2%', '7.020']
      ]
    },
    notas: '⚠️ Nível B — Cruzamento indireto 🔀: CadÚnico + SISHAB/MCidades. Na Faixa 1 (maior subsídio), 72,4% dos beneficiários são negros. Requer validação humana.',
    tendencia: 'estavel'
  },
  {
    id: 'cc-82',
    numero: 82,
    titulo: 'Titularidade Feminina Negra no MCMV',
    tituloIngles: 'Black women as titleholders in MCMV housing program',
    categoria: 'Habitação',
    descricao: 'Percentual de unidades habitacionais tituladas em nome de mulheres negras, conforme Lei 11.977/2009 §3º.',
    fonte: 'MCidades/MDS',
    fonteCompleta: 'Ministério das Cidades / MDS — SISHAB + CadÚnico',
    urlFonte: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida',
    periodoOriginal: '2020',
    periodoAtualizado: '2020-2024',
    statusAtualizacao: 'parcial',
    dados: {
      headers: ['Indicador', '2020', '2022', '2024'],
      rows: [
        ['% titularidade feminina (total)', '82,5%', '84,2%', '85,1%'],
        ['% titularidade mulher negra', '56,8%', '58,5%', '60,2%'],
        ['% titularidade mulher branca', '23,2%', '23,5%', '22,8%'],
        ['UH entregues (Faixa 1, mil)', '285', '142', '380']
      ]
    },
    notas: '⚠️ Nível B — Cruzamento indireto 🔀: SISHAB + CadÚnico. Lei 11.977/2009 §3º prioriza titularidade feminina. Mulheres negras representam 60,2% das titulares. Requer validação humana.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-83',
    numero: 83,
    titulo: 'Acesso a Água Potável por Cor/Raça',
    tituloIngles: 'Access to potable water by race/color',
    categoria: 'Habitação',
    descricao: 'Proporção de domicílios com acesso a água tratada (rede geral) por cor/raça do responsável.',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE — PNAD Contínua / SIDRA Tabela 7110',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7110',
    tabelaSidra: 'Tabela 7110',
    periodoOriginal: '2016',
    periodoAtualizado: '2016-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Cor/Raça', '2016', '2019', '2022', '2023'],
      rows: [
        ['Brancos', '89,2%', '90,1%', '91,5%', '91,8%'],
        ['Negros (Pretos+Pardos)', '78,5%', '80,2%', '82,8%', '83,5%'],
        ['Diferença (p.p.)', '10,7', '9,9', '8,7', '8,3'],
        ['Indígenas', '42,5%', '45,8%', '48,2%', '49,5%']
      ]
    },
    notas: 'Disparidade em queda mas ainda significativa: 8,3 p.p. entre brancos e negros. Indígenas com acesso muito inferior.',
    tendencia: 'crescente'
  },
  {
    id: 'cc-84',
    numero: 84,
    titulo: 'Esgotamento Sanitário por Cor/Raça',
    tituloIngles: 'Sanitation coverage by race/color',
    categoria: 'Habitação',
    descricao: 'Proporção de domicílios com esgotamento sanitário adequado (rede geral ou fossa séptica) por cor/raça.',
    fonte: 'IBGE/PNAD',
    fonteCompleta: 'IBGE — PNAD Contínua / SIDRA Tabela 7110',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7110',
    tabelaSidra: 'Tabela 7110',
    periodoOriginal: '2016',
    periodoAtualizado: '2016-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Cor/Raça', '2016', '2019', '2022', '2023'],
      rows: [
        ['Brancos', '78,5%', '80,2%', '82,5%', '83,2%'],
        ['Negros (Pretos+Pardos)', '58,2%', '61,5%', '65,8%', '67,2%'],
        ['Diferença (p.p.)', '20,3', '18,7', '16,7', '16,0'],
        ['Indígenas', '28,5%', '32,1%', '35,8%', '37,2%']
      ]
    },
    notas: 'Disparidade de 16 p.p. entre brancos e negros. Indígenas com 37,2% de cobertura adequada. Marco do Saneamento (Lei 14.026/2020).',
    tendencia: 'crescente'
  }
];

export const tabelasSistemaPolitico: CommonCoreTable[] = [
  {
    id: 'cc-76',
    numero: 76,
    titulo: 'Mulheres no Legislativo',
    tituloIngles: 'Distribution of women elected for Federal Senate and Chamber',
    categoria: 'Sistema Político',
    descricao: 'Participação feminina no Congresso Nacional',
    fonte: 'TSE/Câmara',
    fonteCompleta: 'TSE e Câmara dos Deputados',
    urlFonte: 'https://www.camara.leg.br/deputados/bancada',
    periodoOriginal: '2002-2014',
    periodoAtualizado: '2002-2022',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Casa', '2002', '2006', '2010', '2014', '2018', '2022'],
      rows: [
        ['Câmara (%)', '8,2%', '8,8%', '8,8%', '9,9%', '15,0%', '17,7%'],
        ['Câmara (n)', '42', '45', '45', '51', '77', '91'],
        ['Senado (%)', '14,8%', '14,8%', '14,8%', '16,0%', '14,8%', '17,3%'],
        ['Senado (n)', '12', '12', '12', '13', '12', '14']
      ]
    },
    notas: 'Aumento após Lei de Cotas (30% de candidaturas femininas).',
    tendencia: 'crescente'
  },
  {
    id: 'cc-77',
    numero: 77,
    titulo: 'Participação Social (Conselhos e Conferências)',
    tituloIngles: 'Social participation - councils and conferences',
    categoria: 'Sistema Político',
    descricao: 'Instrumentos de participação social',
    fonte: 'IBGE/MUNIC/Governo',
    fonteCompleta: 'IBGE - MUNIC e Secretaria de Governo',
    urlFonte: 'https://www.ibge.gov.br/estatisticas/sociais/saude/10586-pesquisa-de-informacoes-basicas-municipais.html',
    periodoOriginal: '2013',
    periodoAtualizado: '2013-2023',
    statusAtualizacao: 'atualizado',
    dados: {
      headers: ['Indicador', '2013', '2018', '2023'],
      rows: [
        ['Conferências nacionais (acumulado)', '97', '115', '125'],
        ['Conselhos nacionais ativos', '35', '38', '42'],
        ['Municípios com conselho de saúde', '99,5%', '99,8%', '99,9%'],
        ['Municípios com conselho de educação', '84,5%', '88,2%', '90,5%'],
        ['Municípios com conselho de assistência', '99,2%', '99,5%', '99,7%'],
        ['Municípios com conselho de direitos da criança', '98,5%', '98,8%', '99,0%']
      ]
    },
    notas: 'Quase todos os municípios possuem conselhos de políticas públicas.',
    tendencia: 'crescente'
  }
];

// Função para renderizar status
const StatusIcon = ({ status }: { status: UpdateStatus }) => {
  switch (status) {
    case 'atualizado':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'parcial':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'desatualizado':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
  }
};

const statusLabels = {
  atualizado: { label: 'Atualizado', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  parcial: { label: 'Parcial', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  desatualizado: { label: 'Desatualizado', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
};

const TrendIcon = ({ trend }: { trend?: 'crescente' | 'decrescente' | 'estavel' }) => {
  switch (trend) {
    case 'crescente':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'decrescente':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-gray-500" />;
  }
};

// Componente de Tabela Individual
const CommonCoreTableCard = ({ table }: { table: CommonCoreTable }) => {
  return (
    <AccordionItem value={table.id}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3 flex-1 text-left">
          <Badge variant="outline" className="font-mono text-xs shrink-0">
            T{table.numero.toString().padStart(2, '0')}
          </Badge>
          <span className="font-medium text-sm flex-1">{table.titulo}</span>
          <div className="flex items-center gap-2">
            <TrendIcon trend={table.tendencia} />
            <Badge className={cn('text-xs gap-1', statusLabels[table.statusAtualizacao].className)}>
              <StatusIcon status={table.statusAtualizacao} />
              {statusLabels[table.statusAtualizacao].label}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2">
          {/* Metadados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Título (EN):</strong> {table.tituloIngles}
              </p>
              <p className="text-muted-foreground mt-1">
                <strong className="text-foreground">Descrição:</strong> {table.descricao}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Período original:</strong> {table.periodoOriginal}
              </p>
              <p className="text-muted-foreground mt-1">
                <strong className="text-foreground">Período atualizado:</strong> {table.periodoAtualizado}
              </p>
            </div>
          </div>

          {/* Fonte */}
          <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-lg">
            <Info className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <span className="font-medium">Fonte:</span> {table.fonteCompleta}
              {table.tabelaSidra && <span className="text-muted-foreground ml-2">({table.tabelaSidra})</span>}
            </div>
            {table.urlFonte && (
              <Button variant="ghost" size="sm" asChild className="shrink-0">
                <a href={table.urlFonte} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Ver Fonte
                </a>
              </Button>
            )}
          </div>

          {/* Tabela de Dados */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {table.dados.headers.map((header, i) => (
                    <TableHead key={i} className="font-semibold text-xs">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.dados.rows.map((row, i) => (
                  <TableRow key={i}>
                    {row.map((cell, j) => (
                      <TableCell key={j} className="text-sm">
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Notas */}
          {table.notas && (
            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <strong>Nota:</strong> {table.notas}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// Componente de Eixo Temático
const EixoSection = ({ title, tables, icon }: { title: string; tables: CommonCoreTable[]; icon: React.ReactNode }) => {
  const totalTables = tables.length;
  const atualizadas = tables.filter(t => t.statusAtualizacao === 'atualizado').length;
  const progresso = Math.round((atualizadas / totalTables) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>
                {totalTables} tabelas | {atualizadas} atualizadas
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{progresso}%</span>
            <Progress value={progresso} className="w-24 h-2 mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {tables.map(table => (
            <CommonCoreTableCard key={table.id} table={table} />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

// Componente Principal
export const CommonCoreTab = () => {
  const allTables = [
    ...tabelasDemograficas,
    ...tabelasEconomicas,
    ...tabelasEducacao,
    ...tabelasSaude,
    ...tabelasTrabalho,
    ...tabelasPobreza,
    ...tabelasSeguranca,
    ...tabelasHabitacao,
    ...tabelasSistemaPolitico,
    ...tabelasMoradia
  ];

  const totalTables = allTables.length;
  const atualizadas = allTables.filter(t => t.statusAtualizacao === 'atualizado').length;
  const parciais = allTables.filter(t => t.statusAtualizacao === 'parcial').length;
  const progressoGeral = Math.round((atualizadas / totalTables) * 100);

  return (
    <div className="space-y-6">
      {/* Header com estatísticas gerais */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">HRI/CORE/BRA - Documento Base Comum</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Atualização do período 2018-2025 | {totalTables} tabelas estatísticas oficiais
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-primary text-primary-foreground">Common Core 2020</Badge>
                <Badge variant="outline">ONU/OHCHR</Badge>
                <Badge variant="outline">Brasil</Badge>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{totalTables}</p>
                <p className="text-xs text-muted-foreground">Tabelas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{atualizadas}</p>
                <p className="text-xs text-muted-foreground">Atualizadas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{parciais}</p>
                <p className="text-xs text-muted-foreground">Parciais</p>
              </div>
              <div className="text-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
                    <circle 
                      cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" 
                      strokeDasharray={`${progressoGeral * 1.76} 176`}
                      className="text-primary"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {progressoGeral}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por Eixo Temático */}
      <Tabs defaultValue="demografia" className="w-full">
        <TabsList className="flex-wrap h-auto gap-1 justify-start mb-4">
          <TabsTrigger value="demografia">I. Demografia (10)</TabsTrigger>
          <TabsTrigger value="economia">II. Economia (7)</TabsTrigger>
          <TabsTrigger value="educacao">III. Educação (12)</TabsTrigger>
          <TabsTrigger value="saude">IV. Saúde (13)</TabsTrigger>
          <TabsTrigger value="trabalho">V. Trabalho (8)</TabsTrigger>
          <TabsTrigger value="pobreza">VI. Pobreza (8)</TabsTrigger>
          <TabsTrigger value="seguranca">VII. Segurança (11)</TabsTrigger>
          <TabsTrigger value="politico">VIII-IX. Sistema Político (8)</TabsTrigger>
          <TabsTrigger value="moradia">X. Habitação e Moradia (7)</TabsTrigger>
        </TabsList>

        <TabsContent value="demografia">
          <EixoSection 
            title="Eixo I - Características Demográficas" 
            tables={tabelasDemograficas}
            icon={<div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600">I</div>}
          />
        </TabsContent>

        <TabsContent value="moradia">
          <EixoSection 
            title="Eixo X - Habitação, Moradia e Saneamento — Art. V(e)(iii) ICERD" 
            tables={tabelasMoradia}
            icon={<div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600">X</div>}
          />
        </TabsContent>

        <TabsContent value="economia">
          <EixoSection 
            title="Eixo II - Características Econômicas" 
            tables={tabelasEconomicas}
            icon={<div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600">II</div>}
          />
        </TabsContent>

        <TabsContent value="educacao">
          <EixoSection 
            title="Eixo III - Educação" 
            tables={tabelasEducacao}
            icon={<div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600">III</div>}
          />
        </TabsContent>

        <TabsContent value="saude">
          <EixoSection 
            title="Eixo IV - Saúde" 
            tables={tabelasSaude}
            icon={<div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600">IV</div>}
          />
        </TabsContent>

        <TabsContent value="trabalho">
          <EixoSection 
            title="Eixo V - Trabalho e Previdência" 
            tables={tabelasTrabalho}
            icon={<div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600">V</div>}
          />
        </TabsContent>

        <TabsContent value="pobreza">
          <EixoSection 
            title="Eixo VI - Pobreza e Desigualdade" 
            tables={tabelasPobreza}
            icon={<div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600">VI</div>}
          />
        </TabsContent>

        <TabsContent value="seguranca">
          <EixoSection 
            title="Eixo VII - Segurança Pública" 
            tables={tabelasSeguranca}
            icon={<div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900 flex items-center justify-center text-rose-600">VII</div>}
          />
        </TabsContent>

        <TabsContent value="politico">
          <div className="space-y-6">
            <EixoSection 
              title="Eixo VIII - Sistema Eleitoral e Representação" 
              tables={tabelasHabitacao}
              icon={<div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600">VIII</div>}
            />
            <EixoSection 
              title="Eixo IX - Participação Social" 
              tables={tabelasSistemaPolitico}
              icon={<div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-600">IX</div>}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Nota metodológica */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Nota Metodológica</p>
              <p>
                As 77 tabelas seguem a estrutura do documento HRI/CORE/BRA/2020, atualizadas com dados oficiais 
                do IBGE/SIDRA, Ministério da Saúde (DataSUS), MEC/INEP, MDS/SUAS, FBSP, TSE e outras fontes 
                governamentais. Os dados mais recentes disponíveis são de 2023/2024, conforme periodicidade de cada pesquisa.
                Valores marcados como 'N/D' indicam dados pendentes de publicação oficial ou verificação humana. Tabelas com cruzamento indireto (🔀) são classificadas como Nível B e requerem validação.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
