// src/app/wunschliste/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { FaHeart, FaShoppingCart, FaTrash } from 'react-icons/fa';

export default function WunschlistePage() {
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  useEffect(() => {
    // Simula il caricamento della wishlist (da localStorage o API)
    const loadWishlist = () => {
      try {
        const saved = localStorage.getItem('wishlist');
        if (saved) {
          setWishlistItems(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Errore nel caricamento wishlist:', error);
      }
      setLoading(false);
    };

    loadWishlist();
  }, []);

  const removeFromWishlist = (itemId: string) => {
    const updated = wishlistItems.filter(item => item.id !== itemId);
    setWishlistItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Artikel aus Wunschliste entfernt');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar sinistra */}
      <aside className="w-full md:w-64 bg-gray-100 p-4 space-y-3 border-r border-gray-200">
        <h2 className="text-lg font-semibold text-green-700 mb-4">Profil</h2>
        
        <ul className="space-y-2 text-sm text-gray-700">
          <li><Link href="/user" className="hover:underline">👤 Profil</Link></li>
          <li><Link href="/password" className="hover:underline">🔑 Passwort ändern</Link></li>
          <li><Link href="/bestellungen" className="hover:underline">📦 Bestellungen</Link></li>
          <li><Link href="/dokumente" className="hover:underline">📄 Dokumente</Link></li>
          <li><Link href="/anomalien" className="hover:underline">⚠️ Anomalien</Link></li>
          <li><Link href="/adresse" className="hover:underline">🏠 Adresse</Link></li>
          <li><Link href="/zugang" className="hover:underline">✅ Zugang bestätigen</Link></li>
          
          {/* Sezioni Liste */}
          <div className="border-t pt-3 mt-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Listen</h3>
            <li><span className="font-medium text-red-700 flex items-center gap-1"><FaHeart className="text-red-500" /> Wunschliste</span></li>
            <li><Link href="/einkaufliste" className="hover:underline flex items-center gap-1"><FaShoppingCart className="text-blue-500" /> Einkaufliste</Link></li>
          </div>
        </ul>
      </aside>

      {/* Contenuto principale */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <FaHeart className="text-red-500 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-900">Meine Wunschliste</h1>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <FaHeart className="text-gray-300 text-6xl mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Ihre Wunschliste ist leer</h2>
              <p className="text-gray-500 mb-6">Fügen Sie Artikel hinzu, die Sie später kaufen möchten.</p>
              <Link 
                href="/shop" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Zum Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-48 object-cover rounded-md mb-3"
                      />
                    )}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                  {item.price && (
                    <p className="text-green-600 font-bold mb-3">€{item.price}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors text-sm">
                      In den Warenkorb
                    </button>
                    <Link 
                      href={`/product/${item.id}`}
                      className="bg-gray-200 text-gray-700 py-2 px-3 rounded hover:bg-gray-300 transition-colors text-sm"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
