async function login(email: string, password: string) {
  console.log('[useErpAuth] 🔑 Chiamo login con', email)
  const res = await fetch(`${ERP_URL}/api/method/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usr: email, pwd: password }),
    credentials: 'include',            // << fondamentale
  })

  console.log('[useErpAuth] 📬 Response status:', res.status)
  console.log('[useErpAuth] 📬 Response headers:', Array.from(res.headers.entries()))

  const data = await res.json()
  if (!res.ok) {
    console.error('[useErpAuth] ❌ Login failed', data)
    throw new Error(data.message || 'Login fehlgeschlagen')
  }

  const sc = res.headers.get('set-cookie')
  console.log('[useErpAuth] 🍪 set-cookie header:', sc)

  const match = sc?.match(/sid=([^;]+);/)
  if (match) {
    sid.value = match[1]
    console.log('[useErpAuth] ✅ Salvato sid=', sid.value)
  } else {
    console.warn('[useErpAuth] ⚠️ Non ho trovato sid nel set-cookie')
  }
}
