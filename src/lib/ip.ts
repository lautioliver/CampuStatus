import type { NextRequest } from 'next/server';
import { ALLOWED_CAMPUS_IP_SEED } from './constants';
import { prisma } from './prisma';

function normalizeIp(ip: string): string {
  if (ip.startsWith('::ffff:')) {
    return ip.slice(7);
  }
  return ip;
}

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeIp);
}

export function getClientIp(req: NextRequest, trustProxy: boolean): string {
  if (trustProxy) {
    const forwarded =
      req.headers.get('x-forwarded-for') ??
      req.headers.get('x-vercel-forwarded-for');
    if (forwarded) {
      return normalizeIp(forwarded.split(',')[0]?.trim() ?? '');
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
      return normalizeIp(realIp.trim());
    }
  }

  return normalizeIp('127.0.0.1');
}

export async function getAllowedCampusIps(): Promise<string[]> {
  if (process.env.ALLOWED_CAMPUS_IPS !== undefined) {
    return parseList(process.env.ALLOWED_CAMPUS_IPS);
  }

  const rows = await prisma.allowedCampusIp.findMany({
    where: { active: true },
    select: { ipAddress: true },
  });

  if (rows.length > 0) {
    return rows.map((row) => normalizeIp(row.ipAddress));
  }

  return ALLOWED_CAMPUS_IP_SEED.map((row) => row.ipAddress);
}

export function isTrustProxyEnabled(): boolean {
  if (process.env.TRUST_PROXY === 'true') return true;
  if (process.env.TRUST_PROXY === 'false') return false;
  // En Vercel siempre hay reverse proxy; leer la IP real del cliente.
  return process.env.VERCEL === '1';
}

export async function isCampusIpAllowed(req: NextRequest): Promise<boolean> {
  const trustProxy = isTrustProxyEnabled();
  const clientIp = getClientIp(req, trustProxy);
  const allowedIps = await getAllowedCampusIps();
  return allowedIps.includes(clientIp);
}
