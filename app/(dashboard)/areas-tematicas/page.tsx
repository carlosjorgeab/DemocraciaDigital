'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, Save, X, Tags, Palette } from 'lucide-react';

type AreaTematica = {
  id: string;
  nome: string;
  cor: string;
};

export default function AreasTematicasPage() {
  const { user } = useAuth();
  const [areas, setAreas] = useState<AreaTematica[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArea, setCurrentArea] = useState<Partial<AreaTematica>>({ nome: '', cor: '#005baa' });
  const [error, setError] = useState('');

  async function fetchAreas() {
    setLoading(true);
    const { data, error } = await supabase.from('areas_tematicas').select('*').order('nome', { ascending: true });
    if (!error && data) {
      setAreas(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleSave = async () => {
    if (!currentArea.nome) {
      setError('O nome da área é obrigatório.');
      return;
    }

    setError('');
    const areaData = {
      nome: currentArea.nome,
      cor: currentArea.cor || '#005baa'
    };

    if (currentArea.id) {
      const { error } = await supabase.from('areas_tematicas').update(areaData).eq('id', currentArea.id);
      if (error) setError('Erro ao atualizar área temática.');
      else {
        setIsEditing(false);
        fetchAreas();
      }
    } else {
      const { error } = await supabase.from('areas_tematicas').insert([areaData]);
      if (error) setError('Erro ao criar área temática.');
      else {
        setIsEditing(false);
        fetchAreas();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta área temática?')) {
      const { error } = await supabase.from('areas_tematicas').delete().eq('id', id);
      if (error) {
         if (error.code === '23503') {
           alert('Erro ao excluir: existem projetos ou emendas vinculados a esta área.');
         } else {
           alert('Erro ao excluir área temática.');
         }
      }
      else fetchAreas();
    }
  };

  if (!user?.is_admin && !user?.perfil?.permissoes.includes('/areas-tematicas')) {
    return <div className="p-8 text-center text-slate-500">Acesso negado.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Tags className="text-primary" />
            Cadastro de Áreas Temáticas
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie as áreas de impacto das emendas e projetos</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => { setCurrentArea({ nome: '', cor: '#005baa' }); setIsEditing(true); }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Nova Área
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">{currentArea.id ? 'Editar Área' : 'Nova Área'}</h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nome da Área</label>
              <input 
                type="text" 
                value={currentArea.nome} 
                onChange={(e) => setCurrentArea({...currentArea, nome: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ex: Saúde, Educação..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Cor de Destaque (Gráficos)</label>
              <div className="flex gap-3">
                <input 
                  type="color" 
                  value={currentArea.cor} 
                  onChange={(e) => setCurrentArea({...currentArea, cor: e.target.value})}
                  className="h-10 w-20 p-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 cursor-pointer"
                />
                <input 
                  type="text" 
                  value={currentArea.cor} 
                  onChange={(e) => setCurrentArea({...currentArea, cor: e.target.value})}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
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
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Carregando...</div>
          ) : areas.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nenhuma área temática cadastrada.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm">Cor</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm">Nome da Área</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {areas.map(area => (
                  <tr key={area.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-full shadow-inner flex items-center justify-center" style={{ backgroundColor: area.cor }}>
                         <div className="w-4 h-4 rounded-full border border-white/20"></div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{area.nome}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setCurrentArea(area); setIsEditing(true); }}
                          className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(area.id)}
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
