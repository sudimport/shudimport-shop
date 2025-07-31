// src/components/SearchPopover.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Produkt {
  name: string;
  item_name: string;
  image?: string;
  price?: number;
  item_group?: string;
}

interface Kategorie {
  name: string;
  label: string;
}

export default function SearchPopover() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [produkte, setProdukte] = useState<Produkt[]>([]);
  const [kategorien, setKategorien] = useState<Kategorie[]>([]);
  const [showPopover, setShowPopover] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchTerm.length < 2) {
      setProdukte([]);
      setKategorien([]);
      setShowPopover(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetch(`/api/suche-suggest?term=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(data => {
          setProdukte(data.produkte || []);
          setKategorien(data.kategorien || []);
          setShowPopover(true);
        })
        .catch(() => {
          setProdukte([]);
          setKategorien([]);
          setShowPopover(false);
        });
    }, 300);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showPopover && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  const onProductClick = (code: string) => {
    // Navigate to shop search for this product code
    router.push(`/shop?search=${encodeURIComponent(code)}`);
    setShowPopover(false);
  };

  const onCategoryClick = (name: string) => {
    router.push(`/shop?categoria=${encodeURIComponent(name)}`);
    setShowPopover(false);
  };

  function highlightMatch(text: string, term: string) {
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-transparent text-red-600 font-semibold">{part}</mark>
          ) : (
            part
          )
        )}
      </>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Produktsuche..."
        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-green-500"
      />
      {showPopover && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-auto">
          {kategorien.length > 0 && (
            <div className="border-b border-gray-100">
              <p className="px-4 pt-3 pb-1 font-semibold">Kategorien</p>
              <ul>
                {kategorien.map(c => (
                  <li
                    key={c.name}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onCategoryClick(c.name)}
                  >
                    <span className="text-sm text-green-700">
                      {highlightMatch(c.label, searchTerm)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {produkte.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 font-semibold">Produkte</p>
              <ul>
                {produkte.map(p => (
                  <li
                    key={p.name}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onProductClick(p.name)}
                  >
                    <div className="w-10 h-10 relative">
                      {p.image ? (
                        <Image
                          src={`https://gestionale.sudimport.website${p.image}`}
                          alt={p.item_name}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded"></div>
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="text-gray-900">
                        {highlightMatch(p.item_name, searchTerm)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{p.item_group}</p>
                    </div>
                    <div className="text-sm font-semibold text-green-700">
                      {p.price?.toFixed(2)} €
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="px-4 py-2 border-t text-center">
            <Link
              href={`/shop?search=${encodeURIComponent(searchTerm)}`}
              className="text-sm text-gray-600 hover:underline"
              onClick={() => setShowPopover(false)}
            >
              Alle Suchergebnisse anzeigen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
