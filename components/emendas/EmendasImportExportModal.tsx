'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';
import { Download, Upload, FileSpreadsheet, X, Check, AlertCircle, RefreshCw, FileText } from 'lucide-react';

interface EmendaImportRow {
  objeto: string;
  autor: string;
  data: string;
  area_tematica_nome: string;
  beneficiario: string;
  tipo: string;
  municipio: string;
  numero_emenda: string;
  valor: number;
  etapa: string;
  isValid: boolean;
  validationError?: string;
}

interface EmendasImportExportProps {
  selectedDeputado: any;
  onImportSuccess: () => void;
  orcamentos: any[];
}

export function exportEmendasToExcel(orcamentos: any[], deputadoNome: string = 'Deputado', format: 'xlsx' | 'csv' = 'xlsx') {
  // Columns in EXACT ORDER requested:
  // Objeto | Autor da Emenda | DATA | Area Tematica | Beneficiário | Tipo | Município da Emenda | Numero Emenda | Valor da Emenda (R$) | Etapa
  const mappedData = orcamentos.map(item => {
    // Format date to DD/MM/YYYY
    let formattedDate = '';
    if (item.data) {
      const parts = String(item.data).split('T')[0].split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        formattedDate = String(item.data);
      }
    }

    const areaNome = item.areas_tematicas?.nome || item.area_tematica_nome || '';

    return {
      'Objeto': item.objeto || '',
      'Autor da Emenda': item.autor || deputadoNome || '',
      'DATA': formattedDate,
      'Area Tematica': areaNome,
      'Beneficiário': item.beneficiario || '',
      'Tipo': item.tipo || 'Individuais (RP 6)',
      'Município da Emenda': item.municipio || '',
      'Numero Emenda': item.numero_emenda || '',
      'Valor da Emenda (R$)': Number(item.valor || 0),
      'Etapa': item.etapa || 'Liberado'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(mappedData, {
    header: [
      'Objeto',
      'Autor da Emenda',
      'DATA',
      'Area Tematica',
      'Beneficiário',
      'Tipo',
      'Município da Emenda',
      'Numero Emenda',
      'Valor da Emenda (R$)',
      'Etapa'
    ]
  });

  // Auto column widths
  const colWidths = [
    { wch: 35 }, // Objeto
    { wch: 25 }, // Autor da Emenda
    { wch: 14 }, // DATA
    { wch: 22 }, // Area Tematica
    { wch: 28 }, // Beneficiário
    { wch: 22 }, // Tipo
    { wch: 24 }, // Município da Emenda
    { wch: 18 }, // Numero Emenda
    { wch: 22 }, // Valor da Emenda (R$)
    { wch: 14 }, // Etapa
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Emendas');

  const cleanDeputadoName = deputadoNome.replace(/[^a-zA-Z0-9_]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];

  if (format === 'csv') {
    XLSX.writeFile(workbook, `Emendas_${cleanDeputadoName}_${dateStr}.csv`, { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, `Emendas_${cleanDeputadoName}_${dateStr}.xlsx`, { bookType: 'xlsx' });
  }
}

export function downloadEmendasTemplate() {
  const sampleRows = [
    {
      'Objeto': 'Reforma e Ampliação de Unidade Básica de Saúde',
      'Autor da Emenda': 'Dep. Carlos Silva',
      'DATA': '15/03/2026',
      'Area Tematica': 'Saúde & Bem-estar',
      'Beneficiário': 'Prefeitura Municipal',
      'Tipo': 'Individuais (RP 6)',
      'Município da Emenda': 'São Paulo - SP',
      'Numero Emenda': '20260001',
      'Valor da Emenda (R$)': 500000.00,
      'Etapa': 'Liberado'
    },
    {
      'Objeto': 'Aquisição de Equipamentos de Informática para Escolas',
      'Autor da Emenda': 'Dep. Carlos Silva',
      'DATA': '10/04/2026',
      'Area Tematica': 'Educação',
      'Beneficiário': 'Secretaria de Educação',
      'Tipo': 'De Bancada (RP 7)',
      'Município da Emenda': 'Campinas - SP',
      'Numero Emenda': '20260002',
      'Valor da Emenda (R$)': 250000.00,
      'Etapa': 'Liberado'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows, {
    header: [
      'Objeto',
      'Autor da Emenda',
      'DATA',
      'Area Tematica',
      'Beneficiário',
      'Tipo',
      'Município da Emenda',
      'Numero Emenda',
      'Valor da Emenda (R$)',
      'Etapa'
    ]
  });

  worksheet['!cols'] = [
    { wch: 35 },
    { wch: 25 },
    { wch: 14 },
    { wch: 22 },
    { wch: 28 },
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo Emendas');

  XLSX.writeFile(workbook, 'Modelo_Importacao_Emendas.xlsx');
}

export default function EmendasImportExportModal({
  selectedDeputado,
  onImportSuccess,
  orcamentos
}: EmendasImportExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<EmendaImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; count: number; message: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setImportResult(null);
    setLoading(false);
    setImporting(false);
  };

  const handleOpen = () => {
    resetState();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetState();
  };

  const parseValueToNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let str = String(val).trim();
    // Remove R$ or currency symbols
    str = str.replace(/R\$\s?/gi, '').replace(/\s/g, '');
    // Handle Brazilian currency format: 150.000,00 -> 150000.00
    if (str.includes(',') && str.includes('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else if (str.includes(',')) {
      str = str.replace(',', '.');
    }
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const parseDateToISO = (val: any): string => {
    if (!val) return new Date().toISOString().split('T')[0];
    
    // Excel date number
    if (typeof val === 'number') {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const yyyy = dateObj.y;
        const mm = String(dateObj.m).padStart(2, '0');
        const dd = String(dateObj.d).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      }
    }

    const str = String(val).trim();
    // Match DD/MM/YYYY
    const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const dd = brMatch[1].padStart(2, '0');
      const mm = brMatch[2].padStart(2, '0');
      const yyyy = brMatch[3];
      return `${yyyy}-${mm}-${dd}`;
    }

    // Match YYYY-MM-DD
    const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (isoMatch) {
      const yyyy = isoMatch[1];
      const mm = isoMatch[2].padStart(2, '0');
      const dd = isoMatch[3].padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    return new Date().toISOString().split('T')[0];
  };

  const normalizeKey = (key: string) => {
    return key
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  const processFile = async (selectedFile: File) => {
    setLoading(true);
    setFile(selectedFile);
    setImportResult(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawRows.length === 0) {
        setLoading(false);
        alert('A planilha está vazia.');
        return;
      }

      const rows: EmendaImportRow[] = rawRows.map((row, index) => {
        // Map keys flexibly
        let objeto = '';
        let autor = selectedDeputado?.nome || '';
        let dateVal: any = '';
        let areaTematicaNome = '';
        let beneficiario = '';
        let tipo = 'Individuais (RP 6)';
        let municipio = '';
        let numeroEmenda = '';
        let valorRaw: any = 0;
        let etapa = 'Liberado';

        Object.keys(row).forEach(originalKey => {
          const norm = normalizeKey(originalKey);
          const val = row[originalKey];

          if (norm.includes('objeto')) {
            objeto = String(val).trim();
          } else if (norm.includes('autor')) {
            autor = String(val).trim() || selectedDeputado?.nome || '';
          } else if (norm === 'data' || norm.includes('data') || norm.includes('dtemenda')) {
            dateVal = val;
          } else if (norm.includes('areatematica') || norm.includes('area') || norm.includes('categoria')) {
            areaTematicaNome = String(val).trim();
          } else if (norm.includes('beneficiario')) {
            beneficiario = String(val).trim();
          } else if (norm.includes('tipo')) {
            tipo = String(val).trim();
          } else if (norm.includes('municipio')) {
            municipio = String(val).trim();
          } else if (norm.includes('numeroemenda') || norm.includes('numero') || norm.includes('emenda')) {
            numeroEmenda = String(val).trim();
          } else if (norm.includes('valor')) {
            valorRaw = val;
          } else if (norm.includes('etapa') || norm.includes('status')) {
            etapa = String(val).trim();
          }
        });

        const valor = parseValueToNumber(valorRaw);
        const dateIso = parseDateToISO(dateVal);

        let isValid = true;
        let validationError = '';

        if (!objeto) {
          isValid = false;
          validationError = 'Objeto não informado';
        } else if (valor <= 0) {
          isValid = false;
          validationError = 'Valor deve ser maior que R$ 0';
        }

        return {
          objeto,
          autor: autor || selectedDeputado?.nome || 'Autor',
          data: dateIso,
          area_tematica_nome: areaTematicaNome,
          beneficiario,
          tipo: tipo || 'Individuais (RP 6)',
          municipio,
          numero_emenda: numeroEmenda,
          valor,
          etapa: etapa || 'Liberado',
          isValid,
          validationError
        };
      });

      setParsedRows(rows);
    } catch (err) {
      console.error('Error processing file:', err);
      alert('Erro ao ler o arquivo. Certifique-se de que é um arquivo Excel (.xlsx) ou CSV válido.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedDeputado) {
      alert('Selecione um deputado primeiro.');
      return;
    }

    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      alert('Nenhuma linha válida encontrada para importar.');
      return;
    }

    setImporting(true);

    try {
      // 1. Fetch existing areas_tematicas to resolve IDs or create new ones
      const { data: existingAreas } = await supabase.from('areas_tematicas').select('id, nome');
      const areaMap = new Map<string, string>();
      
      if (existingAreas) {
        existingAreas.forEach(a => {
          areaMap.set(normalizeKey(a.nome), a.id);
        });
      }

      // Collect new areas to create
      const missingAreaNames = new Set<string>();
      validRows.forEach(r => {
        if (r.area_tematica_nome) {
          const norm = normalizeKey(r.area_tematica_nome);
          if (!areaMap.has(norm)) {
            missingAreaNames.add(r.area_tematica_nome.trim());
          }
        }
      });

      // Create missing areas if any
      if (missingAreaNames.size > 0) {
        const newAreasToInsert = Array.from(missingAreaNames).map(nome => ({
          nome,
          cor: '#3b82f6'
        }));
        const { data: createdAreas } = await supabase.from('areas_tematicas').insert(newAreasToInsert).select('id, nome');
        if (createdAreas) {
          createdAreas.forEach(a => {
            areaMap.set(normalizeKey(a.nome), a.id);
          });
        }
      }

      // 2. Map payloads
      const payloads = validRows.map(r => {
        const normArea = normalizeKey(r.area_tematica_nome);
        const areaId = areaMap.get(normArea) || null;

        return {
          id_deputado: selectedDeputado.id,
          data: r.data,
          tipo: r.tipo,
          objeto: r.objeto,
          valor: r.valor,
          beneficiario: r.beneficiario || null,
          autor: r.autor,
          municipio: r.municipio || null,
          numero_emenda: r.numero_emenda || null,
          id_area_tematica: areaId,
          etapa: r.etapa
        };
      });

      // 3. Insert into Supabase
      const { error } = await supabase.from('orcamentos').insert(payloads);

      if (error) {
        console.error('Error inserting emendas:', error);
        setImportResult({
          success: false,
          count: 0,
          message: `Erro ao importar: ${error.message}`
        });
      } else {
        setImportResult({
          success: true,
          count: payloads.length,
          message: `${payloads.length} emenda(s) importada(s) com sucesso!`
        });
        onImportSuccess();
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setImportResult({
        success: false,
        count: 0,
        message: 'Ocorreu um erro inesperado durante a importação.'
      });
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;
  const totalValor = parsedRows.reduce((acc, r) => acc + (r.isValid ? r.valor : 0), 0);

  return (
    <>
      {/* Import / Export Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleOpen}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
        >
          <Upload size={18} />
          Importar Emendas
        </button>

        <div className="relative group">
          <button
            onClick={() => exportEmendasToExcel(orcamentos, selectedDeputado?.nome, 'xlsx')}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-slate-200"
          >
            <Download size={18} className="text-slate-600" />
            Exportar Emendas
          </button>
        </div>

        <button
          onClick={downloadEmendasTemplate}
          className="flex items-center gap-1.5 text-slate-500 hover:text-primary text-xs font-semibold px-2.5 py-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Baixar modelo em Excel com as colunas corretas"
        >
          <FileSpreadsheet size={16} className="text-emerald-600" />
          Baixar Planilha Modelo
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-on-surface">Importar Emendas via Excel / CSV</h3>
                  <p className="text-xs text-slate-500">
                    Selecione um arquivo de planilha com as 10 colunas padrão do módulo
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">

              {/* Success Result */}
              {importResult?.success && (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                    <Check size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-900">{importResult.message}</h4>
                  <p className="text-sm text-emerald-700">As emendas foram registradas no sistema com sucesso.</p>
                  <button
                    onClick={handleClose}
                    className="mt-2 bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors"
                  >
                    Concluir e Fechar
                  </button>
                </div>
              )}

              {/* Failure Result */}
              {importResult && !importResult.success && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
                  <AlertCircle size={20} className="shrink-0 text-red-600" />
                  <p className="text-sm font-medium">{importResult.message}</p>
                </div>
              )}

              {!importResult?.success && (
                <>
                  {/* File Upload Zone */}
                  {!file && (
                    <div
                      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                        dragActive ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shadow-sm">
                        <FileSpreadsheet size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">
                          Clique para selecionar ou arraste o arquivo aqui
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Suporta arquivos Excel (.xlsx, .xls) e CSV
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); downloadEmendasTemplate(); }}
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors"
                        >
                          <Download size={14} />
                          Baixar Modelo de Planilha (.xlsx)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Header Order Reference Banner */}
                  <div className="bg-slate-100/70 p-3.5 rounded-xl border border-slate-200/80">
                    <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                      Ordem de Colunas Esperada na Planilha:
                    </p>
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {[
                        'Objeto',
                        'Autor da Emenda',
                        'DATA',
                        'Area Tematica',
                        'Beneficiário',
                        'Tipo',
                        'Município da Emenda',
                        'Numero Emenda',
                        'Valor da Emenda (R$)',
                        'Etapa'
                      ].map((col, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded shadow-2xs">
                          <strong className="text-primary mr-1">{idx + 1}.</strong> {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* File Preview */}
                  {loading && (
                    <div className="p-8 text-center text-slate-500 space-y-2">
                      <RefreshCw className="animate-spin mx-auto text-emerald-600" size={28} />
                      <p className="text-sm font-bold">Lendo e validando planilha...</p>
                    </div>
                  )}

                  {file && parsedRows.length > 0 && !loading && (
                    <div className="space-y-4">
                      {/* Summary bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="flex items-center gap-4 text-xs font-semibold">
                          <span className="text-slate-600">
                            Arquivo: <strong className="text-slate-900">{file.name}</strong>
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                            {validCount} válida(s)
                          </span>
                          {invalidCount > 0 && (
                            <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                              {invalidCount} com erro(s)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">Valor Total Válido:</span>
                          <span className="text-base font-black text-emerald-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)}
                          </span>

                          <button
                            onClick={() => { setFile(null); setParsedRows([]); }}
                            className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors ml-2"
                          >
                            Trocar Arquivo
                          </button>
                        </div>
                      </div>

                      {/* Preview Table */}
                      <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-72">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 sticky top-0 border-b border-slate-200">
                            <tr>
                              <th className="p-2.5 font-bold text-slate-600">Status</th>
                              <th className="p-2.5 font-bold text-slate-600">1. Objeto</th>
                              <th className="p-2.5 font-bold text-slate-600">2. Autor</th>
                              <th className="p-2.5 font-bold text-slate-600">3. Data</th>
                              <th className="p-2.5 font-bold text-slate-600">4. Área Temática</th>
                              <th className="p-2.5 font-bold text-slate-600">5. Beneficiário</th>
                              <th className="p-2.5 font-bold text-slate-600">6. Tipo</th>
                              <th className="p-2.5 font-bold text-slate-600">7. Município</th>
                              <th className="p-2.5 font-bold text-slate-600">8. Nº Emenda</th>
                              <th className="p-2.5 font-bold text-slate-600">9. Valor (R$)</th>
                              <th className="p-2.5 font-bold text-slate-600">10. Etapa</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedRows.map((row, idx) => (
                              <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-amber-50/60'}>
                                <td className="p-2.5 whitespace-nowrap">
                                  {row.isValid ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                      <Check size={12} /> OK
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold" title={row.validationError}>
                                      <AlertCircle size={12} /> {row.validationError}
                                    </span>
                                  )}
                                </td>
                                <td className="p-2.5 font-bold text-slate-800 max-w-xs truncate">{row.objeto || '-'}</td>
                                <td className="p-2.5 text-slate-600 whitespace-nowrap">{row.autor}</td>
                                <td className="p-2.5 text-slate-600 whitespace-nowrap">
                                  {new Date(row.data).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="p-2.5 text-slate-600 whitespace-nowrap">{row.area_tematica_nome || '-'}</td>
                                <td className="p-2.5 text-slate-600 whitespace-nowrap">{row.beneficiario || '-'}</td>
                                <td className="p-2.5 text-slate-600 whitespace-nowrap">{row.tipo}</td>
                                <td className="p-2.5 text-slate-600 whitespace-nowrap">{row.municipio || '-'}</td>
                                <td className="p-2.5 text-slate-600 whitespace-nowrap font-mono">{row.numero_emenda || '-'}</td>
                                <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.valor)}
                                </td>
                                <td className="p-2.5 text-slate-600 whitespace-nowrap">{row.etapa}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!importResult?.success && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>

                {file && validCount > 0 && (
                  <button
                    onClick={handleConfirmImport}
                    disabled={importing}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Confirmar e Importar {validCount} Emenda(s)
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
