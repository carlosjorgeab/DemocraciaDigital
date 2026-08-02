'use client';

import { useState } from 'react';
import { useGabinete } from '@/context/GabineteContext';
import { UserCheck, Plus, Search, Calendar, MapPin, FileText, CheckCircle2 } from 'lucide-react';

export default function VisitasPage() {
  const { visitas, addVisita } = useGabinete();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    pessoa_entidade: '',
    lugar: 'Gabinete parlamentar',
    tipo_visita: 'Recebida',
    atendido_por: 'Marcelo',
    assessor: 'Marcelo Guaraldo',
    motivo: 'Cortesia',
    resumo_visita: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addVisita({
      ...formData,
      ficha: 70 + visitas.length,
      status: 'Atendido',
    });
    setIsModalOpen(false);
    setFormData({
      pessoa_entidade: '',
      lugar: 'Gabinete parlamentar',
      tipo_visita: 'Recebida',
      atendido_por: 'Marcelo',
      assessor: 'Marcelo Guaraldo',
      motivo: 'Cortesia',
      resumo_visita: '',
    });
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
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 text-xs uppercase tracking-wider transition-all"
        >
          <Plus size={18} /> Registrar Nova Visita
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visitas.map((vis) => (
            <div key={vis.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md">
                  Ficha #{vis.ficha || 70}
                </span>
                <span className="text-xs text-slate-400 font-medium">Lugar: {vis.lugar}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{vis.pessoa_entidade}</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{vis.resumo_visita}</p>

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
            <h2 className="text-xl font-black text-slate-900">Registrar Visita</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
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
                <button type="submit" className="px-6 py-2.5 bg-cyan-600 text-white font-black rounded-xl uppercase text-xs">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
