'use client';

import { useState } from 'react';
import { useGabinete } from '@/context/GabineteContext';
import { RegistroVisita } from '@/lib/gabineteStore';
import { UserCheck, Plus, Search, Calendar, MapPin, FileText, CheckCircle2, Edit2, Trash2, Clock } from 'lucide-react';

const getTodayDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function VisitasPage() {
  const { visitas, addVisita, updateVisita, deleteVisita } = useGabinete();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVisitaId, setEditingVisitaId] = useState<string | null>(null);

  // Form State with Data e Horário defaulting to Current Date and Time (Today)
  const [formData, setFormData] = useState({
    pessoa_entidade: '',
    lugar: 'Gabinete parlamentar',
    tipo_visita: 'Recebida',
    atendido_por: 'Marcelo',
    assessor: 'Marcelo Guaraldo',
    motivo: 'Cortesia',
    resumo_visita: '',
    data_horario: getTodayDateTimeString(),
  });

  const handleOpenNewModal = () => {
    setEditingVisitaId(null);
    setFormData({
      pessoa_entidade: '',
      lugar: 'Gabinete parlamentar',
      tipo_visita: 'Recebida',
      atendido_por: 'Marcelo',
      assessor: 'Marcelo Guaraldo',
      motivo: 'Cortesia',
      resumo_visita: '',
      data_horario: getTodayDateTimeString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vis: RegistroVisita) => {
    setEditingVisitaId(vis.id);
    setFormData({
      pessoa_entidade: vis.pessoa_entidade,
      lugar: vis.lugar || 'Gabinete parlamentar',
      tipo_visita: vis.tipo_visita || 'Recebida',
      atendido_por: vis.atendido_por || 'Marcelo',
      assessor: vis.assessor || 'Marcelo Guaraldo',
      motivo: vis.motivo || 'Cortesia',
      resumo_visita: vis.resumo_visita || '',
      data_horario: vis.data_horario ? vis.data_horario.substring(0, 16) : getTodayDateTimeString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVisitaId) {
      updateVisita(editingVisitaId, {
        pessoa_entidade: formData.pessoa_entidade,
        lugar: formData.lugar,
        tipo_visita: formData.tipo_visita,
        atendido_por: formData.atendido_por,
        assessor: formData.assessor,
        motivo: formData.motivo,
        resumo_visita: formData.resumo_visita,
        data_horario: new Date(formData.data_horario).toISOString(),
      });
    } else {
      addVisita({
        pessoa_entidade: formData.pessoa_entidade,
        lugar: formData.lugar,
        tipo_visita: formData.tipo_visita,
        atendido_por: formData.atendido_por,
        assessor: formData.assessor,
        motivo: formData.motivo,
        resumo_visita: formData.resumo_visita,
        data_horario: new Date(formData.data_horario).toISOString(),
        ficha: 70 + visitas.length,
        status: 'Atendido',
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-['Inter']">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
            <UserCheck size={16} /> e-Gabinete • Atendimento Presencial
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Registro de Visitas</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Controle de recepção, fichas de visitas recebidas no gabinete e viagens em campo.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 text-xs uppercase tracking-wider transition-all"
        >
          <Plus size={18} /> Registrar Nova Visita
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visitas.map((vis) => (
            <div key={vis.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md">
                  Ficha #{vis.ficha || 70}
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Clock size={12} className="text-cyan-600" />
                  {vis.data_horario ? new Date(vis.data_horario).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Dia Atual'}
                </span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{vis.pessoa_entidade}</h3>
                  <span className="text-xs text-slate-500 font-medium">Lugar: {vis.lugar}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(vis)}
                    className="p-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-lg transition-all"
                    title="Editar Registro"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este registro de visita?')) {
                        deleteVisita(vis.id);
                      }
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded-lg transition-all"
                    title="Excluir Registro"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                {vis.resumo_visita}
              </p>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
                <span>Atendido por: <strong>{vis.atendido_por}</strong></span>
                <span>Motivo: <strong>{vis.motivo}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 space-y-6 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900">
              {editingVisitaId ? 'Editar Registro de Visita' : 'Registrar Visita'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Data e Horário do Atendimento * (Padrão: Hoje)</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.data_horario}
                  onChange={(e) => setFormData({ ...formData, data_horario: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">Pessoa / Entidade Visitante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Saulo Vieira"
                  value={formData.pessoa_entidade}
                  onChange={(e) => setFormData({ ...formData, pessoa_entidade: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Local da Visita</label>
                  <input
                    type="text"
                    value={formData.lugar}
                    onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block mb-1">Atendido Por</label>
                  <input
                    type="text"
                    value={formData.atendido_por}
                    onChange={(e) => setFormData({ ...formData, atendido_por: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Resumo da Conversa / Demandas *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Anotações do atendimento..."
                  value={formData.resumo_visita}
                  onChange={(e) => setFormData({ ...formData, resumo_visita: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-cyan-600 text-white font-black rounded-xl uppercase text-xs">
                  {editingVisitaId ? 'Salvar Alterações' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
