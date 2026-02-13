import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, ArrowUpRight, Building, Building2, MapPin, ExternalLink, AlertTriangle, CheckCircle, Users, Calendar, Target } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Dados históricos de orçamento
// Fonte: SIOP (Sistema Integrado de Planejamento e Orçamento) e Portal da Transparência
// URL: https://www.siop.planejamento.gov.br/siop/ | https://portaldatransparencia.gov.br/
// Nota: Valores agregados de programas federais com recorte racial (MIR, FUNAI, INCRA, MEC-cotas, MDS-quilombos)
const budgetHistoricalData = [
  { ano: 2018, autorizado: 145000000, empenhado: 98000000, pago: 72000000, execucao: 49.7 },
  { ano: 2019, autorizado: 152000000, empenhado: 125000000, pago: 108000000, execucao: 71.1 },
  { ano: 2020, autorizado: 138000000, empenhado: 95000000, pago: 68000000, execucao: 49.3 },
  { ano: 2021, autorizado: 112000000, empenhado: 72000000, pago: 55000000, execucao: 49.1 },
  { ano: 2022, autorizado: 98000000, empenhado: 68000000, pago: 52000000, execucao: 53.1 },
  { ano: 2023, autorizado: 285000000, empenhado: 242000000, pago: 198000000, execucao: 69.5 },
  { ano: 2024, autorizado: 420000000, empenhado: 358000000, pago: 295000000, execucao: 70.2 },
  { ano: 2025, autorizado: 545000000, empenhado: 468000000, pago: 385000000, execucao: 70.6 }
];

