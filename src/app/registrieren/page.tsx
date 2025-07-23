'use client';

import { useState } from 'react';

export default function RegistrierenPage() {
  const [formData, setFormData] = useState({
    vorname: '',
    nachname: '',
    firma: '',
    telefon: '',
    adresse: '',
    plz: '',
    ort: '',
    email: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    setError('');
    setSuccess(false);

    // Campi obbligatori
    if (!formData.vorname || !formData.nachname || !formData.email || !formData.plz || !formData.ort) {
      setError('Bitte füllen Sie alle Pflichtfelder aus (Vorname, Nachname, E-Mail, PLZ, Ort).');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          vorname: '',
          nachname: '',
          firma: '',
          telefon: '',
          adresse: '',
          plz: '',
          ort: '',
          email: '',
        });
      } else {
        const err = await res.json();
        setError(err.message || 'Registrierung fehlgeschlagen.');
      }
    } catch (err) {
      setError('Serverfehler. Bitte versuchen Sie es später erneut.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded shadow">
      <h1 className="text-3xl font-bold mb-6">Registrieren</h1>

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="vorname"
          placeholder="Vorname*"
          value={formData.vorname}
          onChange={handleChange}
          className="p-3 border"
          required
        />
        <input
          type="text"
          name="nachname"
          placeholder="Nachname*"
          value={formData.nachname}
          onChange={handleChange}
          className="p-3 border"
          required
        />
        <input
          type="text"
          name="firma"
          placeholder="Firmenname (optional)"
          value={formData.firma}
          onChange={handleChange}
          className="p-3 border col-span-2"
        />
        <input
          type="text"
          name="telefon"
          placeholder="Telefonnummer"
          value={formData.telefon}
          onChange={handleChange}
          className="p-3 border col-span-2"
        />
        <input
          type="text"
          name="adresse"
          placeholder="Adresse (optional)"
          value={formData.adresse}
          onChange={handleChange}
          className="p-3 border col-span-2"
        />
        <input
          type="text"
          name="plz"
          placeholder="PLZ / CAP*"
          value={formData.plz}
          onChange={handleChange}
          className="p-3 border"
          required
        />
        <input
          type="text"
          name="ort"
          placeholder="Ort / Città*"
          value={formData.ort}
          onChange={handleChange}
          className="p-3 border"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-Mail-Adresse*"
          value={formData.email}
          onChange={handleChange}
          className="p-3 border col-span-2"
          required
        />
      </div>

      <p className="text-sm mt-4 text-gray-700">
        Nach der Registrierung prüfen wir Ihre Angaben und schalten Ihren Zugang frei. Sie erhalten dann eine E-Mail zur Festlegung des Passworts.
      </p>

      <button
        onClick={handleRegister}
        className="w-full bg-green-600 text-white py-3 mt-6 rounded hover:bg-green-700"
      >
        Registrieren
      </button>

      {success && <p className="text-green-600 mt-4">Registrierung erfolgreich! Bitte warten Sie auf Bestätigung.</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
