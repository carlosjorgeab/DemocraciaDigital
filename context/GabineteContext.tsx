'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Pessoa, Entidade, AgendaCompromisso, SolicitacaoAudiencia, AtendimentoDemanda,
  Oficio, LigacaoRecebida, RegistroVisita, Recado, EventoComemorativo,
  initialTiposAtendimento
} from '@/lib/gabineteStore';
import { useDeputado } from '@/context/DeputadoContext';
import { supabase } from '@/lib/supabase';
import { generateUUID } from '@/lib/utils';
import { logActivity } from '@/lib/auditLogStore';

// Helper to check valid UUID
const isUuid = (str?: string | null): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

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
  eventos: EventoComemorativo[];
  tiposAtendimento: string[];
  
  // Actions
  addDemanda: (demanda: Omit<AtendimentoDemanda, 'id' | 'id_deputado'> & { id?: string; data_abertura?: string }) => void;
  updateDemanda: (id: string, demanda: Partial<AtendimentoDemanda>) => void;
  deleteDemanda: (id: string) => void;

  addAgenda: (agenda: Omit<AgendaCompromisso, 'id' | 'id_deputado'> & { id?: string }) => void;
  updateAgenda: (id: string, agenda: Partial<AgendaCompromisso>) => void;
  deleteAgenda: (id: string) => void;

  addAudiencia: (audiencia: Omit<SolicitacaoAudiencia, 'id' | 'id_deputado' | 'data_solicitacao'> & { id?: string; data_solicitacao?: string }) => void;
  updateAudiencia: (id: string, audiencia: Partial<SolicitacaoAudiencia>) => void;
  deleteAudiencia: (id: string) => void;

  addPessoa: (pessoa: Omit<Pessoa, 'id' | 'id_deputado'> & { id?: string }) => void;
  updatePessoa: (id: string, pessoa: Partial<Pessoa>) => void;
  deletePessoa: (id: string) => void;

  addEntidade: (entidade: Omit<Entidade, 'id' | 'id_deputado'> & { id?: string }) => void;
  updateEntidade: (id: string, entidade: Partial<Entidade>) => void;
  deleteEntidade: (id: string) => void;

  addOficio: (oficio: Omit<Oficio, 'id' | 'id_deputado'> & { id?: string }) => void;
  updateOficio: (id: string, oficio: Partial<Oficio>) => void;
  deleteOficio: (id: string) => void;

  addVisita: (visita: Omit<RegistroVisita, 'id' | 'id_deputado'> & { id?: string }) => void;
  updateVisita: (id: string, visita: Partial<RegistroVisita>) => void;
  deleteVisita: (id: string) => void;

  addLigacao: (ligacao: Omit<LigacaoRecebida, 'id' | 'id_deputado'> & { id?: string }) => void;
  updateLigacao: (id: string, ligacao: Partial<LigacaoRecebida>) => void;
  deleteLigacao: (id: string) => void;

  addRecado: (recado: Omit<Recado, 'id' | 'id_deputado'> & { id?: string }) => void;
  updateRecado: (id: string, recado: Partial<Recado>) => void;
  deleteRecado: (id: string) => void;

  addEvento: (evento: Omit<EventoComemorativo, 'id' | 'id_deputado'> & { id?: string }) => void;
  updateEvento: (id: string, evento: Partial<EventoComemorativo>) => void;
  deleteEvento: (id: string) => void;

  addTipoAtendimento: (novoTipo: string) => void;
  
  loading: boolean;
};

const GabineteContext = createContext<GabineteContextType | undefined>(undefined);

