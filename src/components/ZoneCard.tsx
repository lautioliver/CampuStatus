'use client';

import { statusStyles } from '@/data/zoneMetadata';
import type { MappedZone } from '@/utils/mapZone';
import { ClockIcon, UsersIcon, ZoneIcon } from '@/components/Icons';

export default function ZoneCard({
  zone,
  onReport,
}: {
  zone: MappedZone;
  onReport: (zoneId: string) => void;
}) {
  const style = statusStyles[zone.status];

  return (
    <article className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
            <ZoneIcon type={zone.icon} className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground truncate">{zone.name}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{zone.location}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${style.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <p className="text-sm text-muted-foreground">{zone.description}</p>
          <span className={`text-lg font-bold tabular-nums ${style.text}`}>{zone.occupancy}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
            style={{ width: `${zone.occupancy}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1 mt-auto">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClockIcon />
            Hace {zone.minutesAgo} min
          </span>
          <span className="inline-flex items-center gap-1">
            <UsersIcon />
            {zone.reportsToday} reportes hoy
          </span>
        </div>
        <button
          type="button"
          onClick={() => onReport(zone.id)}
          className="shrink-0 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Reportar
        </button>
      </div>
    </article>
  );
}
