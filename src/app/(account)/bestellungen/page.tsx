'use client';

import { useEffect, useState } from 'react';

type Order = {
  name: string;
  date: string;
  total: number;
  status: string;
  pdf_url: string;
};

export default function BestellungenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('username');
    if (!email) return;

    fetch('/api/bestellungen', { headers: { 'x-user': email } })
      .then(r => r.json())
      .then(j => setOrders(j.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="flex-1 p-6 space-y-4">
      <h1 className="text-2xl font-bold">📦 Bestellungen</h1>
      <p className="text-sm text-gray-700">Hier sehen Sie Ihre letzten Bestellungen.</p>

      {loading ? (
        <p className="italic text-gray-500">Lade…</p>
      ) : orders.length === 0 ? (
        <p className="italic text-gray-500">Keine Bestellungen gefunden.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-white sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Nr</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Datum</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">Gesamt</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">PDF</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {orders.map((o, i) => (
                <tr key={o.name} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="px-4 py-3">{o.name}</td>
                  <td className="px-4 py-3">{o.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        o.status === 'Delivered'
                          ? 'bg-green-100 text-green-700'
                          : o.status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {o.status === 'To Bill'
                        ? 'In Bearbeitung'
                        : o.status === 'To Deliver'
                        ? 'Versand ausstehend'
                        : o.status === 'Delivered'
                        ? 'Geliefert'
                        : o.status === 'Cancelled'
                        ? 'Storniert'
                        : o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{o.total.toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <a
                      href={o.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM14 3.5V9h4.5L14 3.5z" />
                      </svg>
                      PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
