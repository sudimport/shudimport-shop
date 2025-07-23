'use client';

import { Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white text-sm mt-8">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Logo e indirizzo */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Sudimport</h2>
          <p>Werner-Siemens-Strasse 29<br />22113 Hamburg</p>
        </div>

        {/* Contatti */}
        <div>
          <h3 className="font-semibold mb-2">CONTATTI</h3>
          <p>info@sudimport.de</p>
          <p>kundenservice@sudimport.de</p>
          <p>vertrieb@sudimport.de</p>
        </div>

        {/* Informazioni */}
        <div>
          <h3 className="font-semibold mb-2">INFORMAZIONEN</h3>
          <p>Spedizioni</p>
          <p>AGB / Condizioni</p>
          <p>Privacy Policy</p>
          <p>Cookie Policy</p>
          <p>Contattaci</p>
        </div>

        {/* Social */}
        <div>
          <h3 className="font-semibold mb-2">SEGUICI SU</h3>
          <div className="flex gap-4 mt-2">
            <Facebook className="w-5 h-5" />
            <Instagram className="w-5 h-5" />
          </div>
        </div>
      </div>
    </footer>
  );
}
