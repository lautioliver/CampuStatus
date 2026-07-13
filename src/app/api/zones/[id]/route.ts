import { NextResponse } from 'next/server';
import { getZone } from '@/lib/zones';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const zone = await getZone(id);

  if (!zone) {
    return NextResponse.json({ error: 'Zona no encontrada.' }, { status: 404 });
  }

  return NextResponse.json({ zone });
}
