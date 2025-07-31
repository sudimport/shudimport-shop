// ~/shop/src/app/api/prodotti-offerta/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type Item = {
  name: string
  item_name: string
  image?: string
  price?: number | null
}

export async function GET(req: NextRequest) {
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '8')
  const email = req.headers.get('x-user') || cookies().get('user_email')?.value || ''

  const listUrl = new URL(`${process.env.ERP_URL}/api/resource/Item`)
  listUrl.searchParams.set('fields', JSON.stringify(['name', 'item_name', 'image']))
  listUrl.searchParams.set('filters', JSON.stringify([['is_offer_item', '=', 1]]))
  listUrl.searchParams.set('limit_page_length', limit.toString())

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json',
  }

  try {
    const response = await fetch(listUrl.toString(), { headers })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Errore da ERPNext' }, { status: response.status })
    }

    const items: Item[] = Array.isArray(data.data) ? data.data : []

    // --- Prezzi personalizzati ---
    let priceMap: Record<string, number> = {}
    if (email) {
      const priceRes = await fetch(
        `${process.env.ERP_URL}/api/method/nexterp_customizations.api.shop.get_prezzi_per_listino?email=${encodeURIComponent(email)}`,
        { headers }
      )
      const priceJson = await priceRes.json()
      for (const p of priceJson.message?.prezzi || []) {
        priceMap[p.item_code] = p.price_list_rate
      }
    }

    const enriched = items.map(item => ({
      ...item,
      price: priceMap[item.name] || null,
    }))

    return NextResponse.json({ items: enriched })
  } catch (error) {
    console.error('Errore prodotti-offerta:', error)
    return NextResponse.json({ error: 'Errore di connessione ERPNext' }, { status: 500 })
  }
}
