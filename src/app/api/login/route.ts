// src/app/api/login/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { usr, pwd } = await req.json()

  try {
    // 1️⃣ Login a ERPNext
    const erpRes = await fetch(`${process.env.ERP_URL}/api/method/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ usr, pwd }),
      credentials: 'include'
    })

    if (!erpRes.ok) {
      const errorData = await erpRes.json()
      return NextResponse.json(
        { message: errorData.message || 'Login fehlgeschlagen.' },
        { status: 401 }
      )
    }

    const data = await erpRes.json()
    console.log('✅ ERPNext login response:', data)

    // 2️⃣ Estrai cookie 'sid' dalla risposta
    const setCookieHeaders = erpRes.headers.getSetCookie()
    console.log('🍪 Set-Cookie headers:', setCookieHeaders)
    
    let sid = null
    for (const cookieHeader of setCookieHeaders) {
      if (cookieHeader.startsWith('sid=')) {
        sid = cookieHeader.split(';')[0].split('=')[1]
        break
      }
    }

    if (!sid) {
      console.error('❌ Nessun cookie sid trovato nella risposta ERPNext')
      return NextResponse.json(
        { message: 'Errore nell\'autenticazione.' },
        { status: 500 }
      )
    }

    console.log('🔑 SID estratto:', sid)

    // 3️⃣ Verifica utente corrente su ERPNext
    const userRes = await fetch(`${process.env.ERP_URL}/api/method/frappe.auth.get_logged_user`, {
      headers: {
        'Cookie': `sid=${sid}`
      }
    })

    const userData = await userRes.json()
    const email = userData.message || usr
    console.log('👤 Utente loggato:', email)

    // 4️⃣ Cerca il cliente collegato tramite il campo linked_customer in User
    let customer = null
    try {
      const userDetailRes = await fetch(
        `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(email)}?fields=["linked_customer"]`,
        {
          headers: {
            'Authorization': `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (userDetailRes.ok) {
        const userDetail = await userDetailRes.json()
        customer = userDetail.data?.linked_customer || null
        console.log('🏢 Cliente collegato trovato:', customer)
      }
    } catch (error) {
      console.error('⚠️ Errore nel recupero del cliente collegato:', error)
    }

    // 5️⃣ Prepara risposta con cookie
    const response = NextResponse.json({
      message: 'Login erfolgreich',
      user: email,
      customer: customer
    })

    // Imposta cookie di sessione
    response.cookies.set('sid', sid, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    // Cookie per email utente (readable dal client)
    response.cookies.set('user_email', email, {
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    })

    // Cookie per customer (se presente)
    if (customer) {
      response.cookies.set('customer', customer, {
        httpOnly: false,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      })
    }

    return response

  } catch (error) {
    console.error('❌ Errore durante il login:', error)
    return NextResponse.json(
      { message: 'Serverfehler beim Login.' },
      { status: 500 }
    )
  }
}