export function GabineteProvider({ children }: { children: ReactNode }) {
  const { selectedDeputado } = useDeputado();
  const rawDeputadoId = selectedDeputado?.id;
  const deputadoId = isUuid(rawDeputadoId) ? (rawDeputadoId as string) : null;

  const [demandas, setDemandas] = useState<AtendimentoDemanda[]>([]);
  const [audiencias, setAudiencias] = useState<SolicitacaoAudiencia[]>([]);
  const [agendas, setAgendas] = useState<AgendaCompromisso[]>([]);
  const [visitas, setVisitas] = useState<RegistroVisita[]>([]);
  const [ligacoes, setLigacoes] = useState<LigacaoRecebida[]>([]);
  const [oficios, setOficios] = useState<Oficio[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [entidades, setEntidades] = useState<Entidade[]>([]);
  const [recados, setRecados] = useState<Recado[]>([]);
  const [eventos, setEventos] = useState<EventoComemorativo[]>([]);
  const [tiposAtendimento, setTiposAtendimento] = useState<string[]>(initialTiposAtendimento);
  
  const [loading, setLoading] = useState(false);

  // Load custom tiposAtendimento from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('gabinete_tipos_atendimento');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const combined = Array.from(new Set([...initialTiposAtendimento, ...parsed]));
            setTiposAtendimento(combined);
          }
        }
      } catch (e) {
        console.error('Erro ao ler tipos de atendimento:', e);
      }
    }
  }, []);

  const addTipoAtendimento = (novoTipo: string) => {
    const trimmed = novoTipo.trim();
    if (!trimmed) return;
    setTiposAtendimento((prev) => {
      if (prev.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      const updated = [...prev, trimmed];
      if (typeof window !== 'undefined') {
        localStorage.setItem('gabinete_tipos_atendimento', JSON.stringify(updated));
      }
      return updated;
    });

    if (deputadoId) {
      logActivity({
        id_deputado: deputadoId,
        acao: 'CRIACAO',
        entidade: 'CONFIGURACAO',
        descricao: `Cadastrou novo Tipo de Atendimento / Área: "${trimmed}"`,
        detalhes: { tipo_atendimento: trimmed },
        severidade: 'NORMAL',
      });
    }
  };

  // Fetch real data from Supabase database for the active deputado
  useEffect(() => {
    if (!deputadoId) {
      setDemandas([]);
      setAgendas([]);
      setAudiencias([]);
      setPessoas([]);
      setEntidades([]);
      setOficios([]);
      setVisitas([]);
      setLigacoes([]);
      setRecados([]);
      setEventos([]);
      setLoading(false);
      return;
    }

    async function fetchGabineteData() {
      setLoading(true);
      
      try {
        const [
          resDemandas,
          resAgendas,
          resAudiencias,
          resPessoas,
          resEntidades,
          resOficios,
          resVisitas,
          resLigacoes,
          resRecados,
          resEventos
        ] = await Promise.all([
          supabase.from('gabinete_demandas').select('*').eq('id_deputado', deputadoId),
          supabase.from('gabinete_agendas').select('*').eq('id_deputado', deputadoId),
          supabase.from('gabinete_audiencias').select('*').eq('id_deputado', deputadoId),
          supabase.from('gabinete_pessoas').select('*').eq('id_deputado', deputadoId),
          supabase.from('gabinete_entidades').select('*').eq('id_deputado', deputadoId),
          supabase.from('gabinete_oficios').select('*').eq('id_deputado', deputadoId),
          supabase.from('gabinete_visitas').select('*').eq('id_deputado', deputadoId),
          supabase.from('gabinete_ligacoes').select('*').eq('id_deputado', deputadoId),
          supabase.from('gabinete_recados').select('*').eq('id_deputado', deputadoId),
          supabase.from('gabinete_eventos').select('*').eq('id_deputado', deputadoId),
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
        setEventos(resEventos.data || []);
      } catch (e) {
        console.error('Erro ao carregar dados do gabinete do banco:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchGabineteData();
  }, [deputadoId]);

  // Handler functions with proper UUIDs and error handling
  const addDemanda = (demanda: Omit<AtendimentoDemanda, 'id' | 'id_deputado'> & { id?: string; data_abertura?: string }) => {
    if (!deputadoId) return;
    const newId = demanda.id && isUuid(demanda.id) ? demanda.id : generateUUID();
    const newDem: AtendimentoDemanda = {
      ...demanda,
      id: newId,
      id_deputado: deputadoId,
      data_abertura: demanda.data_abertura || new Date().toISOString(),
    };
    setDemandas((prev) => [newDem, ...prev]);
    supabase.from('gabinete_demandas').insert(newDem).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_demanda:', error);
    });

    logActivity({
      id_deputado: deputadoId,
      acao: 'CRIACAO',
      entidade: 'DEMANDA',
      entidade_id: newId,
      descricao: `Cadastrou nova demanda #${newDem.processo} para ${newDem.interessado_nome} (${newDem.tipo_atendimento})`,
      detalhes: {
        processo: newDem.processo,
        interessado: newDem.interessado_nome,
        assunto: newDem.assunto,
        prioridade: newDem.prioridade,
        valor_estimado: newDem.valor_estimado,
      },
      severidade: newDem.prioridade === 'Urgente' || newDem.prioridade === 'Alta' ? 'IMPORTANTE' : 'NORMAL',
    });
  };

  const updateDemanda = (id: string, updatedFields: Partial<AtendimentoDemanda>) => {
    const existing = demandas.find(d => d.id === id);
    setDemandas((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updatedFields } : d))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_demandas').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_demanda:', error);
      });
    }

    const isStatusChange = updatedFields.status && existing && existing.status !== updatedFields.status;
    if (deputadoId) {
      logActivity({
        id_deputado: deputadoId,
        acao: isStatusChange ? 'STATUS' : 'EDICAO',
        entidade: 'DEMANDA',
        entidade_id: id,
        descricao: isStatusChange 
          ? `Alterou status da demanda #${existing?.processo || id} de "${existing?.status}" para "${updatedFields.status}"`
          : `Atualizou dados da demanda #${existing?.processo || id} (${existing?.interessado_nome || ''})`,
        detalhes: {
          campos_modificados: Object.keys(updatedFields),
          dados_atualizados: updatedFields,
          processo: existing?.processo,
        },
        severidade: isStatusChange ? 'IMPORTANTE' : 'NORMAL',
      });
    }
  };

  const deleteDemanda = (id: string) => {
    const existing = demandas.find(d => d.id === id);
    setDemandas((prev) => prev.filter((d) => d.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_demandas').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_demanda:', error);
      });
    }

    if (deputadoId) {
      logActivity({
        id_deputado: deputadoId,
        acao: 'EXCLUSAO',
        entidade: 'DEMANDA',
        entidade_id: id,
        descricao: `Excluiu a demanda #${existing?.processo || id} de ${existing?.interessado_nome || 'interessado'}`,
        detalhes: {
          demanda_excluida: existing,
        },
        severidade: 'CRITICA',
      });
    }
  };

  const addAgenda = (agenda: Omit<AgendaCompromisso, 'id' | 'id_deputado'> & { id?: string }) => {
    if (!deputadoId) return;
    const newId = agenda.id && isUuid(agenda.id) ? agenda.id : generateUUID();
    const newAg: AgendaCompromisso = {
      ...agenda,
      id: newId,
      id_deputado: deputadoId,
      created_at: new Date().toISOString(),
    };
    setAgendas((prev) => [newAg, ...prev]);
    supabase.from('gabinete_agendas').insert(newAg).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_agenda:', error);
    });

    logActivity({
      id_deputado: deputadoId,
      acao: 'CRIACAO',
      entidade: 'AGENDA',
      entidade_id: newId,
      descricao: `Criou novo compromisso na agenda: "${newAg.compromisso}" em ${newAg.data_inicio}`,
      detalhes: newAg,
    });
  };

  const updateAgenda = (id: string, updatedFields: Partial<AgendaCompromisso>) => {
    const existing = agendas.find(a => a.id === id);
    setAgendas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_agendas').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_agenda:', error);
      });
    }

    if (deputadoId) {
      logActivity({
        id_deputado: deputadoId,
        acao: 'EDICAO',
        entidade: 'AGENDA',
        entidade_id: id,
        descricao: `Atualizou compromisso da agenda: "${existing?.compromisso || id}"`,
        detalhes: updatedFields,
      });
    }
  };

  const deleteAgenda = (id: string) => {
    const existing = agendas.find(a => a.id === id);
    setAgendas((prev) => prev.filter((a) => a.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_agendas').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_agenda:', error);
      });
    }

    if (deputadoId) {
      logActivity({
        id_deputado: deputadoId,
        acao: 'EXCLUSAO',
        entidade: 'AGENDA',
        entidade_id: id,
        descricao: `Removeu compromisso da agenda: "${existing?.compromisso || id}"`,
        severidade: 'IMPORTANTE',
      });
    }
  };

  const addAudiencia = (audiencia: Omit<SolicitacaoAudiencia, 'id' | 'id_deputado' | 'data_solicitacao'> & { id?: string; data_solicitacao?: string }) => {
    if (!deputadoId) return;
    const newId = audiencia.id && isUuid(audiencia.id) ? audiencia.id : generateUUID();
    const newAud: SolicitacaoAudiencia = {
      ...audiencia,
      id: newId,
      id_deputado: deputadoId,
      data_solicitacao: audiencia.data_solicitacao || new Date().toISOString(),
    };
    setAudiencias((prev) => [newAud, ...prev]);
    supabase.from('gabinete_audiencias').insert(newAud).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_audiencia:', error);
    });

    logActivity({
      id_deputado: deputadoId,
      acao: 'CRIACAO',
      entidade: 'AUDIENCIA',
      entidade_id: newId,
      descricao: `Cadastrou solicitação de audiência com "${newAud.personalidade}" - Pauta: ${newAud.pauta}`,
      detalhes: newAud,
      severidade: 'IMPORTANTE',
    });
  };

  const updateAudiencia = (id: string, updatedFields: Partial<SolicitacaoAudiencia>) => {
    const existing = audiencias.find(a => a.id === id);
    setAudiencias((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_audiencias').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_audiencia:', error);
      });
    }

    const isStatusChange = updatedFields.status && existing && existing.status !== updatedFields.status;
    if (deputadoId) {
      logActivity({
        id_deputado: deputadoId,
        acao: isStatusChange ? 'STATUS' : 'EDICAO',
        entidade: 'AUDIENCIA',
        entidade_id: id,
        descricao: isStatusChange
          ? `Alterou status da audiência com "${existing?.personalidade}" para "${updatedFields.status}"`
          : `Atualizou dados da audiência com "${existing?.personalidade}"`,
        detalhes: updatedFields,
        severidade: 'IMPORTANTE',
      });
    }
  };

  const deleteAudiencia = (id: string) => {
    const existing = audiencias.find(a => a.id === id);
    setAudiencias((prev) => prev.filter((a) => a.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_audiencias').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_audiencia:', error);
      });
    }

    if (deputadoId) {
      logActivity({
        id_deputado: deputadoId,
        acao: 'EXCLUSAO',
        entidade: 'AUDIENCIA',
        entidade_id: id,
        descricao: `Excluiu solicitação de audiência com "${existing?.personalidade}"`,
        severidade: 'CRITICA',
      });
    }
  };

  const addPessoa = (pessoa: Omit<Pessoa, 'id' | 'id_deputado'> & { id?: string }) => {
    if (!deputadoId) return;
    const newId = pessoa.id && isUuid(pessoa.id) ? pessoa.id : generateUUID();
    const newPes: Pessoa = {
      ...pessoa,
      id: newId,
      id_deputado: deputadoId,
      created_at: new Date().toISOString(),
    };
    setPessoas((prev) => [newPes, ...prev]);
    supabase.from('gabinete_pessoas').insert(newPes).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_pessoa:', error);
    });
  };

  const updatePessoa = (id: string, updatedFields: Partial<Pessoa>) => {
    setPessoas((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_pessoas').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_pessoa:', error);
      });
    }
  };

  const deletePessoa = (id: string) => {
    setPessoas((prev) => prev.filter((p) => p.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_pessoas').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_pessoa:', error);
      });
    }
  };

  const addEntidade = (entidade: Omit<Entidade, 'id' | 'id_deputado'> & { id?: string }) => {
    if (!deputadoId) return;
    const newId = entidade.id && isUuid(entidade.id) ? entidade.id : generateUUID();
    const newEnt: Entidade = {
      ...entidade,
      id: newId,
      id_deputado: deputadoId,
    };
    setEntidades((prev) => [newEnt, ...prev]);
    supabase.from('gabinete_entidades').insert(newEnt).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_entidade:', error);
    });
  };

  const updateEntidade = (id: string, updatedFields: Partial<Entidade>) => {
    setEntidades((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_entidades').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_entidade:', error);
      });
    }
  };

  const deleteEntidade = (id: string) => {
    setEntidades((prev) => prev.filter((e) => e.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_entidades').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_entidade:', error);
      });
    }
  };

  const addOficio = (oficio: Omit<Oficio, 'id' | 'id_deputado'> & { id?: string }) => {
    if (!deputadoId) return;
    const newId = oficio.id && isUuid(oficio.id) ? oficio.id : generateUUID();
    const newOf: Oficio = {
      ...oficio,
      id: newId,
      id_deputado: deputadoId,
    };
    setOficios((prev) => [newOf, ...prev]);
    supabase.from('gabinete_oficios').insert(newOf).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_oficio:', error);
    });
  };

  const updateOficio = (id: string, updatedFields: Partial<Oficio>) => {
    setOficios((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updatedFields } : o))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_oficios').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_oficio:', error);
      });
    }
  };

  const deleteOficio = (id: string) => {
    setOficios((prev) => prev.filter((o) => o.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_oficios').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_oficio:', error);
      });
    }
  };

  const addVisita = (visita: Omit<RegistroVisita, 'id' | 'id_deputado'> & { id?: string }) => {
    if (!deputadoId) return;
    const newId = visita.id && isUuid(visita.id) ? visita.id : generateUUID();
    const newVis: RegistroVisita = {
      ...visita,
      id: newId,
      id_deputado: deputadoId,
      data_horario: visita.data_horario || new Date().toISOString(),
    };
    setVisitas((prev) => [newVis, ...prev]);
    supabase.from('gabinete_visitas').insert(newVis).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_visita:', error);
    });
  };

  const updateVisita = (id: string, updatedFields: Partial<RegistroVisita>) => {
    setVisitas((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updatedFields } : v))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_visitas').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_visita:', error);
      });
    }
  };

  const deleteVisita = (id: string) => {
    setVisitas((prev) => prev.filter((v) => v.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_visitas').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_visita:', error);
      });
    }
  };

  const addLigacao = (ligacao: Omit<LigacaoRecebida, 'id' | 'id_deputado'> & { id?: string }) => {
    if (!deputadoId) return;
    const newId = ligacao.id && isUuid(ligacao.id) ? ligacao.id : generateUUID();
    const newLig: LigacaoRecebida = {
      ...ligacao,
      id: newId,
      id_deputado: deputadoId,
      data_hora: ligacao.data_hora || new Date().toISOString(),
    };
    setLigacoes((prev) => [newLig, ...prev]);
    supabase.from('gabinete_ligacoes').insert(newLig).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_ligacao:', error);
    });
  };

  const updateLigacao = (id: string, updatedFields: Partial<LigacaoRecebida>) => {
    setLigacoes((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updatedFields } : l))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_ligacoes').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_ligacao:', error);
      });
    }
  };

  const deleteLigacao = (id: string) => {
    setLigacoes((prev) => prev.filter((l) => l.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_ligacoes').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_ligacao:', error);
      });
    }
  };

  const addRecado = (recado: Omit<Recado, 'id' | 'id_deputado'> & { id?: string }) => {
    if (!deputadoId) return;
    const newId = recado.id && isUuid(recado.id) ? recado.id : generateUUID();
    const newRec: Recado = {
      ...recado,
      id: newId,
      id_deputado: deputadoId,
      data_recado: recado.data_recado || new Date().toISOString(),
    };
    setRecados((prev) => [newRec, ...prev]);
    supabase.from('gabinete_recados').insert(newRec).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_recado:', error);
    });
  };

  const updateRecado = (id: string, updatedFields: Partial<Recado>) => {
    setRecados((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_recados').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_recado:', error);
      });
    }
  };

  const deleteRecado = (id: string) => {
    setRecados((prev) => prev.filter((r) => r.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_recados').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_recado:', error);
      });
    }
  };

  const addEvento = (evento: Omit<EventoComemorativo, 'id' | 'id_deputado'> & { id?: string }) => {
    if (!deputadoId) return;
    const newId = evento.id && isUuid(evento.id) ? evento.id : generateUUID();
    const newEv: EventoComemorativo = {
      ...evento,
      id: newId,
      id_deputado: deputadoId,
    };
    setEventos((prev) => [newEv, ...prev]);
    supabase.from('gabinete_eventos').insert(newEv).then(({ error }) => {
      if (error) console.error('Error inserting gabinete_evento:', error);
    });
  };

  const updateEvento = (id: string, updatedFields: Partial<EventoComemorativo>) => {
    setEventos((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...updatedFields } : ev))
    );
    if (isUuid(id)) {
      supabase.from('gabinete_eventos').update(updatedFields).eq('id', id).then(({ error }) => {
        if (error) console.error('Error updating gabinete_evento:', error);
      });
    }
  };

  const deleteEvento = (id: string) => {
    setEventos((prev) => prev.filter((ev) => ev.id !== id));
    if (isUuid(id)) {
      supabase.from('gabinete_eventos').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Error deleting gabinete_evento:', error);
      });
    }
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
        eventos,
        addDemanda,
        updateDemanda,
        deleteDemanda,
        addAgenda,
        updateAgenda,
        deleteAgenda,
        addAudiencia,
        updateAudiencia,
        deleteAudiencia,
        addPessoa,
        updatePessoa,
        deletePessoa,
        addEntidade,
        updateEntidade,
        deleteEntidade,
        addOficio,
        updateOficio,
        deleteOficio,
        addVisita,
        updateVisita,
        deleteVisita,
        addLigacao,
        updateLigacao,
        deleteLigacao,
        addRecado,
        updateRecado,
        deleteRecado,
        addEvento,
        updateEvento,
        deleteEvento,
        tiposAtendimento,
        addTipoAtendimento,
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
    return {
      demandas: [],
      audiencias: [],
      agendas: [],
      visitas: [],
      ligacoes: [],
      oficios: [],
      pessoas: [],
      entidades: [],
      recados: [],
      eventos: [],
      tiposAtendimento: initialTiposAtendimento,
      addDemanda: () => {},
      updateDemanda: () => {},
      deleteDemanda: () => {},
      addAgenda: () => {},
      updateAgenda: () => {},
      deleteAgenda: () => {},
      addAudiencia: () => {},
      updateAudiencia: () => {},
      deleteAudiencia: () => {},
      addPessoa: () => {},
      updatePessoa: () => {},
      deletePessoa: () => {},
      addEntidade: () => {},
      updateEntidade: () => {},
      deleteEntidade: () => {},
      addOficio: () => {},
      updateOficio: () => {},
      deleteOficio: () => {},
      addVisita: () => {},
      updateVisita: () => {},
      deleteVisita: () => {},
      addLigacao: () => {},
      updateLigacao: () => {},
      deleteLigacao: () => {},
      addRecado: () => {},
      updateRecado: () => {},
      deleteRecado: () => {},
      addEvento: () => {},
      updateEvento: () => {},
      deleteEvento: () => {},
      addTipoAtendimento: () => {},
      loading: false,
    };
  }
  return context;
}
