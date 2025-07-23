'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Prodotto = {
  name: string
  item_name: string
  image: string | null
}

export default function Offerte() {
  const [items, setItems] = useState<Prodotto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/prodotti?page=1&limit=8')
      .then(r => r.json())
      .then(data => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-center py-8">Caricamento offerte…</p>
  if (items.length === 0) return <p className="text-center py-8">Nessuna offerta disponibile.</p>

  return (
    <section className="mb-16">
      <h2 className="text-4xl font-bold text-center mb-8">Unsere Produkte</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item, idx) => (
          <Link
            key={item.name + '_' + idx}
            href="/shop?page=1"
            className="flex flex-col border p-4 rounded shadow h-full hover:shadow-lg transition"
          >
            <div className="flex items-center justify-center h-48 overflow-hidden mb-4">
              {item.image ? (
                <Image
                  src={`https://gestionale.sudimport.website${item.image}`}
                  alt={item.name}
                  width={200}
                  height={200}
                  unoptimized
                  className="object-contain max-h-full"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 text-center mb-1 truncate">{item.name}</p>
            <h3 className="text-base font-semibold text-center flex-1 mb-4">{item.item_name}</h3>
            <p className="text-green-600 text-center mb-4">Preis auf Anfrage</p>
            <button className="mt-auto bg-green-600 text-white px-4 py-2 rounded">In den Warenkorb</button>
          </Link>
        ))}
      </div>
    </section>
  )
}
