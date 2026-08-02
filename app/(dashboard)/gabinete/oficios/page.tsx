'use client';

import { useState } from 'react';
import { useGabinete } from '@/context/GabineteContext';
import { Oficio } from '@/lib/gabineteStore';
import { Mail, Plus, Search, FileText, Download, CheckCircle2, Building2, Edit2, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function OficiosPage() {
  const { oficios, addOficio, updateOficio, deleteOficio } = useGabinete();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOficioId, setEditingOficioId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    numero_oficio: `OF ${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear()}`,
    interessado: '',
    destinatario: '',
    assunto: '',
    assessor_responsavel: 'Marcelo Guaraldo',
  });

  const handleOpenNewModal = () => {
    setEditingOficioId(null);
    setFormData({
      numero_oficio: `OF ${Math.floor(100 + Math.random() * 900)}/${new Date().getFullYear()}`,
      interessado: '',
      destinatario: '',
      assunto: '',
      assessor_responsavel: 'Marcelo Guaraldo',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ofi: Oficio) => {
    setEditingOficioId(ofi.id);
    setFormData({
      numero_oficio: ofi.numero_oficio,
      interessado: ofi.interessado,
      destinatario: ofi.destinatario,
      assunto: ofi.assunto,
      assessor_responsavel: ofi.assessor_responsavel || 'Marcelo Guaraldo',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOficioId) {
      updateOficio(editingOficioId, {
        numero_oficio: formData.numero_oficio,
        interessado: formData.interessado,
        destinatario: formData.destinatario,
        assunto: formData.assunto,
        assessor_responsavel: formData.assessor_responsavel,
      });
    } else {
      addOficio({
        numero_oficio: formData.numero_oficio,
        interessado: formData.interessado,
        destinatario: formData.destinatario,
        assunto: formData.assunto,
        assessor_responsavel: formData.assessor_responsavel,
        data_emissao: new Date().toISOString().split('T')[0],
        status: 'Enviado',
      });
    }
    setIsModalOpen(false);
  };

  const handleDownloadPDF = (oficio: typeof oficios[0]) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('GABINETE PARLAMENTAR', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`OFÍCIO Nº ${oficio.numero_oficio}`, 105, 30, { align: 'center' });
    doc.text(`Data: ${oficio.data_emissao}`, 20, 50);
    doc.text(`Para: ${oficio.destinatario}`, 20, 60);
    doc.text(`Interessado: ${oficio.interessado}`, 20, 70);
    doc.text('Assunto:', 20, 85);
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(oficio.assunto, 170), 20, 95);
    doc.text('Atenciosamente,', 20, 150);
    doc.text('Gabinete Parlamentar', 20, 160);
    doc.save(`Oficio_${oficio.numero_oficio.replace('/', '_')}.pdf`);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-['Inter']">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider">
            <Mail size={16} /> e-Gabinete • Documentos
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Emissão de Ofícios & Memos</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Documentação oficial expedida pelo gabinete para secretarias, órgãos e ministérios.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 text-xs uppercase tracking-wider transition-all"
        >
          <Plus size={18} /> Emitir Novo Ofício
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 font-black text-slate-900 text-lg">
          Histórico de Ofícios Emitidos ({oficios.length})
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-800">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-500">
                <th className="p-4 pl-6">Número</th>
                <th className="p-4">Data</th>
                <th className="p-4">Interessado</th>
                <th className="p-4">Destinatário</th>
                <th className="p-4">Assunto</th>
                <th className="p-4 pr-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {oficios.map((ofi) => (
                <tr key={ofi.id} className="hover:bg-slate-50/80">
                  <td className="p-4 pl-6 font-black text-purple-900">{ofi.numero_oficio}</td>
                  <td className="p-4 text-slate-500">{ofi.data_emissao}</td>
                  <td className="p-4 font-bold text-slate-900">{ofi.interessado}</td>
                  <td className="p-4 text-slate-700">{ofi.destinatario}</td>
                  <td className="p-4 text-slate-600 line-clamp-1">{ofi.assunto}</td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleDownloadPDF(ofi)}
                        className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition-all font-bold flex items-center gap-1 text-xs"
                      >
                        <Download size={14} /> PDF
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(ofi)}
                        className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-xl transition-all"
                        title="Editar Ofício"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir este ofício?')) {
                            deleteOficio(ofi.id);
                          }
                        }}
                        className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded-xl transition-all"
                        title="Excluir Ofício"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl p-6 space-y-6 border border-slate-100">
            <h2 className="text-xl font-black text-slate-900">
              {editingOficioId ? 'Editar Ofício' : 'Emitir Novo Ofício'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Número do Ofício *</label>
                <input
                  type="text"
                  required
                  value={formData.numero_oficio}
                  onChange={(e) => setFormData({ ...formData, numero_oficio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1">Interessado / Solicitante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria das Graças ou Associação X"
                  value={formData.interessado}
                  onChange={(e) => setFormData({ ...formData, interessado: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1">Destinatário (Órgão / Autoridade) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Secretário Estadual de Saúde"
                  value={formData.destinatario}
                  onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1">Assunto / Texto do Ofício *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Texto do requerimento..."
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-semibold text-slate-900"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 bg-purple-600 text-white font-black rounded-xl uppercase text-xs">
                  {editingOficioId ? 'Salvar Alterações' : 'Emitir Ofício'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
