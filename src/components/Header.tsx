'use client';

import { useEffect, useRef, useState } from 'react';
import CampusLogo from '@/components/CampusLogo';
import { useLiveTime } from '@/hooks/useLiveTime';
import { getInitialTheme, toggleTheme } from '@/utils/themeTransition';

type ConnectionStatus = 'online' | 'syncing' | 'error';

const CONNECTION_STATUS: Record<
  ConnectionStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  online: {
    label: 'En vivo',
    dotClass: 'bg-occupancy-free',
    textClass: 'text-muted-foreground',
  },
  syncing: {
    label: 'Sincronizando',
    dotClass: 'bg-accent',
    textClass: 'text-muted-foreground',
  },
  error: {
    label: 'Sin conexión',
    dotClass: 'bg-occupancy-full',
    textClass: 'text-occupancy-full',
  },
};

export default function Header({ connectionStatus = 'online' }: { connectionStatus?: ConnectionStatus }) {
  const liveTime = useLiveTime();
  const statusConfig = CONNECTION_STATUS[connectionStatus] ?? CONNECTION_STATUS.online;

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <CampusLogo className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground leading-tight truncate">
              CampuStatus
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              Universidad Catolica de Salta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className={`flex items-center gap-2 text-xs sm:text-sm ${statusConfig.textClass}`}
            title={statusConfig.label}
          >
            <span className="relative flex w-2 h-2 shrink-0">
              {connectionStatus === 'syncing' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full w-2 h-2 ${statusConfig.dotClass}`} />
            </span>
            <span className="whitespace-nowrap hidden min-[400px]:inline">
              {statusConfig.label} · {liveTime}
            </span>
            <span className="whitespace-nowrap min-[400px]:hidden">{liveTime}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dark, setDark] = useState(false);
  const [iconKey, setIconKey] = useState(0);

  useEffect(() => {
    setDark(getInitialTheme());
  }, []);

  const handleToggle = async () => {
    if (!buttonRef.current) return;
    const next = await toggleTheme(buttonRef.current);
    setDark(next);
    setIconKey((k) => k + 1);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => void handleToggle()}
      className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border bg-muted/60 text-foreground hover:bg-muted transition-colors"
      aria-pressed={dark}
      aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <span key={iconKey} className="theme-icon-animate flex items-center justify-center">
        {dark ? (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden="true">
            <path
              d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
