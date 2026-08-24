'use client';

import { useState } from 'react';
import { useGabinete } from '@/context/GabineteContext';
import { useDeputado } from '@/context/DeputadoContext';
import { getContrastTextColor } from '@/lib/colorUtils';
import { AtendimentoDemanda } from '@/lib/gabineteStore';
import {
  FolderKanban, Plus, Search, Filter, Printer, BarChart3,
  CheckCircle2, AlertTriangle, Clock, ArrowRight, UserCheck,
  Building, Shield, FileText, Trash2, Edit2, Download, Tag, X
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const getTodayDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function DemandasPage() {
  const { selectedDeputado } = useDeputado();
  const partyPrimary = selectedDeputado?.partidos?.cor_primaria || '#005baa';
  const partySecondary = selectedDeputado?.partidos?.cor_secundaria || '#002776';
  const partyTertiary = selectedDeputado?.partidos?.cor_terciaria || '#009C3B';
  const partyPrimaryText = getContrastTextColor(partyPrimary);

  const { 
    demandas, 
    addDemanda, 
    updateDemanda, 
    deleteDemanda, 
    pessoas, 
    tiposAtendimento = [], 
    addTipoAtendimento 
  } = useGabinete();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterPrioridade, setFilterPrioridade] = useState<string>('TODOS');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDemandaId, setEditingDemandaId] = useState<string | null>(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  // Modal / Popup state for Cadastrar Novo Tipo de Atendimento
  const [isNovoTipoModalOpen, setIsNovoTipoModalOpen] = useState(false);
  const [novoTipoNome, setNovoTipoNome] = useState('');

  // Assessores list from Pessoas e Entidades (categoria ASSESSOR)
  const assessoresPessoas = pessoas.filter((p) => p.categoria === 'ASSESSOR');
  const defaultAssessorNome = assessoresPessoas.length > 0 
    ? assessoresPessoas[0].nome 
    : 'Marcelo Guaraldo';

  // Form State with Data e Horario defaulting to Current Date and Time (Today)
  const [formData, setFormData] = useState({
    processo: `28${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear()}`,
    interessado_nome: '',
    assunto: '',
    tipo_atendimento: tiposAtendimento[0] || 'Saúde',
    destinatario_orgao: 'Secretaria de Saúde',
    prioridade: 'Normal',
    status: 'CADASTRADO' as any,
    valor_estimado: 0,
    assessor_responsavel: defaultAssessorNome,
    data_abertura: getTodayDateTimeString(),
  });

  const handleOpenNewModal = () => {
    setEditingDemandaId(null);
    setFormData({
      processo: `28${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear()}`,
      interessado_nome: '',
      assunto: '',
      tipo_atendimento: tiposAtendimento[0] || 'Saúde',
      destinatario_orgao: 'Secretaria de Saúde',
      prioridade: 'Normal',
      status: 'CADASTRADO',
      valor_estimado: 0,
      assessor_responsavel: defaultAssessorNome,
      data_abertura: getTodayDateTimeString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dem: AtendimentoDemanda) => {
    setEditingDemandaId(dem.id);
    setFormData({
      processo: dem.processo,
      interessado_nome: dem.interessado_nome,
      assunto: dem.assunto,
      tipo_atendimento: dem.tipo_atendimento,
      destinatario_orgao: dem.destinatario_orgao || '',
      prioridade: dem.prioridade,
      status: dem.status,
      valor_estimado: dem.valor_estimado || 0,
      assessor_responsavel: dem.assessor_responsavel || defaultAssessorNome,
      data_abertura: dem.data_abertura ? dem.data_abertura.substring(0, 16) : getTodayDateTimeString(),
    });
    setIsModalOpen(true);
  };

  // Handler for adding a new Tipo de Atendimento through popup
  const handleSalvarNovoTipo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = novoTipoNome.trim();
    if (trimmed) {
      if (addTipoAtendimento) {
        addTipoAtendimento(trimmed);
      }
      setFormData((prev) => ({ ...prev, tipo_atendimento: trimmed }));
      setNovoTipoNome('');
      setIsNovoTipoModalOpen(false);
    }
  };

  const filteredDemandas = demandas.filter((dem) => {
    if (filterStatus !== 'TODOS' && dem.status !== filterStatus) return false;
    if (filterPrioridade !== 'TODOS' && dem.prioridade !== filterPrioridade) return false;
    if (filterTipo !== 'TODOS' && dem.tipo_atendimento !== filterTipo) return false;
    if (
      searchTerm &&
      !dem.processo.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !dem.interessado_nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !dem.assunto.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDemandaId) {
      updateDemanda(editingDemandaId, {
        processo: formData.processo,
        interessado_nome: formData.interessado_nome,
        assunto: formData.assunto,
        tipo_atendimento: formData.tipo_atendimento,
        destinatario_orgao: formData.destinatario_orgao,
        prioridade: formData.prioridade,
        status: formData.status,
        valor_estimado: Number(formData.valor_estimado) || 0,
        assessor_responsavel: formData.assessor_responsavel,
        data_abertura: new Date(formData.data_abertura).toISOString(),
      });
    } else {
      addDemanda({
        processo: formData.processo,
        interessado_nome: formData.interessado_nome,
        assunto: formData.assunto,
        tipo_atendimento: formData.tipo_atendimento,
        destinatario_orgao: formData.destinatario_orgao,
        prioridade: formData.prioridade,
        status: formData.status,
        valor_estimado: Number(formData.valor_estimado) || 0,
        assessor_responsavel: formData.assessor_responsavel,
        data_abertura: new Date(formData.data_abertura).toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  // Recharts Chart Data
  const statusCounts = demandas.reduce((acc: any, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts).map((key) => ({
    name: key.replace('_', ' '),
    value: statusCounts[key],
  }));

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-['Inter']">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div style={{ color: partyPrimary }} className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <FolderKanban size={16} /> e-Gabinete • Atendimentos
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Gestão de Demandas & Pleitos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Acompanhamento de processos, requerimentos de cidadãos, entidades e lideranças comunitárias.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsChartModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-3 rounded-2xl flex items-center gap-2 text-xs uppercase tracking-wider transition-all"
          >
            <BarChart3 size={16} /> Análise Gráfica
          </button>
          <button
            onClick={handleOpenNewModal}
            style={{ backgroundColor: partyPrimary, color: partyPrimaryText }}
            className="font-black px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg hover:opacity-90 text-xs uppercase tracking-wider transition-all"
          >
            <Plus size={18} /> Cadastrar Nova Demanda
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative sm:col-span-2 md:col-span-1">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Processo, Interessado ou Assunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODOS">Todos os Tipos / Áreas</option>
              {tiposAtendimento.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="CADASTRADO">Cadastrado</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="ENCAMINHADO">Encaminhado</option>
              <option value="ATENDIDO">Atendido</option>
              <option value="ATENDIDO_PARCIALMENTE">Atendido Parcialmente</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div>
            <select
              value={filterPrioridade}
              onChange={(e) => setFilterPrioridade(e.target.value)}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="TODOS">Todas Prioridades</option>
              <option value="Normal">Normal</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Demandas Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
            <FolderKanban className="text-amber-500" /> Tabela de Processos ({filteredDemandas.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Exibindo {filteredDemandas.length} de {demandas.length} demandas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th className="p-4 pl-6">Processo</th>
                <th className="p-4">Data / Abertura</th>
                <th className="p-4">Interessado</th>
                <th className="p-4">Tipo / Área</th>
                <th className="p-4">Prioridade</th>
                <th className="p-4">Status</th>
                <th className="p-4">Responsável</th>
                <th className="p-4 pr-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
              {filteredDemandas.length > 0 ? (
                filteredDemandas.map((dem) => (
                  <tr key={dem.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-black text-slate-900">
                      <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px]">
                        {dem.processo}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-[11px] font-mono">
                      {dem.data_abertura ? new Date(dem.data_abertura).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Dia Atual'}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{dem.interessado_nome}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{dem.assunto}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-md text-[10px]">
                        {dem.tipo_atendimento}
                      </span>
                      {dem.destinatario_orgao && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">{dem.destinatario_orgao}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-black px-2.5 py-1 rounded-md text-[10px] ${
                          dem.prioridade === 'Urgente'
                            ? 'bg-red-500 text-white animate-pulse'
                            : dem.prioridade === 'Alta'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {dem.prioridade}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-black px-2.5 py-1 rounded-full text-[10px] uppercase ${
                          dem.status === 'ATENDIDO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : dem.status === 'EM_ANDAMENTO'
                            ? 'bg-blue-100 text-blue-800'
                            : dem.status === 'ENCAMINHADO'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {dem.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-600">{dem.assessor_responsavel}</td>
                    <td className="p-4 pr-6 text-right space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(dem)}
                        className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-xl transition-all"
                        title="Editar Demanda"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() =>
                          updateDemanda(dem.id, {
                            status: dem.status === 'ATENDIDO' ? 'EM_ANDAMENTO' : 'ATENDIDO',
                          })
                        }
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-all font-bold text-[10px]"
                        title="Alternar Atendido"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este processo de demanda?')) {
                            deleteDemanda(dem.id);
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    Nenhuma demanda encontrada com estes critérios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastrar ou Editar Demanda */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 my-8 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FolderKanban className="text-amber-500" /> {editingDemandaId ? 'Editar Atendimento / Demanda' : 'Cadastrar Atendimento / Demanda'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Data e Horário do Atendimento * (Padrão: Hoje)</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.data_abertura}
                    onChange={(e) => setFormData({ ...formData, data_abertura: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1">Prioridade</label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Número do Processo / Protocolo *</label>
                <input
                  type="text"
                  required
                  value={formData.processo}
                  onChange={(e) => setFormData({ ...formData, processo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1">Nome do Interessado / Solicitante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Associação de Moradores do Bairro X ou Marcelo Silva"
                  value={formData.interessado_nome}
                  onChange={(e) => setFormData({ ...formData, interessado_nome: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block mb-1">Assunto / Descritivo do Pleito *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalhamento da solicitação do cidadão ou entidade..."
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block">Tipo de Atendimento / Área *</label>
                    <button
                      type="button"
                      onClick={() => setIsNovoTipoModalOpen(true)}
                      className="text-[10px] font-black text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all"
                    >
                      <Plus size={10} /> Novo Tipo
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={formData.tipo_atendimento}
                      onChange={(e) => {
                        if (e.target.value === '__CADASTRAR_NOVO__') {
                          setIsNovoTipoModalOpen(true);
                        } else {
                          setFormData({ ...formData, tipo_atendimento: e.target.value });
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {tiposAtendimento.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                      <option value="__CADASTRAR_NOVO__" className="text-amber-700 font-bold bg-amber-50">
                        ➕ + Cadastrar Novo Tipo / Área...
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Órgão / Secretaria Destino</label>
                  <input
                    type="text"
                    placeholder="Ex: Secretaria de Saúde - SP"
                    value={formData.destinatario_orgao}
                    onChange={(e) => setFormData({ ...formData, destinatario_orgao: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Status Inicial</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="CADASTRADO">Cadastrado</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="ENCAMINHADO">Encaminhado</option>
                    <option value="ATENDIDO">Atendido</option>
                    <option value="ATENDIDO_PARCIALMENTE">Atendido Parcialmente</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block">Assessor Responsável *</label>
                    <span className="text-[10px] text-indigo-600 font-bold">Base de Assessores</span>
                  </div>
                  <select
                    value={formData.assessor_responsavel}
                    onChange={(e) => setFormData({ ...formData, assessor_responsavel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {assessoresPessoas.length > 0 ? (
                      assessoresPessoas.map((assessor) => (
                        <option key={assessor.id} value={assessor.nome}>
                          {assessor.nome} {assessor.apelido ? `(${assessor.apelido})` : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Marcelo Guaraldo">Marcelo Guaraldo (Chefe de Gabinete)</option>
                        <option value="Dr. Carlos Eduardo">Dr. Carlos Eduardo (Assessor Jurídico)</option>
                        <option value="Ana Cláudia Vieira">Ana Cláudia Vieira (Assessora Parlamentar)</option>
                        <option value="Roberto Santos">Roberto Santos (Betão) (Articulador Regional)</option>
                      </>
                    )}
                  </select>
                </div>
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
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs tracking-wider shadow-lg shadow-amber-500/20"
                >
                  {editingDemandaId ? 'Salvar Alterações' : 'Salvar Demanda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup / Modal: Cadastrar Novo Tipo de Atendimento / Área */}
      {isNovoTipoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[150] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-6 md:p-7 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Novo Tipo de Atendimento</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Cadastre uma nova área temática para as demandas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNovoTipoModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoTipo} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1.5 text-slate-800">Nome da Área / Tipo de Atendimento *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Iluminação Pública, Meio Ambiente, Esportes..."
                  value={novoTipoNome}
                  onChange={(e) => setNovoTipoNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm placeholder:font-normal"
                />
              </div>

              {/* Existing Types Quick View */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Tipos já cadastrados ({tiposAtendimento.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
                  {tiposAtendimento.map((tipo) => (
                    <span key={tipo} className="px-2 py-1 rounded-lg bg-white text-slate-700 border border-slate-200 text-[10px] font-bold">
                      {tipo}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setNovoTipoNome('');
                    setIsNovoTipoModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs tracking-wider shadow-md shadow-amber-500/20"
                >
                  Cadastrar & Selecionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Análise Gráfica */}
      {isChartModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="text-amber-500" /> Distribuição de Atendimentos por Status
              </h2>
              <button
                onClick={() => setIsChartModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsChartModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
