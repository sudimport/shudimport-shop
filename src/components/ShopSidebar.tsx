'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Gift, Sparkles, ShoppingBag, ShoppingCart } from 'lucide-react';

/* ---------------------------------------------------------------------
 * Typen
 * -------------------------------------------------------------------*/

type Kategorie = {
  name: string;
  count: number;
};

interface ShopSidebarProps {
  onCategoryChange: (category: string | null) => void;
  selectedCategory: string | null;
}

/* ---------------------------------------------------------------------
 * Aktionen – klare Icons, professionelle Typografie
 * -------------------------------------------------------------------*/
const ACTIONS = [
  { key: 'angebote', label: 'Angebote', icon: Gift },
  { key: 'neuheiten', label: 'Neuheiten', icon: Sparkles },
  { key: 'wiedergekauft', label: 'Schon gekauft', icon: ShoppingBag },
  { key: 'einkaeufe', label: 'Meine Einkäufe', icon: ShoppingCart },
] as const;

/* ---------------------------------------------------------------------
 * Komponente
 * -------------------------------------------------------------------*/
export default function ShopSidebar({ onCategoryChange, selectedCategory }: ShopSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [collapsed, setCollapsed] = useState(false);
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  /* Kategorien laden */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/categorie');
        const data = await res.json();
        if (Array.isArray(data)) setKategorien(data);
      } catch (err) {
        console.error('[ShopSidebar] Kategorien-Fehler:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* URL & Callback */
  const selectCategory = (cat: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set('categoria', cat); else params.delete('categoria');
    router.push(`/shop?${params.toString()}`);
    onCategoryChange(cat);
  };

  /* Gefilterte Kategorien */
  const filtered = search
    ? kategorien.filter(k => k.name.toLowerCase().includes(search.toLowerCase()))
    : kategorien;

  const width = collapsed ? 'w-16' : 'w-72';

  return (
    <aside className={`h-full ${width} flex-shrink-0 border-r bg-white shadow transition-all font-sans`}>      
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h2 className="text-base font-semibold text-green-700 uppercase tracking-tight">Filter</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-100 text-gray-600"
          title={collapsed ? 'Öffnen' : 'Schließen'}
        >
          <svg className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7"/></svg>
        </button>
      </header>

      {/* Collapsed Quick Icons */}
      {collapsed && (
        <div className="flex flex-col items-center gap-4 py-4">
          {ACTIONS.map(({ key, icon: Icon, label }) => (
            <button key={key} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100" title={label}>
              <Icon className="w-5 h-5 text-green-700" />
            </button>
          ))}
        </div>
      )}

      {/* Vollansicht */}
      {!collapsed && (
        <div className="flex flex-col h-full overflow-y-auto px-5 py-4 space-y-10 text-sm text-gray-800">
          {/* Aktionen */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Aktionen</h3>
            <ul className="space-y-2">
              {ACTIONS.map(({ key, label, icon: Icon }) => (
                <li key={key}>
                  <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 transition-colors">
                    <span className="flex h-7 w-7 items-center justify-center rounded bg-green-100">
                      <Icon className="w-4 h-4 text-green-700" />
                    </span>
                    <span className="font-medium truncate">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Kategorien */}
          <section className="flex-1 flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Kategorien</h3>
              {selectedCategory && (
                <button onClick={() => selectCategory(null)} className="text-gray-400 hover:text-red-600" title="Filter löschen">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>

            {/* Suche */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Kategorien suchen…"
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="w-full rounded border border-gray-300 pl-10 pr-3 py-2 focus:border-green-500 focus:ring-0 placeholder-gray-400"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>

            {/* Liste */}
            {loading ? (
              <ul className="space-y-2 animate-pulse">
                {[...Array(6)].map((_, i) => <li key={i} className="h-4 bg-gray-200 rounded" />)}
              </ul>
            ) : (
              <ul className="space-y-1 overflow-y-auto">
                {filtered.map(k => (
                  <li key={k.name}>
                    <button onClick={() => selectCategory(k.name)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${selectedCategory === k.name ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-gray-50'}`}
                    >
                      <span className="truncate flex-1">{k.name}</span>
                      <span className={`ml-2 text-xs rounded-full px-2 ${selectedCategory === k.name ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{k.count}</span>
                    </button>
                  </li>
                ))}
                {!loading && filtered.length === 0 && (
                  <li className="py-6 text-center text-gray-400 italic">Keine Treffer</li>
                )}
              </ul>
            )}
          </section>
        </div>
      )}
    </aside>
  );
}
