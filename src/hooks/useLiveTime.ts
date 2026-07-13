'use client';

import { useEffect, useState } from 'react';

export function useLiveTime() {
  const [time, setTime] = useState('');

  useEffect(() => {
    setTime(formatNow());
    const id = setInterval(() => setTime(formatNow()), 30_000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function formatNow() {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());
}
