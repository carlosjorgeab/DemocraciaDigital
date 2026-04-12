'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileText, Eye } from 'lucide-react';
import Link from 'next/link';

export default function FormulariosEmendaList({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [emenda, setEmenda] = useState<any>(null);
  const [formularios, setFormularios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch emenda details
      const { data: emendaData } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (emendaData) {
        setEmenda(emendaData);
      }

      // Fetch existing forms for this emenda
      const { data: formsData } = await supabase
        .from('formularios_emenda')
        .select('*')
        .eq('id_emenda', id)
        .order('created_at', { ascending: false });
      
      if (formsData) {
        setFormularios(formsData);
      }
      
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/emendas" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Formulários da Emenda</p>
          <h2 className="text-3xl font-black font-headline text-on-surface">
            {emenda ? emenda.objeto : 'Carregando...'}
          </h2>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Data de Criação</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Entidade</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">CNPJ</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Projeto</th>
                <th className="px-6 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {formularios.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum formulário encontrado para esta emenda.</td></tr>
              ) : (
                formularios.map(form => (
                  <tr key={form.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface font-medium">
                        {new Date(form.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-on-surface">{form.nome_entidade}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface">{form.cnpj}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-on-surface">{form.nome_projeto}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/emendas/${id}/formularios/${form.id}`} className="p-2 text-slate-400 hover:text-primary transition-colors rounded-lg hover:bg-blue-50" title="Visualizar">
                          <Eye size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
