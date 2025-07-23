'use client';

import Header from './Header';
import Footer from './Footer';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Menu verde */}
      <nav className="bg-green-700 text-white text-sm">
        <ul className="flex gap-6 px-4 py-2">
          <li className="hover:underline cursor-pointer">Startseite</li>
          <li className="hover:underline cursor-pointer">Unternehmen</li>
          <li className="hover:underline cursor-pointer">Katalog</li>
          <li className="hover:underline cursor-pointer">Angebote</li>
          <li className="hover:underline cursor-pointer">Versand</li>
          <li className="hover:underline cursor-pointer">Kontakt</li>
        </ul>
      </nav>

      <main className="flex-1 p-4">
        {children}
      </main>

      <Footer />
    </div>
  );
}
