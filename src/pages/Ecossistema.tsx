import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Monitor, ExternalLink } from 'lucide-react';
import EcossistemaHero from '@/components/ecossistema/EcossistemaHero';
import ProductNav from '@/components/ecossistema/ProductNav';
import BaseEvidenciasSection from '@/components/ecossistema/BaseEvidenciasSection';
import SumarioExecutivoSection from '@/components/ecossistema/SumarioExecutivoSection';
import FarolRecomendacoesSection from '@/components/ecossistema/FarolRecomendacoesSection';
import ProtocoloMetodologicoSection from '@/components/ecossistema/ProtocoloMetodologicoSection';
import IEATSection from '@/components/ecossistema/IEATSection';

export default function Ecossistema() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation bar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-[hsl(210,45%,12%)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded overflow-hidden">
              <img src="/favicon.png" alt="CERD Brasil" className="w-full h-full object-cover" />
            </div>
            <span className="font-semibold text-sm text-white tracking-tight">Ecossistema MIR</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 text-xs" asChild>
              <Link to="/">
                <Monitor className="w-3.5 h-3.5 mr-1.5" />
                Painel
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <EcossistemaHero />
      <ProductNav />
      <BaseEvidenciasSection />
      <SumarioExecutivoSection />
      <FarolRecomendacoesSection />
      <ProtocoloMetodologicoSection />
      <IEATSection />

      {/* Footer */}
      <footer className="py-6 bg-[hsl(210,45%,12%)] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] text-white/40">
          <p>© {new Date().getFullYear()} — Ecossistema de Inteligência para Políticas de Igualdade Racial · MIR</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-white/70 transition-colors">Painel de Monitoramento</Link>
            <Link to="/fontes" className="hover:text-white/70 transition-colors">Fontes e Metodologia</Link>
            <a href="https://www.gov.br/igualdaderacial" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors flex items-center gap-1">
              gov.br/igualdaderacial
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
