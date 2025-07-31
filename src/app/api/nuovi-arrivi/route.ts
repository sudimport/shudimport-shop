// ~/shop/src/app/api/nuovi-arrivi/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const email = req.headers.get('x-user') || cookies().get('user_email')?.value || ''

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json',
  }

  const url = `${process.env.ERP_URL}/api/method/nuovi_arrivi`

  try {
    const res = await fetch(url, {
      headers,
      cache: 'no-store',
    })

    const text = await res.text()
    let items = []
    try {
      const parsed = JSON.parse(text)
      items = parsed.message || parsed.data || []
    } catch (e) {
      console.error('[API /nuovi-arrivi] JSON parse error:', e)
    }

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

    const enriched = items.map((item: any) => ({
      ...item,
      price: priceMap[item.name] || null,
    }))

    return NextResponse.json({ items: enriched })
  } catch (err) {
    console.error('[API /nuovi-arrivi] Exception:', err)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
