'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, FileText, MapPin, BarChart3, Settings, LogOut, UserCircle, ClipboardList } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';

export function Sidebar({ isOpen = false, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
  const pathname = usePathname();
  const { selectedDeputado } = useDeputado();

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Visão Geral', disabled: false },
    { href: '/mapa', icon: MapPin, label: 'Visão Mapa', disabled: false },
    { href: '/emendas', icon: Receipt, label: 'Minhas Emendas', disabled: false },
    { href: '/formularios', icon: ClipboardList, label: 'Formulários', disabled: false },
    { href: '/projetos', icon: FileText, label: 'Meus Projetos', disabled: false },
    { href: '/relatorios', icon: BarChart3, label: 'Relatórios', disabled: true },
  ];

  const handleLogout = async () => {
    // Implement logout logic here if using auth
    // For now, redirect to login or clear state
    window.location.href = '/'; // Or wherever the login page is
  };

  return (
    <aside className={`h-screen w-64 fixed left-0 top-0 pt-16 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between py-6 border-r border-slate-200 dark:border-slate-800 font-['Inter'] text-sm font-medium transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
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
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
          <Link href="/emendas/nova" className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:opacity-95 transition-all active:scale-95 text-xs uppercase tracking-widest flex justify-center">
            Nova Emenda
          </Link>
          <Link href="/projetos/novo" className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-lg shadow-lg hover:opacity-95 transition-all active:scale-95 text-xs uppercase tracking-widest flex justify-center">
            Novo Projeto
          </Link>
        </div>
      </div>
      
      <div className="px-4 space-y-1">
        <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
          <Settings size={20} />
          <span>Configurações</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
