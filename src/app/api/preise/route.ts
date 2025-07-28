// src/app/api/preise/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Questa rotta restituisce SOLO gli articoli che hanno
 * un prezzo personalizzato INFERIORE al prezzo di listino
 * per il cliente collegato all'utente loggato.
 *
 * Per ogni articolo:
 *  • price            → prezzo personalizzato scontato
 *  • public_price     → prezzo di listino standard
 *  • is_discounted    → sempre true (filtriamo solo quelli scontati)
 */
export async function GET(req: Request) {
  /* ---------------------------------------------------------------------- */
  /* 0. Legge l'e-mail dell'utente dal cookie o dall'header "x-user"         */
  /* ---------------------------------------------------------------------- */
  const userEmail =
    req.headers.get('x-user') ||
    (await import('next/headers')).cookies().get('user_email')?.value;

  if (!userEmail || !userEmail.includes('@')) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  try {
    /* ------------------------------------------------------------------ */
    /* 1. linked_customer dal DocType User                                */
    /* ------------------------------------------------------------------ */
    const userRes = await fetch(
      `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(
        userEmail
      )}?fields=["linked_customer"]`,
      { headers }
    );
    const linkedCustomer = (await userRes.json()).data?.linked_customer;
    if (!linkedCustomer) return NextResponse.json({ items: [] });

    /* ------------------------------------------------------------------ */
    /* 2. price-list predefinito del cliente                              */
    /* ------------------------------------------------------------------ */
    const custRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Customer/${linkedCustomer}?fields=["default_price_list"]`,
      { headers }
    );
    const priceList = (await custRes.json()).data?.default_price_list;
    if (!priceList) return NextResponse.json({ items: [] });

    /* ------------------------------------------------------------------ */
    /* 3. Prezzi PERSONALIZZATI (Item Price con campo 'customer')         */
    /* ------------------------------------------------------------------ */
    const personalizedRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Item Price?filters=${encodeURIComponent(
        JSON.stringify([
          ['price_list', '=', priceList],
          ['customer', '=', linkedCustomer],
          ['selling', '=', 1]
        ])
      )}&fields=["item_code","price_list_rate"]&limit_page_length=1000`,
      { headers }
    );
    const personalized = (await personalizedRes.json()).data || [];

    if (personalized.length === 0) {
      // Nessun prezzo custom = nessun risultato da mostrare
      return NextResponse.json({ items: [] });
    }

    /* 3a. mappa prezzi personalizzati */
    type PriceInfo = { personalized?: number; standard?: number };
    const priceMap: Record<string, PriceInfo> = {};
    const itemCodes = personalized.map((p: any) => {
      priceMap[p.item_code] = { personalized: +p.price_list_rate };
      return p.item_code;
    });

    /* ------------------------------------------------------------------ */
    /* 4. Prezzi STANDARD di listino (stesso price-list, customer IS NULL)*/
    /* ------------------------------------------------------------------ */
    const standardRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Item Price?filters=${encodeURIComponent(
        JSON.stringify([
          ['price_list', '=', priceList],
          ['customer', 'is', 'not set'],
          ['selling', '=', 1],
          ['item_code', 'in', itemCodes]   // limitiamo solo a quelli utili
        ])
      )}&fields=["item_code","price_list_rate"]&limit_page_length=1000`,
      { headers }
    );
    const standard = (await standardRes.json()).data || [];
    standard.forEach((p: any) => {
      if (!priceMap[p.item_code]) priceMap[p.item_code] = {};
      priceMap[p.item_code].standard = +p.price_list_rate;
    });

    /* ------------------------------------------------------------------ */
    /* 5. Dati anagrafici "Item" + prezzo_vendita                         */
    /* ------------------------------------------------------------------ */
    const items: any[] = [];
    for (const code of itemCodes) {
      const itemRes = await fetch(
        `${process.env.ERP_URL}/api/resource/Item/${code}?fields=["item_name","item_group","image","name","prezzo_vendita","item_image","web_image","website_image"]`,
        { headers }
      );
      if (!itemRes.ok) continue;
      const item = await itemRes.json();

      const personal = priceMap[code]?.personalized ?? null;
      const standardPrice =
        priceMap[code]?.standard ??
        (item.data?.prezzo_vendita
          ? +item.data.prezzo_vendita
          : null);

      // FILTRO: Include solo articoli con prezzo personalizzato INFERIORE al prezzo standard
      if (
        personal !== null &&
        standardPrice !== null &&
        personal < standardPrice
      ) {
        items.push({
          name: item.data.name,
          item_name: item.data.item_name,
          item_group: item.data.item_group,
          image: item.data.image,
          price: personal,                         // prezzo scontato
          public_price: standardPrice,             // listino pubblico
          is_discounted: true,                     // sempre true per definizione
        });
      }
    }

    return NextResponse.json({ items });
  } catch (err) {
    console.error('❌ /api/preise error:', err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
