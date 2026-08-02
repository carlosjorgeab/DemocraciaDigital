'use client';

import { useState } from 'react';
import { useGabinete } from '@/context/GabineteContext';
import {
  UserCheck, Plus, Search, Calendar, CheckCircle2, Clock,
  Building2, MessageSquare, AlertCircle, ArrowRight
} from 'lucide-react';

export default function AudienciasPage() {
  const { audiencias, addAudiencia, updateAudiencia } = useGabinete();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    personalidade: '',
    pauta: '',
    assessor_responsavel: 'Nathalia Carvalho',
    status: 'Solicitada',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAudiencia({
      personalidade: formData.personalidade,
      pauta: formData.pauta,
      assessor_responsavel: formData.assessor_responsavel,
      status: formData.status,
      cadastrado_por: formData.assessor_responsavel,
    });
    setIsModalOpen(false);
    setFormData({
      personalidade: '',
      pauta: '',
      assessor_responsavel: 'Nathalia Carvalho',
      status: 'Solicitada',
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-['Inter']">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
            <UserCheck size={16} /> e-Gabinete • Audiências
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Solicitações de Audiência</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Agendamentos com Ministros, Secretários, Prefeitos e altas personalidades.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 text-xs uppercase tracking-wider transition-all"
        >
          <Plus size={18} /> Solicitar Nova Audiência
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {audiencias.map((aud) => (
            <div key={aud.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-md transition-all space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="bg-cyan-100 text-cyan-900 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {aud.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">Assessor: {aud.assessor_responsavel}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{aud.personalidade}</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{aud.pauta}</p>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-slate-400">Solicitado em: {new Date(aud.data_solicitacao).toLocaleDateString('pt-BR')}</span>
                <button
                  onClick={() => updateAudiencia(aud.id, { status: 'Agendada' })}
                  className="text-cyan-600 font-bold hover:underline"
                >
                  Agendar na Pauta
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 space-y-6 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900">Solicitar Audiência</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Personalidade / Órgão *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Secretário Estadual de Infraestrutura"
                  value={formData.personalidade}
                  onChange={(e) => setFormData({ ...formData, personalidade: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1">Pauta Principal *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalhamento da solicitação de agenda..."
                  value={formData.pauta}
                  onChange={(e) => setFormData({ ...formData, pauta: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-cyan-600 text-white font-black rounded-xl uppercase text-xs">Salvar Solicitação</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
