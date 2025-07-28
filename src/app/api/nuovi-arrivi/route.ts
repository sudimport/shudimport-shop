import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = `${process.env.ERP_URL}/api/method/nuovi_arrivi`;
  console.log('[API /nuovi-arrivi] URL:', url);
  console.log('[API /nuovi-arrivi] Using KEY:', process.env.ERP_API_KEY);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
      },
      cache: 'no-store',
    });
    console.log('[API /nuovi-arrivi] ERP status:', res.status);

    const text = await res.text();
    console.log('[API /nuovi-arrivi] ERP raw body:', text);

    let items = [];
    try {
      const parsed = JSON.parse(text);
      items = parsed.message || parsed.data || [];
    } catch (e) {
      console.error('[API /nuovi-arrivi] JSON parse error:', e);
    }

    return NextResponse.json({ items, raw: text });
  } catch (err) {
    console.error('[API /nuovi-arrivi] Exception:', err);
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 });
  }
}
