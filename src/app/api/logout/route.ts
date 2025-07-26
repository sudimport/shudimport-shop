// src/app/api/logout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    console.log('🚪 Iniziando processo di logout...');
    
    // 1. Ottieni il cookie sid per il logout su ERPNext
    const cookieStore = cookies();
    const sid = cookieStore.get('sid')?.value;
    
    console.log('🍪 SID per logout:', sid ? 'presente' : 'non trovato');

    // 2. Logout su ERPNext se abbiamo una sessione valida
    if (sid) {
      try {
        const erpLogoutRes = await fetch(`${process.env.ERP_URL}/api/method/logout`, {
          method: 'GET',
          headers: {
            'Cookie': `sid=${sid}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        console.log('📡 ERPNext logout status:', erpLogoutRes.status);
        
        if (erpLogoutRes.ok) {
          const erpData = await erpLogoutRes.json();
          console.log('✅ ERPNext logout riuscito:', erpData);
        }
      } catch (erpError) {
        console.error('⚠️ Errore logout ERPNext:', erpError);
        // Non bloccare il logout locale anche se ERPNext fallisce
      }
    }

    // 3. Prepara risposta di logout
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logout erfolgreich' 
    });

    // 4. Cancella tutti i cookie di sessione
    const cookiesToDelete = ['sid', 'user_email', 'customer'];
    
    cookiesToDelete.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: cookieName === 'sid', // sid deve rimanere httpOnly
        expires: new Date(0), // Data nel passato per cancellare
        path: '/'
      });
      
      console.log(`🗑️ Cookie ${cookieName} cancellato`);
    });

    console.log('✅ Logout completato con successo');
    return response;

  } catch (error) {
    console.error('❌ Errore durante logout:', error);
    
    // Anche in caso di errore, tenta di cancellare i cookie
    const response = NextResponse.json({ 
      success: false, 
      message: 'Fehler beim Logout' 
    }, { status: 500 });

    // Cancella i cookie comunque
    ['sid', 'user_email', 'customer'].forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: cookieName === 'sid',
        expires: new Date(0),
        path: '/'
      });
    });

    return response;
  }
}
