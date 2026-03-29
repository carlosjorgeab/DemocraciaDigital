import { RefreshCw } from 'lucide-react';

export function Filters() {
  return (
    <section className="glass-panel p-6 rounded-xl flex flex-wrap items-center gap-8 shadow-sm border border-white/50">
      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Ano Fiscal</label>
        <select className="bg-transparent border-none font-headline font-bold text-primary p-0 focus:ring-0 cursor-pointer outline-none">
          <option>2024</option>
          <option>2023</option>
        </select>
      </div>
      <div className="h-8 w-[1px] bg-slate-200"></div>
      
      <div className="flex flex-col gap-1 min-w-[140px]">
        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Tipo de Verba</label>
        <select className="bg-transparent border-none font-headline font-bold text-on-surface p-0 focus:ring-0 cursor-pointer outline-none">
          <option>Emendas Individuais</option>
          <option>Emendas de Bancada</option>
        </select>
      </div>
      <div className="h-8 w-[1px] bg-slate-200"></div>
      
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Município</label>
        <select className="bg-transparent border-none font-headline font-bold text-on-surface p-0 focus:ring-0 cursor-pointer outline-none">
          <option>São Paulo</option>
          <option>Campinas</option>
          <option>Ribeirão Preto</option>
        </select>
      </div>
      <div className="h-8 w-[1px] bg-slate-200"></div>
      
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Categoria</label>
        <select className="bg-transparent border-none font-headline font-bold text-on-surface p-0 focus:ring-0 cursor-pointer outline-none">
          <option>Saúde & Bem-estar</option>
          <option>Educação</option>
          <option>Infraestrutura</option>
        </select>
      </div>
      
      <button className="ml-auto flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-200 transition-all">
        <RefreshCw size={16} />
        Limpar Filtros
      </button>
    </section>
  );
}
