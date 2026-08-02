'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, FileText, MapPin, BarChart3, Settings, LogOut, UserCircle, ClipboardList, Shield, Users, Building2, FileSignature, Plus, Flag, IdCard, Tags, AlertTriangle } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getContrastTextColor, getReadableOnLightText } from '@/lib/colorUtils';

export function Sidebar({ isOpen = false, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const { selectedDeputado } = useDeputado();
  const { logout, hasPermission, user } = useAuth();
  const [expiringEditaisCount, setExpiringEditaisCount] = useState<number>(0);

  const partyPrimary = selectedDeputado?.partidos?.cor_primaria || '#005baa';
  const partySecondary = selectedDeputado?.partidos?.cor_secundaria || '#002776';

  const onPrimaryText = getContrastTextColor(partyPrimary);
  const onSecondaryText = getContrastTextColor(partySecondary);
  const readablePartyText = getReadableOnLightText(partyPrimary);

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
    { href: '/emendas/nova', icon: Plus, label: 'Nova Emenda', disabled: false, id: '/emendas/nova', isButton: true, btnBg: partyPrimary, btnText: onPrimaryText },
    { href: '/projetos/novo', icon: Plus, label: 'Novo Projeto', disabled: false, id: '/projetos/novo', isButton: true, btnBg: partySecondary, btnText: onSecondaryText },
    { href: '/configuracoes', icon: Settings, label: 'Configurações', disabled: false, id: '/configuracoes' },
  ].filter(item => {
    if (item.id === '/perfis' || item.id === '/usuarios' || item.id === '/configuracoes') {
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
    <aside className={`h-screen w-64 fixed left-0 top-0 pt-16 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between py-6 border-r border-slate-200 dark:border-slate-800 font-['Inter'] text-sm font-medium transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="px-4 space-y-2">
        <div className="mb-6 px-2 flex flex-col items-center gap-3 text-center">
          <div 
            className="h-20 w-20 rounded-full overflow-hidden flex-shrink-0 shadow-md border-2"
            style={{ borderColor: partyPrimary }}
          >
            {selectedDeputado?.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                alt={`Foto de ${selectedDeputado.nome}`} 
                className="w-full h-full object-cover" 
                src={selectedDeputado.foto_url} 
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                <UserCircle size={40} />
              </div>
            )}
          </div>
          <div className="overflow-hidden w-full">
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
              {selectedDeputado ? selectedDeputado.nome : 'Gabinete Digital'}
            </h2>
            <div className="mt-1 flex justify-center">
              <span 
                className="inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider truncate shadow-xs border"
                style={{ 
                  backgroundColor: partyPrimary, 
                  color: onPrimaryText,
                  borderColor: partyPrimary
                }}
              >
                {selectedDeputado ? `${selectedDeputado.partidos?.sigla || 'Partido'} • ${selectedDeputado.estado}` : 'Liderança'}
              </span>
            </div>
          </div>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && item.href !== basePath && pathname?.startsWith(item.href + '/'));
            const Icon = item.icon;
            
            if (item.disabled) {
              return (
                <div 
                  key={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  title="Em breve"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
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
                  className="w-full py-3 font-black rounded-xl shadow-md hover:opacity-95 transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-2 border border-black/10"
                >
                  <Plus size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsOpen && setIsOpen(false)}
                style={
                  isActive 
                    ? { 
                        backgroundColor: partyPrimary, 
                        color: onPrimaryText,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                      } 
                    : undefined
                }
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold cursor-pointer transition-all ${
                  isActive 
                    ? 'scale-[1.02]' 
                    : 'text-slate-900 dark:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:translate-x-1 duration-200'
                }`}
              >
                <Icon size={20} style={isActive ? { color: onPrimaryText } : undefined} />
                <span className="flex-1">{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-sm flex items-center gap-1" title={`${item.badge} edital(is) a menos de 5 dias do encerramento`}>
                    <AlertTriangle size={10} />
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {!isPublicRoute && (
        <div className="px-4 space-y-1 mt-6">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-900 dark:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer transition-all">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      )}
    </aside>
  );
}

