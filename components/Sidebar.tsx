'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, FileText, MapPin, BarChart3, Settings, LogOut, UserCircle, ClipboardList, Shield, Users, Building2 } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { useAuth } from '@/context/AuthContext';

export function Sidebar({ isOpen = false, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const { selectedDeputado } = useDeputado();
  const { logout, hasPermission, user } = useAuth();

  const isPublicRoute = pathname?.startsWith('/p/');
  const publicId = isPublicRoute ? pathname?.split('/')[2] : '';
  const basePath = isPublicRoute ? `/p/${publicId}` : '';

  const navItems = [
    { href: basePath || '/', icon: LayoutDashboard, label: 'Visão Geral', disabled: false, id: '/' },
    { href: `${basePath}/mapa`, icon: MapPin, label: 'Visão Mapa', disabled: false, id: '/mapa' },
    { href: `${basePath}/emendas`, icon: Receipt, label: 'Emendas', disabled: false, id: '/emendas' },
    { href: `${basePath}/formularios`, icon: ClipboardList, label: 'Edital', disabled: false, id: '/formularios' },
    { href: `${basePath}/projetos`, icon: FileText, label: 'Meus Projetos', disabled: false, id: '/projetos' },
    { href: `${basePath}/ministerios`, icon: Building2, label: 'Ministérios', disabled: false, id: '/ministerios' },
    { href: `${basePath}/relatorios`, icon: BarChart3, label: 'Relatórios', disabled: true, id: '/relatorios' },
  ].filter(item => hasPermission(item.id));

  if (!isPublicRoute && (user?.is_admin || hasPermission('/perfis'))) {
    navItems.push({ href: '/perfis', icon: Shield, label: 'Perfis', disabled: false, id: '/perfis' });
  }
  if (!isPublicRoute && (user?.is_admin || hasPermission('/usuarios'))) {
    navItems.push({ href: '/usuarios', icon: Users, label: 'Usuários', disabled: false, id: '/usuarios' });
  }

  const handleLogout = async () => {
    logout();
  };

  return (
    <aside className={`h-screen w-64 fixed left-0 top-0 pt-16 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between py-6 border-r border-slate-200 dark:border-slate-800 font-['Inter'] text-sm font-medium transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="px-4 space-y-2">
        <div className="mb-8 px-2 flex flex-col items-center gap-3 text-center">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-surface-container border-2 border-primary/20 flex-shrink-0 shadow-md">
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
            <p className="text-xs text-primary dark:text-red-500 font-bold uppercase tracking-wider truncate mt-1">
              {selectedDeputado ? `${selectedDeputado.partidos?.sigla} - ${selectedDeputado.estado}` : 'Liderança'}
            </p>
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-slate-400 dark:text-slate-600 cursor-not-allowed"
                  title="Em breve"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              );
            }

            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsOpen && setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-red-50 dark:bg-red-950/30 text-primary dark:text-red-400 active:scale-98' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:translate-x-1 duration-200'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-4 space-y-2">
          {!isPublicRoute && hasPermission('/emendas') && (
            <Link href="/emendas/nova" className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:opacity-95 transition-all active:scale-95 text-xs uppercase tracking-widest flex justify-center">
              Nova Emenda
            </Link>
          )}
          {!isPublicRoute && hasPermission('/projetos') && (
            <Link href="/projetos/novo" className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-lg shadow-lg hover:opacity-95 transition-all active:scale-95 text-xs uppercase tracking-widest flex justify-center">
              Novo Projeto
            </Link>
          )}
        </div>
      </div>
      
      {!isPublicRoute && (
        <div className="px-4 space-y-1 mt-6">
          {(user?.is_admin || hasPermission('/configuracoes')) && (
            <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
              <Settings size={20} />
              <span>Configurações</span>
            </Link>
          )}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      )}
    </aside>
  );
}
