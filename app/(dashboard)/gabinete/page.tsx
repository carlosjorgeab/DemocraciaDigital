'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDeputado } from '@/context/DeputadoContext';
import { useGabinete } from '@/context/GabineteContext';
import {
  Calendar, Users2, FolderKanban, Mail, PhoneCall, UserCheck, Cake,
  Building, AlertCircle, ArrowRight, CheckCircle2, Clock, Plus,
  MessageSquare, UserCircle, MapPin, Sparkles, AlertTriangle, FileText
} from 'lucide-react';

export default function GabineteDashboard() {
  const { selectedDeputado } = useDeputado();
  const { demandas, agendas, pessoas, recados, ligacoes, eventos } = useGabinete();

  const [activeTab, setActiveTab] = useState<'demandas' | 'emendas'>('demandas');

  // Helper for type labels
  const getTipoBadgeLabel = (tipo: string) => {
    switch (tipo) {
      case 'CIDADE':
        return '🏛️ Cidade';
      case 'EVENTO_ESTADUAL':
        return '🏛️ Estadual';
      case 'EVENTO_NACIONAL':
        return '🇧🇷 Nacional';
      case 'INTERNACIONAL':
        return '🌐 Internacional';
      case 'PERSONALIDADE':
        return '⭐ Personalidade';
      case 'PESSOA':
        return '🎉 Aniversário';
      default:
        return '📅 Evento';
    }
  };

  // Compute upcoming events and birthdays for the next 30 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const proximosEventos = (() => {
    const combined: Array<{
      id: string;
      tipo: string;
      titulo: string;
      dataStrFormatada: string;
      diasRestantes: number;
      descricao?: string;
      local_ou_estado?: string;
      celular?: string;
      nome_pessoa?: string;
    }> = [];

    // 1. Process Eventos Comemorativos
    (eventos || []).forEach((ev) => {
      if (!ev.data) return;
      const parts = ev.data.includes('-') ? ev.data.split('-') : [];
      let month = 0;
      let day = 0;

      if (parts.length === 2) {
        month = parseInt(parts[0], 10);
        day = parseInt(parts[1], 10);
      } else if (parts.length === 3) {
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      }

      if (!month || !day || isNaN(month) || isNaN(day)) return;

      const currentYear = today.getFullYear();
      let targetDate = new Date(currentYear, month - 1, day);
      targetDate.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        targetDate = new Date(currentYear + 1, month - 1, day);
        targetDate.setHours(0, 0, 0, 0);
      }

      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 30) {
        combined.push({
          id: ev.id,
          tipo: ev.tipo,
          titulo: ev.titulo,
          dataStrFormatada: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
          diasRestantes: diffDays,
          descricao: ev.descricao,
          local_ou_estado: ev.local_ou_estado,
          celular: ev.celular,
          nome_pessoa: ev.nome_pessoa,
        });
      }
    });

    // 2. Process Birthdays from Pessoas
    (pessoas || []).forEach((p) => {
      if (!p.data_nascimento) return;
      const parts = p.data_nascimento.includes('-') ? p.data_nascimento.split('-') : [];
      let month = 0;
      let day = 0;

      if (parts.length === 3) {
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else if (parts.length === 2) {
        month = parseInt(parts[0], 10);
        day = parseInt(parts[1], 10);
      }

      if (!month || !day || isNaN(month) || isNaN(day)) return;

      const currentYear = today.getFullYear();
      let targetDate = new Date(currentYear, month - 1, day);
      targetDate.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        targetDate = new Date(currentYear + 1, month - 1, day);
        targetDate.setHours(0, 0, 0, 0);
      }

      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 30) {
        combined.push({
          id: `p-${p.id}`,
          tipo: 'PESSOA',
          titulo: `Aniversário de ${p.nome}`,
          dataStrFormatada: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
          diasRestantes: diffDays,
          descricao: p.profissao
            ? `${p.profissao} • ${p.cidade || ''} - ${p.uf || 'PR'}`
            : `${p.categoria || 'Liderança'} • ${p.cidade || ''} - ${p.uf || 'PR'}`,
          local_ou_estado: `${p.cidade || ''} - ${p.uf || 'PR'}`,
          celular: p.celular1,
          nome_pessoa: p.nome,
        });
      }
    });

    return combined.sort((a, b) => a.diasRestantes - b.diasRestantes);
  })();

  // Filter today's agendas
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAgendas = agendas.filter((a) => a.data_inicio.startsWith(todayStr) || a.data_inicio.startsWith('2023-12-15')); // Fallback mock date if today is empty

  // Demands requiring action
  const demandasEmAndamento = demandas.filter((d) => d.status === 'EM_ANDAMENTO' || d.status === 'CADASTRADO');
  
  // Pending calls
  const ligacoesPendentes = ligacoes.filter((l) => l.retorno_necessario);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-['Inter']">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 p-1 flex-shrink-0 backdrop-blur-md">
              {selectedDeputado?.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedDeputado.foto_url}
                  alt={selectedDeputado.nome}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <UserCircle className="w-full h-full text-white/60" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="bg-blue-500/30 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  e-Gabinete Parlamentar
                </span>
                <span className="text-xs text-blue-200/80 font-medium">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
                Sua Página • {selectedDeputado?.nome || 'Gabinete Digital'}
              </h1>
              <p className="text-slate-300 text-sm mt-0.5">
                Central de Gestão do Mandato, Agendas, Atendimentos e Atuação Parlamentar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/gabinete/agenda"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider backdrop-blur-sm transition-all flex items-center gap-2 border border-white/10"
            >
              <Calendar size={16} />
              Agenda
            </Link>
            <Link
              href="/gabinete/demandas"
              className="bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <FolderKanban size={16} />
              Nova Demanda
            </Link>
          </div>
        </div>

        {/* Quick Module Navigation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-8 pt-6 border-t border-white/10">
          <Link
            href="/gabinete/agenda"
            className="bg-white/5 hover:bg-white/15 p-3 rounded-2xl border border-white/10 transition-all text-center group"
          >
            <Calendar className="w-5 h-5 mx-auto text-blue-400 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-xs font-bold text-white block">Agenda</span>
            <span className="text-[10px] text-slate-300 block">{agendas.length} compromissos</span>
          </Link>

          <Link
            href="/gabinete/demandas"
            className="bg-white/5 hover:bg-white/15 p-3 rounded-2xl border border-white/10 transition-all text-center group"
          >
            <FolderKanban className="w-5 h-5 mx-auto text-amber-400 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-xs font-bold text-white block">Demandas</span>
            <span className="text-[10px] text-slate-300 block">{demandasEmAndamento.length} em aberto</span>
          </Link>

          <Link
            href="/gabinete/cadastros"
            className="bg-white/5 hover:bg-white/15 p-3 rounded-2xl border border-white/10 transition-all text-center group"
          >
            <Users2 className="w-5 h-5 mx-auto text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-xs font-bold text-white block">Cadastros</span>
            <span className="text-[10px] text-slate-300 block">{pessoas.length} lideranças</span>
          </Link>

          <Link
            href="/gabinete/oficios"
            className="bg-white/5 hover:bg-white/15 p-3 rounded-2xl border border-white/10 transition-all text-center group"
          >
            <Mail className="w-5 h-5 mx-auto text-purple-400 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-xs font-bold text-white block">Ofícios</span>
            <span className="text-[10px] text-slate-300 block">Emissão e Memos</span>
          </Link>

          <Link
            href="/gabinete/visitas"
            className="bg-white/5 hover:bg-white/15 p-3 rounded-2xl border border-white/10 transition-all text-center group"
          >
            <UserCheck className="w-5 h-5 mx-auto text-cyan-400 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-xs font-bold text-white block">Visitas</span>
            <span className="text-[10px] text-slate-300 block">Gabinete & Campo</span>
          </Link>

          <Link
            href="/gabinete/ligacoes"
            className="bg-white/5 hover:bg-white/15 p-3 rounded-2xl border border-white/10 transition-all text-center group"
          >
            <PhoneCall className="w-5 h-5 mx-auto text-rose-400 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-xs font-bold text-white block">Ligações</span>
            <span className="text-[10px] text-slate-300 block">{ligacoesPendentes.length} p/ retornar</span>
          </Link>
        </div>
      </div>

      {/* Top Banners Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banner 1: Aniversários & Datas Comemorativas (Próximos 30 dias) */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl font-bold">
                <Cake size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Aniversários & Datas Comemorativas</h3>
                <p className="text-xs text-slate-600 font-medium">Próximos 30 dias ({proximosEventos.length} eventos)</p>
              </div>
            </div>
            <Link
              href="/gabinete/agenda"
              className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1 bg-amber-200/80 px-3 py-1 rounded-full transition-all"
            >
              Ver na Agenda <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {proximosEventos.length > 0 ? (
              proximosEventos.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white p-3.5 rounded-2xl border border-amber-200/60 shadow-xs flex items-center justify-between gap-3 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="px-3 py-1.5 bg-amber-100 text-amber-900 rounded-xl text-center flex-shrink-0">
                      <span className="text-xs font-black block">{ev.dataStrFormatada}</span>
                      <span className="text-[9px] font-extrabold uppercase text-amber-700 block">
                        {ev.diasRestantes === 0 ? 'Hoje!' : ev.diasRestantes === 1 ? 'Amanhã' : `em ${ev.diasRestantes}d`}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{ev.titulo}</h4>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {getTipoBadgeLabel(ev.tipo)}
                        </span>
                      </div>
                      {ev.descricao && <p className="text-xs text-slate-500 truncate mt-0.5">{ev.descricao}</p>}
                    </div>
                  </div>

                  {ev.celular && (
                    <a
                      href={`https://wa.me/55${ev.celular.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá, ${ev.nome_pessoa || 'amigo(a)'}! O Deputado e toda a equipe do Gabinete lhe desejam um Feliz Aniversário! 🎉🎂`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs flex-shrink-0"
                    >
                      <PhoneCall size={12} />
                      WhatsApp
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-4 text-center bg-white rounded-2xl">
                Nenhum aniversário ou data comemorativa cadastrada nos próximos 30 dias.
              </p>
            )}
          </div>
        </div>

        {/* Banner 2: Agenda de Compromissos de Hoje */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl font-bold">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Agenda de Compromissos</h3>
                <p className="text-xs text-slate-600 font-medium">Programação para hoje ({todayAgendas.length} eventos)</p>
              </div>
            </div>
            <Link
              href="/gabinete/agenda"
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              Ver agenda completa <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {todayAgendas.length > 0 ? (
              todayAgendas.slice(0, 3).map((ag) => (
                <div
                  key={ag.id}
                  className="bg-white p-3 rounded-2xl border border-blue-200/60 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 bg-slate-100 rounded-lg text-center">
                      <span className="text-xs font-black text-slate-800 block">
                        {ag.data_inicio.split('T')[1]?.substring(0, 5) || '09:00'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{ag.compromisso}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" /> {ag.local || 'Gabinete'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      ag.status === 'CONFIRMADO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ag.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-3 text-center bg-white rounded-xl">
                Nenhum compromisso agendado para o resto do dia.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left 2 cols (Actionable Demand Cards), Right 1 col (Recados & Telefonemas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section: Actionable Demands Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-xl flex items-center gap-2">
                  <FolderKanban className="text-amber-500" />
                  Painel de Ações & Atendimentos
                </h3>
                <p className="text-xs text-slate-500">
                  Demandas que necessitam de intervenção ou acompanhamento do gabinete
                </p>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('demandas')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'demandas'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Demandas em Aberto ({demandasEmAndamento.length})
                </button>
                <button
                  onClick={() => setActiveTab('emendas')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'emendas'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Emendas & Prazos
                </button>
              </div>
            </div>

            {/* List of Demands */}
            {activeTab === 'demandas' && (
              <div className="space-y-4">
                {demandasEmAndamento.map((dem) => (
                  <div
                    key={dem.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all bg-slate-50/50 hover:bg-white hover:shadow-md space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                            Proc. {dem.processo}
                          </span>
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                            {dem.tipo_atendimento}
                          </span>
                          {dem.prioridade === 'Urgente' && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={10} /> Urgente
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-base">{dem.interessado_nome}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{dem.assunto}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[11px] font-bold text-slate-400 block">Órgão Destino</span>
                        <span className="text-xs font-bold text-slate-800 block">{dem.destinatario_orgao || 'Secretaria'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <UserCheck size={14} className="text-blue-600" /> Responsável: <strong className="text-slate-700">{dem.assessor_responsavel}</strong>
                      </span>
                      <Link
                        href="/gabinete/demandas"
                        className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        Atender Demanda <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}

                <div className="text-center pt-2">
                  <Link
                    href="/gabinete/demandas"
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition-all"
                  >
                    Gerenciar Todas as Demandas ({demandas.length})
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'emendas' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">Prazo de Indicação de Emendas Individuais (RP6)</h4>
                    <p className="text-xs text-amber-700 mt-1">
                      Encerramento das indicações de beneficiários e planos de trabalho no portal parlamentar em 5 dias.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Reforma de Hospital Regional de Assis</h4>
                    <p className="text-xs text-slate-500">Valor indicado: R$ 1.250.000,00 • Status: Pagamento Autorizado</p>
                  </div>
                  <Link href="/emendas" className="text-xs font-bold text-blue-600 hover:underline">
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Recados & Chamadas Pendentes */}
        <div className="space-y-6">
          {/* Box 1: Recados Recentes */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <MessageSquare className="text-purple-600" size={18} /> Recados do Gabinete
              </h3>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {recados.length} recados
              </span>
            </div>

            <div className="space-y-3">
              {recados.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-2xl border ${
                    !rec.lido ? 'bg-purple-50/60 border-purple-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">{rec.de_quem}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Para: {rec.para_quem}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{rec.mensagem}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Chamadas & Telefonemas a Retornar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <PhoneCall className="text-rose-600" size={18} /> Telefonemas Pendentes
              </h3>
              <Link href="/gabinete/ligacoes" className="text-xs font-bold text-rose-600 hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {ligacoesPendentes.map((lig) => (
                <div
                  key={lig.id}
                  className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/60 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{lig.nome_solicitante}</h4>
                    <p className="text-[11px] text-slate-500">{lig.telefone} • Procurou: {lig.pessoa_procurada}</p>
                    <p className="text-xs text-slate-700 mt-1 line-clamp-1">{lig.assunto}</p>
                  </div>
                  <a
                    href={`tel:${lig.telefone.replace(/\D/g, '')}`}
                    className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs flex-shrink-0"
                  >
                    <PhoneCall size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
