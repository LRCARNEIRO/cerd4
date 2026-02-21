const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Fetch ALL RREO Anexo 02 items for BA 2023 bim 6
    const allItems: Record<string, unknown>[] = [];
    let offset = 0;
    while (offset < 10000) {
      const u = `https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo?an_exercicio=2023&id_ente=29&nr_periodo=6&no_anexo=RREO-Anexo%2002&co_tipo_demonstrativo=RREO&$limit=5000&$offset=${offset}`;
      const r = await fetch(u, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30000) });
      const d = await r.json();
      const items = d?.items ?? [];
      allItems.push(...items);
      if (items.length < 5000) break;
      offset += 5000;
    }
    
    // Get all unique conta values
    const uniqueContas = [...new Set(allItems.map((i: Record<string, unknown>) => String(i.conta ?? "")))];
    
    // Filter for racial/ethnic keywords in ALL conta values
    const racialContas = uniqueContas.filter(c => {
      const cl = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return cl.includes("racial") || cl.includes("negro") || cl.includes("negra") || cl.includes("quilombo") || cl.includes("indigen") || 
             cl.includes("igualdade") || cl.includes("cidadania") || cl.includes("etnic") || cl.includes("afro") || 
             cl.includes("palmares") || cl.includes("422") || cl.includes("cigan") || cl.includes("terreiro") ||
             cl.includes("candomble") || cl.includes("umbanda") || cl.includes("matriz africana") || cl.includes("tradiciona");
    });

    return new Response(JSON.stringify({
      total_items: allItems.length,
      unique_contas: uniqueContas.length,
      all_contas: uniqueContas,
      racial_contas: racialContas,
    }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "err" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
