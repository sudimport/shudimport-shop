'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '../../store/cart';
import ShopSidebar from '../../components/ShopSidebar';

interface Prodotto {
  name: string;
  item_name: string;
  item_group: string;
  image: string | null;
  description: string;
  price: number | null;
  item_code?: string;
  item_url?: string;
  uom?: string;
  weight_per_unit?: string | null;
  pack_size?: string | null;
  minimum_order_qty?: number;
  price_per_uom?: string;
  shelf_life?: string | null;
  origin?: string | null;
  is_on_offer?: boolean;
  is_new?: boolean;
  is_available?: boolean;
}

export default function ShopPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart, items: cartItems } = useCartStore();

  const [items, setItems] = useState<Prodotto[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [min, setMin] = useState<string>('');
  const [max, setMax] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  // Read categoria from URL
  useEffect(() => {
    const cat = searchParams.get('categoria');
    setCategoria(cat);
    setPage(1);
  }, [searchParams]);

  // Fetch products when filters change
  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('limit', String(LIMIT));
    if (categoria && !search) qs.set('categoria', categoria);
    if (search) qs.set('search', search);
    if (min) qs.set('prezzo_min', min);
    if (max) qs.set('prezzo_max', max);

    fetch(`/api/prodotti?${qs.toString()}`, {
      headers: { 'x-user': localStorage.getItem('username') || '' }
    })
      .then(res => res.json())
      .then(data => {
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [categoria, search, min, max, page]);

  const handleCategoryChange = (cat: string | null) => {
    setCategoria(cat);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch('');
    setMin('');
    setMax('');
    setCategoria(null);
    setPage(1);
    router.push('/shop');
  };

  const handleSearch = () => {
    setPage(1);
  };

  const makePages = (total: number, current: number): number[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = new Set<number>([1, total, current]);
    if (current > 1) pages.add(current - 1);
    if (current > 2) pages.add(current - 2);
    if (current < total) pages.add(current + 1);
    if (current < total - 1) pages.add(current + 2);
    return Array.from(pages).sort((a, b) => a - b);
  };
  const handleAddToCart = (item: Prodotto) => {
    if (!item.price) {
      alert('Questo prodotto richiede il login per vedere il prezzo');
      return;
    }

    addToCart({
      name: item.name,
      item_name: item.item_name,
      price: item.price,
      image: item.image,
      uom: item.uom,
      weight_per_unit: item.weight_per_unit,
      pack_size: item.pack_size,
      minimum_order_qty: item.minimum_order_qty,
      price_per_uom: item.price_per_uom
    });

    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    const uomInfo = item.weight_per_unit ? ` (${item.weight_per_unit})` : '';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Artikel hinzugefügt${uomInfo}!</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const isInCart = (productName: string) => {
    return cartItems.some(item => item.name === productName);
  };

  const getCartQuantity = (productName: string) => {
    const cartItem = cartItems.find(item => item.name === productName);
    return cartItem ? cartItem.qty : 0;
  };

  const isProductCodeSearch = (searchTerm: string): boolean => {
    return /^[A-Z]{3}-[A-Z]{4}-\d{4}-\d{5}$/i.test(searchTerm) || 
           /^STO-ITEM-\d{4}-\d{5}$/i.test(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <ShopSidebar 
        onCategoryChange={handleCategoryChange}
        selectedCategory={categoria}
      />

      {/* Main Content Area - Grafica Originale */}
      <div className="flex-1">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-8">
              {categoria ? (
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Kategorie: {categoria}
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{categoria}</h1>
                </div>
              ) : (
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop Sudimport</h1>
              )}
              <p className="text-gray-600">Entdecken Sie unsere Premium-Auswahl für Gastronomie und Gewerbe</p>
            </div>

            {/* Filters Section - SENZA categoria dropdown */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suche
                    {search && isProductCodeSearch(search) && (
                      <span className="ml-2 text-xs text-green-600 font-semibold">(Produktcode)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="Produktname oder Code (z.B. STO-ITEM-2025-02734)..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min. Preis</label>
                  <input
                    type="number"
                    placeholder="Min €"
                    value={min}
                    onChange={e => setMin(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max. Preis</label>
                  <input
                    type="number"
                    placeholder="Max €"
                    value={max}
                    onChange={e => setMax(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 justify-center">
                <button 
                  onClick={handleSearch} 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Suchen
                </button>
                <button 
                  onClick={resetFilters} 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Zurücksetzen
                </button>
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{total}</span> Ergebnisse gefunden
                </p>
                {search && (
                  <p className="text-sm text-green-600 mt-1">
                    Suchergebnisse für: "<span className="font-semibold">{search}</span>"
                    {isProductCodeSearch(search) && <span className="ml-2 text-xs">(Produktcode-Suche)</span>}
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Seite {page} von {totalPages}
              </div>
            </div>
          </div>
        </div>
        {/* Products Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="text-gray-600 font-medium">Produkte werden geladen...</span>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6M4 13h6m4 0a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Keine Produkte gefunden</h3>
                  <p className="text-gray-600 mb-4">
                    {search 
                      ? `Keine Ergebnisse für "${search}" gefunden.`
                      : "Versuchen Sie andere Suchkriterien oder entfernen Sie Filter."
                    }
                  </p>
                  {(search || categoria || min || max) && (
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Alle Filter zurücksetzen
                    </button>
                  )}
                </div>
              ) : (
                items.map((item, idx) => {
                  const imgSrc = item.image ? `https://gestionale.sudimport.website${item.image}` : null;

                  return (
                    <div key={item.name + '_' + idx} className="group">
                      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 h-full flex flex-col">
                        {/* Badges Container */}
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                          {item.is_on_offer && (
                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                              In Offerta
                            </span>
                          )}
                          {item.is_new && (
                            <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-lg">
                              Nuovo
                            </span>
                          )}
                        </div>

                        {/* Product Image - Cliccabile */}
                        <Link href={`/prodotto/${encodeURIComponent(item.item_url || item.item_code || item.name)}`}>
                          <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 p-6 cursor-pointer">
                            {imgSrc ? (
                              <Image 
                                src={imgSrc} 
                                alt={item.item_name} 
                                fill
                                className="object-contain p-4 group-hover:scale-110 transition-transform duration-500" 
                                unoptimized 
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                <div className="w-20 h-20 mb-3 rounded-2xl bg-gray-200 flex items-center justify-center">
                                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-sm font-medium">Bild folgt</span>
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Product Info */}
                        <div className="p-6 flex-grow flex flex-col">
                          {/* Product Code - Cliccabile */}
                          <Link href={`/prodotto/${encodeURIComponent(item.item_url || item.item_code || item.name)}`}>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 cursor-pointer hover:text-green-800 transition-colors">
                              {item.item_code || item.name}
                            </p>
                          </Link>

                          {/* Product Name - Cliccabile */}
                          <Link href={`/prodotto/${encodeURIComponent(item.item_url || item.item_code || item.name)}`}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex-grow min-h-[3.5rem] flex items-start cursor-pointer hover:text-gray-700 transition-colors">
                              <span className="line-clamp-3">{item.item_name}</span>
                            </h3>
                          </Link>

                          {/* UOM Info - Colore più classico */}
                          {(item.weight_per_unit || item.pack_size || item.uom) && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="space-y-1 text-sm">
                                {item.weight_per_unit && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Inhalt:</span>
                                    <span className="text-gray-900 font-semibold">{item.weight_per_unit}</span>
                                  </div>
                                )}
                                {item.pack_size && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Verpackung:</span>
                                    <span className="text-gray-900">{item.pack_size}</span>
                                  </div>
                                )}
                                {item.uom && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Einheit:</span>
                                    <span className="text-gray-900">{item.uom}</span>
                                  </div>
                                )}
                                {item.minimum_order_qty && item.minimum_order_qty > 1 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 font-medium">Mindestmenge:</span>
                                    <span className="text-gray-900">{item.minimum_order_qty} {item.uom}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Price Section */}
                          <div className="mt-auto">
                            <div className="mb-6">
                              {item.price != null ? (
                                <div className="space-y-1">
                                  <p className="text-2xl font-bold text-gray-900">
                                    {item.price.toFixed(2)} €
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span>netto</span>
                                    {item.price_per_uom && (
                                      <>
                                        <span>•</span>
                                        <span className="font-medium">{item.price_per_uom}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-xl font-bold text-gray-700">Preis auf Anfrage</p>
                                  <p className="text-xs text-gray-500 mt-1">Nur sichtbar nach Login</p>
                                </div>
                              )}
                            </div>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(item);
                              }}
                              disabled={!item.price}
                              className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 mb-4 ${
                                !item.price 
                                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                                  : isInCart(item.name)
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white transform hover:scale-105'
                                    : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                              }`}
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {!item.price 
                                ? 'Login erforderlich'
                                : isInCart(item.name) 
                                  ? `Im Warenkorb (${getCartQuantity(item.name)})`
                                  : 'In den Warenkorb'
                              }
                            </button>

                            <Link 
                              href={`/prodotto/${encodeURIComponent(item.item_url || item.item_code || item.name)}`}
                              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium text-center hover:bg-gray-200 transition-colors block text-sm"
                            >
                              Details anzeigen
                            </Link>

                            {/* Status disponibilità */}
                            <div className="flex items-center justify-center pt-4 border-t border-gray-100 text-xs">
                              <span className={`flex items-center gap-1 ${item.is_available !== false ? 'text-green-600' : 'text-red-600'}`}>
                                <div className={`w-2 h-2 rounded-full ${item.is_available !== false ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                {item.is_available !== false ? 'Verfügbar' : 'Nicht verfügbar'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-12">
              <nav className="flex items-center space-x-2">
                <button 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => p - 1)} 
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    page <= 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {makePages(totalPages, page).map(n => (
                  <button 
                    key={n} 
                    onClick={() => setPage(n)} 
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      n === page 
                        ? 'bg-green-600 text-white shadow-lg' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}

                <button 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(p => p + 1)} 
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    page >= totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
