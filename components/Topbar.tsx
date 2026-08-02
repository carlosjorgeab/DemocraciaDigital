'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, UserCircle, ChevronDown, Building2, Settings, Users } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { getContrastTextColor, getReadableOnLightText } from '@/lib/colorUtils';

export function Topbar() {
  const { deputados, selectedDeputado, setSelectedDeputado } = useDeputado();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = pathname?.startsWith('/p/');

  const partyPrimary = selectedDeputado?.partidos?.cor_primaria || '#005baa';
  const readablePartyText = getReadableOnLightText(partyPrimary);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl flex justify-between items-center px-4 md:px-6 h-16 shadow-xs border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 md:gap-3 ml-10 md:ml-64">
        <Logo className="w-8 h-8 md:w-9 md:h-9 shrink-0" />
        <div className="flex flex-col md:flex-row md:items-center md:gap-3">
          <h1 className="text-base md:text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase font-headline truncate max-w-[140px] md:max-w-none">
            Democracia Digital
          </h1>
          <span className="hidden md:block h-4 w-[1px] bg-slate-300 dark:bg-slate-700"></span>
          <span className="hidden md:block text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
            Painel do Parlamentar
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Deputado Selector */}
        {!isPublicRoute && deputados.length > 1 && (
          <div 
            className="relative flex items-center bg-slate-50 dark:bg-slate-900 rounded-xl px-2.5 md:px-3.5 py-1.5 border-2 shadow-xs transition-all max-w-[140px] md:max-w-none"
            style={{ borderColor: partyPrimary }}
          >
            <select 
              className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-black text-slate-900 dark:text-white outline-none cursor-pointer appearance-none pr-6 w-full truncate"
              value={selectedDeputado?.id || ''}
              onChange={(e) => {
                const dep = deputados.find(d => d.id === e.target.value);
                setSelectedDeputado(dep || null);
              }}
            >
              <option value="" disabled>Selecione um Deputado</option>
              {deputados.map(dep => (
                <option key={dep.id} value={dep.id}>
                  {dep.nome} ({dep.partidos?.sigla}-{dep.estado}) {!dep.ativo ? '(Inativo)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 text-slate-700 dark:text-slate-300 pointer-events-none" />
          </div>
        )}

        {!isPublicRoute && (
          <>
            <form onSubmit={handleSearch} className="hidden lg:flex relative items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-4 py-1.5 w-64 border border-slate-200 dark:border-slate-800">
              <Search className="text-slate-500" size={16} />
              <input 
                className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-900 dark:text-slate-100 w-full placeholder:text-slate-400 ml-2 outline-none" 
                placeholder="Buscar emendas e projetos..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="relative group">
              <button 
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 overflow-hidden bg-white dark:bg-slate-900 shadow-xs active:scale-95 transition-all"
                style={{ borderColor: partyPrimary }}
              >
                <UserCircle size={26} className="text-slate-800 dark:text-slate-100" />
              </button>
              
              {/* Profile Dropdown */}
              {!isPublicRoute && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 mb-2">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Logado como</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user?.email || 'Parlamentar'}</p>
                  </div>
                  
                  {user?.is_admin && (
                    <>
                      <Link 
                        href="/perfis" 
                        className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <UserCircle size={16} />
                        <span>Perfil</span>
                      </Link>
                      <Link 
                        href="/usuarios" 
                        className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <Users size={16} />
                        <span>Usuário</span>
                      </Link>
                      <Link 
                        href="/configuracoes" 
                        className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Configurações</span>
                      </Link>
                    </>
                  )}
                  
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-100 dark:border-slate-700 mt-2"
                  >
                    <Settings size={16} className="rotate-45" /> 
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

