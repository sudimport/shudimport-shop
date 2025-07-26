<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white p-6 rounded shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold mb-4 text-center">🔐 Login</h1>
      <form @submit.prevent="handleLogin">
        <label class="block mb-1">E-Mail</label>
        <input
          v-model="email"
          type="email"
          required
          class="w-full mb-4 px-3 py-2 border rounded"
          placeholder="you@example.com"
        />
        <label class="block mb-1">Passwort</label>
        <input
          v-model="password"
          type="password"
          required
          class="w-full mb-4 px-3 py-2 border rounded"
          placeholder="••••••••"
        />

        <div v-if="errorMessage" class="text-red-600 mb-4 text-sm">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Einloggen
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useErpAuth } from '@/composables/useErpAuth'

const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const { login } = useErpAuth()

async function handleLogin() {
  errorMessage.value = null
  try {
    await login(email.value, password.value)
    // dopo il login, ricarica la pagina per mostrare eventuale dashboard
    window.location.href = '/'
  } catch (e: any) {
    errorMessage.value = e.message || 'Login fehlgeschlagen'
  }
}
</script>
