<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white p-6 rounded shadow">
      <h1 class="text-2xl font-bold mb-4 text-center">🔐 Sudimport – Login</h1>

      <form v-if="!user" @submit.prevent="doLogin">
        <input v-model="email" type="email" placeholder="E-Mail" class="w-full mb-3 p-2 border rounded" required />
        <input v-model="password" type="password" placeholder="Passwort" class="w-full mb-3 p-2 border rounded" required />
        <p v-if="err" class="text-red-600 text-sm mb-3">{{ err }}</p>
        <button class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded">Einloggen</button>
      </form>

      <div v-else class="text-center space-y-3">
        <h2 class="text-xl font-semibold">👋 Benvenuto {{ user.full_name }}</h2>
        <p>Kunde collegato: <strong>{{ user.linked_customer || '—' }}</strong></p>
        <button @click="doLogout" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const ERP_URL = 'https://gestionale.sudimport.website'
const sid   = ref<string | null>(null)
const user  = ref<any>(null)
const email = ref('')
const password = ref('')
const err   = ref<string | null>(null)

async function doLogin () {
  err.value = null
  const res = await fetch(`${ERP_URL}/api/method/login`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ usr: email.value, pwd: password.value }),
    credentials: 'include'
  })
  const setCookie = res.headers.get('set-cookie') || ''
  sid.value = (setCookie.match(/sid=([^;]+)/) || [])[1] || null
  if (!sid.value) { err.value = 'Cookie sid mancante'; return }
  await fetchUser()
}

async function fetchUser () {
  const r = await fetch(`${ERP_URL}/api/resource/User`, {
    headers: { Cookie: `sid=${sid.value}` },
    credentials: 'include'
  })
  if (r.ok) user.value = (await r.json()).data
}

async function doLogout () {
  await fetch(`${ERP_URL}/api/method/logout`, {
    headers: { Cookie: `sid=${sid.value}` }, credentials:'include'
  })
  sid.value = null; user.value = null
}

onMounted(fetchUser)
</script>
