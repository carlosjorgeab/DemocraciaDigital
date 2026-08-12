'use client';

import { useState } from 'react';
import { useGabinete } from '@/context/GabineteContext';
import { useDeputado } from '@/context/DeputadoContext';
import { getContrastTextColor } from '@/lib/colorUtils';
import { LigacaoRecebida } from '@/lib/gabineteStore';
import { PhoneCall, Plus, Search, MessageSquare, Phone, CheckCircle2, Edit2, Trash2, Clock } from 'lucide-react';

const getTodayDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function LigacoesPage() {
  const { selectedDeputado } = useDeputado();
  const partyPrimary = selectedDeputado?.partidos?.cor_primaria || '#005baa';
  const partySecondary = selectedDeputado?.partidos?.cor_secundaria || '#002776';
  const partyPrimaryText = getContrastTextColor(partyPrimary);

  const { ligacoes, addLigacao, updateLigacao, deleteLigacao } = useGabinete();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLigacaoId, setEditingLigacaoId] = useState<string | null>(null);

  // Form State with Data e Horario defaulting to Current Date and Time (Today)
  const [formData, setFormData] = useState({
    nome_solicitante: '',
    telefone: '',
    pessoa_procurada: 'Deputado',
    assunto: '',
    atendido_por: 'Marcelo',
    retorno_necessario: true,
    data_hora: getTodayDateTimeString(),
  });

  const handleOpenNewModal = () => {
    setEditingLigacaoId(null);
    setFormData({
      nome_solicitante: '',
      telefone: '',
      pessoa_procurada: 'Deputado',
      assunto: '',
      atendido_por: 'Marcelo',
      retorno_necessario: true,
      data_hora: getTodayDateTimeString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lig: LigacaoRecebida) => {
    setEditingLigacaoId(lig.id);
    setFormData({
      nome_solicitante: lig.nome_solicitante,
      telefone: lig.telefone || '',
      pessoa_procurada: lig.pessoa_procurada || 'Deputado',
      assunto: lig.assunto || '',
      atendido_por: lig.atendido_por || 'Marcelo',
      retorno_necessario: lig.retorno_necessario ?? true,
      data_hora: lig.data_hora ? lig.data_hora.substring(0, 16) : getTodayDateTimeString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLigacaoId) {
      updateLigacao(editingLigacaoId, {
        nome_solicitante: formData.nome_solicitante,
        telefone: formData.telefone,
        pessoa_procurada: formData.pessoa_procurada,
        assunto: formData.assunto,
        atendido_por: formData.atendido_por,
        retorno_necessario: formData.retorno_necessario,
        data_hora: new Date(formData.data_hora).toISOString(),
      });
    } else {
      addLigacao({
        nome_solicitante: formData.nome_solicitante,
        telefone: formData.telefone,
        pessoa_procurada: formData.pessoa_procurada,
        assunto: formData.assunto,
        atendido_por: formData.atendido_por,
        retorno_necessario: formData.retorno_necessario,
        data_hora: new Date(formData.data_hora).toISOString(),
        ficha: 82570 + ligacoes.length,
        status_retorno: 'Sem retorno',
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-['Inter']">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div style={{ color: partyPrimary }} className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
            <PhoneCall size={16} /> e-Gabinete • Atendimento Telefônico
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Chamadas Recebidas & Recados</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Registro de chamadas no gabinete com sinalização de pendência de retorno.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          style={{ backgroundColor: partyPrimary, color: partyPrimaryText }}
          className="font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:opacity-90 text-xs uppercase tracking-wider transition-all"
        >
          <Plus size={18} /> Registrar Chamada
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ligacoes.map((lig) => (
            <div key={lig.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-rose-100 text-rose-900 text-[10px] font-black px-2.5 py-0.5 rounded-md">
                  Ficha #{lig.ficha || 82570}
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Clock size={12} className="text-rose-600" />
                  {lig.data_hora ? new Date(lig.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Dia Atual'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{lig.nome_solicitante}</h3>
                  <span className="text-xs text-slate-500 font-medium">Procurou: {lig.pessoa_procurada}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(lig)}
                    className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-lg transition-all"
                    title="Editar Chamada"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir esta chamada?')) {
                        deleteLigacao(lig.id);
                      }
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded-lg transition-all"
                    title="Excluir Chamada"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-mono font-bold flex items-center gap-1">
                <Phone size={12} className="text-rose-500" /> {lig.telefone}
              </p>

              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                {lig.assunto}
              </p>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
                <span>Atendido por: <strong>{lig.atendido_por}</strong></span>
                <a
                  href={`tel:${lig.telefone.replace(/\D/g, '')}`}
                  className="text-rose-600 font-black hover:underline"
                >
                  Retornar Ligação
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 space-y-6 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900">
              {editingLigacaoId ? 'Editar Chamada Telefônica' : 'Registrar Chamada Telefônica'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Data e Horário da Chamada * (Padrão: Hoje)</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.data_hora}
                  onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">Nome do Solicitante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: NICOLAS"
                  value={formData.nome_solicitante}
                  onChange={(e) => setFormData({ ...formData, nome_solicitante: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Telefone de Contato *</label>
                  <input
                    type="text"
                    required
                    placeholder="(15) 99800-9944"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block mb-1">Pessoa Procurada *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Deputado ou Giovana"
                    value={formData.pessoa_procurada}
                    onChange={(e) => setFormData({ ...formData, pessoa_procurada: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Recado / Assunto *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Recado da ligação..."
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-rose-600 text-white font-black rounded-xl uppercase text-xs">
                  {editingLigacaoId ? 'Salvar Alterações' : 'Salvar Chamada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
