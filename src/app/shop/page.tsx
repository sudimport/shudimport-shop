'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type Prodotto = {
  name: string;
  item_name: string;
  item_group: string;
  image: string | null;
  description: string;
  price: number | null;
};

function makePages(total: number, current: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current > 2) pages.add(current - 2);
  if (current < total) pages.add(current + 1);
  if (current < total - 1) pages.add(current + 2);
  return Array.from(pages).sort((a, b) => a - b);
}

export default function ShopPage() {
  const [items, setItems] = useState<Prodotto[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [min, setMin] = useState<string>('');
  const [max, setMax] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    const username = localStorage.getItem('username');
    setIsLoggedIn(!!username);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch('/api/prodotti?page=1&limit=1000')
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data.items) ? data.items : [];
        setTotal(typeof data.total === 'number' ? data.total : all.length);
        const groups = all.map((i: Prodotto) => i.item_group?.trim() || '').filter(Boolean);
        setCategories(Array.from(new Set(groups)));
        setItems(all.slice(0, LIMIT));
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search) qs.set('search', search);
    if (min) qs.set('prezzo_min', min);
    if (max) qs.set('prezzo_max', max);
    if (categoria) qs.set('categoria', categoria);

    const username = localStorage.getItem('username') || '';

    fetch('/api/prodotti?' + qs.toString(), {
      headers: {
        'x-user': username
      }
    })
      .then(r => r.json())
      .then(data => {
        let fetched = Array.isArray(data.items) ? data.items : [];
        if (categoria) {
          const inCat = fetched.filter(i => i.item_group === categoria);
          const outCat = fetched.filter(i => i.item_group !== categoria);
          fetched = [...inCat, ...outCat];
        }
        setItems(fetched);
        setTotal(typeof data.total === 'number' ? data.total : fetched.length);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [categoria, search, min, max, page]);

  const resetFilters = () => {
    setCategoria(null);
    setSearch('');
    setMin('');
    setMax('');
    setPage(1);
  };

  return (
    <div className="shop-container p-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-center">Shop Sudimport</h1>

      <div className="mb-4">
        <select
          value={categoria || ''}
          onChange={e => { setCategoria(e.target.value || null); setPage(1); }}
          className="border p-2 rounded w-full max-w-xs mx-auto block"
        >
          <option value="">Alle Kategorien</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-center mb-6">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border p-2 rounded min-w-[150px]"
        />
        <input
          type="number"
          placeholder="Min €"
          value={min}
          onChange={e => setMin(e.target.value)}
          className="w-24 border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Max €"
          value={max}
          onChange={e => setMax(e.target.value)}
          className="w-24 border p-2 rounded"
        />
        <button onClick={() => setPage(1)} className="bg-green-600 text-white px-4 py-2 rounded">
          Search
        </button>
        <button onClick={resetFilters} className="bg-gray-400 text-white px-4 py-2 rounded">
          Reset
        </button>
      </div>

      {loading && <p className="mb-4">Loading…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.length === 0 && !loading ? (
          <p className="col-span-full">Keine Produkte gefunden.</p>
        ) : (
          items.map((item, idx) => {
            const imgSrc = item.image
              ? `https://gestionale.sudimport.website${item.image}`
              : null;
            return (
              <div key={item.name + '_' + idx} className="flex flex-col justify-between border p-4 rounded shadow h-full">
                <div className="flex items-center justify-center h-56 overflow-hidden">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={item.name}
                      width={200}
                      height={200}
                      unoptimized
                      className="object-contain h-full w-auto"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-gray-100 flex items-center justify-center mx-auto">
                      No Image
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm font-bold text-gray-500 text-center">{item.name}</p>
                <h2 className="text-base font-semibold text-center">{item.item_name}</h2>
                {isLoggedIn && item.price != null ? (
                  <p className="mt-1 font-bold text-green-700">€ {item.price.toFixed(2)}</p>
                ) : !isLoggedIn ? (
                  <p className="mt-1 text-gray-500 italic text-sm">Nur sichtbar nach Login</p>
                ) : null}
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
                  In den Warenkorb
                </button>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded bg-gray-200">«</button>
          {makePages(totalPages, page).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={'px-3 py-1 rounded ' + (n === page ? 'bg-green-600 text-white' : 'bg-gray-200')}
            >
              {n}
            </button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded bg-gray-200">»</button>
        </div>
      )}
    </div>
  );
}
