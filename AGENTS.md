# Project decisions

- The Sources directory preserves exact source labels per base (normative titles where no source field exists) and counts independently from its portal-grouped card projection; cards contain only registered portals and individual source URLs, while URL-less references remain in the inventory and counts, so presentation never deletes inventory references.
- Sources XLSX exports use the complete live catalog and canonical statistical evidence roll, not active screen filters; separate source, unique-address and evidence-association sheets preserve distinct counting units and clickable URLs.
- Source-export dates use documented metadata only: created_at/updated_at describe current system records, never source publication or collection; aggregate sheets show ranges and the evidence sheet preserves individual timestamps, preventing false provenance claims.

- Collect tab-mounted exports by activating their tabs in an isolated iframe and waiting for export registration before assembling “Baixar tudo”; inactive Radix tab content is not mounted, so reading only the current page registry silently omits those reports.
- Recommendation compliance status is always the live sensor result: LiveStatusSync (mounted in App) overlays it on cached lacunas data and persists diffs when permitted; reports must never rely on the stored status alone, because it goes stale when evidence links change.
- Impact-indicator reading direction and trend come from the audited canonical table (src/data/leituraImpactoV20.ts via utils/leituraCanonica), which overrides the name-based polarity heuristic in tendenciaPadronizada and evaluateIndicador; the audited multi-group/parity method cannot be reproduced from a single series value.
