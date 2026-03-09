const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkResult {
  url: string;
  status: number | null;
  ok: boolean;
  latencyMs: number;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json() as { urls: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'urls array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit to 30 URLs per request to avoid timeouts
    const batch = urls.slice(0, 30);

    const results: LinkResult[] = await Promise.all(
      batch.map(async (url): Promise<LinkResult> => {
        const start = Date.now();
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
              'User-Agent': 'CERD-IV-HealthCheck/1.0 (auditing deep links for UN treaty body report)',
            },
            redirect: 'follow',
          });

          clearTimeout(timeout);
          const latencyMs = Date.now() - start;

          // Some servers reject HEAD, retry with GET
          if (response.status === 405 || response.status === 403) {
            const getResponse = await fetch(url, {
              method: 'GET',
              signal: AbortSignal.timeout(10000),
              headers: {
                'User-Agent': 'CERD-IV-HealthCheck/1.0',
              },
              redirect: 'follow',
            });
            // Consume body to avoid leak
            await getResponse.text();
            return {
              url,
              status: getResponse.status,
              ok: getResponse.ok,
              latencyMs: Date.now() - start,
            };
          }

          return {
            url,
            status: response.status,
            ok: response.ok,
            latencyMs,
          };
        } catch (err) {
          return {
            url,
            status: null,
            ok: false,
            latencyMs: Date.now() - start,
            error: err instanceof Error ? err.message : 'Unknown error',
          };
        }
      })
    );

    const summary = {
      total: results.length,
      ok: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      checkedAt: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({ success: true, summary, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error checking deep links:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
