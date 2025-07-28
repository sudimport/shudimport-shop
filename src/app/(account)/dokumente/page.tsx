'use client';

import { useEffect, useState } from 'react';

type Doc = {
  name: string;
  date: string;
  due_date: string;
  total: number;
  open: number;
  status: string;
  pdf_url: string;
  is_overdue: boolean;
};

type Order = {
  name: string;
  date: string;
  total: number;
  status: string;
  pdf_url: string;
};

export default function DokumentePage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('username');
    if (!email) return;

    Promise.all([
      fetch('/api/dokumente', { headers: { 'x-user': email } }).then(r => r.json()),
      fetch('/api/bestellungen', { headers: { 'x-user': email } }).then(r => r.json())
    ])
      .then(([dRes, oRes]) => {
        setDocs(dRes.docs || []);
        setOrders(oRes.orders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calcola statistiche per i documenti
  const overdueCount = docs.filter(d => d.is_overdue).length;
  const totalOpen = docs.reduce((sum, d) => sum + d.open, 0);
  const paidCount = docs.filter(d => d.status === 'Paid').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header Documenti */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  📄 Rechnungen & Gutschriften
                </h1>
                <p className="text-gray-600 text-sm">
                  Übersicht Ihrer Dokumente und Zahlungsstatus
                </p>
              </div>
              {totalOpen > 0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Offener Betrag</div>
                  <div className={`text-2xl font-semibold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {totalOpen.toFixed(2)} €
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row für Dokumente */}
          <div className="px-8 py-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">{docs.length}</div>
                <div className="text-sm text-gray-500">Dokumente gesamt</div>
              </div>
              <div>
                <div className={`text-lg font-semibold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {overdueCount}
                </div>
                <div className="text-sm text-gray-500">Überfällige Rechnungen</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">{paidCount}</div>
                <div className="text-sm text-gray-500">Bezahlte Dokumente</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabelle Dokumente */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-gray-600">Dokumente werden geladen...</span>
              </div>
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-4xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Dokumente verfügbar
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Hier werden Ihre Rechnungen und Gutschriften angezeigt, sobald diese verfügbar sind.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dokumentnummer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fälligkeitsdatum
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Offener Betrag
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Download
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {docs.map((d, i) => (
                    <tr key={d.name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div className="inline-block bg-gray-100 px-3 py-2 rounded-md border border-gray-200">
                          <span className="text-xs font-mono text-gray-700 font-medium">
                            {d.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{d.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm ${d.is_overdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {d.due_date}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            d.is_overdue
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : d.status === 'Paid'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}
                        >
                          {d.is_overdue
                            ? '⚠️ Überfällig'
                            : d.status === 'Paid'
                            ? '✅ Bezahlt'
                            : d.status === 'Unpaid'
                            ? '⏳ Offen'
                            : d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`text-sm font-semibold ${d.is_overdue ? 'text-red-600' : 'text-gray-900'}`}>
                          {d.open.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a
                          href={d.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
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
        </div>

        {/* Header Bestellungen */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  📦 Bestellungen
                </h2>
                <p className="text-gray-600 text-sm">
                  Übersicht Ihrer letzten Bestellungen und Lieferstatus
                </p>
              </div>
            </div>
          </div>

          {/* Stats Row für Bestellungen */}
          <div className="px-8 py-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">{orders.length}</div>
                <div className="text-sm text-gray-500">Bestellungen gesamt</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {orders.filter(o => o.status === 'Delivered').length}
                </div>
                <div className="text-sm text-gray-500">Geliefert</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  {orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)} €
                </div>
                <div className="text-sm text-gray-500">Gesamtwert</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabelle Bestellungen */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-gray-600">Bestellungen werden geladen...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Bestellungen verfügbar
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Hier werden Ihre Bestellungen angezeigt, sobald diese verfügbar sind.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bestellnummer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bestelldatum
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gesamtbetrag
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Download
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((o, i) => (
                    <tr key={o.name} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4">
                        <div className="inline-block bg-gray-100 px-3 py-2 rounded-md border border-gray-200">
                          <span className="text-xs font-mono text-gray-700 font-medium">
                            {o.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{o.date}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            o.status === 'Delivered'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : o.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}
                        >
                          {o.status === 'To Bill'
                            ? '🔄 In Bearbeitung'
                            : o.status === 'To Deliver'
                            ? '📦 Versand ausstehend'
                            : o.status === 'Delivered'
                            ? '✅ Geliefert'
                            : o.status === 'Cancelled'
                            ? '❌ Storniert'
                            : o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {o.total.toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a
                          href={o.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
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
        </div>
      </div>
    </div>
  );
}
