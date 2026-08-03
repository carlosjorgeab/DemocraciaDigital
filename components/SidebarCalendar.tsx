'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useGabinete } from '@/context/GabineteContext';

interface SidebarCalendarProps {
  isSidebarWhite?: boolean;
}

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function SidebarCalendar({ isSidebarWhite }: SidebarCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { agendas } = useGabinete();

  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Today string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Currently selected date from URL query if present
  const selectedDateFromUrl = searchParams ? searchParams.get('data') : null;

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonthDays = Array.from({ length: startingDayOfWeek }, (_, i) => {
    const day = daysInPrevMonth - startingDayOfWeek + i + 1;
    const prevMonthDate = new Date(year, month - 1, day);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    return { day, isCurrentMonth: false, dateStr };
  });

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return { day, isCurrentMonth: true, dateStr };
  });

  // Fill up to 35 or 42 grid cells
  const totalCellsSoFar = prevMonthDays.length + currentMonthDays.length;
  const remainingCells = (totalCellsSoFar <= 35 ? 35 : 42) - totalCellsSoFar;

  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => {
    const day = i + 1;
    const nextMonthDate = new Date(year, month + 1, day);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    return { day, isCurrentMonth: false, dateStr };
  });

  const allCalendarDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Group agendas by YYYY-MM-DD
  const agendasByDate: Record<string, { id: string; cor: string; titulo: string }[]> = {};
  agendas.forEach((a) => {
    if (!a.data_inicio) return;
    const dateKey = a.data_inicio.split('T')[0].split(' ')[0];
    if (!agendasByDate[dateKey]) {
      agendasByDate[dateKey] = [];
    }
    agendasByDate[dateKey].push({
      id: a.id,
      cor: a.cor_destaque || '#005baa',
      titulo: a.compromisso || 'Compromisso',
    });
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
    router.push('/gabinete/agenda?data=' + todayStr);
  };

  const handleDayClick = (dateStr: string) => {
    router.push(`/gabinete/agenda?data=${dateStr}`);
  };

  const cardBgClass = isSidebarWhite
    ? 'bg-slate-100/80 border-slate-200 text-slate-900 shadow-xs'
    : 'bg-white/10 backdrop-blur-md border-white/20 text-white shadow-md';

  const dayHeaderColorClass = isSidebarWhite ? 'text-slate-500 font-extrabold' : 'text-white/70 font-extrabold';

  return (
    <div className={`p-3 rounded-2xl border my-3 text-xs transition-all ${cardBgClass}`}>
      {/* Month & Year Header Controls */}
      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-current/10">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Mês Anterior"
        >
          <ChevronLeft size={15} />
        </button>

        <div className="flex items-center gap-1 font-black tracking-tight text-[11px]">
          <CalendarIcon size={12} className="opacity-80" />
          <span>{MESES[month]}</span>
          <span className="opacity-75">{year}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleTodayClick}
            className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-black/10 hover:bg-black/20 dark:bg-white/20 dark:hover:bg-white/30 transition-colors"
            title="Ir para Hoje"
          >
            Hoje
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Próximo Mês"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {DIAS_SEMANA.map((d, idx) => (
          <div key={idx} className={`text-[10px] py-0.5 ${dayHeaderColorClass}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {allCalendarDays.map((cell, idx) => {
          const isToday = cell.dateStr === todayStr;
          const isSelected = selectedDateFromUrl === cell.dateStr;
          const eventsOnDay = agendasByDate[cell.dateStr] || [];

          let btnClass = 'hover:bg-black/10 dark:hover:bg-white/15';
          if (!cell.isCurrentMonth) {
            btnClass = 'opacity-35 hover:opacity-60';
          }

          if (isSelected) {
            btnClass = isSidebarWhite
              ? 'bg-slate-900 text-white font-black shadow-xs scale-105'
              : 'bg-white text-slate-900 font-black shadow-xs scale-105';
          } else if (isToday) {
            btnClass += ' ring-1.5 ring-amber-400 font-black';
          }

          return (
            <button
              key={idx}
              onClick={() => handleDayClick(cell.dateStr)}
              className={`relative h-7 w-full rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${btnClass}`}
              title={
                eventsOnDay.length > 0
                  ? `${eventsOnDay.length} compromisso(s) em ${cell.dateStr}`
                  : cell.dateStr
              }
            >
              <span className={`text-[11px] leading-none ${isToday ? 'font-black' : 'font-bold'}`}>
                {cell.day}
              </span>

              {/* Event color dots */}
              {eventsOnDay.length > 0 && (
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  {eventsOnDay.slice(0, 3).map((ev, eIdx) => (
                    <span
                      key={eIdx}
                      className="w-1.5 h-1.5 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: ev.cor }}
                    />
                  ))}
                  {eventsOnDay.length > 3 && (
                    <span className="w-1 h-1 rounded-full bg-current opacity-70" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
