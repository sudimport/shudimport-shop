'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '../../../store/cart'

interface Prodotto {
  name: string
  item_name: string
  description?: string
  image?: string
  price?: string
  original_price?: string
  discount?: string
  stock_uom?: string
  weight_per_unit?: string
  pack_size?: string
  minimum_order_qty?: number
  shelf_life?: string
  origin?: string
  tax_category?: string
  vat_percent?: string
  alternative_uoms?: Array<{
    uom: string
    conversion_factor: number
  }>
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [item, setItem] = useState<Prodotto | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const { addToCart, items: cartItems } = useCartStore()

  // State per UOM selezionata
  const [selectedUom, setSelectedUom] = useState<{
    uom: string;
    conversion_factor: number;
    price_per_unit: number;
  }>({
    uom: 'kg',
    conversion_factor: 1,
    price_per_unit: 0
  })

  useEffect(() => {
    fetch(`/api/prodotto/${slug}`, {
      headers: {
        'x-user': localStorage.getItem('username') || ''
      }
    })
      .then(res => res.json())
      .then(data => {
        setItem(data.item || null)
        if (data.item?.minimum_order_qty) {
          setQuantity(data.item.minimum_order_qty)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [slug])

  // Calcola prezzo e dati quando item è disponibile
  const price = parseFloat(item?.price || '0')
  const originalPrice = item?.original_price ? parseFloat(item.original_price) : null
  const hasDiscount = item?.discount && originalPrice
  
  // Usa vat_percent dall'API se disponibile, altrimenti fallback
  const vatPercent = item?.vat_percent ? parseFloat(item.vat_percent) : 19
  const taxRate = vatPercent / 100
  const vatAmount = price * taxRate
  const grossPrice = price + vatAmount

  // Calcola UOM disponibili con conversioni
  const availableUoms = useMemo(() => {
    if (!item) return [];

    const baseUom = {
      uom: item.stock_uom || 'kg',
      conversion_factor: 1,
      price_per_unit: price,
      description: `Preis pro ${item.stock_uom || 'kg'}`
    };

    const uoms = [baseUom];

    // Aggiungi UOM alternative se disponibili
    if (item.alternative_uoms && item.alternative_uoms.length > 0) {
      item.alternative_uoms.forEach(altUom => {
        uoms.push({
          uom: altUom.uom,
          conversion_factor: altUom.conversion_factor,
          price_per_unit: price * altUom.conversion_factor,
          description: `${altUom.conversion_factor} ${item.stock_uom} = 1 ${altUom.uom}`
        });
      });
    }

    return uoms;
  }, [item, price]);

  // Aggiorna UOM selezionata quando cambia il prodotto
  useEffect(() => {
    if (item?.stock_uom && availableUoms.length > 0) {
      setSelectedUom({
        uom: item.stock_uom,
        conversion_factor: 1,
        price_per_unit: price
      });
    }
  }, [item, price, availableUoms]);

  const handleAddToCart = () => {
    if (!item?.price) return

    for (let i = 0; i < quantity; i++) {
      addToCart({
        name: item.name,
        item_name: item.item_name,
        price: selectedUom.price_per_unit,
        image: item.image || null,
        uom: selectedUom.uom,
        weight_per_unit: item.weight_per_unit,
        pack_size: item.pack_size,
        minimum_order_qty: item.minimum_order_qty,
        price_per_uom: selectedUom.uom ? `€/${selectedUom.uom}` : undefined
      })
    }
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300'
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${quantity} ${selectedUom.uom} zum Warenkorb hinzugefügt!</span>
      </div>
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const isInCart = item ? cartItems.some(cartItem => cartItem.name === item.name) : false
  const cartQuantity = item ? cartItems.find(cartItem => cartItem.name === item.name)?.qty || 0 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Produktdetails werden geladen...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6M4 13h6m4 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produkt nicht gefunden</h2>
          <p className="text-gray-600 mb-8">Das angeforderte Produkt existiert nicht oder wurde entfernt.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück zum Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600 transition-colors">Startseite</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/shop" className="hover:text-green-600 transition-colors">Produktkatalog</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{item.item_name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              {item.image ? (
                <Image
                  src={`https://gestionale.sudimport.website${item.image}`}
                  alt={item.item_name}
                  width={600}
                  height={600}
                  className="object-contain w-full h-[500px] rounded-xl"
                  unoptimized
                />
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
                  <svg className="w-24 h-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Produktbild folgt</p>
                </div>
              )}
            </div>
            {/* Product Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Produkteigenschaften</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Artikel-Nr:</span>
                  <span className="font-mono text-gray-900">{item.name}</span>
                </div>
                {item.stock_uom && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Einheit:</span>
                    <span className="font-medium text-gray-900">{item.stock_uom}</span>
                  </div>
                )}
                {item.weight_per_unit && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inhalt:</span>
                    <span className="font-medium text-gray-900">{item.weight_per_unit}</span>
                  </div>
                )}
                {item.pack_size && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verpackung:</span>
                    <span className="font-medium text-gray-900">{item.pack_size}</span>
                  </div>
                )}
                {item.origin && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Herkunft:</span>
                    <span className="font-medium text-gray-900">{item.origin}</span>
                  </div>
                )}
                {item.shelf_life && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Haltbarkeit:</span>
                    <span className="font-medium text-gray-900">{item.shelf_life}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            
            {/* Product Header PULITO */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{item.item_name}</h1>
                  
                  {/* Info essenziali in una riga pulita */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="font-mono bg-gray-100 px-3 py-1 rounded">
                      Art.-Nr: {item.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Verfügbar
                    </span>
                    <span>
                      Grundeinheit: {item.stock_uom}
                    </span>
                    {vatPercent !== 19 && (
                      <span className="text-orange-600 font-medium">
                        {vatPercent}% MwSt.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            {item.price ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Preisübersicht</h3>
                
                {hasDiscount && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      -{item.discount}% Rabatt
                    </span>
                    <span className="text-gray-500 line-through text-lg">
                      {originalPrice?.toFixed(2)} €
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nettopreis:</span>
                    <span className="text-2xl font-bold text-gray-900">{price.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">MwSt. ({vatPercent.toFixed(0)}%):</span>
                    <span className="font-medium text-gray-700">{vatAmount.toFixed(2)} €</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Bruttopreis:</span>
                    <span className="text-xl font-bold text-green-600">{grossPrice.toFixed(2)} €</span>
                  </div>
                  {item.stock_uom && (
                    <p className="text-sm text-gray-500 text-center">
                      Preis pro {item.stock_uom} • {item.weight_per_unit || 'Einzelpreis'}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Preis auf Anfrage</h3>
                <p className="text-yellow-700">Bitte loggen Sie sich ein, um Preise zu sehen, oder kontaktieren Sie unseren Vertrieb.</p>
              </div>
            )}

            {/* Bestelleinheit - Solo riepilogo prezzo con UOM alternative selezionabili */}
            {availableUoms.length > 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Bestelleinheit</h3>
                
                {/* Primo campo non selezionabile - solo riepilogo */}
                <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg text-gray-600">{availableUoms[0].uom}</span>
                    <span className="font-bold text-gray-600">
                      {availableUoms[0].price_per_unit.toFixed(2)} €
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {availableUoms[0].description}
                  </div>
                </div>
                {/* UOM alternative selezionabili */}
                {availableUoms.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableUoms.slice(1).map((uomOption, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setSelectedUom(uomOption)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedUom.uom === uomOption.uom
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-lg">{uomOption.uom}</span>
                          <span className="font-bold text-green-600">
                            {uomOption.price_per_unit.toFixed(2)} €
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {uomOption.description}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {item.price && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Bestellung</h3>
                
                {/* Quantity Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Menge {item.minimum_order_qty && `(Mindestmenge: ${item.minimum_order_qty} ${selectedUom.uom})`}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(item.minimum_order_qty || 1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(item.minimum_order_qty || 1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center border border-gray-300 rounded-lg py-2 font-medium"
                      min={item.minimum_order_qty || 1}
                    />
                    
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    
                    <span className="text-gray-600 ml-2">{selectedUom.uom}</span>
                  </div>
                  
                  {/* Total calculation con UOM selezionata */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Gesamtpreis ({quantity} {selectedUom.uom}):</span>
                      <span className="font-bold">{(selectedUom.price_per_unit * quantity).toFixed(2)} € netto</span>
                    </div>
                    {selectedUom.conversion_factor !== 1 && (
                      <div className="text-xs text-gray-600">
                        = {(quantity * selectedUom.conversion_factor).toFixed(2)} {item.stock_uom} Grundeinheit
                      </div>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 mb-4 ${
                    isInCart 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {isInCart 
                    ? `Bereits im Warenkorb (${cartQuantity} ${selectedUom.uom})` 
                    : `${quantity} ${selectedUom.uom} in den Warenkorb`
                  }
                </button>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const subject = `Angebot anfragen: ${item.item_name}`;
                      const body = `Guten Tag,\n\nbitte erstellen Sie mir ein Angebot für:\n\nProdukt: ${item.item_name}\nArt.-Nr.: ${item.name}\nMenge: ${quantity} ${selectedUom.uom}\n\nVielen Dank!\n\nMit freundlichen Grüßen`;
                      const mailtoLink = `mailto:vertrieb@sudimport.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(mailtoLink, '_blank');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Angebot anfragen
                  </button>
                  
                  <button
                    onClick={() => navigator.share && navigator.share({
                      title: item.item_name,
                      text: `Schauen Sie sich dieses Produkt an: ${item.item_name}`,
                      url: window.location.href
                    })}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Teilen
                  </button>
                </div>
              </div>
            )}

            {/* Product Description */}
            {item.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Produktbeschreibung</h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p>{item.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>  
      </div>     
    </div>      
  )
}
