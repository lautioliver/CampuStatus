import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'campustatus',
    timestamp: new Date().toISOString(),
  });
}
