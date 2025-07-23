'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Prodotto = {
  name: string;
  item_name: string;
  image: string | null;
};

export default function AngebotDesMonats() {
  const [items, setItems] = useState<Prodotto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/prodotti-offerta')
      .then((res) => res.json())
      .then((data) => setItems(data.items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-4xl font-bold text-center mb-8">Angebot des Monats</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <Link
            key={item.name + '_' + idx}
            href="/shop?page=1"
            className="relative block border rounded p-4 hover:shadow-lg flex flex-col justify-between text-center"
          >
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              IN ANGEBOT!
            </span>
            <div className="h-56 flex items-center justify-center overflow-hidden mb-4">
              {item.image ? (
                <Image
                  src={`https://gestionale.sudimport.website${item.image}`}
                  alt={item.item_name}
                  width={200}
                  height={200}
                  unoptimized
                  className="object-contain h-full w-auto"
                />
              ) : (
                <div className="w-36 h-36 bg-gray-100 flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <h3 className="text-base font-semibold mb-2">{item.item_name}</h3>
            <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
              In den Warenkorb
            </button>
          </Link>
        ))}
      </div>
    </section>
  );
}
