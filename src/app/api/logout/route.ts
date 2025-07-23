import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // logout ERPNext
    await fetch(`${process.env.ERP_URL}/api/method/logout`, {
      method: 'GET',
      credentials: 'include'
    })

    // prepara risposta
    const res = NextResponse.json({ success: true })

    // cancella cookie locali
    const jar = cookies()
    jar.delete('sid',  { path: '/' })
    jar.delete('user', { path: '/' })

    return res
  } catch (err) {
    console.error('Logout error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
