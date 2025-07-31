'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FaUser, 
  FaBars, 
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaSearch,
  FaChevronDown
} from 'react-icons/fa';
import MainMenu from './MainMenu';
import SearchPopover from './SearchPopover';
import CartIcon from './CartIcon';
import CartSidebar from './CartSidebar';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [customer, setCustomer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const checkUserAuth = () => {
      const email = getCookie('user_email');
      const customerData = getCookie('customer');

      if (email && email.includes('@')) {
        setUserEmail(email);
        setCustomer(customerData);
      } else {
        const localUser = localStorage.getItem('username');
        if (localUser && localUser.includes('@')) {
          setUserEmail(localUser);
        }
      }

      setLoading(false);
    };

    checkUserAuth();
    const interval = setInterval(checkUserAuth, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuOpen && !(e.target as HTMLElement).closest('.user-dropdown')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      if (res.ok) {
        toast.success('Logout erfolgreich');
        setUserEmail(null);
        setCustomer(null);
        localStorage.removeItem('username');
        ['user_email','customer','sid'].forEach(c => document.cookie = `${c}=;expires=Thu,01 Jan 1970 00:00:00 UTC;path=/;`);
        setTimeout(() => window.location.href='/',1000);
      } else throw new Error();
    } catch {
      toast.error('Fehler beim Logout');
    }
  };

  const displayName = userEmail?.split('@')[0] || '';
  const navigationLinks = [
    { href: '/', label: 'Startseite' },
    { href: '/unternehmen', label: 'Unternehmen' },
    { href: '/versand', label: 'Versand' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  return (
    <>
      {/* Top Info Bar */}
      <div className="hidden sm:block bg-gray-50 text-xs text-gray-600 border-b">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex justify-between">
          <div className="flex items-center gap-4">
            <a href="tel:+494012345678" className="flex items-center gap-1 hover:text-green-700">
              <FaPhone className="text-[10px]"/>
              <span>+49 40 123 456 78</span>
            </a>
            <a href="mailto:info@sudimport.de" className="hidden md:flex items-center gap-1 hover:text-green-700">
              <FaEnvelope className="text-[10px]"/>
              <span>info@sudimport.de</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-700 font-semibold">Versandkostenfrei ab 500€ (B2B)</span>
            <span className="text-gray-500">|</span>
            <span>Mo-Fr: 8:00-18:00 Uhr</span>
          </div>
        </div>
      </div>

      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex justify-between items-center">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 hover:bg-gray-100 rounded"
          >
            {mobileMenuOpen ? <FaTimes/> : <FaBars/>}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo-sudimport.jpg" 
              alt="Sudimport" 
              width={160} 
              height={40} 
              priority 
              className="h-10 md:h-12"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-6 text-sm font-medium">
            {navigationLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="hover:text-green-700 transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Search */}
            <div className="hidden md:block w-64 lg:w-96">
              <SearchPopover />
            </div>
            
            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="md:hidden p-2 hover:bg-gray-100 rounded"
            >
              <FaSearch/>
            </button>

            {/* Language */}
            <select className="hidden sm:block border px-2 py-1 rounded focus:border-green-500">
              <option value="de">DE 🇩🇪</option>
              <option value="it" disabled>IT 🇮🇹</option>
            </select>

            {/* User Menu */}
            {!loading && userEmail ? (
              <div className="relative user-dropdown">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }} 
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                >
                  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block truncate max-w-[100px]">
                    {displayName}
                  </span>
                  <FaChevronDown className={`hidden sm:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}/>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="truncate font-medium">{userEmail}</p>
                      {customer && (
                        <p className="truncate text-xs text-gray-500">{customer}</p>
                      )}
                    </div>
                    <Link href="/user" className="block px-4 py-2 hover:bg-gray-50 transition-colors">
                      Mein Profil
                    </Link>
                    <Link href="/bestellungen" className="block px-4 py-2 hover:bg-gray-50 transition-colors">
                      Bestellungen
                    </Link>
                    <Link href="/preise" className="block px-4 py-2 hover:bg-gray-50 transition-colors">
                      Meine Preise
                    </Link>
                    <Link href="/rechnungen" className="block px-4 py-2 hover:bg-gray-50 transition-colors">
                      Rechnungen
                    </Link>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Abmelden
                    </button>
                  </div>
                )}
              </div>
            ) : loading ? (
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <Link 
                href="/login" 
                className="flex items-center gap-1 p-2 hover:text-green-700 transition-colors"
              >
                <FaUser/>
                <span className="hidden sm:inline">Anmelden</span>
              </Link>
            )}

            {/* Dynamic Cart Icon */}
            <CartIcon />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden px-4 py-2 border-t">
            <SearchPopover />
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-white w-80 h-full shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b">
                <Image src="/logo-sudimport.jpg" alt="Sudimport" width={140} height={35}/>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="p-4">
                {navigationLinks.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className="block py-3 hover:text-green-700 transition-colors border-b border-gray-100 last:border-0" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile User Section */}
              {userEmail && (
                <div className="p-4 border-t">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium truncate">{displayName}</p>
                      <p className="text-sm text-gray-500">Angemeldet</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Link 
                      href="/user" 
                      className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mein Profil
                    </Link>
                    <Link 
                      href="/bestellungen" 
                      className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Bestellungen
                    </Link>
                    <Link 
                      href="/cart" 
                      className="block py-2 px-3 rounded hover:bg-gray-100 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Warenkorb
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }} 
                      className="block w-full text-left py-2 px-3 rounded text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Abmelden
                    </button>
                  </div>
                </div>
              )}
              
              {/* Mobile Info */}
              <div className="p-4 text-sm text-gray-600 border-t">
                <p className="font-semibold text-green-700 mb-2">B2B Großhandel</p>
                <p>Versandkostenfrei ab 500€</p>
                <p className="mt-2">Mo-Fr: 8:00-18:00 Uhr</p>
                <a 
                  href="tel:+494012345678" 
                  className="block mt-2 text-green-700 hover:text-green-800 transition-colors"
                >
                  <FaPhone className="inline mr-2"/>
                  +49 40 123 456 78
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Menu */}
        <MainMenu />
      </header>

      {/* Cart Sidebar */}
      <CartSidebar />
    </>
  );
}
