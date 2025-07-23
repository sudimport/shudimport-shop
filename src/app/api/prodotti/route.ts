// src/app/api/prodotti/route.ts

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

type LinkEntry = {
  link_doctype: string
  link_name: string
}

type ContactDetail = {
  links?: LinkEntry[]
}

async function getCustomer(email: string, headers: Record<string, string>) {
  const base = process.env.ERP_URL!
  console.log('🔍 getCustomer: looking for customer linked to email', email)
  
  // Verifica che sia un'email valida
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    console.log('❌ Email non valida:', email)
    return null
  }
  
  try {
    const filterUrl = `${base}/api/resource/Contact Email?filters=${encodeURIComponent(
      JSON.stringify([["email_id", "=", email]])
    )}`
    console.log('🔍 Cercando Contact Email con URL:', filterUrl)
    
    const emailRes = await fetch(filterUrl, { headers })
    console.log('📡 Response status Contact Email:', emailRes.status)
    
    if (!emailRes.ok) {
      console.log('❌ Errore nella chiamata Contact Email:', emailRes.statusText)
      return null
    }
    
    const emailJson = await emailRes.json()
    console.log('📧 Contact Email response:', JSON.stringify(emailJson, null, 2))
    
    const contacts: string[] = emailJson.data?.map((e: { parent: string }) => e.parent) || []
    console.log('👥 Contatti trovati:', contacts)

    if (contacts.length === 0) {
      console.log('❌ Nessun contatto trovato per email:', email)
      return null
    }

    for (const contactName of contacts) {
      console.log('🔍 Esaminando contatto:', contactName)
      const detRes = await fetch(
        `${base}/api/resource/Contact/${encodeURIComponent(contactName)}?fields=["links"]`,
        { headers }
      )
      console.log('📡 Response status Contact details:', detRes.status)
      
      if (!detRes.ok) {
        console.log('❌ Errore nel recupero dettagli contatto:', contactName)
        continue
      }
      
      const detJson = await detRes.json()
      console.log('🔗 Links del contatto:', JSON.stringify(detJson.data?.links, null, 2))
      
      const detail: ContactDetail = detJson.data
      const customerLink = detail.links?.find(l => l.link_doctype === 'Customer')
      if (customerLink) {
        console.log('✅ Customer trovato:', customerLink.link_name)
        return customerLink.link_name
      }
    }

    console.log('❌ Nessun customer trovato nei link dei contatti')
    return null
  } catch (err) {
    console.error('❌ ERRORE getCustomer:', err)
    return null
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const categoria = url.searchParams.get('categoria') || undefined
  const searchTerm = url.searchParams.get('search')?.trim() || undefined
  const page = parseInt(url.searchParams.get('page') ?? '1', 10)
  const limit = parseInt(url.searchParams.get('limit') ?? '20', 10)
  const offset = (page - 1) * limit

  console.log('🟢 API CALL: /api/prodotti')
  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json'
  }

  // Ottieni email da multiple fonti con priorità
  let email = '';
  
  // 1. Prima controlla header x-user
  const headerEmail = req.headers.get('x-user');
  if (headerEmail && headerEmail.includes('@')) {
    email = headerEmail;
    console.log('📧 Email da header x-user:', email);
  } else {
    // 2. Poi controlla cookie user_email
    const cookieEmail = cookies().get('user_email')?.value;
    if (cookieEmail && cookieEmail.includes('@')) {
      email = cookieEmail;
      console.log('📧 Email da cookie user_email:', email);
    } else {
      // 3. Fallback: controlla se c'è un cookie sid e prova a ricavare l'utente
      const sidCookie = cookies().get('sid')?.value;
      if (sidCookie) {
        console.log('🍪 Cookie sid presente, ma email mancante');
        // Potresti fare una chiamata a ERPNext per ottenere l'utente corrente
        // Ma per ora lasciamo vuoto
      }
    }
  }
  
  const isLoggedIn = Boolean(email && email.includes('@'))
  console.log('🔐 User Email:', email)
  console.log('📧 Email source:', headerEmail ? 'header' : cookieEmail ? 'cookie' : 'none')
  console.log('🔑 Is logged in:', isLoggedIn)

  try {
    const filters: [string, string, string][] = []
    if (categoria) filters.push(['item_group', '=', categoria])
    if (searchTerm) filters.push(['item_name', 'like', `%${searchTerm}%`])

    const countURL = new URL(`${process.env.ERP_URL}/api/resource/Item`)
    countURL.searchParams.set('fields', JSON.stringify(['name']))
    countURL.searchParams.set('limit_start', '0')
    countURL.searchParams.set('limit_page_length', '999999')
    if (filters.length > 0) countURL.searchParams.set('filters', JSON.stringify(filters))

    const totalRes = await fetch(countURL.toString(), { headers })
    const totalJson = await totalRes.json()
    const total = Array.isArray(totalJson.data) ? totalJson.data.length : 0
    console.log('📊 Total prodotti trovati:', total)

    const listURL = new URL(`${process.env.ERP_URL}/api/resource/Item`)
    listURL.searchParams.set(
      'fields',
      JSON.stringify(['name', 'item_name', 'item_group', 'image', 'description'])
    )
    listURL.searchParams.set('limit_start', String(offset))
    listURL.searchParams.set('limit_page_length', String(limit))
    if (filters.length > 0) listURL.searchParams.set('filters', JSON.stringify(filters))

    const listRes = await fetch(listURL.toString(), { headers })
    const listJson = await listRes.json()
    const items = Array.isArray(listJson.data) ? listJson.data : []

    const customer = isLoggedIn ? await getCustomer(email, headers) : null
    console.log('👤 Cliente associato:', customer)

    // Placeholder per i prezzi - dovrai implementare fetchPrices se necessario
    const priceMap = {}

    const enriched = items.map(item => {
      const prices = priceMap[item.name] || {}
      return {
        ...item,
        price: prices.standard || null,
        personalizedPrice: prices.personalized || null,
        showPersonalizedPrice:
          customer && prices.personalized !== null && prices.personalized !== prices.standard,
        displayPrice:
          customer && prices.personalized !== null && prices.personalized !== prices.standard
            ? prices.personalized
            : prices.standard || null
      }
    })

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
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'Internal server error'
    console.error('❌ ERRORE nella API /api/prodotti:', error)
    return NextResponse.json({ error, items: [], total: 0 }, { status: 500 })
  }
}
