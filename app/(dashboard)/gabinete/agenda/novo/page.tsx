'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGabinete } from '@/context/GabineteContext';
import { useDeputado } from '@/context/DeputadoContext';
import { getContrastTextColor } from '@/lib/colorUtils';
import { generateGoogleMapsUrl, generateWazeUrl } from '@/lib/geocoding';
import dynamic from 'next/dynamic';
import { GeocodingResult } from '@/lib/geocoding';
import {
  Calendar, ArrowLeft, Save, MapPin, Clock, Shield, RefreshCw, Send,
  AlertCircle, X, User, Search, CheckCircle2
} from 'lucide-react';
import WeatherDisplay from '@/components/WeatherDisplay';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), { ssr: false });

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDateTimeString = (hoursToAdd = 0) => {
  const d = new Date();
  d.setHours(d.getHours() + hoursToAdd);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = '00';
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

type TipoRecorrencia = 'NENHUMA' | 'DIARIA' | 'SEMANAL' | 'QUINZENAL' | 'MENSAL' | 'BIMESTRAL' | 'SEMESTRAL' | 'ANUAL';

interface Props {
  params: { id?: string };
}

export default function AgendaFormPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams?.get('id') || params?.id;
  const { agendas, pessoas, addAgenda, updateAgenda } = useGabinete();
  const { selectedDeputado } = useDeputado();
  const partyPrimary = selectedDeputado?.partidos?.cor_primaria || '#005baa';
  const partyPrimaryText = getContrastTextColor(partyPrimary);

  const [formData, setFormData] = useState({
    compromisso: '',
    pauta_descritivo: '',
    local: '',
    link_maps: '',
    data_inicio: getTodayDateTimeString(0),
    data_fim: getTodayDateTimeString(1),
    visibilidade: 'PUBLICO' as 'PUBLICO' | 'RESERVADO' | 'PESSOAL',
    status: 'CONFIRMADO' as 'CONFIRMADO' | 'PENDENTE' | 'CANCELADO' | 'REALIZADO',
    cor_destaque: '#005baa',
    assessor_responsavel: '',
    solicitado_por: '',
    alerta_sms: false,
    recorrencia: 'NENHUMA' as TipoRecorrencia,
    data_limite_recorrencia: getTodayDateString(),
  });

  const [geoLocation, setGeoLocation] = useState<GeocodingResult | null>(null);
  const [assessorSearch, setAssessorSearch] = useState('');
  const [showAssessorDropdown, setShowAssessorDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const assessores = pessoas.filter(p => p.categoria === 'ASSESSOR');

  const filteredAssessores = assessores.filter(p =>
    p.nome.toLowerCase().includes(assessorSearch.toLowerCase()) ||
    (p.apelido && p.apelido.toLowerCase().includes(assessorSearch.toLowerCase()))
  );

  useEffect(() => {
    if (editingId) {
      const agenda = agendas.find(a => a.id === editingId);
      if (agenda) {
        setFormData({
          compromisso: agenda.compromisso,
          pauta_descritivo: agenda.pauta_descritivo || '',
          local: agenda.local || '',
          link_maps: agenda.link_maps || '',
          data_inicio: agenda.data_inicio.includes('T') ? agenda.data_inicio.substring(0, 16) : `${agenda.data_inicio}T09:00`,
          data_fim: agenda.data_fim.includes('T') ? agenda.data_fim.substring(0, 16) : `${agenda.data_fim}T10:00`,
          visibilidade: agenda.visibilidade,
          status: agenda.status,
          cor_destaque: agenda.cor_destaque || '#005baa',
          assessor_responsavel: agenda.assessor_responsavel || '',
          solicitado_por: agenda.solicitado_por || '',
          alerta_sms: agenda.alerta_sms || false,
          recorrencia: 'NENHUMA',
          data_limite_recorrencia: getTodayDateString(),
        });
        if (agenda.latitude && agenda.longitude) {
          setGeoLocation({
            latitude: agenda.latitude,
            longitude: agenda.longitude,
            displayName: agenda.local || '',
            city: agenda.cidade,
            state: agenda.uf,
          });
        }
      }
    }
  }, [editingId, agendas]);

  const handleSubmit = async (e: React.FormEvent) => {


    e.preventDefault();

    setIsSubmitting(true);

    const startDt = new Date(formData.data_inicio);
    const endDt = new Date(formData.data_fim);
    const durationMs = endDt.getTime() - startDt.getTime();

    const baseAgendaData = {
      compromisso: formData.compromisso,
      pauta_descritivo: formData.pauta_descritivo,
      local: formData.local,
      link_maps: formData.link_maps || (formData.local ? generateGoogleMapsUrl(formData.local) : ''),
      data_inicio: startDt.toISOString(),
      data_fim: endDt.toISOString(),
      visibilidade: formData.visibilidade,
      status: formData.status,
      cor_destaque: formData.cor_destaque,
      assessor_responsavel: formData.assessor_responsavel,
      solicitado_por: formData.solicitado_por,
      alerta_sms: formData.alerta_sms,
      latitude: geoLocation?.latitude,
      longitude: geoLocation?.longitude,
      cidade: geoLocation?.city,
      uf: (geoLocation?.state || '').substring(0, 2).toUpperCase(),
    };

    console.log('handleSubmit: dados do formulário:', baseAgendaData);

    try {
      if (editingId) {
        console.log('handleSubmit: editando existente', editingId);
        updateAgenda(editingId, baseAgendaData);
      } else {
        if (formData.recorrencia === 'NENHUMA') {
          console.log('handleSubmit: criando nova agenda');
          addAgenda(baseAgendaData);
        } else {
          console.log('handleSubmit: criando recorrência');
          const limitDt = new Date(`${formData.data_limite_recorrencia}T23:59:59`);
          let currentStart = new Date(startDt);
          let count = 0;
          const maxLimit = 100;

          while (currentStart <= limitDt && count < maxLimit) {
            const currentEnd = new Date(currentStart.getTime() + durationMs);
            addAgenda({
              ...baseAgendaData,
              compromisso: `${formData.compromisso}${count > 0 ? ` (${count + 1}ª sessão)` : ''}`,
              data_inicio: currentStart.toISOString(),
              data_fim: currentEnd.toISOString(),
            });
            count++;
            switch (formData.recorrencia) {
              case 'DIARIA': currentStart.setDate(currentStart.getDate() + 1); break;
              case 'SEMANAL': currentStart.setDate(currentStart.getDate() + 7); break;
              case 'QUINZENAL': currentStart.setDate(currentStart.getDate() + 14); break;
              case 'MENSAL': currentStart.setMonth(currentStart.getMonth() + 1); break;
              case 'BIMESTRAL': currentStart.setMonth(currentStart.getMonth() + 2); break;
              case 'SEMESTRAL': currentStart.setMonth(currentStart.getMonth() + 6); break;
              case 'ANUAL': currentStart.setFullYear(currentStart.getFullYear() + 1); break;
              default: currentStart.setDate(currentStart.getDate() + 1);
            }
          }
        }
      }
      setSubmitSuccess(true);
      setTimeout(() => router.push('/gabinete/agenda'), 1500);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div
            className="p-6 md:p-8 border-b border-slate-100"
            style={{ background: `linear-gradient(135deg, ${partyPrimary}15, ${partyPrimary}05)` }}
          >
            <button
              onClick={() => router.push('/gabinete/agenda')}
              className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
            >
              <ArrowLeft size={18} /> Voltar para Agenda
            </button>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: partyPrimary, color: partyPrimaryText }}
              >
                <Calendar size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  {editingId ? 'Editar Compromisso' : 'Novo Compromisso'}
                </h1>
                <p className="text-sm text-slate-600">
                  {editingId ? 'Atualize os dados do compromisso' : 'Cadastre um novo compromisso na agenda'}
                </p>
              </div>
            </div>
          </div>

          {submitSuccess && (
            <div className="mx-6 md:mx-8 mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="text-emerald-600" size={24} />
              <div>
                <p className="font-bold text-emerald-800">Compromisso salvo com sucesso!</p>
                <p className="text-sm text-emerald-700">Redirecionando para a agenda...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Compromisso / Título *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Reunião com Secretário da Saúde"
                value={formData.compromisso}
                onChange={(e) => setFormData({ ...formData, compromisso: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                style={{ '--tw-ring-color': partyPrimary } as React.CSSProperties}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Data e Hora Início *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': partyPrimary } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Data e Hora Término *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': partyPrimary } as React.CSSProperties}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Pauta / Descritivo do Compromisso
              </label>
              <textarea
                rows={4}
                placeholder="Detalhes dos assuntos a tratar..."
                value={formData.pauta_descritivo}
                onChange={(e) => setFormData({ ...formData, pauta_descritivo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:outline-none resize-none"
                style={{ '--tw-ring-color': partyPrimary } as React.CSSProperties}
              />
            </div>

            <LocationPicker
              value={formData.local}
              onChange={(value) => setFormData({ ...formData, local: value })}
              onLocationChange={(location) => setGeoLocation(location)}
              placeholder="Digite o endereço do local do compromisso..."
            />

            {geoLocation && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <MapPin size={18} className="text-rose-500" /> Localização
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={generateGoogleMapsUrl(formData.local)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                  >
                    Google Maps <ExternalLink size={14} />
                  </a>
                  <a
                    href={generateWazeUrl(formData.local)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                  >
                    Waze <ExternalLink size={14} />
                  </a>
                </div>
                <WeatherDisplay
                  latitude={geoLocation.latitude}
                  longitude={geoLocation.longitude}
                  city={geoLocation.city || undefined}
                  compact={false}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Assessor Responsável
                </label>
                <div className="relative">
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                    <input
                      type="text"
                      placeholder="Pesquisar assessor..."
                      value={formData.assessor_responsavel || assessorSearch}
                      onChange={(e) => {
                        setAssessorSearch(e.target.value);
                        if (!formData.assessor_responsavel) {
                          setFormData({ ...formData, assessor_responsavel: e.target.value });
                        }
                      }}
                      onFocus={() => setShowAssessorDropdown(true)}
                      onBlur={() => setTimeout(() => setShowAssessorDropdown(false), 200)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:outline-none"
                      style={{ '--tw-ring-color': partyPrimary } as React.CSSProperties}
                    />
                  </div>
                  {showAssessorDropdown && filteredAssessores.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 z-50 max-h-60 overflow-y-auto">
                      {filteredAssessores.map(pessoa => (
                        <button
                          key={pessoa.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, assessor_responsavel: pessoa.nome });
                            setAssessorSearch(pessoa.nome);
                            setShowAssessorDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-slate-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-semibold text-slate-900">{pessoa.nome}</div>
                          {pessoa.apelido && (
                            <div className="text-xs text-slate-500">{pessoa.apelido}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {filteredAssessores.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Nenhum assessor cadastrado. Cadastre em Pessoas/Lideranças.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Solicitado Por
                </label>
                <input
                  type="text"
                  placeholder="Nome de quem solicitou..."
                  value={formData.solicitado_por}
                  onChange={(e) => setFormData({ ...formData, solicitado_por: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': partyPrimary } as React.CSSProperties}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Visibilidade
                </label>
                <select
                  value={formData.visibilidade}
                  onChange={(e) => setFormData({ ...formData, visibilidade: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': partyPrimary } as React.CSSProperties}
                >
                  <option value="PUBLICO">Público</option>
                  <option value="RESERVADO">Reservado (Interno)</option>
                  <option value="PESSOAL">Pessoal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 focus:ring-2 focus:outline-none"
                  style={{ '--tw-ring-color': partyPrimary } as React.CSSProperties}
                >
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="REALIZADO">Realizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Cor do Destaque
                </label>
                <input
                  type="color"
                  value={formData.cor_destaque}
                  onChange={(e) => setFormData({ ...formData, cor_destaque: e.target.value })}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl p-1 cursor-pointer"
                />
              </div>
            </div>

            {!editingId && (
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <RefreshCw size={16} /> Recorrência de Compromissos
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Periodicidade
                    </label>
                    <select
                      value={formData.recorrencia}
                      onChange={(e) => setFormData({ ...formData, recorrencia: e.target.value as TipoRecorrencia })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900"
                    >
                      <option value="NENHUMA">Sem Recorrência (Evento Único)</option>
                      <option value="DIARIA">Diária</option>
                      <option value="SEMANAL">Semanal</option>
                      <option value="QUINZENAL">Quinzenal</option>
                      <option value="MENSAL">Mensal</option>
                      <option value="BIMESTRAL">Bimestral</option>
                      <option value="SEMESTRAL">Semestral</option>
                      <option value="ANUAL">Anual</option>
                    </select>
                  </div>

                  {formData.recorrencia !== 'NENHUMA' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Repetir Até a Data Final
                      </label>
                      <input
                        type="date"
                        value={formData.data_limite_recorrencia}
                        onChange={(e) => setFormData({ ...formData, data_limite_recorrencia: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="alerta_sms"
                checked={formData.alerta_sms}
                onChange={(e) => setFormData({ ...formData, alerta_sms: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded-md focus:ring-blue-500"
              />
              <label htmlFor="alerta_sms" className="text-sm font-bold text-slate-800 cursor-pointer">
                Notificar assessores via Alerta/SMS antes do evento
              </label>
            </div>

            <div className="pt-6 flex items-center justify-end gap-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.push('/gabinete/agenda')}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl font-black uppercase text-sm tracking-wider shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: partyPrimary, color: partyPrimaryText }}
              >
                {isSubmitting ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save size={18} />
                    {editingId ? 'Salvar Alterações' : 'Salvar Compromisso'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ExternalLink({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
