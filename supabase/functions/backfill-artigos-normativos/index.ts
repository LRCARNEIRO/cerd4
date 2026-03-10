import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function inferArtigos(doc: { titulo: string; categoria: string; secoes_impactadas?: string[] | null }): string[] {
  const arts = new Set<string>();

  // Eixo → Artigos mapping
  const EIXO_MAP: Record<string, string[]> = {
    legislacao_justica: ['I', 'II', 'VI'],
    politicas_institucionais: ['II'],
    seguranca_publica: ['V', 'VI'],
    saude: ['V'],
    educacao: ['V', 'VII'],
    trabalho_renda: ['V'],
    terra_territorio: ['III', 'V'],
    cultura_patrimonio: ['V', 'VII'],
    participacao_social: ['V'],
    dados_estatisticas: ['I', 'II'],
  };

  (doc.secoes_impactadas || []).forEach(eixo => {
    const mapped = EIXO_MAP[eixo];
    if (mapped) mapped.forEach(a => arts.add(a));
  });

  // Categoria
  if (doc.categoria === 'legislacao') { arts.add('I'); arts.add('II'); }
  if (doc.categoria === 'institucional') { arts.add('II'); }
  if (doc.categoria === 'politicas') { arts.add('II'); arts.add('V'); }
  if (doc.categoria === 'jurisprudencia') { arts.add('VI'); }

  // Keywords no título
  const t = doc.titulo.toLowerCase();
  if (t.match(/educa|escola|ensino|formação|formacao|lei 10.639|lei 11.645/)) { arts.add('V'); arts.add('VII'); }
  if (t.match(/saúde|saude|sus|sanitár|sanitar|sesai/)) arts.add('V');
  if (t.match(/trabalho|emprego|renda|profissional|clt/)) arts.add('V');
  if (t.match(/terra|territór|territor|quilomb|funai|incra|demarcaç|demarcac|indígena|indigena/)) { arts.add('III'); arts.add('V'); }
  if (t.match(/justiça|justica|judiciár|judiciar|proteç|protecao|reparaç|reparac|indeniza|tribunal|stf|stj|adpf/)) arts.add('VI');
  if (t.match(/cultur|patrimôn|patrimon|capoeira|candomblé|candomble|matriz africana/)) { arts.add('V'); arts.add('VII'); }
  if (t.match(/igualdade|discrimin|racis|racismo|antirrac|preconceito|injúria|injuria/)) { arts.add('I'); arts.add('II'); }
  if (t.match(/segurança|seguranca|polícia|policia|homicíd|homicid|violência|violencia|letal|genocíd|genocid/)) { arts.add('V'); arts.add('VI'); }
  if (t.match(/polític|politica|institucional|ação afirmativa|acao afirmativa|cota|conselho|comissão|comissao|órgão|orgao/)) arts.add('II');
  if (t.match(/ódio|odio|propaganda|extremism|neonazi|supremaci/)) arts.add('IV');
  if (t.match(/segregaç|segregac|apartheid|favela|periferi/)) arts.add('III');
  if (t.match(/moradia|habitaç|habitac|urban/)) arts.add('V');
  if (t.match(/participaç|participac|voto|eleitor|representaç|representac/)) arts.add('V');
  if (t.match(/mulher|gênero|genero|lgbtqia|interseccion/)) arts.add('V');
  if (t.match(/dado|estatístic|estatistic|censo|ibge|pesquisa|indicador/)) { arts.add('I'); arts.add('II'); }
  if (t.match(/cigano|romani|povo de terreiro|comunidade tradicional/)) { arts.add('II'); arts.add('V'); }
  if (t.match(/tortura|corpo de delito/)) { arts.add('V'); arts.add('VI'); }
  if (t.match(/migra|refug|apátrida|apatrida/)) { arts.add('I'); arts.add('V'); }
  if (t.match(/digital|internet|online|tecnolog/)) arts.add('IV');
  if (t.match(/licitaç|licitac/)) arts.add('V');

  if (arts.size === 0) arts.add('II');
  return [...arts].sort();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: docs, error } = await supabase
      .from('documentos_normativos')
      .select('id, titulo, categoria, secoes_impactadas, artigos_convencao');
    
    if (error) throw error;

    let updated = 0;
    for (const doc of (docs || [])) {
      const artigos = inferArtigos(doc);
      const current = doc.artigos_convencao || [];
      
      // Only update if different
      if (JSON.stringify(current.sort()) !== JSON.stringify(artigos)) {
        const { error: updateErr } = await supabase
          .from('documentos_normativos')
          .update({ artigos_convencao: artigos })
          .eq('id', doc.id);
        if (!updateErr) updated++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total: (docs || []).length,
      updated,
      message: `${updated} documentos atualizados com artigos ICERD.`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
