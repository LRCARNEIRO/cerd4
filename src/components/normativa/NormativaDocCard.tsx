import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, FileText, Globe, Trash2, Scale, Building2, FileCheck, BookOpen } from 'lucide-react';
import { EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const categoriaConfig: Record<string, { label: string; icon: typeof Scale; color: string }> = {
  legislacao: { label: 'Legislação Antidiscriminatória', icon: Scale, color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  institucional: { label: 'Estrutura Institucional', icon: Building2, color: 'bg-green-500/10 text-green-700 border-green-200' },
  politicas: { label: 'Políticas Públicas', icon: FileCheck, color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  jurisprudencia: { label: 'Jurisprudência', icon: BookOpen, color: 'bg-amber-500/10 text-amber-700 border-amber-200' },
};

interface NormativaDocCardProps {
  doc: {
    id: string;
    titulo: string;
    categoria: string;
    status: string;
    url_origem?: string | null;
    tipo_arquivo?: string | null;
    tamanho?: string | null;
    created_at: string;
    total_itens_extraidos?: number | null;
    metas_impactadas?: string[] | null;
    recomendacoes_impactadas?: string[] | null;
    secoes_impactadas?: string[] | null;
    artigos_convencao?: string[] | null;
    resumo_impacto?: any;
  };
  onDelete: (doc: any) => void;
}

export function NormativaDocCard({ doc, onDelete }: NormativaDocCardProps) {
  const catConfig = categoriaConfig[doc.categoria] || categoriaConfig.legislacao;
  const CatIcon = catConfig.icon;

  // Build racial focus summary from resumo_impacto or fallback to recommendations
  const resumoRacial = doc.resumo_impacto?.resumo_racial
    || doc.resumo_impacto?.descricao
    || buildRacialSummary(doc);

  return (
    <Card className="hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: `var(--${doc.categoria === 'legislacao' ? 'blue' : doc.categoria === 'institucional' ? 'green' : doc.categoria === 'politicas' ? 'purple' : 'amber'}-indicator, hsl(var(--primary)))` }}>
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header: title + actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0 mt-0.5">
              {doc.url_origem ? <Globe className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm leading-tight">{doc.titulo}</h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                {doc.tipo_arquivo && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{doc.tipo_arquivo.toUpperCase()}</Badge>
                )}
                <Badge variant={doc.status === 'processado' ? 'default' : 'secondary'} className={`text-[10px] px-1.5 py-0 ${doc.status === 'processado' ? 'bg-green-500' : ''}`}>
                  {doc.status === 'processado' ? 'Processado' : 'Pendente'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {doc.url_origem && (
              <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                <a href={doc.url_origem} target="_blank" rel="noopener noreferrer" title="Acessar documento na íntegra">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => { e.stopPropagation(); onDelete(doc); }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tags row: categoria + metas + artigos ICERD */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className={`text-[10px] gap-1 ${catConfig.color}`}>
            <CatIcon className="w-3 h-3" />
            {catConfig.label}
          </Badge>
          {doc.metas_impactadas?.map((m) => (
            <Badge key={m} className="text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              {m}
            </Badge>
          ))}
          {deriveArtigosFromDoc(doc).map((art) => (
            <Badge key={art} variant="outline" className="text-[10px] font-bold border-accent bg-accent/10 text-accent-foreground">
              Art. {art}
            </Badge>
          ))}
        </div>

        {/* Racial focus summary */}
        {resumoRacial && (
          <div className="bg-muted/50 rounded-md p-2.5 text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Enfoque racial: </span>
            {resumoRacial}
          </div>
        )}

        {/* Recommendations tags */}
        {doc.recomendacoes_impactadas && doc.recomendacoes_impactadas.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recomendações CERD respondidas:</span>
            <div className="flex flex-wrap gap-1">
              {doc.recomendacoes_impactadas.map((r) => (
                <Badge key={r} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Thematic axes */}
        {doc.secoes_impactadas && doc.secoes_impactadas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {doc.secoes_impactadas.map((s) => (
              <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/30">
                {formatEixo(s)}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatEixo(eixo: string): string {
  const map: Record<string, string> = {
    legislacao_justica: 'Legislação/Justiça',
    politicas_institucionais: 'Políticas Institucionais',
    seguranca_publica: 'Segurança Pública',
    saude: 'Saúde',
    educacao: 'Educação',
    trabalho_renda: 'Trabalho/Renda',
    terra_territorio: 'Terra/Território',
    cultura_patrimonio: 'Cultura/Patrimônio',
    participacao_social: 'Participação Social',
    dados_estatisticas: 'Dados/Estatísticas',
  };
  return map[eixo] || eixo;
}

function buildRacialSummary(doc: any): string | null {
  const parts: string[] = [];
  if (doc.recomendacoes_impactadas?.length) {
    parts.push(`Responde a ${doc.recomendacoes_impactadas.length} recomendação(ões) do CERD`);
  }
  if (doc.secoes_impactadas?.length) {
    const eixos = doc.secoes_impactadas.map((s: string) => formatEixo(s)).join(', ');
    parts.push(`nos eixos de ${eixos}`);
  }
  if (doc.total_itens_extraidos && doc.total_itens_extraidos > 0) {
    parts.push(`com ${doc.total_itens_extraidos} itens extraídos`);
  }
  return parts.length > 0 ? parts.join(' ') + '.' : null;
}

/** Derive ICERD articles from document's thematic axes (secoes_impactadas) */
function deriveArtigosFromDoc(doc: any): ArtigoConvencao[] {
  const eixos: string[] = doc.secoes_impactadas || [];
  const artigos = new Set<ArtigoConvencao>();
  eixos.forEach(eixo => {
    const mapped = EIXO_PARA_ARTIGOS[eixo as keyof typeof EIXO_PARA_ARTIGOS];
    if (mapped) mapped.forEach(a => artigos.add(a));
  });
  return [...artigos].sort();
}
