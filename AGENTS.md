# Project decisions

- Collect tab-mounted exports by activating their tabs in an isolated iframe and waiting for export registration before assembling “Baixar tudo”; inactive Radix tab content is not mounted, so reading only the current page registry silently omits those reports.
