'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, UserCircle, ChevronDown, Settings, Users } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { isWhiteOrNearWhite, getSidebarTopbarFontColor } from '@/lib/colorUtils';

export function Topbar() {
  const { deputados, selectedDeputado, setSelectedDeputado } = useDeputado();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = pathname?.startsWith('/p/');

  const partyPrimary = selectedDeputado?.partidos?.cor_primaria || '#005baa';

  // Topbar background uses partyPrimary
  const topbarBg = partyPrimary;
  const isTopbarWhite = isWhiteOrNearWhite(topbarBg);

  // Font color rule:
  // Font in Topbar MUST be Bold White (#ffffff), EXCEPT when Topbar background is White, in which case font is Bold Black (#000000).
  const topbarTextColor = getSidebarTopbarFontColor(topbarBg);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header 
      style={{ 
        backgroundColor: topbarBg, 
        color: topbarTextColor 
      }}
      className="fixed top-0 w-full z-40 backdrop-blur-xl flex justify-between items-center px-4 md:px-6 h-16 shadow-md border-b border-black/10 transition-colors duration-300"
    >
      <div className="flex items-center gap-2 md:gap-3 ml-10 md:ml-64">
        <Logo className="w-8 h-8 md:w-9 md:h-9 shrink-0" />
        <div className="flex flex-col md:flex-row md:items-center md:gap-3">
          <h1 
            style={{ color: topbarTextColor }}
            className="text-base md:text-lg font-black tracking-tight uppercase font-headline truncate max-w-[140px] md:max-w-none"
          >
            Democracia Digital
          </h1>
          <span 
            className="hidden md:block h-4 w-[1px]" 
            style={{ backgroundColor: isTopbarWhite ? '#cbd5e1' : 'rgba(255, 255, 255, 0.4)' }}
          ></span>
          <span 
            style={{ color: topbarTextColor }}
            className="hidden md:block font-black text-xs uppercase tracking-wider opacity-90"
          >
            Painel do Parlamentar
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Deputado Selector */}
        {!isPublicRoute && deputados.length > 1 && (
          <div 
            className="relative flex items-center rounded-xl px-2.5 md:px-3.5 py-1.5 border-2 shadow-xs transition-all max-w-[140px] md:max-w-none"
            style={{ 
              backgroundColor: isTopbarWhite ? '#f8fafc' : 'rgba(255, 255, 255, 0.2)',
              borderColor: isTopbarWhite ? '#cbd5e1' : 'rgba(255, 255, 255, 0.4)'
            }}
          >
            <select 
              className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-black outline-none cursor-pointer appearance-none pr-6 w-full truncate"
              style={{ color: topbarTextColor }}
              value={selectedDeputado?.id || ''}
              onChange={(e) => {
                const dep = deputados.find(d => d.id === e.target.value);
                setSelectedDeputado(dep || null);
              }}
            >
              <option value="" disabled className="bg-white text-black font-bold">Selecione um Deputado</option>
              {deputados.map(dep => (
                <option key={dep.id} value={dep.id} className="bg-white text-black font-bold">
                  {dep.nome} ({dep.partidos?.sigla}-{dep.estado}) {!dep.ativo ? '(Inativo)' : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 pointer-events-none" style={{ color: topbarTextColor }} />
          </div>
        )}

        {!isPublicRoute && (
          <>
            <form 
              onSubmit={handleSearch} 
              className="hidden lg:flex relative items-center rounded-xl px-4 py-1.5 w-64 border shadow-xs"
              style={{ 
                backgroundColor: isTopbarWhite ? '#f8fafc' : 'rgba(255, 255, 255, 0.2)',
                borderColor: isTopbarWhite ? '#cbd5e1' : 'rgba(255, 255, 255, 0.4)'
              }}
            >
              <Search style={{ color: topbarTextColor }} size={16} />
              <input 
                className="bg-transparent border-none focus:ring-0 text-xs font-black w-full ml-2 outline-none" 
                style={{ color: topbarTextColor }}
                placeholder="Buscar emendas e projetos..." 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="relative group">
              <button 
                className="flex items-center justify-center w-10 h-10 rounded-full border-2 overflow-hidden shadow-xs active:scale-95 transition-all"
                style={{ 
                  backgroundColor: isTopbarWhite ? '#f8fafc' : 'rgba(255, 255, 255, 0.2)',
                  borderColor: isTopbarWhite ? '#cbd5e1' : 'rgba(255, 255, 255, 0.6)'
                }}
              >
                <UserCircle size={26} style={{ color: topbarTextColor }} />
              </button>
              
              {/* Profile Dropdown */}
              {!isPublicRoute && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-slate-900">
                  <div className="px-4 py-3 border-b border-slate-100 mb-2">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Logado como</p>
                    <p className="text-xs font-black text-black truncate">{user?.email || 'Parlamentar'}</p>
                  </div>
                  
                  {user?.is_admin && (
                    <>
                      <Link 
                        href="/perfis" 
                        className="flex items-center gap-3 px-4 py-2 text-xs font-black text-black hover:bg-slate-100 transition-colors"
                      >
                        <UserCircle size={16} />
                        <span>Perfil</span>
                      </Link>
                      <Link 
                        href="/usuarios" 
                        className="flex items-center gap-3 px-4 py-2 text-xs font-black text-black hover:bg-slate-100 transition-colors"
                      >
                        <Users size={16} />
                        <span>Usuário</span>
                      </Link>
                      <Link 
                        href="/configuracoes" 
                        className="flex items-center gap-3 px-4 py-2 text-xs font-black text-black hover:bg-slate-100 transition-colors"
                      >
                        <Settings size={16} />
                        <span>Configurações</span>
                      </Link>
                    </>
                  )}
                  
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs font-black text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-2"
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

