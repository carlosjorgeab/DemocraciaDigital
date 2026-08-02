'use client';

import { useState, useEffect } from 'react';
import { useGabinete } from '@/context/GabineteContext';
import { AgendaCompromisso } from '@/lib/gabineteStore';
import {
  Calendar as CalendarIcon, Plus, MapPin, Clock, Shield, AlertCircle,
  CheckCircle2, XCircle, Search, Filter, Share2, ExternalLink, MessageSquare,
  Users, Trash2, Edit2, AlertTriangle, Send, Cake, Globe, Building, Flag, UserCheck, RefreshCw
} from 'lucide-react';

// Helper date formatters
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDateTimeString = (hoursToAdd = 0) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursToAdd);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = '00';
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Types of Recurrence
type TipoRecorrencia = 'NENHUMA' | 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'BIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

// Months helper
const MESES_NOME = [
  { valor: '01', nome: 'Janeiro' },
  { valor: '02', nome: 'Fevereiro' },
  { valor: '03', nome: 'Março' },
  { valor: '04', nome: 'Abril' },
  { valor: '05', nome: 'Maio' },
  { valor: '06', nome: 'Junho' },
  { valor: '07', nome: 'Julho' },
  { valor: '08', nome: 'Agosto' },
  { valor: '09', nome: 'Setembro' },
  { valor: '10', nome: 'Outubro' },
  { valor: '11', nome: 'Novembro' },
  { valor: '12', nome: 'Dezembro' },
];

const getEventMonth = (dataStr: string) => {
  if (!dataStr) return '';
  if (dataStr.includes('-')) {
    const parts = dataStr.split('-');
    if (parts.length === 3) return parts[1]; // YYYY-MM-DD -> MM
    if (parts.length === 2) return parts[0]; // MM-DD -> MM
  }
  if (dataStr.includes('/')) {
    const parts = dataStr.split('/');
    if (parts.length === 3) return parts[1]; // DD/MM/YYYY -> MM
    if (parts.length === 2) return parts[1]; // DD/MM -> MM
  }
  return '';
};

const getEventDay = (dataStr: string) => {
  if (!dataStr) return '';
  if (dataStr.includes('-')) {
    const parts = dataStr.split('-');
    if (parts.length === 3) return parts[2]; // YYYY-MM-DD -> DD
    if (parts.length === 2) return parts[1]; // MM-DD -> DD
  }
  if (dataStr.includes('/')) {
    const parts = dataStr.split('/');
    if (parts.length === 3) return parts[0]; // DD/MM/YYYY -> DD
    if (parts.length === 2) return parts[0]; // DD/MM -> DD
  }
  return '';
};

// Important Commemorative Events & Birthdays list
interface EventoComemorativo {
  id: string;
  tipo: 'CIDADE' | 'ESTADUAL_FEDERAL' | 'INTERNACIONAL' | 'PERSONALIDADE' | 'PESSOA';
  titulo: string;
  data: string; // MM-DD or YYYY-MM-DD
  descricao: string;
  localOuEstado?: string;
  celular?: string;
  nomePessoa?: string;
}

