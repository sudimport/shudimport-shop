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

export default function Offerte() {
  const [items, setItems] = useState<Prodotto[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Usa l'API prodotti-offerta per prendere TUTTI i prodotti in offerta
    fetch('/api/prodotti-offerta')
      .then(res => res.json())
      .then(async data => {
        const products = data.items || []
        
        // Recupera i prezzi per ogni prodotto se l'utente è loggato
        const itemsWithPrices = await Promise.all(
          products.map(async (item: Prodotto) => {
            try {
              // Chiama l'API prezzi
              const priceRes = await fetch(`/api/prezzi?item=${encodeURIComponent(item.name)}`)
              
              if (priceRes.ok) {
                const priceData = await priceRes.json()
                
                if (priceData.price) {
                  // Per le offerte, calcola uno sconto più alto (20-40%)
                  const discountPercentage = 20 + (Math.random() * 20)
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
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    
    const container = scrollRef.current
    const scrollAmount = container.clientWidth * 0.8 // Scrolla 80% della larghezza
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="bg-[#FFE500] py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-blue-900 rounded-full mx-auto mb-4" />
          <p className="text-blue-900 font-bold">Caricamento offerte…</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#FFE500] py-12">
        <p className="text-center text-blue-900 font-bold">Nessuna offerta disponibile.</p>
      </div>
    )
  }

  return (
    <section className="bg-[#FFE500] py-8 mb-8">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-1">BESTE DEALS</p>
            <h2 className="text-3xl font-bold text-blue-900 uppercase">
              AKTUELLE ANGEBOTE IM<br />
              SÜDIMPORT ONLINESHOP
            </h2>
          </div>
          
          {/* Controlli navigazione */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <svg className="w-6 h-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <svg className="w-6 h-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel container */}
        <div className="relative">
          {/* Gradients laterali */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FFE500] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FFE500] to-transparent z-10 pointer-events-none"></div>
          
          {/* Carousel scrollabile */}
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item, idx) => (
              <Link
                key={`${item.name}_${idx}`}
                href={`/shop?product=${encodeURIComponent(item.name)}`}
                className="flex-none w-[250px] bg-white rounded-lg shadow-sm hover:shadow-lg transition-all group"
              >
                {/* Badge IN ANGEBOT! sempre visibile per prodotti in offerta */}
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 font-bold rounded">
                    IN ANGEBOT!
                  </span>
                </div>

                {/* Container immagine - dimensione adattiva */}
                <div className="p-4 flex items-center justify-center bg-white">
                  {item.image ? (
                    <div className="relative w-full h-[180px] flex items-center justify-center">
                      <Image
                        src={`https://gestionale.sudimport.website${item.image}`}
                        alt={item.item_name}
                        width={180}
                        height={180}
                        className="object-contain max-w-full max-h-full group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full h-[180px] bg-gray-100 flex items-center justify-center text-gray-400">
                      <span className="text-sm">Kein Bild</span>
                    </div>
                  )}
                </div>

                {/* Info prodotto */}
                <div className="p-4 pt-0">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1 truncate">
                    {item.name}
                  </p>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 min-h-[2.5rem]">
                    {item.item_name}
                  </h3>

                  {/* Prezzi */}
                  <div className="space-y-1">
                    {item.price ? (
                      <>
                        {item.original_price && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-500 line-through">
                              UVP {item.original_price} €
                            </span>
                            {item.discount && (
                              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 font-bold">
                                -{item.discount}%
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-2xl font-bold text-red-600">
                          {item.price} €
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-blue-900">
                        Preis auf Anfrage
                      </p>
                    )}
                  </div>

                  {/* Bottone aggiungi */}
                  <button className="w-full mt-3 bg-blue-900 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 transition">
                    In den Warenkorb
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Controlli mobile */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-white rounded-full shadow"
          >
            <svg className="w-5 h-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-white rounded-full shadow"
          >
            <svg className="w-5 h-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
