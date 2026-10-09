# Project decisions

- The Sources directory preserves exact source labels per base (normative document titles where no source field exists), including URL-less entries; institution grouping and access-portal counts are separate projections, so publications are never collapsed into their delivery portal.

- Collect tab-mounted exports by activating their tabs in an isolated iframe and waiting for export registration before assembling “Baixar tudo”; inactive Radix tab content is not mounted, so reading only the current page registry silently omits those reports.
- Recommendation compliance status is always the live sensor result: LiveStatusSync (mounted in App) overlays it on cached lacunas data and persists diffs when permitted; reports must never rely on the stored status alone, because it goes stale when evidence links change.
- Impact-indicator reading direction and trend come from the audited canonical table (src/data/leituraImpactoV20.ts via utils/leituraCanonica), which overrides the name-based polarity heuristic in tendenciaPadronizada and evaluateIndicador; the audited multi-group/parity method cannot be reproduced from a single series value.
