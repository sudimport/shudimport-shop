// src/app/zugang/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import Link from 'next/link';
import { FaUser, FaCheckCircle, FaExclamationTriangle, FaHeart, FaShoppingCart } from 'react-icons/fa';

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

export default function ZugangPage() {
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [linkedCustomer, setLinkedCustomer] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const email = getCookie('user_email');
      const customer = getCookie('customer');

      if (!email || !email.includes('@')) {
        toast.error('Sie müssen angemeldet sein.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      setUserEmail(email);
      
      // Verifica se c'è già un cliente collegato
      if (customer) {
        setLinkedCustomer(customer);
      } else {
        // Controlla su ERP
        try {
          const response = await fetch(`/api/user-details?email=${encodeURIComponent(email)}`);
          if (response.ok) {
            const data = await response.json();
            setLinkedCustomer(data.linkedCustomer);
          }
        } catch (error) {
          console.error('Errore nel controllo cliente:', error);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleConfirmAccess = async () => {
    if (!userEmail) return;

    setConfirming(true);
    try {
      const response = await fetch('/api/confirm-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });

      const data = await response.json();

      if (response.ok && data.linkedCustomer) {
        toast.success('✅ Zugang bestätigt! Kunde erfolgreich verknüpft.');
        setLinkedCustomer(data.linkedCustomer);
        
        // Redirect al profilo dopo 3 secondi
        setTimeout(() => {
          window.location.href = '/user';
        }, 3000);
      } else {
        toast.error(data.message || 'Fehler beim Bestätigen des Zugangs.');
      }
    } catch (error) {
      console.error('❌ Errore nella conferma accesso:', error);
      toast.error('Netzwerkfehler beim Bestätigen.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar sinistra */}
      <aside className="w-full md:w-64 bg-gray-100 p-4 space-y-3 border-r border-gray-200">
        <h2 className="text-lg font-semibold text-green-700 mb-4">Profil</h2>
        
        <ul className="space-y-2 text-sm text-gray-700">
          <li><Link href="/user" className="hover:underline">👤 Profil</Link></li>
          <li><Link href="/password" className="hover:underline">🔑 Passwort ändern</Link></li>
          <li><Link href="/bestellungen" className="hover:underline">📦 Bestellungen</Link></li>
          <li><Link href="/dokumente" className="hover:underline">📄 Dokumente</Link></li>
          <li><Link href="/anomalien" className="hover:underline">⚠️ Anomalien</Link></li>
          <li><Link href="/adresse" className="hover:underline">🏠 Adresse</Link></li>
          <li><span className="font-medium text-green-700">✅ Zugang bestätigen</span></li>
          
          {/* Sezioni Liste */}
          <div className="border-t pt-3 mt-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">Listen</h3>
            <li><Link href="/wunschliste" className="hover:underline flex items-center gap-1"><FaHeart className="text-red-500" /> Wunschliste</Link></li>
            <li><Link href="/einkaufliste" className="hover:underline flex items-center gap-1"><FaShoppingCart className="text-blue-500" /> Einkaufliste</Link></li>
          </div>
          
          {linkedCustomer && (
            <div className="border-t pt-3 mt-4">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Kunde</h3>
              <li><Link href="/preise" className="hover:underline">💰 Meine Preise</Link></li>
            </div>
          )}
        </ul>
      </aside>

      {/* Contenuto principale */}
      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Zugang bestätigen</h1>

          {linkedCustomer ? (
            // Cliente già collegato
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FaCheckCircle className="text-green-500 text-2xl mr-3" />
                <h2 className="text-lg font-semibold text-green-800">Zugang bereits bestätigt</h2>
              </div>
              
              <div className="space-y-3">
                <p className="text-green-700">
                  <strong>E-Mail:</strong> {userEmail}
                </p>
                <p className="text-green-700">
                  <strong>Verknüpfter Kunde:</strong> <span className="font-medium">{linkedCustomer}</span>
                </p>
                <p className="text-sm text-green-600">
                  Ihr Zugang ist bereits bestätigt. Sie können nun Ihre personalisierten Preise im Shop einsehen.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Link 
                  href="/user" 
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Zum Profil
                </Link>
                <Link 
                  href="/shop" 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Zum Shop
                </Link>
              </div>
            </div>
          ) : (
            // Cliente non ancora collegato
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <FaExclamationTriangle className="text-yellow-500 text-2xl mr-3" />
                <h2 className="text-lg font-semibold text-yellow-800">Zugang bestätigen erforderlich</h2>
              </div>

              <div className="space-y-4">
                <p className="text-yellow-700">
                  <strong>E-Mail:</strong> {userEmail}
                </p>
                <p className="text-yellow-700">
                  <strong>Status:</strong> Kunde noch nicht verknüpft
                </p>
                
                <div className="bg-white p-4 rounded border border-yellow-300">
                  <h3 className="font-medium text-gray-900 mb-2">Warum muss ich meinen Zugang bestätigen?</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Um Ihre personalisierten Preise anzuzeigen</li>
                    <li>• Um auf Ihre Bestellhistorie zuzugreifen</li>
                    <li>• Um Rechnungen und Dokumente einzusehen</li>
                    <li>• Um das volle Kundenerlebnis zu nutzen</li>
                  </ul>
                </div>

                <button
                  onClick={handleConfirmAccess}
                  disabled={confirming}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {confirming ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Bestätige Zugang...
                    </span>
                  ) : (
                    '✅ Zugang jetzt bestätigen'
                  )}
                </button>

                <p className="text-xs text-gray-600 text-center">
                  Durch das Bestätigen wird Ihr Konto mit den entsprechenden Kundendaten verknüpft.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Notifiche toast */}
      <Toaster position="top-right" />
    </div>
  );
}
