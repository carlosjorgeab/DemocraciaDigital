'use client';
import { Search, Bell, UserCircle, ChevronDown } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';

export function Topbar() {
  const { deputados, selectedDeputado, setSelectedDeputado } = useDeputado();

  return (
    <header className="fixed top-0 w-full z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-[0_12px_40px_rgba(216,0,0,0.05)]">
      <div className="flex items-center gap-4 ml-64">
        <h1 className="text-xl font-black tracking-tighter text-primary dark:text-red-600 uppercase font-headline">Democracia Digital</h1>
        <span className="h-4 w-[1px] bg-slate-200"></span>
        <span className="text-slate-500 font-medium text-sm">Painel do Parlamentar</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Deputado Selector */}
        <div className="relative flex items-center bg-white rounded-lg px-3 py-1.5 border border-slate-200 shadow-sm">
          <select 
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-on-surface outline-none cursor-pointer appearance-none pr-6"
            value={selectedDeputado?.id || ''}
            onChange={(e) => {
              const dep = deputados.find(d => d.id === e.target.value);
              setSelectedDeputado(dep || null);
            }}
          >
            <option value="" disabled>Selecione um Deputado</option>
            {deputados.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.nome} ({dep.partidos?.sigla}-{dep.estado})</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-1.5 w-64 border border-slate-200 dark:border-slate-800">
          <Search className="text-slate-400" size={16} />
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-full font-body placeholder:text-slate-400 ml-2 outline-none" 
            placeholder="Buscar emendas..." 
            type="text" 
          />
        </div>
        <div className="flex gap-1">
          <button className="p-2 rounded-full text-slate-500 hover:text-primary dark:hover:text-red-400 transition-colors scale-95 active:opacity-80">
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
