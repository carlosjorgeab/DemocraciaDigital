'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, Save, X, Shield } from 'lucide-react';

type Perfil = {
  id: string;
  nome: string;
  permissoes: string[];
};

const MENU_OPTIONS = [
  // e-Gabinete Parlamentar
  { id: '/gabinete', label: 'Gabinete - Painel Geral', category: 'Gabinete' },
  { id: '/gabinete/agenda', label: 'Gabinete - Agenda & Compromissos', category: 'Gabinete' },
  { id: '/gabinete/demandas', label: 'Gabinete - Atendimentos & Demandas', category: 'Gabinete' },
  { id: '/gabinete/cadastros', label: 'Gabinete - Pessoas, Lideranças & Entidades', category: 'Gabinete' },
  { id: '/gabinete/audiencias', label: 'Gabinete - Solicitações de Audiência', category: 'Gabinete' },
  { id: '/gabinete/oficios', label: 'Gabinete - Ofícios & Memos', category: 'Gabinete' },
  { id: '/gabinete/visitas', label: 'Gabinete - Registro de Visitas', category: 'Gabinete' },
  { id: '/gabinete/ligacoes', label: 'Gabinete - Ligações & Telemarketing', category: 'Gabinete' },

  // Gestão Parlamentar & Orçamento
  { id: '/emendas', label: 'Emendas Impositivas', category: 'Parlamentar' },
  { id: '/projetos', label: 'Projetos de Lei / Propostas', category: 'Parlamentar' },
  { id: '/editais', label: 'Editais e Chamadas Públicas', category: 'Parlamentar' },
  { id: '/ministerios', label: 'Ministérios & Órgãos', category: 'Parlamentar' },
  { id: '/base-eleitoral', label: 'Base Eleitoral', category: 'Parlamentar' },
  { id: '/relatorios', label: 'Relatórios & Inteligência', category: 'Parlamentar' },

  // Tabelas Gerais & Sistema
  { id: '/partidos', label: 'Partidos Políticos', category: 'Administrativo' },
  { id: '/deputados', label: 'Cadastro de Deputados', category: 'Administrativo' },
  { id: '/areas-tematicas', label: 'Áreas Temáticas', category: 'Administrativo' },
  { id: '/perfis', label: 'Cadastro de Perfis', category: 'Administrativo' },
  { id: '/usuarios', label: 'Cadastro de Usuários', category: 'Administrativo' },
  { id: '/configuracoes', label: 'Configurações do Sistema', category: 'Administrativo' },
];

const PROFILE_PRESETS = [
  {
    nome: 'Chefe de Gabinete',
    description: 'Acesso completo a todas as ferramentas do e-Gabinete Parlamentar, relatórios e demandas',
    permissoes: [
      '/gabinete', '/gabinete/agenda', '/gabinete/demandas', '/gabinete/cadastros',
      '/gabinete/audiencias', '/gabinete/oficios', '/gabinete/visitas', '/gabinete/ligacoes',
      '/emendas', '/projetos', '/editais', '/relatorios', '/ministerios'
    ]
  },
  {
    nome: 'Assessor Parlamentar / Político',
    description: 'Foco em agenda, conciliação de demandas, ofícios, audiências e base eleitoral',
    permissoes: [
      '/gabinete', '/gabinete/agenda', '/gabinete/demandas', '/gabinete/cadastros',
      '/gabinete/audiencias', '/gabinete/oficios', '/base-eleitoral'
    ]
  },
  {
    nome: 'Atendente / Recepcionista',
    description: 'Gestão de recepção presencial, atendimento telefônico, recados e abertura de demandas',
    permissoes: [
      '/gabinete', '/gabinete/agenda', '/gabinete/demandas', '/gabinete/cadastros',
      '/gabinete/visitas', '/gabinete/ligacoes'
    ]
  },
  {
    nome: 'Gestor de Emendas & Editais',
    description: 'Foco técnico em orçamento parlamentar, indicação de recursos e monitoramento de editais',
    permissoes: [
      '/gabinete', '/emendas', '/editais', '/projetos', '/ministerios', '/relatorios'
    ]
  }
];

