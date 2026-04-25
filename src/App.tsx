import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const Index = lazy(() => import("./pages/Index"));
const CommonCore = lazy(() => import("./pages/CommonCore"));
const Estatisticas = lazy(() => import("./pages/Estatisticas"));
const Orcamento = lazy(() => import("./pages/Orcamento"));
const Recomendacoes = lazy(() => import("./pages/Recomendacoes"));
const Fontes = lazy(() => import("./pages/Fontes"));
const Conclusoes = lazy(() => import("./pages/Conclusoes"));
const GerarRelatorios = lazy(() => import("./pages/GerarRelatorios"));
const Normativa = lazy(() => import("./pages/Normativa"));
const DocumentosBalizadores = lazy(() => import("./pages/DocumentosBalizadores"));
const GuiaAuditoria = lazy(() => import("./pages/GuiaAuditoria"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Ecossistema = lazy(() => import("./pages/Ecossistema"));
const Artigos = lazy(() => import("./pages/Artigos"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min — evita refetch a cada navegação
      gcTime: 30 * 60 * 1000, // 30 min em memória
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/ecossistema" element={<Ecossistema />} />
            <Route path="/plano-trabalho" element={<Navigate to="/" replace />} />
            <Route path="/common-core" element={<CommonCore />} />
            <Route path="/estatisticas" element={<Estatisticas />} />
            <Route path="/orcamento" element={<Orcamento />} />
            <Route path="/recomendacoes" element={<Recomendacoes />} />
            <Route path="/fontes" element={<Fontes />} />
            <Route path="/grupos-focais" element={<Navigate to="/estatisticas" replace />} />
            <Route path="/conclusoes" element={<Conclusoes />} />
            <Route path="/gerar-relatorios" element={<GerarRelatorios />} />
            <Route path="/normativa" element={<Normativa />} />
            <Route path="/documentos-balizadores" element={<DocumentosBalizadores />} />
            <Route path="/guia-auditoria" element={<GuiaAuditoria />} />
            <Route path="/artigos" element={<Artigos />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
