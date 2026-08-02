'use client';

import { useState } from 'react';
import { useGabinete } from '@/context/GabineteContext';
import { Pessoa, Entidade } from '@/lib/gabineteStore';
import {
  Users2, Plus, Search, Filter, Phone, Mail, MapPin, Building,
  CheckCircle2, AlertTriangle, Instagram, Facebook, Sparkles, UserCheck,
  Award, Shield, FileText, ChevronRight, Edit2, Trash2
} from 'lucide-react';

export default function CadastrosPage() {
  const { pessoas, entidades, addPessoa, updatePessoa, deletePessoa, addEntidade, updateEntidade, deleteEntidade } = useGabinete();

  const [activeMainTab, setActiveMainTab] = useState<'pessoas' | 'liderancas' | 'entidades'>('pessoas');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPessoaModalOpen, setIsPessoaModalOpen] = useState(false);
  const [editingPessoaId, setEditingPessoaId] = useState<string | null>(null);
  const [formTab, setFormTab] = useState<'pessoal' | 'contato' | 'endereco' | 'politico'>('pessoal');

  // Form State for Pessoa
  const [pessoaForm, setPessoaForm] = useState({
    nome: '',
    apelido: '',
    cpf: '',
    rg: '',
    data_nascimento: '',
    profissao: '',
    categoria: 'ELEITOR' as any,
    celular1: '',
    celular2: '',
    whatsapp: true,
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: 'São Paulo',
    uf: 'SP',
    votos_estimados: 0,
    instagram: '',
    facebook: '',
    observacoes: '',
    cadastrado_por: 'Marcelo Guaraldo',
  });

  const handleOpenNewPessoa = () => {
    setEditingPessoaId(null);
    setPessoaForm({
      nome: '',
      apelido: '',
      cpf: '',
      rg: '',
      data_nascimento: '',
      profissao: '',
      categoria: 'ELEITOR',
      celular1: '',
      celular2: '',
      whatsapp: true,
      email: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: 'São Paulo',
      uf: 'SP',
      votos_estimados: 0,
      instagram: '',
      facebook: '',
      observacoes: '',
      cadastrado_por: 'Marcelo Guaraldo',
    });
    setFormTab('pessoal');
    setIsPessoaModalOpen(true);
  };

  const handleOpenEditPessoa = (p: Pessoa) => {
    setEditingPessoaId(p.id);
    setPessoaForm({
      nome: p.nome,
      apelido: p.apelido || '',
      cpf: p.cpf || '',
      rg: p.rg || '',
      data_nascimento: p.data_nascimento || '',
      profissao: p.profissao || '',
      categoria: p.categoria || 'ELEITOR',
      celular1: p.celular1 || '',
      celular2: p.celular2 || '',
      whatsapp: p.whatsapp ?? true,
      email: p.email || '',
      cep: p.cep || '',
      logradouro: p.logradouro || '',
      numero: p.numero || '',
      bairro: p.bairro || '',
      cidade: p.cidade || 'São Paulo',
      uf: p.uf || 'SP',
      votos_estimados: p.votos_estimados || 0,
      instagram: p.instagram || '',
      facebook: p.facebook || '',
      observacoes: p.observacoes || '',
      cadastrado_por: p.cadastrado_por || 'Marcelo Guaraldo',
    });
    setFormTab('pessoal');
    setIsPessoaModalOpen(true);
  };

  const filteredPessoas = pessoas.filter((p) => {
    if (activeMainTab === 'liderancas' && p.categoria !== 'LIDERANCA' && p.categoria !== 'AUTORIDADE') {
      return false;
    }
    if (
      searchTerm &&
      !p.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(p.bairro || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(p.cidade || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSubmitPessoa = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPessoaId) {
      updatePessoa(editingPessoaId, {
        ...pessoaForm,
        votos_estimados: Number(pessoaForm.votos_estimados) || 0,
      });
    } else {
      addPessoa({
        ...pessoaForm,
        votos_estimados: Number(pessoaForm.votos_estimados) || 0,
      });
    }
    setIsPessoaModalOpen(false);
  };

  // Metrics
  const totalLiderancas = pessoas.filter((p) => p.categoria === 'LIDERANCA' || p.categoria === 'AUTORIDADE').length;
  const cadastrosIncompletos = pessoas.filter((p) => !p.celular1 || !p.bairro).length;

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen font-['Inter']">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Users2 size={16} /> e-Gabinete • Cadastros Unificados
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">Pessoas, Lideranças & Entidades</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Base eleitoral, lideranças regionais, parceiros institucionais e higienização de contatos.
          </p>
        </div>

        <button
          onClick={handleOpenNewPessoa}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 text-xs uppercase tracking-wider transition-all"
        >
          <Plus size={18} /> Cadastrar Nova Pessoa
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total de Pessoas</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{pessoas.length}</span>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Base eleitoral mapeada</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lideranças & Autoridades</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{totalLiderancas}</span>
          <span className="text-[11px] text-blue-600 font-bold mt-1 block">Articuladores locais</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Entidades Cadastradas</span>
          <span className="text-2xl font-black text-purple-600 mt-1 block">{entidades.length}</span>
          <span className="text-[11px] text-purple-600 font-bold mt-1 block">ONGs, Igrejas e Hospitais</span>
        </div>

        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200/80 shadow-xs">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Cadastros Incompletos</span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">{cadastrosIncompletos}</span>
          <span className="text-[11px] text-amber-700 font-bold mt-1 block">Sem telefone ou bairro</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl flex-wrap">
            <button
              onClick={() => setActiveMainTab('pessoas')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeMainTab === 'pessoas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pessoas & Eleitores ({pessoas.length})
            </button>
            <button
              onClick={() => setActiveMainTab('liderancas')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeMainTab === 'liderancas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Lideranças ({totalLiderancas})
            </button>
            <button
              onClick={() => setActiveMainTab('entidades')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeMainTab === 'entidades'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Entidades ({entidades.length})
            </button>
          </div>

          <div className="relative min-w-[280px]">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome, bairro ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* List Grid */}
        {activeMainTab !== 'entidades' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPessoas.map((p) => (
              <div
                key={p.id}
                className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/80 hover:bg-white hover:border-emerald-400 transition-all hover:shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center">
                      {p.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{p.nome}</h3>
                      {p.apelido && <p className="text-xs text-slate-500">"{p.apelido}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        p.categoria === 'LIDERANCA'
                          ? 'bg-amber-100 text-amber-900'
                          : p.categoria === 'AUTORIDADE'
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {p.categoria}
                    </span>
                    <button
                      onClick={() => handleOpenEditPessoa(p)}
                      className="p-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 rounded-md transition-all ml-1"
                      title="Editar Pessoa"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta pessoa do cadastro?')) {
                          deletePessoa(p.id);
                        }
                      }}
                      className="p-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded-md transition-all"
                      title="Excluir Pessoa"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" />
                    <span>{p.bairro || 'Sem bairro'}, {p.cidade} - {p.uf}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-emerald-600" />
                    <span>{p.celular1 || 'Telefone não informado'}</span>
                  </div>
                  {p.data_nascimento && (
                    <div className="flex items-center gap-1.5 text-purple-600 font-bold pt-0.5">
                      🎂 Nascimento: {p.data_nascimento}
                    </div>
                  )}
                  {p.votos_estimados && p.votos_estimados > 0 && (
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold pt-1">
                      <Award size={12} />
                      <span>Votos Estimados: {p.votos_estimados}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entidades.map((ent) => (
              <div key={ent.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2.5 py-0.5 rounded-md">
                    {ent.tipo}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 font-medium mr-2">{ent.cnpj || 'Sem CNPJ'}</span>
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir esta entidade?')) {
                          deleteEntidade(ent.id);
                        }
                      }}
                      className="p-1 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded-md transition-all"
                      title="Excluir Entidade"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 className="font-black text-slate-900 text-base">{ent.razao_social}</h3>
                <p className="text-xs text-slate-600">Responsável: <strong>{ent.responsavel || 'Não informado'}</strong></p>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span>{ent.cidade} - {ent.uf}</span>
                  <span>{ent.telefone}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Cadastrar ou Editar Pessoa */}
      {isPessoaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 my-8 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Users2 className="text-emerald-600" /> {editingPessoaId ? 'Editar Cadastro de Pessoa' : 'Cadastrar Pessoa / Liderança'}
              </h2>
              <button
                onClick={() => setIsPessoaModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Form Abas */}
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setFormTab('pessoal')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  formTab === 'pessoal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Dados Pessoais
              </button>
              <button
                onClick={() => setFormTab('contato')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  formTab === 'contato' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Contatos
              </button>
              <button
                onClick={() => setFormTab('endereco')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  formTab === 'endereco' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Endereço
              </button>
              <button
                onClick={() => setFormTab('politico')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  formTab === 'politico' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Dados Políticos
              </button>
            </div>

            <form onSubmit={handleSubmitPessoa} className="space-y-4 text-xs font-bold text-slate-700">
              {formTab === 'pessoal' && (
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria das Graças Silva"
                      value={pessoaForm.nome}
                      onChange={(e) => setPessoaForm({ ...pessoaForm, nome: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Apelido / Nome Político</label>
                      <input
                        type="text"
                        placeholder="Ex: Dona Maria"
                        value={pessoaForm.apelido}
                        onChange={(e) => setPessoaForm({ ...pessoaForm, apelido: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Data de Nascimento (Ex: 1985-05-10 ou MM-DD)</label>
                      <input
                        type="text"
                        placeholder="AAAA-MM-DD"
                        value={pessoaForm.data_nascimento}
                        onChange={(e) => setPessoaForm({ ...pessoaForm, data_nascimento: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Categoria *</label>
                    <select
                      value={pessoaForm.categoria}
                      onChange={(e) => setPessoaForm({ ...pessoaForm, categoria: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="ELEITOR">Eleitor</option>
                      <option value="LIDERANCA">Liderança Comunitária</option>
                      <option value="AUTORIDADE">Autoridade / Prefeito / Ver.</option>
                      <option value="SERVIDOR">Servidor Público</option>
                    </select>
                  </div>
                </div>
              )}

              {formTab === 'contato' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Celular / WhatsApp *</label>
                      <input
                        type="text"
                        placeholder="(11) 99999-9999"
                        value={pessoaForm.celular1}
                        onChange={(e) => setPessoaForm({ ...pessoaForm, celular1: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">E-mail</label>
                      <input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={pessoaForm.email}
                        onChange={(e) => setPessoaForm({ ...pessoaForm, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formTab === 'endereco' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1">Bairro</label>
                      <input
                        type="text"
                        placeholder="Jardim Santa Luzia"
                        value={pessoaForm.bairro}
                        onChange={(e) => setPessoaForm({ ...pessoaForm, bairro: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Cidade / UF</label>
                      <input
                        type="text"
                        value={`${pessoaForm.cidade} - ${pessoaForm.uf}`}
                        onChange={(e) => setPessoaForm({ ...pessoaForm, cidade: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formTab === 'politico' && (
                <div className="space-y-3">
                  <div>
                    <label className="block mb-1">Votos Estimados / Potencial de Influência</label>
                    <input
                      type="number"
                      value={pessoaForm.votos_estimados}
                      onChange={(e) => setPessoaForm({ ...pessoaForm, votos_estimados: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPessoaModalOpen(false)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-emerald-600/20"
                >
                  {editingPessoaId ? 'Salvar Alterações' : 'Salvar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
