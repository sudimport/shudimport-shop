// src/app/api/prodotti/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/* ------------------------------------------------------------------ */
/* 1. Recupero CUSTOMER associato a una e-mail                        */
/* ------------------------------------------------------------------ */
async function getLinkedCustomer(
  email: string,
  headers: Record<string, string>
): Promise<string | null> {
  try {
    // 1️⃣ cookie già presente?
    const cookieCustomer = cookies().get('customer')?.value
    if (cookieCustomer) return cookieCustomer

    // 2️⃣ nuovo metodo: campo linked_customer su User
    const userRes = await fetch(
      `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(
        email
      )}?fields=["linked_customer"]`,
      { headers }
    )
    if (userRes.ok) {
      const userJson = await userRes.json()
      if (userJson.data?.linked_customer) return userJson.data.linked_customer
    }

    // 3️⃣ ⬇️ fallback legacy: Contact → Customer
    const contactEmailRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Contact Email?filters=${encodeURIComponent(
        JSON.stringify([['email_id', '=', email]])
      )}`,
      { headers }
    )
    if (!contactEmailRes.ok) return null

    const emailJson = await contactEmailRes.json()
    const contacts: string[] =
      emailJson.data?.map((e: { parent: string }) => e.parent) || []

    for (const contactName of contacts) {
      const detailRes = await fetch(
        `${process.env.ERP_URL}/api/resource/Contact/${encodeURIComponent(
          contactName
        )}?fields=["links"]`,
        { headers }
      )
      if (!detailRes.ok) continue
      const detJson = await detailRes.json()
      const customerLink = detJson.data?.links?.find(
        (l: any) => l.link_doctype === 'Customer'
      )
      if (customerLink) return customerLink.link_name
    }

    return null
  } catch (err) {
    console.error('❌ getLinkedCustomer error:', err)
    return null
  }
}

/* ------------------------------------------------------------------ */
/* 2. Recupero listino personalizzato                                 */
/* ------------------------------------------------------------------ */
type PriceMap = Record<
  string,
  { standard: number | null; personalized: number | null }
>

async function fetchPrices(
  email: string,
  customer: string | null,
  itemCodes: string[],
  headers: Record<string, string>
): Promise<PriceMap> {
  if (!customer || itemCodes.length === 0) return {}

  try {
    const priceRes = await fetch(
      `${process.env.ERP_URL}/api/method/nexterp_customizations.api.shop.get_prezzi_per_listino?email=${encodeURIComponent(
        email
      )}`,
      { headers }
    )
    if (!priceRes.ok) return {}

    const priceJson = await priceRes.json()
    const prezzi = priceJson.message?.prezzi || []

    const map: PriceMap = {}
    prezzi.forEach((p: any) => {
      map[p.item_code] = {
        standard: p.price_list_rate,
        personalized: p.price_list_rate
      }
    })
    return map
  } catch (err) {
    console.error('❌ fetchPrices error:', err)
    return {}
  }
}

/* ------------------------------------------------------------------ */
/* 3. Handler principale GET                                          */
/* ------------------------------------------------------------------ */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const categoria = url.searchParams.get('categoria') || undefined
  const searchTerm = url.searchParams.get('search')?.trim() || undefined
  const page = parseInt(url.searchParams.get('page') ?? '1', 10)
  const limit = parseInt(url.searchParams.get('limit') ?? '20', 10)
  const offset = (page - 1) * limit

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json'
  }

  /* -------- email utente (cookie o header x-user) -------- */
  let email = ''
  const headerEmail = req.headers.get('x-user')
  const cookieEmail = cookies().get('user_email')?.value
  if (headerEmail && headerEmail.includes('@')) email = headerEmail
  else if (cookieEmail && cookieEmail.includes('@')) email = cookieEmail

  const isLoggedIn = Boolean(email)

  /* ----------------- 1. conteggio totale ----------------- */
  const filters: [string, string, string][] = []
  if (categoria) filters.push(['item_group', '=', categoria])
  if (searchTerm) filters.push(['item_name', 'like', `%${searchTerm}%`])

  const countURL = new URL(`${process.env.ERP_URL}/api/resource/Item`)
  countURL.searchParams.set('fields', JSON.stringify(['name']))
  if (filters.length) countURL.searchParams.set('filters', JSON.stringify(filters))

  const totRes = await fetch(countURL.toString(), { headers })
  const totJson = await totRes.json()
  const total = Array.isArray(totJson.data) ? totJson.data.length : 0

  /* ----------------- 2. lista paginata ------------------- */
  const listURL = new URL(`${process.env.ERP_URL}/api/resource/Item`)
  listURL.searchParams.set(
    'fields',
    JSON.stringify(['name', 'item_name', 'item_group', 'image', 'description'])
  )
  listURL.searchParams.set('limit_start', String(offset))
  listURL.searchParams.set('limit_page_length', String(limit))
  if (filters.length) listURL.searchParams.set('filters', JSON.stringify(filters))

  const listRes = await fetch(listURL.toString(), { headers })
  const listJson = await listRes.json()
  const items = Array.isArray(listJson.data) ? listJson.data : []

  /* ----------- 3. collego customer & prezzi -------------- */
  const customer = isLoggedIn ? await getLinkedCustomer(email, headers) : null
  const itemCodes = items.map(i => i.name)
  const priceMap = await fetchPrices(email, customer, itemCodes, headers)

  const enriched = items.map(item => {
    const prices = priceMap[item.name] || {}
    return {
      ...item,
      price: prices.standard || null,
      personalizedPrice: prices.personalized || null,
      showPersonalizedPrice: !!(customer && prices.personalized !== null),
      displayPrice:
        customer && prices.personalized !== null
          ? prices.personalized
          : prices.standard || null
    }
  })

  /* ----------------- 4. risposta JSON -------------------- */
  return NextResponse.json({
    items: enriched,
    total,
    isLoggedIn,
    customer,
    searchTerm,
    categoria,
    page,
    limit
  })
}
