import { lazy, Suspense, ComponentType } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";


/**
 * Após um novo deploy, o HTML em cache pode apontar para chunks que não existem mais.
 * Nesse caso recarregamos a página uma única vez para buscar o manifesto atualizado.
 */
const RELOAD_KEY = "chunk-reload-attempt";

function lazyWithRetry<T extends ComponentType<unknown>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const mod = await factory();
      window.sessionStorage.removeItem(RELOAD_KEY);
      return mod;
    } catch (error) {
      if (!window.sessionStorage.getItem(RELOAD_KEY)) {
        window.sessionStorage.setItem(RELOAD_KEY, "1");
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}

const Index = lazyWithRetry(() => import("./pages/Index"));
const CommonCore = lazyWithRetry(() => import("./pages/CommonCore"));
const Estatisticas = lazyWithRetry(() => import("./pages/Estatisticas"));
const Orcamento = lazyWithRetry(() => import("./pages/Orcamento"));
const Recomendacoes = lazyWithRetry(() => import("./pages/Recomendacoes"));
const Fontes = lazyWithRetry(() => import("./pages/Fontes"));
const Conclusoes = lazyWithRetry(() => import("./pages/Conclusoes"));
const GerarRelatorios = lazyWithRetry(() => import("./pages/GerarRelatorios"));
const Normativa = lazyWithRetry(() => import("./pages/Normativa"));
const DocumentosBalizadores = lazyWithRetry(() => import("./pages/DocumentosBalizadores"));
const GuiaAuditoria = lazyWithRetry(() => import("./pages/GuiaAuditoria"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const Ecossistema = lazyWithRetry(() => import("./pages/Ecossistema"));
const Artigos = lazyWithRetry(() => import("./pages/Artigos"));
const Busca = lazyWithRetry(() => import("./pages/Busca"));

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
            <Route path="/busca" element={<Busca />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
