'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Tag, Sparkles, List, ChevronDown } from 'lucide-react';

type Categoria = {
  name: string;
  count: number;
};

export default function MainMenu() {
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/categorie')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategorie(data);
        }
      })
      .catch(console.error);
  }, []);

  // Chiude dropdown se clicchi fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-green-700 text-white text-sm font-medium">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center gap-2 py-3 flex-wrap">
          {/* KATALOG */}
          <Link
            href="/shop"
            className="px-4 py-2 hover:bg-green-800 transition-colors whitespace-nowrap flex items-center gap-2 rounded"
          >
            KATALOG
          </Link>

          {/* KATEGORIEN dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="px-4 py-2 hover:bg-green-800 transition-colors whitespace-nowrap flex items-center gap-1 rounded"
            >
              <List className="w-4 h-4" /> KATEGORIEN
              <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="absolute top-full left-0 mt-1 bg-white text-black shadow-lg rounded w-52 z-50 max-h-96 overflow-y-auto">
                {categorie.map(cat => (
                  <Link
                    key={cat.name}
                    href={`/shop?categoria=${encodeURIComponent(cat.name)}`}
                    className="block px-4 py-2 hover:bg-green-100"
                    onClick={() => setOpen(false)}
                  >
                    {cat.name} ({cat.count})
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-green-600"></div>

          {/* Angebote */}
          <Link
            href="/angebote"
            className="px-4 py-2 hover:bg-green-800 transition-colors flex items-center gap-2 group rounded"
          >
            <Tag className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">Angebote</span>
          </Link>

          {/* Neuheiten */}
          <Link
            href="/neuheiten"
            className="px-4 py-2 hover:bg-green-800 transition-colors flex items-center gap-2 group rounded"
          >
            <Sparkles className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="font-semibold">Neuheiten</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
