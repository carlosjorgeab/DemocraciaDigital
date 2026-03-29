export function Charts() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h4 className="text-xl font-headline font-bold text-on-surface">Histórico de Empenho</h4>
            <p className="text-sm text-on-surface-variant">Execução mensal de emendas (Milhões R$)</p>
          </div>
          <div className="flex gap-4 text-xs font-bold">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-tertiary rounded-sm"></div>
              <span>Empenhado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-sm"></div>
              <span>Pago</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-4 px-2">
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-tertiary/20 h-[50%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-tertiary h-[70%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">JAN</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-primary/20 h-[70%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-primary h-[60%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">FEV</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-tertiary/20 h-[60%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-tertiary h-[80%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">MAR</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-primary/20 h-[85%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-primary h-[75%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">ABR</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-tertiary/20 h-[75%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-tertiary h-[70%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">MAI</span>
          </div>
          <div className="flex-1 flex flex-col justify-end gap-1 h-full">
            <div className="w-full bg-primary/20 h-[90%] rounded-t-sm relative group">
              <div className="absolute inset-x-0 bottom-0 bg-primary h-[90%] rounded-t-sm"></div>
            </div>
            <span className="text-[10px] text-center font-bold text-on-surface-variant">JUN</span>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
        <h4 className="text-xl font-headline font-bold text-on-surface self-start mb-2">Impacto Social</h4>
        <p className="text-sm text-on-surface-variant self-start mb-8">Foco por Área Temática</p>
        
        <div className="relative w-48 h-48 mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle className="text-primary" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="100.5" strokeWidth="12"></circle>
            <circle className="text-tertiary" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="201" strokeWidth="12"></circle>
            <circle className="text-slate-100" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="238.6" strokeWidth="12"></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black font-headline">R$ 12M</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Total 2024</span>
          </div>
        </div>
        
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span>Saúde Pública</span>
            </div>
            <span className="font-bold">60%</span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-tertiary"></div>
              <span>Educação</span>
            </div>
            <span className="font-bold">25%</span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              <span>Outros</span>
            </div>
            <span className="font-bold">15%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
