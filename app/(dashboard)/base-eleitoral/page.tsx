'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { useDeputado } from '@/context/DeputadoContext';
import { MapPin, Building2, Receipt, Users, Award, ShieldCheck } from 'lucide-react';

// Dynamically import Leaflet component with SSR disabled
const ParanaMap = dynamic(() => import('@/components/ParanaMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse flex flex-col items-center justify-center text-slate-400 gap-2">
      <MapPin size={32} className="animate-bounce" />
      <span className="text-xs font-bold uppercase tracking-wider">Carregando Mapa Interativo do Paraná...</span>
    </div>
  )
});

export default function BaseEleitoralPage() {
  const { selectedDeputado } = useDeputado();

  const [loading, setLoading] = useState(true);
  const [municipiosMapData, setMunicipiosMapData] = useState<any[]>([]);
  const [totalInvestimento, setTotalInvestimento] = useState(0);
  const [totalEmendasCount, setTotalEmendasCount] = useState(0);

  useEffect(() => {
    async function loadBaseEleitoral() {
      if (!selectedDeputado?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // Fetch all emendas with municipio details for this deputado
      const { data: emendasData } = await supabase
        .from('orcamentos')
        .select('*, municipio(id, nome, latitude, longitude, unidade_federacao(sigla))')
        .eq('id_deputado', selectedDeputado.id);

      if (emendasData) {
        const munGroup: Record<string, {
          id: string;
          nome: string;
          lat?: number;
          lng?: number;
          totalValor: number;
          emendasCount: number;
          emendas: any[];
        }> = {};

        let sumVal = 0;
        let sumCount = 0;

        emendasData.forEach((e: any) => {
          const munObj = Array.isArray(e.municipio) ? e.municipio[0] : e.municipio;
          if (munObj && munObj.nome) {
            const mKey = munObj.nome.trim();
            if (!munGroup[mKey]) {
              munGroup[mKey] = {
                id: munObj.id,
                nome: munObj.nome,
                lat: munObj.latitude ? Number(munObj.latitude) : undefined,
                lng: munObj.longitude ? Number(munObj.longitude) : undefined,
                totalValor: 0,
                emendasCount: 0,
                emendas: []
              };
            }

            const val = Number(e.valor) || 0;
            munGroup[mKey].totalValor += val;
            munGroup[mKey].emendasCount += 1;
            munGroup[mKey].emendas.push(e);

            sumVal += val;
            sumCount += 1;
          }
        });

        setMunicipiosMapData(Object.values(munGroup));
        setTotalInvestimento(sumVal);
        setTotalEmendasCount(sumCount);
      }

      setLoading(false);
    }

    loadBaseEleitoral();
  }, [selectedDeputado]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Mapeamento Territorial</p>
          <h2 className="text-3xl font-black font-headline text-slate-900 dark:text-white">Base Eleitoral - Paraná</h2>
          <p className="text-slate-500 text-sm">Visualização geoespacial das emendas e recursos alocados pelo parlamentar</p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Municípios Atendidos</p>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{municipiosMapData.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
              <Receipt size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Investimento Total</p>
              <p className="text-lg font-black text-emerald-600 leading-tight">{formatCurrency(totalInvestimento)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Leaflet Map Component */}
      {loading ? (
        <div className="w-full h-[600px] bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 gap-2">
          <MapPin size={32} className="animate-bounce text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Carregando dados cartográficos...</span>
        </div>
      ) : (
        <ParanaMap municipios={municipiosMapData} />
      )}
    </div>
  );
}
