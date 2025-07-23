'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const loginId = (formData.get('email') as string).trim();
  const password = formData.get('password') as string;

  /* 1️⃣ login ERPNext */
  const res = await fetch(`${process.env.ERP_URL}/api/method/login`, {
    method: 'POST',
    body: new URLSearchParams({ usr: loginId, pwd: password }),
    credentials: 'include',
  });
  if (!res.ok) {
    return { error: 'Fehlerhafte Anmeldung.' };
  }

  /* 2️⃣ cookie sid */
  const sid = res.headers
    .getSetCookie()
    ?.find((c) => c.startsWith('sid='))!
    .split(';')[0]
    .split('=')[1];
  cookies().set({ name: 'sid', value: sid, path: '/' });

  /* 3️⃣ email completa */
  let email = loginId;
  if (!loginId.includes('@')) {
    const who = await fetch(
      `${process.env.ERP_URL}/api/method/frappe.auth.get_logged_user`,
      { headers: { Cookie: `sid=${sid}` } }
    ).then((r) => r.json());
    email = who.message || loginId;
  }

  /* 4️⃣ customer (se esiste) */
  let customer: string | null = null;
  try {
    const c = await fetch(
      `${process.env.ERP_URL}/api/resource/Customer?filters=${encodeURIComponent(
        JSON.stringify([['email', '=', email]])
      )}`,
      {
        headers: {
          Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
        },
      }
    ).then((r) => r.json());
    customer = c.data?.[0]?.name || null;
  } catch {}

  /* 5️⃣ cookie user + customer */
  cookies().set({ name: 'user', value: email, path: '/' });
  if (customer) cookies().set({ name: 'customer', value: customer, path: '/' });

  redirect('/shop');
}
