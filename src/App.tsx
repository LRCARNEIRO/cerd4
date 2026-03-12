import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import PlanoTrabalho from "./pages/PlanoTrabalho";
import CommonCore from "./pages/CommonCore";
import Estatisticas from "./pages/Estatisticas";
import Orcamento from "./pages/Orcamento";
import OrcamentoTeste from "./pages/OrcamentoTeste";
import Recomendacoes from "./pages/Recomendacoes";
import Fontes from "./pages/Fontes";

import Conclusoes from "./pages/Conclusoes";
import GerarRelatorios from "./pages/GerarRelatorios";
import Normativa from "./pages/Normativa";
import DocumentosBalizadores from "./pages/DocumentosBalizadores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/plano-trabalho" element={<PlanoTrabalho />} />
          <Route path="/common-core" element={<CommonCore />} />
          <Route path="/estatisticas" element={<Estatisticas />} />
          <Route path="/orcamento" element={<Orcamento />} />
          <Route path="/orcamento-teste" element={<OrcamentoTeste />} />
          <Route path="/recomendacoes" element={<Recomendacoes />} />
          <Route path="/fontes" element={<Fontes />} />
          <Route path="/grupos-focais" element={<GruposFocais />} />
          <Route path="/conclusoes" element={<Conclusoes />} />
          <Route path="/gerar-relatorios" element={<GerarRelatorios />} />
          <Route path="/normativa" element={<Normativa />} />
          <Route path="/documentos-balizadores" element={<DocumentosBalizadores />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
