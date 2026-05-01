'use client';
import { useState } from 'react';
import { Settings, Save, Bell, Shield, User, Globe, Moon } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('geral');

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Settings },
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
  ];

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Sistema</p>
        <h2 className="text-3xl font-black font-headline text-slate-900 uppercase tracking-tight">Configurações</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar de Configurações */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          {activeTab === 'geral' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black font-headline text-slate-900 uppercase">Configurações Gerais</h3>
                <p className="text-slate-500 text-sm">Ajuste as preferências básicas do sistema</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                       <Moon size={20} />
                    </div>
                    <div>
                       <p className="font-bold text-slate-900">Modo Escuro</p>
                       <p className="text-xs text-slate-500">Alternar tema do sistema automaticamente</p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-slate-200 rounded-full cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 transition duration-200 ease-in-out bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                       <Globe size={20} />
                    </div>
                    <div>
                       <p className="font-bold text-slate-900">Idioma</p>
                       <p className="text-xs text-slate-500">Português (Brasil)</p>
                    </div>
                  </div>
                  <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Alterar</button>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:opacity-90">
                  <Save size={18} />
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'geral' && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 italic">
               <Settings size={48} className="mb-4 opacity-10" />
               <p>Seção em desenvolvimento...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
