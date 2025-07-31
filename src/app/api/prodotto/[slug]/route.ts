import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const slug   = params.slug
  const erpUrl = process.env.ERP_URL || ''
  const token  = `${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`

  /* ------------------------------------------------- */
  /* 1. USER / LOGIN                                   */
  /* ------------------------------------------------- */
  const cStore      = cookies()
  const headerMail  = req.headers.get('x-user')
  const cookieMail  = cStore.get('user_email')?.value
  const email       = headerMail?.includes('@') ? headerMail : cookieMail ?? ''
  const isLoggedIn  = !!email

  /* ------------------------------------------------- */
  /* 2. TROVA L'ITEM                                   */
  /* ------------------------------------------------- */
  let item: any = null

  /* 2a. lookup diretto per codice “GEG-00003” … */
  if (/^[A-Z]{3}-\d{5}$/.test(slug)) {
    const r = await fetch(
      `${erpUrl}/api/resource/Item/${encodeURIComponent(slug)}?expand=1`, // ← expand=1
      { headers: { Authorization: `token ${token}` } }
    )
    if (r.ok) item = (await r.json()).data
  }

  /* 2b. lookup via item_url */
  if (!item) {
    const r = await fetch(
      `${erpUrl}/api/resource/Item?filters=${encodeURIComponent(
        JSON.stringify([['item_url', '=', slug]])
      )}&limit_page_length=1&fields=["name"]`,
      { headers: { Authorization: `token ${token}` } }
    )
    const j = await r.json()
    if (j.data?.length) {
      const code = j.data[0].name
      const d    = await fetch(
        `${erpUrl}/api/resource/Item/${encodeURIComponent(code)}?expand=1`,
        { headers: { Authorization: `token ${token}` } }
      )
      if (d.ok) item = (await d.json()).data
    }
  }

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  /* ------------------------------------------------- */
  /* 3. PREZZO                                         */
  /* ------------------------------------------------- */
  let customer: string | null     = null
  let personalized: number | null = null

  if (isLoggedIn) {
    // linked_customer
    const u = await fetch(
      `${erpUrl}/api/resource/User/${encodeURIComponent(email)}?fields=["linked_customer"]`,
      { headers: { Authorization: `token ${token}` } }
    )
    if (u.ok) {
      const uj = await u.json()
      customer = uj.data?.linked_customer ?? null
    }

    // prezzo personalizzato
    if (customer) {
      const p = await fetch(
        `${erpUrl}/api/method/nexterp_customizations.api.shop.get_prezzi_per_listino?email=${encodeURIComponent(
          email
        )}`,
        { headers: { Authorization: `token ${token}` } }
      )
      if (p.ok) {
        const pj = await p.json()
        const row = (pj.message?.prezzi || []).find(
          (r: any) => r.item_code === item.name
        )
        personalized = row?.price_list_rate ?? null
      }
    }
  }

  const priceNetto =
    personalized ??
    item.prezzo_vendita ??
    item.standard_rate ??
    0

  /* ------------------------------------------------- */
  /* 4. IVA – estrae “7” da “7% - S”                   */
  /* ------------------------------------------------- */
  let vatPercent = 0
  if (Array.isArray(item.taxes) && item.taxes.length) {
    const tpl = item.taxes[0].item_tax_template || ''
    const m   = tpl.match(/(\d+)\s*%/)
    if (m) vatPercent = parseInt(m[1], 10)
  }

  const ivaAmount  = +(priceNetto * vatPercent / 100).toFixed(2)
  const priceLordo = +(priceNetto + ivaAmount).toFixed(2)

  /* ------------------------------------------------- */
  /* 5. UOM alternativi                                */
  /* ------------------------------------------------- */
  const alternative_uoms =
    Array.isArray(item.uoms)
      ? item.uoms
          .filter((row: any) => row.uom && row.conversion_factor)
          .map((row: any) => ({
            uom: row.uom,
            conversion_factor: row.conversion_factor
          }))
      : []

  /* ------------------------------------------------- */
  /* 6. RISPOSTA                                       */
  /* ------------------------------------------------- */
  return NextResponse.json({
    item: {
      name: item.name,
      item_url: item.item_url,
      item_name: item.item_name,
      description: item.description ?? '',
      image: item.image,
      price: priceNetto.toFixed(2),          // netto
      vat_percent: vatPercent.toFixed(2),    // "7.00"
      iva_amount: ivaAmount.toFixed(2),
      price_lordo: priceLordo.toFixed(2),
      stock_uom: item.stock_uom ?? 'Stk',
      weight_per_unit:
        item.weight_per_unit && item.weight_uom
          ? `${item.weight_per_unit} ${item.weight_uom}`
          : null,
      minimum_order_qty: item.min_order_qty ?? 1,
      shelf_life: item.shelf_life ?? null,
      origin: item.origin ?? null,
      alternative_uoms                           // ← nuovo array
    },
    customer,
    isLoggedIn
  })
}
