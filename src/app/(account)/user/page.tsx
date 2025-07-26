// src/app/user/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { FaUser, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';

type UserData = {
  email: string;
  name: string;
  phone: string;
  customer?: string;
  linkedCustomer?: string; // Cliente collegato da ERP
};

// Funzione helper per leggere cookie dal client
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export default function UserPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmingAccess, setConfirmingAccess] = useState(false);

  // Funzione per recuperare i dettagli del cliente collegato
  const fetchLinkedCustomer = async (email: string) => {
    try {
      const response = await fetch(`/api/user-details?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        return data.linkedCustomer || null;
      }
    } catch (error) {
      console.error('❌ Errore nel recupero cliente collegato:', error);
    }
    return null;
  };

  // Funzione per confermare l'accesso (collega il cliente)
  const handleConfirmAccess = async () => {
    if (!userData?.email) return;

    setConfirmingAccess(true);
    try {
      const response = await fetch('/api/confirm-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email
        }),
      });

      const data = await response.json();

      if (response.ok && data.linkedCustomer) {
        toast.success('✅ Zugang bestätigt! Kunde erfolgreich verknüpft.');
        
        // Aggiorna i dati utente
        setUserData(prev => prev ? {
          ...prev,
          linkedCustomer: data.linkedCustomer,
          customer: data.linkedCustomer
        } : null);

        // Ricarica la pagina dopo 2 secondi per aggiornare tutto
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(data.message || 'Fehler beim Bestätigen des Zugangs.');
      }
    } catch (error) {
      console.error('❌ Errore nella conferma accesso:', error);
      toast.error('Netzwerkfehler beim Bestätigen.');
    } finally {
      setConfirmingAccess(false);
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // 1. Verifica cookie user_email
        const userEmail = getCookie('user_email');
        const customer = getCookie('customer');

        console.log('🍪 Cookie user_email:', userEmail);
        console.log('🍪 Cookie customer:', customer);

        if (userEmail && userEmail.includes('@')) {
          // Recupera il cliente collegato da ERP
          const linkedCustomer = await fetchLinkedCustomer(userEmail);
          
          // Utente loggato con email valida
          setUserData({
            email: userEmail,
            name: userEmail.split('@')[0],
            phone: '+49 152 08155756', // Placeholder
            customer: customer || undefined,
            linkedCustomer: linkedCustomer || undefined
          });
        } else {
          // Fallback: controlla localStorage (compatibilità)
          const localUsername = localStorage.getItem('username');

          if (localUsername && localUsername.includes('@')) {
            console.log('⚠️ Usando localStorage come fallback:', localUsername);
            const linkedCustomer = await fetchLinkedCustomer(localUsername);
            
            setUserData({
              email: localUsername,
              name: localUsername.split('@')[0],
              phone: '+49 152 08155756',
              linkedCustomer: linkedCustomer || undefined
            });
          } else {
            // Sessione scaduta o non valida
            toast.error('Session expired. Please login again.');
            localStorage.removeItem('username');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            return;
          }
        }
      } catch (error) {
        console.error('❌ Errore nel controllo sessione:', error);
        toast.error('Errore nel caricamento profilo.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Session nicht gültig. Weiterleitung...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar sinistra */}
      <aside className="w-full md:w-64 bg-gray-100 p-4 space-y-3 border-r border-gray-200">
        <h2 className="text-lg font-semibold text-green-700 mb-4">Profil</h2>
        
        <ul className="space-y-2 text-sm text-gray-700">
          <li><Link href="/password" className="hover:underline">🔑 Passwort ändern</Link></li>
          <li><Link href="/bestellungen" className="hover:underline">📦 Bestellungen</Link></li>
          <li><Link href="/dokumente" className="hover:underline">📄 Dokumente</Link></li>
          <li><Link href="/anomalien" className="hover:underline">⚠️ Anomalien</Link></li>
          <li><Link href="/adresse" className="hover:underline">🏠 Adresse</Link></li>
          <li><Link href="/zugang" className="hover:underline">✅ Zugang bestätigen</Link></li>
          
          {/* Nuove sezioni: Wunschliste e Einkaufliste */}
          <div className="border-t pt-3 mt-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Listen</h3>
            <li><Link href="/wunschliste" className="hover:underline flex items-center gap-1"><FaHeart className="text-red-500" /> Wunschliste</Link></li>
            <li><Link href="/einkaufliste" className="hover:underline flex items-center gap-1"><FaShoppingCart className="text-blue-500" /> Einkaufliste</Link></li>
          </div>
          
          {(userData.customer || userData.linkedCustomer) && (
            <div className="border-t pt-3 mt-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Kunde</h3>
              <li><Link href="/preise" className="hover:underline">💰 Meine Preise</Link></li>
            </div>
          )}
        </ul>
      </aside>

      {/* Contenuto utente */}
      <main className="flex-1 p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-yellow-400 rounded-full p-4">
            <FaUser className="text-white text-3xl" />
          </div>
          <h1 className="text-xl font-semibold mt-3">{userData.name}</h1>
          {(userData.customer || userData.linkedCustomer) && (
            <p className="text-sm text-gray-600">
              Kunde: {userData.linkedCustomer || userData.customer}
            </p>
          )}
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Account</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Telefon:</strong> {userData.phone}</p>
              
              {/* Gestione cliente collegato */}
              {userData.linkedCustomer ? (
                <p><strong>Kundennummer:</strong> <span className="text-green-600 font-medium">{userData.linkedCustomer}</span></p>
              ) : (
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p className="text-yellow-800"><strong>Kundennummer:</strong> noch nicht verknüpft</p>
                  <button 
                    onClick={handleConfirmAccess}
                    disabled={confirmingAccess}
                    className="mt-2 bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {confirmingAccess ? (
                      <span className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Bestätige...
                      </span>
                    ) : (
                      '✅ Zugang bestätigen'
                    )}
                  </button>
                </div>
              )}
            </div>
            <button className="mt-2 text-green-700 hover:underline text-sm">✏️ Bearbeiten</button>
          </section>

          {/* Sezione Liste */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Meine Listen</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/wunschliste" className="bg-red-50 border border-red-200 p-3 rounded hover:bg-red-100 text-center">
                <FaHeart className="text-red-500 mx-auto mb-1 text-lg" />
                <p className="text-sm font-medium">Wunschliste</p>
                <p className="text-xs text-gray-600">Ihre Lieblings-artikel</p>
              </Link>
              
              <Link href="/einkaufliste" className="bg-blue-50 border border-blue-200 p-3 rounded hover:bg-blue-100 text-center">
                <FaShoppingCart className="text-blue-500 mx-auto mb-1 text-lg" />
                <p className="text-sm font-medium">Einkaufliste</p>
                <p className="text-xs text-gray-600">Für nächsten Einkauf</p>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Newsletter</h2>
            <p className="text-sm text-gray-600 mb-2">Sie sind nicht für den Newsletter angemeldet.</p>
            <button className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700">
              Für den Newsletter anmelden
            </button>
          </section>

          {(userData.customer || userData.linkedCustomer) && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Preise</h2>
              <p className="text-sm text-gray-600 mb-2">Als registrierter Kunde sehen Sie Ihre personalisierten Preise im Shop.</p>
              <Link href="/shop" className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 inline-block">
                Zum Shop
              </Link>
            </section>
          )}
        </div>
      </main>

      {/* Notifiche toast */}
      <Toaster position="top-right" />
    </div>
  );
}
