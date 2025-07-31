'use client';

import { useCartStore } from '../store/cart';
import Image from 'next/image';
import Link from 'next/link';

export default function CartSidebar() {
  const {
    items,
    isOpen,
    toggleCart,
    removeFromCart,
    updateQty,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCartStore();

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const vatAmount = totalPrice * 0.19; // 19% MwSt
  const grossTotal = totalPrice + vatAmount;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={toggleCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-green-600 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Bestellübersicht
            </h2>
            <p className="text-sm text-gray-600">
              {totalItems} {totalItems === 1 ? 'Position' : 'Positionen'}
            </p>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Artikel ausgewählt</h3>
              <p className="text-gray-600 mb-4">Fügen Sie Produkte zu Ihrer Bestellung hinzu</p>
              <button
                onClick={toggleCart}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Produktkatalog durchsuchen
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div key={item.name} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  
                  {/* Position Number */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Product Header */}
                      <div className="flex gap-3 mb-3">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-14 h-14 bg-white rounded-lg overflow-hidden border border-gray-200">
                          {item.image ? (
                            <Image
                              src={`https://gestionale.sudimport.website${item.image}`}
                              alt={item.item_name}
                              width={56}
                              height={56}
                              className="object-contain w-full h-full p-1"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1">
                            {item.item_name}
                          </h4>
                          <p className="text-xs text-gray-600 font-mono">
                            Art.-Nr: {item.name}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.name)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      {/* Price and Quantity */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-bold text-green-600">{item.price.toFixed(2)} €</div>
                          <div className="text-xs text-gray-500">netto/Stück</div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
                          <button
                            onClick={() => updateQty(item.name, item.qty - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                            </svg>
                          </button>

                          <span className="min-w-[2rem] text-center font-bold text-sm">
                            {item.qty}
                          </span>

                          <button
                            onClick={() => updateQty(item.name, item.qty + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-xs text-gray-600">Positionssumme:</span>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{(item.price * item.qty).toFixed(2)} €</div>
                          <div className="text-xs text-gray-500">netto</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50">
            
            {/* Quick Summary */}
            <div className="p-4 space-y-3">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Bestellsumme</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nettosumme:</span>
                    <span className="font-medium">{totalPrice.toFixed(2)} €</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">MwSt. (19%):</span>
                    <span className="font-medium">{vatAmount.toFixed(2)} €</span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between font-bold text-base">
                    <span>Bruttosumme:</span>
                    <span className="text-green-600">{grossTotal.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Link
                  href="/cart"
                  onClick={toggleCart}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-green-700 transition-colors block"
                >
                  Zur Bestellübersicht ({totalItems})
                </Link>

                <Link
                  href="/angebot"
                  onClick={toggleCart}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium text-center hover:bg-blue-700 transition-colors block text-sm"
                >
                  Angebot anfordern
                </Link>

                <div className="flex gap-2">
                  <button
                    onClick={toggleCart}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors text-sm"
                  >
                    Weiter einkaufen
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm(`Alle ${totalItems} Positionen entfernen?`)) {
                        clearCart();
                      }
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* B2B Info */}
              <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-blue-800">B2B Vorteile:</span>
                </div>
                <ul className="space-y-1 text-blue-700">
                  <li>• Rechnung mit 30 Tage Zahlungsziel</li>
                  <li>• Versandkostenfrei ab 500€ netto</li>
                  <li>• Mengenrabatte verfügbar</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
