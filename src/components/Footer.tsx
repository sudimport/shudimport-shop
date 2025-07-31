'use client';
import { 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Truck,
  Shield,
  CreditCard,
  Award
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Trust Badges Section */}
      <section className="bg-gray-50 py-8 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Schnelle Lieferung</h4>
              <p className="text-xs text-gray-600 mt-1">24-48 Stunden</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Sichere Zahlung</h4>
              <p className="text-xs text-gray-600 mt-1">SSL verschlüsselt</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">B2B Konditionen</h4>
              <p className="text-xs text-gray-600 mt-1">Auf Rechnung</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-sm text-gray-900">Premium Qualität</h4>
              <p className="text-xs text-gray-600 mt-1">Zertifizierte Produkte</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Image 
                src="/logo-sudimport-white.jpg" 
                alt="Sudimport" 
                width={180} 
                height={45}
                className="mb-4 brightness-0 invert"
              />
              <p className="text-sm text-gray-400 mb-4">
                Ihr zuverlässiger Partner für italienische Lebensmittel im Großhandel. 
                Seit über 30 Jahren beliefern wir Gastronomie und Handel.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Sudimport GmbH</p>
                    <p className="text-gray-400">Werner-Siemens-Straße 29</p>
                    <p className="text-gray-400">22113 Hamburg</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <a href="tel:+494012345678" className="text-gray-400 hover:text-white transition">
                    +49 40 123 456 78
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <a href="mailto:info@sudimport.de" className="text-gray-400 hover:text-white transition">
                    info@sudimport.de
                  </a>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-400">Mo-Fr: 8:00-18:00 Uhr</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Schnellzugriff</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/shop" className="text-gray-400 hover:text-white transition">
                    Katalog
                  </Link>
                </li>
                <li>
                  <Link href="/angebote" className="text-gray-400 hover:text-white transition">
                    Aktuelle Angebote
                  </Link>
                </li>
                <li>
                  <Link href="/neuheiten" className="text-gray-400 hover:text-white transition">
                    Neuheiten
                  </Link>
                </li>
                <li>
                  <Link href="/marken" className="text-gray-400 hover:text-white transition">
                    Unsere Marken
                  </Link>
                </li>
                <li>
                  <Link href="/unternehmen" className="text-gray-400 hover:text-white transition">
                    Über uns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Service */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Service</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/versand" className="text-gray-400 hover:text-white transition">
                    Versand & Lieferung
                  </Link>
                </li>
                <li>
                  <Link href="/zahlungsarten" className="text-gray-400 hover:text-white transition">
                    Zahlungsarten
                  </Link>
                </li>
                <li>
                  <Link href="/reklamation" className="text-gray-400 hover:text-white transition">
                    Reklamation
                  </Link>
                </li>
                <li>
                  <Link href="/kontakt" className="text-gray-400 hover:text-white transition">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-400 hover:text-white transition">
                    Häufige Fragen
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Rechtliches</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/impressum" className="text-gray-400 hover:text-white transition">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/agb" className="text-gray-400 hover:text-white transition">
                    AGB
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="text-gray-400 hover:text-white transition">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-white transition">
                    Cookie-Richtlinie
                  </Link>
                </li>
                <li>
                  <Link href="/widerruf" className="text-gray-400 hover:text-white transition">
                    Widerrufsbelehrung
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="font-semibold text-lg mb-2">Newsletter</h3>
                <p className="text-sm text-gray-400">
                  Bleiben Sie informiert über neue Produkte und Sonderangebote
                </p>
              </div>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Ihre E-Mail-Adresse"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-green-500 transition"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-medium text-sm transition"
                >
                  Abonnieren
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <p className="text-sm text-gray-400">
                  © {currentYear} Sudimport GmbH. Alle Rechte vorbehalten.
                </p>
                
                {/* Social Media */}
                <div className="flex items-center gap-3">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>Zahlungsarten:</span>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs">Rechnung</span>
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs">SEPA</span>
                  <span className="px-2 py-1 bg-gray-800 rounded text-xs">Überweisung</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
