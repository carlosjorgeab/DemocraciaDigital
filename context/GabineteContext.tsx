'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Pessoa, Entidade, AgendaCompromisso, SolicitacaoAudiencia, AtendimentoDemanda,
  Oficio, LigacaoRecebida, RegistroVisita, Recado,
  initialDemandas, initialAudiencias, initialAgendas, initialVisitas,
  initialLigacoes, initialOficios, initialPessoas, initialEntidades
} from '@/lib/gabineteStore';
import { useDeputado } from '@/context/DeputadoContext';
import { supabase } from '@/lib/supabase';

type GabineteContextType = {
  demandas: AtendimentoDemanda[];
  audiencias: SolicitacaoAudiencia[];
  agendas: AgendaCompromisso[];
  visitas: RegistroVisita[];
  ligacoes: LigacaoRecebida[];
  oficios: Oficio[];
  pessoas: Pessoa[];
  entidades: Entidade[];
  recados: Recado[];
  
  // Actions
  addDemanda: (demanda: Omit<AtendimentoDemanda, 'id' | 'id_deputado' | 'data_abertura'>) => void;
  updateDemanda: (id: string, demanda: Partial<AtendimentoDemanda>) => void;
  deleteDemanda: (id: string) => void;

  addAgenda: (agenda: Omit<AgendaCompromisso, 'id' | 'id_deputado' | 'created_at'>) => void;
  updateAgenda: (id: string, agenda: Partial<AgendaCompromisso>) => void;
  deleteAgenda: (id: string) => void;

  addAudiencia: (audiencia: Omit<SolicitacaoAudiencia, 'id' | 'id_deputado' | 'data_solicitacao'>) => void;
  updateAudiencia: (id: string, audiencia: Partial<SolicitacaoAudiencia>) => void;

  addPessoa: (pessoa: Omit<Pessoa, 'id' | 'id_deputado' | 'created_at'>) => void;
  updatePessoa: (id: string, pessoa: Partial<Pessoa>) => void;

  addEntidade: (entidade: Omit<Entidade, 'id' | 'id_deputado'>) => void;
  addOficio: (oficio: Omit<Oficio, 'id' | 'id_deputado'>) => void;
  addVisita: (visita: Omit<RegistroVisita, 'id' | 'id_deputado' | 'data_horario'>) => void;
  addLigacao: (ligacao: Omit<LigacaoRecebida, 'id' | 'id_deputado' | 'data_hora'>) => void;
  
  loading: boolean;
};

const GabineteContext = createContext<GabineteContextType | undefined>(undefined);

