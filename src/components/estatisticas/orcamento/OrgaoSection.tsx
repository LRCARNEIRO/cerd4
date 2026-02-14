import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ExternalLink } from 'lucide-react';
import { ProgramCard } from './ProgramCard';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

// Map orgao codes to full names and deep links
const orgaoMeta: Record<string, { nome: string; fontes: { nome: string; url: string }[] }> = {
  MIR: {
    nome: 'Ministério da Igualdade Racial',
    fontes: [
      { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' },
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2023&ate=31%2F12%2F2026&orgaos=OS67000' },
    ],
  },
  MPI: {
    nome: 'Ministério dos Povos Indígenas',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2023&ate=31%2F12%2F2026&orgaos=OS92000' },
    ],
  },
  FUNAI: {
    nome: 'Fundação Nacional dos Povos Indígenas',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=UO37201' },
    ],
  },
  INCRA: {
    nome: 'Instituto Nacional de Colonização e Reforma Agrária',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=UO22201' },
    ],
  },
  SESAI: {
    nome: 'Secretaria Especial de Saúde Indígena',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=UO36901' },
    ],
  },
  'MPI/FUNAI': {
    nome: 'Ministério dos Povos Indígenas / FUNAI',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS52000' },
    ],
  },
  MEC: {
    nome: 'Ministério da Educação',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS26000' },
    ],
  },
  MS: {
    nome: 'Ministério da Saúde',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS36000' },
    ],
  },
  MDS: {
    nome: 'Ministério do Desenvolvimento e Assistência Social',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS55000' },
    ],
  },
  MJSP: {
    nome: 'Ministério da Justiça e Segurança Pública',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS30000' },
    ],
  },
  MDHC: {
    nome: 'Ministério dos Direitos Humanos e Cidadania',
    fontes: [
      { nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS44000' },
    ],
  },
};

interface OrgaoSectionProps {
  orgao: string;
  programas: Map<string, DadoOrcamentario[]>;
}

export function OrgaoSection({ orgao, programas }: OrgaoSectionProps) {
  const meta = orgaoMeta[orgao];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">{meta?.nome || orgao}</h3>
          <Badge variant="outline" className="text-xs">{orgao}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {meta?.fontes.map(f => (
            <a
              key={f.nome}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {f.nome} <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {Array.from(programas.entries()).map(([prog, registros]) => (
          <ProgramCard key={prog} programa={prog} registros={registros} />
        ))}
      </div>
    </div>
  );
}
