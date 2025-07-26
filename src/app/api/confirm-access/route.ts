// src/app/api/confirm-access/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email non valida', message: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      )
    }

    const headers = {
      Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
      'Content-Type': 'application/json'
    }

    console.log('🔍 Confermando accesso per:', email)

    // 1. Cerca se esiste già un Customer con questa email
    const customerSearchRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Customer?filters=[["email_id","=","${email}"]]&fields=["name","customer_name"]`,
      { headers }
    )

    if (!customerSearchRes.ok) {
      return NextResponse.json(
        { error: 'Errore nella ricerca cliente', message: 'Fehler bei der Kundensuche' },
        { status: 500 }
      )
    }

    const customerData = await customerSearchRes.json()
    let linkedCustomer = null

    if (customerData.data && customerData.data.length > 0) {
      // Cliente trovato
      linkedCustomer = customerData.data[0].name
      console.log('🏢 Cliente trovato:', linkedCustomer)

      // 2. Aggiorna il campo linked_customer nell'User
      const updateUserRes = await fetch(
        `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(email)}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            linked_customer: linkedCustomer
          })
        }
      )

      if (!updateUserRes.ok) {
        console.log('⚠️ Errore nell\'aggiornamento dell\'utente')
        return NextResponse.json(
          { error: 'Errore nell\'aggiornamento', message: 'Fehler beim Aktualisieren des Benutzers' },
          { status: 500 }
        )
      }

      // 3. Imposta il cookie customer
      cookies().set('customer', linkedCustomer, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 giorni
        path: '/'
      })

      console.log('✅ Cliente collegato con successo:', linkedCustomer)

      return NextResponse.json({
        success: true,
        linkedCustomer,
        message: 'Kunde erfolgreich verknüpft'
      })

    } else {
      // Nessun cliente trovato con questa email
      console.log('❌ Nessun cliente trovato per email:', email)
      
      return NextResponse.json(
        { 
          error: 'Cliente non trovato', 
          message: 'Kein Kunde mit dieser E-Mail-Adresse gefunden. Bitte kontaktieren Sie den Support.' 
        },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('❌ Errore nella conferma accesso:', error)
    return NextResponse.json(
      { 
        error: 'Errore interno del server', 
        message: 'Interner Serverfehler. Bitte versuchen Sie es später erneut.' 
      },
      { status: 500 }
    )
  }
}
