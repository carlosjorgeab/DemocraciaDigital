'use client';
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export function InactivityHandler() {
  const { user, logout } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (!user) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const timeoutMinutes = parseInt(localStorage.getItem('session_timeout') || '30', 10);
    const timeoutMs = timeoutMinutes * 60 * 1000;

    timerRef.current = setTimeout(() => {
      console.log('Inactivity timeout reached. Logging out...');
      logout();
    }, timeoutMs);
  }, [user, logout]);

  useEffect(() => {
    if (!user) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'mousemove', 'scroll'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);

  return null;
}
