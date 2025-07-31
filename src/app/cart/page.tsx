'use client';

import { useCartStore } from '../../store/cart';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const { 
    items, 
    removeFromCart, 
    updateQty, 
    clearCart, 
    getTotalPrice,
    getTotalItems
  } = useCartStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const netTotal = totalPrice;
  const vatAmount = totalPrice * 0.19; // 19% MwSt
  const grossTotal = netTotal + vatAmount;
  const shipping = totalPrice > 500 ? 0 : 29.99; // B2B: Kostenlos ab 500€
  const finalTotal = grossTotal + shipping;

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
  };

  // Stima date di consegna
  const getDeliveryEstimate = () => {
    const today = new Date();
    const deliveryDays = shipping === 0 ? 2 : 3; // Express se gratis
    const deliveryDate = new Date(today.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
    return deliveryDate.toLocaleDateString('de-DE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header B2B */}
      <div className="bg-white border-b-2 border-green-600">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Breadcrumb Professionale */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-green-600 transition-colors">Startseite</Link>
            <span>›</span>
            <Link href="/shop" className="hover:text-green-600 transition-colors">Produktkatalog</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">Bestellübersicht</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bestellübersicht</h1>
              <p className="text-gray-600">
                {totalItems > 0 
                  ? `${totalItems} Artikel • Netto: ${netTotal.toFixed(2)}€ • Brutto: ${grossTotal.toFixed(2)}€`
                  : 'Ihre Bestellung ist leer'
                }
              </p>
            </div>
            
            {totalItems > 0 && (
              <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Drucken
                </button>
                <Link
                  href="/shop"
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Weitere Artikel hinzufügen
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          // Empty State B2B
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ihre Bestellung ist leer</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Durchsuchen Sie unseren Produktkatalog und fügen Sie Artikel zu Ihrer Bestellung hinzu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Produktkatalog durchsuchen
              </Link>
              <Link
                href="/katalog.pdf"
                className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF-Katalog herunterladen
              </Link>
            </div>
          </div>
        ) : (
          // Cart with Items - B2B Layout
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            
            {/* Main Order Table */}
            <div className="xl:col-span-3">
              
              {/* Order Header */}
              <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Bestellpositionen ({totalItems} Artikel)
                  </h2>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Alle Positionen entfernen
                  </button>
                </div>

                {/* Table Header - Desktop */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-sm font-medium text-gray-700">
                  <div className="col-span-1">Pos.</div>
                  <div className="col-span-2">Artikel</div>
                  <div className="col-span-4">Beschreibung</div>
                  <div className="col-span-1">Menge</div>
                  <div className="col-span-2">Einzelpreis</div>
                  <div className="col-span-2">Gesamtpreis</div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <div key={item.name} className="px-6 py-4">
                      
                      {/* Desktop Layout */}
                      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 text-sm text-gray-600">
                          {(index + 1).toString().padStart(2, '0')}
                        </div>
                        
                        <div className="col-span-2">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden">
                            {item.image ? (
                              <Image
                                src={`https://gestionale.sudimport.website${item.image}`}
                                alt={item.item_name}
                                width={64}
                                height={64}
                                className="object-contain w-full h-full p-2"
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
                        </div>
                        
                        <div className="col-span-4">
                          <h3 className="font-medium text-gray-900 mb-1">{item.item_name}</h3>
                          <p className="text-sm text-gray-600">Art.-Nr: {item.name}</p>
                        </div>
                        
                        <div className="col-span-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(item.name, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-12 text-center font-medium">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.name, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <div className="text-right">
                            <div className="font-medium">{item.price.toFixed(2)} €</div>
                            <div className="text-sm text-gray-600">netto</div>
                          </div>
                        </div>
                        
                        <div className="col-span-2 flex items-center justify-between">
                          <div className="text-right">
                            <div className="font-bold text-lg">{(item.price * item.qty).toFixed(2)} €</div>
                            <div className="text-sm text-gray-600">netto</div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.name)}
                            className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="lg:hidden">
                        <div className="flex gap-4 mb-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={`https://gestionale.sudimport.website${item.image}`}
                                alt={item.item_name}
                                width={64}
                                height={64}
                                className="object-contain w-full h-full p-2"
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
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                            <p className="text-sm text-gray-600">Art.-Nr: {item.name}</p>
                            <p className="text-lg font-bold text-green-600 mt-1">{item.price.toFixed(2)} € netto</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.name)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQty(item.name, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-12 text-center font-medium">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.name, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{(item.price * item.qty).toFixed(2)} €</div>
                            <div className="text-sm text-gray-600">Gesamt netto</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Bestellnotizen</h3>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Besondere Wünsche, Lieferhinweise oder Anmerkungen zu Ihrer Bestellung..."
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
              </div>
            </div>

            {/* Order Summary - B2B Style */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Bestellsumme</h3>
                
                {/* B2B Price Breakdown */}
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nettosumme</span>
                    <span className="font-medium">{netTotal.toFixed(2)} €</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">MwSt. (19%)</span>
                    <span className="font-medium">{vatAmount.toFixed(2)} €</span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between font-medium">
                    <span>Zwischensumme</span>
                    <span>{grossTotal.toFixed(2)} €</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <span className="text-gray-600">Versandkosten</span>
                      {totalPrice >= 500 && (
                        <div className="text-xs text-green-600">Kostenfrei ab 500€ netto</div>
                      )}
                    </div>
                    <span className="font-medium">
                      {shipping === 0 ? 'Kostenfrei' : `${shipping.toFixed(2)} €`}
                    </span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Gesamtbetrag</span>
                    <span className="text-green-600">{finalTotal.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Lieferinformation</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Voraussichtliche Lieferung:</div>
                    <div className="font-medium text-gray-900">{getDeliveryEstimate()}</div>
                    <div className="text-xs mt-2">
                      {shipping === 0 ? 'Express-Versand' : 'Standard-Versand'}
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/checkout"
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-center hover:bg-green-700 transition-colors block"
                  >
                    Bestellung aufgeben
                  </Link>
                  
                  <Link
                    href="/angebot"
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors block"
                  >
                    Angebot anfordern
                  </Link>
                  
                  <Link
                    href="/shop"
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium text-center hover:bg-gray-200 transition-colors block"
                  >
                    Weitere Artikel hinzufügen
                  </Link>
                </div>

                {/* B2B Features */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Ihre Vorteile</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Rechnung mit 30 Tage Zahlungsziel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Mengenrabatte verfügbar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Persönlicher Ansprechpartner</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Bestellung zurücksetzen?
                </h3>
                <p className="text-gray-600 mb-6">
                  Möchten Sie alle {totalItems} Positionen aus Ihrer Bestellung entfernen?
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Zurücksetzen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