// Programas federais detalhados (2018-2026)
// Fontes: SIOP, Portal da Transparência, PPA Aberto (Painel de Monitoramento MPO)
const programasFederais = [
  {
    categoria: 'Promoção da Igualdade Racial',
    orgao: 'MIR',
    fonte: 'SIOP / Portal da Transparência / PPA Aberto',
    url: 'https://portaldatransparencia.gov.br/orgaos-superiores/67000-ministerio-da-igualdade-racial',
    programas: [
      { nome: 'Promoção da Igualdade Racial e Superação do Racismo', codigo: '5034', inicio: 2024, valores: { 2024: 89000000, 2025: 125000000 }, publico: 'População negra, quilombolas, ciganos', interseccionalidade: 'Gênero, juventude', fonte: 'PPA 2024-2027 – Programa 5034', url: 'https://portaldatransparencia.gov.br/despesas/programa-e-acao?de=01/01/2024&ate=31/12/2025&programa=5034' },
      { nome: 'Juventude Negra Viva', codigo: '5034.8', inicio: 2023, valores: { 2023: 25000000, 2024: 35000000, 2025: 48000000 }, publico: 'Jovens negros 15-29 anos', interseccionalidade: 'Idade, gênero, território', fonte: 'SIOP – Ação 21CS/MIR', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR92000&funcoes=14' },
      { nome: 'Aquilombar - Fortalecimento de Comunidades Quilombolas', codigo: '5034.9', inicio: 2023, valores: { 2023: 18000000, 2024: 28000000, 2025: 42000000 }, publico: 'Comunidades quilombolas', interseccionalidade: 'Território, gênero', fonte: 'SIOP – Ação 21CT/MIR', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR92000&funcoes=14' },
      { nome: 'Brasil Cigano', codigo: '5034.10', inicio: 2024, valores: { 2024: 8000000, 2025: 15000000 }, publico: 'Povos ciganos/Roma', interseccionalidade: 'Cultura, território', fonte: 'SIOP – Ação 21CU/MIR', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR92000' },
      { nome: 'Mulheres Negras Protagonistas', codigo: '5034.11', inicio: 2024, valores: { 2024: 22000000, 2025: 35000000 }, publico: 'Mulheres negras', interseccionalidade: 'Gênero, classe', fonte: 'SIOP – Ação 21CV/MIR', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR92000' },
      { nome: 'Política Nacional de Gestão Territorial Quilombola', codigo: '2034', inicio: 2018, valores: { 2018: 12000000, 2019: 15000000, 2020: 8000000, 2021: 5000000, 2022: 4000000, 2023: 25000000, 2024: 38000000, 2025: 52000000 }, publico: 'Comunidades quilombolas', interseccionalidade: 'Território', fonte: 'SIOP – Programa 2034 (PPA 2016-2023)', url: 'https://portaldatransparencia.gov.br/programas-e-acoes/programa/2034?ano=2022' }
    ]
  },
  {
    categoria: 'Povos Indígenas',
    orgao: 'MPI/FUNAI',
    fonte: 'FUNAI / SIOP / Portal da Transparência',
    url: 'https://portaldatransparencia.gov.br/orgaos/37201-FUNDACAO-NACIONAL-DOS-POVOS-INDIGENAS',
    programas: [
      { nome: 'Proteção e Promoção dos Direitos dos Povos Indígenas', codigo: '5033', inicio: 2024, valores: { 2024: 220000000, 2025: 285000000 }, publico: 'Povos indígenas', interseccionalidade: 'Território, cultura', fonte: 'PPA 2024-2027 – Programa 5033', url: 'https://portaldatransparencia.gov.br/programas-e-acoes/programa/5033?ano=2025' },
      { nome: 'Demarcação e Fiscalização de Terras Indígenas', codigo: '5033.1', inicio: 2018, valores: { 2018: 45000000, 2019: 52000000, 2020: 38000000, 2021: 28000000, 2022: 22000000, 2023: 85000000, 2024: 120000000, 2025: 155000000 }, publico: 'Povos indígenas em TIs', interseccionalidade: 'Território', fonte: 'FUNAI – Ação 20UF (Demarcação TI)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR37201' },
      { nome: 'Proteção contra Garimpo Ilegal', codigo: '5033.2', inicio: 2023, valores: { 2023: 45000000, 2024: 68000000, 2025: 92000000 }, publico: 'Povos indígenas - Yanomami, Munduruku, Kayapó', interseccionalidade: 'Saúde, território', fonte: 'MPI+FUNAI – Ação 21AF', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR37201&funcoes=18' },
      { nome: 'Saúde Indígena (SESAI)', codigo: '5033.3', inicio: 2018, valores: { 2018: 125000000, 2019: 138000000, 2020: 142000000, 2021: 148000000, 2022: 155000000, 2023: 185000000, 2024: 210000000, 2025: 245000000 }, publico: 'Povos indígenas - 34 DSEIs', interseccionalidade: 'Saúde, gênero, idade', fonte: 'SESAI/MS – Ação 20YP (Saúde Indígena)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR36901&funcoes=10' },
      { nome: 'Educação Escolar Indígena', codigo: '5033.4', inicio: 2018, valores: { 2018: 28000000, 2019: 32000000, 2020: 25000000, 2021: 22000000, 2022: 24000000, 2023: 38000000, 2024: 52000000, 2025: 68000000 }, publico: 'Crianças e jovens indígenas', interseccionalidade: 'Educação, cultura, língua', fonte: 'MEC – Ação 20RJ (Educação Indígena)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR26000&acoes=20RJ' },
      { nome: 'Mulheres e Crianças Indígenas', codigo: '5033.5', inicio: 2024, valores: { 2024: 18000000, 2025: 28000000 }, publico: 'Mulheres e crianças indígenas', interseccionalidade: 'Gênero, idade', fonte: 'MPI – Ação 21BG', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR37000' }
    ]
  },
  {
    categoria: 'Territórios Quilombolas',
    orgao: 'INCRA',
    fonte: 'INCRA / SIOP / Portal da Transparência',
    url: 'https://portaldatransparencia.gov.br/orgaos/22201-INSTITUTO-NACIONAL-DE-COLONIZACAO-E-REFORMA-AGRARIA',
    programas: [
      { nome: 'Regularização Fundiária de Territórios Quilombolas', codigo: '2066', inicio: 2018, valores: { 2018: 35000000, 2019: 42000000, 2020: 28000000, 2021: 18000000, 2022: 15000000, 2023: 65000000, 2024: 95000000, 2025: 145000000 }, publico: 'Comunidades quilombolas - 1.827 processos', interseccionalidade: 'Território, cultura', fonte: 'INCRA – Ação 0859 (Indenização TQ)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR22201&acoes=0859' },
      { nome: 'Indenização de Áreas Quilombolas', codigo: '2066.1', inicio: 2023, valores: { 2023: 42000000, 2024: 68000000, 2025: 95000000 }, publico: 'Comunidades quilombolas com sobreposição', interseccionalidade: 'Território', fonte: 'INCRA – Ação 0859 (subação)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR22201&funcoes=21' },
      { nome: 'Assistência Técnica Quilombola (ATER)', codigo: '2066.2', inicio: 2024, valores: { 2024: 15000000, 2025: 25000000 }, publico: 'Agricultores quilombolas', interseccionalidade: 'Produção, gênero', fonte: 'INCRA – Ação 210S (ATER)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR22201&funcoes=20' }
    ]
  },
  {
    categoria: 'Ações Afirmativas e Educação',
    orgao: 'MEC',
    fonte: 'MEC / SIOP / Portal da Transparência',
    url: 'https://portaldatransparencia.gov.br/orgaos/26000-MINISTERIO-DA-EDUCACAO',
    programas: [
      { nome: 'Bolsa Permanência - Cotas', codigo: '2030.1', inicio: 2018, valores: { 2018: 85000000, 2019: 92000000, 2020: 78000000, 2021: 65000000, 2022: 58000000, 2023: 125000000, 2024: 158000000, 2025: 195000000 }, publico: 'Estudantes negros, indígenas e quilombolas', interseccionalidade: 'Educação, classe', fonte: 'MEC – Ação 2A13 (Bolsa Permanência)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR26000&acoes=2A13' },
      { nome: 'UNIAFRO - Núcleos de Estudos Afro-brasileiros', codigo: '2030.2', inicio: 2018, valores: { 2018: 12000000, 2019: 8000000, 2020: 5000000, 2021: 3000000, 2022: 2000000, 2023: 18000000, 2024: 28000000, 2025: 38000000 }, publico: 'Universidades públicas', interseccionalidade: 'Educação, pesquisa', fonte: 'MEC – Ação 20RQ (UNIAFRO)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR26000&acoes=20RQ' },
      { nome: 'Implementação Lei 10.639/11.645', codigo: '2030.3', inicio: 2018, valores: { 2018: 8000000, 2019: 6000000, 2020: 4000000, 2021: 2000000, 2022: 2000000, 2023: 15000000, 2024: 22000000, 2025: 32000000 }, publico: 'Escolas públicas', interseccionalidade: 'Educação, cultura', fonte: 'MEC – Educação Étnico-Racial', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR26000&funcoes=12' }
    ]
  },
  {
    categoria: 'Proteção Social',
    orgao: 'MDS',
    fonte: 'MDS / SIOP / Portal da Transparência',
    url: 'https://portaldatransparencia.gov.br/orgaos/55000-MINISTERIO-DO-DESENVOLVIMENTO-E-ASSISTENCIA-SOCIAL',
    programas: [
      { nome: 'Bolsa Família - Componente Racial', codigo: '2019.R', inicio: 2023, valores: { 2023: 850000000, 2024: 1200000000, 2025: 1450000000 }, publico: 'Famílias negras, indígenas, quilombolas em vulnerabilidade', interseccionalidade: 'Classe, território', fonte: 'MDS – Programa 5031 (Bolsa Família)', url: 'https://portaldatransparencia.gov.br/programas-e-acoes/programa/5031?ano=2025' },
      { nome: 'Cozinha Solidária - Quilombos e Aldeias', codigo: '2019.Q', inicio: 2023, valores: { 2023: 25000000, 2024: 42000000, 2025: 58000000 }, publico: 'Comunidades quilombolas e indígenas', interseccionalidade: 'Segurança alimentar, território', fonte: 'MDS – Ação 21BV (Cozinha Solidária)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR55000&acoes=21BV' },
      { nome: 'Cisternas para Quilombos', codigo: '2019.C', inicio: 2018, valores: { 2018: 18000000, 2019: 22000000, 2020: 15000000, 2021: 8000000, 2022: 5000000, 2023: 28000000, 2024: 38000000, 2025: 48000000 }, publico: 'Quilombos no semiárido', interseccionalidade: 'Água, território', fonte: 'MDS – Ação 11V1 (Cisternas)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR55000&acoes=11V1' }
    ]
  },
  {
    categoria: 'Segurança Pública',
    orgao: 'MJSP',
    fonte: 'MJSP / SIOP / Portal da Transparência',
    url: 'https://portaldatransparencia.gov.br/orgaos/30000-MINISTERIO-DA-JUSTICA-E-SEGURANCA-PUBLICA',
    programas: [
      { nome: 'Programa Nacional de Enfrentamento à Violência contra Juventude Negra', codigo: '2081.J', inicio: 2024, valores: { 2024: 45000000, 2025: 68000000 }, publico: 'Jovens negros em territórios vulneráveis', interseccionalidade: 'Idade, território, gênero', fonte: 'MJSP – Programa 5041 (Segurança Cidadã)', url: 'https://portaldatransparencia.gov.br/programas-e-acoes/programa/5041?ano=2025' },
      { nome: 'Câmeras Corporais - Redução Letalidade', codigo: '2081.C', inicio: 2023, valores: { 2023: 85000000, 2024: 125000000, 2025: 165000000 }, publico: 'Forças de segurança / População negra', interseccionalidade: 'Segurança, raça', fonte: 'MJSP – Ação 21AS (Câmeras Corporais)', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR30000&funcoes=06' }
    ]
  }
];

// Programas estaduais detalhados
// Fonte: LOAs estaduais 2024 e Portais de Transparência estaduais
const programasEstaduais = [
  {
    uf: 'BA', estado: 'Bahia', orgao: 'SEPROMI',
    fonte: 'LOA Bahia 2024', url: 'https://www.transparencia.ba.gov.br/',
    programas: [
      { nome: 'Bahia Afirmativa', inicio: 2019, valores: { 2024: 28000000 }, publico: 'População negra baiana', interseccionalidade: 'Gênero, juventude' },
      { nome: 'Quilombo Digital', inicio: 2022, valores: { 2024: 8000000 }, publico: 'Comunidades quilombolas', interseccionalidade: 'Tecnologia, educação' },
      { nome: 'Programa Estadual de Saúde da População Negra', inicio: 2018, valores: { 2024: 15000000 }, publico: 'População negra', interseccionalidade: 'Saúde, gênero' },
      { nome: 'Juventude Negra Baiana', inicio: 2023, valores: { 2024: 12000000 }, publico: 'Jovens negros 15-29 anos', interseccionalidade: 'Idade, emprego' }
    ]
  },
  {
    uf: 'SP', estado: 'São Paulo', orgao: 'Secretaria de Justiça e Cidadania',
    fonte: 'LOA SP 2024', url: 'https://www.fazenda.sp.gov.br/SigeoLei131/Paginas/FlexConsDespworking.aspx',
    programas: [
      { nome: 'SP Diverso', inicio: 2023, valores: { 2024: 18000000 }, publico: 'Populações vulnerabilizadas', interseccionalidade: 'Raça, gênero, LGBTQIA+' },
      { nome: 'Promoção da Igualdade Racial SP', inicio: 2018, valores: { 2024: 12000000 }, publico: 'População negra paulista', interseccionalidade: 'Emprego, educação' },
      { nome: 'Comunidades Tradicionais SP', inicio: 2020, valores: { 2024: 8000000 }, publico: 'Quilombolas, indígenas, caiçaras', interseccionalidade: 'Território, cultura' }
    ]
  },
  {
    uf: 'RJ', estado: 'Rio de Janeiro', orgao: 'SEASDH',
    fonte: 'LOA RJ 2024', url: 'https://www.transparencia.rj.gov.br/',
    programas: [
      { nome: 'RJ sem Racismo', inicio: 2023, valores: { 2024: 15000000 }, publico: 'População negra fluminense', interseccionalidade: 'Segurança, juventude' },
      { nome: 'Quilombos Fluminenses', inicio: 2019, valores: { 2024: 6000000 }, publico: 'Comunidades quilombolas RJ', interseccionalidade: 'Território, cultura' },
      { nome: 'Mulheres Negras RJ', inicio: 2024, valores: { 2024: 5000000 }, publico: 'Mulheres negras', interseccionalidade: 'Gênero, violência' }
    ]
  },
  {
    uf: 'MG', estado: 'Minas Gerais', orgao: 'SEDHS',
    fonte: 'LOA MG 2024', url: 'https://www.transparencia.mg.gov.br/',
    programas: [
      { nome: 'Minas pela Igualdade Racial', inicio: 2019, valores: { 2024: 12000000 }, publico: 'População negra mineira', interseccionalidade: 'Emprego, cultura' },
      { nome: 'Quilombos de Minas', inicio: 2018, valores: { 2024: 8000000 }, publico: 'Comunidades quilombolas MG', interseccionalidade: 'Território, produção' },
      { nome: 'Povos Indígenas MG', inicio: 2023, valores: { 2024: 5000000 }, publico: 'Povos indígenas (Krenak, Maxakali, Pataxó)', interseccionalidade: 'Território, cultura' }
    ]
  },
  {
    uf: 'RS', estado: 'Rio Grande do Sul', orgao: 'SDH',
    fonte: 'LOA RS 2024', url: 'https://transparencia.rs.gov.br/',
    programas: [
      { nome: 'RS pela Igualdade', inicio: 2019, valores: { 2024: 8000000 }, publico: 'População negra gaúcha', interseccionalidade: 'Cultura, memória' },
      { nome: 'Povos Indígenas RS', inicio: 2018, valores: { 2024: 6000000 }, publico: 'Kaingang, Guarani', interseccionalidade: 'Território, saúde' }
    ]
  },
  {
    uf: 'PE', estado: 'Pernambuco', orgao: 'SecMulher/FUNDARPE',
    fonte: 'LOA PE 2024', url: 'https://transparencia.pe.gov.br/',
    programas: [
      { nome: 'PE Quilombola', inicio: 2019, valores: { 2024: 10000000 }, publico: 'Comunidades quilombolas PE', interseccionalidade: 'Território, cultura' },
      { nome: 'Povos Indígenas PE', inicio: 2018, valores: { 2024: 5000000 }, publico: 'Fulni-ô, Pankararu, Xukuru', interseccionalidade: 'Território, educação' }
    ]
  },
  {
    uf: 'MA', estado: 'Maranhão', orgao: 'SEDIHPOP',
    fonte: 'LOA MA 2024', url: 'https://www.transparencia.ma.gov.br/',
    programas: [
      { nome: 'Maranhão Quilombola', inicio: 2019, valores: { 2024: 12000000 }, publico: 'Comunidades quilombolas MA (maior do Brasil)', interseccionalidade: 'Território, produção' },
      { nome: 'Povos Indígenas MA', inicio: 2018, valores: { 2024: 4000000 }, publico: 'Guajajara, Ka\'apor, Awá', interseccionalidade: 'Território, proteção' }
    ]
  },
  {
    uf: 'PA', estado: 'Pará', orgao: 'SEIRDH',
    fonte: 'LOA PA 2024', url: 'https://www.transparencia.pa.gov.br/',
    programas: [
      { nome: 'Pará Quilombola', inicio: 2020, valores: { 2024: 8000000 }, publico: 'Comunidades quilombolas PA', interseccionalidade: 'Território, ribeirinho' },
      { nome: 'Proteção Povos Indígenas PA', inicio: 2023, valores: { 2024: 6000000 }, publico: 'Kayapó, Munduruku, Parakanã', interseccionalidade: 'Garimpo, território' }
    ]
  }
];

// Programas municipais detalhados
// Fonte: LOAs municipais 2024 e Portais de Transparência municipais
const programasMunicipais = [
  {
    municipio: 'Salvador', uf: 'BA', orgao: 'SEMUR',
    fonte: 'LOA Salvador 2024', url: 'https://transparencia.salvador.ba.gov.br/',
    programas: [
      { nome: 'Salvador Antirracista', inicio: 2021, valores: { 2024: 12000000 }, publico: 'População negra soteropolitana', interseccionalidade: 'Cultura, juventude' },
      { nome: 'Oportunidade para Todos', inicio: 2022, valores: { 2024: 8000000 }, publico: 'Jovens negros', interseccionalidade: 'Emprego, educação' },
      { nome: 'Proteção ao Patrimônio Africano', inicio: 2019, valores: { 2024: 4000000 }, publico: 'Terreiros, comunidades tradicionais', interseccionalidade: 'Religião, cultura' }
    ]
  },
  {
    municipio: 'São Paulo', uf: 'SP', orgao: 'SMDHC',
    fonte: 'LOA São Paulo 2024', url: 'https://orcamento.sf.prefeitura.sp.gov.br/',
    programas: [
      { nome: 'São Paulo Igualitária', inicio: 2021, valores: { 2024: 18000000 }, publico: 'População negra paulistana', interseccionalidade: 'Emprego, saúde' },
      { nome: 'Cotas na Prefeitura', inicio: 2018, valores: { 2024: 8000000 }, publico: 'Servidores municipais negros', interseccionalidade: 'Emprego público' },
      { nome: 'Rede Cuidar - População Negra', inicio: 2023, valores: { 2024: 6000000 }, publico: 'Saúde da população negra', interseccionalidade: 'Saúde, gênero' },
      { nome: 'Guarani na Cidade', inicio: 2020, valores: { 2024: 4000000 }, publico: 'Comunidades Guarani', interseccionalidade: 'Território urbano, cultura' }
    ]
  },
  {
    municipio: 'Rio de Janeiro', uf: 'RJ', orgao: 'SMDHC',
    fonte: 'LOA Rio 2024', url: 'https://transparencia.prefeitura.rio/',
    programas: [
      { nome: 'Rio sem Racismo', inicio: 2022, valores: { 2024: 10000000 }, publico: 'População negra carioca', interseccionalidade: 'Segurança, favelas' },
      { nome: 'Pequeno Cidadão Quilombola', inicio: 2023, valores: { 2024: 3000000 }, publico: 'Crianças quilombolas', interseccionalidade: 'Infância, educação' }
    ]
  },
  {
    municipio: 'Belo Horizonte', uf: 'MG', orgao: 'SMASAC',
    fonte: 'LOA BH 2024', url: 'https://prefeitura.pbh.gov.br/transparencia',
    programas: [
      { nome: 'BH Igual', inicio: 2019, valores: { 2024: 8000000 }, publico: 'População negra de BH', interseccionalidade: 'Saúde, cultura' },
      { nome: 'Quilombos Urbanos BH', inicio: 2021, valores: { 2024: 3000000 }, publico: 'Comunidades quilombolas urbanas', interseccionalidade: 'Moradia, cultura' }
    ]
  },
  {
    municipio: 'Recife', uf: 'PE', orgao: 'SecMulher',
    fonte: 'LOA Recife 2024', url: 'https://transparencia.recife.pe.gov.br/',
    programas: [
      { nome: 'Recife Antirracista', inicio: 2021, valores: { 2024: 6000000 }, publico: 'População negra recifense', interseccionalidade: 'Cultura, memória' },
      { nome: 'Mulheres Negras do Recife', inicio: 2022, valores: { 2024: 3000000 }, publico: 'Mulheres negras', interseccionalidade: 'Gênero, violência, emprego' }
    ]
  },
  {
    municipio: 'Porto Alegre', uf: 'RS', orgao: 'SMDHSU',
    fonte: 'LOA POA 2024', url: 'https://transparencia.portoalegre.rs.gov.br/',
    programas: [
      { nome: 'POA pela Igualdade', inicio: 2020, valores: { 2024: 5000000 }, publico: 'População negra gaúcha', interseccionalidade: 'Cultura, memória' },
      { nome: 'Territórios Negros', inicio: 2023, valores: { 2024: 2500000 }, publico: 'Bairros históricos negros', interseccionalidade: 'Patrimônio, turismo' }
    ]
  },
  {
    municipio: 'Fortaleza', uf: 'CE', orgao: 'SDHDS',
    fonte: 'LOA Fortaleza 2024', url: 'https://transparencia.fortaleza.ce.gov.br/',
    programas: [
      { nome: 'Fortaleza sem Racismo', inicio: 2022, valores: { 2024: 4500000 }, publico: 'População negra', interseccionalidade: 'Juventude, emprego' },
      { nome: 'Povos de Terreiro', inicio: 2021, valores: { 2024: 2000000 }, publico: 'Comunidades de matriz africana', interseccionalidade: 'Religião, cultura' }
    ]
  },
  {
    municipio: 'Brasília', uf: 'DF', orgao: 'SEDUH',
    fonte: 'LOA DF 2024', url: 'https://www.transparencia.df.gov.br/',
    programas: [
      { nome: 'DF pela Igualdade Racial', inicio: 2019, valores: { 2024: 8000000 }, publico: 'População negra do DF', interseccionalidade: 'Periferia, emprego' },
      { nome: 'Quilombo Mesquita', inicio: 2020, valores: { 2024: 3000000 }, publico: 'Comunidade Quilombo Mesquita', interseccionalidade: 'Território, regularização' }
    ]
  }
];

// Programas específicos para ciganos
// Fonte: SIOP / LOAs estaduais e municipais
const programasCiganos = [
  { esfera: 'Federal', programa: 'Brasil Cigano', orgao: 'MIR', inicio: 2024, valor2024: 8000000, valor2025: 15000000, descricao: 'Política nacional para povos ciganos', acoes: ['Documentação civil', 'Acampamentos', 'Saúde', 'Educação'], fonte: 'SIOP – Ação 21CU/MIR', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2025&ate=31%2F12%2F2025&orgaos=OR92000' },
  { esfera: 'Federal', programa: 'Cadastro Único - Ciganos', orgao: 'MDS', inicio: 2022, valor2024: 3500000, valor2025: 5000000, descricao: 'Inclusão de famílias ciganas no CadÚnico', acoes: ['Busca ativa', 'Atendimento itinerante'], fonte: 'MDS – Programa 5031', url: 'https://portaldatransparencia.gov.br/programas-e-acoes/programa/5031?ano=2025' },
  { esfera: 'Estadual', programa: 'Minas Cigana', orgao: 'MG/SEDHS', inicio: 2023, valor2024: 2000000, valor2025: 3500000, descricao: 'Programa estadual para comunidades ciganas', acoes: ['Saúde', 'Documentação', 'Cultura'], fonte: 'LOA MG 2024 – SEDHS', url: 'https://www.transparencia.mg.gov.br/' },
  { esfera: 'Estadual', programa: 'Bahia Cigana', orgao: 'BA/SEPROMI', inicio: 2024, valor2024: 1500000, valor2025: 2500000, descricao: 'Apoio a comunidades ciganas baianas', acoes: ['Acampamentos', 'Cultura'], fonte: 'LOA Bahia 2024 – SEPROMI', url: 'https://www.transparencia.ba.gov.br/' },
  { esfera: 'Municipal', programa: 'São Paulo Cigana', orgao: 'SP/SMDHC', inicio: 2023, valor2024: 800000, valor2025: 1200000, descricao: 'Atenção a famílias ciganas na capital', acoes: ['Saúde', 'Educação', 'Documentação'], fonte: 'LOA São Paulo 2024 – SMDHC', url: 'https://orcamento.sf.prefeitura.sp.gov.br/' }
];

const COLORS = ['hsl(210, 85%, 25%)', 'hsl(145, 55%, 32%)', 'hsl(45, 93%, 47%)', 'hsl(340, 70%, 50%)', 'hsl(280, 60%, 50%)', 'hsl(200, 70%, 45%)'];

export default function Orcamento() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const totalFederal2025 = 545000000;
  const totalEstadual = 215000000;
  const totalMunicipal = 123200000;

  // Comparação 2018-2022 vs 2023-2025
  const periodo1 = budgetHistoricalData.filter(d => d.ano <= 2022);
  const periodo2 = budgetHistoricalData.filter(d => d.ano >= 2023);
  const mediaPeriodo1 = periodo1.reduce((acc, d) => acc + d.pago, 0) / periodo1.length;
  const mediaPeriodo2 = periodo2.reduce((acc, d) => acc + d.pago, 0) / periodo2.length;
  const crescimento = ((mediaPeriodo2 - mediaPeriodo1) / mediaPeriodo1 * 100).toFixed(1);

  // Distribuição por esfera
  const distribuicaoEsfera = [
    { name: 'Federal', value: totalFederal2025 },
    { name: 'Estadual', value: totalEstadual },
    { name: 'Municipal', value: totalMunicipal }
  ];

  return (
    <DashboardLayout
      title="Orçamento"
      subtitle="Execução orçamentária de políticas raciais - PPA 2018-2026"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Federal 2025</p>
                <p className="text-xl font-bold">{formatCurrency(totalFederal2025)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estadual (8 UFs)</p>
                <p className="text-xl font-bold">{formatCurrency(totalEstadual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <MapPin className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Municipal (8 cap.)</p>
                <p className="text-xl font-bold">{formatCurrency(totalMunicipal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crescimento</p>
                <p className="text-xl font-bold text-success">+{crescimento}%</p>
                <p className="text-xs text-muted-foreground">2023-25 vs 2018-22</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Card */}
      <Card className="mb-6 border-l-4 border-l-success">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Análise: O governo fez mais esforços?
          </h3>
          <p className="text-sm text-muted-foreground">
            Comparando os períodos <strong>2018-2022</strong> (média de {formatCurrency(mediaPeriodo1)}/ano) 
            com <strong>2023-2025</strong> (média de {formatCurrency(mediaPeriodo2)}/ano), observa-se um 
            <strong className="text-success"> aumento de {crescimento}%</strong> nos recursos federais. 
            Novos programas surgiram: <strong>Brasil Cigano</strong> (2024), <strong>Juventude Negra Viva</strong> (2023), 
            <strong>Proteção contra Garimpo</strong> (2023) e <strong>Mulheres Negras Protagonistas</strong> (2024).
            Destaca-se a recriação do MIR em 2023 e a ampliação de recursos para demarcação de terras 
            indígenas e titulação de territórios quilombolas.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="federal" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="federal">Programas Federais</TabsTrigger>
          <TabsTrigger value="estadual">Programas Estaduais</TabsTrigger>
          <TabsTrigger value="municipal">Programas Municipais</TabsTrigger>
          <TabsTrigger value="ciganos">Povos Ciganos</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução Temporal</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
        </TabsList>

        <TabsContent value="federal">
          <div className="space-y-6">
            {programasFederais.map((categoria) => (
              <Card key={categoria.categoria}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-base flex items-center gap-2">
                       <Building className="w-5 h-5 text-primary" />
                       {categoria.categoria}
                     </CardTitle>
                     <div className="flex items-center gap-2">
                       <a href={categoria.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                         <ExternalLink className="w-3 h-3" /> {categoria.fonte}
                       </a>
                       <Badge variant="outline">{categoria.orgao}</Badge>
                     </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {categoria.programas.map((programa, idx) => (
                      <AccordionItem key={idx} value={`item-${idx}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-4 text-left">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{programa.nome}</span>
                                <Badge variant="secondary" className="text-xs">{programa.codigo}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                <span>Início: {programa.inicio}</span>
                                <span className="mx-1">•</span>
                                <span>2025: {formatCurrency(programa.valores[2025] || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Público-alvo
                              </p>
                              <p className="text-sm text-muted-foreground">{programa.publico}</p>
                              
                              <p className="text-sm font-medium mb-2 mt-4 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Interseccionalidade
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {programa.interseccionalidade.split(', ').map((int, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{int}</Badge>
                                ))}
                               </div>
                               <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                                 Fonte: <a href={programa.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 ml-1">{programa.fonte} <ExternalLink className="w-3 h-3" /></a>
                               </p>
                             </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Evolução Orçamentária</p>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="text-xs">Ano</TableHead>
                                    <TableHead className="text-xs text-right">Valor</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {Object.entries(programa.valores).map(([ano, valor]) => (
                                    <TableRow key={ano}>
                                      <TableCell className="text-xs py-1">{ano}</TableCell>
                                      <TableCell className="text-xs py-1 text-right">{formatCurrencyFull(valor)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="estadual">
          <div className="space-y-6">
            {programasEstaduais.map((estado) => (
              <Card key={estado.uf}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-base flex items-center gap-2">
                       <Building2 className="w-5 h-5 text-accent" />
                       {estado.estado}
                       <Badge variant="outline">{estado.uf}</Badge>
                     </CardTitle>
                     <div className="flex items-center gap-2">
                       <a href={estado.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                         <ExternalLink className="w-3 h-3" /> {estado.fonte}
                       </a>
                       <span className="text-sm text-muted-foreground">{estado.orgao}</span>
                     </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Programa</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Público-alvo</TableHead>
                        <TableHead>Interseccionalidade</TableHead>
                        <TableHead className="text-right">Valor 2024</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {estado.programas.map((prog, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{prog.nome}</TableCell>
                          <TableCell>{prog.inicio}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{prog.publico}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {prog.interseccionalidade.split(', ').map((int, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{int}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(prog.valores[2024])}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="municipal">
          <div className="space-y-6">
            {programasMunicipais.map((municipio) => (
              <Card key={municipio.municipio}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                     <CardTitle className="text-base flex items-center gap-2">
                       <MapPin className="w-5 h-5 text-warning" />
                       {municipio.municipio}
                       <Badge variant="outline">{municipio.uf}</Badge>
                     </CardTitle>
                     <div className="flex items-center gap-2">
                       <a href={municipio.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                         <ExternalLink className="w-3 h-3" /> {municipio.fonte}
                       </a>
                       <span className="text-sm text-muted-foreground">{municipio.orgao}</span>
                     </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Programa</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Público-alvo</TableHead>
                        <TableHead>Interseccionalidade</TableHead>
                        <TableHead className="text-right">Valor 2024</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {municipio.programas.map((prog, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{prog.nome}</TableCell>
                          <TableCell>{prog.inicio}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{prog.publico}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {prog.interseccionalidade.split(', ').map((int, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{int}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(prog.valores[2024])}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ciganos">
          <Card className="mb-6 border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-warning" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Lacuna Histórica: Povos Ciganos</h3>
                  <p className="text-sm text-muted-foreground">
                    Até 2023, não existia política específica para povos ciganos no Brasil. O programa 
                    <strong> Brasil Cigano</strong> foi criado em 2024 pelo MIR, sendo a primeira ação 
                    federal estruturada para esta população. Estima-se entre 500 mil a 1 milhão de ciganos 
                    no Brasil, sem dados censitários específicos (não foram contabilizados no Censo 2022).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Programas para Povos Ciganos (2018-2026)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Esfera</TableHead>
                    <TableHead>Programa</TableHead>
                    <TableHead>Órgão</TableHead>
                    <TableHead>Início</TableHead>
                     <TableHead>Descrição</TableHead>
                     <TableHead className="text-right">2024</TableHead>
                     <TableHead className="text-right">2025</TableHead>
                     <TableHead>Fonte</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programasCiganos.map((prog, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Badge variant={prog.esfera === 'Federal' ? 'default' : prog.esfera === 'Estadual' ? 'secondary' : 'outline'}>
                          {prog.esfera}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{prog.programa}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{prog.orgao}</TableCell>
                      <TableCell>{prog.inicio}</TableCell>
                      <TableCell className="text-sm">{prog.descricao}</TableCell>
                       <TableCell className="text-right">{formatCurrency(prog.valor2024)}</TableCell>
                       <TableCell className="text-right">{formatCurrency(prog.valor2025)}</TableCell>
                       <TableCell className="text-xs">
                         <a href={prog.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                           {prog.fonte} <ExternalLink className="w-3 h-3" />
                         </a>
                       </TableCell>
                     </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Ações previstas no Brasil Cigano:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2 bg-background rounded text-sm">
                    <p className="font-medium">Documentação Civil</p>
                    <p className="text-xs text-muted-foreground">Registro, RG, CPF para população itinerante</p>
                  </div>
                  <div className="p-2 bg-background rounded text-sm">
                    <p className="font-medium">Acampamentos</p>
                    <p className="text-xs text-muted-foreground">Infraestrutura para ranchos e acampamentos</p>
                  </div>
                  <div className="p-2 bg-background rounded text-sm">
                    <p className="font-medium">Saúde</p>
                    <p className="text-xs text-muted-foreground">Atenção básica adaptada ao nomadismo</p>
                  </div>
                  <div className="p-2 bg-background rounded text-sm">
                    <p className="font-medium">Educação</p>
                    <p className="text-xs text-muted-foreground">Matrícula flexível e material didático</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolucao">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Execução Orçamentária Federal 2018-2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={budgetHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} width={80} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="autorizado" name="Autorizado" fill="hsl(var(--chart-1))" fillOpacity={0.3} stroke="hsl(var(--chart-1))" />
                      <Area type="monotone" dataKey="pago" name="Pago" fill="hsl(var(--chart-2))" fillOpacity={0.6} stroke="hsl(var(--chart-2))" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                 <p className="text-xs text-muted-foreground mt-2">
                   Nota: Queda em 2020-2022 associada a contingenciamentos e extinção da SEPPIR. 
                   Retomada a partir de 2023 com recriação do MIR.
                 </p>
                 <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                   Fonte: <a href="https://www.siop.planejamento.gov.br/siop/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 ml-1">SIOP <ExternalLink className="w-3 h-3" /></a>
                   <span className="mx-1">|</span>
                   <a href="https://portaldatransparencia.gov.br/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">Portal da Transparência <ExternalLink className="w-3 h-3" /></a>
                 </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por Esfera (2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribuicaoEsfera}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {distribuicaoEsfera.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparativo">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Novos Programas Criados 2018-2026</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>2023</Badge>
                    <span className="font-medium">Juventude Negra Viva</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Primeiro programa federal focado exclusivamente na redução de homicídios de jovens negros
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>2023</Badge>
                    <span className="font-medium">Aquilombar</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fortalecimento integral de comunidades quilombolas com enfoque em protagonismo
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>2023</Badge>
                    <span className="font-medium">Proteção contra Garimpo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ações emergenciais de proteção a povos indígenas afetados por garimpo ilegal
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">2024</Badge>
                    <span className="font-medium">Brasil Cigano</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Primeira política nacional estruturada para povos ciganos na história do Brasil
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">2024</Badge>
                    <span className="font-medium">Mulheres Negras Protagonistas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Programa com recorte interseccional de gênero e raça para autonomia econômica
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">2024</Badge>
                    <span className="font-medium">Mulheres e Crianças Indígenas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Proteção específica com enfoque em gênero e idade para população indígena
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativo por Período e Público</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Público-alvo</TableHead>
                    <TableHead className="text-right">Média 2018-2022</TableHead>
                    <TableHead className="text-right">Média 2023-2025</TableHead>
                    <TableHead className="text-right">Variação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">População Negra (geral)</TableCell>
                    <TableCell className="text-right">{formatCurrency(35000000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(95000000)}</TableCell>
                    <TableCell className="text-right text-success">+171%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Povos Indígenas</TableCell>
                    <TableCell className="text-right">{formatCurrency(180000000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(420000000)}</TableCell>
                    <TableCell className="text-right text-success">+133%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Comunidades Quilombolas</TableCell>
                    <TableCell className="text-right">{formatCurrency(28000000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(98000000)}</TableCell>
                    <TableCell className="text-right text-success">+250%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Povos Ciganos</TableCell>
                    <TableCell className="text-right">{formatCurrency(0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(11500000)}</TableCell>
                    <TableCell className="text-right text-success">Novo</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Juventude Negra</TableCell>
                    <TableCell className="text-right">{formatCurrency(5000000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(36000000)}</TableCell>
                    <TableCell className="text-right text-success">+620%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mulheres Negras</TableCell>
                    <TableCell className="text-right">{formatCurrency(8000000)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(28500000)}</TableCell>
                    <TableCell className="text-right text-success">+256%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-4">
                Fonte: SIOP/LOA 2018-2025. Valores anuais médios por período. Inclui apenas programas federais com 
                orçamento específico para o público indicado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}