'use client';

import UserLayout from '../user/UserLayout';

export default function DokumentePage() {
  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">📄 Dokumente</h1>
      <p className="text-sm text-gray-700">Hier finden Sie Ihre Rechnungen, Angebote und andere PDF-Dokumente.</p>
      <div className="mt-4 text-sm text-gray-500 italic">Keine Dokumente verfügbar.</div>
    </UserLayout>
  );
}
