'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type FilterState = {
  anoFiscal: string;
  tipoVerba: string;
  categoria: string;
};

type FilterContextType = {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;
};

const defaultFilters: FilterState = {
  anoFiscal: 'Todos',
  tipoVerba: 'Todas',
  categoria: 'Todas',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
