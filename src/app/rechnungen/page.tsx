'use client';

import UserLayout from '../user/UserLayout';

export default function RechnungenPage() {
  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">📄 Rechnungen</h1>
      <p className="text-sm text-gray-700">Hier sehen Sie Ihre offenen und bezahlten Rechnungen.</p>
      <div className="mt-4 text-sm text-gray-500 italic">Noch keine Rechnungen verfügbar.</div>
    </UserLayout>
  );
}
