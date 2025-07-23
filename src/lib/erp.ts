type Headers = Record<string, string>;

type Link = {
  link_doctype: string;
  link_name: string;
};

/**
 * Trova il nome del Customer collegato a un indirizzo email (da Contact)
 */
export async function getCustomerFromEmail(email: string, headers: Headers): Promise<string | null> {
  const base = process.env.ERP_URL!;

  // Step 1: cerca il contatto con quella email
  const cRes = await fetch(
    `${base}/api/resource/Contact?filters=${encodeURIComponent(
      JSON.stringify([['Contact', 'email_id', '=', email]])
    )}`,
    { headers }
  ).then(r => r.json());

  const contactName = cRes.data?.[0]?.name;
  if (!contactName) return null;

  // Step 2: prendi il link al Customer
  const det = await fetch(
    `${base}/api/resource/Contact/${encodeURIComponent(contactName)}`,
    { headers }
  ).then(r => r.json());

  const links: Link[] = det.data?.links || [];

  return (
    links.find((l: Link) => l.link_doctype === 'Customer')?.link_name || null
  );
}
