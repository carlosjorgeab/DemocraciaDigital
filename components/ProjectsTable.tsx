'use client';

import { Download } from 'lucide-react';
import { useDeputado } from '@/context/DeputadoContext';

export function ProjectsTable() {
  const { selectedDeputado } = useDeputado();
  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="p-8 flex justify-between items-center border-b border-surface-container-low">
        <div>
          <h4 className="text-xl font-headline font-bold text-on-surface">Meus Projetos</h4>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Acompanhamento das iniciativas do Deputado Carlos Silva</p>
        </div>
        <button className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
          Exportar Relatório Detalhado <Download size={16} />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Projeto / Iniciativa</th>
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Município Beneficiado</th>
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">UF</th>
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Orçamento Empenhado</th>
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider">Progresso da Obra</th>
              <th className="px-8 py-4 text-[10px] uppercase font-black text-on-surface-variant tracking-wider text-right">Status Atual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-5">
                <div>
                  <p className="font-bold text-sm text-on-surface">Complexo Hospitalar Sul</p>
                  <p className="text-xs text-on-surface-variant font-medium">Saúde & Bem-estar</p>
                </div>
              </td>
              <td className="px-8 py-5">
                <p className="text-sm text-on-surface">São Paulo - SP</p>
                <p className="text-[10px] text-on-surface-variant">Região Metropolitana</p>
              </td>
              <td className="px-8 py-5">
                <p className="text-sm text-on-surface font-bold">{selectedDeputado?.estado || '-'}</p>
              </td>
              <td className="px-8 py-5">
                <p className="font-bold text-sm text-on-surface">R$ 1.250.000</p>
                <p className="text-[10px] text-primary font-bold">Emenda Impositiva</p>
              </td>
              <td className="px-8 py-5">
                <div className="w-48">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-on-surface-variant">75%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-right">
                <span className="px-3 py-1 bg-tertiary text-on-tertiary font-bold text-[10px] rounded-full uppercase">Em Execução</span>
              </td>
            </tr>
            
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-5">
                <div>
                  <p className="font-bold text-sm text-on-surface">Reforma de Escola Estadual Central</p>
                  <p className="text-xs text-on-surface-variant font-medium">Educação</p>
                </div>
              </td>
              <td className="px-8 py-5">
                <p className="text-sm text-on-surface">Campinas - SP</p>
                <p className="text-[10px] text-on-surface-variant">Interior Paulista</p>
              </td>
              <td className="px-8 py-5">
                <p className="text-sm text-on-surface font-bold">{selectedDeputado?.estado || '-'}</p>
              </td>
              <td className="px-8 py-5">
                <p className="font-bold text-sm text-on-surface">R$ 890.000</p>
                <p className="text-[10px] text-primary font-bold">Emenda Parlamentar</p>
              </td>
              <td className="px-8 py-5">
                <div className="w-48">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-on-surface-variant">45%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-tertiary h-full rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-right">
                <span className="px-3 py-1 bg-tertiary text-on-tertiary font-bold text-[10px] rounded-full uppercase">Em Execução</span>
              </td>
            </tr>
            
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-5">
                <div>
                  <p className="font-bold text-sm text-on-surface">Saneamento Básico Rural - Lote 04</p>
                  <p className="text-xs text-on-surface-variant font-medium">Infraestrutura</p>
                </div>
              </td>
              <td className="px-8 py-5">
                <p className="text-sm text-on-surface">Ribeirão Preto - SP</p>
                <p className="text-[10px] text-on-surface-variant">Norte Paulista</p>
              </td>
              <td className="px-8 py-5">
                <p className="text-sm text-on-surface font-bold">{selectedDeputado?.estado || '-'}</p>
              </td>
              <td className="px-8 py-5">
                <p className="font-bold text-sm text-on-surface">R$ 2.100.000</p>
                <p className="text-[10px] text-primary font-bold">Proposta de Convênio</p>
              </td>
              <td className="px-8 py-5">
                <div className="w-48">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-bold text-on-surface-variant">15%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5 text-right">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 font-bold text-[10px] rounded-full uppercase">Em Licitação</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
