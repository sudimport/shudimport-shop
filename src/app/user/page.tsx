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

export default function UserPage() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const localUsername = localStorage.getItem('username');

    if (!localUsername) {
      toast.error('Nicht eingeloggt.');
      window.location.href = '/login';
    } else {
      setUserData({
        email: `${localUsername}@example.com`,
        name: localUsername,
        phone: '+49 152 08155756',
      });
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
