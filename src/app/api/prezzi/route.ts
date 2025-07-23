// src/app/api/prezzi/route.ts

import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email') || ''
  const item = searchParams.get('item') || ''

  if (!email || !item) {
    return NextResponse.json({ error: 'email e item sono obbligatori' }, { status: 400 })
  }

  const erpRes = await fetch(
    `${process.env.ERP_URL}/api/method/nexterp_customizations.api.shop.get_prezzi_per_listino?email=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
      },
    }
  )

  if (!erpRes.ok) {
    const err = await erpRes.json()
    return NextResponse.json({ error: 'ERPNext error', details: err }, { status: erpRes.status })
  }

  const { message } = await erpRes.json()
  const prezzi: Array<{ item_code: string; price_list_rate: number }> = message.prezzi

  const entry = prezzi.find(p => p.item_code === item)
  if (!entry) {
    return NextResponse.json({ error: `Nessun prezzo trovato per ${item}` }, { status: 404 })
  }

  return NextResponse.json({
    email,
    item,
    price: entry.price_list_rate
  })
}
