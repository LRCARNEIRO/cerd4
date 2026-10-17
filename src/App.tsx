import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { EntregaProvider } from "@/components/entrega/EntregaContext";
import { LiveStatusSync } from "@/components/LiveStatusSync";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { EntregaRouter } from "@/components/entrega/EntregaPaginas";

const Index = lazyWithRetry(() => import("./pages/Index"));
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
const AuthPage = lazyWithRetry(() => import("./pages/Auth"));


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
        <AuthProvider>
          <LiveStatusSync />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/ecossistema" element={<Ecossistema />} />
              <Route path="/plano-trabalho" element={<Navigate to="/" replace />} />
              <Route path="/common-core" element={<Navigate to="/" replace />} />
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
              {/* Entrega: roteador keep-alive — telas visitadas ficam montadas e a próxima pré-carrega. */}
              <Route path="/entregaMIR/*" element={<EntregaProvider><EntregaRouter /></EntregaProvider>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
