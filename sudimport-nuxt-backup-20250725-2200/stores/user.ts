import { defineStore } from 'pinia'
import { useErpAuth } from '@/composables/useErpAuth'

export const useUserStore = defineStore('user', {
  state: () => ({
    email: null as string | null,
    session: null as string | null,
    customer: null as any,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = null
      try {
        const { login, getUser } = useErpAuth()
        await login(email, password)
        const user = await getUser()
        this.email = user?.email || null
        this.customer = user?.customer || null
        this.session = user?.session || null
      } catch (e: any) {
        this.error = e.message || 'Login fehlgeschlagen'
      } finally {
        this.loading = false
      }
    },
    async logout() {
      const { logout } = useErpAuth()
      await logout()
      this.email = null
      this.customer = null
      this.session = null
    }
  }
})
