'use client';

import { toast } from 'sonner';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import MainMenu from './MainMenu';
import { useEffect, useState } from 'react';

export default function Header() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) {
      setUsername(savedUser);
    }

    const checkLogin = async () => {
      try {
        const res = await fetch('https://gestionale.sudimport.website/api/method/frappe.auth.get_logged_user', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.message && data.message !== 'Guest') {
          const user = data.message.split('@')[0];
          setUsername(user);
          localStorage.setItem('username', user);
        } else {
          if (!localStorage.getItem('username')) {
            setUsername(null);
          }
        }
      } catch (error) {
        console.error('Login-Fehler:', error);
      }
    };

    checkLogin();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      toast.success('✅ Logout erfolgreich');
      setUsername(null);
      localStorage.removeItem('username');
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error('Fehler beim Logout');
    }
  };

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
          {username ? (
            <>
              {/* Nuove voci visibili solo se loggato */}
              <Link href="/user" className="text-green-700 font-medium hover:underline">👤 Profil</Link>
              <Link href="/preise" className="hover:underline">💶 Meine Preise</Link>
              <Link href="/rechnungen" className="hover:underline">📄 Rechnungen</Link>

              {/* Nome utente e logout */}
              <Link href="/user" className="text-green-700 font-medium hover:underline flex items-center gap-1">
                <FaUser className="text-green-700" />
                {username}
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:underline hover:text-red-600"
              >
                Logout
              </button>
            </>
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
            className="w-40 md:w-52 border border-gray-400 px-3 py-1 rounded-full text-sm focus:outline-none"
          />

          {/* Lingua */}
          <div className="flex gap-1 items-center text-xs">
            <span className="cursor-pointer hover:underline">DE</span>
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
