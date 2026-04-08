import React, { useState, useMemo } from 'react';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ExternalLink, TrendingUp, TrendingDown, Minus, AlertCircle, 
  CheckCircle2, Clock, Info, Search, Filter, Download, 
  BarChart3, Users, GraduationCap, Heart, Briefcase, 
  Home, Shield, Vote, FileText, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// TIPOS E INTERFACES
// ============================================

type UpdateStatus = 'atualizado' | 'parcial' | 'desatualizado';

interface CommonCoreTable {
  id: string;
  numero: number;
  titulo: string;
  tituloIngles: string;
  categoria: string;
  fonte: string;
  tabelaSidra?: string;
  urlFonte?: string;
  periodoOriginal: string;
  periodoAtualizado: string;
  statusAtualizacao: UpdateStatus;
  tendencia?: 'crescente' | 'decrescente' | 'estavel';
  dadosColetados: boolean;
  ultimaAtualizacao?: string;
}

// ============================================
// DADOS DAS 77 TABELAS DO COMMON CORE
// ============================================

const commonCoreTables: CommonCoreTable[] = [
  // EIXO I - DEMOGRAFIA (1-10)
  { id: 'cc-1', numero: 1, titulo: 'População Total e Taxa de Crescimento', tituloIngles: 'Total population and average annual growth rate', categoria: 'Demografia', fonte: 'IBGE/SIDRA', tabelaSidra: 'Tabela 9514', urlFonte: 'https://sidra.ibge.gov.br/Tabela/9514', periodoOriginal: '1980-2010', periodoAtualizado: '1980-2022', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-2', numero: 2, titulo: 'Taxa Bruta de Natalidade', tituloIngles: 'Gross birth rate', categoria: 'Demografia', fonte: 'IBGE/MS', tabelaSidra: 'Tabela 7358', urlFonte: 'https://sidra.ibge.gov.br/tabela/7358', periodoOriginal: '2000-2015', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-3', numero: 3, titulo: 'Taxa Bruta de Mortalidade', tituloIngles: 'Gross mortality rate', categoria: 'Demografia', fonte: 'IBGE/SIM', tabelaSidra: 'Tabela 7358', urlFonte: 'https://sidra.ibge.gov.br/tabela/7358', periodoOriginal: '2000-2015', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-4', numero: 4, titulo: 'Composição Urbana e Rural', tituloIngles: 'Urban and Rural composition', categoria: 'Demografia', fonte: 'IBGE/SIDRA', tabelaSidra: 'Tabela 9514', urlFonte: 'https://sidra.ibge.gov.br/Tabela/9514', periodoOriginal: '1980-2010', periodoAtualizado: '1980-2022', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-5', numero: 5, titulo: 'Densidade Demográfica', tituloIngles: 'Demographic Density', categoria: 'Demografia', fonte: 'IBGE/SIDRA', tabelaSidra: 'Tabela 9514', urlFonte: 'https://sidra.ibge.gov.br/Tabela/9514', periodoOriginal: '1960-2010', periodoAtualizado: '1960-2022', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-6', numero: 6, titulo: 'Composição por Sexo', tituloIngles: 'Population by sex', categoria: 'Demografia', fonte: 'IBGE/SIDRA', tabelaSidra: 'Tabela 9605', urlFonte: 'https://sidra.ibge.gov.br/Tabela/9605', periodoOriginal: '1991-2010', periodoAtualizado: '1991-2022', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-7', numero: 7, titulo: 'Estrutura Etária por Sexo', tituloIngles: 'Age structure by sex', categoria: 'Demografia', fonte: 'IBGE/SIDRA', tabelaSidra: 'Tabela 9605', urlFonte: 'https://sidra.ibge.gov.br/Tabela/9605', periodoOriginal: '1991-2010', periodoAtualizado: '1991-2022', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-8', numero: 8, titulo: 'Razão de Dependência e Envelhecimento', tituloIngles: 'Dependency ratio and aging', categoria: 'Demografia', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7109', urlFonte: 'https://sidra.ibge.gov.br/tabela/7109', periodoOriginal: '2015', periodoAtualizado: '2015-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-9', numero: 9, titulo: 'População por Raça/Cor', tituloIngles: 'Population by color or race', categoria: 'Demografia', fonte: 'IBGE/SIDRA', tabelaSidra: 'Tabela 9605', urlFonte: 'https://sidra.ibge.gov.br/Tabela/9605', periodoOriginal: '1991-2010', periodoAtualizado: '1991-2022', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-10', numero: 10, titulo: 'Arranjos Familiares', tituloIngles: 'Family arrangements', categoria: 'Demografia', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7106', urlFonte: 'https://sidra.ibge.gov.br/tabela/7106', periodoOriginal: '2004-2014', periodoAtualizado: '2004-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  
  // EIXO II - ECONOMIA (11-17)
  { id: 'cc-11', numero: 11, titulo: 'Indicadores Macroeconômicos', tituloIngles: 'Macroeconomic Indicators', categoria: 'Economia', fonte: 'IBGE/BCB', tabelaSidra: 'Tabela 6612', urlFonte: 'https://sidra.ibge.gov.br/tabela/6612', periodoOriginal: '2000-2015', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-12', numero: 12, titulo: 'Índice de Inflação IPCA', tituloIngles: 'IPCA Index', categoria: 'Economia', fonte: 'IBGE/SNIPC', tabelaSidra: 'Tabela 1419', urlFonte: 'https://sidra.ibge.gov.br/tabela/1419', periodoOriginal: '2005-2016', periodoAtualizado: '2005-2024', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-13', numero: 13, titulo: 'IPCA por Grupo de Produtos', tituloIngles: 'IPCA by product groups', categoria: 'Economia', fonte: 'IBGE/SNIPC', tabelaSidra: 'Tabela 7060', urlFonte: 'https://sidra.ibge.gov.br/tabela/7060', periodoOriginal: '2016', periodoAtualizado: '2023', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-14', numero: 14, titulo: 'Dívida Externa e Dívida Pública', tituloIngles: 'External and public debt', categoria: 'Economia', fonte: 'BCB', urlFonte: 'https://www.bcb.gov.br/estatisticas/tabelasespeciais', periodoOriginal: '2000-2015', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-15', numero: 15, titulo: 'Gasto Social Federal', tituloIngles: 'Federal Social Spending', categoria: 'Economia', fonte: 'ME/IBGE', urlFonte: 'https://www.gov.br/fazenda/pt-br/assuntos/orcamento-federal', periodoOriginal: '2002-2015', periodoAtualizado: '2002-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-16', numero: 16, titulo: 'GSF por Área de Atuação', tituloIngles: 'GSF by field', categoria: 'Economia', fonte: 'ME/IBGE', urlFonte: 'https://www.gov.br/fazenda/pt-br/assuntos/orcamento-federal', periodoOriginal: '2002-2015', periodoAtualizado: '2002-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-17', numero: 17, titulo: 'Composição do GSF por Tipo', tituloIngles: 'GSF composition by type', categoria: 'Economia', fonte: 'ME/IBGE', urlFonte: 'https://www.gov.br/fazenda/pt-br/assuntos/orcamento-federal', periodoOriginal: '2002-2015', periodoAtualizado: '2002-2024', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  
  // EIXO III - EDUCAÇÃO (18-30)
  { id: 'cc-18', numero: 18, titulo: 'Taxa de Alfabetização', tituloIngles: 'Literacy rate', categoria: 'Educação', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7113', urlFonte: 'https://sidra.ibge.gov.br/tabela/7113', periodoOriginal: '2000-2015', periodoAtualizado: '2000-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-19', numero: 19, titulo: 'Alfabetização por Raça/Cor', tituloIngles: 'Literacy by race/color', categoria: 'Educação', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7113', urlFonte: 'https://sidra.ibge.gov.br/tabela/7113', periodoOriginal: '2007-2015', periodoAtualizado: '2007-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-20', numero: 20, titulo: 'Anos Médios de Estudo', tituloIngles: 'Average years of schooling', categoria: 'Educação', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7128', urlFonte: 'https://sidra.ibge.gov.br/tabela/7128', periodoOriginal: '2001-2015', periodoAtualizado: '2001-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-21', numero: 21, titulo: 'Escolaridade por Raça/Cor', tituloIngles: 'Schooling by race/color', categoria: 'Educação', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7128', urlFonte: 'https://sidra.ibge.gov.br/tabela/7128', periodoOriginal: '2007-2015', periodoAtualizado: '2007-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-22', numero: 22, titulo: 'Taxa de Frequência Escolar', tituloIngles: 'School attendance rate', categoria: 'Educação', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7131', urlFonte: 'https://sidra.ibge.gov.br/tabela/7131', periodoOriginal: '2001-2015', periodoAtualizado: '2001-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-23', numero: 23, titulo: 'Frequência Escolar por Raça/Cor', tituloIngles: 'School attendance by race/color', categoria: 'Educação', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7131', urlFonte: 'https://sidra.ibge.gov.br/tabela/7131', periodoOriginal: '2007-2015', periodoAtualizado: '2007-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-24', numero: 24, titulo: 'Matrículas no Ensino Fundamental', tituloIngles: 'Elementary school enrollment', categoria: 'Educação', fonte: 'INEP', urlFonte: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/sinopses-estatisticas', periodoOriginal: '2000-2015', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-25', numero: 25, titulo: 'Matrículas no Ensino Médio', tituloIngles: 'High school enrollment', categoria: 'Educação', fonte: 'INEP', urlFonte: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/sinopses-estatisticas', periodoOriginal: '2000-2015', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-26', numero: 26, titulo: 'Matrículas no Ensino Superior', tituloIngles: 'Higher education enrollment', categoria: 'Educação', fonte: 'INEP', urlFonte: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/sinopses-estatisticas', periodoOriginal: '2000-2015', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-27', numero: 27, titulo: 'Taxa de Abandono Escolar', tituloIngles: 'School dropout rate', categoria: 'Educação', fonte: 'INEP', urlFonte: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais', periodoOriginal: '2007-2015', periodoAtualizado: '2007-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-28', numero: 28, titulo: 'IDEB - Ensino Fundamental', tituloIngles: 'IDEB - Elementary School', categoria: 'Educação', fonte: 'INEP', urlFonte: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb', periodoOriginal: '2005-2019', periodoAtualizado: '2005-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-29', numero: 29, titulo: 'IDEB - Ensino Médio', tituloIngles: 'IDEB - High School', categoria: 'Educação', fonte: 'INEP', urlFonte: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb', periodoOriginal: '2005-2019', periodoAtualizado: '2005-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-30', numero: 30, titulo: 'Professores por Nível de Ensino', tituloIngles: 'Teachers by level', categoria: 'Educação', fonte: 'INEP', urlFonte: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/sinopses-estatisticas', periodoOriginal: '2007-2019', periodoAtualizado: '2007-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  
  // EIXO IV - SAÚDE (31-45)
  { id: 'cc-31', numero: 31, titulo: 'Esperança de Vida ao Nascer', tituloIngles: 'Life expectancy at birth', categoria: 'Saúde', fonte: 'IBGE', tabelaSidra: 'Tabela 7362', urlFonte: 'https://sidra.ibge.gov.br/tabela/7362', periodoOriginal: '2000-2018', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-32', numero: 32, titulo: 'Esperança de Vida por Sexo', tituloIngles: 'Life expectancy by sex', categoria: 'Saúde', fonte: 'IBGE', tabelaSidra: 'Tabela 7362', urlFonte: 'https://sidra.ibge.gov.br/tabela/7362', periodoOriginal: '2000-2018', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-33', numero: 33, titulo: 'Taxa de Fecundidade', tituloIngles: 'Fertility rate', categoria: 'Saúde', fonte: 'IBGE', tabelaSidra: 'Tabela 7358', urlFonte: 'https://sidra.ibge.gov.br/tabela/7358', periodoOriginal: '2000-2018', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-34', numero: 34, titulo: 'Taxa de Mortalidade Infantil', tituloIngles: 'Infant mortality rate', categoria: 'Saúde', fonte: 'DataSUS', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2000-2017', periodoAtualizado: '2000-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-35', numero: 35, titulo: 'Mortalidade Infantil por Raça/Cor', tituloIngles: 'Infant mortality by race', categoria: 'Saúde', fonte: 'DataSUS', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2010-2017', periodoAtualizado: '2010-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-36', numero: 36, titulo: 'Mortalidade Materna', tituloIngles: 'Maternal mortality', categoria: 'Saúde', fonte: 'DataSUS', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2000-2017', periodoAtualizado: '2000-2023', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-37', numero: 37, titulo: 'Principais Causas de Morte', tituloIngles: 'Main causes of death', categoria: 'Saúde', fonte: 'DataSUS/SIM', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2016', periodoAtualizado: '2016-2023', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-38', numero: 38, titulo: 'HIV/AIDS - Incidência', tituloIngles: 'HIV/AIDS incidence', categoria: 'Saúde', fonte: 'DataSUS', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2007-2017', periodoAtualizado: '2007-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-39', numero: 39, titulo: 'Tuberculose - Incidência', tituloIngles: 'Tuberculosis incidence', categoria: 'Saúde', fonte: 'DataSUS', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2001-2017', periodoAtualizado: '2001-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-40', numero: 40, titulo: 'Malária - Incidência', tituloIngles: 'Malaria incidence', categoria: 'Saúde', fonte: 'DataSUS', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2000-2017', periodoAtualizado: '2000-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-41', numero: 41, titulo: 'Cobertura Vacinal', tituloIngles: 'Vaccination coverage', categoria: 'Saúde', fonte: 'DataSUS/PNI', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2000-2017', periodoAtualizado: '2000-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-42', numero: 42, titulo: 'Acesso a Serviços de Saúde', tituloIngles: 'Access to health services', categoria: 'Saúde', fonte: 'IBGE/PNS', urlFonte: 'https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html', periodoOriginal: '2013-2019', periodoAtualizado: '2013-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-43', numero: 43, titulo: 'Atenção Primária (ESF)', tituloIngles: 'Primary care coverage', categoria: 'Saúde', fonte: 'DataSUS/SISAB', urlFonte: 'https://sisab.saude.gov.br/', periodoOriginal: '2007-2019', periodoAtualizado: '2007-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-44', numero: 44, titulo: 'Leitos Hospitalares', tituloIngles: 'Hospital beds', categoria: 'Saúde', fonte: 'DataSUS/CNES', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2005-2019', periodoAtualizado: '2005-2024', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-45', numero: 45, titulo: 'Profissionais de Saúde', tituloIngles: 'Health professionals', categoria: 'Saúde', fonte: 'DataSUS/CNES', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2005-2019', periodoAtualizado: '2005-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  
  // EIXO V - TRABALHO (46-55)
  { id: 'cc-46', numero: 46, titulo: 'Taxa de Desocupação', tituloIngles: 'Unemployment rate', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 6402', urlFonte: 'https://sidra.ibge.gov.br/tabela/6402', periodoOriginal: '2012-2019', periodoAtualizado: '2012-2024', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-47', numero: 47, titulo: 'Desocupação por Raça/Cor', tituloIngles: 'Unemployment by race', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 6403', urlFonte: 'https://sidra.ibge.gov.br/tabela/6403', periodoOriginal: '2012-2019', periodoAtualizado: '2012-2024', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-48', numero: 48, titulo: 'Informalidade', tituloIngles: 'Informal employment', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 6387', urlFonte: 'https://sidra.ibge.gov.br/tabela/6387', periodoOriginal: '2012-2019', periodoAtualizado: '2012-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-49', numero: 49, titulo: 'Trabalho Infantil', tituloIngles: 'Child labor', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7127', urlFonte: 'https://sidra.ibge.gov.br/tabela/7127', periodoOriginal: '2004-2015', periodoAtualizado: '2004-2022', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-50', numero: 50, titulo: 'Rendimento Médio', tituloIngles: 'Average income', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 6390', urlFonte: 'https://sidra.ibge.gov.br/tabela/6390', periodoOriginal: '2012-2019', periodoAtualizado: '2012-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-51', numero: 51, titulo: 'Rendimento por Raça/Cor', tituloIngles: 'Income by race', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 6406', urlFonte: 'https://sidra.ibge.gov.br/tabela/6406', periodoOriginal: '2012-2019', periodoAtualizado: '2012-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-52', numero: 52, titulo: 'Rendimento por Sexo', tituloIngles: 'Income by sex', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 6393', urlFonte: 'https://sidra.ibge.gov.br/tabela/6393', periodoOriginal: '2012-2019', periodoAtualizado: '2012-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-53', numero: 53, titulo: 'Subocupação', tituloIngles: 'Underemployment', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 6398', urlFonte: 'https://sidra.ibge.gov.br/tabela/6398', periodoOriginal: '2012-2019', periodoAtualizado: '2012-2024', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-54', numero: 54, titulo: 'Sindicalização', tituloIngles: 'Unionization rate', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7135', urlFonte: 'https://sidra.ibge.gov.br/tabela/7135', periodoOriginal: '2004-2015', periodoAtualizado: '2004-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-55', numero: 55, titulo: 'Contribuição Previdenciária', tituloIngles: 'Social security contribution', categoria: 'Trabalho', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 6385', urlFonte: 'https://sidra.ibge.gov.br/tabela/6385', periodoOriginal: '2012-2019', periodoAtualizado: '2012-2024', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  
  // EIXO VI - POBREZA E HABITAÇÃO (56-65)
  { id: 'cc-56', numero: 56, titulo: 'Índice de Gini', tituloIngles: 'Gini index', categoria: 'Pobreza', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7435', urlFonte: 'https://sidra.ibge.gov.br/tabela/7435', periodoOriginal: '2001-2018', periodoAtualizado: '2001-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-57', numero: 57, titulo: 'Pobreza e Extrema Pobreza', tituloIngles: 'Poverty rates', categoria: 'Pobreza', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7450', urlFonte: 'https://sidra.ibge.gov.br/tabela/7450', periodoOriginal: '2012-2018', periodoAtualizado: '2012-2023', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-58', numero: 58, titulo: 'Pobreza por Raça/Cor', tituloIngles: 'Poverty by race', categoria: 'Pobreza', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7453', urlFonte: 'https://sidra.ibge.gov.br/tabela/7453', periodoOriginal: '2012-2018', periodoAtualizado: '2012-2023', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-59', numero: 59, titulo: 'Bolsa Família/Auxílio Brasil', tituloIngles: 'Cash transfer programs', categoria: 'Pobreza', fonte: 'MDS/SAGI', urlFonte: 'https://aplicacoes.mds.gov.br/sagi/vis/data3/v.php', periodoOriginal: '2004-2018', periodoAtualizado: '2004-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-60', numero: 60, titulo: 'Insegurança Alimentar', tituloIngles: 'Food insecurity', categoria: 'Pobreza', fonte: 'IBGE/POF', urlFonte: 'https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html', periodoOriginal: '2004-2018', periodoAtualizado: '2004-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-61', numero: 61, titulo: 'Déficit Habitacional', tituloIngles: 'Housing deficit', categoria: 'Habitação', fonte: 'FJP', urlFonte: 'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/', periodoOriginal: '2007-2019', periodoAtualizado: '2007-2022', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-62', numero: 62, titulo: 'Acesso a Água Potável', tituloIngles: 'Access to safe water', categoria: 'Habitação', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7110', urlFonte: 'https://sidra.ibge.gov.br/tabela/7110', periodoOriginal: '2004-2015', periodoAtualizado: '2004-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-63', numero: 63, titulo: 'Acesso a Saneamento', tituloIngles: 'Access to sanitation', categoria: 'Habitação', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7110', urlFonte: 'https://sidra.ibge.gov.br/tabela/7110', periodoOriginal: '2004-2015', periodoAtualizado: '2004-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-64', numero: 64, titulo: 'Acesso a Eletricidade', tituloIngles: 'Access to electricity', categoria: 'Habitação', fonte: 'IBGE/PNAD', tabelaSidra: 'Tabela 7110', urlFonte: 'https://sidra.ibge.gov.br/tabela/7110', periodoOriginal: '2004-2015', periodoAtualizado: '2004-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-65', numero: 65, titulo: 'Acesso a Internet', tituloIngles: 'Access to internet', categoria: 'Habitação', fonte: 'IBGE/PNAD TIC', tabelaSidra: 'Tabela 7165', urlFonte: 'https://sidra.ibge.gov.br/tabela/7165', periodoOriginal: '2016-2019', periodoAtualizado: '2016-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  
  // EIXO VII - SEGURANÇA PÚBLICA (66-70)
  { id: 'cc-66', numero: 66, titulo: 'Homicídios Total', tituloIngles: 'Total homicides', categoria: 'Segurança', fonte: 'DataSUS/SIM', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2000-2017', periodoAtualizado: '2000-2022', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-67', numero: 67, titulo: 'Homicídios por Raça/Cor', tituloIngles: 'Homicides by race', categoria: 'Segurança', fonte: 'DataSUS/SIM', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2010-2017', periodoAtualizado: '2010-2022', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-68', numero: 68, titulo: 'Violência contra Mulheres', tituloIngles: 'Violence against women', categoria: 'Segurança', fonte: 'DataSUS/SINAN', urlFonte: 'https://datasus.saude.gov.br/', periodoOriginal: '2011-2018', periodoAtualizado: '2011-2023', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-69', numero: 69, titulo: 'População Carcerária', tituloIngles: 'Prison population', categoria: 'Segurança', fonte: 'DEPEN/SISDEPEN', urlFonte: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen', periodoOriginal: '2000-2019', periodoAtualizado: '2000-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-70', numero: 70, titulo: 'Letalidade Policial', tituloIngles: 'Police lethality', categoria: 'Segurança', fonte: 'FBSP', urlFonte: 'https://forumseguranca.org.br/', periodoOriginal: '2013-2019', periodoAtualizado: '2013-2023', statusAtualizacao: 'atualizado', tendencia: 'decrescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  
  // EIXO VIII - SISTEMA POLÍTICO (71-77)
  { id: 'cc-71', numero: 71, titulo: 'Eleitores Registrados', tituloIngles: 'Registered voters', categoria: 'Sistema Político', fonte: 'TSE', urlFonte: 'https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-eleitorais', periodoOriginal: '2002-2018', periodoAtualizado: '2002-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-72', numero: 72, titulo: 'Participação Eleitoral', tituloIngles: 'Electoral participation', categoria: 'Sistema Político', fonte: 'TSE', urlFonte: 'https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-eleitorais', periodoOriginal: '2002-2018', periodoAtualizado: '2002-2024', statusAtualizacao: 'atualizado', tendencia: 'estavel', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-73', numero: 73, titulo: 'Candidaturas por Sexo', tituloIngles: 'Candidates by sex', categoria: 'Sistema Político', fonte: 'TSE', urlFonte: 'https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-eleitorais', periodoOriginal: '2002-2018', periodoAtualizado: '2002-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-74', numero: 74, titulo: 'Candidaturas por Raça/Cor', tituloIngles: 'Candidates by race', categoria: 'Sistema Político', fonte: 'TSE', urlFonte: 'https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-eleitorais', periodoOriginal: '2014-2018', periodoAtualizado: '2014-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-75', numero: 75, titulo: 'Eleitos por Sexo', tituloIngles: 'Elected officials by sex', categoria: 'Sistema Político', fonte: 'TSE', urlFonte: 'https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-eleitorais', periodoOriginal: '2002-2018', periodoAtualizado: '2002-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-76', numero: 76, titulo: 'Eleitos por Raça/Cor', tituloIngles: 'Elected officials by race', categoria: 'Sistema Político', fonte: 'TSE', urlFonte: 'https://www.tse.jus.br/eleicoes/estatisticas/estatisticas-eleitorais', periodoOriginal: '2014-2018', periodoAtualizado: '2014-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
  { id: 'cc-77', numero: 77, titulo: 'Composição do Congresso', tituloIngles: 'Congress composition', categoria: 'Sistema Político', fonte: 'Câmara/Senado', urlFonte: 'https://www.camara.leg.br/deputados/bancada-atual', periodoOriginal: '2002-2018', periodoAtualizado: '2002-2024', statusAtualizacao: 'atualizado', tendencia: 'crescente', dadosColetados: true, ultimaAtualizacao: '2024-01' },
];

// Ícones por categoria
const categoryIcons: Record<string, React.ElementType> = {
  'Demografia': Users,
  'Economia': BarChart3,
  'Educação': GraduationCap,
  'Saúde': Heart,
  'Trabalho': Briefcase,
  'Pobreza': Home,
  'Habitação': Home,
  'Segurança': Shield,
  'Sistema Político': Vote,
};

const statusConfig = {
  atualizado: { label: 'Atualizado', icon: CheckCircle2, className: 'bg-green-500/10 text-green-600' },
  parcial: { label: 'Parcial', icon: Clock, className: 'bg-amber-500/10 text-amber-600' },
  desatualizado: { label: 'Desatualizado', icon: AlertCircle, className: 'bg-red-500/10 text-red-600' }
};

const trendConfig = {
  crescente: { label: 'Crescente', icon: TrendingUp, className: 'text-green-600' },
  decrescente: { label: 'Decrescente', icon: TrendingDown, className: 'text-red-600' },
  estavel: { label: 'Estável', icon: Minus, className: 'text-muted-foreground' }
};

export default function CommonCore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<UpdateStatus | null>(null);

  // Cálculos de progresso
  const stats = useMemo(() => {
    const total = commonCoreTables.length;
    const atualizados = commonCoreTables.filter(t => t.statusAtualizacao === 'atualizado').length;
    const parciais = commonCoreTables.filter(t => t.statusAtualizacao === 'parcial').length;
    const desatualizados = commonCoreTables.filter(t => t.statusAtualizacao === 'desatualizado').length;
    const coletados = commonCoreTables.filter(t => t.dadosColetados).length;
    
    return { total, atualizados, parciais, desatualizados, coletados };
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(commonCoreTables.map(t => t.categoria))];
    return cats.map(cat => ({
      name: cat,
      count: commonCoreTables.filter(t => t.categoria === cat).length,
      updated: commonCoreTables.filter(t => t.categoria === cat && t.statusAtualizacao === 'atualizado').length
    }));
  }, []);

  const filteredTables = useMemo(() => {
    return commonCoreTables.filter(table => {
      const matchesSearch = searchTerm === '' || 
        table.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.tituloIngles.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.fonte.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || table.categoria === selectedCategory;
      const matchesStatus = !selectedStatus || table.statusAtualizacao === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, selectedCategory, selectedStatus]);

  const progressoPct = Math.round((stats.atualizados / stats.total) * 100);
  const coletadosPct = Math.round((stats.coletados / stats.total) * 100);

  return (
    <DashboardLayout
      title="Common Core Document - 77 Tabelas"
      subtitle="HRI/CORE/BRA/2020 - Gerenciamento e Atualização 2018-2025"
    >
      {/* Header com link do documento */}
      <Card className="mb-6 header-gradient text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-10 h-10" />
              <div>
                <h2 className="text-lg font-bold">HRI/CORE/BRA/2020</h2>
                <p className="text-sm text-primary-foreground/80">
                  Common core document forming part of the reports of States parties
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <a 
                href="https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=HRI%2FCORE%2FBRA%2F2020&Lang=en" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Documento Original
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Progresso */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Total Tabelas</span>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Atualizadas</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.atualizados}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Parciais</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.parciais}</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Desatualizadas</span>
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.desatualizados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Progresso</span>
            </div>
            <p className="text-2xl font-bold">{progressoPct}%</p>
            <Progress value={progressoPct} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por título, fonte ou tabela SIDRA..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={selectedStatus === null ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedStatus(null)}
              >
                Todos
              </Button>
              <Button 
                variant={selectedStatus === 'atualizado' ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedStatus(selectedStatus === 'atualizado' ? null : 'atualizado')}
                className={selectedStatus === 'atualizado' ? 'bg-green-600' : ''}
              >
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Atualizadas
              </Button>
              <Button 
                variant={selectedStatus === 'parcial' ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedStatus(selectedStatus === 'parcial' ? null : 'parcial')}
                className={selectedStatus === 'parcial' ? 'bg-amber-600' : ''}
              >
                <Clock className="w-3 h-3 mr-1" />
                Parciais
              </Button>
              <Button 
                variant={selectedStatus === 'desatualizado' ? "default" : "outline"} 
                size="sm"
                onClick={() => setSelectedStatus(selectedStatus === 'desatualizado' ? null : 'desatualizado')}
                className={selectedStatus === 'desatualizado' ? 'bg-red-600' : ''}
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Desatualizadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-3">
        <ExportTabButtons targetSelector="#export-common-core" fileName="Common-Core-77-Tabelas" compact />
      </div>

      <div id="export-common-core">
      {/* Tabs por Categoria */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger 
            value="all" 
            onClick={() => setSelectedCategory(null)}
            className="gap-1"
          >
            Todas (77)
          </TabsTrigger>
          {categories.map(cat => {
            const Icon = categoryIcons[cat.name] || FileText;
            return (
              <TabsTrigger 
                key={cat.name} 
                value={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className="gap-1"
              >
                <Icon className="w-3 h-3" />
                {cat.name} ({cat.count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tabelas do Common Core</span>
                <Badge variant="outline">{filteredTables.length} tabelas</Badge>
              </CardTitle>
              <CardDescription>
                Clique em uma tabela para ver detalhes e link da fonte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tendência</TableHead>
                      <TableHead className="text-right">Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTables.map(table => {
                      const status = statusConfig[table.statusAtualizacao];
                      const StatusIcon = status.icon;
                      const trend = table.tendencia ? trendConfig[table.tendencia] : null;
                      const TrendIcon = trend?.icon || Minus;
                      const CategoryIcon = categoryIcons[table.categoria] || FileText;
                      
                      return (
                        <TableRow key={table.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm font-medium">
                            {table.numero}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{table.titulo}</p>
                              <p className="text-xs text-muted-foreground">{table.tituloIngles}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <CategoryIcon className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="text-sm">{table.categoria}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <span>{table.fonte}</span>
                              {table.tabelaSidra && (
                                <p className="text-xs text-muted-foreground">{table.tabelaSidra}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <p className="text-muted-foreground line-through">{table.periodoOriginal}</p>
                              <p className="font-medium">{table.periodoAtualizado}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn('gap-1', status.className)}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {trend && (
                              <div className={cn('flex items-center gap-1', trend.className)}>
                                <TrendIcon className="w-3.5 h-3.5" />
                                <span className="text-xs">{trend.label}</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {table.urlFonte && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={table.urlFonte} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo para cada categoria individual */}
        {categories.map(cat => (
          <TabsContent key={cat.name} value={cat.name} className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(categoryIcons[cat.name] || FileText, { className: 'w-5 h-5' })}
                  {cat.name}
                  <Badge variant="outline">{cat.count} tabelas</Badge>
                </CardTitle>
                <CardDescription>
                  {cat.updated}/{cat.count} atualizadas ({Math.round((cat.updated / cat.count) * 100)}%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={(cat.updated / cat.count) * 100} className="h-2 mb-4" />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Fonte</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tendência</TableHead>
                        <TableHead className="text-right">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTables.filter(t => t.categoria === cat.name).map(table => {
                        const status = statusConfig[table.statusAtualizacao];
                        const StatusIcon = status.icon;
                        const trend = table.tendencia ? trendConfig[table.tendencia] : null;
                        const TrendIcon = trend?.icon || Minus;
                        
                        return (
                          <TableRow key={table.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-sm font-medium">
                              {table.numero}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{table.titulo}</p>
                                <p className="text-xs text-muted-foreground">{table.tituloIngles}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <span>{table.fonte}</span>
                                {table.tabelaSidra && (
                                  <p className="text-xs text-muted-foreground">{table.tabelaSidra}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <p className="text-muted-foreground line-through">{table.periodoOriginal}</p>
                                <p className="font-medium">{table.periodoAtualizado}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn('gap-1', status.className)}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {trend && (
                                <div className={cn('flex items-center gap-1', trend.className)}>
                                  <TrendIcon className="w-3.5 h-3.5" />
                                  <span className="text-xs">{trend.label}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {table.urlFonte && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={table.urlFonte} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      </div>
    </DashboardLayout>
  );
}
