// src/app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';

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

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verifica se l'utente è già loggato
  useEffect(() => {
    const checkExistingAuth = () => {
      const userEmail = getCookie('user_email');
      const sid = getCookie('sid');
      
      console.log('🔍 Controllo autenticazione esistente:', { userEmail, hasSid: !!sid });
      
      if (userEmail && userEmail.includes('@') && sid) {
        console.log('✅ Utente già loggato, redirect a /user');
        toast.success('Bereits eingeloggt!');
        setTimeout(() => {
          window.location.href = '/user';
        }, 1000);
        return;
      }
      
      // Controlla anche localStorage per compatibilità
      const localUser = localStorage.getItem('username');
      if (localUser && localUser.includes('@')) {
        console.log('⚠️ Login trovato in localStorage, redirect a /user');
        toast.info('Session gefunden, weiterleitung...');
        setTimeout(() => {
          window.location.href = '/user';
        }, 1000);
        return;
      }
      
      setIsCheckingAuth(false);
    };

    checkExistingAuth();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error('Bitte füllen Sie alle Felder aus.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Tentativo di login per:', formData.email);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          usr: formData.email,
          pwd: formData.password
        }),
      });

      const data = await response.json();
      console.log('📝 Risposta login:', data);

      if (response.ok) {
        toast.success('Login erfolgreich!');
        
        // Salva anche in localStorage per compatibilità
        localStorage.setItem('username', data.user || formData.email);
        
        console.log('✅ Login riuscito, redirect in corso...');
        
        // Redirect dopo un breve delay
        setTimeout(() => {
          window.location.href = '/user';
        }, 1500);
      } else {
        toast.error(data.message || 'Login fehlgeschlagen.');
      }
    } catch (error) {
      console.error('❌ Errore durante il login:', error);
      toast.error('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Mostra loading durante il controllo autenticazione
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Überprüfung der Anmeldung...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Anmelden
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Melden Sie sich mit Ihren Zugangsdaten an
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="ihre@email.de"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Ihr Passwort"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Anmelden...
                </div>
              ) : (
                'Anmelden'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Noch kein Konto?{' '}
              <Link href="/registrieren" className="font-medium text-green-600 hover:text-green-500">
                Hier registrieren
              </Link>
            </p>
          </div>
        </form>
      </div>
      
      <Toaster position="top-right" />
    </div>
  );
}
