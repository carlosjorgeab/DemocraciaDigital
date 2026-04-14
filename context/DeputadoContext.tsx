'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type Deputado = {
  id: string;
  nome: string;
  id_partido: string;
  estado: string;
  foto_url: string;
  is_default?: boolean;
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

  useEffect(() => {
    async function fetchDeputados() {
      const { data, error } = await supabase
        .from('deputado')
        .select('*, partidos(sigla, nome, cor_primaria, cor_secundaria, cor_terciaria)');
      
      if (!error && data) {
        setDeputados(data);
        if (data.length > 0) {
          // Find the default deputy, or fallback to the first one
          const defaultDeputado = data.find(d => d.is_default) || data[0];
          setSelectedDeputado(defaultDeputado);
        }
      }
      setLoading(false);
    }
    fetchDeputados();
  }, []);

  // Apply theme colors when selectedDeputado changes
  useEffect(() => {
    if (selectedDeputado?.partidos) {
      const root = document.documentElement;
      const { cor_primaria, cor_secundaria, cor_terciaria } = selectedDeputado.partidos;
      
      if (cor_primaria) {
        root.style.setProperty('--color-primary', cor_primaria);
        root.style.setProperty('--color-primary-container', cor_primaria);
        root.style.setProperty('--color-surface-tint', cor_primaria);
        root.style.setProperty('--color-outline', cor_primaria);
        root.style.setProperty('--color-error', cor_primaria);
      }
      
      if (cor_secundaria) {
        root.style.setProperty('--color-secondary', cor_secundaria);
      }
      
      if (cor_terciaria) {
        root.style.setProperty('--color-tertiary', cor_terciaria);
      }
    }
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
    throw new Error('useDeputado must be used within a DeputadoProvider');
  }
  return context;
}
