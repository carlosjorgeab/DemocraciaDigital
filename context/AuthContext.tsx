'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export type User = {
  id: string;
  email: string;
  id_perfil: string | null;
  id_deputado: string | null;
  is_admin: boolean;
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('democracia_user');
    if (storedUser) {
      // eslint-disable-next-line
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = pathname?.startsWith('/p/');
      if (!user && pathname !== '/login' && !isPublicRoute) {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, senha: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, perfil:perfis(nome, permissoes)')
        .eq('email', email)
        .eq('senha', senha)
        .single();

      if (error || !data) {
        setLoading(false);
        return { error: 'Credenciais inválidas' };
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        id_perfil: data.id_perfil,
        id_deputado: data.id_deputado,
        is_admin: data.is_admin,
        perfil: data.perfil
      };

      setUser(userData);
      localStorage.setItem('democracia_user', JSON.stringify(userData));
      setLoading(false);
      router.push('/');
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('democracia_user');
    router.push('/login');
  };

  const hasPermission = (menu: string) => {
    const isPublicRoute = pathname?.startsWith('/p/');
    if (isPublicRoute) {
      return menu === '/' || menu === '/mapa' || menu === '/formularios';
    }
    if (!user) return false;
    if (user.is_admin) return true;
    if (menu === '/' || menu === '/mapa' || menu === '/formularios') return true; // Always allowed
    if (!user.perfil) return false;
    return user.perfil.permissoes.includes(menu);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
