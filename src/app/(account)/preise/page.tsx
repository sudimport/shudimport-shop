'use client';

import { useEffect, useState } from 'react';
import UserLayout from '';

interface Item {
  name: string;
  item_name: string;
  item_group: string;
  image: string;
  description: string;
  price: number;
  public_price: number;
  is_discounted: boolean;
}

export default function PreisePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/preise', {
      headers: {
        'x-user': localStorage.getItem('username') || ''
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.items) setItems(data.items);
        setLoading(false);
      });
  }, []);

  return (
    <UserLayout>
      <h1 className="text-xl font-semibold mb-4">📇 Meine Preise</h1>
      <p className="text-sm text-gray-700 mb-4">
        Unten finden Sie Ihre individuellen Preise pro Artikel. Produkte mit reduziertem Preis sind rot markiert.
      </p>

      {loading ? (
        <div className="text-sm italic text-gray-500">Lade persönliche Preise...</div>
      ) : items.length === 0 ? (
        <div className="text-sm italic text-gray-500">Keine Preise gefunden.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Bild</th>
                <th className="p-2 border">Artikel</th>
                <th className="p-2 border">Ihr Preis</th>
                <th className="p-2 border">Listenpreis</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name} className="border-t">
                  <td className="p-2 border">
                    {item.image ? (
                      <img src={item.image} alt={item.item_name} className="h-12 w-12 object-contain" />
                    ) : (
                      <span className="text-gray-400 italic">Kein Bild</span>
                    )}
                  </td>
                  <td className="p-2 border">
                    <div className="font-medium">{item.item_name}</div>
                    <div className="text-xs text-gray-500">{item.item_group}</div>
                  </td>
                  <td className={`p-2 border font-semibold ${item.is_discounted ? 'text-red-600' : 'text-green-600'}`}>
                    {item.price?.toFixed(2)} €
                  </td>
                  <td className="p-2 border text-gray-500">
                    {item.public_price ? `${item.public_price.toFixed(2)} €` : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </UserLayout>
  );
}
