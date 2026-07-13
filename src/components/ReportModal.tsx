'use client';

import { reportLevels } from '@/data/zoneMetadata';
import type { MappedZone } from '@/utils/mapZone';
import { CloseIcon } from '@/components/Icons';

export default function ReportModal({
  zone,
  selectedLevel,
  onSelectLevel,
  onSubmit,
  onClose,
  isCoolingDown,
  cooldownFormatted,
  canSubmit,
  isSubmitting = false,
}: {
  zone: MappedZone;
  selectedLevel: string | null;
  onSelectLevel: (levelId: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isCoolingDown: boolean;
  cooldownFormatted: string;
  canSubmit: boolean;
  isSubmitting?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-5 py-4">
          <div className="min-w-0">
            <h2 id="report-modal-title" className="font-bold text-foreground truncate">
              Reportar en {zone.name}
            </h2>
            <p className="text-sm text-muted-foreground truncate">{zone.location}</p>
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

        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Cómo ves la ocupación ahora? Tu reporte ayuda a otros estudiantes.
          </p>

          <div role="radiogroup" aria-label="Nivel de ocupación" className="flex flex-col gap-2">
            {reportLevels.map((level) => {
              const checked = selectedLevel === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  disabled={isCoolingDown}
                  onClick={() => onSelectLevel(level.id)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl border transition-colors min-h-[3rem] ${
                    checked
                      ? `${level.activeBg} border-2`
                      : 'border-border hover:bg-muted/60'
                  } ${isCoolingDown ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      checked ? 'border-foreground' : 'border-border'
                    }`}
                  >
                    {checked && <span className={`w-2 h-2 rounded-full ${level.dot}`} />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{level.label}</span>
                    <span className="block text-xs text-muted-foreground">{level.description}</span>
                  </span>
                  <span className={`w-3 h-3 rounded-full shrink-0 ${level.dot}`} />
                </button>
              );
            })}
          </div>

          {isCoolingDown && (
            <div className="rounded-xl border border-occupancy-full/30 bg-occupancy-full/10 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Podrás votar de nuevo en
              </p>
              <p className="text-2xl font-bold tabular-nums text-occupancy-full mt-1">
                {cooldownFormatted}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors ${
              canSubmit && !isSubmitting
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Enviando…' : 'Enviar mi reporte'}
          </button>
        </div>
      </div>
    </div>
  );
}
