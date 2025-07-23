'use client';

import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showReset, setShowReset] = useState(false);

  // 🔁 Redirect se già loggato
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch('https://gestionale.sudimport.website/api/method/frappe.auth.get_logged_user', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.message && data.message !== 'Guest') {
          window.location.href = '/shop';
        }
      } catch (err) {
        console.error('Errore verifica login:', err);
      }
    };

    checkLogin();
  }, []);

  const handleLogin = async () => {
    setError('');
    setSuccessMessage('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ usr: email, pwd: password }),
      });

      if (res.ok) {
        const data = await res.json();
        const username = email.split('@')[0];
        localStorage.setItem('username', username); // ✅ Salva nome utente
        window.location.href = '/shop';
      } else {
        const err = await res.json();
        setError(err.message || 'Fehlerhafte Anmeldung. Bitte überprüfen Sie Ihre Daten.');
      }
    } catch (err) {
      setError('Serverfehler. Bitte versuchen Sie es später erneut.');
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setSuccessMessage('');
    try {
      const res = await fetch('https://gestionale.sudimport.website/api/method/frappe.core.doctype.user.user.reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: resetEmail }),
      });

      const data = await res.json();
      if (data.message === 'Password reset instructions have been sent to your email') {
        setSuccessMessage('✅ Email zum Zurücksetzen wurde gesendet.');
        setResetEmail('');
      } else {
        setError(data.message || 'Fehler beim Zurücksetzen.');
      }
    } catch (err) {
      setError('Serverfehler beim Zurücksetzen.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded shadow">
      <h1 className="text-3xl font-bold mb-6 text-black">Anmeldung</h1>

      <input
        type="email"
        placeholder="Email-Adresse"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 mb-4 border bg-blue-50"
      />

      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 mb-4 border bg-blue-50"
      />

      <button
        onClick={handleLogin}
        className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
      >
        Anmelden
      </button>

      <div className="text-center mt-4">
        <button
          className="text-blue-600 hover:underline text-sm"
          onClick={() => setShowReset(!showReset)}
        >
          Passwort vergessen?
        </button>
      </div>

      {showReset && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <input
            type="email"
            placeholder="Email-Adresse für Reset"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full p-3 mb-3 border"
          />
          <button
            onClick={handlePasswordReset}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Passwort zurücksetzen
          </button>
        </div>
      )}

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {successMessage && (
        <div
          className="mt-4 p-3 border border-green-600 bg-green-50 text-green-800 rounded text-sm flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          ✅ {successMessage}
        </div>
      )}

      <div className="text-center mt-6 text-sm text-black">
        Noch kein Konto?{' '}
        <a href="/registrieren" className="text-green-600 hover:underline">
          Jetzt registrieren
        </a>
      </div>
    </div>
  );
}
