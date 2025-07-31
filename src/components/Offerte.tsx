'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getItemsWithPrice, Prodotto } from '@/utils/shop'

export default function Offerte() {
  const [items, setItems] = useState<Prodotto[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/prodotti-offerta')
      .then(res => res.json())
      .then(async data => {
        const prodotti = data.items || []
        const enriched = await getItemsWithPrice(prodotti, 20, 70)
        setItems(enriched)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="bg-[#FFE500] py-12 text-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-900 rounded-full mx-auto mb-4" />
        <p className="text-blue-900 font-bold">Caricamento offerte…</p>
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
        {/* Header e controlli */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-1">BESTE DEALS</p>
            <h2 className="text-3xl font-bold text-blue-900 uppercase">
              AKTUELLE ANGEBOTE IM<br />
              SÜDIMPORT ONLINESHOP
            </h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button onClick={() => scroll('left')} className="p-3 bg-white rounded-full shadow-md hover:shadow-lg">
              <svg className="w-6 h-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => scroll('right')} className="p-3 bg-white rounded-full shadow-md hover:shadow-lg">
              <svg className="w-6 h-6 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FFE500] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FFE500] to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item, idx) => (
              <Link
                key={`${item.name}_${idx}`}
                href={`/shop?product=${encodeURIComponent(item.name)}`}
                className="flex-none w-[250px] bg-white rounded-lg shadow-sm hover:shadow-lg transition-all group relative"
              >
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 font-bold rounded">IN ANGEBOT!</span>
                </div>

                <div className="p-4 flex items-center justify-center bg-white h-[180px]">
                  {item.image ? (
                    <div className="relative w-full h-full flex items-center justify-center">
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
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <span className="text-sm">Kein Bild</span>
                    </div>
                  )}
                </div>

                <div className="p-4 pt-0">
                  <p className="text-xs text-gray-600 uppercase tracking-wide mb-1 truncate">{item.name}</p>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 min-h-[2.5rem]">{item.item_name}</h3>

                  <div className="space-y-1">
                    {item.price ? (
                      <>
                        {item.original_price && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-500 line-through">UVP {item.original_price} €</span>
                            {item.discount && (
                              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 font-bold">
                                -{item.discount}%
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-2xl font-bold text-red-600">{item.price} €</p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-blue-900">Preis auf Anfrage</p>
                    )}
                  </div>

                  <button className="w-full mt-3 bg-blue-900 text-white px-4 py-2 rounded font-semibold hover:bg-blue-800 transition">
                    In den Warenkorb
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
