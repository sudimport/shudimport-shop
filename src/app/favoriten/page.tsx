'use client';

import UserLayout from '../user/UserLayout';

export default function FavoritenPage() {
  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">❤️ Wunschliste</h1>
      <p className="text-sm text-gray-700">Hier sehen Sie Ihre gespeicherten Lieblingsprodukte.</p>
      <div className="mt-4 text-sm text-gray-500 italic">Noch keine Favoriten gespeichert.</div>
    </UserLayout>
  );
}
