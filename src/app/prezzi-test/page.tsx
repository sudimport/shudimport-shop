'use client';

import { useEffect, useState } from 'react';

export default function PrezziTestPage() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <main className="p-6">
      {loading ? (
        <div className="text-gray-500">⏳ Caricamento...</div>
      ) : !user ? (
        <div className="text-red-600 text-lg">❌ Utente non loggato</div>
      ) : (
        <div className="text-green-700 text-lg">
          ✅ Utente loggato: <strong>{user}</strong>
        </div>
      )}
    </main>
  );
}
