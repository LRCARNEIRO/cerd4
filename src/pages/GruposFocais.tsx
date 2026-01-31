import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { focalGroups } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function GruposFocais() {
  return (
    <DashboardLayout
      title="Grupos Focais"
      subtitle="Povos e comunidades tradicionais - Monitoramento específico"
    >
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <Users className="w-8 h-8 mb-2 text-primary-foreground/80" />
            <p className="text-sm text-primary-foreground/80">Quilombolas</p>
            <p className="text-2xl font-bold">1.327.802</p>
            <p className="text-xs text-primary-foreground/60">Censo 2022</p>
          </CardContent>
        </Card>
        <Card className="bg-accent text-accent-foreground">
          <CardContent className="pt-6">
            <Users className="w-8 h-8 mb-2 text-accent-foreground/80" />
            <p className="text-sm text-accent-foreground/80">Indígenas</p>
            <p className="text-2xl font-bold">1.693.535</p>
            <p className="text-xs text-accent-foreground/60">Censo 2022</p>
          </CardContent>
        </Card>
        <Card className="bg-warning text-warning-foreground">
          <CardContent className="pt-6">
            <AlertTriangle className="w-8 h-8 mb-2 text-warning-foreground/80" />
            <p className="text-sm text-warning-foreground/80">Ciganos/Roma</p>
            <p className="text-2xl font-bold">S/D</p>
            <p className="text-xs text-warning-foreground/60">Lacuna crítica</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Users className="w-8 h-8 mb-2 text-destructive" />
            <p className="text-sm text-muted-foreground">Juventude Negra (15-29)</p>
            <p className="text-2xl font-bold">~25 milhões</p>
            <p className="text-xs text-muted-foreground">Grupo prioritário</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {focalGroups.map(group => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {group.nome}
              </CardTitle>
              {group.populacao ? (
                <p className="text-sm text-muted-foreground">
                  População: {group.populacao.toLocaleString('pt-BR')} ({group.fontePopulacao})
                </p>
              ) : (
                <p className="text-sm text-warning">
                  ⚠️ {group.fontePopulacao}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {/* Parágrafos ONU */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Parágrafos ONU relacionados:</p>
                <div className="flex flex-wrap gap-1">
                  {group.observacoesONU.map(p => (
                    <Badge key={p} variant="outline">§{p}</Badge>
                  ))}
                </div>
              </div>

              {/* Políticas Específicas */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Políticas específicas:</p>
                <ul className="space-y-1">
                  {group.politicasEspecificas.map((pol, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <FileText className="w-4 h-4 text-primary mt-0.5" />
                      {pol}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Indicadores */}
              {group.indicadoresEspecificos.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Indicadores de monitoramento:</p>
                  <div className="flex flex-wrap gap-1">
                    {group.indicadoresEspecificos.map((ind, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {ind}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Special Section - Quilombolas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Situação Territorial - Quilombolas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Territórios Titulados</p>
              <p className="text-3xl font-bold text-success">185</p>
              <Progress value={15} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">15% do total identificado</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Em Processo</p>
              <p className="text-3xl font-bold text-warning">1.200+</p>
              <Progress value={60} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">60% em fases iniciais</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Comunidades Certificadas (FCP)</p>
              <p className="text-3xl font-bold">3.500+</p>
              <p className="text-xs text-muted-foreground mt-1">Fundação Cultural Palmares</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                INCRA - Quilombolas
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.palmares.gov.br/?page_id=37551" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Certidões FCP
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Special Section - Indigenous */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Situação Territorial - Povos Indígenas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Terras Homologadas</p>
              <p className="text-3xl font-bold text-success">487</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Etnias Identificadas</p>
              <p className="text-3xl font-bold">305</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Línguas</p>
              <p className="text-3xl font-bold">274</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Área Total (ha)</p>
              <p className="text-3xl font-bold">117 mi</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-sm font-medium text-warning">Marco Temporal</p>
            <p className="text-sm text-foreground mt-1">
              O julgamento do STF sobre o Marco Temporal (Tema 1031) impacta diretamente a demarcação 
              de terras indígenas. Situação em acompanhamento para o relatório CERD.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/demarcacao-de-terras-indigenas" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                FUNAI - Demarcação
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lacunas */}
      <Card className="mt-6 border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Lacunas Críticas Identificadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="font-medium">Ciganos/Roma</p>
              <p className="text-sm text-muted-foreground">
                Não há dados populacionais oficiais. O Censo 2022 não incluiu pergunta específica. 
                O CERD destacou preocupação com essa lacuna (§54-55).
              </p>
            </li>
            <li className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <p className="font-medium">Comunidades Tradicionais de Matriz Africana</p>
              <p className="text-sm text-muted-foreground">
                Dados fragmentados sobre terreiros e comunidades de matriz africana. 
                Necessário mapeamento atualizado.
              </p>
            </li>
            <li className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <p className="font-medium">Refugiados por Raça/Etnia</p>
              <p className="text-sm text-muted-foreground">
                CONARE não publica dados desagregados por raça/cor dos refugiados reconhecidos no Brasil.
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
