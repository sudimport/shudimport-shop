import { NextRequest, NextResponse } from 'next/server';

type Item = {
  name: string;
  item_name: string;
  image?: string;
};

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '8');

  const listUrl = new URL(`${process.env.ERP_URL}/api/resource/Item`);
  listUrl.searchParams.set('fields', JSON.stringify(['name', 'item_name', 'image']));
  listUrl.searchParams.set('filters', JSON.stringify([['is_offer_item', '=', 1]]));
  listUrl.searchParams.set('limit_page_length', limit.toString());

  try {
    const response = await fetch(listUrl.toString(), {
      headers: {
        Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Errore da ERPNext' }, { status: response.status });
    }

    const items: Item[] = Array.isArray(data.data)
      ? data.data.map((item): Item => ({
          name: item.name,
          item_name: item.item_name,
          image: item.image || null,
        }))
      : [];

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Errore prodotti-offerta:', error);
    return NextResponse.json({ error: 'Errore di connessione ERPNext' }, { status: 500 });
  }
}
