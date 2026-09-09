'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { applyDeputyTheme } from '@/lib/colorUtils';

type Deputado = {
  id: string;
  nome: string;
  slug?: string;
  id_partido: string;
  estado: string;
  foto_url: string;
  ativo?: boolean;
  partidos?: {
    sigla: string;
    nome: string;
    cor_primaria?: string;
    cor_secundaria?: string;
    cor_terciaria?: string;
  };
};

type DeputadoContextType = {
  deputados: Deputado[];
  selectedDeputado: Deputado | null;
  setSelectedDeputado: (deputado: Deputado | null) => void;
  loading: boolean;
};

const DeputadoContext = createContext<DeputadoContextType | undefined>(undefined);

export function DeputadoProvider({ children }: { children: ReactNode }) {
  const [deputados, setDeputados] = useState<Deputado[]>([]);
  const [selectedDeputado, setSelectedDeputado] = useState<Deputado | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    async function fetchDeputados() {
      try {
        const isPublicRoute = pathname?.startsWith('/p/');
        let publicId = null;

        if (isPublicRoute) {
          const parts = pathname?.split('/');
          if (parts && parts.length >= 3) {
            publicId = parts[2];
          }
        }

        if (!isPublicRoute && !user) {
          if (isMounted) {
            setDeputados([]);
            setSelectedDeputado(null);
            setLoading(false);
          }
          return;
        }

        let query = supabase
          .from('deputado')
          .select('*, partidos(sigla, nome, cor_primaria, cor_secundaria, cor_terciaria)');

        if (isPublicRoute && publicId) {
          query = query.eq('ativo', true);
          const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(publicId);
          if (isUuid) {
            query = query.eq('id', publicId);
          } else {
            query = query.eq('slug', publicId);
          }
        } else if (!user?.is_admin && user?.id_deputado) {
          query = query.eq('id', user.id_deputado);
        } else if (!user?.is_admin) {
          query = query.eq('ativo', true);
        }

        const { data, error } = await query;
        console.log('DeputadoContext fetch:', { isPublicRoute, userId: user?.id, isAdmin: user?.is_admin, count: data?.length, error });

        if (!isMounted) return;

        if (!error && data && data.length > 0) {
          setDeputados(data);
          setSelectedDeputado((prev) => {
            if (prev && data.some((d) => d.id === prev.id)) {
              return prev;
            }
            return data[0];
          });
        } else {
          setDeputados([]);
          setSelectedDeputado(null);
        }
      } catch (err) {
        console.error('Erro ao carregar deputados:', err);
        if (isMounted) {
          setDeputados([]);
          setSelectedDeputado(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDeputados();

    return () => {
      isMounted = false;
    };
  }, [user, pathname]);

  useEffect(() => {
    applyDeputyTheme(selectedDeputado?.partidos);
  }, [selectedDeputado]);

  return (
    <DeputadoContext.Provider value={{ deputados, selectedDeputado, setSelectedDeputado, loading }}>
      {children}
    </DeputadoContext.Provider>
  );
}

export function useDeputado() {
  const context = useContext(DeputadoContext);
  if (context === undefined) {
    return {
      deputados: [],
      selectedDeputado: null,
      setSelectedDeputado: () => {},
      loading: false,
    };
  }
  return context;
}
