'use client';

import { useCallback, useEffect, useState } from 'react';

const COOLDOWN_MS = 0; // 30 minutos: 30 * 60 * 1000
const storageKey = (zoneId: string) => `campusstatus:lastVote:${zoneId}`;

function getRemaining(zoneId: string): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(storageKey(zoneId));
  if (!raw) return 0;
  const elapsed = Date.now() - Number(raw);
  return Math.max(0, COOLDOWN_MS - elapsed);
}

export function useCooldown(zoneId: string) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!zoneId) {
      setRemainingMs(0);
      return undefined;
    }

    setRemainingMs(getRemaining(zoneId));
    const interval = setInterval(() => {
      setRemainingMs(getRemaining(zoneId));
    }, 1000);
    return () => clearInterval(interval);
  }, [zoneId]);

  const startCooldown = useCallback(() => {
    if (!zoneId) return;
    localStorage.setItem(storageKey(zoneId), String(Date.now()));
    setRemainingMs(COOLDOWN_MS);
  }, [zoneId]);

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);

  return {
    isCoolingDown: remainingMs > 0,
    remainingMs,
    formatted: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    startCooldown,
  };
}
