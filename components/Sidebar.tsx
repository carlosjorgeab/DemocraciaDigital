'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, FileText, MapPin, BarChart3, Settings, LogOut, UserCircle, ClipboardList } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';

export function Sidebar() {
  const pathname = usePathname();
  const { selectedDeputado } = useDeputado();

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Visão Geral' },
    { href: '/emendas', icon: Receipt, label: 'Minhas Emendas' },
    { href: '/formularios', icon: ClipboardList, label: 'Formulários' },
    { href: '/projetos', icon: FileText, label: 'Meus Projetos' },
    { href: '/base-eleitoral', icon: MapPin, label: 'Base Eleitoral' },
    { href: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 pt-16 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between py-6 border-r border-slate-200 dark:border-slate-800 font-['Inter'] text-sm font-medium">
      <div className="px-4 space-y-2">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-surface-container border-2 border-primary/20 flex-shrink-0">
            {selectedDeputado?.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                alt={`Foto de ${selectedDeputado.nome}`} 
                className="w-full h-full object-cover" 
                src={selectedDeputado.foto_url} 
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                <UserCircle size={24} />
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
              {selectedDeputado ? selectedDeputado.nome : 'Gabinete Digital'}
            </h2>
            <p className="text-[10px] text-primary dark:text-red-500 font-semibold uppercase tracking-wider truncate">
              {selectedDeputado ? `${selectedDeputado.partidos?.sigla} - ${selectedDeputado.estado}` : 'Liderança'}
            </p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href}
                href={item.href} 
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
        
        <Link href="/projetos/novo" className="mt-4 w-full py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:opacity-95 transition-all active:scale-95 text-xs uppercase tracking-widest flex justify-center">
          Novo Projeto
        </Link>
      </div>
      
      <div className="px-4 space-y-1">
        <Link href="/configuracoes" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
          <Settings size={20} />
          <span>Configurações</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
