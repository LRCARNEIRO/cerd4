const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const { paths } = await req.json().catch(() => ({ paths: [] }));
  const apiKey = Deno.env.get("PORTAL_TRANSPARENCIA_API_KEY")!;
  const out: Record<string, unknown> = {};
  for (const p of paths as string[]) {
    try {
      const res = await fetch(`https://api.portaldatransparencia.gov.br/api-de-dados${p}`, {
        headers: { "chave-api-dados": apiKey, Accept: "application/json" },
      });
      const txt = await res.text();
      out[p] = { status: res.status, sample: txt.slice(0, 900) };
    } catch (e) {
      out[p] = { error: String(e) };
    }
    await new Promise(r => setTimeout(r, 300));
  }
  return new Response(JSON.stringify(out, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
