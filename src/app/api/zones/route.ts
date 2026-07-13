import { NextResponse } from 'next/server';
import { listZones } from '@/lib/zones';

export async function GET() {
  const zones = await listZones();
  return NextResponse.json({ zones });
}
