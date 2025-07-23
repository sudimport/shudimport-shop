'use client';

import UserLayout from '../user/UserLayout';

export default function BestellungenPage() {
  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">📦 Bestellungen</h1>
      <p className="text-sm text-gray-700">Hier sehen Sie Ihre bisherigen Bestellungen.</p>
      <div className="mt-4 text-sm text-gray-500 italic">Noch keine Bestellungen vorhanden.</div>
    </UserLayout>
  );
}
