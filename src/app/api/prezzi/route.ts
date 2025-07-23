// Marca la route come dinamica
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET (req: Request) {
  const item = new URL(req.url).searchParams.get('item') || ''
  if (!item) {
    return NextResponse.json({ error: 'item è obbligatorio' }, { status: 400 })
  }

  // ✅ lettura cookie dopo aver dichiarato dynamic
  const email = cookies().get('user')?.value
  if (!email) {
    return NextResponse.json({ error: 'Utente non loggato' }, { status: 401 })
  }

  const erpRes = await fetch(
    `${process.env.ERP_URL}/api/method/nexterp_customizations.api.shop.get_prezzi_per_listino?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}` } }
  )

  if (!erpRes.ok) {
    const err = await erpRes.json()
    return NextResponse.json({ error: 'ERPNext error', details: err }, { status: erpRes.status })
  }

  const { message } = await erpRes.json()
  const entry = (message.prezzi as any[]).find(p => p.item_code === item)
  if (!entry) return NextResponse.json({ error: `Nessun prezzo per ${item}` }, { status: 404 })

  return NextResponse.json({ email, item, price: entry.price_list_rate })
}
