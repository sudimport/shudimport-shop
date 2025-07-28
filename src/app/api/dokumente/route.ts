// src/app/api/dokumente/route.ts
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

/**
 * Ritorna tutte le fatture (Sales Invoice) del cliente loggato:
 *  • campi principali + outstanding_amount + due_date
 *  • flag is_overdue
 *  • riepilogo totale aperto / scaduto
 *
 * Response:
 * {
 *   docs: [ { name, date, due_date, total, open, status, pdf_url, is_overdue } ],
 *   summary: { open_total, overdue_total, overdue_count }
 * }
 */
export async function GET(req: Request) {
  /* -------------------------------- email utente ------------------------------ */
  const email =
    req.headers.get('x-user') ||
    (await import('next/headers')).cookies().get('user_email')?.value;
  
  if (!email || !email.includes('@')) {
    console.log('❌ Email mancante o invalida:', email);
    return NextResponse.json({ docs: [] }, { status: 401 });
  }

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json'
  };

  try {
    /* ---------------------- 1. linked_customer -------------------------------- */
    const userUrl = `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(
      email
    )}?fields=["linked_customer"]`;
    
    console.log('🔍 Fetching user data:', userUrl);
    
    const usr = await fetch(userUrl, { headers }).then((r) => r.json());
    const customer = usr.data?.linked_customer;
    
    console.log('👤 User data:', { email, customer });
    
    if (!customer) {
      console.log('❌ Nessun cliente collegato per:', email);
      return NextResponse.json({ docs: [] });
    }

    /* ---------------------- 2. fatture del cliente ---------------------------- */
    // Proviamo sia con che senza docstatus per debug
    const filters = [
      ['customer', '=', customer],
      ['docstatus', '=', 1]  // Solo documenti sottomessi
    ];
    
    const invoiceUrl = `${process.env.ERP_URL}/api/resource/Sales Invoice?filters=${encodeURIComponent(
      JSON.stringify(filters)
    )}&fields=["name","posting_date","due_date","status","grand_total","outstanding_amount","customer","docstatus"]&order_by=posting_date desc&limit_page_length=500`;
    
    console.log('🔍 Fetching invoices:', invoiceUrl);
    
    const inv = await fetch(invoiceUrl, { headers }).then((r) => r.json());
    
    console.log('📄 Invoice response:', {
      customer,
      filters,
      dataLength: inv.data?.length || 0,
      data: inv.data?.slice(0, 3) // primi 3 per debug
    });

    if (!inv.data || inv.data.length === 0) {
      // Proviamo senza docstatus filter per vedere se ci sono fatture
      const altFilters = [['customer', '=', customer]];
      const altUrl = `${process.env.ERP_URL}/api/resource/Sales Invoice?filters=${encodeURIComponent(
        JSON.stringify(altFilters)
      )}&fields=["name","posting_date","due_date","status","grand_total","outstanding_amount","customer","docstatus"]&order_by=posting_date desc&limit_page_length=10`;
      
      console.log('🔍 Trying alternative filters:', altUrl);
      const altInv = await fetch(altUrl, { headers }).then((r) => r.json());
      console.log('📄 Alternative search result:', {
        dataLength: altInv.data?.length || 0,
        data: altInv.data?.slice(0, 3)
      });
    }

    const docs = (inv.data || []).map((d: any) => {
      const openAmt = +d.outstanding_amount || 0;
      const isOver = openAmt > 0 && new Date(d.due_date) < new Date();
      
      return {
        name: d.name,
        date: d.posting_date,
        due_date: d.due_date,
        total: +d.grand_total || 0,
        open: openAmt,
        status: d.status,
        // Usa endpoint proxy invece di link diretto
        pdf_url: `/api/pdf/sales-invoice/${encodeURIComponent(d.name)}`,
        is_overdue: isOver
      };
    });

    /* ---------------------- 3. riepilogo -------------------------------------- */
    const open_total = docs.reduce((s, x) => s + x.open, 0);
    const overdue_docs = docs.filter((x) => x.is_overdue);
    const overdue_total = overdue_docs.reduce((s, x) => s + x.open, 0);

    console.log('📊 Summary:', {
      docsCount: docs.length,
      open_total,
      overdue_total,
      overdue_count: overdue_docs.length
    });

    return NextResponse.json({
      docs,
      summary: {
        open_total,
        overdue_total,
        overdue_count: overdue_docs.length
      }
    });

  } catch (err) {
    console.error('❌ /api/dokumente error:', err);
    return NextResponse.json({ 
      docs: [], 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal error' 
    }, { status: 500 });
  }
}
