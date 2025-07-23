import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/UserSidebar'

export const dynamic = 'force-dynamic'

async function getCustomerInfo() {
  const cookie = cookies().get('session')
  if (!cookie) return null

  const res = await fetch(`${process.env.ERP_URL}/api/method/frappe.auth.get_logged_user`, {
    headers: {
      Cookie: `session=${cookie.value}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) return null
  const { message: email } = await res.json()

  const customerRes = await fetch(
    `${process.env.ERP_URL}/api/resource/Customer?filters=[["email_id","=","${email}"]]`,
    {
      headers: {
        Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
      },
      cache: 'no-store',
    }
  )

  const { data } = await customerRes.json()
  return data[0]
}

export default async function UserPage() {
  const customer = await getCustomerInfo()

  if (!customer) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">👤 Mein Profil</h1>
        <p><strong>Firma:</strong> {customer.customer_name}</p>
        <p><strong>Email:</strong> {customer.email_id}</p>
        <p><strong>Telefon:</strong> {customer.phone || '—'}</p>
        <p><strong>Kundennummer:</strong> {customer.name}</p>
      </div>
    </div>
  )
}
