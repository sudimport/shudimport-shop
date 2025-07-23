import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Estrai i valori dal body della request
    const {
      vorname,
      nachname,
      firma,
      telefon,
      adresse,
      plz,
      ort,
      land,
      email,
    } = await req.json();

    // Prepara il payload da inviare a ERPNext
    const payload = {
      first_name: vorname,
      last_name: nachname,
      company: firma || "",
      phone: telefon || "",
      email: email,
      address: adresse || "",
      cap: plz || "",
      citta: ort || "",
      country: land || "Germany",
    };

    console.log("Invio dati a ERPNext:", payload);

    const response = await fetch('https://gestionale.sudimport.website/api/method/nexterp_customizations.api.register_customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // nessun token necessario per allow_guest
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Risposta ERPNext:", data);

    if (!response.ok || data.exc_type || data.exception) {
      let msg = data.message || data._server_messages || data.exception || "Registrierung fehlgeschlagen.";
      if (typeof msg === "string" && msg.startsWith("[") && msg.includes("message")) {
        try {
          const arr = JSON.parse(msg);
          msg = JSON.parse(arr[0]).message || msg;
        } catch (e) {}
      }
      return NextResponse.json({ message: msg }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Registrierung erfolgreich. Wir prüfen Ihre Daten und geben den Zugang frei.'
    });

  } catch (error) {
    console.error('Errore:', error);
    return NextResponse.json({ message: 'Serverfehler bei der Registrierung.' }, { status: 500 });
  }
}
