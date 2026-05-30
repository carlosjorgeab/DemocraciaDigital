'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useDeputado } from '@/context/DeputadoContext';
import { FileText, ArrowLeft, ExternalLink, RefreshCw, AlertCircle, Award, Landmark, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function PublicProcessosPage() {
  const { selectedDeputado, loading: depLoading } = useDeputado();
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicProjetos() {
      if (!selectedDeputado) {
        setProjetos([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('projetos')
          .select('*, areas_tematicas(nome, cor)')
          .eq('id_deputado', selectedDeputado.id)
          .eq('etapa', 'Liberado'); // Somente os publicados/liberados

        if (data) {
          setProjetos(data);
        }
      } catch (err) {
        console.error('Erro ao buscar processos públicos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicProjetos();
  }, [selectedDeputado]);

  if (depLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-primary" size={32} />
          <p className="text-sm font-semibold text-slate-500">Buscando processos parlamentares...</p>
        </div>
      </div>
    );
  }

  if (!selectedDeputado) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-tight">Página Indisponível</h1>
            <p className="text-slate-500 mt-2 font-medium">Este perfil parlamentar não está ativo ou não foi encontrado em nossa base de dados.</p>
          </div>
          <Link 
            href="/"
            className="block w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:opacity-90 text-center transition-all uppercase text-xs tracking-widest"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header Público */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Landmark className="w-6 h-6 text-primary" />
            <div className="flex flex-col">
              <h1 className="text-sm font-black uppercase tracking-tighter text-slate-800 leading-none">Democracia Digital</h1>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Portal de Transparência</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href={`/p/${selectedDeputado.slug || selectedDeputado.id}`}
              className="flex items-center gap-1 text-xs font-black uppercase tracking-wider text-slate-600 hover:text-primary transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg"
            >
              <ArrowLeft size={14} />
              Voltar ao Painel
            </Link>
          </div>
        </div>
      </header>

      {/* Hero do Parlamentar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4 shadow-inner">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-white/20 shadow-xl bg-slate-700 shrink-0">
            {selectedDeputado.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                alt={`Foto de ${selectedDeputado.nome}`} 
                className="w-full h-full object-cover" 
                src={selectedDeputado.foto_url} 
              />
            ) : (
              <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
                <UserCircle size={44} />
              </div>
            )}
          </div>
          <div className="text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                Deputado(a) {selectedDeputado.estado}
              </span>
              {selectedDeputado.partidos && (
                <span className="px-2.5 py-0.5 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-wider border border-white/5">
                  {selectedDeputado.partidos.sigla} - {selectedDeputado.partidos.nome}
                </span>
              )}
            </div>
            <h2 className="text-3xl font-black tracking-tight font-headline">{selectedDeputado.nome}</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Acompanhe em tempo real a tramitação dos processos legislativos e propostas de emendas de forma livre e transparente.
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal / Listagem de Processos */}
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-black text-slate-800">Processos Legislativos ({projetos.length})</h3>
            <p className="text-xs text-slate-500">Lista cronológica de propostas e projetos de lei em andamento</p>
          </div>
        </div>

        {projetos.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/60 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FileText size={32} />
            </div>
            <div>
              <p className="text-slate-700 font-bold text-lg">Nenhum processo em tramitação</p>
              <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">Este parlamentar não possui processos legislativos liberados para visualização externa.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projetos.map((projeto) => (
              <div 
                key={projeto.id} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow space-y-5"
                id={`processo-${projeto.id}`}
              >
                {/* 1a. Linha: Nº Proposição */}
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">1ª Linha: Nº Proposição</span>
                  {projeto.url_legislativo ? (
                    <a 
                      href={projeto.url_legislativo} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-lg font-black text-primary hover:underline inline-flex items-center gap-1.5"
                    >
                      {projeto.numero_proposicao || 'Visualizar Link'}
                      <ExternalLink size={15} />
                    </a>
                  ) : (
                    <span className="text-lg font-black text-slate-800">
                      {projeto.numero_proposicao || 'Sem Nº Cadastrado'}
                    </span>
                  )}
                </div>

                {/* 2a. Linha: Descrição do Projeto */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">2ª Linha: Descrição do Projeto</span>
                  <p className="text-base font-bold text-slate-800 leading-snug">
                    {projeto.descricao}
                  </p>
                </div>

                {/* 3a. Linha: Ementa */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">3ª Linha: Ementa</span>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100/80">
                    {projeto.ementa || 'Sem ementa cadastrada.'}
                  </p>
                </div>

                {/* 4a. Linha: Tipo do Projeto */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">4ª Linha: Tipo do Projeto</span>
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-850 rounded-full font-bold text-xs uppercase tracking-tight border border-slate-200/40">
                    {projeto.tipo || 'Não especificado'}
                  </span>
                </div>

                {/* 5a. Linha: Tramitação */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">5ª Linha: Tramitação</span>
                  <span className="inline-block px-3.5 py-1 bg-blue-50 text-blue-700 border border-blue-100/60 rounded-full font-bold text-xs">
                    {projeto.tramitacao || 'Em elaboração'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Público */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center mt-12">
        <p className="text-xs font-black uppercase tracking-widest">
          Democracia Digital &copy; {new Date().getFullYear()} - Sistema Transparente de Prestação de Contas
        </p>
      </footer>
    </div>
  );
}
