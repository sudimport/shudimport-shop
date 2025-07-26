// src/components/Header.tsx
'use client';

import { toast } from 'sonner';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import MainMenu from './MainMenu';
import { useEffect, useState } from 'react';

// Funzione helper per leggere cookie dal client
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [customer, setCustomer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAuth = () => {
      // Controlla cookie user_email
      const email = getCookie('user_email');
      const customerData = getCookie('customer');
      
      console.log('🍪 Header - Cookie user_email:', email);
      console.log('🍪 Header - Cookie customer:', customerData);
      
      if (email && email.includes('@')) {
        setUserEmail(email);
        setCustomer(customerData);
      } else {
        // Fallback: controlla localStorage
        const localUser = localStorage.getItem('username');
        if (localUser && localUser.includes('@')) {
          console.log('⚠️ Header - Usando localStorage:', localUser);
          setUserEmail(localUser);
        }
      }
      
      setLoading(false);
    };

    checkUserAuth();
    
    // Ricontrolla ogni 5 secondi per aggiornamenti
    const interval = setInterval(checkUserAuth, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      console.log('🚪 Tentativo di logout...');
      
      const response = await fetch('/api/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
      
      if (response.ok) {
        toast.success('✅ Logout erfolgreich');
        
        // Pulisci tutti i dati di sessione
        setUserEmail(null);
        setCustomer(null);
        localStorage.removeItem('username');
        
        // Pulisci manualmente i cookie (fallback)
        document.cookie = 'user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'customer=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        console.log('✅ Logout completato, redirect in corso...');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1200);
      } else {
        throw new Error('Logout failed');
      }
    } catch (err) {
      console.error('❌ Errore durante logout:', err);
      toast.error('Fehler beim Logout');
    }
  };

  const displayName = userEmail ? userEmail.split('@')[0] : null;

  return (
    <header className="bg-white shadow flex flex-col gap-2">
      {/* Top bar: Logo + Login + Suche + Carrello */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-sudimport.jpg"
              alt="Sudimport Logo"
              width={180}
              height={40}
              priority
            />
          </Link>
        </div>

        {/* Right zone */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          {!loading && userEmail ? (
            <>
              {/* Menu utente loggato */}
              <Link href="/user" className="text-green-700 font-medium hover:underline">
                👤 Profil
              </Link>
              
              {customer && (
                <Link href="/preise" className="hover:underline">
                  💶 Meine Preise
                </Link>
              )}
              
              <Link href="/rechnungen" className="hover:underline">
                📄 Rechnungen
              </Link>

              {/* Nome utente */}
              <Link href="/user" className="text-green-700 font-medium hover:underline flex items-center gap-1">
                <FaUser className="text-green-700" />
                <span className="max-w-32 truncate">{displayName}</span>
              </Link>
              
              {customer && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {customer}
                </span>
              )}
              
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:underline hover:text-red-600 text-xs"
              >
                Logout
              </button>
            </>
          ) : loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-1 hover:text-green-700">
              <FaUser />
              <span>Anmelden</span>
            </Link>
          )}

          {/* Ricerca */}
          <input
            type="text"
            placeholder="Suche"
            className="w-40 md:w-52 border border-gray-400 px-3 py-1 rounded-full text-sm focus:outline-none focus:border-green-500"
          />

          {/* Lingua */}
          <div className="flex gap-1 items-center text-xs">
            <span className="cursor-pointer hover:underline text-green-600 font-medium">DE</span>
            <span>/</span>
            <span className="cursor-pointer hover:underline">IT</span>
          </div>

          {/* Carrello */}
          <Link href="/cart" className="hover:text-green-700 text-xl">
            <FaShoppingCart />
          </Link>
        </div>
      </div>

      {/* Menu navigazione verde */}
      <MainMenu />
    </header>
  );
}
