import { generateTabReportHTML } from '@/utils/generateTabReportHTML';

export function generateFollowUpHTML(): string {
  return generateTabReportHTML({
    title: 'Follow-up 2026 — CERD/C/BRA/FCO/18-20',
    subtitle: 'Informações recebidas do Brasil sobre o acompanhamento das observações finais',
    fileName: 'Follow-Up-CERD-2026',
    content: `
      <h2>Parágrafos de "particular importância" (§68)</h2>
      <p>O Comitê solicitou resposta prioritária sobre os seguintes parágrafos:</p>
      <table>
        <tr><th>Parágrafo</th><th>Tema</th></tr>
        <tr><td style="font-family:monospace">§17(a)</td><td>Direito à saúde e efeitos da COVID-19</td></tr>
        <tr><td style="font-family:monospace">§19(c)</td><td>Disparidades no acesso à educação</td></tr>
        <tr><td style="font-family:monospace">§23(a)</td><td>Pobreza, trabalho e renda</td></tr>
        <tr><td style="font-family:monospace">§36(a-d)</td><td>Uso excessivo de força por agentes da lei</td></tr>
      </table>

      <div class="highlight-box" style="margin-top:0.5cm">
        <h4>⏰ Prazo e Submissão</h4>
        <p>O Brasil deveria ter respondido em 1 ano (até dez/2023). A resposta foi submetida em janeiro de 2026 (CERD/C/BRA/FCO/18-20).</p>
      </div>

      <h2>Destaque: Ministério da Igualdade Racial</h2>
      <p>O MIR desempenha papel estratégico na formulação e implementação de políticas públicas de promoção da igualdade racial. Principais marcos regulatórios:</p>
      <ul>
        <li>✅ Programa Juventude Negra Viva (Decreto 11.956/2024)</li>
        <li>✅ Programa Federal de Ações Afirmativas (Decreto 11.785/2023)</li>
        <li>✅ PNGTAQ — Política Nacional de Gestão Territorial Quilombola (Decreto 11.786/2023)</li>
      </ul>
    `,
  });
}
