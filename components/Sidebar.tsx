import Link from 'next/link';
import { LayoutDashboard, Receipt, FileText, MapPin, BarChart3, Settings, LogOut } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 pt-16 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between py-6 border-r border-slate-200 dark:border-slate-800 font-['Inter'] text-sm font-medium">
      <div className="px-4 space-y-2">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-surface-container border-2 border-primary/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="Foto do Deputado" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDItoFVfGoACbJdm4Wi0cfBgir3kPMKpi_-Xd5dYrlEDHoUEkV0516q-xhwhO4CNXWak9bkrhI4WKOSGSanivISliO-DLf79qEtbopRryvM32I1w0S_TWHzXDRBGBh28awAqQYax5hHZsD9OsXFPbZSBIn41-wfzZ-GyIw1sviuqhHpBJmy74hVhpfgYyLLTIEMXyZlcSd2ZubedVQG76oGcTMohkgkKlIUv2aa0c3bKptcwfVR-KA6p8toS7_Ttro9Fa4_sfmlM1Ul" 
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Gabinete Digital</h2>
            <p className="text-[10px] text-primary dark:text-red-500 font-semibold uppercase tracking-wider">Liderança PT</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          <Link href="#" className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/30 text-primary dark:text-red-400 rounded-lg font-semibold cursor-pointer active:scale-98 transition-all">
            <LayoutDashboard size={20} />
            <span>Visão Geral</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer hover:translate-x-1 transition-transform duration-200">
            <Receipt size={20} />
            <span>Minhas Emendas</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer hover:translate-x-1 transition-transform duration-200">
            <FileText size={20} />
            <span>Meus Projetos</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer hover:translate-x-1 transition-transform duration-200">
            <MapPin size={20} />
            <span>Base Eleitoral</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer hover:translate-x-1 transition-transform duration-200">
            <BarChart3 size={20} />
            <span>Relatórios</span>
          </Link>
        </nav>
        
        <button className="mt-4 w-full py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg hover:opacity-95 transition-all active:scale-95 text-xs uppercase tracking-widest">
          Novo Projeto
        </button>
      </div>
      
      <div className="px-4 space-y-1">
        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
          <Settings size={20} />
          <span>Configurações</span>
        </Link>
        <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all">
          <LogOut size={20} />
          <span>Sair</span>
        </Link>
      </div>
    </aside>
  );
}
