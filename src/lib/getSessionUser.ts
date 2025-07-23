export async function getSessionUser(): Promise<string | null> {
  try {
    const res = await fetch('https://gestionale.sudimport.website/api/method/frappe.auth.get_logged_user', {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.message;
  } catch (err) {
    console.error('Errore sessione utente:', err);
    return null;
  }
}
