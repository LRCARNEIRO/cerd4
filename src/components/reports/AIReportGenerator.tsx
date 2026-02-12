import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { injectExportToolbar } from '@/utils/reportExportToolbar';

interface AIReportGeneratorProps {
  defaultType?: 'common-core' | 'cerd-iv' | 'tematico' | 'orcamentario';
}

const tipoOptions = [
  { value: 'common-core', label: 'Common Core Document', description: 'Documento básico comum para todos os tratados' },
  { value: 'cerd-iv', label: 'Relatório CERD IV', description: 'Relatório periódico ao Comitê CERD' },
  { value: 'tematico', label: 'Relatório Temático', description: 'Análise por eixo ou grupo focal' },
  { value: 'orcamentario', label: 'Dossiê Orçamentário', description: 'Execução financeira de políticas raciais' },
];

const eixoOptions = [
  { value: 'todos', label: 'Todos os eixos' },
  { value: 'legislacao_justica', label: 'Legislação e Justiça' },
  { value: 'politicas_institucionais', label: 'Políticas Institucionais' },
  { value: 'seguranca_publica', label: 'Segurança Pública' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'trabalho_renda', label: 'Trabalho e Renda' },
  { value: 'terra_territorio', label: 'Terra e Território' },
  { value: 'cultura_patrimonio', label: 'Cultura e Patrimônio' },
];

const grupoOptions = [
  { value: 'todos', label: 'Todos os grupos' },
  { value: 'negros', label: 'População Negra' },
  { value: 'indigenas', label: 'Povos Indígenas' },
  { value: 'quilombolas', label: 'Quilombolas' },
  { value: 'ciganos', label: 'Povos Ciganos' },
  { value: 'juventude_negra', label: 'Juventude Negra' },
  { value: 'mulheres_negras', label: 'Mulheres Negras' },
];

const esferaOptions = [
  { value: 'todas', label: 'Todas as esferas' },
  { value: 'federal', label: 'Federal' },
  { value: 'estadual', label: 'Estadual' },
  { value: 'municipal', label: 'Municipal' },
];

export function AIReportGenerator({ defaultType = 'common-core' }: AIReportGeneratorProps) {
  const [tipo, setTipo] = useState(defaultType);
  const [eixo, setEixo] = useState('todos');
  const [grupo, setGrupo] = useState('todos');
  const [esfera, setEsfera] = useState('todas');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      toast.info('Gerando relatório com IA...', { 
        description: 'A IA está analisando os dados do banco. Isso pode levar 15-30 segundos.',
        duration: 30000 
      });

      // Use fetch directly to get the HTML response properly
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          tipo,
          eixo_tematico: eixo,
          grupo_focal: grupo,
          esfera: esfera
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('429');
        }
        if (response.status === 402) {
          throw new Error('402');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const htmlContent = await response.text();
      
      // Check if it's an error response
      if (htmlContent.startsWith('{') && htmlContent.includes('"error"')) {
        const errorObj = JSON.parse(htmlContent);
        throw new Error(errorObj.error);
      }

      // Open in new window
      const htmlWithToolbar = injectExportToolbar(htmlContent, `Relatorio-IA-${tipo}`);
      const blob = new Blob([htmlWithToolbar], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      if (!newWindow) {
        // If popup blocked, offer download
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${tipo}-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success('Relatório baixado!', {
          description: 'O popup foi bloqueado, então o arquivo foi baixado.'
        });
      } else {
        toast.success('Relatório gerado com sucesso!', {
          description: 'O documento foi aberto em uma nova aba.'
        });
      }

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        toast.error('Limite de requisições excedido', {
          description: 'Aguarde alguns minutos e tente novamente.'
        });
      } else if (error.message?.includes('402')) {
        toast.error('Créditos insuficientes', {
          description: 'Adicione créditos ao workspace para usar a IA.'
        });
      } else {
        toast.error('Erro ao gerar relatório', {
          description: error.message || 'Tente novamente mais tarde.'
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTipo = tipoOptions.find(t => t.value === tipo);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Gerador de Relatórios com IA</CardTitle>
            <CardDescription>
              Gera relatórios técnicos usando exclusivamente os dados do banco
            </CardDescription>
          </div>
        </div>
        <Badge className="w-fit bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
          Lovable AI • Gemini 3 Flash
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tipo de relatório */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Tipo de Relatório</label>
          <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {tipoOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex flex-col">
                    <span>{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtros condicionais */}
        {(tipo === 'tematico' || tipo === 'orcamentario') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Eixo Temático</label>
              <Select value={eixo} onValueChange={setEixo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o eixo" />
                </SelectTrigger>
                <SelectContent>
                  {eixoOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Grupo Focal</label>
              <Select value={grupo} onValueChange={setGrupo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o grupo" />
                </SelectTrigger>
                <SelectContent>
                  {grupoOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {tipo === 'orcamentario' && (
          <div>
            <label className="text-sm font-medium mb-1.5 block">Esfera de Governo</label>
            <Select value={esfera} onValueChange={setEsfera}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a esfera" />
              </SelectTrigger>
              <SelectContent>
                {esferaOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Informação */}
        <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            O relatório será gerado por Inteligência Artificial usando <strong>exclusivamente</strong> os 
            dados armazenados no banco de dados do sistema. Nenhuma informação externa será adicionada.
            A IA não inventa dados - apenas analisa e estrutura as informações existentes.
          </p>
        </div>

        {/* Botão */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando com IA...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar {selectedTipo?.label}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
