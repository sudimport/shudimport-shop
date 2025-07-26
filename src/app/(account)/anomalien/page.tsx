'use client';

import UserLayout from '';

export default function AnomalienPage() {
  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">⚠️ Anomalien</h1>
      <p className="text-sm text-gray-700">Unstimmigkeiten oder Probleme mit Ihren Bestellungen werden hier angezeigt.</p>
      <div className="mt-4 text-sm text-gray-500 italic">Keine Anomalien gefunden.</div>
    </UserLayout>
  );
}
