'use client';

import UserLayout from '../user/UserLayout';

export default function EinkaufslistePage() {
  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">🧾 Einkaufsliste</h1>
      <p className="text-sm text-gray-700">Ihre persönliche Einkaufsliste für regelmäßige Bestellungen.</p>
      <div className="mt-4 text-sm text-gray-500 italic">Die Liste ist momentan leer.</div>
    </UserLayout>
  );
}
