'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  User, 
  Calendar, 
  FileText, 
  Layers, 
  Eye, 
  X, 
  Clock, 
  CheckCircle2,
  Trash2,
  Edit,
  PlusCircle,
  LogIn,
  SlidersHorizontal,
  ChevronRight,
  Database
} from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { useAuth } from '@/context/AuthContext';
import { getContrastTextColor } from '@/lib/colorUtils';
import { LogAuditoria, getStoredLogs, logActivity, TipoAcaoLog, EntidadeLog } from '@/lib/auditLogStore';

export default function LogsAuditoriaPage() {
  const { selectedDeputado } = useDeputado();
  const { user } = useAuth();
  
  const partyPrimary = selectedDeputado?.partidos?.cor_primaria || '#005baa';
  const partySecondary = selectedDeputado?.partidos?.cor_secundaria || '#002776';
  const partyPrimaryText = getContrastTextColor(partyPrimary);

  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAcao, setFilterAcao] = useState<string>('TODAS');
  const [filterSeveridade, setFilterSeveridade] = useState<string>('TODAS');
  const [filterEntidade, setFilterEntidade] = useState<string>('TODAS');
  const [filterPeriodo, setFilterPeriodo] = useState<string>('TODOS');
  const [selectedLog, setSelectedLog] = useState<LogAuditoria | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load audit logs
  const loadLogs = () => {
    const data = getStoredLogs();
    setLogs(data);
  };

  useEffect(() => {
    loadLogs();

    // Listen for new log events in real-time
    const handleNewLog = () => loadLogs();
    window.addEventListener('dd-new-audit-log', handleNewLog);
    return () => window.removeEventListener('dd-new-audit-log', handleNewLog);
  }, []);

  // Filter logs
  const filteredLogs = useMemo(() => {
    const now = new Date().getTime();
    return logs.filter((log) => {
      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesDesc = log.descricao.toLowerCase().includes(term);
        const matchesUser = log.usuario_nome.toLowerCase().includes(term) || log.usuario_email.toLowerCase().includes(term);
        const matchesEntity = log.entidade.toLowerCase().includes(term);
        if (!matchesDesc && !matchesUser && !matchesEntity) return false;
      }

      // Action filter
      if (filterAcao !== 'TODAS' && log.acao !== filterAcao) return false;

      // Severity filter ('CRITICA', 'IMPORTANTE', 'NORMAL')
      if (filterSeveridade !== 'TODAS') {
        const logSeverity = log.severidade || (log.acao === 'EXCLUSAO' ? 'CRITICA' : log.acao === 'EDICAO' ? 'IMPORTANTE' : 'NORMAL');
        if (filterSeveridade === 'CRITICA') {
          if (log.severidade !== 'CRITICA' && log.acao !== 'EXCLUSAO') return false;
        } else if (logSeverity !== filterSeveridade) {
          return false;
        }
      }

      // Entity filter
      if (filterEntidade !== 'TODAS' && log.entidade !== filterEntidade) return false;

      // Period filter
      if (filterPeriodo !== 'TODOS') {
        const logTime = new Date(log.created_at).getTime();
        const diffHours = (now - logTime) / (1000 * 60 * 60);

        if (filterPeriodo === 'HOJE' && diffHours > 24) return false;
        if (filterPeriodo === '7DIAS' && diffHours > 24 * 7) return false;
        if (filterPeriodo === '30DIAS' && diffHours > 24 * 30) return false;
      }

      return true;
    });
  }, [logs, searchTerm, filterAcao, filterSeveridade, filterEntidade, filterPeriodo]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const now = new Date().getTime();
    const todayLogs = logs.filter(l => (now - new Date(l.created_at).getTime()) <= 24 * 60 * 60 * 1000);
    const criticalLogs = logs.filter(l => l.severidade === 'CRITICA' || l.acao === 'EXCLUSAO');
    const uniqueUsers = new Set(logs.map(l => l.usuario_email)).size;

    return {
      total,
      today: todayLogs.length,
      critical: criticalLogs.length,
      users: uniqueUsers,
    };
  }, [logs]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Data/Hora', 'Usuário', 'Email', 'Ação', 'Entidade', 'Severidade', 'Descrição'];
    const rows = filteredLogs.map((l) => [
      l.id,
      new Date(l.created_at).toLocaleString('pt-BR'),
      `"${l.usuario_nome}"`,
      l.usuario_email,
      l.acao,
      l.entidade,
      l.severidade || 'NORMAL',
      `"${l.descricao.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `logs_auditoria_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to render Action Badge
  const renderActionBadge = (acao: TipoAcaoLog) => {
    switch (acao) {
      case 'CRIACAO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg bg-emerald-600 text-white shadow-xs">
            <PlusCircle size={13} />
            Criação
          </span>
        );
      case 'EDICAO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-100 text-blue-800 border border-blue-300">
            <Edit size={13} />
            Edição
          </span>
        );
      case 'EXCLUSAO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black rounded-lg bg-rose-600 text-white shadow-xs">
            <Trash2 size={13} />
            Exclusão
          </span>
        );
      case 'STATUS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
            <SlidersHorizontal size={13} />
            Status
          </span>
        );
      case 'LOGIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-100 text-purple-800 border border-purple-300">
            <LogIn size={13} />
            Login
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-200 text-slate-800 border border-slate-300">
            <LogOut size={13} />
            Logout
          </span>
        );
      case 'EXPORTACAO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-100 text-cyan-800 border border-cyan-300">
            <Download size={13} />
            Exportação
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
            {acao}
          </span>
        );
    }
  };

  // Helper function to render Severity Badge
  const renderSeverityBadge = (severidade?: 'NORMAL' | 'IMPORTANTE' | 'CRITICA', acao?: TipoAcaoLog) => {
    const sev = severidade || (acao === 'EXCLUSAO' ? 'CRITICA' : acao === 'EDICAO' ? 'IMPORTANTE' : 'NORMAL');
    switch (sev) {
      case 'CRITICA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-black rounded-lg bg-rose-100 text-rose-800 border-2 border-rose-400 shadow-xs">
            <AlertTriangle size={12} className="text-rose-600 animate-pulse" />
            CRÍTICA
          </span>
        );
      case 'IMPORTANTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
            <ShieldCheck size={11} className="text-amber-700" />
            IMPORTANTE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            NORMAL
          </span>
        );
    }
  };

  // Helper function to render Entity Badge
  const renderEntityBadge = (entidade: EntidadeLog) => {
    return (
      <span className="px-2 py-0.5 text-[11px] font-black uppercase tracking-wider rounded-md bg-slate-100 text-slate-700 border border-slate-200">
        {entidade}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div 
        className="rounded-2xl p-6 shadow-xl border border-white/20 relative overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${partyPrimary} 0%, ${partySecondary} 100%)`,
          color: partyPrimaryText
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                <History size={26} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight font-headline">
                  Logs de Auditoria & Rastreabilidade
                </h1>
                <p className="text-xs md:text-sm font-medium opacity-90">
                  Rastreamento completo e cronológico de alterações críticas (quem alterou, o que e quando).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              type="button"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white shadow-xs backdrop-blur-md active:scale-95 transition-all"
            >
              <Download size={15} />
              Exportar CSV
            </button>
            <button
              onClick={loadLogs}
              type="button"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 shadow-md active:scale-95 transition-all hover:bg-slate-100"
            >
              <RefreshCw size={15} />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Database size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Registros</p>
            <p className="text-xl font-black text-slate-800">{metrics.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ações Hoje</p>
            <p className="text-xl font-black text-emerald-600">{metrics.today}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ações Críticas</p>
            <p className="text-xl font-black text-rose-600">{metrics.critical}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <User size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Usuários Ativos</p>
            <p className="text-xl font-black text-purple-600">{metrics.users}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Quick Filter Buttons / Badges */}
        <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-100">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter size={12} /> Filtros Rápidos:
          </span>
          <button
            type="button"
            onClick={() => setFilterSeveridade(prev => prev === 'CRITICA' ? 'TODAS' : 'CRITICA')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              filterSeveridade === 'CRITICA'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle size={13} className={filterSeveridade === 'CRITICA' ? 'animate-bounce' : 'text-rose-600'} />
            🚨 Filtrar Ações Críticas & Exclusões ({metrics.critical})
          </button>
          
          <button
            type="button"
            onClick={() => setFilterAcao(prev => prev === 'EXCLUSAO' ? 'TODAS' : 'EXCLUSAO')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterAcao === 'EXCLUSAO'
                ? 'bg-rose-700 text-white shadow-md ring-2 ring-rose-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Trash2 size={13} />
            Apenas Exclusões
          </button>

          <button
            type="button"
            onClick={() => setFilterAcao(prev => prev === 'CRIACAO' ? 'TODAS' : 'CRIACAO')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterAcao === 'CRIACAO'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <PlusCircle size={13} />
            Apenas Criações
          </button>

          {(filterAcao !== 'TODAS' || filterSeveridade !== 'TODAS' || filterEntidade !== 'TODAS' || filterPeriodo !== 'TODOS' || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterAcao('TODAS');
                setFilterSeveridade('TODAS');
                setFilterEntidade('TODAS');
                setFilterPeriodo('TODOS');
              }}
              className="ml-auto text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 hover:underline"
            >
              <X size={13} /> Limpar Todos os Filtros
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por descrição, usuário, email ou processo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Select Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Severidade Component */}
            <select
              value={filterSeveridade}
              onChange={(e) => setFilterSeveridade(e.target.value)}
              className={`px-3 py-2 text-xs font-black rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                filterSeveridade === 'CRITICA'
                  ? 'bg-rose-100 border-rose-400 text-rose-800 ring-1 ring-rose-400'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="TODAS">Todas as Severidades</option>
              <option value="CRITICA">🚨 Severidade: CRÍTICA (Exclusões / Sensíveis)</option>
              <option value="IMPORTANTE">⚠️ Severidade: IMPORTANTE</option>
              <option value="NORMAL">ℹ️ Severidade: NORMAL</option>
            </select>

            {/* Filter Ação */}
            <select
              value={filterAcao}
              onChange={(e) => setFilterAcao(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODAS">Todas as Ações</option>
              <option value="CRIACAO">Criação (Verde)</option>
              <option value="EDICAO">Edição (Azul)</option>
              <option value="EXCLUSAO">Exclusão (Vermelho)</option>
              <option value="STATUS">Alteração de Status</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="EXPORTACAO">Exportação</option>
            </select>

            {/* Filter Entidade */}
            <select
              value={filterEntidade}
              onChange={(e) => setFilterEntidade(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODAS">Todas as Entidades</option>
              <option value="DEMANDA">Demandas</option>
              <option value="AUDIENCIA">Audiências</option>
              <option value="EMENDA">Emendas</option>
              <option value="PROJETO">Projetos</option>
              <option value="EDITAL">Editais</option>
              <option value="AGENDA">Agenda</option>
              <option value="PESSOA">Pessoas / Cadastros</option>
              <option value="USUARIO">Usuários</option>
              <option value="CONFIGURACAO">Configurações</option>
            </select>

            {/* Filter Período */}
            <select
              value={filterPeriodo}
              onChange={(e) => setFilterPeriodo(e.target.value)}
              className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TODOS">Qualquer Período</option>
              <option value="HOJE">Últimas 24 Horas</option>
              <option value="7DIAS">Últimos 7 Dias</option>
              <option value="30DIAS">Últimos 30 Dias</option>
            </select>
          </div>
        </div>

        {/* Filter Count Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Exibindo <strong>{filteredLogs.length}</strong> de <strong>{logs.length}</strong> eventos registrados</span>
          {(filterAcao !== 'TODAS' || filterSeveridade !== 'TODAS' || filterEntidade !== 'TODAS' || filterPeriodo !== 'TODOS' || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterAcao('TODAS');
                setFilterSeveridade('TODAS');
                setFilterEntidade('TODAS');
                setFilterPeriodo('TODOS');
              }}
              className="text-blue-600 hover:underline font-bold"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Data & Horário</th>
                <th className="py-3 px-4">Quem Alterou (Usuário)</th>
                <th className="py-3 px-4">Ação</th>
                <th className="py-3 px-4">Severidade</th>
                <th className="py-3 px-4">Entidade</th>
                <th className="py-3 px-4">O Que Foi Alterado (Descrição)</th>
                <th className="py-3 px-4 text-center">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <History size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-slate-600">Nenhum registro de log encontrado</p>
                    <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros de busca ou período.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const date = new Date(log.created_at);
                  const isRecent = (new Date().getTime() - date.getTime()) < 1000 * 60 * 60; // < 1h
                  const isCritical = log.severidade === 'CRITICA' || log.acao === 'EXCLUSAO';
                  const isCreation = log.acao === 'CRIACAO';

                  let rowStyle = 'hover:bg-slate-50/80 transition-colors';
                  if (isCritical) {
                    rowStyle = 'bg-rose-50/40 hover:bg-rose-50/70 border-l-4 border-l-rose-500 transition-colors';
                  } else if (isCreation) {
                    rowStyle = 'bg-emerald-50/20 hover:bg-emerald-50/50 border-l-4 border-l-emerald-500 transition-colors';
                  } else if (log.acao === 'EDICAO') {
                    rowStyle = 'hover:bg-slate-50/80 border-l-2 border-l-blue-400 transition-colors';
                  }

                  return (
                    <tr 
                      key={log.id} 
                      className={rowStyle}
                    >
                      {/* Data & Horário */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-black text-slate-800">
                          {date.toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <Clock size={11} />
                          {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>

                      {/* Usuário */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-800 flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 text-[10px] font-black shrink-0">
                            {log.usuario_nome?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="truncate max-w-[150px]">{log.usuario_nome}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium truncate max-w-[160px]">
                          {log.usuario_email}
                        </div>
                      </td>

                      {/* Ação */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderActionBadge(log.acao)}
                      </td>

                      {/* Severidade */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderSeverityBadge(log.severidade, log.acao)}
                      </td>

                      {/* Entidade */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderEntityBadge(log.entidade)}
                      </td>

                      {/* Descrição */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 leading-snug line-clamp-2 max-w-md">
                          {log.descricao}
                        </p>
                        {log.detalhes?.campo_alterado && (
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium flex items-center gap-2">
                            <span>Campo: <strong>{log.detalhes.campo_alterado}</strong></span>
                            {log.detalhes.valor_anterior !== undefined && (
                              <span className="text-slate-400 line-through">
                                {String(log.detalhes.valor_anterior)}
                              </span>
                            )}
                            {log.detalhes.valor_novo !== undefined && (
                              <span className="text-emerald-600 font-black">
                                → {String(log.detalhes.valor_novo)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsDetailModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Inspecionar Detalhes do Log"
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">Inspecionar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Log */}
      {isDetailModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">Detalhes do Log de Auditoria</h3>
                  <p className="text-[11px] text-slate-400 font-medium">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Quem Alterou */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Quem Alterou</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    {selectedLog.usuario_nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{selectedLog.usuario_nome}</h4>
                    <p className="text-xs text-slate-500 font-medium">{selectedLog.usuario_email}</p>
                    {selectedLog.usuario_cargo && (
                      <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                        {selectedLog.usuario_cargo}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* O que e Quando */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Ação / Tipo</p>
                  <div>{renderActionBadge(selectedLog.acao)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Entidade</p>
                  <div>{renderEntityBadge(selectedLog.entidade)}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Quando (Timestamp)</p>
                <p className="text-xs font-black text-slate-800">
                  {new Date(selectedLog.created_at).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'medium' })}
                </p>
              </div>

              {/* Descrição Detalhada */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Descrição do Evento</p>
                <p className="text-sm font-bold text-slate-800 leading-relaxed">{selectedLog.descricao}</p>
              </div>

              {/* Payload / Metadados JSON */}
              {selectedLog.detalhes && (
                <div className="p-4 bg-slate-900 rounded-xl text-slate-200 text-xs font-mono">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 font-sans">
                    Metadados & Snapshot dos Dados (JSON)
                  </p>
                  <pre className="overflow-x-auto p-2 bg-slate-950 rounded-lg text-emerald-400 text-[11px] leading-relaxed">
                    {JSON.stringify(selectedLog.detalhes, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-black bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors"
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
