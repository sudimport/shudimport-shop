// src/app/api/bestellungen/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/bestellungen
 * Ritorna lo storico ordini (Sales Order) del cliente collegato all’utente loggato.
 * Ogni record include: numero, data, totale, stato, link PDF.
 */
export async function GET(req: Request) {
  /* ---------------------------------------------------- */
  /* 0. Ricava e-mail dell’utente (cookie o header)       */
  /* ---------------------------------------------------- */
  const email =
    req.headers.get('x-user') ||
    (await import('next/headers')).cookies().get('user_email')?.value;

  if (!email || !email.includes('@')) {
    return NextResponse.json({ orders: [] }, { status: 401 });
  }

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json'
  };

  try {
    /* -------------------------------------------------- */
    /* 1. linked_customer                                */
    /* -------------------------------------------------- */
    const userRes = await fetch(
      `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(
        email
      )}?fields=["linked_customer"]`,
      { headers }
    );
    const linkedCustomer = (await userRes.json()).data?.linked_customer;
    if (!linkedCustomer) return NextResponse.json({ orders: [] });

    /* -------------------------------------------------- */
    /* 2. Sales Order del cliente                         */
    /* -------------------------------------------------- */
    const soRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Sales Order?filters=${encodeURIComponent(
        JSON.stringify([['customer', '=', linkedCustomer]])
      )}&fields=["name","transaction_date","grand_total","status","docstatus"]&order_by=transaction_date desc&limit_page_length=500`,
      { headers }
    );
    const data = (await soRes.json()).data || [];

    /* -------------------------------------------------- */
    /* 3. Mappa dei risultati                             */
    /* -------------------------------------------------- */
    const orders = data.map((so: any) => ({
      name: so.name,
      date: so.transaction_date,
      total: +so.grand_total,
      status: so.status,     // Draft / To Deliver / Completed …
      docstatus: so.docstatus, // 0-Draft, 1-Submitted, 2-Cancelled
      pdf_url:
        `${process.env.ERP_URL}/printview?doctype=Sales%20Order&name=${encodeURIComponent(
          so.name
        )}&format=Standard&no_letterhead=0&_lang=de`
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('❌ /api/bestellungen error:', err);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
