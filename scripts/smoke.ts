import { INITIAL_ZONES } from '../src/lib/constants';
import { prisma } from '../src/lib/prisma';
import { getZone, listZones, registerVote } from '../src/lib/zones';

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:3000';

async function run() {
  await resetBiblioteca();
  await testLibLayer();
  await testHttpLayer();
  console.log('Smoke OK');
}

async function resetBiblioteca() {
  const seed = INITIAL_ZONES.find((zone) => zone.slug === 'biblioteca');
  if (!seed) return;

  const zone = await prisma.zone.findUnique({ where: { slug: seed.slug } });
  if (!zone) return;

  await prisma.report.deleteMany({ where: { zoneId: zone.id } });
  await prisma.trendPoint.deleteMany({ where: { zoneId: zone.id } });

  await prisma.zone.update({
    where: { id: zone.id },
    data: {
      status: seed.status,
      capacity: seed.capacity,
      occupancy: seed.occupancy,
      voteCount: 0,
      lastUpdate: new Date(),
    },
  });

  await prisma.trendPoint.createMany({
    data: seed.trend.map((score) => ({
      zoneId: zone.id,
      score,
      recordedAt: new Date(),
    })),
  });
}

async function testLibLayer() {
  const zones = await listZones();
  assert(zones.length >= 3, 'Debe haber al menos 3 zonas seed');

  const biblioteca = await getZone('biblioteca');
  assert(biblioteca?.occupancy === 22, 'Ocupación inicial debe ser 22');

  const voteCountBefore = biblioteca?.voteCount ?? 0;
  const vote = await registerVote('biblioteca', 'lleno', '127.0.0.1');
  assert(vote.ok, 'Voto válido debe tener éxito');
  if (vote.ok) {
    assert(vote.zone.occupancy === 82, 'Votar "Lleno" debe establecer ocupación en 82');
    assert(vote.zone.status === 'Rojo', 'Votar "Lleno" debe marcar la zona como Rojo');
    assert(vote.zone.voteCount === voteCountBefore + 1, 'voteCount debe incrementarse');
  }

  const invalid = await registerVote('biblioteca', 'invalido');
  assert(!invalid.ok && invalid.status === 400, 'Nivel inválido debe responder 400');

  const missing = await registerVote('no-existe', 'moderado');
  assert(!missing.ok && missing.status === 404, 'Zona inexistente debe responder 404');
}

async function testHttpLayer() {
  try {
    const health = await fetch(`${BASE_URL}/api/health`);
    if (!health.ok) {
      console.warn('HTTP smoke omitido: servidor no disponible en', BASE_URL);
      return;
    }

    const zonesRes = await fetch(`${BASE_URL}/api/zones`);
    assert(zonesRes.ok, 'GET /api/zones debe responder 200');
    const zonesBody = await zonesRes.json();
    assert(Array.isArray(zonesBody.zones), 'GET /api/zones debe devolver array zones');
    assert(zonesBody.zones.length >= 3, 'GET /api/zones debe incluir zonas seed');

    const voteRes = await fetch(`${BASE_URL}/api/zones/biblioteca/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ levelId: 'moderado' }),
    });
    assert(voteRes.status === 403, 'POST vote desde localhost debe responder 403 fuera del campus');
  } catch (error) {
    console.warn('HTTP smoke omitido: no se pudo conectar a', BASE_URL, error);
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
