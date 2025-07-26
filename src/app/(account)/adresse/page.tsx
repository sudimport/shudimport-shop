'use client';

import UserLayout from '../user/UserLayout';

export default function AdressePage() {
  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">🏠 Adresse</h1>
      <p className="text-sm text-gray-700 mb-2">Ihre hinterlegte Liefer- und Rechnungsadresse.</p>
      <div className="text-sm text-gray-800 space-y-1">
        <p><strong>Name:</strong> Max Mustermann</p>
        <p><strong>Adresse:</strong> Musterstraße 12, 12345 Hamburg</p>
        <p><strong>Telefon:</strong> +49 176 12345678</p>
      </div>
      <button className="mt-2 text-green-700 hover:underline text-sm">✏️ Bearbeiten</button>
    </UserLayout>
  );
}
