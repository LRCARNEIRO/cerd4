import { ReactNode, useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';


interface HeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [q, setQ] = useState('');

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const submit = () => {
    const term = q.trim();
    navigate(term ? `/busca?q=${encodeURIComponent(term)}` : '/busca');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0">
          {children}
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-semibold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="capitalize">{today}</span>
          </div>

          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={submit}
              aria-label="Buscar"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4" />
            </button>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKey}
              placeholder="Buscar em todo o sistema..."
              className="pl-9 w-64 bg-muted/50 border-0 cursor-text"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => navigate('/busca')}
            aria-label="Buscar"
          >
            <Search className="w-5 h-5 text-muted-foreground" />
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button>

          {session ? (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-muted hidden md:inline-flex"
              onClick={() => signOut()}
              title={`Sair (${session.user.email ?? ''})`}
              aria-label="Sair"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-muted hidden md:inline-flex"
              onClick={() => navigate('/auth')}
              title="Entrar"
              aria-label="Entrar"
            >
              <User className="w-5 h-5 text-muted-foreground" />
            </Button>
          )}

        </div>
      </div>
    </header>
  );
}
