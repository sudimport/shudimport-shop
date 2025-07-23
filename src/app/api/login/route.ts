import { NextResponse } from 'next/server'

/**
 * POST /api/login
 * Body JSON: { usr, pwd }
 * Autentica su ERPNext, propaga cookie 'sid' (http-only) e 'user'.
 */
export async function POST(req: Request) {
  const { usr, pwd } = await req.json()

  try {
    // 1️⃣ Chiamata a ERPNext
    const erp = await fetch(`${process.env.ERP_URL}/api/method/login`, {
      method: 'POST',
      body: new URLSearchParams({ usr, pwd }),
      credentials: 'include'
    })

    const data = await erp.json()
    if (!erp.ok && data?.message !== 'No App') {
      return NextResponse.json(
        { message: data.message || 'Login fehlgeschlagen.' },
        { status: 401 }
      )
    }

    const res = NextResponse.json({ message: 'Login erfolgreich' })

    // 2️⃣ Copia cookie 'sid'
    const setCookie = erp.headers.get('set-cookie')      // singolare
    if (setCookie?.includes('sid=')) {
      const sid = setCookie.split(';')[0].split('=')[1]
      res.cookies.set('sid', sid, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
      })
    }

    // 3️⃣ Cookie custom con email
    res.cookies.set('user', usr, {
      httpOnly: false,
      path: '/',
      sameSite: 'lax'
    })

    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ message: 'Serverfehler beim Login.' }, { status: 500 })
  }
}