export default function PerfisPage() {
  const { user } = useAuth();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPerfil, setCurrentPerfil] = useState<Partial<Perfil>>({ nome: '', permissoes: [] });
  const [error, setError] = useState('');

  async function fetchPerfis() {
    setLoading(true);
    const { data, error } = await supabase.from('perfis').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setPerfis(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line
    fetchPerfis();
  }, []);

  const handleSave = async () => {
    if (!currentPerfil.nome) {
      setError('O nome do perfil é obrigatório.');
      return;
    }

    setError('');
    const perfilData = {
      nome: currentPerfil.nome,
      permissoes: currentPerfil.permissoes || []
    };

    if (currentPerfil.id) {
      const { error } = await supabase.from('perfis').update(perfilData).eq('id', currentPerfil.id);
      if (error) setError('Erro ao atualizar perfil.');
      else {
        setIsEditing(false);
        fetchPerfis();
      }
    } else {
      const { error } = await supabase.from('perfis').insert([perfilData]);
      if (error) setError('Erro ao criar perfil.');
      else {
        setIsEditing(false);
        fetchPerfis();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este perfil?')) {
      const { error } = await supabase.from('perfis').delete().eq('id', id);
      if (error) alert('Erro ao excluir perfil. Verifique se existem usuários vinculados.');
      else fetchPerfis();
    }
  };

  const togglePermission = (menuId: string) => {
    const currentPerms = currentPerfil.permissoes || [];
    if (currentPerms.includes(menuId)) {
      setCurrentPerfil({ ...currentPerfil, permissoes: currentPerms.filter(p => p !== menuId) });
    } else {
      setCurrentPerfil({ ...currentPerfil, permissoes: [...currentPerms, menuId] });
    }
  };

  if (!user?.is_admin && !user?.perfil?.permissoes.includes('/perfis')) {
    return <div className="p-8 text-center text-slate-500">Acesso negado.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Shield className="text-primary" />
            Cadastro de Perfis
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie os perfis de acesso e suas permissões</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => { setCurrentPerfil({ nome: '', permissoes: [] }); setIsEditing(true); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Novo Perfil
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">{currentPerfil.id ? 'Editar Perfil' : 'Novo Perfil'}</h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nome do Perfil</label>
              <input 
                type="text" 
                value={currentPerfil.nome || ''} 
                onChange={(e) => setCurrentPerfil({...currentPerfil, nome: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ex: Chefe de Gabinete, Assessor Parlamentar"
              />
            </div>

            {/* Presets / Modelos Rápidos */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                Modelos de Perfis Pré-Configurados (Clique para carregar)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROFILE_PRESETS.map((preset) => (
                  <button
                    key={preset.nome}
                    type="button"
                    onClick={() => {
                      setCurrentPerfil({
                        ...currentPerfil,
                        nome: preset.nome,
                        permissoes: preset.permissoes
                      });
                    }}
                    className="p-3 text-left bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-xs transition-all group"
                  >
                    <div className="font-black text-xs text-slate-900 dark:text-white group-hover:text-emerald-600">
                      {preset.nome}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Permissões de Acesso do Perfil</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPerfil({ ...currentPerfil, permissoes: MENU_OPTIONS.map(m => m.id) })}
                    className="text-[11px] font-bold text-emerald-600 hover:underline"
                  >
                    Marcar Todos
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPerfil({ ...currentPerfil, permissoes: [] })}
                    className="text-[11px] font-bold text-slate-500 hover:underline"
                  >
                    Desmarcar Todos
                  </button>
                </div>
              </div>

              {/* Fixed default permissions */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold">
                  <input type="checkbox" checked disabled className="w-4 h-4 text-emerald-600 rounded" />
                  <span>Visão Geral (Sempre liberado)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold">
                  <input type="checkbox" checked disabled className="w-4 h-4 text-emerald-600 rounded" />
                  <span>Visão Mapa (Sempre liberado)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-bold">
                  <input type="checkbox" checked disabled className="w-4 h-4 text-emerald-600 rounded" />
                  <span>Adesão Edital (Sempre liberado)</span>
                </div>
              </div>

              {/* Categorized Options */}
              <div className="space-y-6">
                {['Gabinete', 'Parlamentar', 'Administrativo'].map((cat) => {
                  const items = MENU_OPTIONS.filter(m => m.category === cat);
                  if (items.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        {cat === 'Gabinete' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                        {cat === 'Parlamentar' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                        {cat === 'Administrativo' && <span className="w-2 h-2 rounded-full bg-purple-500"></span>}
                        Módulo {cat}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((menu) => (
                          <label 
                            key={menu.id} 
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                              (currentPerfil.permissoes || []).includes(menu.id)
                                ? 'border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 font-bold'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={(currentPerfil.permissoes || []).includes(menu.id)}
                              onChange={() => togglePermission(menu.id)}
                              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" 
                            />
                            <span className="text-xs font-bold">{menu.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                <Save size={20} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Carregando...</div>
          ) : perfis.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhum perfil cadastrado.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm">Nome do Perfil</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm">Permissões</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {perfis.map(perfil => (
                  <tr key={perfil.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{perfil.nome}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md font-medium">Visão Geral</span>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md font-medium">Visão Mapa</span>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md font-medium">Adesão Edital</span>
                        {perfil.permissoes.map(p => {
                          const menu = MENU_OPTIONS.find(m => m.id === p);
                          return menu ? (
                            <span key={p} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">
                              {menu.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setCurrentPerfil(perfil); setIsEditing(true); }}
                          className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(perfil.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
