import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, isCampusIpAllowed, isTrustProxyEnabled } from '@/lib/ip';
import { registerVote } from '@/lib/zones';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const allowed = await isCampusIpAllowed(req);
  if (!allowed) {
    return NextResponse.json(
      {
        error: 'Acceso denegado. No estás en el Wi-Fi del campus.',
        code: 'CAMPUS_NETWORK_REQUIRED',
      },
      { status: 403 }
    );
  }

  let body: { levelId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido.' }, { status: 400 });
  }

  const clientIp = getClientIp(req, isTrustProxyEnabled());
  const result = await registerVote(id, body.levelId ?? '', clientIp);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        allowedLevels: result.allowedLevels,
      },
      { status: result.status }
    );
  }

  return NextResponse.json(
    {
      zone: result.zone,
      acceptedLevel: result.acceptedLevel,
    },
    { status: 201 }
  );
}
