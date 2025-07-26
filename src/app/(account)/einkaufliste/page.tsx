// src/app/einkaufliste/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { FaHeart, FaShoppingCart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

export default function EinkauflistePage() {
  const [loading, setLoading] = useState(true);
  const [shoppingListItems, setShoppingListItems] = useState<any[]>([]);

  useEffect(() => {
    // Simula il caricamento della shopping list (da localStorage o API)
    const loadShoppingList = () => {
      try {
        const saved = localStorage.getItem('shoppingList');
        if (saved) {
          setShoppingListItems(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Errore nel caricamento shopping list:', error);
      }
      setLoading(false);
    };

    loadShoppingList();
  }, []);

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromShoppingList(itemId);
      return;
    }

    const updated = shoppingListItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setShoppingListItems(updated);
    localStorage.setItem('shoppingList', JSON.stringify(updated));
  };

  const removeFromShoppingList = (itemId: string) => {
    const updated = shoppingListItems.filter(item => item.id !== itemId);
    setShoppingListItems(updated);
    localStorage.setItem('shoppingList', JSON.stringify(updated));
    toast.success('Artikel aus Einkaufliste entfernt');
  };

  const addAllToCart = () => {
    // Simula l'aggiunta di tutti gli articoli al carrello
    toast.success('Alle Artikel wurden zum Warenkorb hinzugefügt');
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
            <li><Link href="/wunschliste" className="hover:underline flex items-center gap-1"><FaHeart className="text-red-500" /> Wunschliste</Link></li>
            <li><span className="font-medium text-blue-700 flex items-center gap-1"><FaShoppingCart className="text-blue-500" /> Einkaufliste</span></li>
          </div>
        </ul>
      </aside>

      {/* Contenuto principale */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FaShoppingCart className="text-blue-500 text-2xl" />
              <h1 className="text-2xl font-bold text-gray-900">Meine Einkaufliste</h1>
            </div>
            
            {shoppingListItems.length > 0 && (
              <button
                onClick={addAllToCart}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Alle in den Warenkorb
              </button>
            )}
          </div>

          {shoppingListItems.length === 0 ? (
            <div className="text-center py-12">
              <FaShoppingCart className="text-gray-300 text-6xl mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">Ihre Einkaufliste ist leer</h2>
              <p className="text-gray-500 mb-6">Fügen Sie Artikel hinzu, die Sie regelmäßig kaufen möchten.</p>
              <Link 
                href="/shop" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Zum Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {shoppingListItems.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      {item.price && (
                        <p className="text-green-600 font-bold">€{item.price}</p>
                      )}
                    </div>

                    {/* Controlli quantità */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <FaMinus className="text-sm" />
                        </button>
                        <span className="px-3 py-1 border-x border-gray-300 min-w-[50px] text-center">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                        >
                          <FaPlus className="text-sm" />
                        </button>
                      </div>

                      <button
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        In den Warenkorb
                      </button>

                      <button
                        onClick={() => removeFromShoppingList(item.id)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Riassunto totale */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Totale Artikel: {shoppingListItems.length}
                  </span>
                  <span className="text-lg font-semibold">
                    Gesamtmenge: {shoppingListItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
