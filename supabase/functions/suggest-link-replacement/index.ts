const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface Suggestion {
  title: string;
  url: string;
  description: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brokenUrl, indicador, fonte, descricao } = await req.json();

    if (!brokenUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'brokenUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract domain from broken URL for targeted search
    let domain = '';
    try {
      domain = new URL(brokenUrl).hostname;
    } catch { /* ignore */ }

    // Build a search query combining the indicator context with the source domain
    const searchQuery = `site:${domain} ${indicador || ''} ${descricao || ''} dados`.trim();
    console.log('Searching for replacement:', searchQuery);

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        limit: 5,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl search error:', data);

      // If site-specific search fails, try broader search
      const fallbackQuery = `${fonte || ''} ${indicador || ''} ${descricao || ''} dados oficiais Brasil`.trim();
      console.log('Fallback search:', fallbackQuery);

      const fallbackResponse = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: fallbackQuery,
          limit: 5,
        }),
      });

      const fallbackData = await fallbackResponse.json();
      if (!fallbackResponse.ok) {
        return new Response(
          JSON.stringify({ success: false, error: 'Search failed', suggestions: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const suggestions: Suggestion[] = (fallbackData.data || []).map((r: any) => ({
        title: r.title || 'Sem título',
        url: r.url,
        description: r.description || '',
      }));

      return new Response(
        JSON.stringify({ success: true, suggestions, searchQuery: fallbackQuery }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const suggestions: Suggestion[] = (data.data || []).map((r: any) => ({
      title: r.title || 'Sem título',
      url: r.url,
      description: r.description || '',
    }));

    return new Response(
      JSON.stringify({ success: true, suggestions, searchQuery }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error suggesting replacement:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
