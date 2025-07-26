'use client';

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import Link from 'next/link';

type UserData = {
  email: string;
  name: string;
  phone: string;
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
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
      {/* Sidebar sinistra aggiornata */}
      <aside className="w-full md:w-64 bg-gray-100 p-4 space-y-3 border-r border-gray-200">
        <ul className="space-y-2 text-sm text-gray-700">
          <li><Link href="/favoriten" className="hover:underline">❤️ Wunschliste</Link></li>
          <li><Link href="/einkaufsliste" className="hover:underline">🧾 Einkaufsliste</Link></li>
        </ul>

        <h2 className="text-lg font-semibold text-green-700 mt-4 mb-2">Profil</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li><Link href="/password" className="hover:underline">🔑 Passwort ändern</Link></li>
          <li><Link href="/bestellungen" className="hover:underline">📦 Bestellungen</Link></li>
          <li><Link href="/dokumente" className="hover:underline">📄 Dokumente</Link></li>
          <li><Link href="/anomalien" className="hover:underline">⚠️ Anomalien</Link></li>
          <li><Link href="/adresse" className="hover:underline">🏠 Adresse</Link></li>
          <li><Link href="/zugang" className="hover:underline">✅ Zugang bestätigen</Link></li>
        </ul>
      </aside>

      {/* Contenuto dinamico */}
      <main className="flex-1 p-6">{children}</main>

      <Toaster position="top-right" />
    </div>
  );
}
