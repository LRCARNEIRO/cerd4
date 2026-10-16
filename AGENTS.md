# Project decisions

- Dashboard budget charts split the canonical inventory by tipo_dotacao before yearly aggregation; LOA shows authorized, committed, liquidated and paid amounts, while extra-LOA shows paid amounts separately to avoid implying an execution rate.

- Indicator title corrections preserve UUIDs and short codes; legacy labels resolve through indicadorAliases, including fixed-card measurements, so renaming never recreates records or evidence links.

- The Sources directory preserves exact source labels per base (normative titles where no source field exists) and counts independently from its portal-grouped card projection; cards contain only registered portals and individual source URLs, while URL-less references remain in the inventory and counts, so presentation never deletes inventory references.
- Sources XLSX exports use the complete live catalog and canonical statistical evidence roll, not active screen filters; separate source, unique-address and evidence-association sheets preserve distinct counting units and clickable URLs.
- Source-export dates use documented metadata only: created_at/updated_at describe current system records, never source publication or collection; aggregate sheets show ranges and the evidence sheet preserves individual timestamps, preventing false provenance claims.

- Collect tab-mounted exports by activating their tabs in an isolated iframe and waiting for export registration before assembling “Baixar tudo”; inactive Radix tab content is not mounted, so reading only the current page registry silently omits those reports.
- Recommendation compliance status is always the live sensor result: LiveStatusSync (mounted in App) overlays it on cached lacunas data and persists diffs when permitted; reports must never rely on the stored status alone, because it goes stale when evidence links change.
- Impact-indicator reading direction and trend come from the audited canonical table (src/data/leituraImpactoV20.ts via utils/leituraCanonica), which overrides the name-based polarity heuristic in tendenciaPadronizada and evaluateIndicador; the audited multi-group/parity method cannot be reproduced from a single series value.
- The delivery site (/entrega) reuses the live pages inside EntregaProvider, which only swaps DashboardLayout's sidebar; never copy data or fork page logic, so the delivery always matches the system.
- Inside /entrega, internal links to full-system pages are translated to their /entrega equivalents only at click time (EntregaProvider); stored URLs, reports and spreadsheets are never rewritten, so the full system and exported links keep working.
- The delivery (/entrega) uses EntregaRouter/EntregaPaginas: every visited page stays mounted (display:none when inactive) and the next page in ENTREGA_SEQUENCIA is pre-mounted during idle; data reuse relies on the React Query cache. Do not force remounts on route change or duplicate data loading, or the keep-alive/prefetch speedup is lost.
- Delivery reading scale: /entrega content renders with CSS zoom 1.15 (DashboardLayout wrapper and EntregaCapa), with width/height compensated by calc(100%/1.15) so nothing overflows; keep any future entrega styling consistent with this zoom.