const EVENTOS_COMEMORATIVOS_PADRAO: EventoComemorativo[] = [
  // Cidades do Paraná & Principais Capitais
  { id: 'ev-curitiba', tipo: 'CIDADE', titulo: 'Aniversário de Curitiba', data: '03-29', descricao: 'Aniversário de Fundação da Capital do Estado do Paraná', localOuEstado: 'Curitiba - PR' },
  { id: 'ev-londrina', tipo: 'CIDADE', titulo: 'Aniversário de Londrina', data: '12-10', descricao: 'Emancipação Política do Município de Londrina', localOuEstado: 'Londrina - PR' },
  { id: 'ev-maringa', tipo: 'CIDADE', titulo: 'Aniversário de Maringá', data: '05-10', descricao: 'Aniversário da Cidade Canção', localOuEstado: 'Maringá - PR' },
  { id: 'ev-cascavel', tipo: 'CIDADE', titulo: 'Aniversário de Cascavel', data: '11-14', descricao: 'Fundação do Município de Cascavel', localOuEstado: 'Cascavel - PR' },
  { id: 'ev-pontagrossa', tipo: 'CIDADE', titulo: 'Aniversário de Ponta Grossa', data: '09-15', descricao: 'Aniversário dos Campos Gerais', localOuEstado: 'Ponta Grossa - PR' },
  { id: 'ev-foz', tipo: 'CIDADE', titulo: 'Aniversário de Foz do Iguaçu', data: '06-10', descricao: 'Emancipação de Foz do Iguaçu', localOuEstado: 'Foz do Iguaçu - PR' },
  { id: 'ev-sjp', tipo: 'CIDADE', titulo: 'Aniversário de São José dos Pinhais', data: '01-08', descricao: 'Aniversário de Emancipação', localOuEstado: 'São José dos Pinhais - PR' },
  { id: 'ev-paranagua', tipo: 'CIDADE', titulo: 'Aniversário de Paranaguá', data: '07-29', descricao: 'Aniversário da Cidade Mãe do Paraná', localOuEstado: 'Paranaguá - PR' },

  // Nível Estadual e Federal
  { id: 'ev-pr-emancipacao', tipo: 'ESTADUAL_FEDERAL', titulo: 'Emancipação Política do Paraná', data: '12-19', descricao: 'Criação da Província do Paraná em 1853', localOuEstado: 'Paraná' },
  { id: 'ev-tiradentes', tipo: 'ESTADUAL_FEDERAL', titulo: 'Dia de Tiradentes', data: '04-21', descricao: 'Homenagem ao Patrono da Nação Brasileira', localOuEstado: 'Nacional' },
  { id: 'ev-trabalhador', tipo: 'ESTADUAL_FEDERAL', titulo: 'Dia do Trabalhador', data: '05-01', descricao: 'Dia Internacional do Trabalho', localOuEstado: 'Nacional' },
  { id: 'ev-independencia', tipo: 'ESTADUAL_FEDERAL', titulo: 'Independência do Brasil', data: '09-07', descricao: 'Dia da Pátria e Desfile de 7 de Setembro', localOuEstado: 'Nacional' },
  { id: 'ev-proclamacao', tipo: 'ESTADUAL_FEDERAL', titulo: 'Proclamação da República', data: '11-15', descricao: 'Proclamação da República Brasileira', localOuEstado: 'Nacional' },
  { id: 'ev-consciencia', tipo: 'ESTADUAL_FEDERAL', titulo: 'Dia da Consciência Negra', data: '11-20', descricao: 'Homenagem a Zumbi dos Palmares', localOuEstado: 'Nacional' },
  { id: 'ev-bandeira', tipo: 'ESTADUAL_FEDERAL', titulo: 'Dia da Bandeira Nacional', data: '11-19', descricao: 'Comemoração da Bandeira do Brasil', localOuEstado: 'Nacional' },

  // Nível Internacional
  { id: 'ev-mulher', tipo: 'INTERNACIONAL', titulo: 'Dia Internacional da Mulher', data: '03-08', descricao: 'Celebração Internacional das Conquistas das Mulheres', localOuEstado: 'Global' },
  { id: 'ev-saude', tipo: 'INTERNACIONAL', titulo: 'Dia Mundial da Saúde', data: '04-07', descricao: 'Promovido pela Organização Mundial da Saúde (OMS)', localOuEstado: 'Global' },
  { id: 'ev-meioambiente', tipo: 'INTERNACIONAL', titulo: 'Dia Mundial do Meio Ambiente', data: '06-05', descricao: 'Preservação Ambiental e Sustentabilidade Global', localOuEstado: 'Global' },
  { id: 'ev-paz', tipo: 'INTERNACIONAL', titulo: 'Dia Internacional da Paz', data: '09-21', descricao: 'Promovido pelas Nações Unidas (ONU)', localOuEstado: 'Global' },
  { id: 'ev-direitoshumanos', tipo: 'INTERNACIONAL', titulo: 'Dia Universal dos Direitos Humanos', data: '12-10', descricao: 'Declaração Universal dos Direitos Humanos', localOuEstado: 'Global' },

  // Personalidades Destacadas
  { id: 'ev-santosdumont', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Santos Dumont', data: '07-20', descricao: 'Pai da Aviação e Patrono da Aeronáutica', localOuEstado: 'Brasil' },
  { id: 'ev-senna', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Ayrton Senna', data: '03-21', descricao: 'Tricampeão Mundial de Fórmula 1 e Ídolo Nacional', localOuEstado: 'Brasil' },
  { id: 'ev-machado', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Machado de Assis', data: '06-21', descricao: 'Maior Escritor da Literatura Brasileira', localOuEstado: 'Brasil' },
  { id: 'ev-freire', tipo: 'PERSONALIDADE', titulo: 'Nascimento de Paulo Freire', data: '09-19', descricao: 'Patrono da Educação Brasileira', localOuEstado: 'Brasil' },
];

export default function AgendaPage() {
  const { agendas, addAgenda, updateAgenda, deleteAgenda, pessoas } = useGabinete();

  // Active Main View Tab: 'compromissos' | 'aniversarios_eventos'
  const [activeTab, setActiveTab] = useState<'compromissos' | 'aniversarios_eventos'>('compromissos');

  // Filter States - Defaulting to TODAY
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [filterVisibilidade, setFilterVisibilidade] = useState<string>('TODOS');
  const [filterAssessor, setFilterAssessor] = useState<string>('TODOS');
  const [filterEventoTipo, setFilterEventoTipo] = useState<string>('TODOS');
  const [filterMes, setFilterMes] = useState<string>('MES_ATUAL');
  const [searchTermEvents, setSearchTermEvents] = useState<string>('');

  const currentMonthStr = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentMonthName = MESES_NOME.find((m) => m.valor === currentMonthStr)?.nome || 'Mês Atual';

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null);

  // Form State - Defaulting to TODAY for Data/Hora Inicio & Fim
  const [formData, setFormData] = useState({
    compromisso: '',
    pauta_descritivo: '',
    local: '',
    link_maps: '',
    data_inicio: getTodayDateTimeString(0),
    data_fim: getTodayDateTimeString(1),
    visibilidade: 'PUBLICO' as 'PUBLICO' | 'RESERVADO' | 'PESSOAL',
    status: 'CONFIRMADO' as 'CONFIRMADO' | 'PENDENTE' | 'CANCELADO' | 'REALIZADO',
    cor_destaque: '#005baa',
    assessor_responsavel: 'Marcelo Guaraldo',
    solicitado_por: '',
    alerta_sms: false,
    recorrencia: 'NENHUMA' as TipoRecorrencia,
    data_limite_recorrencia: getTodayDateString(),
  });

  // Open modal for new commitment
  const handleOpenNewModal = () => {
    setEditingAgendaId(null);
    setFormData({
      compromisso: '',
      pauta_descritivo: '',
      local: '',
      link_maps: '',
      data_inicio: getTodayDateTimeString(0),
      data_fim: getTodayDateTimeString(1),
      visibilidade: 'PUBLICO',
      status: 'CONFIRMADO',
      cor_destaque: '#005baa',
      assessor_responsavel: 'Marcelo Guaraldo',
      solicitado_por: '',
      alerta_sms: false,
      recorrencia: 'NENHUMA',
      data_limite_recorrencia: getTodayDateString(),
    });
    setIsModalOpen(true);
  };

  // Open modal for editing commitment
  const handleOpenEditModal = (ag: AgendaCompromisso) => {
    setEditingAgendaId(ag.id);
    setFormData({
      compromisso: ag.compromisso,
      pauta_descritivo: ag.pauta_descritivo || '',
      local: ag.local || '',
      link_maps: ag.link_maps || '',
      data_inicio: ag.data_inicio.includes('T') ? ag.data_inicio.substring(0, 16) : `${ag.data_inicio}T09:00`,
      data_fim: ag.data_fim.includes('T') ? ag.data_fim.substring(0, 16) : `${ag.data_fim}T10:00`,
      visibilidade: ag.visibilidade,
      status: ag.status,
      cor_destaque: ag.cor_destaque || '#005baa',
      assessor_responsavel: ag.assessor_responsavel || 'Marcelo Guaraldo',
      solicitado_por: ag.solicitado_por || '',
      alerta_sms: ag.alerta_sms || false,
      recorrencia: 'NENHUMA',
      data_limite_recorrencia: getTodayDateString(),
    });
    setIsModalOpen(true);
  };

  const filteredAgendas = agendas.filter((ag) => {
    if (filterVisibilidade !== 'TODOS' && ag.visibilidade !== filterVisibilidade) return false;
    if (filterAssessor !== 'TODOS' && ag.assessor_responsavel !== filterAssessor) return false;
    if (selectedDate && !ag.data_inicio.startsWith(selectedDate)) return false;
    return true;
  });

  // Handle Form Submission with Recurrence calculation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const startDt = new Date(formData.data_inicio);
    const endDt = new Date(formData.data_fim);
    const durationMs = endDt.getTime() - startDt.getTime();

    if (editingAgendaId) {
      // Edit single existing commitment
      updateAgenda(editingAgendaId, {
        compromisso: formData.compromisso,
        pauta_descritivo: formData.pauta_descritivo,
        local: formData.local,
        link_maps: formData.link_maps || (formData.local ? `https://maps.google.com/?q=${encodeURIComponent(formData.local)}` : ''),
        data_inicio: startDt.toISOString(),
        data_fim: endDt.toISOString(),
        visibilidade: formData.visibilidade,
        status: formData.status,
        cor_destaque: formData.cor_destaque,
        assessor_responsavel: formData.assessor_responsavel,
        solicitado_por: formData.solicitado_por,
        alerta_sms: formData.alerta_sms,
      });
    } else {
      // New Commitment (Single or Recurring)
      if (formData.recorrencia === 'NENHUMA') {
        addAgenda({
          compromisso: formData.compromisso,
          pauta_descritivo: formData.pauta_descritivo,
          local: formData.local,
          link_maps: formData.link_maps || (formData.local ? `https://maps.google.com/?q=${encodeURIComponent(formData.local)}` : ''),
          data_inicio: startDt.toISOString(),
          data_fim: endDt.toISOString(),
          visibilidade: formData.visibilidade,
          status: formData.status,
          cor_destaque: formData.cor_destaque,
          assessor_responsavel: formData.assessor_responsavel,
          solicitado_por: formData.solicitado_por,
          alerta_sms: formData.alerta_sms,
        });
      } else {
        // Generate multiple agenda dates based on recurrence type up to data_limite_recorrencia
        const limitDt = new Date(`${formData.data_limite_recorrencia}T23:59:59`);
        let currentStart = new Date(startDt);

        let count = 0;
        const maxLimit = 100; // safety ceiling

        while (currentStart <= limitDt && count < maxLimit) {
          const currentEnd = new Date(currentStart.getTime() + durationMs);

          addAgenda({
            compromisso: `${formData.compromisso}${count > 0 ? ` (${count + 1}ª sessão)` : ''}`,
            pauta_descritivo: formData.pauta_descritivo,
            local: formData.local,
            link_maps: formData.link_maps || (formData.local ? `https://maps.google.com/?q=${encodeURIComponent(formData.local)}` : ''),
            data_inicio: currentStart.toISOString(),
            data_fim: currentEnd.toISOString(),
            visibilidade: formData.visibilidade,
            status: formData.status,
            cor_destaque: formData.cor_destaque,
            assessor_responsavel: formData.assessor_responsavel,
            solicitado_por: formData.solicitado_por,
            alerta_sms: formData.alerta_sms,
          });

          count++;

          // Increment date according to frequency
          switch (formData.recorrencia) {
            case 'DIARIA':
              currentStart.setDate(currentStart.getDate() + 1);
              break;
            case 'SEMANAL':
              currentStart.setDate(currentStart.getDate() + 7);
              break;
            case 'QUINZENAL':
              currentStart.setDate(currentStart.getDate() + 14);
              break;
            case 'MENSAL':
              currentStart.setMonth(currentStart.getMonth() + 1);
              break;
            case 'BIMESTRAL':
              currentStart.setMonth(currentStart.getMonth() + 2);
              break;
            case 'SEMESTRAL':
              currentStart.setMonth(currentStart.getMonth() + 6);
              break;
            case 'ANUAL':
              currentStart.setFullYear(currentStart.getFullYear() + 1);
              break;
            default:
              currentStart.setDate(currentStart.getDate() + 1);
          }
        }
      }
    }

    setIsModalOpen(false);
  };

  // Combine default commemorative events with birthdays from Gabinete Pessoas
  const combinedEventos: EventoComemorativo[] = [
    ...EVENTOS_COMEMORATIVOS_PADRAO,
    ...pessoas
      .filter((p) => p.data_nascimento)
      .map((p) => ({
        id: `ev-pessoa-${p.id}`,
        tipo: 'PESSOA' as const,
        titulo: `Aniversário de ${p.nome}${p.apelido ? ` (${p.apelido})` : ''}`,
        data: p.data_nascimento!,
        descricao: `Contato do Gabinete - ${p.categoria}. Celular: ${p.celular1 || 'Não informado'}`,
        localOuEstado: `${p.cidade || 'Paraná'} - ${p.uf || 'PR'}`,
        celular: p.celular1,
        nomePessoa: p.nome,
      })),
  ];

  const totalEventosMesAtual = combinedEventos.filter((ev) => getEventMonth(ev.data) === currentMonthStr).length;
  const pessoasAniversariantesMesAtual = combinedEventos.filter((ev) => ev.tipo === 'PESSOA' && getEventMonth(ev.data) === currentMonthStr).length;

  const filteredEventos = combinedEventos.filter((ev) => {
    // Filter by Event Type
    if (filterEventoTipo !== 'TODOS' && ev.tipo !== filterEventoTipo) return false;

    // Filter by Month
    const evMonth = getEventMonth(ev.data);
    if (filterMes === 'MES_ATUAL') {
      if (evMonth !== currentMonthStr) return false;
    } else if (filterMes !== 'TODOS') {
      if (evMonth !== filterMes) return false;
    }

    // Filter by Search Query
    if (searchTermEvents) {
      const q = searchTermEvents.toLowerCase();
      const matchTitulo = ev.titulo.toLowerCase().includes(q);
      const matchDesc = ev.descricao.toLowerCase().includes(q);
      const matchLocal = (ev.localOuEstado || '').toLowerCase().includes(q);
      if (!matchTitulo && !matchDesc && !matchLocal) return false;
    }

    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-['Inter']">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <CalendarIcon size={16} /> e-Gabinete • Compromissos & Pauta
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Agenda Parlamentar</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gestão integrada de compromissos públicos, reuniões reservadas, alertas da assessoria e datas comemorativas.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-2xl flex text-xs font-black">
            <button
              onClick={() => setActiveTab('compromissos')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'compromissos' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock size={14} /> Pauta de Compromissos
            </button>
            <button
              onClick={() => setActiveTab('aniversarios_eventos')}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'aniversarios_eventos' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cake size={14} /> Aniversários & Eventos ({combinedEventos.length})
            </button>
          </div>

          <button
            onClick={handleOpenNewModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 text-xs uppercase tracking-wider transition-all"
          >
            <Plus size={18} /> Novo Compromisso
          </button>
        </div>
      </div>

      {activeTab === 'compromissos' ? (
        <>
          {/* Filter & Date Selection Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Data do Compromisso (Padrão: Hoje)</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Visibilidade</label>
              <select
                value={filterVisibilidade}
                onChange={(e) => setFilterVisibilidade(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todas (Públicas & Reservadas)</option>
                <option value="PUBLICO">Públicas</option>
                <option value="RESERVADO">Reservadas (Gabinete)</option>
                <option value="PESSOAL">Pessoal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Assessor Responsável</label>
              <select
                value={filterAssessor}
                onChange={(e) => setFilterAssessor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos os Assessores</option>
                <option value="Marcelo Guaraldo">Marcelo Guaraldo</option>
                <option value="Nathalia Carvalho">Nathalia Carvalho</option>
                <option value="Saulo Vieira">Saulo Vieira</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSelectedDate(getTodayDateString());
                setFilterVisibilidade('TODOS');
                setFilterAssessor('TODOS');
              }}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Trazer Data Atual (Hoje)
            </button>
          </div>

          {/* Agenda Timeline List */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-black text-slate-900 text-xl flex items-center gap-2">
                <Clock className="text-blue-600" /> Agenda • {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Exibindo todos os eventos'}
              </h2>
              <span className="bg-blue-50 text-blue-800 text-xs font-black px-3 py-1 rounded-full">
                {filteredAgendas.length} compromisso(s)
              </span>
            </div>

            {filteredAgendas.length > 0 ? (
              <div className="space-y-4">
                {filteredAgendas.map((ag) => {
                  const horaInicio = ag.data_inicio.includes('T') ? ag.data_inicio.split('T')[1].substring(0, 5) : '09:00';
                  const horaFim = ag.data_fim.includes('T') ? ag.data_fim.split('T')[1].substring(0, 5) : '10:00';

                  return (
                    <div
                      key={ag.id}
                      style={{ borderLeftColor: ag.cor_destaque || '#005baa' }}
                      className="p-5 rounded-2xl border-l-8 border-y border-r border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="bg-slate-900 text-white font-black text-xs px-3 py-1 rounded-lg flex items-center gap-1.5">
                            <Clock size={12} /> {horaInicio} - {horaFim}
                          </span>

                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              ag.status === 'CONFIRMADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ag.status === 'PENDENTE'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {ag.status}
                          </span>

                          <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
                            {ag.visibilidade}
                          </span>

                          {ag.alerta_sms && (
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Send size={10} /> Alerta SMS ativo
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 text-lg">{ag.compromisso}</h3>

                        {ag.pauta_descritivo && (
                          <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                            {ag.pauta_descritivo}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                          {ag.local && (
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <MapPin size={14} className="text-rose-500" /> {ag.local}
                            </span>
                          )}
                          {ag.link_maps && (
                            <a
                              href={ag.link_maps}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                            >
                              Abrir Mapa / Waze <ExternalLink size={12} />
                            </a>
                          )}
                          {ag.assessor_responsavel && (
                            <span className="text-slate-500">Assessor: <strong>{ag.assessor_responsavel}</strong></span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap md:flex-col justify-end">
                        <button
                          onClick={() => handleOpenEditModal(ag)}
                          className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold p-2.5 rounded-xl transition-all flex items-center gap-1"
                          title="Editar compromisso"
                        >
                          <Edit2 size={16} /> <span className="md:hidden">Editar</span>
                        </button>
                        {ag.status !== 'CONFIRMADO' && (
                          <button
                            onClick={() => updateAgenda(ag.id, { status: 'CONFIRMADO' })}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
                          >
                            <CheckCircle2 size={14} /> Confirmar
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este compromisso?')) {
                              deleteAgenda(ag.id);
                            }
                          }}
                          className="bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-bold p-2.5 rounded-xl transition-all"
                          title="Excluir da agenda"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CalendarIcon size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-600">Nenhum compromisso para a data selecionada ({selectedDate}).</p>
                <p className="text-xs text-slate-400 mt-1">Clique em "Novo Compromisso" para adicionar à pauta.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Aniversários & Eventos Importantes Section */
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
          {/* Header & Quick Action Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="font-black text-slate-900 text-xl flex items-center gap-2">
                <Cake className="text-purple-600" /> Aniversários & Datas Comemorativas
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Organização de mensagens de parabéns para aniversariantes da base eleitoral, emancipações de municípios e efemérides.
              </p>
            </div>

            {/* Quick Month Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setFilterMes('MES_ATUAL')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                  filterMes === 'MES_ATUAL'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                    : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                }`}
              >
                <Cake size={14} /> 🎂 Mês Atual ({currentMonthName})
                <span className="bg-white/20 text-current px-2 py-0.5 rounded-md text-[10px] ml-1">
                  {totalEventosMesAtual}
                </span>
              </button>

              <button
                onClick={() => setFilterMes('TODOS')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                  filterMes === 'TODOS'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                📅 Todos os Meses
              </button>
            </div>
          </div>

          {/* Search Bar and Advanced Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Buscar por Nome, Apelido ou Cidade</label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ex: Maria, Curitiba, Machado..."
                  value={searchTermEvents}
                  onChange={(e) => setSearchTermEvents(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Month Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Filtrar por Mês Específico</label>
              <select
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="MES_ATUAL">✨ Mês Atual ({currentMonthName})</option>
                <option value="TODOS">📅 Todos os Meses</option>
                {MESES_NOME.map((m) => (
                  <option key={m.valor} value={m.valor}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo de Evento / Categoria</label>
              <select
                value={filterEventoTipo}
                onChange={(e) => setFilterEventoTipo(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="TODOS">Todos os Tipos de Eventos</option>
                <option value="PESSOA">🎉 Contatos & Lideranças da Base</option>
                <option value="CIDADE">🏛️ Aniversário de Cidades / Municípios</option>
                <option value="ESTADUAL_FEDERAL">🇧🇷 Feriados & Datas Estaduais/Federais</option>
                <option value="INTERNACIONAL">🌐 Eventos Internacionais</option>
                <option value="PERSONALIDADE">⭐ Personalidades de Destaque</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>
              Exibindo <strong>{filteredEventos.length}</strong> evento(s) / aniversariante(s)
              {filterMes === 'MES_ATUAL' ? ` em ${currentMonthName}` : filterMes !== 'TODOS' ? ` no mês selecionado` : ''}
            </span>
            {pessoasAniversariantesMesAtual > 0 && filterMes === 'MES_ATUAL' && (
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-[11px]">
                🎂 {pessoasAniversariantesMesAtual} contato(s) do gabinete fazendo aniversário este mês!
              </span>
            )}
          </div>

          {/* Events Grid */}
          {filteredEventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEventos.map((ev) => {
                const isCurrentMonth = getEventMonth(ev.data) === currentMonthStr;
                const eventDay = getEventDay(ev.data);
                const eventMonth = getEventMonth(ev.data);
                const monthObj = MESES_NOME.find((m) => m.valor === eventMonth);

                return (
                  <div
                    key={ev.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      isCurrentMonth
                        ? 'bg-purple-50/40 border-purple-200 shadow-xs hover:border-purple-400 hover:bg-white'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          ev.tipo === 'CIDADE'
                            ? 'bg-blue-100 text-blue-900'
                            : ev.tipo === 'ESTADUAL_FEDERAL'
                            ? 'bg-amber-100 text-amber-900'
                            : ev.tipo === 'INTERNACIONAL'
                            ? 'bg-emerald-100 text-emerald-900'
                            : ev.tipo === 'PERSONALIDADE'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}
                      >
                        {ev.tipo === 'PESSOA' ? '🎉 Liderança / Eleitor' : ev.tipo.replace('_', ' ')}
                      </span>

                      <div className="flex items-center gap-1">
                        {isCurrentMonth && (
                          <span className="bg-purple-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            Mês Atual
                          </span>
                        )}
                        <span className="bg-slate-900 text-white font-mono text-[11px] font-black px-2.5 py-0.5 rounded-md">
                          📅 {eventDay && monthObj ? `${eventDay} de ${monthObj.nome}` : ev.data}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-black text-slate-900 text-base">{ev.titulo}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                      {ev.descricao}
                    </p>

                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                      {ev.localOuEstado && (
                        <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <MapPin size={12} className="text-rose-500" /> {ev.localOuEstado}
                        </div>
                      )}

                      {/* WhatsApp Action Button for Person Celebrants */}
                      {ev.tipo === 'PESSOA' && ev.celular && (
                        <a
                          href={`https://wa.me/55${ev.celular.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá, ${ev.nomePessoa || 'amigo(a)'}! O Deputado e toda a equipe do Gabinete lhe desejam um Feliz Aniversário! Muita saúde, paz e muitas conquistas neste novo ano de vida! 🎂🎉`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold transition-all shadow-xs ml-auto"
                        >
                          <MessageSquare size={13} /> Enviar Parabéns
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Cake size={40} className="mx-auto text-purple-300 mb-2" />
              <p className="font-bold text-sm text-slate-600">Nenhum evento ou aniversariante encontrado com os filtros selecionados.</p>
              <p className="text-xs text-slate-400 mt-1">Tente trocar de mês ou alterar o termo de busca.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Cadastrar ou Editar Compromisso */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 my-8 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <CalendarIcon className="text-blue-600" /> {editingAgendaId ? 'Editar Compromisso' : 'Cadastrar Novo Compromisso'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Compromisso / Título *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reunião com Secretário da Saúde"
                  value={formData.compromisso}
                  onChange={(e) => setFormData({ ...formData, compromisso: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Data e Hora Início * (Padrão: Hoje)</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Data e Hora Término * (Padrão: Hoje)</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Recorrência de Datas (Apenas para novos compromissos) */}
              {!editingAgendaId && (
                <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-black text-xs">
                    <RefreshCw size={14} /> Recorrência de Compromissos
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-slate-700">Periodicidade</label>
                      <select
                        value={formData.recorrencia}
                        onChange={(e) => setFormData({ ...formData, recorrencia: e.target.value as TipoRecorrencia })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                      >
                        <option value="NENHUMA">Sem Recorrência (Evento Único)</option>
                        <option value="DIARIA">Diária</option>
                        <option value="SEMANAL">Semanal</option>
                        <option value="QUINZENAL">Quinzenal</option>
                        <option value="MENSAL">Mensal</option>
                        <option value="BIMESTRAL">Bimestral</option>
                        <option value="SEMESTRAL">Semestral</option>
                        <option value="ANUAL">Anual</option>
                      </select>
                    </div>

                    {formData.recorrencia !== 'NENHUMA' && (
                      <div>
                        <label className="block mb-1 text-slate-700">Repetir Até a Data Final</label>
                        <input
                          type="date"
                          required
                          value={formData.data_limite_recorrencia}
                          onChange={(e) => setFormData({ ...formData, data_limite_recorrencia: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1">Pauta / Descritivo do Compromisso</label>
                <textarea
                  rows={3}
                  placeholder="Detalhes dos assuntos a tratar..."
                  value={formData.pauta_descritivo}
                  onChange={(e) => setFormData({ ...formData, pauta_descritivo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Local</label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Paulista, 1636 ou Plenário"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Visibilidade</label>
                  <select
                    value={formData.visibilidade}
                    onChange={(e) => setFormData({ ...formData, visibilidade: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="PUBLICO">Público</option>
                    <option value="RESERVADO">Reservado (Interno)</option>
                    <option value="PESSOAL">Pessoal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Assessor Responsável</label>
                  <input
                    type="text"
                    value={formData.assessor_responsavel}
                    onChange={(e) => setFormData({ ...formData, assessor_responsavel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Cor do Destaque</label>
                  <input
                    type="color"
                    value={formData.cor_destaque}
                    onChange={(e) => setFormData({ ...formData, cor_destaque: e.target.value })}
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="alerta_sms"
                  checked={formData.alerta_sms}
                  onChange={(e) => setFormData({ ...formData, alerta_sms: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500"
                />
                <label htmlFor="alerta_sms" className="text-xs font-bold text-slate-800">
                  Notificar assessores via Alerta/SMS antes do evento
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-blue-600/20"
                >
                  {editingAgendaId ? 'Salvar Alterações' : 'Salvar Compromisso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
