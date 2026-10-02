# Project decisions

- Collect tab-mounted exports by activating their tabs in an isolated iframe and waiting for export registration before assembling “Baixar tudo”; inactive Radix tab content is not mounted, so reading only the current page registry silently omits those reports.
- Recommendation compliance status is always the live sensor result: LiveStatusSync (mounted in App) overlays it on cached lacunas data and persists diffs when permitted; reports must never rely on the stored status alone, because it goes stale when evidence links change.
