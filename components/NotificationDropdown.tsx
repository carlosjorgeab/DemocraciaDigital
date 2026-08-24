'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  CheckCheck, 
  FolderKanban, 
  UserCheck, 
  FileSignature, 
  Clock, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useGabinete } from '@/context/GabineteContext';
import { useDeputado } from '@/context/DeputadoContext';
import { supabase } from '@/lib/supabase';

export type NotificationItem = {
  id: string;
  type: 'DEMANDA' | 'AUDIENCIA' | 'EDITAL' | 'RECADO';
  title: string;
  description: string;
  date: string;
  urgent?: boolean;
  priority?: string;
  read: boolean;
  href: string;
  meta?: {
    processo?: string;
    personalidade?: string;
    diasRestantes?: number;
    destinatario?: string;
  };
};

const READ_NOTIFS_KEY = 'democracia_read_notifications_v1';

export function NotificationDropdown({ topbarTextColor = '#ffffff', isTopbarWhite = false }: { topbarTextColor?: string; isTopbarWhite?: boolean }) {
  const router = useRouter();
  const { demandas, audiencias, recados } = useGabinete();
  const { selectedDeputado } = useDeputado();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'TODAS' | 'DEMANDAS' | 'AUDIENCIAS' | 'EDITAIS'>('TODAS');
  const [readIds, setReadIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [editais, setEditais] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load read notification IDs from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(READ_NOTIFS_KEY);
      if (stored) {
        setReadIds(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

  // Fetch expiring editais
  useEffect(() => {
    async function fetchEditais() {
      if (!selectedDeputado?.id) return;
      try {
        const { data } = await supabase
          .from('editais')
          .select('*')
          .eq('id_deputado', selectedDeputado.id);
        if (data) setEditais(data);
      } catch (e) {
        console.warn('Erro ao carregar editais para notificações:', e);
      }
    }
    fetchEditais();
  }, [selectedDeputado]);

  // Build notifications list
  useEffect(() => {
    const list: NotificationItem[] = [];

    // 1. Demandas (Novas recebidas ou em andamento prioritárias)
    demandas.forEach((dem) => {
      const isNova = dem.status === 'CADASTRADO';
      const isEmAndamento = dem.status === 'EM_ANDAMENTO';
      const isUrgente = dem.prioridade === 'Urgente' || dem.prioridade === 'Alta';

      if (isNova || (isEmAndamento && isUrgente)) {
        list.push({
          id: `notif-dem-${dem.id}`,
          type: 'DEMANDA',
          title: isNova ? `Nova Demanda: ${dem.processo}` : `Demanda em Andamento (${dem.prioridade})`,
          description: `${dem.interessado_nome} - ${dem.assunto}`,
          date: dem.data_abertura || new Date().toISOString(),
          urgent: isUrgente,
          priority: dem.prioridade,
          read: readIds.includes(`notif-dem-${dem.id}`),
          href: '/gabinete/demandas',
          meta: {
            processo: dem.processo,
            destinatario: dem.destinatario_orgao,
          }
        });
      }
    });

    // 2. Solicitações de Audiência Pendentes
    audiencias.forEach((aud) => {
      const isPendente = 
        aud.status?.toLowerCase().includes('solicitada') || 
        aud.status?.toLowerCase().includes('aguardando') ||
        aud.status?.toLowerCase().includes('pendente');

      if (isPendente) {
        list.push({
          id: `notif-aud-${aud.id}`,
          type: 'AUDIENCIA',
          title: `Audiência Pendente: ${aud.personalidade}`,
          description: aud.pauta,
          date: aud.data_solicitacao || new Date().toISOString(),
          urgent: true,
          priority: 'Alta',
          read: readIds.includes(`notif-aud-${aud.id}`),
          href: '/gabinete/audiencias',
          meta: {
            personalidade: aud.personalidade,
          }
        });
      }
    });

    // 3. Editais Próximos do Vencimento (< 5 dias)
    const now = new Date();
    editais.forEach((ed) => {
      if (ed.data_fim) {
        const end = new Date(ed.data_fim + 'T23:59:59');
        const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 5) {
          list.push({
            id: `notif-ed-${ed.id}`,
            type: 'EDITAL',
            title: `Prazo de Edital Expirando (${diffDays === 0 ? 'Hoje!' : `${diffDays} dias`})`,
            description: ed.titulo || `Edital #${ed.numero || ed.id}`,
            date: ed.data_fim,
            urgent: diffDays <= 2,
            priority: diffDays <= 2 ? 'Crítica' : 'Normal',
            read: readIds.includes(`notif-ed-${ed.id}`),
            href: '/editais',
            meta: {
              diasRestantes: diffDays,
            }
          });
        }
      }
    });

    // Sort: unread first, then newer dates
    list.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setNotifications(list);
  }, [demandas, audiencias, editais, readIds]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => !n.read && n.urgent).length;

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(updated));
      } catch (_) {}
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem(READ_NOTIFS_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);
    router.push(item.href);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'TODAS') return true;
    if (activeTab === 'DEMANDAS') return item.type === 'DEMANDA';
    if (activeTab === 'AUDIENCIAS') return item.type === 'AUDIENCIA';
    if (activeTab === 'EDITAIS') return item.type === 'EDITAL';
    return true;
  });

  const getRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMin < 1) return 'Agora';
      if (diffMin < 60) return `${diffMin}m atrás`;
      if (diffHours < 24) return `${diffHours}h atrás`;
      if (diffDays < 7) return `${diffDays}d atrás`;
      return d.toLocaleDateString('pt-BR');
    } catch (_) {
      return dateStr;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="btn-topbar-notifications"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificações e Alertas"
        title="Notificações e Alertas de Demandas e Audiências"
        className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 overflow-visible shadow-xs active:scale-95 transition-all hover:bg-white/20"
        style={{
          backgroundColor: isTopbarWhite ? '#f8fafc' : 'rgba(255, 255, 255, 0.2)',
          borderColor: isTopbarWhite ? '#cbd5e1' : 'rgba(255, 255, 255, 0.6)',
          color: topbarTextColor,
        }}
      >
        <Bell size={20} className={urgentCount > 0 ? 'animate-bounce' : ''} />
        
        {unreadCount > 0 && (
          <span 
            className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-black text-white rounded-full border-2 border-white shadow-md ${
              urgentCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-amber-500'
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-3 w-80 sm:w-96 md:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ color: '#0f172a' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg text-amber-400">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-tight">Central de Alertas & Notificações</h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {unreadCount === 0 ? 'Tudo atualizado' : `${unreadCount} pendência(s) aguardando ação`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  title="Marcar todas como lidas"
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Marcar lidas</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-xs font-bold overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('TODAS')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'TODAS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DEMANDAS')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'DEMANDAS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FolderKanban size={13} />
              Demandas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('AUDIENCIAS')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'AUDIENCIAS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <UserCheck size={13} />
              Audiências
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('EDITAIS')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'EDITAIS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileSignature size={13} />
              Editais
            </button>
          </div>

          {/* List of Notifications */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <Bell size={24} />
                </div>
                <p className="text-sm font-bold text-slate-700">Nenhum alerta pendente</p>
                <p className="text-xs text-slate-400 mt-1">
                  Não há novas demandas ou solicitações de audiência aguardando retorno nesta categoria.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-blue-50/60 cursor-pointer transition-colors relative flex items-start gap-3 group ${
                    !notif.read ? 'bg-amber-50/40 font-medium' : 'bg-white opacity-80'
                  }`}
                >
                  {/* Status indicator icon */}
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'DEMANDA' && (
                      <div className={`p-2 rounded-xl text-white ${notif.urgent ? 'bg-amber-600' : 'bg-blue-600'}`}>
                        <FolderKanban size={16} />
                      </div>
                    )}
                    {notif.type === 'AUDIENCIA' && (
                      <div className="p-2 rounded-xl text-white bg-indigo-600">
                        <UserCheck size={16} />
                      </div>
                    )}
                    {notif.type === 'EDITAL' && (
                      <div className="p-2 rounded-xl text-white bg-rose-600">
                        <FileSignature size={16} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className={`text-xs font-black truncate ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">
                        {getRelativeTime(notif.date)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-1.5">
                      {notif.description}
                    </p>

                    {/* Metadata & Tag Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-slate-100 text-slate-700">
                        {notif.type}
                      </span>
                      {notif.priority && (
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${
                          notif.priority === 'Urgente' || notif.priority === 'Crítica'
                            ? 'bg-red-100 text-red-700'
                            : notif.priority === 'Alta'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {notif.priority}
                        </span>
                      )}
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 ml-auto shrink-0"></span>
                      )}
                    </div>
                  </div>

                  {/* Chevron Right on hover */}
                  <ChevronRight size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0" />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span className="text-[11px] text-slate-500">
              {notifications.length} notificação(ões) no total
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/gabinete/demandas');
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline text-[11px]"
            >
              Ver todas as demandas
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
