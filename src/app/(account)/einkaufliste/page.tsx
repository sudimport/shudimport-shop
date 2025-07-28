// src/app/(account)/einkaufliste/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

/* ------------ tipi ------------ */
interface ListItem {
  id: string;
  name: string;
  image?: string;
  price?: number;
  quantity: number;
}
/* ------------------------------- */

export default function EinkauflistePage() {
  const [items, setItems]   = useState<ListItem[]>([]);
  const [loading, setLoad]  = useState(true);

  /* ---------- bootstrap ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('shoppingList');
      if (raw) setItems(JSON.parse(raw));
    } finally {
      setLoad(false);
    }
  }, []);
  /* -------------------------------- */

  /* ---------- helpers ---------- */
  const persist = (next: ListItem[]) => {
    setItems(next);
    localStorage.setItem('shoppingList', JSON.stringify(next));
  };

  const updateQty = (id: string, q: number) => {
    if (q <= 0) return remove(id);
    persist(items.map(i => (i.id === id ? { ...i, quantity: q } : i)));
  };

  const remove = (id: string) => {
    persist(items.filter(i => i.id !== id));
    toast.success('Artikel entfernt');
  };

  const addAllToCart = () => {
    /* TODO: integrare con il carrello reale */
    toast.success('Alle Artikel wurden zum Warenkorb hinzugefügt');
  };
  /* ------------------------------ */

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-green-600 rounded-full" />
      </main>
    );
  }

  return (
    <main className="flex-1 p-6">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaShoppingCart className="text-blue-500 text-2xl" />
          <h1 className="text-2xl font-bold">Meine Einkaufliste</h1>
        </div>
        {items.length > 0 && (
          <button onClick={addAllToCart} className="btn-primary">
            Alle in den Warenkorb
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <section className="text-center py-12 space-y-4">
          <FaShoppingCart className="text-gray-300 text-6xl mx-auto" />
          <p className="text-gray-500">Ihre Einkaufliste ist leer</p>
          <Link href="/shop" className="btn-primary">Zum Shop</Link>
        </section>
      ) : (
        <section className="space-y-4">
          {items.map(i => (
            <article key={i.id} className="card flex items-center gap-4">
              {i.image && (
                <img src={i.image} alt={i.name} className="w-16 h-16 object-cover rounded" />
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{i.name}</h3>
                {i.price && <p className="text-green-600 font-bold">€{i.price}</p>}
              </div>

              {/* quantità */}
              <div className="flex items-center gap-2">
                <div className="flex border rounded">
                  <button onClick={() => updateQty(i.id, i.quantity - 1)} className="p-2 hover:bg-gray-100">
                    <FaMinus />
                  </button>
                  <span className="px-3 py-1 border-x min-w-[40px] text-center">
                    {i.quantity}
                  </span>
                  <button onClick={() => updateQty(i.id, i.quantity + 1)} className="p-2 hover:bg-gray-100">
                    <FaPlus />
                  </button>
                </div>

                <button onClick={() => remove(i.id)} className="btn-danger px-3">
                  <FaTrash />
                </button>
              </div>
            </article>
          ))}

          {/* riepilogo */}
          <div className="bg-gray-50 rounded-lg p-4 flex justify-between mt-6">
            <span className="font-semibold">
              Totale Artikel: {items.length}
            </span>
            <span className="font-semibold">
              Gesamtmenge:{' '}
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
        </section>
      )}

      <Toaster position="top-right" />
    </main>
  );
}

/* ---------- mini utility CSS (Tailwind) ----------
.btn-primary  : bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700
.btn-danger   : bg-red-500   text-white py-2 rounded hover:bg-red-600
.btn-secondary: bg-gray-200  text-gray-700 px-4 py-2 rounded hover:bg-gray-300
.card         : bg-white border border-gray-200 p-4 rounded-lg hover:shadow-sm
-------------------------------------------------- */
