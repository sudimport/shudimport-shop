import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Utility per il logging strutturato
function logDebug(step: string, data: any) {
  console.log(`[ADDRESS_API] ${step}:`, JSON.stringify(data, null, 2));
}

export async function GET(req: Request) {
  const userEmail = req.headers.get('x-user');
  if (!userEmail || !userEmail.includes('@')) {
    return NextResponse.json({ error: 'Email not valid' }, { status: 401 });
  }

  const headers = {
    Authorization: `token ${process.env.ERP_API_KEY}:${process.env.ERP_API_SECRET}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Trova l'utente e il cliente collegato
    logDebug('Fetching user', { userEmail });
    const userRes = await fetch(
      `${process.env.ERP_URL}/api/resource/User/${encodeURIComponent(userEmail)}?fields=["linked_customer"]`,
      { headers }
    );
    if (!userRes.ok) throw new Error('User fetch failed');
    const userData = await userRes.json();
    const linkedCustomer = userData.data?.linked_customer;
    
    logDebug('User data retrieved', { linkedCustomer });
    if (!linkedCustomer) {
      return NextResponse.json({ 
        billing: null, 
        shipping: null,
        debug: { error: 'No linked customer found' }
      });
    }

    // 2. Recupera gli indirizzi del cliente (STRATEGIA UNIFICATA)
    const fields = [
      "name", "address_title", "address_line1", "address_line2", 
      "city", "state", "country", "pincode", "phone", "email_id",
      "is_primary_address", "is_shipping_address", "address_type",
      "links"  // Includi i links per il debug
    ];

    let addressList: any[] = [];
    
    // STRATEGIA 1: Cerca con Dynamic Links (il modo corretto)
    logDebug('Searching with dynamic links', { linkedCustomer });
    const dynamicLinkRes = await fetch(
      `${process.env.ERP_URL}/api/resource/Address?filters=${encodeURIComponent(
        JSON.stringify([["link_doctype", "=", "Customer"], ["link_name", "=", linkedCustomer]])
      )}&fields=${encodeURIComponent(JSON.stringify(fields))}&limit_page_length=100`,
      { headers }
    );

    if (dynamicLinkRes.ok) {
      const data = await dynamicLinkRes.json();
      addressList = data.data || [];
      logDebug('Dynamic links result', { count: addressList.length, addresses: addressList });
    }

    // STRATEGIA 2: Fallback su customer_primary_address e customer_secondary_address
    if (!addressList.length) {
      logDebug('No addresses found with dynamic links, trying customer primary and secondary address');
      const customerRes = await fetch(
        `${process.env.ERP_URL}/api/resource/Customer/${encodeURIComponent(linkedCustomer)}?fields=["customer_primary_address", "customer_secondary_address"]`,
        { headers }
      );
      
      if (customerRes.ok) {
        const cust = await customerRes.json();
        const primaryAddressName = cust.data?.customer_primary_address;
        const secondaryAddressName = cust.data?.customer_secondary_address;
        
        logDebug('Customer primary and secondary address', { primaryAddressName, secondaryAddressName });
        
        if (primaryAddressName) {
          const addrRes = await fetch(
            `${process.env.ERP_URL}/api/resource/Address/${encodeURIComponent(primaryAddressName)}?fields=${encodeURIComponent(JSON.stringify(fields))}`,
            { headers }
          );
          if (addrRes.ok) {
            const addr = await addrRes.json();
            addressList.push(addr.data);
            logDebug('Primary address fallback result', { address: addr.data });
          }
        }

        if (secondaryAddressName) {
          const addrRes = await fetch(
            `${process.env.ERP_URL}/api/resource/Address/${encodeURIComponent(secondaryAddressName)}?fields=${encodeURIComponent(JSON.stringify(fields))}`,
            { headers }
          );
          if (addrRes.ok) {
            const addr = await addrRes.json();
            addressList.push(addr.data);
            logDebug('Secondary address fallback result', { address: addr.data });
          }
        }
      }
    }

    // 3. LOGICA MIGLIORATA per billing/shipping e secondary
    let billing = null;
    let shipping = null;
    let secondary = null;

    if (addressList.length > 0) {
      // Cerca prima gli indirizzi con flag specifici
      const billingAddr = addressList.find(a => a.is_primary_address === 1);
      const shippingAddr = addressList.find(a => a.is_shipping_address === 1);
      const secondaryAddr = addressList.find(a => a.is_secondary_address === 1);
      
      logDebug('Address flags check', { 
        billingAddr: billingAddr?.name, 
        shippingAddr: shippingAddr?.name,
        secondaryAddr: secondaryAddr?.name
      });

      // Assegna billing
      billing = billingAddr || addressList[0];

      // Assegna shipping
      shipping = shippingAddr || addressList.find(a => a.is_shipping_address !== 1);

      // Assegna secondary address
      secondary = secondaryAddr || addressList.find(a => a.is_secondary_address !== 1);
    }

    const result = { 
      billing, 
      shipping,
      secondary,
      debug: {
        linkedCustomer,
        totalAddresses: addressList.length,
        addressNames: addressList.map(a => a.name)
      }
    };

    logDebug('Final result', result);
    return NextResponse.json(result);

  } catch (error) {
    logDebug('Error occurred during API call', { 
      error: error instanceof Error ? error.message : error, 
      stack: error instanceof Error ? error.stack : 'No stack available' 
    });
    return NextResponse.json({
      error: 'Error fetching addresses',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
