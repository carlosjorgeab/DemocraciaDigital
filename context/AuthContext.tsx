'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { logActivity } from '@/lib/auditLogStore';

export type User = {
  id: string;
  email: string;
  id_perfil: string | null;
  id_deputado: string | null;
  is_admin: boolean;
  exibir_calendario?: boolean;
  perfil?: {
    nome: string;
    permissoes: string[];
  };
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ error: string | null }>;
  logout: () => void;
  hasPermission: (menu: string) => boolean;
  updateUserPreference: (prefs: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial sync: check session via /api/auth/me and fallback to localStorage cache
    const checkAuth = async () => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');

      // 1. Fast cache hydration
      const storedUser = localStorage.getItem('democracia_user');
      const storedSession = localStorage.getItem('democracia_session_id');

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && typeof parsed === 'object') {
            setUser(parsed);
            setSessionId(storedSession);
          }
        } catch {
          localStorage.removeItem('democracia_user');
          localStorage.removeItem('democracia_session_id');
        }
      }

      // 2. Server validation via HttpOnly cookie
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            if (data.sessionId) setSessionId(data.sessionId);
            localStorage.setItem('democracia_user', JSON.stringify(data.user));
            if (data.sessionId) localStorage.setItem('democracia_session_id', data.sessionId);
          }
        } else if (res.status === 401) {
          // Token expired or invalid
          setUser(null);
          setSessionId(null);
          localStorage.removeItem('democracia_user');
          localStorage.removeItem('democracia_session_id');
        }
      } catch (e) {
        console.warn('Erro ao validar sessão no servidor:', e);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Periodic check for multi-login and session status
  useEffect(() => {
    if (!user || !sessionId) return;

    const checkSession = async () => {
      try {
        // 1. Fetch system configs to see if multi-login is disabled
        const { data: config } = await supabase
          .from('configuracoes_sistema')
          .select('valor')
          .eq('chave', 'disable_multi_login')
          .single();

        const multiLoginDisabled = config?.valor === 'true';

        if (multiLoginDisabled) {
          // 2. Check if current user has a different session ID in the DB
          const { data: userData } = await supabase
            .from('usuarios')
            .select('current_session_id')
            .eq('id', user.id)
            .single();

          if (userData?.current_session_id && userData.current_session_id !== sessionId) {
            console.warn('Simultaneous login detected. Logging out...');
            try {
              alert('Sua conta foi acessada em outro dispositivo. Você foi deslogado.');
            } catch (_) {}
            logout();
          }
        }
      } catch (e) {
        console.error('Session check error:', e);
      }
    };

    const interval = setInterval(checkSession, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user, sessionId]);

  useEffect(() => {
    if (!loading) {
      const isPublicRoute =
        pathname === '/login' ||
        pathname?.startsWith('/p/') ||
        pathname === '/folder';

      if (!user && !isPublicRoute) {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, senha: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setLoading(false);
        return { error: data.error || 'Credenciais inválidas' };
      }

      const userData: User = data.user;
      const newSessionId: string = data.sessionId;

      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');

      setUser(userData);
      setSessionId(newSessionId);
      localStorage.setItem('democracia_user', JSON.stringify(userData));
      localStorage.setItem('democracia_session_id', newSessionId);

      logActivity({
        id_deputado: userData.id_deputado,
        usuario_email: userData.email,
        usuario_nome: userData.perfil?.nome || userData.email.split('@')[0],
        usuario_cargo: userData.is_admin ? 'Administrador' : 'Usuário',
        acao: 'LOGIN',
        entidade: 'USUARIO',
        entidade_id: userData.id,
        descricao: `Usuário ${userData.email} efetuou login com sucesso no sistema`,
        severidade: 'NORMAL',
      });

      setLoading(false);
      router.push('/');
      return { error: null };
    } catch (err: any) {
      console.error('Erro detalhado no login:', err);
      setLoading(false);
      const message = err?.message || 'Erro ao fazer login';
      return { error: `Erro ao fazer login (${message})` };
    }
  };

  const updateUserPreference = (prefs: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...prefs };
    setUser(updatedUser);
    localStorage.setItem('democracia_user', JSON.stringify(updatedUser));
  };

  const logout = async () => {
    if (user) {
      logActivity({
        id_deputado: user.id_deputado,
        usuario_email: user.email,
        usuario_nome: user.perfil?.nome || user.email.split('@')[0],
        acao: 'LOGOUT',
        entidade: 'USUARIO',
        entidade_id: user.id,
        descricao: `Usuário ${user.email} encerrou a sessão no sistema`,
        severidade: 'NORMAL',
      });
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Erro ao chamar /api/auth/logout:', e);
    }

    setUser(null);
    setSessionId(null);
    localStorage.removeItem('democracia_user');
    localStorage.removeItem('democracia_session_id');
    router.push('/login');
  };

  const hasPermission = (menu: string) => {
    const isPublicRoute = pathname?.startsWith('/p/');
    if (isPublicRoute) {
      return menu === '/' || menu === '/mapa' || menu === '/formularios';
    }
    if (!user) return false;
    if (user.is_admin) return true;
    if (menu === '/' || menu === '/mapa' || menu === '/formularios') return true;
    if (!user.perfil) return false;
    return user.perfil.permissoes.includes(menu);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, updateUserPreference }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return {
      user: null,
      loading: false,
      login: async () => ({ error: 'Sem contexto de autenticação' }),
      logout: () => {},
      hasPermission: () => false,
      updateUserPreference: () => {},
    };
  }
  return context;
}
