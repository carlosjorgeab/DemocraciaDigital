import { TrendingUp, BarChart, Wallet, ClipboardList } from 'lucide-react';

export function KpiCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border border-slate-100">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-4 -translate-y-4 transition-transform group-hover:scale-110"></div>
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Verba Destinada (Total)</p>
        <h3 className="text-4xl font-headline font-black text-on-surface">R$ 12,4M</h3>
        <div className="flex items-center gap-1 mt-2 text-primary font-bold text-xs">
          <TrendingUp size={14} />
          <span>+15.2% vs 2023</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Total Executado</p>
        <h3 className="text-4xl font-headline font-black text-primary">R$ 7,2M</h3>
        <div className="flex items-center gap-1 mt-2 text-primary font-bold text-xs">
          <BarChart size={14} />
          <span>58% de execução</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Saldo em Caixa</p>
        <h3 className="text-4xl font-headline font-black text-tertiary">R$ 5,2M</h3>
        <div className="flex items-center gap-1 mt-2 text-tertiary font-bold text-xs">
          <Wallet size={14} />
          <span>Disponível para empenho</span>
        </div>
      </div>
      
      <div className="bg-primary p-6 rounded-xl shadow-lg hover:opacity-95 transition-opacity">
        <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-1">Meus Projetos Ativos</p>
        <h3 className="text-4xl font-headline font-black text-white">24</h3>
        <div className="flex items-center gap-1 mt-2 text-white/80 font-bold text-xs">
          <ClipboardList size={14} />
          <span>6 em fase de licitação</span>
        </div>
      </div>
    </section>
  );
}
