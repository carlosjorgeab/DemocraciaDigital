'use client';
import { useDeputado } from '@/context/DeputadoContext';
import { StateMap } from '@/components/StateMap';
import { MapPin } from 'lucide-react';

export default function MapaPage() {
  const { selectedDeputado } = useDeputado();

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">
          Visão Mapa
        </p>
        <h2 className="text-2xl md:text-3xl font-black font-headline text-on-surface flex items-center gap-2">
          <MapPin size={28} />
          Valores Destinados por Município {selectedDeputado?.estado ? `(${selectedDeputado.estado})` : ''}
        </h2>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
        <div className="flex-1 relative">
          <StateMap />
        </div>
      </div>
    </div>
  );
}
