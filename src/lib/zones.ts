import type { Zone } from '@prisma/client';
import { STATUS_BY_SCORE, REPORT_LEVELS, type ReportLevelId } from './constants';
import { prisma } from './prisma';

export type SerializedZone = {
  id: string;
  name: string;
  status: string;
  capacity: string;
  occupancy: number;
  lastUpdate: string;
  trend: number[];
  voteCount: number;
};

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function deriveState(score: number) {
  return STATUS_BY_SCORE.find((range) => score <= range.max)!;
}

async function getTrendScores(zoneId: string): Promise<number[]> {
  const points = await prisma.trendPoint.findMany({
    where: { zoneId },
    orderBy: { recordedAt: 'desc' },
    take: 8,
    select: { score: true },
  });

  return points.map((point) => point.score).reverse();
}

async function serializeZone(zone: Zone): Promise<SerializedZone> {
  const trend = await getTrendScores(zone.id);

  return {
    id: zone.slug,
    name: zone.name,
    status: zone.status,
    capacity: zone.capacity,
    occupancy: zone.occupancy,
    lastUpdate: formatTime(zone.lastUpdate),
    trend,
    voteCount: zone.voteCount,
  };
}

export async function listZones(): Promise<SerializedZone[]> {
  const zones = await prisma.zone.findMany({
    where: { active: true },
    orderBy: { slug: 'asc' },
  });

  return Promise.all(zones.map(serializeZone));
}

export async function getZone(slug: string): Promise<SerializedZone | null> {
  const zone = await prisma.zone.findUnique({ where: { slug } });
  if (!zone || !zone.active) return null;
  return serializeZone(zone);
}

type VoteResult =
  | {
      ok: true;
      zone: SerializedZone;
      acceptedLevel: { id: string; label: string; status: string };
    }
  | {
      ok: false;
      status: number;
      error: string;
      allowedLevels?: string[];
    };

export async function registerVote(
  slug: string,
  levelId: string,
  clientIp?: string
): Promise<VoteResult> {
  const zone = await prisma.zone.findUnique({ where: { slug } });
  if (!zone || !zone.active) {
    return { ok: false, status: 404, error: 'Zona no encontrada.' };
  }

  const level = REPORT_LEVELS[levelId as ReportLevelId];
  if (!level) {
    return {
      ok: false,
      status: 400,
      error: 'Nivel de ocupación inválido.',
      allowedLevels: Object.keys(REPORT_LEVELS),
    };
  }

  const score = level.score;
  const state = deriveState(score);
  const now = new Date();

  await prisma.$transaction([
    prisma.zone.update({
      where: { id: zone.id },
      data: {
        status: state.status,
        capacity: state.capacity,
        occupancy: score,
        lastUpdate: now,
        voteCount: { increment: 1 },
      },
    }),
    prisma.report.create({
      data: {
        zoneId: zone.id,
        levelId,
        clientIp,
      },
    }),
    prisma.trendPoint.create({
      data: {
        zoneId: zone.id,
        score,
        recordedAt: now,
      },
    }),
  ]);

  await trimTrendPoints(zone.id);

  const updated = await prisma.zone.findUniqueOrThrow({ where: { id: zone.id } });

  return {
    ok: true,
    zone: await serializeZone(updated),
    acceptedLevel: {
      id: levelId,
      label: level.label,
      status: level.status,
    },
  };
}

export async function trimTrendPoints(zoneId: string, keep = 8): Promise<void> {
  const points = await prisma.trendPoint.findMany({
    where: { zoneId },
    orderBy: { recordedAt: 'desc' },
    select: { id: true },
    skip: keep,
  });

  if (points.length === 0) return;

  await prisma.trendPoint.deleteMany({
    where: { id: { in: points.map((point) => point.id) } },
  });
}
