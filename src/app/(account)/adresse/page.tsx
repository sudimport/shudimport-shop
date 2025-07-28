'use client';

import { useEffect, useState } from 'react';

type Address = {
  name?: string;
  address_title: string;
  address_line1: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  email_id?: string;
};

export default function AdressePage() {
  const [billing, setBilling] = useState<Address | null>(null);
  const [shipping, setShipping] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<'billing' | 'shipping' | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const email = localStorage.getItem('username');
    if (!email) {
      setError('Email non trovata');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/adresse', {
        headers: { 'x-user': email } 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setBilling(data.billing);
      setShipping(data.shipping);
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError('Errore nel caricamento degli indirizzi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: 'billing' | 'shipping') => {
    const addressToEdit = type === 'billing' ? billing : shipping;
    setEditingAddress(addressToEdit ? { ...addressToEdit } : {
      address_title: type === 'billing' ? 'Rechnungsadresse' : 'Lieferadresse',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'Deutschland',
      phone: '',
      email_id: '',
    });
    setEditingType(type);
  };

  const handleSave = async () => {
    if (!editingAddress || !editingType) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/save-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': localStorage.getItem('username') || '',
        },
        body: JSON.stringify({ 
          type: editingType, 
          address: editingAddress 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const savedAddress = await response.json();
      
      // Aggiorna lo stato locale
      if (editingType === 'billing') {
        setBilling(savedAddress);
      } else {
        setShipping(savedAddress);
      }
      
      setEditingType(null);
      setEditingAddress(null);
      
    } catch (err) {
      console.error('Error saving address:', err);
      setError(`Errore nel salvataggio: ${err instanceof Error ? err.message : 'Sconosciuto'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingType(null);
    setEditingAddress(null);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Address) => {
    if (!editingAddress) return;
    setEditingAddress({ 
      ...editingAddress, 
      [field]: e.target.value 
    });
  };

  const renderAddressForm = (address: Address) => (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <input
        type="text"
        value={address.address_title || ''}
        onChange={(e) => handleChange(e, 'address_title')}
        placeholder="Titel"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
        required
      />
      <input
        type="text"
        value={address.address_line1 || ''}
        onChange={(e) => handleChange(e, 'address_line1')}
        placeholder="Straße und Hausnummer"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
        required
      />
      <input
        type="text"
        value={address.address_line2 || ''}
        onChange={(e) => handleChange(e, 'address_line2')}
        placeholder="Zusätzliche Adresszeile (optional)"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={address.pincode || ''}
          onChange={(e) => handleChange(e, 'pincode')}
          placeholder="PLZ"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <input
          type="text"
          value={address.city || ''}
          onChange={(e) => handleChange(e, 'city')}
          placeholder="Stadt"
          className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>
      <input
        type="text"
        value={address.state || ''}
        onChange={(e) => handleChange(e, 'state')}
        placeholder="Bundesland"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <input
        type="text"
        value={address.country || ''}
        onChange={(e) => handleChange(e, 'country')}
        placeholder="Land"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
        required
      />
      <input
        type="tel"
        value={address.phone || ''}
        onChange={(e) => handleChange(e, 'phone')}
        placeholder="Telefonnummer (optional)"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <input
        type="email"
        value={address.email_id || ''}
        onChange={(e) => handleChange(e, 'email_id')}
        placeholder="E-Mail (optional)"
        className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Speichere...' : 'Änderungen speichern'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );

  const renderAddressDisplay = (address: Address | null) => {
    if (!address) {
      return (
        <div className="text-gray-500 italic">
          Keine Adresse hinterlegt
        </div>
      );
    }

    return (
      <address className="not-italic text-gray-800 space-y-1">
        <div><strong>{address.address_title}</strong></div>
        <div>{address.address_line1}</div>
        {address.address_line2 && <div>{address.address_line2}</div>}
        <div>
          {address.pincode && `${address.pincode} `}
          {address.city}
          {address.state && `, ${address.state}`}
        </div>
        <div>{address.country}</div>
        {address.phone && <div>☎️ {address.phone}</div>}
        {address.email_id && <div>✉️ {address.email_id}</div>}
      </address>
    );
  };

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 italic">Lade Adressen...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      <h1 className="text-2xl font-bold">🏠 Adressen</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rechnungsadresse */}
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Rechnungsadresse</h2>
          
          {editingType === 'billing' && editingAddress ? 
            renderAddressForm(editingAddress) :
            renderAddressDisplay(billing)
          }
          
          {editingType !== 'billing' && (
            <button
              onClick={() => handleEdit('billing')}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              ✏️ {billing ? 'Adresse bearbeiten' : 'Adresse hinzufügen'}
            </button>
          )}
        </div>

        {/* Lieferadresse */}
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Lieferadresse</h2>
          
          {editingType === 'shipping' && editingAddress ? 
            renderAddressForm(editingAddress) :
            renderAddressDisplay(shipping)
          }
          
          {editingType !== 'shipping' && (
            <button
              onClick={() => handleEdit('shipping')}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              ✏️ {shipping ? 'Adresse bearbeiten' : 'Adresse hinzufügen'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}


