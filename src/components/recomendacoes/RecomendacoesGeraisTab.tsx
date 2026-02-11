import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, Scale, Shield, Users, Heart, Eye, Megaphone, Globe2 } from 'lucide-react';

interface RecomendacaoGeral {
  numero: string;
  ano: number;
  titulo: string;
  tituloOriginal: string;
  icon: React.ElementType;
  paragrafosChave: { num: string; resumo: string }[];
  eixosRelacionados: string[];
  linkCompleto?: string;
}

const recomendacoesGerais: RecomendacaoGeral[] = [
  {
    numero: 'RG 23',
    ano: 1997,
    titulo: 'Direitos dos Povos Indígenas',
    tituloOriginal: 'Rights of Indigenous Peoples',
    icon: Users,
    eixosRelacionados: ['Terra e Território', 'Cultura e Patrimônio', 'Participação Social'],
    linkCompleto: 'https://tbinternet.ohchr.org',
    paragrafosChave: [
      { num: '3', resumo: 'Povos indígenas discriminados e privados de direitos, terras e recursos por colonizadores e empresas estatais.' },
      { num: '4(a-e)', resumo: 'Reconhecer cultura, garantir igualdade, desenvolvimento sustentável, participação em decisões e direito a idiomas e tradições.' },
      { num: '5', resumo: 'Reconhecer e proteger direitos sobre terras comunais, territórios e recursos; restituir terras ou compensar justamente.' },
      { num: '6', resumo: 'Incluir nos relatórios periódicos informações completas sobre situação dos povos indígenas.' },
    ]
  },
  {
    numero: 'RG 31',
    ano: 2005,
    titulo: 'Prevenção à Discriminação no Sistema de Justiça Criminal',
    tituloOriginal: 'Prevention of Racial Discrimination in the Administration and Functioning of the Criminal Justice System',
    icon: Scale,
    eixosRelacionados: ['Segurança Pública', 'Legislação e Justiça'],
    linkCompleto: 'https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=INT%2FCERD%2FGEC%2F7503&Lang=en',
    paragrafosChave: [
      { num: '1(a-g)', resumo: 'Indicadores de discriminação racial: vítimas de agressão por policiais, proporção de presos, sentenças mais severas, sub-representação no judiciário.' },
      { num: '4(a)', resumo: 'Lacunas na legislação doméstica: criminalizar disseminação de ideias de superioridade racial, incitação ao ódio e organizações racistas.' },
      { num: '5(a-j)', resumo: 'Estratégias nacionais: eliminar leis discriminatórias, capacitar policiais e juízes, promover representação, respeitar justiça indígena, monitoramento independente.' },
      { num: '20', resumo: 'Prevenir abordagens e prisões baseadas na aparência física, cor ou pertencimento racial (perfilamento racial).' },
      { num: '21', resumo: 'Prevenir e punir severamente violência, tortura e tratamento cruel por agentes do Estado.' },
      { num: '30', resumo: 'Garantir assistência jurídica gratuita, intérpretes e assessoria legal para grupos discriminados.' },
    ]
  },
  {
    numero: 'RG 34',
    ano: 2011,
    titulo: 'Discriminação Racial contra Afrodescendentes',
    tituloOriginal: 'Racial Discrimination against People of African Descent',
    icon: Shield,
    eixosRelacionados: ['Políticas Institucionais', 'Educação', 'Trabalho e Renda', 'Saúde', 'Participação Social'],
    linkCompleto: 'https://tbinternet.ohchr.org',
    paragrafosChave: [
      { num: '4(a-b)', resumo: 'Direito à propriedade e uso de terras tradicionais; direito à identidade cultural, religião e modos de vida.' },
      { num: '10-12', resumo: 'Revisar legislação para eliminar discriminação; implementar estratégias nacionais; garantir cumprimento de legislação existente.' },
      { num: '13-15', resumo: 'Criminalizar disseminação de ideias de superioridade racial, incitação ao ódio; considerar fatores contextuais na qualificação de crimes.' },
      { num: '20', resumo: 'Educar e conscientizar sobre importância de medidas especiais (ações afirmativas).' },
      { num: '28', resumo: 'Integrar diversidade cultural e migração nos currículos de todos os níveis educacionais.' },
      { num: '31', resumo: 'Ação resoluta contra estigmatização e perfilamento racial por policiais, políticos e educadores.' },
      { num: '39', resumo: 'Prevenir uso ilegal de força, tortura e discriminação pela polícia contra afrodescendentes.' },
      { num: '42-46', resumo: 'Garantir participação em decisões, em eleições, em cargos públicos; capacitar funcionários afrodescendentes.' },
      { num: '51-53', resumo: 'Erradicar pobreza, eliminar discriminação no trabalho, promover emprego no setor público e privado.' },
      { num: '58-66', resumo: 'Legislação trabalhista antidiscriminatória; combater segregação habitacional; revisar material didático; reduzir evasão escolar; preservar história e cultura.' },
    ]
  },
  {
    numero: 'RG 35',
    ano: 2013,
    titulo: 'Combate ao Discurso de Ódio Racista',
    tituloOriginal: 'Combating Racist Hate Speech',
    icon: Megaphone,
    eixosRelacionados: ['Legislação e Justiça', 'Educação', 'Cultura e Patrimônio'],
    linkCompleto: 'https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=CERD%2FC%2FGC%2F35&Lang=en',
    paragrafosChave: [
      { num: '29', resumo: 'Liberdade de expressão como ferramenta para articulação de DDHH, desconstrução de estereótipos e intercâmbio intercultural.' },
      { num: '34', resumo: 'Educação sobre história e cultura dos grupos raciais; materiais didáticos que destaquem contribuições de todos os grupos.' },
      { num: '35', resumo: 'Representações equilibradas da história; dias de memória para atrocidades; comissões de verdade e reconciliação.' },
    ]
  },
  {
    numero: 'RG 36',
    ano: 2020,
    titulo: 'Combate ao Perfilamento Racial (Racial Profiling)',
    tituloOriginal: 'Combating Racial Profiling by Law Enforcement Officials',
    icon: Eye,
    eixosRelacionados: ['Segurança Pública', 'Dados e Estatísticas'],
    linkCompleto: 'https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=CERD%2FC%2FGC%2F36&Lang=en',
    paragrafosChave: [
      { num: '35', resumo: 'Uso crescente de tecnologias de reconhecimento facial e vigilância para rastrear grupos demográficos específicos — riscos de discriminação por cor, etnia ou gênero.' },
    ]
  },
  {
    numero: 'RG 37',
    ano: 2024,
    titulo: 'Igualdade no Direito à Saúde',
    tituloOriginal: 'Equality in the Right to Health Free from Racial Discrimination',
    icon: Heart,
    eixosRelacionados: ['Saúde', 'Terra e Território', 'Trabalho e Renda'],
    paragrafosChave: [
      { num: '6', resumo: 'Saúde entendida de forma holística: inclui determinantes sociais, direito à água, alimentação, moradia, educação em saúde e participação em decisões.' },
      { num: '20', resumo: 'Direito a água potável, saneamento, alimentação segura e moradia; proteção contra segregação residencial e desertos alimentares.' },
      { num: '21', resumo: 'Direito a ambiente de trabalho seguro e condições decentes, sem segregação ocupacional ou exposição desigual a riscos.' },
      { num: '22', resumo: 'Direito a ambiente limpo; proteção contra degradação ambiental, mineração e exploração; consentimento livre, prévio e informado para povos indígenas.' },
      { num: '30', resumo: 'Autonomia corporal: consentimento médico, acesso a saúde reprodutiva, proteção contra violência e intervenções forçadas.' },
      { num: '44', resumo: 'Igualdade em saúde sexual e reprodutiva: cobertura universal para prevenir mortalidade materna e discriminação no parto.' },
      { num: '54(c,g)', resumo: 'Obrigação de proteger: regulamentar setor privado de saúde e garantir que degradação ambiental não prejudique grupos raciais.' },
      { num: '61', resumo: 'Estratégias nacionais de saúde em consulta com grupos afetados; medidas especiais para mulheres, crianças, idosos e PcD.' },
      { num: '66-67', resumo: 'Proteção e remédios efetivos contra violações; reparação integral incluindo medidas estruturais.' },
    ]
  },
  {
    numero: 'RG 38',
    ano: 2025,
    titulo: 'Combate à Xenofobia contra Imigrantes',
    tituloOriginal: 'Guidelines on Combating Xenophobia against Immigrants',
    icon: Globe2,
    eixosRelacionados: ['Legislação e Justiça', 'Trabalho e Renda', 'Terra e Território'],
    linkCompleto: 'https://tbinternet.ohchr.org',
    paragrafosChave: [
      { num: '57', resumo: 'Regulamentar condições de trabalho de trabalhadores indígenas migrantes; garantir proteção social, acesso à justiça e reparações em casos de deslocamento forçado.' },
    ]
  },
];

