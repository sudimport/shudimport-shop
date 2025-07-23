import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const user = req.headers.get('x-user') || null;
  return NextResponse.json({ user });
}
