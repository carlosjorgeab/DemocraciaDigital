'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, UserCircle, ChevronDown } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { Logo } from '@/components/Logo';

export function Topbar() {
  const { deputados, selectedDeputado, setSelectedDeputado } = useDeputado();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-6 h-16 shadow-[0_12px_40px_rgba(216,0,0,0.05)]">
      <div className="flex items-center gap-2 md:gap-3 ml-10 md:ml-64">
        <Logo className="w-6 h-6 md:w-8 md:h-8 text-primary dark:text-red-600 shrink-0" />
        <h1 className="text-base md:text-xl font-black tracking-tighter text-primary dark:text-red-600 uppercase font-headline truncate max-w-[120px] md:max-w-none">Democracia Digital</h1>
        <span className="hidden md:block h-4 w-[1px] bg-slate-200"></span>
        <span className="hidden md:block text-slate-500 font-medium text-sm">Painel do Parlamentar</span>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {/* Deputado Selector - Only show if there are multiple deputies */}
        {deputados.length > 1 && (
          <div className="relative flex items-center bg-white rounded-lg px-2 md:px-3 py-1.5 border border-slate-200 shadow-sm max-w-[120px] md:max-w-none">
            <select 
              className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-bold text-on-surface outline-none cursor-pointer appearance-none pr-6 w-full truncate"
              value={selectedDeputado?.id || ''}
              onChange={(e) => {
                const dep = deputados.find(d => d.id === e.target.value);
                setSelectedDeputado(dep || null);
              }}
            >
              <option value="" disabled>Selecione um Deputado</option>
              {deputados.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.nome} {dep.is_default ? '(Padrão)' : ''} ({dep.partidos?.sigla}-{dep.estado})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 text-slate-400 pointer-events-none" />
          </div>
        )}

        <form onSubmit={handleSearch} className="hidden lg:flex relative items-center bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-1.5 w-64 border border-slate-200 dark:border-slate-800">
          <Search className="text-slate-400" size={16} />
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-full font-body placeholder:text-slate-400 ml-2 outline-none" 
            placeholder="Buscar emendas e projetos..." 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className="flex gap-1">
          <button className="hidden md:block p-2 rounded-full text-slate-500 hover:text-primary dark:hover:text-red-400 transition-colors scale-95 active:opacity-80">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full text-slate-500 hover:text-primary dark:hover:text-red-400 transition-colors scale-95 active:opacity-80">
            <UserCircle size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
