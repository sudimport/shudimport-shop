export default defineEventHandler(async (event) => {
  const cookie = getCookie(event, 'sid');
  if (!cookie) {
    return { error: 'Utente non loggato' };
  }

  const ERP_URL = process.env.ERP_URL || 'https://gestionale.sudimport.website';

  // 1. Recupera l'utente loggato da ERPNext
  const userRes = await fetch(`${ERP_URL}/api/method/frappe.auth.get_logged_user`, {
    headers: {
      Cookie: `sid=${cookie}`
    }
  });

  if (!userRes.ok) {
    return { error: 'Sessione non valida' };
  }

  const userData = await userRes.json();
  const email = userData.message;

  // 2. Recupera i dati completi dell'utente
  const fullRes = await fetch(`${ERP_URL}/api/resource/User/${email}`, {
    headers: {
      Cookie: `sid=${cookie}`
    }
  });

  if (!fullRes.ok) {
    return { error: 'Utente non trovato' };
  }

  const full = await fullRes.json();
  return {
    email,
    full_name: full.data.full_name,
    linked_customer: full.data.linked_customer || null
  };
});
