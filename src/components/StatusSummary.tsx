import { statusStyles } from '@/data/zoneMetadata';
import type { MappedZone } from '@/utils/mapZone';

export default function StatusSummary({ zones }: { zones: MappedZone[] }) {
  const counts = {
    Verde: zones.filter((z) => z.status === 'Verde').length,
    Amarillo: zones.filter((z) => z.status === 'Amarillo').length,
    Rojo: zones.filter((z) => z.status === 'Rojo').length,
  };

  const items = [
    { status: 'Verde', count: counts.Verde },
    { status: 'Amarillo', count: counts.Amarillo },
    { status: 'Rojo', count: counts.Rojo },
  ];

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
      {items.map(({ status, count }) => {
        const style = statusStyles[status];
        return (
          <div
            key={status}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
            <span className="font-bold">{count}</span>
            <span className="text-muted-foreground">{style.summaryLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
