// src/app/api/user-details/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const email = url.searchParams.get('email')

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      { error: 'Email non valida' },
      { status: 400 }
    )
  }

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json'
  }

  try {
    console.log('🔍 Recuperando dettagli per utente:', email)

    // Cerca su ERPNext tramite linked_customer in User
    const userRes = await fetch(
      `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(email)}?fields=["linked_customer","full_name","phone"]`,
      { headers }
    )

    if (!userRes.ok) {
      console.log('⚠️ Impossibile recuperare dettagli utente')
      return NextResponse.json({ linkedCustomer: null })
    }

    const userData = await userRes.json()
    const linkedCustomer = userData.data?.linked_customer || null
    const fullName = userData.data?.full_name || email.split('@')[0]
    const phone = userData.data?.phone || '+49 152 08155756'

    console.log('🏢 Cliente collegato dal campo linked_customer:', linkedCustomer)

    return NextResponse.json({
      linkedCustomer,
      fullName,
      phone,
      email
    })

  } catch (error) {
    console.error('❌ Errore nel recupero dettagli utente:', error)
    return NextResponse.json(
      { error: 'Errore interno del server', linkedCustomer: null },
      { status: 500 }
    )
  }
}
