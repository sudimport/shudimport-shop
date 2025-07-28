'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { FaHeart, FaTrash } from 'react-icons/fa';

interface Wish { id: string; image?: string; name: string; price?: number; }

export default function WunschlistePage() {
  const [items, setItems] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      if (saved) setItems(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Artikel entfernt');
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-green-600 rounded-full" />
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <header className="flex items-center gap-2 mb-6">
        <FaHeart className="text-red-500 text-2xl" />
        <h1 className="text-2xl font-bold">Meine Wunschliste</h1>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <FaHeart className="text-gray-300 text-6xl mx-auto" />
          <p className="text-gray-600">Ihre Wunschliste ist leer</p>
          <Link href="/shop" className="btn-primary">Zum Shop</Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(i => (
            <article key={i.id} className="card">
              {i.image && (
                <img src={i.image} alt={i.name} className="w-full h-48 object-cover rounded mb-3" />
              )}
              <h3 className="font-semibold mb-1">{i.name}</h3>
              {i.price && <p className="text-green-600 font-bold mb-3">€{i.price}</p>}

              <div className="flex gap-2">
                <Link href={`/product/${i.id}`} className="btn-secondary flex-1">Details</Link>
                <button onClick={() => remove(i.id)} className="btn-danger px-3">
                  <FaTrash />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Toaster position="top-right" />
    </main>
  );
}
