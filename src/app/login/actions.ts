'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const loginId = (formData.get('email') as string).trim();
  const password = formData.get('password') as string;

  // 1️⃣ login a ERPNext
  const res = await fetch(`${process.env.ERP_URL}/api/method/login`, {
    method: 'POST',
    body: new URLSearchParams({ usr: loginId, pwd: password }),
    credentials: 'include',
  });

  if (!res.ok) {
    return { error: 'Fehlerhafte Anmeldung.' };
  }

  // 2️⃣ prendi session ID
  const sid = res.headers
    .getSetCookie()
    ?.find((c) => c.startsWith('sid='))!
    .split(';')[0]
    .split('=')[1];
  cookies().set({ name: 'sid', value: sid, path: '/', httpOnly: true });

  // 3️⃣ ottieni email reale
  let email = loginId;
  if (!loginId.includes('@')) {
    const who = await fetch(`${process.env.ERP_URL}/api/method/frappe.auth.get_logged_user`, {
      headers: { Cookie: `sid=${sid}` }
    }).then(r => r.json());
    email = who.message || loginId;
  }

  // 4️⃣ leggi il linked_customer dal Doctype User
  let customer: string | null = null;
  try {
    const u = await fetch(`${process.env.ERP_URL}/api/resource/User/${email}?fields=["linked_customer"]`, {
      headers: {
        Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`
      }
    }).then(r => r.json());
    customer = u.data?.linked_customer || null;
  } catch {}

  // 5️⃣ salva cookie personalizzati
  cookies().set({ name: 'user', value: email, path: '/' });
  cookies().set({ name: 'user_email', value: email, path: '/' });
  if (customer) cookies().set({ name: 'customer', value: customer, path: '/' });

  redirect('/shop');
}
