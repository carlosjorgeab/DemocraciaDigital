'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Trash2, Save, X, Tags, Palette, Upload } from 'lucide-react';

type AreaTematica = {
  id: string;
  nome: string;
  cor: string;
  icone_url?: string;
};

const PRESET_ICONS = [
  {
    nome: 'Saúde',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
  },
  {
    nome: 'Educação',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/></svg>`
  },
  {
    nome: 'Segurança',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  },
  {
    nome: 'Esporte',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><circle cx="12" cy="12" r="10"/><path d="M6 12A6 6 0 0 1 18 12"/><path d="M12 6A6 6 0 0 1 12 18"/></svg>`
  },
  {
    nome: 'Cultura',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><circle cx="12" cy="12" r="3"/></svg>`
  },
  {
    nome: 'Habitação',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>`
  },
  {
    nome: 'Ambiente',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1 8a7 7 0 0 1-9 10Z"/><path d="M9 22v-4"/></svg>`
  },
  {
    nome: 'Inovação',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M16.26 16.26l1.41 1.41M2 12h2M20 12h2"/><circle cx="12" cy="12" r="4"/></svg>`
  }
];

export default function AreasTematicasPage() {
  const { user } = useAuth();
  const [areas, setAreas] = useState<AreaTematica[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArea, setCurrentArea] = useState<Partial<AreaTematica>>({ nome: '', cor: '#005baa', icone_url: '' });
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
      cor: currentArea.cor || '#005baa',
      icone_url: currentArea.icone_url || ''
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

          <div className="mt-8 border-t border-slate-100 dark:border-slate-750 pt-6 space-y-4">
            <div>
              <label className="block text-sm font-black uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                Ícone / Imagem da Área Temática (Somente com as bordas)
              </label>
              <p className="text-xs text-slate-500 mt-1">
                Selecione um ícone minimalista pré-definido abaixo ou envie uma imagem ou vetor próprio (SVG, PNG, JPG).
              </p>
            </div>

            {/* Grid de Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {PRESET_ICONS.map((preset) => (
                <button
                  key={preset.nome}
                  type="button"
                  onClick={() => setCurrentArea({ ...currentArea, icone_url: preset.svg })}
                  className={`p-3 flex flex-col items-center justify-center border-2 rounded-2xl transition-all ${
                    currentArea.icone_url === preset.svg
                      ? 'border-primary bg-primary/5 text-primary scale-102 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500 hover:text-slate-700'
                  }`}
                  title={preset.nome}
                >
                  <div dangerouslySetInnerHTML={{ __html: preset.svg }} className="w-8 h-8 flex items-center justify-center" style={{ color: currentArea.cor || '#005baa' }} />
                  <span className="text-[10px] font-bold mt-1 text-center line-clamp-1">{preset.nome}</span>
                </button>
              ))}
            </div>

            {/* Custom file uploader */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-950 shrink-0 overflow-hidden relative shadow-sm"
                style={{ borderColor: currentArea.cor + 'dd', borderWidth: '2px', borderStyle: 'solid' }}
              >
                {currentArea.icone_url ? (
                  currentArea.icone_url.startsWith('<svg') ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: currentArea.icone_url }} 
                      style={{ color: currentArea.cor }}
                      className="w-12 h-12 flex items-center justify-center p-1" 
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={currentArea.icone_url} 
                      alt="Ícone customizado" 
                      className="w-12 h-12 object-contain" 
                    />
                  )
                ) : (
                  <span className="text-xs text-slate-400 font-semibold px-2 text-center">Sem Ícone</span>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Carregar Imagem Personalizada</p>
                <p className="text-[10px] text-slate-500">FORMATOS RECOMENDADOS: SVG, PNG ou JPG. Para melhor integração visual, envie imagens com fundo transparente e foco em contornos/linhas.</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <label className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors text-xs font-bold shadow-sm">
                    <Upload size={14} />
                    Selecionar Arquivo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setCurrentArea({ ...currentArea, icone_url: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {currentArea.icone_url && (
                    <button
                      type="button"
                      onClick={() => setCurrentArea({ ...currentArea, icone_url: '' })}
                      className="text-xs font-bold text-red-500 hover:text-red-700 px-3.5 py-2 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      Remover Ícone
                    </button>
                  )}
                </div>
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
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm">Ícone / Borda</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm">Cor</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm">Nome da Área</th>
                  <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-sm text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {areas.map(area => (
                  <tr key={area.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center p-2 transition-all shadow-sm" 
                        style={{ borderColor: area.cor + '44', borderWidth: '2px', borderStyle: 'solid', backgroundColor: area.cor + '0d' }}
                      >
                        {area.icone_url ? (
                          area.icone_url.startsWith('<svg') ? (
                            <div dangerouslySetInnerHTML={{ __html: area.icone_url }} className="w-6 h-6 flex items-center justify-center" style={{ color: area.cor }} />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={area.icone_url} alt={area.nome} className="w-6 h-6 object-contain" />
                          )
                        ) : (
                          <Tags size={18} style={{ color: area.cor }} />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm" style={{ backgroundColor: area.cor }} />
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{area.cor}</span>
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
