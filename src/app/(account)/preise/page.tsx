'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Item {
  name: string;
  item_name: string;
  item_group: string;
  image?: string;
  price: number;
  public_price?: number;
  is_discounted: boolean;
}

export default function PreisePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/preise', {
      headers: { 'x-user': localStorage.getItem('username') ?? '' },
    })
      .then(r => r.json())
      .then(j => {
        // Ordina alfabeticamente per nome articolo
        const sortedItems = (j.items ?? []).sort((a: Item, b: Item) => 
          a.item_name.localeCompare(b.item_name, 'de', { numeric: true })
        );
        setItems(sortedItems);
      })
      .finally(() => setLoading(false));
  }, []);

  // Funzione per costruire l'URL completo dell'immagine
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Se inizia con /files/, costruisce l'URL completo verso ERPNext
    const erpUrl = process.env.NEXT_PUBLIC_ERP_URL || '';
    return `${erpUrl}${imagePath}`;
  };

  const calculateDiscount = (price: number, publicPrice?: number) => {
    if (!publicPrice || publicPrice <= 0) return 0;
    return Math.round(((publicPrice - price) / publicPrice) * 100);
  };

  const totalSavings = items.reduce((sum, item) => {
    if (item.is_discounted && item.public_price) {
      return sum + (item.public_price - item.price);
    }
    return sum;
  }, 0);

  const avgDiscount = items.length > 0 
    ? Math.round(items.reduce((sum, item) => 
        sum + calculateDiscount(item.price, item.public_price), 0) / items.length)
    : 0;

  const maxDiscount = items.length > 0 
    ? Math.max(...items.map(item => calculateDiscount(item.price, item.public_price)))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Clean Corporate Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Personalisierte Preisliste
                </h1>
                <p className="text-gray-600 text-sm">
                  Ihre kundenspezifischen Konditionen und Rabatte
                </p>
              </div>
              {avgDiscount > 0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Bei 1.000 € Einkauf sparen Sie</div>
                  <div className="text-2xl font-semibold text-green-700">
                    {(1000 * avgDiscount / 100).toFixed(0)} €
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Simple Stats Row */}
          <div className="px-8 py-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-lg font-semibold text-gray-900">{items.length}</div>
                <div className="text-sm text-gray-500">Artikel mit Sonderkonditionen</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{avgDiscount}%</div>
                <div className="text-sm text-gray-500">Durchschnittlicher Rabatt</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{maxDiscount}%</div>
                <div className="text-sm text-gray-500">Maximaler Rabatt</div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Table */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-gray-600">Preise werden geladen...</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine personalisierten Preise verfügbar
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Kontaktieren Sie Ihren Ansprechpartner für kundenspezifische Konditionen.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artikel
                    </th>
                    <th className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artikelcode
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ihr Preis
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Listenpreis
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rabatt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => {
                    const discount = calculateDiscount(item.price, item.public_price);
                    const savings = (item.public_price || 0) - item.price;
                    
                    return (
                      <tr key={`${item.name}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {item.item_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.item_group}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 text-center">
                          <div className="inline-block bg-gray-100 px-3 py-2 rounded-md border border-gray-200">
                            <span className="text-xs font-mono text-gray-700 font-medium">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          <div className="space-y-1">
                            <div className="text-lg font-semibold text-gray-900">
                              {item.price.toFixed(2)} €
                            </div>
                            {savings > 0 && (
                              <div className="text-xs text-green-600">
                                Ersparnis: {savings.toFixed(2)} €
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-right">
                          {item.public_price ? (
                            <div className={`text-sm ${discount > 0 ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
                              {item.public_price.toFixed(2)} €
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                          {discount > 0 ? (
                            <div className="inline-flex items-center">
                              <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded border border-red-200">
                                -{discount}%
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Professional Footer */}
        {items.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">i</span>
                </div>
              </div>
              <div className="text-sm text-blue-800">
                <strong>Hinweis:</strong> Die angezeigten Preise sind kundenspezifisch und gelten gemäß Ihrem Rahmenvertrag. 
                Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer. 
                Preisänderungen vorbehalten.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
