'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Prodotto = {
  name: string
  item_name: string
  image: string | null
  price?: string
  original_price?: string
  discount?: string
}

export default function ProdottiConsigliati() {
  const [items, setItems] = useState<Prodotto[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch per prodotti consigliati - usa un endpoint specifico o con filtro
    fetch('/api/prodotti-consigliati')
      .then(res => res.json())
      .then(async data => {
        const products = data.items || data.data || []
        
        // Se ci sono prodotti, usa quelli
        if (products.length > 0) {
          // Recupera i prezzi per ogni prodotto se l'utente è loggato
          const itemsWithPrices = await Promise.all(
            products.map(async (item: Prodotto) => {
              try {
                const priceRes = await fetch(`/api/prezzi?item=${encodeURIComponent(item.name)}`)
                
                if (priceRes.ok) {
                  const priceData = await priceRes.json()
                  
                  if (priceData.price) {
                    // Per i consigliati, sconto moderato (5-15%)
                    const discountPercentage = 5 + (Math.random() * 10)
                    const originalPrice = priceData.price * (1 + discountPercentage / 100)
                    
                    return {
                      ...item,
                      price: priceData.price.toFixed(2),
                      original_price: originalPrice.toFixed(2),
                      discount: Math.round(discountPercentage).toString()
                    }
                  }
                }
                
                return item
              } catch (error) {
                console.error(`Errore recupero prezzo per ${item.name}:`, error)
                return item
              }
            })
          )
          
          setItems(itemsWithPrices)
          setLoading(false)
        } else {
          // Se non ci sono prodotti consigliati, fallback
          throw new Error('Nessun prodotto consigliato')
        }
      })
      .catch(error => {
        // Fallback: prendi tutti i prodotti e seleziona 50 casuali
        console.log('Fallback to random products:', error.message)
        
        fetch('/api/prodotti')
          .then(res => res.json())
          .then(async data => {
            let allProducts = data.items || []
            
            // Se ci sono più di 50 prodotti, seleziona 50 casuali
            if (allProducts.length > 50) {
              // Mischia l'array e prendi i primi 50
              const shuffled = [...allProducts].sort(() => Math.random() - 0.5)
              allProducts = shuffled.slice(0, 50)
            }
            
            // Recupera i prezzi per i prodotti selezionati
            const itemsWithPrices = await Promise.all(
              allProducts.map(async (item: Prodotto) => {
                try {
                  const priceRes = await fetch(`/api/prezzi?item=${encodeURIComponent(item.name)}`)
                  
                  if (priceRes.ok) {
                    const priceData = await priceRes.json()
                    
                    if (priceData.price) {
                      const discountPercentage = 5 + (Math.random() * 10)
                      const originalPrice = priceData.price * (1 + discountPercentage / 100)
                      
                      return {
                        ...item,
                        price: priceData.price.toFixed(2),
                        original_price: originalPrice.toFixed(2),
                        discount: Math.round(discountPercentage).toString()
                      }
                    }
                  }
                  
                  return item
                } catch (error) {
                  return item
                }
              })
            )
            
            setItems(itemsWithPrices)
          })
          .catch(err => {
            console.error('Errore completo:', err)
            setItems([])
          })
          .finally(() => setLoading(false))
      })
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    
    const container = scrollRef.current
    const scrollAmount = container.clientWidth * 0.8
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 py-16">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4" />
          <p className="text-white font-medium text-lg">Caricamento prodotti consigliati…</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 py-16">
        <p className="text-center text-white font-medium text-lg">Nessun prodotto consigliato disponibile.</p>
      </div>
    )
  }
  return (
    <section className="bg-gradient-to-br from-blue-800 to-blue-900 py-12 mb-8 relative overflow-hidden">
      {/* Pattern decorativo di sfondo */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" 
               style={{
                 backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)'
               }}>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 relative z-10">
        {/* Header elegante */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white/90 text-sm font-medium uppercase tracking-wider">Von uns empfohlen</span>
          </div>
          
          <h2 className="text-5xl font-bold text-white mb-4">
            UNSERE EMPFEHLUNGEN<br />
            <span className="text-3xl font-light text-white/80">FÜR IHREN ERFOLG</span>
          </h2>
          
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Handverlesene Produkte, die sich in der Gastronomie bewährt haben
          </p>
        </div>

        {/* Controlli navigazione */}
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={() => scroll('left')}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition group"
          >
            <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition group"
          >
            <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Carousel container */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-blue-900 via-blue-900/50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-blue-900 via-blue-900/50 to-transparent z-10 pointer-events-none"></div>
          
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item, idx) => (
              <Link
                key={`${item.name}_${idx}`}
                href={`/shop?product=${encodeURIComponent(item.name)}`}
                className="flex-none w-[300px] bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Badge consigliato */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-yellow-400 text-blue-900 p-2 rounded-full shadow-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>

                {/* Rating stelle */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-600 ml-1">4.8</span>
                  </div>
                </div>

                {/* Container immagine */}
                <div className="relative h-[280px] bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                  {item.image ? (
                    <Image
                      src={`https://gestionale.sudimport.website${item.image}`}
                      alt={item.item_name}
                      fill
                      className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-20 h-20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Bild kommt</span>
                    </div>
                  )}
                </div>

                {/* Info prodotto */}
                <div className="p-6">
                  {/* Tag categoria */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                      Bestseller
                    </span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                      {item.name || 'Professional'}
                    </span>
                  </div>
                  
                  {/* Nome prodotto */}
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-4 min-h-[3.5rem]">
                    {item.item_name}
                  </h3>

                  {/* Prezzi */}
                  <div className="space-y-2 border-t pt-4">
                    {item.price ? (
                      <>
                        {item.original_price && item.discount && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm text-gray-500 line-through">
                                {item.original_price} €
                              </span>
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                -{item.discount}%
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-bold text-blue-900">
                              {item.price} €
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              inkl. MwSt.
                            </p>
                          </div>
                          
                          <button className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transform hover:scale-110 transition-all shadow-lg">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xl font-bold text-gray-700">
                            Preis auf Anfrage
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Bitte einloggen
                          </p>
                        </div>
                        
                        <button className="bg-gray-400 text-white p-3 rounded-full hover:bg-gray-500 transition-all shadow-lg">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Info extra */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verfügbar
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Schnelle Lieferung
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA finale */}
        <div className="text-center mt-10">
          <Link 
            href="/shop?filter=recommended" 
            className="inline-flex items-center gap-3 bg-white text-blue-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg"
          >
            Alle Empfehlungen ansehen
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
