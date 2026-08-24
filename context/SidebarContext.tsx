'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('democracia_sidebar_collapsed');
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleSetCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    setIsCollapsed(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      try {
        localStorage.setItem('democracia_sidebar_collapsed', String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  };

  const toggleSidebar = () => {
    handleSetCollapsed(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed: handleSetCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleSidebar: () => {}
    };
  }
  return context;
}
