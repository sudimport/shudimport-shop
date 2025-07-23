import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const email = cookieStore.get('user')?.value || '';

  console.log('📧 Email from cookie:', email);

  if (!email) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  // continua fetch da ERPNext usando email
  return NextResponse.json({ message: 'OK', email });
}
