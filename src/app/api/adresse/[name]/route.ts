// src/app/api/adresse/[name]/route.ts - VERSIONE SICURA
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Campi che possono essere aggiornati dall'utente (whitelist)
const ALLOWED_FIELDS = [
  'address_title',
  'address_line1', 
  'address_line2',
  'city',
  'state', 
  'country',
  'pincode',
  'phone',
  'email_id'
];

// Utility per il logging
function logDebug(step: string, data: any) {
  console.log(`[ADDRESS_UPDATE] ${step}:`, JSON.stringify(data, null, 2));
}

export async function PUT(req: NextRequest, context: { params: { name: string } }) {
  const addressName = context.params.name;
  const userEmail = req.headers.get('x-user');
  const body = await req.json();

  logDebug('PUT request received', { addressName, userEmail, body });

  // Validazioni base
  if (!userEmail || !userEmail.includes('@')) {
    return NextResponse.json({ error: 'Email not valid' }, { status: 401 });
  }

  if (!addressName) {
    return NextResponse.json({ error: 'Address name missing' }, { status: 400 });
  }

  if (!body || Object.keys(body).length === 0) {
    return NextResponse.json({ error: 'No data to update' }, { status: 400 });
  }

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. VERIFICA OWNERSHIP: L'utente può modificare questo indirizzo?
    logDebug('Verifying user ownership', { userEmail });
    
    // Recupera il linked_customer dell'utente
    const userRes = await fetch(
      `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(userEmail)}?fields=["linked_customer"]`,
      { headers }
    );
    
    if (!userRes.ok) {
      throw new Error('User fetch failed');
    }
    
    const userData = await userRes.json();
    const linkedCustomer = userData.data?.linked_customer;
    
    logDebug('User data retrieved', { linkedCustomer });
    
    if (!linkedCustomer) {
      return NextResponse.json({ error: 'No linked customer found' }, { status: 403 });
    }

    // 2. VERIFICA che l'indirizzo appartenga al customer dell'utente
    const addressRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Address/${encodeURIComponent(addressName)}?fields=["name","links","link_name","link_doctype"]`,
      { headers }
    );

    if (!addressRes.ok) {
      if (addressRes.status === 404) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
      }
      throw new Error(`Address fetch failed: ${addressRes.status}`);
    }

    const addressData = await addressRes.json();
    const address = addressData.data;
    
    logDebug('Address data retrieved', { address });

    // Verifica ownership tramite Dynamic Links
    const isOwner = address.links?.some((link: any) => 
      link.link_doctype === 'Customer' && link.link_name === linkedCustomer
    ) || address.link_name === linkedCustomer; // Fallback per vecchie versioni

    if (!isOwner) {
      logDebug('Ownership verification failed', { 
        addressLinks: address.links,
        expectedCustomer: linkedCustomer 
      });
      return NextResponse.json({ error: 'Not authorized to modify this address' }, { status: 403 });
    }

    // 3. FILTRA i campi (solo quelli consentiti)
    const filteredBody: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      if (ALLOWED_FIELDS.includes(key)) {
        filteredBody[key] = value;
      } else {
        logDebug('Field blocked', { field: key, value });
      }
    }

    if (Object.keys(filteredBody).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    logDebug('Filtered data to update', filteredBody);

    // 4. VALIDAZIONI specifiche dei campi
    if (filteredBody.address_line1 && filteredBody.address_line1.trim().length < 3) {
      return NextResponse.json({ error: 'Address line 1 is too short' }, { status: 400 });
    }

    if (filteredBody.city && filteredBody.city.trim().length < 2) {
      return NextResponse.json({ error: 'City name is too short' }, { status: 400 });
    }

    if (filteredBody.country && filteredBody.country.trim().length < 2) {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }

    if (filteredBody.email_id && !filteredBody.email_id.includes('@')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // 5. AGGIORNA l'indirizzo
    const updateRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Address/${encodeURIComponent(addressName)}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify(filteredBody),
      }
    );

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      logDebug('Update failed', { status: updateRes.status, error: errorText });
      throw new Error(`ERP responded with ${updateRes.status}: ${errorText}`);
    }

    const updateResult = await updateRes.json();
    
    logDebug('Update successful', { result: updateResult.data });

    return NextResponse.json({
      success: true,
      data: updateResult.data,
      updated_fields: Object.keys(filteredBody)
    });

  } catch (error) {
    logDebug('Error occurred', { error: error instanceof Error ? error.message : error });
    
    return NextResponse.json({
      error: 'Error updating address',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Opzionale: Aggiungi anche GET per recuperare un singolo indirizzo
export async function GET(req: NextRequest, context: { params: { name: string } }) {
  const addressName = context.params.name;
  const userEmail = req.headers.get('x-user');

  if (!userEmail || !userEmail.includes('@')) {
    return NextResponse.json({ error: 'Email not valid' }, { status: 401 });
  }

  if (!addressName) {
    return NextResponse.json({ error: 'Address name missing' }, { status: 400 });
  }

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  try {
    // Stessa logica di verifica ownership del PUT
    const userRes = await fetch(
      `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(userEmail)}?fields=["linked_customer"]`,
      { headers }
    );
    
    if (!userRes.ok) throw new Error('User fetch failed');
    const userData = await userRes.json();
    const linkedCustomer = userData.data?.linked_customer;
    
    if (!linkedCustomer) {
      return NextResponse.json({ error: 'No linked customer found' }, { status: 403 });
    }

    const addressRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Address/${encodeURIComponent(addressName)}`,
      { headers }
    );

    if (!addressRes.ok) {
      if (addressRes.status === 404) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
      }
      throw new Error(`Address fetch failed: ${addressRes.status}`);
    }

    const addressData = await addressRes.json();
    const address = addressData.data;

    // Verifica ownership
    const isOwner = address.links?.some((link: any) => 
      link.link_doctype === 'Customer' && link.link_name === linkedCustomer
    ) || address.link_name === linkedCustomer;

    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorized to view this address' }, { status: 403 });
    }

    return NextResponse.json(address);

  } catch (error) {
    return NextResponse.json({
      error: 'Error fetching address',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Opzionale: DELETE per rimuovere un indirizzo
export async function DELETE(req: NextRequest, context: { params: { name: string } }) {
  const addressName = context.params.name;
  const userEmail = req.headers.get('x-user');

  if (!userEmail || !userEmail.includes('@')) {
    return NextResponse.json({ error: 'Email not valid' }, { status: 401 });
  }

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  try {
    // Stessa verifica ownership
    const userRes = await fetch(
      `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(userEmail)}?fields=["linked_customer"]`,
      { headers }
    );
    
    if (!userRes.ok) throw new Error('User fetch failed');
    const userData = await userRes.json();
    const linkedCustomer = userData.data?.linked_customer;
    
    if (!linkedCustomer) {
      return NextResponse.json({ error: 'No linked customer found' }, { status: 403 });
    }

    // Verifica ownership prima di cancellare
    const addressRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Address/${encodeURIComponent(addressName)}?fields=["links","link_name","link_doctype"]`,
      { headers }
    );

    if (!addressRes.ok) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    const addressData = await addressRes.json();
    const address = addressData.data;

    const isOwner = address.links?.some((link: any) => 
      link.link_doctype === 'Customer' && link.link_name === linkedCustomer
    ) || address.link_name === linkedCustomer;

    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorized to delete this address' }, { status: 403 });
    }

    // Cancella l'indirizzo
    const deleteRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Address/${encodeURIComponent(addressName)}`,
      { method: 'DELETE', headers }
    );

    if (!deleteRes.ok) {
      throw new Error(`Delete failed: ${deleteRes.status}`);
    }

    return NextResponse.json({ success: true, message: 'Address deleted' });

  } catch (error) {
    return NextResponse.json({
      error: 'Error deleting address',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
