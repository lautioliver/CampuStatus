import { statusStyles, zoneMetadata } from '@/data/zoneMetadata';

type ApiZone = {
  id: string;
  name: string;
  status: string;
  capacity: string;
  occupancy?: number;
  lastUpdate: string;
  voteCount?: number;
  trend?: number[];
};

export type MappedZone = {
  id: string;
  name: string;
  location: string;
  category: string;
  icon: string;
  status: string;
  capacity: string;
  occupancy: number;
  description: string;
  lastUpdate: string;
  minutesAgo: number;
  reportsToday: number;
  trend: number[];
};

function minutesSinceLastUpdate(lastUpdate: string): number {
  const [hours, minutes] = lastUpdate.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;

  const now = new Date();
  const then = new Date();
  then.setHours(hours, minutes, 0, 0);

  const diff = Math.floor((now.getTime() - then.getTime()) / 60_000);
  return diff >= 0 ? diff : 0;
}

export function mapZoneFromApi(apiZone: ApiZone): MappedZone | null {
  const meta = zoneMetadata[apiZone.id];
  if (!meta) return null;

  const style = statusStyles[apiZone.status];
  const occupancy = apiZone.occupancy ?? apiZone.trend?.at(-1) ?? 0;

  return {
    id: apiZone.id,
    name: apiZone.name,
    location: meta.location,
    category: meta.category,
    icon: meta.icon,
    status: apiZone.status,
    capacity: apiZone.capacity,
    occupancy,
    description: style?.description ?? '',
    lastUpdate: apiZone.lastUpdate,
    minutesAgo: minutesSinceLastUpdate(apiZone.lastUpdate),
    reportsToday: apiZone.voteCount ?? 0,
    trend: apiZone.trend ?? [],
  };
}

export function mapZonesFromApi(zones: ApiZone[]): MappedZone[] {
  return zones.map(mapZoneFromApi).filter((zone): zone is MappedZone => zone !== null);
}
