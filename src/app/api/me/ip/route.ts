import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, isCampusIpAllowed, isTrustProxyEnabled } from '@/lib/ip';

export async function GET(req: NextRequest) {
  const trustProxy = isTrustProxyEnabled();
  const ip = getClientIp(req, trustProxy);
  const canVote = await isCampusIpAllowed(req);

  return NextResponse.json({
    ip,
    canVote,
    trustProxy,
  });
}
