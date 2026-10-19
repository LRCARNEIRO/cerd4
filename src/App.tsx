import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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

/** O endereço antigo da entrega (/entrega) continua válido: leva a /entregaMIR preservando a aba aberta. */
const EntregaRedirect = () => {
  const { pathname, search, hash } = useLocation();
  return (
    <Navigate
      to={`${pathname.replace(/^\/entrega/, "/entregaMIR")}${search}${hash}`}
      replace
    />
  );
};

/**
 * Endereços com barra final (ex.: /entregaMIR/) voltam à forma canônica sem a
 * barra, preservando busca e âncora. Sem isso, a comparação exata de rotas da
 * entrega não reconhece o caminho e a tela vira 404.
 */
const TrailingSlashRedirect = () => {
  const { pathname, search, hash } = useLocation();
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return <Navigate to={`${pathname.replace(/\/+$/, '')}${search}${hash}`} replace />;
  }
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TrailingSlashRedirect />
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
              <Route path="/entrega/*" element={<EntregaRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
