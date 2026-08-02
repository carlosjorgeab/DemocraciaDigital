'use client';

import { useState } from 'react';
import { useGabinete } from '@/context/GabineteContext';
import {
  Calendar as CalendarIcon, Plus, MapPin, Clock, Shield, AlertCircle,
  CheckCircle2, XCircle, Search, Filter, Share2, ExternalLink, MessageSquare,
  Users, Trash2, Edit2, AlertTriangle, Send
} from 'lucide-react';

export default function AgendaPage() {
  const { agendas, addAgenda, updateAgenda, deleteAgenda } = useGabinete();

  const [filterVisibilidade, setFilterVisibilidade] = useState<string>('TODOS');
  const [filterAssessor, setFilterAssessor] = useState<string>('TODOS');
  const [selectedDate, setSelectedDate] = useState<string>('2023-12-15'); // default date for demo match
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    compromisso: '',
    pauta_descritivo: '',
    local: '',
    link_maps: '',
    data_inicio: '2023-12-15T09:00',
    data_fim: '2023-12-15T10:00',
    visibilidade: 'PUBLICO' as 'PUBLICO' | 'RESERVADO' | 'PESSOAL',
    status: 'CONFIRMADO' as 'CONFIRMADO' | 'PENDENTE' | 'CANCELADO' | 'REALIZADO',
    cor_destaque: '#005baa',
    assessor_responsavel: 'Marcelo Guaraldo',
    solicitado_por: '',
    alerta_sms: false,
  });

  const filteredAgendas = agendas.filter((ag) => {
    if (filterVisibilidade !== 'TODOS' && ag.visibilidade !== filterVisibilidade) return false;
    if (filterAssessor !== 'TODOS' && ag.assessor_responsavel !== filterAssessor) return false;
    if (selectedDate && !ag.data_inicio.startsWith(selectedDate)) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAgenda({
      compromisso: formData.compromisso,
      pauta_descritivo: formData.pauta_descritivo,
      local: formData.local,
      link_maps: formData.link_maps || `https://maps.google.com/?q=${encodeURIComponent(formData.local)}`,
      data_inicio: new Date(formData.data_inicio).toISOString(),
      data_fim: new Date(formData.data_fim).toISOString(),
      visibilidade: formData.visibilidade,
      status: formData.status,
      cor_destaque: formData.cor_destaque,
      assessor_responsavel: formData.assessor_responsavel,
      solicitado_por: formData.solicitado_por,
      alerta_sms: formData.alerta_sms,
    });
    setIsModalOpen(false);
    setFormData({
      compromisso: '',
      pauta_descritivo: '',
      local: '',
      link_maps: '',
      data_inicio: '2023-12-15T09:00',
      data_fim: '2023-12-15T10:00',
      visibilidade: 'PUBLICO',
      status: 'CONFIRMADO',
      cor_destaque: '#005baa',
      assessor_responsavel: 'Marcelo Guaraldo',
      solicitado_por: '',
      alerta_sms: false,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-['Inter']">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <CalendarIcon size={16} /> e-Gabinete • Compromissos
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Agenda do Parlamentar</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gestão integrada de compromissos públicos, reuniões reservadas e alertas da assessoria.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 text-xs uppercase tracking-wider transition-all"
        >
          <Plus size={18} /> Novo Compromisso
        </button>
      </div>

      {/* Filter & Date Selection Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Data do Compromisso</label>
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
            setSelectedDate('');
            setFilterVisibilidade('TODOS');
            setFilterAssessor('TODOS');
          }}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
        >
          Limpar Filtros
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
                    {ag.status !== 'CONFIRMADO' && (
                      <button
                        onClick={() => updateAgenda(ag.id, { status: 'CONFIRMADO' })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Confirmar
                      </button>
                    )}
                    <button
                      onClick={() => deleteAgenda(ag.id)}
                      className="bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-xs font-bold p-2 rounded-xl transition-all"
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
            <p className="font-bold text-sm text-slate-600">Nenhum compromisso para os filtros selecionados.</p>
            <p className="text-xs text-slate-400 mt-1">Clique em "Novo Compromisso" para adicionar à pauta.</p>
          </div>
        )}
      </div>

      {/* Modal: Cadastrar Compromisso */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 my-8 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <CalendarIcon className="text-blue-600" /> Cadastrar Novo Compromisso
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
                  <label className="block mb-1">Data e Hora Início *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Data e Hora Término *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

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
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
