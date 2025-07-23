import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { usr, pwd } = await req.json();

  try {
    const res = await fetch('https://gestionale.sudimport.website/api/method/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usr, pwd }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ message: data.message || 'Login fehlgeschlagen.' }, { status: 401 });
    }

    // Recupera il cookie 'sid' dalla risposta originale ERPNext
    const raw = res.headers.getSetCookie();
    const sidCookie = raw?.find((c) => c.includes('sid=')) || '';

    const response = NextResponse.json({ message: 'Login erfolgreich' });

    // Imposta cookie nel browser per la sessione
    if (sidCookie) {
      const sessionId = sidCookie.split(';')[0].split('=')[1];
      response.cookies.set('sid', sessionId, {
        httpOnly: false,
        path: '/',
        sameSite: 'lax'
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Serverfehler beim Login.' }, { status: 500 });
  }
}