export function GabineteProvider({ children }: { children: ReactNode }) {
  const { selectedDeputado } = useDeputado();
  const deputadoId = selectedDeputado?.id || 'default';

  const [demandas, setDemandas] = useState<AtendimentoDemanda[]>([]);
  const [audiencias, setAudiencias] = useState<SolicitacaoAudiencia[]>([]);
  const [agendas, setAgendas] = useState<AgendaCompromisso[]>([]);
  const [visitas, setVisitas] = useState<RegistroVisita[]>([]);
  const [ligacoes, setLigacoes] = useState<LigacaoRecebida[]>([]);
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [recados, setRecados] = useState<Recado[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Fetch real data from Supabase database
  useEffect(() => {
    async function fetchGabineteData() {
      if (!selectedDeputado?.id) {
        setDemandas([]);
        setAudiencias([]);
        setAgendas([]);
        setVisitas([]);
        setLigacoes([]);
        setOficios([]);
        setPessoas([]);
        setEntidades([]);
        setRecados([]);
        return;
      }
      setLoading(true);
      
      try {
        const [resDemandas, resAgendas, resAudiencias, resPessoas, resEntidades, resOficios, resVisitas, resLigacoes, resRecados] = await Promise.all([
          supabase.from('gabinete_demandas').select('*').eq('id_deputado', selectedDeputado.id),
          supabase.from('gabinete_agendas').select('*').eq('id_deputado', selectedDeputado.id),
          supabase.from('gabinete_audiencias').select('*').eq('id_deputado', selectedDeputado.id),
          supabase.from('gabinete_pessoas').select('*').eq('id_deputado', selectedDeputado.id),
          supabase.from('gabinete_entidades').select('*').eq('id_deputado', selectedDeputado.id),
          supabase.from('gabinete_oficios').select('*').eq('id_deputado', selectedDeputado.id),
          supabase.from('gabinete_visitas').select('*').eq('id_deputado', selectedDeputado.id),
          supabase.from('gabinete_ligacoes').select('*').eq('id_deputado', selectedDeputado.id),
          supabase.from('gabinete_recados').select('*').eq('id_deputado', selectedDeputado.id),
        ]);

        setDemandas(resDemandas.data || []);
        setAgendas(resAgendas.data || []);
        setAudiencias(resAudiencias.data || []);
        setPessoas(resPessoas.data || []);
        setEntidades(resEntidades.data || []);
        setOficios(resOficios.data || []);
        setVisitas(resVisitas.data || []);
        setLigacoes(resLigacoes.data || []);
        setRecados(resRecados.data || []);
      } catch (e) {
        console.error('Erro ao carregar dados do gabinete do banco:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchGabineteData();
  }, [selectedDeputado]);

  // Handler functions
  const addDemanda = (demanda: Omit<AtendimentoDemanda, 'id' | 'id_deputado' | 'data_abertura'>) => {
    const newDem: AtendimentoDemanda = {
      ...demanda,
      id: `dem-${Date.now()}`,
      id_deputado: deputadoId,
      data_abertura: new Date().toISOString(),
    };
    setDemandas((prev) => [newDem, ...prev]);
    supabase.from('gabinete_demandas').insert(newDem).then(() => {});
  };

  const updateDemanda = (id: string, updatedFields: Partial<AtendimentoDemanda>) => {
    setDemandas((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d))
    );
    supabase.from('gabinete_demandas').update(updatedFields).eq('id', id).then(() => {});
  };

  const deleteDemanda = (id: string) => {
    setDemandas((prev) => prev.filter((d) => d.id !== id));
    supabase.from('gabinete_demandas').delete().eq('id', id).then(() => {});
  };

  const addAgenda = (agenda: Omit<AgendaCompromisso, 'id' | 'id_deputado' | 'created_at'>) => {
    const newAg: AgendaCompromisso = {
      ...agenda,
      id: `ag-${Date.now()}`,
      id_deputado: deputadoId,
      created_at: new Date().toISOString(),
    };
    setAgendas((prev) => [newAg, ...prev]);
    supabase.from('gabinete_agendas').insert(newAg).then(() => {});
  };

  const updateAgenda = (id: string, updatedFields: Partial<AgendaCompromisso>) => {
    setAgendas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    supabase.from('gabinete_agendas').update(updatedFields).eq('id', id).then(() => {});
  };

  const deleteAgenda = (id: string) => {
    setAgendas((prev) => prev.filter((a) => a.id !== id));
    supabase.from('gabinete_agendas').delete().eq('id', id).then(() => {});
  };

  const addAudiencia = (audiencia: Omit<SolicitacaoAudiencia, 'id' | 'id_deputado' | 'data_solicitacao'>) => {
    const newAud: SolicitacaoAudiencia = {
      ...audiencia,
      id: `aud-${Date.now()}`,
      id_deputado: deputadoId,
      data_solicitacao: new Date().toISOString(),
    };
    setAudiencias((prev) => [newAud, ...prev]);
    supabase.from('gabinete_audiencias').insert(newAud).then(() => {});
  };

  const updateAudiencia = (id: string, updatedFields: Partial<SolicitacaoAudiencia>) => {
    setAudiencias((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    supabase.from('gabinete_audiencias').update(updatedFields).eq('id', id).then(() => {});
  };

  const addPessoa = (pessoa: Omit<Pessoa, 'id' | 'id_deputado' | 'created_at'>) => {
    const newPes: Pessoa = {
      ...pessoa,
      id: `pes-${Date.now()}`,
      id_deputado: deputadoId,
      created_at: new Date().toISOString(),
    };
    setPessoas((prev) => [newPes, ...prev]);
    supabase.from('gabinete_pessoas').insert(newPes).then(() => {});
  };

  const updatePessoa = (id: string, updatedFields: Partial<Pessoa>) => {
    setPessoas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    supabase.from('gabinete_pessoas').update(updatedFields).eq('id', id).then(() => {});
  };

  const addEntidade = (entidade: Omit<Entidade, 'id' | 'id_deputado'>) => {
    const newEnt: Entidade = {
      ...entidade,
      id: `ent-${Date.now()}`,
      id_deputado: deputadoId,
    };
    setEntidades((prev) => [newEnt, ...prev]);
    supabase.from('gabinete_entidades').insert(newEnt).then(() => {});
  };

  const addOficio = (oficio: Omit<Oficio, 'id' | 'id_deputado'>) => {
    const newOf: Oficio = {
      ...oficio,
      id: `ofi-${Date.now()}`,
      id_deputado: deputadoId,
    };
    setOficios((prev) => [newOf, ...prev]);
    supabase.from('gabinete_oficios').insert(newOf).then(() => {});
  };

  const addVisita = (visita: Omit<RegistroVisita, 'id' | 'id_deputado' | 'data_horario'>) => {
    const newVis: RegistroVisita = {
      ...visita,
      id: `vis-${Date.now()}`,
      id_deputado: deputadoId,
      data_horario: new Date().toISOString(),
    };
    setVisitas((prev) => [newVis, ...prev]);
    supabase.from('gabinete_visitas').insert(newVis).then(() => {});
  };

  const addLigacao = (ligacao: Omit<LigacaoRecebida, 'id' | 'id_deputado' | 'data_hora'>) => {
    const newLig: LigacaoRecebida = {
      ...ligacao,
      id: `lig-${Date.now()}`,
      id_deputado: deputadoId,
      data_hora: new Date().toISOString(),
    };
    setLigacoes((prev) => [newLig, ...prev]);
    supabase.from('gabinete_ligacoes').insert(newLig).then(() => {});
  };

  return (
    <GabineteContext.Provider
      value={{
        demandas,
        audiencias,
        agendas,
        visitas,
        ligacoes,
        oficios,
        pessoas,
        entidades,
        recados,
        addDemanda,
        updateDemanda,
        deleteDemanda,
        addAgenda,
        updateAgenda,
        deleteAgenda,
        addAudiencia,
        updateAudiencia,
        addPessoa,
        updatePessoa,
        addEntidade,
        addOficio,
        addVisita,
        addLigacao,
        loading,
      }}
    >
      {children}
    </GabineteContext.Provider>
  );
}

export function useGabinete() {
  const context = useContext(GabineteContext);
  if (!context) {
    throw new Error('useGabinete must be used within a GabineteProvider');
  }
  return context;
}
