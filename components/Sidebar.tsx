'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  MapPin, 
  BarChart3, 
  Settings, 
  LogOut, 
  UserCircle, 
  ClipboardList, 
  Shield, 
  Users, 
  Building2, 
  FileSignature, 
  Plus, 
  Flag, 
  IdCard, 
  Tags, 
  AlertTriangle, 
  Home, 
  Calendar, 
  Users2, 
  PhoneCall, 
  FolderKanban, 
  Mail, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  History
} from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { supabase } from '@/lib/supabase';
import { isWhiteOrNearWhite, getSidebarTopbarFontColor } from '@/lib/colorUtils';
import { SidebarCalendar } from './SidebarCalendar';

export function Sidebar({ isOpen = false, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const { selectedDeputado } = useDeputado();
  const { logout, hasPermission, user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [expiringEditaisCount, setExpiringEditaisCount] = useState<number>(0);

  const partyPrimary = selectedDeputado?.partidos?.cor_primaria || '#005baa';
  const partySecondary = selectedDeputado?.partidos?.cor_secundaria || '#002776';

  // Sidebar background uses partyPrimary by default
  const sidebarBg = partyPrimary;
  const isSidebarWhite = isWhiteOrNearWhite(sidebarBg);

  // Font color rule:
  // Font in Sidebar MUST be Bold White (#ffffff), EXCEPT when Sidebar background is White, in which case font is Bold Black (#000000).
  const sidebarTextColor = getSidebarTopbarFontColor(sidebarBg);

  // Active Item styling
  const activeItemBg = isSidebarWhite ? partyPrimary : '#ffffff';
  const activeItemTextColor = isSidebarWhite ? '#ffffff' : (isWhiteOrNearWhite(partyPrimary) ? '#000000' : partyPrimary);

  useEffect(() => {
    async function checkExpiringEditais() {
      if (!selectedDeputado?.id) return;
      const { data } = await supabase
        .from('editais')
        .select('data_fim')
        .eq('id_deputado', selectedDeputado.id);
      if (data) {
        const now = new Date();
        let count = 0;
        data.forEach(e => {
          if (e.data_fim) {
            const end = new Date(e.data_fim + 'T23:59:59');
            const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff <= 5) {
              count++;
            }
          }
        });
        setExpiringEditaisCount(count);
      }
    }
    checkExpiringEditais();
  }, [selectedDeputado]);

  const isPublicRoute = pathname?.startsWith('/p/');
  const publicId = isPublicRoute ? pathname?.split('/')[2] : '';
  const basePath = isPublicRoute ? `/p/${publicId}` : '';

  const navItems = [
    { href: basePath || '/', icon: LayoutDashboard, label: 'Visão Geral', disabled: false, id: '/' },
    
    // e-Gabinete Parlamentar
    { href: `${basePath}/gabinete`, icon: Home, label: 'Sua Página (Gabinete)', disabled: false, id: '/gabinete' },
    { href: `${basePath}/gabinete/agenda`, icon: Calendar, label: 'Agenda & Compromissos', disabled: false, id: '/gabinete/agenda' },
    { href: `${basePath}/gabinete/demandas`, icon: FolderKanban, label: 'Atendimentos / Demandas', disabled: false, id: '/gabinete/demandas' },
    { href: `${basePath}/gabinete/cadastros`, icon: Users2, label: 'Pessoas & Entidades', disabled: false, id: '/gabinete/cadastros' },
    { href: `${basePath}/gabinete/audiencias`, icon: UserCheck, label: 'Solicit. Audiência', disabled: false, id: '/gabinete/audiencias' },
    { href: `${basePath}/gabinete/oficios`, icon: Mail, label: 'Ofícios & Memos', disabled: false, id: '/gabinete/oficios' },
    { href: `${basePath}/gabinete/visitas`, icon: UserCircle, label: 'Registro de Visitas', disabled: false, id: '/gabinete/visitas' },
    { href: `${basePath}/gabinete/ligacoes`, icon: PhoneCall, label: 'Ligações & Telemarketing', disabled: false, id: '/gabinete/ligacoes' },

    { href: `${basePath}/mapa`, icon: MapPin, label: 'Visão Mapa', disabled: false, id: '/mapa' },
    { href: `${basePath}/base-eleitoral`, icon: MapPin, label: 'Base Eleitoral', disabled: false, id: '/base-eleitoral' },
    { href: `${basePath}/formularios`, icon: ClipboardList, label: 'Adesão Edital', disabled: false, id: '/formularios' },
    { href: `${basePath}/emendas`, icon: Receipt, label: 'Emendas', disabled: false, id: '/emendas' },
    { href: `${basePath}/projetos`, icon: FileText, label: 'Projetos', disabled: false, id: '/projetos' },
    { href: `${basePath}/editais`, icon: FileSignature, label: 'Editais', disabled: false, id: '/editais', badge: expiringEditaisCount },
    { href: `${basePath}/ministerios`, icon: Building2, label: 'Ministérios', disabled: false, id: '/ministerios' },
    { href: '/partidos', icon: Flag, label: 'Partidos', disabled: false, id: '/partidos' },
    { href: '/deputados', icon: IdCard, label: 'Deputados', disabled: false, id: '/deputados' },
    { href: '/areas-tematicas', icon: Tags, label: 'Áreas Temáticas', disabled: false, id: '/areas-tematicas' },
    { href: `${basePath}/relatorios`, icon: BarChart3, label: 'Relatórios', disabled: false, id: '/relatorios' },
    { href: '/perfis', icon: Shield, label: 'Perfis', disabled: false, id: '/perfis' },
    { href: '/usuarios', icon: Users, label: 'Usuários', disabled: false, id: '/usuarios' },
    { href: '/logs', icon: History, label: 'Logs de Auditoria', disabled: false, id: '/logs' },
    { 
      href: '/emendas/nova', 
      icon: Plus, 
      label: 'Nova Emenda', 
      disabled: false, 
      id: '/emendas/nova', 
      isButton: true, 
      btnBg: isSidebarWhite ? partyPrimary : '#ffffff', 
      btnText: isSidebarWhite ? '#ffffff' : partyPrimary 
    },
    { 
      href: '/projetos/novo', 
      icon: Plus, 
      label: 'Novo Projeto', 
      disabled: false, 
      id: '/projetos/novo', 
      isButton: true, 
      btnBg: isSidebarWhite ? partySecondary : 'rgba(255, 255, 255, 0.25)', 
      btnText: '#ffffff' 
    },
    { href: '/configuracoes', icon: Settings, label: 'Configurações', disabled: false, id: '/configuracoes' },
  ].filter(item => {
    if (item.id === '/perfis' || item.id === '/usuarios' || item.id === '/configuracoes' || item.id === '/logs') {
      return !isPublicRoute && (user?.is_admin || hasPermission(item.id));
    }
    if (item.id === '/emendas/nova' || item.id === '/projetos/novo') {
      return !isPublicRoute && hasPermission(item.id.split('/')[1]);
    }
    return hasPermission(item.id);
  });

  const handleLogout = async () => {
    logout();
  };

  return (
    <aside 
      style={{ 
        backgroundColor: sidebarBg, 
        color: sidebarTextColor 
      }}
      className={`h-screen fixed left-0 top-0 pt-16 z-50 flex flex-col justify-between py-6 border-r border-black/10 font-['Inter'] text-sm font-bold transition-all duration-300 overflow-y-auto shadow-lg ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64 w-64'}`}
    >
      <div className={`space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {/* Toggle Collapse Button on Desktop */}
        <div className="hidden md:flex justify-end mb-2 px-1">
          <button
            type="button"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-bold uppercase tracking-wider"
            style={{ color: sidebarTextColor }}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <>
                <PanelLeftClose size={18} />
                <span className="text-[11px]">Recolher Menu</span>
              </>
            )}
          </button>
        </div>

        {/* Deputado Profile / Avatar */}
        <div className={`mb-6 flex flex-col items-center gap-2 text-center transition-all ${isCollapsed ? 'px-1' : 'px-2'}`}>
          <div 
            className={`rounded-full overflow-hidden flex-shrink-0 shadow-md border-2 border-white/60 transition-all ${
              isCollapsed ? 'h-11 w-11' : 'h-20 w-20'
            }`}
          >
            {selectedDeputado?.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                alt={`Foto de ${selectedDeputado.nome}`} 
                className="w-full h-full object-cover" 
                src={selectedDeputado.foto_url} 
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500">
                <UserCircle size={isCollapsed ? 24 : 40} />
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden w-full animate-in fade-in duration-200">
              <h2 
                className="text-lg font-black leading-tight truncate"
                style={{ color: sidebarTextColor }}
              >
                {selectedDeputado ? selectedDeputado.nome : 'Gabinete Digital'}
              </h2>
              <div className="mt-1 flex justify-center">
                <span 
                  className="inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider truncate shadow-xs border"
                  style={{ 
                    backgroundColor: isSidebarWhite ? partyPrimary : '#ffffff', 
                    color: isSidebarWhite ? '#ffffff' : (isWhiteOrNearWhite(partyPrimary) ? '#000000' : partyPrimary),
                    borderColor: 'rgba(255,255,255,0.4)'
                  }}
                >
                  {selectedDeputado ? `${selectedDeputado.partidos?.sigla || 'Partido'} • ${selectedDeputado.estado}` : 'Liderança'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top Sidebar Monthly Calendar (Hidden when collapsed on desktop) */}
        {!isCollapsed && (user?.is_admin || user?.exibir_calendario !== false) && (
          <SidebarCalendar isSidebarWhite={isSidebarWhite} />
        )}
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && item.href !== basePath && pathname?.startsWith(item.href + '/'));
            const Icon = item.icon;
            
            if (item.disabled) {
              return (
                <div 
                  key={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold opacity-40 cursor-not-allowed ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                  style={{ color: sidebarTextColor }}
                  title={`${item.label} (Em breve)`}
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
              );
            }

            if (item.isButton) {
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={() => setIsOpen && setIsOpen(false)}
                  style={{ backgroundColor: item.btnBg, color: item.btnText }}
                  title={item.label}
                  className={`w-full py-3 font-black rounded-xl shadow-md hover:opacity-90 transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-2 border border-black/10 ${
                    isCollapsed ? 'px-2' : ''
                  }`}
                >
                  <Plus size={16} className="shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            }

            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsOpen && setIsOpen(false)}
                title={item.label}
                style={
                  isActive 
                    ? { 
                        backgroundColor: activeItemBg, 
                        color: activeItemTextColor,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                      } 
                    : {
                        color: sidebarTextColor
                      }
                }
                className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl font-black cursor-pointer transition-all ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive 
                    ? 'scale-[1.02]' 
                    : 'hover:bg-white/10 hover:translate-x-1 duration-200'
                }`}
              >
                <Icon size={20} className="shrink-0" style={{ color: isActive ? activeItemTextColor : sidebarTextColor }} />
                {!isCollapsed && <span className="flex-1 font-black truncate">{item.label}</span>}
                
                {Boolean(item.badge && item.badge > 0) && (
                  isCollapsed ? (
                    <span 
                      className="absolute top-1.5 right-1.5 bg-amber-400 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse"
                      title={`${item.badge} edital(is) próximo(s) do vencimento`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm flex items-center gap-1 shrink-0" title={`${item.badge} edital(is) a menos de 5 dias do encerramento`}>
                      <AlertTriangle size={10} />
                      {item.badge}
                    </span>
                  )
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {!isPublicRoute && (
        <div className={`space-y-1 mt-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <button 
            onClick={handleLogout} 
            style={{ color: sidebarTextColor }}
            title="Sair"
            className={`w-full flex items-center gap-3 px-3 py-3 hover:bg-white/10 rounded-xl font-black cursor-pointer transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
