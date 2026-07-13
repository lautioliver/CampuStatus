'use client';

import { CloseIcon } from '@/components/Icons';

export default function NetworkErrorModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="network-error-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border-2 border-occupancy-full bg-card shadow-xl">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-border">
          <div>
            <p className="text-xs uppercase tracking-wide text-occupancy-full font-semibold mb-1">
              Acceso restringido
            </p>
            <h2 id="network-error-title" className="text-lg font-bold text-foreground">
              Voto no registrado
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm sm:text-base text-foreground leading-relaxed">
            Para participar debes estar conectado al Wi-Fi oficial de la universidad.
          </p>
          <p className="text-sm text-muted-foreground">
            Podés seguir consultando la ocupación, pero los reportes solo se aceptan desde la red del campus.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
