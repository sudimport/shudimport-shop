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
    const cookieStore = await cookies()
    const cookieCustomer = cookieStore.get('customer')?.value
    if (cookieCustomer) return cookieCustomer

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
/* 3. Helper per formattare UOM e peso                               */
/* ------------------------------------------------------------------ */
function formatUomDisplay(item: any): {
  uom: string
  weight_per_unit: string | null
  pack_size: string | null
  minimum_order_qty: number
  price_per_uom: string
} {
  // Mappa UOM standard ERPNext a display user-friendly
  const uomMapping: Record<string, string> = {
    'Kg': 'kg',
    'Kilogram': 'kg', 
    'kg': 'kg',
    'Liter': 'lt',
    'Litre': 'lt',
    'lt': 'lt',
    'L': 'lt',
    'Nos': 'Stk',
    'Piece': 'Stk',
    'Pcs': 'Stk',
    'Box': 'Karton',
    'Carton': 'Karton',
    'Pack': 'Pack',
    'Bottle': 'Flasche',
    'Can': 'Dose',
    'Jar': 'Glas'
  }

  const displayUom = uomMapping[item.stock_uom] || item.stock_uom || 'Stk'
  
  // Formattiamo il peso/contenuto per unità
  let weightDisplay = null
  if (item.weight_per_unit && item.weight_uom) {
    const weightUom = uomMapping[item.weight_uom] || item.weight_uom
    weightDisplay = `${item.weight_per_unit} ${weightUom}`
    
    // Aggiungi "ca." per pesi approssimativi (tipico per salumi, formaggi)
    if (item.item_group && (
      item.item_group.includes('Salumi') || 
      item.item_group.includes('Formaggi') ||
      item.item_group.includes('Carne') ||
      item.item_group.includes('Pesce')
    )) {
      weightDisplay += ' ca.'
    }
  }

  // Formattiamo le informazioni sulla confezione
  let packSize = null
  if (item.pack_size || item.items_per_pack) {
    if (item.items_per_pack && item.items_per_pack > 1) {
      packSize = `${item.items_per_pack} ${displayUom} pro Karton`
    } else if (item.pack_size) {
      packSize = item.pack_size
    }
  }

  // Determina il prezzo per UOM
  let pricePerUom = `€/${displayUom}`
  if (weightDisplay && item.stock_uom === 'Kg') {
    pricePerUom = '€/kg'
  } else if (item.stock_uom === 'Liter') {
    pricePerUom = '€/lt'
  }

  return {
    uom: displayUom,
    weight_per_unit: weightDisplay,
    pack_size: packSize,
    minimum_order_qty: item.min_order_qty || 1,
    price_per_uom: pricePerUom
  }
}
/* ------------------------------------------------------------------ */
/* 4. Funzione per generare slug da item_name                        */
/* ------------------------------------------------------------------ */
function generateSlugFromName(itemName: string): string {
  return itemName
    .toLowerCase()
    // Gestisci caratteri tedeschi
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe') 
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    // Rimuovi caratteri speciali e sostituisci con trattini
    .replace(/[^a-z0-9]+/g, '-')
    // Rimuovi trattini all'inizio e alla fine
    .replace(/^-+|-+$/g, '')
    // Limita la lunghezza
    .substring(0, 60);
}

/* ------------------------------------------------------------------ */
/* 4. Handler principale GET                                          */
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

  let email = ''
  const headerEmail = req.headers.get('x-user')
  const cookieStore = await cookies()
  const cookieEmail = cookieStore.get('user_email')?.value
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
  countURL.searchParams.set('limit_start', '0')
  countURL.searchParams.set('limit_page_length', '1000000')

  const totRes = await fetch(countURL.toString(), { headers })
  const totJson = await totRes.json()
  const total = Array.isArray(totJson.data) ? totJson.data.length : 0

  /* ----------------- 2. lista paginata con tutti i campi --------- */
  const listURL = new URL(`${process.env.ERP_URL}/api/resource/Item`)
  listURL.searchParams.set(
    'fields',
    JSON.stringify([
      'name',
      'item_name', 
      'item_group',
      'image',
      'description',
      'stock_uom',
      'item_url',
      'weight_per_unit',
      'weight_uom',
      'min_order_qty'
    ])
  )
  listURL.searchParams.set('limit_start', String(offset))
  listURL.searchParams.set('limit_page_length', String(limit))
  if (filters.length) listURL.searchParams.set('filters', JSON.stringify(filters))

  console.log('🔍 Query URL:', listURL.toString());

  let items = [];
  try {
    const listRes = await fetch(listURL.toString(), { headers })
    console.log('📡 Response status:', listRes.status);
    
    if (!listRes.ok) {
      const errorText = await listRes.text();
      console.error('❌ API Error Response:', errorText);
      
      // Fallback to basic fields
      console.log('🔄 Trying fallback query with basic fields...');
      const fallbackURL = new URL(`${process.env.ERP_URL}/api/resource/Item`)
      fallbackURL.searchParams.set('fields', JSON.stringify(['name', 'item_name', 'item_group', 'image', 'description', 'stock_uom']))
      fallbackURL.searchParams.set('limit_start', String(offset))
      fallbackURL.searchParams.set('limit_page_length', String(limit))
      if (filters.length) fallbackURL.searchParams.set('filters', JSON.stringify(filters))
      
      const fallbackRes = await fetch(fallbackURL.toString(), { headers })
      if (fallbackRes.ok) {
        const fallbackJson = await fallbackRes.json()
        items = Array.isArray(fallbackJson.data) ? fallbackJson.data : []
        console.log('🔄 Fallback query returned:', items.length, 'items');
      }
    } else {
      const listJson = await listRes.json()
      console.log('📦 Response data length:', listJson.data?.length || 0);
      if (listJson.data?.[0]) {
        console.log('📦 First item sample:', listJson.data[0]);
      }
      items = Array.isArray(listJson.data) ? listJson.data : []
    }
  } catch (error) {
    console.error('❌ Fetch error:', error);
    items = [];
  }

  /* ----------- 3. collego customer & prezzi -------------- */
  const customer = isLoggedIn ? await getLinkedCustomer(email, headers) : null
  const itemCodes = items.map(i => i.name)
  const priceMap = await fetchPrices(email, customer, itemCodes, headers)

  const enriched = items.map(item => {
    const prices = priceMap[item.name] || {}
    
    // Gestisci item_url con fallback
    let itemUrl = item.item_url;
    if (!itemUrl) {
      itemUrl = generateSlugFromName(item.item_name);
      console.log(`⚠️  item_url mancante per ${item.name}, generato: ${itemUrl}`);
    }
    
    // UOM con i dati disponibili
    const displayUom = item.stock_uom || 'Stk'
    const pricePerUom = `€/${displayUom}`
    
    // Weight display
    let weightDisplay = null
    if (item.weight_per_unit && item.weight_uom) {
      weightDisplay = `${item.weight_per_unit} ${item.weight_uom}`
    }
    
    return {
      ...item,
      item_url: itemUrl,
      price: prices.standard || null,
      personalizedPrice: prices.personalized || null,
      showPersonalizedPrice: !!(customer && prices.personalized !== null),
      displayPrice:
        customer && prices.personalized !== null
          ? prices.personalized
          : prices.standard || null,
      
      // UOM info
      uom: displayUom,
      price_per_uom: pricePerUom,
      weight_per_unit: weightDisplay,
      pack_size: null, // Per ora null, aggiungeremo dopo
      minimum_order_qty: item.min_order_qty || 1
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
