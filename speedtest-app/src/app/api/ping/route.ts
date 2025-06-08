import { NextResponse } from 'next/server';

export async function HEAD() {
  // Add a small random delay to simulate network conditions (0-20ms)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
  return NextResponse.json({}, { status: 200 });
}

export async function GET() {
  // Add a small random delay to simulate network conditions (0-20ms)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
  return NextResponse.json({ timestamp: Date.now() }, { status: 200 });
}