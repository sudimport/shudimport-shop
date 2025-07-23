'use client';

import Link from 'next/link';

export default function MainMenu() {
  return (
    <nav className="bg-green-700 text-white text-sm font-medium">
      <div className="max-w-7xl mx-auto flex gap-6 px-4 py-2">
        <Link href="/" className="hover:underline">Startseite</Link>
        <Link href="/unternehmen" className="hover:underline">Unternehmen</Link>
        <Link href="/shop" className="hover:underline">Katalog</Link>
        <Link href="/angebote" className="hover:underline">Angebote</Link>
        <Link href="/versand" className="hover:underline">Versand</Link>
        <Link href="/kontakt" className="hover:underline">Kontakt</Link>
      </div>
    </nav>
  );
}