export function RecomendacoesGeraisTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recomendações Gerais do CERD</CardTitle>
          <p className="text-sm text-muted-foreground">
            Parâmetros normativos fundamentais que orientam a análise do cumprimento da ICERD pelo Brasil.
            Cada Recomendação Geral estabelece padrões interpretativos que devem ser considerados no IV Relatório.
          </p>
        </CardHeader>
      </Card>

      <Accordion type="multiple" className="space-y-2">
        {recomendacoesGerais.map((rg) => {
          const Icon = rg.icon;
          return (
            <AccordionItem key={rg.numero} value={rg.numero} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-xs">{rg.numero}</Badge>
                      <span className="text-xs text-muted-foreground">({rg.ano})</span>
                    </div>
                    <h3 className="font-medium text-sm mt-1">{rg.titulo}</h3>
                    <p className="text-xs text-muted-foreground italic">{rg.tituloOriginal}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pb-2">
                  {/* Eixos relacionados */}
                  <div className="flex flex-wrap gap-1">
                    {rg.eixosRelacionados.map((eixo) => (
                      <Badge key={eixo} variant="secondary" className="text-xs">{eixo}</Badge>
                    ))}
                  </div>

                  {/* Parágrafos-chave */}
                  <div className="space-y-2">
                    {rg.paragrafosChave.map((p) => (
                      <div key={p.num} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-xs font-mono font-bold text-primary whitespace-nowrap mt-0.5">§{p.num}</span>
                        <p className="text-sm text-foreground">{p.resumo}</p>
                      </div>
                    ))}
                  </div>

                  {/* Link */}
                  {rg.linkCompleto && (
                    <a
                      href={rg.linkCompleto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver texto completo da {rg.numero}
                    </a>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
