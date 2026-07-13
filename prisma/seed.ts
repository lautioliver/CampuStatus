import { PrismaClient } from '@prisma/client';
import {
  ALLOWED_CAMPUS_IP_SEED,
  INITIAL_ZONES,
  REPORT_LEVEL_SEED,
} from '../src/lib/constants';

const prisma = new PrismaClient();

async function main() {
  for (const level of REPORT_LEVEL_SEED) {
    await prisma.reportLevel.upsert({
      where: { id: level.id },
      update: {
        label: level.label,
        statusColor: level.statusColor,
        score: level.score,
        sortOrder: level.sortOrder,
      },
      create: level,
    });
  }

  for (const ip of ALLOWED_CAMPUS_IP_SEED) {
    await prisma.allowedCampusIp.upsert({
      where: { ipAddress: ip.ipAddress },
      update: { description: ip.description, active: true },
      create: { ...ip, active: true },
    });
  }

  await prisma.allowedCampusIp.updateMany({
    where: {
      ipAddress: { in: ['127.0.0.1', '::1', 'localhost'] },
    },
    data: { active: false },
  });

  for (const zone of INITIAL_ZONES) {
    const existing = await prisma.zone.findUnique({ where: { slug: zone.slug } });

    if (existing) {
      continue;
    }

    const created = await prisma.zone.create({
      data: {
        slug: zone.slug,
        name: zone.name,
        status: zone.status,
        capacity: zone.capacity,
        occupancy: zone.occupancy,
        voteCount: 0,
        lastUpdate: new Date(),
        active: true,
      },
    });

    await prisma.trendPoint.createMany({
      data: zone.trend.map((score) => ({
        zoneId: created.id,
        score,
        recordedAt: new Date(),
      })),
    });
  }

  console.log('Seed completado: zonas, niveles e IPs de campus.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
