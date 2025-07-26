type ContactLink = {
  link_doctype: string
  link_name: string
}

type Contact = {
  links?: ContactLink[]
}

export async function getCustomerByEmail(email: string): Promise<string | null> {
  const base = process.env.ERP_URL!
  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json',
  }

  try {
    // 1️⃣ Trova Contact Email collegati a questa email
    const emailRes = await fetch(
      `${base}/api/resource/Contact Email?filters=${encodeURIComponent(
        JSON.stringify([['email_id', '=', email]])
      )}`,
      { headers }
    )
    const emailData = await emailRes.json()
    const contactIds: string[] = emailData?.data?.map((e: any) => e.parent) || []

    // 2️⃣ Per ciascun contact, cerca i link verso Customer
    for (const contactId of contactIds) {
      const contactRes = await fetch(
        `${base}/api/resource/Contact/${contactId}?fields=["links"]`,
        { headers }
      )
      const contactData = await contactRes.json()
      const contact: Contact = contactData?.data
      const customerLink = contact.links?.find(
        (l) => l.link_doctype === 'Customer'
      )
      if (customerLink) return customerLink.link_name
    }

    return null
  } catch (err) {
    console.error('❌ getCustomerByEmail failed:', err)
    return null
  }
}
