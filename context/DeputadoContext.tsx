'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type Deputado = {
  id: string;
  nome: string;
  id_partido: string;
  estado: string;
  foto_url: string;
  partidos?: {
    sigla: string;
    nome: string;
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
        .select('*, partidos(sigla, nome)');
      
      if (!error && data) {
        setDeputados(data);
        if (data.length > 0) {
          setSelectedDeputado(data[0]);
        }
      }
      setLoading(false);
    }
    fetchDeputados();
  }, []);

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
