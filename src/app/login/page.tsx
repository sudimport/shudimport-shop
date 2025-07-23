'use client';
import { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';

type UserData = {
  email: string;
  name: string;
  phone: string;
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

  useEffect(() => {
    // Prima prova a leggere l'email dai cookie (metodo nuovo)
    const userEmail = getCookie('user_email');
    
    if (userEmail) {
      // Usa l'email dai cookie (metodo corretto)
      console.log('✅ Email trovata nei cookie:', userEmail);
      setUserData({
        email: userEmail,
        name: userEmail.split('@')[0], // Usa la parte prima della @ come nome
        phone: '+49 152 08155756',
      });
    } else {
      // Fallback: controlla localStorage per compatibilità con login precedenti
      const localUsername = localStorage.getItem('username');
      
      if (localUsername) {
        console.log('⚠️ Usando localStorage (deprecato):', localUsername);
        // Tuttavia, non creare email false - usa il localStorage solo se è già un'email
        const isEmail = localUsername.includes('@');
        
        if (isEmail) {
          setUserData({
            email: localUsername,
            name: localUsername.split('@')[0],
            phone: '+49 152 08155756',
          });
        } else {
          // Se non è un'email, forza il login
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('username'); // Pulisci localStorage obsoleto
          window.location.href = '/login';
        }
      } else {
        toast.error('Nicht eingeloggt.');
        window.location.href = '/login';
      }
    }
  }, []);

  if (!userData) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar sinistra */}
      <aside className="w-full md:w-64 bg-gray-100 p-4 space-y-3 border-r border-gray-200">
        <h2 className="text-lg font-semibold text-green-700 mb-2">Profil</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><Link href="/password" className="hover:underline">🔑 Passwort ändern</Link></li>
          <li><Link href="/bestellungen" className="hover:underline">📦 Bestellungen</Link></li>
          <li><Link href="/dokumente" className="hover:underline">📄 Dokumente</Link></li>
          <li><Link href="/anomalien" className="hover:underline">⚠️ Anomalien</Link></li>
          <li><Link href="/adresse" className="hover:underline">🏠 Adresse</Link></li>
          <li><Link href="/zugang" className="hover:underline">✅ Zugang bestätigen</Link></li>
        </ul>
      </aside>

      {/* Contenuto utente */}
      <main className="flex-1 p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-yellow-400 rounded-full p-4">
            <FaUser className="text-white text-3xl" />
          </div>
          <h1 className="text-xl font-semibold mt-3">{userData.name}</h1>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Account</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Name:</strong> {userData.name}</p>
              <p><strong>Telefon:</strong> {userData.phone}</p>
            </div>
            <button className="mt-2 text-green-700 hover:underline text-sm">✏️ Bearbeiten</button>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Newsletter</h2>
            <p className="text-sm text-gray-600 mb-2">Sie sind nicht für den Newsletter angemeldet.</p>
            <button className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700">
              Für den Newsletter anmelden
            </button>
          </section>
        </div>
      </main>

      {/* Notifiche toast */}
      <Toaster position="top-right" />
    </div>
  );
}
