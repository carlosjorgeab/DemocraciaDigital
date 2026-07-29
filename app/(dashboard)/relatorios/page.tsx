'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useDeputado } from '@/context/DeputadoContext';
import { FileText, Download, Filter, Search, Receipt, Building2, Calendar, MapPin, CheckCircle, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RelatoriosPage() {
  const { selectedDeputado } = useDeputado();

  const [loading, setLoading] = useState(true);
  const [emendas, setEmendas] = useState<any[]>([]);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);

  // Filters
  const [selectedTipo, setSelectedTipo] = useState<'todos' | 'emendas_liberadas' | 'emendas_rascunho' | 'projetos'>('todos');
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  const [selectedArea, setSelectedArea] = useState<string>('todas');
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!selectedDeputado?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // 1. Fetch Areas
      const { data: areasData } = await supabase.from('areas_tematicas').select('id, nome');
      setAreas(areasData || []);

      // 2. Fetch Orcamentos
      const { data: emendasData } = await supabase
        .from('orcamentos')
        .select('*, areas_tematicas(nome), municipio(nome, unidade_federacao(sigla))')
        .eq('id_deputado', selectedDeputado.id);

      // 3. Fetch Projetos
      const { data: projectsData } = await supabase
        .from('projetos')
        .select('*, projeto_areas(areas_tematicas(nome))')
        .eq('id_deputado', selectedDeputado.id);

      const loadedEmendas = emendasData || [];
      const loadedProjetos = (projectsData || []).map((p: any) => {
        const areaNames: string[] = [];
        if (p.projeto_areas) {
          p.projeto_areas.forEach((pa: any) => {
            const area = Array.isArray(pa.areas_tematicas) ? pa.areas_tematicas[0] : pa.areas_tematicas;
            if (area?.nome) areaNames.push(area.nome);
          });
        }
        return {
          ...p,
          area_nome: areaNames.join(', ') || 'Geral'
        };
      });

      setEmendas(loadedEmendas);
      setProjetos(loadedProjetos);

      // Unique municipios
      const munSet = new Set<string>();
      loadedEmendas.forEach(e => {
        const munObj = Array.isArray(e.municipio) ? e.municipio[0] : e.municipio;
        if (munObj?.nome) munSet.add(munObj.nome);
      });
      setMunicipios(Array.from(munSet).sort());

      setLoading(false);
    }

    loadData();
  }, [selectedDeputado]);

  // Filter logic
  const filteredEmendas = emendas.filter(e => {
    // Tipo filter
    if (selectedTipo === 'projetos') return false;
    if (selectedTipo === 'emendas_liberadas' && e.etapa !== 'Liberado') return false;
    if (selectedTipo === 'emendas_rascunho' && e.etapa === 'Liberado') return false;

    // Year
    const year = e.data ? new Date(e.data).getFullYear().toString() : '';
    if (selectedYear !== 'todos' && year !== selectedYear) return false;

    // Area
    const areaName = e.areas_tematicas?.nome || '';
    if (selectedArea !== 'todas' && areaName !== selectedArea) return false;

    // Municipio
    const munObj = Array.isArray(e.municipio) ? e.municipio[0] : e.municipio;
    const munName = munObj?.nome || '';
    if (selectedMunicipio !== 'todos' && munName !== selectedMunicipio) return false;

    // Search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchObj = e.objeto && e.objeto.toLowerCase().includes(term);
      const matchBen = e.beneficiario && e.beneficiario.toLowerCase().includes(term);
      const matchMun = munName.toLowerCase().includes(term);
      const matchNum = e.numero_emenda && e.numero_emenda.toLowerCase().includes(term);
      if (!matchObj && !matchBen && !matchMun && !matchNum) return false;
    }

    return true;
  });

  const filteredProjetos = projetos.filter(p => {
    // Tipo filter
    if (selectedTipo === 'emendas_liberadas' || selectedTipo === 'emendas_rascunho') return false;

    // Area
    if (selectedArea !== 'todas' && !p.area_nome.includes(selectedArea)) return false;

    // Search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      const matchDesc = p.descricao && p.descricao.toLowerCase().includes(term);
      const matchEmenta = p.ementa && p.ementa.toLowerCase().includes(term);
      const matchAutor = p.autor && p.autor.toLowerCase().includes(term);
      if (!matchDesc && !matchEmenta && !matchAutor) return false;
    }

    return true;
  });

  // Calculate KPIs
  const totalValorLiberado = filteredEmendas
    .filter(e => e.etapa === 'Liberado')
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const totalValorRascunho = filteredEmendas
    .filter(e => e.etapa !== 'Liberado')
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const totalEmendasCount = filteredEmendas.length;
  const totalProjetosCount = filteredProjetos.length;

  const munsReachedSet = new Set<string>();
  filteredEmendas.forEach(e => {
    const munObj = Array.isArray(e.municipio) ? e.municipio[0] : e.municipio;
    if (munObj?.nome) munsReachedSet.add(munObj.nome);
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const generatePDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const deputadoName = selectedDeputado?.nome || 'Gabinete Digital';
    const partidoEstado = selectedDeputado ? `${selectedDeputado.partidos?.sigla || ''} - ${selectedDeputado.estado || ''}` : '';
    const nowStr = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Colors
    const primaryColor = [0, 91, 170]; // #005baa
    const darkSlate = [15, 23, 42]; // #0f172a

    // 1. Header Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DEMOCRACIA DIGITAL - RELATÓRIO PARLAMENTAR', 14, 13);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Deputado: ${deputadoName} (${partidoEstado})`, 14, 21);
    doc.text(`Gerado em: ${nowStr}`, 135, 21);

    let currentY = 36;

    // 2. Executive Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, currentY, 182, 32, 3, 3, 'FD');

    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('SUMÁRIO EXECUTIVO', 18, currentY + 8);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`• Total Liberado em Emendas: ${formatCurrency(totalValorLiberado)}`, 18, currentY + 16);
    doc.text(`• Emendas em Análise/Rascunho: ${formatCurrency(totalValorRascunho)}`, 18, currentY + 22);
    doc.text(`• Quantidade de Emendas: ${totalEmendasCount}`, 110, currentY + 16);
    doc.text(`• Quantidade de Projetos: ${totalProjetosCount}`, 110, currentY + 22);
    doc.text(`• Municípios Beneficiados: ${munsReachedSet.size}`, 110, currentY + 28);

    currentY += 40;

    // 3. Emendas Table
    if (filteredEmendas.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('1. DETALHAMENTO DE EMENDAS ORÇAMENTÁRIAS', 14, currentY);
      currentY += 4;

      const emendasTableData = filteredEmendas.map(e => {
        const munObj = Array.isArray(e.municipio) ? e.municipio[0] : e.municipio;
        const munName = munObj?.nome ? `${munObj.nome}${munObj.unidade_federacao?.sigla ? ` - ${munObj.unidade_federacao.sigla}` : ''}` : 'Estadual';
        const dateFormatted = e.data ? new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR') : '-';
        return [
          e.numero_emenda || '-',
          dateFormatted,
          e.objeto || e.beneficiario || 'Sem descrição',
          munName,
          e.tipo || 'Individual',
          formatCurrency(Number(e.valor) || 0),
          e.etapa || 'Liberado'
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Nº Emenda', 'Data', 'Objeto / Beneficiário', 'Município', 'Tipo', 'Valor (R$)', 'Status']],
        body: emendasTableData,
        headStyles: {
          fillColor: primaryColor as [number, number, number],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 20 },
          2: { cellWidth: 55 },
          3: { cellWidth: 32 },
          4: { cellWidth: 20 },
          5: { cellWidth: 23, halign: 'right' },
          6: { cellWidth: 18 }
        },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // 4. Projetos Table
    if (filteredProjetos.length > 0) {
      // Check page overflow
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('2. DETALHAMENTO DE PROJETOS E INICIATIVAS', 14, currentY);
      currentY += 4;

      const projetosTableData = filteredProjetos.map(p => {
        return [
          p.descricao || '-',
          p.ementa || '-',
          p.autor || deputadoName,
          p.tipo || 'Projeto de Lei',
          p.tramitacao || 'Em elaboração'
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Projeto / Iniciativa', 'Ementa / Síntese', 'Autor', 'Tipo', 'Tramitação']],
        body: projetosTableData,
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8
        },
        bodyStyles: {
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 65 },
          2: { cellWidth: 30 },
          3: { cellWidth: 22 },
          4: { cellWidth: 28 }
        },
        margin: { left: 14, right: 14 }
      });
    }

    // Footer on each page
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Democracia Digital - Sistema de Gestão Gabinete | Página ${i} de ${pageCount}`, 14, 287);
    }

    const cleanName = deputadoName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Relatorio_${cleanName}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Prestação de Contas</p>
          <h2 className="text-3xl font-black font-headline text-slate-900 dark:text-white">Relatórios & Exportação PDF</h2>
          <p className="text-slate-500 text-sm">Gere relatórios executivos customizados de emendas e projetos</p>
        </div>

        <button
          onClick={generatePDF}
          disabled={loading || (!filteredEmendas.length && !filteredProjetos.length)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 text-xs uppercase tracking-widest w-full md:w-auto"
        >
          <Download size={18} />
          Exportar Relatório PDF
        </button>
      </div>

      {/* Filter Panel */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-700">
          <Filter size={18} className="text-primary" />
          <h3 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider">Filtros do Relatório</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Tipo de Registro</label>
            <select
              value={selectedTipo}
              onChange={(e: any) => setSelectedTipo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-primary"
            >
              <option value="todos">Todos (Emendas e Projetos)</option>
              <option value="emendas_liberadas">Apenas Emendas Liberadas</option>
              <option value="emendas_rascunho">Apenas Emendas em Análise / Rascunho</option>
              <option value="projetos">Apenas Projetos de Lei</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Ano Fiscal</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-primary"
            >
              <option value="todos">Todos os Anos</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Área Temática</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-primary"
            >
              <option value="todas">Todas as Áreas</option>
              {areas.map(a => (
                <option key={a.id} value={a.nome}>{a.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1.5">Município</label>
            <select
              value={selectedMunicipio}
              onChange={(e) => setSelectedMunicipio(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-primary"
            >
              <option value="todos">Todos os Municípios</option>
              {municipios.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por palavra-chave (objeto, beneficiário, ementa...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
            <Receipt size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Valor Liberado</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">{formatCurrency(totalValorLiberado)}</h4>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{filteredEmendas.filter(e => e.etapa === 'Liberado').length} emendas liberadas</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <RefreshCw size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Valor em Análise</p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">{formatCurrency(totalValorRascunho)}</h4>
            <p className="text-[10px] text-amber-600 font-bold mt-0.5">{filteredEmendas.filter(e => e.etapa !== 'Liberado').length} em rascunho</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total de Projetos</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">{totalProjetosCount}</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Iniciativas mapeadas</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Municípios Atendidos</p>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mt-0.5">{munsReachedSet.size}</h4>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Cidades contempladas</p>
          </div>
        </div>
      </div>

      {/* Data Preview Tables */}
      <div className="space-y-6">
        {/* Emendas Table */}
        {selectedTipo !== 'projetos' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">Emendas Selecionadas</h3>
                <p className="text-xs text-slate-400">{filteredEmendas.length} registro(s) listados</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-black text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-3">Nº Emenda</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Objeto / Beneficiário</th>
                    <th className="px-6 py-3">Município</th>
                    <th className="px-6 py-3">Área</th>
                    <th className="px-6 py-3">Valor</th>
                    <th className="px-6 py-3">Etapa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Carregando dados...</td></tr>
                  ) : filteredEmendas.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Nenhuma emenda corresponde aos filtros aplicados.</td></tr>
                  ) : (
                    filteredEmendas.slice(0, 50).map((e: any) => {
                      const munObj = Array.isArray(e.municipio) ? e.municipio[0] : e.municipio;
                      const munName = munObj?.nome ? `${munObj.nome}${munObj.unidade_federacao?.sigla ? ` - ${munObj.unidade_federacao.sigla}` : ''}` : 'Estadual';
                      return (
                        <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                          <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{e.numero_emenda || '-'}</td>
                          <td className="px-6 py-3.5 whitespace-nowrap">{e.data ? new Date(e.data + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                          <td className="px-6 py-3.5 max-w-xs truncate" title={e.objeto || e.beneficiario}>{e.objeto || e.beneficiario || '-'}</td>
                          <td className="px-6 py-3.5">{munName}</td>
                          <td className="px-6 py-3.5">{e.areas_tematicas?.nome || '-'}</td>
                          <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">{formatCurrency(Number(e.valor) || 0)}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${e.etapa === 'Liberado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {e.etapa || 'Liberado'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Projetos Table */}
        {(selectedTipo === 'todos' || selectedTipo === 'projetos') && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight">Projetos de Lei & Iniciativas</h3>
                <p className="text-xs text-slate-400">{filteredProjetos.length} registro(s) listados</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-black text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-700">
                    <th className="px-6 py-3">Iniciativa / Título</th>
                    <th className="px-6 py-3">Ementa</th>
                    <th className="px-6 py-3">Área Temática</th>
                    <th className="px-6 py-3">Autor</th>
                    <th className="px-6 py-3">Tramitação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Carregando dados...</td></tr>
                  ) : filteredProjetos.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Nenhum projeto corresponde aos filtros aplicados.</td></tr>
                  ) : (
                    filteredProjetos.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                        <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{p.descricao || '-'}</td>
                        <td className="px-6 py-3.5 max-w-sm truncate" title={p.ementa}>{p.ementa || '-'}</td>
                        <td className="px-6 py-3.5">{p.area_nome || '-'}</td>
                        <td className="px-6 py-3.5">{p.autor || '-'}</td>
                        <td className="px-6 py-3.5">
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">
                            {p.tramitacao || 'Em elaboração'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
